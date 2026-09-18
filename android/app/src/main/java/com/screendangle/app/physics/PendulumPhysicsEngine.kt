package com.screendangle.app.physics

import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.math.sign

/**
 * Production-ready numerical pendulum & spring-damper physics engine.
 * Solves the nonlinear damped pendulum equation:
 * theta'' = -(g/L)*sin(theta) - (damping * theta') + (ax/L)*cos(theta)*response
 */
class PendulumPhysicsEngine(
    private var naturalLengthPx: Float = 130f
) {
    var angle: Float = 0f
        private set
    var angularVelocity: Float = 0f
        private set
    var angularAccel: Float = 0f
        private set
    var currentLengthPx: Float = naturalLengthPx
        private set

    var isDragging: Boolean = false
        private set
    var isSleeping: Boolean = false
        private set

    private var externalAx: Float = 0f
    private var externalAy: Float = 0f

    private var dragTargetX: Float = 0f
    private var dragTargetY: Float = naturalLengthPx
    private var prevDragX: Float = 0f
    private var dragVelocity: Float = 0f

    companion object {
        private const val SLEEP_VELOCITY_EPSILON = 0.0025f
        private const val SLEEP_ANGLE_EPSILON = 0.0025f
    }

    fun setRopeLength(length: Float) {
        naturalLengthPx = length.coerceIn(60f, 350f)
        if (!isDragging) {
            currentLengthPx = naturalLengthPx
        }
    }

    fun setExternalAcceleration(ax: Float, ay: Float) {
        externalAx = if (ax.isNaN()) 0f else ax.coerceIn(-15f, 15f)
        externalAy = if (ay.isNaN()) 0f else ay.coerceIn(-15f, 15f)
        if (kotlin.math.abs(externalAx) > 0.08f) {
            isSleeping = false
        }
    }

    fun startDrag(touchRelX: Float, touchRelY: Float) {
        isDragging = true
        isSleeping = false
        dragTargetX = touchRelX
        dragTargetY = touchRelY.coerceAtLeast(30f)
        prevDragX = touchRelX
        dragVelocity = 0f
        updateDragGeometry()
    }

    fun updateDrag(touchRelX: Float, touchRelY: Float, dt: Float = 0.016f) {
        if (!isDragging) return
        dragTargetX = touchRelX
        dragTargetY = touchRelY.coerceAtLeast(30f)
        if (dt > 0.001f) {
            dragVelocity = (touchRelX - prevDragX) / dt
            prevDragX = touchRelX
        }
        updateDragGeometry()
    }

    fun releaseDrag() {
        if (!isDragging) return
        isDragging = false
        val r = currentLengthPx.coerceAtLeast(30f)
        val tangentialSpeed = dragVelocity * cos(angle)
        angularVelocity = (tangentialSpeed / r).coerceIn(-12f, 12f)
        isSleeping = false
    }

    fun applyImpulse(impulse: Float) {
        angularVelocity += impulse
        isSleeping = false
    }

    fun testSwing(intensity: Float = 1.0f) {
        angle = 0.45f * intensity
        angularVelocity = 1.2f * intensity
        isSleeping = false
    }

    fun reset() {
        angle = 0f
        angularVelocity = 0f
        angularAccel = 0f
        currentLengthPx = naturalLengthPx
        isDragging = false
        isSleeping = true
    }

    private fun updateDragGeometry() {
        val dx = dragTargetX
        val dy = dragTargetY
        val dist = sqrt(dx * dx + dy * dy)
        val maxDist = naturalLengthPx * 1.5f
        val minDist = naturalLengthPx * 0.4f
        currentLengthPx = dist.coerceIn(minDist, maxDist)
        angle = atan2(dx, dy)
        angularVelocity = 0f
        angularAccel = 0f
    }

    fun step(
        dt: Float,
        gravity: Float = 9.8f,
        damping: Float = 0.982f,
        swingIntensity: Float = 1.0f,
        movementResponse: Float = 1.2f,
        maxAngleDeg: Float = 72f,
        reduceMotion: Boolean = false
    ) {
        val clampedDt = dt.coerceIn(0.001f, 0.033f)

        if (reduceMotion) {
            if (!isDragging) {
                angle *= 0.82f
                angularVelocity = 0f
                currentLengthPx += (naturalLengthPx - currentLengthPx) * 0.2f
                if (kotlin.math.abs(angle) < 0.001f) {
                    angle = 0f
                    isSleeping = true
                }
            }
            return
        }

        if (isDragging) return

        // Sleep check
        val isStationary = kotlin.math.abs(angle) < SLEEP_ANGLE_EPSILON &&
                kotlin.math.abs(angularVelocity) < SLEEP_VELOCITY_EPSILON &&
                kotlin.math.abs(externalAx) < 0.05f

        if (isStationary) {
            angle = 0f
            angularVelocity = 0f
            angularAccel = 0f
            currentLengthPx = naturalLengthPx
            isSleeping = true
            return
        }

        isSleeping = false

        val g = (gravity * 35f) * swingIntensity
        val l = currentLengthPx.coerceAtLeast(40f)
        val sensorEffect = (externalAx * 85f * movementResponse) / l

        // Restoring torque + inertia torque
        val gravityTorque = -(g / l) * sin(angle)
        val inertiaTorque = sensorEffect * cos(angle)

        angularAccel = gravityTorque + inertiaTorque
        angularVelocity = (angularVelocity + angularAccel * clampedDt) * damping.coerceIn(0.85f, 0.999f)
        angle += angularVelocity * clampedDt

        // Angular clamp limit
        val maxRad = Math.toRadians(maxAngleDeg.toDouble()).toFloat()
        if (kotlin.math.abs(angle) > maxRad) {
            angle = sign(angle) * maxRad
            angularVelocity *= -0.3f
        }

        // Spring restitution back to natural rope length
        currentLengthPx += (naturalLengthPx - currentLengthPx) * (1.5f * clampedDt)

        // NaN safety
        if (angle.isNaN() || angularVelocity.isNaN()) {
            reset()
        }
    }

    fun getBobPositionX(): Float = sin(angle) * currentLengthPx
    fun getBobPositionY(): Float = cos(angle) * currentLengthPx
}
