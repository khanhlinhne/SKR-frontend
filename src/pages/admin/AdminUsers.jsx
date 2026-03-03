import { useState } from 'react';
import * as motion from 'motion/react-client';
import { AdminLayout } from '../../components/admin';
import {
    Search,
    UserPlus,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    Filter,
    Download,
    Mail,
    Shield,
    ShieldOff,
    Eye,
    ChevronLeft,
    ChevronRight,
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

// Mock users data
const mockUsers = [
    { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', role: 'Learner', status: 'active', courses: 5, joinDate: '15/01/2026', lastActive: '10 phút trước', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@email.com', role: 'Premium', status: 'active', courses: 12, joinDate: '20/01/2026', lastActive: '1 giờ trước', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, name: 'Lê Hoàng Cường', email: 'cuong.le@email.com', role: 'Learner', status: 'pending', courses: 2, joinDate: '01/02/2026', lastActive: '2 ngày trước', avatar: 'https://i.pravatar.cc/150?img=8' },
    { id: 4, name: 'Phạm Minh Duy', email: 'duy.pham@email.com', role: 'Premium', status: 'active', courses: 8, joinDate: '10/02/2026', lastActive: '30 phút trước', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 5, name: 'Hoàng Thị Nga', email: 'nga.hoang@email.com', role: 'Learner', status: 'banned', courses: 1, joinDate: '25/02/2026', lastActive: '1 tuần trước', avatar: 'https://i.pravatar.cc/150?img=9' },
    { id: 6, name: 'Võ Đình Khoa', email: 'khoa.vo@email.com', role: 'Learner', status: 'active', courses: 3, joinDate: '28/02/2026', lastActive: '3 giờ trước', avatar: 'https://i.pravatar.cc/150?img=14' },
    { id: 7, name: 'Bùi Thị Lan', email: 'lan.bui@email.com', role: 'Premium', status: 'active', courses: 15, joinDate: '01/03/2026', lastActive: '5 phút trước', avatar: 'https://i.pravatar.cc/150?img=20' },
    { id: 8, name: 'Đặng Văn Minh', email: 'minh.dang@email.com', role: 'Learner', status: 'pending', courses: 0, joinDate: '02/03/2026', lastActive: '1 ngày trước', avatar: 'https://i.pravatar.cc/150?img=52' },
];

const statusConfig = {
    active: { label: 'Hoạt động', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
    pending: { label: 'Chờ xác minh', icon: AlertCircle, color: 'text-amber-600 bg-amber-500/10' },
    banned: { label: 'Bị khóa', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
};

export default function AdminUsers() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredUsers = mockUsers.filter(user => {
        const matchSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRole = filterRole === 'all' || user.role === filterRole;
        const matchStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchSearch && matchRole && matchStatus;
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
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">Quản lý Người dùng</h1>
                        <p className="text-sm text-base-content/60 mt-1">Tổng cộng {mockUsers.length} người dùng</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-ghost font-bold rounded-xl gap-1">
                            <Download className="w-4 h-4" />
                            Xuất file
                        </button>
                        <button className="btn btn-sm bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none shadow-lg font-bold rounded-xl gap-1">
                            <UserPlus className="w-4 h-4" />
                            Thêm người dùng
                        </button>
                    </div>
                </motion.div>

                {/* Filters & Search */}
                <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl p-4 shadow-lg border border-base-300 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input input-bordered w-full pl-10 rounded-xl bg-base-200 border-base-300 focus:border-emerald-500 text-sm"
                            />
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="select select-bordered select-sm rounded-xl bg-base-200 border-base-300 font-bold text-sm"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="Learner">Learner</option>
                            <option value="Premium">Premium</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="select select-bordered select-sm rounded-xl bg-base-200 border-base-300 font-bold text-sm"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="pending">Chờ xác minh</option>
                            <option value="banned">Bị khóa</option>
                        </select>
                    </div>
                </motion.div>

                {/* Users Table */}
                <motion.div
                    variants={cardVariants}
                    className="bg-base-100 rounded-3xl shadow-lg border border-base-300 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="bg-base-200/50">
                                    <th className="font-bold text-xs uppercase text-base-content/60">Người dùng</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Vai trò</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Trạng thái</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Khóa học</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Ngày tham gia</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Hoạt động</th>
                                    <th className="font-bold text-xs uppercase text-base-content/60">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, i) => {
                                    const status = statusConfig[user.status];
                                    const StatusIcon = status.icon;
                                    return (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + i * 0.05 }}
                                            className="hover:bg-base-200/50 cursor-pointer group"
                                        >
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="w-10 h-10 rounded-full ring-2 ring-base-300">
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
                                                <span className="font-bold text-sm">{user.courses}</span>
                                            </td>
                                            <td>
                                                <span className="text-sm text-base-content/70">{user.joinDate}</span>
                                            </td>
                                            <td>
                                                <span className="text-xs text-base-content/60 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {user.lastActive}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="btn btn-ghost btn-xs btn-circle" title="Xem chi tiết">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="btn btn-ghost btn-xs btn-circle" title="Gửi email">
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </button>
                                                    {user.status === 'banned' ? (
                                                        <button className="btn btn-ghost btn-xs btn-circle text-emerald-500" title="Mở khóa">
                                                            <Shield className="w-3.5 h-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-ghost btn-xs btn-circle text-red-500" title="Khóa tài khoản">
                                                            <ShieldOff className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
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
                            Hiển thị <span className="font-bold">1-{filteredUsers.length}</span> trong tổng <span className="font-bold">{mockUsers.length}</span> người dùng
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
