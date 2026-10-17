import React from 'react';
import { GeometryCalculation, ShotType } from '../types';
import {
  Compass,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Ruler,
  Info,
  Layers,
  ShieldAlert,
} from 'lucide-react';

interface GeometryHUDProps {
  calc: GeometryCalculation | null;
  shotType: ShotType;
}

export const GeometryHUD: React.FC<GeometryHUDProps> = ({ calc, shotType }) => {
  if (!calc) return null;

  // Visual Difficulty color coding
  const getDifficultyBadge = (diff: GeometryCalculation['difficulty']) => {
    switch (diff) {
      case 'Straight':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Easy':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Challenging':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Extreme Cut':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  // Mini Ball Overlap SVG Graphic for Ball Fraction
  // Angle determines lateral offset of Cue Ball center relative to Target Ball center
  // Offset in ball radius units = sin(cutAngle) * 2 * R
  const rad = (calc.cutAngleDeg * Math.PI) / 180;
  const overlapOffsetX = Math.min(32, Math.sin(rad) * 28);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Live Shot Geometry</h3>
            <p className="text-[11px] text-slate-400 capitalize">
              {shotType.replace('_', ' ')} Mode • {calc.targetPocket.name}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyBadge(
            calc.difficulty
          )}`}
        >
          {calc.difficulty}
        </span>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Cut Angle */}
        <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Cut Angle
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {calc.cutAngleDeg.toFixed(1)}°
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Deviation from center</span>
        </div>

        {/* Metric 2: Effective Fraction */}
        <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Ball Overlap
          </span>
          <div className="mt-1">
            <span className="text-sm font-black text-amber-400 truncate block">
              {calc.effectiveFraction}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Aim fraction</span>
        </div>

        {/* Metric 3: Shot Distance */}
        <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5 text-sky-400" />
            Cue Travel
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {calc.shotDistanceTableUnits}
            </span>
            <span className="text-xs text-slate-400 font-mono">units</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">To Ghost Contact</span>
        </div>

        {/* Metric 4: Pocket Window Margin */}
        <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            Margin of Error
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-purple-300 font-mono">
              ±{(calc.marginOfErrorDeg / 2).toFixed(1)}°
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Pocket opening window</span>
        </div>
      </div>

      {/* Visual Ball Fraction Overlap View */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Mini 2D Overlap Diagram */}
          <div className="w-24 h-16 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-2">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              {/* Target Ball (Yellow) */}
              <circle cx="50" cy="25" r="16" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
              <text x="50" y="28" fill="#713f12" fontSize="9" fontWeight="bold" textAnchor="middle">
                T
              </text>

              {/* Incoming Cue Ball (White/Translucent) offset by overlap */}
              <circle
                cx={50 - overlapOffsetX}
                cy="25"
                r="16"
                fill="rgba(255,255,255,0.7)"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle cx={50 - overlapOffsetX} cy="25" r="2" fill="#ef4444" />
            </svg>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200">
              Sight Line: Aim Cue Center at {calc.effectiveFraction}
            </h4>
            <p className="text-[11px] text-slate-400 max-w-sm">
              {calc.cutAngleDeg <= 5
                ? 'Dead-center hit. Cue ball will stop dead (stun) or follow directly forward.'
                : calc.cutAngleDeg <= 35
                ? 'Align cue ball edge near target center. Expect a sharp 90° stun deflection.'
                : 'Thin cut requiring delicate cue speed to avoid throw or missing the pocket.'}
            </p>
          </div>
        </div>

        {/* Tangent Rule Reminder */}
        <div className="px-3 py-2 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-right">
          <span className="text-[10px] font-semibold text-cyan-300 uppercase tracking-wider block">
            Stun Tangent Rule
          </span>
          <span className="text-xs font-mono font-bold text-cyan-200">
            Cue Deflects at 90°
          </span>
        </div>
      </div>

      {/* Obstruction Warning or Clear Status */}
      {calc.isBlocked ? (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-3 flex items-center justify-between gap-3 text-rose-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-bold">Shooting Corridor Obstructed!</p>
              <p className="text-[11px] text-rose-400/90">
                Ball #{calc.blockedByBallId} is blocking the{' '}
                {calc.blockedSegment?.replace('-', ' ')} path.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 bg-rose-900/60 rounded-lg text-rose-200">
            Collision Detected
          </span>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-2.5 flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Clear shooting corridor. Direct line of sight to ghost ball & pocket.</span>
        </div>
      )}

      {/* Educational Estimate Disclaimer */}
      <div className="flex items-start gap-2 text-[10px] text-slate-500 pt-1">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
        <span>
          Educational Estimate: Calculations use ideal geometric reflection and center-of-mass collision
          mechanics. Real pool tables feature cut-induced throw (CIT) and cloth drag.
        </span>
      </div>
    </div>
  );
};
