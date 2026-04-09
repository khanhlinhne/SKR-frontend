import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';
import { OwlLoader } from '@/shared/ui/common';
import { formatTime, DIFFICULTY_CONFIG } from './utils';
import { useQuizTaking } from '@/features/tests/hooks/useQuiz';

/**
 * QuizHeader - Header bar during quiz with timer, progress, and controls
 */
function QuizHeader({ test, currentIndex, totalQuestions, timeLeft, onSubmit, flaggedCount }) {
    const progress = ((currentIndex + 1) / totalQuestions) * 100;
    const isTimeLow = timeLeft <= 60;

    return (
        <div className="bg-base-100 border-b border-base-300 px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Test Title */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
                        <Icon name="FileText" size="sm" className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm text-base-content line-clamp-1">{test.quizTitle}</h3>
                        <p className="text-xs text-base-content/50">
                            Câu {currentIndex + 1}/{totalQuestions}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="hidden md:flex flex-1 mx-8 items-center gap-3">
                    <div className="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <span className="text-xs font-bold text-base-content/60 whitespace-nowrap">
                        {Math.round(progress)}%
                    </span>
                </div>

                {/* Timer + Actions */}
                <div className="flex items-center gap-3">
                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-black ${isTimeLow
                        ? 'bg-red-500/10 text-red-500 animate-pulse'
                        : 'bg-base-200 text-base-content'
                        }`}>
                        <Icon name="Clock" size="sm" />
                        {formatTime(timeLeft)}
                    </div>

                    {/* Flagged */}
                    {flaggedCount > 0 && (
                        <div className="flex items-center gap-1 px-3 py-2 bg-orange-500/10 rounded-xl">
                            <Icon name="Flag" size="sm" className="text-orange-500" />
                            <span className="text-xs font-bold text-orange-500">{flaggedCount}</span>
                        </div>
                    )}

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSubmit}
                        className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold shadow-lg shadow-blue-600/20 gap-1"
                    >
                        <Icon name="Send" size="sm" />
                        Nộp bài
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

/**
 * QuestionCard - Renders a single question depending on type
 */
function QuestionCard({ question, questionIndex, answer, onAnswer, isFlagged, onToggleFlag }) {
    const diffConfig = DIFFICULTY_CONFIG[question.difficultyLevel] || {};

    return (
        <motion.div
            key={question.questionId}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 rounded-3xl shadow-xl border border-base-300 overflow-hidden"
        >
            {/* Question Header */}
            <div className="p-6 pb-4 border-b border-base-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg">
                            Câu {questionIndex + 1}
                        </span>
                        {diffConfig.badge && (
                            <span className={`badge badge-sm font-bold ${diffConfig.badge}`}>
                                {diffConfig.label}
                            </span>
                        )}
                        <span className="text-xs text-base-content/40 font-medium">
                            {question.points} điểm
                        </span>
                    </div>
                    <button
                        onClick={onToggleFlag}
                        className={`btn btn-circle btn-sm ${isFlagged ? 'btn-warning' : 'btn-ghost'}`}
                        title={isFlagged ? 'Bỏ đánh dấu' : 'Đánh dấu xem lại'}
                    >
                        <Icon name="Flag" size="sm" className={isFlagged ? 'text-white fill-white' : ''} />
                    </button>
                </div>

                <p className="text-base font-bold text-base-content leading-relaxed">
                    {question.questionText}
                </p>
            </div>

            {/* Answer Area */}
            <div className="p-6">
                {(question.questionType === 'multiple_choice' || question.questionType === 'true_false') && (
                    <div className="space-y-3">
                        {question.options.map((option, idx) => {
                            const isSelected = (answer || []).includes(option.optionId);
                            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                            return (
                                <motion.button
                                    key={option.optionId}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => onAnswer(question.questionId, option.optionId)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${isSelected
                                        ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                                        : 'border-base-300 hover:border-blue-500/30 hover:bg-base-200/50'
                                        }`}
                                >
                                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all ${isSelected
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-base-200 text-base-content/60'
                                        }`}>
                                        {letters[idx]}
                                    </span>
                                    <span className={`font-medium text-sm ${isSelected ? 'text-blue-600 font-bold' : 'text-base-content'}`}>
                                        {option.optionText}
                                    </span>
                                    {isSelected && (
                                        <Icon name="CheckCircle2" size="md" className="ml-auto text-blue-500 shrink-0" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                )}

                {(question.questionType === 'fill_in_blank' || question.questionType === 'short_answer') && (
                    <div>
                        <textarea
                            placeholder={question.questionType === 'fill_in_blank' ? 'Nhập câu trả lời...' : 'Viết câu trả lời ngắn gọn...'}
                            className="textarea textarea-bordered w-full rounded-xl focus:border-blue-500 text-sm resize-none"
                            rows={question.questionType === 'fill_in_blank' ? 2 : 4}
                            value={answer || ''}
                            onChange={(e) => onAnswer(question.questionId, e.target.value, true)}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/**
 * QuestionNavigator - Panel showing all question numbers for quick navigation
 */
function QuestionNavigator({ questions, currentIndex, answers, flaggedQuestions, onNavigate }) {
    return (
        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-4">
            <h4 className="font-black text-sm text-base-content mb-3 flex items-center gap-2">
                <Icon name="LayoutGrid" size="sm" className="text-blue-500" />
                Danh sách câu hỏi
            </h4>
            <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                    const isActive = i === currentIndex;
                    const userAnswer = answers[q.questionId];
                    const isAnswered = userAnswer && (Array.isArray(userAnswer) ? userAnswer.length > 0 : userAnswer !== '');
                    const isFlagged = flaggedQuestions.includes(i);

                    return (
                        <motion.button
                            key={q.questionId}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onNavigate(i)}
                            className={`relative w-full aspect-square rounded-xl text-xs font-black transition-all flex items-center justify-center ${isActive
                                ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg'
                                : isAnswered
                                    ? 'bg-green-500/15 text-green-600 border border-green-500/30'
                                    : 'bg-base-200 text-base-content/50 hover:bg-base-300'
                                }`}
                        >
                            {i + 1}
                            {isFlagged && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-base-100" />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-base-content/50">
                    <span className="w-4 h-4 rounded bg-gradient-to-br from-blue-600 to-violet-600" />
                    Đang xem
                </div>
                <div className="flex items-center gap-2 text-xs text-base-content/50">
                    <span className="w-4 h-4 rounded bg-green-500/15 border border-green-500/30" />
                    Đã trả lời
                </div>
                <div className="flex items-center gap-2 text-xs text-base-content/50">
                    <span className="w-4 h-4 rounded bg-base-200" />
                    Chưa trả lời
                </div>
                <div className="flex items-center gap-2 text-xs text-base-content/50">
                    <span className="relative w-4 h-4 rounded bg-base-200">
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
                    </span>
                    Đánh dấu
                </div>
            </div>
        </div>
    );
}

/**
 * SubmitConfirmModal - Confirm dialog before submitting quiz
 */
function SubmitConfirmModal({ isOpen, onClose, onConfirm, answered, total, flagged, submitting }) {
    if (!isOpen) return null;

    const unanswered = total - answered;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-6"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mb-4">
                        <Icon name="Send" size="xl" className="text-white" />
                    </div>
                    <h3 className="text-xl font-black text-base-content mb-2">Nộp bài thi?</h3>
                    <p className="text-sm text-base-content/60">Hãy kiểm tra lại trước khi nộp bài</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center p-3 bg-green-500/10 rounded-xl">
                        <p className="text-lg font-black text-green-600">{answered}</p>
                        <p className="text-[10px] text-base-content/50 font-bold uppercase">Đã trả lời</p>
                    </div>
                    <div className="text-center p-3 bg-orange-500/10 rounded-xl">
                        <p className="text-lg font-black text-orange-600">{unanswered}</p>
                        <p className="text-[10px] text-base-content/50 font-bold uppercase">Chưa trả lời</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-500/10 rounded-xl">
                        <p className="text-lg font-black text-yellow-600">{flagged}</p>
                        <p className="text-[10px] text-base-content/50 font-bold uppercase">Đánh dấu</p>
                    </div>
                </div>

                {unanswered > 0 && (
                    <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl mb-4">
                        <p className="text-xs text-orange-600 font-bold flex items-center gap-2">
                            <Icon name="AlertTriangle" size="sm" />
                            Bạn còn {unanswered} câu chưa trả lời!
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={onClose} disabled={submitting} className="btn flex-1 btn-ghost rounded-xl font-bold">
                        Quay lại
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onConfirm}
                        disabled={submitting}
                        className="btn flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold"
                    >
                        {submitting ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : (
                            <Icon name="Send" size="sm" />
                        )}
                        {submitting ? 'Đang nộp...' : 'Nộp bài'}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/**
 * QuizTaking - Main quiz-taking component
 * Route: /tests/:id/take?attemptId=xxx
 */
export default function QuizTaking() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const attemptId = searchParams.get('attemptId');

    // Load attempt data from API
    const { testInfo, questions, loading, error, submitting, submitAttempt } = useQuizTaking(attemptId);

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: [optionId] | 'text' }
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Initialize timer when test data loads
    useEffect(() => {
        if (testInfo?.timeLimitSeconds && timeLeft === null) {
            setTimeLeft(testInfo.timeLimitSeconds);
        }
    }, [testInfo, timeLeft]);

    // Initialize answers from any previously saved answers
    useEffect(() => {
        if (questions.length > 0) {
            const initialAnswers = {};
            questions.forEach(q => {
                if (q.userSelectedOptionIds?.length > 0) {
                    initialAnswers[q.questionId] = q.userSelectedOptionIds;
                } else if (q.userAnswerText) {
                    initialAnswers[q.questionId] = q.userAnswerText;
                }
            });
            if (Object.keys(initialAnswers).length > 0) {
                setAnswers(initialAnswers);
            }
        }
    }, [questions]);

    // Build submit payload
    const buildSubmitPayload = useCallback(() => {
        return questions.map(q => {
            const answer = answers[q.questionId];
            if (Array.isArray(answer)) {
                return { questionId: q.questionId, selectedOptionIds: answer };
            } else if (typeof answer === 'string' && answer.trim()) {
                return { questionId: q.questionId, answerText: answer };
            }
            return { questionId: q.questionId, selectedOptionIds: [] };
        });
    }, [answers, questions]);

    // Submit handler
    const handleSubmit = useCallback(async () => {
        try {
            const payload = buildSubmitPayload();
            const result = await submitAttempt(payload);
            navigate(`/tests/${id}/results/${attemptId}`, { state: { result } });
        } catch (err) {
            alert('Có lỗi khi nộp bài. Vui lòng thử lại.');
        }
    }, [attemptId, buildSubmitPayload, id, navigate, submitAttempt]);

    // Timer
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) {
            if (timeLeft === 0) handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [handleSubmit, timeLeft]);

    // Keyboard navigation
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            e.preventDefault();
            setCurrentIndex(prev => prev - 1);
        } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
            e.preventDefault();
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, questions.length]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    // Answer handler for multiple choice
    const handleAnswer = (questionId, value, isText = false) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: isText ? value : [value], // wrap optionId in array for backend
        }));
    };

    const handleToggleFlag = () => {
        setFlaggedQuestions(prev =>
            prev.includes(currentIndex)
                ? prev.filter(i => i !== currentIndex)
                : [...prev, currentIndex]
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <OwlLoader
                    message="Đang chuẩn bị bài thi..."
                    subMessage="SKR đang tải câu hỏi, bộ đáp án và đồng hồ làm bài trước khi bạn bắt đầu."
                    className="py-8"
                />
            </div>
        );
    }

    // Error / no attempt
    if (error || !testInfo || !attemptId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="text-center">
                    <Icon name="FileX" size="3xl" className="text-base-content/30 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-base-content mb-2">
                        {error || 'Không tìm thấy bài thi'}
                    </h2>
                    <button onClick={() => navigate('/tests')} className="btn btn-primary rounded-xl mt-4">
                        Về danh sách
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).filter(k => {
        const v = answers[k];
        return v && (Array.isArray(v) ? v.length > 0 : v !== '');
    }).length;

    return (
        <div className="min-h-screen bg-base-200 flex flex-col">
            {/* Header */}
            <QuizHeader
                test={testInfo}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                timeLeft={timeLeft || 0}
                onSubmit={() => setShowSubmitModal(true)}
                flaggedCount={flaggedQuestions.length}
            />

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Question Area */}
                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        {currentQuestion && (
                            <QuestionCard
                                question={currentQuestion}
                                questionIndex={currentIndex}
                                answer={answers[currentQuestion.questionId]}
                                onAnswer={handleAnswer}
                                isFlagged={flaggedQuestions.includes(currentIndex)}
                                onToggleFlag={handleToggleFlag}
                            />
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setCurrentIndex(prev => prev - 1)}
                                disabled={currentIndex === 0}
                                className="btn btn-ghost rounded-xl gap-2 font-bold disabled:opacity-30"
                            >
                                <Icon name="ArrowLeft" size="sm" />
                                Câu trước
                            </motion.button>

                            <span className="text-sm font-bold text-base-content/50">
                                {currentIndex + 1} / {questions.length}
                            </span>

                            {currentIndex < questions.length - 1 ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setCurrentIndex(prev => prev + 1)}
                                    className="btn bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl gap-2 font-bold shadow-lg shadow-blue-600/20"
                                >
                                    Câu tiếp
                                    <Icon name="ArrowRight" size="sm" />
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowSubmitModal(true)}
                                    className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none rounded-xl gap-2 font-bold shadow-lg"
                                >
                                    <Icon name="Send" size="sm" />
                                    Nộp bài
                                </motion.button>
                            )}
                        </div>

                        {/* Keyboard hint */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-base-content/30 font-medium">
                                Dùng phím ← → để di chuyển giữa các câu hỏi
                            </p>
                        </div>
                    </div>
                </div>

                {/* Side Panel - Question Navigator */}
                <div className="hidden lg:block w-72 p-4 border-l border-base-300 bg-base-100/50 overflow-y-auto">
                    <QuestionNavigator
                        questions={questions}
                        currentIndex={currentIndex}
                        answers={answers}
                        flaggedQuestions={flaggedQuestions}
                        onNavigate={setCurrentIndex}
                    />
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            <SubmitConfirmModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={handleSubmit}
                answered={answeredCount}
                total={questions.length}
                flagged={flaggedQuestions.length}
                submitting={submitting}
            />
        </div>
    );
}
