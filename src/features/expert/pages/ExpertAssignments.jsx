import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
    BookOpen,
    ClipboardCheck,
    Filter,
    Loader2,
    Search,
    Sparkles,
    Star,
    Trophy,
    UserRound,
} from 'lucide-react';
import { ExpertLayout } from '@/features/expert/components';
import { assignmentApi } from '@/shared/api';
import { summarizeAnswer } from '@/features/assignment/utils/assignmentModel';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function formatDateTime(value) {
    if (!value) {
        return 'Chưa rõ thời gian';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Chưa rõ thời gian';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function ScoreBadge({ score = 0, maxScore = 100 }) {
    const percent = Math.round((score / Math.max(1, maxScore)) * 100);
    const colorClass = percent >= 80
        ? 'bg-emerald-500/10 text-emerald-600'
        : percent >= 60
            ? 'bg-amber-500/10 text-amber-600'
            : 'bg-rose-500/10 text-rose-600';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ${colorClass}`}>
            <Trophy className="h-3.5 w-3.5" />
            {`${score}/${maxScore}`}
        </span>
    );
}

export default function ExpertAssignments() {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadSubmissions = async () => {
            try {
                setLoading(true);
                setError('');
                const items = await assignmentApi.listExpertSubmissions({
                    status: filterStatus,
                    search: searchQuery.trim(),
                });
                if (cancelled) {
                    return;
                }

                const sorted = [...items].sort((a, b) => (
                    new Date(b.submittedAtUtc).getTime() - new Date(a.submittedAtUtc).getTime()
                ));
                setSubmissions(sorted);
                setSelectedSubmission((current) => {
                    if (current) {
                        return sorted.find((item) => item.submissionId === current.submissionId) || sorted[0] || null;
                    }
                    return sorted[0] || null;
                });
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError?.message || 'Không thể tải danh sách bài nộp assignment.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadSubmissions();

        return () => {
            cancelled = true;
        };
    }, [filterStatus, searchQuery]);

    useEffect(() => {
        let cancelled = false;

        const loadDetail = async () => {
            if (!selectedSubmission?.submissionId) {
                return;
            }

            try {
                setDetailLoading(true);
                const detail = await assignmentApi.getSubmissionDetail(selectedSubmission.submissionId);
                if (!cancelled && detail) {
                    setSelectedSubmission(detail);
                }
            } catch {
                // Keep the list payload when detail endpoint is unavailable.
            } finally {
                if (!cancelled) {
                    setDetailLoading(false);
                }
            }
        };

        void loadDetail();

        return () => {
            cancelled = true;
        };
    }, [selectedSubmission?.submissionId]);

    const stats = useMemo(() => {
        const total = submissions.length;
        const graded = submissions.filter((item) => item.status === 'graded').length;
        const averageScore = total > 0
            ? Math.round(submissions.reduce((sum, item) => sum + item.scorePercent, 0) / total)
            : 0;

        return [
            { label: 'Tổng bài nộp', value: total, tone: 'text-rose-600 bg-rose-500/10' },
            { label: 'Đã AI chấm', value: graded, tone: 'text-emerald-600 bg-emerald-500/10' },
            { label: 'Điểm trung bình', value: `${averageScore}%`, tone: 'text-amber-600 bg-amber-500/10' },
        ];
    }, [submissions]);

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-3 text-2xl font-black text-base-content lg:text-3xl">
                            <ClipboardCheck className="h-8 w-8 text-rose-500" />
                            Bài nộp assignment
                        </h1>
                        <p className="mt-1 text-sm text-base-content/60">
                            Xem bài làm của học viên, điểm AI, rubric breakdown và review trong một màn riêng.
                        </p>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="grid gap-3 md:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                            <p className="text-2xl font-black text-base-content">{stat.value}</p>
                            <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${stat.tone}`}>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>

                <motion.div variants={cardVariants} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="relative w-full min-w-0 flex-1 sm:min-w-[220px]">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Tìm theo học viên, khóa học, lesson hoặc nội dung bài nộp..."
                            className="input input-bordered w-full rounded-2xl bg-base-100 pl-11"
                        />
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                    </div>

                    <div className="flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-base-300 bg-base-100 p-1 sm:w-auto">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'graded', label: 'Đã chấm' },
                            { value: 'submitted', label: 'Chờ chấm' },
                        ].map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setFilterStatus(item.value)}
                                className={`btn btn-sm rounded-xl font-bold ${filterStatus === item.value
                                    ? 'border-none bg-gradient-to-r from-rose-500 to-orange-500 text-white'
                                    : 'btn-ghost'
                                }`}
                            >
                                <Filter className="h-3.5 w-3.5" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {error && (
                    <motion.div variants={cardVariants} className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </motion.div>
                )}

                <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
                    <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 shadow-xl">
                        <div className="border-b border-base-300 px-5 py-4">
                            <p className="text-sm font-black text-base-content">Danh sách bài nộp</p>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-7 w-7 animate-spin text-rose-500" />
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-base-300 px-4 py-10 text-center">
                                    <p className="text-sm font-bold text-base-content">Chưa có bài nộp assignment nào.</p>
                                    <p className="mt-2 text-xs text-base-content/55">Khi học viên nộp bài, danh sách và kết quả AI chấm sẽ xuất hiện ở đây.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {submissions.map((item) => {
                                        const isSelected = selectedSubmission?.submissionId === item.submissionId;

                                        return (
                                            <button
                                                key={item.submissionId}
                                                type="button"
                                                onClick={() => setSelectedSubmission(item)}
                                                className={`w-full rounded-2xl border p-4 text-left transition-all ${isSelected
                                                    ? 'border-rose-300 bg-rose-50/70 shadow-lg shadow-rose-500/10'
                                                    : 'border-base-300 bg-base-100 hover:border-rose-200 hover:bg-base-200/35'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 text-sm font-black text-base-content">
                                                            <UserRound className="h-4 w-4 text-base-content/45" />
                                                            <span className="truncate">{item.learnerName}</span>
                                                        </div>
                                                        <p className="mt-2 truncate text-sm font-bold text-base-content">{item.assignmentTitle || item.lessonTitle}</p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-base-content/50">
                                                            {item.courseTitle && (
                                                                <span className="inline-flex items-center gap-1">
                                                                    <BookOpen className="h-3.5 w-3.5" />
                                                                    {item.courseTitle}
                                                                </span>
                                                            )}
                                                            <span>{formatDateTime(item.submittedAtUtc)}</span>
                                                        </div>
                                                    </div>
                                                    <ScoreBadge score={item.score} maxScore={item.maxScore} />
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-base-content/65">
                                                    {summarizeAnswer(item.answerText)}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 shadow-xl">
                        <div className="border-b border-base-300 px-5 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-black text-base-content">Chi tiết bài nộp</p>
                                    <p className="mt-1 text-xs text-base-content/55">
                                        {selectedSubmission ? 'Xem bài làm của học viên và review từ AI.' : 'Chọn một bài nộp bên trái để xem chi tiết.'}
                                    </p>
                                </div>
                                {detailLoading && <Loader2 className="h-4 w-4 animate-spin text-rose-500" />}
                            </div>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
                            {!selectedSubmission ? (
                                <div className="rounded-2xl border border-dashed border-base-300 px-4 py-12 text-center">
                                    <p className="text-sm font-bold text-base-content">Chưa có bài nộp được chọn.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-5">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0">
                                                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-rose-600">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    AI review
                                                </div>
                                                <h2 className="mt-3 text-xl font-black text-base-content">
                                                    {selectedSubmission.assignmentTitle || selectedSubmission.lessonTitle || 'Assignment'}
                                                </h2>
                                                <p className="mt-2 text-sm leading-6 text-base-content/65">
                                                    {selectedSubmission.summary || 'AI đã chấm bài theo rubric và lưu kết quả tại đây.'}
                                                </p>
                                            </div>
                                            <ScoreBadge score={selectedSubmission.score} maxScore={selectedSubmission.maxScore} />
                                        </div>

                                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                                            <div className="rounded-2xl bg-white/80 p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Học viên</p>
                                                <p className="mt-2 text-sm font-bold text-base-content">{selectedSubmission.learnerName}</p>
                                            </div>
                                            <div className="rounded-2xl bg-white/80 p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Course / lesson</p>
                                                <p className="mt-2 text-sm font-bold text-base-content">{selectedSubmission.courseTitle || 'Không rõ khóa học'}</p>
                                                <p className="mt-1 text-xs text-base-content/55">{selectedSubmission.lessonTitle || selectedSubmission.assignmentTitle}</p>
                                            </div>
                                            <div className="rounded-2xl bg-white/80 p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Thời gian nộp</p>
                                                <p className="mt-2 text-sm font-bold text-base-content">{formatDateTime(selectedSubmission.submittedAtUtc)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
                                        <div className="rounded-3xl border border-base-300 bg-base-200/35 p-5">
                                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Nội dung học viên nộp</p>
                                            <div className="mt-4 rounded-2xl bg-base-100 p-4">
                                                <p className="whitespace-pre-wrap text-sm leading-7 text-base-content/75">
                                                    {selectedSubmission.answerText || 'Học viên chưa nộp nội dung.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="rounded-3xl border border-base-300 bg-base-100 p-5">
                                                <div className="flex items-center gap-2 text-sm font-black text-base-content">
                                                    <Star className="h-4 w-4 text-amber-500" />
                                                    Điểm theo rubric
                                                </div>
                                                <div className="mt-4 space-y-3">
                                                    {(selectedSubmission.rubricScores || []).map((criterion) => (
                                                        <div key={criterion.criterionId} className="rounded-2xl border border-base-300 bg-base-200/30 p-4">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="text-sm font-bold text-base-content">{criterion.criterionTitle}</p>
                                                                <span className="text-xs font-black text-base-content/45">
                                                                    {`${criterion.awardedPoints}/${criterion.maxPoints}`}
                                                                </span>
                                                            </div>
                                                            {criterion.feedback && (
                                                                <p className="mt-2 text-xs leading-5 text-base-content/65">{criterion.feedback}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="rounded-3xl border border-base-300 bg-base-100 p-5">
                                                <p className="text-sm font-black text-base-content">Nhận xét AI</p>
                                                <div className="mt-4 grid gap-4">
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Điểm mạnh</p>
                                                        <div className="mt-3 space-y-2">
                                                            {(selectedSubmission.strengths || []).length > 0 ? (
                                                                selectedSubmission.strengths.map((item) => (
                                                                    <div key={item} className="rounded-xl bg-emerald-500/8 px-3 py-2 text-sm text-base-content/75">
                                                                        {item}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-sm text-base-content/50">AI chưa trả về điểm mạnh cụ thể.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Cần cải thiện</p>
                                                        <div className="mt-3 space-y-2">
                                                            {(selectedSubmission.improvements || []).length > 0 ? (
                                                                selectedSubmission.improvements.map((item) => (
                                                                    <div key={item} className="rounded-xl bg-amber-500/8 px-3 py-2 text-sm text-base-content/75">
                                                                        {item}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-sm text-base-content/50">AI chưa trả về đề xuất cải thiện cụ thể.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </ExpertLayout>
    );
}
