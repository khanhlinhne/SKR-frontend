import { motion } from 'motion/react';
import { Zap, Star } from 'lucide-react';
import { PREMIUM_FEATURES } from '@/features/profile/constants';

export default function ProfilePremiumCard({ variants }) {
    return (
        <motion.div
            variants={variants}
            className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-rose-500/10 p-6"
        >
            <div className="mb-3 flex items-center gap-2">
                <Zap className="h-6 w-6 text-orange-500" />
                <h3 className="text-lg font-black text-base-content">Premium đang hoạt động</h3>
            </div>
            <p className="mb-4 text-sm text-base-content/70">
                Gói Premium của bạn còn hiệu lực đến <span className="font-bold text-orange-500">31/12/2024</span>
            </p>
            <div className="mb-4 space-y-2">
                {PREMIUM_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                        <span className="font-medium text-base-content/80">{feature}</span>
                    </div>
                ))}
            </div>
            <button className="btn btn-sm w-full rounded-xl border-none bg-gradient-to-r from-orange-500 to-pink-500 font-bold text-white hover:from-orange-600 hover:to-pink-600">
                Gia hạn Premium
            </button>
        </motion.div>
    );
}
