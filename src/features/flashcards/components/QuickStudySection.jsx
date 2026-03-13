import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';

export default function QuickStudySection({
    dueToday = 0,
    onStartQuickStudy,
    variants,
}) {
    return (
        <motion.div
            variants={variants}
            className="mt-8 bg-gradient-to-br from-blue-600/10 to-violet-600/10 rounded-3xl p-6 border border-blue-500/20"
        >
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg">
                        <Icon name="Zap" size="lg" color="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-base-content">Ôn Tập Nhanh</h3>
                        <p className="text-sm text-base-content/70">
                            {dueToday} thẻ cần ôn hôm nay từ tất cả các bộ
                        </p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStartQuickStudy}
                    className="btn btn-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-2xl font-bold shadow-xl shadow-blue-600/20 gap-2"
                >
                    <Icon name="Sparkles" size="md" />
                    Bắt Đầu Ôn Tập
                </motion.button>
            </div>
        </motion.div>
    );
}
