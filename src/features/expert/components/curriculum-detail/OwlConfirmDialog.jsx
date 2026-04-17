import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';

export default function OwlConfirmDialog({ dialog, onCancel, onConfirm }) {
    if (!dialog) return null;

    const toneStyles = dialog.tone === 'danger'
        ? {
            chip: 'bg-red-500/10 text-red-600 ring-red-500/20',
            button: 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
            accent: 'from-amber-100 via-orange-50 to-red-100',
        }
        : {
            chip: 'bg-violet-500/10 text-violet-600 ring-violet-500/20',
            button: 'from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700',
            accent: 'from-violet-100 via-fuchsia-50 to-blue-100',
        };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 140 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="modal-box max-w-lg overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 p-0 shadow-2xl"
            >
                <div className={`h-1 w-full bg-gradient-to-r ${toneStyles.button}`} />
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${toneStyles.accent} shadow-lg ring-1 ring-base-300`}>
                            <span className="text-3xl leading-none">ðŸ¦‰</span>
                            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-base-100 shadow-md ring-1 ring-base-200">
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            {dialog.badge && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ring-1 ${toneStyles.chip}`}>
                                    {dialog.badge}
                                </span>
                            )}
                            <h3 className="mt-3 text-xl font-black leading-tight text-base-content">
                                {dialog.title || 'Ban muon tiep tuc chu?'}
                            </h3>
                            {dialog.description && (
                                <p className="mt-3 text-sm leading-6 text-base-content/65">
                                    {dialog.description}
                                </p>
                            )}
                            {dialog.hint && (
                                <div className="mt-4 rounded-2xl border border-base-300 bg-base-200/55 px-4 py-3 text-xs font-medium leading-5 text-base-content/55">
                                    {dialog.hint}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content/70 hover:bg-base-200"
                        >
                            {dialog.cancelLabel || 'Giá»¯ láº¡i'}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`btn btn-sm border-none rounded-xl bg-gradient-to-r font-bold text-white shadow-lg ${toneStyles.button}`}
                        >
                            {dialog.confirmLabel || 'XÃ¡c nháº­n'}
                        </button>
                    </div>
                </div>
            </motion.div>
            <div className="modal-backdrop bg-black/50 backdrop-blur-sm" onClick={onCancel} />
        </div>
    );
}
