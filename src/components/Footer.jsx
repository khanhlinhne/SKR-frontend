import { useState } from 'react';
import * as motion from 'motion/react-client';
import { Link } from 'react-router-dom';
import {
    Facebook, Twitter, Instagram, Linkedin, Youtube,
    GraduationCap, Mail, Phone, MapPin, ArrowRight,
    Heart, Send, ExternalLink, Sparkles, CheckCircle2
} from 'lucide-react';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            setTimeout(() => setIsSubscribed(false), 3000);
            setEmail('');
        }
    };

    const footerLinks = {
        product: [
            { name: 'Tính năng', href: '#features' },
            { name: 'Bảng giá', href: '#pricing' },
            { name: 'Flashcards', href: '#' },
            { name: 'Spaced Repetition', href: '#' },
            { name: 'Mind Map', href: '#' }
        ],
        company: [
            { name: 'Về chúng tôi', href: '#' },
            { name: 'Blog', href: '#blog' },
            { name: 'Tuyển dụng', href: '#', badge: 'Hiring' },
            { name: 'Đối tác', href: '#' },
            { name: 'Liên hệ', href: '#' }
        ],
        resources: [
            { name: 'Trung tâm hỗ trợ', href: '#' },
            { name: 'Hướng dẫn sử dụng', href: '#' },
            { name: 'API Developers', href: '#' },
            { name: 'Cộng đồng', href: '#', badge: 'New' }
        ],
        legal: [
            { name: 'Quyền riêng tư', href: '#' },
            { name: 'Điều khoản dịch vụ', href: '#' },
            { name: 'Cookie Policy', href: '#' },
            { name: 'Bảo mật', href: '#' }
        ]
    };

    const socialLinks = [
        { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
        { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
        { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500' },
        { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-700' },
        { icon: Youtube, href: '#', label: 'Youtube', color: 'hover:bg-red-600' }
    ];



    return (
        <footer className="relative bg-gradient-to-b from-base-100 to-base-200 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-full blur-[120px]"
                    animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-[100px]"
                    animate={{ y: [0, 20, 0], scale: [1, 0.95, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Newsletter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="py-16"
                >
                    <div className="relative bg-gradient-to-br from-base-100 via-base-100 to-blue-50/50 rounded-[2.5rem] p-8 md:p-12 lg:p-16 border border-base-200 shadow-2xl overflow-hidden">
                        {/* Animated gradient blobs */}
                        <motion.div
                            className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-violet-500/15 rounded-full blur-[80px]"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-violet-500/15 to-pink-500/15 rounded-full blur-[80px]"
                            animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        />

                        {/* Animated border lines */}
                        <motion.div
                            className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />

                        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left content */}
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20"
                                >
                                    <Sparkles className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-bold text-blue-600">Newsletter</span>
                                </motion.div>

                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-base-content leading-tight tracking-tight">
                                    Cập nhật{' '}
                                    <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                                        xu hướng học tập
                                    </span>{' '}
                                    mới nhất
                                </h3>

                                <p className="text-lg text-base-content/60 font-medium leading-relaxed max-w-md">
                                    Nhận mẹo ôn thi, ưu đãi đặc quyền và cập nhật tính năng trực tiếp vào hộp thư email.
                                </p>

                                <div className="flex flex-wrap gap-4 text-sm text-base-content/50">
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        Miễn phí 100%
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        Không spam
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        Hủy bất cứ lúc nào
                                    </span>
                                </div>
                            </div>

                            {/* Right - Form */}
                            <div className="space-y-4">
                                <form onSubmit={handleSubscribe} className="space-y-4">
                                    <div className="relative group">
                                        <motion.div
                                            className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-50 blur transition-opacity duration-500"
                                        />
                                        <div className="relative flex gap-2">
                                            <div className="relative flex-1">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Nhập email của bạn..."
                                                    className="w-full h-14 pl-12 pr-4 bg-base-100 border-2 border-base-300 rounded-xl text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                                />
                                            </div>
                                            <motion.button
                                                type="submit"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="h-14 px-6 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-shadow"
                                            >
                                                <Send className="w-5 h-5" />
                                                <span className="hidden sm:inline">Đăng ký</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </form>

                                {/* Success message */}
                                {isSubscribed && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 text-sm text-green-600 font-medium"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Đăng ký thành công! Kiểm tra email của bạn.
                                    </motion.div>
                                )}

                                <p className="text-xs text-base-content/40 font-medium">
                                    Bằng việc đăng ký, bạn đồng ý với{' '}
                                    <a href="#" className="text-blue-600 hover:underline">Chính sách bảo mật</a>{' '}
                                    của chúng tôi.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>



                {/* Main Footer Content */}
                <div className="py-16">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
                        {/* Brand Column */}
                        <div className="col-span-2 space-y-6">
                            <Link to="/" className="flex items-center gap-3 group">
                                <motion.div
                                    className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25"
                                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <GraduationCap className="w-7 h-7 text-white" strokeWidth={2} />
                                </motion.div>
                                <div>
                                    <span className="text-2xl font-black text-base-content tracking-tight">
                                        SKR<span className="text-blue-600">.</span>
                                    </span>
                                    <p className="text-xs text-base-content/40 font-medium">Smart Knowledge Revise</p>
                                </div>
                            </Link>

                            <p className="text-base-content/60 font-medium leading-relaxed max-w-xs">
                                Hệ thống học tập thông minh giúp cá nhân hóa lộ trình ôn thi và bứt phá điểm số cùng AI tiên tiến.
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <a href="mailto:contact@skr.edu.vn" className="flex items-center gap-3 text-sm text-base-content/60 hover:text-blue-600 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-base-200 group-hover:bg-blue-500/10 flex items-center justify-center transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    contact@skr.edu.vn
                                </a>
                                <a href="tel:+84123456789" className="flex items-center gap-3 text-sm text-base-content/60 hover:text-blue-600 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-base-200 group-hover:bg-blue-500/10 flex items-center justify-center transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    +84 123 456 789
                                </a>
                                <div className="flex items-center gap-3 text-sm text-base-content/60">
                                    <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    Hà Nội, Việt Nam
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-3">
                                {socialLinks.map((social, i) => (
                                    <motion.a
                                        key={i}
                                        href={social.href}
                                        aria-label={social.label}
                                        whileHover={{ scale: 1.1, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-10 h-10 rounded-xl bg-base-200 ${social.color} hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm`}
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Link Columns */}
                        <FooterColumn title="Sản phẩm" links={footerLinks.product} />
                        <FooterColumn title="Công ty" links={footerLinks.company} />
                        <FooterColumn title="Tài nguyên" links={footerLinks.resources} />
                        <FooterColumn title="Pháp lý" links={footerLinks.legal} />
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-8 border-t border-base-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-base-content/50 font-medium">
                            © 2026 Smart Knowledge Revise. Bảo lưu mọi quyền.
                        </p>

                        <div className="flex items-center gap-6">
                            <a href="#" className="text-sm text-base-content/50 hover:text-blue-600 font-medium transition-colors">
                                Sitemap
                            </a>
                            <a href="#" className="text-sm text-base-content/50 hover:text-blue-600 font-medium transition-colors">
                                Accessibility
                            </a>
                            <span className="flex items-center gap-1.5 text-sm text-base-content/50 font-medium">
                                Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in Vietnam
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }) {
    return (
        <div>
            <h4 className="font-bold text-base-content mb-6 text-xs uppercase tracking-widest">
                {title}
            </h4>
            <ul className="space-y-3">
                {links.map((link) => (
                    <li key={link.name}>
                        <a
                            href={link.href}
                            className="group inline-flex items-center gap-2 text-base-content/60 hover:text-blue-600 transition-colors text-sm font-medium"
                        >
                            <span>{link.name}</span>
                            {link.badge && (
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${link.badge === 'New'
                                    ? 'bg-green-500/10 text-green-600'
                                    : 'bg-blue-500/10 text-blue-600'
                                    }`}>
                                    {link.badge}
                                </span>
                            )}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
