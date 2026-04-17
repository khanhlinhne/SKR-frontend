import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import {
    Search,
    Bell,
    Star,
    ShoppingBag,
    TrendingUp,
    Package,
    AlertCircle,
    Inbox
} from 'lucide-react';
import { StatCard } from '@/shared/ui/common';
import {
    OrderCard,
    OrderFilters,
    MOCK_ORDERS,
    formatCurrency
} from '@/features/orders/components';
import { useCurrentUserProfile, getUserInitials } from '@/shared/user';

/**
 * Orders Page — Lịch sử đơn hàng
 * Route: /orders
 * 
 * Maps to: orders, order_items, transactions tables
 * 
 * Layout: DashboardSidebar + Header + Main Content
 * Sections: Stats → Filters → Order List → Empty State
 */
export default function Orders() {
    // ─── State ──────────────────────────────────────────
    const [filters, setFilters] = useState({
        status: 'all',
        sortBy: 'newest',
        timeRange: 'all',
        search: ''
    });

    // ─── Animation Variants ─────────────────────────────
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
        }
    };

    // ─── Computed Data ──────────────────────────────────
    const stats = useMemo(() => {
        const total = MOCK_ORDERS.length;
        const completed = MOCK_ORDERS.filter(o => o.status === 'completed').length;
        const pending = MOCK_ORDERS.filter(o => o.status === 'pending').length;
        const totalSpent = MOCK_ORDERS
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.finalAmount, 0);

        return { total, completed, pending, totalSpent };
    }, []);

    const filteredOrders = useMemo(() => {
        let result = [...MOCK_ORDERS];

        // Filter by status
        if (filters.status !== 'all') {
            result = result.filter(o => o.status === filters.status);
        }

        // Filter by search
        if (filters.search) {
            const query = filters.search.toLowerCase();
            result = result.filter(o =>
                o.id.toLowerCase().includes(query)
                || o.items?.some(item => item.name.toLowerCase().includes(query))
            );
        }

        // Sort
        switch (filters.sortBy) {
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'highest':
                result.sort((a, b) => b.finalAmount - a.finalAmount);
                break;
            case 'lowest':
                result.sort((a, b) => a.finalAmount - b.finalAmount);
                break;
            default: // newest
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [filters]);

    // ─── Render ─────────────────────────────────────────
    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <OrdersHeader />

                {/* Page Content */}
                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            icon="ShoppingBag"
                            label="Tổng Đơn Hàng"
                            value={stats.total}
                            iconBgColor="bg-blue-500/10"
                            iconColor="text-blue-500"
                            variants={cardVariants}
                        />
                        <StatCard
                            icon="CheckCircle2"
                            label="Hoàn Thành"
                            value={stats.completed}
                            iconBgColor="bg-emerald-500/10"
                            iconColor="text-emerald-500"
                            variants={cardVariants}
                        />
                        <StatCard
                            icon="Clock"
                            label="Chờ Xử Lý"
                            value={stats.pending}
                            iconBgColor="bg-amber-500/10"
                            iconColor="text-amber-500"
                            variants={cardVariants}
                        />
                        <StatCard
                            icon="Wallet"
                            label="Tổng Chi Tiêu"
                            value={formatCurrency(stats.totalSpent)}
                            iconBgColor="bg-violet-500/10"
                            iconColor="text-violet-500"
                            variants={cardVariants}
                        />
                    </div>

                    {/* Filters */}
                    <motion.div variants={cardVariants} className="mb-6">
                        <OrderFilters
                            filters={filters}
                            onFilterChange={setFilters}
                        />
                    </motion.div>

                    {/* Results count */}
                    <motion.div
                        variants={cardVariants}
                        className="flex items-center justify-between mb-4"
                    >
                        <p className="text-sm text-base-content/50 font-medium">
                            Hiển thị <span className="font-bold text-base-content">{filteredOrders.length}</span> đơn hàng
                        </p>
                    </motion.div>

                    {/* Order List */}
                    {filteredOrders.length > 0 ? (
                        <div className="space-y-3">
                            {filteredOrders.map((order, index) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    index={index}
                                    variants={cardVariants}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <EmptyState
                            hasFilters={filters.status !== 'all' || filters.search}
                            onReset={() => setFilters({
                                status: 'all',
                                sortBy: 'newest',
                                timeRange: 'all',
                                search: ''
                            })}
                        />
                    )}

                    {/* Bottom spacer for smooth scroll */}
                    <div className="h-8" />
                </motion.main>
            </div>
        </div>
    );
}

// ─── Sub-Components ─────────────────────────────────────────

/**
 * OrdersHeader — Header riêng cho trang Orders
 */
function OrdersHeader() {
    const { profile } = useCurrentUserProfile();
    const displayName = profile.name || 'Người dùng';

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-b border-base-300 px-8 py-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-base-content flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-blue-500" />
                        Lịch Sử Đơn Hàng
                    </h2>
                    <p className="text-sm text-base-content/60 font-medium mt-0.5">
                        Theo dõi và quản lý tất cả giao dịch mua hàng
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative hidden lg:block">
                        <input
                            type="text"
                            placeholder="Tìm đơn hàng..."
                            className="input input-bordered w-72 pl-10 rounded-full bg-base-200 border-base-300 focus:border-blue-500"
                        />
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>

                    {/* Notifications */}
                    <div className="indicator">
                        <span className="indicator-item badge badge-sm badge-primary">3</span>
                        <button className="btn btn-circle btn-ghost">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-base-300">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-sm text-base-content">{displayName}</p>
                            {profile.isPremium && (
                                <div className="flex items-center justify-end gap-1">
                                    <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                    <p className="text-xs text-orange-500 font-bold">Premium User</p>
                                </div>
                            )}
                        </div>
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full ring ring-blue-500 ring-offset-2 ring-offset-base-100">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={displayName} className="h-10 w-10 object-cover" />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-xs font-black text-base-content">
                                        {getUserInitials(displayName)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

/**
 * EmptyState — Hiển thị khi không có đơn hàng nào
 */
function EmptyState({ hasFilters, onReset }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
        >
            <div className="w-20 h-20 rounded-3xl bg-base-300/50 flex items-center justify-center mb-6">
                {hasFilters
                    ? <AlertCircle className="w-10 h-10 text-base-content/20" />
                    : <Inbox className="w-10 h-10 text-base-content/20" />
                }
            </div>

            <h3 className="text-lg font-black text-base-content/60 mb-2">
                {hasFilters ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
            </h3>

            <p className="text-sm text-base-content/40 font-medium mb-6 text-center max-w-md">
                {hasFilters
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác.'
                    : 'Bạn chưa thực hiện giao dịch nào. Hãy khám phá các gói đăng ký và môn học!'
                }
            </p>

            {hasFilters ? (
                <button
                    onClick={onReset}
                    className="btn btn-sm btn-outline btn-primary rounded-xl font-bold"
                >
                    Xóa bộ lọc
                </button>
            ) : (
                <a
                    href="/checkout?plan=pro"
                    className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold shadow-lg"
                >
                    <TrendingUp className="w-4 h-4" />
                    Khám phá gói Premium
                </a>
            )}
        </motion.div>
    );
}
