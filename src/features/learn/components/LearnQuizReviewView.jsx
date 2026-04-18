import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDashed,
    RotateCcw,
    XCircle,
} from 'lucide-react';
import { formatDifficultyLabel, isTextQuestion } from './learnQuizUtils';
import { getDifficultyClass } from './learnQuizTakingViewUtils';

export default function LearnQuizReviewView({ lesson, result, onBackToResults, onRetry }) {
    const [filterMode, setFilterMode] = useState('all');
    const [expandedExplanations, setExpandedExplanations] = useState({});
    const reviewItems = result?.reviewItems || [];

    const filteredQuestions = useMemo(() => (
        reviewItems
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                if (filterMode === 'correct') return item.isCorrect;
                if (filterMode === 'incorrect') return item.answered && !item.isCorrect;
                if (filterMode === 'skipped') return !item.answered;
                return true;
            })
    ), [filterMode, reviewItems]);

    const toggleExplanation = useCallback((index) => {
        setExpandedExplanations((previous) => ({ ...previous, [index]: !previous[index] }));
    }, []);

    const toggleAllExplanations = useCallback(() => {
        if (Object.keys(expandedExplanations).length > 0) {
            setExpandedExplanations({});
            return;
        }

        const nextState = {};
        reviewItems.forEach((_, index) => {
            nextState[index] = true;
        });
        setExpandedExplanations(nextState);
    }, [expandedExplanations, reviewItems]);

    return (
        <div className="min-h-screen bg-base-200">
            <div className="sticky top-0 z-30 border-b border-base-300 bg-base-100 shadow-sm">
                <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onBackToResults}
                            className="btn btn-sm rounded-xl border-base-300 bg-base-100 gap-1.5 font-bold text-base-content"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Kết quả
                        </button>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">
                            <BookOpen className="h-3 w-3" />
                            Review chi tiết
                        </span>
                        <span className="max-w-xs truncate text-sm font-black text-base-content">{lesson?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onRetry}
                            className="btn btn-sm rounded-xl border-base-300 bg-base-100 gap-1.5 font-bold text-base-content"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Làm lại
                        </button>
                        <button
                            type="button"
                            onClick={() => window.close()}
                            className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content"
                        >
                            Đóng tab
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'all', label: 'Tất cả', count: result.totalQuestions },
                            { id: 'correct', label: 'Đúng', count: result.correctCount },
                            { id: 'incorrect', label: 'Sai', count: result.incorrectCount },
                            { id: 'skipped', label: 'Bỏ qua', count: result.skippedCount },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setFilterMode(tab.id)}
                                className={`btn btn-sm rounded-xl gap-2 font-bold ${filterMode === tab.id ? 'btn-primary' : 'border-base-300 bg-base-100 text-base-content'}`}
                            >
                                {tab.label}
                                <span className="badge badge-xs">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={toggleAllExplanations}
                        className="btn btn-sm rounded-xl border-base-300 bg-base-100 gap-1.5 font-bold text-base-content"
                    >
                        {Object.keys(expandedExplanations).length > 0 ? (
                            <>
                                <ChevronUp className="h-3.5 w-3.5" />
                                Ẩn tất cả
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-3.5 w-3.5" />
                                Mở tất cả
                            </>
                        )}
                    </button>
                </div>

                {filteredQuestions.length > 0 ? (
                    <div className="space-y-3">
                        {filteredQuestions.map(({ item, index }) => {
                            const difficultyClass = getDifficultyClass(item.difficultyLevel);
                            const showExplanation = expandedExplanations[index];

                            return (
                                <motion.div
                                    key={item.displayId}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl border bg-base-100 p-5 shadow-sm ${item.isCorrect ? 'border-emerald-200' : item.answered ? 'border-rose-200' : 'border-base-300'}`}
                                >
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="badge badge-ghost badge-sm font-black">Câu {index + 1}</span>
                                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] ${difficultyClass}`}>
                                            {formatDifficultyLabel(item.difficultyLevel)}
                                        </span>
                                        {item.isCorrect ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/8 px-2 py-0.5 text-xs font-bold text-emerald-600">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Đúng
                                            </span>
                                        ) : item.answered ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/8 px-2 py-0.5 text-xs font-bold text-rose-600">
                                                <XCircle className="h-3 w-3" />
                                                Sai
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 text-xs font-bold text-base-content/45">
                                                <CircleDashed className="h-3 w-3" />
                                                Bỏ qua
                                            </span>
                                        )}
                                    </div>
                                    <p className="mb-3 text-sm font-bold leading-6 text-base-content">{item.questionText}</p>

                                    {isTextQuestion(item) ? (
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <div className="rounded-xl border border-base-300 bg-base-200/35 p-3">
                                                <p className="text-[10px] font-black uppercase text-base-content/40">Câu trả lời</p>
                                                <p className="mt-1 text-sm font-medium text-base-content/80">{item.userAnswerText || 'Chưa trả lời'}</p>
                                            </div>
                                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
                                                <p className="text-[10px] font-black uppercase text-emerald-700/70">Đáp án đúng</p>
                                                <p className="mt-1 text-sm font-bold text-emerald-700">{item.correctTexts.join(', ') || 'Không có'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-2">
                                            {item.options.map((option, optionIndex) => {
                                                const isCorrect = item.correctOptionIds.includes(option.optionId);
                                                const isSelected = item.selectedOptionIds.includes(option.optionId);
                                                const optionClass = isCorrect
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : isSelected
                                                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                                                        : 'border-base-300 bg-base-100 text-base-content/65';

                                                return (
                                                    <div key={option.optionId || `r-${optionIndex}`} className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${optionClass}`}>
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-xs font-black shadow-sm">
                                                            {String.fromCharCode(65 + optionIndex)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{option.optionText}</p>
                                                            {isSelected && !isCorrect && option.optionExplanation && (
                                                                <p className="mt-1 text-xs opacity-75">{option.optionExplanation}</p>
                                                            )}
                                                        </div>
                                                        {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                                                        {!isCorrect && isSelected && <XCircle className="h-4 w-4 shrink-0 text-rose-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {item.questionExplanation && (
                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleExplanation(index)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600"
                                            >
                                                {showExplanation ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                                {showExplanation ? 'Ẩn giải thích' : 'Xem giải thích'}
                                            </button>
                                            <AnimatePresence>
                                                {showExplanation && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="mt-2 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-700"
                                                    >
                                                        <span className="font-bold">Giải thích:</span> {item.questionExplanation}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-12 text-center shadow-xl">
                        <CircleDashed className="mx-auto h-10 w-10 text-base-content/25" />
                        <p className="mt-4 text-lg font-black text-base-content">Không có câu hỏi trong bộ lọc này</p>
                    </div>
                )}
            </div>
        </div>
    );
}
