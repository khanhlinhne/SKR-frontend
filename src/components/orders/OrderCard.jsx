import { Link } from 'react-router-dom';
import * as motion from 'motion/react-client';
import {
    Package,
    ChevronRight,
    Calendar,
    CreditCard,
    Tag
} from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency, formatDate, getPaymentMethodLabel } from './utils';

/**
 * OrderCard — Card hiển thị tóm tắt 1 đơn hàng trong danh sách
 * Maps to: orders + order_items tables
 * 
 * @param {object} order - Order data object
 * @param {number} index - Index for staggered animation
 * @param {object} variants - Motion animation variants
 */
export default function OrderCard({ order, index = 0, variants }) {
    const itemCount = order.items?.length || 0;
    const firstItem = order.items?.[0];
    const remainingCount = itemCount - 1;

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.05 }}
        >
            <Link
                to={`/orders/${order.id}`}
                className="block group"
            >
                <div className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm
                    hover:shadow-lg hover:border-blue-500/20 hover:-translate-y-0.5
                    transition-all duration-300 cursor-pointer"
                >
                    {/* Row 1: Order ID + Status + Date */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 
                                flex items-center justify-center flex-shrink-0
                                group-hover:from-blue-500/20 group-hover:to-violet-500/20 transition-colors"
                            >
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-base-content truncate">
                                    {order.id}
                                </h3>
                                <p className="text-xs text-base-content/50 font-medium flex items-center gap-1.5 mt-0.5">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                        </div>
                        <OrderStatusBadge status={order.status} size="sm" />
                    </div>

                    {/* Row 2: Items preview */}
                    <div className="mb-4 pl-[52px]">
                        {firstItem && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-base-content/80 truncate">
                                    {firstItem.name}
                                </span>
                                {firstItem.itemType && (
                                    <span className="badge badge-xs badge-ghost font-bold flex-shrink-0">
                                        {firstItem.itemType === 'subscription' ? 'Gói' : 'Môn học'}
                                    </span>
                                )}
                            </div>
                        )}
                        {remainingCount > 0 && (
                            <p className="text-xs text-base-content/40 font-medium mt-1">
                                +{remainingCount} sản phẩm khác
                            </p>
                        )}
                    </div>

                    {/* Row 3: Payment info + Total + Arrow */}
                    <div className="flex items-center justify-between pt-3 border-t border-base-200">
                        <div className="flex items-center gap-4">
                            {/* Payment method */}
                            <span className="text-xs text-base-content/50 font-medium flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {getPaymentMethodLabel(order.paymentMethod)}
                            </span>

                            {/* Coupon */}
                            {order.couponCode && (
                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {order.couponCode}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Discount */}
                            {order.discountAmount > 0 && (
                                <span className="text-xs text-base-content/40 line-through font-medium">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            )}

                            {/* Final amount */}
                            <span className="text-base font-black text-base-content">
                                {formatCurrency(order.finalAmount)}
                            </span>

                            <ChevronRight className="w-4 h-4 text-base-content/30 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
