import { motion } from 'motion/react';

export default function ProfileDangerZoneCard({ variants }) {
    return (
        <motion.div
            variants={variants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-red-500/20"
        >
            <h2 className="text-xl font-black text-red-500 mb-4">Vung Nguy Hiem</h2>
            <p className="text-sm text-base-content/70 mb-4">
                Cac hanh dong nay khong the hoan tac. Vui long can nhac ky.
            </p>
            <div className="space-y-2">
                <button className="btn btn-sm btn-outline btn-error w-full rounded-xl font-bold">
                    Xoa tat ca du lieu
                </button>
                <button className="btn btn-sm btn-error w-full rounded-xl font-bold">
                    Xoa tai khoan
                </button>
            </div>
        </motion.div>
    );
}
