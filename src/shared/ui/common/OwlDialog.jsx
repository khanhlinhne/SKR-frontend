import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    Loader2,
    ShieldAlert,
    Sparkles,
    X,
} from 'lucide-react';

const variantConfig = {
    info: {
        chip: 'Thông báo từ cú',
        icon: Info,
        gradient: 'from-sky-500 via-cyan-500 to-blue-600',
        accent: 'bg-sky-500/12 text-sky-700 border-sky-500/15',
        note: 'bg-sky-500/8 border-sky-500/15 text-sky-900/80',
        badge: 'bg-sky-500 text-white',
    },
    success: {
        chip: 'Cú báo tin vui',
        icon: CheckCircle2,
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        accent: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/15',
        note: 'bg-emerald-500/8 border-emerald-500/15 text-emerald-900/80',
        badge: 'bg-emerald-500 text-white',
    },
    warning: {
        chip: 'Cú cần bạn xác nhận',
        icon: AlertTriangle,
        gradient: 'from-amber-400 via-orange-400 to-rose-500',
        accent: 'bg-amber-500/12 text-amber-700 border-amber-500/15',
        note: 'bg-amber-500/8 border-amber-500/15 text-amber-900/80',
        badge: 'bg-amber-500 text-white',
    },
    error: {
        chip: 'Cú gặp trục trặc',
        icon: ShieldAlert,
        gradient: 'from-rose-500 via-red-500 to-orange-500',
        accent: 'bg-rose-500/12 text-rose-700 border-rose-500/15',
        note: 'bg-rose-500/8 border-rose-500/15 text-rose-900/80',
        badge: 'bg-rose-500 text-white',
    },
};

const confirmToneClass = {
    primary: 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sky-500/20 hover:shadow-sky-500/30',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20 hover:shadow-amber-500/30',
    danger: 'bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-rose-500/20 hover:shadow-rose-500/30',
};

export default function OwlDialog({
    isOpen,
    variant = 'info',
    title,
    message,
    details = '',
    confirmLabel = 'Đã hiểu',
    cancelLabel = 'Đóng',
    showCancel = false,
    confirmTone,
    loading = false,
    onConfirm,
    onClose,
}) {
    const config = variantConfig[variant] || variantConfig.info;
    const ConfirmIcon = config.icon;
    const confirmClass = confirmToneClass[confirmTone || (variant === 'success' ? 'success' : 'primary')];

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !loading) {
                onClose?.();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, loading, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6">
                    <motion.button
                        type="button"
                        aria-label="Đóng thông báo"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !loading && onClose?.()}
                        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="owl-dialog-title"
                        initial={{ opacity: 0, y: 24, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.96 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }}
                        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/60 bg-base-100 shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
                    >
                        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${config.gradient}`} />
                        <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${config.gradient} opacity-[0.10] blur-3xl`} />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_45%)] pointer-events-none" />

                        <div className="relative p-6 sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${config.accent}`}>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {config.chip}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => !loading && onClose?.()}
                                    className="btn btn-ghost btn-sm btn-circle text-base-content/45 hover:text-base-content"
                                    aria-label="Đóng"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-5 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-white via-amber-50 to-orange-50 shadow-[0_18px_45px_rgba(245,158,11,0.18)]">
                                    <motion.div
                                        animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
                                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                                        className="text-6xl leading-none drop-shadow-[0_10px_18px_rgba(120,53,15,0.18)]"
                                    >
                                        🦉
                                    </motion.div>
                                    <div className={`absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-2xl shadow-lg ${config.badge}`}>
                                        <ConfirmIcon className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 id="owl-dialog-title" className="text-2xl font-black tracking-tight text-base-content">
                                        {title}
                                    </h3>
                                    {message && (
                                        <p className="mt-2 text-sm font-medium leading-relaxed text-base-content/70 whitespace-pre-line">
                                            {message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {details && (
                                <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium leading-relaxed ${config.note}`}>
                                    {details}
                                </div>
                            )}

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                {showCancel && (
                                    <button
                                        type="button"
                                        onClick={() => !loading && onClose?.()}
                                        className="btn rounded-2xl border-base-300 bg-base-100 px-5 font-bold text-base-content/70 shadow-none hover:bg-base-200"
                                    >
                                        {cancelLabel}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => onConfirm?.()}
                                    disabled={loading}
                                    className={`btn rounded-2xl border-none px-5 font-bold shadow-lg transition-all ${confirmClass}`}
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
