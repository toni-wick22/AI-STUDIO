import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Trash2,
  HardDrive,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface PrivacyScreenProps {
  onResetAllData: () => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onResetAllData }) => {
  const [clearedNotice, setClearedNotice] = useState<boolean>(false);

  const handleClear = () => {
    localStorage.clear();
    sessionStorage.clear();
    onResetAllData();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Privacy & Policy Compliance</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict Google Play & sandbox safety standards • 100% offline-first architecture
          </p>
        </div>
      </div>

      {clearedNotice && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-3 flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>All local browser storage, cached table positions, and custom settings have been purged.</span>
        </div>
      )}

      {/* Compliance Guarantee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200">No Account or Cloud Database</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No registration or user accounts are required. Your drills, custom ball coordinates,
              and settings are stored strictly in local device memory.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <EyeOff className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200">Zero Invasive Permissions</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This app never requests SYSTEM_ALERT_WINDOW (display over other apps), AccessibilityService,
              MediaProjection (screen capture), broad storage access, location, or contacts.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <HardDrive className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200">Isolated Sandbox Photo Picker</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When using the Image Workspace, selected photos remain strictly in your browser or app
              sandbox. Photos are processed locally and never uploaded to remote servers.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200">Stand-Alone Educational Tool</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never interacts with, assists, monitors, modifies, or draws over third-party pool games.
              Pure mathematical simulation for human player skill improvement.
            </p>
          </div>
        </div>
      </div>

      {/* Delete All Local Data Action Card */}
      <div className="bg-slate-950 border border-rose-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Delete All Local Data</h4>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">
              Purges all saved drill presets, visual preferences, calibrated images, and cached physics
              simulations.
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-100 font-bold text-xs border border-rose-700/60 shadow-lg shadow-rose-950/40 transition whitespace-nowrap"
        >
          <Trash2 className="w-4 h-4" />
          Purge Local Storage
        </button>
      </div>
    </div>
  );
};
