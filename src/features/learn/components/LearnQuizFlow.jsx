import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
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
            label: 'Nắm bài rất tốt',
        };
    }

    if (percentage >= 50) {
        return {
            chip: 'bg-blue-500/10 text-blue-700',
            text: 'text-blue-600',
            surface: 'border-blue-200 bg-blue-50/80',
            label: 'Đạt yêu cầu',
        };
    }

    return {
        chip: 'bg-rose-500/10 text-rose-700',
        text: 'text-rose-600',
        surface: 'border-rose-200 bg-rose-50/80',
        label: 'Cần ôn lại',
    };
}

function QuizStatCard({ icon: Icon, label, value, tone = 'default' }) {
    const toneClass = tone === 'success'
        ? 'border-emerald-100 bg-emerald-50/80 text-emerald-700'
        : tone === 'danger'
            ? 'border-rose-100 bg-rose-50/80 text-rose-700'
            : tone === 'info'
                ? 'border-blue-100 bg-blue-50/80 text-blue-700'
                : tone === 'warning'
                    ? 'border-amber-100 bg-amber-50/80 text-amber-700'
                    : 'border-base-300 bg-base-200/35 text-base-content';

    return (
        <div className={`rounded-2xl border p-4 ${toneClass}`}>
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">{label}</p>
            </div>
            <p className="mt-3 text-2xl font-black">{value}</p>
        </div>
    );
}

function QuizDetailScreen({
    lesson,
    chapter,
    gradient,
    questions,
    onStart,
    isCompleted,
}) {
    const timeLimitMinutes = useMemo(() => getQuizTimeLimitMinutes(lesson), [lesson]);
    const difficultySummary = useMemo(() => summarizeQuestionDifficulties(questions), [questions]);
    const questionsWithExplanation = useMemo(
        () => questions.filter((question) => question.questionExplanation).length,
        [questions],
    );

    if (questions.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center shadow-xl">
                <HelpCircle className="mx-auto h-10 w-10 text-amber-500" />
                <p className="mt-4 text-xl font-black text-base-content">Quiz này chưa có câu hỏi</p>
                <p className="mt-2 text-sm text-base-content/55">
                    Giảng viên cần thêm câu hỏi vào lesson quiz trước khi người học có thể bắt đầu làm bài.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">
                                <HelpCircle className="h-3.5 w-3.5" />
                                Quiz lesson
                            </span>
                            {isCompleted && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Đã hoàn thành
                                </span>
                            )}
                        </div>

                        <h2 className="mt-4 text-3xl font-black text-base-content">
                            {lesson?.title || 'Bài kiểm tra'}
                        </h2>
                        <p className="mt-2 text-sm font-medium text-base-content/55">
                            {chapter?.title || 'Bài quiz trong khóa học'}
                        </p>

                        <p className="mt-5 max-w-3xl text-sm leading-7 text-base-content/70 whitespace-pre-line">
                            {lesson?.description || 'Đọc kỹ hướng dẫn, sau đó bắt đầu làm bài để kiểm tra mức độ nắm bài của bạn. Sau khi nộp bài, hệ thống sẽ hiển thị kết quả trước rồi mới cho phép xem review chi tiết từng câu.'}
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <QuizStatCard icon={ListChecks} label="Câu hỏi" value={questions.length} tone="default" />
                            <QuizStatCard icon={Clock} label="Thời gian" value={formatTimeLimitLabel(timeLimitMinutes)} tone="info" />
                            <QuizStatCard icon={Sparkles} label="Có giải thích" value={questionsWithExplanation} tone="warning" />
                            <QuizStatCard icon={BarChart3} label="Trạng thái" value={isCompleted ? 'Đã làm' : 'Sẵn sàng'} tone={isCompleted ? 'success' : 'default'} />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {difficultySummary.easy > 0 && (
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                    Dễ: {difficultySummary.easy}
                                </span>
                            )}
                            {difficultySummary.medium > 0 && (
                                <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700">
                                    Trung bình: {difficultySummary.medium}
                                </span>
                            )}
                            {difficultySummary.hard > 0 && (
                                <span className="rounded-full bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-700">
                                    Khó: {difficultySummary.hard}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-3xl border border-base-300 bg-base-200/30 p-5">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                            <PlayCircle className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-base-content">Sẵn sàng làm bài</h3>
                            <p className="mt-2 text-sm leading-6 text-base-content/60">
                                Khi bắt đầu, bạn sẽ chuyển sang màn hình làm bài riêng. Sau khi nộp bài sẽ có trang kết quả và nút xem review chi tiết.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-base-content/40">Lưu ý</p>
                            <div className="mt-3 space-y-2 text-sm text-base-content/65">
                                <p>Bạn có thể đánh dấu câu khó để quay lại trước khi nộp.</p>
                                <p>Đồng hồ sẽ tự đếm ngược nếu quiz có giới hạn thời gian.</p>
                                <p>Review sẽ hiển thị đáp án đúng/sai và lời giải thích nếu giảng viên đã nhập.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onStart}
                            className={`btn w-full rounded-2xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg`}
                        >
                            Bắt đầu làm bài
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuizTakingScreen({
    lesson,
    chapter,
    gradient,
    questions,
    onBackToDetail,
    onSubmit,
}) {
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
        setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
    }, []);

    const handleTextAnswer = useCallback((questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }, []);

    const handleToggleFlag = useCallback((questionIndex) => {
        setFlaggedQuestions((prev) => (
            prev.includes(questionIndex)
                ? prev.filter((index) => index !== questionIndex)
                : [...prev, questionIndex]
        ));
    }, []);

    const handleSubmit = useCallback((submitReason = 'manual') => {
        const timeSpentSeconds = initialTimeLeft !== null && timeLeft !== null
            ? Math.max(initialTimeLeft - timeLeft, 0)
            : null;

        const result = evaluateQuizAttempt({
            questions,
            answers,
            timeSpentSeconds,
            timeLeft,
            submitReason,
        });

        onSubmit?.(result);
    }, [answers, initialTimeLeft, onSubmit, questions, timeLeft]);

    useEffect(() => {
        if (!hasTimeLimit || timeLeft === null) {
            return undefined;
        }

        if (timeLeft <= 0) {
            handleSubmit('timeout');
            return undefined;
        }

        const timerId = window.setTimeout(() => {
            setTimeLeft((prev) => (prev === null ? null : Math.max(prev - 1, 0)));
        }, 1000);

        return () => window.clearTimeout(timerId);
    }, [handleSubmit, hasTimeLimit, timeLeft]);

    if (!currentQuestion) {
        return (
            <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center shadow-xl">
                <HelpCircle className="mx-auto h-10 w-10 text-amber-500" />
                <p className="mt-4 text-xl font-black text-base-content">Không có câu hỏi để hiển thị</p>
            </div>
        );
    }

    const difficultyClass = getDifficultyClass(currentQuestion.difficultyLevel);

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                <div className="border-b border-base-300 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={onBackToDetail}
                                    className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Chi tiết quiz
                                </button>
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                                    <HelpCircle className="h-3.5 w-3.5" />
                                    Quiz đang làm
                                </span>
                                {hasTimeLimit && (
                                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${isTimeLow ? 'bg-rose-500/10 text-rose-600' : 'bg-base-200 text-base-content/60'}`}>
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatTimeLeft(timeLeft)}
                                    </span>
                                )}
                            </div>
                            <h2 className="mt-2 text-2xl font-black text-base-content">{lesson?.title || 'Bài kiểm tra'}</h2>
                            <p className="mt-1 text-sm text-base-content/55">
                                {chapter?.title ? `Chương ${chapter.title}` : 'Trả lời từng câu hỏi rồi nộp bài để xem kết quả.'}
                            </p>
                        </div>
                        <div className={`grid gap-2 ${hasTimeLimit ? 'grid-cols-2 sm:min-w-[24rem] sm:grid-cols-4' : 'grid-cols-3 sm:min-w-[18rem]'}`}>
                            <div className="rounded-2xl border border-base-300 bg-base-200/35 p-3 text-center">
                                <p className="text-lg font-black text-base-content">{questions.length}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Câu hỏi</p>
                            </div>
                            <div className="rounded-2xl border border-base-300 bg-base-200/35 p-3 text-center">
                                <p className="text-lg font-black text-blue-600">{answeredCount}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Đã trả lời</p>
                            </div>
                            <div className="rounded-2xl border border-base-300 bg-base-200/35 p-3 text-center">
                                <p className="text-lg font-black text-amber-600">{flaggedQuestions.length}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Đánh dấu</p>
                            </div>
                            {hasTimeLimit && (
                                <div className={`rounded-2xl border p-3 text-center ${isTimeLow ? 'border-rose-200 bg-rose-50/80' : 'border-base-300 bg-base-200/35'}`}>
                                    <p className={`text-lg font-black ${isTimeLow ? 'text-rose-600' : 'text-base-content'}`}>{formatTimeLeft(timeLeft)}</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Còn lại</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-base-200">
                        <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="badge badge-ghost badge-lg font-black">{`Câu ${currentIndex + 1}/${questions.length}`}</span>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${difficultyClass}`}>
                                {formatDifficultyLabel(currentQuestion?.difficultyLevel)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleToggleFlag(currentIndex)}
                            className={`btn btn-sm rounded-xl ${flaggedQuestions.includes(currentIndex) ? 'border-none bg-amber-500 text-white' : 'border-base-300 bg-base-100 text-base-content/70'}`}
                        >
                            <Flag className="h-4 w-4" />
                            {flaggedQuestions.includes(currentIndex) ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}
                        </button>
                    </div>

                    <div className="mt-5 rounded-3xl border border-base-300 bg-base-200/20 p-5">
                        <p className="text-lg font-black leading-8 text-base-content">{currentQuestion?.questionText}</p>

                        {isTextQuestion(currentQuestion) ? (
                            <textarea
                                value={String(answers[currentQuestion.displayId] || '')}
                                onChange={(event) => handleTextAnswer(currentQuestion.displayId, event.target.value)}
                                placeholder="Nhập câu trả lời của bạn..."
                                className="textarea textarea-bordered mt-5 min-h-[140px] w-full rounded-2xl border-base-300 bg-base-100 text-sm font-medium"
                                rows={5}
                            />
                        ) : (
                            <div className="mt-5 space-y-3">
                                {currentQuestion?.options.map((option, optionIndex) => {
                                    const isSelected = Array.isArray(answers[currentQuestion.displayId]) && answers[currentQuestion.displayId].includes(option.optionId);
                                    return (
                                        <button
                                            key={option.optionId || `${currentQuestion.displayId}-option-${optionIndex}`}
                                            type="button"
                                            onClick={() => handleSelectOption(currentQuestion.displayId, option.optionId)}
                                            className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left transition-all ${isSelected ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' : 'border-base-300 bg-base-100 hover:border-blue-500/30 hover:bg-base-200/50'}`}
                                        >
                                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${isSelected ? 'bg-blue-500 text-white' : 'bg-base-200 text-base-content/50'}`}>
                                                {String.fromCharCode(65 + optionIndex)}
                                            </span>
                                            <span className={`flex-1 text-sm font-medium ${isSelected ? 'font-bold text-blue-600' : 'text-base-content'}`}>
                                                {option.optionText}
                                            </span>
                                            {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                            disabled={currentIndex === 0}
                            className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Câu trước
                        </button>
                        <div className="flex flex-wrap items-center gap-2">
                            {currentIndex < questions.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                                    className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content"
                                >
                                    Câu tiếp
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleSubmit('manual')}
                                    className={`btn rounded-2xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg`}
                                >
                                    Nộp bài
                                    <CheckCircle2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
                    <h4 className="flex items-center gap-2 text-sm font-black text-base-content">
                        <HelpCircle className="h-4 w-4 text-blue-500" />
                        Điều hướng câu hỏi
                    </h4>
                    <div className="mt-4 grid grid-cols-5 gap-2">
                        {questions.map((question, index) => {
                            const answered = isQuestionAnswered(question, answers[question.displayId]);
                            const active = index === currentIndex;
                            const flagged = flaggedQuestions.includes(index);
                            const buttonClass = active
                                ? `bg-gradient-to-br ${gradient} text-white shadow-lg`
                                : answered
                                    ? 'border border-emerald-200 bg-emerald-500/15 text-emerald-700'
                                    : 'bg-base-200 text-base-content/55';

                            return (
                                <button
                                    key={question.displayId}
                                    type="button"
                                    onClick={() => setCurrentIndex(index)}
                                    className={`relative flex aspect-square items-center justify-center rounded-xl text-xs font-black transition-all ${buttonClass}`}
                                >
                                    {index + 1}
                                    {flagged && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
                    <h4 className="text-sm font-black text-base-content">Gợi ý làm bài</h4>
                    <div className="mt-3 space-y-2 text-xs text-base-content/55">
                        <p>Chọn từng câu trong bảng bên phải để nhảy nhanh tới vị trí cần xem lại.</p>
                        <p>Dùng nút đánh dấu nếu bạn muốn quay lại một câu khó trước khi nộp bài.</p>
                        <p>Kết quả sẽ hiện thành trang riêng trước, sau đó bạn có thể bấm xem review chi tiết.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReviewQuestionCard({
    item,
    questionIndex,
    showExplanation,
    onToggleExplanation,
}) {
    const difficultyClass = getDifficultyClass(item.difficultyLevel);

    return (
        <div className={`rounded-2xl border bg-base-100 p-4 shadow-sm ${item.isCorrect ? 'border-emerald-200' : item.answered ? 'border-rose-200' : 'border-base-300'}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="badge badge-ghost badge-sm">{`Câu ${questionIndex + 1}`}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${difficultyClass}`}>
                            {formatDifficultyLabel(item.difficultyLevel)}
                        </span>
                        {item.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Đúng
                            </span>
                        ) : item.answered ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                                <XCircle className="h-3.5 w-3.5" />
                                Sai
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-base-content/45">
                                <CircleDashed className="h-3.5 w-3.5" />
                                Bỏ qua
                            </span>
                        )}
                    </div>
                    <p className="mt-2 text-sm font-bold leading-6 text-base-content">{item.questionText}</p>
                </div>
            </div>

            {isTextQuestion(item) ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-base-300 bg-base-200/35 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-base-content/40">Câu trả lời của bạn</p>
                        <p className="mt-1 text-sm font-medium text-base-content/80">
                            {item.userAnswerText || 'Bạn chưa trả lời câu này'}
                        </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700/70">Đáp án đúng</p>
                        <p className="mt-1 text-sm font-bold text-emerald-700">
                            {item.correctTexts.join(', ') || 'Không có'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="mt-3 grid gap-2">
                    {item.options.map((option, optionIndex) => {
                        const isCorrectOption = item.correctOptionIds.includes(option.optionId);
                        const isSelected = item.selectedOptionIds.includes(option.optionId);
                        const optionStateClass = isCorrectOption
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : isSelected
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : 'border-base-300 bg-base-100 text-base-content/65';

                        return (
                            <div
                                key={option.optionId || `${item.displayId}-option-${optionIndex}`}
                                className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${optionStateClass}`}
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-xs font-black">
                                    {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{option.optionText}</p>
                                    {isSelected && !isCorrectOption && option.optionExplanation && (
                                        <p className="mt-1 text-xs opacity-80">{option.optionExplanation}</p>
                                    )}
                                </div>
                                {isCorrectOption && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                                {!isCorrectOption && isSelected && <XCircle className="h-4 w-4 shrink-0" />}
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
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-600"
                    >
                        {showExplanation ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {showExplanation ? 'Ẩn giải thích' : 'Xem giải thích'}
                    </button>

                    {showExplanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-3 text-sm text-blue-700"
                        >
                            <span className="font-bold">Giải thích:</span> {item.questionExplanation}
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}

function QuizResultsScreen({
    lesson,
    chapter,
    gradient,
    nextLesson,
    result,
    onRetry,
    onShowReview,
    onNext,
}) {
    const scoreTone = getScoreTone(result?.percentage || 0);
    const timeLimitMinutes = useMemo(() => getQuizTimeLimitMinutes(lesson), [lesson]);

    return (
        <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                                <Trophy className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-base-content/40">Kết quả quiz lesson</p>
                                <h2 className="mt-2 text-2xl font-black text-base-content">{lesson?.title || 'Bài kiểm tra'}</h2>
                                <p className="mt-1 text-sm text-base-content/55">
                                    {chapter?.title ? `Chương ${chapter.title}` : 'Hoàn thành bài quiz và xem kết quả tổng quan.'}
                                </p>
                                <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${scoreTone.chip}`}>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {scoreTone.label}
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-3xl border px-6 py-5 text-center ${scoreTone.surface}`}>
                            <p className={`text-4xl font-black ${scoreTone.text}`}>{result?.percentage ?? 0}%</p>
                            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] opacity-70">Điểm số</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <QuizStatCard icon={CheckCircle2} label="Đúng" value={result.correctCount} tone="success" />
                        <QuizStatCard icon={XCircle} label="Sai" value={result.incorrectCount} tone="danger" />
                        <QuizStatCard icon={CircleDashed} label="Bỏ qua" value={result.skippedCount} tone="warning" />
                        <QuizStatCard
                            icon={Clock}
                            label="Thời gian"
                            value={result.timeSpentSeconds != null ? formatTimeLeft(result.timeSpentSeconds) : formatTimeLimitLabel(timeLimitMinutes)}
                            tone="info"
                        />
                    </div>

                    {result.submitReason === 'timeout' && (
                        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                            <p className="font-black">Bài đã được tự nộp do hết giờ.</p>
                            <p className="mt-1">
                                Đồng hồ về 00:00 nên hệ thống chấm với các câu bạn đã trả lời trước đó.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={onShowReview}
                            className={`btn rounded-2xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg`}
                        >
                            <Eye className="h-4 w-4" />
                            Xem review
                        </button>
                        <button
                            type="button"
                            onClick={onRetry}
                            className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Làm lại
                        </button>
                        {nextLesson ? (
                            <button
                                type="button"
                                onClick={onNext}
                                className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content"
                            >
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
            </div>
        </div>
    );
}

function QuizReviewScreen({
    lesson,
    gradient,
    nextLesson,
    result,
    onBackToResults,
    onRetry,
    onNext,
}) {
    const [filterMode, setFilterMode] = useState('all');
    const [expandedExplanations, setExpandedExplanations] = useState({});
    const reviewItems = result?.reviewItems || [];

    const filteredQuestions = useMemo(
        () => reviewItems
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
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
        if (Object.keys(expandedExplanations).length > 0) {
            setExpandedExplanations({});
            return;
        }

        const allExpanded = {};
        reviewItems.forEach((_, index) => {
            allExpanded[index] = true;
        });
        setExpandedExplanations(allExpanded);
    }, [expandedExplanations, reviewItems]);

    return (
        <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">
                                <BookOpen className="h-3.5 w-3.5" />
                                Review chi tiết
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-base-content/60">
                                {lesson?.title || 'Quiz lesson'}
                            </span>
                        </div>
                        <h2 className="mt-3 text-2xl font-black text-base-content">Xem lại bài làm</h2>
                        <p className="mt-1 text-sm text-base-content/55">
                            Xem chi tiết từng câu hỏi, đáp án đúng và lời giải thích nếu có.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={onBackToResults}
                            className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kết quả
                        </button>
                        <button
                            type="button"
                            onClick={onRetry}
                            className="btn rounded-2xl border-base-300 bg-base-100 font-bold text-base-content"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Làm lại
                        </button>
                        {nextLesson && (
                            <button
                                type="button"
                                onClick={onNext}
                                className={`btn rounded-2xl border-none bg-gradient-to-r ${gradient} font-bold text-white shadow-lg`}
                            >
                                Bài tiếp theo
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                    className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content"
                >
                    {Object.keys(expandedExplanations).length > 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {Object.keys(expandedExplanations).length > 0 ? 'Ẩn tất cả giải thích' : 'Mở tất cả giải thích'}
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
                <div className="rounded-3xl border border-base-300 bg-base-100 p-10 text-center shadow-xl">
                    <CircleDashed className="mx-auto h-10 w-10 text-base-content/25" />
                    <p className="mt-4 text-lg font-black text-base-content">Không có câu hỏi trong bộ lọc này</p>
                </div>
            )}
        </div>
    );
}

export default function LearnQuizFlow({
    lesson,
    chapter,
    nextLesson,
    gradient = 'from-blue-500 to-violet-500',
    loadingContent = false,
    mode = 'detail',
    result = null,
    attemptSeed = 0,
    onStart,
    onSubmit,
    onRetry,
    onShowReview,
    onBackToResults,
    onBackToDetail,
    onNext,
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
                lesson={lesson}
                chapter={chapter}
                gradient={gradient}
                questions={questions}
                onBackToDetail={onBackToDetail}
                onSubmit={onSubmit}
            />
        );
    }

    if (mode === 'review' && result) {
        return (
            <QuizReviewScreen
                lesson={lesson}
                gradient={gradient}
                nextLesson={nextLesson}
                result={result}
                onBackToResults={onBackToResults}
                onRetry={onRetry}
                onNext={onNext}
            />
        );
    }

    if (mode === 'results' && result) {
        return (
            <QuizResultsScreen
                lesson={lesson}
                chapter={chapter}
                gradient={gradient}
                nextLesson={nextLesson}
                result={result}
                onRetry={onRetry}
                onShowReview={onShowReview}
                onNext={onNext}
            />
        );
    }

    return (
        <QuizDetailScreen
            lesson={lesson}
            chapter={chapter}
            gradient={gradient}
            questions={questions}
            onStart={onStart}
            isCompleted={isCompleted}
        />
    );
}
