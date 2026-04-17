import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    ClipboardCheck,
    Eye,
    ExternalLink,
    FileText,
    HelpCircle,
    Loader2,
    Pencil,
    PlayCircle,
    Plus,
    Save,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';

export default function LessonContentPanel(props) {
    const {
        open,
        chapterId,
        lessonId,
        lesson,
        lessonContent,
        loadingContent,
        saving,
        resolvedLessonType,
        lessonQuestions,
        lessonFlashcardSets,
        lessonAssignment,
        lessonQuizTimeLimitMinutes,
        quizTimeLimitDraft,
        isQuizTimeLimitDirty,
        onQuizTimeLimitDraftChange,
        onOpenAddVideo,
        onPreviewVideo,
        onDeleteVideo,
        onOpenAddDocument,
        onPreviewDocument,
        onDeleteDocument,
        onOpenAddQuestion,
        onOpenEditQuestion,
        onPreviewQuestion,
        onDeleteQuestion,
        onOpenAssignmentBuilder,
        onSaveQuizTiming,
        onCreateFlashcardSet,
        onOpenFlashcardCardModal,
        onDeleteFlashcardItem,
        formatDurationMinutes,
        getFlashcardSetItems,
        createFlashcardDraftFromItem,
    } = props;

    const isFlashcardLesson = resolvedLessonType === 'flashcard';
    const isQuizLesson = resolvedLessonType === 'quiz';
    const isAssignmentLesson = resolvedLessonType === 'assignment';

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                >
                    <div className="ml-11 mr-3 mb-2 mt-1 space-y-3 rounded-xl border border-base-300 bg-base-200/50 p-3">
                        {loadingContent ? (
                            <div className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-base-content/55">
                                <span className="text-lg leading-none">Owl</span>
                                <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                                <span>Dang mo noi dung bai hoc...</span>
                            </div>
                        ) : (
                            <>
                                {!isFlashcardLesson && !isQuizLesson && !isAssignmentLesson && (
                                    <>
                                        <div>
                                            <div className="mb-1.5 flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-xs font-black text-blue-600">
                                                    <PlayCircle className="h-3.5 w-3.5" />
                                                    {'Video'} ({lessonContent?.videos?.length || 0})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onOpenAddVideo({ chapterId, lessonId });
                                                    }}
                                                    className="btn btn-xs btn-ghost gap-1 rounded-lg text-blue-600"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Them
                                                </button>
                                            </div>
                                            {(lessonContent?.videos || []).map((video) => (
                                                <div key={video.videoId} className="mb-1 flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-2 py-1.5">
                                                    <PlayCircle className="h-4 w-4 shrink-0 text-blue-500" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-bold">{video.videoTitle}</p>
                                                        <p className="truncate text-[10px] text-base-content/40">{video.videoUrl}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            onPreviewVideo(video);
                                                        }}
                                                        className="btn btn-ghost btn-xs btn-circle text-blue-500 hover:bg-blue-500/10"
                                                        title="Xem truoc"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </button>
                                                    <a href={video.videoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs btn-circle">
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteVideo(chapterId, lessonId, video.videoId)}
                                                        className="btn btn-ghost btn-xs btn-circle text-red-500"
                                                        disabled={saving}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(lessonContent?.videos?.length || 0) === 0 && (
                                                <p className="text-[10px] italic text-base-content/30">Chua co video</p>
                                            )}
                                        </div>

                                        <div>
                                            <div className="mb-1.5 flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-xs font-black text-emerald-600">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {'Tai lieu'} ({lessonContent?.documents?.length || 0})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onOpenAddDocument({ chapterId, lessonId });
                                                    }}
                                                    className="btn btn-xs btn-ghost gap-1 rounded-lg text-emerald-600"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Them
                                                </button>
                                            </div>
                                            {(lessonContent?.documents || []).map((document) => (
                                                <div key={document.documentId} className="mb-1 flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-2 py-1.5">
                                                    <FileText className="h-4 w-4 shrink-0 text-emerald-500" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-bold">{document.documentTitle}</p>
                                                        <p className="text-[10px] text-base-content/40">
                                                            {document.fileType || 'file'}
                                                            {document.fileName ? ` - ${document.fileName}` : ''}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            onPreviewDocument(document);
                                                        }}
                                                        className="btn btn-ghost btn-xs btn-circle text-emerald-500 hover:bg-emerald-500/10"
                                                        title="Xem truoc"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </button>
                                                    <a href={document.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs btn-circle">
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteDocument(chapterId, lessonId, document.documentId)}
                                                        className="btn btn-ghost btn-xs btn-circle text-red-500"
                                                        disabled={saving}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(lessonContent?.documents?.length || 0) === 0 && (
                                                <p className="text-[10px] italic text-base-content/30">Chua co tai lieu</p>
                                            )}
                                        </div>

                                        <div>
                                            <div className="mb-1.5 flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-xs font-black text-amber-600">
                                                    <HelpCircle className="h-3.5 w-3.5" />
                                                    {'Cau hoi'} ({lessonContent?.questions?.length || 0})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onOpenAddQuestion({ chapterId, lessonId });
                                                    }}
                                                    className="btn btn-xs btn-ghost gap-1 rounded-lg text-amber-600"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Them
                                                </button>
                                            </div>
                                            {(lessonContent?.questions || []).map((question) => (
                                                <div key={question.questionId} className="mb-1 rounded-lg border border-base-300 bg-base-100 px-2 py-1.5">
                                                    <div className="flex items-start gap-2">
                                                        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold">{question.questionText}</p>
                                                            <div className="mt-0.5 flex items-center gap-2">
                                                                <span className="badge badge-xs badge-ghost">{question.questionType}</span>
                                                                <span className="badge badge-xs badge-ghost">{question.difficultyLevel}</span>
                                                            </div>
                                                            {question.options?.length > 0 && (
                                                                <div className="mt-1 space-y-0.5">
                                                                    {question.options.map((option) => (
                                                                        <div
                                                                            key={option.optionId}
                                                                            className={`flex items-center gap-1 text-[11px] ${
                                                                                option.isCorrect ? 'font-bold text-emerald-600' : 'text-base-content/60'
                                                                            }`}
                                                                        >
                                                                            {option.isCorrect
                                                                                ? <CheckCircle2 className="h-3 w-3" />
                                                                                : <span className="inline-block h-3 w-3 rounded-full border border-base-content/20" />}
                                                                            {option.optionText}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                onOpenEditQuestion({ chapterId, lessonId, question });
                                                            }}
                                                            className="btn btn-ghost btn-xs btn-circle text-blue-500 hover:bg-blue-500/10"
                                                            title="Chinh sua cau hoi"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                onPreviewQuestion(question);
                                                            }}
                                                            className="btn btn-ghost btn-xs btn-circle text-amber-500 hover:bg-amber-500/10"
                                                            title="Xem truoc"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onDeleteQuestion(chapterId, lessonId, question.questionId)}
                                                            className="btn btn-ghost btn-xs btn-circle text-red-500"
                                                            disabled={saving}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(lessonContent?.questions?.length || 0) === 0 && (
                                                <p className="text-[10px] italic text-base-content/30">Chua co cau hoi</p>
                                            )}
                                        </div>
                                    </>
                                )}
                                {isAssignmentLesson && (
                                    <div className="space-y-3">
                                        <div className="overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 shadow-sm">
                                            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-rose-700">
                                                        <ClipboardCheck className="h-3.5 w-3.5" />
                                                        Assignment lesson
                                                    </div>
                                                    <h4 className="mt-3 text-sm font-black text-base-content">
                                                        {lessonAssignment?.title || lesson.lessonName || 'Assignment'}
                                                    </h4>
                                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-base-content/60">
                                                        {lessonAssignment?.description || 'Tao de bai, huong dan nop bai va rubric de hoc vien lam bai trong phan learn.'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            onOpenAssignmentBuilder({
                                                                chapterId,
                                                                lessonId,
                                                                lessonName: lesson.lessonName,
                                                                initialValue: lessonAssignment,
                                                            });
                                                        }}
                                                        className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-rose-500 to-orange-500 font-bold text-white shadow-lg shadow-rose-500/20"
                                                    >
                                                        <ClipboardCheck className="h-4 w-4" />
                                                        {lessonAssignment ? 'Chinh assignment' : 'Tao assignment'}
                                                    </button>
                                                    <Link
                                                        to="/expert/assignments"
                                                        className="btn btn-sm rounded-xl border border-rose-200 bg-white font-bold text-rose-600"
                                                        onClick={(event) => event.stopPropagation()}
                                                    >
                                                        Xem bai nop
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="grid gap-3 border-t border-rose-100/80 bg-white/80 p-4 sm:grid-cols-2 xl:grid-cols-4">
                                                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-700/70">Tong diem</p>
                                                    <p className="mt-1 text-2xl font-black text-base-content">{lessonAssignment?.maxScore || 100}</p>
                                                </div>
                                                <div className="rounded-xl border border-rose-100 bg-white p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Tieu chi</p>
                                                    <p className="mt-1 text-2xl font-black text-base-content">{lessonAssignment?.rubricCriteria?.length || 0}</p>
                                                </div>
                                                <div className="rounded-xl border border-rose-100 bg-white p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Nguon tao</p>
                                                    <p className="mt-1 text-base font-black capitalize text-base-content">{lessonAssignment?.sourceType || 'manual'}</p>
                                                </div>
                                                <div className="rounded-xl border border-rose-100 bg-white p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Trang thai</p>
                                                    <p className="mt-1 text-base font-black text-base-content">{lessonAssignment ? 'San sang nop bai' : 'Chua soan de'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {lessonAssignment ? (
                                            <div className="grid gap-3 lg:grid-cols-[1.1fr,0.9fr]">
                                                <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                                                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Huong dan cho hoc vien</p>
                                                    <p className="mt-3 text-sm leading-6 text-base-content/75">
                                                        {lessonAssignment.instructions || lessonAssignment.submissionFormat || 'Chua co huong dan chi tiet.'}
                                                    </p>
                                                    {lessonAssignment.reviewFocus && (
                                                        <div className="mt-4 rounded-xl bg-base-200/60 px-3 py-3">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Trong tam AI review</p>
                                                            <p className="mt-2 text-xs leading-5 text-base-content/65">{lessonAssignment.reviewFocus}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Rubric</p>
                                                        <span className="rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">
                                                            {`${lessonAssignment.maxScore || 100} diem`}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 space-y-2.5">
                                                        {(lessonAssignment.rubricCriteria || []).map((criterion) => (
                                                            <div key={criterion.criterionId} className="rounded-xl border border-base-300 bg-base-200/30 px-3 py-3">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-sm font-bold text-base-content">{criterion.title}</p>
                                                                    <span className="text-xs font-bold text-base-content/45">{`${criterion.maxPoints} diem`}</span>
                                                                </div>
                                                                {criterion.description && (
                                                                    <p className="mt-1 text-xs leading-5 text-base-content/60">{criterion.description}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-rose-300 bg-white px-4 py-5 text-center">
                                                <p className="text-sm font-bold text-base-content">Lesson nay chua co de bai assignment.</p>
                                                <p className="mt-1 text-xs text-base-content/55">Mo modal o tren de nhap de bai thu cong hoac nho AI tao rubric.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isQuizLesson && (
                                    <div className="space-y-3">
                                        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm">
                                            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                                                        <HelpCircle className="h-3.5 w-3.5" />
                                                        Quiz lesson
                                                    </div>
                                                    <h4 className="mt-3 text-sm font-black text-base-content">{lesson.lessonName || 'Bai kiem tra'}</h4>
                                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-base-content/60">
                                                        Hoc vien se vao lesson nay trong phan learn de lam bai truc tiep.
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            onOpenAddQuestion({ chapterId, lessonId });
                                                        }}
                                                        className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white shadow-lg shadow-amber-500/20"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Them cau hoi
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid gap-3 border-t border-amber-100/80 bg-white/80 p-4 sm:grid-cols-2 xl:grid-cols-4">
                                                <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700/70">Tong cau hoi</p>
                                                    <p className="mt-1 text-2xl font-black text-base-content">{lessonQuestions.length}</p>
                                                </div>
                                                <div className="rounded-xl border border-amber-100 bg-white p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Trac nghiem / dung sai</p>
                                                    <p className="mt-1 text-2xl font-black text-base-content">
                                                        {lessonQuestions.filter((question) => question.questionType !== 'fill_blank').length}
                                                    </p>
                                                </div>
                                                <div className="rounded-xl border border-amber-100 bg-white p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Dien tu</p>
                                                    <p className="mt-1 text-2xl font-black text-base-content">
                                                        {lessonQuestions.filter((question) => question.questionType === 'fill_blank').length}
                                                    </p>
                                                </div>
                                                <div className={`rounded-xl border p-3 ${lessonQuizTimeLimitMinutes > 0 ? 'border-amber-100 bg-white' : 'border-dashed border-amber-200 bg-white/70'}`}>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Thoi gian lam bai</p>
                                                    <p className="mt-1 text-base font-black text-base-content">
                                                        {lessonQuizTimeLimitMinutes > 0 ? formatDurationMinutes(lessonQuizTimeLimitMinutes) : 'Chua gioi han'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="border-t border-amber-100/80 bg-white/85 p-4">
                                                <div className="rounded-2xl border border-amber-100 bg-white p-4">
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700/70">Thiet lap thoi gian</p>
                                                            <h5 className="mt-1 text-sm font-black text-base-content">Gioi han thoi gian lam bai</h5>
                                                            <p className="mt-1 max-w-2xl text-xs leading-5 text-base-content/60">
                                                                Nhap so phut neu ban muon learner thay dong ho va duoc tu dong nop bai khi het gio.
                                                            </p>
                                                        </div>
                                                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
                                                            <label className="form-control sm:min-w-[14rem]">
                                                                <span className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Thoi gian (phut)</span>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max="300"
                                                                    step="1"
                                                                    value={quizTimeLimitDraft}
                                                                    onChange={(event) => onQuizTimeLimitDraftChange(event.target.value)}
                                                                    onClick={(event) => event.stopPropagation()}
                                                                    placeholder="De trong neu khong gioi han"
                                                                    className="input input-bordered input-sm rounded-xl font-medium"
                                                                />
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    void onSaveQuizTiming(chapterId, lesson);
                                                                }}
                                                                disabled={saving || !isQuizTimeLimitDirty}
                                                                className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white shadow-lg shadow-amber-500/20"
                                                            >
                                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                                Luu thoi gian
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-[11px] text-amber-800">
                                                        {lessonQuizTimeLimitMinutes > 0
                                                            ? `Dang luu: ${formatDurationMinutes(lessonQuizTimeLimitMinutes)}.`
                                                            : 'Hien tai bai kiem tra nay chua co gioi han thoi gian.'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-1.5 flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-xs font-black text-amber-600">
                                                    <HelpCircle className="h-3.5 w-3.5" />
                                                    {'Ngan hang cau hoi'} ({lessonQuestions.length || 0})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onOpenAddQuestion({ chapterId, lessonId });
                                                    }}
                                                    className="btn btn-xs btn-ghost gap-1 rounded-lg text-amber-600"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Them
                                                </button>
                                            </div>
                                            {lessonQuestions.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-amber-200 bg-base-100 px-4 py-6 text-center">
                                                    <HelpCircle className="mx-auto h-6 w-6 text-amber-500" />
                                                    <p className="mt-2 text-xs font-bold text-base-content/70">Bai kiem tra nay chua co cau hoi nao</p>
                                                    <p className="mt-1 text-[11px] text-base-content/45">Hay them cau hoi dau tien de hoc vien co the lam bai.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {lessonQuestions.map((question, questionIndex) => (
                                                        <div key={question.questionId} className="rounded-xl border border-base-300 bg-base-100 p-3">
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xs font-black text-amber-700">
                                                                    {questionIndex + 1}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="badge badge-xs badge-ghost">{question.questionType}</span>
                                                                        <span className="badge badge-xs badge-ghost">{question.difficultyLevel}</span>
                                                                        <span className="text-[10px] font-medium text-base-content/40">
                                                                            {`${question.options?.filter((option) => option.isCorrect).length || 0} dap an dung`}
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-2 text-xs font-bold leading-5 text-base-content">{question.questionText}</p>
                                                                    {question.options?.length > 0 && (
                                                                        <div className="mt-2 grid gap-1.5 lg:grid-cols-2">
                                                                            {question.options.map((option) => (
                                                                                <div
                                                                                    key={option.optionId}
                                                                                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] ${
                                                                                        option.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-base-300 bg-base-200/35 text-base-content/60'
                                                                                    }`}
                                                                                >
                                                                                    {option.isCorrect
                                                                                        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                                                                        : <span className="inline-block h-2.5 w-2.5 rounded-full border border-base-content/20" />}
                                                                                    <span className="truncate">{option.optionText}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {question.questionExplanation && (
                                                                        <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2 text-[11px] text-blue-700">
                                                                            <span className="font-bold">Giai thich:</span> {question.questionExplanation}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            onOpenEditQuestion({ chapterId, lessonId, question });
                                                                        }}
                                                                        className="btn btn-ghost btn-xs btn-circle text-blue-500 hover:bg-blue-500/10"
                                                                        title="Chinh sua cau hoi"
                                                                    >
                                                                        <Pencil className="h-3 w-3" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            onPreviewQuestion(question);
                                                                        }}
                                                                        className="btn btn-ghost btn-xs btn-circle text-amber-500 hover:bg-amber-500/10"
                                                                        title="Xem truoc"
                                                                    >
                                                                        <Eye className="h-3 w-3" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => onDeleteQuestion(chapterId, lessonId, question.questionId)}
                                                                        className="btn btn-ghost btn-xs btn-circle text-red-500"
                                                                        disabled={saving}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {isFlashcardLesson && (
                                    <div>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-xs font-black text-indigo-600">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                {'Flashcard'} ({lessonFlashcardSets.length})
                                            </span>
                                            {lessonFlashcardSets.length === 0 && (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        void onCreateFlashcardSet(chapterId, lesson);
                                                    }}
                                                    className="btn btn-xs btn-ghost gap-1 rounded-lg text-indigo-600"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Tao bo
                                                </button>
                                            )}
                                        </div>

                                        {lessonFlashcardSets.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-indigo-500/20 bg-base-100 px-3 py-4 text-center">
                                                <p className="text-xs font-bold text-base-content/70">Bai nay chua co bo flashcard nao</p>
                                                <p className="mt-1 text-[11px] text-base-content/45">Tao mot bo truoc, sau do them cac the mat truoc va mat sau.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {lessonFlashcardSets.map((set, setIndex) => {
                                                    const setId = set?.flashcardSetId || set?.id || `flashcard-set-${setIndex}`;
                                                    const setTitle = set?.setTitle || set?.title || `${lesson.lessonName} - Flashcard`;
                                                    const setItems = getFlashcardSetItems(set).filter((item) => (
                                                        item?.frontText
                                                        || item?.front
                                                        || item?.backText
                                                        || item?.back
                                                        || item?.frontImageUrl
                                                        || item?.frontImage
                                                        || item?.backImageUrl
                                                        || item?.backImage
                                                    ));
                                                    const totalCards = Number(set?.totalCards || set?.itemCount || setItems.length || 0);

                                                    return (
                                                        <div key={setId} className="rounded-xl border border-base-300 bg-base-100 p-3">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-xs font-black text-base-content">{setTitle}</p>
                                                                    <p className="text-[10px] font-medium text-base-content/45">{totalCards} the</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        onOpenFlashcardCardModal({
                                                                            mode: 'create',
                                                                            chapterId,
                                                                            lessonId,
                                                                            setId,
                                                                            setTitle,
                                                                            nextOrder: setItems.length,
                                                                        });
                                                                    }}
                                                                    className="btn btn-xs btn-ghost gap-1 rounded-lg text-indigo-600"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                    Them the
                                                                </button>
                                                            </div>

                                                            {setItems.length === 0 ? (
                                                                <p className="mt-2 text-[10px] italic text-base-content/35">Bo nay chua co the nao.</p>
                                                            ) : (
                                                                <div className="mt-3 space-y-2">
                                                                    {setItems.map((item, itemIndex) => {
                                                                        const itemId = item?.flashcardItemId || item?.id || null;
                                                                        const frontText = item?.frontText || item?.front || '';
                                                                        const backText = item?.backText || item?.back || '';
                                                                        const frontImageUrl = resolveFlashcardImageUrl(
                                                                            item?.frontImageUrl || item?.frontImage || item?.frontMediaUrl || item?.frontImagePath || '',
                                                                        );
                                                                        const backImageUrl = resolveFlashcardImageUrl(
                                                                            item?.backImageUrl || item?.backImage || item?.backMediaUrl || item?.backImagePath || '',
                                                                        );

                                                                        return (
                                                                            <div key={itemId || `${setId}-${itemIndex}`} className="rounded-xl border border-base-300 bg-base-200/35 p-3">
                                                                                <div className="mb-3 flex items-center justify-between gap-2">
                                                                                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-base-content/40">
                                                                                        {`The ${itemIndex + 1}`}
                                                                                    </span>
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(event) => {
                                                                                                event.stopPropagation();
                                                                                                onOpenFlashcardCardModal({
                                                                                                    mode: 'edit',
                                                                                                    chapterId,
                                                                                                    lessonId,
                                                                                                    setId,
                                                                                                    setTitle,
                                                                                                    itemId,
                                                                                                    initialCards: [createFlashcardDraftFromItem(item)],
                                                                                                });
                                                                                            }}
                                                                                            disabled={!itemId}
                                                                                            className="btn btn-xs btn-ghost gap-1 rounded-lg text-base-content/60 hover:text-indigo-600 disabled:bg-transparent"
                                                                                        >
                                                                                            <Pencil className="h-3 w-3" />
                                                                                            Sua
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(event) => {
                                                                                                event.stopPropagation();
                                                                                                void onDeleteFlashcardItem({
                                                                                                    chapterId,
                                                                                                    lessonId,
                                                                                                    setId,
                                                                                                    itemId,
                                                                                                });
                                                                                            }}
                                                                                            disabled={!itemId || saving}
                                                                                            className="btn btn-xs btn-ghost gap-1 rounded-lg text-base-content/60 hover:text-red-500 disabled:bg-transparent"
                                                                                        >
                                                                                            <Trash2 className="h-3 w-3" />
                                                                                            Xoa
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="grid gap-3 lg:grid-cols-2">
                                                                                    <div className="space-y-2">
                                                                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Mat truoc</p>
                                                                                        {frontImageUrl && (
                                                                                            <img
                                                                                                src={frontImageUrl}
                                                                                                alt="Flashcard front"
                                                                                                className="max-h-80 w-full rounded-lg border border-base-300 bg-base-200/40 object-contain object-center"
                                                                                            />
                                                                                        )}
                                                                                        <p className="text-xs font-medium text-base-content/80">{frontText || 'Khong co noi dung chu'}</p>
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Mat sau</p>
                                                                                        {backImageUrl && (
                                                                                            <img
                                                                                                src={backImageUrl}
                                                                                                alt="Flashcard back"
                                                                                                className="max-h-80 w-full rounded-lg border border-base-300 bg-base-200/40 object-contain object-center"
                                                                                            />
                                                                                        )}
                                                                                        <p className="text-xs font-medium text-base-content/80">{backText || 'Khong co noi dung chu'}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
