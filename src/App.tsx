import React, { useState } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { InterventionExplorer } from './components/InterventionExplorer';
import { ShiftsExplorer } from './components/ShiftsExplorer';
import { QuestionPracticeView } from './components/QuestionPracticeView';
import { ConceptRulebook } from './components/ConceptRulebook';

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Tab Views */}
        {activeTab === 'explorer' && <InterventionExplorer />}
        {activeTab === 'shifts' && <ShiftsExplorer />}
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
