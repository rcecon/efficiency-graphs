import React from 'react';
import { MarketState, MarketMetrics, SurplusDisplayMode } from '../types/economics';

interface MarketGraphProps {
  state: MarketState;
  metrics: MarketMetrics;
  displayMode?: SurplusDisplayMode;
  onDisplayModeChange?: (mode: SurplusDisplayMode) => void;
  secondaryState?: MarketState;
  secondaryMetrics?: MarketMetrics;
  comparisonView?: 'primary' | 'secondary' | 'overlay';
  onComparisonViewChange?: (view: 'primary' | 'secondary' | 'overlay') => void;
  showShiftComparison?: boolean;
  shiftComparisonType?: 'left_supply' | 'right_supply' | 'floor_down' | 'tax_up' | 'subsidy_down';
  customLabels?: Record<string, string>;
  width?: number;
  height?: number;
}

export const MarketGraph: React.FC<MarketGraphProps> = ({
  state,
  metrics,
  displayMode = 'all',
  onDisplayModeChange,
  secondaryState,
  secondaryMetrics,
  comparisonView = 'primary',
  onComparisonViewChange,
  customLabels,
  width = 620,
  height = 430,
}) => {
  // SVG coordinate transformation
  const padding = { top: 35, right: 35, bottom: 45, left: 55 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxQ = 90;
  const maxP = 110;

  const toSvgX = (q: number) => padding.left + (Math.max(0, Math.min(q, maxQ)) / maxQ) * plotWidth;
  const toSvgY = (p: number) => padding.top + plotHeight - (Math.max(0, Math.min(p, maxP)) / maxP) * plotHeight;

  const isComparing = Boolean(secondaryState && secondaryMetrics);
  const activeState = (isComparing && comparisonView === 'secondary') ? secondaryState! : state;
  const activeMetrics = (isComparing && comparisonView === 'secondary') ? secondaryMetrics! : metrics;

  const { a, b, c, d } = state;
  const interventionType = activeState.interventionType;
  const { ceilingPrice, floorPrice, quotaQty, taxRate, subsidyRate } = activeState;
  const { eqPrice, eqQty, transactedPrice, sellerPrice, transactedQty, isEffective, status } = activeMetrics;

  // Pure un-clamped SVG Y coordinate calculation for drawing mathematically exact lines that extend cleanly across the plot
  const toSvgYRaw = (p: number) => padding.top + plotHeight - (p / maxP) * plotHeight;

  // Demand line endpoints
  const dStart = { x: toSvgX(0), y: toSvgY(a) };
  const dEndQ = Math.min(maxQ, a / b);
  const dEnd = { x: toSvgX(dEndQ), y: toSvgY(a - b * dEndQ) };

  // Supply S0 line endpoints (strictly slope d across plot)
  const s0Line = {
    x1: toSvgX(0),
    y1: toSvgYRaw(c),
    x2: toSvgX(maxQ),
    y2: toSvgYRaw(c + d * maxQ),
  };
  const sStart = { x: s0Line.x1, y: s0Line.y1 };
  const sEnd = { x: s0Line.x2, y: s0Line.y2 };

  // Shifted supply lines: mathematically 100% strictly parallel to S0 (exact identical slope d across full span)
  const s1TaxLine = {
    x1: toSvgX(0),
    y1: toSvgYRaw(c + state.taxRate),
    x2: toSvgX(maxQ),
    y2: toSvgYRaw(c + state.taxRate + d * maxQ),
  };
  const s2TaxLine = secondaryState ? {
    x1: toSvgX(0),
    y1: toSvgYRaw(c + secondaryState.taxRate),
    x2: toSvgX(maxQ),
    y2: toSvgYRaw(c + secondaryState.taxRate + d * maxQ),
  } : null;

  const s1SubsidyLine = {
    x1: toSvgX(0),
    y1: toSvgYRaw(c - state.subsidyRate),
    x2: toSvgX(maxQ),
    y2: toSvgYRaw(c - state.subsidyRate + d * maxQ),
  };
  const s2SubsidyLine = secondaryState ? {
    x1: toSvgX(0),
    y1: toSvgYRaw(c - secondaryState.subsidyRate),
    x2: toSvgX(maxQ),
    y2: toSvgYRaw(c - secondaryState.subsidyRate + d * maxQ),
  } : null;

  // Key coordinates for active state
  const eqX = toSvgX(eqQty);
  const eqY = toSvgY(eqPrice);
  const transX = toSvgX(transactedQty);
  const pBuyerY = toSvgY(transactedPrice);
  const pSellerY = toSvgY(sellerPrice);
  const mcAtTransY = toSvgY(c + d * transactedQty);
  const mbAtTransY = toSvgY(a - b * transactedQty);

  // Policy 1 primary coordinates (for comparison and overlay)
  const primaryTransX = toSvgX(metrics.transactedQty);
  const primaryPBuyerY = toSvgY(metrics.transactedPrice);
  const primaryPSellerY = toSvgY(metrics.sellerPrice);
  const primaryMcAtTransY = toSvgY(c + d * metrics.transactedQty);
  const primaryMbAtTransY = toSvgY(a - b * metrics.transactedQty);

  // Policy 2 secondary coordinates (for comparison and overlay)
  const secTransX = secondaryMetrics ? toSvgX(secondaryMetrics.transactedQty) : 0;
  const secPBuyerY = secondaryMetrics ? toSvgY(secondaryMetrics.transactedPrice) : 0;
  const secPSellerY = secondaryMetrics ? toSvgY(secondaryMetrics.sellerPrice) : 0;
  const secMcAtTransY = secondaryMetrics ? toSvgY(c + d * secondaryMetrics.transactedQty) : 0;
  const secMbAtTransY = secondaryMetrics ? toSvgY(a - b * secondaryMetrics.transactedQty) : 0;

  // Visibility flags based on displayMode
  const showOnlyCS = displayMode === 'cs';
  const showOnlyPS = displayMode === 'ps';
  const showOnlyChangeCS = displayMode === 'change_cs';
  const showOnlyChangePS = displayMode === 'change_ps';
  const showTaxTotal = displayMode === 'tax_total';
  const showTaxConsumer = displayMode === 'tax_consumer';
  const showTaxProducer = displayMode === 'tax_producer';
  const showSubsidyTotal = displayMode === 'subsidy_total';
  const showSubsidyConsumer = displayMode === 'subsidy_consumer';
  const showSubsidyProducer = displayMode === 'subsidy_producer';
  const showAll = displayMode === 'all';

  // 1. Consumer Surplus (CS) Area Path
  let csPath = '';
  if (showAll || showOnlyCS) {
    if (interventionType === 'none' || !isEffective) {
      csPath = `M ${toSvgX(0)} ${toSvgY(a)} L ${toSvgX(0)} ${eqY} L ${eqX} ${eqY} Z`;
    } else if (interventionType === 'ceiling') {
      csPath = `M ${toSvgX(0)} ${pBuyerY} L ${toSvgX(0)} ${toSvgY(a)} L ${transX} ${mbAtTransY} L ${transX} ${pBuyerY} Z`;
    } else if (interventionType === 'floor') {
      csPath = `M ${toSvgX(0)} ${pBuyerY} L ${toSvgX(0)} ${toSvgY(a)} L ${transX} ${pBuyerY} Z`;
    } else if (interventionType === 'quota') {
      csPath = `M ${toSvgX(0)} ${pBuyerY} L ${toSvgX(0)} ${toSvgY(a)} L ${transX} ${pBuyerY} Z`;
    } else if (interventionType === 'tax') {
      csPath = `M ${toSvgX(0)} ${pBuyerY} L ${toSvgX(0)} ${toSvgY(a)} L ${transX} ${pBuyerY} Z`;
    } else if (interventionType === 'subsidy') {
      csPath = `M ${toSvgX(0)} ${pBuyerY} L ${toSvgX(0)} ${toSvgY(a)} L ${transX} ${pBuyerY} Z`;
    }
  }

  // 2. Producer Surplus (PS) Area Path
  let psPath = '';
  if (showAll || showOnlyPS) {
    if (interventionType === 'none' || !isEffective) {
      psPath = `M ${toSvgX(0)} ${toSvgY(c)} L ${toSvgX(0)} ${eqY} L ${eqX} ${eqY} Z`;
    } else if (interventionType === 'ceiling') {
      psPath = `M ${toSvgX(0)} ${toSvgY(c)} L ${toSvgX(0)} ${pBuyerY} L ${transX} ${pBuyerY} Z`;
    } else if (interventionType === 'floor') {
      psPath = `M ${toSvgX(0)} ${toSvgY(c)} L ${toSvgX(0)} ${pBuyerY} L ${transX} ${pBuyerY} L ${transX} ${mcAtTransY} Z`;
    } else if (interventionType === 'quota') {
      psPath = `M ${toSvgX(0)} ${toSvgY(c)} L ${toSvgX(0)} ${pBuyerY} L ${transX} ${pBuyerY} L ${transX} ${mcAtTransY} Z`;
    } else if (interventionType === 'tax') {
      psPath = `M ${toSvgX(0)} ${toSvgY(c)} L ${toSvgX(0)} ${pSellerY} L ${transX} ${pSellerY} Z`;
    } else if (interventionType === 'subsidy') {
      psPath = `M ${toSvgX(0)} ${toSvgY(c)} L ${toSvgX(0)} ${pSellerY} L ${transX} ${pSellerY} Z`;
    }
  }

  // 3. Change in Consumer Surplus (Gain Area vs Loss Area)
  // Price Ceiling: Gain Area E (between Pe and Pc up to Qc), Loss Area C (triangle under Demand from Qc to Q*)
  let changeCsGainPath = '';
  let changeCsLossPath = '';
  if (showOnlyChangeCS && isEffective) {
    if (interventionType === 'ceiling') {
      // Gain = Area E (rectangle (0, Pc) -> (0, Pe) -> (Qc, Pe) -> (Qc, Pc))
      changeCsGainPath = `M ${toSvgX(0)} ${pBuyerY} L ${toSvgX(0)} ${eqY} L ${transX} ${eqY} L ${transX} ${pBuyerY} Z`;
      // Loss = Area C (triangle (Qc, Pe) -> (Qc, MB(Qc)) -> (Q*, Pe))
      changeCsLossPath = `M ${transX} ${eqY} L ${transX} ${mbAtTransY} L ${eqX} ${eqY} Z`;
    } else if (interventionType === 'floor' || interventionType === 'quota') {
      // Pure Loss = Area B (rectangle between Pe and Pt) + Area C (triangle under demand from Qt to Q*)
      changeCsLossPath = `M ${toSvgX(0)} ${eqY} L ${toSvgX(0)} ${pBuyerY} L ${transX} ${pBuyerY} L ${eqX} ${eqY} Z`;
    } else if (interventionType === 'tax') {
      // Pure Loss = Area B + C + E
      changeCsLossPath = `M ${toSvgX(0)} ${eqY} L ${toSvgX(0)} ${pBuyerY} L ${transX} ${pBuyerY} L ${eqX} ${eqY} Z`;
    } else if (interventionType === 'subsidy') {
      // Pure Gain = Area C + J + K
      changeCsGainPath = `M ${toSvgX(0)} ${pBuyerY} L ${toSvgX(0)} ${eqY} L ${eqX} ${eqY} L ${transX} ${pBuyerY} Z`;
    }
  }

  // 4. Change in Producer Surplus (Gain Area vs Loss Area)
  let changePsGainPath = '';
  let changePsLossPath = '';
  if (showOnlyChangePS && isEffective) {
    if (interventionType === 'ceiling') {
      // Pure Loss = Area E (rectangle between Pc and Pe) + Area F (triangle above supply from Qc to Q*)
      changePsLossPath = `M ${toSvgX(0)} ${pBuyerY} L ${toSvgX(0)} ${eqY} L ${eqX} ${eqY} L ${transX} ${pBuyerY} Z`;
    } else if (interventionType === 'floor' || interventionType === 'quota') {
      // Gain = Area B (rectangle between Pe and Pt up to Qt)
      changePsGainPath = `M ${toSvgX(0)} ${eqY} L ${toSvgX(0)} ${pBuyerY} L ${transX} ${pBuyerY} L ${transX} ${eqY} Z`;
      // Loss = Area F (triangle above supply from Qt to Q*)
      changePsLossPath = `M ${transX} ${eqY} L ${transX} ${mcAtTransY} L ${eqX} ${eqY} Z`;
    } else if (interventionType === 'tax') {
      // Pure Loss = Area F + G
      changePsLossPath = `M ${toSvgX(0)} ${pSellerY} L ${toSvgX(0)} ${eqY} L ${eqX} ${eqY} L ${transX} ${pSellerY} Z`;
    } else if (interventionType === 'subsidy') {
      // Pure Gain = Area B + F
      changePsGainPath = `M ${toSvgX(0)} ${eqY} L ${toSvgX(0)} ${pSellerY} L ${transX} ${pSellerY} L ${eqX} ${eqY} Z`;
    }
  }

  // 5. Deadweight Loss (DWL) Path (shown when showAll or in single policy mode)
  let dwlPath = '';
  if (showAll && isEffective) {
    if (status === 'underproduction') {
      dwlPath = `M ${transX} ${mbAtTransY} L ${eqX} ${eqY} L ${transX} ${mcAtTransY} Z`;
    } else if (status === 'overproduction') {
      dwlPath = `M ${eqX} ${eqY} L ${transX} ${mcAtTransY} L ${transX} ${mbAtTransY} Z`;
    }
  }

  // Primary DWL path (Policy 1)
  let primaryDwlPath = '';
  if (metrics.isEffective) {
    if (metrics.status === 'underproduction') {
      primaryDwlPath = `M ${primaryTransX} ${primaryMbAtTransY} L ${eqX} ${eqY} L ${primaryTransX} ${primaryMcAtTransY} Z`;
    } else if (metrics.status === 'overproduction') {
      primaryDwlPath = `M ${eqX} ${eqY} L ${primaryTransX} ${primaryMcAtTransY} L ${primaryTransX} ${primaryMbAtTransY} Z`;
    }
  }

  // Secondary DWL path (Policy 2)
  let secondaryDwlPath = '';
  if (secondaryMetrics && secondaryMetrics.isEffective) {
    if (secondaryMetrics.status === 'underproduction') {
      secondaryDwlPath = `M ${secTransX} ${secMbAtTransY} L ${eqX} ${eqY} L ${secTransX} ${secMcAtTransY} Z`;
    } else if (secondaryMetrics.status === 'overproduction') {
      secondaryDwlPath = `M ${eqX} ${eqY} L ${secTransX} ${secMcAtTransY} L ${secTransX} ${secMbAtTransY} Z`;
    }
  }

  // Change in Deadweight Loss (ΔDWL) between Policy 1 and Policy 2 for overlay comparison
  let deltaDwlPath = '';
  let deltaDwlType: 'increase' | 'decrease' | 'none' = 'none';
  let deltaDwlCentroidX = 0;
  let deltaDwlCentroidY = 0;

  if (isComparing && secondaryMetrics) {
    const q1 = metrics.transactedQty;
    const q2 = secondaryMetrics.transactedQty;
    const qMin = Math.min(q1, q2);
    const qMax = Math.max(q1, q2);

    if (Math.abs(qMax - qMin) > 0.05) {
      if (interventionType === 'subsidy') {
        // Subsidy: overproduction regime (Qt >= Q*)
        // Top curve: S0 = MC (c + d*Q), Bottom curve: D = MB (a - b*Q)
        const yTopMin = toSvgY(c + d * qMin);
        const yTopMax = toSvgY(c + d * qMax);
        const yBotMax = toSvgY(a - b * qMax);
        const yBotMin = toSvgY(a - b * qMin);

        deltaDwlPath = `M ${toSvgX(qMin)} ${yTopMin} L ${toSvgX(qMax)} ${yTopMax} L ${toSvgX(qMax)} ${yBotMax} L ${toSvgX(qMin)} ${yBotMin} Z`;
        // Policy 2 has higher subsidy -> expands output more -> higher DWL
        deltaDwlType = q2 > q1 ? 'increase' : 'decrease';

        deltaDwlCentroidX = toSvgX((qMin + qMax) / 2);
        deltaDwlCentroidY = (yTopMin + yTopMax + yBotMax + yBotMin) / 4;
      } else {
        // Underproduction regime (ceiling, floor, quota, tax) (Qt <= Q*)
        // Top curve: D = MB (a - b*Q), Bottom curve: S0 = MC (c + d*Q)
        const yTopMin = toSvgY(a - b * qMin);
        const yTopMax = toSvgY(a - b * qMax);
        const yBotMax = toSvgY(c + d * qMax);
        const yBotMin = toSvgY(c + d * qMin);

        deltaDwlPath = `M ${toSvgX(qMin)} ${yTopMin} L ${toSvgX(qMax)} ${yTopMax} L ${toSvgX(qMax)} ${yBotMax} L ${toSvgX(qMin)} ${yBotMin} Z`;
        // Policy 2 has smaller transacted quantity -> more restrictive -> larger DWL
        deltaDwlType = q2 < q1 ? 'increase' : 'decrease';

        deltaDwlCentroidX = toSvgX((qMin + qMax) / 2);
        deltaDwlCentroidY = (yTopMin + yTopMax + yBotMax + yBotMin) / 4;
      }
    }
  }

  // 6. Tax Burden Paths (Unit Tax)
  let taxTotalPath = '';
  let taxConsumerPath = '';
  let taxProducerPath = '';
  if (interventionType === 'tax' && isEffective) {
    // Total Tax Revenue rectangle: [0, Q1] x [P2, P1]
    taxTotalPath = `M ${toSvgX(0)} ${pBuyerY} L ${transX} ${pBuyerY} L ${transX} ${pSellerY} L ${toSvgX(0)} ${pSellerY} Z`;
    // Consumer Burden rectangle: [0, Q1] x [Pe, P1] (Upper rectangle)
    taxConsumerPath = `M ${toSvgX(0)} ${pBuyerY} L ${transX} ${pBuyerY} L ${transX} ${eqY} L ${toSvgX(0)} ${eqY} Z`;
    // Producer Burden rectangle: [0, Q1] x [P2, Pe] (Lower rectangle)
    taxProducerPath = `M ${toSvgX(0)} ${eqY} L ${transX} ${eqY} L ${transX} ${pSellerY} L ${toSvgX(0)} ${pSellerY} Z`;
  }

  // 7. Subsidy Benefit Paths (Unit Subsidy)
  let subsidyTotalPath = '';
  let subsidyConsumerPath = '';
  let subsidyProducerPath = '';
  if (interventionType === 'subsidy' && isEffective) {
    // Total Subsidy Expenditure rectangle: [0, Q1] x [P1, P2] (P2 > Pe > P1)
    subsidyTotalPath = `M ${toSvgX(0)} ${pSellerY} L ${transX} ${pSellerY} L ${transX} ${pBuyerY} L ${toSvgX(0)} ${pBuyerY} Z`;
    // Consumer Subsidy Benefit: [0, Q1] x [P1, Pe] (Lower rectangle, price drops from Pe to P1)
    subsidyConsumerPath = `M ${toSvgX(0)} ${eqY} L ${transX} ${eqY} L ${transX} ${pBuyerY} L ${toSvgX(0)} ${pBuyerY} Z`;
    // Producer Subsidy Benefit: [0, Q1] x [Pe, P2] (Upper rectangle, price received rises from Pe to P2)
    subsidyProducerPath = `M ${toSvgX(0)} ${pSellerY} L ${transX} ${pSellerY} L ${transX} ${eqY} L ${toSvgX(0)} ${eqY} Z`;
  }

  return (
    <div className="relative bg-white rounded-xl border border-stone-200/90 p-3 sm:p-4 shadow-xs select-none">
      {/* Dual Intervention Comparison Toolbar (when secondary is active) */}
      {isComparing && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 p-2.5 bg-violet-50/70 border border-violet-200/80 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 font-bold text-violet-950">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            <span>Comparing Two Interventions:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onComparisonViewChange && onComparisonViewChange('primary')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                comparisonView === 'primary'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              1. Show Policy 1 Areas
            </button>

            <button
              onClick={() => onComparisonViewChange && onComparisonViewChange('secondary')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                comparisonView === 'secondary'
                  ? 'bg-violet-700 text-white shadow-xs'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              2. Show Policy 2 Areas
            </button>

            <button
              onClick={() => onComparisonViewChange && onComparisonViewChange('overlay')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                comparisonView === 'overlay'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              3. Overlay Both & Compare DWL
            </button>
          </div>
        </div>
      )}
      {/* Interactive Display Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-stone-100 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-stone-700">
          <span>Surplus & Incidence:</span>
        </div>

        {/* Display Mode Segmented Controls */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => onDisplayModeChange && onDisplayModeChange('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              displayMode === 'all'
                ? 'bg-stone-800 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Surplus & DWL
          </button>

          <button
            onClick={() => onDisplayModeChange && onDisplayModeChange('cs')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              showOnlyCS
                ? 'bg-sky-600 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Only CS
          </button>

          <button
            onClick={() => onDisplayModeChange && onDisplayModeChange('ps')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              showOnlyPS
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Only PS
          </button>

          <button
            onClick={() => onDisplayModeChange && onDisplayModeChange('change_cs')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              showOnlyChangeCS
                ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Change in CS
          </button>

          <button
            onClick={() => onDisplayModeChange && onDisplayModeChange('change_ps')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              showOnlyChangePS
                ? 'bg-purple-700 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Change in PS
          </button>

          {/* Unit Tax Burden Buttons */}
          {interventionType === 'tax' && (
            <div className="flex items-center gap-1 pl-1 ml-1 border-l border-stone-200">
              <button
                onClick={() => onDisplayModeChange && onDisplayModeChange('tax_total')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  showTaxTotal
                    ? 'bg-indigo-700 text-white shadow-xs font-semibold'
                    : 'text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                }`}
                title="Total Tax Burden / Tax Revenue"
              >
                Total Tax Burden
              </button>

              <button
                onClick={() => onDisplayModeChange && onDisplayModeChange('tax_consumer')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  showTaxConsumer
                    ? 'bg-blue-700 text-white shadow-xs font-semibold'
                    : 'text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                }`}
                title="Consumer Tax Burden (Upper Rectangle)"
              >
                Consumer Burden
              </button>

              <button
                onClick={() => onDisplayModeChange && onDisplayModeChange('tax_producer')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  showTaxProducer
                    ? 'bg-amber-700 text-white shadow-xs font-semibold'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                }`}
                title="Producer Tax Burden (Lower Rectangle)"
              >
                Producer Burden
              </button>
            </div>
          )}

          {/* Unit Subsidy Benefit Buttons */}
          {interventionType === 'subsidy' && (
            <div className="flex items-center gap-1 pl-1 ml-1 border-l border-stone-200">
              <button
                onClick={() => onDisplayModeChange && onDisplayModeChange('subsidy_total')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  showSubsidyTotal
                    ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                }`}
                title="Total Subsidy Benefit / Government Subsidy Expenditure"
              >
                Total Subsidy Benefit
              </button>

              <button
                onClick={() => onDisplayModeChange && onDisplayModeChange('subsidy_consumer')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  showSubsidyConsumer
                    ? 'bg-cyan-700 text-white shadow-xs font-semibold'
                    : 'text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200'
                }`}
                title="Consumer Subsidy Benefit (Lower Rectangle)"
              >
                Consumer Benefit
              </button>

              <button
                onClick={() => onDisplayModeChange && onDisplayModeChange('subsidy_producer')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  showSubsidyProducer
                    ? 'bg-teal-700 text-white shadow-xs font-semibold'
                    : 'text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200'
                }`}
                title="Producer Subsidy Benefit (Upper Rectangle)"
              >
                Producer Benefit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <pattern id="dwl-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#f43f5e" strokeWidth="2.5" opacity="0.75" />
          </pattern>
          <pattern id="gain-hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#059669" strokeWidth="2" opacity="0.8" />
          </pattern>
          <pattern id="loss-hatch" width="6" height="6" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#e11d48" strokeWidth="2" opacity="0.8" />
          </pattern>
          <pattern id="tax-consumer-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#4f46e5" strokeWidth="2" opacity="0.85" />
          </pattern>
          <pattern id="tax-producer-hatch" width="8" height="8" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#d97706" strokeWidth="2" opacity="0.85" />
          </pattern>
          <pattern id="subsidy-consumer-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#0284c7" strokeWidth="2" opacity="0.85" />
          </pattern>
          <pattern id="subsidy-producer-hatch" width="8" height="8" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#059669" strokeWidth="2" opacity="0.85" />
          </pattern>
          <pattern id="dwl-secondary-hatch" width="8" height="8" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#7c3aed" strokeWidth="2.5" opacity="0.85" />
          </pattern>
          <pattern id="dwl-change-increase-hatch" width="8" height="8" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#e11d48" strokeWidth="2.5" opacity="0.85" />
          </pattern>
          <pattern id="dwl-change-decrease-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#059669" strokeWidth="2.5" opacity="0.85" />
          </pattern>
          <clipPath id="curves-plot-clip">
            <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
          </clipPath>
        </defs>

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
          stroke="#475569"
          strokeWidth="2"
        />
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={padding.left + plotWidth}
          y2={padding.top + plotHeight}
          stroke="#475569"
          strokeWidth="2"
        />

        {/* Axis Labels */}
        <text
          x={padding.left - 10}
          y={padding.top + 2}
          textAnchor="end"
          className="text-xs font-semibold fill-stone-700"
        >
          $ (Price)
        </text>
        <text
          x={padding.left + plotWidth}
          y={padding.top + plotHeight + 32}
          textAnchor="end"
          className="text-xs font-semibold fill-stone-700"
        >
          Quantity
        </text>
        <text
          x={padding.left - 8}
          y={padding.top + plotHeight + 14}
          textAnchor="end"
          className="text-xs font-mono fill-stone-500"
        >
          0
        </text>

        {/* 1. Shaded Areas */}
        {/* Consumer Surplus Area */}
        {csPath && (
          <path
            d={csPath}
            fill="#38bdf8"
            fillOpacity={comparisonView === 'overlay' ? 0.14 : 0.35}
            stroke="#0284c7"
            strokeWidth={comparisonView === 'overlay' ? "1" : "1.5"}
            strokeDasharray={comparisonView === 'overlay' ? "3 2" : undefined}
          />
        )}

        {/* Producer Surplus Area */}
        {psPath && (
          <path
            d={psPath}
            fill="#f59e0b"
            fillOpacity={comparisonView === 'overlay' ? 0.14 : 0.35}
            stroke="#d97706"
            strokeWidth={comparisonView === 'overlay' ? "1" : "1.5"}
            strokeDasharray={comparisonView === 'overlay' ? "3 2" : undefined}
          />
        )}

        {/* Change in CS Areas */}
        {changeCsGainPath && (
          <g>
            <path d={changeCsGainPath} fill="#10b981" fillOpacity={0.35} stroke="#059669" strokeWidth="1.5" />
            <path d={changeCsGainPath} fill="url(#gain-hatch)" opacity={0.6} />
          </g>
        )}
        {changeCsLossPath && (
          <g>
            <path d={changeCsLossPath} fill="#f43f5e" fillOpacity={0.35} stroke="#e11d48" strokeWidth="1.5" />
            <path d={changeCsLossPath} fill="url(#loss-hatch)" opacity={0.6} />
          </g>
        )}

        {/* Change in PS Areas */}
        {changePsGainPath && (
          <g>
            <path d={changePsGainPath} fill="#10b981" fillOpacity={0.35} stroke="#059669" strokeWidth="1.5" />
            <path d={changePsGainPath} fill="url(#gain-hatch)" opacity={0.6} />
          </g>
        )}
        {changePsLossPath && (
          <g>
            <path d={changePsLossPath} fill="#f43f5e" fillOpacity={0.35} stroke="#e11d48" strokeWidth="1.5" />
            <path d={changePsLossPath} fill="url(#loss-hatch)" opacity={0.6} />
          </g>
        )}

        {/* Deadweight Loss Area: In Overlay Mode, show the CHANGE in DWL (ΔDWL) between Policy 1 and Policy 2 */}
        {comparisonView === 'overlay' && isComparing ? (
          <g>
            {deltaDwlPath ? (
              <g>
                <path
                  d={deltaDwlPath}
                  fill={deltaDwlType === 'increase' ? '#f43f5e' : '#10b981'}
                  fillOpacity={0.38}
                  stroke={deltaDwlType === 'increase' ? '#e11d48' : '#059669'}
                  strokeWidth="2.2"
                />
                <path
                  d={deltaDwlPath}
                  fill={deltaDwlType === 'increase' ? 'url(#dwl-change-increase-hatch)' : 'url(#dwl-change-decrease-hatch)'}
                  opacity={0.85}
                />
                {/* On-Diagram Badge for Change in DWL */}
                <g>
                  <rect
                    x={Math.min(padding.left + plotWidth - 160, Math.max(padding.left + 10, deltaDwlCentroidX - 75))}
                    y={Math.min(padding.top + plotHeight - 35, Math.max(padding.top + 15, deltaDwlCentroidY - 12))}
                    width="150"
                    height="24"
                    rx="5"
                    fill="#ffffff"
                    fillOpacity={0.96}
                    stroke={deltaDwlType === 'increase' ? '#e11d48' : '#059669'}
                    strokeWidth="1.5"
                    filter="drop-shadow(0 1px 3px rgba(0,0,0,0.12))"
                  />
                  <text
                    x={Math.min(padding.left + plotWidth - 160, Math.max(padding.left + 10, deltaDwlCentroidX - 75)) + 75}
                    y={Math.min(padding.top + plotHeight - 35, Math.max(padding.top + 15, deltaDwlCentroidY - 12)) + 16}
                    textAnchor="middle"
                    className={`text-[11px] font-bold select-none ${
                      deltaDwlType === 'increase' ? 'fill-rose-700' : 'fill-emerald-700'
                    }`}
                  >
                    {deltaDwlType === 'increase' ? 'ΔDWL: Increase (+ Loss)' : 'ΔDWL: Decrease (− Gain)'}
                  </text>
                </g>
              </g>
            ) : (
              <g>
                <rect
                  x={eqX - 75}
                  y={eqY - 30}
                  width="150"
                  height="24"
                  rx="5"
                  fill="#ffffff"
                  fillOpacity={0.94}
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                />
                <text
                  x={eqX}
                  y={eqY - 14}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-stone-700 select-none"
                >
                  ΔDWL = 0 (Identical DWL)
                </text>
              </g>
            )}
          </g>
        ) : (
          dwlPath && (
            <g>
              <path d={dwlPath} fill={comparisonView === 'secondary' ? '#c084fc' : '#fb7185'} fillOpacity={0.3} />
              <path d={dwlPath} fill={comparisonView === 'secondary' ? 'url(#dwl-secondary-hatch)' : 'url(#dwl-hatch)'} stroke={comparisonView === 'secondary' ? '#7c3aed' : '#e11d48'} strokeWidth="1.5" />
            </g>
          )
        )}

        {/* Tax Burden Shading */}
        {interventionType === 'tax' && isEffective && (
          <g>
            {(showTaxTotal || showTaxConsumer) && (
              <g>
                <path d={taxConsumerPath} fill="#6366f1" fillOpacity={showTaxConsumer ? 0.45 : 0.28} stroke="#4338ca" strokeWidth={showTaxConsumer ? 2 : 1.2} />
                <path d={taxConsumerPath} fill="url(#tax-consumer-hatch)" opacity={showTaxConsumer ? 0.8 : 0.45} />
              </g>
            )}
            {(showTaxTotal || showTaxProducer) && (
              <g>
                <path d={taxProducerPath} fill="#f59e0b" fillOpacity={showTaxProducer ? 0.45 : 0.28} stroke="#d97706" strokeWidth={showTaxProducer ? 2 : 1.2} />
                <path d={taxProducerPath} fill="url(#tax-producer-hatch)" opacity={showTaxProducer ? 0.8 : 0.45} />
              </g>
            )}
            {/* Dividing boundary at Pe across transX */}
            {(showTaxTotal || showTaxConsumer || showTaxProducer) && (
              <line x1={toSvgX(0)} y1={eqY} x2={transX} y2={eqY} stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
            )}
            {/* Total Tax Outline */}
            {showTaxTotal && (
              <rect
                x={toSvgX(0)}
                y={pBuyerY}
                width={transX - toSvgX(0)}
                height={pSellerY - pBuyerY}
                fill="none"
                stroke="#312e81"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
            )}
            {/* Descriptive badges on diagram */}
            {(showTaxTotal || showTaxConsumer) && (
              <g>
                <rect x={(toSvgX(0) + transX) / 2 - 58} y={(pBuyerY + eqY) / 2 - 8} width="116" height="16" rx="4" fill="#ffffff" fillOpacity={0.92} stroke="#818cf8" strokeWidth="1" />
                <text x={(toSvgX(0) + transX) / 2} y={(pBuyerY + eqY) / 2 + 4} textAnchor="middle" className="text-[10px] font-bold fill-indigo-900 select-none">
                  Consumer Tax Burden
                </text>
              </g>
            )}
            {(showTaxTotal || showTaxProducer) && (
              <g>
                <rect x={(toSvgX(0) + transX) / 2 - 58} y={(eqY + pSellerY) / 2 - 8} width="116" height="16" rx="4" fill="#ffffff" fillOpacity={0.92} stroke="#fcd34d" strokeWidth="1" />
                <text x={(toSvgX(0) + transX) / 2} y={(eqY + pSellerY) / 2 + 4} textAnchor="middle" className="text-[10px] font-bold fill-amber-950 select-none">
                  Producer Tax Burden
                </text>
              </g>
            )}
          </g>
        )}

        {/* Subsidy Benefit Shading */}
        {interventionType === 'subsidy' && isEffective && (
          <g>
            {(showSubsidyTotal || showSubsidyProducer) && (
              <g>
                <path d={subsidyProducerPath} fill="#10b981" fillOpacity={showSubsidyProducer ? 0.45 : 0.28} stroke="#059669" strokeWidth={showSubsidyProducer ? 2 : 1.2} />
                <path d={subsidyProducerPath} fill="url(#subsidy-producer-hatch)" opacity={showSubsidyProducer ? 0.8 : 0.45} />
              </g>
            )}
            {(showSubsidyTotal || showSubsidyConsumer) && (
              <g>
                <path d={subsidyConsumerPath} fill="#06b6d4" fillOpacity={showSubsidyConsumer ? 0.45 : 0.28} stroke="#0891b2" strokeWidth={showSubsidyConsumer ? 2 : 1.2} />
                <path d={subsidyConsumerPath} fill="url(#subsidy-consumer-hatch)" opacity={showSubsidyConsumer ? 0.8 : 0.45} />
              </g>
            )}
            {/* Dividing boundary at Pe across transX */}
            {(showSubsidyTotal || showSubsidyConsumer || showSubsidyProducer) && (
              <line x1={toSvgX(0)} y1={eqY} x2={transX} y2={eqY} stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
            )}
            {/* Total Subsidy Outline */}
            {showSubsidyTotal && (
              <rect
                x={toSvgX(0)}
                y={pSellerY}
                width={transX - toSvgX(0)}
                height={pBuyerY - pSellerY}
                fill="none"
                stroke="#065f46"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
            )}
            {/* Descriptive badges on diagram */}
            {(showSubsidyTotal || showSubsidyProducer) && (
              <g>
                <rect x={(toSvgX(0) + transX) / 2 - 65} y={(pSellerY + eqY) / 2 - 8} width="130" height="16" rx="4" fill="#ffffff" fillOpacity={0.92} stroke="#6ee7b7" strokeWidth="1" />
                <text x={(toSvgX(0) + transX) / 2} y={(pSellerY + eqY) / 2 + 4} textAnchor="middle" className="text-[10px] font-bold fill-emerald-950 select-none">
                  Producer Subsidy Benefit
                </text>
              </g>
            )}
            {(showSubsidyTotal || showSubsidyConsumer) && (
              <g>
                <rect x={(toSvgX(0) + transX) / 2 - 65} y={(eqY + pBuyerY) / 2 - 8} width="130" height="16" rx="4" fill="#ffffff" fillOpacity={0.92} stroke="#67e8f9" strokeWidth="1" />
                <text x={(toSvgX(0) + transX) / 2} y={(eqY + pBuyerY) / 2 + 4} textAnchor="middle" className="text-[10px] font-bold fill-cyan-950 select-none">
                  Consumer Subsidy Benefit
                </text>
              </g>
            )}
          </g>
        )}

        {/* 2. Main Curves */}
        {/* Demand Curve */}
        <line
          x1={dStart.x}
          y1={dStart.y}
          x2={dEnd.x}
          y2={dEnd.y}
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text
          x={dEnd.x + 4}
          y={dEnd.y + 14}
          className="text-xs font-bold fill-stone-800"
        >
          D = MB
        </text>

        {/* Supply Curve */}
        <g clipPath="url(#curves-plot-clip)">
          <line
            x1={sStart.x}
            y1={sStart.y}
            x2={sEnd.x}
            y2={sEnd.y}
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <text
          x={sEnd.x + 4}
          y={toSvgY(c + d * maxQ) - 4}
          className="text-xs font-bold fill-stone-800"
        >
          {interventionType === 'tax' || interventionType === 'subsidy' ? 'S₀ = MC' : 'S = MC'}
        </text>

        {/* Shifted Supply for Unit Tax (Primary S1 and Secondary S2) */}
        {interventionType === 'tax' && (
          <g>
            {metrics.isEffective && (
              <g>
                <g clipPath="url(#curves-plot-clip)">
                  <line
                    x1={s1TaxLine.x1}
                    y1={s1TaxLine.y1}
                    x2={s1TaxLine.x2}
                    y2={s1TaxLine.y2}
                    stroke="#4338ca"
                    strokeWidth="2.4"
                    strokeDasharray={isComparing && comparisonView === 'secondary' ? '4 3' : undefined}
                  />
                </g>
                <text
                  x={toSvgX(Math.min(78, (maxP - (c + state.taxRate)) / d)) - 25}
                  y={toSvgY(Math.min(maxP - 8, c + state.taxRate + d * Math.min(78, (maxP - (c + state.taxRate)) / d))) - 10}
                  className="text-xs font-bold fill-indigo-700 select-none"
                >
                  {isComparing ? 'S₁ = MC + t₁' : 'S₁ = MC + t'}
                </text>
              </g>
            )}

            {isComparing && secondaryState && secondaryMetrics?.isEffective && s2TaxLine && (
              <g>
                <g clipPath="url(#curves-plot-clip)">
                  <line
                    x1={s2TaxLine.x1}
                    y1={s2TaxLine.y1}
                    x2={s2TaxLine.x2}
                    y2={s2TaxLine.y2}
                    stroke="#7c3aed"
                    strokeWidth="2.4"
                    strokeDasharray="5 3"
                  />
                </g>
                <text
                  x={toSvgX(Math.min(74, (maxP - (c + secondaryState.taxRate)) / d)) - 25}
                  y={toSvgY(Math.min(maxP - 6, c + secondaryState.taxRate + d * Math.min(74, (maxP - (c + secondaryState.taxRate)) / d))) - 10}
                  className="text-xs font-bold fill-violet-700 select-none"
                >
                  S₂ = MC + t₂
                </text>
              </g>
            )}
          </g>
        )}

        {/* Shifted Supply for Unit Subsidy (Primary S1 and Secondary S2) - STRICTLY PARALLEL TO S0 */}
        {interventionType === 'subsidy' && (
          <g>
            {metrics.isEffective && (
              <g>
                <g clipPath="url(#curves-plot-clip)">
                  <line
                    x1={s1SubsidyLine.x1}
                    y1={s1SubsidyLine.y1}
                    x2={s1SubsidyLine.x2}
                    y2={s1SubsidyLine.y2}
                    stroke="#7e22ce"
                    strokeWidth="2.4"
                    strokeDasharray={isComparing && comparisonView === 'secondary' ? '4 3' : undefined}
                  />
                </g>
                <text
                  x={toSvgX(Math.min(84, (maxP - (c - state.subsidyRate)) / d - 4)) - 10}
                  y={toSvgY(Math.max(8, c - state.subsidyRate + d * Math.min(84, (maxP - (c - state.subsidyRate)) / d - 4))) + 18}
                  className="text-xs font-bold fill-purple-700 select-none"
                >
                  {isComparing ? 'S₁ = MC - s₁' : 'S₁ = MC - s'}
                </text>
              </g>
            )}

            {isComparing && secondaryState && secondaryMetrics?.isEffective && s2SubsidyLine && (
              <g>
                <g clipPath="url(#curves-plot-clip)">
                  <line
                    x1={s2SubsidyLine.x1}
                    y1={s2SubsidyLine.y1}
                    x2={s2SubsidyLine.x2}
                    y2={s2SubsidyLine.y2}
                    stroke="#0d9488"
                    strokeWidth="2.4"
                    strokeDasharray="5 3"
                  />
                </g>
                <text
                  x={toSvgX(Math.min(84, (maxP - (c - secondaryState.subsidyRate)) / d - 4)) - 10}
                  y={toSvgY(Math.max(8, c - secondaryState.subsidyRate + d * Math.min(84, (maxP - (c - secondaryState.subsidyRate)) / d - 4))) + 18}
                  className="text-xs font-bold fill-teal-700 select-none"
                >
                  S₂ = MC - s₂
                </text>
              </g>
            )}
          </g>
        )}

        {/* Quota Supply: Sq1 and Sq2 */}
        {interventionType === 'quota' && (
          <g>
            <line
              x1={toSvgX(state.quotaQty)}
              y1={toSvgY(c + d * state.quotaQty)}
              x2={toSvgX(state.quotaQty)}
              y2={padding.top}
              stroke="#047857"
              strokeWidth="2.5"
              strokeDasharray={metrics.isEffective ? (isComparing && comparisonView === 'secondary' ? '4 3' : undefined) : '4 3'}
            />
            <text
              x={toSvgX(state.quotaQty) + 5}
              y={padding.top + 16}
              className="text-xs font-bold fill-emerald-800 select-none"
            >
              {isComparing ? 'Sq1' : (metrics.isEffective ? 'Sq' : 'Sq (at Q*)')}
            </text>

            {isComparing && secondaryState && (
              <g>
                <line
                  x1={toSvgX(secondaryState.quotaQty)}
                  y1={toSvgY(c + d * secondaryState.quotaQty)}
                  x2={toSvgX(secondaryState.quotaQty)}
                  y2={padding.top}
                  stroke="#7c3aed"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
                <text
                  x={toSvgX(secondaryState.quotaQty) + 5}
                  y={padding.top + 32}
                  className="text-xs font-bold fill-violet-800 select-none"
                >
                  Sq2
                </text>
              </g>
            )}
          </g>
        )}

        {/* Price Ceiling Line (Pc1 and Pc2) */}
        {interventionType === 'ceiling' && (
          <g>
            <line
              x1={padding.left}
              y1={toSvgY(state.ceilingPrice)}
              x2={padding.left + plotWidth}
              y2={toSvgY(state.ceilingPrice)}
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray={metrics.isEffective ? (isComparing && comparisonView === 'secondary' ? '4 3' : undefined) : '4 3'}
            />
            <text
              x={padding.left + plotWidth - 95}
              y={toSvgY(state.ceilingPrice) - 6}
              className="text-xs font-bold fill-rose-700 select-none"
            >
              {isComparing ? 'Price ceiling (Pc1)' : (metrics.isEffective ? 'Price ceiling (Pc)' : 'Price ceiling (at Pe)')}
            </text>

            {isComparing && secondaryState && (
              <g>
                <line
                  x1={padding.left}
                  y1={toSvgY(secondaryState.ceilingPrice)}
                  x2={padding.left + plotWidth}
                  y2={toSvgY(secondaryState.ceilingPrice)}
                  stroke="#7c3aed"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
                <text
                  x={padding.left + plotWidth - 95}
                  y={toSvgY(secondaryState.ceilingPrice) - 6}
                  className="text-xs font-bold fill-violet-700 select-none"
                >
                  Price ceiling (Pc2)
                </text>
              </g>
            )}
          </g>
        )}

        {/* Price Floor Line (Pf1 and Pf2) */}
        {interventionType === 'floor' && (
          <g>
            <line
              x1={padding.left}
              y1={toSvgY(state.floorPrice)}
              x2={padding.left + plotWidth}
              y2={toSvgY(state.floorPrice)}
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray={metrics.isEffective ? (isComparing && comparisonView === 'secondary' ? '4 3' : undefined) : '4 3'}
            />
            <text
              x={padding.left + plotWidth - 90}
              y={toSvgY(state.floorPrice) - 6}
              className="text-xs font-bold fill-rose-700 select-none"
            >
              {isComparing ? 'Price floor (Pf1)' : (metrics.isEffective ? 'Price floor (Pf)' : 'Price floor (at Pe)')}
            </text>

            {isComparing && secondaryState && (
              <g>
                <line
                  x1={padding.left}
                  y1={toSvgY(secondaryState.floorPrice)}
                  x2={padding.left + plotWidth}
                  y2={toSvgY(secondaryState.floorPrice)}
                  stroke="#7c3aed"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
                <text
                  x={padding.left + plotWidth - 90}
                  y={toSvgY(secondaryState.floorPrice) - 6}
                  className="text-xs font-bold fill-violet-700 select-none"
                >
                  Price floor (Pf2)
                </text>
              </g>
            )}
          </g>
        )}

        {/* 3. Equilibrium Point & Label */}
        <circle cx={eqX} cy={eqY} r="4" fill="#0f172a" />
        <text x={eqX + 7} y={eqY - 6} className="text-xs font-bold fill-stone-800">
          E₀
        </text>

        {/* Dotted projections to Pe and Q* */}
        <line
          x1={eqX}
          y1={eqY}
          x2={eqX}
          y2={padding.top + plotHeight}
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <line
          x1={padding.left}
          y1={eqY}
          x2={eqX}
          y2={eqY}
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <text
          x={eqX}
          y={padding.top + plotHeight + 16}
          textAnchor="middle"
          className="text-xs font-bold fill-stone-800"
        >
          {customLabels?.['Q*'] || 'Q*'}
        </text>
        <text
          x={padding.left - 6}
          y={eqY + 4}
          textAnchor="end"
          className="text-xs font-semibold fill-stone-700"
        >
          {customLabels?.['Pe'] || 'Pe'}
        </text>

        {/* Transacted Quantity & Price Projections for Active Policy */}
        {activeMetrics.isEffective && (
          <g>
            <line
              x1={transX}
              y1={Math.min(mbAtTransY, pBuyerY, pSellerY, mcAtTransY)}
              x2={transX}
              y2={padding.top + plotHeight}
              stroke={comparisonView === 'secondary' ? '#7c3aed' : '#dc2626'}
              strokeWidth="1.3"
              strokeDasharray="3 2"
            />
            <text
              x={transX}
              y={padding.top + plotHeight + 16}
              textAnchor="middle"
              className={`text-xs font-bold ${comparisonView === 'secondary' ? 'fill-violet-700' : 'fill-rose-700'}`}
            >
              {customLabels?.['Qt'] || (
                isComparing
                  ? (comparisonView === 'secondary'
                      ? (interventionType === 'ceiling' ? 'Qc2' : interventionType === 'floor' ? 'Qf2' : interventionType === 'quota' ? 'Qq2' : 'Q₂')
                      : (interventionType === 'ceiling' ? 'Qc1' : interventionType === 'floor' ? 'Qf1' : interventionType === 'quota' ? 'Qq1' : 'Q₁'))
                  : (interventionType === 'ceiling' ? 'Qc' : interventionType === 'floor' ? 'Qf' : interventionType === 'quota' ? 'Qq' : 'Q₁')
              )}
            </text>

            {/* Price Projections on Y-Axis */}
            {interventionType !== 'tax' && interventionType !== 'subsidy' && (
              <g>
                <line
                  x1={padding.left}
                  y1={pBuyerY}
                  x2={transX}
                  y2={pBuyerY}
                  stroke={comparisonView === 'secondary' ? '#7c3aed' : '#dc2626'}
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
                <text
                  x={padding.left - 6}
                  y={pBuyerY + 4}
                  textAnchor="end"
                  className={`text-xs font-bold ${comparisonView === 'secondary' ? 'fill-violet-700' : 'fill-rose-700'}`}
                >
                  {customLabels?.['Pt'] || (
                    isComparing
                      ? (comparisonView === 'secondary'
                          ? (interventionType === 'ceiling' ? 'Pc2' : interventionType === 'floor' ? 'Pf2' : 'Pq2')
                          : (interventionType === 'ceiling' ? 'Pc1' : interventionType === 'floor' ? 'Pf1' : 'Pq1'))
                      : (interventionType === 'ceiling' ? 'Pc' : interventionType === 'floor' ? 'Pf' : 'Pq')
                  )}
                </text>
              </g>
            )}

            {(interventionType === 'tax' || interventionType === 'subsidy') && (
              <g>
                <line
                  x1={padding.left}
                  y1={pBuyerY}
                  x2={transX}
                  y2={pBuyerY}
                  stroke={comparisonView === 'secondary' ? '#7c3aed' : '#4338ca'}
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
                <text
                  x={padding.left - 6}
                  y={pBuyerY + 4}
                  textAnchor="end"
                  className={`text-xs font-bold ${comparisonView === 'secondary' ? 'fill-violet-700' : 'fill-indigo-700'}`}
                >
                  {isComparing ? (comparisonView === 'secondary' ? 'P₁,₂' : 'P₁,₁') : 'P₁'}
                </text>

                <line
                  x1={padding.left}
                  y1={pSellerY}
                  x2={transX}
                  y2={pSellerY}
                  stroke={comparisonView === 'secondary' ? '#0d9488' : '#b45309'}
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
                <text
                  x={padding.left - 6}
                  y={pSellerY + 4}
                  textAnchor="end"
                  className={`text-xs font-bold ${comparisonView === 'secondary' ? 'fill-teal-700' : 'fill-amber-700'}`}
                >
                  {isComparing ? (comparisonView === 'secondary' ? 'P₂,₂' : 'P₂,₁') : 'P₂'}
                </text>
              </g>
            )}

            {/* MB and MC at Transacted Quantity */}
            <circle cx={transX} cy={mbAtTransY} r="3.5" fill={comparisonView === 'secondary' ? '#7c3aed' : '#dc2626'} />
            <text x={transX - 6} y={mbAtTransY - 6} textAnchor="end" className={`text-[11px] font-bold ${comparisonView === 'secondary' ? 'fill-violet-700' : 'fill-rose-700'}`}>
              MB
            </text>

            <circle cx={transX} cy={mcAtTransY} r="3.5" fill={comparisonView === 'secondary' ? '#7c3aed' : '#dc2626'} />
            <text x={transX + 8} y={mcAtTransY + 4} className={`text-[11px] font-bold ${comparisonView === 'secondary' ? 'fill-violet-700' : 'fill-rose-700'}`}>
              MC
            </text>
          </g>
        )}

        {/* Secondary Policy Projection on Overlay Mode */}
        {isComparing && comparisonView === 'overlay' && secondaryMetrics?.isEffective && (
          <g>
            <line
              x1={secTransX}
              y1={Math.min(secMbAtTransY, secPBuyerY, secPSellerY, secMcAtTransY)}
              x2={secTransX}
              y2={padding.top + plotHeight}
              stroke="#7c3aed"
              strokeWidth="1.3"
              strokeDasharray="4 2"
            />
            <text
              x={secTransX}
              y={padding.top + plotHeight + 28}
              textAnchor="middle"
              className="text-[11px] font-bold fill-violet-700"
            >
              {interventionType === 'ceiling' ? 'Qc2' : interventionType === 'floor' ? 'Qf2' : interventionType === 'quota' ? 'Qq2' : 'Q₂'}
            </text>

            {interventionType !== 'tax' && interventionType !== 'subsidy' && (
              <g>
                <line
                  x1={padding.left}
                  y1={secPBuyerY}
                  x2={secTransX}
                  y2={secPBuyerY}
                  stroke="#7c3aed"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                />
                <text
                  x={padding.left - 6}
                  y={secPBuyerY + 4}
                  textAnchor="end"
                  className="text-xs font-bold fill-violet-700"
                >
                  {interventionType === 'ceiling' ? 'Pc2' : interventionType === 'floor' ? 'Pf2' : 'Pq2'}
                </text>
              </g>
            )}
          </g>
        )}

        {/* Comparison Legend on Canvas */}
        {isComparing && (
          <g className="text-[11px] font-semibold select-none">
            <rect
              x={padding.left + plotWidth - 185}
              y={padding.top + 8}
              width="180"
              height={comparisonView === 'overlay' ? 62 : 44}
              rx="6"
              fill="#ffffff"
              fillOpacity={0.96}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <line x1={padding.left + plotWidth - 175} y1={padding.top + 21} x2={padding.left + plotWidth - 155} y2={padding.top + 21} stroke="#dc2626" strokeWidth="2.5" />
            <text x={padding.left + plotWidth - 148} y={padding.top + 25} className="fill-stone-800">
              Policy 1 (Original)
            </text>
            <line x1={padding.left + plotWidth - 175} y1={padding.top + 36} x2={padding.left + plotWidth - 155} y2={padding.top + 36} stroke="#7c3aed" strokeWidth="2" strokeDasharray="4 2" />
            <text x={padding.left + plotWidth - 148} y={padding.top + 40} className="fill-violet-700">
              Policy 2 (New)
            </text>
            {comparisonView === 'overlay' && (
              <g>
                <rect
                  x={padding.left + plotWidth - 175}
                  y={padding.top + 46}
                  width="18"
                  height="11"
                  rx="2"
                  fill={deltaDwlType === 'increase' ? '#f43f5e' : deltaDwlType === 'decrease' ? '#10b981' : '#94a3b8'}
                  fillOpacity={0.4}
                  stroke={deltaDwlType === 'increase' ? '#e11d48' : deltaDwlType === 'decrease' ? '#059669' : '#64748b'}
                  strokeWidth="1.2"
                />
                <text
                  x={padding.left + plotWidth - 148}
                  y={padding.top + 55}
                  className={`text-[10px] font-bold ${
                    deltaDwlType === 'increase' ? 'fill-rose-700' : deltaDwlType === 'decrease' ? 'fill-emerald-700' : 'fill-stone-600'
                  }`}
                >
                  {deltaDwlType === 'increase' ? 'Shaded: +ΔDWL (Loss)' : deltaDwlType === 'decrease' ? 'Shaded: −ΔDWL (Gain)' : 'Shaded: ΔDWL = 0'}
                </text>
              </g>
            )}
          </g>
        )}

        {/* Letter annotations matching textbook diagram conventions */}
        <g className="font-mono text-xs fill-stone-500 font-bold select-none pointer-events-none">
          <text x={padding.left + 8} y={toSvgY(a) + 14}>A</text>
          <text x={padding.left + 8} y={toSvgY(c) - 6}>B</text>
          {isEffective && (
            <>
              <text x={transX - 14} y={toSvgY(transactedPrice) - 6}>C</text>
              <text x={transX - 14} y={toSvgY(c + d * transactedQty) + 12}>F</text>
              {interventionType === 'ceiling' && (
                <text x={(padding.left + transX) / 2} y={(eqY + pBuyerY) / 2 + 4} fill="#059669">E</text>
              )}
              {interventionType === 'floor' && (
                <text x={(padding.left + transX) / 2} y={(eqY + pBuyerY) / 2 + 4} fill="#059669">B</text>
              )}
            </>
          )}
        </g>
      </svg>

      {/* Explanatory Caption for Active Display Mode */}
      <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600">
        <div>
          {isComparing && comparisonView === 'overlay' ? (
            <span>
              <strong className={deltaDwlType === 'increase' ? 'text-rose-800' : deltaDwlType === 'decrease' ? 'text-emerald-800' : 'text-stone-800'}>
                Change in Deadweight Loss (ΔDWL):
              </strong>{' '}
              {deltaDwlType === 'increase'
                ? `Policy 2 creates an Increase in Deadweight Loss (+ΔDWL: additional deadweight loss between Q₁ and Q₂ bounded by MB and MC)`
                : deltaDwlType === 'decrease'
                ? `Policy 2 creates a Decrease in Deadweight Loss (−ΔDWL: welfare surplus recovered between Q₁ and Q₂ bounded by MB and MC)`
                : `Both policies cause the identical quantity distortion, so Change in Deadweight Loss is zero (ΔDWL = 0)`}
            </span>
          ) : (
            <>
              {displayMode === 'cs' && (
                <span>
                  <strong className="text-sky-800">Consumer Surplus (CS):</strong> {activeMetrics.csAreaDesc}
                </span>
              )}
              {displayMode === 'ps' && (
                <span>
                  <strong className="text-amber-800">Producer Surplus (PS):</strong> {activeMetrics.psAreaDesc}
                </span>
              )}
              {displayMode === 'change_cs' && (
                <span>
                  <strong className="text-emerald-800">Change in CS:</strong> {activeMetrics.changeCsDesc}
                </span>
              )}
              {displayMode === 'change_ps' && (
                <span>
                  <strong className="text-purple-800">Change in PS:</strong> {activeMetrics.changePsDesc}
                </span>
              )}
              {displayMode === 'all' && (
                <span>
                  <strong className="text-stone-800">Deadweight Loss:</strong> {activeMetrics.dwlAreaDesc}
                </span>
              )}
            </>
          )}
          {displayMode === 'tax_total' && (
            <span>
              <strong className="text-indigo-800">Total Tax Burden (Revenue):</strong> {activeMetrics.taxBurdenTotalArea || 'Rectangle between P1, P2 and Q1'} — Shared between consumers and producers
            </span>
          )}
          {displayMode === 'tax_consumer' && (
            <span>
              <strong className="text-blue-800">Consumer Tax Burden:</strong> {activeMetrics.taxBurdenConsumerArea || 'Upper Rectangle (between P1 and Pe)'} — Buyers pay higher price P1 (Per-unit burden = P1 - Pe)
            </span>
          )}
          {displayMode === 'tax_producer' && (
            <span>
              <strong className="text-amber-800">Producer Tax Burden:</strong> {activeMetrics.taxBurdenProducerArea || 'Lower Rectangle (between Pe and P2)'} — Sellers receive lower net price P2 (Per-unit burden = Pe - P2)
            </span>
          )}
          {displayMode === 'subsidy_total' && (
            <span>
              <strong className="text-emerald-800">Total Subsidy Benefit (Expenditure):</strong> {activeMetrics.subsidyBenefitTotalArea || 'Rectangle between P2, P1 and Q1'} — Shared between consumers and producers
            </span>
          )}
          {displayMode === 'subsidy_consumer' && (
            <span>
              <strong className="text-cyan-800">Consumer Subsidy Benefit:</strong> {activeMetrics.subsidyBenefitConsumerArea || 'Lower Rectangle (between Pe and P1)'} — Buyers pay lower price P1 (Per-unit benefit = Pe - P1)
            </span>
          )}
          {displayMode === 'subsidy_producer' && (
            <span>
              <strong className="text-teal-800">Producer Subsidy Benefit:</strong> {activeMetrics.subsidyBenefitProducerArea || 'Upper Rectangle (between P2 and Pe)'} — Sellers receive higher net price P2 (Per-unit benefit = P2 - Pe)
            </span>
          )}
        </div>

        <div className="text-[11px] text-stone-400 font-mono">
          HKDSE Area Representation (No raw numbers)
        </div>
      </div>
    </div>
  );
};
