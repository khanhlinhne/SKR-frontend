import { motion } from 'motion/react';
import { FileText, Loader2, Plus } from 'lucide-react';

export default function AddDocumentModal({ open, onClose, onSubmit, loading }) {
    if (!open) return null;

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="modal-box rounded-2xl border border-base-300 shadow-2xl"
            >
                <h3 className="flex items-center gap-2 text-lg font-black">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                        <FileText className="h-4 w-4 text-white" />
                    </div>
                    {'Thêm Tài liệu'}
                </h3>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.target);
                        const file = formData.get('file');
                        const safeFile = file instanceof File && file.size > 0 ? file : null;
                        const fallbackTitle = formData.get('documentTitle');

                        onSubmit({
                            documentTitle: fallbackTitle,
                            file: safeFile,
                            fileUrl: formData.get('fileUrl'),
                            fileName: formData.get('fileName') || safeFile?.name || fallbackTitle,
                            fileType: formData.get('fileType') || 'pdf',
                            documentDescription: formData.get('documentDescription'),
                        });
                    }}
                    className="mt-4 space-y-3"
                >
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-bold">{'Tiêu đề'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            name="documentTitle"
                            type="text"
                            placeholder="VD: Slide bài giảng"
                            className="input input-bordered input-sm w-full rounded-xl font-medium"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-bold">{'Tải file từ máy'}</span>
                        </label>
                        <input
                            name="file"
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                            className="file-input file-input-bordered file-input-sm w-full rounded-xl font-medium"
                        />
                    </div>
                    <div className="divider my-1 text-[10px] font-bold uppercase text-base-content/40">
                        {'hoặc dùng link'}
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-bold">{'URL Tài liệu'}</span>
                        </label>
                        <input
                            name="fileUrl"
                            type="url"
                            placeholder="https://drive.google.com/..."
                            className="input input-bordered input-sm w-full rounded-xl font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="form-control flex-1">
                            <label className="label py-1">
                                <span className="label-text text-xs font-bold">{'Tên file'}</span>
                            </label>
                            <input
                                name="fileName"
                                type="text"
                                placeholder="document.pdf"
                                className="input input-bordered input-sm w-full rounded-xl font-medium"
                            />
                        </div>
                        <div className="form-control w-28">
                            <label className="label py-1">
                                <span className="label-text text-xs font-bold">{'Loại file'}</span>
                            </label>
                            <select
                                name="fileType"
                                className="select select-bordered select-sm rounded-xl font-medium"
                                defaultValue="pdf"
                            >
                                <option value="pdf">PDF</option>
                                <option value="doc">DOC</option>
                                <option value="docx">DOCX</option>
                                <option value="ppt">PPT</option>
                                <option value="txt">TXT</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-bold">{'Mô tả (tùy chọn)'}</span>
                        </label>
                        <textarea
                            name="documentDescription"
                            placeholder="Mô tả tài liệu..."
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
                            className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white gap-1.5"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {'Thêm tài liệu'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}
