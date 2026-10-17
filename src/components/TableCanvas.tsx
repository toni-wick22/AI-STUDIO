import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Ball,
  Pocket,
  VisualSettings,
  GeometryCalculation,
  ShotType,
  Vector2D,
} from '../types';
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  CUSHION_WIDTH,
  BALL_RADIUS,
  POCKET_RADIUS,
  PLAYABLE_BOUNDS,
  STANDARD_POCKETS,
  clampToTable,
  vecDist,
} from '../utils/geometryEngine';
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  Move,
  Maximize2,
  Crosshair,
} from 'lucide-react';

interface TableCanvasProps {
  balls: Ball[];
  setBalls: React.Dispatch<React.SetStateAction<Ball[]>>;
  cueBallId: number;
  setCueBallId: (id: number) => void;
  targetBallId: number;
  setTargetBallId: (id: number) => void;
  selectedPocketId: string;
  setSelectedPocketId: (id: string) => void;
  calculation: GeometryCalculation | null;
  settings: VisualSettings;
  shotType: ShotType;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
}

// Authentic Pool Ball Color Palette
export const BALL_COLORS: Record<number, { bg: string; text: string; isStripe?: boolean }> = {
  0: { bg: '#ffffff', text: '#111827' }, // Cue ball (White)
  1: { bg: '#facc15', text: '#713f12' }, // 1 Yellow
  2: { bg: '#2563eb', text: '#ffffff' }, // 2 Blue
  3: { bg: '#dc2626', text: '#ffffff' }, // 3 Red
  4: { bg: '#7c3aed', text: '#ffffff' }, // 4 Purple
  5: { bg: '#ea580c', text: '#ffffff' }, // 5 Orange
  6: { bg: '#16a34a', text: '#ffffff' }, // 6 Green
  7: { bg: '#831843', text: '#ffffff' }, // 7 Maroon
  8: { bg: '#18181b', text: '#ffffff' }, // 8 Black
  9: { bg: '#facc15', text: '#713f12', isStripe: true },
  10: { bg: '#2563eb', text: '#ffffff', isStripe: true },
  11: { bg: '#dc2626', text: '#ffffff', isStripe: true },
  12: { bg: '#7c3aed', text: '#ffffff', isStripe: true },
  13: { bg: '#ea580c', text: '#ffffff', isStripe: true },
  14: { bg: '#16a34a', text: '#ffffff', isStripe: true },
  15: { bg: '#831843', text: '#ffffff', isStripe: true },
};

// Cloth themes
const CLOTH_THEMES = {
  'classic-green': {
    cloth: '#166534',
    cushion: '#14532d',
    shadow: '#052e16',
    headstring: 'rgba(255,255,255,0.15)',
  },
  'tournament-blue': {
    cloth: '#1d4ed8',
    cushion: '#1e40af',
    shadow: '#172554',
    headstring: 'rgba(255,255,255,0.2)',
  },
  'charcoal-grey': {
    cloth: '#334155',
    cushion: '#1e293b',
    shadow: '#0f172a',
    headstring: 'rgba(255,255,255,0.15)',
  },
  'burgundy-red': {
    cloth: '#831843',
    cushion: '#500724',
    shadow: '#340316',
    headstring: 'rgba(255,255,255,0.15)',
  },
};

export const TableCanvas: React.FC<TableCanvasProps> = ({
  balls,
  setBalls,
  cueBallId,
  setCueBallId,
  targetBallId,
  setTargetBallId,
  selectedPocketId,
  setSelectedPocketId,
  calculation,
  settings,
  shotType,
  isSimulating,
  setIsSimulating,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingBallId, setDraggingBallId] = useState<number | null>(null);
  const [selectedBallId, setSelectedBallId] = useState<number | null>(null);
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [initialBallPositions, setInitialBallPositions] = useState<Ball[] | null>(null);

  const clothTheme = CLOTH_THEMES[settings.tableClothColor] || CLOTH_THEMES['classic-green'];

  // Convert client pointer coordinates to SVG 1000x500 coordinates
  const getTableCoordinates = useCallback((clientX: number, clientY: number): Vector2D | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = TABLE_WIDTH / rect.width;
    const scaleY = TABLE_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Pointer drag handling for moving balls
  const handlePointerDown = (e: React.PointerEvent, ballId: number) => {
    e.stopPropagation();
    if (isSimulating) return;
    setDraggingBallId(ballId);
    setSelectedBallId(ballId);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingBallId === null || isSimulating) return;
    const coords = getTableCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    const clamped = clampToTable(coords, BALL_RADIUS);
    setBalls((prev) =>
      prev.map((b) => (b.id === draggingBallId ? { ...b, x: clamped.x, y: clamped.y } : b))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingBallId !== null) {
      setDraggingBallId(null);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
  };

  // Add ball
  const handleAddBall = () => {
    const existingIds = new Set(balls.map((b) => b.id));
    let nextId = 1;
    while (nextId <= 15 && existingIds.has(nextId)) {
      nextId++;
    }
    if (nextId > 15) return;

    // Place near center with slight random offset
    const newBall: Ball = {
      id: nextId,
      x: 500 + (Math.random() * 80 - 40),
      y: 250 + (Math.random() * 80 - 40),
    };
    setBalls((prev) => [...prev, newBall]);
    setSelectedBallId(nextId);
  };

  // Delete selected ball (never allow deleting cue ball)
  const handleDeleteBall = (id: number) => {
    if (id === cueBallId) return;
    setBalls((prev) => prev.filter((b) => b.id !== id));
    if (selectedBallId === id) setSelectedBallId(null);
    if (targetBallId === id) {
      const remaining = balls.filter((b) => b.id !== id && b.id !== cueBallId);
      if (remaining.length > 0) {
        setTargetBallId(remaining[0].id);
      }
    }
  };

  // Shot simulation animation loop
  const triggerSimulation = () => {
    if (isSimulating || !calculation) return;
    setInitialBallPositions(JSON.parse(JSON.stringify(balls)));
    setIsSimulating(true);
    setAnimProgress(0);

    const startTime = performance.now();
    const duration = 1800; // 1.8 seconds

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSimulating(false);
      }
    };
    requestAnimationFrame(animate);
  };

  const resetSimulation = () => {
    if (initialBallPositions) {
      setBalls(initialBallPositions);
      setInitialBallPositions(null);
    }
    setIsSimulating(false);
    setAnimProgress(0);
  };

  // Compute animated ball positions during simulation
  const animatedCuePos: Vector2D = calculation ? calculation.cuePos : { x: 250, y: 250 };
  const animatedTargetPos: Vector2D = calculation ? calculation.targetPos : { x: 600, y: 250 };

  if (isSimulating && calculation) {
    // Stage 1: Cue travels to Ghost ball (0.0 -> 0.45)
    // Stage 2: Cue deflects along Tangent line; Target rolls toward Pocket (0.45 -> 1.0)
    if (animProgress <= 0.45) {
      const p = animProgress / 0.45;
      animatedCuePos.x = calculation.cuePos.x + (calculation.ghostBallPos.x - calculation.cuePos.x) * p;
      animatedCuePos.y = calculation.cuePos.y + (calculation.ghostBallPos.y - calculation.cuePos.y) * p;
    } else {
      const p = (animProgress - 0.45) / 0.55;
      // Cue ball along tangent line
      animatedCuePos.x = calculation.ghostBallPos.x + (calculation.tangentEnd.x - calculation.ghostBallPos.x) * (p * 0.75);
      animatedCuePos.y = calculation.ghostBallPos.y + (calculation.tangentEnd.y - calculation.ghostBallPos.y) * (p * 0.75);

      // Target ball towards pocket or cushion
      const dest = calculation.cushionBouncePoints?.[0] || calculation.targetPocket;
      animatedTargetPos.x = calculation.targetPos.x + (dest.x - calculation.targetPos.x) * p;
      animatedTargetPos.y = calculation.targetPos.y + (dest.y - calculation.targetPos.y) * p;
    }
  }

  // Diamonds along rails (Regulation 8 equal divisions on long rails, 4 on short rails)
  const diamonds = [
    // Top rail diamonds (x from 1/8 to 7/8)
    ...[1, 2, 3, 5, 6, 7].map((i) => ({ x: (TABLE_WIDTH * i) / 8, y: 18 })),
    // Bottom rail diamonds
    ...[1, 2, 3, 5, 6, 7].map((i) => ({ x: (TABLE_WIDTH * i) / 8, y: TABLE_HEIGHT - 18 })),
    // Left rail diamonds (y from 1/4 to 3/4)
    ...[1, 2, 3].map((i) => ({ x: 18, y: (TABLE_HEIGHT * i) / 4 })),
    // Right rail diamonds
    ...[1, 2, 3].map((i) => ({ x: TABLE_WIDTH - 18, y: (TABLE_HEIGHT * i) / 4 })),
  ];

  return (
    <div className="flex flex-col w-full bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-800">
      {/* Top Table Bar: Quick Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Top-Down Regulation 2:1 Table
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Drag any ball to reposition • Click pocket to target
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddBall}
            disabled={balls.length >= 16 || isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition disabled:opacity-40"
            title="Add ball to table"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Add Ball
          </button>

          {selectedBallId !== null && selectedBallId !== cueBallId && (
            <button
              onClick={() => handleDeleteBall(selectedBallId)}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 border border-rose-800/50 transition"
              title="Delete selected ball"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove #{selectedBallId}
            </button>
          )}

          <button
            onClick={isSimulating ? resetSimulation : triggerSimulation}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-lg ${
              isSimulating
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
            }`}
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Shot
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Simulate Shot
              </>
            )}
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-inner select-none cursor-crosshair touch-none"
      >
        <svg
          viewBox={`0 0 ${TABLE_WIDTH} ${TABLE_HEIGHT}`}
          className="w-full h-full block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <defs>
            {/* Table Wood Border Gradient */}
            <linearGradient id="railWood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#290e02" />
            </linearGradient>

            {/* Cloth Drop Shadow */}
            <filter id="cushionShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.65" />
            </filter>

            {/* Ball 3D Lighting Filter */}
            <radialGradient id="sphereShade" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
            </radialGradient>

            {/* Ghost Ball Hologram Gradient */}
            <radialGradient id="ghostShade" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </radialGradient>

            {/* Marker Arrowheads */}
            <marker
              id="arrowWhite"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={settings.aimLineColor} />
            </marker>
            <marker
              id="arrowYellow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={settings.targetLineColor} />
            </marker>
            <marker
              id="arrowRed"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={settings.blockedLineColor} />
            </marker>
            <marker
              id="arrowCyan"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={settings.tangentLineColor} />
            </marker>
          </defs>

          {/* 1. Outer Mahogany Rail Border */}
          <rect x="0" y="0" width={TABLE_WIDTH} height={TABLE_HEIGHT} rx="24" fill="url(#railWood)" />

          {/* 2. Diamond Sights (Pearl Inlays) */}
          {settings.showDiamondGrid &&
            diamonds.map((d, idx) => (
              <circle
                key={`diamond-${idx}`}
                cx={d.x}
                cy={d.y}
                r="3.5"
                fill="#f8fafc"
                stroke="#475569"
                strokeWidth="1"
                className="opacity-90"
              />
            ))}

          {/* 3. Cushion Sub-Border */}
          <rect
            x={CUSHION_WIDTH - 6}
            y={CUSHION_WIDTH - 6}
            width={TABLE_WIDTH - 2 * (CUSHION_WIDTH - 6)}
            height={TABLE_HEIGHT - 2 * (CUSHION_WIDTH - 6)}
            rx="8"
            fill={clothTheme.cushion}
          />

          {/* 4. Playable Cloth Area */}
          <rect
            x={PLAYABLE_BOUNDS.minX}
            y={PLAYABLE_BOUNDS.minY}
            width={PLAYABLE_BOUNDS.maxX - PLAYABLE_BOUNDS.minX}
            height={PLAYABLE_BOUNDS.maxY - PLAYABLE_BOUNDS.minY}
            fill={clothTheme.cloth}
            filter="url(#cushionShadow)"
          />

          {/* 5. Head String & Foot Spot Marker Lines */}
          <line
            x1={TABLE_WIDTH * 0.25}
            y1={PLAYABLE_BOUNDS.minY}
            x2={TABLE_WIDTH * 0.25}
            y2={PLAYABLE_BOUNDS.maxY}
            stroke={clothTheme.headstring}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Head Spot */}
          <circle cx={TABLE_WIDTH * 0.25} cy={TABLE_HEIGHT * 0.5} r="3" fill="rgba(255,255,255,0.3)" />
          {/* Foot Spot */}
          <circle cx={TABLE_WIDTH * 0.75} cy={TABLE_HEIGHT * 0.5} r="3" fill="rgba(255,255,255,0.4)" />
          {/* Center Spot */}
          <circle cx={TABLE_WIDTH * 0.5} cy={TABLE_HEIGHT * 0.5} r="3" fill="rgba(255,255,255,0.25)" />

          {/* 6. Geometric Learning Lines */}
          {calculation && (
            <g id="geometry-overlays">
              {/* Extended Aiming Line */}
              {settings.showExtendedAim && (
                <line
                  x1={calculation.ghostBallPos.x}
                  y1={calculation.ghostBallPos.y}
                  x2={calculation.extendedAimEnd.x}
                  y2={calculation.extendedAimEnd.y}
                  stroke={settings.aimLineColor}
                  strokeWidth={settings.lineThickness * 0.75}
                  strokeDasharray="6 6"
                  opacity="0.45"
                />
              )}

              {/* Tangent Line (90° Stun Rule) */}
              {(settings.showTangentLine || settings.threeLineMode) && (
                <g>
                  <line
                    x1={calculation.ghostBallPos.x}
                    y1={calculation.ghostBallPos.y}
                    x2={calculation.tangentEnd.x}
                    y2={calculation.tangentEnd.y}
                    stroke={settings.tangentLineColor}
                    strokeWidth={settings.lineThickness}
                    strokeDasharray="5 4"
                    markerEnd="url(#arrowCyan)"
                  />
                  <text
                    x={calculation.ghostBallPos.x + calculation.tangentDir.x * 70}
                    y={calculation.ghostBallPos.y + calculation.tangentDir.y * 70}
                    fill={settings.tangentLineColor}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none"
                  >
                    90° STUN
                  </text>
                </g>
              )}

              {/* Rolling Follow Line (30° Rule) */}
              {settings.showFollowLine && !settings.threeLineMode && (
                <line
                  x1={calculation.ghostBallPos.x}
                  y1={calculation.ghostBallPos.y}
                  x2={calculation.followEnd.x}
                  y2={calculation.followEnd.y}
                  stroke={settings.followLineColor}
                  strokeWidth={settings.lineThickness * 0.9}
                  strokeDasharray="4 3"
                />
              )}

              {/* Reflection cushion legs for Bank/Kick */}
              {calculation.reflectionLegs &&
                calculation.reflectionLegs.map((leg, i) => (
                  <line
                    key={`leg-${i}`}
                    x1={leg.from.x}
                    y1={leg.from.y}
                    x2={leg.to.x}
                    y2={leg.to.y}
                    stroke={leg.isBlocked ? settings.blockedLineColor : settings.targetLineColor}
                    strokeWidth={settings.lineThickness}
                    strokeDasharray={i > 0 ? '6 4' : undefined}
                    markerEnd={leg.isBlocked ? 'url(#arrowRed)' : 'url(#arrowYellow)'}
                  />
                ))}

              {/* Direct Aim Line (Cue -> Ghost Ball) */}
              {settings.showAimLine && (
                <line
                  x1={calculation.cuePos.x}
                  y1={calculation.cuePos.y}
                  x2={calculation.ghostBallPos.x}
                  y2={calculation.ghostBallPos.y}
                  stroke={
                    calculation.isBlocked && calculation.blockedSegment === 'cue-to-ghost'
                      ? settings.blockedLineColor
                      : settings.aimLineColor
                  }
                  strokeWidth={settings.lineThickness}
                  markerEnd={
                    calculation.isBlocked && calculation.blockedSegment === 'cue-to-ghost'
                      ? 'url(#arrowRed)'
                      : 'url(#arrowWhite)'
                  }
                />
              )}

              {/* Target Line (Ghost Ball -> Pocket) */}
              {settings.showTargetLine && (!calculation.reflectionLegs || calculation.reflectionLegs.length === 0) && (
                <line
                  x1={calculation.targetPos.x}
                  y1={calculation.targetPos.y}
                  x2={calculation.targetPocket.x}
                  y2={calculation.targetPocket.y}
                  stroke={
                    calculation.isBlocked && calculation.blockedSegment === 'target-to-pocket'
                      ? settings.blockedLineColor
                      : settings.targetLineColor
                  }
                  strokeWidth={settings.lineThickness}
                  markerEnd={
                    calculation.isBlocked && calculation.blockedSegment === 'target-to-pocket'
                      ? 'url(#arrowRed)'
                      : 'url(#arrowYellow)'
                  }
                />
              )}

              {/* Cushion Bounce Point Markers (Diamonds) */}
              {calculation.cushionBouncePoints?.map((bp, i) => (
                <g key={`bp-${i}`}>
                  <polygon
                    points={`${bp.x},${bp.y - 7} ${bp.x + 7},${bp.y} ${bp.x},${bp.y + 7} ${bp.x - 7},${bp.y}`}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <circle cx={bp.x} cy={bp.y} r="2" fill="#ffffff" />
                </g>
              ))}

              {/* Ghost Ball Hologram */}
              {settings.showGhostBall && (
                <g id="ghost-ball-marker">
                  {/* Translucent Sphere */}
                  <circle
                    cx={calculation.ghostBallPos.x}
                    cy={calculation.ghostBallPos.y}
                    r={BALL_RADIUS}
                    fill="url(#ghostShade)"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                  {/* Crosshair */}
                  <line
                    x1={calculation.ghostBallPos.x - 6}
                    y1={calculation.ghostBallPos.y}
                    x2={calculation.ghostBallPos.x + 6}
                    y2={calculation.ghostBallPos.y}
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  <line
                    x1={calculation.ghostBallPos.x}
                    y1={calculation.ghostBallPos.y - 6}
                    x2={calculation.ghostBallPos.x}
                    y2={calculation.ghostBallPos.y + 6}
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  {/* Contact point dot */}
                  <circle
                    cx={(calculation.ghostBallPos.x + calculation.targetPos.x) / 2}
                    cy={(calculation.ghostBallPos.y + calculation.targetPos.y) / 2}
                    r="2.5"
                    fill="#facc15"
                  />
                </g>
              )}

              {/* Obstructed Ball Alert Badge on Canvas */}
              {calculation.isBlocked && calculation.blockedByBallId !== undefined && (
                <g>
                  {(() => {
                    const blk = balls.find((b) => b.id === calculation.blockedByBallId);
                    if (!blk) return null;
                    return (
                      <g>
                        <circle
                          cx={blk.x}
                          cy={blk.y}
                          r={BALL_RADIUS + 7}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          strokeDasharray="4 3"
                          className="animate-spin"
                        />
                        <rect
                          x={blk.x - 28}
                          y={blk.y - 32}
                          width="56"
                          height="18"
                          rx="4"
                          fill="#ef4444"
                        />
                        <text
                          x={blk.x}
                          y={blk.y - 20}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          BLOCKED
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}
            </g>
          )}

          {/* 7. Six Regulation Pockets */}
          {STANDARD_POCKETS.map((pocket) => {
            const isSelected = selectedPocketId === pocket.id;
            return (
              <g
                key={pocket.id}
                onClick={() => setSelectedPocketId(pocket.id)}
                className="cursor-pointer group"
              >
                {/* Pocket Leather Trim */}
                <circle
                  cx={pocket.x}
                  cy={pocket.y}
                  r={pocket.dropRadius + 4}
                  fill="#1c1917"
                  stroke="#44403c"
                  strokeWidth="2"
                />
                {/* Deep Pocket Hole */}
                <circle
                  cx={pocket.x}
                  cy={pocket.y}
                  r={pocket.dropRadius}
                  fill="#000000"
                />

                {/* Target Pocket Pulse Glow */}
                {isSelected && (
                  <circle
                    cx={pocket.x}
                    cy={pocket.y}
                    r={pocket.dropRadius + 8}
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* 8. Render Physical Billiard Balls */}
          {balls.map((ball) => {
            const isCue = ball.id === cueBallId;
            const isTarget = ball.id === targetBallId;
            const isSelected = ball.id === selectedBallId;
            const info = BALL_COLORS[ball.id] || { bg: '#e2e8f0', text: '#0f172a' };

            // Position (use animated position if currently simulating)
            const posX = isSimulating && isCue ? animatedCuePos.x : isSimulating && isTarget ? animatedTargetPos.x : ball.x;
            const posY = isSimulating && isCue ? animatedCuePos.y : isSimulating && isTarget ? animatedTargetPos.y : ball.y;

            return (
              <g
                key={ball.id}
                transform={`translate(${posX}, ${posY})`}
                onPointerDown={(e) => handlePointerDown(e, ball.id)}
                onClick={() => {
                  setSelectedBallId(ball.id);
                  if (!isCue && ball.id !== 0) {
                    setTargetBallId(ball.id);
                  }
                }}
                className="cursor-grab active:cursor-grabbing transition-transform"
              >
                {/* Ball Shadow on Cloth */}
                <ellipse cx="2" cy="4" rx={BALL_RADIUS} ry={BALL_RADIUS * 0.85} fill="rgba(0,0,0,0.4)" />

                {/* Target Ball Golden Halo */}
                {isTarget && (
                  <circle
                    cx="0"
                    cy="0"
                    r={BALL_RADIUS + 5}
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                )}

                {/* Selected Ball Ring */}
                {isSelected && !isTarget && (
                  <circle
                    cx="0"
                    cy="0"
                    r={BALL_RADIUS + 4}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                )}

                {/* Solid Ball Base or Stripe Underlay */}
                <circle cx="0" cy="0" r={BALL_RADIUS} fill={info.isStripe ? '#ffffff' : info.bg} />

                {/* Stripe Band */}
                {info.isStripe && (
                  <rect
                    x={-BALL_RADIUS}
                    y={-BALL_RADIUS * 0.55}
                    width={BALL_RADIUS * 2}
                    height={BALL_RADIUS * 1.1}
                    fill={info.bg}
                    clipPath="url(#ballClip)"
                  />
                )}

                {/* 3D Sphere Specular Lighting */}
                <circle cx="0" cy="0" r={BALL_RADIUS} fill="url(#sphereShade)" />

                {/* Ball Number Plate / Red Cue Dots */}
                {isCue ? (
                  // Measle ball training dots (Pro red cue dots)
                  <g>
                    <circle cx="-5" cy="-5" r="1.8" fill="#dc2626" />
                    <circle cx="5" cy="-4" r="1.8" fill="#dc2626" />
                    <circle cx="2" cy="5" r="1.8" fill="#dc2626" />
                  </g>
                ) : (
                  // Number circle
                  <g>
                    <circle cx="0" cy="0" r="6" fill="#ffffff" />
                    <text
                      x="0"
                      y="3"
                      fill="#111827"
                      fontSize="7"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      {ball.id}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Calibration & Helper Chips */}
        <div className="absolute bottom-2 left-3 flex items-center gap-2 pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800">
            {calculation
              ? `Cut: ${calculation.cutAngleDeg.toFixed(1)}° (${calculation.effectiveFraction})`
              : 'Position Balls to Calculate'}
          </div>
          {calculation?.isBlocked && (
            <div className="bg-rose-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-semibold text-rose-300 border border-rose-800 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Lane Blocked by #{calculation.blockedByBallId}
            </div>
          )}
        </div>

        <div className="absolute top-2 right-3 pointer-events-none">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
            Pocket: {calculation?.targetPocket.name}
          </span>
        </div>
      </div>

      {/* Ball Selector Tray */}
      <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto py-1 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-medium">Quick Target:</span>
          {balls
            .filter((b) => b.id !== cueBallId)
            .map((b) => {
              const isTarget = b.id === targetBallId;
              const info = BALL_COLORS[b.id] || { bg: '#e2e8f0', text: '#000' };
              return (
                <button
                  key={b.id}
                  onClick={() => setTargetBallId(b.id)}
                  style={{ backgroundColor: info.bg, color: info.text }}
                  className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition shadow ${
                    isTarget ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {b.id}
                </button>
              );
            })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-medium">Pocket:</span>
          <select
            value={selectedPocketId}
            onChange={(e) => setSelectedPocketId(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {STANDARD_POCKETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
