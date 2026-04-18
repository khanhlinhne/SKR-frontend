import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardCheck, Loader2, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { assignmentApi } from '@/shared/api';
import { useCurrentUserProfile } from '@/shared/user';

function ScorePill({ score = 0, maxScore = 100 }) {
    const percent = Math.round((score / Math.max(1, maxScore)) * 100);
    const colorClass = percent >= 80
        ? 'bg-emerald-500/10 text-emerald-600'
        : percent >= 60
            ? 'bg-amber-500/10 text-amber-600'
            : 'bg-rose-500/10 text-rose-600';

    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-black ${colorClass}`}>
            <Trophy className="h-4 w-4" />
            {`${score}/${maxScore}`}
        </span>
    );
}

export default function LearnAssignmentFlow({
    courseId,
    courseTitle = '',
    lesson,
    chapter,
    nextLesson,
    gradient = 'from-violet-500 to-purple-500',
    onComplete,
    onNext,
    isCompleted = false,
    loadingContent = false,
}) {
    const { profile } = useCurrentUserProfile({ fetchOnMount: false });
    const [assignment, setAssignment] = useState(lesson?.assignment || null);
    const [submission, setSubmission] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [viewMode, setViewMode] = useState('detail');
    const [loadingState, setLoadingState] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const lessonKey = useMemo(
        () => `${courseId}:${chapter?.chapterId || ''}:${lesson?.lessonId || ''}`,
        [chapter?.chapterId, courseId, lesson?.lessonId],
    );

    useEffect(() => {
        let cancelled = false;

        const loadAssignmentState = async () => {
            if (!courseId || !chapter?.chapterId || !lesson?.lessonId) {
                setAssignment(null);
                setSubmission(null);
                setAnswerText('');
                return;
            }

            try {
                setLoadingState(true);
                setError('');
                const resolvedAssignment = lesson?.assignment
                    || await assignmentApi.getLessonAssignment(courseId, chapter.chapterId, lesson.lessonId);
                const mySubmission = await assignmentApi.getMySubmission(courseId, chapter.chapterId, lesson.lessonId);

                if (cancelled) {
                    return;
                }

                setAssignment(resolvedAssignment || null);
                setSubmission(mySubmission || null);
                setAnswerText(mySubmission?.answerText || '');
                setViewMode(mySubmission ? 'result' : 'detail');
            } catch (loadError) {
                if (cancelled) {
                    return;
                }

                setError(loadError?.message || 'Khong the tai assignment luc nay.');
            } finally {
                if (!cancelled) {
                    setLoadingState(false);
                }
            }
        };

        void loadAssignmentState();

        return () => {
            cancelled = true;
        };
    }, [chapter?.chapterId, courseId, lesson?.assignment, lesson?.lessonId, lessonKey]);

    const handleSubmit = async () => {
        if (!answerText.trim()) {
            setError('Hay nhap cau tra loi truoc khi nop bai.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            const nextSubmission = await assignmentApi.submitLessonAssignment(
                courseId,
                chapter.chapterId,
                lesson.lessonId,
                {
                    assignment,
                    answerText: answerText.trim(),
                    courseTitle,
                    chapterTitle: chapter?.title,
                    lessonTitle: lesson?.title,
                    learner: {
                        learnerId: profile?.userId,
                        learnerName: profile?.name,
                        learnerAvatarUrl: profile?.avatarUrl,
                    },
                },
            );

            setSubmission(nextSubmission);
            setViewMode('result');
            onComplete?.();
        } catch (submitError) {
            setError(submitError?.message || 'Khong the nop assignment luc nay.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingContent || loadingState) {
        return (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-10 shadow-xl">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                </div>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center shadow-xl">
                <p className="text-lg font-black text-base-content">Assignment nay chua duoc soan de bai</p>
                <p className="mt-2 text-sm text-base-content/50">Expert can them de bai va rubric truoc khi hoc vien co the nop bai.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
            <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
            <div className="border-b border-base-300 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-rose-600">
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            Assignment
                        </div>
                        <h2 className="mt-3 text-2xl font-black text-base-content">{assignment.title || lesson?.title}</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-base-content/65">
                            {assignment.description || 'Hoan thanh bai tap nay va nop cau tra loi de AI cham theo rubric da duoc expert dat truoc.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-bold text-base-content/60">
                            {chapter?.title || 'Chapter'}
                        </span>
                        <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600">
                            {`${assignment.rubricCriteria?.length || 0} tieu chi`}
                        </span>
                        <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-bold text-base-content/60">
                            {`${assignment.maxScore || 100} diem`}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.05fr,0.95fr]">
                <div className="space-y-5">
                    <div className="rounded-3xl border border-base-300 bg-base-200/35 p-5">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Yeu cau bai lam</p>
                        <p className="mt-3 text-sm leading-7 text-base-content/75">
                            {assignment.instructions || assignment.submissionFormat || 'Tra loi bang van ban.'}
                        </p>
                        {assignment.reviewFocus && (
                            <div className="mt-4 rounded-2xl bg-base-100 px-4 py-3">
                                <div className="flex items-center gap-2 text-sm font-black text-base-content">
                                    <Sparkles className="h-4 w-4 text-violet-500" />
                                    AI se review ky phan nay
                                </div>
                                <p className="mt-2 text-sm leading-6 text-base-content/65">{assignment.reviewFocus}</p>
                            </div>
                        )}
                    </div>

                    {viewMode === 'result' && submission ? (
                        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-5 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-600">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        AI da cham bai
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-base-content/70">
                                        {submission.summary || 'Bai nop da duoc luu va cham diem theo rubric.'}
                                    </p>
                                </div>
                                <ScorePill score={submission.score} maxScore={submission.maxScore} />
                            </div>

                            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Diem theo rubric</p>
                                    <div className="mt-3 space-y-2.5">
                                        {(submission.rubricScores || []).map((criterion) => (
                                            <div key={criterion.criterionId} className="rounded-2xl bg-base-200/50 px-3 py-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold text-base-content">{criterion.criterionTitle}</p>
                                                    <span className="text-xs font-bold text-base-content/45">
                                                        {`${criterion.awardedPoints}/${criterion.maxPoints}`}
                                                    </span>
                                                </div>
                                                {criterion.feedback && (
                                                    <p className="mt-1 text-xs leading-5 text-base-content/60">{criterion.feedback}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-base-300 bg-white p-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Diem manh</p>
                                        <div className="mt-3 space-y-2">
                                            {(submission.strengths || []).length > 0 ? (
                                                submission.strengths.map((item) => (
                                                    <div key={item} className="rounded-xl bg-emerald-500/8 px-3 py-2 text-sm text-base-content/75">
                                                        {item}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-base-content/50">AI chua tra ve diem manh cu the.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-base-300 bg-white p-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Can cai thien</p>
                                        <div className="mt-3 space-y-2">
                                            {(submission.improvements || []).length > 0 ? (
                                                submission.improvements.map((item) => (
                                                    <div key={item} className="rounded-xl bg-amber-500/8 px-3 py-2 text-sm text-base-content/75">
                                                        {item}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-base-content/50">AI chua tra ve de xuat cai thien cu the.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-black text-base-content">Cau tra loi cua ban</p>
                                    <p className="mt-1 text-xs text-base-content/55">Nop bai bang van ban. Ban co the nop lai de AI cham ban cap nhat moi.</p>
                                </div>
                                {isCompleted && (
                                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-600">
                                        Da hoan thanh lesson
                                    </span>
                                )}
                            </div>
                            <textarea
                                rows={12}
                                value={answerText}
                                onChange={(event) => {
                                    setAnswerText(event.target.value);
                                    if (error) {
                                        setError('');
                                    }
                                }}
                                placeholder="Nhap cau tra loi, phan tich, doan code hoac lap luan cua ban..."
                                className="textarea textarea-bordered min-h-[18rem] w-full rounded-3xl resize-y"
                            />
                            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-base-content/45">
                                <span>{`${answerText.trim().length} ky tu`}</span>
                                <span>{assignment.submissionFormat}</span>
                            </div>
                        </div>
                    )}

                    <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Bai da nop</p>
                        <div className="mt-3 rounded-2xl bg-base-200/45 p-4">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-base-content/75">
                                {submission?.answerText || answerText || 'Chua co noi dung nop bai.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-base-content">Rubric cham diem</p>
                            <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-rose-600">
                                {`${assignment.maxScore || 100} diem`}
                            </span>
                        </div>
                        <div className="mt-4 space-y-3">
                            {(assignment.rubricCriteria || []).map((criterion) => (
                                <div key={criterion.criterionId} className="rounded-2xl border border-base-300 bg-base-200/30 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-bold text-base-content">{criterion.title}</p>
                                        <span className="text-xs font-bold text-base-content/45">{`${criterion.maxPoints} diem`}</span>
                                    </div>
                                    {criterion.description && (
                                        <p className="mt-2 text-sm leading-6 text-base-content/65">{criterion.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
                        <p className="text-sm font-black text-base-content">Hanh dong</p>
                        <div className="mt-4 space-y-3">
                            {viewMode === 'result' && submission ? (
                                <button
                                    type="button"
                                    onClick={() => setViewMode('detail')}
                                    className="btn w-full rounded-2xl border-none bg-base-200 font-bold text-base-content"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Chinh sua va nop lai
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="btn w-full rounded-2xl border-none bg-gradient-to-r from-rose-500 to-orange-500 font-bold text-white shadow-lg shadow-rose-500/20"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                                    {submitting ? 'Dang nop va cham bai...' : 'Nop assignment'}
                                </button>
                            )}

                            {viewMode === 'detail' && submission && (
                                <button
                                    type="button"
                                    onClick={() => setViewMode('result')}
                                    className="btn w-full rounded-2xl border border-base-300 bg-white font-bold text-base-content"
                                >
                                    Xem ket qua AI gan nhat
                                </button>
                            )}

                            {nextLesson && viewMode === 'result' && (
                                <button
                                    type="button"
                                    onClick={onNext}
                                    className="btn w-full rounded-2xl border-none bg-gradient-to-r from-violet-600 to-purple-600 font-bold text-white shadow-lg shadow-violet-500/20"
                                >
                                    Bai tiep theo
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
