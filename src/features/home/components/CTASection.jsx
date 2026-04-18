import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ctaChips = ['Tạo tài khoản trong 1 phút', 'Không cần thẻ tín dụng', 'Học trên mọi thiết bị'];

export default function CTASection() {
    return (
        <section className="px-6 pb-24 pt-6 lg:px-8 lg:pb-28">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="apple-emphasis-card apple-card-shadow-md relative mx-auto max-w-7xl overflow-hidden rounded-[36px] border px-8 py-12 sm:px-12 lg:px-14 lg:py-16"
            >
                <motion.div
                    animate={{ x: ['-8%', '8%', '-8%'], opacity: [0.35, 0.6, 0.35] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    className="apple-cta-glow pointer-events-none absolute inset-y-0 left-0 w-1/2 blur-3xl"
                />

                <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="max-w-3xl">
                        <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl">
                            Sẵn sàng bắt đầu
                        </div>
                        <h2 className="apple-main-text mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                            Bắt đầu hành trình học tập
                            <br />
                            <span className="apple-highlight-text">cùng SKR ngay hôm nay</span>
                        </h2>
                        <p className="apple-secondary-text mt-6 text-lg leading-8">
                            Tạo tài khoản để lưu lộ trình học, luyện flashcards, tạo đề từ AI và theo dõi tiến độ mỗi ngày trong một không gian học tập thống nhất.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3 text-sm">
                            {ctaChips.map((chip) => (
                                <span key={chip} className="apple-chip rounded-full px-4 py-2">
                                    {chip}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Link
                                to="/signup"
                                className="apple-primary-button apple-transition inline-flex h-12 min-w-[220px] items-center justify-center rounded-full px-6 text-sm font-semibold"
                            >
                                Tạo tài khoản
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Link
                                to="/courses"
                                className="apple-secondary-button apple-transition inline-flex h-12 min-w-[220px] items-center justify-center rounded-full text-sm font-semibold"
                            >
                                Xem môn học
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
