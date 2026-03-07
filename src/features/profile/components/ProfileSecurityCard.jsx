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
        <motion.div
            variants={variants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            <h2 className="text-xl font-black text-base-content flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5" />
                Bao Mat
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
                    label="Mat khau hien tai"
                    value={passwordData.currentPassword}
                    visible={showPassword}
                    onToggle={onTogglePassword}
                    onChange={(value) => onPasswordFieldChange('currentPassword', value)}
                />
                <PasswordField
                    label="Mat khau moi"
                    value={passwordData.newPassword}
                    visible={showNewPassword}
                    onToggle={onToggleNewPassword}
                    onChange={(value) => onPasswordFieldChange('newPassword', value)}
                />
                <PasswordField
                    label="Xac nhan mat khau moi"
                    value={passwordData.confirmPassword}
                    visible={showConfirmPassword}
                    onToggle={onToggleConfirmPassword}
                    onChange={(value) => onPasswordFieldChange('confirmPassword', value)}
                />

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-outline btn-primary rounded-xl font-bold w-full"
                    onClick={onSubmit}
                    disabled={saving}
                >
                    <Lock className="w-4 h-4" />
                    {saving ? 'Dang xu ly...' : 'Doi mat khau'}
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
                    className="input input-bordered w-full rounded-xl font-medium pr-12"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    onClick={onToggle}
                    className="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
                >
                    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
