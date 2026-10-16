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

  let csAreaDesc = 'Area Pe A E0';
  let psAreaDesc = 'Area B Pe E0';
  let changeCsDesc = 'Benchmark (Maximum Consumer Surplus)';
  let changePsDesc = 'Benchmark (Maximum Producer Surplus)';
  let dwlAreaDesc = 'Zero (Efficiency Attained: MB = MC)';
  let tssFormula = 'CS + PS = Area B A E0';

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

        csAreaDesc = 'Area Pc A C F';
        psAreaDesc = 'Area B Pc F';
        changeCsDesc = '- Area C + Area E (Uncertain)';
        changePsDesc = '- Area E - Area F (Decreases)';
        dwlAreaDesc = 'Area C + F';
        tssFormula = 'CS + PS = Area B A C F';

        changeCsDetail = {
          gainArea: 'Area E',
          gainReason: 'Price decreases to Pc, so consumers who buy pay a lower price (Gain in CS)',
          lossArea: 'Area C',
          lossReason: 'Quantity supplied drops to Qc, so some consumers cannot buy the good (Loss in CS)',
          netConclusion: 'Uncertain (depends on whether Area E is larger than Area C)',
        };

        changePsDetail = {
          lossArea: 'Area E + Area F',
          lossReason: 'Producers charge a lower price Pc and produce a lower quantity Qc',
          netConclusion: 'Decreases unambiguously',
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

        csAreaDesc = 'Area Pf A C';
        psAreaDesc = 'Area B Pf C F';
        changeCsDesc = '- Area B - Area C (Decreases)';
        changePsDesc = '+ Area B - Area F (Uncertain)';
        dwlAreaDesc = 'Area C + F';
        tssFormula = 'CS + PS = Area B A C F';

        changeCsDetail = {
          lossArea: 'Area B + Area C',
          lossReason: 'Consumers have to pay a higher price Pf and quantity demanded decreases to Qf',
          netConclusion: 'Decreases unambiguously',
        };

        changePsDetail = {
          gainArea: 'Area B',
          gainReason: 'Some producers sell their product at a higher price Pf (Gain in PS)',
          lossArea: 'Area F',
          lossReason: 'Quantity transacted drops to Qf, so some output cannot be sold (Loss in PS)',
          netConclusion: 'Uncertain (depends on whether Area B is larger than Area F)',
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

        csAreaDesc = 'Area Pq A E1';
        psAreaDesc = 'Area B Pq E1 F';
        changeCsDesc = '- Area B - Area C (Decreases)';
        changePsDesc = '+ Area B - Area F (Uncertain)';
        dwlAreaDesc = 'Area C + F';
        tssFormula = 'CS + PS = Area B A E1 F';

        changeCsDetail = {
          lossArea: 'Area B + Area C',
          lossReason: 'Price rises to Pq and quantity available is restricted to Qq',
          netConclusion: 'Decreases unambiguously',
        };

        changePsDetail = {
          gainArea: 'Area B',
          gainReason: 'Producers sell at a higher price Pq (Gain in PS)',
          lossArea: 'Area F',
          lossReason: 'Quantity transacted decreases to Qq (Loss in PS)',
          netConclusion: 'Uncertain (depends on whether Area B is larger than Area F)',
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

        csAreaDesc = 'Area P1 A E1';
        psAreaDesc = 'Area B P2 F';
        changeCsDesc = '- Area B - Area C - Area E (Decreases)';
        changePsDesc = '- Area F - Area G (Decreases)';
        dwlAreaDesc = 'Area E + G';
        tssFormula = 'CS + PS + Tax Revenue (Area B+C+F)';

        changeCsDetail = {
          lossArea: 'Area B + Area C + Area E',
          lossReason: 'Price paid by consumers increases to P1 and quantity transacted drops to Q1',
          netConclusion: 'Decreases unambiguously',
        };

        changePsDetail = {
          lossArea: 'Area F + Area G',
          lossReason: 'Net price received by producers drops to P2 and quantity transacted drops to Q1',
          netConclusion: 'Decreases unambiguously',
        };

        taxBurdenTotalArea = 'Rectangle P2 P1 E1 F (Area between P1, P2 and Q1)';
        taxBurdenConsumerArea = 'Upper Rectangle (Area between P1, Pe and Q1)';
        taxBurdenProducerArea = 'Lower Rectangle (Area between Pe, P2 and Q1)';
        taxBurdenDetail = {
          consumerPerUnit: 'P1 - Pe (Rise in price paid by buyers)',
          producerPerUnit: 'Pe - P2 (Fall in net price received by sellers)',
          totalRevenue: 'Total Tax Revenue = t × Q1 = (P1 - P2) × Q1',
          consumerShareRatio: 'Consumer Tax Burden = (P1 - Pe) × Q1',
          producerShareRatio: 'Producer Tax Burden = (Pe - P2) × Q1',
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

        csAreaDesc = 'Area P1 A E1';
        psAreaDesc = 'Area B P2 F';
        changeCsDesc = '+ Area C + Area J + Area K (Increases)';
        changePsDesc = '+ Area B + Area F (Increases)';
        dwlAreaDesc = 'Area H + L';
        tssFormula = 'CS + PS - Total Subsidy';

        changeCsDetail = {
          gainArea: 'Area C + Area J + Area K',
          gainReason: 'Price paid decreases to P1 and quantity transacted increases to Q1',
          netConclusion: 'Increases unambiguously',
        };

        changePsDetail = {
          gainArea: 'Area B + Area F',
          gainReason: 'Price received by producers increases to P2 and quantity transacted increases to Q1',
          netConclusion: 'Increases unambiguously',
        };

        subsidyBenefitTotalArea = 'Rectangle P1 P2 F E1 (Area between P2, P1 and Q1)';
        subsidyBenefitConsumerArea = 'Lower Rectangle (Area between Pe, P1 and Q1)';
        subsidyBenefitProducerArea = 'Upper Rectangle (Area between P2, Pe and Q1)';
        subsidyBenefitDetail = {
          consumerPerUnit: 'Pe - P1 (Fall in price paid by buyers)',
          producerPerUnit: 'P2 - Pe (Rise in net price received by sellers)',
          totalExpenditure: 'Total Subsidy Expenditure = s × Q1 = (P2 - P1) × Q1',
          consumerShareRatio: 'Consumer Subsidy Benefit = (Pe - P1) × Q1',
          producerShareRatio: 'Producer Subsidy Benefit = (P2 - Pe) × Q1',
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
