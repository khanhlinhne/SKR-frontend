import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import {
    MessageCircleQuestion,
    Search,
    Filter,
    Send,
    Clock,
    CheckCircle2,
    Star,
    User,
    BookOpen,
    ChevronDown,
    ThumbsUp,
    MessageSquare,
    AlertCircle,
    ArrowUpRight,
    Pin,
    CornerDownRight,
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

// ===== MOCK DATA =====
const questionsData = [
    {
        id: 1,
        student: 'Trần Minh Khoa',
        avatar: 'https://i.pravatar.cc/150?img=3',
        question: 'Sự khác nhau giữa useMemo và useCallback là gì? Khi nào nên dùng cái nào?',
        course: 'React & Next.js Masterclass',
        lesson: 'Bài 15: Hooks nâng cao',
        time: '30 phút trước',
        status: 'pending',
        priority: 'high',
        upvotes: 12,
        replies: 0,
        pinned: false,
    },
    {
        id: 2,
        student: 'Lê Thị Hồng',
        avatar: 'https://i.pravatar.cc/150?img=5',
        question: 'Em không hiểu phần useEffect cleanup function. Tại sao cần return một function bên trong useEffect?',
        course: 'React & Next.js Masterclass',
        lesson: 'Bài 10: useEffect Deep Dive',
        time: '2 giờ trước',
        status: 'pending',
        priority: 'high',
        upvotes: 8,
        replies: 0,
        pinned: true,
    },
    {
        id: 3,
        student: 'Nguyễn Văn Bình',
        avatar: 'https://i.pravatar.cc/150?img=8',
        question: 'Pandas DataFrame và Series khác nhau ở điểm nào? Khi nào dùng mỗi loại?',
        course: 'Python cho Data Science',
        lesson: 'Bài 5: Pandas cơ bản',
        time: '4 giờ trước',
        status: 'pending',
        priority: 'medium',
        upvotes: 5,
        replies: 0,
        pinned: false,
    },
    {
        id: 4,
        student: 'Phạm Thanh Tùng',
        avatar: 'https://i.pravatar.cc/150?img=11',
        question: 'Em muốn hỏi về cách tối ưu re-render trong React. Có best practices nào không ạ?',
        course: 'React & Next.js Masterclass',
        lesson: 'Bài 18: Performance',
        time: '1 ngày trước',
        status: 'answered',
        priority: 'medium',
        upvotes: 15,
        replies: 2,
        pinned: false,
        answer: 'Có nhiều cách tối ưu: 1) React.memo cho component, 2) useMemo cho giá trị tính toán, 3) useCallback cho callback functions...',
    },
    {
        id: 5,
        student: 'Hoàng Thị Nga',
        avatar: 'https://i.pravatar.cc/150?img=9',
        question: 'Cách sử dụng Figma Auto Layout hiệu quả cho responsive design?',
        course: 'UI/UX Design Fundamentals',
        lesson: 'Bài 8: Auto Layout',
        time: '2 ngày trước',
        status: 'answered',
        priority: 'low',
        upvotes: 7,
        replies: 1,
        pinned: false,
        answer: 'Auto Layout giúp bạn tạo design responsive dễ dàng. Hãy bắt đầu từ component nhỏ nhất...',
    },
    {
        id: 6,
        student: 'Vũ Đức Anh',
        avatar: 'https://i.pravatar.cc/150?img=14',
        question: 'Làm sao để triển khai Next.js app lên Vercel? Em gặp lỗi khi build.',
        course: 'React & Next.js Masterclass',
        lesson: 'Bài 24: Deployment',
        time: '3 ngày trước',
        status: 'answered',
        priority: 'low',
        upvotes: 3,
        replies: 3,
        pinned: false,
    },
];

const statsData = [
    { label: 'Chờ trả lời', value: 3, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Đã trả lời', value: 3, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Tổng câu hỏi', value: 6, color: 'text-violet-500 bg-violet-500/10' },
    { label: 'TB phản hồi', value: '2.5h', color: 'text-blue-500 bg-blue-500/10' },
];

// ===== MAIN COMPONENT =====
export default function ExpertQAHub() {
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCourse, setFilterCourse] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [replyText, setReplyText] = useState('');

    const filteredQuestions = questionsData.filter(q => {
        const matchSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase())
            || q.student.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'all'
            || (filterStatus === 'pending' && q.status === 'pending')
            || (filterStatus === 'answered' && q.status === 'answered');
        const matchCourse = filterCourse === 'all' || q.course.includes(filterCourse);
        return matchSearch && matchStatus && matchCourse;
    });

    const sortedQuestions = [...filteredQuestions].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.upvotes - a.upvotes;
    });

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                            <MessageCircleQuestion className="w-8 h-8 text-violet-500" />
                            Trung tâm Hỏi đáp
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Quản lý câu hỏi từ học viên, lọc theo ưu tiên và trả lời nhanh
                        </p>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {statsData.map((stat, i) => (
                        <div key={i} className="bg-base-100 rounded-xl p-4 border border-base-300 shadow-sm text-center">
                            <p className="text-2xl font-black text-base-content">{stat.value}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-block ${stat.color}`}>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* Toolbar */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi hoặc học viên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input input-bordered w-full pl-10 rounded-xl bg-base-100 text-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>
                    <div className="flex gap-1 bg-base-100 rounded-xl border border-base-300 p-1">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'pending', label: 'Chờ trả lời' },
                            { value: 'answered', label: 'Đã trả lời' },
                        ].map(f => (
                            <button
                                key={f.value}
                                onClick={() => setFilterStatus(f.value)}
                                className={`btn btn-sm rounded-lg font-bold ${filterStatus === f.value
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none'
                                    : 'btn-ghost'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="select select-bordered select-sm rounded-xl bg-base-100 font-bold"
                    >
                        <option value="all">Tất cả khóa học</option>
                        <option value="React">React Masterclass</option>
                        <option value="Python">Python Data Science</option>
                        <option value="UI/UX">UI/UX Design</option>
                    </select>
                </motion.div>

                {/* Questions List */}
                <div className="space-y-4">
                    {sortedQuestions.map((q, i) => {
                        const isExpanded = expandedQuestion === q.id;
                        const priorityColors = {
                            high: 'border-l-red-500',
                            medium: 'border-l-amber-500',
                            low: 'border-l-blue-500',
                        };

                        return (
                            <motion.div
                                key={q.id}
                                variants={cardVariants}
                                className={`bg-base-100 rounded-2xl border border-base-300 shadow-lg overflow-hidden border-l-4 ${priorityColors[q.priority]}`}
                            >
                                <div
                                    className="p-5 cursor-pointer hover:bg-base-200/30 transition-colors"
                                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="avatar flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full ring-2 ring-base-300 ring-offset-1 ring-offset-base-100">
                                                <img src={q.avatar} alt={q.student} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-bold text-sm text-base-content">{q.student}</span>
                                                {q.pinned && (
                                                    <span className="text-[10px] font-bold text-fuchsia-500 bg-fuchsia-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                        <Pin className="w-3 h-3" />Ghim
                                                    </span>
                                                )}
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${q.status === 'pending' ? 'text-amber-600 bg-amber-500/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                                                    {q.status === 'pending' ? 'Chờ trả lời' : 'Đã trả lời'}
                                                </span>
                                            </div>
                                            <p className="text-base-content font-medium text-sm leading-relaxed">{q.question}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-base-content/50">
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" />
                                                    {q.lesson}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {q.time}
                                                </span>
                                                <span className="flex items-center gap-1 font-bold text-violet-500">
                                                    <ThumbsUp className="w-3 h-3" />
                                                    {q.upvotes}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {q.replies} trả lời
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded: Answer / Reply */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-base-300 overflow-hidden"
                                        >
                                            {/* Existing Answer */}
                                            {q.answer && (
                                                <div className="px-5 py-4 bg-emerald-500/5">
                                                    <div className="flex items-start gap-3">
                                                        <CornerDownRight className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-sm text-emerald-600">Câu trả lời của bạn</span>
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                            </div>
                                                            <p className="text-sm text-base-content/80">{q.answer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Reply Input */}
                                            <div className="px-5 py-4">
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <textarea
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder={q.answer ? 'Thêm trả lời...' : 'Viết câu trả lời của bạn...'}
                                                            rows={3}
                                                            className="textarea textarea-bordered w-full rounded-xl text-sm resize-none focus:border-violet-500 bg-base-200/50"
                                                        />
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex gap-2">
                                                                <button className="btn btn-xs btn-ghost rounded-lg font-bold gap-1">
                                                                    <Pin className="w-3 h-3" />
                                                                    {q.pinned ? 'Bỏ ghim' : 'Ghim'}
                                                                </button>
                                                            </div>
                                                            <button className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5 shadow-lg shadow-violet-500/25">
                                                                <Send className="w-3.5 h-3.5" />
                                                                Gửi trả lời
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {sortedQuestions.length === 0 && (
                    <motion.div variants={cardVariants} className="text-center py-16">
                        <MessageCircleQuestion className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
                        <h3 className="text-lg font-black text-base-content/50">Không có câu hỏi nào</h3>
                        <p className="text-sm text-base-content/40">Câu hỏi từ học viên sẽ hiển thị tại đây</p>
                    </motion.div>
                )}
            </motion.div>
        </ExpertLayout>
    );
}
