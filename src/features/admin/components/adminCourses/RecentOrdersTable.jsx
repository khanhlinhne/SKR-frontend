import { motion } from 'motion/react';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { cardVariants } from './constants';

/**
 * RecentOrdersTable — Bảng đơn hàng gần đây của khóa học
 * Admin xem ai đang mua, khi nào, số tiền bao nhiêu
 */

const mockOrders = [
    { id: 'ORD-1234', studentName: 'Trần Minh Tuấn', avatar: 'https://i.pravatar.cc/40?img=1', amount: 299000, date: '05/03/2026', method: 'Momo' },
    { id: 'ORD-1233', studentName: 'Nguyễn Thị Lan', avatar: 'https://i.pravatar.cc/40?img=5', amount: 299000, date: '04/03/2026', method: 'VNPAY' },
    { id: 'ORD-1230', studentName: 'Lê Hoàng Nam', avatar: 'https://i.pravatar.cc/40?img=8', amount: 299000, date: '03/03/2026', method: 'Momo' },
    { id: 'ORD-1228', studentName: 'Phạm Thảo Vy', avatar: 'https://i.pravatar.cc/40?img=9', amount: 299000, date: '02/03/2026', method: 'Chuyển khoản' },
    { id: 'ORD-1225', studentName: 'Võ Đức Huy', avatar: 'https://i.pravatar.cc/40?img=12', amount: 299000, date: '01/03/2026', method: 'VNPAY' },
];

const methodColors = {
    'Momo': 'text-pink-600 bg-pink-500/10',
    'VNPAY': 'text-blue-600 bg-blue-500/10',
    'Chuyển khoản': 'text-emerald-600 bg-emerald-500/10',
};

export default function RecentOrdersTable() {
    const formatVND = (num) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-violet-500" />
                    Đơn hàng gần đây
                </h3>
                <button className="btn btn-ghost btn-xs font-bold text-emerald-600 gap-1">
                    Xem tất cả
                    <ExternalLink className="w-3 h-3" />
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr className="bg-base-200/30">
                            <th className="font-bold text-xs uppercase text-base-content/50">Học viên</th>
                            <th className="font-bold text-xs uppercase text-base-content/50">Mã đơn</th>
                            <th className="font-bold text-xs uppercase text-base-content/50">Số tiền</th>
                            <th className="font-bold text-xs uppercase text-base-content/50">Thanh toán</th>
                            <th className="font-bold text-xs uppercase text-base-content/50">Ngày</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockOrders.map((order, i) => (
                            <motion.tr
                                key={order.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.06 }}
                                className="hover:bg-base-200/30 transition-colors"
                            >
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="w-8 h-8 rounded-full">
                                                <img src={order.avatar} alt={order.studentName} />
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-base-content">{order.studentName}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="text-xs font-mono text-base-content/50">{order.id}</span>
                                </td>
                                <td>
                                    <span className="font-bold text-sm text-emerald-600">{formatVND(order.amount)}</span>
                                </td>
                                <td>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${methodColors[order.method] || 'text-base-content/60 bg-base-200'}`}>
                                        {order.method}
                                    </span>
                                </td>
                                <td>
                                    <span className="text-xs text-base-content/50">{order.date}</span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
