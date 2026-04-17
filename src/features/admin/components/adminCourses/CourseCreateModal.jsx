import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X,
    Plus,
    BookOpen,
    DollarSign,
    FileText,
    Image as ImageIcon,
    Globe,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Loader2,
    AlertTriangle,
    Info,
    Calendar,
    Sparkles,
    Upload,
    Type,
    AlignLeft,
    Hash,
} from 'lucide-react';
import adminApi from '@/shared/api/adminApi';
import { uploadApi } from '@/shared/api';

// ─── Animations ───────────────────────────────────────────

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 14 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        y: 14,
        transition: { duration: 0.15 },
    },
};

// ─── Step definitions ─────────────────────────────────────

const STEPS = [
    { id: 1, title: 'Thông tin cơ bản', icon: BookOpen, desc: 'Tên, mã' },
    { id: 2, title: 'Nội dung', icon: FileText, desc: 'Mô tả, hình ảnh' },
    { id: 3, title: 'Giá & Xuất bản', icon: DollarSign, desc: 'Định giá, trạng thái' },
];

// ─── Reusable Field Component ─────────────────────────────

function FormField({ label, icon: Icon, required, error, hint, children }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-bold text-base-content">
                {Icon && <Icon className="w-4 h-4 text-base-content/40" />}
                {label}
                {required && <span className="text-red-500 text-xs">*</span>}
            </label>
            {children}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-red-500 font-medium flex items-center gap-1"
                >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {error}
                </motion.p>
            )}
            {hint && !error && (
                <p className="text-[11px] text-base-content/35 font-medium flex items-center gap-1">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    {hint}
                </p>
            )}
        </div>
    );
}

function TextInput({ value, onChange, placeholder, error, maxLength, className = '', ...props }) {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full px-4 py-2.5 rounded-xl bg-base-200/40 border ${error
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-base-300/50 focus:border-emerald-500'
                    } focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/25 transition-all duration-200 ${className}`}
                {...props}
            />
            {maxLength && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-base-content/25 font-mono tabular-nums">
                    {value.length}/{maxLength}
                </span>
            )}
        </div>
    );
}

function TextArea({ value, onChange, placeholder, error, maxLength, rows = 4 }) {
    return (
        <div className="relative">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={rows}
                className={`w-full px-4 py-3 rounded-xl bg-base-200/40 border ${error
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-base-300/50 focus:border-emerald-500'
                    } focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/25 transition-all duration-200 resize-none`}
            />
            {maxLength && (
                <span className="absolute right-3 bottom-3 text-[10px] text-base-content/25 font-mono tabular-nums">
                    {value.length}/{maxLength}
                </span>
            )}
        </div>
    );
}

const MAX_BANNER_SIZE_BYTES = 5 * 1024 * 1024;

function resolveUploadedImageUrl(response) {
    const payload = response?.data || response || {};
    return payload.imageUrl || payload.url || payload.secure_url || payload.fileUrl || payload.path || '';
}

// ─── Main Component ───────────────────────────────────────

export default function CourseCreateModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        // Step 1 — Basic Info
        courseName: '',
        courseCode: '',
        // Step 2 — Content
        description: '',
        bannerUrl: '',
        // Step 3 — Pricing & Publish
        price: '',
        status: 'draft',
        publishedAt: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [bannerFileName, setBannerFileName] = useState('');

    const formRef = useRef(null);
    const bannerInputRef = useRef(null);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape' && !submitting) onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose, submitting]);

    // ─── Helpers ──────────────────────────────────────────

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
        if (submitError) setSubmitError('');
        if (submitSuccess) setSubmitSuccess(false);
    };

    const setFieldError = (field, message) => {
        setErrors((prev) => ({ ...prev, [field]: message }));
    };

    const handleBannerSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!file.type?.startsWith('image/')) {
            setFieldError('bannerUrl', 'Chỉ hỗ trợ file ảnh PNG, JPG, WEBP hoặc GIF.');
            return;
        }

        if (file.size > MAX_BANNER_SIZE_BYTES) {
            setFieldError('bannerUrl', 'Ảnh quá lớn. Vui lòng chọn file tối đa 5MB.');
            return;
        }

        setUploadingBanner(true);
        setFieldError('bannerUrl', '');
        if (submitError) setSubmitError('');

        try {
            const uploadResponse = await uploadApi.uploadImage(file);
            const uploadedUrl = resolveUploadedImageUrl(uploadResponse);

            if (!uploadedUrl) {
                throw new Error('Máy chủ chưa trả về URL ảnh hợp lệ.');
            }

            setBannerFileName(file.name);
            updateField('bannerUrl', uploadedUrl);
        } catch (error) {
            setFieldError(
                'bannerUrl',
                error?.response?.data?.message || error?.message || 'Không thể tải ảnh lên lúc này.',
            );
        } finally {
            setUploadingBanner(false);
        }
    };

    const clearBannerImage = () => {
        setBannerFileName('');
        updateField('bannerUrl', '');
        setFieldError('bannerUrl', '');
    };

    // ─── Validation ───────────────────────────────────────

    const validateForm = () => {
        const newErrors = {};

        if (!formData.courseName.trim()) {
            newErrors.courseName = 'Tên khóa học không được để trống';
        } else if (formData.courseName.trim().length < 3) {
            newErrors.courseName = 'Tên khóa học phải có ít nhất 3 ký tự';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả khóa học không được để trống';
        } else if (formData.description.trim().length < 20) {
            newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
        }

        const price = Number(formData.price);
        if (!formData.price || isNaN(price) || price <= 0) {
            newErrors.price = 'Vui lòng nhập giá bán hợp lệ';
        }
        if (formData.publishedAt) {
            const pubDate = new Date(formData.publishedAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (pubDate < today) {
                newErrors.publishedAt = 'Ngày xuất bản không được là ngày trong quá khứ';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ─── Submit ───────────────────────────────────────────

    const handleSubmit = async () => {
        if (uploadingBanner) {
            setSubmitError('Ảnh bìa đang được tải lên. Vui lòng chờ hoàn tất trước khi tạo khóa học.');
            return;
        }
        if (!validateForm()) return;

        setSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                courseName: formData.courseName.trim(),
                courseDescription: formData.description.trim(),
                isFree: false,
                status: formData.status,
                priceAmount: String(Number(formData.price) || 0),
            };

            // courseCode is optional — backend auto-generates if omitted
            if (formData.courseCode.trim()) {
                payload.courseCode = formData.courseCode.trim();
            }

            // Banner URL → backend field name
            if (formData.bannerUrl.trim()) {
                payload.courseBannerUrl = formData.bannerUrl.trim();
            }

            if (formData.publishedAt) {
                payload.publishedAt = new Date(formData.publishedAt).toISOString();
            }

            const res = await adminApi.createCourse(payload);
            const created = res?.data ?? res;
            setSubmitSuccess(true);
            setTimeout(() => onSuccess(created), 800);
        } catch (err) {
            console.error('Lỗi khi tạo khóa học:', err);
            // Extract validation errors from express-validator
            const errData = err?.response?.data;
            if (errData?.errors && Array.isArray(errData.errors)) {
                const messages = errData.errors.map(e => e.msg || e.message).join('. ');
                setSubmitError(messages || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
            } else {
                setSubmitError(
                    errData?.message ||
                    errData?.error ||
                    'Không thể tạo khóa học. Vui lòng thử lại.'
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Render Steps ─────────────────────────────────────

    const renderStep1 = () => (
        <div className="space-y-5">
            {/* Course Name */}
            <FormField label="Tên khóa học" icon={Type} required error={errors.courseName}>
                <TextInput
                    value={formData.courseName}
                    onChange={(v) => updateField('courseName', v)}
                    placeholder="VD: Lập Trình Python Từ Cơ Bản Đến Nâng Cao"
                    error={errors.courseName}
                    maxLength={120}
                    className="min-h-[56px] py-4"
                />
            </FormField>

            {/* Course Code */}
            <FormField
                label="Mã khóa học"
                icon={Hash}
                hint="Mã tùy chọn để quản lý nội bộ (VD: CS101, MATH201)"
            >
                <TextInput
                    value={formData.courseCode}
                    onChange={(v) => updateField('courseCode', v.toUpperCase())}
                    placeholder="VD: PYTHON101"
                    maxLength={20}
                    className="min-h-[56px] py-4"
                />
            </FormField>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-5">
            {/* Description */}
            <FormField
                label="Mô tả khóa học"
                icon={AlignLeft}
                required
                error={errors.description}
                hint="Mô tả chi tiết giúp học viên hiểu rõ nội dung khóa học"
            >
                <TextArea
                    value={formData.description}
                    onChange={(v) => updateField('description', v)}
                    placeholder="Mô tả ngắn gọn về nội dung, mục tiêu và đối tượng của khóa học..."
                    error={errors.description}
                    maxLength={2000}
                    rows={5}
                />
            </FormField>

            {/* Banner upload */}
            <FormField
                label="Ảnh bìa khóa học"
                icon={ImageIcon}
                error={errors.bannerUrl}
                hint="Tải ảnh từ máy tính (khuyến nghị 1200×630px, tối đa 5MB)"
            >
                <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleBannerSelect}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className={`w-full rounded-xl border border-dashed px-4 py-4 text-left transition-all duration-200 ${
                        uploadingBanner
                            ? 'border-emerald-500/40 bg-emerald-500/5'
                            : 'border-base-300/50 bg-base-200/20 hover:border-emerald-500/40 hover:bg-emerald-500/5'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                            {uploadingBanner ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-base-content">
                                {uploadingBanner ? 'Đang tải ảnh lên...' : formData.bannerUrl ? 'Đổi ảnh bìa' : 'Chọn ảnh từ máy'}
                            </p>
                            <p className="truncate text-[11px] font-medium text-base-content/45">
                                {uploadingBanner
                                    ? 'Vui lòng chờ trong giây lát'
                                    : bannerFileName || 'PNG, JPG, WEBP hoặc GIF'}
                            </p>
                        </div>
                    </div>
                </button>

                {formData.bannerUrl && (
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-base-300/40 bg-base-200/20 px-3 py-2">
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-base-content">
                                {bannerFileName || 'Ảnh bìa đã tải lên'}
                            </p>
                            <p className="text-[11px] font-medium text-emerald-600">
                                Sẵn sàng dùng cho khóa học
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={clearBannerImage}
                            disabled={uploadingBanner}
                            className="btn btn-ghost btn-xs rounded-lg text-base-content/50"
                        >
                            Xóa ảnh
                        </button>
                    </div>
                )}
                {/* Preview */}
                {formData.bannerUrl && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 rounded-xl overflow-hidden border border-base-300/40"
                    >
                        <img
                            src={formData.bannerUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </motion.div>
                )}
            </FormField>
        </div>
    );

    const renderStep3 = () => {
        const isPublished = formData.status === 'published';
        const price = Number(formData.price) || 0;

        return (
            <div className="space-y-5">
                <FormField
                    label="Giá bán (₫)"
                    icon={DollarSign}
                    required
                    error={errors.price}
                    hint="Đây là giá hiển thị cho học viên khi mua và cũng là giá dùng để tính doanh số."
                >
                    <TextInput
                        value={formData.price}
                        onChange={(v) => updateField('price', v.replace(/[^0-9]/g, ''))}
                        placeholder="299000"
                        error={errors.price}
                    />
                </FormField>

                {/* Publish status */}
                <div className="bg-base-200/30 rounded-xl border border-base-300/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            {isPublished ? (
                                <Globe className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-base-content/40" />
                            )}
                            <div>
                                <p className="text-sm font-bold text-base-content">
                                    {isPublished ? 'Xuất bản ngay' : 'Lưu bản nháp'}
                                </p>
                                <p className="text-[11px] text-base-content/40 font-medium">
                                    {isPublished
                                        ? 'Khóa học sẽ hiển thị cho người dùng ngay sau khi tạo'
                                        : 'Chỉ admin mới thấy—bạn có thể xuất bản sau'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                updateField(
                                    'status',
                                    isPublished ? 'draft' : 'published'
                                )
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${isPublished ? 'bg-emerald-500' : 'bg-base-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isPublished ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Schedule date (only if draft) */}
                    {!isPublished && (
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-base-content/50 mb-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Lên lịch xuất bản (tùy chọn)
                            </label>
                            <input
                                type="date"
                                value={formData.publishedAt}
                                onChange={(e) => updateField('publishedAt', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-3 py-2 rounded-lg bg-base-100 border ${errors.publishedAt
                                        ? 'border-red-500'
                                        : 'border-base-300/50'
                                    } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm text-base-content transition-all duration-200`}
                            />
                            {errors.publishedAt && (
                                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.publishedAt}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Summary preview */}
                <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl border border-emerald-500/10 p-4">
                    <p className="text-xs font-bold text-emerald-700 mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Tóm tắt khóa học
                    </p>
                    <div className="space-y-1.5 text-[12px] text-base-content/60 font-medium">
                        <p>
                            <span className="text-base-content/40">Tên:</span>{' '}
                            <span className="text-base-content font-bold">
                                {formData.courseName || '—'}
                            </span>
                        </p>
                        <p>
                            <span className="text-base-content/40">Giá:</span>{' '}
                            {price > 0 ? `${price.toLocaleString('vi-VN')}₫` : '—'}
                        </p>
                        <p>
                            <span className="text-base-content/40">Trạng thái:</span>{' '}
                            <span
                                className={
                                    isPublished ? 'text-emerald-600' : 'text-amber-600'
                                }
                            >
                                {isPublished ? '🟢 Xuất bản' : '🟡 Bản nháp'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderFullForm = () => (
        <div className="space-y-8">
            <section className="space-y-5">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600/80">
                        {STEPS[0].title}
                    </p>
                    <p className="text-sm text-base-content/45">
                        {STEPS[0].desc}
                    </p>
                </div>
                {renderStep1()}
            </section>

            <section className="space-y-5 border-t border-base-200/70 pt-6">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600/80">
                        {STEPS[1].title}
                    </p>
                    <p className="text-sm text-base-content/45">
                        {STEPS[1].desc}
                    </p>
                </div>
                {renderStep2()}
            </section>

            <section className="space-y-5 border-t border-base-200/70 pt-6">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600/80">
                        {STEPS[2].title}
                    </p>
                    <p className="text-sm text-base-content/45">
                        {STEPS[2].desc}
                    </p>
                </div>
                {renderStep3()}
            </section>
        </div>
    );

    // ─── Render ───────────────────────────────────────────

    return (
        <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) onClose();
            }}
        >
            <motion.div
                variants={modalVariants}
                className="bg-base-100 rounded-2xl shadow-2xl border border-base-300/60 w-full max-w-3xl min-h-[78vh] max-h-[90vh] flex flex-col"
            >
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between px-7 py-5 md:px-8 border-b border-base-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-md">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-base-content">
                                Tạo khóa học mới
                            </h2>
                            <p className="text-[11px] text-base-content/40 font-medium">
                                Tên, mô tả, hình ảnh, giá và xuất bản
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="btn btn-ghost btn-sm btn-circle opacity-50 hover:opacity-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ─── Stepper ─── */}
                <div className="px-7 py-4 md:px-8 border-b border-base-200/50 flex-shrink-0">
                    <div className="flex items-center gap-1">
                        {STEPS.map((s, i) => {
                            return (
                                <div key={s.id} className="flex items-center flex-1">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-full bg-emerald-500/10 text-emerald-700">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold bg-emerald-600 text-white"
                                        >
                                            {s.id}
                                        </div>
                                        <span className="text-[11px] font-bold hidden sm:inline truncate">
                                            {s.title}
                                        </span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div
                                            className="w-6 h-px mx-1 flex-shrink-0 bg-emerald-500/30"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ─── Body (scrollable) ─── */}
                <div
                    className="flex-1 overflow-y-auto px-7 py-6 md:px-8"
                    ref={formRef}
                >
                    {renderFullForm()}

                    {/* Error / Success messages */}
                    <AnimatePresence>
                        {submitError && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mt-4"
                            >
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-xs text-red-600 font-medium">
                                    {submitError}
                                </p>
                            </motion.div>
                        )}
                        {submitSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mt-4"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <p className="text-xs text-emerald-600 font-medium">
                                    Tạo khóa học thành công!
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ─── Footer ─── */}
                <div className="flex items-center justify-between px-7 py-5 md:px-8 border-t border-base-200 bg-base-200/15 rounded-b-2xl flex-shrink-0">
                    <div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting || uploadingBanner}
                            className="btn btn-sm btn-ghost font-bold rounded-xl text-base-content/50"
                        >
                            Hủy
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting || submitSuccess || uploadingBanner}
                            className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-none shadow-lg shadow-emerald-500/15 font-bold rounded-xl gap-1.5"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : submitSuccess ? (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Đã tạo!
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5" />
                                    Tạo khóa học
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
