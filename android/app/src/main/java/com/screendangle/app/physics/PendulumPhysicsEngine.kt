package com.screendangle.app.physics

import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.math.atan2

/**
 * Advanced Multi-Segment Verlet Rope & Charm Physics Engine for Android.
 * Implements:
 * 1. Multi-node Verlet integration chain with constraint relaxation.
 * 2. Natural cord flexibility and traveling wave ripple propagation.
 * 3. Secondary tail physics for connected beads, bottom chains, and tassels/bells.
 * 4. Realistic touch drag, flick velocity momentum, air resistance damping, and device accelerometer response.
 */
class PendulumPhysicsEngine(
    private var naturalLengthPx: Float = 135f
) {
    data class RopePoint(
        var x: Float,
        var y: Float,
        var prevX: Float,
        var prevY: Float,
        val pinned: Boolean = false,
        var mass: Float = 1.0f
    )

    private val nodeCount = 7
    private val tailNodeCount = 3
    val nodes = ArrayList<RopePoint>(nodeCount)
    val tailNodes = ArrayList<RopePoint>(tailNodeCount)

    var anchorX: Float = 0f
    var anchorY: Float = 0f

    var gravity: Float = 9.8f
    var damping: Float = 0.982f
    var stiffness: Float = 0.15f
    var cordFlexibility: Float = 0.7f
    var waveStrength: Float = 1.0f
    var charmWeightMultiplier: Float = 1.0f
    var movementResponse: Float = 1.2f
    var reduceMotion: Boolean = false

    var isDragging: Boolean = false
        private set
    var isSleeping: Boolean = false
        private set

    private var externalAx: Float = 0f
    private var externalAy: Float = 0f

    private var dragTargetX: Float = 0f
    private var dragTargetY: Float = naturalLengthPx
    private var prevDragX: Float = 0f
    private var prevDragY: Float = naturalLengthPx
    private var dragVelocityX: Float = 0f
    private var dragVelocityY: Float = 0f

    private var wavePhase: Float = 0f
    private var waveEnergy: Float = 0f

    init {
        initNodes()
    }

    private fun initNodes() {
        nodes.clear()
        val segLength = naturalLengthPx / (nodeCount - 1).coerceAtLeast(1)
        for (i in 0 until nodeCount) {
            val y = anchorY + i * segLength
            nodes.add(
                RopePoint(
                    x = anchorX,
                    y = y,
                    prevX = anchorX,
                    prevY = y,
                    pinned = (i == 0),
                    mass = if (i == nodeCount - 1) 2.5f * charmWeightMultiplier else 0.4f
                )
            )
        }

        tailNodes.clear()
        val tailSegLength = 18f
        for (i in 0 until tailNodeCount) {
            val y = anchorY + naturalLengthPx + (i + 1) * tailSegLength
            tailNodes.add(
                RopePoint(
                    x = anchorX,
                    y = y,
                    prevX = anchorX,
                    prevY = y,
                    pinned = false,
                    mass = 0.5f
                )
            )
        }
    }

    fun setAnchor(x: Float, y: Float) {
        val dx = x - anchorX
        anchorX = x
        anchorY = y

        if (nodes.isNotEmpty()) {
            nodes[0].x = x
            nodes[0].y = y
            nodes[0].prevX = x
            nodes[0].prevY = y
        }

        if (abs(dx) > 0.5f) {
            waveEnergy = (waveEnergy + abs(dx) * 0.15f).coerceAtMost(3.0f)
            isSleeping = false
        }
    }

    fun setRopeLength(length: Float) {
        naturalLengthPx = length.coerceIn(60f, 350f)
        if (!isDragging && nodes.size == nodeCount) {
            val segLength = naturalLengthPx / (nodeCount - 1)
            for (i in 1 until nodeCount) {
                val targetY = anchorY + i * segLength
                nodes[i].y = targetY
                nodes[i].prevY = targetY
            }
        }
    }

    fun setExternalAcceleration(ax: Float, ay: Float) {
        externalAx = if (ax.isNaN()) 0f else ax.coerceIn(-15f, 15f) * movementResponse
        externalAy = if (ay.isNaN()) 0f else ay.coerceIn(-15f, 15f) * movementResponse
        if (abs(externalAx) > 0.08f) {
            isSleeping = false
            waveEnergy = (waveEnergy + abs(externalAx) * 0.1f).coerceAtMost(2.5f)
        }
    }

    fun startDrag(touchX: Float, touchY: Float) {
        isDragging = true
        isSleeping = false
        dragTargetX = touchX
        dragTargetY = touchY.coerceAtLeast(anchorY + 30f)
        prevDragX = touchX
        prevDragY = touchY
        dragVelocityX = 0f
        dragVelocityY = 0f
        waveEnergy = 0f
    }

    fun updateDrag(touchX: Float, touchY: Float, dt: Float = 0.016f) {
        if (!isDragging) return
        dragTargetX = touchX
        dragTargetY = touchY.coerceAtLeast(anchorY + 30f)

        if (dt > 0.001f) {
            dragVelocityX = (touchX - prevDragX) / dt
            dragVelocityY = (touchY - prevDragY) / dt
            prevDragX = touchX
            prevDragY = touchY
        }
    }

    fun releaseDrag() {
        if (!isDragging) return
        isDragging = false

        if (nodes.isNotEmpty()) {
            val charmNode = nodes.last()
            val impulseFactor = 0.016f
            charmNode.prevX = charmNode.x - (dragVelocityX * impulseFactor).coerceIn(-25f, 25f)
            charmNode.prevY = charmNode.y - (dragVelocityY * impulseFactor).coerceIn(-25f, 25f)
            waveEnergy = (abs(dragVelocityX) * 0.005f).coerceAtMost(3.0f)
        }
        isSleeping = false
    }

    fun applyImpulse(impulseX: Float) {
        if (nodes.isNotEmpty()) {
            val charmNode = nodes.last()
            charmNode.prevX -= impulseX
            waveEnergy = (waveEnergy + abs(impulseX) * 0.2f).coerceAtMost(3.0f)
            isSleeping = false
        }
    }

    fun testSwing(intensity: Float = 1.0f) {
        applyImpulse(25f * intensity)
    }

    /**
     * Physics tick (Verlet integration + multi-node constraints).
     */
    fun update(dt: Float = 0.016f) {
        if (isSleeping && !isDragging) return

        val clampedDt = dt.coerceIn(0.005f, 0.033f)
        val gravityAccel = if (reduceMotion) gravity * 20f else gravity * 45f
        val effectiveDamping = if (reduceMotion) 0.88f else damping.coerceIn(0.90f, 0.995f)

        // Wave propagation
        if (waveEnergy > 0.01f) {
            wavePhase += clampedDt * 10f
            waveEnergy *= 0.96f
        } else {
            waveEnergy = 0f
        }

        // 1. Verlet position integration
        for (i in nodes.indices) {
            val node = nodes[i]
            if (node.pinned) {
                node.x = anchorX
                node.y = anchorY
                continue
            }

            if (isDragging && i == nodes.size - 1) {
                node.prevX = node.x
                node.prevY = node.y
                node.x = dragTargetX
                node.y = dragTargetY
                continue
            }

            val vx = (node.x - node.prevX) * effectiveDamping
            val vy = (node.y - node.prevY) * effectiveDamping

            node.prevX = node.x
            node.prevY = node.y

            // Forces: gravity + sensor acceleration + wave ripple
            val fraction = i.toFloat() / (nodes.size - 1)
            val waveOffset = if (waveStrength > 0.01f && waveEnergy > 0.01f) {
                sin(wavePhase - fraction * 4.0f) * (waveEnergy * 8f * waveStrength * (1f - fraction) * fraction)
            } else 0f

            val ax = -externalAx * 25f + waveOffset
            val ay = gravityAccel - externalAy * 15f

            node.x += vx + ax * clampedDt * clampedDt
            node.y += vy + ay * clampedDt * clampedDt
        }

        // 2. Multi-pass Distance Constraint Satisfaction (Verlet relaxation)
        val targetSegLength = naturalLengthPx / (nodes.size - 1).coerceAtLeast(1)
        val iterations = if (reduceMotion) 3 else 6

        for (pass in 0 until iterations) {
            for (i in 0 until nodes.size - 1) {
                val n1 = nodes[i]
                val n2 = nodes[i + 1]

                val dx = n2.x - n1.x
                val dy = n2.y - n1.y
                val dist = sqrt(dx * dx + dy * dy).coerceAtLeast(0.001f)
                val diff = (dist - targetSegLength) / dist

                // Flexibility controls how much deformation is allowed before snapping
                val flexFactor = (1.0f - cordFlexibility * 0.3f).coerceIn(0.5f, 1.0f)
                val offsetScale = diff * 0.5f * flexFactor

                if (!n1.pinned) {
                    n1.x += dx * offsetScale
                    n1.y += dy * offsetScale
                }
                if (!n2.pinned && !(isDragging && i + 1 == nodes.size - 1)) {
                    n2.x -= dx * offsetScale
                    n2.y -= dy * offsetScale
                }
            }
        }

        // 3. Secondary Tail Nodes Physics (for bottom beads / tassels / bells)
        val charmNode = nodes.last()
        val tailSegLength = 16f
        for (i in tailNodes.indices) {
            val tail = tailNodes[i]
            val prevNode = if (i == 0) charmNode else tailNodes[i - 1]

            val tvx = (tail.x - tail.prevX) * effectiveDamping * 0.96f
            val tvy = (tail.y - tail.prevY) * effectiveDamping * 0.96f

            tail.prevX = tail.x
            tail.prevY = tail.y

            tail.x += tvx
            tail.y += tvy + (gravityAccel * 0.8f) * clampedDt * clampedDt

            // Constraint to previous tail node
            val tdx = tail.x - prevNode.x
            val tdy = tail.y - prevNode.y
            val tdist = sqrt(tdx * tdx + tdy * tdy).coerceAtLeast(0.001f)
            val tdiff = (tdist - tailSegLength) / tdist

            tail.x -= tdx * tdiff * 0.85f
            tail.y -= tdy * tdiff * 0.85f
        }

        // Check for sleep state
        val charmSpeed = sqrt(
            (charmNode.x - charmNode.prevX) * (charmNode.x - charmNode.prevX) +
            (charmNode.y - charmNode.prevY) * (charmNode.y - charmNode.prevY)
        )
        if (!isDragging && charmSpeed < 0.05f && abs(externalAx) < 0.05f && waveEnergy < 0.05f) {
            isSleeping = true
        }
    }

    /**
     * Charm position (lowest node of main rope).
     */
    val charmX: Float
        get() = if (nodes.isNotEmpty()) nodes.last().x else anchorX

    val charmY: Float
        get() = if (nodes.isNotEmpty()) nodes.last().y else anchorY + naturalLengthPx

    /**
     * Derived charm angle from the last rope segment.
     */
    val charmAngleRad: Float
        get() {
            if (nodes.size < 2) return 0f
            val pPrev = nodes[nodes.size - 2]
            val pLast = nodes.last()
            return atan2((pLast.x - pPrev.x).toDouble(), (pLast.y - pPrev.y).toDouble()).toFloat()
        }

    val charmAngleDeg: Float
        get() = Math.toDegrees(charmAngleRad.toDouble()).toFloat()

    val ropeLength: Float
        get() = naturalLengthPx
}
