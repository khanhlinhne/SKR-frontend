import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Brain, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeController from '@/shared/theme/ThemeController';

export default function NavBar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Tính năng', href: '#features' },
        { name: 'Lợi ích', href: '#benefits' },
        { name: 'Giá cả', href: '#pricing' },
        { name: 'Blog', href: '#blog' }
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-base-100/80 backdrop-blur-xl shadow-lg border-b border-base-300'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg"
                        >
                            <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </motion.div>
                        <span className="text-2xl font-black text-base-content tracking-tighter">
                            SKR<span className="text-blue-600">.</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-10">
                        {navLinks.map((link, index) => (
                            <motion.a
                                key={link.name}
                                href={link.href}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-base-content/70 hover:text-base-content font-bold transition-colors relative group text-sm uppercase tracking-widest"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600 group-hover:w-full transition-all duration-300" />
                            </motion.a>
                        ))}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-6">
                        <ThemeController />

                        <Link to="/login" className="hidden lg:block">
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-md bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-2xl px-8 shadow-xl shadow-blue-600/20 font-bold w-full"
                            >
                                Bắt đầu ngay
                            </motion.button>
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden btn btn-ghost btn-sm"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <motion.div
                initial={false}
                animate={{
                    height: isMobileMenuOpen ? 'auto' : 0,
                    opacity: isMobileMenuOpen ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden bg-base-100/95 backdrop-blur-xl border-t border-base-300"
            >
                <div className="px-6 py-8 space-y-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-xl font-bold text-base-content/70 hover:text-base-content transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full btn btn-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-2xl shadow-xl shadow-blue-600/20 font-bold">
                            Bắt đầu ngay
                        </button>
                    </Link>
                </div>
            </motion.div>
        </motion.nav>
    );
}

