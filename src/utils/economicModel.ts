import { MarketState, MarketMetrics } from '../types/economics';

export const DEFAULT_MARKET_STATE: MarketState = {
  a: 100,
  b: 1,
  c: 10,
  d: 0.8,
  interventionType: 'none',
  ceilingPrice: 50,
  floorPrice: 50,
  quotaQty: 50,
  taxRate: 0,
  subsidyRate: 0,
};

export function calculateMarketMetrics(state: MarketState): MarketMetrics {
  const { a, b, c, d, interventionType, ceilingPrice, floorPrice, quotaQty, taxRate, subsidyRate } = state;

  // Unregulated Competitive Equilibrium (Internal coordinate baseline)
  const eqQty = (a - c) / (b + d);
  const eqPrice = a - b * eqQty;

  let transactedPrice = eqPrice;
  let sellerPrice = eqPrice;
  let transactedQty = eqQty;
  let isEffective = false;
  let excessDemand = 0;
  let excessSupply = 0;
  let status: 'efficient' | 'underproduction' | 'overproduction' = 'efficient';
  let csChange: 'increase' | 'decrease' | 'uncertain' | 'none' = 'none';
  let psChange: 'increase' | 'decrease' | 'uncertain' | 'none' = 'none';

  let csAreaDesc = 'Shaded Light Blue Triangle (below Demand down to Pe)';
  let psAreaDesc = 'Shaded Amber Triangle (above Supply up to Pe)';
  let changeCsDesc = 'Benchmark (Maximum Consumer Surplus)';
  let changePsDesc = 'Benchmark (Maximum Producer Surplus)';
  let dwlAreaDesc = 'Zero (Efficiency Attained: MB = MC)';
  let tssFormula = 'CS + PS (Maximised Social Surplus)';

  let changeCsDetail: {
    gainArea?: string;
    gainReason?: string;
    lossArea?: string;
    lossReason?: string;
    netConclusion: string;
  } = {
    netConclusion: 'Benchmark equilibrium',
  };
  let changePsDetail: {
    gainArea?: string;
    gainReason?: string;
    lossArea?: string;
    lossReason?: string;
    netConclusion: string;
  } = {
    netConclusion: 'Benchmark equilibrium',
  };

  let taxBurdenTotalArea: string | undefined;
  let taxBurdenConsumerArea: string | undefined;
  let taxBurdenProducerArea: string | undefined;
  let taxBurdenDetail: MarketMetrics['taxBurdenDetail'];

  let subsidyBenefitTotalArea: string | undefined;
  let subsidyBenefitConsumerArea: string | undefined;
  let subsidyBenefitProducerArea: string | undefined;
  let subsidyBenefitDetail: MarketMetrics['subsidyBenefitDetail'];

  switch (interventionType) {
    case 'ceiling': {
      if (ceilingPrice < eqPrice) {
        isEffective = true;
        transactedPrice = ceilingPrice;
        sellerPrice = ceilingPrice;
        const qSupply = Math.max(0, (ceilingPrice - c) / d);
        const qDemand = Math.max(0, (a - ceilingPrice) / b);
        transactedQty = Math.min(qSupply, qDemand);
        excessDemand = Math.max(0, qDemand - qSupply);

        status = 'underproduction';
        csChange = 'uncertain';
        psChange = 'decrease';

        csAreaDesc = 'Shaded Light Blue Area (below Demand down to Price Ceiling Pc across Qc)';
        psAreaDesc = 'Shaded Amber Triangle (above Supply up to Price Ceiling Pc across Qc)';
        changeCsDesc = '+ Green Gain − Red Loss (Uncertain effect on CS)';
        changePsDesc = '− Red Loss (Decreases unambiguously)';
        dwlAreaDesc = 'Red Shaded Triangle between Qc and Q* (Deadweight Loss from underproduction)';
        tssFormula = 'CS + PS (TSS reduced by Red Deadweight Loss)';

        changeCsDetail = {
          gainArea: 'Green Shaded Region (lower price on Qc)',
          gainReason: 'Consumers who buy pay a lower price Pc (Green shaded gain in CS)',
          lossArea: 'Red Shaded Region (underproduction from Qc to Q*)',
          lossReason: 'Quantity supplied drops to Qc due to shortage, so some consumers cannot buy the good (Red shaded loss in CS)',
          netConclusion: 'Uncertain: depends on whether the Green gain is larger than the Red loss',
        };

        changePsDetail = {
          lossArea: 'Red Shaded Region (lower price Pc and drop in sales to Qc)',
          lossReason: 'Producers charge a lower price Pc for all units and produce a lower quantity Qc (Red shaded loss in PS)',
          netConclusion: 'Decreases unambiguously (entire change is a Red shaded loss)',
        };
      }
      break;
    }

    case 'floor': {
      if (floorPrice > eqPrice) {
        isEffective = true;
        transactedPrice = floorPrice;
        sellerPrice = floorPrice;
        const qSupply = Math.max(0, (floorPrice - c) / d);
        const qDemand = Math.max(0, (a - floorPrice) / b);
        transactedQty = Math.min(qSupply, qDemand);
        excessSupply = Math.max(0, qSupply - qDemand);

        status = 'underproduction';
        csChange = 'decrease';
        psChange = 'uncertain';

        csAreaDesc = 'Shaded Light Blue Triangle (below Demand down to Price Floor Pf across Qf)';
        psAreaDesc = 'Shaded Amber Area (above Supply up to Price Floor Pf across Qf)';
        changeCsDesc = '− Red Loss (Decreases unambiguously)';
        changePsDesc = '+ Green Gain − Red Loss (Uncertain effect on PS)';
        dwlAreaDesc = 'Red Shaded Triangle between Qf and Q* (Deadweight Loss from underproduction)';
        tssFormula = 'CS + PS (TSS reduced by Red Deadweight Loss)';

        changeCsDetail = {
          lossArea: 'Red Shaded Region (higher price Pf and drop in sales to Qf)',
          lossReason: 'Consumers have to pay a higher price Pf and quantity demanded decreases to Qf (Red shaded loss in CS)',
          netConclusion: 'Decreases unambiguously (entire change is a Red shaded loss)',
        };

        changePsDetail = {
          gainArea: 'Green Shaded Region (higher price Pf on Qf sold)',
          gainReason: 'Producers sell transacted units Qf at a higher price Pf (Green shaded gain in PS)',
          lossArea: 'Red Shaded Region (unsold output from Qf to Q*)',
          lossReason: 'Quantity transacted drops to Qf due to surplus, so fewer units can be sold (Red shaded loss in PS)',
          netConclusion: 'Uncertain: depends on whether the Green gain is larger than the Red loss',
        };
      }
      break;
    }

    case 'quota': {
      if (quotaQty < eqQty) {
        isEffective = true;
        transactedQty = quotaQty;
        transactedPrice = a - b * quotaQty;
        sellerPrice = transactedPrice;

        status = 'underproduction';
        csChange = 'decrease';
        psChange = 'uncertain';

        csAreaDesc = 'Shaded Light Blue Triangle (below Demand down to Quota Price Pq across Qq)';
        psAreaDesc = 'Shaded Amber Area (above Supply up to Quota Price Pq across Qq)';
        changeCsDesc = '− Red Loss (Decreases unambiguously)';
        changePsDesc = '+ Green Gain − Red Loss (Uncertain effect on PS)';
        dwlAreaDesc = 'Red Shaded Triangle between Qq and Q* (Deadweight Loss from underproduction)';
        tssFormula = 'CS + PS (TSS reduced by Red Deadweight Loss)';

        changeCsDetail = {
          lossArea: 'Red Shaded Region (higher price Pq and restricted quantity Qq)',
          lossReason: 'Price rises to Pq and quantity available is restricted to Qq (Red shaded loss in CS)',
          netConclusion: 'Decreases unambiguously (entire change is a Red shaded loss)',
        };

        changePsDetail = {
          gainArea: 'Green Shaded Region (higher price Pq on restricted Qq)',
          gainReason: 'Producers sell restricted units Qq at a higher price Pq (Green shaded gain in PS)',
          lossArea: 'Red Shaded Region (restricted output from Qq to Q*)',
          lossReason: 'Quantity transacted decreases from Q* to Qq (Red shaded loss in PS)',
          netConclusion: 'Uncertain: depends on whether the Green gain is larger than the Red loss',
        };
      }
      break;
    }

    case 'tax': {
      if (taxRate > 0) {
        isEffective = true;
        transactedQty = Math.max(0, (a - c - taxRate) / (b + d));
        transactedPrice = a - b * transactedQty;
        sellerPrice = transactedPrice - taxRate;

        status = 'underproduction';
        csChange = 'decrease';
        psChange = 'decrease';

        csAreaDesc = 'Shaded Light Blue Triangle (below Demand down to Buyer Price P₁ across Q₁)';
        psAreaDesc = 'Shaded Amber Triangle (above original Supply S₀ up to Net Seller Price P₂ across Q₁)';
        changeCsDesc = '− Red Loss (Decreases unambiguously)';
        changePsDesc = '− Red Loss (Decreases unambiguously)';
        dwlAreaDesc = 'Red Shaded Triangle between Q₁ and Q* (Deadweight Loss from underproduction)';
        tssFormula = 'CS + PS + Tax Revenue (TSS reduced by Red Deadweight Loss)';

        changeCsDetail = {
          lossArea: 'Red Shaded Region (higher buyer price P₁ and quantity falling to Q₁)',
          lossReason: 'Price paid by consumers increases to P₁ and quantity transacted drops to Q₁ (Red shaded loss in CS)',
          netConclusion: 'Decreases unambiguously (entire change is a Red shaded loss)',
        };

        changePsDetail = {
          lossArea: 'Red Shaded Region (lower net seller price P₂ and quantity falling to Q₁)',
          lossReason: 'Net price received by producers drops to P₂ and quantity transacted drops to Q₁ (Red shaded loss in PS)',
          netConclusion: 'Decreases unambiguously (entire change is a Red shaded loss)',
        };

        taxBurdenTotalArea = 'Indigo Rectangle between P₁ (buyer price), P₂ (seller price) and Q₁';
        taxBurdenConsumerArea = 'Upper Blue Rectangle (Area between P₁, Pe and Q₁)';
        taxBurdenProducerArea = 'Lower Amber Rectangle (Area between Pe, P₂ and Q₁)';
        taxBurdenDetail = {
          consumerPerUnit: 'P₁ - Pe (Rise in price paid by buyers)',
          producerPerUnit: 'Pe - P₂ (Fall in net price received by sellers)',
          totalRevenue: 'Total Tax Revenue = t × Q₁ = (P₁ - P₂) × Q₁',
          consumerShareRatio: 'Consumer Tax Burden = (P₁ - Pe) × Q₁',
          producerShareRatio: 'Producer Tax Burden = (Pe - P₂) × Q₁',
          elasticityNote: 'Relative tax burden depends on relative price elasticities of demand and supply: the less elastic side bears a larger share of the tax burden.',
        };
      }
      break;
    }

    case 'subsidy': {
      if (subsidyRate > 0) {
        isEffective = true;
        transactedQty = Math.max(0, (a - c + subsidyRate) / (b + d));
        transactedPrice = Math.max(0, a - b * transactedQty);
        sellerPrice = transactedPrice + subsidyRate;

        status = 'overproduction';
        csChange = 'increase';
        psChange = 'increase';

        csAreaDesc = 'Shaded Light Blue Area (below Demand down to Buyer Price P₁ across Q₁)';
        psAreaDesc = 'Shaded Amber Area (above original Supply S₀ up to Net Producer Price P₂ across Q₁)';
        changeCsDesc = '+ Green Gain (Increases unambiguously)';
        changePsDesc = '+ Green Gain (Increases unambiguously)';
        dwlAreaDesc = 'Red Shaded Triangle between Q* and Q₁ (Overproduction Deadweight Loss where MC > MB)';
        tssFormula = 'CS + PS − Total Subsidy Expenditure (TSS reduced by Red Deadweight Loss)';

        changeCsDetail = {
          gainArea: 'Green Shaded Region (lower buyer price P₁ and quantity expanding to Q₁)',
          gainReason: 'Price paid by buyers decreases to P₁ and quantity transacted increases to Q₁ (Green shaded gain in CS)',
          netConclusion: 'Increases unambiguously (entire change is a Green shaded gain)',
        };

        changePsDetail = {
          gainArea: 'Green Shaded Region (higher net producer price P₂ and quantity expanding to Q₁)',
          gainReason: 'Net price received by producers increases to P₂ and quantity transacted increases to Q₁ (Green shaded gain in PS)',
          netConclusion: 'Increases unambiguously (entire change is a Green shaded gain)',
        };

        subsidyBenefitTotalArea = 'Emerald Rectangle between P₂ (seller price), P₁ (buyer price) and Q₁';
        subsidyBenefitConsumerArea = 'Lower Cyan Rectangle (Area between Pe, P₁ and Q₁)';
        subsidyBenefitProducerArea = 'Upper Emerald Rectangle (Area between P₂, Pe and Q₁)';
        subsidyBenefitDetail = {
          consumerPerUnit: 'Pe - P₁ (Fall in price paid by buyers)',
          producerPerUnit: 'P₂ - Pe (Rise in net price received by sellers)',
          totalExpenditure: 'Total Subsidy Expenditure = s × Q₁ = (P₂ - P₁) × Q₁',
          consumerShareRatio: 'Consumer Subsidy Benefit = (Pe - P₁) × Q₁',
          producerShareRatio: 'Producer Subsidy Benefit = (P₂ - Pe) × Q₁',
          elasticityNote: 'Relative subsidy benefit depends on relative price elasticities of demand and supply: the less elastic side enjoys a larger share of the subsidy benefit.',
        };
      }
      break;
    }

    case 'none':
    default: {
      isEffective = false;
      transactedPrice = eqPrice;
      sellerPrice = eqPrice;
      transactedQty = eqQty;
      status = 'efficient';
      break;
    }
  }

  const mbAtTransacted = Math.max(0, a - b * transactedQty);
  const mcAtTransacted = c + d * transactedQty;

  return {
    eqPrice,
    eqQty,
    transactedPrice,
    sellerPrice,
    transactedQty,
    isEffective,
    excessDemand,
    excessSupply,
    mbAtTransacted,
    mcAtTransacted,
    status,
    csAreaDesc,
    psAreaDesc,
    changeCsDesc,
    changePsDesc,
    changeCsDetail,
    changePsDetail,
    taxBurdenTotalArea,
    taxBurdenConsumerArea,
    taxBurdenProducerArea,
    taxBurdenDetail,
    subsidyBenefitTotalArea,
    subsidyBenefitConsumerArea,
    subsidyBenefitProducerArea,
    subsidyBenefitDetail,
    dwlAreaDesc,
    tssFormula,
    csChange,
    psChange,
  };
}
