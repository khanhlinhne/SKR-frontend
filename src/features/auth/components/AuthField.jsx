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
    placeholder,
    autoComplete,
    disabled = false,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="space-y-2">
            <label className="apple-muted-text block text-xs font-semibold uppercase tracking-[0.18em]">
                {label}
            </label>
            <div className="apple-auth-input-wrap apple-transition flex h-14 items-center gap-3 rounded-2xl px-4">
                {Icon ? <Icon className="apple-muted-text h-5 w-5 shrink-0" /> : null}
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    className="apple-auth-input h-full w-full border-0 text-sm font-medium outline-none"
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
        </div>
    );
}
