import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import { OwlLoader } from '@/shared/ui/common';
import Icon from '@/shared/ui/icons/Icon';
import {
    DIFFICULTY_CONFIG,
    QUESTION_TYPE_CONFIG,
    DEFAULT_GRADIENT,
    DEFAULT_ICON,
    formatDuration,
    formatRelativeTime,
    getScoreColor,
    getScoreGrade,
} from '@/features/tests/components';
import { useQuizDetail } from '@/features/tests/hooks/useQuiz';

/**
 * TestDetail Page — Xem chi tiết bài thi trước khi bắt đầu
 * Route: /tests/:id
 * Data: quizApi.getPracticeById() + quizApi.getMyAttempts()
 */
export default function TestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [starting, setStarting] = useState(false);

    const { practice: test, attempts, loading, error, startAttempt } = useQuizDetail(id);

    // Loading state
    if (loading) {
        return (
            <div className="flex h-screen bg-base-200 overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <OwlLoader
                        message="Đang tải bài thi..."
                        subMessage="SKR đang chuẩn bị thông tin đề, thời gian làm bài và lịch sử lần thử của bạn."
                        className="py-8"
                    />
                </div>
            </div>
        );
    }

    // Not found
    if (error || !test) {
        return (
            <div className="flex h-screen bg-base-200 overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-base-300/50 rounded-3xl flex items-center justify-center mb-4">
                            <Icon name="FileX" size="3xl" className="text-base-content/30" />
                        </div>
                        <h2 className="text-xl font-black text-base-content mb-2">
                            {error || 'Không tìm thấy bài thi'}
                        </h2>
                        <p className="text-sm text-base-content/60 mb-6">Bài thi này không tồn tại hoặc đã bị xoá</p>
                        <Link to="/tests" className="btn bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold">
                            <Icon name="ArrowLeft" size="sm" />
                            Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const difficulty = DIFFICULTY_CONFIG[test.difficultyLevels?.[0]] || {};
    const hasAttempts = (test.attemptsCount || 0) > 0;
    const grade = getScoreGrade(test.bestScore);

    const handleStartTest = async () => {
        try {
            setStarting(true);
            const data = await startAttempt(50); // passing score = 50%
            const attemptId = data?.attempt?.attemptId;
            if (attemptId) {
                navigate(`/tests/${id}/take?attemptId=${attemptId}`);
            }
        } catch (err) {
            console.error('Failed to start quiz attempt:', err);
            alert('Không thể bắt đầu bài thi. Vui lòng thử lại.');
        } finally {
            setStarting(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <motion.header
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="bg-base-100 border-b border-base-300 px-8 py-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/tests" className="btn btn-circle btn-ghost btn-sm">
                                <Icon name="ArrowLeft" size="md" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <Link to="/tests" className="text-xs text-base-content/40 hover:text-blue-500 font-bold transition-colors">
                                        Thi Thử
                                    </Link>
                                    <Icon name="ChevronRight" size="xs" className="text-base-content/30" />
                                    <span className="text-xs text-base-content/60 font-bold">{test.testTitle}</span>
                                </div>
                                <h2 className="text-xl font-black text-base-content">{test.testTitle}</h2>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-6 lg:p-8">
                        {/* ─── Hero Section ─── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-base-100 rounded-3xl shadow-xl border border-base-300 overflow-hidden mb-6"
                        >
                            {/* Gradient Banner */}
                            <div className={`h-32 bg-gradient-to-r ${DEFAULT_GRADIENT} relative overflow-hidden`}>
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-4 left-8 w-20 h-20 border-4 border-white rounded-full" />
                                    <div className="absolute bottom-2 right-12 w-32 h-32 border-4 border-white rounded-full" />
                                    <div className="absolute top-8 right-40 w-12 h-12 border-4 border-white rounded-lg rotate-45" />
                                </div>
                                <div className="absolute bottom-4 left-8 text-5xl opacity-30">{DEFAULT_ICON}</div>
                            </div>

                            <div className="p-6 -mt-8 relative z-10">
                                {/* Difficulty Badge Row */}
                                <div className="flex items-center gap-2 mb-3 ml-1">
                                    <span className="badge badge-lg bg-base-100 shadow-md font-bold gap-1 text-sm">
                                        {DEFAULT_ICON} Thi thử
                                    </span>
                                    {difficulty.badge && (
                                        <span className={`badge badge-lg font-bold ${difficulty.badge}`}>
                                            {difficulty.label}
                                        </span>
                                    )}
                                    {test.status === 'deleted' && (
                                        <span className="badge badge-lg badge-ghost font-bold gap-1">
                                            <Icon name="FileEdit" size="xs" /> Đã xóa
                                        </span>
                                    )}
                                </div>

                                {/* Title & Description */}
                                <h1 className="text-2xl font-black text-base-content mb-2">{test.testTitle}</h1>
                                <p className="text-sm text-base-content/60 leading-relaxed mb-6">
                                    {test.testDescription || 'Bài thi thử'}
                                </p>

                                {/* Quick Info Chips */}
                                {test.questionTypes?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {test.questionTypes.map(type => {
                                            const qt = QUESTION_TYPE_CONFIG[type];
                                            return qt ? (
                                                <span key={type} className="badge badge-lg badge-ghost gap-1 font-bold text-xs">
                                                    <Icon name={qt.icon} size="xs" className={qt.color} />
                                                    {qt.label}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* ─── Two Column Layout ─── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Config + History */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Test Configuration */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-6"
                                >
                                    <h3 className="font-black text-base text-base-content mb-4 flex items-center gap-2">
                                        <Icon name="Settings2" size="md" className="text-blue-500" />
                                        Cấu hình bài thi
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-blue-500/5 rounded-xl p-4 text-center border border-blue-500/10">
                                            <Icon name="HelpCircle" size="lg" className="text-blue-500 mx-auto mb-2" />
                                            <p className="text-xl font-black text-base-content">{test.totalQuestions}</p>
                                            <p className="text-xs text-base-content/50 font-bold uppercase">Câu hỏi</p>
                                        </div>
                                        <div className="bg-violet-500/5 rounded-xl p-4 text-center border border-violet-500/10">
                                            <Icon name="Clock" size="lg" className="text-violet-500 mx-auto mb-2" />
                                            <p className="text-xl font-black text-base-content">{formatDuration(test.timeLimitMinutes)}</p>
                                            <p className="text-xs text-base-content/50 font-bold uppercase">Thời gian</p>
                                        </div>
                                        <div className={`${difficulty.bg || 'bg-base-200/50'} rounded-xl p-4 text-center border border-current/10`}>
                                            <Icon name="Signal" size="lg" className={`${difficulty.color || 'text-base-content/40'} mx-auto mb-2`} />
                                            <p className={`text-xl font-black ${difficulty.color || 'text-base-content'}`}>{difficulty.label || '—'}</p>
                                            <p className="text-xs text-base-content/50 font-bold uppercase">Độ khó</p>
                                        </div>
                                        <div className="bg-green-500/5 rounded-xl p-4 text-center border border-green-500/10">
                                            <Icon name="PlayCircle" size="lg" className="text-green-500 mx-auto mb-2" />
                                            <p className="text-xl font-black text-base-content">{test.attemptsCount || 0}</p>
                                            <p className="text-xs text-base-content/50 font-bold uppercase">Lượt thi</p>
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {[
                                            { icon: 'Shuffle', label: 'Trộn câu hỏi', active: test.randomizeQuestions },
                                            { icon: 'ArrowLeftRight', label: 'Trộn đáp án', active: test.randomizeOptions },
                                            { icon: 'Eye', label: 'Hiển thị đáp án', active: test.showCorrectAnswers },
                                        ].map(opt => (
                                            <div key={opt.label} className={`flex items-center gap-3 p-3 rounded-xl ${opt.active ? 'bg-green-500/5 border border-green-500/20' : 'bg-base-200/50 border border-base-300'}`}>
                                                <Icon name={opt.icon} size="sm" className={opt.active ? 'text-green-500' : 'text-base-content/40'} />
                                                <span className="text-xs font-bold text-base-content/70">{opt.label}</span>
                                                <span className={`ml-auto text-xs font-black ${opt.active ? 'text-green-500' : 'text-base-content/30'}`}>
                                                    {opt.active ? 'BẬT' : 'TẮT'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Attempt History */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-6"
                                >
                                    <h3 className="font-black text-base text-base-content mb-4 flex items-center gap-2">
                                        <Icon name="History" size="md" className="text-orange-500" />
                                        Lịch sử thi
                                        {attempts.length > 0 && (
                                            <span className="badge badge-sm badge-primary ml-2">{attempts.length} lượt</span>
                                        )}
                                    </h3>

                                    {attempts.length > 0 ? (
                                        <div className="space-y-3">
                                            {attempts.map((attempt, idx) => {
                                                const attemptGrade = getScoreGrade(attempt.percentageScore);
                                                return (
                                                    <motion.div
                                                        key={attempt.attemptId}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                                        className="flex items-center gap-4 p-4 bg-base-200/40 rounded-xl hover:bg-base-200/70 transition-colors group cursor-pointer"
                                                        onClick={() => navigate(`/tests/${id}/results/${attempt.attemptId}`)}
                                                    >
                                                        {/* Rank Icon */}
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${idx === 0
                                                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg'
                                                            : 'bg-base-300 text-base-content/50'
                                                            }`}>
                                                            {idx === 0 ? '🏆' : `#${idx + 1}`}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-base-content">
                                                                Lần thi {attempts.length - idx}
                                                                {idx === 0 && <span className="text-xs text-yellow-500 ml-2 font-black">Gần nhất</span>}
                                                            </p>
                                                            <p className="text-xs text-base-content/50">
                                                                {formatRelativeTime(attempt.submittedAtUtc || attempt.startedAtUtc)}
                                                                {attempt.status === 'submitted' || attempt.status === 'graded'
                                                                    ? ` · ${attempt.correctAnswers || 0}/${attempt.totalQuestions} đúng`
                                                                    : ` · ${attempt.status === 'in_progress' ? 'Đang thi' : attempt.status}`
                                                                }
                                                            </p>
                                                        </div>

                                                        {/* Score */}
                                                        <div className="text-right">
                                                            {attempt.percentageScore != null ? (
                                                                <>
                                                                    <p className={`text-lg font-black ${getScoreColor(attempt.percentageScore)}`}>
                                                                        {Number(attempt.percentageScore).toFixed(1)}%
                                                                    </p>
                                                                    <p className={`text-[10px] font-bold ${attemptGrade.color}`}>
                                                                        {attemptGrade.label}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="text-sm font-bold text-base-content/30">—</p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 mx-auto bg-blue-500/5 rounded-2xl flex items-center justify-center mb-3">
                                                <Icon name="Sparkles" size="xl" className="text-blue-500" />
                                            </div>
                                            <p className="font-bold text-base-content/60 mb-1">Chưa có lượt thi nào</p>
                                            <p className="text-xs text-base-content/40">Hãy bắt đầu lần thi đầu tiên!</p>
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Right Column: Score + CTA */}
                            <div className="space-y-6">
                                {/* Performance Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-6"
                                >
                                    <h3 className="font-black text-base text-base-content mb-4 flex items-center gap-2">
                                        <Icon name="BarChart3" size="md" className="text-green-500" />
                                        Kết quả
                                    </h3>

                                    {hasAttempts && test.bestScore != null ? (
                                        <>
                                            {/* Score Circle */}
                                            <div className="flex justify-center mb-6">
                                                <div className="relative">
                                                    <svg width={140} height={140} className="-rotate-90">
                                                        <circle cx={70} cy={70} r={60} strokeWidth={10} fill="none" className="stroke-base-300" />
                                                        <motion.circle
                                                            cx={70} cy={70} r={60}
                                                            strokeWidth={10}
                                                            fill="none"
                                                            className={Number(test.bestScore) >= 80 ? 'stroke-green-500' : Number(test.bestScore) >= 50 ? 'stroke-blue-500' : 'stroke-red-500'}
                                                            strokeLinecap="round"
                                                            initial={{ strokeDashoffset: 377 }}
                                                            animate={{ strokeDashoffset: 377 - (377 * Number(test.bestScore)) / 100 }}
                                                            style={{ strokeDasharray: 377 }}
                                                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <motion.span
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.8 }}
                                                            className={`text-2xl font-black ${getScoreColor(test.bestScore)}`}
                                                        >
                                                            {Number(test.bestScore).toFixed(1)}%
                                                        </motion.span>
                                                        <span className={`text-xs font-bold ${grade.color}`}>{grade.label}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl">
                                                    <span className="text-xs font-bold text-base-content/60 flex items-center gap-2">
                                                        <Icon name="Trophy" size="sm" className="text-yellow-500" /> Điểm cao nhất
                                                    </span>
                                                    <span className={`font-black ${getScoreColor(test.bestScore)}`}>{Number(test.bestScore).toFixed(1)}%</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl">
                                                    <span className="text-xs font-bold text-base-content/60 flex items-center gap-2">
                                                        <Icon name="TrendingUp" size="sm" className="text-blue-500" /> Điểm trung bình
                                                    </span>
                                                    <span className={`font-black ${getScoreColor(test.averageScore)}`}>
                                                        {test.averageScore != null ? `${Number(test.averageScore).toFixed(1)}%` : '—'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl">
                                                    <span className="text-xs font-bold text-base-content/60 flex items-center gap-2">
                                                        <Icon name="PlayCircle" size="sm" className="text-green-500" /> Lượt thi
                                                    </span>
                                                    <span className="font-black text-base-content">{test.attemptsCount || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl">
                                                    <span className="text-xs font-bold text-base-content/60 flex items-center gap-2">
                                                        <Icon name="Calendar" size="sm" className="text-violet-500" /> Thi gần nhất
                                                    </span>
                                                    <span className="font-black text-base-content text-xs">{formatRelativeTime(test.lastAttemptAtUtc)}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="w-16 h-16 mx-auto bg-base-200 rounded-full flex items-center justify-center mb-3">
                                                <Icon name="BarChart3" size="xl" className="text-base-content/20" />
                                            </div>
                                            <p className="text-sm font-bold text-base-content/50 mb-1">Chưa có dữ liệu</p>
                                            <p className="text-xs text-base-content/30">Hoàn thành bài thi để xem kết quả</p>
                                        </div>
                                    )}
                                </motion.div>

                                {/* CTA Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl shadow-xl p-6 text-white"
                                >
                                    <div className="text-center mb-4">
                                        <div className="w-14 h-14 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                                            <Icon name="Rocket" size="xl" className="text-white" />
                                        </div>
                                        <h3 className="text-lg font-black mb-1">
                                            {hasAttempts ? 'Thi lại' : 'Bắt đầu thi'}
                                        </h3>
                                        <p className="text-xs text-white/70">
                                            {test.totalQuestions} câu · {formatDuration(test.timeLimitMinutes)}
                                        </p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setShowConfirm(true)}
                                        className="btn w-full bg-white hover:bg-white/90 text-blue-600 border-none rounded-xl font-black shadow-lg gap-2"
                                    >
                                        <Icon name="Play" size="md" />
                                        {hasAttempts ? 'Thi lại ngay' : 'Bắt đầu ngay'}
                                    </motion.button>

                                    {hasAttempts && (
                                        <p className="text-center text-[10px] text-white/50 mt-3 font-medium">
                                            Cải thiện điểm số để đạt kết quả tốt hơn! 💪
                                        </p>
                                    )}
                                </motion.div>

                                {/* Tips Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-5"
                                >
                                    <h4 className="font-black text-sm text-base-content mb-3 flex items-center gap-2">
                                        <Icon name="Lightbulb" size="sm" className="text-yellow-500" />
                                        Lưu ý
                                    </h4>
                                    <ul className="space-y-2 text-xs text-base-content/60">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            Bài thi sẽ tự động nộp khi hết thời gian
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            Dùng phím ← → để di chuyển giữa các câu
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            Đánh dấu câu chưa chắc để xem lại
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            Kiểm tra kỹ trước khi nộp bài
                                        </li>
                                    </ul>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Start Confirm Modal */}
            {showConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !starting && setShowConfirm(false)} />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-6"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mb-4">
                                <Icon name="Rocket" size="xl" className="text-white" />
                            </div>
                            <h3 className="text-xl font-black text-base-content mb-2">Sẵn sàng bắt đầu?</h3>
                            <p className="text-sm text-base-content/60">
                                {test.timeLimitMinutes
                                    ? <>Bạn sẽ có <strong>{formatDuration(test.timeLimitMinutes)}</strong> để hoàn thành <strong>{test.totalQuestions} câu hỏi</strong>.</>
                                    : <>Bài thi gồm <strong>{test.totalQuestions} câu hỏi</strong>, <strong>không giới hạn thời gian</strong>.</>
                                }
                            </p>
                        </div>

                        <div className="bg-base-200/50 rounded-xl p-4 mb-6 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-base-content/60 font-medium flex items-center gap-2">
                                    <Icon name="HelpCircle" size="sm" className="text-blue-500" /> Số câu hỏi
                                </span>
                                <span className="font-black text-base-content">{test.totalQuestions}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-base-content/60 font-medium flex items-center gap-2">
                                    <Icon name="Clock" size="sm" className="text-violet-500" /> Thời gian
                                </span>
                                <span className="font-black text-base-content">{formatDuration(test.timeLimitMinutes)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-base-content/60 font-medium flex items-center gap-2">
                                    <Icon name="Signal" size="sm" className={difficulty.color} /> Độ khó
                                </span>
                                <span className={`font-black ${difficulty.color}`}>{difficulty.label || '—'}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={starting}
                                className="btn flex-1 btn-ghost rounded-xl font-bold"
                            >
                                Để sau
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStartTest}
                                disabled={starting}
                                className="btn flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold shadow-lg gap-2"
                            >
                                {starting ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <Icon name="Play" size="sm" />
                                )}
                                {starting ? 'Đang tạo...' : 'Bắt đầu'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
