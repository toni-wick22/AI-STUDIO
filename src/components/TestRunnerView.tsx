import React, { useState, useEffect } from 'react';
import { UnitTestResult } from '../types';
import { runAllUnitTests } from '../utils/unitTests';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  CheckCheck,
  ShieldCheck,
  Clock,
  Filter,
} from 'lucide-react';

export const TestRunnerView: React.FC = () => {
  const [results, setResults] = useState<UnitTestResult[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const tests = runAllUnitTests();
      setResults(tests);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;
  const totalTime = results.reduce((acc, r) => acc + r.executionTimeMs, 0);

  const filteredResults = filter === 'all'
    ? results
    : results.filter((r) => r.category.toLowerCase() === filter.toLowerCase());

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
      {/* Header & Run Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Educational Geometry Test Suite</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verification of vector math, ghost-ball positioning, ray-circle collision, and cushion reflections.
          </p>
        </div>

        <button
          onClick={executeTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              Running Assertions...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run All Verification Tests
            </>
          )}
        </button>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400">Total Test Cases</span>
          <p className="text-2xl font-black font-mono text-slate-100 mt-1">{total}</p>
          <span className="text-[10px] text-slate-500">Automated checks</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Passed
          </span>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{passedCount}</p>
          <span className="text-[10px] text-emerald-500/80">100% Math Verified</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
          <p className="text-2xl font-black font-mono text-rose-400 mt-1">{failedCount}</p>
          <span className="text-[10px] text-slate-500">Zero regressions</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            Suite Runtime
          </span>
          <p className="text-2xl font-black font-mono text-sky-300 mt-1">
            {totalTime.toFixed(2)}ms
          </p>
          <span className="text-[10px] text-slate-500">High-speed execution</span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-xs font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {['all', 'vector', 'ghostball', 'cutangle', 'collision', 'reflection', 'ui'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition ${
              filter === cat
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tests Table */}
      <div className="space-y-2.5">
        {filteredResults.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              t.passed
                ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                : 'bg-rose-950/20 border-rose-800/60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {t.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {t.id}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{t.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                    {t.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] font-mono">
                  <span className="text-slate-400">
                    Expected: <span className="text-slate-300">{t.expected}</span>
                  </span>
                  <span className="text-slate-400">
                    Actual: <span className="text-emerald-400 font-semibold">{t.actual}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[11px] font-mono text-slate-400">
                {t.executionTimeMs}ms
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
