import { useState } from 'react';
import { motion } from 'motion/react';
import { AdminLayout } from '@/features/admin/components';
import {
    Users,
    BookOpen,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Eye,
    MoreHorizontal,
    UserPlus,
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from 'lucide-react';

// Animation variants - consistent with existing Dashboard.jsx pattern
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

// ===== MOCK DATA =====
const statsData = [
    {
        id: 'users',
        label: 'Tổng người dùng',
        value: '2,847',
        change: '+12.5%',
        trend: 'up',
        icon: Users,
        color: 'emerald',
        bgGradient: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'courses',
        label: 'Khóa học',
        value: '156',
        change: '+8.2%',
        trend: 'up',
        icon: BookOpen,
        color: 'blue',
        bgGradient: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'orders',
        label: 'Đơn hàng',
        value: '1,432',
        change: '+23.1%',
        trend: 'up',
        icon: ShoppingCart,
        color: 'violet',
        bgGradient: 'from-violet-500 to-purple-600',
    },
    {
        id: 'revenue',
        label: 'Doanh thu',
        value: '₫48.2M',
        change: '-3.4%',
        trend: 'down',
        icon: DollarSign,
        color: 'amber',
        bgGradient: 'from-amber-500 to-orange-600',
    },
];

const revenueData = [
    { month: 'T1', revenue: 12, orders: 85 },
    { month: 'T2', revenue: 18, orders: 120 },
    { month: 'T3', revenue: 15, orders: 98 },
    { month: 'T4', revenue: 22, orders: 145 },
    { month: 'T5', revenue: 28, orders: 180 },
    { month: 'T6', revenue: 25, orders: 165 },
    { month: 'T7', revenue: 32, orders: 210 },
    { month: 'T8', revenue: 38, orders: 245 },
    { month: 'T9', revenue: 35, orders: 225 },
    { month: 'T10', revenue: 42, orders: 280 },
    { month: 'T11', revenue: 45, orders: 295 },
    { month: 'T12', revenue: 48, orders: 310 },
];

const recentUsers = [
    { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', role: 'Learner', status: 'active', joinDate: '2 giờ trước', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@email.com', role: 'Premium', status: 'active', joinDate: '5 giờ trước', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, name: 'Lê Hoàng Cường', email: 'cuong.le@email.com', role: 'Learner', status: 'pending', joinDate: '1 ngày trước', avatar: 'https://i.pravatar.cc/150?img=8' },
    { id: 4, name: 'Phạm Minh Duy', email: 'duy.pham@email.com', role: 'Premium', status: 'active', joinDate: '1 ngày trước', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 5, name: 'Hoàng Thị Nga', email: 'nga.hoang@email.com', role: 'Learner', status: 'banned', joinDate: '3 ngày trước', avatar: 'https://i.pravatar.cc/150?img=9' },
];

const recentOrders = [
    { id: '#ORD-2847', course: 'Toán Cao Cấp Pro', user: 'Nguyễn Văn An', amount: '₫299,000', status: 'completed', date: '10 phút trước' },
    { id: '#ORD-2846', course: 'IELTS Speaking Pack', user: 'Trần Thị Bình', amount: '₫499,000', status: 'completed', date: '1 giờ trước' },
    { id: '#ORD-2845', course: 'Lập Trình Python', user: 'Lê Hoàng Cường', amount: '₫199,000', status: 'pending', date: '2 giờ trước' },
    { id: '#ORD-2844', course: 'Data Science Bundle', user: 'Phạm Minh Duy', amount: '₫799,000', status: 'completed', date: '4 giờ trước' },
    { id: '#ORD-2843', course: 'Tiếng Anh Cơ Bản', user: 'Hoàng Thị Nga', amount: '₫149,000', status: 'cancelled', date: '6 giờ trước' },
];

const topCourses = [
    { name: 'Toán Cao Cấp Pro', students: 567, revenue: '₫12.4M', rating: 4.8, growth: '+15%' },
    { name: 'IELTS Speaking Pack', students: 432, revenue: '₫9.8M', rating: 4.9, growth: '+22%' },
    { name: 'Lập Trình Python', students: 389, revenue: '₫7.2M', rating: 4.7, growth: '+8%' },
    { name: 'Data Science Bundle', students: 245, revenue: '₫5.6M', rating: 4.6, growth: '+31%' },
];

// ===== MAIN COMPONENT =====
export default function AdminDashboard() {
    const [timeRange, setTimeRange] = useState('month');

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page Title */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">Dashboard</h1>
                        <p className="text-sm text-base-content/60 mt-1">Tổng quan hoạt động hệ thống SKR</p>
                    </div>
                    <div className="flex gap-2">
                        {['week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`btn btn-sm font-bold rounded-xl ${timeRange === range
                                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none shadow-lg'
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

                {/* Mid Row: Revenue Chart + Top Courses */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <RevenueChart data={revenueData} />
                    <TopCoursesCard courses={topCourses} />
                </div>

                {/* Bottom Row: Recent Users + Recent Orders */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <RecentUsersTable users={recentUsers} />
                    <RecentOrdersTable orders={recentOrders} />
                </div>
            </motion.div>
        </AdminLayout>
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
                <h3 className="text-2xl lg:text-3xl font-black text-base-content">{stat.value}</h3>
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
    const maxRevenue = Math.max(...data.map(d => d.revenue));

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300 lg:col-span-2"
        >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <div>
                    <h3 className="text-lg font-black text-base-content">Biểu đồ Doanh thu</h3>
                    <p className="text-sm text-base-content/60">Tổng doanh thu 12 tháng qua</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                        Doanh thu (triệu ₫)
                    </span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="relative px-1">
                <div className="flex items-end gap-2" style={{ height: '192px' }}>
                    {data.map((item, i) => {
                        const heightPx = Math.round((item.revenue / (maxRevenue * 1.15)) * 180);
                        const isHighlighted = i === data.length - 1;

                        return (
                            <div key={i} className="flex-1 flex items-end justify-center min-w-0 group relative h-full">
                                {/* Tooltip on hover */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-base-content text-base-100 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    ₫{item.revenue}M
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content rotate-45" />
                                </div>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: heightPx }}
                                    transition={{ delay: 0.4 + i * 0.05, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    className={`w-full rounded-t-lg transition-colors ${isHighlighted
                                        ? 'bg-gradient-to-t from-emerald-600 to-cyan-500 shadow-lg'
                                        : 'bg-emerald-500/30 group-hover:bg-emerald-500/60'
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
                            <span className="text-[10px] text-base-content/50 font-bold">
                                {item.month}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function TopCoursesCard({ courses }) {
    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-base-content">Khóa học Nổi bật</h3>
                <button className="btn btn-ghost btn-xs font-bold text-emerald-600">
                    Xem tất cả
                    <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>

            <div className="space-y-4">
                {courses.map((course, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200 transition-colors group cursor-pointer"
                    >
                        {/* Rank */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${i === 0
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow'
                            : i === 1
                                ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
                                : i === 2
                                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                                    : 'bg-base-200 text-base-content/60'
                            }`}>
                            {i + 1}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-base-content truncate">{course.name}</h4>
                            <p className="text-xs text-base-content/60">
                                {course.students} học viên • ⭐ {course.rating}
                            </p>
                        </div>

                        {/* Revenue & Growth */}
                        <div className="text-right flex-shrink-0">
                            <p className="text-sm font-black text-base-content">{course.revenue}</p>
                            <p className="text-xs font-bold text-emerald-600">{course.growth}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

function RecentUsersTable({ users }) {
    const statusConfig = {
        active: { label: 'Hoạt động', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
        pending: { label: 'Chờ xác minh', icon: AlertCircle, color: 'text-amber-600 bg-amber-500/10' },
        banned: { label: 'Bị khóa', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
    };

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-black text-base-content">Người dùng Mới</h3>
                </div>
                <button className="btn btn-ghost btn-xs font-bold text-emerald-600">
                    Xem tất cả
                    <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table table-sm">
                    <thead>
                        <tr className="text-base-content/60">
                            <th className="font-bold text-xs uppercase">Người dùng</th>
                            <th className="font-bold text-xs uppercase">Vai trò</th>
                            <th className="font-bold text-xs uppercase">Trạng thái</th>
                            <th className="font-bold text-xs uppercase">Tham gia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, i) => {
                            const status = statusConfig[user.status];
                            const StatusIcon = status.icon;
                            return (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.08 }}
                                    className="hover:bg-base-200/50 cursor-pointer"
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="w-8 h-8 rounded-full">
                                                    <img src={user.avatar} alt={user.name} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-base-content">{user.name}</p>
                                                <p className="text-xs text-base-content/50">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-sm font-bold ${user.role === 'Premium' ? 'badge-warning' : 'badge-ghost'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg w-fit ${status.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {status.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-xs text-base-content/60 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {user.joinDate}
                                        </span>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

function RecentOrdersTable({ orders }) {
    const statusConfig = {
        completed: { label: 'Hoàn thành', color: 'text-emerald-600 bg-emerald-500/10', icon: CheckCircle2 },
        pending: { label: 'Đang xử lý', color: 'text-amber-600 bg-amber-500/10', icon: Activity },
        cancelled: { label: 'Đã hủy', color: 'text-red-500 bg-red-500/10', icon: XCircle },
    };

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-violet-500" />
                    <h3 className="text-lg font-black text-base-content">Đơn hàng Gần đây</h3>
                </div>
                <button className="btn btn-ghost btn-xs font-bold text-emerald-600">
                    Xem tất cả
                    <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table table-sm">
                    <thead>
                        <tr className="text-base-content/60">
                            <th className="font-bold text-xs uppercase">Mã đơn</th>
                            <th className="font-bold text-xs uppercase">Khóa học</th>
                            <th className="font-bold text-xs uppercase">Số tiền</th>
                            <th className="font-bold text-xs uppercase">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, i) => {
                            const status = statusConfig[order.status];
                            const StatusIcon = status.icon;
                            return (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.08 }}
                                    className="hover:bg-base-200/50 cursor-pointer"
                                >
                                    <td>
                                        <span className="font-mono font-bold text-sm text-base-content">{order.id}</span>
                                        <br />
                                        <span className="text-xs text-base-content/50">{order.date}</span>
                                    </td>
                                    <td>
                                        <p className="font-bold text-sm text-base-content truncate max-w-[150px]">{order.course}</p>
                                        <p className="text-xs text-base-content/50">{order.user}</p>
                                    </td>
                                    <td>
                                        <span className="font-black text-sm text-base-content">{order.amount}</span>
                                    </td>
                                    <td>
                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg w-fit ${status.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {status.label}
                                        </span>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

