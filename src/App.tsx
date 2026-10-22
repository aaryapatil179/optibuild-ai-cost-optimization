import { useState } from 'react';
import { HardHat, Sparkles, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import InputForm from '@/components/InputForm';
import ResultsDashboard from '@/components/ResultsDashboard';
import { generateOptimizationPlan } from '@/lib/gemini';
import type { OptimizationResult, ProjectInput } from '@/types';

export default function App() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [input, setInput] = useState<ProjectInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (projectInput: ProjectInput) => {
    setLoading(true);
    setError(null);
    try {
      const optimization = await generateOptimizationPlan(projectInput);
      setResult(optimization);
      setInput(projectInput);
    } catch (err) {
      setError('Something went wrong while generating the optimization plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInput(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Top glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-gradient-to-b from-accent-500/10 to-transparent" />

      <div className="relative">
        {/* Header */}
        <header className="border-b border-slate-800/60 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-navy-600 shadow-glow">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  OptiBuild <span className="text-accent-400">AI</span>
                </h1>
                <p className="text-xs text-slate-500">Cost Optimization Platform</p>
              </div>
            </div>
            <div className="hidden items-center gap-4 text-xs text-slate-500 sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-accent-400" /> Gemini 2.5 Flash
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Hero */}
          {!result && !loading && (
            <div className="mb-8 text-center animate-fade-in">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-accent-400" />
                AI-Powered Construction Cost Analysis
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Optimize Your Project Budget
                <br />
                <span className="bg-gradient-to-r from-accent-400 to-sky-300 bg-clip-text text-transparent">
                  with Artificial Intelligence
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 sm:text-base">
                Enter your project parameters and let Gemini AI analyze material costs, scheduling,
                and logistics to uncover hidden savings — typically 10-18% of your total budget.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && !result && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-full border-4 border-slate-800" />
                <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-accent-500 border-t-transparent" />
                <Sparkles className="absolute inset-0 m-auto h-7 w-7 text-accent-400" />
              </div>
              <p className="text-sm font-medium text-white">AI is analyzing your project...</p>
              <p className="mt-1 text-xs text-slate-500">Evaluating materials, scheduling, and logistics</p>
            </div>
          )}

          {/* Initial form — centered, full width */}
          {!loading && !result && (
            <div className="mx-auto max-w-2xl animate-slide-up">
              <div className="card p-6 sm:p-8">
                <InputForm onSubmit={handleSubmit} loading={loading} />
              </div>
            </div>
          )}

          {/* Results — form on top (full width), results below (full width) */}
          {result && input && (
            <div className="space-y-6">
              {/* Form bar at top */}
              <div className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Project Parameters</h3>
                  <button onClick={handleReset} className="btn-ghost text-xs">
                    New Analysis
                  </button>
                </div>
                <InputForm onSubmit={handleSubmit} loading={loading} />
              </div>

              {/* Results — full width, no cramped sidebar */}
              <ResultsDashboard result={result} input={input} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-800/60">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-600 sm:px-6">
            OptiBuild AI · Powered by Google Gemini 2.5 Flash · For educational demonstration
          </div>
        </footer>
      </div>
    </div>
  );
}
