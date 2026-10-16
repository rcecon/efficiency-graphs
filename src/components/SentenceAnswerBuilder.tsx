import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QuestionItem, SentenceStep } from '../types/economics';
import { CheckCircle2, AlertCircle, RefreshCw, Award, Edit3, ArrowRight } from 'lucide-react';

interface SentenceAnswerBuilderProps {
  question: QuestionItem;
  onQuestionCompleted?: () => void;
}

export const SentenceAnswerBuilder: React.FC<SentenceAnswerBuilderProps> = ({
  question,
  onQuestionCompleted,
}) => {
  // Store student selections: Record<stepId, Record<blankId, selectedValue>>
  const [selections, setSelections] = useState<Record<string, Record<string, string>>>({});
  // Status per step: 'idle' | 'checking' | 'correct' | 'incorrect'
  const [stepStatus, setStepStatus] = useState<Record<string, 'idle' | 'correct' | 'incorrect'>>({});
  // Feedback message per step
  const [stepFeedback, setStepFeedback] = useState<Record<string, { type: 'success' | 'error'; message: string }>>({});
  // Current active step index (0-based)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  // Whether the question is completely finished
  const [isFinished, setIsFinished] = useState<boolean>(false);
  // Editing a previously completed step
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  // Reset state when question changes
  useEffect(() => {
    setSelections({});
    setStepStatus({});
    setStepFeedback({});
    setCurrentStepIndex(0);
    setIsFinished(false);
    setEditingStepIndex(null);
  }, [question.id]);

  const handleSelectionChange = (stepId: string, blankId: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || {}),
        [blankId]: value,
      },
    }));
    // Clear feedback when user changes selection
    setStepStatus((prev) => ({ ...prev, [stepId]: 'idle' }));
  };

  const checkStep = (step: SentenceStep, index: number) => {
    const stepSelections = selections[step.id] || {};
    
    // Check if all blanks in this step are chosen
    const allBlanks = [...step.blanks, ...(step.sentenceMidfix && (step as any).blanksMid ? (step as any).blanksMid : [])];
    const unselected = allBlanks.find((b) => !stepSelections[b.id]);
    
    if (unselected) {
      setStepStatus((prev) => ({ ...prev, [step.id]: 'incorrect' }));
      setStepFeedback((prev) => ({
        ...prev,
        [step.id]: {
          type: 'error',
          message: 'Please select an option for all dropdown blanks in this sentence before checking.',
        },
      }));
      return;
    }

    // Evaluate each blank
    let hasError = false;
    let hintMessage = '';

    for (const blank of allBlanks) {
      const chosen = stepSelections[blank.id];
      const isCorrect = chosen === blank.correctAnswer || (blank.acceptableAnswers && blank.acceptableAnswers.includes(chosen));

      if (!isCorrect) {
        hasError = true;
        const targetedHint = (blank.misconceptionHints && blank.misconceptionHints[chosen]) || 
          `Reconsider "${chosen}". Does this accurately reflect the economic mechanism in HKDSE economics?`;
        hintMessage = targetedHint;
        break; // Stop at first misconception to guide student
      }
    }

    if (hasError) {
      setStepStatus((prev) => ({ ...prev, [step.id]: 'incorrect' }));
      setStepFeedback((prev) => ({
        ...prev,
        [step.id]: {
          type: 'error',
          message: hintMessage,
        },
      }));
    } else {
      // Step is correct!
      setStepStatus((prev) => ({ ...prev, [step.id]: 'correct' }));
      setStepFeedback((prev) => ({
        ...prev,
        [step.id]: {
          type: 'success',
          message: step.explanationOnCorrect,
        },
      }));

      // If we were editing, close editing mode
      if (editingStepIndex !== null) {
        setEditingStepIndex(null);
        return;
      }

      // Check if this was the final step
      if (index === question.steps.length - 1) {
        setIsFinished(true);
        if (onQuestionCompleted) onQuestionCompleted();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.65 },
          });
        } catch {
          // ignore if canvas is not ready
        }
      } else {
        // Advance to next step
        setCurrentStepIndex(index + 1);
      }
    }
  };

  const handleReset = () => {
    setSelections({});
    setStepStatus({});
    setStepFeedback({});
    setCurrentStepIndex(0);
    setIsFinished(false);
    setEditingStepIndex(null);
  };

  // Helper to render completed sentence text
  const getConstructedSentenceText = (step: SentenceStep): string => {
    const stepSelections = selections[step.id] || {};
    const parts: string[] = [step.sentencePrefix];

    step.blanks.forEach((b, idx) => {
      const selected = stepSelections[b.id] || `[${b.placeholder}]`;
      parts.push(selected);
      if (step.sentenceMidfix && step.sentenceMidfix[idx]) {
        parts.push(step.sentenceMidfix[idx]);
      }
    });

    if ((step as any).blanksMid) {
      ((step as any).blanksMid as any[]).forEach((b) => {
        const selected = stepSelections[b.id] || `[${b.placeholder}]`;
        parts.push(selected);
      });
    }

    parts.push(step.sentenceSuffix);
    return parts.join('');
  };

  // Accumulated full answer text from all completed steps
  const accumulatedSentences = question.steps
    .filter((s, idx) => stepStatus[s.id] === 'correct' && idx <= (isFinished ? question.steps.length : currentStepIndex))
    .map((s) => getConstructedSentenceText(s));

  return (
    <div className="space-y-5">
      {/* Top Controller Bar: Progress & Reset Only (Practice Mode) */}
      <div className="flex items-center justify-between gap-3 p-3 bg-stone-50/90 rounded-xl border border-stone-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">
            Practice Construction:
          </span>
          <span className="text-xs font-medium text-stone-500">
            Select the correct wording to build your full answer
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
          <span>Progress:</span>
          <span className="font-mono font-bold text-[#2d6a4f] bg-[#eef7f2] px-2 py-0.5 rounded border border-[#cde6d8]">
            {Object.values(stepStatus).filter((s) => s === 'correct').length} / {question.steps.length} Sentences
          </span>
          <button
            onClick={handleReset}
            className="text-stone-500 hover:text-stone-800 p-1 rounded hover:bg-stone-200/50 cursor-pointer"
            title="Reset Answer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Accumulated Answer Section: "Your Answer So Far" */}
      <div className="bg-[#f0f8f4] border border-[#b7e4c7] rounded-xl p-4 sm:p-5 relative transition-all shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#358f66]" />
            <h3 className="text-sm font-bold text-[#1b4332] uppercase tracking-wide">
              Your Answer So Far
            </h3>
          </div>
          <span className="text-[11px] text-[#2d6a4f] font-medium">
            Live accumulation in exam essay paragraph
          </span>
        </div>

        {accumulatedSentences.length === 0 ? (
          <p className="text-xs text-[#2d6a4f]/70 italic py-2">
            Complete Sentence 1 below using the embedded dropdowns. Your full response will accumulate here in coherent HKDSE exam format.
          </p>
        ) : (
          <div className="prose prose-sm max-w-none text-[#1b4332] leading-relaxed font-normal bg-white/80 p-3.5 rounded-lg border border-[#cde6d8]">
            {accumulatedSentences.map((sentence, idx) => (
              <span key={idx} className="mr-1.5 inline">
                {sentence}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sentence-by-Sentence Construction Workspace */}
      <div className="space-y-3.5">
        {question.steps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex && !isFinished;
          const isCorrect = stepStatus[step.id] === 'correct';
          const isLocked = idx > currentStepIndex && !isFinished;
          const isEditing = editingStepIndex === idx;
          const feedback = stepFeedback[step.id];

          return (
            <div
              key={step.id}
              className={`rounded-xl border transition-all p-4 sm:p-5 ${
                isLocked
                  ? 'bg-stone-50/60 border-stone-200/60 opacity-60 pointer-events-none'
                  : isCorrect && !isEditing
                  ? 'bg-white border-[#95d5b2] shadow-xs'
                  : isCurrent || isEditing
                  ? 'bg-white border-[#52b788] shadow-sm ring-2 ring-[#52b788]/20'
                  : 'bg-white border-stone-200'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCorrect && !isEditing
                        ? 'bg-[#52b788] text-white'
                        : isCurrent || isEditing
                        ? 'bg-[#3b8763] text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900">{step.title}</h4>
                </div>

                {/* Edit affordance if already completed */}
                {isCorrect && !isEditing && (
                  <button
                    onClick={() => setEditingStepIndex(idx)}
                    className="text-xs text-stone-500 hover:text-[#2d6a4f] flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Revise</span>
                  </button>
                )}
              </div>

              {/* The Sentence with Embedded Dropdowns */}
              <div className="text-sm sm:text-base text-stone-900 leading-loose py-1">
                <span>{step.sentencePrefix}</span>

                {/* Blank 1 */}
                {step.blanks[0] && (
                  <select
                    disabled={isLocked || (isCorrect && !isEditing)}
                    value={selections[step.id]?.[step.blanks[0].id] || ''}
                    onChange={(e) => handleSelectionChange(step.id, step.blanks[0].id, e.target.value)}
                    className={`inline-block mx-1.5 px-3 py-1 text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                      isCorrect && !isEditing
                        ? 'bg-[#f0f8f4] text-[#1b4332] border-[#95d5b2]'
                        : 'bg-[#f4faf6] hover:bg-[#ebf6f0] text-stone-900 border-[#74c69d] shadow-xs focus:ring-2 focus:ring-[#52b788]'
                    }`}
                  >
                    <option value="" disabled>
                      {step.blanks[0].placeholder}
                    </option>
                    {step.blanks[0].options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {/* Midfix 0 */}
                {step.sentenceMidfix && step.sentenceMidfix[0] && <span>{step.sentenceMidfix[0]}</span>}

                {/* Blank 2 */}
                {step.blanks[1] && (
                  <select
                    disabled={isLocked || (isCorrect && !isEditing)}
                    value={selections[step.id]?.[step.blanks[1].id] || ''}
                    onChange={(e) => handleSelectionChange(step.id, step.blanks[1].id, e.target.value)}
                    className={`inline-block mx-1.5 px-3 py-1 text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                      isCorrect && !isEditing
                        ? 'bg-[#f0f8f4] text-[#1b4332] border-[#95d5b2]'
                        : 'bg-[#f4faf6] hover:bg-[#ebf6f0] text-stone-900 border-[#74c69d] shadow-xs focus:ring-2 focus:ring-[#52b788]'
                    }`}
                  >
                    <option value="" disabled>
                      {step.blanks[1].placeholder}
                    </option>
                    {step.blanks[1].options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {/* Midfix 1 */}
                {step.sentenceMidfix && step.sentenceMidfix[1] && <span>{step.sentenceMidfix[1]}</span>}

                {/* Blank 3 */}
                {step.blanks[2] && (
                  <select
                    disabled={isLocked || (isCorrect && !isEditing)}
                    value={selections[step.id]?.[step.blanks[2].id] || ''}
                    onChange={(e) => handleSelectionChange(step.id, step.blanks[2].id, e.target.value)}
                    className={`inline-block mx-1.5 px-3 py-1 text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                      isCorrect && !isEditing
                        ? 'bg-[#f0f8f4] text-[#1b4332] border-[#95d5b2]'
                        : 'bg-[#f4faf6] hover:bg-[#ebf6f0] text-stone-900 border-[#74c69d] shadow-xs focus:ring-2 focus:ring-[#52b788]'
                    }`}
                  >
                    <option value="" disabled>
                      {step.blanks[2].placeholder}
                    </option>
                    {step.blanks[2].options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {/* Secondary blanks if present */}
                {(step as any).blanksMid && (step as any).blanksMid[0] && (
                  <select
                    disabled={isLocked || (isCorrect && !isEditing)}
                    value={selections[step.id]?.[(step as any).blanksMid[0].id] || ''}
                    onChange={(e) => handleSelectionChange(step.id, (step as any).blanksMid[0].id, e.target.value)}
                    className={`inline-block mx-1.5 px-3 py-1 text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                      isCorrect && !isEditing
                        ? 'bg-[#f0f8f4] text-[#1b4332] border-[#95d5b2]'
                        : 'bg-[#f4faf6] hover:bg-[#ebf6f0] text-stone-900 border-[#74c69d] shadow-xs focus:ring-2 focus:ring-[#52b788]'
                    }`}
                  >
                    <option value="" disabled>
                      {(step as any).blanksMid[0].placeholder}
                    </option>
                    {((step as any).blanksMid[0].options as string[]).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                <span>{step.sentenceSuffix}</span>
              </div>

              {/* Action Zone */}
              {(!isCorrect || isEditing) && (
                <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
                  <div className="text-xs text-stone-500">
                    Complete all blanks in this sentence and click check.
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <button
                        onClick={() => setEditingStepIndex(null)}
                        className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => checkStep(step, idx)}
                      className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#40916c] hover:bg-[#2d6a4f] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Check Sentence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Targeted Diagnostic Feedback Box */}
              {feedback && (
                <div
                  className={`mt-3 p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2.5 ${
                    feedback.type === 'success'
                      ? 'bg-[#edf7f2] text-[#1b4332] border border-[#b7e4c7]'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#358f66] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-semibold">
                      {feedback.type === 'success' ? 'Marking Point Verified' : 'Misconception Hint:'}
                    </strong>
                    <span>{feedback.message}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Stage: Complete Answer, Marking Points & Diagram Checklist */}
      {isFinished && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] text-[#2d6a4f] flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  Full Answer Construction Complete!
                </h3>
                <p className="text-xs text-stone-500">
                  {question.officialRef || 'HKDSE Paper 2'}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Practice Again
            </button>
          </div>

          {/* Model Answer Comparison */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Source-Based Model Answer (from Lesson Notes)
            </h4>
            <div className="p-4 bg-[#f4faf6] rounded-xl border border-[#cde6d8] text-sm text-stone-800 leading-relaxed font-serif">
              "{question.modelAnswer}"
            </div>
          </div>

          {/* Marking Points Rubric */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Marking Scheme & Marks Breakdown
            </h4>
            <div className="space-y-2">
              {question.markingRubric.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-4 p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs"
                >
                  <span className="text-stone-700">{item.point}</span>
                  <span className="font-mono font-bold text-[#2d6a4f] shrink-0">
                    ({item.marks} {item.marks === 1 ? 'mark' : 'marks'})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagram Checklist */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Diagram Checklist (Essential elements to draw in HKDSE exam)
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600">
              {question.diagramChecklist.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900">
            <strong className="block font-semibold mb-1">Common HKDSE Mistakes to Avoid:</strong>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              {question.commonMistakes.map((mistake, idx) => (
                <li key={idx}>{mistake}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
