import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import {
  TrendingDown,
  Percent,
  ShieldAlert,
  ListChecks,
  BarChart3,
  Package,
  CalendarClock,
  Truck,
  ArrowRight,
  Boxes,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { OptimizationResult, ProjectInput, RecommendationCategory } from '@/types';

interface Props {
  result: OptimizationResult;
  input: ProjectInput;
}

type Tab = 'overview' | 'recommendations' | 'materials' | 'breakdown';

const CATEGORY_STYLES: Record<RecommendationCategory, { icon: typeof Package; color: string; bg: string }> = {
  Material: { icon: Package, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
  Scheduling: { icon: CalendarClock, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' },
  Logistics: { icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
};

const RISK_STYLES = {
  Low: { color: 'text-emerald-400', ring: '#10b981', label: 'Low Risk' },
  Medium: { color: 'text-amber-400', ring: '#f59e0b', label: 'Medium Risk' },
  High: { color: 'text-red-400', ring: '#ef4444', label: 'High Risk' },
};

const fmtINR = (n: number) =>
  n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function ResultsDashboard({ result, input }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const risk = RISK_STYLES[result.riskScore];

  const chartData = result.costBreakdown.map((c) => ({
    category: c.category,
    Original: c.original,
    Optimized: c.optimized,
  }));

  const totalOriginal = result.costBreakdown.reduce((s, c) => s + c.original, 0);
  const totalOptimized = result.costBreakdown.reduce((s, c) => s + c.optimized, 0);

  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'recommendations', label: 'Recommendations', icon: ListChecks },
    { id: 'materials', label: 'Material Analysis', icon: Boxes },
    { id: 'breakdown', label: 'Cost Breakdown', icon: TrendingDown },
  ];

  return (
    <div className="animate-slide-up space-y-5">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all sm:px-4 ${
              tab === id
                ? 'bg-accent-500/15 text-accent-300 shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Metric cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              icon={TrendingDown}
              label="Total Potential Savings"
              value={fmtINR(result.totalPotentialSavings)}
              accent="accent"
            />
            <MetricCard
              icon={Percent}
              label="Savings Percentage"
              value={`${result.savingsPercentage}%`}
              accent="emerald"
            />
            <MetricCard
              icon={ShieldAlert}
              label="Risk Assessment"
              value={risk.label}
              accent={result.riskScore === 'High' ? 'red' : result.riskScore === 'Medium' ? 'amber' : 'emerald'}
            />
          </div>

          {/* Chart + risk gauge */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Budget Allocation: Original vs AI-Optimized</h3>
                  <p className="text-xs text-slate-500">Per-category cost comparison</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-sm bg-slate-600" /> Original
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-sm bg-accent-500" /> Optimized
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickFormatter={(v) => {
                      if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
                      if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
                      if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                      return `${v}`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1322',
                      border: '1px solid #1e3a8a',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(v) => fmtINR(Number(v))}
                    cursor={{ fill: 'rgba(56,189,248,0.05)' }}
                  />
                  <Bar dataKey="Original" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Optimized" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk gauge */}
            <div className="card flex flex-col items-center justify-center p-5">
              <h3 className="mb-1 text-sm font-semibold text-white">Risk Score</h3>
              <p className="mb-3 text-xs text-slate-500">Project exposure index</p>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ name: 'risk', value: result.riskScoreNumeric, fill: risk.ring }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: '#1e293b' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="-mt-32 text-center">
                <p className={`text-3xl font-bold ${risk.color}`}>{result.riskScoreNumeric}</p>
                <p className="text-xs text-slate-500">/ 100</p>
              </div>
              <div className="mt-20">
                <span className={`text-sm font-semibold ${risk.color}`}>{risk.label}</span>
              </div>
            </div>
          </div>

          {/* Summary totals */}
          <div className="card flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-slate-500">Original Project Budget</p>
              <p className="text-2xl font-bold text-slate-300">{fmtINR(totalOriginal)}</p>
            </div>
            <ArrowRight className="h-6 w-6 shrink-0 text-accent-500" />
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-slate-500">AI-Optimized Budget</p>
              <p className="text-2xl font-bold text-accent-400">{fmtINR(totalOptimized)}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-center">
              <p className="text-xs uppercase tracking-wider text-emerald-400/70">You Save</p>
              <p className="text-xl font-bold text-emerald-400">{fmtINR(totalOriginal - totalOptimized)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {tab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">AI-Generated Recommendations</h3>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
              {result.recommendations.length} actions
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {result.recommendations.map((rec, i) => {
              const style = CATEGORY_STYLES[rec.category];
              const Icon = style.icon;
              return (
                <div key={i} className={`card border p-5 transition-all hover:shadow-glow ${style.bg}`}>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${style.color}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${style.color}`}>
                        {rec.category}
                      </span>
                    </div>
                    <span className="rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                      Save {fmtINR(rec.estimatedSaving)}
                    </span>
                  </div>
                  <h4 className="mb-1.5 text-base font-semibold text-white">{rec.title}</h4>
                  <p className="text-sm leading-relaxed text-slate-400">{rec.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Material Analysis */}
      {tab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">AI Material Analysis</h3>
              <p className="text-xs text-slate-500">How each material affects your project cost</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
              {result.materialAnalysis.length} materials analyzed
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {result.materialAnalysis.map((mat, i) => (
              <div key={i} className="card border border-slate-700 p-5 transition-all hover:border-accent-500/50">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-accent-400" />
                    <h4 className="text-base font-semibold text-white">{mat.material}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-accent-300">
                      {fmtINR(mat.costImpact)}
                    </span>
                    {mat.recommended ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Recommended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
                        <XCircle className="h-3.5 w-3.5" /> Optional
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">{mat.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      {tab === 'breakdown' && (
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Detailed Cost Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 text-right font-medium">Original</th>
                    <th className="pb-3 pr-4 text-right font-medium">Optimized</th>
                    <th className="pb-3 pr-4 text-right font-medium">Savings</th>
                    <th className="pb-3 text-right font-medium">Reduction</th>
                  </tr>
                </thead>
                <tbody>
                  {result.costBreakdown.map((c, i) => {
                    const savings = c.original - c.optimized;
                    const pct = c.original > 0 ? (savings / c.original) * 100 : 0;
                    return (
                      <tr key={i} className="border-b border-slate-850 last:border-0">
                        <td className="py-3 pr-4 font-medium text-slate-200">{c.category}</td>
                        <td className="py-3 pr-4 text-right text-slate-400">{fmtINR(c.original)}</td>
                        <td className="py-3 pr-4 text-right text-accent-400">{fmtINR(c.optimized)}</td>
                        <td className="py-3 pr-4 text-right text-emerald-400">{fmtINR(savings)}</td>
                        <td className="py-3 text-right">
                          <span className="inline-block rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-700">
                    <td className="pt-3 pr-4 font-bold text-white">Total</td>
                    <td className="pt-3 pr-4 text-right font-bold text-slate-300">{fmtINR(totalOriginal)}</td>
                    <td className="pt-3 pr-4 text-right font-bold text-accent-400">{fmtINR(totalOptimized)}</td>
                    <td className="pt-3 pr-4 text-right font-bold text-emerald-400">{fmtINR(totalOriginal - totalOptimized)}</td>
                    <td className="pt-3 text-right font-bold text-emerald-400">
                      {((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Project context footer */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-xs text-slate-500">
        <span className="font-medium text-slate-400">Analyzed:</span>
        <span>{input.projectType}</span>
        <span>·</span>
        <span>{fmtINR(input.budget)}</span>
        <span>·</span>
        <span>{input.timeline} months</span>
        <span>·</span>
        <span>{input.locationRisk} location</span>
        {input.highwayDetails && (
          <>
            <span>·</span>
            <span>{input.highwayDetails.totalDistance} km, {input.highwayDetails.numberOfLanes} lanes, {input.highwayDetails.pavementType}</span>
          </>
        )}
        {input.buildingDetails && (
          <>
            <span>·</span>
            <span>{input.buildingDetails.builtUpArea.toLocaleString('en-IN')} sq ft, {input.buildingDetails.numberOfFloors} floors, {input.buildingDetails.structureType}</span>
          </>
        )}
        {input.industrialDetails && (
          <>
            <span>·</span>
            <span>{input.industrialDetails.facilityType}, {input.industrialDetails.heavyMachineryCount} machines, {input.industrialDetails.powerSourcing}</span>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof TrendingDown;
  label: string;
  value: string;
  accent: 'accent' | 'emerald' | 'amber' | 'red';
}) {
  const colors: Record<string, string> = {
    accent: 'text-accent-400 border-accent-500/30 bg-accent-500/5',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    red: 'text-red-400 border-red-500/30 bg-red-500/5',
  };
  return (
    <div className={`card border p-5 ${colors[accent]}`}>
      <Icon className="mb-3 h-6 w-6" />
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold sm:text-2xl ${colors[accent].split(' ')[0]}`}>{value}</p>
    </div>
  );
}
