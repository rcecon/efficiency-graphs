export type InterventionType = 'ceiling' | 'floor' | 'quota' | 'tax' | 'subsidy' | 'none';

export type SurplusDisplayMode = 
  | 'all' 
  | 'cs' 
  | 'ps' 
  | 'change_cs' 
  | 'change_ps' 
  | 'tax_total' 
  | 'tax_consumer' 
  | 'tax_producer' 
  | 'subsidy_total' 
  | 'subsidy_consumer' 
  | 'subsidy_producer' 
  | 'none';

export type QuestionCategory = 
  | 'introduce_intervention'
  | 'change_intervention'
  | 'tax_subsidy_change'
  | 'surplus_dwl_analysis'
  | 'under_overproduction';

export type QuestionSourceType = 
  | 'Source Question (Notes)'
  | 'Adapted HKDSE Question'
  | 'New Practice Question';

export interface DropdownBlank {
  id: string;
  placeholder: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  options: string[];
  misconceptionHints?: Record<string, string>;
}

export interface SentenceStep {
  id: string;
  stepNumber: number;
  title: string;
  purpose: string;
  sentencePrefix: string;
  blanks: DropdownBlank[];
  sentenceMidfix?: string[];
  blanksMid?: DropdownBlank[];
  sentenceSuffix: string;
  explanationOnCorrect: string;
  diagramFocus?: string;
}

export interface QuestionItem {
  id: string;
  title: string;
  sourceType: QuestionSourceType;
  officialRef?: string;
  marks: number;
  category: QuestionCategory;
  intervention: InterventionType;
  prompt: string;
  diagramPreset: {
    intervention: InterventionType;
    params: Record<string, number>;
    highlightDWL?: boolean;
    showShift?: boolean;
    shiftType?: 'left_supply' | 'right_supply' | 'tax_up' | 'subsidy_down' | 'floor_down';
    labelAnnotations?: Record<string, string>;
  };
  steps: SentenceStep[];
  modelAnswer: string;
  markingRubric: {
    point: string;
    marks: number;
  }[];
  diagramChecklist: string[];
  commonMistakes: string[];
}

export interface MarketState {
  a: number;
  b: number;
  c: number;
  d: number;

  interventionType: InterventionType;
  ceilingPrice: number;
  floorPrice: number;
  quotaQty: number;
  taxRate: number;
  subsidyRate: number;
}

export interface MarketMetrics {
  // Underlying geometry (for drawing accurate SVG lines/curves only)
  eqPrice: number;
  eqQty: number;
  transactedPrice: number;
  sellerPrice: number;
  transactedQty: number;
  isEffective: boolean;
  excessDemand: number;
  excessSupply: number;
  mbAtTransacted: number;
  mcAtTransacted: number;
  status: 'efficient' | 'underproduction' | 'overproduction';

  // Conceptual Textbook Area Descriptions (NO raw numbers)
  csAreaDesc: string;
  psAreaDesc: string;
  changeCsDesc: string;
  changePsDesc: string;
  changeCsDetail: {
    gainArea?: string;
    gainReason?: string;
    lossArea?: string;
    lossReason?: string;
    netConclusion: string;
  };
  changePsDetail: {
    gainArea?: string;
    gainReason?: string;
    lossArea?: string;
    lossReason?: string;
    netConclusion: string;
  };
  // Tax Burden & Subsidy Benefit Descriptions (for Unit Tax & Unit Subsidy)
  taxBurdenTotalArea?: string;
  taxBurdenConsumerArea?: string;
  taxBurdenProducerArea?: string;
  taxBurdenDetail?: {
    consumerPerUnit: string;
    producerPerUnit: string;
    totalRevenue: string;
    consumerShareRatio: string;
    producerShareRatio: string;
    elasticityNote: string;
  };
  subsidyBenefitTotalArea?: string;
  subsidyBenefitConsumerArea?: string;
  subsidyBenefitProducerArea?: string;
  subsidyBenefitDetail?: {
    consumerPerUnit: string;
    producerPerUnit: string;
    totalExpenditure: string;
    consumerShareRatio: string;
    producerShareRatio: string;
    elasticityNote: string;
  };
  dwlAreaDesc: string;
  tssFormula: string;
  csChange: 'increase' | 'decrease' | 'uncertain' | 'none';
  psChange: 'increase' | 'decrease' | 'uncertain' | 'none';
}
