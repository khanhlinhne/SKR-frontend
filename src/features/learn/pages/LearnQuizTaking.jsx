import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDashed,
    Clock,
    Eye,
    Flag,
    HelpCircle,
    Lightbulb,
    Loader2,
    RotateCcw,
    Sparkles,
    Target,
    Trophy,
    XCircle,
} from 'lucide-react';
import { courseApi } from '@/shared/api';
import { OwlLoader } from '@/shared/ui/common';
import {
    QUIZ_DIFFICULTY_STYLES,
    evaluateQuizAttempt,
    formatDifficultyLabel,
    formatTimeLeft,
    formatTimeLimitLabel,
    getQuizTimeLimitMinutes,
    isQuestionAnswered,
    isTextQuestion,
    normalizeQuestions,
} from '../components/learnQuizUtils';

/* ─── Helpers ─── */
function getDifficultyClass(level) {
    return QUIZ_DIFFICULTY_STYLES[level] || 'bg-base-200 text-base-content/60';
}

function getScoreTone(percentage) {
    if (percentage >= 80) return { chip: 'bg-emerald-500/10 text-emerald-700', text: 'text-emerald-600', stroke: 'stroke-emerald-500', label: 'Nắm bài rất tốt' };
    if (percentage >= 50) return { chip: 'bg-blue-500/10 text-blue-700', text: 'text-blue-600', stroke: 'stroke-blue-500', label: 'Đạt yêu cầu' };
    return { chip: 'bg-rose-500/10 text-rose-700', text: 'text-rose-600', stroke: 'stroke-rose-500', label: 'Cần ôn lại' };
}

/* ─── Quiz Taking View ─── */
function TakingView({ lesson, gradient, questions, onSubmit }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const timeLimitMinutes = useMemo(() => getQuizTimeLimitMinutes(lesson), [lesson]);
    const initialTimeLeft = timeLimitMinutes > 0 ? timeLimitMinutes * 60 : null;
    const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
    const hasTimeLimit = initialTimeLeft !== null;
    const isTimeLow = hasTimeLimit && timeLeft !== null && timeLeft <= 60;

    useEffect(() => { setTimeLeft(initialTimeLeft); }, [initialTimeLeft]);

    const answeredCount = useMemo(
        () => questions.filter((q) => isQuestionAnswered(q, answers[q.displayId])).length,
        [answers, questions],
    );
    const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
    const currentQuestion = questions[currentIndex] || null;

    const handleSelectOption = useCallback((qId, optId) => {
        setAnswers((p) => ({ ...p, [qId]: [optId] }));
    }, []);

    const handleTextAnswer = useCallback((qId, value) => {
        setAnswers((p) => ({ ...p, [qId]: value }));
    }, []);

    const handleToggleFlag = useCallback((idx) => {
        setFlaggedQuestions((p) => p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]);
    }, []);

    const handleSubmit = useCallback((reason = 'manual') => {
        const timeSpentSeconds = initialTimeLeft !== null && timeLeft !== null
            ? Math.max(initialTimeLeft - timeLeft, 0) : null;
        const result = evaluateQuizAttempt({ questions, answers, timeSpentSeconds, timeLeft, submitReason: reason });
        onSubmit?.(result);
    }, [answers, initialTimeLeft, onSubmit, questions, timeLeft]);

    useEffect(() => {
        if (!hasTimeLimit || timeLeft === null) return undefined;
        if (timeLeft <= 0) { handleSubmit('timeout'); return undefined; }
        const id = window.setTimeout(() => setTimeLeft((p) => (p === null ? null : Math.max(p - 1, 0))), 1000);
        return () => window.clearTimeout(id);
    }, [handleSubmit, hasTimeLimit, timeLeft]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
            if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex((p) => p - 1);
            if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) setCurrentIndex((p) => p + 1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, questions.length]);

    if (!currentQuestion) return null;

    const difficultyClass = getDifficultyClass(currentQuestion.difficultyLevel);

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 bg-base-100 border-r border-base-300 flex flex-col shrink-0 overflow-hidden">
                {/* Timer + progress header */}
                <div className="p-4 border-b border-base-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-black text-base-content flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            Điều hướng
                        </h3>
                        {hasTimeLimit && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ${isTimeLow ? 'bg-rose-500/10 text-rose-600 animate-pulse' : 'bg-base-200 text-base-content/60'}`}>
                                <Clock className="h-3.5 w-3.5" />
                                {formatTimeLeft(timeLeft)}
                            </span>
                        )}
                    </div>
                    <div className="h-2 rounded-full bg-base-200 overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] font-bold text-base-content/35">
                        <span>{answeredCount}/{questions.length} đã trả lời</span>
                        <span>{progress}%</span>
                    </div>
                </div>

                {/* Question grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-5 gap-1.5">
                        {questions.map((q, index) => {
                            const answered = isQuestionAnswered(q, answers[q.displayId]);
                            const active = index === currentIndex;
                            const flagged = flaggedQuestions.includes(index);
                            const cls = active
                                ? `bg-gradient-to-br ${gradient} text-white shadow-md`
                                : answered
                                    ? 'border border-emerald-200 bg-emerald-500/12 text-emerald-700'
                                    : 'bg-base-200 text-base-content/55 hover:bg-base-300';
                            return (
                                <button
                                    key={q.displayId} type="button"
                                    onClick={() => setCurrentIndex(index)}
                                    className={`relative flex aspect-square items-center justify-center rounded-xl text-xs font-black transition-all ${cls}`}
                                >
                                    {index + 1}
                                    {flagged && <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-amber-500 shadow" />}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-base-content/45 font-bold">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-base-200 inline-block" />Chưa</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500/30 inline-block" />Đã TL</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />Đánh dấu</span>
                    </div>
                </div>

                {/* Submit button in sidebar */}
                <div className="p-4 border-t border-base-300">
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div className="bg-base-200/50 rounded-lg p-2">
                            <p className="text-sm font-black text-base-content">{questions.length}</p>
                            <p className="text-[9px] font-bold text-base-content/40 uppercase">Tổng</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-2">
                            <p className="text-sm font-black text-emerald-600">{answeredCount}</p>
                            <p className="text-[9px] font-bold text-base-content/40 uppercase">Đã TL</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2">
                            <p className="text-sm font-black text-amber-600">{flaggedQuestions.length}</p>
                            <p className="text-[9px] font-bold text-base-content/40 uppercase">Đánh dấu</p>
                        </div>
                    </div>
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubmit('manual')}
                        className={`btn w-full rounded-xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg gap-1.5`}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Nộp bài
                    </motion.button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <div className={`border-b border-base-300 bg-base-100 px-6 py-3`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                                <HelpCircle className="h-3 w-3" />
                                Đang làm bài
                            </span>
                            <h2 className="text-lg font-black text-base-content truncate max-w-md">{lesson?.title || 'Bài kiểm tra'}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasTimeLimit && (
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black ${isTimeLow ? 'bg-rose-500/10 text-rose-600 animate-pulse' : 'bg-base-200/60 text-base-content/60'}`}>
                                    <Clock className="h-4 w-4" />
                                    {formatTimeLeft(timeLeft)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable question area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-6 py-6">
                        {/* Question header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
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

                        {/* Question content - animated transition */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.22 }}
                            >
                                <div className="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-lg">
                                    <p className="text-base font-black leading-8 text-base-content mb-5">
                                        {currentQuestion?.questionText}
                                    </p>

                                    {isTextQuestion(currentQuestion) ? (
                                        <textarea
                                            value={String(answers[currentQuestion.displayId] || '')}
                                            onChange={(e) => handleTextAnswer(currentQuestion.displayId, e.target.value)}
                                            placeholder="Nhập câu trả lời của bạn..."
                                            className="textarea textarea-bordered w-full min-h-[140px] rounded-2xl border-base-300 bg-base-200/30 text-sm font-medium"
                                            rows={5}
                                        />
                                    ) : (
                                        <div className="space-y-3">
                                            {currentQuestion?.options.map((option, optIdx) => {
                                                const isSelected = Array.isArray(answers[currentQuestion.displayId])
                                                    && answers[currentQuestion.displayId].includes(option.optionId);
                                                return (
                                                    <motion.button
                                                        key={option.optionId || `opt-${optIdx}`}
                                                        type="button"
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.99 }}
                                                        onClick={() => handleSelectOption(currentQuestion.displayId, option.optionId)}
                                                        className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${isSelected
                                                            ? 'border-blue-500 bg-blue-500/8 shadow-md shadow-blue-500/15'
                                                            : 'border-base-300 bg-base-100 hover:border-blue-400/40 hover:bg-base-200/30'
                                                            }`}
                                                    >
                                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors ${isSelected ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-base-200 text-base-content/50'}`}>
                                                            {String.fromCharCode(65 + optIdx)}
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

                                {/* Navigation */}
                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentIndex((p) => Math.max(p - 1, 0))}
                                        disabled={currentIndex === 0}
                                        className="btn rounded-xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Câu trước
                                    </button>
                                    <p className="text-xs text-base-content/40 font-bold">
                                        Dùng phím ← → để chuyển câu
                                    </p>
                                    {currentIndex < questions.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentIndex((p) => Math.min(p + 1, questions.length - 1))}
                                            className="btn rounded-xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5"
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
                                            className={`btn rounded-xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg gap-1.5`}
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

/* ─── Results View ─── */
function ResultsView({ lesson, gradient, result, onRetry, onShowReview }) {
    const scoreTone = getScoreTone(result?.percentage || 0);
    const timeLimitMinutes = useMemo(() => getQuizTimeLimitMinutes(lesson), [lesson]);
    const pct = result?.percentage ?? 0;
    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (circumference * pct) / 100;

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl"
            >
                <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
                    <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                    <div className="p-8">
                        {/* Score donut */}
                        <div className="flex justify-center mb-6">
                            <div className="relative w-40 h-40">
                                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="10" className="stroke-base-300" />
                                    <motion.circle
                                        cx="60" cy="60" r="54" fill="none" strokeWidth="10" strokeLinecap="round"
                                        className={scoreTone.stroke}
                                        style={{ strokeDasharray: circumference }}
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset: dashOffset }}
                                        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className={`text-3xl font-black leading-none ${scoreTone.text}`}
                                    >
                                        {pct}%
                                    </motion.span>
                                    <span className="text-[10px] font-black uppercase text-base-content/35 mt-1">Điểm số</span>
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black mb-2 ${scoreTone.chip}`}>
                                <Sparkles className="h-3.5 w-3.5" />
                                {scoreTone.label}
                            </div>
                            <h2 className="text-xl font-black text-base-content">{lesson?.title || 'Bài kiểm tra'}</h2>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {[
                                { icon: CheckCircle2, label: 'Đúng', value: result.correctCount, cls: 'border-emerald-100 bg-emerald-50/60 text-emerald-700' },
                                { icon: XCircle, label: 'Sai', value: result.incorrectCount, cls: 'border-rose-100 bg-rose-50/60 text-rose-700' },
                                { icon: CircleDashed, label: 'Bỏ qua', value: result.skippedCount, cls: 'border-amber-100 bg-amber-50/60 text-amber-700' },
                                { icon: Clock, label: 'Thời gian', value: result.timeSpentSeconds != null ? formatTimeLeft(result.timeSpentSeconds) : formatTimeLimitLabel(timeLimitMinutes), cls: 'border-blue-100 bg-blue-50/60 text-blue-700' },
                            ].map(({ icon: Ic, label, value, cls }) => (
                                <div key={label} className={`rounded-xl border p-3 text-center ${cls}`}>
                                    <Ic className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-lg font-black">{value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-wider opacity-60">{label}</p>
                                </div>
                            ))}
                        </div>

                        {result.submitReason === 'timeout' && (
                            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                <p className="font-black">⏱ Bài đã tự nộp do hết giờ.</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <motion.button
                                type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={onShowReview}
                                className={`btn rounded-xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg gap-1.5`}
                            >
                                <Eye className="h-4 w-4" />
                                Xem review
                            </motion.button>
                            <button type="button" onClick={onRetry}
                                className="btn rounded-xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                                <RotateCcw className="h-4 w-4" />
                                Làm lại
                            </button>
                            <button type="button" onClick={() => window.close()}
                                className="btn rounded-xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                                Đóng tab
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Review View ─── */
function ReviewView({ lesson, gradient, result, onBackToResults, onRetry }) {
    const [filterMode, setFilterMode] = useState('all');
    const [expandedExplanations, setExpandedExplanations] = useState({});
    const reviewItems = result?.reviewItems || [];

    const filteredQuestions = useMemo(() =>
        reviewItems.map((item, index) => ({ item, index })).filter(({ item }) => {
            if (filterMode === 'correct') return item.isCorrect;
            if (filterMode === 'incorrect') return item.answered && !item.isCorrect;
            if (filterMode === 'skipped') return !item.answered;
            return true;
        }),
        [filterMode, reviewItems],
    );

    const toggleExplanation = useCallback((index) => {
        setExpandedExplanations((prev) => ({ ...prev, [index]: !prev[index] }));
    }, []);

    const toggleAllExplanations = useCallback(() => {
        if (Object.keys(expandedExplanations).length > 0) { setExpandedExplanations({}); return; }
        const all = {};
        reviewItems.forEach((_, i) => { all[i] = true; });
        setExpandedExplanations(all);
    }, [expandedExplanations, reviewItems]);

    return (
        <div className="min-h-screen bg-base-200">
            {/* Sticky header */}
            <div className="sticky top-0 z-30 bg-base-100 border-b border-base-300 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={onBackToResults}
                            className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                            <ArrowLeft className="h-3.5 w-3.5" />Kết quả
                        </button>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">
                            <BookOpen className="h-3 w-3" />Review chi tiết
                        </span>
                        <span className="text-sm font-black text-base-content truncate max-w-xs">{lesson?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={onRetry}
                            className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                            <RotateCcw className="h-3.5 w-3.5" />Làm lại
                        </button>
                        <button type="button" onClick={() => window.close()}
                            className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content">
                            Đóng tab
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'all', label: 'Tất cả', count: result.totalQuestions },
                            { id: 'correct', label: 'Đúng', count: result.correctCount },
                            { id: 'incorrect', label: 'Sai', count: result.incorrectCount },
                            { id: 'skipped', label: 'Bỏ qua', count: result.skippedCount },
                        ].map((tab) => (
                            <button key={tab.id} type="button" onClick={() => setFilterMode(tab.id)}
                                className={`btn btn-sm rounded-xl gap-2 font-bold ${filterMode === tab.id ? 'btn-primary' : 'border-base-300 bg-base-100 text-base-content'}`}>
                                {tab.label}
                                <span className="badge badge-xs">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={toggleAllExplanations}
                        className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                        {Object.keys(expandedExplanations).length > 0
                            ? <><ChevronUp className="h-3.5 w-3.5" />Ẩn tất cả</>
                            : <><ChevronDown className="h-3.5 w-3.5" />Mở tất cả</>}
                    </button>
                </div>

                {/* Review items */}
                {filteredQuestions.length > 0 ? (
                    <div className="space-y-3">
                        {filteredQuestions.map(({ item, index }) => {
                            const dClass = getDifficultyClass(item.difficultyLevel);
                            const showExp = expandedExplanations[index];
                            return (
                                <motion.div
                                    key={item.displayId}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl border bg-base-100 p-5 shadow-sm ${item.isCorrect ? 'border-emerald-200' : item.answered ? 'border-rose-200' : 'border-base-300'}`}
                                >
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="badge badge-ghost badge-sm font-black">Câu {index + 1}</span>
                                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] ${dClass}`}>
                                            {formatDifficultyLabel(item.difficultyLevel)}
                                        </span>
                                        {item.isCorrect ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/8 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="h-3 w-3" />Đúng
                                            </span>
                                        ) : item.answered ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-500/8 px-2 py-0.5 rounded-full">
                                                <XCircle className="h-3 w-3" />Sai
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-base-content/45 bg-base-200 px-2 py-0.5 rounded-full">
                                                <CircleDashed className="h-3 w-3" />Bỏ qua
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold leading-6 text-base-content mb-3">{item.questionText}</p>

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
                                            {item.options.map((option, oi) => {
                                                const isCorrect = item.correctOptionIds.includes(option.optionId);
                                                const isSelected = item.selectedOptionIds.includes(option.optionId);
                                                const opCls = isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : isSelected ? 'border-rose-200 bg-rose-50 text-rose-700'
                                                        : 'border-base-300 bg-base-100 text-base-content/65';
                                                return (
                                                    <div key={option.optionId || `r-${oi}`} className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${opCls}`}>
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-xs font-black shadow-sm">
                                                            {String.fromCharCode(65 + oi)}
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
                                            <button type="button" onClick={() => toggleExplanation(index)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600">
                                                {showExp ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                                {showExp ? 'Ẩn giải thích' : 'Xem giải thích'}
                                            </button>
                                            <AnimatePresence>
                                                {showExp && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
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

/* ═══════════════════════════════════════════════
   Main Page — opens in new tab
   Route: /courses/:id/learn/quiz/:chapterId/:lessonId
   ═══════════════════════════════════════════════ */
export default function LearnQuizTaking() {
    const { id: courseId, chapterId, lessonId } = useParams();
    const [searchParams] = useSearchParams();
    const gradient = searchParams.get('gradient') || 'from-violet-500 to-purple-500';

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [phase, setPhase] = useState('taking'); // 'taking' | 'results' | 'review'
    const [result, setResult] = useState(null);

    // Fetch lesson content on mount
    useEffect(() => {
        let ignore = false;
        const fetchContent = async () => {
            try {
                setLoading(true);
                const response = await courseApi.getLessonContent(courseId, chapterId, lessonId);
                if (ignore) return;
                const data = response?.data || response || {};
                setLesson(data);
            } catch (err) {
                if (!ignore) {
                    console.error('Error loading quiz:', err);
                    setError('Không thể tải nội dung bài quiz.');
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        fetchContent();
        return () => { ignore = true; };
    }, [courseId, chapterId, lessonId]);

    const questions = useMemo(() => normalizeQuestions(lesson), [lesson]);

    // Warn before closing tab with unsaved answers
    useEffect(() => {
        if (phase !== 'taking') return undefined;
        const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [phase]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <OwlLoader
                    message="Đang tải bài quiz..."
                    subMessage="Cú đang chuẩn bị câu hỏi và đáp án cho bạn."
                    className="py-8"
                />
            </div>
        );
    }

    // Error state
    if (error || !lesson || questions.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <div className="text-center">
                    <HelpCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                    <h2 className="text-xl font-black text-base-content mb-2">
                        {error || 'Quiz không có câu hỏi'}
                    </h2>
                    <p className="text-sm text-base-content/50 mb-4">
                        Vui lòng quay lại trang học và thử lại.
                    </p>
                    <button onClick={() => window.close()} className="btn rounded-xl font-bold">
                        Đóng tab
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = (res) => {
        setResult(res);
        setPhase('results');
    };

    const handleRetry = () => {
        setResult(null);
        setPhase('taking');
    };

    if (phase === 'review' && result) {
        return (
            <ReviewView
                lesson={lesson} gradient={gradient} result={result}
                onBackToResults={() => setPhase('results')}
                onRetry={handleRetry}
            />
        );
    }

    if (phase === 'results' && result) {
        return (
            <ResultsView
                lesson={lesson} gradient={gradient} result={result}
                onRetry={handleRetry}
                onShowReview={() => setPhase('review')}
            />
        );
    }

    return (
        <TakingView
            lesson={lesson} gradient={gradient}
            questions={questions} onSubmit={handleSubmit}
        />
    );
}
