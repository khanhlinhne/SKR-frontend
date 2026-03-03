import { useState } from 'react';
import * as motion from 'motion/react-client';
import { AdminLayout } from '../../components/admin';
import {
    Search,
    Download,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Filter,
} from 'lucide-react';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

// Mock data
const statsCards = [
    { label: 'Tổng đơn hàng', value: '1,432', change: '+23.1%', icon: ShoppingCart, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Doanh thu', value: '₫48.2M', change: '+15.8%', icon: DollarSign, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Đang xử lý', value: '18', change: '-5 so với hôm qua', icon: Clock, gradient: 'from-amber-500 to-orange-600' },
];

const mockOrders = [
    { id: '#ORD-2847', user: 'Nguyễn Văn An', email: 'an.nguyen@email.com', course: 'Toán Cao Cấp Pro', amount: '₫299,000', status: 'completed', payment: 'MoMo', date: '03/03/2026 10:30', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '#ORD-2846', user: 'Trần Thị Bình', email: 'binh.tran@email.com', course: 'IELTS Speaking Pack', amount: '₫499,000', status: 'completed', payment: 'ZaloPay', date: '03/03/2026 09:15', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: '#ORD-2845', user: 'Lê Hoàng Cường', email: 'cuong.le@email.com', course: 'Lập Trình Python', amount: '₫199,000', status: 'pending', payment: 'Chuyển khoản', date: '03/03/2026 08:45', avatar: 'https://i.pravatar.cc/150?img=8' },
    { id: '#ORD-2844', user: 'Phạm Minh Duy', email: 'duy.pham@email.com', course: 'Data Science Bundle', amount: '₫799,000', status: 'completed', payment: 'VNPay', date: '02/03/2026 22:10', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: '#ORD-2843', user: 'Hoàng Thị Nga', email: 'nga.hoang@email.com', course: 'Tiếng Anh Cơ Bản', amount: '₫149,000', status: 'cancelled', payment: 'MoMo', date: '02/03/2026 18:30', avatar: 'https://i.pravatar.cc/150?img=9' },
    { id: '#ORD-2842', user: 'Võ Đình Khoa', email: 'khoa.vo@email.com', course: 'Toán Cao Cấp Pro', amount: '₫299,000', status: 'completed', payment: 'ZaloPay', date: '02/03/2026 15:20', avatar: 'https://i.pravatar.cc/150?img=14' },
    { id: '#ORD-2841', user: 'Bùi Thị Lan', email: 'lan.bui@email.com', course: 'IELTS Writing Pro', amount: '₫599,000', status: 'pending', payment: 'Chuyển khoản', date: '02/03/2026 12:05', avatar: 'https://i.pravatar.cc/150?img=20' },
];

const statusConfig = {
    completed: { label: 'Hoàn thành', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
    pending: { label: 'Đang xử lý', icon: Activity, color: 'text-amber-600 bg-amber-500/10' },
    cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
};

export default function AdminOrders() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredOrders = mockOrders.filter(order => {
        const matchSearch = order.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.course.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">Quản lý Đơn hàng</h1>
                        <p className="text-sm text-base-content/60 mt-1">Quản lý và theo dõi tất cả đơn hàng</p>
                    </div>
                    <button className="btn btn-sm btn-ghost font-bold rounded-xl gap-1">
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {statsCards.map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={cardVariants}
                            className="bg-base-100 rounded-2xl p-5 shadow-lg border border-base-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/60 font-bold uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-2xl font-black text-base-content">{stat.value}</p>
                                    <p className="text-xs font-bold text-emerald-600">{stat.change}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl p-4 shadow-lg border border-base-300 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Tìm theo mã đơn, tên, khóa học..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input input-bordered w-full pl-10 rounded-xl bg-base-200 border-base-300 focus:border-emerald-500 text-sm"
                            />
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="select select-bordered select-sm rounded-xl bg-base-200 border-base-300 font-bold text-sm"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="pending">Đang xử lý</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                </motion.div>

                {/* Orders Table */}
                <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl shadow-lg border border-base-300 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="bg-base-200/50">
                                    <th className="font-bold text-xs uppercase text-base-content/60">Mã đơn</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Khách hàng</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Khóa học</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Số tiền</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Thanh toán</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Trạng thái</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Ngày tạo</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, i) => {
                                    const status = statusConfig[order.status];
                                    const StatusIcon = status.icon;
                                    return (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + i * 0.05 }}
                                            className="hover:bg-base-200/50 cursor-pointer group"
                                        >
                                            <td>
                                                <span className="font-mono font-bold text-sm text-base-content">{order.id}</span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="w-8 h-8 rounded-full">
                                                            <img src={order.avatar} alt={order.user} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{order.user}</p>
                                                        <p className="text-xs text-base-content/50">{order.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="font-bold text-sm truncate max-w-[160px]">{order.course}</p>
                                            </td>
                                            <td>
                                                <span className="font-black text-sm text-base-content">{order.amount}</span>
                                            </td>
                                            <td>
                                                <span className="badge badge-sm badge-ghost font-bold">{order.payment}</span>
                                            </td>
                                            <td>
                                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg w-fit ${status.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-xs text-base-content/60">{order.date}</span>
                                            </td>
                                            <td>
                                                <button className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity" title="Xem chi tiết">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-base-300">
                        <p className="text-sm text-base-content/60">
                            Hiển thị <span className="font-bold">1-{filteredOrders.length}</span> trong tổng <span className="font-bold">{mockOrders.length}</span> đơn hàng
                        </p>
                        <div className="flex items-center gap-1">
                            <button className="btn btn-sm btn-ghost btn-circle">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="btn btn-sm bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none font-bold min-w-[2rem]">1</button>
                            <button className="btn btn-sm btn-ghost font-bold min-w-[2rem]">2</button>
                            <button className="btn btn-sm btn-ghost font-bold min-w-[2rem]">3</button>
                            <button className="btn btn-sm btn-ghost btn-circle">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
