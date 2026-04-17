import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { OrderStatusBadge, getPaymentMethodLabel } from '@/features/orders/components';
import { cardVariants } from './constants';

function formatVND(value) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

function getInitials(name) {
    return String(name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'HV';
}

const paymentMethodColors = {
    momo: 'bg-pink-500/10 text-pink-600',
    vnpay: 'bg-blue-500/10 text-blue-600',
    bank_transfer: 'bg-emerald-500/10 text-emerald-600',
    zalopay: 'bg-sky-500/10 text-sky-600',
    visa: 'bg-violet-500/10 text-violet-600',
    sepay: 'bg-orange-500/10 text-orange-600',
};

export default function RecentOrdersTable({ range = 'month', loading = false, subtitle = '', orders = [], courseName = '', totalOrders = 0 }) {
    const fallbackSubtitle = range === 'week'
        ? 'Đơn hàng trong tuần hiện tại'
        : range === 'year'
            ? 'Đơn hàng trong năm hiện tại'
            : 'Đơn hàng trong tháng hiện tại';

    return (
        <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-lg"
        >
            <div className="flex items-center justify-between border-b border-base-300 px-6 py-4">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-black text-base-content">
                        <ShoppingCart className="h-5 w-5 text-violet-500" />
                        Đơn hàng gần đây
                    </h3>
                    <p className="mt-0.5 text-xs text-base-content/50">
                        {subtitle || (courseName ? `Đơn hàng phát sinh cho ${courseName}` : fallbackSubtitle)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-base-content/50">Tổng đơn</p>
                    <p className="text-base font-black text-violet-600">{totalOrders || orders.length}</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="p-6">
                    <div className="rounded-2xl border border-dashed border-base-300 px-4 py-10 text-center text-sm font-medium text-base-content/50">
                        Chưa có đơn hàng nào cho khóa học này.
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr className="bg-base-200/30">
                                <th className="text-xs font-bold uppercase text-base-content/50">Học viên</th>
                                <th className="text-xs font-bold uppercase text-base-content/50">Mã đơn</th>
                                <th className="text-xs font-bold uppercase text-base-content/50">Số tiền</th>
                                <th className="text-xs font-bold uppercase text-base-content/50">Thanh toán</th>
                                <th className="text-xs font-bold uppercase text-base-content/50">Trạng thái</th>
                                <th className="text-xs font-bold uppercase text-base-content/50">Ngày</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => {
                                const paymentMethodKey = String(order.paymentMethod || '').toLowerCase();

                                return (
                                    <motion.tr
                                        key={`${order.id}-${index}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25 + index * 0.05 }}
                                        className="transition-colors hover:bg-base-200/30"
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {order.avatar ? (
                                                    <div className="avatar">
                                                        <div className="h-9 w-9 rounded-full">
                                                            <img src={order.avatar} alt={order.studentName} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-xs font-black text-violet-600">
                                                        {getInitials(order.studentName)}
                                                    </div>
                                                )}
                                                <span className="text-sm font-bold text-base-content">{order.studentName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-mono text-xs text-base-content/60">{order.id}</span>
                                        </td>
                                        <td>
                                            <span className="text-sm font-bold text-emerald-600">{formatVND(order.amount)}</span>
                                        </td>
                                        <td>
                                            <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${paymentMethodColors[paymentMethodKey] || 'bg-base-200 text-base-content/60'}`}>
                                                {getPaymentMethodLabel(paymentMethodKey)}
                                            </span>
                                        </td>
                                        <td>
                                            <OrderStatusBadge status={order.status} size="sm" />
                                        </td>
                                        <td>
                                            <span className="text-xs text-base-content/50">{order.dateLabel}</span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {loading ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-base-100/45 backdrop-blur-[1px]">
                    <span className="loading loading-spinner loading-md text-violet-600" />
                </div>
            ) : null}
        </motion.div>
    );
}
