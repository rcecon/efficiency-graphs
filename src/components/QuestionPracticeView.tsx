import React, { useState } from 'react';
import { QUESTION_BANK } from '../data/questionBank';
import { QuestionItem, SurplusDisplayMode } from '../types/economics';
import { MarketGraph } from './MarketGraph';
import { SentenceAnswerBuilder } from './SentenceAnswerBuilder';
import { calculateMarketMetrics, DEFAULT_MARKET_STATE } from '../utils/economicModel';
import { Filter, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionPracticeViewProps {
  initialQuestionId?: string;
}

export const QuestionPracticeView: React.FC<QuestionPracticeViewProps> = ({ initialQuestionId }) => {
  const [selectedInterventionFilter, setSelectedInterventionFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeQuestionId, setActiveQuestionId] = useState<string>(
    initialQuestionId || QUESTION_BANK[0].id
  );
  const [displayMode, setDisplayMode] = useState<SurplusDisplayMode>('all');

  // Filter questions
  const filteredQuestions = QUESTION_BANK.filter((q) => {
    const matchIntervention =
      selectedInterventionFilter === 'all' || q.intervention === selectedInterventionFilter;
    const matchCategory =
      selectedCategoryFilter === 'all' || q.category === selectedCategoryFilter;
    return matchIntervention && matchCategory;
  });

  const activeQuestion =
    QUESTION_BANK.find((q) => q.id === activeQuestionId) || filteredQuestions[0] || QUESTION_BANK[0];

  const activeIndex = QUESTION_BANK.findIndex((q) => q.id === activeQuestion.id);

  // Generate dynamic state for the diagram matching this question's preset
  const diagramState = {
    ...DEFAULT_MARKET_STATE,
    interventionType: activeQuestion.diagramPreset.intervention,
    ...(activeQuestion.diagramPreset.params.ceilingPrice
      ? { ceilingPrice: activeQuestion.diagramPreset.params.ceilingPrice }
      : {}),
    ...(activeQuestion.diagramPreset.params.floorPrice
      ? { floorPrice: activeQuestion.diagramPreset.params.floorPrice }
      : {}),
    ...(activeQuestion.diagramPreset.params.quotaQty
      ? { quotaQty: activeQuestion.diagramPreset.params.quotaQty }
      : {}),
    ...(activeQuestion.diagramPreset.params.taxRate
      ? { taxRate: activeQuestion.diagramPreset.params.taxRate }
      : {}),
    ...(activeQuestion.diagramPreset.params.subsidyRate
      ? { subsidyRate: activeQuestion.diagramPreset.params.subsidyRate }
      : {}),
  };
  const diagramMetrics = calculateMarketMetrics(diagramState);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-[#52b788]" />
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Practice Questions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600">
              Construct high-scoring HKDSE essay answers sentence by sentence using embedded dropdowns.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          {/* Policy filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-stone-500 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Policy:
            </span>
            {(
              [
                { id: 'all', label: 'All Interventions' },
                { id: 'ceiling', label: 'Price Ceiling' },
                { id: 'floor', label: 'Price Floor' },
                { id: 'quota', label: 'Quota' },
                { id: 'tax', label: 'Unit Tax' },
                { id: 'subsidy', label: 'Unit Subsidy' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedInterventionFilter(item.id)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedInterventionFilter === item.id
                    ? 'bg-[#52b788] text-white font-semibold shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Question Navigator */}
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-mono">
              Q{activeIndex + 1} of {QUESTION_BANK.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={activeIndex === 0}
                onClick={() => setActiveQuestionId(QUESTION_BANK[activeIndex - 1].id)}
                className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Question"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={activeIndex === QUESTION_BANK.length - 1}
                onClick={() => setActiveQuestionId(QUESTION_BANK[activeIndex + 1].id)}
                className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next Question"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question Selector Carousel / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredQuestions.map((q) => {
          const isSelected = q.id === activeQuestion.id;
          return (
            <button
              key={q.id}
              onClick={() => setActiveQuestionId(q.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#52b788] ring-2 ring-[#52b788]/20 shadow-xs'
                  : 'bg-stone-50/70 border-stone-200 hover:bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5 text-stone-500">
                <span className="font-semibold text-[#2d6a4f]">
                  {q.officialRef || 'DSE Practice'}
                </span>
                <span className="font-mono">{q.marks}M</span>
              </div>
              <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                {q.title}
              </h4>
              <div className="mt-2 text-[10px] text-stone-500 flex items-center justify-between">
                <span className="capitalize">{q.intervention} intervention</span>
                <span className="text-stone-400">{q.sourceType}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Workspace: Question Prompt + Diagram + Sentence-by-Sentence Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Prompt & Diagram */}
        <div className="lg:col-span-5 space-y-4">
          {/* Question Card (Exam Strategy deleted as requested) */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-100">
              <span className="font-semibold text-[#2d6a4f] bg-[#eef7f2] px-2 py-0.5 rounded border border-[#cde6d8]">
                {activeQuestion.sourceType}
              </span>
              <span className="font-mono text-stone-500">
                Max Marks: {activeQuestion.marks} marks
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900 mb-2">
                {activeQuestion.title}
              </h3>
              <div className="text-xs sm:text-sm text-stone-800 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 leading-relaxed font-serif">
                "{activeQuestion.prompt}"
              </div>
            </div>
          </div>

          {/* Accompanying Supply-Demand Diagram */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-stone-700">Question Reference Diagram</span>
              <span className="text-[11px] text-stone-500">Interactive Model</span>
            </div>
            <MarketGraph
              state={diagramState}
              metrics={diagramMetrics}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
              customLabels={activeQuestion.diagramPreset.labelAnnotations}
            />
          </div>
        </div>

        {/* Right Column: Embedded Sentence Answer Builder */}
        <div className="lg:col-span-7">
          <SentenceAnswerBuilder
            question={activeQuestion}
          />
        </div>
      </div>
    </div>
  );
};
