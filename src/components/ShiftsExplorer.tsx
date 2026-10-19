import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Sliders,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Layers,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { InterventionType } from '../types/economics';

interface CurveState {
  deltaD: number; // Demand shift: negative = leftward, positive = rightward
  deltaS: number; // Supply shift: negative = leftward, positive = rightward
}

interface InterventionPreset {
  type: InterventionType;
  label: string;
  defaultVal: number;
}

const INTERVENTIONS: InterventionPreset[] = [
  { type: 'none', label: 'Free Market', defaultVal: 0 },
  { type: 'ceiling', label: 'Price Ceiling', defaultVal: 40 },
  { type: 'floor', label: 'Price Floor', defaultVal: 60 },
  { type: 'quota', label: 'Quota', defaultVal: 35 },
  { type: 'tax', label: 'Unit Tax', defaultVal: 18 },
  { type: 'subsidy', label: 'Unit Subsidy', defaultVal: 18 },
];

export const ShiftsExplorer: React.FC = () => {
  // 1. Isolated local state
  const [intervention, setIntervention] = useState<InterventionType>('none');
  const [shifts, setShifts] = useState<CurveState>({ deltaD: 0, deltaS: 0 });
  const [showOriginalCurves, setShowOriginalCurves] = useState<boolean>(true);
  const [showOriginalDwl, setShowOriginalDwl] = useState<boolean>(true);
  const [dwlMode, setDwlMode] = useState<'current' | 'change'>('current');

  // Default market base parameters (HKDSE linear baseline)
  const a0 = 100;
  const b = 1;
  const c0 = 10;
  const d = 0.8;

  // Intervention control parameter values (fixed while curves shift)
  const [ceilingPrice] = useState<number>(40);
  const [floorPrice] = useState<number>(60);
  const [quotaQty] = useState<number>(35);
  const [taxRate] = useState<number>(18);
  const [subsidyRate] = useState<number>(18);

  // Reset function
  const handleReset = () => {
    setShifts({ deltaD: 0, deltaS: 0 });
  };

  // Helper to calculate market equilibrium and intervention outcomes
  const calculateMarket = (deltaD: number, deltaS: number) => {
    // Demand: P = (a0 + deltaD) - b * Q
    const a = a0 + deltaD;
    // Supply: curve shifts rightward by deltaS => P = (c0 - d * deltaS) + d * Q
    const c = c0 - d * deltaS;

    // Unregulated Equilibrium (MB = MC)
    const eqQ = Math.max(0, (a - c) / (b + d));
    const eqP = Math.max(0, a - b * eqQ);

    let transactedQ = eqQ;
    let buyerPrice = eqP;
    let sellerPrice = eqP;
    let isBinding = false;
    let dwl = 0;
    let status: 'efficient' | 'underproduction' | 'overproduction' = 'efficient';

    switch (intervention) {
      case 'ceiling': {
        // Effective if Pc < eqP
        if (ceilingPrice < eqP) {
          isBinding = true;
          const qSupply = Math.max(0, (ceilingPrice - c) / d);
          const qDemand = Math.max(0, (a - ceilingPrice) / b);
          transactedQ = Math.min(qSupply, qDemand);
          buyerPrice = ceilingPrice;
          sellerPrice = ceilingPrice;
          status = 'underproduction';
          const mb = a - b * transactedQ;
          const mc = c + d * transactedQ;
          dwl = 0.5 * Math.abs(mb - mc) * Math.abs(eqQ - transactedQ);
        }
        break;
      }

      case 'floor': {
        // Effective if Pf > eqP
        if (floorPrice > eqP) {
          isBinding = true;
          const qSupply = Math.max(0, (floorPrice - c) / d);
          const qDemand = Math.max(0, (a - floorPrice) / b);
          transactedQ = Math.min(qSupply, qDemand);
          buyerPrice = floorPrice;
          sellerPrice = floorPrice;
          status = 'underproduction';
          const mb = a - b * transactedQ;
          const mc = c + d * transactedQ;
          dwl = 0.5 * Math.abs(mb - mc) * Math.abs(eqQ - transactedQ);
        }
        break;
      }

      case 'quota': {
        // Effective if Qq < eqQ
        if (quotaQty < eqQ) {
          isBinding = true;
          transactedQ = quotaQty;
          buyerPrice = a - b * transactedQ;
          sellerPrice = c + d * transactedQ;
          status = 'underproduction';
          const mb = buyerPrice;
          const mc = sellerPrice;
          dwl = 0.5 * Math.abs(mb - mc) * Math.abs(eqQ - transactedQ);
        }
        break;
      }

      case 'tax': {
        if (taxRate > 0) {
          isBinding = true;
          transactedQ = Math.max(0, (a - c - taxRate) / (b + d));
          buyerPrice = a - b * transactedQ;
          sellerPrice = buyerPrice - taxRate;
          status = 'underproduction';
          dwl = 0.5 * taxRate * Math.abs(eqQ - transactedQ);
        }
        break;
      }

      case 'subsidy': {
        if (subsidyRate > 0) {
          isBinding = true;
          transactedQ = Math.max(0, (a - c + subsidyRate) / (b + d));
          buyerPrice = Math.max(0, a - b * transactedQ);
          sellerPrice = buyerPrice + subsidyRate;
          status = 'overproduction';
          dwl = 0.5 * subsidyRate * Math.abs(transactedQ - eqQ);
        }
        break;
      }

      case 'none':
      default: {
        isBinding = false;
        transactedQ = eqQ;
        buyerPrice = eqP;
        sellerPrice = eqP;
        status = 'efficient';
        dwl = 0;
        break;
      }
    }

    const mbAtTrans = Math.max(0, a - b * transactedQ);
    const mcAtTrans = Math.max(0, c + d * transactedQ);

    return {
      a,
      c,
      eqQ,
      eqP,
      transactedQ,
      buyerPrice,
      sellerPrice,
      mbAtTrans,
      mcAtTrans,
      isBinding,
      status,
      dwl,
    };
  };

  // State 0: Original Before-Shift state (deltaD = 0, deltaS = 0)
  const original = useMemo(() => calculateMarket(0, 0), [intervention, ceilingPrice, floorPrice, quotaQty, taxRate, subsidyRate]);

  // State 1: Shifted After-Shift state (current deltaD, deltaS)
  const current = useMemo(
    () => calculateMarket(shifts.deltaD, shifts.deltaS),
    [shifts.deltaD, shifts.deltaS, intervention, ceilingPrice, floorPrice, quotaQty, taxRate, subsidyRate]
  );

  // Geometric scale setup for SVG
  const maxQ = 100;
  const maxP = 110;
  const svgWidth = 620;
  const svgHeight = 440;
  const padding = { top: 32, right: 35, bottom: 45, left: 55 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Purely linear coordinate transforms without clamping (so SVG lines have exact geometric slopes)
  const toSvgX = (q: number) => padding.left + (q / maxQ) * plotWidth;
  const toSvgY = (p: number) => padding.top + (1 - p / maxP) * plotHeight;

  // Unclamped line coordinates that span beyond the plot and are cleanly clipped by plot-area-clip
  // Every demand curve has identical slope -b, and every supply curve has identical slope d
  const getDemandLineCoords = (a: number) => {
    const q1 = -40;
    const q2 = maxQ + 40;
    return {
      x1: toSvgX(q1),
      y1: toSvgY(a - b * q1),
      x2: toSvgX(q2),
      y2: toSvgY(a - b * q2),
    };
  };

  const getSupplyLineCoords = (c: number) => {
    const q1 = -40;
    const q2 = maxQ + 40;
    return {
      x1: toSvgX(q1),
      y1: toSvgY(c + d * q1),
      x2: toSvgX(q2),
      y2: toSvgY(c + d * q2),
    };
  };

  // Precise exit point on plot boundary for placing curve labels
  const getDemandLabelPos = (a: number) => {
    const pAtMaxQ = a - b * maxQ;
    if (pAtMaxQ >= 0) {
      return {
        x: toSvgX(maxQ) + 6,
        y: toSvgY(pAtMaxQ) + 4,
        anchor: 'start' as const,
      };
    } else {
      const qAtZeroP = a / b;
      return {
        x: toSvgX(qAtZeroP),
        y: toSvgY(0) + 16,
        anchor: 'middle' as const,
      };
    }
  };

  const getSupplyLabelPos = (c: number) => {
    const pAtMaxQ = c + d * maxQ;
    if (pAtMaxQ <= maxP) {
      return {
        x: toSvgX(maxQ) + 6,
        y: toSvgY(pAtMaxQ) - 4,
        anchor: 'start' as const,
      };
    } else {
      const qAtMaxP = (maxP - c) / d;
      return {
        x: toSvgX(qAtMaxP) + 4,
        y: toSvgY(maxP) - 8,
        anchor: 'middle' as const,
      };
    }
  };

  const origDemandCoords = getDemandLineCoords(original.a);
  const origSupplyCoords = getSupplyLineCoords(original.c);
  const currDemandCoords = getDemandLineCoords(current.a);
  const currSupplyCoords = getSupplyLineCoords(current.c);

  const origDemandLabel = getDemandLabelPos(original.a);
  const origSupplyLabel = getSupplyLabelPos(original.c);
  const currDemandLabel = getDemandLabelPos(current.a);
  const currSupplyLabel = getSupplyLabelPos(current.c);

  // Helper for DWL SVG polygon path
  const getDwlPath = (state: ReturnType<typeof calculateMarket>) => {
    if (!state.isBinding || state.dwl <= 0.05) return '';
    const q1X = toSvgX(state.transactedQ);
    const eqX = toSvgX(state.eqQ);
    const eqY = toSvgY(state.eqP);
    const mbY = toSvgY(state.mbAtTrans);
    const mcY = toSvgY(state.mcAtTrans);

    if (state.status === 'underproduction') {
      return `M ${q1X} ${mbY} L ${eqX} ${eqY} L ${q1X} ${mcY} Z`;
    } else if (state.status === 'overproduction') {
      return `M ${eqX} ${eqY} L ${q1X} ${mcY} L ${q1X} ${mbY} Z`;
    }
    return '';
  };

  const origDwlPath = getDwlPath(original);
  const currDwlPath = getDwlPath(current);

  // Direction of DWL change
  const dwlDeltaType = useMemo(() => {
    if (!original.isBinding && !current.isBinding) return 'none';
    const diff = current.dwl - original.dwl;
    if (Math.abs(diff) < 0.2) return 'unchanged';
    return diff > 0 ? 'increase' : 'decrease';
  }, [original.dwl, current.dwl, original.isBinding, current.isBinding]);

  // Helper to compute SVG polygon path for DWL_A \ DWL_B (exact geometric difference between two DWL regions)
  const computeUnderproductionDwlDiff = (
    stateA: ReturnType<typeof calculateMarket>,
    stateB: ReturnType<typeof calculateMarket>
  ) => {
    if (!stateB.isBinding) return getDwlPath(stateA);

    const rawQ = [
      stateA.transactedQ,
      stateA.eqQ,
      stateB.transactedQ,
      stateB.eqQ,
    ];
    const sortedQ = Array.from(new Set(rawQ))
      .filter((q) => q >= stateA.transactedQ - 1e-4 && q <= stateA.eqQ + 1e-4)
      .sort((a, b) => a - b);

    if (sortedQ.length < 2) return '';

    const qSamples: number[] = [];
    for (let i = 0; i < sortedQ.length - 1; i++) {
      const qStart = sortedQ[i];
      const qEnd = sortedQ[i + 1];
      if (qEnd - qStart > 0.05) {
        const steps = Math.max(2, Math.ceil((qEnd - qStart) / 2));
        for (let s = 0; s < steps; s++) {
          qSamples.push(qStart + (s / steps) * (qEnd - qStart));
        }
      } else {
        qSamples.push(qStart);
      }
    }
    qSamples.push(sortedQ[sortedQ.length - 1]);

    const topPoints: { x: number; y: number }[] = [];
    const botPoints: { x: number; y: number }[] = [];

    for (const q of qSamples) {
      const mbA = stateA.a - b * q;
      const mcA = stateA.c + d * q;
      const inA = q >= stateA.transactedQ - 1e-4 && q <= stateA.eqQ + 1e-4 && mbA >= mcA - 1e-4;

      if (!inA) continue;

      const inB = q >= stateB.transactedQ - 1e-4 && q <= stateB.eqQ + 1e-4;
      const mbB = inB ? stateB.a - b * q : -Infinity;
      const mcB = inB ? stateB.c + d * q : Infinity;

      if (!inB || mbB <= mcB) {
        topPoints.push({ x: toSvgX(q), y: toSvgY(mbA) });
        botPoints.push({ x: toSvgX(q), y: toSvgY(mcA) });
      } else {
        if (mbA > mbB + 0.05) {
          topPoints.push({ x: toSvgX(q), y: toSvgY(mbA) });
          botPoints.push({ x: toSvgX(q), y: toSvgY(Math.max(mcA, mbB)) });
        } else if (mcA < mcB - 0.05) {
          topPoints.push({ x: toSvgX(q), y: toSvgY(Math.min(mbA, mcB)) });
          botPoints.push({ x: toSvgX(q), y: toSvgY(mcA) });
        }
      }
    }

    if (topPoints.length < 2 || botPoints.length < 2) return '';

    let path = `M ${topPoints[0].x} ${topPoints[0].y}`;
    for (let i = 1; i < topPoints.length; i++) {
      path += ` L ${topPoints[i].x} ${topPoints[i].y}`;
    }
    for (let i = botPoints.length - 1; i >= 0; i--) {
      path += ` L ${botPoints[i].x} ${botPoints[i].y}`;
    }
    path += ' Z';
    return path;
  };

  // Check if one DWL region is strictly nested inside the other.
  // When nested, the change in DWL corresponds to a single, contiguous, unambiguous geometric area.
  // If not nested (e.g., Price Floor with Demand shift, or Price Ceiling with Supply shift, where Qt moves),
  // the DWL region shifts laterally, meaning it gains on one side while losing on the other.
  // In that non-nested case, no single area represents ΔDWL, so we do NOT show a misleading shaded region.
  const isDwlStrictlyNested = useMemo(() => {
    if (!original.isBinding || !current.isBinding) return true;
    if (original.status !== current.status) return false;

    if (original.status === 'underproduction') {
      const origInCurr =
        current.transactedQ <= original.transactedQ + 1e-4 &&
        current.eqQ >= original.eqQ - 1e-4 &&
        current.a >= original.a - 1e-4 &&
        current.c <= original.c + 1e-4;

      const currInOrig =
        original.transactedQ <= current.transactedQ + 1e-4 &&
        original.eqQ >= current.eqQ - 1e-4 &&
        original.a >= current.a - 1e-4 &&
        original.c <= current.c + 1e-4;

      return origInCurr || currInOrig;
    }

    return false;
  }, [original, current]);

  const deltaDwlPath = useMemo(() => {
    if (dwlDeltaType === 'none' || dwlDeltaType === 'unchanged') return '';
    // If DWL regions are not nested (lateral shift), do not compute or draw a misleading difference area
    if (!isDwlStrictlyNested) return '';
    if (dwlDeltaType === 'increase') {
      return computeUnderproductionDwlDiff(current, original);
    } else if (dwlDeltaType === 'decrease') {
      return computeUnderproductionDwlDiff(original, current);
    }
    return '';
  }, [original, current, dwlDeltaType, isDwlStrictlyNested]);

  // Qualitative comparisons
  const compareMetric = (val1: number, val2: number, epsilon = 0.3) => {
    if (Math.abs(val2 - val1) <= epsilon) return 'same';
    return val2 > val1 ? 'higher' : 'lower';
  };

  const mbChange = compareMetric(original.mbAtTrans, current.mbAtTrans);
  const mcChange = compareMetric(original.mcAtTrans, current.mcAtTrans);
  const qtChange = compareMetric(original.transactedQ, current.transactedQ);

  const hasShift = shifts.deltaD !== 0 || shifts.deltaS !== 0;

  return (
    <div className="space-y-4">
      {/* Tab Header & Market Intervention Selector */}
      <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#52b788]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                Demand & Supply Shifts vs. Market Interventions
              </h2>
              <p className="text-xs text-stone-500">
                Shift demand and supply independently to see how MB, MC, and deadweight loss evolve.
              </p>
            </div>
          </div>

          {/* Reset Shifts Button */}
          <button
            onClick={handleReset}
            disabled={!hasShift}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              hasShift
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 shadow-2xs'
                : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Shifts</span>
          </button>
        </div>

        {/* Intervention Selection Pills */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
            Intervention:
          </span>
          {INTERVENTIONS.map((item) => (
            <button
              key={item.type}
              onClick={() => setIntervention(item.type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                intervention === item.type
                  ? 'bg-[#52b788] text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Diagram & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 8 Cols: Large Interactive Diagram */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-3 sm:p-4 shadow-xs space-y-2">
          {/* Top Diagram Toolbar: Visual toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-1.5 border-b border-stone-100">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 text-stone-600 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOriginalCurves}
                  onChange={(e) => setShowOriginalCurves(e.target.checked)}
                  className="rounded text-[#52b788] focus:ring-[#52b788] h-3.5 w-3.5"
                />
                <span>Show Original Curves (D₀, S₀)</span>
              </label>

              {intervention !== 'none' && (
                <div className="flex items-center gap-1.5 bg-stone-100/80 p-0.5 rounded-lg border border-stone-200/70">
                  <span className="text-[10px] font-bold text-stone-500 uppercase px-1.5 select-none">
                    DWL:
                  </span>
                  <button
                    onClick={() => setDwlMode('current')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      dwlMode === 'current'
                        ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Current DWL
                  </button>
                  <button
                    onClick={() => setDwlMode('change')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      dwlMode === 'change'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <span>Change in DWL (ΔDWL)</span>
                    {hasShift && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        dwlMode === 'change'
                          ? 'bg-rose-700 text-white'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {dwlDeltaType === 'increase' ? '+Δ' : dwlDeltaType === 'decrease' ? '−Δ' : '=0'}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                current.isBinding
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {intervention === 'none'
                ? 'Market Equilibrium (Efficient)'
                : current.isBinding
                ? 'Intervention Binds (Inefficient)'
                : 'Non-Binding (Equilibrium)'}
            </span>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="w-full overflow-hidden flex justify-center bg-[#fafaf7] rounded-lg border border-stone-200/70 p-1 sm:p-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[500px] select-none font-sans"
            >
              <defs>
                {/* Current DWL Hatch (Rose/Red) */}
                <pattern
                  id="shift-dwl-curr-hatch"
                  width="7"
                  height="7"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="7" stroke="#e11d48" strokeWidth="2.2" opacity="0.85" />
                </pattern>

                {/* Additional Loss Hatch for +ΔDWL (Deep Crimson) */}
                <pattern
                  id="shift-dwl-loss-hatch"
                  width="6"
                  height="6"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#be123c" strokeWidth="2.4" opacity="0.9" />
                </pattern>

                {/* Surplus Gain / Recovered Hatch for −ΔDWL (Emerald Green) */}
                <pattern
                  id="shift-dwl-gain-hatch"
                  width="6"
                  height="6"
                  patternTransform="rotate(-45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#059669" strokeWidth="2.4" opacity="0.9" />
                </pattern>

                {/* Original DWL Hatch (Subtle Violet/Slate) */}
                <pattern
                  id="shift-dwl-orig-hatch"
                  width="7"
                  height="7"
                  patternTransform="rotate(-45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="7" stroke="#94a3b8" strokeWidth="1.8" opacity="0.75" />
                </pattern>

                {/* Arrow markers */}
                <marker id="arrow-axis" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
                </marker>
                <marker id="arrow-d-shift" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
                </marker>
                <marker id="arrow-s-shift" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#7c3aed" />
                </marker>
                <clipPath id="plot-area-clip">
                  <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
                </clipPath>
              </defs>

              {/* Background & Plot Area */}
              <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} fill="#ffffff" rx="4" />

              {/* Grid Lines (Subtle) */}
              {[25, 50, 75].map((val) => (
                <g key={`grid-${val}`}>
                  <line
                    x1={toSvgX(val)}
                    y1={padding.top}
                    x2={toSvgX(val)}
                    y2={padding.top + plotHeight}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={padding.left}
                    y1={toSvgY(val)}
                    x2={padding.left + plotWidth}
                    y2={toSvgY(val)}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                </g>
              ))}

              {/* Axes */}
              {/* Y Axis (Price / MB / MC) */}
              <line
                x1={padding.left}
                y1={padding.top + plotHeight}
                x2={padding.left}
                y2={padding.top - 12}
                stroke="#475569"
                strokeWidth="2"
                markerEnd="url(#arrow-axis)"
              />
              <text x={padding.left - 8} y={padding.top - 8} textAnchor="end" className="text-xs font-bold fill-stone-800">
                P, MB, MC
              </text>

              {/* X Axis (Quantity) */}
              <line
                x1={padding.left}
                y1={padding.top + plotHeight}
                x2={padding.left + plotWidth + 14}
                y2={padding.top + plotHeight}
                stroke="#475569"
                strokeWidth="2"
                markerEnd="url(#arrow-axis)"
              />
              <text x={padding.left + plotWidth + 18} y={padding.top + plotHeight + 14} textAnchor="end" className="text-xs font-bold fill-stone-800">
                Q
              </text>

              {/* DWL Shading Areas */}
              {/* Mode A: Current DWL view */}
              {dwlMode === 'current' && (
                <>
                  {/* Original DWL Area (if active and toggled on) */}
                  {showOriginalDwl && hasShift && origDwlPath && (
                    <g clipPath="url(#plot-area-clip)">
                      <path d={origDwlPath} fill="#cbd5e1" fillOpacity={0.25} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
                      <path d={origDwlPath} fill="url(#shift-dwl-orig-hatch)" opacity={0.6} />
                    </g>
                  )}
                  {/* Current DWL Area */}
                  {currDwlPath && (
                    <g clipPath="url(#plot-area-clip)">
                      <path d={currDwlPath} fill="#f43f5e" fillOpacity={0.35} stroke="#e11d48" strokeWidth="2" />
                      <path d={currDwlPath} fill="url(#shift-dwl-curr-hatch)" opacity={0.85} />
                    </g>
                  )}
                </>
              )}

              {/* Mode B: Change in Deadweight Loss (ΔDWL) view */}
              {dwlMode === 'change' && (
                <>
                  {/* Case 1: Strictly nested regions - accurately shade strictly the change in DWL (ΔDWL) */}
                  {isDwlStrictlyNested && (
                    <>
                      {/* When DWL Increases: Highlight strictly the newly added loss (ΔDWL), with original baseline shown */}
                      {dwlDeltaType === 'increase' && deltaDwlPath && (
                        <g clipPath="url(#plot-area-clip)">
                          {origDwlPath && (
                            <path d={origDwlPath} fill="#cbd5e1" fillOpacity={0.2} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />
                          )}
                          <path d={deltaDwlPath} fill="#f43f5e" fillOpacity={0.4} stroke="#be123c" strokeWidth="2" />
                          <path d={deltaDwlPath} fill="url(#shift-dwl-loss-hatch)" opacity={0.92} />
                        </g>
                      )}

                      {/* When DWL Decreases: Highlight strictly the eliminated DWL area (surplus recovered) in emerald green */}
                      {dwlDeltaType === 'decrease' && deltaDwlPath && (
                        <g clipPath="url(#plot-area-clip)">
                          {currDwlPath && (
                            <path d={currDwlPath} fill="#f43f5e" fillOpacity={0.15} stroke="#e11d48" strokeWidth="1.2" strokeDasharray="3 2" />
                          )}
                          <path d={deltaDwlPath} fill="#10b981" fillOpacity={0.35} stroke="#059669" strokeWidth="2" />
                          <path d={deltaDwlPath} fill="url(#shift-dwl-gain-hatch)" opacity={0.88} />
                        </g>
                      )}
                    </>
                  )}

                  {/* Case 2: Non-nested regions (lateral shift, e.g. Price Floor + Demand shift) */}
                  {/* As instructed: If the change cannot be cleanly shown as a single contiguous area, do NOT show a misleading shaded difference.
                      Instead, display original DWL (slate dashed) and current DWL (rose dashed) for honest visual comparison. */}
                  {!isDwlStrictlyNested && (
                    <g clipPath="url(#plot-area-clip)">
                      {origDwlPath && (
                        <path d={origDwlPath} fill="#cbd5e1" fillOpacity={0.22} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
                      )}
                      {currDwlPath && (
                        <path d={currDwlPath} fill="#f43f5e" fillOpacity={0.22} stroke="#e11d48" strokeWidth="1.6" strokeDasharray="3 2" />
                      )}
                    </g>
                  )}

                  {/* Case 3: When DWL is Unchanged (e.g. Unit Tax under constant linear slopes) */}
                  {dwlDeltaType === 'unchanged' && currDwlPath && (
                    <g clipPath="url(#plot-area-clip)">
                      <path d={currDwlPath} fill="#f43f5e" fillOpacity={0.25} stroke="#e11d48" strokeWidth="1.5" strokeDasharray="3 2" />
                      <path d={currDwlPath} fill="url(#shift-dwl-curr-hatch)" opacity={0.7} />
                    </g>
                  )}
                </>
              )}

              {/* 1. Original Demand & Supply Curves (D0, S0) if shown and shifted */}
              {showOriginalCurves && hasShift && (
                <g clipPath="url(#plot-area-clip)">
                  {shifts.deltaD !== 0 && (
                    <line
                      x1={origDemandCoords.x1}
                      y1={origDemandCoords.y1}
                      x2={origDemandCoords.x2}
                      y2={origDemandCoords.y2}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  )}
                  {shifts.deltaS !== 0 && (
                    <line
                      x1={origSupplyCoords.x1}
                      y1={origSupplyCoords.y1}
                      x2={origSupplyCoords.x2}
                      y2={origSupplyCoords.y2}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  )}
                </g>
              )}

              {/* Original Curve Labels when shifted */}
              {showOriginalCurves && hasShift && (
                <g className="text-[11px] font-bold select-none fill-stone-400">
                  {shifts.deltaD !== 0 && (
                    <text
                      x={origDemandLabel.x}
                      y={origDemandLabel.y}
                      textAnchor={origDemandLabel.anchor}
                    >
                      D₀ = MB₀
                    </text>
                  )}
                  {shifts.deltaS !== 0 && (
                    <text
                      x={origSupplyLabel.x}
                      y={origSupplyLabel.y}
                      textAnchor={origSupplyLabel.anchor}
                    >
                      S₀ = MC₀
                    </text>
                  )}
                </g>
              )}

              {/* 2. Most Updated Demand Curve (D1 if shifted, D0 if unshifted) */}
              <g clipPath="url(#plot-area-clip)">
                <line
                  x1={currDemandCoords.x1}
                  y1={currDemandCoords.y1}
                  x2={currDemandCoords.x2}
                  y2={currDemandCoords.y2}
                  stroke={shifts.deltaD !== 0 ? '#2563eb' : '#0f172a'}
                  strokeWidth="2.6"
                />
              </g>
              <text
                x={currDemandLabel.x}
                y={currDemandLabel.y}
                textAnchor={currDemandLabel.anchor}
                className={`text-[11px] font-bold select-none ${
                  shifts.deltaD !== 0 ? 'fill-blue-700' : 'fill-stone-900'
                }`}
              >
                {shifts.deltaD !== 0 ? 'D₁ = MB₁' : 'D = MB'}
              </text>

              {/* Directional Shift Arrow for Demand */}
              {shifts.deltaD !== 0 && (
                <line
                  x1={toSvgX(50)}
                  y1={toSvgY(50)}
                  x2={toSvgX(50 + shifts.deltaD / b)}
                  y2={toSvgY(50)}
                  stroke="#2563eb"
                  strokeWidth="2"
                  markerEnd="url(#arrow-d-shift)"
                />
              )}

              {/* 3. Most Updated Supply Curve (S1 if shifted, S0 if unshifted) */}
              <g clipPath="url(#plot-area-clip)">
                <line
                  x1={currSupplyCoords.x1}
                  y1={currSupplyCoords.y1}
                  x2={currSupplyCoords.x2}
                  y2={currSupplyCoords.y2}
                  stroke={shifts.deltaS !== 0 ? '#7c3aed' : '#0f172a'}
                  strokeWidth="2.6"
                />
              </g>
              <text
                x={currSupplyLabel.x}
                y={currSupplyLabel.y}
                textAnchor={currSupplyLabel.anchor}
                className={`text-[11px] font-bold select-none ${
                  shifts.deltaS !== 0 ? 'fill-violet-700' : 'fill-stone-900'
                }`}
              >
                {shifts.deltaS !== 0 ? 'S₁ = MC₁' : 'S = MC'}
              </text>

              {/* Directional Shift Arrow for Supply */}
              {shifts.deltaS !== 0 && (
                <line
                  x1={toSvgX(50)}
                  y1={toSvgY(50)}
                  x2={toSvgX(50 + shifts.deltaS)}
                  y2={toSvgY(50)}
                  stroke="#7c3aed"
                  strokeWidth="2"
                  markerEnd="url(#arrow-s-shift)"
                />
              )}

              {/* Market Intervention Visualization */}
              {/* 1. Price Ceiling */}
              {intervention === 'ceiling' && (
                <g>
                  <line
                    x1={padding.left}
                    y1={toSvgY(ceilingPrice)}
                    x2={padding.left + plotWidth}
                    y2={toSvgY(ceilingPrice)}
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <text
                    x={padding.left + plotWidth - 8}
                    y={toSvgY(ceilingPrice) - 6}
                    textAnchor="end"
                    className="text-[11px] font-bold fill-rose-700"
                  >
                    Price ceiling (Pc)
                  </text>
                  <text x={padding.left - 6} y={toSvgY(ceilingPrice) + 4} textAnchor="end" className="text-xs font-bold fill-rose-700">
                    Pc
                  </text>
                </g>
              )}

              {/* 2. Price Floor */}
              {intervention === 'floor' && (
                <g>
                  <line
                    x1={padding.left}
                    y1={toSvgY(floorPrice)}
                    x2={padding.left + plotWidth}
                    y2={toSvgY(floorPrice)}
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <text
                    x={padding.left + plotWidth - 8}
                    y={toSvgY(floorPrice) - 6}
                    textAnchor="end"
                    className="text-[11px] font-bold fill-rose-700"
                  >
                    Price floor (Pf)
                  </text>
                  <text x={padding.left - 6} y={toSvgY(floorPrice) + 4} textAnchor="end" className="text-xs font-bold fill-rose-700">
                    Pf
                  </text>
                </g>
              )}

              {/* 3. Quota */}
              {intervention === 'quota' && (
                <g>
                  <line
                    x1={toSvgX(quotaQty)}
                    y1={padding.top}
                    x2={toSvgX(quotaQty)}
                    y2={padding.top + plotHeight}
                    stroke="#047857"
                    strokeWidth="2.2"
                    strokeDasharray="4 2"
                  />
                  <text x={toSvgX(quotaQty) + 5} y={padding.top + 16} className="text-[11px] font-bold fill-emerald-800">
                    Quota (Qq)
                  </text>
                  <text x={toSvgX(quotaQty)} y={padding.top + plotHeight + 16} textAnchor="middle" className="text-xs font-bold fill-emerald-800">
                    Qq
                  </text>
                </g>
              )}

              {/* 4. Unit Tax: Wedge between MB and MC */}
              {intervention === 'tax' && current.isBinding && (
                <g>
                  <line
                    x1={toSvgX(current.transactedQ)}
                    y1={toSvgY(current.mbAtTrans)}
                    x2={toSvgX(current.transactedQ)}
                    y2={toSvgY(current.mcAtTrans)}
                    stroke="#4338ca"
                    strokeWidth="3.5"
                  />
                  {/* Horizontal projections to Buyer Price & Seller Price */}
                  <line
                    x1={padding.left}
                    y1={toSvgY(current.buyerPrice)}
                    x2={toSvgX(current.transactedQ)}
                    y2={toSvgY(current.buyerPrice)}
                    stroke="#4338ca"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <text x={padding.left - 6} y={toSvgY(current.buyerPrice) + 4} textAnchor="end" className="text-[11px] font-bold fill-indigo-800">
                    P_buyer
                  </text>

                  <line
                    x1={padding.left}
                    y1={toSvgY(current.sellerPrice)}
                    x2={toSvgX(current.transactedQ)}
                    y2={toSvgY(current.sellerPrice)}
                    stroke="#d97706"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <text x={padding.left - 6} y={toSvgY(current.sellerPrice) + 4} textAnchor="end" className="text-[11px] font-bold fill-amber-800">
                    P_seller
                  </text>
                </g>
              )}

              {/* 5. Unit Subsidy: Wedge between MC and MB */}
              {intervention === 'subsidy' && current.isBinding && (
                <g>
                  <line
                    x1={toSvgX(current.transactedQ)}
                    y1={toSvgY(current.mbAtTrans)}
                    x2={toSvgX(current.transactedQ)}
                    y2={toSvgY(current.mcAtTrans)}
                    stroke="#7e22ce"
                    strokeWidth="3.5"
                  />
                  {/* Horizontal projections to Buyer Price & Seller Price */}
                  <line
                    x1={padding.left}
                    y1={toSvgY(current.buyerPrice)}
                    x2={toSvgX(current.transactedQ)}
                    y2={toSvgY(current.buyerPrice)}
                    stroke="#0891b2"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <text x={padding.left - 6} y={toSvgY(current.buyerPrice) + 4} textAnchor="end" className="text-[11px] font-bold fill-cyan-800">
                    P_buyer
                  </text>

                  <line
                    x1={padding.left}
                    y1={toSvgY(current.sellerPrice)}
                    x2={toSvgX(current.transactedQ)}
                    y2={toSvgY(current.sellerPrice)}
                    stroke="#059669"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <text x={padding.left - 6} y={toSvgY(current.sellerPrice) + 4} textAnchor="end" className="text-[11px] font-bold fill-emerald-800">
                    P_seller
                  </text>
                </g>
              )}

              {/* Equilibrium Points */}
              {/* E0: Original Equilibrium (shown only when shifts are active and original curves are toggled ON) */}
              {hasShift && showOriginalCurves && (
                <g>
                  <circle
                    cx={toSvgX(original.eqQ)}
                    cy={toSvgY(original.eqP)}
                    r="4.5"
                    fill="#94a3b8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={toSvgX(original.eqQ) + 7}
                    y={toSvgY(original.eqP) - 6}
                    className="text-[11px] font-bold fill-stone-400 select-none"
                  >
                    E₀
                  </text>
                  {/* Projections to X and Y axes */}
                  <line
                    x1={toSvgX(original.eqQ)}
                    y1={toSvgY(original.eqP)}
                    x2={toSvgX(original.eqQ)}
                    y2={padding.top + plotHeight}
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={toSvgX(original.eqQ)}
                    y={padding.top + plotHeight + 16}
                    textAnchor="middle"
                    className="text-[11px] font-medium fill-stone-400 select-none"
                  >
                    Q*₀
                  </text>

                  <line
                    x1={padding.left}
                    y1={toSvgY(original.eqP)}
                    x2={toSvgX(original.eqQ)}
                    y2={toSvgY(original.eqP)}
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding.left - 6}
                    y={toSvgY(original.eqP) + 4}
                    textAnchor="end"
                    className="text-[11px] font-medium fill-stone-400 select-none"
                  >
                    Pe₀
                  </text>
                </g>
              )}

              {/* Current Shifted Equilibrium: Exact Intersection on Most Updated S and D */}
              <g>
                <circle
                  cx={toSvgX(current.eqQ)}
                  cy={toSvgY(current.eqP)}
                  r="5.5"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={toSvgX(current.eqQ) + 8}
                  y={toSvgY(current.eqP) - 7}
                  className="text-xs font-bold fill-stone-900 select-none"
                >
                  {hasShift && showOriginalCurves ? 'E₁' : 'E*'}
                </text>

                {/* Projections from Current Equilibrium to X and Y axes */}
                <line
                  x1={toSvgX(current.eqQ)}
                  y1={toSvgY(current.eqP)}
                  x2={toSvgX(current.eqQ)}
                  y2={padding.top + plotHeight}
                  stroke="#475569"
                  strokeWidth="1.4"
                  strokeDasharray="3 2"
                />
                <text
                  x={toSvgX(current.eqQ)}
                  y={padding.top + plotHeight + 16}
                  textAnchor="middle"
                  className="text-xs font-bold fill-stone-800 select-none"
                >
                  {hasShift && showOriginalCurves ? 'Q*₁' : 'Q*'}
                </text>

                <line
                  x1={padding.left}
                  y1={toSvgY(current.eqP)}
                  x2={toSvgX(current.eqQ)}
                  y2={toSvgY(current.eqP)}
                  stroke="#475569"
                  strokeWidth="1.4"
                  strokeDasharray="3 2"
                />
                <text
                  x={padding.left - 6}
                  y={toSvgY(current.eqP) + 4}
                  textAnchor="end"
                  className="text-xs font-bold fill-stone-800 select-none"
                >
                  {hasShift && showOriginalCurves ? 'Pe₁' : 'Pe'}
                </text>
              </g>

              {/* Transacted Quantity Projection Qt */}
              {current.isBinding && (
                <g>
                  <line
                    x1={toSvgX(current.transactedQ)}
                    y1={Math.min(toSvgY(current.mbAtTrans), toSvgY(current.mcAtTrans))}
                    x2={toSvgX(current.transactedQ)}
                    y2={padding.top + plotHeight}
                    stroke="#dc2626"
                    strokeWidth="1.6"
                    strokeDasharray="4 2"
                  />
                  <text x={toSvgX(current.transactedQ)} y={padding.top + plotHeight + 30} textAnchor="middle" className="text-xs font-bold fill-rose-700">
                    Qt
                  </text>

                  {/* MB Point at Qt */}
                  <circle cx={toSvgX(current.transactedQ)} cy={toSvgY(current.mbAtTrans)} r="4" fill="#dc2626" />
                  <text x={toSvgX(current.transactedQ) - 7} y={toSvgY(current.mbAtTrans) - 6} textAnchor="end" className="text-[11px] font-bold fill-rose-700">
                    MB
                  </text>

                  {/* MC Point at Qt */}
                  <circle cx={toSvgX(current.transactedQ)} cy={toSvgY(current.mcAtTrans)} r="4" fill="#dc2626" />
                  <text x={toSvgX(current.transactedQ) + 8} y={toSvgY(current.mcAtTrans) + 4} className="text-[11px] font-bold fill-rose-700">
                    MC
                  </text>
                </g>
              )}


            </svg>
          </div>
        </div>

        {/* Right 4 Cols: Independent Curve Shift Controls & Comparison */}
        <div className="lg:col-span-4 space-y-3 sm:space-y-4">
          {/* Curve Shift Controls Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide">
                <Sliders className="w-4 h-4 text-[#52b788]" />
                <span>Shift Curves Independently</span>
              </div>
            </div>

            {/* 1. Demand Shift Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-900 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Demand (D = MB):
                </span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                  {shifts.deltaD === 0
                    ? 'Unshifted (D₀)'
                    : shifts.deltaD > 0
                    ? `Shift Right (+${shifts.deltaD})`
                    : `Shift Left (${shifts.deltaD})`}
                </span>
              </div>

              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={shifts.deltaD}
                onChange={(e) => setShifts((prev) => ({ ...prev, deltaD: Number(e.target.value) }))}
                className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-600 touch-none"
              />

              <div className="flex items-center justify-between gap-1 pt-0.5">
                <button
                  onClick={() => setShifts((prev) => ({ ...prev, deltaD: -20 }))}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  ← Left
                </button>
                <button
                  onClick={() => setShifts((prev) => ({ ...prev, deltaD: 0 }))}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  Center (0)
                </button>
                <button
                  onClick={() => setShifts((prev) => ({ ...prev, deltaD: 20 }))}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  Right →
                </button>
              </div>
            </div>

            {/* 2. Supply Shift Slider */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-violet-900 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
                  Supply (S = MC):
                </span>
                <span className="font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200 text-[11px]">
                  {shifts.deltaS === 0
                    ? 'Unshifted (S₀)'
                    : shifts.deltaS > 0
                    ? `Shift Right (+${shifts.deltaS})`
                    : `Shift Left (${shifts.deltaS})`}
                </span>
              </div>

              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={shifts.deltaS}
                onChange={(e) => setShifts((prev) => ({ ...prev, deltaS: Number(e.target.value) }))}
                className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-violet-600 touch-none"
              />

              <div className="flex items-center justify-between gap-1 pt-0.5">
                <button
                  onClick={() => setShifts((prev) => ({ ...prev, deltaS: -20 }))}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  ← Left
                </button>
                <button
                  onClick={() => setShifts((prev) => ({ ...prev, deltaS: 0 }))}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  Center (0)
                </button>
                <button
                  onClick={() => setShifts((prev) => ({ ...prev, deltaS: 20 }))}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  Right →
                </button>
              </div>
            </div>
          </div>

          {/* Compact Visual Before/After Comparison Card (No raw numbers) */}
          <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Before vs. After Comparison</span>
              </div>
              <span className="text-[10px] font-medium text-stone-400">Qualitative Analysis</span>
            </div>

            {/* 4 Metric Badges Grid */}
            <div className="space-y-2 text-xs">
              {/* 1. MB at Traded Quantity */}
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-stone-800">MB at Traded Quantity:</span>
                  <span className="text-[11px] text-stone-500">Value of last unit to society</span>
                </div>
                <div className="flex items-center gap-1 font-bold">
                  {mbChange === 'higher' ? (
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Higher</span>
                    </span>
                  ) : mbChange === 'lower' ? (
                    <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Lower</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-stone-700 bg-stone-200/60 px-2 py-0.5 rounded">
                      <Equal className="w-3.5 h-3.5" />
                      <span>Unchanged</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 2. MC at Traded Quantity */}
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-stone-800">MC at Traded Quantity:</span>
                  <span className="text-[11px] text-stone-500">Cost of last unit to society</span>
                </div>
                <div className="flex items-center gap-1 font-bold">
                  {mcChange === 'higher' ? (
                    <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Higher</span>
                    </span>
                  ) : mcChange === 'lower' ? (
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Lower</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-stone-700 bg-stone-200/60 px-2 py-0.5 rounded">
                      <Equal className="w-3.5 h-3.5" />
                      <span>Unchanged</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Quantity Traded (Qt) */}
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-stone-800">Quantity Traded (Qt):</span>
                  <span className="text-[11px] text-stone-500">Actual transacted volume</span>
                </div>
                <div className="flex items-center gap-1 font-bold">
                  {qtChange === 'higher' ? (
                    <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Expanded</span>
                    </span>
                  ) : qtChange === 'lower' ? (
                    <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      <span>Contracted</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-stone-700 bg-stone-200/60 px-2 py-0.5 rounded">
                      <Equal className="w-3.5 h-3.5" />
                      <span>Unchanged</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Deadweight Loss (DWL) Result */}
              <div className={`p-3 rounded-lg border transition-all space-y-2 ${
                dwlMode === 'change'
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-stone-100/70 border border-stone-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">Deadweight Loss (DWL):</span>
                  {dwlDeltaType === 'none' ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero DWL (Efficient)</span>
                    </span>
                  ) : dwlDeltaType === 'increase' ? (
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>+ΔDWL (Increases)</span>
                    </span>
                  ) : dwlDeltaType === 'decrease' ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>−ΔDWL (Decreases)</span>
                    </span>
                  ) : (
                    <span className="text-stone-700 bg-stone-200/70 px-2 py-0.5 rounded font-bold">
                      DWL Unchanged
                    </span>
                  )}
                </div>

                {intervention !== 'none' && (
                  <div className="flex items-center gap-1 text-[11px] pt-0.5">
                    <button
                      onClick={() => setDwlMode((prev) => (prev === 'change' ? 'current' : 'change'))}
                      className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        dwlMode === 'change'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>{dwlMode === 'change' ? 'Showing Change in DWL' : 'Show Change in DWL on Diagram'}</span>
                    </button>
                  </div>
                )}

                {!isDwlStrictlyNested && hasShift && intervention !== 'none' && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200/70 leading-relaxed font-medium">
                    Note: Because both Qt and Q* shifted, the DWL region shifted laterally (expanding at Qt while contracting near Q*). The net deadweight loss changes, but cannot be shown as a single contiguous shaded region on the diagram.
                  </p>
                )}

                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {intervention === 'none'
                    ? 'No intervention is in place. Markets adjust to efficient equilibrium where MB = MC, so deadweight loss is zero.'
                    : !current.isBinding
                    ? 'The intervention is currently non-binding at the new equilibrium, so the market operates efficiently without deadweight loss.'
                    : current.status === 'underproduction'
                    ? 'At transacted quantity Qt, MB > MC (Underproduction). Deadweight loss represents foregone surplus from mutually beneficial trades that cannot occur.'
                    : 'At transacted quantity Qt, MC > MB (Overproduction). Deadweight loss represents the excess production cost over consumer valuation.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
