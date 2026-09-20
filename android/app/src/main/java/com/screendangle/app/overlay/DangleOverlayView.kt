package com.screendangle.app.overlay

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.view.MotionEvent
import android.view.View
import com.screendangle.app.R
import com.screendangle.app.data.model.*
import com.screendangle.app.physics.PendulumPhysicsEngine
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.sin

/**
 * Hardware-accelerated custom View rendering the hanging string, connector ring,
 * and authentic charm bob with real-time multi-segment Verlet physics.
 * Supports:
 * - Multi-node Verlet rope chain with wave propagation
 * - Universal emoji charms with 8 material finishes & 6 container geometries
 * - Custom sigils & image charms
 * - Tail dynamics for bottom beads, tassels, bells, and crystals
 * - Reliable touch passthrough outside the charm radius
 */
@SuppressLint("ViewConstructor")
class DangleOverlayView(context: Context) : View(context) {

    private val physicsEngine = PendulumPhysicsEngine(135f * resources.displayMetrics.density)
    private var anchorPercent = 0.72f
    private var topOffsetPx = 0f
    private var charmSizePx = 56f * resources.displayMetrics.density
    private var currentCharm: Charm = CharmCatalog.BUILT_IN_CHARMS[0]
    private var currentSettings: DangleSettingsModel? = null
    private var lastFrameNanos: Long = 0L

    private var isLocalizedWindow: Boolean = false
    private var isDraggingCharm = false
    private var isDraggingAnchor = false

    fun setIsLocalizedWindow(localized: Boolean) {
        isLocalizedWindow = localized
        invalidate()
    }

    // Ritual States
    var darumaLeftEyeInked = false
    var darumaRightEyeInked = false
    var garlandAgeDays = 0

    // Bitmap cache to prevent garbage collection churn during onDraw
    private val bitmapCache = mutableMapOf<Int, Bitmap>()

    private val ropePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#61451F")
        strokeWidth = 2.8f * resources.displayMetrics.density
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val ropeShadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.argb(70, 0, 0, 0)
        strokeWidth = 4.5f * resources.displayMetrics.density
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val ropeSheenPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.argb(120, 255, 255, 255)
        strokeWidth = 1.2f * resources.displayMetrics.density
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val mountPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#27272A")
        style = Paint.Style.FILL
    }

    private val goldJewelryPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#EAB308")
        style = Paint.Style.FILL
    }

    private val goldStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#CA8A04")
        strokeWidth = 1.2f * resources.displayMetrics.density
        style = Paint.Style.STROKE
    }

    private val charmPaint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
    private val beadPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val beadHighlightPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.argb(160, 255, 255, 255)
        style = Paint.Style.FILL
    }

    private val ropePath = Path()

    fun applySettings(settings: DangleSettingsModel) {
        currentSettings = settings
        val density = resources.displayMetrics.density
        anchorPercent = settings.horizontalPercent
        charmSizePx = settings.charmSize * density

        physicsEngine.setRopeLength(settings.ropeLength * density)
        physicsEngine.gravity = settings.gravity
        physicsEngine.damping = if (settings.reduceMotion) 0.92f else settings.damping
        physicsEngine.stiffness = settings.stiffness
        physicsEngine.cordFlexibility = settings.cordFlexibility
        physicsEngine.waveStrength = settings.waveStrength
        physicsEngine.reduceMotion = settings.reduceMotion
        physicsEngine.charmWeightMultiplier = when (settings.charmWeight) {
            "very_light" -> 0.4f
            "light" -> 0.7f
            "heavy" -> 1.8f
            "very_heavy" -> 2.6f
            else -> 1.0f
        }

        currentCharm = CharmCatalog.getCharmById(settings.selectedCharmId, settings.customCharmsJson)

        // String material colors & thickness
        try {
            val material = StringMaterialsCatalog.getMaterialById(settings.stringMaterialId)
            ropePaint.color = Color.parseColor(material.colorHex)
            ropePaint.strokeWidth = settings.stringThickness * density
            ropeSheenPaint.color = Color.parseColor(material.sheenHex)
            ropeShadowPaint.color = Color.parseColor(material.shadowHex)
        } catch (_: Exception) {
            try {
                ropePaint.color = Color.parseColor(currentCharm.cordColorHex)
            } catch (_: Exception) {
                ropePaint.color = Color.parseColor("#61451F")
            }
        }

        invalidate()
    }

    fun setExternalTilt(ax: Float, ay: Float) {
        physicsEngine.setExternalAcceleration(ax, ay)
        if (!physicsEngine.isSleeping) {
            postInvalidateOnAnimation()
        }
    }

    private fun getOrDecodeBitmap(resId: Int, targetSizePx: Int): Bitmap? {
        val cached = bitmapCache[resId]
        if (cached != null && !cached.isRecycled) {
            return cached
        }
        return try {
            val raw = BitmapFactory.decodeResource(resources, resId) ?: return null
            val scaled = Bitmap.createScaledBitmap(raw, targetSizePx, targetSizePx, true)
            bitmapCache[resId] = scaled
            scaled
        } catch (_: Exception) {
            null
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val currentNanos = System.nanoTime()
        val dt = if (lastFrameNanos == 0L) 0.016f else ((currentNanos - lastFrameNanos) / 1_000_000_000f)
        lastFrameNanos = currentNanos

        val density = resources.displayMetrics.density
        val anchorX = if (isLocalizedWindow) width / 2f else width * anchorPercent
        val anchorY = topOffsetPx
        val mountEyeletY = anchorY + 5.5f * density

        physicsEngine.setAnchor(anchorX, mountEyeletY)
        physicsEngine.update(dt)

        val nodes = physicsEngine.nodes
        if (nodes.isEmpty()) return

        val charmNode = nodes.last()
        val charmCenterX = charmNode.x
        val charmCenterY = charmNode.y
        val charmAngleDeg = physicsEngine.charmAngleDeg

        // 1. Build smooth Multi-Node Spline Path for Cord
        ropePath.reset()
        ropePath.moveTo(nodes[0].x, nodes[0].y)

        if (nodes.size > 2) {
            for (i in 0 until nodes.size - 1) {
                val p0 = if (i > 0) nodes[i - 1] else nodes[i]
                val p1 = nodes[i]
                val p2 = nodes[i + 1]
                val p3 = if (i + 2 < nodes.size) nodes[i + 2] else p2

                val cp1x = p1.x + (p2.x - p0.x) / 6f
                val cp1y = p1.y + (p2.y - p0.y) / 6f
                val cp2x = p2.x - (p3.x - p1.x) / 6f
                val cp2y = p2.y - (p3.y - p1.y) / 6f

                ropePath.cubicTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
            }
        } else {
            ropePath.lineTo(charmNode.x, charmNode.y)
        }

        // Drop shadow pass
        canvas.drawPath(ropePath, ropeShadowPaint)
        // Main cord pass
        canvas.drawPath(ropePath, ropePaint)
        // Silk sheen pass
        canvas.drawPath(ropePath, ropeSheenPaint)

        // 2. Beads along the cord
        drawBeadsAlongNodes(canvas, density)

        // 3. Top bezel clamp & mounting eyelet
        canvas.drawRoundRect(
            anchorX - 11f * density, anchorY, anchorX + 11f * density, anchorY + 5.5f * density,
            2.5f * density, 2.5f * density, mountPaint
        )
        canvas.drawCircle(anchorX, mountEyeletY, 3.8f * density, goldJewelryPaint)
        canvas.drawCircle(anchorX, mountEyeletY, 3.8f * density, goldStrokePaint)
        canvas.drawCircle(anchorX, mountEyeletY, 1.8f * density, mountPaint)

        // 4. Render Charm at Last Node
        canvas.save()
        canvas.translate(charmCenterX, charmCenterY)
        canvas.rotate(charmAngleDeg)

        // Bail / Connector Ring at top of charm
        canvas.drawCircle(0f, -4f * density, 3.6f * density, goldJewelryPaint)
        canvas.drawCircle(0f, -4f * density, 3.6f * density, goldStrokePaint)
        canvas.drawCircle(0f, -4f * density, 1.6f * density, mountPaint)

        renderCurrentCharm(canvas)
        canvas.restore()

        // 5. Render Bottom Component Chain & Final Dangle (tassel / bell)
        renderBottomComponentChain(canvas, density, charmCenterX, charmCenterY, charmAngleDeg)

        if (!physicsEngine.isSleeping || physicsEngine.isDragging) {
            postInvalidateOnAnimation()
        }
    }

    private fun drawBeadsAlongNodes(canvas: Canvas, density: Float) {
        val beads = currentCharm.beads
        if (beads.isEmpty()) return

        val nodes = physicsEngine.nodes
        if (nodes.size < 2) return

        val totalRopeLen = physicsEngine.ropeLength
        for (bead in beads) {
            val fraction = (bead.offsetDp * density / totalRopeLen).coerceIn(0.1f, 0.9f)
            val nodeIndexFloat = fraction * (nodes.size - 1)
            val idx = nodeIndexFloat.toInt().coerceIn(0, nodes.size - 2)
            val subT = nodeIndexFloat - idx

            val n1 = nodes[idx]
            val n2 = nodes[idx + 1]
            val bx = n1.x + (n2.x - n1.x) * subT
            val by = n1.y + (n2.y - n1.y) * subT

            val radiusPx = bead.radiusDp * density

            try {
                beadPaint.color = Color.parseColor(bead.colorHex)
            } catch (_: Exception) {
                beadPaint.color = Color.parseColor("#FBBF24")
            }
            canvas.drawCircle(bx, by, radiusPx, beadPaint)
            canvas.drawCircle(bx - radiusPx * 0.3f, by - radiusPx * 0.3f, radiusPx * 0.35f, beadHighlightPaint)
        }
    }

    private fun renderCurrentCharm(canvas: Canvas) {
        val size = charmSizePx.toInt()
        val radius = size / 2f
        val density = resources.displayMetrics.density

        // Composite Nimbu-Mirchi Garland
        if (currentCharm.id == "nimbu-mirchi") {
            renderNimbuMirchiGarland(canvas, size)
            return
        }

        // Bitmap-based Charm
        val resId = currentCharm.drawableResId
        if (resId != null) {
            val bmp = getOrDecodeBitmap(resId, size)
            if (bmp != null) {
                val left = -size / 2f
                val top = 0f
                canvas.drawBitmap(bmp, left, top, charmPaint)

                // Daruma eye ink ritual
                if (currentCharm.id == "daruma") {
                    val eyeRadius = size * 0.08f
                    val eyePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                        color = Color.parseColor("#171717")
                    }
                    if (darumaLeftEyeInked) {
                        canvas.drawCircle(-size * 0.16f, size * 0.38f, eyeRadius, eyePaint)
                    }
                    if (darumaRightEyeInked) {
                        canvas.drawCircle(size * 0.16f, size * 0.38f, eyeRadius, eyePaint)
                    }
                }
                return
            }
        }

        // Emoji Charm with Universal Material Finishes
        if (currentCharm.type == CharmType.EMOJI && !currentCharm.emoji.isNullOrBlank()) {
            val emoji = currentCharm.emoji ?: "🧿"
            val mat = currentCharm.emojiMaterial
            val shape = currentCharm.containerShape

            // Container Background & Border
            val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG)
            val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                style = Paint.Style.STROKE
                strokeWidth = 2.4f * density
            }

            when (mat) {
                EmojiMaterialStyle.GOLD -> {
                    bgPaint.shader = RadialGradient(
                        0f, radius * 0.7f, radius,
                        intArrayOf(Color.parseColor("#FEF08A"), Color.parseColor("#D4AF37"), Color.parseColor("#78350F")),
                        floatArrayOf(0f, 0.6f, 1f),
                        Shader.TileMode.CLAMP
                    )
                    strokePaint.color = Color.parseColor("#FDE047")
                }
                EmojiMaterialStyle.SILVER -> {
                    bgPaint.shader = RadialGradient(
                        0f, radius * 0.7f, radius,
                        intArrayOf(Color.parseColor("#FFFFFF"), Color.parseColor("#CBD5E1"), Color.parseColor("#475569")),
                        floatArrayOf(0f, 0.5f, 1f),
                        Shader.TileMode.CLAMP
                    )
                    strokePaint.color = Color.parseColor("#E2E8F0")
                }
                EmojiMaterialStyle.NEON -> {
                    bgPaint.color = Color.parseColor("#090D16")
                    strokePaint.color = Color.parseColor("#06B6D4")
                    strokePaint.strokeWidth = 3f * density
                }
                EmojiMaterialStyle.GEMSTONE -> {
                    bgPaint.shader = LinearGradient(
                        -radius, -radius, radius, radius,
                        intArrayOf(Color.parseColor("#3B82F6"), Color.parseColor("#8B5CF6"), Color.parseColor("#1E1B4B")),
                        null, Shader.TileMode.CLAMP
                    )
                    strokePaint.color = Color.parseColor("#A78BFA")
                }
                EmojiMaterialStyle.SEAL -> {
                    bgPaint.color = Color.parseColor("#991B1B")
                    strokePaint.color = Color.parseColor("#FBBF24")
                }
                else -> {
                    bgPaint.color = Color.parseColor("#181C22")
                    strokePaint.color = Color.parseColor("#D4AF37")
                }
            }

            // Draw Container Shape
            val shapePath = Path()
            when (shape) {
                CharmContainerShape.ROUNDED_RECT -> {
                    shapePath.addRoundRect(
                        RectF(-radius, 0f, radius, size.toFloat()),
                        8f * density, 8f * density, Path.Direction.CW
                    )
                }
                CharmContainerShape.DIAMOND -> {
                    shapePath.moveTo(0f, 0f)
                    shapePath.lineTo(radius, radius)
                    shapePath.lineTo(0f, size.toFloat())
                    shapePath.lineTo(-radius, radius)
                    shapePath.close()
                }
                CharmContainerShape.OCTAGON -> {
                    val cut = radius * 0.35f
                    shapePath.moveTo(-radius + cut, 0f)
                    shapePath.lineTo(radius - cut, 0f)
                    shapePath.lineTo(radius, cut)
                    shapePath.lineTo(radius, size - cut)
                    shapePath.lineTo(radius - cut, size.toFloat())
                    shapePath.lineTo(-radius + cut, size.toFloat())
                    shapePath.lineTo(-radius, size - cut)
                    shapePath.lineTo(-radius, cut)
                    shapePath.close()
                }
                else -> {
                    shapePath.addCircle(0f, radius, radius, Path.Direction.CW)
                }
            }

            canvas.drawPath(shapePath, bgPaint)
            canvas.drawPath(shapePath, strokePaint)

            // Center Emoji Text
            val emojiPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                textSize = size * 0.58f
                textAlign = Paint.Align.CENTER
            }
            val textY = radius - ((emojiPaint.descent() + emojiPaint.ascent()) / 2f)
            canvas.drawText(emoji, 0f, textY, emojiPaint)
            return
        }

        // Custom Text / Sigil Charm Medallion
        if (currentCharm.type == CharmType.TEXT && !currentCharm.text.isNullOrBlank()) {
            val pendantPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = try { Color.parseColor(currentCharm.accentColorHex) } catch (_: Exception) { Color.parseColor("#4F46E5") }
                style = Paint.Style.FILL
            }
            val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = try { Color.parseColor(currentCharm.secondaryColorHex) } catch (_: Exception) { Color.parseColor("#FBBF24") }
                strokeWidth = 2.4f * density
                style = Paint.Style.STROKE
            }
            val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = Color.WHITE
                textSize = (size * 0.28f).coerceAtLeast(12f * density)
                typeface = Typeface.DEFAULT_BOLD
                textAlign = Paint.Align.CENTER
            }
            canvas.drawCircle(0f, radius, radius, pendantPaint)
            canvas.drawCircle(0f, radius, radius - 1.5f * density, borderPaint)
            val textY = radius - ((textPaint.descent() + textPaint.ascent()) / 2f)
            canvas.drawText(currentCharm.text ?: "", 0f, textY, textPaint)
            return
        }

        // Geometric Evil Eye Medallion Fallback
        charmPaint.color = Color.parseColor("#1D4ED8")
        canvas.drawCircle(0f, radius, radius, charmPaint)
        charmPaint.color = Color.parseColor("#38BDF8")
        canvas.drawCircle(0f, radius, radius * 0.72f, charmPaint)
        charmPaint.color = Color.WHITE
        canvas.drawCircle(0f, radius, radius * 0.48f, charmPaint)
        charmPaint.color = Color.parseColor("#0F172A")
        canvas.drawCircle(0f, radius, radius * 0.25f, charmPaint)
    }

    private fun renderBottomComponentChain(
        canvas: Canvas,
        density: Float,
        charmCenterX: Float,
        charmCenterY: Float,
        charmAngleDeg: Float
    ) {
        val chain = currentCharm.componentChain ?: return
        val finalDangle = chain.finalDangle ?: return
        if (finalDangle.type == "none") return

        val tailNodes = physicsEngine.tailNodes
        if (tailNodes.isEmpty()) return

        val t0 = tailNodes[0]
        val tLast = tailNodes.last()

        // Connector Ring at bottom of charm
        canvas.drawCircle(charmCenterX, charmCenterY + charmSizePx * 0.52f, 3.2f * density, goldJewelryPaint)
        canvas.drawCircle(charmCenterX, charmCenterY + charmSizePx * 0.52f, 3.2f * density, goldStrokePaint)

        // Draw sub-chain line from charm base to tail
        val subChainPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = try { Color.parseColor(chain.connector.colorHex) } catch (_: Exception) { Color.parseColor("#D4AF37") }
            strokeWidth = 1.6f * density
            style = Paint.Style.STROKE
        }
        canvas.drawLine(charmCenterX, charmCenterY + charmSizePx * 0.52f, t0.x, t0.y, subChainPaint)

        // Draw afterComponents (intermediate beads along tail)
        for (i in chain.afterComponents.indices) {
            val bead = chain.afterComponents[i]
            val node = if (i < tailNodes.size) tailNodes[i] else tLast
            val r = bead.radiusDp * density

            try {
                beadPaint.color = Color.parseColor(bead.colorHex)
            } catch (_: Exception) {
                beadPaint.color = Color.parseColor("#DC2626")
            }
            canvas.drawCircle(node.x, node.y, r, beadPaint)
            canvas.drawCircle(node.x - r * 0.3f, node.y - r * 0.3f, r * 0.35f, beadHighlightPaint)
        }

        // Draw Final Dangle (Tassel / Bell / Crystal / Coin)
        val dangleColor = try { Color.parseColor(finalDangle.colorHex) } catch (_: Exception) { Color.parseColor("#DC2626") }
        val danglePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = dangleColor
            style = Paint.Style.FILL
        }

        val tx = tLast.x
        val ty = tLast.y

        when (finalDangle.type) {
            "tassel" -> {
                // Tassel Cap Bead
                canvas.drawCircle(tx, ty, 4f * density, goldJewelryPaint)
                // Flowing silk tassel skirt
                val tasselLen = finalDangle.lengthDp * density
                val tasselPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    color = dangleColor
                    strokeWidth = 1.2f * density
                    strokeCap = Paint.Cap.ROUND
                }
                for (strand in -4..4) {
                    val spread = strand * 2.2f * density
                    val waveLag = (tLast.x - tLast.prevX) * 0.15f * (4 - Math.abs(strand))
                    canvas.drawLine(tx, ty + 2f * density, tx + spread + waveLag, ty + tasselLen, tasselPaint)
                }
            }
            "bell" -> {
                val bellSize = 10f * density
                val bellPath = Path()
                bellPath.moveTo(tx - bellSize * 0.6f, ty + bellSize)
                bellPath.quadTo(tx, ty - 2f * density, tx + bellSize * 0.6f, ty + bellSize)
                bellPath.close()
                canvas.drawPath(bellPath, danglePaint)
                // Bell clapper
                canvas.drawCircle(tx, ty + bellSize + 2f * density, 2.5f * density, goldJewelryPaint)
            }
            "crystal" -> {
                val crSize = 8f * density
                val crPath = Path()
                crPath.moveTo(tx, ty)
                crPath.lineTo(tx + crSize * 0.5f, ty + crSize * 0.6f)
                crPath.lineTo(tx, ty + crSize * 1.4f)
                crPath.lineTo(tx - crSize * 0.5f, ty + crSize * 0.6f)
                crPath.close()
                danglePaint.color = Color.argb(210, Color.red(dangleColor), Color.green(dangleColor), Color.blue(dangleColor))
                canvas.drawPath(crPath, danglePaint)
            }
            "coin" -> {
                canvas.drawCircle(tx, ty + 6f * density, 7f * density, goldJewelryPaint)
                canvas.drawCircle(tx, ty + 6f * density, 7f * density, goldStrokePaint)
                canvas.drawRect(tx - 2f * density, ty + 4f * density, tx + 2f * density, ty + 8f * density, mountPaint)
            }
        }
    }

    private fun renderNimbuMirchiGarland(canvas: Canvas, size: Int) {
        val chiliResIds = listOf(
            R.drawable.nimbu_chili_5,
            R.drawable.nimbu_chili_2,
            R.drawable.nimbu_chili_1,
            R.drawable.nimbu_chili_3,
            R.drawable.nimbu_chili_7,
            R.drawable.nimbu_chili_4,
            R.drawable.nimbu_chili_6
        )

        var curY = 0f
        val chiliHeight = (size * 0.25f).toInt()
        val chiliWidth = (size * 0.3f).toInt()

        for (chiliRes in chiliResIds) {
            val chiliBmp = getOrDecodeBitmap(chiliRes, chiliHeight)
            if (chiliBmp != null) {
                canvas.drawBitmap(chiliBmp, -chiliWidth / 2f, curY, charmPaint)
            }
            curY += chiliHeight * 0.65f
        }

        // Lemon at base
        val lemonSize = (size * 0.45f).toInt()
        val lemonBmp = getOrDecodeBitmap(R.drawable.nimbu_lemon, lemonSize)
        if (lemonBmp != null) {
            canvas.drawBitmap(lemonBmp, -lemonSize / 2f, curY, charmPaint)
            curY += lemonSize * 0.7f
        }

        // Coal at tip
        val coalSize = (size * 0.22f).toInt()
        val coalBmp = getOrDecodeBitmap(R.drawable.nimbu_coal, coalSize)
        if (coalBmp != null) {
            canvas.drawBitmap(coalBmp, -coalSize / 2f, curY, charmPaint)
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        val density = resources.displayMetrics.density
        val anchorX = if (isLocalizedWindow) width / 2f else width * anchorPercent
        val anchorY = topOffsetPx

        val charmX = physicsEngine.charmX
        val charmY = physicsEngine.charmY
        val distToCharm = hypot((event.x - charmX).toDouble(), (event.y - charmY).toDouble()).toFloat()

        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                // Check if dragging anchor along top bezel (in full width mode)
                if (!isLocalizedWindow && event.y < 32f * density && Math.abs(event.x - anchorX) < 40f * density) {
                    isDraggingAnchor = true
                    return true
                }

                // Check if touching charm bob or cord
                if (distToCharm < charmSizePx * 1.25f || (event.y in anchorY..charmY && Math.abs(event.x - charmX) < 25f * density)) {
                    isDraggingCharm = true
                    physicsEngine.startDrag(event.x, event.y)
                    lastFrameNanos = System.nanoTime()
                    invalidate()
                    return true
                }

                // CRITICAL: Return false when touching anywhere else!
                // This allows underlying apps (WhatsApp, YouTube, Home Screen) to receive touches without blockage!
                return false
            }

            MotionEvent.ACTION_MOVE -> {
                if (isDraggingAnchor) {
                    val clampedX = event.x.coerceIn(30f, width - 30f)
                    anchorPercent = clampedX / width
                    invalidate()
                    return true
                }

                if (isDraggingCharm && physicsEngine.isDragging) {
                    physicsEngine.updateDrag(event.x, event.y, 0.016f)
                    invalidate()
                    return true
                }
            }

            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (isDraggingAnchor) {
                    isDraggingAnchor = false
                    return true
                }

                if (isDraggingCharm && physicsEngine.isDragging) {
                    isDraggingCharm = false
                    physicsEngine.releaseDrag()
                    lastFrameNanos = System.nanoTime()
                    postInvalidateOnAnimation()
                    return true
                }
            }
        }
        return false
    }
}
