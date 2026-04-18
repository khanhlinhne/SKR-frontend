import { motion } from 'motion/react';

export default function FlashcardDeleteModal({
    deckDeleteCandidate,
    deletingDeckId,
    onClose,
    onConfirm,
}) {
    if (!deckDeleteCandidate) {
        return null;
    }

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 140 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box max-w-lg rounded-3xl border border-base-300 shadow-2xl"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/20 text-3xl">
                        🦉
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Xác nhận xóa</p>
                        <h3 className="mt-1 text-xl font-black text-base-content">Bạn muốn xóa bộ này không?</h3>
                        <p className="mt-2 text-sm text-base-content/70">
                            Bộ <span className="font-bold text-base-content">"{deckDeleteCandidate.name}"</span> sẽ bị xóa khỏi danh sách của bạn.
                        </p>
                        <p className="mt-1 text-xs text-base-content/55">Con cú nhắc nhẹ: hành động này không thể hoàn tác.</p>
                    </div>
                </div>

                <div className="modal-action mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost rounded-xl font-bold"
                        disabled={Boolean(deletingDeckId)}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="btn rounded-xl border-none bg-gradient-to-r from-red-500 to-rose-600 font-bold text-white"
                        disabled={Boolean(deletingDeckId)}
                    >
                        {deletingDeckId ? '🦉 Đang xóa...' : 'Xóa bộ flashcard'}
                    </button>
                </div>
            </motion.div>
            <div className="modal-backdrop bg-black/45" onClick={onClose} />
        </div>
    );
}
