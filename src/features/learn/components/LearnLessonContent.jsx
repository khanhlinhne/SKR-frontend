import { useState } from 'react';
import { motion } from 'motion/react';
import {
    FileText,
    Download,
    MessageCircle,
    ThumbsUp,
    Bookmark,
    Share2,
    ChevronRight,
    Clock,
    Play,
    CheckCircle2,
    NotebookPen,
    HelpCircle,
    Loader2,
    ExternalLink,
    Eye,
    X,
} from 'lucide-react';
import DocumentPreviewContent from '@/features/expert/components/DocumentPreviewContent';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * LearnLessonContent - Content area below the video player
 * Shows lesson description, real resources (documents), real quiz questions, and notes.
 */
export default function LearnLessonContent({
    lesson,
    chapter,
    nextLesson,
    expertName,
    expertAvatar,
    gradient = 'from-blue-500 to-violet-500',
    onNext,
    onComplete,
    isCompleted = false,
    loadingContent = false,
}) {
    const typeLabels = {
        video: 'Video bài giảng',
        document: 'Tài liệu',
        flashcard: 'Flashcard',
        quiz: 'Bài kiểm tra',
    };

    const hasVideos = lesson?.videos?.length > 0;
    const hasDocuments = lesson?.documents?.length > 0;
    const hasQuestions = lesson?.questions?.length > 0;

    // Determine primary type based on content
    const primaryType = hasVideos ? 'video' : hasDocuments ? 'document' : hasQuestions ? 'quiz' : lesson?.type;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5 mt-5"
        >
            {/* Lesson title & actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-md bg-gradient-to-r ${gradient} text-white text-[10px] font-bold`}>
                            {typeLabels[primaryType] || 'Bài học'}
                        </span>
                        {lesson?.durationMinutes > 0 && (
                            <span className="text-[11px] text-base-content/40 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.durationMinutes} phút
                            </span>
                        )}
                        {hasVideos && (
                            <span className="text-[11px] text-blue-500 font-semibold">
                                {lesson.videos.length} video
                            </span>
                        )}
                        {hasDocuments && (
                            <span className="text-[11px] text-emerald-500 font-semibold">
                                {lesson.documents.length} tài liệu
                            </span>
                        )}
                        {hasQuestions && (
                            <span className="text-[11px] text-amber-500 font-semibold">
                                {lesson.questions.length} câu hỏi
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl font-black text-base-content">
                        {lesson?.title}
                    </h2>
                    <p className="text-sm text-base-content/50 font-medium mt-1">
                        {chapter?.title}
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="btn btn-sm btn-ghost gap-1.5 text-base-content/50 hover:text-base-content">
                        <Bookmark className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs font-bold">Lưu</span>
                    </button>
                    <button className="btn btn-sm btn-ghost gap-1.5 text-base-content/50 hover:text-base-content">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs font-bold">Chia sẻ</span>
                    </button>
                    <button
                        onClick={onComplete}
                        className={`btn btn-sm gap-1.5 rounded-xl font-bold ${isCompleted
                            ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                            : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none hover:shadow-lg'
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {isCompleted ? 'Đã hoàn thành' : 'Hoàn thành'}
                    </button>
                </div>
            </div>

            {/* Expert info */}
            {expertName && (
                <div className="flex items-center gap-3 p-4 bg-base-200/50 rounded-xl border border-base-300">
                    {expertAvatar ? (
                        <img src={expertAvatar} alt={expertName} className="w-10 h-10 rounded-full object-cover ring-2 ring-base-300" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center ring-2 ring-base-300">
                            <span className="text-white text-sm font-bold">{expertName?.charAt(0)}</span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-base-content">{expertName}</p>
                        <p className="text-xs text-base-content/50 font-medium">Giảng viên</p>
                    </div>
                </div>
            )}

            {/* Tabs section */}
            <ContentTabs lesson={lesson} gradient={gradient} loadingContent={loadingContent} />

            {/* Next lesson prompt */}
            {nextLesson && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4">
                    <button
                        onClick={onNext}
                        className="w-full flex items-center gap-4 p-4 bg-base-200/50 hover:bg-base-200 rounded-xl border border-base-300 transition-all group"
                    >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-[11px] text-base-content/40 font-bold uppercase tracking-wider">Bài tiếp theo</p>
                            <p className="text-sm font-bold text-base-content truncate">{nextLesson.title}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-base-content/30 group-hover:text-base-content/60 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}

// ─── Content Tabs ────────────────────────────────────────

function ContentTabs({ lesson, gradient, loadingContent }) {
    const hasDocuments = lesson?.documents?.length > 0;
    const hasQuestions = lesson?.questions?.length > 0;

    const tabs = [
        { id: 'description', label: 'Mô tả', icon: FileText },
        { id: 'resources', label: `Tài liệu${hasDocuments ? ` (${lesson.documents.length})` : ''}`, icon: Download },
        { id: 'questions', label: `Câu hỏi${hasQuestions ? ` (${lesson.questions.length})` : ''}`, icon: HelpCircle },
        { id: 'notes', label: 'Ghi chú', icon: NotebookPen },
        { id: 'discussion', label: 'Thảo luận', icon: MessageCircle },
    ];

    const [activeTab, setActiveTab] = useState('description');

    return (
        <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm">
            {/* Tab headers */}
            <div className="flex border-b border-base-300 overflow-x-auto">
                {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-bold transition-all relative whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'text-blue-600'
                                    : 'text-base-content/40 hover:text-base-content/60'
                                }`}
                        >
                            <TabIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r ${gradient}`}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            <div className="p-5">
                {loadingContent ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-base-content/30 animate-spin" />
                        <span className="ml-2 text-sm text-base-content/40">Đang tải nội dung...</span>
                    </div>
                ) : (
                    <>
                        {activeTab === 'description' && <DescriptionTab lesson={lesson} />}
                        {activeTab === 'resources' && <ResourcesTab documents={lesson?.documents || []} />}
                        {activeTab === 'questions' && <QuestionsTab questions={lesson?.questions || []} gradient={gradient} />}
                        {activeTab === 'notes' && <NotesTab />}
                        {activeTab === 'discussion' && <DiscussionTab />}
                    </>
                )}
            </div>
        </div>
    );
}

function DescriptionTab({ lesson }) {
    return (
        <div className="space-y-4">
            {lesson?.description ? (
                <div className="prose prose-sm max-w-none text-base-content/70">
                    <p className="leading-relaxed whitespace-pre-line">{lesson.description}</p>
                </div>
            ) : (
                <p className="text-sm text-base-content/70 leading-relaxed">
                    Trong bài học này, bạn sẽ tìm hiểu chi tiết về <strong className="text-base-content">{lesson?.title}</strong>.
                    Nội dung được giảng viên trình bày một cách trực quan, dễ hiểu với nhiều ví dụ thực tế
                    giúp bạn nắm vững kiến thức cần thiết.
                </p>
            )}

            {/* Content summary badges */}
            <div className="flex flex-wrap gap-2">
                {lesson?.videos?.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-[11px] font-bold text-blue-600">
                        🎬 {lesson.videos.length} Video
                    </span>
                )}
                {lesson?.documents?.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-[11px] font-bold text-emerald-600">
                        📄 {lesson.documents.length} Tài liệu
                    </span>
                )}
                {lesson?.questions?.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-[11px] font-bold text-amber-600">
                        ❓ {lesson.questions.length} Câu hỏi
                    </span>
                )}
            </div>
        </div>
    );
}

function NotesTab() {
    const [note, setNote] = useState('');

    return (
        <div className="space-y-3">
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Viết ghi chú của bạn tại đây..."
                className="textarea textarea-bordered w-full h-32 text-sm rounded-xl bg-base-200/50 border-base-300 focus:border-blue-500 resize-none"
            />
            <div className="flex items-center justify-between">
                <p className="text-[11px] text-base-content/40 font-medium">Ghi chú được lưu tự động</p>
                <button className="btn btn-sm btn-primary rounded-xl font-bold text-xs">Lưu ghi chú</button>
            </div>
        </div>
    );
}

function ResourcesTab({ documents }) {
    const [previewDoc, setPreviewDoc] = useState(null);

    if (!documents || documents.length === 0) {
        return (
            <div className="text-center py-8">
                <FileText className="w-10 h-10 text-base-content/20 mx-auto mb-2" />
                <p className="text-sm text-base-content/40 font-medium">Chưa có tài liệu nào cho bài học này</p>
            </div>
        );
    }

    const fileIcons = {
        pdf: '📕',
        doc: '📘',
        docx: '📘',
        ppt: '📙',
        pptx: '📙',
        xls: '📗',
        xlsx: '📗',
        zip: '📦',
        rar: '📦',
    };

    function formatSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function handlePreview(doc) {
        setPreviewDoc(doc);
    }

    return (
        <>
            <div className="space-y-2">
                {documents.map((doc) => {
                    const fileUrl = doc.fileUrl?.startsWith('http')
                        ? doc.fileUrl
                        : `${API_BASE}${doc.fileUrl}`;

                    return (
                        <div
                            key={doc.documentId}
                            className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors group cursor-pointer"
                            onClick={() => handlePreview({ ...doc, resolvedUrl: fileUrl })}
                        >
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-lg">
                                {fileIcons[doc.fileType?.toLowerCase()] || '📄'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-base-content truncate">
                                    {doc.documentTitle || doc.fileName}
                                </p>
                                <div className="flex items-center gap-2">
                                    {doc.fileType && (
                                        <span className="text-[10px] text-base-content/40 font-semibold uppercase">
                                            {doc.fileType}
                                        </span>
                                    )}
                                    {doc.fileSizeBytes && (
                                        <span className="text-[10px] text-base-content/40">
                                            {formatSize(doc.fileSizeBytes)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePreview({ ...doc, resolvedUrl: fileUrl });
                                    }}
                                    className="btn btn-xs btn-ghost text-base-content/40 hover:text-blue-500"
                                    title="Xem trước"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                </button>
                                <a
                                    href={fileUrl}
                                    download
                                    onClick={(e) => e.stopPropagation()}
                                    className="btn btn-xs btn-ghost text-base-content/40 hover:text-blue-500"
                                    title="Tải về"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-base-300">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-lg">
                                    {fileIcons[previewDoc.fileType?.toLowerCase()] || '📄'}
                                </span>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-base-content truncate">
                                        {previewDoc.documentTitle || previewDoc.fileName}
                                    </h3>
                                    <p className="text-[10px] text-base-content/40">
                                        {previewDoc.fileType?.toUpperCase()}
                                        {previewDoc.fileSizeBytes ? ` • ${formatSize(previewDoc.fileSizeBytes)}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewDoc.resolvedUrl}
                                    download
                                    className="btn btn-sm btn-ghost gap-1.5 text-base-content/50 hover:text-base-content"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="text-xs font-bold">Tải về</span>
                                </a>
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="btn btn-sm btn-circle btn-ghost"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Preview Body */}
                        <div className="overflow-auto" style={{ height: '70vh' }}>
                            <DocumentPreviewContent
                                document={previewDoc}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function QuestionsTab({ questions, gradient }) {
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState({});

    if (!questions || questions.length === 0) {
        return (
            <div className="text-center py-8">
                <HelpCircle className="w-10 h-10 text-base-content/20 mx-auto mb-2" />
                <p className="text-sm text-base-content/40 font-medium">Chưa có câu hỏi nào cho bài học này</p>
            </div>
        );
    }

    const handleSelectAnswer = (questionId, optionId) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleCheckAnswer = (questionId) => {
        setShowResults(prev => ({ ...prev, [questionId]: true }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-base-content">{questions.length} câu hỏi ôn tập</p>
            </div>

            {questions.map((q, idx) => (
                <div key={q.questionId} className="bg-base-200/50 rounded-xl p-4 border border-base-300">
                    <div className="flex items-start gap-3 mb-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} text-white text-xs font-bold flex-shrink-0`}>
                            {idx + 1}
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-base-content leading-relaxed">
                                {q.questionText}
                            </p>
                            {q.difficultyLevel && (
                                <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    q.difficultyLevel === 'easy' ? 'bg-green-100 text-green-700' :
                                    q.difficultyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {q.difficultyLevel === 'easy' ? 'Dễ' : q.difficultyLevel === 'medium' ? 'Trung bình' : 'Khó'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Options */}
                    {q.options && q.options.length > 0 && (
                        <div className="space-y-2 ml-10">
                            {q.options
                                .sort((a, b) => (a.optionOrder ?? 0) - (b.optionOrder ?? 0))
                                .map((opt) => {
                                    const isSelected = selectedAnswers[q.questionId] === opt.optionId;
                                    const showResult = showResults[q.questionId];
                                    const isCorrect = opt.isCorrect;

                                    let optionClass = 'bg-base-100 hover:bg-base-200 border-base-300';
                                    if (showResult && isCorrect) {
                                        optionClass = 'bg-green-50 border-green-400 ring-1 ring-green-400';
                                    } else if (showResult && isSelected && !isCorrect) {
                                        optionClass = 'bg-red-50 border-red-400 ring-1 ring-red-400';
                                    } else if (isSelected) {
                                        optionClass = 'bg-blue-50 border-blue-400 ring-1 ring-blue-400';
                                    }

                                    return (
                                        <button
                                            key={opt.optionId}
                                            onClick={() => !showResult && handleSelectAnswer(q.questionId, opt.optionId)}
                                            disabled={showResult}
                                            className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${optionClass}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-base-300'
                                                }`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <span className="text-base-content font-medium">{opt.optionText}</span>
                                                {showResult && isCorrect && (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
                                                )}
                                            </div>
                                            {showResult && isSelected && !isCorrect && opt.optionExplanation && (
                                                <p className="text-xs text-red-500 mt-1 ml-7">{opt.optionExplanation}</p>
                                            )}
                                        </button>
                                    );
                                })}
                        </div>
                    )}

                    {/* Check answer button */}
                    {q.options?.length > 0 && !showResults[q.questionId] && (
                        <div className="ml-10 mt-3">
                            <button
                                onClick={() => handleCheckAnswer(q.questionId)}
                                disabled={!selectedAnswers[q.questionId]}
                                className={`btn btn-sm rounded-xl font-bold text-xs ${
                                    selectedAnswers[q.questionId]
                                        ? `bg-gradient-to-r ${gradient} text-white border-none`
                                        : 'btn-disabled'
                                }`}
                            >
                                Kiểm tra đáp án
                            </button>
                        </div>
                    )}

                    {/* Explanation */}
                    {showResults[q.questionId] && q.questionExplanation && (
                        <div className="ml-10 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs font-bold text-blue-700 mb-1">💡 Giải thích</p>
                            <p className="text-xs text-blue-600 leading-relaxed">{q.questionExplanation}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function DiscussionTab() {
    return (
        <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 text-base-content/20 mx-auto mb-2" />
            <p className="text-sm text-base-content/40 font-medium">Tính năng thảo luận sẽ sớm ra mắt</p>
            <p className="text-xs text-base-content/30 mt-1">Bạn sẽ có thể trao đổi với giảng viên và bạn học tại đây</p>
        </div>
    );
}
