import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthField({
    label,
    icon: Icon,
    isPassword = false,
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    autoComplete,
    disabled = false,
    error = '',
    required = false,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const hasError = Boolean(error);

    return (
        <div className="space-y-1.5">
            <label className="apple-muted-text block text-xs font-semibold uppercase tracking-[0.18em]">
                {label}
                {required && <span style={{ color: 'var(--color-error, #ef4444)', marginLeft: '3px' }}>*</span>}
            </label>
            <div
                className="apple-auth-input-wrap apple-transition flex h-14 items-center gap-3 rounded-2xl px-4"
                style={hasError ? { outline: '1.5px solid var(--color-error, #ef4444)', outlineOffset: '0px' } : {}}
            >
                {Icon ? (
                    <Icon
                        className="h-5 w-5 shrink-0"
                        style={{ color: hasError ? 'var(--color-error, #ef4444)' : 'var(--apple-muted)' }}
                    />
                ) : null}
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    className="apple-auth-input h-full w-full border-0 text-sm font-medium outline-none"
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${name}-error` : undefined}
                />
                {isPassword ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="apple-muted-text apple-transition inline-flex h-8 w-8 items-center justify-center rounded-full hover:text-[var(--apple-text)]"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                ) : null}
            </div>
            {hasError && (
                <p
                    id={`${name}-error`}
                    role="alert"
                    style={{
                        color: 'var(--color-error, #ef4444)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        paddingLeft: '4px',
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="6" cy="6" r="6" fill="var(--color-error, #ef4444)" />
                        <path d="M6 3.5V6.5M6 8.5V8.6" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
