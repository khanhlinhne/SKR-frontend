import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDashed,
    Clock,
    Eye,
    Flag,
    HelpCircle,
    ListChecks,
    Loader2,
    PlayCircle,
    RotateCcw,
    Sparkles,
    Trophy,
    XCircle,
    Lightbulb,
    Target,
} from 'lucide-react';
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
    summarizeQuestionDifficulties,
} from './learnQuizUtils';

function getDifficultyClass(level) {
    return QUIZ_DIFFICULTY_STYLES[level] || 'bg-base-200 text-base-content/60';
}

function getScoreTone(percentage) {
    if (percentage >= 80) {
        return {
            chip: 'bg-emerald-500/10 text-emerald-700',
            text: 'text-emerald-600',
            surface: 'border-emerald-200 bg-emerald-50/80',
            stroke: 'stroke-emerald-500',
            label: 'Nắm bài rất tốt',
            gradient: 'from-emerald-500 to-green-400',
        };
    }
    if (percentage >= 50) {
        return {
            chip: 'bg-blue-500/10 text-blue-700',
            text: 'text-blue-600',
            surface: 'border-blue-200 bg-blue-50/80',
            stroke: 'stroke-blue-500',
            label: 'Đạt yêu cầu',
            gradient: 'from-blue-500 to-violet-500',
        };
    }
    return {
        chip: 'bg-rose-500/10 text-rose-700',
        text: 'text-rose-600',
        surface: 'border-rose-200 bg-rose-50/80',
        stroke: 'stroke-rose-500',
        label: 'Cần ôn lại',
        gradient: 'from-rose-500 to-orange-400',
    };
}

/* ─── Reusable Stat Card ─── */
function StatPill({ icon: Icon, label, value, bgClass, iconClass, valClass }) {
    return (
        <div className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-4 py-4 text-center ${bgClass}`}>
            <Icon className={`h-5 w-5 ${iconClass}`} />
            <p className={`text-xl font-black leading-none mt-1 ${valClass}`}>{value}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-55">{label}</p>
        </div>
    );
}

/* ─── Quiz Detail Screen ─── */
function QuizDetailScreen({ lesson, chapter, gradient, questions, onStart, isCompleted }) {
    const timeLimitMinutes = useMemo(() => getQuizTimeLimitMinutes(lesson), [lesson]);
    const difficultySummary = useMemo(() => summarizeQuestionDifficulties(questions), [questions]);
    const questionsWithExplanation = useMemo(
        () => questions.filter((q) => q.questionExplanation).length,
        [questions],
    );

    if (questions.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-12 text-center shadow-xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                    <HelpCircle className="h-8 w-8 text-amber-500" />
                </div>
                <p className="text-xl font-black text-base-content">Quiz này chưa có câu hỏi</p>
                <p className="mt-2 text-sm text-base-content/55">
                    Giảng viên cần thêm câu hỏi vào lesson quiz trước khi người học có thể bắt đầu làm bài.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl"
            >
                {/* Gradient hero banner */}
                <div className={`relative h-36 bg-gradient-to-br ${gradient} overflow-hidden`}>
                    {/* Decorative shapes */}
                    <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute top-5 left-8 h-14 w-14 rounded-2xl border-2 border-white/20 rotate-12" />
                    <div className="absolute top-8 right-28 h-8 w-8 rounded-full border-2 border-white/20" />
                    <div className="absolute bottom-5 right-10 h-10 w-10 rounded-xl border-2 border-white/15 -rotate-12" />
                    {/* Badge row */}
                    <div className="absolute bottom-4 left-6 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/90 backdrop-blur border border-white/20">
                            <HelpCircle className="h-3 w-3" />
                            Quiz Lesson
                        </span>
                        {isCompleted && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
                                <CheckCircle2 className="h-3 w-3" />
                                Đã hoàn thành
                            </span>
                        )}
                    </div>
                </div>

                {/* Card body overlapping banner */}
                <div className="grid gap-6 px-6 pb-6 pt-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
                    {/* Left: info */}
                    <div className="min-w-0">
                        <h2 className="text-2xl font-black text-base-content">
                            {lesson?.title || 'Bài kiểm tra'}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-base-content/50">
                            {chapter?.title || 'Quiz trong khóa học'}
                        </p>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-base-content/65 whitespace-pre-line">
                            {lesson?.description || 'Đọc kỹ hướng dẫn, sau đó bắt đầu làm bài để kiểm tra mức độ nắm bài của bạn. Sau khi nộp bài, hệ thống sẽ hiển thị kết quả trước rồi mới cho phép xem review chi tiết từng câu.'}
                        </p>

                        {/* Stat pills */}
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatPill
                                icon={ListChecks} label="Câu hỏi" value={questions.length}
                                bgClass="border-blue-100 bg-blue-50/60 text-blue-800"
                                iconClass="text-blue-500" valClass="text-blue-700"
                            />
                            <StatPill
                                icon={Clock} label="Thời gian" value={formatTimeLimitLabel(timeLimitMinutes)}
                                bgClass="border-violet-100 bg-violet-50/60 text-violet-800"
                                iconClass="text-violet-500" valClass="text-violet-700"
                            />
                            <StatPill
                                icon={Sparkles} label="Có giải thích" value={questionsWithExplanation}
                                bgClass="border-amber-100 bg-amber-50/60 text-amber-800"
                                iconClass="text-amber-500" valClass="text-amber-700"
                            />
                            <StatPill
                                icon={BarChart3} label="Trạng thái" value={isCompleted ? 'Đã làm' : 'Sẵn sàng'}
                                bgClass={isCompleted ? "border-emerald-100 bg-emerald-50/60 text-emerald-800" : "border-base-300 bg-base-200/35 text-base-content"}
                                iconClass={isCompleted ? "text-emerald-500" : "text-base-content/50"}
                                valClass={isCompleted ? "text-emerald-700" : "text-base-content"}
                            />
                        </div>

                        {/* Difficulty chips */}
                        {(difficultySummary.easy > 0 || difficultySummary.medium > 0 || difficultySummary.hard > 0) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {difficultySummary.easy > 0 && (
                                    <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                        🟢 Dễ: {difficultySummary.easy}
                                    </span>
                                )}
                                {difficultySummary.medium > 0 && (
                                    <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700">
                                        🟡 Trung bình: {difficultySummary.medium}
                                    </span>
                                )}
                                {difficultySummary.hard > 0 && (
                                    <span className="rounded-full bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-700">
                                        🔴 Khó: {difficultySummary.hard}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: CTA sidebar */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-200/25 p-5">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                            <PlayCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-base-content">Sẵn sàng làm bài</h3>
                            <p className="mt-1.5 text-sm leading-6 text-base-content/60">
                                Khi bắt đầu, bạn sẽ chuyển sang màn hình làm bài riêng. Sau khi nộp bài sẽ có trang kết quả và nút xem review chi tiết.
                            </p>
                        </div>

                        {/* Tips */}
                        <div className="rounded-xl border border-base-200 bg-base-100 p-4">
                            <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-base-content/40">
                                <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                                Lưu ý
                            </p>
                            <ul className="mt-3 space-y-2">
                                {[
                                    'Bạn có thể đánh dấu câu khó để quay lại trước khi nộp.',
                                    'Đồng hồ sẽ tự đếm ngược nếu quiz có giới hạn thời gian.',
                                    'Review sẽ hiển thị đáp án đúng/sai và lời giải thích nếu có.',
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-base-content/60">
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onStart}
                            className={`btn w-full rounded-2xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg gap-2`}
                        >
                            Bắt đầu làm bài
                            <ArrowRight className="h-4 w-4" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Quiz Taking Screen ─── */
function QuizTakingScreen({ lesson, chapter, gradient, questions, onBackToDetail, onSubmit }) {
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

    const handleSelectOption = useCallback((questionId, optionId) => {
        setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
    }, []);

    const handleTextAnswer = useCallback((questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }, []);

    const handleToggleFlag = useCallback((questionIndex) => {
        setFlaggedQuestions((prev) => (
            prev.includes(questionIndex)
                ? prev.filter((i) => i !== questionIndex)
                : [...prev, questionIndex]
        ));
    }, []);

    const handleSubmit = useCallback((submitReason = 'manual') => {
        const timeSpentSeconds = initialTimeLeft !== null && timeLeft !== null
            ? Math.max(initialTimeLeft - timeLeft, 0)
            : null;
        const result = evaluateQuizAttempt({ questions, answers, timeSpentSeconds, timeLeft, submitReason });
        onSubmit?.(result);
    }, [answers, initialTimeLeft, onSubmit, questions, timeLeft]);

    useEffect(() => {
        if (!hasTimeLimit || timeLeft === null) return undefined;
        if (timeLeft <= 0) { handleSubmit('timeout'); return undefined; }
        const id = window.setTimeout(() => setTimeLeft((p) => (p === null ? null : Math.max(p - 1, 0))), 1000);
        return () => window.clearTimeout(id);
    }, [handleSubmit, hasTimeLimit, timeLeft]);

    if (!currentQuestion) {
        return (
            <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-12 text-center shadow-xl">
                <HelpCircle className="mx-auto h-10 w-10 text-amber-500" />
                <p className="mt-4 text-xl font-black text-base-content">Không có câu hỏi để hiển thị</p>
            </div>
        );
    }

    const difficultyClass = getDifficultyClass(currentQuestion.difficultyLevel);

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
            {/* Main Card */}
            <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

                {/* Header */}
                <div className="border-b border-base-300 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={onBackToDetail}
                                    className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Chi tiết quiz
                                </button>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                                    <HelpCircle className="h-3 w-3" />
                                    Đang làm bài
                                </span>
                                {hasTimeLimit && (
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${isTimeLow ? 'bg-rose-500/10 text-rose-600 animate-pulse' : 'bg-base-200 text-base-content/60'}`}>
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatTimeLeft(timeLeft)}
                                    </span>
                                )}
                            </div>
                            <h2 className="mt-2 text-xl font-black text-base-content">{lesson?.title || 'Bài kiểm tra'}</h2>
                            <p className="mt-0.5 text-xs text-base-content/50">
                                {chapter?.title ? `Chương ${chapter.title}` : 'Trả lời từng câu rồi nộp bài để xem kết quả.'}
                            </p>
                        </div>

                        {/* Mini counters */}
                        <div className={`grid gap-2 ${hasTimeLimit ? 'grid-cols-2 sm:grid-cols-4 sm:min-w-[22rem]' : 'grid-cols-3 sm:min-w-[16rem]'}`}>
                            {[
                                { label: 'Câu hỏi', val: questions.length, cls: 'text-base-content' },
                                { label: 'Đã trả lời', val: answeredCount, cls: 'text-blue-600' },
                                { label: 'Đánh dấu', val: flaggedQuestions.length, cls: 'text-amber-600' },
                                ...(hasTimeLimit ? [{ label: 'Còn lại', val: formatTimeLeft(timeLeft), cls: isTimeLow ? 'text-rose-600' : 'text-base-content', extra: isTimeLow ? 'border-rose-200 bg-rose-50/80' : '' }] : []),
                            ].map((item) => (
                                <div key={item.label} className={`rounded-xl border border-base-300 bg-base-200/35 p-2.5 text-center ${item.extra || ''}`}>
                                    <p className={`text-base font-black ${item.cls}`}>{item.val}</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-base-content/40">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-base-200">
                        <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.35 }}
                        />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] font-bold text-base-content/35">
                        <span>{answeredCount}/{questions.length} câu đã trả lời</span>
                        <span>{progress}%</span>
                    </div>
                </div>

                {/* Question body */}
                <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
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
                            className={`btn btn-sm rounded-xl gap-1.5 ${flaggedQuestions.includes(currentIndex) ? 'border-none bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'border-base-300 bg-base-100 text-base-content/70'}`}
                        >
                            <Flag className="h-3.5 w-3.5" />
                            {flaggedQuestions.includes(currentIndex) ? 'Đã đánh dấu' : 'Đánh dấu'}
                        </motion.button>
                    </div>

                    {/* Question text */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.22 }}
                        >
                            <div className="mt-5 rounded-2xl border border-base-200 bg-base-200/25 p-5">
                                <p className="text-base font-black leading-8 text-base-content">
                                    {currentQuestion?.questionText}
                                </p>

                                {isTextQuestion(currentQuestion) ? (
                                    <textarea
                                        value={String(answers[currentQuestion.displayId] || '')}
                                        onChange={(e) => handleTextAnswer(currentQuestion.displayId, e.target.value)}
                                        placeholder="Nhập câu trả lời của bạn..."
                                        className="textarea textarea-bordered mt-5 min-h-[140px] w-full rounded-2xl border-base-300 bg-base-100 text-sm font-medium"
                                        rows={5}
                                    />
                                ) : (
                                    <div className="mt-5 space-y-3">
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
                                                    className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left transition-all ${isSelected
                                                        ? 'border-blue-500 bg-blue-500/8 shadow-md shadow-blue-500/15'
                                                        : 'border-base-300 bg-base-100 hover:border-blue-400/40 hover:bg-base-200/40'
                                                        }`}
                                                >
                                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors ${isSelected ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-base-200 text-base-content/50'}`}>
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
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex((p) => Math.max(p - 1, 0))}
                                    disabled={currentIndex === 0}
                                    className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Câu trước
                                </button>
                                {currentIndex < questions.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentIndex((p) => Math.min(p + 1, questions.length - 1))}
                                        className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5"
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
                                        className={`btn rounded-2xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg gap-1.5`}
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

            {/* Sidebar */}
            <div className="space-y-4">
                {/* Navigator grid */}
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
                    <h4 className="flex items-center gap-2 text-sm font-black text-base-content mb-1">
                        <Target className="h-4 w-4 text-blue-500" />
                        Điều hướng câu hỏi
                    </h4>
                    <p className="text-[11px] text-base-content/45 mb-3">Nhấn để chuyển sang câu bất kỳ</p>
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
                                    key={q.displayId}
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
                    {/* Legend */}
                    <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-base-content/45 font-bold">
                        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-base-200 inline-block" />Chưa trả lời</span>
                        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500/30 inline-block" />Đã trả lời</span>
                        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />Đánh dấu</span>
                    </div>
                </div>

                {/* Tips */}
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
                    <h4 className="flex items-center gap-1.5 text-sm font-black text-base-content mb-3">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Gợi ý làm bài
                    </h4>
                    <ul className="space-y-2">
                        {[
                            'Chọn từng số để nhảy nhanh tới câu cần xem lại.',
                            'Dùng nút đánh dấu nếu muốn quay lại câu khó.',
                            'Kết quả sẽ hiện sau khi nộp bài.',
                        ].map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-base-content/55">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

/* ─── Review Question Card ─── */
function ReviewQuestionCard({ item, questionIndex, showExplanation, onToggleExplanation }) {
    const difficultyClass = getDifficultyClass(item.difficultyLevel);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border bg-base-100 p-5 shadow-sm ${item.isCorrect ? 'border-emerald-200' : item.answered ? 'border-rose-200' : 'border-base-300'}`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="badge badge-ghost badge-sm font-black">Câu {questionIndex + 1}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] ${difficultyClass}`}>
                            {formatDifficultyLabel(item.difficultyLevel)}
                        </span>
                        {item.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/8 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="h-3.5 w-3.5" />Đúng
                            </span>
                        ) : item.answered ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-500/8 px-2 py-0.5 rounded-full">
                                <XCircle className="h-3.5 w-3.5" />Sai
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-base-content/45 bg-base-200 px-2 py-0.5 rounded-full">
                                <CircleDashed className="h-3.5 w-3.5" />Bỏ qua
                            </span>
                        )}
                    </div>
                    <p className="mt-2.5 text-sm font-bold leading-6 text-base-content">{item.questionText}</p>
                </div>
            </div>

            {isTextQuestion(item) ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-base-300 bg-base-200/35 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.13em] text-base-content/40">Câu trả lời của bạn</p>
                        <p className="mt-1.5 text-sm font-medium text-base-content/80">
                            {item.userAnswerText || 'Bạn chưa trả lời câu này'}
                        </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.13em] text-emerald-700/70">Đáp án đúng</p>
                        <p className="mt-1.5 text-sm font-bold text-emerald-700">{item.correctTexts.join(', ') || 'Không có'}</p>
                    </div>
                </div>
            ) : (
                <div className="mt-3 grid gap-2">
                    {item.options.map((option, optIdx) => {
                        const isCorrect = item.correctOptionIds.includes(option.optionId);
                        const isSelected = item.selectedOptionIds.includes(option.optionId);
                        const cls = isCorrect
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : isSelected
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : 'border-base-300 bg-base-100 text-base-content/65';
                        return (
                            <div key={option.optionId || `r-${optIdx}`} className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${cls}`}>
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-xs font-black shadow-sm">
                                    {String.fromCharCode(65 + optIdx)}
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
                        onClick={onToggleExplanation}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
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
}

/* ─── Quiz Results Screen ─── */
function QuizResultsScreen({ lesson, chapter, gradient, nextLesson, result, onRetry, onShowReview, onNext, isCompleted }) {
    const scoreTone = getScoreTone(result?.percentage || 0);
    const timeLimitMinutes = useMemo(() => getQuizTimeLimitMinutes(lesson), [lesson]);
    const pct = result?.percentage ?? 0;
    const passed = pct >= 70;
    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (circumference * pct) / 100;

    return (
        <div className="space-y-5">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl"
            >
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                <div className="p-6 sm:p-8">
                    {/* Top: title + score */}
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                                <Trophy className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-base-content/40">Kết quả quiz lesson</p>
                                <h2 className="mt-1 text-2xl font-black text-base-content">{lesson?.title || 'Bài kiểm tra'}</h2>
                                <p className="mt-0.5 text-sm text-base-content/50">
                                    {chapter?.title ? `Chương ${chapter.title}` : 'Hoàn thành bài quiz và xem kết quả tổng quan.'}
                                </p>
                                <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${scoreTone.chip}`}>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {scoreTone.label}
                                </div>
                            </div>
                        </div>

                        {/* Score donut */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative w-32 h-32">
                                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="10" className="stroke-base-300" />
                                    <motion.circle
                                        cx="60" cy="60" r="54"
                                        fill="none" strokeWidth="10" strokeLinecap="round"
                                        className={scoreTone.stroke}
                                        style={{ strokeDasharray: circumference }}
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset: dashOffset }}
                                        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className={`text-2xl font-black leading-none ${scoreTone.text}`}
                                    >
                                        {pct}%
                                    </motion.span>
                                    <span className="text-[10px] font-black uppercase text-base-content/35 mt-0.5">Điểm số</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pass / Fail banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-4 ${
                            passed
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-rose-200 bg-rose-50'
                        }`}
                    >
                        {passed ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        ) : (
                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                        )}
                        <div>
                            <p className={`text-sm font-black ${passed ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {passed
                                    ? (isCompleted ? 'Bài học đã được ghi nhận hoàn thành! 🎉' : 'Chúc mừng! Bài học đã được đánh dấu hoàn thành 🎉')
                                    : 'Chưa đạt — bài học chưa được tính hoàn thành'}
                            </p>
                            <p className={`mt-0.5 text-xs ${passed ? 'text-emerald-700/70' : 'text-rose-700/70'}`}>
                                {passed
                                    ? `Bạn đạt ${pct}% (ngưỡng yêu cầu ≥ 70%). Tiến độ học tập đã được cập nhật.`
                                    : `Bạn đạt ${pct}% (cần ≥ 70% để hoàn thành bài học). Hãy làm lại để đạt ngưỡng.`}
                            </p>
                        </div>
                    </motion.div>

                    {/* Stat grid */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <StatPill icon={CheckCircle2} label="Đúng" value={result.correctCount}
                            bgClass="border-emerald-100 bg-emerald-50/60 text-emerald-800"
                            iconClass="text-emerald-500" valClass="text-emerald-700" />
                        <StatPill icon={XCircle} label="Sai" value={result.incorrectCount}
                            bgClass="border-rose-100 bg-rose-50/60 text-rose-800"
                            iconClass="text-rose-500" valClass="text-rose-700" />
                        <StatPill icon={CircleDashed} label="Bỏ qua" value={result.skippedCount}
                            bgClass="border-amber-100 bg-amber-50/60 text-amber-800"
                            iconClass="text-amber-500" valClass="text-amber-700" />
                        <StatPill
                            icon={Clock} label="Thời gian"
                            value={result.timeSpentSeconds != null ? formatTimeLeft(result.timeSpentSeconds) : formatTimeLimitLabel(timeLimitMinutes)}
                            bgClass="border-blue-100 bg-blue-50/60 text-blue-800"
                            iconClass="text-blue-500" valClass="text-blue-700"
                        />
                    </div>

                    {result.submitReason === 'timeout' && (
                        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                            <p className="font-black">Bài đã được tự nộp do hết giờ.</p>
                            <p className="mt-1">Đồng hồ về 00:00 nên hệ thống chấm với các câu bạn đã trả lời trước đó.</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <motion.button
                            type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={onShowReview}
                            className={`btn rounded-2xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg gap-1.5`}
                        >
                            <Eye className="h-4 w-4" />
                            Xem review
                        </motion.button>
                        <button type="button" onClick={onRetry}
                            className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                            <RotateCcw className="h-4 w-4" />
                            Làm lại
                        </button>
                        {nextLesson ? (
                            <button type="button" onClick={onNext}
                                className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                                Bài tiếp theo
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Bạn đã hoàn thành quiz lesson này.
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Quiz Review Screen ─── */
function QuizReviewScreen({ lesson, gradient, nextLesson, result, onBackToResults, onRetry, onNext }) {
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
        <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">
                                <BookOpen className="h-3.5 w-3.5" />
                                Review chi tiết
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-base-200 px-3 py-1 text-[11px] font-black uppercase tracking-[0.13em] text-base-content/55">
                                {lesson?.title || 'Quiz lesson'}
                            </span>
                        </div>
                        <h2 className="mt-3 text-xl font-black text-base-content">Xem lại bài làm</h2>
                        <p className="mt-1 text-sm text-base-content/50">Xem chi tiết từng câu hỏi, đáp án đúng và lời giải thích nếu có.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={onBackToResults}
                            className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                            <ArrowLeft className="h-4 w-4" />Kết quả
                        </button>
                        <button type="button" onClick={onRetry}
                            className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                            <RotateCcw className="h-4 w-4" />Làm lại
                        </button>
                        {nextLesson && (
                            <button type="button" onClick={onNext}
                                className={`btn rounded-2xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg gap-1.5`}>
                                Bài tiếp theo<ArrowRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter + toggle */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'all', label: 'Tất cả', count: result.totalQuestions },
                        { id: 'correct', label: 'Đúng', count: result.correctCount },
                        { id: 'incorrect', label: 'Sai', count: result.incorrectCount },
                        { id: 'skipped', label: 'Bỏ qua', count: result.skippedCount },
                    ].map((tab) => (
                        <button
                            key={tab.id} type="button"
                            onClick={() => setFilterMode(tab.id)}
                            className={`btn btn-sm rounded-xl gap-2 font-bold ${filterMode === tab.id ? 'btn-primary' : 'border-base-300 bg-base-100 text-base-content'}`}
                        >
                            {tab.label}
                            <span className="badge badge-xs">{tab.count}</span>
                        </button>
                    ))}
                </div>
                <button type="button" onClick={toggleAllExplanations}
                    className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content gap-1.5">
                    {Object.keys(expandedExplanations).length > 0
                        ? <><ChevronUp className="h-4 w-4" />Ẩn tất cả giải thích</>
                        : <><ChevronDown className="h-4 w-4" />Mở tất cả giải thích</>}
                </button>
            </div>

            {filteredQuestions.length > 0 ? (
                <div className="space-y-3">
                    {filteredQuestions.map(({ item, index }) => (
                        <ReviewQuestionCard
                            key={item.displayId}
                            item={item}
                            questionIndex={index}
                            showExplanation={expandedExplanations[index]}
                            onToggleExplanation={() => toggleExplanation(index)}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-base-300 bg-base-100 p-12 text-center shadow-xl">
                    <CircleDashed className="mx-auto h-10 w-10 text-base-content/25" />
                    <p className="mt-4 text-lg font-black text-base-content">Không có câu hỏi trong bộ lọc này</p>
                </div>
            )}
        </div>
    );
}

/* ─── Main Export ─── */
export default function LearnQuizFlow({
    lesson, chapter, nextLesson,
    gradient = 'from-blue-500 to-violet-500',
    loadingContent = false,
    mode = 'detail',
    result = null,
    attemptSeed = 0,
    onStart, onSubmit, onRetry, onShowReview, onBackToResults, onBackToDetail, onNext,
    isCompleted = false,
}) {
    const questions = useMemo(() => normalizeQuestions(lesson), [lesson]);

    if (loadingContent) {
        return (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-10 shadow-xl">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
            </div>
        );
    }

    if (mode === 'taking') {
        return (
            <QuizTakingScreen
                key={attemptSeed}
                lesson={lesson} chapter={chapter} gradient={gradient}
                questions={questions} onBackToDetail={onBackToDetail} onSubmit={onSubmit}
            />
        );
    }

    if (mode === 'review' && result) {
        return (
            <QuizReviewScreen
                lesson={lesson} gradient={gradient} nextLesson={nextLesson}
                result={result} onBackToResults={onBackToResults} onRetry={onRetry} onNext={onNext}
            />
        );
    }

    if (mode === 'results' && result) {
        return (
        <QuizResultsScreen
                lesson={lesson} chapter={chapter} gradient={gradient} nextLesson={nextLesson}
                result={result} onRetry={onRetry} onShowReview={onShowReview} onNext={onNext}
                isCompleted={isCompleted}
            />
        );
    }

    return (
        <QuizDetailScreen
            lesson={lesson} chapter={chapter} gradient={gradient}
            questions={questions} onStart={onStart} isCompleted={isCompleted}
        />
    );
}
