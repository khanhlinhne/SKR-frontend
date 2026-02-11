import {
    CheckCircle2,
    Clock,
    Loader2,
    XCircle,
    RotateCcw,
    AlertTriangle
} from 'lucide-react';

/**
 * OrderStatusBadge — Hiển thị trạng thái đơn hàng
 * Maps to: orders.status enum (pending, processing, completed, cancelled, refunded)
 * 
 * @param {'pending'|'processing'|'completed'|'cancelled'|'refunded'} status
 * @param {'sm'|'md'|'lg'} size
 */

const STATUS_CONFIG = {
    pending: {
        label: 'Chờ xử lý',
        icon: Clock,
        className: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        dotColor: 'bg-amber-500'
    },
    processing: {
        label: 'Đang xử lý',
        icon: Loader2,
        className: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
        dotColor: 'bg-blue-500',
        animate: true
    },
    completed: {
        label: 'Hoàn thành',
        icon: CheckCircle2,
        className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
        dotColor: 'bg-emerald-500'
    },
    cancelled: {
        label: 'Đã hủy',
        icon: XCircle,
        className: 'bg-red-500/10 text-red-700 border-red-500/20',
        dotColor: 'bg-red-500'
    },
    refunded: {
        label: 'Đã hoàn tiền',
        icon: RotateCcw,
        className: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
        dotColor: 'bg-purple-500'
    }
};

const SIZE_MAP = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2'
};

const ICON_SIZE_MAP = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
};

export default function OrderStatusBadge({ status, size = 'md' }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const IconComponent = config.icon;

    return (
        <span
            className={`
                inline-flex items-center font-bold rounded-full border
                ${config.className} ${SIZE_MAP[size]}
            `}
        >
            <IconComponent
                className={`${ICON_SIZE_MAP[size]} ${config.animate ? 'animate-spin' : ''}`}
            />
            {config.label}
        </span>
    );
}

/**
 * OrderStatusDot — phiên bản compact chỉ hiển thị chấm tròn + text
 */
export function OrderStatusDot({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/70">
            <span className={`w-2 h-2 rounded-full ${config.dotColor} ${config.animate ? 'animate-pulse' : ''}`} />
            {config.label}
        </span>
    );
}
