import { motion } from 'motion/react';
import { Loader2, PlayCircle, Plus } from 'lucide-react';

export default function AddVideoModal({ open, onClose, onSubmit, loading }) {
    if (!open) return null;

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="modal-box rounded-2xl border border-base-300 shadow-2xl"
            >
                <h3 className="flex items-center gap-2 text-lg font-black">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                        <PlayCircle className="h-4 w-4 text-white" />
                    </div>
                    {'Thêm Video'}
                </h3>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.target);
                        onSubmit({
                            videoTitle: formData.get('videoTitle'),
                            videoUrl: formData.get('videoUrl'),
                            videoDescription: formData.get('videoDescription'),
                        });
                    }}
                    className="mt-4 space-y-3"
                >
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-bold">{'Tiêu đề video'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            name="videoTitle"
                            type="text"
                            placeholder="VD: Giới thiệu bài học"
                            className="input input-bordered input-sm w-full rounded-xl font-medium"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-bold">URL Video <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            name="videoUrl"
                            type="url"
                            placeholder="https://youtube.com/watch?v=..."
                            className="input input-bordered input-sm w-full rounded-xl font-medium"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-bold">{'Mô tả (tùy chọn)'}</span>
                        </label>
                        <textarea
                            name="videoDescription"
                            placeholder="Mô tả nội dung video..."
                            className="textarea textarea-bordered rounded-xl resize-none text-sm font-medium"
                            rows={2}
                        />
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">
                            {'Hủy'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-blue-600 to-cyan-600 font-bold text-white gap-1.5"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {'Thêm video'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}
