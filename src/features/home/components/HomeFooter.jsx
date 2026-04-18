import { Link, useLocation } from 'react-router-dom';
import { footerColumns } from '@/features/home/constants';

export default function HomeFooter() {
    const location = useLocation();
    const resolveAnchorHref = (href) => (location.pathname === '/' ? href : `/${href}`);

    return (
        <footer className="apple-footer-surface apple-transition border-t apple-border">
            <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
                <div className="max-w-md">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="apple-solid-surface flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold">
                            SK
                        </div>
                        <div>
                            <p className="apple-main-text text-sm font-semibold">SKR</p>
                            <p className="apple-secondary-text text-xs">Smart Knowledge Revise</p>
                        </div>
                    </div>
                    <p className="apple-secondary-text text-sm leading-7">
                        Nền tảng học tập được thiết kế để giúp người học duy trì sự tập trung, nhớ lâu hơn và nhìn thấy tiến độ thật sự qua từng buổi học.
                    </p>
                </div>

                {footerColumns.map((column) => (
                    <div key={column.title}>
                        <h3 className="apple-main-text mb-4 text-sm font-semibold">{column.title}</h3>
                        <ul className="space-y-3">
                            {column.links.map((item) => (
                                <li key={item.label}>
                                    {item.href.startsWith('/') ? (
                                        <Link
                                            to={item.href}
                                            className="apple-transition apple-secondary-text text-sm hover:text-[var(--apple-text)]"
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <a
                                            href={item.href.startsWith('#') ? resolveAnchorHref(item.href) : item.href}
                                            className="apple-transition apple-secondary-text text-sm hover:text-[var(--apple-text)]"
                                        >
                                            {item.label}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="border-t apple-border">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm apple-secondary-text sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p>Bản quyền 2026 SKR. Đã đăng ký mọi quyền.</p>
                    <div className="flex gap-5">
                        <a href={resolveAnchorHref('#features')} className="apple-transition hover:text-[var(--apple-text)]">
                            Tính năng
                        </a>
                        <Link to="/login" className="apple-transition hover:text-[var(--apple-text)]">
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
