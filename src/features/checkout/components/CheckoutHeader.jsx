import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserInitials } from '@/shared/user';

export default function CheckoutHeader({ profile, isAuthenticated = false, homeHref = '/' }) {
    const displayName = sanitizeProfileName(profile?.name);

    return (
        <header className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="apple-panel-strong apple-card-shadow-md mx-auto flex max-w-7xl items-center justify-between rounded-[24px] border px-5 py-4 backdrop-blur-2xl">
                <Link to={homeHref} className="flex items-center gap-3" aria-label="Trang chủ SKR">
                    <div className="apple-solid-surface flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                        SK
                    </div>
                    <div className="leading-tight">
                        <div className="apple-main-text text-[15px] font-semibold">SKR</div>
                        <div className="apple-secondary-text text-xs">Checkout bảo mật</div>
                    </div>
                </Link>

                <div className="flex items-center gap-3">
                    <div className="apple-chip hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:inline-flex">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Bảo mật thanh toán
                    </div>

                    {isAuthenticated ? (
                        <div className="apple-soft-panel flex items-center gap-2 rounded-full px-3 py-2">
                            {profile?.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt={profile.name || 'Người dùng'}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="apple-solid-surface flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                                    {getUserInitials(displayName)}
                                </div>
                            )}
                            <div className="hidden text-left sm:block">
                                <p className="apple-main-text text-xs font-semibold">{displayName}</p>
                                <p className="apple-secondary-text text-[11px]">{profile?.email || 'Đang đồng bộ tài khoản'}</p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}

function sanitizeProfileName(name) {
    if (!name || name.includes('?')) {
        return 'Người dùng SKR';
    }

    return name;
}
