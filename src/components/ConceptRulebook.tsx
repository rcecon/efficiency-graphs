import React from 'react';
import { BookOpen, Lightbulb } from 'lucide-react';

export const ConceptRulebook: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-[#52b788]" />
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            HKDSE Economics Revision Guide: Market Efficiency & Intervention
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-600">
          Core concepts, definitions, answering templates, and common pitfalls compiled from <em>Economics in Action 3 (Lesson All-in-One Notes Ch. 16)</em> and <em>Chapter 13A Notes</em>.
        </p>
      </div>

      {/* 1. Functions of Price (13.1) */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
          1. Functions of Prices (價格的功能)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
            <span className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wide">
              Rationing Function (配給功能)
            </span>
            <p className="text-xs text-stone-700 leading-relaxed">
              • Goods are distributed to the <strong>highest-valued users</strong>.
              <br />
              • Only consumers who are willing and able to pay the market price obtain the goods.
              <br />
              • Related to the basic economic question: <em>"For whom to produce?"</em> (after the good is produced).
            </p>
            <div className="text-[11px] text-stone-500 bg-white p-2.5 rounded border border-stone-200">
              <strong>HKDSE Example:</strong> Concert tickets resold at high prices by touts illustrate the rationing function because tickets are rationed to highest-valued buyers.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
            <span className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wide">
              Allocative Function (分配(資源)功能)
            </span>
            <p className="text-xs text-stone-700 leading-relaxed">
              • Producers allocate <strong>more resources</strong> towards the production of goods that can be sold at a higher price.
              <br />
              • Prices transmit market information (such as consumer preferences) to producers.
              <br />
              • Related to the basic economic question: <em>"What to produce?"</em> (before the good is produced).
            </p>
            <div className="text-[11px] text-stone-500 bg-white p-2.5 rounded border border-stone-200">
              <strong>HKDSE Example:</strong> Rising demand and price for electric vehicles attracting manufacturers to build EV factories illustrates the allocative function.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Efficiency, MB = MC, and Deadweight Loss (13.4 & 16.1) */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
          2. Market Efficiency, MB = MC, and Deadweight Loss
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#edf7f2] border border-[#cde6d8]">
            <h4 className="font-bold text-[#1b4332] mb-1">Efficient Output (Q*)</h4>
            <p className="text-[#2d6a4f]">
              <strong>MB = MC</strong>
              <br />
              Total social surplus (TSS) is maximised. Deadweight loss is zero.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200">
            <h4 className="font-bold text-amber-900 mb-1">Underproduction (Q &lt; Q*)</h4>
            <p className="text-amber-800">
              <strong>MB &gt; MC</strong>
              <br />
              Society values an additional unit more than its production cost, but it is not produced. DWL exists.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-200">
            <h4 className="font-bold text-rose-900 mb-1">Overproduction (Q &gt; Q*)</h4>
            <p className="text-rose-800">
              <strong>MC &gt; MB</strong>
              <br />
              The cost of producing extra units exceeds their value to society. DWL exists (e.g. under unit subsidies).
            </p>
          </div>
        </div>

        {/* Golden Exam Insight Box */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-950">
          <Lightbulb className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Crucial HKDSE Exam Rule (from Lesson Notes p. 6):</strong>
            <p>
              <strong>Both excess demand and excess supply imply underproduction!</strong>
              <br />
              • In a price ceiling, excess demand occurs, but actual transacted quantity is bounded by quantity supplied (Qs &lt; Q*).
              <br />
              • In a price floor, excess supply occurs, but actual transacted quantity is bounded by quantity demanded (Qd &lt; Q*).
              <br />
              Therefore, both price ceilings and price floors lead to <strong>underproduction</strong> and a deadweight loss.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Interventions Summary Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 border-b border-stone-200">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
            3. Summary of Market Interventions on Surplus & Efficiency
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-semibold">
                <th className="py-2.5 px-3">Intervention</th>
                <th className="py-2.5 px-3">Effective Condition</th>
                <th className="py-2.5 px-3">Price & Transacted Q</th>
                <th className="py-2.5 px-3">CS</th>
                <th className="py-2.5 px-3">PS</th>
                <th className="py-2.5 px-3">TSS Formula</th>
                <th className="py-2.5 px-3">DWL & Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">Price Ceiling (Pc)</td>
                <td className="py-2.5 px-3 font-mono">Pc &lt; Pe</td>
                <td className="py-2.5 px-3">P↓, Q↓ (underproduction)</td>
                <td className="py-2.5 px-3 font-bold text-amber-700">? (Uncertain)</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">↓ Decreases</td>
                <td className="py-2.5 px-3 font-mono">CS + PS</td>
                <td className="py-2.5 px-3 text-rose-700">DWL &gt; 0, Inefficient</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">Price Floor (Pf)</td>
                <td className="py-2.5 px-3 font-mono">Pf &gt; Pe</td>
                <td className="py-2.5 px-3">P↑, Q↓ (underproduction)</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">↓ Decreases</td>
                <td className="py-2.5 px-3 font-bold text-amber-700">? (Uncertain)</td>
                <td className="py-2.5 px-3 font-mono">CS + PS</td>
                <td className="py-2.5 px-3 text-rose-700">DWL &gt; 0, Inefficient</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">Quota (Qq)</td>
                <td className="py-2.5 px-3 font-mono">Qq &lt; Qe</td>
                <td className="py-2.5 px-3">P↑, Q↓ (underproduction)</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">↓ Decreases</td>
                <td className="py-2.5 px-3 font-bold text-amber-700">? (Uncertain)</td>
                <td className="py-2.5 px-3 font-mono">CS + PS</td>
                <td className="py-2.5 px-3 text-rose-700">DWL &gt; 0, Inefficient</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">Per-Unit Tax ($t)</td>
                <td className="py-2.5 px-3 font-mono">t &gt; 0 (S shifts up)</td>
                <td className="py-2.5 px-3">Ppaid↑, Precv↓, Q↓</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">↓ Decreases</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">↓ Decreases</td>
                <td className="py-2.5 px-3 font-mono text-indigo-700 font-semibold">CS + PS + Tax Rev</td>
                <td className="py-2.5 px-3 text-rose-700">Loss in CS+PS &gt; Tax → DWL</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">Per-Unit Subsidy ($s)</td>
                <td className="py-2.5 px-3 font-mono">s &gt; 0 (S shifts down)</td>
                <td className="py-2.5 px-3">Ppaid↓, Precv↑, Q↑ (overprod)</td>
                <td className="py-2.5 px-3 text-[#2d6a4f] font-bold">↑ Increases</td>
                <td className="py-2.5 px-3 text-[#2d6a4f] font-bold">↑ Increases</td>
                <td className="py-2.5 px-3 font-mono text-purple-700 font-semibold">CS + PS - Subsidy Paid</td>
                <td className="py-2.5 px-3 text-rose-700">Subsidy &gt; Gain in CS+PS → DWL</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Tax Burden & Subsidy Benefit (Incidence & Elasticity) */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
          4. Tax Burden & Subsidy Benefit (Tax & Subsidy Incidence)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Tax Burden Card */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2.5">
            <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
              <span>Unit Tax Burden</span>
            </h4>
            <div className="space-y-2 text-indigo-900 leading-relaxed">
              <p>
                <strong>Total Tax Burden (Total Tax Revenue):</strong>
                <br />
                Height = per-unit tax <em>t = P₁ - P₂</em>, Width = <em>Q₁</em>.
                <br />
                Total area = <strong>t × Q₁ = (P₁ - P₂) × Q₁</strong>.
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-indigo-100 space-y-1">
                <p>
                  <strong>• Consumer Tax Burden (Upper Rectangle):</strong>
                  <br />
                  Buyers pay a higher price <em>P₁ &gt; Pe</em>.
                  <br />
                  Per-unit burden = <em>P₁ - Pe</em>.
                  <br />
                  Total burden = <strong>(P₁ - Pe) × Q₁</strong>.
                </p>
                <p>
                  <strong>• Producer Tax Burden (Lower Rectangle):</strong>
                  <br />
                  Sellers receive a lower net price <em>P₂ &lt; Pe</em>.
                  <br />
                  Per-unit burden = <em>Pe - P₂</em>.
                  <br />
                  Total burden = <strong>(Pe - P₂) × Q₁</strong>.
                </p>
              </div>
              <p className="text-stone-600 italic">
                *Elasticity Rule: The party with lower price elasticity (less elastic) bears a greater tax burden.
              </p>
            </div>
          </div>

          {/* Subsidy Benefit Card */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
            <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
              <span>Unit Subsidy Benefit</span>
            </h4>
            <div className="space-y-2 text-emerald-900 leading-relaxed">
              <p>
                <strong>Total Subsidy Benefit (Govt Subsidy Expenditure):</strong>
                <br />
                Height = per-unit subsidy <em>s = P₂ - P₁</em>, Width = <em>Q₁</em>.
                <br />
                Total area = <strong>s × Q₁ = (P₂ - P₁) × Q₁</strong>.
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-100 space-y-1">
                <p>
                  <strong>• Consumer Subsidy Benefit (Lower Rectangle):</strong>
                  <br />
                  Buyers pay a lower price <em>P₁ &lt; Pe</em>.
                  <br />
                  Per-unit benefit = <em>Pe - P₁</em>.
                  <br />
                  Total benefit = <strong>(Pe - P₁) × Q₁</strong>.
                </p>
                <p>
                  <strong>• Producer Subsidy Benefit (Upper Rectangle):</strong>
                  <br />
                  Sellers receive a higher net price <em>P₂ &gt; Pe</em>.
                  <br />
                  Per-unit benefit = <em>P₂ - Pe</em>.
                  <br />
                  Total benefit = <strong>(P₂ - Pe) × Q₁</strong>.
                </p>
              </div>
              <p className="text-stone-600 italic">
                *Elasticity Rule: The party with lower price elasticity (less elastic) enjoys a greater share of the subsidy benefit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. The Standard HKDSE 4-Step Answering Pattern */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
          5. The Standard HKDSE 4-Step Answering Pattern (from Lesson Notes p. 12 & 17)
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200/80">
            <span className="font-mono font-bold text-[#2d6a4f] bg-white border border-[#cde6d8] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <strong className="text-stone-900 block font-semibold text-sm">
                Sentence 1 — Explain the change in curves / intervention
              </strong>
              <p className="text-stone-600 mt-0.5">
                State how the policy shifts the supply or demand curve, or whether a price control is effective/ineffective.
                <br />
                <em>Example:</em> "A decrease in the import quota will lead to a decrease in supply."
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200/80">
            <span className="font-mono font-bold text-[#2d6a4f] bg-white border border-[#cde6d8] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <strong className="text-stone-900 block font-semibold text-sm">
                Sentence 2 — State the change in price and quantity transacted
              </strong>
              <p className="text-stone-600 mt-0.5">
                Clearly state whether price rises or falls, and whether quantity transacted rises or falls.
                <br />
                <em>Example:</em> "This will lead to an increase in price and a decrease in quantity transacted."
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200/80">
            <span className="font-mono font-bold text-[#2d6a4f] bg-white border border-[#cde6d8] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <strong className="text-stone-900 block font-semibold text-sm">
                Sentence 3 — Compare MB and MC / gap between MB & MC
              </strong>
              <p className="text-stone-600 mt-0.5">
                State whether quantity transacted moves towards or away from the efficient output, and whether the gap between MB and MC narrows or widens.
                <br />
                <em>Example:</em> "As quantity transacted decreases away from the efficient output, the difference between marginal benefit and marginal cost will increase, resulting in a larger deadweight loss."
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200/80">
            <span className="font-mono font-bold text-[#2d6a4f] bg-white border border-[#cde6d8] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
              4
            </span>
            <div>
              <strong className="text-stone-900 block font-semibold text-sm">
                Sentence 4 — State the conclusion on economic efficiency
              </strong>
              <p className="text-stone-600 mt-0.5">
                Conclude unambiguously whether market efficiency improves, worsens, or is achieved.
                <br />
                <em>Example:</em> "Hence, economic efficiency will worsen."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
