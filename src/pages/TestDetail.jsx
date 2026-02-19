import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import * as motion from 'motion/react-client';
import { DashboardSidebar } from '../components/learner';
import Icon from '../components/icons/Icon';
import { CircularProgress } from '../components/common/ProgressBar';
import {
    MOCK_PRACTICE_TESTS,
    DIFFICULTY_CONFIG,
    SUBJECT_CONFIG,
    QUESTION_TYPE_CONFIG,
    formatDuration,
    formatRelativeTime,
    getScoreColor,
    getScoreGrade,
} from '../components/tests';

/**
 * TestDetail Page — Xem chi tiết bài thi trước khi bắt đầu
 * Route: /tests/:id
 *
 * Sections:
 * 1. Breadcrumb + Back button
 * 2. Hero section (title, subject, difficulty, description)
 * 3. Test configuration overview
 * 4. Best score & performance stats
 * 5. Past attempts history
 * 6. Start test CTA
 */
export default function TestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);

    const test = MOCK_PRACTICE_TESTS.find(t => t.id === id);

    if (!test) {
        return (
            <div className="flex h-screen bg-base-200 overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-base-300/50 rounded-3xl flex items-center justify-center mb-4">
                            <Icon name="FileX" size="3xl" className="text-base-content/30" />
                        </div>
                        <h2 className="text-xl font-black text-base-content mb-2">Không tìm thấy bài thi</h2>
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

    const subject = SUBJECT_CONFIG[test.subjectKey] || {};
    const difficulty = DIFFICULTY_CONFIG[test.difficulty] || {};
    const hasAttempts = test.attemptsCount > 0;
    const grade = getScoreGrade(test.bestScore);

    // Mock attempt history
    const mockAttempts = hasAttempts ? [
        { id: 1, date: '2026-02-18T10:30:00Z', score: test.bestScore, time: Math.floor(test.timeLimitMinutes * 0.8 * 60), correct: Math.floor(test.totalQuestions * (test.bestScore / 100)), total: test.totalQuestions },
        ...(test.attemptsCount > 1 ? [{ id: 2, date: '2026-02-16T14:00:00Z', score: test.averageScore, time: Math.floor(test.timeLimitMinutes * 0.9 * 60), correct: Math.floor(test.totalQuestions * (test.averageScore / 100)), total: test.totalQuestions }] : []),
        ...(test.attemptsCount > 2 ? [{ id: 3, date: '2026-02-14T09:15:00Z', score: Math.max(40, test.averageScore - 10), time: Math.floor(test.timeLimitMinutes * 60), correct: Math.floor(test.totalQuestions * ((test.averageScore - 10) / 100)), total: test.totalQuestions }] : []),
    ] : [];

    const handleStartTest = () => {
        navigate(`/tests/${id}/take`);
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
                            <Link
                                to="/tests"
                                className="btn btn-circle btn-ghost btn-sm"
                            >
                                <Icon name="ArrowLeft" size="md" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <Link to="/tests" className="text-xs text-base-content/40 hover:text-blue-500 font-bold transition-colors">
                                        Thi Thử
                                    </Link>
                                    <Icon name="ChevronRight" size="xs" className="text-base-content/30" />
                                    <span className="text-xs text-base-content/60 font-bold">{test.title}</span>
                                </div>
                                <h2 className="text-xl font-black text-base-content">{test.title}</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="btn btn-ghost btn-sm rounded-xl gap-2 font-bold">
                                <Icon name="Share2" size="sm" />
                                Chia sẻ
                            </button>
                            <button className="btn btn-ghost btn-sm rounded-xl gap-2 font-bold">
                                <Icon name="Settings" size="sm" />
                                Chỉnh sửa
                            </button>
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
                            <div className={`h-32 bg-gradient-to-r ${subject.gradient || 'from-blue-500 to-violet-500'} relative overflow-hidden`}>
                                {/* Decorative Patterns */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-4 left-8 w-20 h-20 border-4 border-white rounded-full" />
                                    <div className="absolute bottom-2 right-12 w-32 h-32 border-4 border-white rounded-full" />
                                    <div className="absolute top-8 right-40 w-12 h-12 border-4 border-white rounded-lg rotate-45" />
                                </div>
                                <div className="absolute bottom-4 left-8 text-5xl opacity-30">{subject.icon}</div>
                            </div>

                            <div className="p-6 -mt-8 relative z-10">
                                {/* Subject & Difficulty Badge Row */}
                                <div className="flex items-center gap-2 mb-3 ml-1">
                                    <span className="badge badge-lg bg-base-100 shadow-md font-bold gap-1 text-sm">
                                        {subject.icon} {subject.label}
                                    </span>
                                    <span className={`badge badge-lg font-bold ${difficulty.badge}`}>
                                        {difficulty.label}
                                    </span>
                                    {test.status === 'draft' && (
                                        <span className="badge badge-lg badge-ghost font-bold gap-1">
                                            <Icon name="FileEdit" size="xs" /> Nháp
                                        </span>
                                    )}
                                </div>

                                {/* Title & Description */}
                                <h1 className="text-2xl font-black text-base-content mb-2">{test.title}</h1>
                                <p className="text-sm text-base-content/60 leading-relaxed mb-6">{test.description}</p>

                                {/* Quick Info Chips */}
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
                                        <div className={`${difficulty.bg} rounded-xl p-4 text-center border border-current/10`}>
                                            <Icon name="Signal" size="lg" className={`${difficulty.color} mx-auto mb-2`} />
                                            <p className={`text-xl font-black ${difficulty.color}`}>{difficulty.label}</p>
                                            <p className="text-xs text-base-content/50 font-bold uppercase">Độ khó</p>
                                        </div>
                                        <div className="bg-green-500/5 rounded-xl p-4 text-center border border-green-500/10">
                                            <Icon name="PlayCircle" size="lg" className="text-green-500 mx-auto mb-2" />
                                            <p className="text-xl font-black text-base-content">{test.attemptsCount}</p>
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
                                        {hasAttempts && (
                                            <span className="badge badge-sm badge-primary ml-2">{test.attemptsCount} lượt</span>
                                        )}
                                    </h3>

                                    {hasAttempts ? (
                                        <div className="space-y-3">
                                            {mockAttempts.map((attempt, idx) => {
                                                const attemptGrade = getScoreGrade(attempt.score);
                                                return (
                                                    <motion.div
                                                        key={attempt.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                                        className="flex items-center gap-4 p-4 bg-base-200/40 rounded-xl hover:bg-base-200/70 transition-colors group"
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
                                                                Lần thi {test.attemptsCount - idx}
                                                                {idx === 0 && <span className="text-xs text-yellow-500 ml-2 font-black">Tốt nhất</span>}
                                                            </p>
                                                            <p className="text-xs text-base-content/50">
                                                                {formatRelativeTime(attempt.date)} · {Math.floor(attempt.time / 60)}p {attempt.time % 60}s
                                                            </p>
                                                        </div>

                                                        {/* Correct / Total */}
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-xs font-bold text-base-content/50">
                                                                {attempt.correct}/{attempt.total} câu đúng
                                                            </p>
                                                        </div>

                                                        {/* Score */}
                                                        <div className="text-right">
                                                            <p className={`text-lg font-black ${getScoreColor(attempt.score)}`}>
                                                                {attempt.score.toFixed(1)}%
                                                            </p>
                                                            <p className={`text-[10px] font-bold ${attemptGrade.color}`}>
                                                                {attemptGrade.label}
                                                            </p>
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

                                    {hasAttempts ? (
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
                                                            className={test.bestScore >= 80 ? 'stroke-green-500' : test.bestScore >= 50 ? 'stroke-blue-500' : 'stroke-red-500'}
                                                            strokeLinecap="round"
                                                            initial={{ strokeDashoffset: 377 }}
                                                            animate={{ strokeDashoffset: 377 - (377 * test.bestScore) / 100 }}
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
                                                            {test.bestScore}%
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
                                                    <span className={`font-black ${getScoreColor(test.bestScore)}`}>{test.bestScore}%</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl">
                                                    <span className="text-xs font-bold text-base-content/60 flex items-center gap-2">
                                                        <Icon name="TrendingUp" size="sm" className="text-blue-500" /> Điểm trung bình
                                                    </span>
                                                    <span className={`font-black ${getScoreColor(test.averageScore)}`}>{test.averageScore}%</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl">
                                                    <span className="text-xs font-bold text-base-content/60 flex items-center gap-2">
                                                        <Icon name="PlayCircle" size="sm" className="text-green-500" /> Lượt thi
                                                    </span>
                                                    <span className="font-black text-base-content">{test.attemptsCount}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl">
                                                    <span className="text-xs font-bold text-base-content/60 flex items-center gap-2">
                                                        <Icon name="Calendar" size="sm" className="text-violet-500" /> Thi gần nhất
                                                    </span>
                                                    <span className="font-black text-base-content text-xs">{formatRelativeTime(test.lastAttemptAt)}</span>
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
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
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
                                Bạn sẽ có <strong>{formatDuration(test.timeLimitMinutes)}</strong> để hoàn thành <strong>{test.totalQuestions} câu hỏi</strong>.
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
                                <span className={`font-black ${difficulty.color}`}>{difficulty.label}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)} className="btn flex-1 btn-ghost rounded-xl font-bold">
                                Để sau
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStartTest}
                                className="btn flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold shadow-lg gap-2"
                            >
                                <Icon name="Play" size="sm" />
                                Bắt đầu
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
