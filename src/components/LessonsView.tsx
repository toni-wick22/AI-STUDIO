import React, { useState } from 'react';
import { Lesson, Ball } from '../types';
import { LESSONS_DATA } from '../utils/lessonsData';
import {
  BookOpen,
  Volume2,
  PlayCircle,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  CheckCircle,
  HelpCircle,
  VolumeX,
} from 'lucide-react';

interface LessonsViewProps {
  onLoadLessonToTable: (lesson: Lesson) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ onLoadLessonToTable }) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(LESSONS_DATA[0].id);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const activeLesson = LESSONS_DATA.find((l) => l.id === selectedLessonId) || LESSONS_DATA[0];

  // Text to Speech playback with gemini-3.8-flash-tts
  const handlePlayTTS = async () => {
    if (isPlayingAudio && currentAudio) {
      currentAudio.pause();
      setIsPlayingAudio(false);
      return;
    }

    setAudioError(null);
    setIsPlayingAudio(true);

    try {
      const textToRead = `${activeLesson.title}. ${activeLesson.conceptSummary} Key rule: ${activeLesson.keyRule}. ${activeLesson.detailedText.slice(0, 2).join(' ')}`;
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToRead,
          voice: 'Kore',
          style: 'Authoritative, calm billiards geometry coach',
        }),
      });

      if (!res.ok) {
        throw new Error('TTS service unavailable');
      }

      const data = await res.json();
      if (data.audioBase64) {
        const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
        const audio = new Audio(audioSrc);
        setCurrentAudio(audio);
        audio.play();
        audio.onended = () => {
          setIsPlayingAudio(false);
          setCurrentAudio(null);
        };
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setCurrentAudio(null);
          setAudioError('Audio playback failed');
        };
      }
    } catch (err: any) {
      console.warn('TTS request error, falling back to Web Speech API:', err.message);
      // Seamless browser speech synthesis fallback if network is offline
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `${activeLesson.title}. ${activeLesson.conceptSummary} ${activeLesson.keyRule}`
        );
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setAudioError('Text-to-speech could not be initialized.');
        setIsPlayingAudio(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Lesson Navigation Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3 px-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Billiards Curriculum</h3>
          </div>

          <div className="space-y-2">
            {LESSONS_DATA.map((lesson, idx) => {
              const isSelected = lesson.id === selectedLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    if (isPlayingAudio && currentAudio) {
                      currentAudio.pause();
                      setIsPlayingAudio(false);
                    }
                    setSelectedLessonId(lesson.id);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-600/20 border-emerald-500 text-slate-100 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.durationMinutes} min
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400/90 font-medium">
                          {lesson.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition ${
                      isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Detailed Lesson Reader & Drill Action */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {activeLesson.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeLesson.durationMinutes} minute interactive study
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-100">{activeLesson.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{activeLesson.subtitle}</p>
            </div>

            {/* TTS Audio Player Button */}
            <div className="flex flex-col items-end">
              <button
                onClick={handlePlayTTS}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition ${
                  isPlayingAudio
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    Pause Audio Coach
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Listen to Lesson (TTS)
                  </>
                )}
              </button>
              <span className="text-[10px] text-slate-500 mt-1 font-mono">
                Powered by Gemini 3.8 Flash TTS
              </span>
            </div>
          </div>

          {audioError && (
            <div className="text-xs text-rose-400 bg-rose-950/40 px-3 py-2 rounded-xl border border-rose-800/50">
              {audioError}
            </div>
          )}

          {/* Key Rule Highlight Box */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950/60 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Universal Geometric Law
              </h4>
              <p className="text-sm font-extrabold text-slate-100 mt-1 font-mono">
                {activeLesson.keyRule}
              </p>
            </div>
          </div>

          {/* Concept Summary */}
          <div className="text-slate-300 text-sm leading-relaxed bg-slate-950/40 rounded-2xl p-4 border border-slate-800/60">
            {activeLesson.conceptSummary}
          </div>

          {/* Detailed Paragraphs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Step-by-Step Physics Analysis
            </h4>
            {activeLesson.detailedText.map((p, i) => (
              <div key={i} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p>{p}</p>
              </div>
            ))}
          </div>

          {/* Practice Challenge & Load onto Table Card */}
          <div className="mt-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Interactive Table Drill</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeLesson.quizTip}</p>
              </div>
            </div>

            <button
              onClick={() => onLoadLessonToTable(activeLesson)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition whitespace-nowrap"
            >
              <PlayCircle className="w-4 h-4 fill-current" />
              Load Drill onto Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
