import { useState } from 'react';
import {
  Building2,
  Factory,
  Route,
  Home,
  IndianRupee,
  CalendarClock,
  MapPin,
  Sparkles,
  Loader2,
  Ruler,
  Layers,
  Square,
  Building,
  Cpu,
  Zap,
  Wrench,
  Construction,
} from 'lucide-react';
import type {
  ProjectInput,
  ProjectType,
  LocationRisk,
  PavementType,
  StructureType,
  PowerSourcing,
  FacilityType,
} from '@/types';

const PROJECT_TYPES: { value: ProjectType; icon: typeof Route; desc: string }[] = [
  { value: 'Highway Construction', icon: Route, desc: 'Roads, bridges & infrastructure' },
  { value: 'Commercial Building', icon: Building2, desc: 'Offices, retail & mixed-use' },
  { value: 'Industrial Plant', icon: Factory, desc: 'Factories & processing facilities' },
  { value: 'Residential Complex', icon: Home, desc: 'Housing developments' },
];

const RISKS: { value: LocationRisk; desc: string }[] = [
  { value: 'Urban', desc: 'Dense city — logistics heavy' },
  { value: 'Remote', desc: 'Isolated site — supply chain risk' },
  { value: 'Coastal', desc: 'Waterfront — weather & corrosion' },
];

const PAVEMENT_TYPES: PavementType[] = ['Asphalt', 'Concrete'];
const STRUCTURE_TYPES: StructureType[] = ['RCC Frame', 'Steel'];
const POWER_SOURCES: PowerSourcing[] = ['Grid Connected', 'Solar Hybrid', 'Diesel Generator', 'Cogeneration'];
const FACILITY_TYPES: FacilityType[] = ['Manufacturing', 'Chemical Processing', 'Warehousing', 'Power Generation'];

interface Props {
  onSubmit: (input: ProjectInput) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: Props) {
  const [projectType, setProjectType] = useState<ProjectType>('Commercial Building');
  const [budget, setBudget] = useState<string>('5000000');
  const [timeline, setTimeline] = useState<string>('18');
  const [locationRisk, setLocationRisk] = useState<LocationRisk>('Urban');

  // Highway-specific
  const [totalDistance, setTotalDistance] = useState<string>('25');
  const [numberOfLanes, setNumberOfLanes] = useState<string>('4');
  const [pavementType, setPavementType] = useState<PavementType>('Asphalt');

  // Building-specific (Commercial + Residential)
  const [builtUpArea, setBuiltUpArea] = useState<string>('50000');
  const [numberOfFloors, setNumberOfFloors] = useState<string>('5');
  const [structureType, setStructureType] = useState<StructureType>('RCC Frame');

  // Industrial-specific
  const [facilityType, setFacilityType] = useState<FacilityType>('Manufacturing');
  const [heavyMachineryCount, setHeavyMachineryCount] = useState<string>('10');
  const [powerSourcing, setPowerSourcing] = useState<PowerSourcing>('Grid Connected');

  const isHighway = projectType === 'Highway Construction';
  const isBuilding = projectType === 'Commercial Building' || projectType === 'Residential Complex';
  const isIndustrial = projectType === 'Industrial Plant';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProjectInput = {
      projectType,
      budget: Number(budget) || 0,
      timeline: Number(timeline) || 0,
      locationRisk,
    };

    if (isHighway) {
      payload.highwayDetails = {
        totalDistance: Number(totalDistance) || 0,
        numberOfLanes: Number(numberOfLanes) || 0,
        pavementType,
      };
    } else if (isIndustrial) {
      payload.industrialDetails = {
        facilityType,
        heavyMachineryCount: Number(heavyMachineryCount) || 0,
        powerSourcing,
      };
    } else if (isBuilding) {
      payload.buildingDetails = {
        builtUpArea: Number(builtUpArea) || 0,
        numberOfFloors: Number(numberOfFloors) || 0,
        structureType,
      };
    }

    onSubmit(payload);
  };

  const budgetNum = Number(budget) || 0;
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Type */}
      <div>
        <label className="label">Project Type</label>
        <div className="grid grid-cols-2 gap-3">
          {PROJECT_TYPES.map(({ value, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setProjectType(value)}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                projectType === value
                  ? 'border-accent-500 bg-accent-500/10 shadow-glow'
                  : 'border-slate-700 bg-slate-850 hover:border-slate-600'
              }`}
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  projectType === value ? 'text-accent-400' : 'text-slate-500'
                }`}
              />
              <div>
                <p className={`text-sm font-medium ${projectType === value ? 'text-white' : 'text-slate-300'}`}>
                  {value}
                </p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget + Timeline */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label flex items-center gap-1.5">
            <IndianRupee className="h-3.5 w-3.5" /> Initial Estimated Budget
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">Rs.</span>
            <input
              type="number"
              min="100000"
              step="100000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="input-field pl-10"
              placeholder="50,00,000"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {budgetNum > 0 && budgetNum.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" /> Timeline (Months)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="input-field"
            placeholder="18"
          />
          <p className="mt-1 text-xs text-slate-500">
            {Number(timeline) > 0 && `${Math.floor(Number(timeline) / 12)}y ${Number(timeline) % 12}m`}
          </p>
        </div>
      </div>

      {/* Dynamic project-specific fields */}
      {isHighway && (
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Highway / Road Details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5" /> Total Distance (km)
              </label>
              <input
                type="number"
                min="1"
                value={totalDistance}
                onChange={(e) => setTotalDistance(e.target.value)}
                className="input-field"
                placeholder="25"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Number of Lanes
              </label>
              <input
                type="number"
                min="2"
                max="12"
                value={numberOfLanes}
                onChange={(e) => setNumberOfLanes(e.target.value)}
                className="input-field"
                placeholder="4"
              />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Construction className="h-3.5 w-3.5" /> Pavement Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PAVEMENT_TYPES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPavementType(p)}
                  className={`rounded-lg border p-3 text-center text-sm font-medium transition-all ${
                    pavementType === p
                      ? 'border-accent-500 bg-accent-500/10 text-accent-300'
                      : 'border-slate-700 bg-slate-850 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isBuilding && (
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">
            {projectType === 'Residential Complex' ? 'Residential' : 'Commercial'} Building Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label flex items-center gap-1.5">
                <Square className="h-3.5 w-3.5" /> Total Built-up Area (sq ft)
              </label>
              <input
                type="number"
                min="100"
                value={builtUpArea}
                onChange={(e) => setBuiltUpArea(e.target.value)}
                className="input-field"
                placeholder="50,000"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" /> Number of Floors
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={numberOfFloors}
                onChange={(e) => setNumberOfFloors(e.target.value)}
                className="input-field"
                placeholder="5"
              />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Structure Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {STRUCTURE_TYPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStructureType(s)}
                  className={`rounded-lg border p-3 text-center text-sm font-medium transition-all ${
                    structureType === s
                      ? 'border-accent-500 bg-accent-500/10 text-accent-300'
                      : 'border-slate-700 bg-slate-850 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isIndustrial && (
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Industrial Plant Details</p>
          <div>
            <label className="label flex items-center gap-1.5">
              <Factory className="h-3.5 w-3.5" /> Facility Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FACILITY_TYPES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFacilityType(f)}
                  className={`rounded-lg border p-3 text-center text-sm font-medium transition-all ${
                    facilityType === f
                      ? 'border-accent-500 bg-accent-500/10 text-accent-300'
                      : 'border-slate-700 bg-slate-850 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" /> Heavy Machinery Count
              </label>
              <input
                type="number"
                min="0"
                value={heavyMachineryCount}
                onChange={(e) => setHeavyMachineryCount(e.target.value)}
                className="input-field"
                placeholder="10"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Power Sourcing
              </label>
              <div className="grid grid-cols-2 gap-2">
                {POWER_SOURCES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPowerSourcing(p)}
                    className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition-all ${
                      powerSourcing === p
                        ? 'border-accent-500 bg-accent-500/10 text-accent-300'
                        : 'border-slate-700 bg-slate-850 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Risk */}
      <div>
        <label className="label flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> Location Risk Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {RISKS.map(({ value, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLocationRisk(value)}
              className={`rounded-lg border p-3 text-center transition-all ${
                locationRisk === value
                  ? value === 'Coastal'
                    ? 'border-amber-500 bg-amber-500/10'
                    : value === 'Remote'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-850 hover:border-slate-600'
              }`}
            >
              <p className={`text-sm font-semibold ${locationRisk === value ? 'text-white' : 'text-slate-300'}`}>
                {value}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button type="submit" disabled={loading} className="btn-primary w-full text-base">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Analyzing project...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" /> Generate AI Optimization Plan
            </>
          )}
        </button>
        {!hasGeminiKey && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Running in demo mode with simulated AI analysis
          </p>
        )}
      </div>
    </form>
  );
}
