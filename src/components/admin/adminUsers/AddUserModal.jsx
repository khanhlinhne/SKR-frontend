import { useState } from 'react';
import * as motion from 'motion/react-client';
import {
    UserPlus, X, User, Mail, Phone, Shield, AlertCircle,
} from 'lucide-react';
import { overlayVariants, modalVariants, roleOptions } from './constants';

/**
 * FormField - Wrapper component cho mỗi field trong form.
 */
function FormField({ label, icon, required, error, children }) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-base-content mb-1.5">
                <span className="text-base-content/50">{icon}</span>
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1 flex items-center gap-1"
                >
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </motion.p>
            )}
        </div>
    );
}

/**
 * AddUserModal - Modal thêm người dùng mới.
 */
export default function AddUserModal({ onClose }) {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', role: 'Learner',
        password: '', confirmPassword: '', sendWelcomeEmail: true,
    });
    const [errors, setErrors] = useState({});

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ và tên';
        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (formData.password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Creating user:', formData);
            onClose();
        }
    };

    return (
        <motion.div
            variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                className="relative bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">Thêm người dùng</h2>
                                <p className="text-xs text-white/70">Tạo tài khoản người dùng mới</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="space-y-4">
                        <FormField label="Họ và tên" icon={<User className="w-4 h-4" />} required error={errors.name}>
                            <input type="text" placeholder="Nguyễn Văn A" value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                className={`input input-bordered w-full rounded-xl bg-base-200 border-base-300 focus:border-emerald-500 text-sm ${errors.name ? 'input-error' : ''}`}
                            />
                        </FormField>

                        <FormField label="Email" icon={<Mail className="w-4 h-4" />} required error={errors.email}>
                            <input type="email" placeholder="example@email.com" value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                className={`input input-bordered w-full rounded-xl bg-base-200 border-base-300 focus:border-emerald-500 text-sm ${errors.email ? 'input-error' : ''}`}
                            />
                        </FormField>

                        <FormField label="Số điện thoại" icon={<Phone className="w-4 h-4" />}>
                            <input type="tel" placeholder="0912 345 678" value={formData.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                className="input input-bordered w-full rounded-xl bg-base-200 border-base-300 focus:border-emerald-500 text-sm"
                            />
                        </FormField>

                        <FormField label="Vai trò" icon={<Shield className="w-4 h-4" />} required>
                            <div className="grid grid-cols-2 gap-2">
                                {roleOptions.map((role) => (
                                    <button key={role.value} type="button"
                                        onClick={() => updateField('role', role.value)}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${formData.role === role.value
                                            ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                                            : 'border-base-300 hover:border-base-content/20 bg-base-200'}`}
                                    >
                                        <p className={`text-sm font-bold ${formData.role === role.value ? 'text-emerald-600' : 'text-base-content'}`}>{role.label}</p>
                                        <p className="text-[10px] text-base-content/50 mt-0.5">{role.description}</p>
                                    </button>
                                ))}
                            </div>
                        </FormField>

                        <div className="divider text-xs text-base-content/40 font-bold">BẢO MẬT</div>

                        <FormField label="Mật khẩu" icon={<Shield className="w-4 h-4" />} required error={errors.password}>
                            <input type="password" placeholder="Tối thiểu 6 ký tự" value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                className={`input input-bordered w-full rounded-xl bg-base-200 border-base-300 focus:border-emerald-500 text-sm ${errors.password ? 'input-error' : ''}`}
                            />
                        </FormField>

                        <FormField label="Xác nhận mật khẩu" icon={<Shield className="w-4 h-4" />} required error={errors.confirmPassword}>
                            <input type="password" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                className={`input input-bordered w-full rounded-xl bg-base-200 border-base-300 focus:border-emerald-500 text-sm ${errors.confirmPassword ? 'input-error' : ''}`}
                            />
                        </FormField>

                        <label className="flex items-center gap-3 p-3 rounded-xl bg-base-200 cursor-pointer hover:bg-base-300 transition-colors">
                            <input type="checkbox" checked={formData.sendWelcomeEmail}
                                onChange={(e) => updateField('sendWelcomeEmail', e.target.checked)}
                                className="checkbox checkbox-sm checkbox-success rounded-lg"
                            />
                            <div>
                                <p className="text-sm font-bold text-base-content">Gửi email chào mừng</p>
                                <p className="text-xs text-base-content/50">Tự động gửi email thông tin tài khoản cho người dùng</p>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-base-300">
                        <button type="button" onClick={onClose} className="btn btn-ghost flex-1 rounded-xl font-bold">Hủy</button>
                        <button type="submit" className="btn flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none shadow-lg font-bold rounded-xl hover:shadow-emerald-500/25 hover:shadow-xl transition-all">
                            <UserPlus className="w-4 h-4" /> Tạo tài khoản
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
