import * as motion from 'motion/react-client';
import { Package, BookOpen, Crown, Zap } from 'lucide-react';
import { formatCurrency } from './utils';

/**
 * OrderItemsList — Danh sách sản phẩm trong đơn hàng
 * Maps to: order_items table (item_type, item_id, quantity, unit_price, total_price)
 * 
 * @param {Array} items - Array of order item objects
 */

const ITEM_TYPE_CONFIG = {
    subscription: {
        icon: Crown,
        label: 'Gói đăng ký',
        gradient: 'from-amber-500/10 to-orange-500/10',
        iconColor: 'text-amber-600',
        badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/20'
    },
    subject: {
        icon: BookOpen,
        label: 'Môn học',
        gradient: 'from-blue-500/10 to-violet-500/10',
        iconColor: 'text-blue-600',
        badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-500/20'
    }
};

export default function OrderItemsList({ items = [] }) {
    if (items.length === 0) return null;

    return (
        <div className="bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm">
            <h3 className="text-base font-black text-base-content mb-5 flex items-center gap-2">
                <Package className="w-4 h-4 text-violet-500" />
                Chi Tiết Sản Phẩm
                <span className="badge badge-sm badge-ghost font-bold ml-1">{items.length}</span>
            </h3>

            <div className="space-y-3">
                {items.map((item, index) => {
                    const typeConfig = ITEM_TYPE_CONFIG[item.itemType] || ITEM_TYPE_CONFIG.subject;
                    const IconComponent = typeConfig.icon;

                    return (
                        <motion.div
                            key={item.id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.08 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-base-200/50
                                hover:bg-base-200 transition-colors border border-transparent hover:border-base-300"
                        >
                            {/* Icon */}
                            <div className={`
                                w-12 h-12 rounded-xl bg-gradient-to-br ${typeConfig.gradient}
                                flex items-center justify-center flex-shrink-0
                            `}>
                                <IconComponent className={`w-5 h-5 ${typeConfig.iconColor}`} />
                            </div>

                            {/* Item info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-base-content truncate">
                                        {item.name}
                                    </h4>
                                    <span className={`
                                        inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold
                                        border flex-shrink-0 ${typeConfig.badgeClass}
                                    `}>
                                        {typeConfig.label}
                                    </span>
                                </div>
                                {item.description && (
                                    <p className="text-xs text-base-content/50 truncate">
                                        {item.description}
                                    </p>
                                )}
                                {item.duration && (
                                    <p className="text-xs text-base-content/40 mt-0.5">
                                        Thời hạn: {item.duration}
                                    </p>
                                )}
                            </div>

                            {/* Quantity + Price */}
                            <div className="text-right flex-shrink-0">
                                {item.quantity > 1 && (
                                    <p className="text-xs text-base-content/40 font-medium mb-0.5">
                                        x{item.quantity}
                                    </p>
                                )}
                                <p className="text-sm font-black text-base-content">
                                    {formatCurrency(item.totalPrice)}
                                </p>
                                {item.unitPrice !== item.totalPrice && item.quantity > 1 && (
                                    <p className="text-[11px] text-base-content/40">
                                        {formatCurrency(item.unitPrice)}/sp
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
