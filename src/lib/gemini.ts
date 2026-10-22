import { GoogleGenAI, Type } from '@google/genai';
import type {
  OptimizationResult,
  ProjectInput,
  CostBreakdownItem,
  Recommendation,
  RiskScore,
  MaterialAnalysis,
} from '@/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    totalPotentialSavings: { type: Type.NUMBER },
    savingsPercentage: { type: Type.NUMBER },
    riskScore: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
    riskScoreNumeric: { type: Type.NUMBER },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: ['Material', 'Scheduling', 'Logistics'] },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          estimatedSaving: { type: Type.NUMBER },
        },
        required: ['category', 'title', 'description', 'estimatedSaving'],
      },
    },
    costBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          original: { type: Type.NUMBER },
          optimized: { type: Type.NUMBER },
        },
        required: ['category', 'original', 'optimized'],
      },
    },
    materialAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          material: { type: Type.STRING },
          costImpact: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          recommended: { type: Type.BOOLEAN },
        },
        required: ['material', 'costImpact', 'reasoning', 'recommended'],
      },
    },
  },
  required: [
    'totalPotentialSavings',
    'savingsPercentage',
    'riskScore',
    'riskScoreNumeric',
    'recommendations',
    'costBreakdown',
    'materialAnalysis',
  ],
};

function buildProjectSpecificDetails(input: ProjectInput): string {
  if (input.highwayDetails) {
    const h = input.highwayDetails;
    return `Highway / Road specifics:
- Total distance: ${h.totalDistance} km
- Number of lanes: ${h.numberOfLanes}
- Pavement type: ${h.pavementType}`;
  }
  if (input.buildingDetails) {
    const b = input.buildingDetails;
    return `Building specifics:
- Total built-up area: ${b.builtUpArea} sq ft
- Number of floors: ${b.numberOfFloors}
- Structure type: ${b.structureType}`;
  }
  if (input.industrialDetails) {
    const ind = input.industrialDetails;
    return `Industrial plant specifics:
- Facility type: ${ind.facilityType}
- Heavy machinery count: ${ind.heavyMachineryCount}
- Power sourcing: ${ind.powerSourcing}`;
  }
  return '';
}

function buildPrompt(input: ProjectInput): string {
  const projectSpecifics = buildProjectSpecificDetails(input);

  return `You are an expert construction cost-optimization AI working with Indian Rupees (INR). Analyze the following engineering/construction project and return a structured optimization plan.

Project details:
- Project type: ${input.projectType}
- Initial estimated budget: Rs. ${input.budget.toLocaleString('en-IN')}
- Timeline: ${input.timeline} months
- Location risk level: ${input.locationRisk}

${projectSpecifics}

Based on the project type and the specific parameters above, determine which materials are best suited (e.g. Concrete, Steel, Rebar, Asphalt, Cement, Bricks, Aggregate, etc.) and analyze how each material choice affects the overall cost. Factor in the project-specific details — for example, pavement type for highways, structure type for buildings, and facility type / power sourcing for industrial plants — when calculating costs and recommending materials.

Return JSON with:
1. totalPotentialSavings: realistic INR savings achievable (8-18% of budget)
2. savingsPercentage: percentage of budget saved
3. riskScore: "Low", "Medium", or "High"
4. riskScoreNumeric: 0-100
5. recommendations: 3-4 actionable items across Material, Scheduling, Logistics categories with estimatedSaving in INR. Tailor recommendations to the project-specific parameters.
6. costBreakdown: 5-6 categories (e.g. Materials, Labor, Equipment, Logistics, Permits, Contingency) each with original and optimized INR amounts that sum close to the budget and optimized totals.
7. materialAnalysis: 4-5 materials relevant to the project type, each with costImpact (INR), reasoning (how this material affects cost and why it should or shouldn't be used), and recommended (boolean).`;
}

export async function generateOptimizationPlan(
  input: ProjectInput
): Promise<OptimizationResult> {
  if (!API_KEY) {
    return generateMockOptimization(input);
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: API_KEY });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: buildPrompt(input),
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini');

    const parsed = JSON.parse(text) as OptimizationResult;
    parsed.source = 'gemini';
    return parsed;
  } catch (err) {
    console.warn('Gemini API failed, falling back to mock data:', err);
    return generateMockOptimization(input);
  }
}

// ---- Mock fallback generator ----

function generateMockOptimization(input: ProjectInput): OptimizationResult {
  const basePct = input.projectType === 'Industrial Plant' ? 0.14
    : input.projectType === 'Highway Construction' ? 0.11
    : input.projectType === 'Commercial Building' ? 0.12
    : 0.13;

  const riskAdj = input.locationRisk === 'Coastal' ? 0.02
    : input.locationRisk === 'Remote' ? 0.015
    : 0;

  const timelineAdj = input.timeline > 18 ? 0.02 : input.timeline < 6 ? -0.02 : 0;

  // Project-specific adjustments
  let specAdj = 0;
  if (input.highwayDetails) {
    specAdj += input.highwayDetails.pavementType === 'Concrete' ? 0.01 : 0;
    specAdj += input.highwayDetails.numberOfLanes > 4 ? 0.005 : 0;
  } else if (input.buildingDetails) {
    specAdj += input.buildingDetails.structureType === 'Steel' ? 0.015 : 0;
    specAdj += input.buildingDetails.numberOfFloors > 10 ? 0.005 : 0;
  } else if (input.industrialDetails) {
    specAdj += input.industrialDetails.heavyMachineryCount > 15 ? 0.01 : 0;
    specAdj += input.industrialDetails.powerSourcing === 'Cogeneration' ? 0.01 : 0;
  }

  const savingsPercentage = Math.round((basePct + riskAdj + timelineAdj + specAdj) * 1000) / 10;
  const totalPotentialSavings = Math.round(input.budget * (savingsPercentage / 100));

  const riskScore: RiskScore = input.locationRisk === 'Coastal' ? 'High'
    : input.locationRisk === 'Remote' ? 'Medium' : 'Low';
  const riskScoreNumeric = riskScore === 'High' ? 75 : riskScore === 'Medium' ? 50 : 25;

  const breakdownDefs = [
    { category: 'Materials', share: 0.4, opt: 0.88 },
    { category: 'Labor', share: 0.25, opt: 0.95 },
    { category: 'Equipment', share: 0.15, opt: 0.9 },
    { category: 'Logistics', share: 0.1, opt: 0.82 },
    { category: 'Permits', share: 0.05, opt: 1.0 },
    { category: 'Contingency', share: 0.05, opt: 0.7 },
  ];

  const costBreakdown: CostBreakdownItem[] = breakdownDefs.map((d) => {
    const original = Math.round(input.budget * d.share);
    return {
      category: d.category,
      original,
      optimized: Math.round(original * d.opt),
    };
  });

  const materialMap: Record<string, { material: string; cost: number; reason: string; rec: boolean }[]> = {
    'Highway Construction': [
      { material: 'Asphalt', cost: Math.round(input.budget * 0.18), reason: 'Primary surfacing material — bulk procurement can reduce unit cost by 10-12%.', rec: true },
      { material: 'Concrete', cost: Math.round(input.budget * 0.12), reason: 'Used for bridges and culverts — high strength but costlier than asphalt per sq.m.', rec: true },
      { material: 'Steel', cost: Math.round(input.budget * 0.06), reason: 'Required for reinforcement in bridge structures — price volatility is a risk.', rec: true },
      { material: 'Rebar', cost: Math.round(input.budget * 0.04), reason: 'Essential for structural integrity — consider TMT bars for better cost-strength ratio.', rec: true },
    ],
    'Commercial Building': [
      { material: 'Concrete', cost: Math.round(input.budget * 0.16), reason: 'Foundation and structural frame — ready-mix concrete reduces labor cost by 15%.', rec: true },
      { material: 'Steel', cost: Math.round(input.budget * 0.14), reason: 'Structural framework — steel prices fluctuate; lock in rates early to save 8%.', rec: true },
      { material: 'Glass', cost: Math.round(input.budget * 0.06), reason: 'Facades — double-glazing adds upfront cost but saves on HVAC long-term.', rec: false },
      { material: 'Bricks', cost: Math.round(input.budget * 0.05), reason: 'Non-structural walls — fly-ash bricks are 20% cheaper than clay bricks.', rec: true },
    ],
    'Industrial Plant': [
      { material: 'Steel', cost: Math.round(input.budget * 0.2), reason: 'Primary structural material — pre-engineered buildings cut cost by 15%.', rec: true },
      { material: 'Concrete', cost: Math.round(input.budget * 0.1), reason: 'Foundation and flooring — high-grade concrete needed for heavy loads.', rec: true },
      { material: 'Rebar', cost: Math.round(input.budget * 0.05), reason: 'Reinforcement — bulk ordering from mills saves 10% vs retail.', rec: true },
      { material: 'Aluminium', cost: Math.round(input.budget * 0.04), reason: 'Cladding and roofing — lighter than steel but 30% more expensive.', rec: false },
    ],
    'Residential Complex': [
      { material: 'Concrete', cost: Math.round(input.budget * 0.18), reason: 'Foundation and slab — M20 grade is cost-effective for residential loads.', rec: true },
      { material: 'Bricks', cost: Math.round(input.budget * 0.1), reason: 'Wall construction — AAC blocks are 25% lighter and reduce foundation cost.', rec: true },
      { material: 'Steel', cost: Math.round(input.budget * 0.08), reason: 'Reinforcement — Fe500 grade offers better value than Fe415.', rec: true },
      { material: 'Cement', cost: Math.round(input.budget * 0.06), reason: 'Masonry and plastering — PPC cement is 15% cheaper than OPC with similar strength.', rec: true },
    ],
  };

  const matList = materialMap[input.projectType] || materialMap['Commercial Building'];
  const materialAnalysis: MaterialAnalysis[] = matList.map((m) => ({
    material: m.material,
    costImpact: m.cost,
    reasoning: m.reason,
    recommended: m.rec,
  }));

  const recs: Omit<Recommendation, 'estimatedSaving'>[] = [
    {
      category: 'Material',
      title: 'Bulk Procurement Strategy',
      description: `Consolidate material orders across project phases to leverage volume discounts and reduce unit cost by 8-12%. Source materials locally to cut transport overhead.`,
    },
    {
      category: 'Scheduling',
      title: 'Critical Path Compression',
      description: `Overlap non-dependent tasks to compress the ${input.timeline}-month timeline by 2-3 weeks, reducing overhead and equipment rental costs.`,
    },
    {
      category: 'Logistics',
      title: `Optimized ${input.locationRisk} Delivery Routes`,
      description: `Use just-in-time delivery scheduling to minimize on-site storage needs and reduce hauling costs, especially relevant for ${input.locationRisk.toLowerCase()} locations.`,
    },
    {
      category: 'Material',
      title: 'Alternative Supplier Sourcing',
      description: 'Identify secondary suppliers within a 250-km radius to create competitive bidding and reduce single-source dependency risk.',
    },
  ];

  const recommendations: Recommendation[] = recs.map((r, i) => ({
    ...r,
    estimatedSaving: Math.round(totalPotentialSavings * [0.35, 0.3, 0.2, 0.15][i]),
  }));

  return {
    totalPotentialSavings,
    savingsPercentage,
    riskScore,
    riskScoreNumeric,
    recommendations,
    costBreakdown,
    materialAnalysis,
    source: 'mock',
  };
}
