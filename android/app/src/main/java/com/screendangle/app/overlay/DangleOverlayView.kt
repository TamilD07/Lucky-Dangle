package com.screendangle.app.overlay

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.view.MotionEvent
import android.view.View
import com.screendangle.app.R
import com.screendangle.app.data.model.Charm
import com.screendangle.app.data.model.CharmCatalog
import com.screendangle.app.data.model.CharmType
import com.screendangle.app.data.model.DangleSettingsModel
import com.screendangle.app.physics.PendulumPhysicsEngine

/**
 * Hardware-accelerated custom View rendering the hanging string, connector ring,
 * and authentic charm bob with real-time 60-120fps differential physics.
 * Supports image bitmaps, composite garland rendering, and decorative cord beads.
 */
@SuppressLint("ViewConstructor")
class DangleOverlayView(context: Context) : View(context) {

    private val physicsEngine = PendulumPhysicsEngine(135f * resources.displayMetrics.density)
    private var anchorPercent = 0.72f
    private var topOffsetPx = 0f
    private var charmSizePx = 56f * resources.displayMetrics.density
    private var currentCharm: Charm = CharmCatalog.BUILT_IN_CHARMS[0]
    private var lastFrameNanos: Long = 0L

    private var isDraggingCharm = false
    private var isDraggingAnchor = false

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
    }

    private val ropeShadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.argb(80, 0, 0, 0)
        strokeWidth = 4.2f * resources.displayMetrics.density
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
    }

    private val ropeSheenPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.argb(120, 255, 255, 255)
        strokeWidth = 1.2f * resources.displayMetrics.density
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
    }

    private val braidStitchPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.argb(110, 255, 255, 255)
        strokeWidth = 1.0f * resources.displayMetrics.density
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
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
        val density = resources.displayMetrics.density
        anchorPercent = settings.horizontalPercent
        charmSizePx = settings.charmSize * density
        physicsEngine.setRopeLength(settings.ropeLength * density)
        currentCharm = CharmCatalog.getCharmById(settings.selectedCharmId)

        try {
            ropePaint.color = Color.parseColor(currentCharm.cordColorHex)
        } catch (_: Exception) {
            ropePaint.color = Color.parseColor("#61451F")
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

        // Step physics simulation
        physicsEngine.step(dt)

        val density = resources.displayMetrics.density
        val anchorX = width * anchorPercent
        val anchorY = topOffsetPx
        val mountEyeletY = anchorY + 5.5f * density

        val bobRelX = physicsEngine.getBobPositionX()
        val bobRelY = physicsEngine.getBobPositionY()

        val charmCenterX = anchorX + bobRelX
        val charmCenterY = anchorY + bobRelY

        // Charm connection point at top of the bail/jump ring
        val rad = physicsEngine.angle.toDouble()
        val bailOffset = 8f * density
        val targetX = charmCenterX - (Math.sin(rad) * bailOffset).toFloat()
        val targetY = charmCenterY - (Math.cos(rad) * bailOffset).toFloat()

        // Organic catenary sag curve control point
        val dx = targetX - anchorX
        val dy = targetY - mountEyeletY
        val chord = Math.hypot(dx.toDouble(), dy.toDouble()).toFloat()
        val slack = (physicsEngine.ropeLength - chord).coerceAtLeast(0f)
        val sag = (slack * 0.35f + 1.5f * density).coerceAtMost(7f * density)
        val curveControlX = (anchorX + targetX) / 2f
        val curveControlY = (mountEyeletY + targetY) / 2f + sag

        // 1. Draw hanging rope/cord using smooth Bezier curve
        ropePath.reset()
        ropePath.moveTo(anchorX, mountEyeletY)
        ropePath.quadTo(curveControlX, curveControlY, targetX, targetY)

        // Drop shadow pass
        canvas.drawPath(ropePath, ropeShadowPaint)

        // Main cord strand pass
        canvas.drawPath(ropePath, ropePaint)

        // Central silk sheen pass
        canvas.drawPath(ropePath, ropeSheenPaint)

        // Subtle Kumihimo braided chevron micro-stitches
        val numStitches = (chord / (4f * density)).toInt().coerceIn(6, 45)
        for (i in 1 until numStitches) {
            val t = i.toFloat() / numStitches
            val oneMinusT = 1f - t
            val px = oneMinusT * oneMinusT * anchorX + 2 * oneMinusT * t * curveControlX + t * t * targetX
            val py = oneMinusT * oneMinusT * mountEyeletY + 2 * oneMinusT * t * curveControlY + t * t * targetY

            val tx = 2 * oneMinusT * (curveControlX - anchorX) + 2 * t * (targetX - curveControlX)
            val ty = 2 * oneMinusT * (curveControlY - mountEyeletY) + 2 * t * (targetY - curveControlY)
            val len = Math.hypot(tx.toDouble(), ty.toDouble()).toFloat().coerceAtLeast(0.001f)
            val nx = -ty / len
            val ny = tx / len

            val side = if (i % 2 == 0) 1f else -1f
            val stitchW = 1.4f * density
            val sx1 = px - nx * stitchW - (tx / len) * (side * 0.8f * density)
            val sy1 = py - ny * stitchW - (ty / len) * (side * 0.8f * density)
            val sx2 = px + nx * stitchW + (tx / len) * (side * 0.8f * density)
            val sy2 = py + ny * stitchW + (ty / len) * (side * 0.8f * density)

            canvas.drawLine(sx1, sy1, sx2, sy2, braidStitchPaint)
        }

        // Bottom jewelry ferrule knot / crimp collar at jump ring connection
        canvas.drawCircle(targetX, targetY - 1.5f * density, 2.2f * density, goldJewelryPaint)
        canvas.drawCircle(targetX, targetY - 1.5f * density, 2.2f * density, goldStrokePaint)

        // 2. Draw beads along cord
        drawBeads(canvas, anchorX, mountEyeletY, targetX, targetY, curveControlX, curveControlY)

        // 3. Draw top bezel mount clamp & jewelry eyelet
        // Bezel notch clamp body
        canvas.drawRoundRect(
            anchorX - 11f * density, anchorY, anchorX + 11f * density, anchorY + 5.5f * density,
            2.5f * density, 2.5f * density, mountPaint
        )
        // Jewelry mounting eyelet loop
        canvas.drawCircle(anchorX, mountEyeletY, 2.6f * density, goldJewelryPaint)
        canvas.drawCircle(anchorX, mountEyeletY, 2.6f * density, goldStrokePaint)
        canvas.drawCircle(anchorX, mountEyeletY, 1.2f * density, mountPaint)

        // Top silk cinch knot
        canvas.drawCircle(anchorX, mountEyeletY + 2f * density, 1.8f * density, goldJewelryPaint)

        // 4. Draw Charm Bob with rotation
        canvas.save()
        canvas.translate(charmCenterX, charmCenterY)
        val deg = Math.toDegrees(physicsEngine.angle.toDouble()).toFloat()
        canvas.rotate(deg)

        renderCurrentCharm(canvas)

        canvas.restore()

        // Keep animating if not sleeping
        if (!physicsEngine.isSleeping) {
            postInvalidateOnAnimation()
        }
    }

    private fun drawBeads(
        canvas: Canvas,
        x1: Float,
        y1: Float,
        x2: Float,
        y2: Float,
        cx: Float,
        cy: Float
    ) {
        val beads = currentCharm.beads
        if (beads.isEmpty()) return

        val totalDist = Math.hypot((x2 - x1).toDouble(), (y2 - y1).toDouble()).toFloat()
        if (totalDist <= 1f) return

        val density = resources.displayMetrics.density

        for (bead in beads) {
            val offsetPx = bead.offsetDp * density
            val t = (offsetPx / totalDist).coerceIn(0.15f, 0.85f)
            val oneMinusT = 1f - t

            // Quadratic Bezier evaluation
            val bx = oneMinusT * oneMinusT * x1 + 2 * oneMinusT * t * cx + t * t * x2
            val by = oneMinusT * oneMinusT * y1 + 2 * oneMinusT * t * cy + t * t * y2

            // Tangent & Normal
            val tx = 2 * oneMinusT * (cx - x1) + 2 * t * (x2 - cx)
            val ty = 2 * oneMinusT * (cy - y1) + 2 * t * (y2 - cy)
            val len = Math.hypot(tx.toDouble(), ty.toDouble()).toFloat().coerceAtLeast(0.001f)
            val nx = -ty / len
            val ny = tx / len

            val radiusPx = bead.radiusDp * density

            if (bead.drawableResId != null) {
                val beadBmp = getOrDecodeBitmap(bead.drawableResId, (radiusPx * 2).toInt())
                if (beadBmp != null) {
                    canvas.drawBitmap(beadBmp, bx - radiusPx, by - radiusPx, charmPaint)
                    continue
                }
            }

            // Draw miniature jewelry spacer rings before and after bead
            val spacerW = 1.8f * density
            val sp1X = bx - (tx / len) * (radiusPx + 1f * density)
            val sp1Y = by - (ty / len) * (radiusPx + 1f * density)
            val sp2X = bx + (tx / len) * (radiusPx + 1f * density)
            val sp2Y = by + (ty / len) * (radiusPx + 1f * density)
            canvas.drawLine(sp1X - nx * spacerW, sp1Y - ny * spacerW, sp1X + nx * spacerW, sp1Y + ny * spacerW, goldStrokePaint)
            canvas.drawLine(sp2X - nx * spacerW, sp2Y - ny * spacerW, sp2X + nx * spacerW, sp2Y + ny * spacerW, goldStrokePaint)

            try {
                beadPaint.color = Color.parseColor(bead.colorHex)
            } catch (_: Exception) {
                beadPaint.color = Color.parseColor("#FBBF24")
            }
            canvas.drawCircle(bx, by, radiusPx, beadPaint)

            // Specular bead highlight dot
            canvas.drawCircle(bx - radiusPx * 0.3f, by - radiusPx * 0.3f, radiusPx * 0.3f, beadHighlightPaint)
        }
    }

    private fun renderCurrentCharm(canvas: Canvas) {
        val size = charmSizePx.toInt()

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

                // If Daruma, render inked eyes
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

        // Fallback Vector / Geometric evil eye
        val radius = charmSizePx / 2f
        charmPaint.color = Color.parseColor("#1D4ED8")
        canvas.drawCircle(0f, radius, radius, charmPaint)
        charmPaint.color = Color.parseColor("#38BDF8")
        canvas.drawCircle(0f, radius, radius * 0.72f, charmPaint)
        charmPaint.color = Color.WHITE
        canvas.drawCircle(0f, radius, radius * 0.48f, charmPaint)
        charmPaint.color = Color.parseColor("#0F172A")
        canvas.drawCircle(0f, radius, radius * 0.25f, charmPaint)
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
        val anchorX = width * anchorPercent
        val anchorY = topOffsetPx
        val touchRelX = event.x - anchorX
        val touchRelY = event.y - anchorY

        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                // 1. Check if dragging anchor along top bezel
                if (event.y < 32f * resources.displayMetrics.density && Math.abs(event.x - anchorX) < 40f * resources.displayMetrics.density) {
                    isDraggingAnchor = true
                    return true
                }

                // 2. Check if touching charm bob
                val bobX = anchorX + physicsEngine.getBobPositionX()
                val bobY = anchorY + physicsEngine.getBobPositionY()
                val dist = Math.hypot((event.x - bobX).toDouble(), (event.y - bobY).toDouble())
                if (dist < charmSizePx * 1.5) {
                    isDraggingCharm = true
                    physicsEngine.startDrag(touchRelX, touchRelY)
                    lastFrameNanos = System.nanoTime()
                    invalidate()
                    return true
                }
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
                    physicsEngine.updateDrag(touchRelX, touchRelY, 0.016f)
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
        return super.onTouchEvent(event)
    }
}
