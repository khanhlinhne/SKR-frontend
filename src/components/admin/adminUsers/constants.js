import {
    CheckCircle2,
    AlertCircle,
    XCircle,
} from 'lucide-react';

// ===== ANIMATION VARIANTS =====
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
};

export const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

export const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

export const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1, scale: 1, y: 0,
        transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: {
        opacity: 0, scale: 0.95, y: 20,
        transition: { duration: 0.2 }
    }
};

// ===== STATUS CONFIG =====
export const statusConfig = {
    active: { label: 'Hoạt động', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10', dot: 'bg-emerald-500' },
    pending: { label: 'Chờ xác minh', icon: AlertCircle, color: 'text-amber-600 bg-amber-500/10', dot: 'bg-amber-500' },
    banned: { label: 'Bị khóa', icon: XCircle, color: 'text-red-500 bg-red-500/10', dot: 'bg-red-500' },
};

// ===== ROLE OPTIONS =====
export const roleOptions = [
    { value: 'Learner', label: 'Learner', description: 'Người học' },
    { value: 'Expert', label: 'Expert', description: 'Chuyên gia' },
    { value: 'Staff', label: 'Staff', description: 'Nhân viên' },
    { value: 'Admin', label: 'Admin', description: 'Quản trị viên' },
];

export const roleBadgeStyle = {
    Learner: 'badge-ghost',
    Expert: 'badge-info',
    Staff: 'badge-warning',
    Admin: 'badge-error',
};
