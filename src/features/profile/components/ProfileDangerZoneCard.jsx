import { motion } from 'motion/react';

export default function ProfileDangerZoneCard({ variants }) {
    return (
        <motion.div variants={variants} className="rounded-3xl border border-red-500/20 bg-base-100 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-black text-red-500">Vùng nguy hiểm</h2>
            <p className="mb-4 text-sm text-base-content/70">
                Những hành động này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi tiếp tục.
            </p>
            <div className="space-y-2">
                <button className="btn btn-outline btn-error btn-sm w-full rounded-xl font-bold">
                    Xóa toàn bộ dữ liệu
                </button>
                <button className="btn btn-error btn-sm w-full rounded-xl font-bold">
                    Xóa tài khoản
                </button>
            </div>
        </motion.div>
    );
}
