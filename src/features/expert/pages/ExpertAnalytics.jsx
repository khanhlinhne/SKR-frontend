import { useState } from 'react';
import { motion } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    Eye,
    PlayCircle,
    ArrowUpRight,
    ChevronDown,
    Target,
    Activity,
    Percent,
    AlertTriangle,
    BookOpen,
    Monitor,
    Tablet,
    Smartphone,
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
const engagementStats = [
    { label: 'Tỷ lệ Hoàn thành', value: '72.4%', change: '+5.2%', trend: 'up', icon: Target, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Thời gian Xem TB', value: '18.5 phút', change: '+2.3 phút', trend: 'up', icon: Clock, gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Lượt xem Hôm nay', value: '1,247', change: '+18.7%', trend: 'up', icon: Eye, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Học viên Hoạt động', value: '456', change: '-3.1%', trend: 'down', icon: Users, gradient: 'from-amber-500 to-orange-600' },
];

const completionByChapter = [
    { chapter: 'Giới thiệu React', completion: 95, students: 432 },
    { chapter: 'Components & Props', completion: 82, students: 389 },
    { chapter: 'State & Lifecycle', completion: 68, students: 312 },
    { chapter: 'Hooks Cơ bản', completion: 55, students: 267 },
    { chapter: 'Context & Reducer', completion: 42, students: 198 },
    { chapter: 'Performance', completion: 35, students: 156 },
    { chapter: 'Testing', completion: 28, students: 112 },
    { chapter: 'Dự án cuối khóa', completion: 18, students: 78 },
];

const dropOffPoints = [
    { lesson: 'useEffect Deep Dive', chapter: 'State & Lifecycle', dropRate: 32, timestamp: '15:20', reason: 'Nội dung phức tạp' },
    { lesson: 'Redux Middleware', chapter: 'State Management', dropRate: 28, timestamp: '12:45', reason: 'Thiếu ví dụ thực tế' },
    { lesson: 'Testing với Jest', chapter: 'Testing', dropRate: 25, timestamp: '08:30', reason: 'Video quá dài' },
    { lesson: 'Custom Hooks', chapter: 'Hooks Cơ bản', dropRate: 22, timestamp: '18:10', reason: 'Khó hiểu' },
    { lesson: 'Performance Optimization', chapter: 'Performance', dropRate: 20, timestamp: '10:55', reason: 'Thiếu tương tác' },
];

const weeklyViews = [
    { day: 'T2', views: 180, duration: 15 },
    { day: 'T3', views: 220, duration: 18 },
    { day: 'T4', views: 195, duration: 16 },
    { day: 'T5', views: 260, duration: 20 },
    { day: 'T6', views: 240, duration: 19 },
    { day: 'T7', views: 310, duration: 22 },
    { day: 'CN', views: 290, duration: 21 },
];

const deviceBreakdown = [
    { device: 'Desktop', icon: Monitor, percentage: 52, color: 'from-blue-500 to-cyan-500' },
    { device: 'Mobile', icon: Smartphone, percentage: 35, color: 'from-violet-500 to-fuchsia-500' },
    { device: 'Tablet', icon: Tablet, percentage: 13, color: 'from-amber-500 to-orange-500' },
];

// ===== MAIN COMPONENT =====
export default function ExpertAnalytics() {
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [timeRange, setTimeRange] = useState('week');

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-violet-500" />
                            Dữ liệu & Thống kê
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Theo dõi hiệu suất và mức độ tương tác của học viên
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="select select-bordered select-sm rounded-xl bg-base-100 font-bold text-sm"
                        >
                            <option value="all">Tất cả khóa học</option>
                            <option value="react">React Masterclass</option>
                            <option value="python">Python Data Science</option>
                            <option value="uiux">UI/UX Design</option>
                        </select>
                        <div className="flex gap-1 bg-base-100 rounded-xl border border-base-300 p-0.5">
                            {['week', 'month', 'year'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`btn btn-sm rounded-lg font-bold ${timeRange === range
                                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none'
                                        : 'btn-ghost'
                                    }`}
                                >
                                    {range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : 'Năm'}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {engagementStats.map((stat, i) => {
                        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
                        return (
                            <motion.div
                                key={i}
                                variants={cardVariants}
                                className="bg-base-100 rounded-2xl p-5 shadow-lg border border-base-300"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg mb-3`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-xs text-base-content/60 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-2xl font-black text-base-content">{stat.value}</h3>
                                    <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${stat.trend === 'up' ? 'text-emerald-600 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                        <TrendIcon className="w-3 h-3" />
                                        {stat.change}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mid Row: Weekly Views Chart + Completion by Chapter */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Weekly Views */}
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-black text-base-content">Lượt xem theo Tuần</h3>
                                <p className="text-sm text-base-content/60">Dữ liệu 7 ngày qua</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                                    Lượt xem
                                </span>
                            </div>
                        </div>
                        <div className="flex items-end gap-3" style={{ height: '180px' }}>
                            {weeklyViews.map((item, i) => {
                                const maxViews = Math.max(...weeklyViews.map(d => d.views));
                                const heightPx = Math.round((item.views / (maxViews * 1.15)) * 168);
                                const isMax = item.views === maxViews;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-base-content text-base-100 px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {item.views} views • {item.duration} phút TB
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content rotate-45" />
                                        </div>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: heightPx }}
                                            transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                            className={`w-full rounded-xl transition-colors ${isMax
                                                ? 'bg-gradient-to-t from-violet-600 to-fuchsia-500 shadow-lg'
                                                : 'bg-violet-500/25 group-hover:bg-violet-500/50'
                                            }`}
                                        />
                                        <span className="text-[10px] text-base-content/50 font-bold">{item.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Completion by Chapter */}
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-black text-base-content">Hoàn thành theo Chương</h3>
                                <p className="text-sm text-base-content/60">Tỷ lệ % hoàn thành từng chương</p>
                            </div>
                        </div>
                        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                            {completionByChapter.map((ch, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.06 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 text-right">
                                        <span className="text-xs font-bold text-base-content/50">{i + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-base-content truncate max-w-[160px]">{ch.chapter}</span>
                                            <span className="text-xs font-black text-base-content">{ch.completion}%</span>
                                        </div>
                                        <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${ch.completion}%` }}
                                                transition={{ duration: 0.8, delay: 0.6 + i * 0.08 }}
                                                className={`h-full rounded-full ${ch.completion > 70
                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                                    : ch.completion > 40
                                                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                                                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-base-content/50 font-medium w-16 text-right">{ch.students} HV</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Row: Drop-off Points + Device Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Drop-off Points */}
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-5">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <h3 className="text-lg font-black text-base-content">Điểm Rơi (Drop-off Points)</h3>
                        </div>
                        <p className="text-sm text-base-content/60 mb-4">Các bài giảng có tỷ lệ học viên bỏ học cao nhất</p>
                        <div className="space-y-3">
                            {dropOffPoints.map((point, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex items-center gap-4 p-3 rounded-xl border border-base-300 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-black text-red-500">{point.dropRate}%</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-base-content">{point.lesson}</p>
                                        <p className="text-xs text-base-content/50">{point.chapter} • Tại phút {point.timestamp}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600">
                                            {point.reason}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Device Breakdown + Multi-device Preview hint */}
                    <motion.div variants={cardVariants} className="space-y-6">
                        <div className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
                            <h3 className="text-lg font-black text-base-content mb-5">Thiết bị Truy cập</h3>
                            <div className="space-y-4">
                                {deviceBreakdown.map((device, i) => {
                                    const DeviceIcon = device.icon;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + i * 0.1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${device.color} flex items-center justify-center shadow-md`}>
                                                <DeviceIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-base-content">{device.device}</span>
                                                    <span className="text-sm font-black text-base-content">{device.percentage}%</span>
                                                </div>
                                                <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${device.percentage}%` }}
                                                        transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${device.color}`}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Multi-device Preview CTA */}
                        <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-3xl p-6 border border-violet-500/20">
                            <div className="flex items-center gap-2 mb-3">
                                <Monitor className="w-5 h-5 text-violet-500" />
                                <Tablet className="w-4 h-4 text-violet-400" />
                                <Smartphone className="w-3.5 h-3.5 text-violet-300" />
                            </div>
                            <h3 className="font-black text-base-content text-sm mb-1">Xem trước Đa thiết bị</h3>
                            <p className="text-xs text-base-content/60 mb-3">
                                Kiểm tra giao diện khóa học trên Mobile, Tablet và Desktop
                            </p>
                            <button className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold shadow-lg shadow-violet-500/25 gap-1.5 w-full">
                                <Eye className="w-3.5 h-3.5" />
                                Xem trước ngay
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </ExpertLayout>
    );
}
