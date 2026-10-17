import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  Layers,
  RefreshCw,
  Maximize2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface GeneratedDiagram {
  id: string;
  url: string;
  prompt: string;
  size: string;
  timestamp: string;
}

export const DiagramGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    '30-degree half-ball cut shot with white cue ball, yellow 1-ball, and cyan 90-degree tangent line'
  );
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [diagrams, setDiagrams] = useState<GeneratedDiagram[]>([]);
  const [hasAiConsent, setHasAiConsent] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  // Preset Prompts
  const PRESET_PROMPTS = [
    {
      label: '30° Half-Ball Cut',
      text: '30-degree half-ball cut shot showing cue ball edge aligned with object ball center and cyan tangent line',
    },
    {
      label: '90° Stun Rule',
      text: 'Billiards table diagram illustrating the 90-degree stun rule with sliding cue ball deflection vector',
    },
    {
      label: '1-Cushion Bank',
      text: 'Top-down pool table diagram showing diamond system and mirror reflection geometry into corner pocket',
    },
    {
      label: 'Kick Shot Escape',
      text: 'Kick shot escape diagram with cue ball rebounding off top cushion around an obstacle cluster',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    if (!hasAiConsent) {
      setShowConsentModal(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageSize,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate diagram');
      }

      const data = await res.json();
      if (data.imageUrl) {
        const newDiagram: GeneratedDiagram = {
          id: `diag-${Date.now()}`,
          url: data.imageUrl,
          prompt,
          size: data.size || imageSize,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setDiagrams((prev) => [newDiagram, ...prev]);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not generate diagram.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              High-Resolution Shot Diagram Generator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by gemini-3-pro-image-preview & nano-banana-2.1 with 1K, 2K, and 4K resolution options.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-3 flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Panel: Prompt & Affordances */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        {/* Preset Prompt Buttons */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Suggested Billiards Diagrams
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPrompt(p.text)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Prompt Input */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            Diagram Specifications Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 text-slate-200 text-xs rounded-xl p-3 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500 resize-none"
            placeholder="Describe the cue shot geometry, angle, or rail diamond setup..."
          />
        </div>

        {/* Affordances: Image Size (1K, 2K, 4K) & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
          {/* Image Size Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Resolution Affordance (1K, 2K, 4K)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    imageSize === size
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['16:9', '4:3', '1:1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    aspectRatio === ratio
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Rendering {imageSize} Technical Diagram...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {imageSize} Shot Diagram
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Diagrams Gallery */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Diagram Output Archive ({diagrams.length})
        </h3>

        {diagrams.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-500">
            No diagrams generated yet. Choose a preset or prompt above to generate 1K, 2K, or 4K
            educational diagrams.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagrams.map((d) => (
              <div
                key={d.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col"
              >
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={d.url}
                    alt={d.prompt}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                      {d.size}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <p className="text-xs text-slate-300 line-clamp-2">{d.prompt}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                    <span>{d.timestamp}</span>
                    <a
                      href={d.url}
                      download={`cue-diagram-${d.id}.png`}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save Image
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Consent Disclosure Dialog Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Optional AI Diagram Disclosure</h3>
                <p className="text-xs text-slate-400">Google Play Data Safety & AI Transparency</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed">
              <p>
                <strong className="text-slate-100">Offline Independence:</strong> The core table simulator and lessons are completely operational without online image generation.
              </p>
              <p>
                <strong className="text-slate-100">Data Transmitted:</strong> Only the technical diagram description prompt you type (e.g. "30-degree cut angle diagram") and the selected resolution (1K, 2K, 4K) are sent.
              </p>
              <p>
                <strong className="text-slate-100">Zero Photo Uploads:</strong> No user photos or camera images are ever transmitted.
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
                I Agree & Enable Diagrams
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
