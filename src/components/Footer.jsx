import * as motion from 'motion/react-client';
import { Facebook, Twitter, Instagram, Linkedin, GraduationCap } from 'lucide-react';

export default function Footer() {
    const footerLinks = {
        product: [
            { name: 'Tính năng', href: '#features' },
            { name: 'Giá cả', href: '#pricing' },
            { name: 'Tích hợp', href: '#' },
            { name: 'Cập nhật', href: '#' }
        ],
        company: [
            { name: 'Về chúng tôi', href: '#' },
            { name: 'Blog', href: '#blog' },
            { name: 'Tuyển dụng', href: '#' },
            { name: 'Liên hệ', href: '#' }
        ],
        resources: [
            { name: 'Trung tâm hỗ trợ', href: '#' },
            { name: 'Tài liệu', href: '#' },
            { name: 'Cộng đồng', href: '#' }
        ],
        legal: [
            { name: 'Quyền riêng tư', href: '#' },
            { name: 'Điều khoản', href: '#' },
            { name: 'Bảo mật', href: '#' }
        ]
    };

    return (
        <footer className="bg-base-200 border-t border-base-300">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                {/* Newsletter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative mb-16 overflow-hidden"
                >
                    {/* Light Background Container */}
                    <div className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-[2rem] lg:rounded-[3rem] p-8 md:p-12 lg:p-16 border border-slate-200/60 shadow-xl">
                        {/* Animated background elements */}
                        <motion.div
                            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-violet-400/15 rounded-full blur-[120px]"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-[120px]"
                            animate={{
                                scale: [1.1, 1, 1.1],
                                opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />

                        {/* Top accent line animation */}
                        <motion.div
                            className="absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <div className="relative z-10">
                            {/* Content Grid */}
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Left: Text Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.1 }}
                                    className="space-y-6"
                                >
                                    <motion.div
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <h3 className="text-4xl md:text-5xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                            Cập nhật tin tức
                                            <motion.span
                                                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600"
                                                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                            >
                                                mới nhất
                                            </motion.span>
                                        </h3>
                                    </motion.div>
                                    <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-md">
                                        Nhận các mẹo ôn thi, ưu đãi đặc quyền, và cập nhật sản phẩm trực tiếp vào hộp thư của bạn.
                                    </p>

                                    {/* Success message */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-center gap-2 text-sm text-slate-600"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-2 h-2 rounded-full bg-green-500"
                                        />
                                        Miễn phí không cần thẻ tín dụng
                                    </motion.div>
                                </motion.div>

                                {/* Right: Input Form */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="group relative">
                                        {/* Input container with border glow */}
                                        <motion.div
                                            className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"
                                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        />

                                        <input
                                            type="email"
                                            placeholder="Nhập email của bạn"
                                            className="relative w-full input input-lg bg-white/80 backdrop-blur-sm border border-slate-300/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 rounded-2xl font-medium transition-all duration-300 group-hover:border-slate-400"
                                        />
                                    </div>

                                    {/* Subscribe button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full btn btn-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-2xl font-bold text-base shadow-lg shadow-blue-600/30 group transition-all duration-300"
                                    >
                                        <motion.span
                                            className="flex items-center justify-center gap-2"
                                            animate={{ x: [0, 2, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            Đăng ký ngay
                                            <motion.svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </motion.svg>
                                        </motion.span>
                                    </motion.button>

                                    {/* Trust indicator */}
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 }}
                                        className="text-center text-xs text-slate-600 font-medium"
                                    >
                                        ✓ Chúng tôi tôn trọng quyền riêng tư của bạn
                                    </motion.p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Bottom accent line */}
                        <motion.div
                            className="absolute bottom-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-violet-400 to-transparent"
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                        />
                    </div>
                </motion.div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-black text-base-content tracking-tighter">
                                SKR<span className="text-blue-600">.</span>
                            </span>
                        </div>
                        <p className="text-base-content/60 font-medium leading-relaxed max-w-xs">
                            Hệ thống học tập thông minh giúp cá nhân hóa lộ trình ôn thi và bứt phá điểm số cùng AI.
                        </p>
                        <div className="flex gap-4">Q
                            {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="w-10 h-10 rounded-xl bg-base-300 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    <FooterColumn title="Sản phẩm" links={footerLinks.product} />
                    <FooterColumn title="Công ty" links={footerLinks.company} />
                    <FooterColumn title="Tài nguyên" links={footerLinks.resources} />
                    <FooterColumn title="Pháp lý" links={footerLinks.legal} />
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-base-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-base-content/50 font-bold uppercase tracking-widest">
                    <p>© 2026 Smart Knowledge Revise System. Bảo lưu mọi quyền.</p>
                    <p>Được kiến tạo với ❤️ dành cho sinh viên Việt Nam</p>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }) {
    return (
        <div>
            <h4 className="font-black text-base-content mb-6 text-xs uppercase tracking-[0.2em] opacity-40">
                {title}
            </h4>
            <ul className="space-y-4">
                {links.map((link) => (
                    <li key={link.name}>
                        <a
                            href={link.href}
                            className="text-base-content/60 hover:text-blue-600 transition-colors text-sm font-bold"
                        >
                            {link.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
