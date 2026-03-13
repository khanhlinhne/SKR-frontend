import { Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserInitials } from '@/shared/user';

export default function CheckoutAccountCard({
    profile,
    isAuthenticated = false,
    isHydrating = false,
    loginHref = '/login',
    compact = false,
}) {
    const displayName = sanitizeProfileName(profile?.name);

    if (!isAuthenticated) {
        return (
            <section className="apple-panel apple-card-shadow rounded-[32px] border p-6">
                <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                    Tài khoản thanh toán
                </div>
                <h2 className="apple-main-text mt-5 text-2xl font-semibold tracking-[-0.03em]">
                    Đăng nhập để gắn khóa học vào đúng tài khoản
                </h2>
                <p className="apple-secondary-text mt-3 text-sm leading-7">
                    Sau khi đăng nhập, checkout sẽ hiển thị đúng avatar, tên và email của bạn để xác nhận khóa học được mở trên đúng tài khoản.
                </p>
                <Link
                    to={loginHref}
                    className="apple-primary-button apple-transition mt-5 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
                >
                    Đăng nhập
                </Link>
            </section>
        );
    }

    return (
        <section className={`apple-panel apple-card-shadow rounded-[32px] border ${compact ? 'p-5' : 'p-6 sm:p-7'}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                        Tài khoản đang mua
                    </div>
                    <h2 className="apple-main-text mt-4 text-2xl font-semibold tracking-[-0.03em]">
                        {compact ? 'Xác nhận tài khoản sở hữu' : 'Khóa học sẽ được gắn vào tài khoản này'}
                    </h2>
                    <p className="apple-secondary-text mt-3 text-sm leading-7">
                        {compact
                            ? 'Bạn đang thanh toán bằng đúng tài khoản sẽ nhận quyền truy cập sau khi giao dịch hoàn tất.'
                            : 'SKR dùng thông tin này để gắn quyền truy cập khóa học và lưu tiến độ học tập sau khi thanh toán.'}
                    </p>
                </div>

                <div className="apple-chip inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-semibold">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Tài khoản đã xác thực
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-white/45 bg-white/75 p-5 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center">
                {profile?.avatarUrl ? (
                    <img
                        src={profile.avatarUrl}
                        alt={profile?.name || 'Người dùng SKR'}
                        className="h-16 w-16 rounded-full object-cover"
                    />
                ) : (
                    <div className="apple-solid-surface flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold">
                        {getUserInitials(displayName)}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-base-content/40" />
                        <p className="truncate text-base font-semibold text-base-content">
                            {isHydrating ? 'Đang đồng bộ tài khoản...' : displayName}
                        </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-base-content/65">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{profile?.email || 'Email sẽ xuất hiện sau khi profile được đồng bộ.'}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

function sanitizeProfileName(name) {
    if (!name || name.includes('?')) {
        return 'Người dùng SKR';
    }

    return name;
}
