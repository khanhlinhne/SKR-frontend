import { useState } from 'react';
import { motion } from 'motion/react';

function OtpDigit({ index, value, onChange, onKeyDown, onPaste, inputRef, disabled }) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="relative"
        >
            <div
                className="apple-auth-input-wrap apple-transition flex h-16 w-12 items-center justify-center rounded-2xl sm:w-14"
                style={hasValue || isFocused ? { borderColor: 'var(--apple-accent)' } : undefined}
            >
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    disabled={disabled}
                    onChange={(event) => onChange(index, event.target.value)}
                    onKeyDown={(event) => onKeyDown(index, event)}
                    onPaste={onPaste}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    aria-label={`Mã OTP số ${index + 1}`}
                    className="apple-auth-input h-full w-full text-center text-2xl font-semibold outline-none"
                />
            </div>
        </motion.div>
    );
}

export default function AuthOtpInputRow({ digits, onChange, onKeyDown, onPaste, inputRefs, disabled }) {
    return (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
            {digits.map((digit, index) => (
                <OtpDigit
                    key={index}
                    index={index}
                    value={digit}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onPaste={onPaste}
                    inputRef={(element) => {
                        inputRefs.current[index] = element;
                    }}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}
