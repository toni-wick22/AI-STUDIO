import React, { useState, useRef, useEffect } from 'react';
import { GeometryCalculation } from '../types';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Compass,
  Cpu,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface CueCoachChatProps {
  currentCalculation: GeometryCalculation | null;
}

export const CueCoachChat: React.FC<CueCoachChatProps> = ({ currentCalculation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am Professor Cue, your billiards geometry coach. Ask me anything about cut angles, the 90-degree stun tangent line, 30-degree rolling follow paths, bank shot mirror geometry, or tap "Analyze Current Table Setup" to inspect your active shot!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [hasAiConsent, setHasAiConsent] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Send message to Express endpoint
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || isLoading) return;

    if (!hasAiConsent) {
      setShowConsentModal(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Prepare payload with optional tableContext
      const tableContext = currentCalculation
        ? {
            shotType: 'Direct Shot',
            cuePos: currentCalculation.cuePos,
            targetPos: currentCalculation.targetPos,
            pocketName: currentCalculation.targetPocket.name,
            cutAngle: currentCalculation.cutAngleDeg,
            fraction: currentCalculation.effectiveFraction,
            isBlocked: currentCalculation.isBlocked,
          }
        : null;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          tableContext,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reach Professor Cue');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Keep your stroke smooth and follow through.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Note: Offline geometry mode. Key principle: Ghost Ball sits tangent to object ball in line with pocket at distance 2R. Stun shots deflect along the 90° tangent line.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action: Analyze active table setup
  const handleAnalyzeTable = () => {
    if (!currentCalculation) {
      handleSendMessage('How do I aim a 30-degree cut shot using the half-ball method?');
      return;
    }

    const query = `Please analyze my current table setup: The cut angle is ${currentCalculation.cutAngleDeg.toFixed(
      1
    )}° (${currentCalculation.effectiveFraction}) aiming into ${
      currentCalculation.targetPocket.name
    }. The cue distance is ${currentCalculation.shotDistanceTableUnits} units. ${
      currentCalculation.isBlocked
        ? `Note: The lane is blocked by Ball #${currentCalculation.blockedByBallId}.`
        : 'The lane is clear.'
    } What is the recommended cue ball speed, stun tangent trajectory, and risk factor?`;

    handleSendMessage(query);
  };

  // TTS speech player for message using gemini-3.8-flash-tts
  const handlePlayTTS = async (msgId: string, text: string) => {
    if (playingAudioId === msgId && audioElement) {
      audioElement.pause();
      setPlayingAudioId(null);
      setAudioElement(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    setPlayingAudioId(msgId);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 400),
          voice: 'Kore',
          style: 'Articulate, encouraging billiards physics coach',
        }),
      });

      if (!res.ok) throw new Error('TTS service failed');
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        setAudioElement(audio);
        audio.play();
        audio.onended = () => {
          setPlayingAudioId(null);
          setAudioElement(null);
        };
      }
    } catch (e) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text.slice(0, 300));
        u.onend = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(u);
      } else {
        setPlayingAudioId(null);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-[650px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Professor Cue
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AI Coach
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Billiards Physics, Cut Angle Dynamics & Position Play
            </p>
          </div>
        </div>

        {/* Model Selector based on task requirements: gemini-4-argon (complex), gemini-3.8-flash (general), gemini-3.1-flash-lite (fast) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-400" />
            Model:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (General)</option>
            <option value="gemini-4-argon">gemini-4-argon (Complex Physics)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
          </select>

          <button
            onClick={() => setMessages([messages[0]])}
            title="Clear Chat History"
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Analyze Button */}
      <div className="py-2 flex items-center gap-2">
        <button
          onClick={handleAnalyzeTable}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-xs font-semibold text-emerald-300 border border-emerald-800/60 transition disabled:opacity-50"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          Analyze Current Table Setup
        </button>
        <span className="text-[10px] text-slate-400 hidden sm:inline">
          Sends active angle & coordinates to Coach
        </span>
      </div>

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 py-2">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                <div className="mt-2 pt-1 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>{m.timestamp}</span>
                    {m.modelUsed && (
                      <span className="font-mono text-emerald-400/90">{m.modelUsed}</span>
                    )}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handlePlayTTS(m.id, m.content)}
                      title="Listen with TTS"
                      className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition"
                    >
                      {playingAudioId === m.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-400">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Speak</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Professor Cue is calculating shot dynamics...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Consent Status Banner */}
      {!hasAiConsent && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>AI features are disabled by default. Review privacy disclosure to enable.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowConsentModal(true)}
            className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 hover:bg-amber-500/30 transition shrink-0"
          >
            Review & Enable AI
          </button>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-3 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={hasAiConsent ? "Ask Professor Cue about cut angles, tangent lines, or bank shots..." : "Enable AI to chat with Professor Cue..."}
          className="flex-1 bg-slate-950 text-slate-200 text-xs rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* AI Consent Disclosure Dialog Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Optional AI Features Disclosure</h3>
                <p className="text-xs text-slate-400">Google Play Data Safety & AI Transparency</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed">
              <p>
                <strong className="text-slate-100">Offline Simulator Independence:</strong> The core table simulator, ghost-ball calculator, bank/kick physics, and lessons work 100% offline without AI.
              </p>
              <p>
                <strong className="text-slate-100">What data is transmitted:</strong> When you send a message, only your typed question and optional table geometric numbers (e.g. cut angle = 30°) are sent to the AI service.
              </p>
              <p>
                <strong className="text-slate-100">Strict Image Privacy:</strong> Any photos imported into the Image Workspace remain in local device memory and are NEVER uploaded to any AI model or cloud server.
              </p>
              <p>
                <strong className="text-slate-100">Right to Delete:</strong> You can purge conversation history and disable AI at any time using the "Delete All Local Data" button on the Privacy screen.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setHasAiConsent(false);
                  setShowConsentModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                Keep AI Disabled
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasAiConsent(true);
                  setShowConsentModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition"
              >
                I Agree & Enable AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
