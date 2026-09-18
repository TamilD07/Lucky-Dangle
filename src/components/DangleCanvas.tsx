import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CharmItem, PhysicsConfig, AppearanceConfig, RitualState, RopeStyleKey } from '../types';
import { DanglePhysicsEngine, PendulumState } from '../physics/danglePhysics';
import { CharmRenderer } from './CharmRenderer';
import { audioSynth } from '../utils/audioSynth';

interface DangleCanvasProps {
  charm: CharmItem;
  physics: PhysicsConfig;
  appearance: AppearanceConfig;
  horizontalPercent: number; // 0.1 to 0.9
  containerWidth: number;
  containerHeight: number;
  interactive?: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  externalTiltX?: number; // tilt from sensor simulator (-10 to 10)
  testSwingTrigger?: number; // counter to trigger test swing
  ritualState?: RitualState;
  onRitualTrigger?: (actionName?: string) => void;
  onAnchorMove?: (newPercent: number) => void;
}

export const DangleCanvas: React.FC<DangleCanvasProps> = ({
  charm,
  physics,
  appearance,
  horizontalPercent,
  containerWidth,
  containerHeight,
  interactive = true,
  onInteractionStart,
  onInteractionEnd,
  externalTiltX = 0,
  testSwingTrigger = 0,
  ritualState = {},
  onRitualTrigger,
  onAnchorMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const physicsEngineRef = useRef<DanglePhysicsEngine | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const isDraggingRef = useRef<boolean>(false);
  const isAnchorDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  const [physicsState, setPhysicsState] = useState<PendulumState>({
    angle: 0,
    angularVelocity: 0,
    angularAccel: 0,
    x: 0,
    y: physics.ropeLength,
    ropeLength: physics.ropeLength,
    isSleeping: false,
    isDragging: false,
    energy: 0,
  });

  // Calculate anchor coordinates at top edge
  const anchorX = Math.max(30, Math.min(containerWidth - 30, containerWidth * horizontalPercent));
  const anchorY = 0; // directly attached to top bezel edge

  // Initialize or update physics engine
  useEffect(() => {
    if (!physicsEngineRef.current) {
      physicsEngineRef.current = new DanglePhysicsEngine(physics.ropeLength);
    } else {
      physicsEngineRef.current.setRopeLength(physics.ropeLength);
    }
  }, [physics.ropeLength]);

  // Handle external tilt changes
  useEffect(() => {
    if (physicsEngineRef.current) {
      physicsEngineRef.current.setExternalAcceleration(externalTiltX * 0.8, 0);
    }
  }, [externalTiltX]);

  // Handle Test Swing trigger
  useEffect(() => {
    if (testSwingTrigger > 0 && physicsEngineRef.current) {
      physicsEngineRef.current.testSwing(physics.swingIntensity);
      audioSynth.playFlickSound(physics.swingIntensity * 2);
    }
  }, [testSwingTrigger, physics.swingIntensity]);

  // Animation physics loop
  useEffect(() => {
    let active = true;

    const loop = (currentTime: number) => {
      if (!active) return;

      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (physicsEngineRef.current) {
        const state = physicsEngineRef.current.step(dt, physics);
        setPhysicsState(state);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [physics]);

  // Cursor Proximity Reactivity (Gentle micro-sway when finger/cursor nears charm)
  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDraggingRef.current || !physicsEngineRef.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;

      const charmPosX = anchorX + physicsState.x;
      const charmPosY = anchorY + physicsState.y;

      const dx = charmPosX - curX;
      const dy = charmPosY - curY;
      const dist = Math.hypot(dx, dy);

      // Goldilocks 90px proximity radius
      if (dist < 90 && dist > 1) {
        const factor = (90 - dist) / 90;
        const nudge = Math.sign(dx) * factor * 0.15;
        physicsEngineRef.current.applyImpulse(nudge);
      }
    },
    [anchorX, anchorY, physicsState.x, physicsState.y]
  );

  // Pointer interaction handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive) return;
      e.preventDefault();
      e.stopPropagation();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !physicsEngineRef.current) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Check if clicking the top anchor clip to slide along top edge
      if (clientY < 28 && Math.abs(clientX - anchorX) < 30) {
        isAnchorDraggingRef.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        onInteractionStart?.();
        return;
      }

      // Charm drag
      const touchRelX = clientX - anchorX;
      const touchRelY = clientY - anchorY;

      isDraggingRef.current = true;
      dragStartPosRef.current = { x: clientX, y: clientY };
      lastPointerPosRef.current = { x: clientX, y: clientY, time: performance.now() };

      physicsEngineRef.current.startDrag(touchRelX, touchRelY);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      onInteractionStart?.();
    },
    [interactive, anchorX, anchorY, onInteractionStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Sliding anchor clip along top edge
      if (isAnchorDraggingRef.current && onAnchorMove) {
        const clampedX = Math.max(30, Math.min(containerWidth - 30, clientX));
        const newPercent = clampedX / containerWidth;
        onAnchorMove(newPercent);
        return;
      }

      if (!isDraggingRef.current || !physicsEngineRef.current) return;
      e.preventDefault();

      const touchRelX = clientX - anchorX;
      const touchRelY = clientY - anchorY;

      physicsEngineRef.current.updateDrag(touchRelX, touchRelY, 0.016);
      lastPointerPosRef.current = { x: clientX, y: clientY, time: performance.now() };
    },
    [anchorX, anchorY, containerWidth, onAnchorMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isAnchorDraggingRef.current) {
        isAnchorDraggingRef.current = false;
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        onInteractionEnd?.();
        return;
      }

      if (!isDraggingRef.current || !physicsEngineRef.current) return;
      e.preventDefault();
      isDraggingRef.current = false;

      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        const distMoved = Math.hypot(
          clientX - dragStartPosRef.current.x,
          clientY - dragStartPosRef.current.y
        );

        // Tap without drag -> trigger charm ritual or playful flick
        if (distMoved < 8) {
          if (onRitualTrigger) {
            onRitualTrigger();
          } else {
            physicsEngineRef.current.applyImpulse((Math.random() > 0.5 ? 1 : -1) * 2.2);
            audioSynth.playFlickSound(1.5);
          }
        } else {
          // Release with velocity inertia
          const now = performance.now();
          const dt = Math.max(0.016, (now - lastPointerPosRef.current.time) / 1000);
          const vx = (clientX - lastPointerPosRef.current.x) / dt;
          const speed = Math.abs(vx);
          if (speed > 150) {
            audioSynth.playFlickSound(speed / 200);
          }
        }
      }

      physicsEngineRef.current.releaseDrag();
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }

      onInteractionEnd?.();
    },
    [onInteractionEnd, onRitualTrigger]
  );

  const handleDoubleClick = useCallback(() => {
    if (!interactive || !physicsEngineRef.current) return;
    physicsEngineRef.current.testSwing(physics.swingIntensity * 1.4);
    audioSynth.playFlickSound(physics.swingIntensity * 2.5);
  }, [interactive, physics.swingIntensity]);

  // Coordinates of the charm relative to container
  const charmX = anchorX + physicsState.x;
  const charmY = anchorY + physicsState.y;

  // Bezel mount eyelet anchor origin
  const mountEyeletY = anchorY + 5.5;

  // Jump ring connection point at top opening of the charm's bail:
  // In world coordinates, precisely rotating with the charm's angle
  const charmBailOffset = 8.5;
  const targetX = charmX - Math.sin(physicsState.angle) * charmBailOffset;
  const targetY = charmY - Math.cos(physicsState.angle) * charmBailOffset;

  // Compute organic catenary / inertia sag curve control point
  const dx = targetX - anchorX;
  const dy = targetY - mountEyeletY;
  const chordDist = Math.hypot(dx, dy);
  const slack = Math.max(0, physicsState.ropeLength - chordDist);
  const sagMagnitude = Math.min(
    7,
    Math.max(0.8, slack * 0.35 + 1.2 * (1 - Math.min(1, Math.abs(physicsState.angularVelocity) * 0.4)))
  );
  const ux = chordDist > 0 ? dx / chordDist : 0;
  const uy = chordDist > 0 ? dy / chordDist : 1;
  const nx = -uy;
  const ny = ux;
  // Gravity acts downwards (0, 1). Perpendicular component is ny (= ux)
  const perpGravity = ny;
  const curveControlX = (anchorX + targetX) / 2 + nx * (perpGravity * sagMagnitude * 0.75);
  const curveControlY = (mountEyeletY + targetY) / 2 + ny * (perpGravity * sagMagnitude * 0.75) + sagMagnitude * 0.45;

  return (
    <div
      ref={containerRef}
      id="dangle-overlay-stage"
      onPointerMove={handleContainerPointerMove}
      className="absolute inset-0 pointer-events-none overflow-visible select-none"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {/* SVG Layer for String / Chain / Beads */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        style={{ width: containerWidth, height: containerHeight }}
      >
        <defs>
          {/* Bezel notch clamp gradient */}
          <linearGradient id="bezelClampGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="40%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>

          {/* High-grade jewelry metallic gold */}
          <linearGradient id="metallicGoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Sterling silver sheen */}
          <linearGradient id="metallicSilverGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e2e8f0" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* 3D Spherical Radial Gradients for beads */}
          <radialGradient id="goldBead3D" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="65%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          <radialGradient id="rubyBead3D" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#ffe4e6" />
            <stop offset="30%" stopColor="#f43f5e" />
            <stop offset="70%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>

          <radialGradient id="jadeBead3D" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#ecfdf5" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="75%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>

          <radialGradient id="lapisBead3D" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="35%" stopColor="#3b82f6" />
            <stop offset="75%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </radialGradient>

          {/* Natural soft shadow */}
          <filter id="stringShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* The Hanging Rope / Cord / Chain */}
        {renderRope(
          anchorX,
          mountEyeletY,
          targetX,
          targetY,
          curveControlX,
          curveControlY,
          appearance.ropeStyle,
          appearance.ropeColor || charm.cordColor,
          appearance.ropeThickness,
          physicsState.ropeLength,
          physicsState.angle,
          physicsState.angularVelocity
        )}

        {/* Render Beads strung along the cord curve */}
        {renderBeads(
          anchorX,
          mountEyeletY,
          targetX,
          targetY,
          curveControlX,
          curveControlY,
          charm.beads || []
        )}

        {/* Top Edge Sliding Attachment Mount / Bezel Notch Clamp */}
        <g
          className="cursor-ew-resize pointer-events-auto"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title="Top Screen Mount: Drag left/right along the top bezel to reposition"
        >
          {/* Anodized Bezel Clamp body */}
          <rect
            x={anchorX - 11}
            y={0}
            width={22}
            height={6.5}
            rx={2.5}
            fill="url(#bezelClampGrad)"
            stroke="#27272a"
            strokeWidth="0.8"
            filter="url(#stringShadow)"
          />
          {/* Tactile micro-grip grooves */}
          <line x1={anchorX - 3.5} y1={1.5} x2={anchorX - 3.5} y2={5} stroke="#71717a" strokeWidth="0.8" />
          <line x1={anchorX} y1={1.5} x2={anchorX} y2={5} stroke="#71717a" strokeWidth="0.8" />
          <line x1={anchorX + 3.5} y1={1.5} x2={anchorX + 3.5} y2={5} stroke="#71717a" strokeWidth="0.8" />

          {/* Jewelry Mounting Loop Eyelet */}
          <circle
            cx={anchorX}
            cy={mountEyeletY}
            r={2.8}
            fill="#09090b"
            stroke="url(#metallicGoldGrad)"
            strokeWidth="1.2"
          />
          <circle cx={anchorX} cy={mountEyeletY} r={1.2} fill="#18181b" />

          {/* Top silk cinch knot / ferrule collar */}
          <ellipse
            cx={anchorX}
            cy={mountEyeletY + 2.2}
            rx={1.8}
            ry={1.2}
            fill="url(#goldBead3D)"
            stroke="#78350f"
            strokeWidth="0.5"
          />
        </g>
      </svg>

      {/* Interactive Charm Element */}
      <div
        id="dangle-charm-bob"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className={`absolute flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow ${
          interactive ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          left: `${charmX}px`,
          top: `${charmY}px`,
          transform: 'translate(-50%, 0)', // origin at top center where loop attaches
          touchAction: 'none',
        }}
        title={`${charm.name}: Drag to swing, tap to perform ritual (${charm.ritualText})`}
      >
        <CharmRenderer
          charm={charm}
          angle={physicsState.angle}
          size={appearance.charmSize}
          appearance={appearance}
          ritualState={ritualState}
          onRitualTrigger={onRitualTrigger}
        />
      </div>
    </div>
  );
};

function renderBeads(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  beads: Array<{ type: string; color?: string; radius: number; offset: number; imageUrl?: string; emoji?: string }>
) {
  if (!beads || beads.length === 0) return null;

  const totalDist = Math.hypot(x2 - x1, y2 - y1);
  if (totalDist <= 1) return null;

  return (
    <g filter="url(#stringShadow)">
      {beads.map((bead, idx) => {
        // Parameter t along quadratic Bezier curve
        const t = Math.min(0.85, Math.max(0.15, bead.offset / totalDist));
        const oneMinusT = 1 - t;

        // Quadratic Bezier evaluation: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const bx = oneMinusT * oneMinusT * x1 + 2 * oneMinusT * t * cx + t * t * x2;
        const by = oneMinusT * oneMinusT * y1 + 2 * oneMinusT * t * cy + t * t * y2;

        // Derivative / Tangent vector at t
        const tx = 2 * oneMinusT * (cx - x1) + 2 * t * (x2 - cx);
        const ty = 2 * oneMinusT * (cy - y1) + 2 * t * (y2 - cy);
        const tangentAngleDeg = (Math.atan2(ty, tx) * 180) / Math.PI;

        const normalLen = Math.hypot(tx, ty) || 1;
        const nx = -ty / normalLen;
        const ny = tx / normalLen;

        if (bead.imageUrl) {
          return (
            <g
              key={idx}
              transform={`translate(${bx - bead.radius}, ${by - bead.radius}) rotate(${
                tangentAngleDeg - 90
              } ${bead.radius} ${bead.radius})`}
            >
              <image
                href={bead.imageUrl}
                width={bead.radius * 2}
                height={bead.radius * 2}
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          );
        }

        if (bead.emoji) {
          return (
            <text
              key={idx}
              x={bx}
              y={by}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={bead.radius * 2}
              transform={`rotate(${tangentAngleDeg - 90} ${bx} ${by})`}
            >
              {bead.emoji}
            </text>
          );
        }

        // Tiny jewelry spacer rings before and after bead along cord
        const spacerOffset = bead.radius + 1.2;
        const spacer1X = bx - (tx / normalLen) * spacerOffset;
        const spacer1Y = by - (ty / normalLen) * spacerOffset;
        const spacer2X = bx + (tx / normalLen) * spacerOffset;
        const spacer2Y = by + (ty / normalLen) * spacerOffset;

        return (
          <g key={idx}>
            {/* Spacer crimp ring 1 */}
            <line
              x1={spacer1X - nx * 2}
              y1={spacer1Y - ny * 2}
              x2={spacer1X + nx * 2}
              y2={spacer1Y + ny * 2}
              stroke="url(#metallicGoldGrad)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Spacer crimp ring 2 */}
            <line
              x1={spacer2X - nx * 2}
              y1={spacer2Y - ny * 2}
              x2={spacer2X + nx * 2}
              y2={spacer2Y + ny * 2}
              stroke="url(#metallicGoldGrad)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Bead Sphere */}
            {bead.type === 'eye' ? (
              // Nazar protection glass bead
              <g>
                <circle cx={bx} cy={by} r={bead.radius} fill="url(#lapisBead3D)" stroke="#0f172a" strokeWidth="0.8" />
                <circle cx={bx} cy={by} r={bead.radius * 0.72} fill="#67e8f9" />
                <circle cx={bx} cy={by} r={bead.radius * 0.46} fill="#ffffff" />
                <circle cx={bx} cy={by} r={bead.radius * 0.24} fill="#09090b" />
                {/* Specular pinpoint highlight */}
                <circle cx={bx - bead.radius * 0.3} cy={by - bead.radius * 0.3} r={bead.radius * 0.2} fill="rgba(255,255,255,0.8)" />
              </g>
            ) : bead.type === 'striped' ? (
              // Carved carnelian bead
              <g>
                <circle cx={bx} cy={by} r={bead.radius} fill="url(#rubyBead3D)" stroke="#4c0519" strokeWidth="0.8" />
                <line
                  x1={bx - nx * (bead.radius * 0.8)}
                  y1={by - ny * (bead.radius * 0.8)}
                  x2={bx + nx * (bead.radius * 0.8)}
                  y2={by + ny * (bead.radius * 0.8)}
                  stroke="#fef08a"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
            ) : (
              // 24K Gilded jewelry bead
              <g>
                <circle cx={bx} cy={by} r={bead.radius} fill="url(#goldBead3D)" stroke="#78350f" strokeWidth="0.7" />
                {/* Secondary specular reflection */}
                <circle
                  cx={bx - bead.radius * 0.32}
                  cy={by - bead.radius * 0.32}
                  r={bead.radius * 0.32}
                  fill="rgba(255,255,255,0.4)"
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

function renderRope(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  style: RopeStyleKey,
  color: string,
  thickness: number,
  length: number,
  angleRad: number,
  angularVel: number
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const chordDist = Math.hypot(dx, dy);
  if (chordDist < 1) return null;

  const curvePath = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;

  // Normal vector at the midpoint
  const midTx = 2 * 0.5 * (cx - x1) + 2 * 0.5 * (x2 - cx);
  const midTy = 2 * 0.5 * (cy - y1) + 2 * 0.5 * (y2 - cy);
  const midLen = Math.hypot(midTx, midTy) || 1;
  const nx = -midTy / midLen;
  const ny = midTx / midLen;

  // 1. CHAIN: Fine Jewelry Rolo / Curb Chain with alternating 3D links
  if (style === 'chain') {
    const linkLength = 6.8;
    const numLinks = Math.max(4, Math.floor(chordDist / linkLength));
    const isGold = !color.toLowerCase().includes('cbd5e1') && !color.toLowerCase().includes('silver');

    return (
      <g filter="url(#stringShadow)">
        {/* Continuous underlying link core */}
        <path
          d={curvePath}
          stroke={isGold ? '#b45309' : '#475569'}
          strokeWidth={Math.max(1.2, thickness * 0.8)}
          fill="none"
          strokeOpacity={0.7}
        />
        {Array.from({ length: numLinks }).map((_, i) => {
          const t = (i + 0.5) / numLinks;
          const oneMinusT = 1 - t;
          const lx = oneMinusT * oneMinusT * x1 + 2 * oneMinusT * t * cx + t * t * x2;
          const ly = oneMinusT * oneMinusT * y1 + 2 * oneMinusT * t * cy + t * t * y2;

          const tx = 2 * oneMinusT * (cx - x1) + 2 * t * (x2 - cx);
          const ty = 2 * oneMinusT * (cy - y1) + 2 * t * (y2 - cy);
          const angleDeg = (Math.atan2(ty, tx) * 180) / Math.PI;

          const isFront = i % 2 === 0;

          if (isFront) {
            // Front-facing open oval jewelry link
            return (
              <g key={i} transform={`rotate(${angleDeg} ${lx} ${ly})`}>
                <ellipse
                  cx={lx}
                  cy={ly}
                  rx={3.6 * (thickness / 2)}
                  ry={2.1 * (thickness / 2)}
                  fill="none"
                  stroke={isGold ? 'url(#metallicGoldGrad)' : 'url(#metallicSilverGrad)'}
                  strokeWidth={Math.max(1.1, thickness * 0.55)}
                />
              </g>
            );
          }

          // Edge-on connecting link with high specular shine
          return (
            <g key={i} transform={`rotate(${angleDeg} ${lx} ${ly})`}>
              <line
                x1={lx}
                y1={ly - 2.8 * (thickness / 2)}
                x2={lx}
                y2={ly + 2.8 * (thickness / 2)}
                stroke={isGold ? 'url(#metallicGoldGrad)' : 'url(#metallicSilverGrad)'}
                strokeWidth={Math.max(1.6, thickness * 0.75)}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Bottom jewelry lobster/spring connector collar */}
        <circle cx={x2} cy={y2} r={2.2} fill={isGold ? 'url(#metallicGoldGrad)' : 'url(#metallicSilverGrad)'} />
      </g>
    );
  }

  // 2. RIBBON: Lustrous Satin Talisman Ribbon
  if (style === 'ribbon') {
    const ribbonWidth = Math.max(3.5, thickness * 2.2);
    return (
      <g filter="url(#stringShadow)">
        {/* Soft shadow */}
        <path d={curvePath} stroke="rgba(0,0,0,0.35)" strokeWidth={ribbonWidth + 2} fill="none" strokeLinecap="square" />
        {/* Main satin ribbon band */}
        <path d={curvePath} stroke={color} strokeWidth={ribbonWidth} fill="none" strokeLinecap="square" />
        {/* Center longitudinal silk sheen highlight */}
        <path
          d={curvePath}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={ribbonWidth * 0.35}
          fill="none"
          strokeLinecap="square"
        />
        {/* Bottom metal ribbon clamp crimp */}
        <line
          x1={x2 - nx * (ribbonWidth * 0.7)}
          y1={y2 - ny * (ribbonWidth * 0.7)}
          x2={x2 + nx * (ribbonWidth * 0.7)}
          y2={y2 + ny * (ribbonWidth * 0.7)}
          stroke="url(#metallicGoldGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    );
  }

  // 3. DOUBLE LOOP: Classic Japanese Netsuke / Omamori Twin Filament Strap
  if (style === 'double_loop') {
    const strandSeparation = 1.3 * (thickness / 2);
    const strandWidth = Math.max(1.1, thickness * 0.5);

    // Left strand points & right strand points
    const leftCurve = `M ${(x1 - nx * strandSeparation).toFixed(1)} ${(y1 - ny * strandSeparation).toFixed(1)} Q ${(
      cx -
      nx * strandSeparation
    ).toFixed(1)} ${(cy - ny * strandSeparation).toFixed(1)} ${(x2 - nx * strandSeparation).toFixed(1)} ${(
      y2 -
      ny * strandSeparation
    ).toFixed(1)}`;

    const rightCurve = `M ${(x1 + nx * strandSeparation).toFixed(1)} ${(y1 + ny * strandSeparation).toFixed(1)} Q ${(
      cx +
      nx * strandSeparation
    ).toFixed(1)} ${(cy + ny * strandSeparation).toFixed(1)} ${(x2 + nx * strandSeparation).toFixed(1)} ${(
      y2 +
      ny * strandSeparation
    ).toFixed(1)}`;

    // Slide collar beads holding twin filaments together
    const tCollar = 0.22;
    const clx = (1 - tCollar) * (1 - tCollar) * x1 + 2 * (1 - tCollar) * tCollar * cx + tCollar * tCollar * x2;
    const cly = (1 - tCollar) * (1 - tCollar) * y1 + 2 * (1 - tCollar) * tCollar * cy + tCollar * tCollar * y2;

    return (
      <g filter="url(#stringShadow)">
        {/* Left silk filament */}
        <path d={leftCurve} stroke={color} strokeWidth={strandWidth} fill="none" strokeLinecap="round" />
        <path
          d={leftCurve}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={Math.max(0.6, strandWidth * 0.4)}
          fill="none"
          strokeLinecap="round"
        />

        {/* Right silk filament */}
        <path d={rightCurve} stroke={color} strokeWidth={strandWidth} fill="none" strokeLinecap="round" />
        <path
          d={rightCurve}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={Math.max(0.6, strandWidth * 0.4)}
          fill="none"
          strokeLinecap="round"
        />

        {/* Sliding bead clamp holding the double cord */}
        <circle cx={clx} cy={cly} r={2.4} fill="url(#goldBead3D)" stroke="#78350f" strokeWidth="0.6" />

        {/* Bottom loop closure knot */}
        <ellipse cx={x2} cy={y2 - 1.5} rx={2.2} ry={1.6} fill="url(#goldBead3D)" stroke="#78350f" strokeWidth="0.6" />
      </g>
    );
  }

  // 4. TWISTED: Artisan Gilded / Silk Helical Twisted Cord
  if (style === 'twisted') {
    const numTurns = Math.max(6, Math.floor(chordDist / 6.5));
    const samples = numTurns * 6;
    const strandA: string[] = [];
    const strandB: string[] = [];

    for (let s = 0; s <= samples; s++) {
      const t = s / samples;
      const oneMinusT = 1 - t;
      const px = oneMinusT * oneMinusT * x1 + 2 * oneMinusT * t * cx + t * t * x2;
      const py = oneMinusT * oneMinusT * y1 + 2 * oneMinusT * t * cy + t * t * y2;

      const tx = 2 * oneMinusT * (cx - x1) + 2 * t * (x2 - cx);
      const ty = 2 * oneMinusT * (cy - y1) + 2 * t * (y2 - cy);
      const len = Math.hypot(tx, ty) || 1;
      const snx = -ty / len;
      const sny = tx / len;

      const phase = (s / samples) * Math.PI * 2 * numTurns;
      const sinVal = Math.sin(phase);
      const amp = thickness * 0.48;

      const ax = px + snx * (sinVal * amp);
      const ay = py + sny * (sinVal * amp);
      const bx = px - snx * (sinVal * amp);
      const by = py - sny * (sinVal * amp);

      strandA.push(`${s === 0 ? 'M' : 'L'} ${ax.toFixed(1)} ${ay.toFixed(1)}`);
      strandB.push(`${s === 0 ? 'M' : 'L'} ${bx.toFixed(1)} ${by.toFixed(1)}`);
    }

    return (
      <g filter="url(#stringShadow)">
        {/* Deep ambient shadow */}
        <path d={curvePath} stroke="rgba(0,0,0,0.4)" strokeWidth={thickness + 2} fill="none" strokeLinecap="round" />

        {/* Central depth shadow core */}
        <path d={curvePath} stroke="rgba(0,0,0,0.5)" strokeWidth={thickness * 0.7} fill="none" strokeLinecap="round" />

        {/* Helical Strand 1 */}
        <path
          d={strandA.join(' ')}
          stroke={color}
          strokeWidth={Math.max(1.2, thickness * 0.7)}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={strandA.join(' ')}
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={Math.max(0.6, thickness * 0.3)}
          fill="none"
          strokeLinecap="round"
        />

        {/* Helical Strand 2 with deeper tone */}
        <path
          d={strandB.join(' ')}
          stroke={color}
          strokeWidth={Math.max(1.2, thickness * 0.7)}
          strokeOpacity={0.88}
          fill="none"
          strokeLinecap="round"
        />

        {/* Bottom metal ferrule crimp */}
        <ellipse cx={x2} cy={y2 - 1.5} rx={2.4} ry={1.8} fill="url(#goldBead3D)" stroke="#78350f" strokeWidth="0.6" />
      </g>
    );
  }

  // 5. BRAIDED (Default): Authentic Japanese Kumihimo Silk Weave
  // Delicate herringbone chevron micro-stitches with silk sheen & end ferrules
  const numStitches = Math.max(8, Math.floor(chordDist / 3.8));
  const stitches: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  for (let i = 1; i < numStitches; i++) {
    const t = i / numStitches;
    const oneMinusT = 1 - t;
    const px = oneMinusT * oneMinusT * x1 + 2 * oneMinusT * t * cx + t * t * x2;
    const py = oneMinusT * oneMinusT * y1 + 2 * oneMinusT * t * cy + t * t * y2;

    const tx = 2 * oneMinusT * (cx - x1) + 2 * t * (x2 - cx);
    const ty = 2 * oneMinusT * (cy - y1) + 2 * t * (y2 - cy);
    const len = Math.hypot(tx, ty) || 1;
    const snx = -ty / len;
    const sny = tx / len;
    const stx = tx / len;
    const sty = ty / len;

    // Alternating chevron tilt (+/- 35 degrees)
    const s = i % 2 === 0 ? 1 : -1;
    const stitchRadius = thickness * 0.52;
    const lead = 1.3 * s;

    stitches.push({
      x1: px - snx * stitchRadius - stx * lead,
      y1: py - sny * stitchRadius - sty * lead,
      x2: px + snx * stitchRadius + stx * lead,
      y2: py + sny * stitchRadius + sty * lead,
    });
  }

  return (
    <g filter="url(#stringShadow)">
      {/* Soft ambient ground shadow */}
      <path d={curvePath} stroke="rgba(0,0,0,0.35)" strokeWidth={thickness + 2.4} fill="none" strokeLinecap="round" />

      {/* Main silk cord body */}
      <path d={curvePath} stroke={color} strokeWidth={thickness} fill="none" strokeLinecap="round" />

      {/* 3D cylindrical core depth */}
      <path
        d={curvePath}
        stroke="rgba(0,0,0,0.28)"
        strokeWidth={Math.max(0.8, thickness * 0.42)}
        fill="none"
        strokeLinecap="round"
      />

      {/* Woven diagonal silk braid stitches with specular sheen */}
      {stitches.map((st, idx) => (
        <g key={idx}>
          {/* Subtle stitch shadow */}
          <line
            x1={st.x1}
            y1={st.y1 + 0.4}
            x2={st.x2}
            y2={st.y2 + 0.4}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth={Math.max(0.6, thickness * 0.3)}
            strokeLinecap="round"
          />
          {/* Specular silk sheen highlight */}
          <line
            x1={st.x1}
            y1={st.y1}
            x2={st.x2}
            y2={st.y2}
            stroke="rgba(255,255,255,0.48)"
            strokeWidth={Math.max(0.7, thickness * 0.35)}
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Bottom ornamental silk wrap knot and polished crimp collar */}
      <ellipse cx={x2} cy={y2 - 2} rx={2.2} ry={1.6} fill="url(#goldBead3D)" stroke="#78350f" strokeWidth="0.6" />
      <circle cx={x2} cy={y2} r={1.3} fill={color} />
    </g>
  );
}
