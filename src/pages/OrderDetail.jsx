import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import * as motion from 'motion/react-client';
import { DashboardSidebar } from '../components/learner';
import {
    ArrowLeft,
    Search,
    Bell,
    Star,
    Package,
    Download,
    Printer,
    MessageSquare,
    HelpCircle,
    ShieldCheck,
    RotateCcw,
    ExternalLink,
    Copy,
    CheckCircle2
} from 'lucide-react';
import {
    OrderStatusBadge,
    OrderTimeline,
    OrderItemsList,
    TransactionInfo,
    MOCK_ORDERS,
    formatCurrency,
    formatDate
} from '../components/orders';
import { useState } from 'react';

/**
 * OrderDetail Page — Chi tiết 1 đơn hàng
 * Route: /orders/:id
 *
 * Maps to: orders + order_items + transactions tables
 *
 * Layout: DashboardSidebar + Header + Main Content
 * Sections: Back Nav → Order Info → Grid (Items + Timeline | Transaction + Actions)
 */
export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copiedId, setCopiedId] = useState(false);

    // ─── Find Order ─────────────────────────────────────
    const order = useMemo(() => {
        return MOCK_ORDERS.find(o => o.id === id);
    }, [id]);

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

    // ─── Handle copy order ID ───────────────────────────
    const handleCopyId = () => {
        navigator.clipboard.writeText(id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    // ─── 404 State ──────────────────────────────────────
    if (!order) {
        return (
            <div className="flex h-screen bg-base-200 overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <NotFoundState onGoBack={() => navigate('/orders')} />
                </div>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────
    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <DetailHeader />

                {/* Page Content */}
                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Back navigation */}
                    <motion.div variants={cardVariants} className="mb-6">
                        <Link
                            to="/orders"
                            className="inline-flex items-center gap-2 text-sm font-bold text-base-content/50
                                hover:text-blue-600 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại danh sách đơn hàng
                        </Link>
                    </motion.div>

                    {/* Order Header Card */}
                    <motion.div
                        variants={cardVariants}
                        className="bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm mb-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Left: Order ID + Status */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10
                                    flex items-center justify-center flex-shrink-0"
                                >
                                    <Package className="w-7 h-7 text-blue-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-xl font-black text-base-content">
                                            {order.id}
                                        </h1>
                                        <button
                                            onClick={handleCopyId}
                                            className="btn btn-ghost btn-xs rounded-lg"
                                            title="Sao chép mã đơn"
                                        >
                                            {copiedId
                                                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                : <Copy className="w-3.5 h-3.5 text-base-content/30" />
                                            }
                                        </button>
                                    </div>
                                    <p className="text-sm text-base-content/50 font-medium">
                                        Ngày đặt: {formatDate(order.createdAt, true)}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Status + Actions */}
                            <div className="flex items-center gap-3">
                                <OrderStatusBadge status={order.status} size="lg" />
                                <QuickActions order={order} />
                            </div>
                        </div>

                        {/* Order notes */}
                        {order.notes && (
                            <div className="mt-4 pt-4 border-t border-base-200">
                                <p className="text-sm text-base-content/60 font-medium flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-base-content/30" />
                                    {order.notes}
                                </p>
                            </div>
                        )}
                    </motion.div>

                    {/* Main Grid: 2 columns on large screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* Left Column (3/5): Items + Timeline */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Order Items */}
                            <motion.div variants={cardVariants}>
                                <OrderItemsList items={order.items} />
                            </motion.div>

                            {/* Timeline */}
                            <motion.div variants={cardVariants}>
                                <OrderTimeline events={order.timeline} />
                            </motion.div>
                        </div>

                        {/* Right Column (2/5): Transaction + Help */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Transaction Info */}
                            <motion.div variants={cardVariants}>
                                <TransactionInfo
                                    transaction={order.transaction}
                                    order={order}
                                />
                            </motion.div>

                            {/* Pending payment notice */}
                            {order.status === 'pending' && (
                                <motion.div
                                    variants={cardVariants}
                                    className="bg-amber-500/5 rounded-2xl border border-amber-500/20 p-5"
                                >
                                    <h4 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4" />
                                        Đang chờ thanh toán
                                    </h4>
                                    <p className="text-xs text-base-content/60 leading-relaxed mb-3">
                                        Vui lòng hoàn tất thanh toán để kích hoạt sản phẩm.
                                        Đơn hàng sẽ tự động hủy sau 15 phút nếu không thanh toán.
                                    </p>
                                    <button className="btn btn-sm w-full bg-gradient-to-r from-amber-500 to-orange-500
                                        text-white border-none rounded-xl font-bold shadow-sm"
                                    >
                                        Thanh toán ngay
                                    </button>
                                </motion.div>
                            )}

                            {/* Help Card */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm"
                            >
                                <h3 className="text-sm font-black text-base-content mb-4 flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-blue-500" />
                                    Cần hỗ trợ?
                                </h3>

                                <div className="space-y-2">
                                    <HelpLink
                                        icon={MessageSquare}
                                        label="Liên hệ hỗ trợ"
                                        description="Chat trực tiếp với đội ngũ SKR"
                                    />
                                    <HelpLink
                                        icon={RotateCcw}
                                        label="Yêu cầu hoàn tiền"
                                        description="Chính sách hoàn tiền trong 7 ngày"
                                    />
                                    <HelpLink
                                        icon={ShieldCheck}
                                        label="Chính sách bảo mật"
                                        description="Tìm hiểu về bảo mật giao dịch"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom spacer */}
                    <div className="h-8" />
                </motion.main>
            </div>
        </div>
    );
}

// ─── Sub-Components ─────────────────────────────────────────

/**
 * DetailHeader — Header riêng cho trang chi tiết
 */
function DetailHeader() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-b border-base-300 px-8 py-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-base-content">
                        Chi Tiết Đơn Hàng
                    </h2>
                    <p className="text-sm text-base-content/60 font-medium mt-0.5">
                        Xem thông tin chi tiết và trạng thái giao dịch
                    </p>
                </div>

                <div className="flex items-center gap-4">
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
                            <p className="font-bold text-sm text-base-content">Đoàn Thế Anh</p>
                            <div className="flex items-center justify-end gap-1">
                                <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                <p className="text-xs text-orange-500 font-bold">Premium User</p>
                            </div>
                        </div>
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full ring ring-blue-500 ring-offset-2 ring-offset-base-100">
                                <img src="https://i.pravatar.cc/150?img=33" alt="User" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

/**
 * QuickActions — Dropdown nhanh cho các hành động trên đơn hàng
 */
function QuickActions({ order }) {
    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-ghost rounded-xl font-bold text-base-content/50">
                •••
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-xl border border-base-200 w-52">
                <li>
                    <button className="flex items-center gap-2 text-sm font-medium rounded-lg">
                        <Download className="w-4 h-4" />
                        Tải hóa đơn
                    </button>
                </li>
                <li>
                    <button className="flex items-center gap-2 text-sm font-medium rounded-lg">
                        <Printer className="w-4 h-4" />
                        In đơn hàng
                    </button>
                </li>
                {order.status === 'completed' && (
                    <li>
                        <button className="flex items-center gap-2 text-sm font-medium rounded-lg text-red-500">
                            <RotateCcw className="w-4 h-4" />
                            Yêu cầu hoàn tiền
                        </button>
                    </li>
                )}
            </ul>
        </div>
    );
}

/**
 * HelpLink — Item link hỗ trợ
 */
function HelpLink({ icon: Icon, label, description }) {
    return (
        <button className="w-full flex items-center gap-3 p-3 rounded-xl
            hover:bg-base-200 transition-colors text-left group"
        >
            <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center
                group-hover:bg-blue-500/10 transition-colors flex-shrink-0"
            >
                <Icon className="w-4 h-4 text-base-content/40 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-base-content group-hover:text-blue-600 transition-colors">
                    {label}
                </p>
                <p className="text-xs text-base-content/40 truncate">{description}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-base-content/20 group-hover:text-blue-500 transition-colors" />
        </button>
    );
}

/**
 * NotFoundState — Hiển thị khi không tìm thấy đơn hàng
 */
function NotFoundState({ onGoBack }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
        >
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-lg font-black text-base-content/60 mb-2">
                Không tìm thấy đơn hàng
            </h3>
            <p className="text-sm text-base-content/40 font-medium mb-6 max-w-md">
                Đơn hàng bạn đang tìm không tồn tại hoặc đã bị xóa.
                Vui lòng kiểm tra lại mã đơn hàng.
            </p>
            <button
                onClick={onGoBack}
                className="btn btn-sm btn-primary rounded-xl font-bold"
            >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách
            </button>
        </motion.div>
    );
}
