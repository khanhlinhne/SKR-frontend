import { AnimatePresence, motion } from 'motion/react';
import {
    CheckCircle2,
    ExternalLink,
    FileText,
    HelpCircle,
    Link2,
    MessageSquare,
    PlayCircle,
    Video,
    X,
} from 'lucide-react';
import DocumentPreviewContent from '@/features/expert/components/DocumentPreviewContent';
import { getYouTubeEmbedUrl } from '@/features/expert/components/curriculum-detail/curriculumDetailUtils';

export function VideoPreviewModal({ previewVideo, onClose }) {
    return (
        <AnimatePresence>
            {previewVideo && (
                <div className="modal modal-open" style={{ zIndex: 110 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="modal-box max-w-3xl w-11/12 rounded-2xl border border-base-300 shadow-2xl"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-black">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
                                    <PlayCircle className="h-4 w-4 text-white" />
                                </div>
                                {'Xem trước Video'}
                            </h3>
                            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-xl ring-1 ring-white/10">
                            {getYouTubeEmbedUrl(previewVideo.videoUrl) ? (
                                <iframe
                                    src={getYouTubeEmbedUrl(previewVideo.videoUrl)}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    title={previewVideo.videoTitle}
                                />
                            ) : (
                                <video src={previewVideo.videoUrl} controls className="h-full w-full">
                                    {'Trình duyệt không hỗ trợ phát video.'}
                                </video>
                            )}
                        </div>

                        <div className="mt-4 rounded-xl border border-base-300 bg-base-200/50 p-3">
                            <h4 className="flex items-center gap-2 text-base font-bold">
                                <Video className="h-4 w-4 text-blue-500" />
                                {previewVideo.videoTitle}
                            </h4>
                            {previewVideo.videoDescription && (
                                <p className="mt-1.5 text-sm leading-relaxed text-base-content/60">
                                    {previewVideo.videoDescription}
                                </p>
                            )}
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-base-content/40">
                                <Link2 className="h-3 w-3" />
                                <span className="truncate">{previewVideo.videoUrl}</span>
                            </div>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={onClose} />
                </div>
            )}
        </AnimatePresence>
    );
}

export function DocumentPreviewModal({ previewDocument, onClose }) {
    return (
        <AnimatePresence>
            {previewDocument && (
                <div className="modal modal-open" style={{ zIndex: 110 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="modal-box max-w-4xl w-11/12 rounded-2xl border border-base-300 shadow-2xl"
                        style={{ maxHeight: '88vh' }}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-black">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                                    <FileText className="h-4 w-4 text-white" />
                                </div>
                                {'Xem trước Tài liệu'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewDocument.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 text-emerald-600"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {'Mở link gốc'}
                                </a>
                                <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-base-300 bg-base-200 shadow-inner" style={{ height: '62vh' }}>
                            <DocumentPreviewContent document={previewDocument} />
                        </div>

                        <div className="mt-4 rounded-xl border border-base-300 bg-base-200/50 p-3">
                            <h4 className="flex items-center gap-2 text-base font-bold">
                                <FileText className="h-4 w-4 text-emerald-500" />
                                {previewDocument.documentTitle}
                            </h4>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                {previewDocument.fileName && (
                                    <span className="rounded-full bg-base-300/80 px-2 py-0.5 text-xs font-bold text-base-content/60">
                                        {previewDocument.fileName}
                                    </span>
                                )}
                                {previewDocument.fileType && (
                                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold uppercase text-emerald-600">
                                        {previewDocument.fileType}
                                    </span>
                                )}
                            </div>
                            {previewDocument.documentDescription && (
                                <p className="mt-1.5 text-sm text-base-content/60">
                                    {previewDocument.documentDescription}
                                </p>
                            )}
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={onClose} />
                </div>
            )}
        </AnimatePresence>
    );
}

export function QuestionPreviewModal({ previewQuestion, onClose }) {
    return (
        <AnimatePresence>
            {previewQuestion && (
                <div className="modal modal-open" style={{ zIndex: 110 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="modal-box max-w-lg rounded-2xl border border-base-300 shadow-2xl"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-black">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                                    <HelpCircle className="h-4 w-4 text-white" />
                                </div>
                                {'Xem trước Câu hỏi'}
                            </h3>
                            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="rounded-xl border border-base-300 bg-gradient-to-br from-base-200/80 to-base-200/40 p-5 shadow-inner">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                                        previewQuestion.difficultyLevel === 'easy'
                                            ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20'
                                            : previewQuestion.difficultyLevel === 'hard'
                                                ? 'bg-red-500/10 text-red-600 ring-1 ring-red-500/20'
                                                : 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20'
                                    }`}
                                >
                                    {previewQuestion.difficultyLevel === 'easy'
                                        ? 'Dễ'
                                        : previewQuestion.difficultyLevel === 'hard'
                                            ? 'Khó'
                                            : 'Trung bình'}
                                </span>
                                <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-black text-violet-600 ring-1 ring-violet-500/20">
                                    {previewQuestion.questionType === 'multiple_choice'
                                        ? 'Trắc nghiệm'
                                        : previewQuestion.questionType === 'true_false'
                                            ? 'Đúng/Sai'
                                            : 'Điền từ'}
                                </span>
                            </div>

                            <h4 className="mb-4 text-base font-bold leading-relaxed">
                                {previewQuestion.questionText}
                            </h4>

                            {previewQuestion.options?.length > 0 && (
                                <div className="space-y-2">
                                    {previewQuestion.options.map((option, index) => (
                                        <div
                                            key={option.optionId || index}
                                            className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                                                option.isCorrect
                                                    ? 'border-emerald-500 bg-emerald-500/5 shadow-sm shadow-emerald-500/10'
                                                    : 'border-base-300 bg-base-100 hover:border-base-content/20'
                                            }`}
                                        >
                                            <div
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors ${
                                                    option.isCorrect
                                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                                        : 'bg-base-300 text-base-content/50'
                                                }`}
                                            >
                                                {option.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                                            </div>
                                            <span className={`text-sm ${option.isCorrect ? 'font-bold text-emerald-700' : 'text-base-content/70'}`}>
                                                {option.optionText}
                                            </span>
                                            {option.isCorrect && (
                                                <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600">
                                                    {'Đáp án đúng'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {previewQuestion.questionExplanation && (
                                <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5">
                                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-blue-600">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        {'Giải thích đáp án'}
                                    </p>
                                    <p className="text-sm leading-relaxed text-base-content/70">
                                        {previewQuestion.questionExplanation}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-[10px] font-medium text-base-content/30">
                                {'Đây là giao diện xem trước câu hỏi mà học viên sẽ thấy.'}
                            </p>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={onClose} />
                </div>
            )}
        </AnimatePresence>
    );
}

export function CurriculumToast({ toast }) {
    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50 max-w-sm"
                >
                    <div
                        className={`relative overflow-hidden rounded-[1.75rem] border shadow-2xl ${
                            toast.type === 'error'
                                ? 'border-red-400/20 bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 text-white'
                                : 'border-violet-400/20 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white'
                        }`}
                    >
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                        <div className="relative flex items-start gap-3 p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20">
                                <span className="text-2xl leading-none">{toast.owl || '🦉'}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black leading-tight">{toast.title}</p>
                                        {toast.message && (
                                            <p className="mt-1 text-xs leading-relaxed text-white/80">
                                                {toast.message}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toast.onClose}
                                        className="btn btn-ghost btn-xs btn-circle border-none bg-white/0 text-white/70 hover:bg-white/10 hover:text-white"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                {toast.cta && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/80 ring-1 ring-white/10">
                                        {toast.cta}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
