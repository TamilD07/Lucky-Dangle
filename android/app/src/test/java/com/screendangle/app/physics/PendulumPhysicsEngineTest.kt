package com.screendangle.app.physics

import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class PendulumPhysicsEngineTest {

    private lateinit var engine: PendulumPhysicsEngine

    @Before
    fun setUp() {
        engine = PendulumPhysicsEngine(130f)
    }

    @Test
    fun testInitialStateIsAtRest() {
        assertEquals(0f, engine.angle, 0.0001f)
        assertEquals(0f, engine.angularVelocity, 0.0001f)
        assertEquals(130f, engine.currentLengthPx, 0.0001f)
    }

    @Test
    fun testPhysicsDoesNotProduceNaNOrInfinity() {
        engine.setExternalAcceleration(12f, 0f)
        for (i in 0..500) {
            engine.step(
                dt = 0.016f,
                gravity = 9.8f,
                damping = 0.98f,
                swingIntensity = 2.0f,
                movementResponse = 2.5f,
                maxAngleDeg = 75f,
                reduceMotion = false
            )
            assertFalse("Angle is NaN at step $i", engine.angle.isNaN())
            assertFalse("Velocity is NaN at step $i", engine.angularVelocity.isNaN())
            assertTrue("Angle exceeds physical bound", kotlin.math.abs(engine.angle) <= Math.toRadians(75.5))
        }
    }

    @Test
    fun testSleepModeWhenStationary() {
        engine.reset()
        engine.step(0.016f)
        assertTrue("Engine should sleep when resting and no force applied", engine.isSleeping)
    }

    @Test
    fun testReduceMotionModeSuppressesSwing() {
        engine.applyImpulse(5f)
        engine.step(0.016f, reduceMotion = true)
        assertTrue(kotlin.math.abs(engine.angle) < 0.1f)
    }
}
