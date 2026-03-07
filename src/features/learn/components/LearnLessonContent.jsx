import { useState } from 'react';
import { motion } from 'motion/react';
import {
    FileText,
    Download,
    Sparkles,
    ExternalLink,
    MessageCircle,
    ThumbsUp,
    Bookmark,
    Share2,
    ChevronRight,
    Clock,
    Play,
    CheckCircle2,
    NotebookPen
} from 'lucide-react';

/**
 * LearnLessonContent - Content area below the video player
 * Shows lesson description, resources, notes, and next lesson prompt.
 *
 * @param {object}  lesson       - Current lesson
 * @param {object}  chapter      - Current chapter
 * @param {object}  nextLesson   - Next lesson in queue (null if none)
 * @param {string}  expertName   - Name of the course expert
 * @param {string}  expertAvatar - Avatar URL for the expert
 * @param {string}  gradient     - Course gradient class
 * @param {Function} onNext      - Callback when "Next lesson" clicked
 * @param {Function} onComplete  - Callback to mark lesson complete
 * @param {boolean}  isCompleted - Whether current lesson is completed
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
}) {
    const typeLabels = {
        video: 'Video bài giảng',
        document: 'Tài liệu',
        flashcard: 'Flashcard',
        quiz: 'Bài kiểm tra',
    };

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
                            {typeLabels[lesson?.type] || 'Bài học'}
                        </span>
                        {lesson?.durationMinutes && (
                            <span className="text-[11px] text-base-content/40 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.durationMinutes} phút
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
            <div className="flex items-center gap-3 p-4 bg-base-200/50 rounded-xl border border-base-300">
                <img
                    src={expertAvatar || 'https://i.pravatar.cc/150?img=12'}
                    alt={expertName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-base-300"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-base-content">{expertName}</p>
                    <p className="text-xs text-base-content/50 font-medium">Giảng viên</p>
                </div>
                <button className="btn btn-sm btn-outline rounded-xl font-bold text-xs">
                    Xem hồ sơ
                </button>
            </div>

            {/* Tabs section: Description, Notes, Resources */}
            <ContentTabs lesson={lesson} gradient={gradient} />

            {/* Next lesson prompt */}
            {nextLesson && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4"
                >
                    <button
                        onClick={onNext}
                        className="w-full flex items-center gap-4 p-4 bg-base-200/50 hover:bg-base-200 rounded-xl border border-base-300 transition-all group"
                    >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-[11px] text-base-content/40 font-bold uppercase tracking-wider">
                                Bài tiếp theo
                            </p>
                            <p className="text-sm font-bold text-base-content truncate">
                                {nextLesson.title}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-base-content/30 group-hover:text-base-content/60 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}

// ─── Content Tabs ────────────────────────────────────────

function ContentTabs({ lesson, gradient }) {
    const tabs = [
        { id: 'description', label: 'Mô tả', icon: FileText },
        { id: 'notes', label: 'Ghi chú', icon: NotebookPen },
        { id: 'resources', label: 'Tài liệu', icon: Download },
        { id: 'discussion', label: 'Thảo luận', icon: MessageCircle },
    ];

    const [activeTab, setActiveTab] = useState('description');

    return (
        <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm">
            {/* Tab headers */}
            <div className="flex border-b border-base-300">
                {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-bold transition-all relative
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
                {activeTab === 'description' && (
                    <DescriptionTab lesson={lesson} />
                )}
                {activeTab === 'notes' && <NotesTab />}
                {activeTab === 'resources' && <ResourcesTab />}
                {activeTab === 'discussion' && <DiscussionTab />}
            </div>
        </div>
    );
}


function DescriptionTab({ lesson }) {
    return (
        <div className="space-y-3">
            <p className="text-sm text-base-content/70 leading-relaxed">
                Trong bài học này, bạn sẽ tìm hiểu chi tiết về <strong className="text-base-content">{lesson?.title}</strong>.
                Nội dung được giảng viên trình bày một cách trực quan, dễ hiểu với nhiều ví dụ thực tế
                giúp bạn nắm vững kiến thức cần thiết.
            </p>
            <div className="flex flex-wrap gap-2">
                {['Lý thuyết', 'Ví dụ minh họa', 'Bài tập áp dụng'].map((tag) => (
                    <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-base-200 text-[11px] font-bold text-base-content/60"
                    >
                        {tag}
                    </span>
                ))}
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
                <p className="text-[11px] text-base-content/40 font-medium">
                    Ghi chú được lưu tự động
                </p>
                <button className="btn btn-sm btn-primary rounded-xl font-bold text-xs">
                    Lưu ghi chú
                </button>
            </div>
        </div>
    );
}

function ResourcesTab() {
    const resources = [
        { name: 'Slide bài giảng.pdf', size: '2.4 MB', type: 'pdf' },
        { name: 'Bài tập thực hành.docx', size: '1.1 MB', type: 'doc' },
        { name: 'Code mẫu.zip', size: '856 KB', type: 'zip' },
    ];

    return (
        <div className="space-y-2">
            {resources.map((res, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors group cursor-pointer"
                >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-base-content truncate">{res.name}</p>
                        <p className="text-[11px] text-base-content/40">{res.size}</p>
                    </div>
                    <Download className="w-4 h-4 text-base-content/30 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
            ))}
        </div>
    );
}

function DiscussionTab() {
    const comments = [
        {
            name: 'Nguyễn Thảo Linh',
            avatar: 'https://i.pravatar.cc/150?img=25',
            time: '2 giờ trước',
            content: 'Phần giải thích rất dễ hiểu! Có thể cho thêm ví dụ về trường hợp đặc biệt không ạ?',
            likes: 5,
        },
        {
            name: 'Trần Minh Đức',
            avatar: 'https://i.pravatar.cc/150?img=14',
            time: '5 giờ trước',
            content: 'Cảm ơn giảng viên, bài giảng rất chất lượng. Đã bookmark lại!',
            likes: 12,
        },
    ];

    return (
        <div className="space-y-4">
            {/* Comment input */}
            <div className="flex items-start gap-3">
                <div className="avatar flex-shrink-0">
                    <div className="w-8 h-8 rounded-full">
                        <img src="https://i.pravatar.cc/150?img=33" alt="You" />
                    </div>
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Viết bình luận..."
                        className="input input-bordered input-sm w-full rounded-xl bg-base-200/50 border-base-300 text-sm"
                    />
                </div>
            </div>

            {/* Comments list */}
            <div className="space-y-3">
                {comments.map((c, i) => (
                    <div key={i} className="flex gap-3">
                        <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-base-content">{c.name}</span>
                                <span className="text-[10px] text-base-content/40">{c.time}</span>
                            </div>
                            <p className="text-xs text-base-content/60 leading-relaxed">{c.content}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                                <button className="flex items-center gap-1 text-[10px] text-base-content/40 hover:text-blue-500 transition-colors">
                                    <ThumbsUp className="w-3 h-3" /> {c.likes}
                                </button>
                                <button className="text-[10px] text-base-content/40 hover:text-blue-500 transition-colors font-bold">
                                    Trả lời
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
