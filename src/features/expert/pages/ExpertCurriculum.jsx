import { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
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
    MoreHorizontal,
    Eye,
    Save,
    Upload,
    Video,
    FileUp,
    X,
    Check,
    FolderPlus,
    Layers,
    Clock,
    BookOpen,
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

// ===== MOCK DATA =====
const initialCourse = {
    id: 1,
    name: 'React & Next.js Masterclass',
    status: 'draft',
    chapters: [
        {
            id: 'ch-1',
            title: 'Giới thiệu React',
            expanded: true,
            lessons: [
                { id: 'ls-1', title: 'React là gì?', type: 'video', duration: '12:30', status: 'published' },
                { id: 'ls-2', title: 'Cài đặt môi trường', type: 'video', duration: '08:45', status: 'published' },
                { id: 'ls-3', title: 'Tài liệu hướng dẫn cài đặt', type: 'document', duration: '5 trang', status: 'published' },
                { id: 'ls-4', title: 'Bài kiểm tra: Kiến thức cơ bản', type: 'quiz', duration: '10 câu', status: 'draft' },
            ],
        },
        {
            id: 'ch-2',
            title: 'Components & Props',
            expanded: false,
            lessons: [
                { id: 'ls-5', title: 'Functional Components', type: 'video', duration: '15:20', status: 'published' },
                { id: 'ls-6', title: 'Props và truyền dữ liệu', type: 'video', duration: '18:10', status: 'draft' },
                { id: 'ls-7', title: 'Bài tập Components', type: 'quiz', duration: '8 câu', status: 'draft' },
            ],
        },
        {
            id: 'ch-3',
            title: 'State & Lifecycle',
            expanded: false,
            lessons: [
                { id: 'ls-8', title: 'useState Hook', type: 'video', duration: '20:00', status: 'draft' },
                { id: 'ls-9', title: 'useEffect Deep Dive', type: 'video', duration: '25:30', status: 'draft' },
            ],
        },
    ],
};

const courseStats = {
    totalChapters: 3,
    totalLessons: 9,
    totalDuration: '1h 50m',
    publishedLessons: 4,
};

// ===== MAIN COMPONENT =====
export default function ExpertCurriculum() {
    const [course, setCourse] = useState(initialCourse);
    const [showAddLesson, setShowAddLesson] = useState(null);
    const [editingTitle, setEditingTitle] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [dragOverChapter, setDragOverChapter] = useState(null);
    const dragItem = useRef(null);

    const toggleChapter = (chapterId) => {
        setCourse(prev => ({
            ...prev,
            chapters: prev.chapters.map(ch =>
                ch.id === chapterId ? { ...ch, expanded: !ch.expanded } : ch
            ),
        }));
    };

    const addChapter = () => {
        const newChapter = {
            id: `ch-${Date.now()}`,
            title: `Chương mới ${course.chapters.length + 1}`,
            expanded: true,
            lessons: [],
        };
        setCourse(prev => ({ ...prev, chapters: [...prev.chapters, newChapter] }));
    };

    const addLesson = (chapterId, type) => {
        const typeLabels = { video: 'Video bài giảng', document: 'Tài liệu mới', quiz: 'Bài kiểm tra mới' };
        const newLesson = {
            id: `ls-${Date.now()}`,
            title: typeLabels[type],
            type,
            duration: type === 'video' ? '00:00' : type === 'quiz' ? '0 câu' : '0 trang',
            status: 'draft',
        };
        setCourse(prev => ({
            ...prev,
            chapters: prev.chapters.map(ch =>
                ch.id === chapterId ? { ...ch, lessons: [...ch.lessons, newLesson] } : ch
            ),
        }));
        setShowAddLesson(null);
    };

    const deleteLesson = (chapterId, lessonId) => {
        setCourse(prev => ({
            ...prev,
            chapters: prev.chapters.map(ch =>
                ch.id === chapterId
                    ? { ...ch, lessons: ch.lessons.filter(l => l.id !== lessonId) }
                    : ch
            ),
        }));
    };

    const deleteChapter = (chapterId) => {
        setCourse(prev => ({
            ...prev,
            chapters: prev.chapters.filter(ch => ch.id !== chapterId),
        }));
    };

    const startEditTitle = (id, currentTitle) => {
        setEditingTitle(id);
        setEditValue(currentTitle);
    };

    const saveEditTitle = (type, chapterId, lessonId = null) => {
        if (!editValue.trim()) return;
        setCourse(prev => ({
            ...prev,
            chapters: prev.chapters.map(ch => {
                if (type === 'chapter' && ch.id === chapterId) {
                    return { ...ch, title: editValue.trim() };
                }
                if (type === 'lesson' && ch.id === chapterId) {
                    return {
                        ...ch,
                        lessons: ch.lessons.map(l =>
                            l.id === lessonId ? { ...l, title: editValue.trim() } : l
                        ),
                    };
                }
                return ch;
            }),
        }));
        setEditingTitle(null);
        setEditValue('');
    };

    const reorderLessons = (chapterId, newOrder) => {
        setCourse(prev => ({
            ...prev,
            chapters: prev.chapters.map(ch =>
                ch.id === chapterId ? { ...ch, lessons: newOrder } : ch
            ),
        }));
    };

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-base-content/50 font-medium">Chương trình học</span>
                            <ChevronRight className="w-3 h-3 text-base-content/30" />
                            <span className="text-sm text-violet-600 font-bold">{course.name}</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">Trình tạo Chương trình học</h1>
                        <p className="text-sm text-base-content/60 mt-1">Kéo thả để sắp xếp các module và bài giảng</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <Eye className="w-4 h-4" />
                            Xem trước
                        </button>
                        <button className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold shadow-lg shadow-violet-500/25 gap-1.5">
                            <Save className="w-4 h-4" />
                            Lưu thay đổi
                        </button>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Chương', value: courseStats.totalChapters, icon: Layers, color: 'text-violet-500' },
                        { label: 'Bài giảng', value: courseStats.totalLessons, icon: BookOpen, color: 'text-blue-500' },
                        { label: 'Tổng thời gian', value: courseStats.totalDuration, icon: Clock, color: 'text-emerald-500' },
                        { label: 'Đã xuất bản', value: `${courseStats.publishedLessons}/${courseStats.totalLessons}`, icon: Check, color: 'text-amber-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-base-100 rounded-xl p-3 border border-base-300 flex items-center gap-3">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <div>
                                <p className="text-lg font-black text-base-content">{stat.value}</p>
                                <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Chapters List */}
                <div className="space-y-4">
                    {course.chapters.map((chapter, chapterIdx) => (
                        <motion.div
                            key={chapter.id}
                            variants={cardVariants}
                            className="bg-base-100 rounded-2xl border border-base-300 shadow-lg overflow-hidden"
                        >
                            {/* Chapter Header */}
                            <div
                                className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${chapter.expanded ? 'bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border-b border-base-300' : 'hover:bg-base-200/50'}`}
                                onClick={() => toggleChapter(chapter.id)}
                            >
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <GripVertical className="w-4 h-4 text-base-content/30 cursor-grab" />
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                        {chapterIdx + 1}
                                    </div>
                                </div>

                                {editingTitle === chapter.id ? (
                                    <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && saveEditTitle('chapter', chapter.id)}
                                            className="input input-sm input-bordered flex-1 font-bold"
                                            autoFocus
                                        />
                                        <button onClick={() => saveEditTitle('chapter', chapter.id)} className="btn btn-sm btn-circle btn-ghost text-emerald-500">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setEditingTitle(null)} className="btn btn-sm btn-circle btn-ghost text-red-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-base-content text-base">{chapter.title}</h3>
                                        <p className="text-xs text-base-content/50">{chapter.lessons.length} bài giảng</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => startEditTitle(chapter.id, chapter.title)}
                                        className="btn btn-ghost btn-xs btn-circle"
                                        title="Đổi tên"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => deleteChapter(chapter.id)}
                                        className="btn btn-ghost btn-xs btn-circle text-red-500"
                                        title="Xóa chương"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="ml-1">
                                        {chapter.expanded
                                            ? <ChevronDown className="w-5 h-5 text-base-content/40" />
                                            : <ChevronRight className="w-5 h-5 text-base-content/40" />
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Lessons */}
                            <AnimatePresence>
                                {chapter.expanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 py-3 space-y-1.5">
                                            {chapter.lessons.map((lesson, lessonIdx) => {
                                                const ltConfig = lessonTypeConfig[lesson.type];
                                                const LessonIcon = ltConfig.icon;

                                                return (
                                                    <motion.div
                                                        key={lesson.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: lessonIdx * 0.05 }}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-base-200/50 group transition-colors"
                                                    >
                                                        <GripVertical className="w-4 h-4 text-base-content/20 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ltConfig.color}`}>
                                                            <LessonIcon className="w-4 h-4" />
                                                        </div>

                                                        {editingTitle === lesson.id ? (
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={editValue}
                                                                    onChange={e => setEditValue(e.target.value)}
                                                                    onKeyDown={e => e.key === 'Enter' && saveEditTitle('lesson', chapter.id, lesson.id)}
                                                                    className="input input-sm input-bordered flex-1 font-medium"
                                                                    autoFocus
                                                                />
                                                                <button onClick={() => saveEditTitle('lesson', chapter.id, lesson.id)} className="btn btn-xs btn-circle btn-ghost text-emerald-500">
                                                                    <Check className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button onClick={() => setEditingTitle(null)} className="btn btn-xs btn-circle btn-ghost text-red-500">
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm text-base-content truncate">{lesson.title}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ltConfig.color}`}>
                                                                        {ltConfig.label}
                                                                    </span>
                                                                    <span className="text-[11px] text-base-content/50">{lesson.duration}</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Status & Actions */}
                                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${lesson.status === 'published'
                                                                ? 'text-emerald-600 bg-emerald-500/10'
                                                                : 'text-amber-600 bg-amber-500/10'
                                                            }`}>
                                                                {lesson.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                                                            </span>
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                                                                <button
                                                                    onClick={() => startEditTitle(lesson.id, lesson.title)}
                                                                    className="btn btn-ghost btn-xs btn-circle"
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </button>
                                                                <button className="btn btn-ghost btn-xs btn-circle">
                                                                    <Copy className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteLesson(chapter.id, lesson.id)}
                                                                    className="btn btn-ghost btn-xs btn-circle text-red-500"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* Add Lesson */}
                                        <div className="px-5 pb-4">
                                            {showAddLesson === chapter.id ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-violet-500/30 bg-violet-500/5"
                                                >
                                                    <span className="text-sm font-bold text-base-content/70 mr-2">Thêm:</span>
                                                    {Object.entries(lessonTypeConfig).map(([type, config]) => {
                                                        const Icon = config.icon;
                                                        return (
                                                            <button
                                                                key={type}
                                                                onClick={() => addLesson(chapter.id, type)}
                                                                className={`btn btn-sm rounded-xl font-bold gap-1.5 ${config.color} border-none hover:scale-105 transition-transform`}
                                                            >
                                                                <Icon className="w-4 h-4" />
                                                                {config.label}
                                                            </button>
                                                        );
                                                    })}
                                                    <button
                                                        onClick={() => setShowAddLesson(null)}
                                                        className="btn btn-sm btn-circle btn-ghost ml-auto"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowAddLesson(chapter.id)}
                                                    className="btn btn-sm btn-ghost rounded-xl font-bold text-violet-600 w-full border-2 border-dashed border-base-300 hover:border-violet-500/50 gap-1.5"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Thêm bài giảng
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Add Chapter */}
                <motion.div variants={cardVariants} className="mt-4">
                    <button
                        onClick={addChapter}
                        className="btn btn-lg w-full rounded-2xl font-black text-violet-600 bg-base-100 border-2 border-dashed border-violet-500/30 hover:border-violet-500 hover:bg-violet-500/5 transition-all gap-2 shadow-lg"
                    >
                        <FolderPlus className="w-5 h-5" />
                        Thêm chương mới
                    </button>
                </motion.div>
            </motion.div>
        </ExpertLayout>
    );
}
