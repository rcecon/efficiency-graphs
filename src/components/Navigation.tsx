import React from 'react';
import { BookOpen, BarChart3, HelpCircle } from 'lucide-react';

export type NavTab = 'explorer' | 'practice' | 'guide';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fbfbf8]/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#52b788] text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
            DSE
          </div>
          <button
            onClick={() => onTabChange('explorer')}
            className="text-left group cursor-pointer focus-visible:outline-none"
          >
            <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 group-hover:text-[#2d6a4f] transition-colors whitespace-nowrap shrink-0 block">
              Econ Efficiency Studio
            </span>
          </button>
        </div>

        {/* Zone 2: Concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('explorer')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'explorer'
                ? 'bg-[#eef7f2] text-[#2d6a4f] font-semibold border border-[#cde6d8]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#52b788]" />
            <span>Intervention Explorer</span>
          </button>

          <button
            onClick={() => onTabChange('practice')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'practice'
                ? 'bg-[#eef7f2] text-[#2d6a4f] font-semibold border border-[#cde6d8]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#52b788]" />
            <span>Practice Questions</span>
          </button>

          <button
            onClick={() => onTabChange('guide')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-[#eef7f2] text-[#2d6a4f] font-semibold border border-[#cde6d8]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#52b788]" />
            <span>Notes & Rules</span>
          </button>
        </nav>


      </div>

      {/* Mobile secondary tab strip */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto pt-2.5 pb-1 border-t border-stone-100 mt-2">
        <button
          onClick={() => onTabChange('explorer')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded-md ${
            activeTab === 'explorer' ? 'bg-[#eef7f2] text-[#2d6a4f] font-semibold border border-[#cde6d8]' : 'text-stone-600'
          }`}
        >
          Explorer
        </button>
        <button
          onClick={() => onTabChange('practice')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded-md ${
            activeTab === 'practice' ? 'bg-[#eef7f2] text-[#2d6a4f] font-semibold border border-[#cde6d8]' : 'text-stone-600'
          }`}
        >
          Practice Questions
        </button>
        <button
          onClick={() => onTabChange('guide')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded-md ${
            activeTab === 'guide' ? 'bg-[#eef7f2] text-[#2d6a4f] font-semibold border border-[#cde6d8]' : 'text-stone-600'
          }`}
        >
          Notes & Rules
        </button>
      </div>
    </header>
  );
};
