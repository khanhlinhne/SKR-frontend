import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock,
    Flag,
    HelpCircle,
    Target,
} from 'lucide-react';
import {
    evaluateQuizAttempt,
    formatDifficultyLabel,
    formatTimeLeft,
    getQuizTimeLimitMinutes,
    isQuestionAnswered,
    isTextQuestion,
} from './learnQuizUtils';
import { getDifficultyClass } from './learnQuizTakingViewUtils';

export default function LearnQuizTakingView({ lesson, gradient, questions, onSubmit }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const timeLimitMinutes = useMemo(() => getQuizTimeLimitMinutes(lesson), [lesson]);
    const initialTimeLeft = timeLimitMinutes > 0 ? timeLimitMinutes * 60 : null;
    const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
    const hasTimeLimit = initialTimeLeft !== null;
    const isTimeLow = hasTimeLimit && timeLeft !== null && timeLeft <= 60;

    useEffect(() => {
        setTimeLeft(initialTimeLeft);
    }, [initialTimeLeft]);

    const answeredCount = useMemo(
        () => questions.filter((question) => isQuestionAnswered(question, answers[question.displayId])).length,
        [answers, questions],
    );
    const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
    const currentQuestion = questions[currentIndex] || null;

    const handleSelectOption = useCallback((questionId, optionId) => {
        setAnswers((previous) => ({ ...previous, [questionId]: [optionId] }));
    }, []);

    const handleTextAnswer = useCallback((questionId, value) => {
        setAnswers((previous) => ({ ...previous, [questionId]: value }));
    }, []);

    const handleToggleFlag = useCallback((index) => {
        setFlaggedQuestions((previous) => (
            previous.includes(index)
                ? previous.filter((item) => item !== index)
                : [...previous, index]
        ));
    }, []);

    const handleSubmit = useCallback((reason = 'manual') => {
        const timeSpentSeconds = initialTimeLeft !== null && timeLeft !== null
            ? Math.max(initialTimeLeft - timeLeft, 0)
            : null;
        const result = evaluateQuizAttempt({
            questions,
            answers,
            timeSpentSeconds,
            timeLeft,
            submitReason: reason,
        });
        onSubmit?.(result);
    }, [answers, initialTimeLeft, onSubmit, questions, timeLeft]);

    useEffect(() => {
        if (!hasTimeLimit || timeLeft === null) return undefined;
        if (timeLeft <= 0) {
            handleSubmit('timeout');
            return undefined;
        }

        const id = window.setTimeout(() => {
            setTimeLeft((previous) => (previous === null ? null : Math.max(previous - 1, 0)));
        }, 1000);

        return () => window.clearTimeout(id);
    }, [handleSubmit, hasTimeLimit, timeLeft]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') return;
            if (event.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex((previous) => previous - 1);
            if (event.key === 'ArrowRight' && currentIndex < questions.length - 1) setCurrentIndex((previous) => previous + 1);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, questions.length]);

    if (!currentQuestion) return null;

    const difficultyClass = getDifficultyClass(currentQuestion.difficultyLevel);

    return (
        <div className="flex h-screen overflow-hidden bg-base-200">
            <div className="w-72 shrink-0 overflow-hidden border-r border-base-300 bg-base-100 flex flex-col">
                <div className="border-b border-base-300 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-black text-base-content">
                            <Target className="h-4 w-4 text-blue-500" />
                            Điều hướng
                        </h3>
                        {hasTimeLimit && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ${isTimeLow ? 'animate-pulse bg-rose-500/10 text-rose-600' : 'bg-base-200 text-base-content/60'}`}>
                                <Clock className="h-3.5 w-3.5" />
                                {formatTimeLeft(timeLeft)}
                            </span>
                        )}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-base-200">
                        <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] font-bold text-base-content/35">
                        <span>{answeredCount}/{questions.length} đã trả lời</span>
                        <span>{progress}%</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-5 gap-1.5">
                        {questions.map((question, index) => {
                            const answered = isQuestionAnswered(question, answers[question.displayId]);
                            const active = index === currentIndex;
                            const flagged = flaggedQuestions.includes(index);
                            const cls = active
                                ? `bg-gradient-to-br ${gradient} text-white shadow-md`
                                : answered
                                    ? 'border border-emerald-200 bg-emerald-500/12 text-emerald-700'
                                    : 'bg-base-200 text-base-content/55 hover:bg-base-300';

                            return (
                                <button
                                    key={question.displayId}
                                    type="button"
                                    onClick={() => setCurrentIndex(index)}
                                    className={`relative flex aspect-square items-center justify-center rounded-xl text-xs font-black transition-all ${cls}`}
                                >
                                    {index + 1}
                                    {flagged && <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-amber-500 shadow" />}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-base-content/45">
                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-base-200" />Chưa</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-emerald-500/30" />Đã TL</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-500" />Đánh dấu</span>
                    </div>
                </div>

                <div className="border-t border-base-300 p-4">
                    <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-base-200/50 p-2">
                            <p className="text-sm font-black text-base-content">{questions.length}</p>
                            <p className="text-[9px] font-bold uppercase text-base-content/40">Tổng</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-2">
                            <p className="text-sm font-black text-emerald-600">{answeredCount}</p>
                            <p className="text-[9px] font-bold uppercase text-base-content/40">Đã TL</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2">
                            <p className="text-sm font-black text-amber-600">{flaggedQuestions.length}</p>
                            <p className="text-[9px] font-bold uppercase text-base-content/40">Đánh dấu</p>
                        </div>
                    </div>
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubmit('manual')}
                        className={`btn w-full rounded-xl border-none bg-gradient-to-r ${gradient} gap-1.5 font-bold text-white shadow-lg`}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Nộp bài
                    </motion.button>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="border-b border-base-300 bg-base-100 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                                <HelpCircle className="h-3 w-3" />
                                Đang làm bài
                            </span>
                            <h2 className="max-w-md truncate text-lg font-black text-base-content">{lesson?.title || 'Bài kiểm tra'}</h2>
                        </div>
                        {hasTimeLimit && (
                            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-black ${isTimeLow ? 'animate-pulse bg-rose-500/10 text-rose-600' : 'bg-base-200/60 text-base-content/60'}`}>
                                <Clock className="h-4 w-4" />
                                {formatTimeLeft(timeLeft)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-3xl px-6 py-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br ${gradient} px-3 py-1 text-xs font-black text-white shadow`}>
                                    {currentIndex + 1} / {questions.length}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.13em] ${difficultyClass}`}>
                                    {formatDifficultyLabel(currentQuestion?.difficultyLevel)}
                                </span>
                            </div>
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleToggleFlag(currentIndex)}
                                className={`btn btn-sm rounded-xl gap-1.5 ${flaggedQuestions.includes(currentIndex)
                                    ? 'border-none bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                    : 'border-base-300 bg-base-100 text-base-content/70'}`}
                            >
                                <Flag className="h-3.5 w-3.5" />
                                {flaggedQuestions.includes(currentIndex) ? 'Đã đánh dấu' : 'Đánh dấu'}
                            </motion.button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.22 }}
                            >
                                <div className="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-lg">
                                    <p className="mb-5 text-base font-black leading-8 text-base-content">
                                        {currentQuestion?.questionText}
                                    </p>

                                    {isTextQuestion(currentQuestion) ? (
                                        <textarea
                                            value={String(answers[currentQuestion.displayId] || '')}
                                            onChange={(event) => handleTextAnswer(currentQuestion.displayId, event.target.value)}
                                            placeholder="Nhập câu trả lời của bạn..."
                                            className="textarea textarea-bordered min-h-[140px] w-full rounded-2xl border-base-300 bg-base-200/30 text-sm font-medium"
                                            rows={5}
                                        />
                                    ) : (
                                        <div className="space-y-3">
                                            {currentQuestion?.options.map((option, optionIndex) => {
                                                const isSelected = Array.isArray(answers[currentQuestion.displayId])
                                                    && answers[currentQuestion.displayId].includes(option.optionId);

                                                return (
                                                    <motion.button
                                                        key={option.optionId || `opt-${optionIndex}`}
                                                        type="button"
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.99 }}
                                                        onClick={() => handleSelectOption(currentQuestion.displayId, option.optionId)}
                                                        className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${isSelected
                                                            ? 'border-blue-500 bg-blue-500/8 shadow-md shadow-blue-500/15'
                                                            : 'border-base-300 bg-base-100 hover:border-blue-400/40 hover:bg-base-200/30'}`}
                                                    >
                                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors ${isSelected ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-base-200 text-base-content/50'}`}>
                                                            {String.fromCharCode(65 + optionIndex)}
                                                        </span>
                                                        <span className={`flex-1 text-sm ${isSelected ? 'font-bold text-blue-700' : 'font-medium text-base-content'}`}>
                                                            {option.optionText}
                                                        </span>
                                                        {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-500" />}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentIndex((previous) => Math.max(previous - 1, 0))}
                                        disabled={currentIndex === 0}
                                        className="btn rounded-xl border-base-300 bg-base-100 gap-1.5 font-bold text-base-content"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Câu trước
                                    </button>
                                    <p className="text-xs font-bold text-base-content/40">
                                        Dùng phím ← → để chuyển câu
                                    </p>
                                    {currentIndex < questions.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentIndex((previous) => Math.min(previous + 1, questions.length - 1))}
                                            className="btn rounded-xl border-base-300 bg-base-100 gap-1.5 font-bold text-base-content"
                                        >
                                            Câu tiếp
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleSubmit('manual')}
                                            className={`btn rounded-xl border-none bg-gradient-to-r ${gradient} gap-1.5 font-bold text-white shadow-lg`}
                                        >
                                            Nộp bài
                                            <CheckCircle2 className="h-4 w-4" />
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
