import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    X, Edit3, Calendar, Globe, EyeOff, CheckCircle2, AlertCircle,
    Loader2, AlertTriangle, Info, DollarSign, Percent, Gift,
} from 'lucide-react';
import adminApi from '@/shared/api/adminApi';

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1, scale: 1, y: 0,
        transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
        opacity: 0, scale: 0.95, y: 10,
        transition: { duration: 0.15 },
    },
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
}

export default function CourseEditModal({ course, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        courseName: course.name || '',
        publishedAt: course.publishedAt ? formatDate(course.publishedAt) : '',
        status: course.status || 'draft',
        isFree: course.isFree ?? false,
        priceAmount: course.price ?? 0,
        originalPrice: course.originalPrice ?? 0,
        discountPercent: course.discountPercent ?? 0,
        discountValidUntil: course.discountValidUntil ? formatDate(course.discountValidUntil) : '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const isPublished = formData.status === 'published';
    const isScheduled = !!formData.publishedAt && formData.status === 'draft';

    // Close on Escape
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        if (submitError) setSubmitError('');
        if (submitSuccess) setSubmitSuccess(false);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.courseName.trim()) {
            newErrors.courseName = 'Tên khóa học không được để trống';
        }
        if (formData.courseName.trim().length < 3) {
            newErrors.courseName = 'Tên khóa học phải có ít nhất 3 ký tự';
        }
        if (formData.publishedAt) {
            const pubDate = new Date(formData.publishedAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (pubDate < today && course.status !== 'published') {
                newErrors.publishedAt = 'Ngày xuất bản không được là ngày trong quá khứ';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                courseName: formData.courseName.trim(),
                status: formData.status,
                isFree: formData.isFree,
                priceAmount: Number(formData.priceAmount) || 0,
                originalPrice: Number(formData.originalPrice) || 0,
                discountPercent: Number(formData.discountPercent) || 0,
            };

            if (formData.publishedAt) {
                payload.publishedAt = new Date(formData.publishedAt).toISOString();
            }
            if (formData.discountValidUntil) {
                payload.discountValidUntil = new Date(formData.discountValidUntil).toISOString();
            }

            const res = await adminApi.updateCourse(course.id, payload);
            const updated = res?.data ?? res;
            setSubmitSuccess(true);
            setTimeout(() => onSuccess(updated), 600);
        } catch (err) {
            console.error('Lỗi khi cập nhật khóa học:', err);
            setSubmitError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Không thể cập nhật khóa học. Vui lòng thử lại.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleTogglePublish = () => {
        if (isPublished) {
            handleChange('status', 'draft');
        } else {
            // Khi công khai ngay: xóa ngày hẹn, set publishedAt = now
            handleChange('status', 'published');
            handleChange('publishedAt', '');
        }
    };

    return (
        <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                variants={modalVariants}
                className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-full max-w-md"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Edit3 className="w-4.5 h-4.5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-base-content">Chỉnh sửa khóa học</h2>
                            <p className="text-xs text-base-content/40 font-medium">{course.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle opacity-60 hover:opacity-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Course Name */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-bold text-base-content mb-1.5">
                            <Edit3 className="w-4 h-4 text-base-content/50" />
                            Tên khóa học <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.courseName}
                            onChange={(e) => handleChange('courseName', e.target.value)}
                            placeholder="Nhập tên khóa học..."
                            className={`w-full px-4 py-2.5 rounded-xl bg-base-200/50 border ${
                                errors.courseName ? 'border-red-500 focus:border-red-500' : 'border-base-300 focus:border-emerald-500'
                            } focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/30 transition-all duration-200`}
                        />
                        {errors.courseName && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-red-500 mt-1 flex items-center gap-1"
                            >
                                <AlertCircle className="w-3 h-3" />
                                {errors.courseName}
                            </motion.p>
                        )}
                    </div>

                    {/* Publish Toggle */}
                    <div className="bg-base-200/30 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isPublished ? (
                                    <Globe className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <EyeOff className="w-5 h-5 text-base-content/40" />
                                )}
                                <div>
                                    <p className="text-sm font-bold text-base-content">
                                        {isPublished ? 'Đang công khai' : 'Riêng tư'}
                                    </p>
                                    <p className="text-xs text-base-content/40 font-medium">
                                        {isPublished
                                            ? 'Người dùng có thể xem khóa học này'
                                            : 'Chỉ admin mới thấy khóa học này'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleTogglePublish}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                                    isPublished ? 'bg-emerald-500' : 'bg-base-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                        isPublished ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Schedule publish date */}
                        {!isPublished && (
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-base-content/60 mb-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Lên lịch công khai (tùy chọn)
                                </label>
                                <input
                                    type="date"
                                    value={formData.publishedAt}
                                    onChange={(e) => handleChange('publishedAt', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-3 py-2 rounded-lg bg-base-100 border ${
                                        errors.publishedAt ? 'border-red-500' : 'border-base-300'
                                    } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm text-base-content transition-all duration-200`}
                                />
                                {errors.publishedAt && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.publishedAt}
                                    </p>
                                )}
                                {isScheduled && (
                                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                        <Info className="w-3 h-3" />
                                        Khóa học sẽ tự động công khai vào ngày {formData.publishedAt}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-base-200/30 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                <p className="text-sm font-bold text-base-content">Giá khóa học</p>
                            </div>
                            {/* Free toggle */}
                            <button
                                type="button"
                                onClick={() => handleChange('isFree', !formData.isFree)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                                    formData.isFree ? 'bg-emerald-500' : 'bg-base-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                        formData.isFree ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {!formData.isFree && (
                            <>
                                {/* Price & Original Price */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="flex items-center gap-1 text-xs font-bold text-base-content/60 mb-1.5">
                                            Giá bán
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.priceAmount}
                                                onChange={(e) => handleChange('priceAmount', e.target.value)}
                                                placeholder="0"
                                                className="w-full px-3 py-2 pr-8 rounded-lg bg-base-100 border border-base-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/30 transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-content/40 font-medium">VND</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1 text-xs font-bold text-base-content/60 mb-1.5">
                                            Giá gốc
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.originalPrice}
                                                onChange={(e) => handleChange('originalPrice', e.target.value)}
                                                placeholder="0"
                                                className="w-full px-3 py-2 pr-8 rounded-lg bg-base-100 border border-base-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/30 transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-content/40 font-medium">VND</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Discount */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="flex items-center gap-1 text-xs font-bold text-base-content/60 mb-1.5">
                                            <Percent className="w-3 h-3" />
                                            Giảm giá
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.discountPercent}
                                                onChange={(e) => handleChange('discountPercent', Math.min(100, e.target.value))}
                                                placeholder="0"
                                                className="w-full px-3 py-2 pr-8 rounded-lg bg-base-100 border border-base-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/30 transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-content/40 font-medium">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1 text-xs font-bold text-base-content/60 mb-1.5">
                                            <Gift className="w-3 h-3" />
                                            Hết hạn giảm giá
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.discountValidUntil}
                                            onChange={(e) => handleChange('discountValidUntil', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-base-100 border border-base-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm text-base-content transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Price preview */}
                                {formData.priceAmount > 0 && formData.discountPercent > 0 && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs text-emerald-600 font-medium">
                                            Giá sau giảm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                formData.priceAmount * (1 - Number(formData.discountPercent) / 100)
                                            )}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                        {formData.isFree && (
                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Khóa học miễn phí — mọi người đều có thể đăng ký
                            </p>
                        )}
                    </div>

                    {/* Status info */}
                    <div className="flex items-center gap-2 text-xs">
                        {isPublished ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 font-medium">
                                    Khóa học đang hiển thị công khai cho người dùng
                                </span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-amber-600 font-medium">
                                    Khóa học đang ẩn — người dùng chưa thể xem
                                </span>
                            </>
                        )}
                    </div>

                    {/* Submit error */}
                    {submitError && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                        >
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-600 font-medium">{submitError}</p>
                        </motion.div>
                    )}
                    {submitSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <p className="text-xs text-emerald-600 font-medium">Lưu thành công!</p>
                        </motion.div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-base-200 bg-base-200/20 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="btn btn-sm btn-ghost font-bold rounded-xl"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-none shadow-lg font-bold rounded-xl gap-1.5"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
