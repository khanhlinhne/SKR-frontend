import { useState } from 'react';
import { motion } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import {
    BookOpen,
    Users,
    DollarSign,
    Star,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    MoreHorizontal,
    Clock,
    Eye,
    PlayCircle,
    FileText,
    MessageCircleQuestion,
    CheckCircle2,
    Pencil,
    Upload,
    Sparkles,
} from 'lucide-react';

// ===== ANIMATION VARIANTS =====
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

// ===== MOCK DATA =====
const statsData = [
    {
        id: 'courses',
        label: 'Khóa học',
        value: '12',
        subLabel: '3 đang soạn',
        change: '+2',
        trend: 'up',
        icon: BookOpen,
        bgGradient: 'from-violet-500 to-purple-600',
    },
    {
        id: 'students',
        label: 'Học viên',
        value: '1,284',
        subLabel: 'Đang theo học',
        change: '+18.3%',
        trend: 'up',
        icon: Users,
        bgGradient: 'from-blue-500 to-cyan-600',
    },
    {
        id: 'revenue',
        label: 'Doanh thu tháng',
        value: '₫12.8M',
        subLabel: 'Tháng 3/2026',
        change: '+24.5%',
        trend: 'up',
        icon: DollarSign,
        bgGradient: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'rating',
        label: 'Đánh giá TB',
        value: '4.82',
        subLabel: '256 đánh giá',
        change: '+0.12',
        trend: 'up',
        icon: Star,
        bgGradient: 'from-amber-500 to-orange-600',
    },
];

const revenueMonthly = [
    { month: 'T1', value: 5.2 },
    { month: 'T2', value: 7.8 },
    { month: 'T3', value: 6.4 },
    { month: 'T4', value: 9.1 },
    { month: 'T5', value: 8.3 },
    { month: 'T6', value: 11.2 },
    { month: 'T7', value: 10.5 },
    { month: 'T8', value: 12.8 },
    { month: 'T9', value: 11.9 },
    { month: 'T10', value: 14.2 },
    { month: 'T11', value: 13.5 },
    { month: 'T12', value: 12.8 },
];

const myCourses = [
    { id: 1, name: 'React & Next.js Masterclass', students: 432, rating: 4.9, revenue: '₫4.2M', status: 'published', completionRate: 78 },
    { id: 2, name: 'Python cho Data Science', students: 289, rating: 4.7, revenue: '₫2.8M', status: 'published', completionRate: 65 },
    { id: 3, name: 'UI/UX Design Fundamentals', students: 156, rating: 4.8, revenue: '₫1.5M', status: 'published', completionRate: 82 },
    { id: 4, name: 'Machine Learning Căn bản', students: 0, rating: 0, revenue: '₫0', status: 'draft', completionRate: 0 },
];

const recentActivities = [
    { id: 1, type: 'upload', message: 'Đã tải lên video bài giảng "Redux Toolkit"', time: '15 phút trước', icon: Upload },
    { id: 2, type: 'question', message: 'Học viên hỏi về React Hooks tại bài 12', time: '1 giờ trước', icon: MessageCircleQuestion },
    { id: 3, type: 'edit', message: 'Cập nhật nội dung chương 3 - State Management', time: '2 giờ trước', icon: Pencil },
    { id: 4, type: 'review', message: '5 đánh giá mới cho khóa React Masterclass', time: '3 giờ trước', icon: Star },
    { id: 5, type: 'ai', message: 'Trợ lý AI đã tạo 10 câu hỏi trắc nghiệm', time: '5 giờ trước', icon: Sparkles },
    { id: 6, type: 'publish', message: 'Bài giảng "useEffect Deep Dive" đã được duyệt', time: '1 ngày trước', icon: CheckCircle2 },
];

const pendingQuestions = [
    { id: 1, student: 'Trần Minh Khoa', avatar: 'https://i.pravatar.cc/150?img=3', question: 'Sự khác nhau giữa useMemo và useCallback?', course: 'React Masterclass', time: '30 phút trước', priority: 'high' },
    { id: 2, student: 'Lê Thị Hồng', avatar: 'https://i.pravatar.cc/150?img=5', question: 'Cách tối ưu render trong React?', course: 'React Masterclass', time: '2 giờ trước', priority: 'medium' },
    { id: 3, student: 'Nguyễn Văn Bình', avatar: 'https://i.pravatar.cc/150?img=8', question: 'Pandas DataFrame vs Series?', course: 'Python Data Science', time: '4 giờ trước', priority: 'low' },
];

// ===== MAIN COMPONENT =====
export default function ExpertDashboard() {
    const [timeRange, setTimeRange] = useState('month');

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Page Title */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">Tổng quan</h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Theo dõi hiệu suất và quản lý nội dung của bạn
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {['week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`btn btn-sm font-bold rounded-xl ${timeRange === range
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none shadow-lg shadow-violet-500/25'
                                    : 'btn-ghost'
                                }`}
                            >
                                {range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : 'Năm'}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                    {statsData.map((stat) => (
                        <StatsCard key={stat.id} stat={stat} />
                    ))}
                </div>

                {/* Mid Row: Revenue Chart + My Courses */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <RevenueChart data={revenueMonthly} />
                    <MyCoursesCard courses={myCourses} />
                </div>

                {/* Bottom Row: Recent Activity + Pending Questions */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <RecentActivityTimeline activities={recentActivities} />
                    <PendingQuestionsCard questions={pendingQuestions} />
                </div>
            </motion.div>
        </ExpertLayout>
    );
}

// ===== SUB-COMPONENTS =====

function StatsCard({ stat }) {
    const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl p-5 shadow-lg border border-base-300 hover:shadow-xl transition-shadow group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                </div>
                <button className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
            <p className="text-xs text-base-content/60 font-bold uppercase tracking-wider mb-1">
                {stat.label}
            </p>
            <div className="flex items-end justify-between">
                <div>
                    <h3 className="text-2xl lg:text-3xl font-black text-base-content">{stat.value}</h3>
                    <p className="text-[11px] text-base-content/50 font-medium mt-0.5">{stat.subLabel}</p>
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${stat.trend === 'up'
                    ? 'text-emerald-600 bg-emerald-500/10'
                    : 'text-red-500 bg-red-500/10'
                }`}>
                    <TrendIcon className="w-3 h-3" />
                    {stat.change}
                </span>
            </div>
        </motion.div>
    );
}

function RevenueChart({ data }) {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300 lg:col-span-2"
        >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <div>
                    <h3 className="text-lg font-black text-base-content">Biểu đồ Doanh thu</h3>
                    <p className="text-sm text-base-content/60">Thu nhập 12 tháng qua</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                        Doanh thu (triệu ₫)
                    </span>
                </div>
            </div>

            <div className="relative px-1">
                <div className="flex items-end gap-2" style={{ height: '192px' }}>
                    {data.map((item, i) => {
                        const heightPx = Math.round((item.value / (maxValue * 1.15)) * 180);
                        const isHighlighted = i === data.length - 1;

                        return (
                            <div key={i} className="flex-1 flex items-end justify-center min-w-0 group relative h-full">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-base-content text-base-100 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    ₫{item.value}M
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content rotate-45" />
                                </div>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: heightPx }}
                                    transition={{ delay: 0.4 + i * 0.05, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    className={`w-full rounded-t-lg transition-colors ${isHighlighted
                                        ? 'bg-gradient-to-t from-violet-600 to-fuchsia-500 shadow-lg'
                                        : 'bg-violet-500/30 group-hover:bg-violet-500/60'
                                    }`}
                                    style={{ minHeight: heightPx > 0 ? '4px' : '0' }}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-2 mt-2">
                    {data.map((item, i) => (
                        <div key={i} className="flex-1 text-center">
                            <span className="text-[10px] text-base-content/50 font-bold">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function MyCoursesCard({ courses }) {
    const statusConfig = {
        published: { label: 'Đã xuất bản', color: 'text-emerald-600 bg-emerald-500/10' },
        draft: { label: 'Bản nháp', color: 'text-amber-600 bg-amber-500/10' },
        archived: { label: 'Lưu trữ', color: 'text-slate-500 bg-slate-500/10' },
    };

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-base-content">Khóa học của tôi</h3>
                <button className="btn btn-ghost btn-xs font-bold text-violet-600">
                    Xem tất cả
                    <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>

            <div className="space-y-3">
                {courses.map((course, i) => {
                    const status = statusConfig[course.status];
                    return (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200 transition-colors cursor-pointer group"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${i === 0 ? 'from-violet-500 to-purple-600' : i === 1 ? 'from-blue-500 to-cyan-600' : i === 2 ? 'from-emerald-500 to-teal-600' : 'from-slate-400 to-slate-500'} flex items-center justify-center shadow-md`}>
                                {course.status === 'draft'
                                    ? <Pencil className="w-5 h-5 text-white" />
                                    : <PlayCircle className="w-5 h-5 text-white" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-base-content truncate">{course.name}</h4>
                                <p className="text-xs text-base-content/60">
                                    {course.students > 0 ? `${course.students} học viên • ⭐ ${course.rating}` : 'Chưa xuất bản'}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${status.color}`}>
                                    {status.label}
                                </span>
                                {course.revenue !== '₫0' && (
                                    <p className="text-xs font-black text-base-content mt-0.5">{course.revenue}</p>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function RecentActivityTimeline({ activities }) {
    const typeColors = {
        upload: 'text-blue-500 bg-blue-500/10',
        question: 'text-amber-500 bg-amber-500/10',
        edit: 'text-violet-500 bg-violet-500/10',
        review: 'text-yellow-500 bg-yellow-500/10',
        ai: 'text-fuchsia-500 bg-fuchsia-500/10',
        publish: 'text-emerald-500 bg-emerald-500/10',
    };

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-violet-500" />
                    <h3 className="text-lg font-black text-base-content">Hoạt động Gần đây</h3>
                </div>
                <button className="btn btn-ghost btn-xs font-bold text-violet-600">
                    Xem tất cả
                    <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>

            <div className="space-y-1">
                {activities.map((activity, i) => {
                    const ActivityIcon = activity.icon;
                    const color = typeColors[activity.type] || 'text-slate-500 bg-slate-500/10';

                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.08 }}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-base-200/50 transition-colors"
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                                <ActivityIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-base-content font-medium leading-snug">{activity.message}</p>
                                <p className="text-xs text-base-content/50 mt-0.5">{activity.time}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function PendingQuestionsCard({ questions }) {
    const priorityConfig = {
        high: { label: 'Cao', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
        medium: { label: 'TB', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        low: { label: 'Thấp', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    };

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <MessageCircleQuestion className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-black text-base-content">Câu hỏi Chờ trả lời</h3>
                    <span className="badge badge-sm badge-warning font-bold">{questions.length}</span>
                </div>
                <button className="btn btn-ghost btn-xs font-bold text-violet-600">
                    Xem tất cả
                    <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>

            <div className="space-y-3">
                {questions.map((q, i) => {
                    const prio = priorityConfig[q.priority];
                    return (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="p-3 rounded-xl border border-base-300 hover:border-violet-500/30 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="avatar flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full">
                                        <img src={q.avatar} alt={q.student} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-sm text-base-content">{q.student}</p>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${prio.color}`}>
                                            {prio.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-base-content/80 line-clamp-2">{q.question}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[11px] text-base-content/50 font-medium">{q.course}</span>
                                        <span className="text-base-content/30">•</span>
                                        <span className="text-[11px] text-base-content/50">{q.time}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
