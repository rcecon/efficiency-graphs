import React, { useState } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { InterventionExplorer } from './components/InterventionExplorer';
import { QuestionPracticeView } from './components/QuestionPracticeView';
import { ConceptRulebook } from './components/ConceptRulebook';
import { Award } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('explorer');

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf8] text-stone-800">
      {/* Top Bar Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Pastel Green Hero Banner */}
        {activeTab === 'explorer' && (
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-[#edf7f2] border border-[#cde6d8] text-[#1b4332] shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2d6a4f] mb-1">
                  <span>HKDSE Curriculum Chapter 13A & Chapter 16</span>
                  <span aria-hidden="true">·</span>
                  <span>Interactive Learning Platform</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1b4332]">
                  Market Intervention & Economic Efficiency
                </h1>
                <p className="text-xs sm:text-sm text-[#2d6a4f] max-w-2xl mt-1 leading-relaxed">
                  Explore Consumer Surplus (CS), Producer Surplus (PS), Change in CS/PS, and Deadweight Loss (DWL) through interactive diagrams and sentence-by-sentence answer practice.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('practice')}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#52b788] hover:bg-[#40916c] rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Start Practice Questions</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'explorer' && <InterventionExplorer />}
        {activeTab === 'practice' && <QuestionPracticeView />}
        {activeTab === 'guide' && <ConceptRulebook />}
      </main>

      {/* Clean Educational Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white/60 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <p className="font-medium text-stone-700">
              HKDSE Economics Interactive Learning Platform
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Based on official curriculum standards and <em>Economics in Action 3 (Lesson All-in-One Notes Ch. 16)</em>.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>Rationing & Allocative Price Functions</span>
            <span>·</span>
            <span>MB & MC Analysis</span>
            <span>·</span>
            <span>Sentence Dropdown Answer Builder</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
