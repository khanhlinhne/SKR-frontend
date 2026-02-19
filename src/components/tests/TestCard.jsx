import { Link } from 'react-router-dom';
import * as motion from 'motion/react-client';
import Icon from '../icons/Icon';
import { DIFFICULTY_CONFIG, SUBJECT_CONFIG, QUESTION_TYPE_CONFIG, formatDuration, formatRelativeTime, getScoreColor } from './utils';

/**
 * TestCard - Card hiển thị bài thi thử (Grid view)
 * Maps to: lrn_practice_tests table
 */
export default function TestCard({ test, index, variants }) {
    const subject = SUBJECT_CONFIG[test.subjectKey] || {};
    const difficulty = DIFFICULTY_CONFIG[test.difficulty] || {};
    const hasAttempts = test.attemptsCount > 0;

    return (
        <motion.div variants={variants}>
            <Link to={`/tests/${test.id}`} className="block">
                <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="bg-base-100 rounded-2xl shadow-lg border border-base-300 hover:shadow-xl hover:border-blue-500/30 transition-all overflow-hidden group h-full"
                >
                    {/* Gradient Header */}
                    <div className={`h-2 bg-gradient-to-r ${subject.gradient || 'from-blue-500 to-violet-500'}`} />

                    <div className="p-5">
                        {/* Top Row: Subject + Difficulty */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{subject.icon}</span>
                                <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
                                    {subject.label}
                                </span>
                            </div>
                            <span className={`badge badge-sm font-bold ${difficulty.badge}`}>
                                {difficulty.label}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-black text-base-content mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                            {test.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-base-content/60 mb-4 line-clamp-2">
                            {test.description}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-base-200/60 rounded-xl px-3 py-2 text-center">
                                <p className="text-sm font-black text-base-content">{test.totalQuestions}</p>
                                <p className="text-[10px] text-base-content/50 font-bold uppercase">Câu hỏi</p>
                            </div>
                            <div className="bg-base-200/60 rounded-xl px-3 py-2 text-center">
                                <p className="text-sm font-black text-base-content">{formatDuration(test.timeLimitMinutes)}</p>
                                <p className="text-[10px] text-base-content/50 font-bold uppercase">Thời gian</p>
                            </div>
                            <div className="bg-base-200/60 rounded-xl px-3 py-2 text-center">
                                <p className="text-sm font-black text-base-content">{test.attemptsCount}</p>
                                <p className="text-[10px] text-base-content/50 font-bold uppercase">Lượt thi</p>
                            </div>
                        </div>

                        {/* Score Section */}
                        {hasAttempts ? (
                            <div className="flex items-center justify-between p-3 bg-base-200/40 rounded-xl mb-4">
                                <div className="flex items-center gap-2">
                                    <Icon name="Trophy" size="sm" className="text-yellow-500" />
                                    <span className="text-xs font-bold text-base-content/60">Điểm tốt nhất</span>
                                </div>
                                <span className={`text-lg font-black ${getScoreColor(test.bestScore)}`}>
                                    {test.bestScore}%
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-3 bg-blue-500/5 rounded-xl mb-4 border border-blue-500/10">
                                <Icon name="Sparkles" size="sm" className="text-blue-500 mr-2" />
                                <span className="text-xs font-bold text-blue-500">Chưa thi — Bắt đầu ngay!</span>
                            </div>
                        )}

                        {/* Question Types */}
                        <div className="flex flex-wrap gap-1 mb-4">
                            {test.questionTypes.map((type) => {
                                const qt = QUESTION_TYPE_CONFIG[type];
                                return qt ? (
                                    <span key={type} className="badge badge-sm badge-ghost gap-1 font-bold">
                                        <Icon name={qt.icon} size="xs" className={qt.color} />
                                        {qt.label}
                                    </span>
                                ) : null;
                            })}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-base-300">
                            <span className="text-xs text-base-content/40 font-medium">
                                {hasAttempts ? formatRelativeTime(test.lastAttemptAt) : 'Mới tạo'}
                            </span>
                            <motion.span
                                className="flex items-center gap-1 text-xs font-bold text-blue-500 group-hover:gap-2 transition-all"
                            >
                                {hasAttempts ? 'Thi lại' : 'Bắt đầu'}
                                <Icon name="ArrowRight" size="xs" />
                            </motion.span>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

/**
 * TestListItem - List item cho bài thi (List view)
 */
export function TestListItem({ test, variants }) {
    const subject = SUBJECT_CONFIG[test.subjectKey] || {};
    const difficulty = DIFFICULTY_CONFIG[test.difficulty] || {};
    const hasAttempts = test.attemptsCount > 0;

    return (
        <motion.div variants={variants}>
            <Link to={`/tests/${test.id}`} className="block">
                <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="bg-base-100 rounded-2xl shadow-md border border-base-300 hover:shadow-lg hover:border-blue-500/30 transition-all p-4 group"
                >
                    <div className="flex items-center gap-4">
                        {/* Subject Icon */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.gradient || 'from-blue-500 to-violet-500'} flex items-center justify-center text-xl shrink-0`}>
                            {subject.icon}
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-base-content text-sm truncate group-hover:text-blue-500 transition-colors">
                                    {test.title}
                                </h3>
                                <span className={`badge badge-xs font-bold ${difficulty.badge}`}>{difficulty.label}</span>
                            </div>
                            <p className="text-xs text-base-content/50 truncate">{test.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-6 shrink-0">
                            <div className="text-center">
                                <p className="text-sm font-black text-base-content">{test.totalQuestions}</p>
                                <p className="text-[10px] text-base-content/50 font-bold">Câu hỏi</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-base-content">{formatDuration(test.timeLimitMinutes)}</p>
                                <p className="text-[10px] text-base-content/50 font-bold">Thời gian</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-base-content">{test.attemptsCount}</p>
                                <p className="text-[10px] text-base-content/50 font-bold">Lượt thi</p>
                            </div>
                            {hasAttempts && (
                                <div className="text-center">
                                    <p className={`text-sm font-black ${getScoreColor(test.bestScore)}`}>{test.bestScore}%</p>
                                    <p className="text-[10px] text-base-content/50 font-bold">Tốt nhất</p>
                                </div>
                            )}
                        </div>

                        {/* Action */}
                        <div className="shrink-0">
                            <span className="btn btn-sm btn-ghost text-blue-500 gap-1 font-bold group-hover:bg-blue-500/10">
                                {hasAttempts ? 'Thi lại' : 'Bắt đầu'}
                                <Icon name="ArrowRight" size="xs" />
                            </span>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}
