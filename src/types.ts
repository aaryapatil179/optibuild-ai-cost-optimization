export type ProjectType =
  | 'Highway Construction'
  | 'Commercial Building'
  | 'Industrial Plant'
  | 'Residential Complex';

export type LocationRisk = 'Urban' | 'Remote' | 'Coastal';

export type PavementType = 'Asphalt' | 'Concrete';
export type StructureType = 'RCC Frame' | 'Steel';
export type PowerSourcing = 'Grid Connected' | 'Solar Hybrid' | 'Diesel Generator' | 'Cogeneration';

export type FacilityType = 'Manufacturing' | 'Chemical Processing' | 'Warehousing' | 'Power Generation';

export type RiskScore = 'Low' | 'Medium' | 'High';

export type RecommendationCategory = 'Material' | 'Scheduling' | 'Logistics';

export interface HighwayDetails {
  totalDistance: number;
  numberOfLanes: number;
  pavementType: PavementType;
}

export interface BuildingDetails {
  builtUpArea: number;
  numberOfFloors: number;
  structureType: StructureType;
}

export interface IndustrialDetails {
  facilityType: FacilityType;
  heavyMachineryCount: number;
  powerSourcing: PowerSourcing;
}

export interface ProjectInput {
  projectType: ProjectType;
  budget: number;
  timeline: number;
  locationRisk: LocationRisk;
  highwayDetails?: HighwayDetails;
  buildingDetails?: BuildingDetails;
  industrialDetails?: IndustrialDetails;
}

export interface CostBreakdownItem {
  category: string;
  original: number;
  optimized: number;
}

export interface Recommendation {
  category: RecommendationCategory;
  title: string;
  description: string;
  estimatedSaving: number;
}

export interface MaterialAnalysis {
  material: string;
  costImpact: number;
  reasoning: string;
  recommended: boolean;
}

export interface OptimizationResult {
  totalPotentialSavings: number;
  savingsPercentage: number;
  riskScore: RiskScore;
  riskScoreNumeric: number;
  recommendations: Recommendation[];
  costBreakdown: CostBreakdownItem[];
  materialAnalysis: MaterialAnalysis[];
  source: 'gemini' | 'mock';
}
