import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isTokenValid } from '@/shared/utils/tokenManager';

/**
 * UnauthorizedPage — Trang hiển thị khi người dùng không có quyền truy cập.
 *
 * @param {'not_authenticated' | 'not_authorized'} variant
 *   - not_authenticated: chưa đăng nhập
 *   - not_authorized: đã đăng nhập nhưng không có quyền
 */
export default function UnauthorizedPage({ variant = 'not_authenticated' }) {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);
    const isLoggedIn = isTokenValid();

    const effectiveVariant = variant === 'not_authenticated' && isLoggedIn
        ? 'not_authorized'
        : variant;

    useEffect(() => {
        if (countdown <= 0) {
            if (effectiveVariant === 'not_authenticated') {
                navigate('/login');
            } else {
                navigate('/');
            }
            return;
        }

        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, effectiveVariant, navigate]);

    const config = {
        not_authenticated: {
            title: 'Vui lòng đăng nhập',
            subtitle: 'Bạn cần đăng nhập để truy cập trang này.',
            description: 'Trang bạn đang cố truy cập yêu cầu xác thực. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.',
            actionLabel: 'Đăng nhập ngay',
            actionLink: '/login',
            statusCode: '401',
            statusText: 'Unauthorized',
        },
        not_authorized: {
            title: 'Truy cập bị từ chối',
            subtitle: 'Bạn không có quyền truy cập trang này.',
            description: 'Tài khoản của bạn không có đủ quyền hạn để xem nội dung này. Liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.',
            actionLabel: 'Về trang chủ',
            actionLink: '/',
            statusCode: '403',
            statusText: 'Forbidden',
        },
    };

    const cfg = config[effectiveVariant];

    return (
        <div className="unauthorized-page">
            <style>{`
                .unauthorized-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
                    position: relative;
                    overflow: hidden;
                    font-family: 'Inter', -apple-system, sans-serif;
                }
                .unauthorized-page * { box-sizing: border-box; }

                /* Ambient light effects */
                .ua-glow-1 {
                    position: absolute;
                    width: 600px; height: 600px;
                    background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
                    top: -200px; left: -100px;
                    border-radius: 50%;
                    animation: ua-float 8s ease-in-out infinite;
                }
                .ua-glow-2 {
                    position: absolute;
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
                    bottom: -150px; right: -100px;
                    border-radius: 50%;
                    animation: ua-float 10s ease-in-out infinite reverse;
                }

                @keyframes ua-float {
                    0%, 100% { transform: translate(0,0) scale(1); }
                    50%      { transform: translate(30px,-20px) scale(1.05); }
                }

                /* Star particles */
                .ua-stars {
                    position: absolute; inset: 0;
                    overflow: hidden;
                    pointer-events: none;
                }
                .ua-star {
                    position: absolute;
                    width: 2px; height: 2px;
                    background: #e2e8f0;
                    border-radius: 50%;
                    animation: ua-twinkle 3s ease-in-out infinite;
                }
                @keyframes ua-twinkle {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50%      { opacity: 0.8; transform: scale(1.5); }
                }

                .ua-container {
                    position: relative;
                    z-index: 10;
                    max-width: 580px;
                    width: 100%;
                    text-align: center;
                }

                /* Owl scene */
                .ua-owl-scene {
                    position: relative;
                    width: 200px; height: 200px;
                    margin: 0 auto 32px;
                }
                .ua-owl-platform {
                    position: absolute;
                    bottom: 10px; left: 50%;
                    transform: translateX(-50%);
                    width: 120px; height: 16px;
                    background: rgba(99,102,241,0.2);
                    border-radius: 50%;
                    animation: ua-platform-pulse 2s ease-in-out infinite;
                }
                @keyframes ua-platform-pulse {
                    0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.3; }
                    50%      { transform: translateX(-50%) scaleX(0.7); opacity: 0.15; }
                }
                .ua-owl-emoji {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -55%);
                    font-size: 96px;
                    line-height: 1;
                    animation: ua-owl-hover 2s ease-in-out infinite;
                    filter: drop-shadow(0 20px 40px rgba(99,102,241,0.3));
                    user-select: none;
                }
                @keyframes ua-owl-hover {
                    0%, 100% { transform: translate(-50%, -55%) translateY(0); }
                    50%      { transform: translate(-50%, -55%) translateY(-16px); }
                }

                /* Floating security icons */
                .ua-float-icon {
                    position: absolute;
                    font-size: 24px;
                    animation: ua-icon-float 3s ease-in-out infinite;
                    opacity: 0.7;
                    user-select: none;
                }
                @keyframes ua-icon-float {
                    0%, 100% { transform: translateY(0) rotate(-5deg); opacity: 0.5; }
                    50%      { transform: translateY(-14px) rotate(8deg); opacity: 0.9; }
                }

                /* Status code badge */
                .ua-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    background: rgba(239,68,68,0.12);
                    border: 1px solid rgba(239,68,68,0.25);
                    border-radius: 100px;
                    margin-bottom: 20px;
                }
                .ua-status-dot {
                    width: 8px; height: 8px;
                    background: #ef4444;
                    border-radius: 50%;
                    animation: ua-dot-pulse 1.5s ease-in-out infinite;
                }
                @keyframes ua-dot-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%      { opacity: 0.4; transform: scale(0.8); }
                }
                .ua-status-text {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fca5a5;
                    letter-spacing: 0.05em;
                }

                .ua-title {
                    font-family: 'Lexend', 'Inter', sans-serif;
                    font-size: 32px;
                    font-weight: 700;
                    color: #f1f5f9;
                    margin: 0 0 8px;
                    line-height: 1.2;
                }
                .ua-subtitle {
                    font-size: 16px;
                    color: #94a3b8;
                    margin: 0 0 32px;
                    line-height: 1.6;
                }

                /* Info boxes — "maintenance boxes" */
                .ua-boxes {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 32px;
                }
                .ua-box {
                    background: rgba(30,27,75,0.6);
                    border: 1px solid rgba(99,102,241,0.18);
                    border-radius: 16px;
                    padding: 20px 16px;
                    backdrop-filter: blur(12px);
                    transition: all 0.3s ease;
                    text-align: left;
                }
                .ua-box:hover {
                    border-color: rgba(99,102,241,0.35);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(99,102,241,0.12);
                }
                .ua-box-icon {
                    font-size: 28px;
                    margin-bottom: 10px;
                    display: block;
                }
                .ua-box-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #e2e8f0;
                    margin: 0 0 4px;
                }
                .ua-box-desc {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.5;
                }

                /* Description text */
                .ua-description {
                    font-size: 14px;
                    color: #64748b;
                    line-height: 1.7;
                    margin: 0 0 28px;
                    padding: 0 12px;
                }

                /* Action area */
                .ua-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .ua-primary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 36px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                    font-size: 15px;
                    font-weight: 600;
                    border: none;
                    border-radius: 14px;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 24px rgba(99,102,241,0.35);
                }
                .ua-primary-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(99,102,241,0.5);
                    background: linear-gradient(135deg, #818cf8, #a78bfa);
                }
                .ua-countdown {
                    font-size: 13px;
                    color: #475569;
                }
                .ua-countdown strong {
                    color: #818cf8;
                    font-variant-numeric: tabular-nums;
                }

                @media (max-width: 480px) {
                    .ua-title { font-size: 24px; }
                    .ua-boxes { grid-template-columns: 1fr; }
                    .ua-owl-emoji { font-size: 72px; }
                }
            `}</style>

            {/* Background effects */}
            <div className="ua-glow-1" />
            <div className="ua-glow-2" />
            <div className="ua-stars">
                {Array.from({ length: 30 }, (_, i) => (
                    <div
                        key={i}
                        className="ua-star"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            <div className="ua-container">
                {/* Owl scene */}
                <div className="ua-owl-scene">
                    <span className="ua-float-icon" style={{ top: '5px', left: '10px', animationDelay: '0s' }}>🔒</span>
                    <span className="ua-float-icon" style={{ top: '15px', right: '8px', animationDelay: '0.5s' }}>🛡️</span>
                    <span className="ua-float-icon" style={{ bottom: '30px', left: '5px', animationDelay: '1s' }}>🚫</span>
                    <span className="ua-float-icon" style={{ bottom: '25px', right: '10px', animationDelay: '1.5s' }}>⚠️</span>
                    <div className="ua-owl-emoji">🦉</div>
                    <div className="ua-owl-platform" />
                </div>

                {/* Status badge */}
                <div className="ua-status-badge">
                    <div className="ua-status-dot" />
                    <span className="ua-status-text">
                        {cfg.statusCode} — {cfg.statusText}
                    </span>
                </div>

                {/* Text */}
                <h1 className="ua-title">{cfg.title}</h1>
                <p className="ua-subtitle">{cfg.subtitle}</p>

                {/* Info boxes */}
                <div className="ua-boxes">
                    {effectiveVariant === 'not_authenticated' ? (
                        <>
                            <div className="ua-box">
                                <span className="ua-box-icon">🔐</span>
                                <p className="ua-box-title">Xác thực bắt buộc</p>
                                <p className="ua-box-desc">Trang này yêu cầu bạn đăng nhập để xác minh danh tính.</p>
                            </div>
                            <div className="ua-box">
                                <span className="ua-box-icon">📋</span>
                                <p className="ua-box-title">Bảo vệ dữ liệu</p>
                                <p className="ua-box-desc">Chúng tôi bảo mật thông tin của bạn bằng mã hóa tiên tiến.</p>
                            </div>
                            <div className="ua-box">
                                <span className="ua-box-icon">🦉</span>
                                <p className="ua-box-title">Cú đang canh gác</p>
                                <p className="ua-box-desc">Hệ thống bảo mật đang hoạt động 24/7 để bảo vệ tài khoản.</p>
                            </div>
                            <div className="ua-box">
                                <span className="ua-box-icon">⚡</span>
                                <p className="ua-box-title">Truy cập nhanh</p>
                                <p className="ua-box-desc">Đăng nhập một lần, truy cập mọi tính năng không giới hạn.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="ua-box">
                                <span className="ua-box-icon">🛡️</span>
                                <p className="ua-box-title">Giới hạn quyền hạn</p>
                                <p className="ua-box-desc">Tài khoản của bạn chưa được cấp quyền truy cập khu vực này.</p>
                            </div>
                            <div className="ua-box">
                                <span className="ua-box-icon">📧</span>
                                <p className="ua-box-title">Liên hệ hỗ trợ</p>
                                <p className="ua-box-desc">Gửi yêu cầu nâng quyền đến quản trị viên hệ thống.</p>
                            </div>
                            <div className="ua-box">
                                <span className="ua-box-icon">🦉</span>
                                <p className="ua-box-title">Cú đang bảo vệ</p>
                                <p className="ua-box-desc">Khu vực này được bảo vệ nghiêm ngặt bởi hệ thống phân quyền.</p>
                            </div>
                            <div className="ua-box">
                                <span className="ua-box-icon">🔄</span>
                                <p className="ua-box-title">Thử lại sau</p>
                                <p className="ua-box-desc">Nếu quyền vừa được cấp, hãy đăng xuất và đăng nhập lại.</p>
                            </div>
                        </>
                    )}
                </div>

                <p className="ua-description">{cfg.description}</p>

                {/* Actions */}
                <div className="ua-actions">
                    <Link to={cfg.actionLink} className="ua-primary-btn">
                        {cfg.actionLabel}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                    <p className="ua-countdown">
                        Tự động chuyển hướng sau <strong>{countdown}s</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
