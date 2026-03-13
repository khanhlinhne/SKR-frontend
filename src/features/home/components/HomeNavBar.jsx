import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import HomeThemeToggle from './HomeThemeToggle';

const navItems = [
    { label: 'Tính năng', href: '#features' },
    { label: 'Môn học', href: '#curriculum' },
    { label: 'Bảng giá', href: '#pricing' },
];

export default function HomeNavBar() {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const resolveAnchorHref = (href) => (location.pathname === '/' ? href : `/${href}`);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8"
        >
            <div
                className={`apple-transition mx-auto flex max-w-7xl items-center justify-between rounded-[24px] border px-5 py-4 ${
                    isScrolled
                        ? 'apple-panel-strong apple-card-shadow-md backdrop-blur-2xl'
                        : 'apple-panel backdrop-blur-xl'
                }`}
            >
                <Link to="/" className="flex items-center gap-3" aria-label="Trang chủ SKR">
                    <motion.div
                        whileHover={{ scale: 1.05, y: -1 }}
                        className="apple-solid-surface flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                    >
                        SK
                    </motion.div>
                    <div className="leading-tight">
                        <div className="apple-main-text text-[15px] font-semibold">SKR</div>
                        <div className="apple-secondary-text text-xs">Smart Knowledge Revise</div>
                    </div>
                </Link>

                <nav className="hidden items-center gap-8 lg:flex">
                    {navItems.map((item, index) => (
                        <motion.a
                            key={item.label}
                            href={resolveAnchorHref(item.href)}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.08 + index * 0.04 }}
                            whileHover={{ y: -1 }}
                            className="apple-transition apple-secondary-text text-sm font-medium hover:text-[var(--apple-text)]"
                        >
                            {item.label}
                        </motion.a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <HomeThemeToggle />
                    <Link
                        to="/login"
                        className="apple-transition apple-subtle-hover inline-flex h-11 items-center rounded-full px-5 text-sm font-medium apple-secondary-text hover:text-[var(--apple-text)]"
                    >
                        Đăng nhập
                    </Link>
                    <motion.div whileHover={{ y: -1 }}>
                        <Link
                            to="/signup"
                            className="apple-primary-button apple-transition inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
                        >
                            Bắt đầu
                        </Link>
                    </motion.div>
                </div>

                <div className="flex items-center gap-2 lg:hidden">
                    <HomeThemeToggle />
                    <button
                        type="button"
                        aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
                        onClick={() => setIsOpen((value) => !value)}
                        className="apple-theme-toggle apple-transition inline-flex h-11 w-11 items-center justify-center rounded-full"
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <motion.div
                initial={false}
                animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                    marginTop: isOpen ? 12 : 0,
                }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="apple-panel-strong mx-auto max-w-7xl overflow-hidden rounded-[24px] border backdrop-blur-2xl lg:hidden"
            >
                <div className="flex flex-col gap-2 py-4">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={resolveAnchorHref(item.href)}
                            onClick={() => setIsOpen(false)}
                            className="apple-transition apple-subtle-hover mx-5 rounded-2xl px-4 py-3 text-sm font-medium apple-secondary-text hover:text-[var(--apple-text)]"
                        >
                            {item.label}
                        </a>
                    ))}
                    <div className="mx-5 mt-2 flex flex-col gap-2 border-t apple-border pt-4">
                        <div className="flex items-center justify-between rounded-2xl px-4 py-3 apple-soft-panel">
                            <div>
                                <p className="apple-main-text text-sm font-medium">Giao diện</p>
                                <p className="apple-secondary-text mt-1 text-xs">Chuyển nhanh giữa nền sáng và tối</p>
                            </div>
                            <HomeThemeToggle />
                        </div>
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="apple-secondary-button apple-transition inline-flex h-11 items-center justify-center rounded-full text-sm font-medium"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/signup"
                            onClick={() => setIsOpen(false)}
                            className="apple-primary-button apple-transition inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold"
                        >
                            Bắt đầu
                        </Link>
                    </div>
                </div>
            </motion.div>
        </motion.header>
    );
}
