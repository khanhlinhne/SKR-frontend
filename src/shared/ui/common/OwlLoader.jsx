/**
 * OwlLoader - Cute owl loading animation component
 * Dùng để thay thế tất cả các loading spinner trong app.
 *
 * @param {string}  message   - Dòng chữ chính (mặc định: "Đang tải dữ liệu...")
 * @param {string}  subMessage - Dòng chữ phụ nhỏ
 * @param {string}  className  - Extra class cho wrapper (vd: "py-32")
 */
export default function OwlLoader({
    message = 'Đang tải dữ liệu...',
    subMessage = 'Cú đang tìm sách cho bạn, vui lòng chờ giây lát 🦉',
    className = 'py-20',
}) {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            {/* Keyframes */}
            <style>{`
                @keyframes owl-bounce {
                    0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
                    50%       { transform: translate(-50%, -50%) translateY(-14px); }
                }
                @keyframes owl-wiggle {
                    0%, 100% { transform: rotate(-6deg) scale(1); }
                    50%       { transform: rotate(6deg) scale(1.05); }
                }
                @keyframes owl-float {
                    0%, 100% { transform: translateY(0px) rotate(-5deg); opacity: 0.75; }
                    50%       { transform: translateY(-16px) rotate(8deg); opacity: 1; }
                }
                @keyframes owl-shadow {
                    0%, 100% { transform: scaleX(1);   opacity: 0.35; }
                    50%       { transform: scaleX(0.65); opacity: 0.12; }
                }
                @keyframes owl-dot {
                    0%, 80%, 100% { transform: translateY(0);   opacity: 0.35; }
                    40%           { transform: translateY(-7px); opacity: 1; }
                }
            `}</style>

            {/* Animated scene */}
            <div style={{ position: 'relative', width: '192px', height: '192px', marginBottom: '24px', userSelect: 'none' }}>
                {/* Floating emojis */}
                {[
                    { emoji: '📚', top: '0',    left: '10px',  delay: '0s',   size: '22px' },
                    { emoji: '⭐', top: '8px',  right: '12px', delay: '0.4s', size: '18px' },
                    { emoji: '✏️', bottom: '20px', left: '0',  delay: '0.8s', size: '16px' },
                    { emoji: '🔬', bottom: '10px', right: '4px', delay: '1.2s', size: '18px' },
                ].map(({ emoji, top, left, right, bottom, delay, size }) => (
                    <span
                        key={emoji}
                        style={{
                            position: 'absolute',
                            top, left, right, bottom,
                            fontSize: size,
                            animation: `owl-float 2s ease-in-out infinite`,
                            animationDelay: delay,
                        }}
                    >
                        {emoji}
                    </span>
                ))}

                {/* Owl + shadow */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    animation: 'owl-bounce 1s ease-in-out infinite',
                }}>
                    {/* Shadow */}
                    <div style={{
                        width: '64px', height: '14px',
                        background: 'rgba(0,0,0,0.10)',
                        borderRadius: '50%',
                        margin: '0 auto',
                        animation: 'owl-shadow 1s ease-in-out infinite',
                    }} />
                    {/* Owl emoji */}
                    <div style={{
                        fontSize: '72px',
                        lineHeight: 1,
                        textAlign: 'center',
                        marginTop: '-8px',
                        animation: 'owl-wiggle 2s ease-in-out infinite',
                    }}>
                        🦉
                    </div>
                </div>
            </div>

            {/* Text */}
            <p className="text-base font-black text-base-content mb-1">{message}</p>
            <p className="text-sm text-base-content/50 font-medium mb-4">{subMessage}</p>

            {/* Bouncing dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            animation: 'owl-dot 1.2s ease-in-out infinite',
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
