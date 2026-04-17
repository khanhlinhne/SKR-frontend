import { useState } from 'react';
import { motion } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Calendar,
    Download,
    ShoppingCart,
    CreditCard,
    Wallet,
    BookOpen,
    Users,
    MoreHorizontal,
    Filter,
    PieChart,
    Tag,
    Gift,
    Banknote,
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
const revenueStats = [
    { label: 'Tổng Doanh thu', value: '₫148.5M', change: '+24.5%', trend: 'up', icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', period: 'Năm 2026' },
    { label: 'Doanh thu Tháng', value: '₫12.8M', change: '+18.3%', trend: 'up', icon: Wallet, gradient: 'from-violet-500 to-purple-600', period: 'Tháng 3' },
    { label: 'Đơn hàng Mới', value: '67', change: '+12 đơn', trend: 'up', icon: ShoppingCart, gradient: 'from-blue-500 to-cyan-600', period: 'Tháng này' },
    { label: 'Giá trị TB/Đơn', value: '₫191K', change: '-2.1%', trend: 'down', icon: CreditCard, gradient: 'from-amber-500 to-orange-600', period: 'Trung bình' },
];

const monthlyRevenue = [
    { month: 'T1', revenue: 8.2, orders: 42 },
    { month: 'T2', revenue: 10.5, orders: 55 },
    { month: 'T3', revenue: 9.8, orders: 48 },
    { month: 'T4', revenue: 12.1, orders: 63 },
    { month: 'T5', revenue: 11.4, orders: 59 },
    { month: 'T6', revenue: 14.2, orders: 72 },
    { month: 'T7', revenue: 13.5, orders: 68 },
    { month: 'T8', revenue: 15.8, orders: 81 },
    { month: 'T9', revenue: 14.9, orders: 76 },
    { month: 'T10', revenue: 16.5, orders: 85 },
    { month: 'T11', revenue: 18.2, orders: 92 },
    { month: 'T12', revenue: 12.8, orders: 67 },
];

const revenueByCourse = [
    { name: 'React & Next.js Masterclass', revenue: '₫52.4M', orders: 342, percentage: 35, color: 'from-violet-500 to-purple-500' },
    { name: 'Python cho Data Science', revenue: '₫38.6M', orders: 289, percentage: 26, color: 'from-blue-500 to-cyan-500' },
    { name: 'UI/UX Design Fundamentals', revenue: '₫28.9M', orders: 198, percentage: 19, color: 'from-emerald-500 to-teal-500' },
    { name: 'Machine Learning Căn bản', revenue: '₫18.2M', orders: 112, percentage: 12, color: 'from-amber-500 to-orange-500' },
    { name: 'Khác', revenue: '₫10.4M', orders: 78, percentage: 8, color: 'from-slate-400 to-slate-500' },
];

const revenueBySource = [
    { source: 'Bán khóa học', value: '₫120.5M', icon: BookOpen, percentage: 81, color: 'text-violet-500 bg-violet-500/10' },
    { source: 'Coaching 1-1', value: '₫18.2M', icon: Users, percentage: 12, color: 'text-blue-500 bg-blue-500/10' },
    { source: 'Bản quyền nội dung', value: '₫9.8M', icon: Banknote, percentage: 7, color: 'text-emerald-500 bg-emerald-500/10' },
];

const recentOrders = [
    { id: '#EXP-1284', student: 'Nguyễn Văn An', avatar: 'https://i.pravatar.cc/150?img=1', course: 'React Masterclass', amount: '₫499,000', date: '1 giờ trước', method: 'Momo' },
    { id: '#EXP-1283', student: 'Trần Thị Bình', avatar: 'https://i.pravatar.cc/150?img=5', course: 'Python Data Science', amount: '₫399,000', date: '3 giờ trước', method: 'Bank Transfer' },
    { id: '#EXP-1282', student: 'Lê Hoàng Cường', avatar: 'https://i.pravatar.cc/150?img=8', course: 'React Masterclass', amount: '₫499,000', date: '5 giờ trước', method: 'VNPay' },
    { id: '#EXP-1281', student: 'Phạm Minh Duy', avatar: 'https://i.pravatar.cc/150?img=11', course: 'UI/UX Design', amount: '₫349,000', date: '8 giờ trước', method: 'Credit Card' },
    { id: '#EXP-1280', student: 'Hoàng Thị Nga', avatar: 'https://i.pravatar.cc/150?img=9', course: 'ML Căn bản', amount: '₫299,000', date: '1 ngày trước', method: 'Momo' },
];

// ===== MAIN COMPONENT =====
export default function ExpertRevenue() {
    const [timeRange, setTimeRange] = useState('year');

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                            <DollarSign className="w-8 h-8 text-emerald-500" />
                            Báo cáo Doanh thu
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Theo dõi thu nhập và phân tích nguồn doanh thu
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <Download className="w-4 h-4" />
                            Xuất báo cáo
                        </button>
                        <div className="flex gap-1 bg-base-100 rounded-xl border border-base-300 p-0.5">
                            {['month', 'quarter', 'year'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`btn btn-sm rounded-lg font-bold ${timeRange === range
                                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none'
                                        : 'btn-ghost'
                                    }`}
                                >
                                    {range === 'month' ? 'Tháng' : range === 'quarter' ? 'Quý' : 'Năm'}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {revenueStats.map((stat, i) => {
                        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
                        return (
                            <motion.div key={i} variants={cardVariants} className="bg-base-100 rounded-2xl p-5 shadow-lg border border-base-300">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full">{stat.period}</span>
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

                {/* Revenue Chart + By Source */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Monthly Revenue Chart */}
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300 lg:col-span-2">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-black text-base-content">Doanh thu theo Tháng</h3>
                                <p className="text-sm text-base-content/60">Biểu đồ doanh thu 12 tháng qua</p>
                            </div>
                        </div>
                        <div className="relative px-1">
                            <div className="flex items-end gap-2" style={{ height: '200px' }}>
                                {monthlyRevenue.map((item, i) => {
                                    const maxRev = Math.max(...monthlyRevenue.map(d => d.revenue));
                                    const heightPx = Math.round((item.revenue / (maxRev * 1.15)) * 188);
                                    const isHighlighted = i === monthlyRevenue.length - 1;
                                    return (
                                        <div key={i} className="flex-1 flex items-end justify-center min-w-0 group relative h-full">
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-base-content text-base-100 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                ₫{item.revenue}M • {item.orders} đơn
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content rotate-45" />
                                            </div>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: heightPx }}
                                                transition={{ delay: 0.4 + i * 0.05, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                className={`w-full rounded-t-lg transition-colors ${isHighlighted
                                                    ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-lg'
                                                    : 'bg-emerald-500/25 group-hover:bg-emerald-500/50'
                                                }`}
                                                style={{ minHeight: heightPx > 0 ? '4px' : '0' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-2 mt-2">
                                {monthlyRevenue.map((item, i) => (
                                    <div key={i} className="flex-1 text-center">
                                        <span className="text-[10px] text-base-content/50 font-bold">{item.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Revenue by Source */}
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
                        <h3 className="text-lg font-black text-base-content mb-5">Nguồn Doanh thu</h3>
                        <div className="space-y-4">
                            {revenueBySource.map((source, i) => {
                                const SourceIcon = source.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${source.color}`}>
                                            <SourceIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-bold text-base-content">{source.source}</span>
                                                <span className="text-sm font-black text-base-content">{source.value}</span>
                                            </div>
                                            <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${source.percentage}%` }}
                                                    transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                                />
                                            </div>
                                            <p className="text-[10px] text-base-content/50 mt-0.5 text-right">{source.percentage}%</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Revenue by Course + Recent Orders */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Revenue by Course */}
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-violet-500" />
                                <h3 className="text-lg font-black text-base-content">Doanh thu theo Khóa học</h3>
                            </div>
                            <button className="btn btn-ghost btn-xs font-bold text-violet-600">
                                Chi tiết <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {revenueByCourse.map((course, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.08 }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-base-content truncate">{course.name}</h4>
                                        <p className="text-xs text-base-content/50">{course.orders} đơn hàng</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-black text-sm text-base-content">{course.revenue}</p>
                                        <p className="text-[10px] font-bold text-violet-600">{course.percentage}%</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Orders */}
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-lg font-black text-base-content">Đơn hàng Gần đây</h3>
                            </div>
                            <button className="btn btn-ghost btn-xs font-bold text-violet-600">
                                Xem tất cả <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr className="text-base-content/60">
                                        <th className="font-bold text-xs uppercase">Học viên</th>
                                        <th className="font-bold text-xs uppercase">Khóa học</th>
                                        <th className="font-bold text-xs uppercase">Số tiền</th>
                                        <th className="font-bold text-xs uppercase">Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, i) => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + i * 0.08 }}
                                            className="hover:bg-base-200/50"
                                        >
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="avatar">
                                                        <div className="w-7 h-7 rounded-full">
                                                            <img src={order.avatar} alt={order.student} />
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-xs text-base-content">{order.student}</span>
                                                </div>
                                            </td>
                                            <td className="text-xs text-base-content/70 max-w-[120px] truncate">{order.course}</td>
                                            <td className="font-black text-xs text-emerald-600">{order.amount}</td>
                                            <td className="text-[11px] text-base-content/50">{order.date}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </ExpertLayout>
    );
}
