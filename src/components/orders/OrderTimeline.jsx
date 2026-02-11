import * as motion from 'motion/react-client';
import {
    Clock,
    CreditCard,
    CheckCircle2,
    Package,
    XCircle,
    RotateCcw
} from 'lucide-react';

/**
 * OrderTimeline — Hiển thị lịch sử trạng thái đơn hàng
 * Maps to: orders.status + orders.created_at + transactions.created_at
 * 
 * @param {object} order - Order data with timeline events
 */

const TIMELINE_ICONS = {
    created: Package,
    pending: Clock,
    processing: CreditCard,
    completed: CheckCircle2,
    cancelled: XCircle,
    refunded: RotateCcw
};

const TIMELINE_COLORS = {
    created: 'from-blue-500 to-blue-600',
    pending: 'from-amber-500 to-amber-600',
    processing: 'from-blue-500 to-cyan-500',
    completed: 'from-emerald-500 to-green-500',
    cancelled: 'from-red-500 to-red-600',
    refunded: 'from-purple-500 to-purple-600'
};

export default function OrderTimeline({ events = [] }) {
    return (
        <div className="bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm">
            <h3 className="text-base font-black text-base-content mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Lịch Sử Đơn Hàng
            </h3>

            <div className="relative">
                {events.map((event, index) => {
                    const IconComponent = TIMELINE_ICONS[event.type] || Package;
                    const gradientColor = TIMELINE_COLORS[event.type] || TIMELINE_COLORS.created;
                    const isLast = index === events.length - 1;
                    const isActive = event.isActive;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                            className="flex gap-4 relative"
                        >
                            {/* Timeline line + dot */}
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
                                    ${isActive
                                        ? `bg-gradient-to-br ${gradientColor} text-white shadow-lg`
                                        : 'bg-base-200 text-base-content/40'
                                    }
                                `}>
                                    <IconComponent className="w-4 h-4" />
                                </div>

                                {/* Connector line */}
                                {!isLast && (
                                    <div className={`w-0.5 flex-1 my-1 min-h-[24px] rounded-full
                                        ${isActive ? 'bg-gradient-to-b from-base-300 to-base-200' : 'bg-base-200'}
                                    `} />
                                )}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className={`text-sm font-bold ${isActive ? 'text-base-content' : 'text-base-content/50'}`}>
                                        {event.title}
                                    </h4>
                                    <span className="text-[11px] text-base-content/40 font-medium whitespace-nowrap">
                                        {event.time}
                                    </span>
                                </div>
                                {event.description && (
                                    <p className="text-xs text-base-content/50 mt-1 leading-relaxed">
                                        {event.description}
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
