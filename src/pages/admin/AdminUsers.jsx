import { useState } from 'react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { AdminLayout } from '../../components/admin';
import { Search, UserPlus, UsersRound } from 'lucide-react';
import {
    containerVariants,
    cardVariants,
    statusConfig,
    mockUsers,
    UserRow,
    AddUserModal,
    UserDetailModal,
} from '../../components/admin/adminUsers';

/**
 * AdminUsers - Trang quản lý người dùng.
 * Components được tách riêng trong components/admin/adminUsers/.
 */
export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const filteredUsers = mockUsers.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <AdminLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                {/* Page Header */}
                <motion.div variants={cardVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-base-content">Quản lý Người dùng</h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Tổng cộng <span className="font-bold text-emerald-600">{mockUsers.length}</span> người dùng
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none shadow-lg font-bold rounded-xl hover:shadow-emerald-500/25 hover:shadow-xl transition-all"
                    >
                        <UserPlus className="w-4 h-4" /> Thêm người dùng
                    </button>
                </motion.div>

                {/* Filters */}
                <motion.div variants={cardVariants} className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                        <input type="text" placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-bordered w-full pl-10 rounded-xl bg-base-200 border-base-300 focus:border-emerald-500 text-sm"
                        />
                    </div>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                        className="select select-bordered rounded-xl bg-base-200 border-base-300 text-sm font-bold"
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="Learner">Learner</option>
                        <option value="Expert">Expert</option>
                        <option value="Staff">Staff</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="select select-bordered rounded-xl bg-base-200 border-base-300 text-sm font-bold"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                        ))}
                    </select>
                </motion.div>

                {/* Users Table */}
                <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="bg-base-200/50">
                                    <th className="font-bold text-xs uppercase tracking-wider text-base-content/60">Người dùng</th>
                                    <th className="font-bold text-xs uppercase tracking-wider text-base-content/60">Vai trò</th>
                                    <th className="font-bold text-xs uppercase tracking-wider text-base-content/60">Trạng thái</th>
                                    <th className="font-bold text-xs uppercase tracking-wider text-base-content/60">Khóa học</th>
                                    <th className="font-bold text-xs uppercase tracking-wider text-base-content/60">Ngày tham gia</th>
                                    <th className="font-bold text-xs uppercase tracking-wider text-base-content/60">Hoạt động</th>
                                    <th className="font-bold text-xs uppercase tracking-wider text-base-content/60">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, i) => (
                                        <UserRow key={user.id} user={user} index={i} onViewDetail={() => setSelectedUser(user)} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10">
                                            <UsersRound className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
                                            <p className="text-sm text-base-content/50 font-bold">Không tìm thấy người dùng nào</p>
                                            <p className="text-xs text-base-content/30 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && <AddUserModal key="add-modal" onClose={() => setShowAddModal(false)} />}
            </AnimatePresence>
            <AnimatePresence>
                {selectedUser && <UserDetailModal key="detail-modal" user={selectedUser} onClose={() => setSelectedUser(null)} />}
            </AnimatePresence>
        </AdminLayout>
    );
}
