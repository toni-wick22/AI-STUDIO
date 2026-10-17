import React from 'react';
import { ShotType, VisualSettings, Ball } from '../types';
import {
  Sliders,
  Eye,
  Layers,
  Palette,
  Crosshair,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ShotControlsProps {
  shotType: ShotType;
  setShotType: (st: ShotType) => void;
  settings: VisualSettings;
  setSettings: React.Dispatch<React.SetStateAction<VisualSettings>>;
  setBalls: React.Dispatch<React.SetStateAction<Ball[]>>;
  setCueBallId: (id: number) => void;
  setTargetBallId: (id: number) => void;
  setSelectedPocketId: (id: string) => void;
}

export const ShotControls: React.FC<ShotControlsProps> = ({
  shotType,
  setShotType,
  settings,
  setSettings,
  setBalls,
  setCueBallId,
  setTargetBallId,
  setSelectedPocketId,
}) => {
  // Preset rack layouts
  const applyPreset = (preset: 'standard' | 'cut-drill' | 'bank-drill' | 'snooker-kick') => {
    if (preset === 'standard') {
      setBalls([
        { id: 0, x: 260, y: 250, isCue: true },
        { id: 1, x: 650, y: 250 },
        { id: 2, x: 678, y: 236 },
        { id: 3, x: 678, y: 264 },
        { id: 8, x: 706, y: 250 },
        { id: 9, x: 734, y: 236 },
        { id: 10, x: 734, y: 264 },
      ]);
      setCueBallId(0);
      setTargetBallId(1);
      setSelectedPocketId('tr');
      setShotType('direct');
    } else if (preset === 'cut-drill') {
      setBalls([
        { id: 0, x: 320, y: 360, isCue: true },
        { id: 3, x: 620, y: 220 },
      ]);
      setCueBallId(0);
      setTargetBallId(3);
      setSelectedPocketId('tr');
      setShotType('direct');
    } else if (preset === 'bank-drill') {
      setBalls([
        { id: 0, x: 420, y: 350, isCue: true },
        { id: 9, x: 680, y: 310 },
      ]);
      setCueBallId(0);
      setTargetBallId(9);
      setSelectedPocketId('tl');
      setShotType('bank_1');
    } else if (preset === 'snooker-kick') {
      setBalls([
        { id: 0, x: 240, y: 380, isCue: true },
        { id: 8, x: 700, y: 160 },
        { id: 2, x: 460, y: 270 }, // Snooker obstacle ball blocking direct path
      ]);
      setCueBallId(0);
      setTargetBallId(8);
      setSelectedPocketId('br');
      setShotType('kick');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-5">
      {/* 1. Shot Mode Selector */}
      <div>
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          Shot Geometry Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              { id: 'direct', label: 'Direct Shot', desc: 'Direct ghost-ball aim' },
              { id: 'bank_1', label: '1-Cushion Bank', desc: 'Single rail reflection' },
              { id: 'bank_2', label: '2-Cushion Bank', desc: 'Double mirror bank' },
              { id: 'kick', label: 'Kick Shot', desc: 'Cue ball off cushion' },
            ] as const
          ).map((mode) => {
            const isActive = shotType === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setShotType(mode.id)}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition ${
                  isActive
                    ? 'bg-emerald-600/20 border-emerald-500 text-slate-100 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold">{mode.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Visual Learning Tools Toggle Chips */}
      <div>
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          Visual Learning Overlays
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Three-Line Mode */}
          <button
            onClick={() =>
              setSettings((s) => ({
                ...s,
                threeLineMode: !s.threeLineMode,
                showAimLine: true,
                showTargetLine: true,
                showTangentLine: true,
              }))
            }
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
              settings.threeLineMode
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}
          >
            <span>3-Line Learning Mode</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.threeLineMode ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
            />
          </button>

          {/* Ghost Ball Hologram */}
          <button
            onClick={() => setSettings((s) => ({ ...s, showGhostBall: !s.showGhostBall }))}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
              settings.showGhostBall
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}
          >
            <span>Ghost-Ball Hologram</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.showGhostBall ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
            />
          </button>

          {/* 90° Stun Tangent Line */}
          <button
            onClick={() => setSettings((s) => ({ ...s, showTangentLine: !s.showTangentLine }))}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
              settings.showTangentLine
                ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}
          >
            <span>90° Stun Tangent</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.showTangentLine ? 'bg-purple-400' : 'bg-slate-700'
              }`}
            />
          </button>

          {/* 30° Rolling Follow Line */}
          <button
            onClick={() => setSettings((s) => ({ ...s, showFollowLine: !s.showFollowLine }))}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
              settings.showFollowLine
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}
          >
            <span>30° Rolling Follow</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.showFollowLine ? 'bg-indigo-400' : 'bg-slate-700'
              }`}
            />
          </button>

          {/* Extended Aim Line */}
          <button
            onClick={() => setSettings((s) => ({ ...s, showExtendedAim: !s.showExtendedAim }))}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
              settings.showExtendedAim
                ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}
          >
            <span>Extended Aim Line</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.showExtendedAim ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            />
          </button>

          {/* Diamond Sight Grid */}
          <button
            onClick={() => setSettings((s) => ({ ...s, showDiamondGrid: !s.showDiamondGrid }))}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
              settings.showDiamondGrid
                ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}
          >
            <span>Rail Diamond Sights</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.showDiamondGrid ? 'bg-teal-400' : 'bg-slate-700'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Line Thickness & Table Customization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
        {/* Line Thickness Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              Line Thickness: {settings.lineThickness}px
            </span>
          </div>
          <input
            type="range"
            min="1.5"
            max="5"
            step="0.5"
            value={settings.lineThickness}
            onChange={(e) => setSettings((s) => ({ ...s, lineThickness: parseFloat(e.target.value) }))}
            className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        {/* Cloth Color Chooser */}
        <div className="space-y-1.5">
          <span className="text-slate-400 font-medium text-xs flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            Table Cloth Theme
          </span>
          <div className="flex gap-2">
            {(
              [
                { id: 'classic-green', label: 'Classic Green', color: '#166534' },
                { id: 'tournament-blue', label: 'Tournament Blue', color: '#1d4ed8' },
                { id: 'charcoal-grey', label: 'Charcoal Grey', color: '#334155' },
                { id: 'burgundy-red', label: 'Burgundy Red', color: '#831843' },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                onClick={() => setSettings((s) => ({ ...s, tableClothColor: c.id }))}
                title={c.label}
                style={{ backgroundColor: c.color }}
                className={`w-6 h-6 rounded-full border-2 transition ${
                  settings.tableClothColor === c.id
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Quick Drill Presets */}
      <div className="pt-2 border-t border-slate-800/80">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
          Quick Practice Presets
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('standard')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
          >
            Standard Rack
          </button>
          <button
            onClick={() => applyPreset('cut-drill')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
          >
            30° Cut Angle Setup
          </button>
          <button
            onClick={() => applyPreset('bank-drill')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
          >
            Corner Bank Drill
          </button>
          <button
            onClick={() => applyPreset('snooker-kick')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
          >
            Obstacle Kick Escape
          </button>
        </div>
      </div>
    </div>
  );
};
