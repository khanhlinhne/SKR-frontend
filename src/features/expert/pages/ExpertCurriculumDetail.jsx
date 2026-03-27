import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import courseApi from '@/shared/api/courseApi';
import AddQuestionModal from '@/features/expert/components/AddQuestionModal';
import DocumentPreviewContent from '@/features/expert/components/DocumentPreviewContent';
import {
    Plus,
    GripVertical,
    PlayCircle,
    FileText,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    Trash2,
    Pencil,
    Copy,
    Eye,
    Save,
    X,
    Check,
    FolderPlus,
    Layers,
    Clock,
    BookOpen,
    Loader2,
    AlertCircle,
    RefreshCw,
    ArrowLeft,
    GraduationCap,
    Hash,
    Upload,
    Link2,
    Video,
    MessageSquare,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react';

// ===== ANIMATION =====
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ===== LESSON TYPE CONFIG =====
const lessonTypeConfig = {
    video: { label: 'Video', icon: PlayCircle, color: 'text-blue-500 bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500' },
    document: { label: 'Tài liệu', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10', gradient: 'from-emerald-500 to-teal-500' },
    quiz: { label: 'Trắc nghiệm', icon: HelpCircle, color: 'text-amber-500 bg-amber-500/10', gradient: 'from-amber-500 to-orange-500' },
};

// ===== ADD CHAPTER MODAL =====
function AddChapterModal({ open, onClose, onSubmit, loading }) {
    const [form, setForm] = useState({ chapterName: '', chapterCode: '', chapterDescription: '' });

    useEffect(() => {
        if (open) setForm({ chapterName: '', chapterCode: '', chapterDescription: '' });
    }, [open]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.chapterName.trim()) return;
        onSubmit(form);
    };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box rounded-2xl border border-base-300 shadow-2xl"
            >
                <h3 className="font-black text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                        <FolderPlus className="w-4 h-4 text-white" />
                    </div>
                    Thêm chương mới
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">Mã chương <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: CH01"
                            value={form.chapterCode}
                            onChange={e => setForm(f => ({ ...f, chapterCode: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">Tên chương <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: Giới thiệu React"
                            value={form.chapterName}
                            onChange={e => setForm(f => ({ ...f, chapterName: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">Mô tả (tuỳ chọn)</span>
                        </label>
                        <textarea
                            placeholder="Mô tả nội dung chương..."
                            value={form.chapterDescription}
                            onChange={e => setForm(f => ({ ...f, chapterDescription: e.target.value }))}
                            className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none"
                            rows={2}
                        />
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">Hủy</button>
                        <button
                            type="submit"
                            disabled={loading || !form.chapterName.trim() || !form.chapterCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Thêm chương
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

// ===== ADD LESSON MODAL =====
function AddLessonModal({ open, onClose, onSubmit, loading, chapterName }) {
    const [form, setForm] = useState({ lessonName: '', lessonCode: '', lessonType: 'video' });

    useEffect(() => {
        if (open) setForm({ lessonName: '', lessonCode: '', lessonType: 'video' });
    }, [open]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.lessonName.trim()) return;
        onSubmit(form);
    };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box rounded-2xl border border-base-300 shadow-2xl"
            >
                <h3 className="font-black text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    Thêm bài giảng
                </h3>
                {chapterName && (
                    <p className="text-xs text-base-content/50 mt-1">
                        Vào chương: <span className="font-bold text-violet-600">{chapterName}</span>
                    </p>
                )}
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">Mã bài giảng <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: LS01"
                            value={form.lessonCode}
                            onChange={e => setForm(f => ({ ...f, lessonCode: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">Tên bài giảng <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: React là gì?"
                            value={form.lessonName}
                            onChange={e => setForm(f => ({ ...f, lessonName: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            autoFocus
                            required
                        />
                    </div>
                    {/* Lesson type selection */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">Loại bài giảng</span>
                        </label>
                        <div className="flex gap-2">
                            {Object.entries(lessonTypeConfig).map(([type, config]) => {
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, lessonType: type }))}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                                            form.lessonType === type
                                                ? `border-violet-500 ${config.color} shadow-md`
                                                : 'border-base-300 text-base-content/40 hover:border-base-content/20'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {config.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">Hủy</button>
                        <button
                            type="submit"
                            disabled={loading || !form.lessonName.trim() || !form.lessonCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Thêm bài
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

// ===== MAIN COMPONENT =====
export default function ExpertCurriculumDetail() {
    const { courseId } = useParams();

    // Data states
    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    // UI states
    const [expandedChapters, setExpandedChapters] = useState(new Set());
    const [editingTitle, setEditingTitle] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showAddChapter, setShowAddChapter] = useState(false);
    const [showAddLesson, setShowAddLesson] = useState(null); // chapterId or null
    const [toast, setToast] = useState(null);

    // Lesson content states
    const [selectedLesson, setSelectedLesson] = useState(null); // {chapterId, lessonId}
    const [lessonContent, setLessonContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [showAddVideo, setShowAddVideo] = useState(null); // {chapterId, lessonId}
    const [showAddDocument, setShowAddDocument] = useState(null);
    const [showAddQuestion, setShowAddQuestion] = useState(null);

    // Preview states
    const [previewVideo, setPreviewVideo] = useState(null);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewQuestion, setPreviewQuestion] = useState(null);

    // ===== TOAST HELPER =====
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ===== FETCH DATA =====
    const fetchCourseData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const courseRes = await courseApi.getById(courseId);
            const courseData = courseRes?.data || courseRes;
            setCourse(courseData);

            // Course detail endpoint may return chapters nested
            const chaptersFromCourse = courseData?.chapters || [];
            if (chaptersFromCourse.length > 0) {
                setChapters(chaptersFromCourse);
                // Auto-expand first chapter
                setExpandedChapters(new Set([chaptersFromCourse[0]?.chapterId || chaptersFromCourse[0]?.id]));
            } else {
                // Fallback: fetch chapters separately
                try {
                    const chapRes = await courseApi.getChapters(courseId);
                    const chapData = chapRes?.data || chapRes || [];
                    const chapArray = Array.isArray(chapData) ? chapData : chapData?.chapters || [];
                    setChapters(chapArray);
                    if (chapArray.length > 0) {
                        setExpandedChapters(new Set([chapArray[0]?.chapterId || chapArray[0]?.id]));
                    }
                } catch {
                    setChapters([]);
                }
            }
        } catch (err) {
            console.error('[CurriculumDetail] fetch error:', err);
            setError(err.response?.data?.message || 'Không thể tải thông tin khóa học.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    // ===== TOGGLE CHAPTER =====
    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            next.has(chapterId) ? next.delete(chapterId) : next.add(chapterId);
            return next;
        });
    };

    // ===== ADD CHAPTER =====
    const handleAddChapter = async (form) => {
        setSaving(true);
        try {
            const payload = {
                chapterCode: form.chapterCode,
                chapterName: form.chapterName,
                chapterDescription: form.chapterDescription || undefined,
                displayOrder: chapters.length,
            };
            await courseApi.createChapter(courseId, payload);
            showToast(`Đã thêm chương "${form.chapterName}"`);
            setShowAddChapter(false);
            await fetchCourseData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Thêm chương thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== DELETE CHAPTER =====
    const handleDeleteChapter = async (chapter) => {
        const chId = chapter.chapterId || chapter.id;
        if (!window.confirm(`Xóa chương "${chapter.chapterName}"? Tất cả bài giảng trong chương sẽ bị xóa.`)) return;

        setSaving(true);
        try {
            await courseApi.deleteChapter(courseId, chId);
            showToast(`Đã xóa chương "${chapter.chapterName}"`);
            setChapters(prev => prev.filter(c => (c.chapterId || c.id) !== chId));
        } catch (err) {
            showToast(err.response?.data?.message || 'Xóa chương thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== ADD LESSON =====
    const handleAddLesson = async (form) => {
        const chapterId = showAddLesson;
        setSaving(true);
        try {
            const payload = {
                lessonCode: form.lessonCode,
                lessonName: form.lessonName,
                lessonDescription: '',
                displayOrder: getChapterLessons(chapterId).length,
            };
            await courseApi.createLesson(courseId, chapterId, payload);
            showToast(`Đã thêm bài "${form.lessonName}"`);
            setShowAddLesson(null);
            await fetchCourseData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Thêm bài giảng thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== DELETE LESSON =====
    const handleDeleteLesson = async (chapterId, lesson) => {
        const lsId = lesson.lessonId || lesson.id;
        if (!window.confirm(`Xóa bài "${lesson.lessonName}"?`)) return;

        setSaving(true);
        try {
            await courseApi.deleteLesson(courseId, chapterId, lsId);
            showToast(`Đã xóa bài "${lesson.lessonName}"`);
            setChapters(prev => prev.map(ch => {
                const chId = ch.chapterId || ch.id;
                if (chId !== chapterId) return ch;
                return {
                    ...ch,
                    lessons: (ch.lessons || []).filter(l => (l.lessonId || l.id) !== lsId),
                };
            }));
        } catch (err) {
            showToast(err.response?.data?.message || 'Xóa bài thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== EDIT TITLE (CHAPTER/LESSON) =====
    const startEdit = (id, currentTitle) => {
        setEditingTitle(id);
        setEditValue(currentTitle);
    };

    const saveChapterTitle = async (chapter) => {
        if (!editValue.trim()) return;
        const chId = chapter.chapterId || chapter.id;
        setSaving(true);
        try {
            await courseApi.updateChapter(courseId, chId, { chapterName: editValue.trim() });
            setChapters(prev => prev.map(ch =>
                (ch.chapterId || ch.id) === chId ? { ...ch, chapterName: editValue.trim() } : ch
            ));
            showToast('Đã cập nhật tên chương');
        } catch (err) {
            showToast(err.response?.data?.message || 'Cập nhật thất bại', 'error');
        } finally {
            setSaving(false);
            setEditingTitle(null);
            setEditValue('');
        }
    };

    const saveLessonTitle = async (chapterId, lesson) => {
        if (!editValue.trim()) return;
        const lsId = lesson.lessonId || lesson.id;
        setSaving(true);
        try {
            await courseApi.updateLesson(courseId, chapterId, lsId, { lessonName: editValue.trim() });
            setChapters(prev => prev.map(ch => {
                if ((ch.chapterId || ch.id) !== chapterId) return ch;
                return {
                    ...ch,
                    lessons: (ch.lessons || []).map(l =>
                        (l.lessonId || l.id) === lsId ? { ...l, lessonName: editValue.trim() } : l
                    ),
                };
            }));
            showToast('Đã cập nhật tên bài giảng');
        } catch (err) {
            showToast(err.response?.data?.message || 'Cập nhật thất bại', 'error');
        } finally {
            setSaving(false);
            setEditingTitle(null);
            setEditValue('');
        }
    };

    // ===== HELPERS =====
    const getChapterLessons = (chapterId) => {
        const ch = chapters.find(c => (c.chapterId || c.id) === chapterId);
        return ch?.lessons || [];
    };

    const getChapterName = (chapterId) => {
        const ch = chapters.find(c => (c.chapterId || c.id) === chapterId);
        return ch?.chapterName || '';
    };

    const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);

    // ===== LESSON CONTENT HANDLERS =====
    const fetchLessonContent = async (chapterId, lessonId) => {
        const key = `${chapterId}-${lessonId}`;
        const currentKey = selectedLesson ? `${selectedLesson.chapterId}-${selectedLesson.lessonId}` : null;
        if (currentKey === key) { setSelectedLesson(null); setLessonContent(null); return; }
        setSelectedLesson({ chapterId, lessonId });
        setLoadingContent(true);
        try {
            const res = await courseApi.getLessonContent(courseId, chapterId, lessonId);
            setLessonContent(res?.data || res);
        } catch { setLessonContent({ videos: [], documents: [], questions: [] }); }
        finally { setLoadingContent(false); }
    };

    const handleAddVideo = async (form) => {
        const { chapterId, lessonId } = showAddVideo;
        setSaving(true);
        try {
            await courseApi.addVideo(courseId, chapterId, lessonId, form);
            showToast('Đã thêm video');
            setShowAddVideo(null);
            fetchLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || 'Thêm video thất bại', 'error'); }
        finally { setSaving(false); }
    };

    const handleDeleteVideo = async (chapterId, lessonId, videoId) => {
        if (!window.confirm('Xóa video này?')) return;
        setSaving(true);
        try {
            await courseApi.deleteVideo(courseId, chapterId, lessonId, videoId);
            showToast('Đã xóa video');
            fetchLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || 'Xóa thất bại', 'error'); }
        finally { setSaving(false); }
    };

    const handleAddDocument = async (form) => {
        const { chapterId, lessonId } = showAddDocument;

        const documentTitle = form.documentTitle?.trim();
        const fileUrl = form.fileUrl?.trim();
        const hasFile = form.file instanceof File;

        if (!documentTitle) {
            showToast('Vui lòng nhập tiêu đề tài liệu', 'error');
            return;
        }

        if (!hasFile && !fileUrl) {
            showToast('Vui lòng chọn file tải lên hoặc nhập URL tài liệu', 'error');
            return;
        }

        setSaving(true);
        try {
            if (hasFile) {
                const payload = new FormData();
                payload.append('documentTitle', documentTitle);
                payload.append('file', form.file);
                payload.append('fileName', form.fileName || form.file.name);
                payload.append('fileType', form.fileType || 'pdf');
                if (form.documentDescription?.trim()) {
                    payload.append('documentDescription', form.documentDescription.trim());
                }
                await courseApi.addDocument(courseId, chapterId, lessonId, payload);
            } else {
                await courseApi.addDocument(courseId, chapterId, lessonId, {
                    documentTitle,
                    fileUrl,
                    fileName: form.fileName || documentTitle,
                    fileType: form.fileType || 'pdf',
                    documentDescription: form.documentDescription?.trim() || undefined,
                });
            }

            showToast('Đã thêm tài liệu');
            setShowAddDocument(null);
            fetchLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || 'Thêm tài liệu thất bại', 'error'); }
        finally { setSaving(false); }
    };

    const handleDeleteDocument = async (chapterId, lessonId, docId) => {
        if (!window.confirm('Xóa tài liệu này?')) return;
        setSaving(true);
        try {
            await courseApi.deleteDocument(courseId, chapterId, lessonId, docId);
            showToast('Đã xóa tài liệu');
            fetchLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || 'Xóa thất bại', 'error'); }
        finally { setSaving(false); }
    };

    const handleAddQuestion = async (form) => {
        const { chapterId, lessonId } = showAddQuestion;
        setSaving(true);
        try {
            await courseApi.addQuestion(courseId, chapterId, lessonId, form);
            showToast('Đã thêm câu hỏi');
            setShowAddQuestion(null);
            fetchLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || 'Thêm câu hỏi thất bại', 'error'); }
        finally { setSaving(false); }
    };

    const handleDeleteQuestion = async (chapterId, lessonId, qId) => {
        if (!window.confirm('Xóa câu hỏi này?')) return;
        setSaving(true);
        try {
            await courseApi.deleteQuestion(courseId, chapterId, lessonId, qId);
            showToast('Đã xóa câu hỏi');
            fetchLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || 'Xóa thất bại', 'error'); }
        finally { setSaving(false); }
    };

    const isLessonSelected = (chId, lsId) =>
        selectedLesson?.chapterId === chId && selectedLesson?.lessonId === lsId;

    // ===== PREVIEW HELPERS =====
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : null;
    };

    // ===== LOADING STATE =====
    if (loading) {
        return (
            <ExpertLayout>
                <div className="flex items-center justify-center py-32">
                    <div className="text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
                        <p className="text-sm text-base-content/50 font-medium">Đang tải chương trình học...</p>
                    </div>
                </div>
            </ExpertLayout>
        );
    }

    // ===== ERROR STATE =====
    if (error) {
        return (
            <ExpertLayout>
                <div className="flex items-center justify-center py-32">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-black">{error}</h3>
                        <div className="flex gap-2 justify-center">
                            <Link to="/expert/curriculum" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại
                            </Link>
                            <button onClick={fetchCourseData} className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5">
                                <RefreshCw className="w-4 h-4" />
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            </ExpertLayout>
        );
    }

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Link to="/expert/curriculum" className="text-sm text-base-content/50 font-medium hover:text-violet-600 transition-colors">
                                Chương trình học
                            </Link>
                            <ChevronRight className="w-3 h-3 text-base-content/30" />
                            <span className="text-sm text-violet-600 font-bold truncate max-w-[300px]">
                                {course?.courseName || 'Khóa học'}
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">
                            {chapters.length === 0 ? 'Tạo Chương trình học' : 'Quản lý Chương trình học'}
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            {chapters.length === 0
                                ? 'Bắt đầu xây dựng nội dung khóa học bằng cách thêm các chương và bài giảng'
                                : 'Chỉnh sửa, thêm hoặc xóa chương và bài giảng'
                            }
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/expert/curriculum" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại
                        </Link>
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <Eye className="w-4 h-4" />
                            Xem trước
                        </button>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Chương', value: chapters.length, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        { label: 'Bài giảng', value: totalLessons, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Trạng thái', value: course?.status === 'published' ? 'Đã xuất bản' : 'Bản nháp', icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Mã khóa học', value: course?.courseCode || '—', icon: Hash, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-base-100 rounded-xl p-3.5 border border-base-300 flex items-center gap-3 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-lg font-black text-base-content">{stat.value}</p>
                                <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Empty state for no chapters */}
                {chapters.length === 0 && (
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl border-2 border-dashed border-violet-500/30 p-12 text-center mb-6">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mb-4">
                            <GraduationCap className="w-10 h-10 text-violet-500/50" />
                        </div>
                        <h3 className="text-lg font-black text-base-content mb-2">Khóa học chưa có nội dung</h3>
                        <p className="text-sm text-base-content/50 max-w-md mx-auto mb-5">
                            Bắt đầu xây dựng chương trình học bằng cách thêm chương đầu tiên. Mỗi chương sẽ chứa các bài giảng (Video, Tài liệu, Quiz).
                        </p>
                        <button
                            onClick={() => setShowAddChapter(true)}
                            className="btn bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-black shadow-lg shadow-violet-500/25 gap-2"
                        >
                            <FolderPlus className="w-5 h-5" />
                            Thêm chương đầu tiên
                        </button>
                    </motion.div>
                )}

                {/* Chapters List */}
                <div className="space-y-4">
                    {chapters.map((chapter, chapterIdx) => {
                        const chId = chapter.chapterId || chapter.id;
                        const isExpanded = expandedChapters.has(chId);
                        const lessons = chapter.lessons || [];

                        return (
                            <motion.div
                                key={chId}
                                variants={cardVariants}
                                className="bg-base-100 rounded-2xl border border-base-300 shadow-lg overflow-hidden"
                            >
                                {/* Chapter Header */}
                                <div
                                    className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${
                                        isExpanded
                                            ? 'bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border-b border-base-300'
                                            : 'hover:bg-base-200/50'
                                    }`}
                                    onClick={() => toggleChapter(chId)}
                                >
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <GripVertical className="w-4 h-4 text-base-content/30 cursor-grab" />
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                            {chapterIdx + 1}
                                        </div>
                                    </div>

                                    {editingTitle === chId ? (
                                        <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && saveChapterTitle(chapter)}
                                                className="input input-sm input-bordered flex-1 font-bold rounded-xl"
                                                autoFocus
                                            />
                                            <button onClick={() => saveChapterTitle(chapter)} className="btn btn-sm btn-circle btn-ghost text-emerald-500" disabled={saving}>
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingTitle(null)} className="btn btn-sm btn-circle btn-ghost text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-base-content text-base">{chapter.chapterName}</h3>
                                            <div className="flex items-center gap-2">
                                                {chapter.chapterCode && (
                                                    <span className="text-[10px] font-bold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded">
                                                        {chapter.chapterCode}
                                                    </span>
                                                )}
                                                <p className="text-xs text-base-content/50">{lessons.length} bài giảng</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => startEdit(chId, chapter.chapterName)}
                                            className="btn btn-ghost btn-xs btn-circle"
                                            title="Đổi tên"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteChapter(chapter)}
                                            className="btn btn-ghost btn-xs btn-circle text-red-500"
                                            title="Xóa chương"
                                            disabled={saving}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="ml-1">
                                            {isExpanded
                                                ? <ChevronDown className="w-5 h-5 text-base-content/40" />
                                                : <ChevronRight className="w-5 h-5 text-base-content/40" />
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Lessons */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 py-3 space-y-1.5">
                                                {lessons.length === 0 && (
                                                    <div className="text-center py-6">
                                                        <BookOpen className="w-8 h-8 text-base-content/20 mx-auto mb-2" />
                                                        <p className="text-sm text-base-content/40 font-medium">Chưa có bài giảng nào</p>
                                                        <p className="text-xs text-base-content/30">Nhấn nút bên dưới để thêm bài giảng đầu tiên</p>
                                                    </div>
                                                )}

                                                {lessons.map((lesson, lessonIdx) => {
                                                    const lsId = lesson.lessonId || lesson.id;
                                                    const ltConfig = lessonTypeConfig[lesson.lessonType || lesson.type] || lessonTypeConfig.video;
                                                    const LessonIcon = ltConfig.icon;

                                                    return (
                                                        <div key={lsId}>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: lessonIdx * 0.05 }}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-colors ${isLessonSelected(chId, lsId) ? 'bg-violet-500/10 border border-violet-500/20' : 'hover:bg-base-200/50'}`}
                                                            onClick={() => fetchLessonContent(chId, lsId)}
                                                        >
                                                            <GripVertical className="w-4 h-4 text-base-content/20 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ltConfig.color}`}>
                                                                <LessonIcon className="w-4 h-4" />
                                                            </div>

                                                            {editingTitle === lsId ? (
                                                                <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                                    <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveLessonTitle(chId, lesson)} className="input input-sm input-bordered flex-1 font-medium rounded-xl" autoFocus />
                                                                    <button onClick={() => saveLessonTitle(chId, lesson)} className="btn btn-xs btn-circle btn-ghost text-emerald-500" disabled={saving}><Check className="w-3.5 h-3.5" /></button>
                                                                    <button onClick={() => setEditingTitle(null)} className="btn btn-xs btn-circle btn-ghost text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-sm text-base-content truncate">{lesson.lessonName}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ltConfig.color}`}>{ltConfig.label}</span>
                                                                        {lesson.lessonCode && <span className="text-[10px] text-base-content/40 font-mono">{lesson.lessonCode}</span>}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                                                                    <button onClick={() => startEdit(lsId, lesson.lessonName)} className="btn btn-ghost btn-xs btn-circle" title="Đổi tên"><Pencil className="w-3 h-3" /></button>
                                                                    <button onClick={() => handleDeleteLesson(chId, lesson)} className="btn btn-ghost btn-xs btn-circle text-red-500" title="Xóa bài" disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                </div>
                                                                <ChevronDown className={`w-4 h-4 text-base-content/30 transition-transform ${isLessonSelected(chId, lsId) ? 'rotate-180 text-violet-500' : ''}`} />
                                                            </div>
                                                        </motion.div>

                                                        {/* ===== LESSON CONTENT PANEL ===== */}
                                                        <AnimatePresence>
                                                        {isLessonSelected(chId, lsId) && (
                                                            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
                                                                <div className="ml-11 mr-3 mb-2 mt-1 p-3 rounded-xl bg-base-200/50 border border-base-300 space-y-3">
                                                                    {loadingContent ? (
                                                                        <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-violet-500" /><span className="ml-2 text-xs text-base-content/50">Đang tải nội dung...</span></div>
                                                                    ) : (
                                                                        <>
                                                                        {/* Videos */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-blue-600 flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5"/>Video ({lessonContent?.videos?.length || 0})</span>
                                                                                <button onClick={(e) => {e.stopPropagation(); setShowAddVideo({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-blue-600 gap-1 rounded-lg"><Plus className="w-3 h-3"/>Thêm</button>
                                                                            </div>
                                                                            {(lessonContent?.videos || []).map(v => (
                                                                                <div key={v.videoId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-base-100 border border-base-300 mb-1">
                                                                                    <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0"/>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-xs font-bold truncate">{v.videoTitle}</p>
                                                                                        <p className="text-[10px] text-base-content/40 truncate">{v.videoUrl}</p>
                                                                                    </div>
                                                                                    <button onClick={(e) => { e.stopPropagation(); setPreviewVideo(v); }} className="btn btn-ghost btn-xs btn-circle text-blue-500 hover:bg-blue-500/10" title="Xem trước"><Eye className="w-3 h-3"/></button>
                                                                                    <a href={v.videoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs btn-circle"><ExternalLink className="w-3 h-3"/></a>
                                                                                    <button onClick={() => handleDeleteVideo(chId, lsId, v.videoId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3"/></button>
                                                                                </div>
                                                                            ))}
                                                                            {(lessonContent?.videos?.length || 0) === 0 && <p className="text-[10px] text-base-content/30 italic">Chưa có video</p>}
                                                                        </div>

                                                                        {/* Documents */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-emerald-600 flex items-center gap-1"><FileText className="w-3.5 h-3.5"/>Tài liệu ({lessonContent?.documents?.length || 0})</span>
                                                                                <button onClick={(e) => {e.stopPropagation(); setShowAddDocument({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-emerald-600 gap-1 rounded-lg"><Plus className="w-3 h-3"/>Thêm</button>
                                                                            </div>
                                                                            {(lessonContent?.documents || []).map(d => (
                                                                                <div key={d.documentId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-base-100 border border-base-300 mb-1">
                                                                                    <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0"/>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-xs font-bold truncate">{d.documentTitle}</p>
                                                                                        <p className="text-[10px] text-base-content/40">{d.fileType || 'file'} {d.fileName && `• ${d.fileName}`}</p>
                                                                                    </div>
                                                                                    <button onClick={(e) => { e.stopPropagation(); setPreviewDocument(d); }} className="btn btn-ghost btn-xs btn-circle text-emerald-500 hover:bg-emerald-500/10" title="Xem trước"><Eye className="w-3 h-3"/></button>
                                                                                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs btn-circle"><ExternalLink className="w-3 h-3"/></a>
                                                                                    <button onClick={() => handleDeleteDocument(chId, lsId, d.documentId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3"/></button>
                                                                                </div>
                                                                            ))}
                                                                            {(lessonContent?.documents?.length || 0) === 0 && <p className="text-[10px] text-base-content/30 italic">Chưa có tài liệu</p>}
                                                                        </div>

                                                                        {/* Questions */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-amber-600 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5"/>Câu hỏi ({lessonContent?.questions?.length || 0})</span>
                                                                                <button onClick={(e) => {e.stopPropagation(); setShowAddQuestion({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-amber-600 gap-1 rounded-lg"><Plus className="w-3 h-3"/>Thêm</button>
                                                                            </div>
                                                                            {(lessonContent?.questions || []).map(q => (
                                                                                <div key={q.questionId} className="px-2 py-1.5 rounded-lg bg-base-100 border border-base-300 mb-1">
                                                                                    <div className="flex items-start gap-2">
                                                                                        <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="text-xs font-bold">{q.questionText}</p>
                                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                                <span className="text-[10px] badge badge-xs badge-ghost">{q.questionType}</span>
                                                                                                <span className="text-[10px] badge badge-xs badge-ghost">{q.difficultyLevel}</span>
                                                                                            </div>
                                                                                            {q.options?.length > 0 && (
                                                                                                <div className="mt-1 space-y-0.5">
                                                                                                    {q.options.map(o => (
                                                                                                        <div key={o.optionId} className={`text-[11px] flex items-center gap-1 ${o.isCorrect ? 'text-emerald-600 font-bold' : 'text-base-content/60'}`}>
                                                                                                            {o.isCorrect ? <CheckCircle2 className="w-3 h-3"/> : <span className="w-3 h-3 rounded-full border border-base-content/20 inline-block"/>}
                                                                                                            {o.optionText}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex flex-col gap-0.5 flex-shrink-0">
                                                                                            <button onClick={(e) => { e.stopPropagation(); setPreviewQuestion(q); }} className="btn btn-ghost btn-xs btn-circle text-amber-500 hover:bg-amber-500/10" title="Xem trước"><Eye className="w-3 h-3"/></button>
                                                                                            <button onClick={() => handleDeleteQuestion(chId, lsId, q.questionId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3"/></button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            {(lessonContent?.questions?.length || 0) === 0 && <p className="text-[10px] text-base-content/30 italic">Chưa có câu hỏi</p>}
                                                                        </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                        </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Add Lesson */}
                                            <div className="px-5 pb-4">
                                                <button
                                                    onClick={() => setShowAddLesson(chId)}
                                                    className="btn btn-sm btn-ghost rounded-xl font-bold text-violet-600 w-full border-2 border-dashed border-base-300 hover:border-violet-500/50 gap-1.5"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Thêm bài giảng
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Add Chapter Button */}
                {chapters.length > 0 && (
                    <motion.div variants={cardVariants} className="mt-4">
                        <button
                            onClick={() => setShowAddChapter(true)}
                            className="btn btn-lg w-full rounded-2xl font-black text-violet-600 bg-base-100 border-2 border-dashed border-violet-500/30 hover:border-violet-500 hover:bg-violet-500/5 transition-all gap-2 shadow-lg"
                        >
                            <FolderPlus className="w-5 h-5" />
                            Thêm chương mới
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* Modals */}
            <AddChapterModal
                open={showAddChapter}
                onClose={() => setShowAddChapter(false)}
                onSubmit={handleAddChapter}
                loading={saving}
            />
            <AddLessonModal
                open={!!showAddLesson}
                onClose={() => setShowAddLesson(null)}
                onSubmit={handleAddLesson}
                loading={saving}
                chapterName={showAddLesson ? getChapterName(showAddLesson) : ''}
            />

            {/* Add Video Modal */}
            {showAddVideo && (
                <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-box rounded-2xl border border-base-300 shadow-2xl">
                        <h3 className="font-black text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><PlayCircle className="w-4 h-4 text-white" /></div>
                            Thêm Video
                        </h3>
                        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); handleAddVideo({ videoTitle: fd.get('videoTitle'), videoUrl: fd.get('videoUrl'), videoDescription: fd.get('videoDescription') }); }} className="mt-4 space-y-3">
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">Tiêu đề video <span className="text-red-500">*</span></span></label>
                                <input name="videoTitle" type="text" placeholder="VD: Giới thiệu bài học" className="input input-bordered input-sm rounded-xl w-full font-medium" required autoFocus /></div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">URL Video <span className="text-red-500">*</span></span></label>
                                <input name="videoUrl" type="url" placeholder="https://youtube.com/watch?v=..." className="input input-bordered input-sm rounded-xl w-full font-medium" required /></div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">Mô tả (tuỳ chọn)</span></label>
                                <textarea name="videoDescription" placeholder="Mô tả nội dung video..." className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none" rows={2} /></div>
                            <div className="modal-action">
                                <button type="button" onClick={() => setShowAddVideo(null)} className="btn btn-sm btn-ghost rounded-xl font-bold">Hủy</button>
                                <button type="submit" disabled={saving} className="btn btn-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-none rounded-xl font-bold gap-1.5">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Thêm video
                                </button>
                            </div>
                        </form>
                    </motion.div>
                    <div className="modal-backdrop bg-black/40" onClick={() => setShowAddVideo(null)} />
                </div>
            )}

            {/* Add Document Modal */}
            {showAddDocument && (
                <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-box rounded-2xl border border-base-300 shadow-2xl">
                        <h3 className="font-black text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"><FileText className="w-4 h-4 text-white" /></div>
                            Thêm Tài liệu
                        </h3>
                        <form onSubmit={e => {
                            e.preventDefault();
                            const fd = new FormData(e.target);
                            const file = fd.get('file');
                            const safeFile = file instanceof File && file.size > 0 ? file : null;
                            const fallbackTitle = fd.get('documentTitle');
                            handleAddDocument({
                                documentTitle: fallbackTitle,
                                file: safeFile,
                                fileUrl: fd.get('fileUrl'),
                                fileName: fd.get('fileName') || safeFile?.name || fallbackTitle,
                                fileType: fd.get('fileType') || 'pdf',
                                documentDescription: fd.get('documentDescription'),
                            });
                        }} className="mt-4 space-y-3">
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">Tiêu đề <span className="text-red-500">*</span></span></label>
                                <input name="documentTitle" type="text" placeholder="VD: Slide bài giảng" className="input input-bordered input-sm rounded-xl w-full font-medium" required autoFocus /></div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">Tải file từ máy</span></label>
                                <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" className="file-input file-input-bordered file-input-sm rounded-xl w-full font-medium" /></div>
                            <div className="divider text-[10px] font-bold text-base-content/40 uppercase my-1">hoặc dùng link</div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">URL Tài liệu</span></label>
                                <input name="fileUrl" type="url" placeholder="https://drive.google.com/..." className="input input-bordered input-sm rounded-xl w-full font-medium" /></div>
                            <div className="flex gap-2">
                                <div className="form-control flex-1"><label className="label py-1"><span className="label-text font-bold text-xs">Tên file</span></label>
                                    <input name="fileName" type="text" placeholder="document.pdf" className="input input-bordered input-sm rounded-xl w-full font-medium" /></div>
                                <div className="form-control w-28"><label className="label py-1"><span className="label-text font-bold text-xs">Loại file</span></label>
                                    <select name="fileType" className="select select-bordered select-sm rounded-xl font-medium"><option value="pdf">PDF</option><option value="doc">DOC</option><option value="docx">DOCX</option><option value="ppt">PPT</option><option value="txt">TXT</option></select></div>
                            </div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">Mô tả (tuỳ chọn)</span></label>
                                <textarea name="documentDescription" placeholder="Mô tả tài liệu..." className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none" rows={2} /></div>
                            <div className="modal-action">
                                <button type="button" onClick={() => setShowAddDocument(null)} className="btn btn-sm btn-ghost rounded-xl font-bold">Hủy</button>
                                <button type="submit" disabled={saving} className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none rounded-xl font-bold gap-1.5">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Thêm tài liệu
                                </button>
                            </div>
                        </form>
                    </motion.div>
                    <div className="modal-backdrop bg-black/40" onClick={() => setShowAddDocument(null)} />
                </div>
            )}

            {/* Add Question Modal */}
            {showAddQuestion && <AddQuestionModal open={true} onClose={() => setShowAddQuestion(null)} onSubmit={handleAddQuestion} loading={saving} />}

            {/* ===== VIDEO PREVIEW MODAL ===== */}
            <AnimatePresence>
            {previewVideo && (
                <div className="modal modal-open" style={{ zIndex: 110 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="modal-box rounded-2xl border border-base-300 shadow-2xl max-w-3xl w-11/12"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <PlayCircle className="w-4 h-4 text-white" />
                                </div>
                                Xem trước Video
                            </h3>
                            <button onClick={() => setPreviewVideo(null)} className="btn btn-ghost btn-sm btn-circle"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-xl ring-1 ring-white/10">
                            {getYouTubeEmbedUrl(previewVideo.videoUrl) ? (
                                <iframe
                                    src={getYouTubeEmbedUrl(previewVideo.videoUrl)}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    title={previewVideo.videoTitle}
                                />
                            ) : (
                                <video src={previewVideo.videoUrl} controls className="w-full h-full">
                                    Trình duyệt không hỗ trợ phát video.
                                </video>
                            )}
                        </div>
                        <div className="mt-4 p-3 rounded-xl bg-base-200/50 border border-base-300">
                            <h4 className="font-bold text-base flex items-center gap-2">
                                <Video className="w-4 h-4 text-blue-500"/>
                                {previewVideo.videoTitle}
                            </h4>
                            {previewVideo.videoDescription && (
                                <p className="text-sm text-base-content/60 mt-1.5 leading-relaxed">{previewVideo.videoDescription}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-base-content/40">
                                <Link2 className="w-3 h-3"/>
                                <span className="truncate">{previewVideo.videoUrl}</span>
                            </div>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setPreviewVideo(null)} />
                </div>
            )}
            </AnimatePresence>

            {/* ===== DOCUMENT PREVIEW MODAL ===== */}
            <AnimatePresence>
            {previewDocument && (
                <div className="modal modal-open" style={{ zIndex: 110 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="modal-box rounded-2xl border border-base-300 shadow-2xl max-w-4xl w-11/12" style={{ maxHeight: '88vh' }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                    <FileText className="w-4 h-4 text-white" />
                                </div>
                                Xem trước Tài liệu
                            </h3>
                            <div className="flex items-center gap-2">
                                <a href={previewDocument.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 text-emerald-600">
                                    <ExternalLink className="w-3.5 h-3.5"/> Mở link gốc
                                </a>
                                <button onClick={() => setPreviewDocument(null)} className="btn btn-ghost btn-sm btn-circle"><X className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-base-300 bg-base-200 shadow-inner" style={{ height: '62vh' }}>
                            <DocumentPreviewContent document={previewDocument} />
                        </div>
                        <div className="mt-4 p-3 rounded-xl bg-base-200/50 border border-base-300">
                            <h4 className="font-bold text-base flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-500"/>
                                {previewDocument.documentTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {previewDocument.fileName && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-base-300/80 text-base-content/60">{previewDocument.fileName}</span>
                                )}
                                {previewDocument.fileType && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase">{previewDocument.fileType}</span>
                                )}
                            </div>
                            {previewDocument.documentDescription && (
                                <p className="text-sm text-base-content/60 mt-1.5">{previewDocument.documentDescription}</p>
                            )}
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setPreviewDocument(null)} />
                </div>
            )}
            </AnimatePresence>

            {/* ===== QUESTION PREVIEW MODAL ===== */}
            <AnimatePresence>
            {previewQuestion && (
                <div className="modal modal-open" style={{ zIndex: 110 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="modal-box rounded-2xl border border-base-300 shadow-2xl max-w-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                                    <HelpCircle className="w-4 h-4 text-white" />
                                </div>
                                Xem trước Câu hỏi
                            </h3>
                            <button onClick={() => setPreviewQuestion(null)} className="btn btn-ghost btn-sm btn-circle"><X className="w-5 h-5"/></button>
                        </div>

                        {/* Student-like preview card */}
                        <div className="rounded-xl bg-gradient-to-br from-base-200/80 to-base-200/40 p-5 border border-base-300 shadow-inner">
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                                    previewQuestion.difficultyLevel === 'easy' ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20' :
                                    previewQuestion.difficultyLevel === 'hard' ? 'bg-red-500/10 text-red-600 ring-1 ring-red-500/20' :
                                    'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20'
                                }`}>
                                    {previewQuestion.difficultyLevel === 'easy' ? '🟢 Dễ' : previewQuestion.difficultyLevel === 'hard' ? '🔴 Khó' : '🟡 Trung bình'}
                                </span>
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20">
                                    {previewQuestion.questionType === 'multiple_choice' ? '📝 Trắc nghiệm' : previewQuestion.questionType === 'true_false' ? '✅ Đúng/Sai' : '✍️ Điền từ'}
                                </span>
                            </div>

                            {/* Question text */}
                            <h4 className="font-bold text-base leading-relaxed mb-4">{previewQuestion.questionText}</h4>

                            {/* Options */}
                            {previewQuestion.options?.length > 0 && (
                                <div className="space-y-2">
                                    {previewQuestion.options.map((o, idx) => (
                                        <div
                                            key={o.optionId || idx}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                                o.isCorrect
                                                    ? 'border-emerald-500 bg-emerald-500/5 shadow-sm shadow-emerald-500/10'
                                                    : 'border-base-300 bg-base-100 hover:border-base-content/20'
                                            }`}
                                        >
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${
                                                o.isCorrect
                                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                                    : 'bg-base-300 text-base-content/50'
                                            }`}>
                                                {o.isCorrect ? <CheckCircle2 className="w-4 h-4"/> : String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-sm ${
                                                o.isCorrect ? 'font-bold text-emerald-700' : 'text-base-content/70'
                                            }`}>{o.optionText}</span>
                                            {o.isCorrect && (
                                                <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Đáp án đúng</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Explanation */}
                            {previewQuestion.questionExplanation && (
                                <div className="mt-4 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                    <p className="text-xs font-black text-blue-600 mb-1.5 flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5"/> Giải thích đáp án
                                    </p>
                                    <p className="text-sm text-base-content/70 leading-relaxed">{previewQuestion.questionExplanation}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-[10px] text-base-content/30 font-medium">👆 Đây là giao diện câu hỏi mà học viên sẽ thấy</p>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setPreviewQuestion(null)} />
                </div>
            )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <div className={`alert shadow-2xl rounded-2xl border-none font-bold text-sm max-w-sm ${
                            toast.type === 'error'
                                ? 'bg-red-500 text-white'
                                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                        }`}>
                            {toast.type === 'error'
                                ? <AlertCircle className="w-5 h-5" />
                                : <Check className="w-5 h-5" />
                            }
                            <span>{toast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ExpertLayout>
    );
}
