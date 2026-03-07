import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    ArrowRight,
    Download,
    BookOpen,
    PartyPopper,
    Mail,
} from 'lucide-react';

const PARTICLE_STYLES = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    x: 6 + index * 4.5,
    delay: (index % 5) * 0.08,
    duration: 1.5 + (index % 4) * 0.25,
    size: 4 + (index % 5) * 2,
    yTarget: -120 - (index % 6) * 12,
    xTarget: ((index % 7) - 3) * 18,
    color: ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'][index % 5],
}));

export default function CheckoutSuccess({ transaction, plan }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center relative"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {PARTICLE_STYLES.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className={`absolute rounded-full ${particle.color} opacity-60`}
                        style={{
                            width: particle.size,
                            height: particle.size,
                            left: `${particle.x}%`,
                            top: '40%',
                        }}
                        initial={{ y: 0, opacity: 0, scale: 0 }}
                        animate={{
                            y: [-20, particle.yTarget],
                            x: [0, particle.xTarget],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0.5],
                        }}
                        transition={{
                            duration: particle.duration,
                            delay: particle.delay,
                            ease: 'easeOut',
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="relative inline-flex mb-6"
            >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <motion.div
                    className="absolute inset-0 rounded-full border-4 border-emerald-500"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: 2 }}
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center justify-center gap-2 mb-2">
                    <PartyPopper className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">Thanh toán thành công!</span>
                    <PartyPopper className="w-5 h-5 text-amber-500 scale-x-[-1]" />
                </div>
                <h2 className="text-3xl font-black text-base-content mb-2">
                    Chúc mừng bạn!
                </h2>
                <p className="text-base-content/60 text-lg font-medium max-w-md mx-auto">
                    Bạn đã đăng ký thành công gói <span className="font-bold text-violet-600">{plan?.name}</span>.
                    Hãy bắt đầu hành trình học tập ngay!
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-5 rounded-2xl bg-base-200/50 border border-base-200 max-w-md mx-auto"
            >
                <h4 className="text-sm font-bold text-base-content mb-3 flex items-center gap-2">
                    <Download className="w-4 h-4 text-violet-500" />
                    Chi tiết giao dịch
                </h4>
                <div className="space-y-2 text-sm">
                    {[
                        { label: 'Mã giao dịch', value: transaction?.id || 'TXN-SKR-20260207-001' },
                        { label: 'Gói đăng ký', value: plan?.name || 'Pro' },
                        { label: 'Phương thức', value: transaction?.paymentMethod || 'Ví MoMo' },
                        { label: 'Số tiền', value: transaction?.amount || '299,000đ', highlight: true },
                        { label: 'Thời gian', value: new Date().toLocaleString('vi-VN') },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                            <span className="text-base-content/50 font-medium">{item.label}</span>
                            <span className={`font-bold ${item.highlight ? 'text-emerald-600' : 'text-base-content'}`}>
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-2 mt-5"
            >
                <Mail className="w-4 h-4 text-base-content/40" />
                <span className="text-xs font-semibold text-base-content/40">
                    Biên lai đã được gửi đến email của bạn
                </span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
            >
                <Link to="/dashboard">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white border-none rounded-2xl shadow-xl shadow-violet-600/20 font-bold group px-8"
                    >
                        <BookOpen className="w-5 h-5" />
                        Bắt đầu học ngay
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </Link>
                <Link to="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-lg bg-base-200 hover:bg-base-300 text-base-content border-none rounded-2xl font-bold px-8"
                    >
                        Về trang chủ
                    </motion.button>
                </Link>
            </motion.div>
        </motion.div>
    );
}
