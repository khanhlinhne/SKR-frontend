import { motion } from 'motion/react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

export default function ProfileSecurityCard({
    passwordData,
    onPasswordFieldChange,
    showPassword,
    showNewPassword,
    showConfirmPassword,
    onTogglePassword,
    onToggleNewPassword,
    onToggleConfirmPassword,
    passwordError,
    passwordSuccess,
    saving,
    onSubmit,
    variants,
}) {
    return (
        <motion.div variants={variants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-base-content">
                <Shield className="h-5 w-5" />
                Bảo mật
            </h2>

            <div className="space-y-4">
                {passwordError && (
                    <div className="alert alert-error text-sm">
                        <span>{passwordError}</span>
                    </div>
                )}
                {passwordSuccess && (
                    <div className="alert alert-success text-sm">
                        <span>{passwordSuccess}</span>
                    </div>
                )}

                <PasswordField
                    label="Mật khẩu hiện tại"
                    value={passwordData.currentPassword}
                    visible={showPassword}
                    onToggle={onTogglePassword}
                    onChange={(value) => onPasswordFieldChange('currentPassword', value)}
                />
                <PasswordField
                    label="Mật khẩu mới"
                    value={passwordData.newPassword}
                    visible={showNewPassword}
                    onToggle={onToggleNewPassword}
                    onChange={(value) => onPasswordFieldChange('newPassword', value)}
                />
                <PasswordField
                    label="Xác nhận mật khẩu mới"
                    value={passwordData.confirmPassword}
                    visible={showConfirmPassword}
                    onToggle={onToggleConfirmPassword}
                    onChange={(value) => onPasswordFieldChange('confirmPassword', value)}
                />

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-outline btn-primary w-full rounded-xl font-bold"
                    onClick={onSubmit}
                    disabled={saving}
                >
                    <Lock className="h-4 w-4" />
                    {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </motion.button>
            </div>
        </motion.div>
    );
}

function PasswordField({ label, value, visible, onToggle, onChange }) {
    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text font-bold">{label}</span>
            </label>
            <div className="relative">
                <input
                    type={visible ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input input-bordered w-full rounded-xl pr-12 font-medium"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
                <button
                    onClick={onToggle}
                    className="btn btn-circle btn-ghost btn-sm absolute right-2 top-1/2 -translate-y-1/2"
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}
