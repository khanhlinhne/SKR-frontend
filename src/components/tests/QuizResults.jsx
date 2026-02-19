import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import * as motion from 'motion/react-client';
import Icon from '../icons/Icon';
import { CircularProgress } from '../common/ProgressBar';
import { DIFFICULTY_CONFIG, formatTime, getScoreColor, getScoreGrade } from './utils';

/**
 * ResultsHeader - Summary header with score circle
 */
function ResultsHeader({ percentScore, correctCount, totalQuestions, earnedPoints, totalPoints, timeSpent, testTitle }) {
    const grade = getScoreGrade(percentScore);
    const isPassed = percentScore >= 50;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-base-100 rounded-3xl shadow-xl border border-base-300 p-8 mb-6"
        >
            <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Circle */}
                <div className="relative">
                    <svg width={160} height={160} className="-rotate-90">
                        <circle cx={80} cy={80} r={70} strokeWidth={10} fill="none" className="stroke-base-300" />
                        <motion.circle
                            cx={80} cy={80} r={70}
                            strokeWidth={10}
                            fill="none"
                            className={percentScore >= 80 ? 'stroke-green-500' : percentScore >= 50 ? 'stroke-blue-500' : 'stroke-red-500'}
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: 440 }}
                            animate={{ strokeDashoffset: 440 - (440 * percentScore) / 100 }}
                            style={{ strokeDasharray: 440 }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className={`text-3xl font-black ${getScoreColor(percentScore)}`}
                        >
                            {Math.round(percentScore)}%
                        </motion.span>
                        <span className={`text-xs font-bold ${grade.color}`}>{grade.label}</span>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="flex-1 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-2xl font-black text-base-content mb-1">{testTitle}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            {isPassed ? (
                                <span className="badge badge-success gap-1 font-bold">
                                    <Icon name="CheckCircle2" size="xs" /> Đạt
                                </span>
                            ) : (
                                <span className="badge badge-error gap-1 font-bold">
                                    <Icon name="XCircle" size="xs" /> Chưa đạt
                                </span>
                            )}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: 'CheckCircle2', label: 'Câu đúng', value: `${correctCount}/${totalQuestions}`, color: 'text-green-500', bg: 'bg-green-500/10' },
                            { icon: 'XCircle', label: 'Câu sai', value: `${totalQuestions - correctCount}/${totalQuestions}`, color: 'text-red-500', bg: 'bg-red-500/10' },
                            { icon: 'Star', label: 'Điểm', value: `${earnedPoints.toFixed(1)}/${totalPoints.toFixed(1)}`, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                            { icon: 'Clock', label: 'Thời gian', value: formatTime(timeSpent), color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className={`${stat.bg} rounded-xl p-3 text-center`}
                            >
                                <Icon name={stat.icon} size="md" className={`${stat.color} mx-auto mb-1`} />
                                <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                                <p className="text-[10px] font-bold text-base-content/50 uppercase">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * ReviewQuestionCard - Shows question with correct/incorrect answer highlighting
 */
function ReviewQuestionCard({ question, questionIndex, userAnswer, showExplanation, onToggleExplanation }) {
    const isMultipleChoice = question.type === 'multiple_choice' || question.type === 'true_false';
    const isFillIn = question.type === 'fill_in_blank' || question.type === 'short_answer';
    const diffConfig = DIFFICULTY_CONFIG[question.difficulty] || {};

    let isCorrect = false;
    if (isMultipleChoice) {
        const correctOption = question.options.find(o => o.isCorrect);
        isCorrect = correctOption && userAnswer === correctOption.id;
    } else if (question.type === 'fill_in_blank') {
        isCorrect = question.acceptedAnswers?.some(a => a.toLowerCase() === (userAnswer || '').toLowerCase());
    }

    const borderColor = !userAnswer ? 'border-base-300' : isCorrect ? 'border-green-500/30' : 'border-red-500/30';
    const bgColor = !userAnswer ? '' : isCorrect ? 'bg-green-500/[0.02]' : 'bg-red-500/[0.02]';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className={`bg-base-100 rounded-2xl shadow-md border-2 ${borderColor} ${bgColor} overflow-hidden`}
        >
            {/* Question Header */}
            <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-3 py-1 rounded-lg ${isCorrect
                            ? 'bg-green-500/10 text-green-600'
                            : !userAnswer
                                ? 'bg-base-200 text-base-content/50'
                                : 'bg-red-500/10 text-red-600'
                            }`}>
                            Câu {questionIndex + 1}
                        </span>
                        <span className={`badge badge-sm font-bold ${diffConfig.badge}`}>
                            {diffConfig.label}
                        </span>
                        <span className="text-xs text-base-content/40">{question.points} điểm</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isCorrect ? (
                            <span className="badge badge-success badge-sm gap-1 font-bold">
                                <Icon name="Check" size="xs" /> Đúng
                            </span>
                        ) : !userAnswer ? (
                            <span className="badge badge-ghost badge-sm gap-1 font-bold">
                                <Icon name="Minus" size="xs" /> Bỏ qua
                            </span>
                        ) : (
                            <span className="badge badge-error badge-sm gap-1 font-bold">
                                <Icon name="X" size="xs" /> Sai
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-sm font-bold text-base-content leading-relaxed">{question.text}</p>
            </div>

            {/* Options with highlighting */}
            {isMultipleChoice && (
                <div className="px-5 pb-3 space-y-2">
                    {question.options.map((option, idx) => {
                        const isUserSelected = userAnswer === option.id;
                        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

                        let optionStyle = 'border-base-300 bg-base-100';
                        let letterStyle = 'bg-base-200 text-base-content/50';
                        let textStyle = 'text-base-content/70';

                        if (option.isCorrect) {
                            optionStyle = 'border-green-500/50 bg-green-500/5';
                            letterStyle = 'bg-green-500 text-white';
                            textStyle = 'text-green-700 font-bold';
                        } else if (isUserSelected && !option.isCorrect) {
                            optionStyle = 'border-red-500/50 bg-red-500/5';
                            letterStyle = 'bg-red-500 text-white';
                            textStyle = 'text-red-700 line-through font-medium';
                        }

                        return (
                            <div
                                key={option.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 ${optionStyle}`}
                            >
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${letterStyle}`}>
                                    {letters[idx]}
                                </span>
                                <span className={`text-sm ${textStyle}`}>{option.text}</span>
                                {option.isCorrect && (
                                    <Icon name="CheckCircle2" size="sm" className="ml-auto text-green-500 shrink-0" />
                                )}
                                {isUserSelected && !option.isCorrect && (
                                    <Icon name="XCircle" size="sm" className="ml-auto text-red-500 shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Fill in blank answer */}
            {isFillIn && (
                <div className="px-5 pb-3 space-y-2">
                    <div className={`p-3 rounded-xl border-2 ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                        <p className="text-xs text-base-content/50 font-bold mb-1">Câu trả lời của bạn:</p>
                        <p className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {userAnswer || '(Không trả lời)'}
                        </p>
                    </div>
                    {!isCorrect && question.correctAnswer && (
                        <div className="p-3 rounded-xl border-2 border-green-500/30 bg-green-500/5">
                            <p className="text-xs text-base-content/50 font-bold mb-1">Đáp án đúng:</p>
                            <p className="text-sm font-bold text-green-600">{question.correctAnswer}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Explanation */}
            <div className="px-5 pb-4">
                <button
                    onClick={onToggleExplanation}
                    className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
                >
                    <Icon name={showExplanation ? 'ChevronUp' : 'ChevronDown'} size="sm" />
                    {showExplanation ? 'Ẩn giải thích' : 'Xem giải thích'}
                </button>
                {showExplanation && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl"
                    >
                        <div className="flex items-start gap-2">
                            <Icon name="Lightbulb" size="sm" className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-base-content/80 leading-relaxed">{question.explanation}</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

/**
 * QuizResults - Main results page component
 * Route: /tests/:id/results
 */
export default function QuizResults() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedExplanations, setExpandedExplanations] = useState({});
    const [showAll, setShowAll] = useState(false);
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'correct', 'incorrect', 'skipped'

    // Get data from navigation state
    const data = location.state;

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="text-center">
                    <Icon name="FileX" size="3xl" className="text-base-content/30 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-base-content mb-2">Không có dữ liệu kết quả</h2>
                    <p className="text-sm text-base-content/60 mb-4">Bạn cần hoàn thành bài thi trước</p>
                    <button onClick={() => navigate('/tests')} className="btn btn-primary rounded-xl">
                        Về danh sách bài thi
                    </button>
                </div>
            </div>
        );
    }

    const { test, questions, answers, correctCount, totalQuestions, earnedPoints, totalPoints, percentScore, timeSpent } = data;

    const toggleExplanation = (idx) => {
        setExpandedExplanations(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const expandAll = () => {
        const allExpanded = {};
        questions.forEach((_, idx) => { allExpanded[idx] = true; });
        setExpandedExplanations(allExpanded);
    };

    const collapseAll = () => {
        setExpandedExplanations({});
    };

    // Filter questions
    const filteredQuestions = questions.map((q, idx) => ({ question: q, index: idx })).filter(({ question, index }) => {
        const userAnswer = answers[index];
        const isMultipleChoice = question.type === 'multiple_choice' || question.type === 'true_false';

        let isCorrect = false;
        if (isMultipleChoice) {
            const correctOption = question.options.find(o => o.isCorrect);
            isCorrect = correctOption && userAnswer === correctOption.id;
        } else if (question.type === 'fill_in_blank') {
            isCorrect = question.acceptedAnswers?.some(a => a.toLowerCase() === (userAnswer || '').toLowerCase());
        }

        if (filterMode === 'correct') return isCorrect;
        if (filterMode === 'incorrect') return userAnswer && !isCorrect;
        if (filterMode === 'skipped') return !userAnswer;
        return true;
    });

    return (
        <div className="min-h-screen bg-base-200">
            {/* Top Navigation */}
            <div className="bg-base-100 border-b border-base-300 px-6 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link
                        to="/tests"
                        className="flex items-center gap-2 text-sm font-bold text-base-content/60 hover:text-base-content transition-colors"
                    >
                        <Icon name="ArrowLeft" size="sm" />
                        Quay lại danh sách
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/tests/${id}/take`}
                            className="btn btn-sm btn-ghost gap-2 rounded-xl font-bold"
                        >
                            <Icon name="RotateCcw" size="sm" />
                            Thi lại
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/tests')}
                            className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold"
                        >
                            Bài thi khác
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto p-6 lg:p-8">
                {/* Score Header */}
                <ResultsHeader
                    percentScore={percentScore}
                    correctCount={correctCount}
                    totalQuestions={totalQuestions}
                    earnedPoints={earnedPoints}
                    totalPoints={totalPoints}
                    timeSpent={timeSpent}
                    testTitle={test?.title || 'Bài thi'}
                />

                {/* Review Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-black text-base-content">Xem lại bài làm</h3>
                        <p className="text-sm text-base-content/60">Phân tích chi tiết từng câu hỏi</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Filter Tabs */}
                        <div className="join">
                            {[
                                { key: 'all', label: 'Tất cả', count: totalQuestions },
                                { key: 'correct', label: 'Đúng', count: correctCount },
                                { key: 'incorrect', label: 'Sai', count: totalQuestions - correctCount - Object.keys(answers).filter(k => !answers[k]).length },
                                { key: 'skipped', label: 'Bỏ qua', count: totalQuestions - Object.keys(answers).filter(k => answers[k]).length },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterMode(tab.key)}
                                    className={`btn btn-sm join-item gap-1 font-bold ${filterMode === tab.key ? 'btn-primary' : 'btn-ghost'}`}
                                >
                                    {tab.label}
                                    <span className="badge badge-xs">{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Expand/Collapse */}
                        <button
                            onClick={Object.keys(expandedExplanations).length > 0 ? collapseAll : expandAll}
                            className="btn btn-sm btn-ghost gap-1 font-bold"
                        >
                            <Icon name={Object.keys(expandedExplanations).length > 0 ? 'ChevronsUp' : 'ChevronsDown'} size="sm" />
                        </button>
                    </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-4">
                    {filteredQuestions.map(({ question, index }) => (
                        <ReviewQuestionCard
                            key={question.id}
                            question={question}
                            questionIndex={index}
                            userAnswer={answers[index]}
                            showExplanation={expandedExplanations[index]}
                            onToggleExplanation={() => toggleExplanation(index)}
                        />
                    ))}
                </div>

                {filteredQuestions.length === 0 && (
                    <div className="text-center py-12">
                        <Icon name="Inbox" size="3xl" className="text-base-content/20 mx-auto mb-4" />
                        <p className="text-base-content/50 font-bold">Không có câu hỏi nào trong danh mục này</p>
                    </div>
                )}

                {/* Bottom Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-8 flex items-center justify-center gap-4"
                >
                    <Link
                        to={`/tests/${id}/take`}
                        className="btn bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold shadow-lg shadow-blue-600/20 gap-2"
                    >
                        <Icon name="RotateCcw" size="sm" />
                        Thi lại bài này
                    </Link>
                    <Link
                        to="/tests"
                        className="btn btn-ghost rounded-xl font-bold gap-2"
                    >
                        <Icon name="LayoutGrid" size="sm" />
                        Tất cả bài thi
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
