import { PhysicsConfig, CHARM_WEIGHT_MULTIPLIERS, CharmWeightPreset } from '../types';

export interface RopePoint {
  x: number;
  y: number;
}

export interface PendulumState {
  angle: number;           // in radians (at charm bob)
  angularVelocity: number; // rad/s
  angularAccel: number;    // rad/s^2
  x: number;               // bob tip x coordinate relative to origin
  y: number;               // bob tip y coordinate relative to origin
  ropeLength: number;      // current length (can slightly stretch on drag)
  isSleeping: boolean;
  isDragging: boolean;
  energy: number;
  points: RopePoint[];     // Full array of multi-segment rope positions
  tailPoints: RopePoint[]; // Points for after-charm dangling chain / beads
  dragStretch: number;     // 1.0 = normal, >1.0 = stretched
}

interface Particle {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  mass: number;
  pinned: boolean;
  dampingFactor: number;
}

export class DanglePhysicsEngine {
  private particles: Particle[] = [];
  private tailParticles: Particle[] = [];
  private numSegments: number = 8;
  private naturalLength: number = 130;
  private ropeLength: number = 130;
  private segmentRestLength: number = 130 / 8;
  
  private isDragging: boolean = false;
  private isSleeping: boolean = false;
  private dragTargetX: number = 0;
  private dragTargetY: number = 130;
  private prevDragX: number = 0;
  private prevDragY: number = 130;
  private dragVx: number = 0;
  private dragVy: number = 0;

  // External acceleration from accelerometer or tilt sensor
  private externalAx: number = 0;
  private externalAy: number = 0;

  // Accumulated motion metrics
  private angle: number = 0;
  private angularVelocity: number = 0;
  private angularAccel: number = 0;
  private sleepCounter: number = 0;

  constructor(length: number = 130, quality: 'low' | 'medium' | 'high' = 'medium') {
    this.naturalLength = Math.max(60, Math.min(300, length));
    this.ropeLength = this.naturalLength;
    this.setQuality(quality);
  }

  public setQuality(quality: 'low' | 'medium' | 'high') {
    const targetSegments = quality === 'low' ? 5 : quality === 'high' ? 12 : 8;
    if (this.numSegments !== targetSegments || this.particles.length === 0) {
      this.numSegments = targetSegments;
      this.initParticles();
    }
  }

  public setRopeLength(length: number) {
    this.naturalLength = Math.max(60, Math.min(300, length));
    this.segmentRestLength = this.naturalLength / this.numSegments;
    if (!this.isDragging) {
      this.ropeLength = this.naturalLength;
    }
  }

  public setExternalAcceleration(ax: number, ay: number = 0) {
    this.externalAx = isNaN(ax) ? 0 : Math.max(-15, Math.min(15, ax));
    this.externalAy = isNaN(ay) ? 0 : Math.max(-15, Math.min(15, ay));

    if (Math.abs(this.externalAx) > 0.08 || Math.abs(this.externalAy) > 0.08) {
      this.isSleeping = false;
      this.sleepCounter = 0;
    }
  }

  private initParticles() {
    this.particles = [];
    this.segmentRestLength = this.naturalLength / this.numSegments;

    // Pin top anchor particle at (0, 0)
    for (let i = 0; i <= this.numSegments; i++) {
      const y = i * this.segmentRestLength;
      this.particles.push({
        x: 0,
        y: y,
        oldX: 0,
        oldY: y,
        mass: i === this.numSegments ? 1.5 : 0.2, // heavier charm at the tip
        pinned: i === 0,
        dampingFactor: 1.0,
      });
    }

    // Initialize 3 after-charm tail particles (for bottom beads / dangles)
    this.tailParticles = [];
    const baseY = this.naturalLength;
    for (let i = 1; i <= 3; i++) {
      const y = baseY + i * 16;
      this.tailParticles.push({
        x: 0,
        y: y,
        oldX: 0,
        oldY: y,
        mass: 0.4,
        pinned: false,
        dampingFactor: 1.0,
      });
    }
  }

  public startDrag(touchX: number, touchY: number) {
    this.isDragging = true;
    this.isSleeping = false;
    this.sleepCounter = 0;
    this.dragTargetX = touchX;
    this.dragTargetY = Math.max(20, touchY);
    this.prevDragX = touchX;
    this.prevDragY = this.dragTargetY;
    this.dragVx = 0;
    this.dragVy = 0;

    // Pull the bottom particle directly to drag point
    if (this.particles.length > 0) {
      const tip = this.particles[this.particles.length - 1];
      tip.x = touchX;
      tip.y = this.dragTargetY;
      tip.oldX = touchX;
      tip.oldY = this.dragTargetY;
    }
  }

  public updateDrag(touchX: number, touchY: number, dt: number = 0.016) {
    if (!this.isDragging) return;
    this.dragTargetX = touchX;
    this.dragTargetY = Math.max(20, touchY);

    if (dt > 0.001) {
      this.dragVx = (touchX - this.prevDragX) / dt;
      this.dragVy = (this.dragTargetY - this.prevDragY) / dt;
      this.prevDragX = touchX;
      this.prevDragY = this.dragTargetY;
    }

    if (this.particles.length > 0) {
      const tip = this.particles[this.particles.length - 1];
      tip.x = this.dragTargetX;
      tip.y = this.dragTargetY;
    }
  }

  public releaseDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.isSleeping = false;
    this.sleepCounter = 0;

    // Apply release drag throw velocity to the tip and neighboring particles
    if (this.particles.length > 0) {
      const tip = this.particles[this.particles.length - 1];
      const clampedVx = Math.max(-2500, Math.min(2500, this.dragVx));
      const clampedVy = Math.max(-2500, Math.min(2500, this.dragVy));

      // Verlet velocity: oldPos = pos - vel * dt (using ~0.016)
      const impulseDt = 0.016;
      tip.oldX = tip.x - clampedVx * impulseDt * 0.8;
      tip.oldY = tip.y - clampedVy * impulseDt * 0.8;

      // propagate fraction to pre-tip segments
      if (this.particles.length > 2) {
        const prev = this.particles[this.particles.length - 2];
        prev.oldX = prev.x - clampedVx * impulseDt * 0.4;
        prev.oldY = prev.y - clampedVy * impulseDt * 0.4;
      }

      // Propagate into tail chain
      for (const tp of this.tailParticles) {
        tp.oldX = tp.x - clampedVx * impulseDt * 0.9;
        tp.oldY = tp.y - clampedVy * impulseDt * 0.9;
      }
    }
  }

  public applyImpulse(impulseRadiansPerSec: number) {
    this.isSleeping = false;
    this.sleepCounter = 0;

    const impulseX = impulseRadiansPerSec * 45;
    for (let i = 1; i < this.particles.length; i++) {
      const frac = i / this.numSegments;
      this.particles[i].oldX -= impulseX * frac * 0.016;
    }
    for (const tp of this.tailParticles) {
      tp.oldX -= impulseX * 0.016;
    }
  }

  public testSwing(intensity: number = 1.0) {
    this.isSleeping = false;
    this.sleepCounter = 0;

    const lateralDisplacement = 70 * intensity;
    for (let i = 1; i < this.particles.length; i++) {
      const frac = i / this.numSegments;
      // create a playful wave shape on test swing
      const wave = Math.sin(frac * Math.PI) * 15 * intensity;
      this.particles[i].x = lateralDisplacement * frac + wave;
      this.particles[i].oldX = this.particles[i].x - 120 * intensity * frac * 0.016;
    }
  }

  public reset() {
    this.initParticles();
    this.angle = 0;
    this.angularVelocity = 0;
    this.angularAccel = 0;
    this.isDragging = false;
    this.isSleeping = true;
    this.sleepCounter = 0;
  }

  public step(dt: number, config: PhysicsConfig): PendulumState {
    if (config.enabled === false) {
      // Physics paused
      return this.getState();
    }

    if (config.quality) {
      this.setQuality(config.quality);
    }

    const clampedDt = Math.max(0.002, Math.min(0.033, dt));

    if (config.reduceMotion) {
      // Gentle return to center without bouncing
      if (!this.isDragging) {
        for (let i = 1; i <= this.numSegments; i++) {
          this.particles[i].x *= 0.88;
          this.particles[i].y += ((i * this.segmentRestLength) - this.particles[i].y) * 0.15;
          this.particles[i].oldX = this.particles[i].x;
          this.particles[i].oldY = this.particles[i].y;
        }
        for (let i = 0; i < this.tailParticles.length; i++) {
          this.tailParticles[i].x *= 0.88;
          this.tailParticles[i].oldX = this.tailParticles[i].x;
        }
        this.angle *= 0.88;
        this.angularVelocity = 0;
        if (Math.abs(this.particles[this.numSegments].x) < 0.2) {
          this.isSleeping = true;
        }
      }
      return this.getState();
    }

    // Weight multiplier impact
    const weightKey: CharmWeightPreset = config.charmWeight || 'medium';
    const weightProps = CHARM_WEIGHT_MULTIPLIERS[weightKey] || CHARM_WEIGHT_MULTIPLIERS.medium;

    // Apply mass to tip
    if (this.particles.length > 0) {
      this.particles[this.particles.length - 1].mass = weightProps.mass;
    }

    // Config parameters
    const gravityScale = config.gravity * 36;
    const waveMult = config.waveStrength ?? 1.0;
    const flexMult = config.cordFlexibility ?? 0.7;
    const stiffness = Math.max(0.05, Math.min(0.6, config.stiffness));
    const baseDamping = Math.max(0.92, Math.min(0.998, config.damping)) * weightProps.dampingMul;

    // Sensor inertia
    const sensorX = this.externalAx * 90 * config.movementResponse;
    const sensorY = this.externalAy * 40 * config.movementResponse;

    // 1. Verlet integration for each particle
    const tipIndex = this.particles.length - 1;

    for (let i = 1; i <= tipIndex; i++) {
      const p = this.particles[i];
      if (p.pinned) continue;

      // Tip dragged: hold target
      if (this.isDragging && i === tipIndex) {
        p.x = this.dragTargetX;
        p.y = this.dragTargetY;
        continue;
      }

      // Air resistance damping
      const vx = (p.x - p.oldX) * baseDamping;
      const vy = (p.y - p.oldY) * baseDamping;

      p.oldX = p.x;
      p.oldY = p.y;

      // Wave resonance factor along the string
      const frac = i / this.numSegments;
      const waveEffect = Math.sin(frac * Math.PI * 2) * (waveMult * 0.15);

      const ax = sensorX + waveEffect * vx;
      const ay = gravityScale + sensorY;

      p.x += vx + ax * clampedDt * clampedDt;
      p.y += vy + ay * clampedDt * clampedDt;
    }

    // 2. Tail particles integration (below charm)
    for (let i = 0; i < this.tailParticles.length; i++) {
      const tp = this.tailParticles[i];
      const vx = (tp.x - tp.oldX) * (baseDamping * 0.98);
      const vy = (tp.y - tp.oldY) * (baseDamping * 0.98);
      tp.oldX = tp.x;
      tp.oldY = tp.y;
      tp.x += vx + sensorX * clampedDt * clampedDt;
      tp.y += vy + gravityScale * 0.8 * clampedDt * clampedDt;
    }

    // 3. Relax distance & bending constraints (4 iterations for crisp realistic string behavior)
    const iterations = 4;
    for (let iter = 0; iter < iterations; iter++) {
      // Cord distance constraints
      for (let i = 0; i < tipIndex; i++) {
        const p1 = this.particles[i];
        const p2 = this.particles[i + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy) || 0.001;

        // Allow slight springy stretch when dragging or swinging hard
        const targetLen = this.segmentRestLength;
        const diff = (dist - targetLen) / dist;

        if (this.isDragging && i + 1 === tipIndex) {
          // Dragged tip pulls rope segments
          if (!p1.pinned) {
            p1.x += dx * diff * 0.8 * flexMult;
            p1.y += dy * diff * 0.8 * flexMult;
          }
        } else {
          const invMass1 = p1.pinned ? 0 : 1 / p1.mass;
          const invMass2 = (this.isDragging && i + 1 === tipIndex) ? 0 : 1 / p2.mass;
          const invMassTotal = invMass1 + invMass2;

          if (invMassTotal > 0) {
            const factor = diff * (0.85 + stiffness * 0.25);
            if (!p1.pinned) {
              p1.x += dx * factor * (invMass1 / invMassTotal);
              p1.y += dy * factor * (invMass1 / invMassTotal);
            }
            if (!p2.pinned && !(this.isDragging && i + 1 === tipIndex)) {
              p2.x -= dx * factor * (invMass2 / invMassTotal);
              p2.y -= dy * factor * (invMass2 / invMassTotal);
            }
          }
        }
      }

      // Angular / Bending stiffness constraint to produce natural catenary and prevent micro-folding
      for (let i = 1; i < tipIndex; i++) {
        const pPrev = this.particles[i - 1];
        const pCur = this.particles[i];
        const pNext = this.particles[i + 1];

        const straightMidX = (pPrev.x + pNext.x) * 0.5;
        const straightMidY = (pPrev.y + pNext.y) * 0.5;

        // Pull current particle towards midpoint between neighbors (cord bending resistance)
        const bendStrength = (1.0 - flexMult) * 0.25;
        if (!pCur.pinned) {
          pCur.x += (straightMidX - pCur.x) * bendStrength;
          pCur.y += (straightMidY - pCur.y) * bendStrength;
        }
      }

      // Tail constraints: attach tail 0 to charm tip
      const tip = this.particles[tipIndex];
      let attachX = tip.x;
      let attachY = tip.y;
      for (let i = 0; i < this.tailParticles.length; i++) {
        const tp = this.tailParticles[i];
        const dx = tp.x - attachX;
        const dy = tp.y - attachY;
        const dist = Math.hypot(dx, dy) || 0.001;
        const rest = 14; // spacing between after-charm beads
        const diff = (dist - rest) / dist;
        tp.x -= dx * diff * 0.9;
        tp.y -= dy * diff * 0.9;
        attachX = tp.x;
        attachY = tp.y;
      }
    }

    // 4. Update overall angle & velocity from tip motion
    const tip = this.particles[tipIndex];
    const prevTipAngle = this.angle;
    this.angle = Math.atan2(tip.x, tip.y);
    if (clampedDt > 0.001) {
      this.angularVelocity = (this.angle - prevTipAngle) / clampedDt;
    }

    // Max angle clamp
    const maxRad = ((config.maxAngleDeg || 75) * Math.PI) / 180;
    if (Math.abs(this.angle) > maxRad) {
      this.angle = Math.sign(this.angle) * maxRad;
    }

    // Check for sleep state
    const tipSpeed = Math.hypot(tip.x - tip.oldX, tip.y - tip.oldY) / clampedDt;
    if (!this.isDragging && tipSpeed < 1.5 && Math.abs(this.angle) < 0.01 && Math.abs(this.externalAx) < 0.05) {
      this.sleepCounter++;
      if (this.sleepCounter > 40) {
        this.isSleeping = true;
      }
    } else {
      this.sleepCounter = 0;
      this.isSleeping = false;
    }

    return this.getState();
  }

  public getState(): PendulumState {
    const tipIndex = this.particles.length > 0 ? this.particles.length - 1 : 0;
    const tip = this.particles[tipIndex] || { x: 0, y: this.naturalLength };

    // Calculate current rope stretch
    const actualLength = Math.hypot(tip.x, tip.y);
    const dragStretch = actualLength / (this.naturalLength || 1);

    const points: RopePoint[] = this.particles.map(p => ({ x: p.x, y: p.y }));
    const tailPoints: RopePoint[] = this.tailParticles.map(p => ({ x: p.x, y: p.y }));

    const energy = 0.5 * actualLength * (this.angularVelocity * this.angularVelocity) + (1 - Math.cos(this.angle)) * 9.8 * actualLength;

    return {
      angle: this.angle,
      angularVelocity: this.angularVelocity,
      angularAccel: this.angularAccel,
      x: tip.x,
      y: tip.y,
      ropeLength: actualLength,
      isSleeping: this.isSleeping,
      isDragging: this.isDragging,
      energy,
      points,
      tailPoints,
      dragStretch,
    };
  }
}
