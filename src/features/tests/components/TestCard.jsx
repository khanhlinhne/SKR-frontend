import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';
import {
    DIFFICULTY_CONFIG,
    QUESTION_TYPE_CONFIG,
    DEFAULT_GRADIENT,
    DEFAULT_ICON,
    formatDuration,
    formatRelativeTime,
    getScoreColor,
} from './utils';

function DeleteButton({ onDelete, test, deleting, compact = false }) {
    if (!onDelete) return null;

    return (
        <button
            type="button"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete(test);
            }}
            disabled={deleting}
            className={compact
                ? 'btn btn-sm btn-circle btn-ghost text-red-500 hover:bg-red-50'
                : 'absolute right-4 top-5 z-10 btn btn-sm btn-circle bg-base-100/95 border border-base-300 text-red-500 shadow-sm hover:bg-red-50 hover:border-red-200'}
            title="Xóa bài thi"
        >
            {deleting ? <span className="loading loading-spinner loading-xs" /> : <Icon name="Trash2" size="sm" />}
        </button>
    );
}

function EditButton({ onEdit, test, editing, compact = false }) {
    if (!onEdit) return null;

    return (
        <button
            type="button"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onEdit(test);
            }}
            disabled={editing}
            className={compact
                ? 'btn btn-sm btn-circle btn-ghost text-blue-500 hover:bg-blue-50'
                : 'absolute right-16 top-5 z-10 btn btn-sm btn-circle bg-base-100/95 border border-base-300 text-blue-500 shadow-sm hover:bg-blue-50 hover:border-blue-200'}
            title="Chỉnh sửa bài thi"
        >
            {editing ? <span className="loading loading-spinner loading-xs" /> : <Icon name="Pencil" size="sm" />}
        </button>
    );
}

export default function TestCard({ test, variants, onDelete, deleting = false, onEdit, editing = false }) {
    const difficulty = DIFFICULTY_CONFIG[test.difficultyLevels?.[0]] || {};
    const hasAttempts = (test.attemptsCount || 0) > 0;
    const animationProps = variants ? { variants, initial: 'hidden', animate: 'visible' } : {};

    return (
        <motion.div {...animationProps} className="relative">
            <EditButton onEdit={onEdit} test={test} editing={editing} />
            <DeleteButton onDelete={onDelete} test={test} deleting={deleting} />

            <Link to={`/tests/${test.practiceTestId}`} className="block">
                <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="bg-base-100 rounded-2xl shadow-lg border border-base-300 hover:shadow-xl hover:border-blue-500/30 transition-all overflow-hidden group h-full"
                >
                    <div className={`h-2 bg-gradient-to-r ${DEFAULT_GRADIENT}`} />

                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3 pr-12">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{DEFAULT_ICON}</span>
                                <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
                                    Thi thử
                                </span>
                            </div>
                            {difficulty.badge && (
                                <span className={`badge badge-sm font-bold ${difficulty.badge}`}>
                                    {difficulty.label}
                                </span>
                            )}
                        </div>

                        <h3 className="text-base font-black text-base-content mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                            {test.testTitle}
                        </h3>

                        <p className="text-xs text-base-content/60 mb-4 line-clamp-2">
                            {test.testDescription || 'Bài thi thử'}
                        </p>

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
                                <p className="text-sm font-black text-base-content">{test.attemptsCount || 0}</p>
                                <p className="text-[10px] text-base-content/50 font-bold uppercase">Lượt thi</p>
                            </div>
                        </div>

                        {hasAttempts ? (
                            <div className="flex items-center justify-between p-3 bg-base-200/40 rounded-xl mb-4">
                                <div className="flex items-center gap-2">
                                    <Icon name="Trophy" size="sm" className="text-yellow-500" />
                                    <span className="text-xs font-bold text-base-content/60">Điểm tốt nhất</span>
                                </div>
                                <span className={`text-lg font-black ${getScoreColor(test.bestScore)}`}>
                                    {test.bestScore != null ? `${Number(test.bestScore).toFixed(1)}%` : '—'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-3 bg-blue-500/5 rounded-xl mb-4 border border-blue-500/10">
                                <Icon name="Sparkles" size="sm" className="text-blue-500 mr-2" />
                                <span className="text-xs font-bold text-blue-500">Chưa thi - Bắt đầu ngay!</span>
                            </div>
                        )}

                        {test.questionTypes?.length > 0 && (
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
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-base-300">
                            <span className="text-xs text-base-content/40 font-medium">
                                {hasAttempts ? formatRelativeTime(test.lastAttemptAtUtc) : 'Mới tạo'}
                            </span>
                            <motion.span className="flex items-center gap-1 text-xs font-bold text-blue-500 group-hover:gap-2 transition-all">
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

export function TestListItem({ test, variants, onDelete, deleting = false, onEdit, editing = false }) {
    const difficulty = DIFFICULTY_CONFIG[test.difficultyLevels?.[0]] || {};
    const hasAttempts = (test.attemptsCount || 0) > 0;
    const animationProps = variants ? { variants, initial: 'hidden', animate: 'visible' } : {};

    return (
        <motion.div {...animationProps}>
            <Link to={`/tests/${test.practiceTestId}`} className="block">
                <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="bg-base-100 rounded-2xl shadow-md border border-base-300 hover:shadow-lg hover:border-blue-500/30 transition-all p-4 group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${DEFAULT_GRADIENT} flex items-center justify-center text-xl shrink-0`}>
                            {DEFAULT_ICON}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-base-content text-sm truncate group-hover:text-blue-500 transition-colors">
                                    {test.testTitle}
                                </h3>
                                {difficulty.badge && (
                                    <span className={`badge badge-xs font-bold ${difficulty.badge}`}>{difficulty.label}</span>
                                )}
                            </div>
                            <p className="text-xs text-base-content/50 truncate">{test.testDescription || 'Bài thi thử'}</p>
                        </div>

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
                                <p className="text-sm font-black text-base-content">{test.attemptsCount || 0}</p>
                                <p className="text-[10px] text-base-content/50 font-bold">Lượt thi</p>
                            </div>
                            {hasAttempts && (
                                <div className="text-center">
                                    <p className={`text-sm font-black ${getScoreColor(test.bestScore)}`}>
                                        {test.bestScore != null ? `${Number(test.bestScore).toFixed(1)}%` : '—'}
                                    </p>
                                    <p className="text-[10px] text-base-content/50 font-bold">Tốt nhất</p>
                                </div>
                            )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                            <EditButton onEdit={onEdit} test={test} editing={editing} compact />
                            <DeleteButton onDelete={onDelete} test={test} deleting={deleting} compact />
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
