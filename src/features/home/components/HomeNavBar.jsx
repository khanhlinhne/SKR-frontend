import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HomeThemeToggle from './HomeThemeToggle';
import { isTokenValid, clearTokens } from '@/shared/utils/tokenManager';
import { readCachedUserProfile, getUserInitials } from '@/shared/user/useCurrentUserProfile';

const navItems = [
    { label: 'Tính năng', href: '#features' },
    { label: 'Môn học', href: '#curriculum' },
    { label: 'Flashcard', href: '/flashcards/explore' },
];

export default function HomeNavBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const resolveAnchorHref = (href) => (location.pathname === '/' ? href : `/${href}`);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Check authentication state
    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isTokenValid();
            setIsAuthenticated(authenticated);
            if (authenticated) {
                setUserProfile(readCachedUserProfile());
            } else {
                setUserProfile(null);
            }
        };

        checkAuth();

        // Listen for storage changes (e.g., login/logout in another tab)
        const handleStorage = (e) => {
            if (e.key === 'accessToken' || e.key === 'user') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [location.pathname]);

    const handleLogout = () => {
        clearTokens();
        setIsAuthenticated(false);
        setUserProfile(null);
        setIsOpen(false);
        navigate('/');
    };

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
                        (item.href.startsWith('/') || item.href === '#curriculum') ? (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.08 + index * 0.04 }}
                                whileHover={{ y: -1 }}
                            >
                                <Link
                                    to={item.href === '#curriculum' ? '/courses' : item.href}
                                    className="apple-transition apple-secondary-text text-sm font-medium hover:text-[var(--apple-text)]"
                                >
                                    {item.label}
                                </Link>
                            </motion.div>
                        ) : (
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
                        )
                    ))}
                </nav>

                {/* Desktop right-side buttons */}
                <div className="hidden items-center gap-3 lg:flex">
                    <HomeThemeToggle />

                    {isAuthenticated && userProfile ? (
                        <>
                            <motion.div whileHover={{ y: -1 }}>
                                <Link
                                    to="/dashboard"
                                    className="apple-secondary-button apple-transition inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </motion.div>

                            <div className="flex items-center gap-2.5 rounded-full border border-[var(--apple-border)] bg-[var(--apple-panel)] px-3 py-1.5">
                                {userProfile.avatarUrl ? (
                                    <img
                                        src={userProfile.avatarUrl}
                                        alt={userProfile.name}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="apple-solid-surface flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                                        {getUserInitials(userProfile.name)}
                                    </div>
                                )}
                                <span className="apple-main-text max-w-[100px] truncate text-sm font-medium">
                                    {userProfile.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="apple-transition ml-1 flex h-7 w-7 items-center justify-center rounded-full text-[var(--apple-text-muted)] hover:bg-red-500/10 hover:text-red-500"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
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
                                    Đăng Ký
                                </Link>
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
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

            {/* Mobile menu dropdown */}
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
                        (item.href.startsWith('/') || item.href === '#curriculum') ? (
                            <Link
                                key={item.label}
                                to={item.href === '#curriculum' ? '/courses' : item.href}
                                onClick={() => setIsOpen(false)}
                                className="apple-transition apple-subtle-hover mx-5 rounded-2xl px-4 py-3 text-sm font-medium apple-secondary-text hover:text-[var(--apple-text)]"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <a
                                key={item.label}
                                href={resolveAnchorHref(item.href)}
                                onClick={() => setIsOpen(false)}
                                className="apple-transition apple-subtle-hover mx-5 rounded-2xl px-4 py-3 text-sm font-medium apple-secondary-text hover:text-[var(--apple-text)]"
                            >
                                {item.label}
                            </a>
                        )
                    ))}
                    <div className="mx-5 mt-2 flex flex-col gap-2 border-t apple-border pt-4">
                        <div className="flex items-center justify-between rounded-2xl px-4 py-3 apple-soft-panel">
                            <div>
                                <p className="apple-main-text text-sm font-medium">Giao diện</p>
                                <p className="apple-secondary-text mt-1 text-xs">Chuyển nhanh giữa nền sáng và tối</p>
                            </div>
                            <HomeThemeToggle />
                        </div>

                        {isAuthenticated && userProfile ? (
                            <>
                                {/* Mobile: show user info */}
                                <div className="flex items-center gap-3 rounded-2xl px-4 py-3 apple-soft-panel">
                                    {userProfile.avatarUrl ? (
                                        <img
                                            src={userProfile.avatarUrl}
                                            alt={userProfile.name}
                                            className="h-9 w-9 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="apple-solid-surface flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold">
                                            {getUserInitials(userProfile.name)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="apple-main-text truncate text-sm font-semibold">{userProfile.name}</p>
                                        {userProfile.email && (
                                            <p className="apple-secondary-text truncate text-xs">{userProfile.email}</p>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="apple-primary-button apple-transition inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Đi tới Dashboard
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="apple-transition inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-500/20 text-sm font-medium text-red-500 hover:bg-red-500/10"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.header>
    );
}
