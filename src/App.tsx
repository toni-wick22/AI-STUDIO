/**
 * Cue Geometry Trainer
 * Educational Billiards Shot Geometry Simulator & Coach
 */

import React, { useState, useMemo } from 'react';
import {
  Ball,
  ShotType,
  VisualSettings,
  GeometryCalculation,
  Lesson,
} from './types';
import {
  STANDARD_POCKETS,
  computeShotGeometry,
} from './utils/geometryEngine';
import { TableCanvas } from './components/TableCanvas';
import { GeometryHUD } from './components/GeometryHUD';
import { ShotControls } from './components/ShotControls';
import { LessonsView } from './components/LessonsView';
import { ImageWorkspace } from './components/ImageWorkspace';
import { CueCoachChat } from './components/CueCoachChat';
import { DiagramGenerator } from './components/DiagramGenerator';
import { TestRunnerView } from './components/TestRunnerView';
import { PrivacyScreen } from './components/PrivacyScreen';
import { AndroidCodeExport } from './components/AndroidCodeExport';
import {
  Compass,
  BookOpen,
  Image as ImageIcon,
  Bot,
  Sparkles,
  CheckCheck,
  ShieldCheck,
  Smartphone,
  Layers,
  CircleDot,
} from 'lucide-react';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'simulator' | 'lessons' | 'image' | 'coach' | 'diagrams' | 'tests' | 'privacy' | 'android'
  >('simulator');

  // Balls on the table
  const [balls, setBalls] = useState<Ball[]>([
    { id: 0, x: 260, y: 250, isCue: true },
    { id: 1, x: 650, y: 250 },
    { id: 2, x: 678, y: 236 },
    { id: 3, x: 678, y: 264 },
    { id: 8, x: 706, y: 250 },
  ]);

  const [cueBallId, setCueBallId] = useState<number>(0);
  const [targetBallId, setTargetBallId] = useState<number>(1);
  const [selectedPocketId, setSelectedPocketId] = useState<string>('tr');
  const [shotType, setShotType] = useState<ShotType>('direct');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Visual Learning Preferences
  const [settings, setSettings] = useState<VisualSettings>({
    showGhostBall: true,
    showAimLine: true,
    showTargetLine: true,
    showTangentLine: true,
    showFollowLine: true,
    showExtendedAim: true,
    showDiamondGrid: true,
    threeLineMode: false,
    lineThickness: 3.0,
    aimLineColor: '#ffffff',
    targetLineColor: '#facc15',
    tangentLineColor: '#22d3ee',
    followLineColor: '#a855f7',
    blockedLineColor: '#ef4444',
    tableClothColor: 'classic-green',
  });

  // Calculate live geometry reactively
  const calculation: GeometryCalculation | null = useMemo(() => {
    const cueBall = balls.find((b) => b.id === cueBallId);
    const targetBall = balls.find((b) => b.id === targetBallId);
    const pocket = STANDARD_POCKETS.find((p) => p.id === selectedPocketId) || STANDARD_POCKETS[2];

    if (!cueBall || !targetBall) return null;

    return computeShotGeometry(cueBall, targetBall, pocket, balls, shotType);
  }, [balls, cueBallId, targetBallId, selectedPocketId, shotType]);

  // Handle loading an educational drill onto the active table
  const handleLoadLessonToTable = (lesson: Lesson) => {
    const newBalls: Ball[] = [
      { id: 0, x: lesson.setupCue.x, y: lesson.setupCue.y, isCue: true },
      { id: 1, x: lesson.setupTarget.x, y: lesson.setupTarget.y },
    ];
    if (lesson.id === 'lesson-kick-shots') {
      newBalls.push({ id: 8, x: 480, y: 260 }); // Obstacle ball blocking direct path
    }
    setBalls(newBalls);
    setCueBallId(0);
    setTargetBallId(1);
    setSelectedPocketId(lesson.setupPocketId);
    setShotType(lesson.shotType);
    setActiveTab('simulator');
  };

  const handleResetAllData = () => {
    setBalls([
      { id: 0, x: 260, y: 250, isCue: true },
      { id: 1, x: 650, y: 250 },
      { id: 2, x: 678, y: 236 },
      { id: 3, x: 678, y: 264 },
      { id: 8, x: 706, y: 250 },
    ]);
    setCueBallId(0);
    setTargetBallId(1);
    setSelectedPocketId('tr');
    setShotType('direct');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <CircleDot className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-100">
                  Cue Geometry Trainer
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v1.0 Offline
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Educational Billiards Physics, Ghost-Ball & Cushion Mirror System
              </p>
            </div>
          </div>

          {/* Navigation Pill Chips */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs">
            {(
              [
                { id: 'simulator', label: 'Simulator', icon: Compass },
                { id: 'lessons', label: 'Lessons', icon: BookOpen },
                { id: 'image', label: 'Image Workspace', icon: ImageIcon },
                { id: 'coach', label: 'Cue Coach AI', icon: Bot },
                { id: 'diagrams', label: 'Shot Diagrams', icon: Sparkles },
                { id: 'tests', label: 'Tests Suite', icon: CheckCheck },
                { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
                { id: 'android', label: 'Android Code', icon: Smartphone },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto gap-1 mt-2.5 pt-2 border-t border-slate-800/60 pb-0.5 text-xs">
          {(
            [
              { id: 'simulator', label: 'Simulator', icon: Compass },
              { id: 'lessons', label: 'Lessons', icon: BookOpen },
              { id: 'image', label: 'Calibrate', icon: ImageIcon },
              { id: 'coach', label: 'AI Coach', icon: Bot },
              { id: 'diagrams', label: 'Diagrams', icon: Sparkles },
              { id: 'tests', label: 'Tests', icon: CheckCheck },
              { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
              { id: 'android', label: 'Kotlin', icon: Smartphone },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-6">
            {/* Table Canvas Simulator */}
            <TableCanvas
              balls={balls}
              setBalls={setBalls}
              cueBallId={cueBallId}
              setCueBallId={setCueBallId}
              targetBallId={targetBallId}
              setTargetBallId={setTargetBallId}
              selectedPocketId={selectedPocketId}
              setSelectedPocketId={setSelectedPocketId}
              calculation={calculation}
              settings={settings}
              shotType={shotType}
              isSimulating={isSimulating}
              setIsSimulating={setIsSimulating}
            />

            {/* Geometry HUD (Cut Angles, Overlap Diagram, Distances, Tangent Rule) */}
            <GeometryHUD calc={calculation} shotType={shotType} />

            {/* Shot Mode Controls & Visual Settings */}
            <ShotControls
              shotType={shotType}
              setShotType={setShotType}
              settings={settings}
              setSettings={setSettings}
              setBalls={setBalls}
              setCueBallId={setCueBallId}
              setTargetBallId={setTargetBallId}
              setSelectedPocketId={setSelectedPocketId}
            />
          </div>
        )}

        {activeTab === 'lessons' && (
          <LessonsView onLoadLessonToTable={handleLoadLessonToTable} />
        )}

        {activeTab === 'image' && <ImageWorkspace />}

        {activeTab === 'coach' && <CueCoachChat currentCalculation={calculation} />}

        {activeTab === 'diagrams' && <DiagramGenerator />}

        {activeTab === 'tests' && <TestRunnerView />}

        {activeTab === 'privacy' && <PrivacyScreen onResetAllData={handleResetAllData} />}

        {activeTab === 'android' && <AndroidCodeExport />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Cue Geometry Trainer • Educational Billiards Shot Simulator</span>
          <span className="text-[11px] text-slate-600">
            Strictly compliant with Google Play Policies • Zero overlay / background interaction
          </span>
        </div>
      </footer>
    </div>
  );
}
