import React, { useState } from 'react';
import { MarketGraph } from './MarketGraph';
import { MarketState, InterventionType, SurplusDisplayMode } from '../types/economics';
import { calculateMarketMetrics, DEFAULT_MARKET_STATE } from '../utils/economicModel';
import { Sliders, Layers, Coins, Gift, Plus, Trash2, GitCompare, RotateCcw } from 'lucide-react';

export const InterventionExplorer: React.FC = () => {
  const [state, setState] = useState<MarketState>({
    ...DEFAULT_MARKET_STATE,
    interventionType: 'ceiling',
    ceilingPrice: 38, // moderate initial intervention
  });

  const [magnitude, setMagnitude] = useState<number>(38);
  const [hasSecondary, setHasSecondary] = useState<boolean>(false);
  const [secondaryMagnitude, setSecondaryMagnitude] = useState<number>(75);
  const [comparisonView, setComparisonView] = useState<'primary' | 'secondary' | 'overlay'>('primary');
  const [displayMode, setDisplayMode] = useState<SurplusDisplayMode>('all');

  const calculateState = (type: InterventionType, val: number): MarketState => {
    if (type === 'none' || val === 0) {
      return {
        ...DEFAULT_MARKET_STATE,
        interventionType: type,
        ceilingPrice: 50, // equilibrium Pe
        floorPrice: 50,   // equilibrium Pe
        quotaQty: 50,     // equilibrium Q*
        taxRate: 0,       // zero tax
        subsidyRate: 0,   // zero subsidy
      };
    }
    const ratio = val / 100;
    switch (type) {
      case 'ceiling':
        return {
          ...DEFAULT_MARKET_STATE,
          interventionType: type,
          ceilingPrice: 50 - ratio * 32,
        };
      case 'floor':
        return {
          ...DEFAULT_MARKET_STATE,
          interventionType: type,
          floorPrice: 50 + ratio * 30,
        };
      case 'quota':
        return {
          ...DEFAULT_MARKET_STATE,
          interventionType: type,
          quotaQty: 50 - ratio * 32,
        };
      case 'tax':
        return {
          ...DEFAULT_MARKET_STATE,
          interventionType: type,
          taxRate: ratio * 35,
        };
      case 'subsidy':
        return {
          ...DEFAULT_MARKET_STATE,
          interventionType: type,
          subsidyRate: ratio * 30,
        };
      default:
        return DEFAULT_MARKET_STATE;
    }
  };

  const metrics = calculateMarketMetrics(state);

  const secondaryState: MarketState | undefined = hasSecondary
    ? calculateState(state.interventionType, secondaryMagnitude)
    : undefined;

  const secondaryMetrics = secondaryState
    ? calculateMarketMetrics(secondaryState)
    : undefined;

  // Active state for detailed cards & status bar
  const activeState = (hasSecondary && comparisonView === 'secondary' && secondaryState)
    ? secondaryState
    : state;
  const activeMetrics = (hasSecondary && comparisonView === 'secondary' && secondaryMetrics)
    ? secondaryMetrics
    : metrics;

  const handleInterventionChange = (type: InterventionType) => {
    if (
      (type !== 'tax' && (displayMode === 'tax_total' || displayMode === 'tax_consumer' || displayMode === 'tax_producer')) ||
      (type !== 'subsidy' && (displayMode === 'subsidy_total' || displayMode === 'subsidy_consumer' || displayMode === 'subsidy_producer'))
    ) {
      setDisplayMode('all');
    }

    if (type === 'none') {
      setHasSecondary(false);
      setMagnitude(0);
      setState(calculateState('none', 0));
    } else {
      const newMag = magnitude === 0 ? 38 : magnitude;
      setMagnitude(newMag);
      setState(calculateState(type, newMag));
    }
  };

  const handleMagnitudeChange = (val: number) => {
    setMagnitude(val);
    setState(calculateState(state.interventionType, val));
  };

  const handleSecondaryMagnitudeChange = (val: number) => {
    setSecondaryMagnitude(val);
  };

  const handleAddSecondary = () => {
    setHasSecondary(true);
    // If primary is mild, set secondary moderate/high, else mild
    setSecondaryMagnitude(magnitude <= 45 ? 75 : 25);
    setComparisonView('primary');
  };

  const handleRemoveSecondary = () => {
    setHasSecondary(false);
    setComparisonView('primary');
  };

  const getInterventionName = (type: InterventionType) => {
    switch (type) {
      case 'ceiling': return 'Price Ceiling';
      case 'floor': return 'Price Floor';
      case 'quota': return 'Quota';
      case 'tax': return 'Unit Tax';
      case 'subsidy': return 'Unit Subsidy';
      default: return 'Intervention';
    }
  };

  const getParamLabel = (type: InterventionType, index: 1 | 2) => {
    switch (type) {
      case 'ceiling': return `Controlled Price (Pc${index})`;
      case 'floor': return `Controlled Price (Pf${index})`;
      case 'quota': return `Quota Quantity (Qq${index})`;
      case 'tax': return `Unit Tax Level (t${index})`;
      case 'subsidy': return `Unit Subsidy Level (s${index})`;
      default: return `Policy Level (${index})`;
    }
  };

  const getMagnitudeLabel = (val: number) => {
    if (val === 0 || state.interventionType === 'none') {
      return 'No Intervention';
    }
    if (val < 35) {
      return 'Mild Intervention';
    }
    if (val < 70) {
      return 'Moderate Intervention';
    }
    return 'High Magnitude';
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-5 h-5 text-[#52b788]" />
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Market Intervention & Surplus Explorer
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600">
              Analyse market intervention diagrams, consumer surplus (CS), producer surplus (PS), change in CS/PS, and deadweight loss.
            </p>
          </div>

          {/* Intervention Policy Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
            {(
              [
                { id: 'ceiling', label: 'Price Ceiling' },
                { id: 'floor', label: 'Price Floor' },
                { id: 'quota', label: 'Quota' },
                { id: 'tax', label: 'Unit Tax' },
                { id: 'subsidy', label: 'Unit Subsidy' },
                { id: 'none', label: 'Free Market (No Policy)' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => handleInterventionChange(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  state.interventionType === item.id
                    ? 'bg-[#52b788] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Graph + Controls & Surplus Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Diagram */}
        <div className="lg:col-span-7 space-y-4">
          <MarketGraph
            state={state}
            metrics={metrics}
            secondaryState={hasSecondary ? secondaryState : undefined}
            secondaryMetrics={hasSecondary ? secondaryMetrics : undefined}
            comparisonView={comparisonView}
            onComparisonViewChange={setComparisonView}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
          />

          {/* Conceptual Status Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Transacted Q vs Q*
              </span>
              <span className="text-sm font-bold text-stone-900 block mt-0.5">
                {activeMetrics.status === 'efficient'
                  ? 'Qt = Q* (Equilibrium)'
                  : activeMetrics.status === 'underproduction'
                  ? 'Qt < Q* (Underproduction)'
                  : 'Qt > Q* (Overproduction)'}
              </span>
              <span className="block text-[10px] text-stone-500 mt-1">
                {activeMetrics.status === 'efficient' ? 'MB = MC' : activeMetrics.status === 'underproduction' ? 'MB > MC' : 'MC > MB'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Consumer Surplus
              </span>
              <span className="text-sm font-bold text-sky-800 block mt-0.5">
                {activeMetrics.csAreaDesc}
              </span>
              <span className="block text-[10px] text-stone-500 mt-1">
                Change: {activeMetrics.changeCsDesc}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Producer Surplus
              </span>
              <span className="text-sm font-bold text-amber-800 block mt-0.5">
                {activeMetrics.psAreaDesc}
              </span>
              <span className="block text-[10px] text-stone-500 mt-1">
                Change: {activeMetrics.changePsDesc}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                {hasSecondary && comparisonView === 'overlay' ? 'Change in DWL (ΔDWL)' : 'Deadweight Loss'}
              </span>
              <span className={`text-sm font-bold block mt-0.5 ${
                hasSecondary && comparisonView === 'overlay'
                  ? secondaryMagnitude > magnitude
                    ? 'text-rose-700'
                    : secondaryMagnitude < magnitude
                    ? 'text-emerald-700'
                    : 'text-stone-700'
                  : 'text-rose-700'
              }`}>
                {hasSecondary && comparisonView === 'overlay'
                  ? magnitude === secondaryMagnitude
                    ? 'ΔDWL = 0 (Identical)'
                    : secondaryMagnitude > magnitude
                    ? 'ΔDWL: Increase (+ Loss)'
                    : 'ΔDWL: Decrease (− Gain)'
                  : activeMetrics.dwlAreaDesc}
              </span>
              <span className="block text-[10px] text-stone-500 mt-1">
                {hasSecondary && comparisonView === 'overlay'
                  ? magnitude === secondaryMagnitude
                    ? 'Both policies cause identical market distortion'
                    : secondaryMagnitude > magnitude
                    ? 'Policy 2 is more restrictive (additional DWL between Q₁ and Q₂)'
                    : 'Policy 2 reduces distortion (welfare surplus recovered)'
                  : activeMetrics.isEffective ? 'Market is Inefficient' : 'Efficiency Attained'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Policy Setting, Dual Comparison, and CS/PS Analysis */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dual Intervention Comparison Toolbar (when secondary is active) */}
          {hasSecondary && (
            <div className="bg-violet-50/80 rounded-xl border border-violet-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-violet-950 text-xs">
                  <GitCompare className="w-4 h-4 text-violet-700" />
                  <span>Dual {getInterventionName(state.interventionType)} Comparison</span>
                </div>
                <button
                  onClick={handleRemoveSecondary}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-stone-200 hover:border-rose-200 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  title="Remove second intervention and return to single policy view"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Second</span>
                </button>
              </div>

              {/* View Switcher Controls */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-violet-900 block">
                  Select Shaded Area View on Diagram:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => setComparisonView('primary')}
                    className={`py-1.5 px-2 rounded-md font-semibold transition-all cursor-pointer text-center ${
                      comparisonView === 'primary'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white border border-violet-200 text-stone-700 hover:bg-violet-100/50'
                    }`}
                  >
                    1. Policy 1 (Original)
                  </button>

                  <button
                    onClick={() => setComparisonView('secondary')}
                    className={`py-1.5 px-2 rounded-md font-semibold transition-all cursor-pointer text-center ${
                      comparisonView === 'secondary'
                        ? 'bg-violet-700 text-white shadow-xs'
                        : 'bg-white border border-violet-200 text-stone-700 hover:bg-violet-100/50'
                    }`}
                  >
                    2. Policy 2 (New)
                  </button>

                  <button
                    onClick={() => setComparisonView('overlay')}
                    className={`py-1.5 px-2 rounded-md font-semibold transition-all cursor-pointer text-center ${
                      comparisonView === 'overlay'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white border border-violet-200 text-stone-700 hover:bg-violet-100/50'
                    }`}
                  >
                    3. Change in DWL (ΔDWL)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Primary Intervention Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide">
                  {hasSecondary ? `Policy 1 (Original ${getInterventionName(state.interventionType)})` : 'Intervention Condition'}
                </h3>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  metrics.isEffective
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-[#edf7f2] text-[#2d6a4f] border border-[#cde6d8]'
                }`}
              >
                {state.interventionType === 'none' || magnitude === 0
                  ? 'No Intervention (Equilibrium)'
                  : metrics.isEffective
                  ? 'Effective (Binds)'
                  : 'Ineffective'}
              </span>
            </div>

            {/* Slide Bar for Policy 1 */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="primary-magnitude-slider" className="font-semibold text-stone-700">
                  {getParamLabel(state.interventionType, 1)}:
                </label>
                <span className="font-medium text-[#2d6a4f] bg-[#eef7f2] px-2.5 py-0.5 rounded border border-[#cde6d8]">
                  {getMagnitudeLabel(magnitude)}
                </span>
              </div>

              <div className="relative pt-1">
                <input
                  id="primary-magnitude-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={state.interventionType === 'none' ? 0 : magnitude}
                  onChange={(e) => handleMagnitudeChange(Number(e.target.value))}
                  className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#dc2626] transition-all"
                />
                <div className="flex justify-between text-[11px] text-stone-500 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                    {state.interventionType === 'tax' || state.interventionType === 'subsidy' ? 'Zero (S₀)' : 'Equilibrium (Pe / Q*)'}
                  </span>
                  <span>Moderate</span>
                  <span className="flex items-center gap-1">
                    High Magnitude
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  </span>
                </div>
              </div>
            </div>

            {/* "+ Add another Intervention" Button (when single policy mode) */}
            {state.interventionType !== 'none' && !hasSecondary && (
              <div className="pt-2 border-t border-stone-100">
                <button
                  onClick={handleAddSecondary}
                  className="w-full py-2.5 px-3 bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <Plus className="w-4 h-4 text-violet-700" />
                  <span>+ Add another {getInterventionName(state.interventionType)}</span>
                </button>
              </div>
            )}
          </div>

          {/* Secondary Intervention Card (when active) */}
          {hasSecondary && secondaryState && secondaryMetrics && (
            <div className="bg-white rounded-xl border border-violet-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-bold text-violet-950 uppercase tracking-wide">
                    Policy 2 (New {getInterventionName(state.interventionType)})
                  </h3>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    secondaryMetrics.isEffective
                      ? 'bg-violet-50 text-violet-800 border border-violet-200'
                      : 'bg-stone-50 text-stone-600 border border-stone-200'
                  }`}
                >
                  {secondaryMagnitude === 0
                    ? 'No Intervention'
                    : secondaryMetrics.isEffective
                    ? 'Effective (Binds)'
                    : 'Ineffective'}
                </span>
              </div>

              {/* Independent Slide Bar for Policy 2 */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="secondary-magnitude-slider" className="font-semibold text-stone-700">
                    {getParamLabel(state.interventionType, 2)}:
                  </label>
                  <span className="font-medium text-violet-800 bg-violet-50 px-2.5 py-0.5 rounded border border-violet-200">
                    {getMagnitudeLabel(secondaryMagnitude)}
                  </span>
                </div>

                <div className="relative pt-1">
                  <input
                    id="secondary-magnitude-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={secondaryMagnitude}
                    onChange={(e) => handleSecondaryMagnitudeChange(Number(e.target.value))}
                    className="w-full h-2.5 bg-violet-100 rounded-lg appearance-none cursor-pointer accent-[#7c3aed] transition-all"
                  />
                  <div className="flex justify-between text-[11px] text-stone-500 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                      {state.interventionType === 'tax' || state.interventionType === 'subsidy' ? 'Zero (S₀)' : 'Equilibrium (Pe / Q*)'}
                    </span>
                    <span>Moderate</span>
                    <span className="flex items-center gap-1">
                      High Magnitude
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Change in CS and Change in PS Deep-Dive Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#52b788]" />
                <span>Change in CS & Change in PS Analysis</span>
              </h3>
            </div>

            {/* Quick Toggle for CS / PS / Change in CS / Change in PS */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setDisplayMode('change_cs')}
                className={`p-2.5 rounded-lg font-semibold border transition-all cursor-pointer text-left ${
                  displayMode === 'change_cs'
                    ? 'bg-[#edf7f2] border-[#74c69d] text-[#1b4332] ring-1 ring-[#52b788]'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="text-[11px] text-stone-500">Inspect on Diagram:</div>
                <div>Change in CS</div>
              </button>

              <button
                onClick={() => setDisplayMode('change_ps')}
                className={`p-2.5 rounded-lg font-semibold border transition-all cursor-pointer text-left ${
                  displayMode === 'change_ps'
                    ? 'bg-[#edf7f2] border-[#74c69d] text-[#1b4332] ring-1 ring-[#52b788]'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="text-[11px] text-stone-500">Inspect on Diagram:</div>
                <div>Change in PS</div>
              </button>
            </div>

            {/* Detailed Explanations */}
            <div className="space-y-2.5 text-xs text-stone-700 pt-1">
              {/* Change in CS box */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 space-y-1">
                <span className="font-bold text-sky-900 block">
                  Change in Consumer Surplus (CS): {activeMetrics.changeCsDesc}
                </span>
                {activeMetrics.changeCsDetail.gainArea && (
                  <p className="text-[#2d6a4f]">
                    <strong>+ Gain:</strong> {activeMetrics.changeCsDetail.gainReason} ({activeMetrics.changeCsDetail.gainArea})
                  </p>
                )}
                {activeMetrics.changeCsDetail.lossArea && (
                  <p className="text-rose-800">
                    <strong>- Loss:</strong> {activeMetrics.changeCsDetail.lossReason} ({activeMetrics.changeCsDetail.lossArea})
                  </p>
                )}
                <div className="pt-1 text-stone-600 font-medium border-t border-stone-200">
                  Conclusion: {activeMetrics.changeCsDetail.netConclusion}
                </div>
              </div>

              {/* Change in PS box */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 space-y-1">
                <span className="font-bold text-amber-900 block">
                  Change in Producer Surplus (PS): {activeMetrics.changePsDesc}
                </span>
                {activeMetrics.changePsDetail.gainArea && (
                  <p className="text-[#2d6a4f]">
                    <strong>+ Gain:</strong> {activeMetrics.changePsDetail.gainReason} ({activeMetrics.changePsDetail.gainArea})
                  </p>
                )}
                {activeMetrics.changePsDetail.lossArea && (
                  <p className="text-rose-800">
                    <strong>- Loss:</strong> {activeMetrics.changePsDetail.lossReason} ({activeMetrics.changePsDetail.lossArea})
                  </p>
                )}
                <div className="pt-1 text-stone-600 font-medium border-t border-stone-200">
                  Conclusion: {activeMetrics.changePsDetail.netConclusion}
                </div>
              </div>
            </div>
          </div>

          {/* Tax Burden Deep-Dive Card (Unit Tax) */}
          {activeState.interventionType === 'tax' && (
            <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-indigo-600" />
                  <span>Tax Burden & Incidence Analysis {hasSecondary ? `(${comparisonView === 'secondary' ? 'Policy 2' : 'Policy 1'})` : ''}</span>
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Tax Incidence
                </span>
              </div>

              {/* 3 Buttons: Total / Consumer Burden / Producer Burden */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setDisplayMode('tax_total')}
                  className={`p-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                    displayMode === 'tax_total'
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-1 ring-indigo-500'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-[10px] text-stone-500">Show on Graph:</div>
                  <div>Total Burden</div>
                </button>

                <button
                  onClick={() => setDisplayMode('tax_consumer')}
                  className={`p-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                    displayMode === 'tax_consumer'
                      ? 'bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-500'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-[10px] text-stone-500">Show on Graph:</div>
                  <div>Consumer Burden</div>
                </button>

                <button
                  onClick={() => setDisplayMode('tax_producer')}
                  className={`p-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                    displayMode === 'tax_producer'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-500'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-[10px] text-stone-500">Show on Graph:</div>
                  <div>Producer Burden</div>
                </button>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-2 text-xs text-stone-700 pt-1">
                <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 block">
                      1. Consumer Tax Burden: {activeMetrics.taxBurdenConsumerArea || 'Upper Rectangle'}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      Per unit: P₁ - Pe
                    </span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Buyer price rises from <strong>Pe</strong> to <strong>P₁</strong>. The per-unit consumer tax burden is <strong>P₁ - Pe</strong>. Total consumer tax burden is the <strong>Upper Rectangle = (P₁ - Pe) × Q₁</strong>.
                  </p>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 block">
                      2. Producer Tax Burden: {activeMetrics.taxBurdenProducerArea || 'Lower Rectangle'}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                      Per unit: Pe - P₂
                    </span>
                  </div>
                  <p className="text-amber-900 leading-relaxed">
                    Net price received by seller drops from <strong>Pe</strong> to <strong>P₂</strong>. The per-unit producer tax burden is <strong>Pe - P₂</strong>. Total producer tax burden is the <strong>Lower Rectangle = (Pe - P₂) × Q₁</strong>.
                  </p>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600 leading-relaxed space-y-1">
                  <div>
                    <strong>Total Tax Revenue (Total Burden):</strong> t × Q₁ = (P₁ - P₂) × Q₁ = Consumer Tax Burden + Producer Tax Burden.
                  </div>
                  <div className="text-stone-500 italic">
                    *HKDSE Rule: The relative tax burden depends on relative price elasticities of demand and supply (the side with lower price elasticity bears a larger share of the tax).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subsidy Benefit Deep-Dive Card (Unit Subsidy) */}
          {activeState.interventionType === 'subsidy' && (
            <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <span>Subsidy Benefit & Incidence Analysis {hasSecondary ? `(${comparisonView === 'secondary' ? 'Policy 2' : 'Policy 1'})` : ''}</span>
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Subsidy Incidence
                </span>
              </div>

              {/* 3 Buttons: Total / Consumer Benefit / Producer Benefit */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setDisplayMode('subsidy_total')}
                  className={`p-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                    displayMode === 'subsidy_total'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-1 ring-emerald-500'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-[10px] text-stone-500">Show on Graph:</div>
                  <div>Total Benefit</div>
                </button>

                <button
                  onClick={() => setDisplayMode('subsidy_consumer')}
                  className={`p-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                    displayMode === 'subsidy_consumer'
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-900 ring-1 ring-cyan-500'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-[10px] text-stone-500">Show on Graph:</div>
                  <div>Consumer Benefit</div>
                </button>

                <button
                  onClick={() => setDisplayMode('subsidy_producer')}
                  className={`p-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                    displayMode === 'subsidy_producer'
                      ? 'bg-teal-50 border-teal-400 text-teal-900 ring-1 ring-teal-500'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-[10px] text-stone-500">Show on Graph:</div>
                  <div>Producer Benefit</div>
                </button>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-2 text-xs text-stone-700 pt-1">
                <div className="p-3 bg-cyan-50/70 rounded-lg border border-cyan-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-950 block">
                      1. Consumer Subsidy Benefit: {activeMetrics.subsidyBenefitConsumerArea || 'Lower Rectangle'}
                    </span>
                    <span className="text-[10px] font-semibold text-cyan-700 bg-white px-2 py-0.5 rounded border border-cyan-200">
                      Per unit: Pe - P₁
                    </span>
                  </div>
                  <p className="text-cyan-900 leading-relaxed">
                    Buyer price drops from <strong>Pe</strong> to <strong>P₁</strong>. The per-unit consumer subsidy benefit is <strong>Pe - P₁</strong>. Total consumer subsidy benefit is the <strong>Lower Rectangle = (Pe - P₁) × Q₁</strong>.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 block">
                      2. Producer Subsidy Benefit: {activeMetrics.subsidyBenefitProducerArea || 'Upper Rectangle'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      Per unit: P₂ - Pe
                    </span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed">
                    Net price received by seller rises from <strong>Pe</strong> to <strong>P₂</strong>. The per-unit producer subsidy benefit is <strong>P₂ - Pe</strong>. Total producer subsidy benefit is the <strong>Upper Rectangle = (P₂ - Pe) × Q₁</strong>.
                  </p>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600 leading-relaxed space-y-1">
                  <div>
                    <strong>Total Subsidy Expenditure (Total Benefit):</strong> s × Q₁ = (P₂ - P₁) × Q₁ = Consumer Subsidy Benefit + Producer Subsidy Benefit.
                  </div>
                  <div className="text-stone-500 italic">
                    *HKDSE Rule: The relative subsidy benefit depends on relative price elasticities of demand and supply (the side with lower price elasticity enjoys a larger share of the subsidy benefit).
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
