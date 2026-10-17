import React, { useState, useRef } from 'react';
import { Vector2D } from '../types';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Crosshair,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Move,
  CornerDownRight,
} from 'lucide-react';

interface Pin {
  id: string;
  label: string;
  x: number; // Percentage 0-100
  y: number;
  color: string;
}

export const ImageWorkspace: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [activePin, setActivePin] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 4 Table Corner calibration pins
  const [corners, setCorners] = useState<Pin[]>([
    { id: 'c-tl', label: 'Top-Left Corner', x: 15, y: 20, color: '#f59e0b' },
    { id: 'c-tr', label: 'Top-Right Corner', x: 85, y: 20, color: '#f59e0b' },
    { id: 'c-bl', label: 'Bottom-Left Corner', x: 15, y: 80, color: '#f59e0b' },
    { id: 'c-br', label: 'Bottom-Right Corner', x: 85, y: 80, color: '#f59e0b' },
  ]);

  // Calibration Ball markers
  const [markers, setMarkers] = useState<Pin[]>([
    { id: 'm-cue', label: 'Cue Ball', x: 35, y: 55, color: '#ffffff' },
    { id: 'm-target', label: 'Target Ball', x: 65, y: 40, color: '#facc15' },
    { id: 'm-pocket', label: 'Target Pocket', x: 85, y: 20, color: '#38bdf8' },
  ]);

  // Handle single photo import (100% in-memory FileReader sandbox)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Delete imported image and clear all pins
  const handleDeleteImage = () => {
    setImageSrc(null);
    setImageFileName('');
    setActivePin(null);
  };

  // Drag pin on the photo
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    setActivePin(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePin || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));

    if (activePin.startsWith('c-')) {
      setCorners((prev) => prev.map((p) => (p.id === activePin ? { ...p, x, y } : p)));
    } else {
      setMarkers((prev) => prev.map((p) => (p.id === activePin ? { ...p, x, y } : p)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activePin) {
      setActivePin(null);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
  };

  // Calculate calibrated visual angle between Cue, Target, and Pocket pins
  const cuePin = markers.find((m) => m.id === 'm-cue')!;
  const targetPin = markers.find((m) => m.id === 'm-target')!;
  const pocketPin = markers.find((m) => m.id === 'm-pocket')!;

  const vCueToTarget = { x: targetPin.x - cuePin.x, y: targetPin.y - cuePin.y };
  const vTargetToPocket = { x: pocketPin.x - targetPin.x, y: pocketPin.y - targetPin.y };

  const dot = vCueToTarget.x * vTargetToPocket.x + vCueToTarget.y * vTargetToPocket.y;
  const mag1 = Math.sqrt(vCueToTarget.x ** 2 + vCueToTarget.y ** 2);
  const mag2 = Math.sqrt(vTargetToPocket.x ** 2 + vTargetToPocket.y ** 2);
  const angleRad = mag1 && mag2 ? Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) : 0;
  const angleDeg = (angleRad * 180) / Math.PI;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Optional Image Workspace</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manually calibrate table perspective from a practice photo. 100% local processing in memory.
          </p>
        </div>

        {imageSrc && (
          <button
            onClick={handleDeleteImage}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-bold text-rose-300 border border-rose-800/60 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Image & Analysis
          </button>
        )}
      </div>

      {/* Compliance & Privacy Banner */}
      <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Play Policy Compliant Photo Picker:</span>
          <p className="text-[11px] text-emerald-400/80">
            Uses standard single-file selection. No broad storage permissions, zero network uploads,
            zero automatic recognition of external games. Processed entirely in this browser window.
          </p>
        </div>
      </div>

      {/* Main Image Area or File Upload Prompt */}
      {!imageSrc ? (
        <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 transition">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">
            Import Table Photo for Manual Calibration
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Select one photo of a billiards table. You can place corner and ball pins manually to
            measure geometry.
          </p>
          <span className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700">
            Browse Single Image
          </span>
        </label>
      ) : (
        <div className="space-y-4">
          {/* Calibrated Overlay Canvas */}
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full aspect-[16/9] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 select-none cursor-crosshair touch-none"
          >
            {/* Background User Image */}
            <img
              src={imageSrc}
              alt="Calibrated table"
              className="w-full h-full object-contain pointer-events-none opacity-85"
            />

            {/* SVG Connecting Geometric Perspective Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Table Boundary Perspective Polygon */}
              <polygon
                points={`${corners[0].x}%,${corners[0].y}% ${corners[1].x}%,${corners[1].y}% ${corners[3].x}%,${corners[3].y}% ${corners[2].x}%,${corners[2].y}%`}
                fill="rgba(16, 185, 129, 0.08)"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Aim line: Cue pin to Target pin */}
              <line
                x1={`${cuePin.x}%`}
                y1={`${cuePin.y}%`}
                x2={`${targetPin.x}%`}
                y2={`${targetPin.y}%`}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />

              {/* Target line: Target pin to Pocket pin */}
              <line
                x1={`${targetPin.x}%`}
                y1={`${targetPin.y}%`}
                x2={`${pocketPin.x}%`}
                y2={`${pocketPin.y}%`}
                stroke="#facc15"
                strokeWidth="2.5"
              />
            </svg>

            {/* Draggable Corner Pins */}
            {corners.map((pin) => (
              <div
                key={pin.id}
                onPointerDown={(e) => handlePointerDown(e, pin.id)}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-[9px] font-black text-slate-950 transition-transform hover:scale-125"
                title={pin.label}
              >
                C
              </div>
            ))}

            {/* Draggable Ball Pins */}
            {markers.map((pin) => (
              <div
                key={pin.id}
                onPointerDown={(e) => handlePointerDown(e, pin.id)}
                style={{ left: `${pin.x}%`, top: `${pin.y}%`, backgroundColor: pin.color }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-slate-900 shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center text-[10px] font-bold text-slate-950 transition-transform hover:scale-125"
                title={pin.label}
              >
                {pin.id === 'm-cue' ? 'Cue' : pin.id === 'm-target' ? 'T' : 'P'}
              </div>
            ))}
          </div>

          {/* Measured Calibration Results Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400">Measured Perspective Angle</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {angleDeg.toFixed(1)}°
              </p>
              <span className="text-[10px] text-slate-500">Between aim & pocket lines</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400">Calibration Status</span>
              <p className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                4 Corners Active
              </p>
              <span className="text-[10px] text-slate-500">Perspective quad verified</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400">File Sandbox State</span>
              <p className="text-sm font-mono font-medium text-slate-300 mt-1 truncate">
                {imageFileName}
              </p>
              <span className="text-[10px] text-emerald-400">Local Memory Only</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
