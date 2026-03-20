import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { AdminLayout } from '@/features/admin/components';
import { Search, UserPlus, UsersRound, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import {
    containerVariants,
    cardVariants,
    statusConfig,
    UserRow,
    AddUserModal,
    UserDetailModal,
} from '@/features/admin/components/adminUsers';
import adminApi from '@/shared/api/adminApi';

/**
 * AdminUsers - Trang quản lý người dùng.
 * Fetch dữ liệu thực từ GET /api/user/all
 */
export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit,
                search: searchTerm || undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                isActive: statusFilter !== 'all' ? statusFilter : undefined,
            };
            const result = await adminApi.getAllUsers(params);
            // Backend wraps response: { success, data: { items, pagination } }
            const items = result?.data?.items || result?.items || result || [];
            const pagination = result?.data?.pagination || {};
            const totalItems = pagination?.totalItems || items.length;
            setUsers(items);
            setTotal(totalItems);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách người dùng:', err);
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchTerm, roleFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Debounce search + reset page
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle filter change - reset page
    useEffect(() => {
        setPage(1);
    }, [roleFilter, statusFilter]);

    const handleUserAdded = () => {
        setShowAddModal(false);
        fetchUsers();
    };

    const filteredUsers = users;

    return (
        <AdminLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                {/* Page Header */}
                <motion.div variants={cardVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-base-content">Quản lý Người dùng</h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Tổng cộng <span className="font-bold text-emerald-600">{total}</span> người dùng
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchUsers}
                            className="btn btn-ghost btn-sm btn-circle"
                            title="Làm mới"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none shadow-lg font-bold rounded-xl hover:shadow-emerald-500/25 hover:shadow-xl transition-all"
                        >
                            <UserPlus className="w-4 h-4" /> Thêm người dùng
                        </button>
                    </div>
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
                        <option value="user">Learner</option>
                        <option value="creator">Expert</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
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

                {/* Error State */}
                {error && (
                    <motion.div variants={cardVariants} className="alert alert-error rounded-xl">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                        <button onClick={fetchUsers} className="btn btn-sm btn-ghost">Thử lại</button>
                    </motion.div>
                )}

                {/* Users Table */}
                <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
                    {loading && users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                            <p className="text-sm text-base-content/50 font-bold">Đang tải danh sách người dùng...</p>
                        </div>
                    ) : (
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
                                            <UserRow key={user.id || user._id || i} user={user} index={i} onViewDetail={() => setSelectedUser(user)} />
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
                    )}
                </motion.div>

                {/* Pagination */}
                {total > limit && (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="btn btn-sm btn-ghost"
                        >
                            Trước
                        </button>
                        <span className="text-sm font-bold px-3">
                            Trang {page} / {Math.ceil(total / limit)}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                            disabled={page >= Math.ceil(total / limit) || loading}
                            className="btn btn-sm btn-ghost"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && <AddUserModal key="add-modal" onClose={() => setShowAddModal(false)} onSuccess={handleUserAdded} />}
            </AnimatePresence>
            <AnimatePresence>
                {selectedUser && <UserDetailModal key="detail-modal" user={selectedUser} onClose={() => setSelectedUser(null)} onUpdate={fetchUsers} />}
            </AnimatePresence>
        </AdminLayout>
    );
}
