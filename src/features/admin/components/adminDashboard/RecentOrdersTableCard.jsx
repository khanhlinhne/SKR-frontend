import { motion } from 'motion/react';
import {
    Activity,
    ArrowUpRight,
    CheckCircle2,
    ShoppingCart,
    XCircle,
} from 'lucide-react';
import { formatCurrencyVND } from '@/features/admin/utils/adminDashboardData';
import { cardVariants, EmptyState, SectionLoading } from './shared';

const statusConfig = {
    completed: { label: 'Hoàn thành', color: 'text-emerald-600 bg-emerald-500/10', icon: CheckCircle2 },
    pending: { label: 'Đang xử lý', color: 'text-amber-600 bg-amber-500/10', icon: Activity },
    cancelled: { label: 'Đã hủy', color: 'text-red-500 bg-red-500/10', icon: XCircle },
};

export default function RecentOrdersTableCard({ orders, ui, loading }) {
    return (
        <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-violet-500" />
                    <h3 className="text-lg font-black text-base-content">{ui?.title || 'Đơn hàng Gần Đây'}</h3>
                </div>
                <button type="button" className="btn btn-ghost btn-xs font-bold text-emerald-600">
                    {ui?.actionLabel || 'Xem tất cả'}
                    <ArrowUpRight className="h-3 w-3" />
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <SectionLoading />
            ) : orders.length === 0 ? (
                <EmptyState message="Chưa có đơn hàng gần đây." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <thead>
                            <tr className="text-base-content/60">
                                {(ui?.columns || []).map((column) => (
                                    <th key={column.key} className="text-xs font-bold uppercase">{column.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => {
                                const status = statusConfig[order.status] || statusConfig.completed;
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        key={`${order.id}-${index}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.45 + index * 0.06 }}
                                        className="cursor-pointer hover:bg-base-200/50"
                                    >
                                        <td>
                                            <span className="font-mono text-sm font-bold text-base-content">{order.id}</span>
                                            <br />
                                            <span className="text-xs text-base-content/50">{order.date}</span>
                                        </td>
                                        <td>
                                            <p className="max-w-[150px] truncate text-sm font-bold text-base-content">{order.course}</p>
                                            <p className="text-xs text-base-content/50">{order.user}</p>
                                        </td>
                                        <td>
                                            <span className="text-sm font-black text-base-content">{order.amountDisplay || formatCurrencyVND(order.amount)}</span>
                                        </td>
                                        <td>
                                            <span className={`flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {order.statusLabel || status.label}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}
