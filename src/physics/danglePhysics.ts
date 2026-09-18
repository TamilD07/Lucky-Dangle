import { PhysicsConfig } from '../types';

export interface PendulumState {
  angle: number;           // in radians
  angularVelocity: number; // rad/s
  angularAccel: number;    // rad/s^2
  x: number;               // bob tip x coordinate relative to origin
  y: number;               // bob tip y coordinate relative to origin
  ropeLength: number;      // current length (can slightly stretch on drag)
  isSleeping: boolean;
  isDragging: boolean;
  energy: number;
}

export class DanglePhysicsEngine {
  private angle: number = 0;              // rad
  private angularVelocity: number = 0;    // rad/s
  private angularAccel: number = 0;       // rad/s^2
  private ropeLength: number = 130;       // px
  private naturalLength: number = 130;
  private isDragging: boolean = false;
  private isSleeping: boolean = false;
  private dragTargetX: number = 0;
  private dragTargetY: number = 130;
  private prevDragX: number = 0;
  private dragVelocity: number = 0;

  // External acceleration from accelerometer (m/s^2 or normalized -1..1)
  private externalAx: number = 0;
  private externalAy: number = 0;

  // Epsilon threshold for sleep
  private readonly SLEEP_VELOCITY_EPSILON = 0.002;
  private readonly SLEEP_ANGLE_EPSILON = 0.002;

  constructor(length: number = 130) {
    this.naturalLength = length;
    this.ropeLength = length;
  }

  public setRopeLength(length: number) {
    this.naturalLength = Math.max(60, Math.min(300, length));
    if (!this.isDragging) {
      this.ropeLength = this.naturalLength;
    }
  }

  public setExternalAcceleration(ax: number, ay: number = 0) {
    this.externalAx = isNaN(ax) ? 0 : Math.max(-15, Math.min(15, ax));
    this.externalAy = isNaN(ay) ? 0 : Math.max(-15, Math.min(15, ay));

    // Wake up if motion detected
    if (Math.abs(this.externalAx) > 0.08 || Math.abs(this.externalAy) > 0.08) {
      this.isSleeping = false;
    }
  }

  public startDrag(touchX: number, touchY: number) {
    this.isDragging = true;
    this.isSleeping = false;
    this.dragTargetX = touchX;
    this.dragTargetY = Math.max(30, touchY);
    this.prevDragX = touchX;
    this.dragVelocity = 0;
    this.updateDragGeometry();
  }

  public updateDrag(touchX: number, touchY: number, dt: number = 0.016) {
    if (!this.isDragging) return;
    this.dragTargetX = touchX;
    this.dragTargetY = Math.max(30, touchY);
    
    if (dt > 0.001) {
      this.dragVelocity = (touchX - this.prevDragX) / dt;
      this.prevDragX = touchX;
    }

    this.updateDragGeometry();
  }

  public releaseDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Convert drag velocity to angular velocity impulse
    const r = Math.max(30, this.ropeLength);
    const tangentialSpeed = this.dragVelocity * Math.cos(this.angle);
    this.angularVelocity = Math.max(-12, Math.min(12, tangentialSpeed / r));
    this.isSleeping = false;
  }

  public applyImpulse(impulseRadiansPerSec: number) {
    this.angularVelocity += impulseRadiansPerSec;
    this.isSleeping = false;
  }

  public testSwing(intensity: number = 1.0) {
    // A natural starting swing to the right, then pendulum settles
    this.angle = 0.45 * intensity;
    this.angularVelocity = 1.2 * intensity;
    this.isSleeping = false;
  }

  public reset() {
    this.angle = 0;
    this.angularVelocity = 0;
    this.angularAccel = 0;
    this.ropeLength = this.naturalLength;
    this.isDragging = false;
    this.isSleeping = true;
  }

  private updateDragGeometry() {
    const dx = this.dragTargetX;
    const dy = this.dragTargetY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Limit maximum stretch (rubber band spring feel)
    const maxAllowedDist = this.naturalLength * 1.5;
    const minAllowedDist = this.naturalLength * 0.4;
    this.ropeLength = Math.max(minAllowedDist, Math.min(maxAllowedDist, dist));

    // Calculate angle from vertical downward (0 = hanging straight down)
    this.angle = Math.atan2(dx, dy);
    this.angularVelocity = 0;
    this.angularAccel = 0;
  }

  /**
   * Run 1 step of physics simulation
   * @param dt delta time in seconds (clamped to 0.033 max to avoid explosion)
   * @param config PhysicsConfig
   */
  public step(dt: number, config: PhysicsConfig): PendulumState {
    const clampedDt = Math.max(0.001, Math.min(0.033, dt));

    if (config.reduceMotion) {
      // Gentle spring return to center with minimal swinging
      if (!this.isDragging) {
        this.angle *= 0.85;
        this.angularVelocity = 0;
        this.ropeLength += (this.naturalLength - this.ropeLength) * 0.2;
        if (Math.abs(this.angle) < 0.001) {
          this.angle = 0;
          this.isSleeping = true;
        }
      }
      return this.getState();
    }

    if (this.isDragging) {
      return this.getState();
    }

    // Check if sleeping
    const isStationary = 
      Math.abs(this.angle) < this.SLEEP_ANGLE_EPSILON &&
      Math.abs(this.angularVelocity) < this.SLEEP_VELOCITY_EPSILON &&
      Math.abs(this.externalAx) < 0.05;

    if (isStationary) {
      this.angle = 0;
      this.angularVelocity = 0;
      this.angularAccel = 0;
      this.ropeLength = this.naturalLength;
      this.isSleeping = true;
      return this.getState();
    }

    this.isSleeping = false;

    // Numerical integration (semi-implicit Euler / Verlet with RK2 torque)
    // Pendulum equation:
    // d2theta / dt2 = - (g / L) * sin(theta) - (damping * omega) + (ax / L) * cos(theta) * movementResponse
    const g = (config.gravity * 35) * config.swingIntensity; // scaled for pixels
    const L = Math.max(40, this.ropeLength);
    const damping = Math.max(0.85, Math.min(0.999, config.damping));
    const sensorEffect = (this.externalAx * 85 * config.movementResponse) / L;

    // Gravity restoring torque
    const gravityTorque = -(g / L) * Math.sin(this.angle);

    // Sensor inertia torque
    const inertiaTorque = sensorEffect * Math.cos(this.angle);

    this.angularAccel = gravityTorque + inertiaTorque;

    // Update velocity with air resistance damping
    this.angularVelocity = (this.angularVelocity + this.angularAccel * clampedDt) * damping;

    // Update angle
    this.angle += this.angularVelocity * clampedDt;

    // Max angle clamp to avoid unphysical full 360 spins
    const maxRad = (config.maxAngleDeg * Math.PI) / 180;
    if (Math.abs(this.angle) > maxRad) {
      this.angle = Math.sign(this.angle) * maxRad;
      this.angularVelocity *= -0.3; // bounce off constraint
    }

    // Spring restitution back to natural rope length if stretched
    this.ropeLength += (this.naturalLength - this.ropeLength) * (config.stiffness * 10 * clampedDt);

    // Guard against NaN or Infinity
    if (isNaN(this.angle) || !isFinite(this.angle)) {
      this.reset();
    }

    return this.getState();
  }

  public getState(): PendulumState {
    const x = Math.sin(this.angle) * this.ropeLength;
    const y = Math.cos(this.angle) * this.ropeLength;
    const energy = 0.5 * this.ropeLength * (this.angularVelocity * this.angularVelocity) + (1 - Math.cos(this.angle)) * 9.8 * this.ropeLength;

    return {
      angle: this.angle,
      angularVelocity: this.angularVelocity,
      angularAccel: this.angularAccel,
      x,
      y,
      ropeLength: this.ropeLength,
      isSleeping: this.isSleeping,
      isDragging: this.isDragging,
      energy,
    };
  }
}
