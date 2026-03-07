import { motion } from 'motion/react';
import { Zap, Star } from 'lucide-react';
import { PREMIUM_FEATURES } from '@/features/profile/constants';

export default function ProfilePremiumCard({ variants }) {
    return (
        <motion.div
            variants={variants}
            className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-3xl p-6 border border-orange-500/20"
        >
            <div className="flex items-center gap-2 mb-3">
                <Zap className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-black text-base-content">Premium Active</h3>
            </div>
            <p className="text-sm text-base-content/70 mb-4">
                Goi Premium cua ban con hieu luc den <span className="font-bold text-orange-500">31/12/2024</span>
            </p>
            <div className="space-y-2 mb-4">
                {PREMIUM_FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                        <span className="font-medium text-base-content/80">{feature}</span>
                    </div>
                ))}
            </div>
            <button className="btn btn-sm w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-none rounded-xl font-bold">
                Gia han Premium
            </button>
        </motion.div>
    );
}
