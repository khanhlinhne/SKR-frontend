import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X,
    Plus,
    BookOpen,
    DollarSign,
    Tag,
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
    Layers,
    GraduationCap,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Upload,
    Link2,
    Type,
    AlignLeft,
    Hash,
    Star,
} from 'lucide-react';
import adminApi from '@/shared/api/adminApi';

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

const stepVariants = {
    enter: (dir) => ({
        x: dir > 0 ? 40 : -40,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: (dir) => ({
        x: dir > 0 ? -40 : 40,
        opacity: 0,
        transition: { duration: 0.2 },
    }),
};

// ─── Category Options ─────────────────────────────────────

const CATEGORIES = [
    { value: 'Toán học', icon: '📐', label: 'Toán học' },
    { value: 'Tiếng Anh', icon: '🇬🇧', label: 'Tiếng Anh' },
    { value: 'IT', icon: '💻', label: 'Công nghệ thông tin' },
    { value: 'Vật lý', icon: '⚛️', label: 'Vật lý' },
    { value: 'Hóa học', icon: '🧪', label: 'Hóa học' },
    { value: 'Kinh tế', icon: '📈', label: 'Kinh tế' },
    { value: 'Văn học', icon: '📖', label: 'Văn học' },
    { value: 'Khác', icon: '📚', label: 'Khác' },
];

// ─── Step definitions ─────────────────────────────────────

const STEPS = [
    { id: 1, title: 'Thông tin cơ bản', icon: BookOpen, desc: 'Tên, mã, danh mục' },
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

function TextInput({ value, onChange, placeholder, error, maxLength, ...props }) {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full px-4 py-2.5 rounded-xl bg-base-200/40 border ${
                    error
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-base-300/50 focus:border-emerald-500'
                } focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/25 transition-all duration-200`}
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
                className={`w-full px-4 py-3 rounded-xl bg-base-200/40 border ${
                    error
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

// ─── Main Component ───────────────────────────────────────

export default function CourseCreateModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [formData, setFormData] = useState({
        // Step 1 — Basic Info
        courseName: '',
        courseCode: '',
        category: '',
        // Step 2 — Content
        description: '',
        bannerUrl: '',
        // Step 3 — Pricing & Publish
        price: '',
        originalPrice: '',
        isFree: false,
        status: 'draft',
        publishedAt: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const formRef = useRef(null);

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

    // ─── Validation per step ──────────────────────────────

    const validateStep = (stepNum) => {
        const newErrors = {};

        if (stepNum === 1) {
            if (!formData.courseName.trim()) {
                newErrors.courseName = 'Tên khóa học không được để trống';
            } else if (formData.courseName.trim().length < 3) {
                newErrors.courseName = 'Tên khóa học phải có ít nhất 3 ký tự';
            }
            if (!formData.category) {
                newErrors.category = 'Vui lòng chọn danh mục';
            }
        }

        if (stepNum === 2) {
            if (!formData.description.trim()) {
                newErrors.description = 'Mô tả khóa học không được để trống';
            } else if (formData.description.trim().length < 20) {
                newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
            }
        }

        if (stepNum === 3) {
            if (!formData.isFree) {
                const price = Number(formData.price);
                if (!formData.price || isNaN(price) || price <= 0) {
                    newErrors.price = 'Vui lòng nhập giá hợp lệ';
                }
                if (formData.originalPrice) {
                    const origPrice = Number(formData.originalPrice);
                    if (isNaN(origPrice) || origPrice < 0) {
                        newErrors.originalPrice = 'Giá gốc không hợp lệ';
                    }
                    if (origPrice > 0 && origPrice <= price) {
                        newErrors.originalPrice = 'Giá gốc phải lớn hơn giá bán';
                    }
                }
            }
            if (formData.publishedAt) {
                const pubDate = new Date(formData.publishedAt);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (pubDate < today) {
                    newErrors.publishedAt = 'Ngày xuất bản không được là ngày trong quá khứ';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ─── Navigation ───────────────────────────────────────

    const goNext = () => {
        if (!validateStep(step)) return;
        setDirection(1);
        setStep((s) => Math.min(s + 1, 3));
    };

    const goPrev = () => {
        setDirection(-1);
        setStep((s) => Math.max(s - 1, 1));
    };

    const goToStep = (target) => {
        // Only allow going back freely, going forward requires validation
        if (target < step) {
            setDirection(-1);
            setStep(target);
        } else if (target > step) {
            // Validate all steps up to target
            for (let i = step; i < target; i++) {
                if (!validateStep(i)) return;
            }
            setDirection(1);
            setStep(target);
        }
    };

    // ─── Submit ───────────────────────────────────────────

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                courseName: formData.courseName.trim(),
                courseCode: formData.courseCode.trim() || undefined,
                category: formData.category,
                courseDescription: formData.description.trim(),
                bannerUrl: formData.bannerUrl.trim() || undefined,
                priceAmount: formData.isFree ? 0 : Number(formData.price),
                isFree: formData.isFree,
                originalPrice: formData.originalPrice
                    ? Number(formData.originalPrice)
                    : undefined,
                status: formData.status,
            };

            if (formData.publishedAt) {
                payload.publishedAt = new Date(formData.publishedAt).toISOString();
            }

            const res = await adminApi.createCourse(payload);
            const created = res?.data ?? res;
            setSubmitSuccess(true);
            setTimeout(() => onSuccess(created), 800);
        } catch (err) {
            console.error('Lỗi khi tạo khóa học:', err);
            setSubmitError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Không thể tạo khóa học. Vui lòng thử lại.'
            );
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
                />
            </FormField>

            {/* Category */}
            <FormField label="Danh mục" icon={Tag} required error={errors.category}>
                <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            type="button"
                            key={cat.value}
                            onClick={() => updateField('category', cat.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                                formData.category === cat.value
                                    ? 'border-emerald-500/50 bg-emerald-500/5 ring-2 ring-emerald-500/10 shadow-sm'
                                    : 'border-base-300/40 bg-base-200/30 hover:border-base-content/10 hover:bg-base-200/60'
                            }`}
                        >
                            <span className="text-xl leading-none">{cat.icon}</span>
                            <span
                                className={`text-[10px] font-bold leading-tight text-center ${
                                    formData.category === cat.value
                                        ? 'text-emerald-700'
                                        : 'text-base-content/50'
                                }`}
                            >
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>
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

            {/* Banner URL */}
            <FormField
                label="Ảnh bìa khóa học"
                icon={ImageIcon}
                hint="Nhập URL ảnh bìa (khuyến nghị 1200×630px)"
            >
                <TextInput
                    value={formData.bannerUrl}
                    onChange={(v) => updateField('bannerUrl', v)}
                    placeholder="https://example.com/banner.jpg"
                />
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
        const originalPrice = Number(formData.originalPrice) || 0;
        const discount =
            originalPrice > 0 && price > 0
                ? Math.round((1 - price / originalPrice) * 100)
                : 0;

        return (
            <div className="space-y-5">
                {/* Free toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-base-200/30 border border-base-300/30">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Star className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-base-content">Khóa học miễn phí</p>
                            <p className="text-[11px] text-base-content/40 font-medium">
                                Học viên không cần thanh toán
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            updateField('isFree', !formData.isFree);
                            if (!formData.isFree) {
                                updateField('price', '');
                                updateField('originalPrice', '');
                            }
                        }}
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

                {/* Price fields */}
                {!formData.isFree && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <FormField label="Giá bán (₫)" icon={DollarSign} required error={errors.price}>
                            <TextInput
                                value={formData.price}
                                onChange={(v) => updateField('price', v.replace(/[^0-9]/g, ''))}
                                placeholder="299000"
                                error={errors.price}
                            />
                        </FormField>
                        <FormField
                            label="Giá gốc (₫)"
                            icon={DollarSign}
                            error={errors.originalPrice}
                            hint={discount > 0 ? `Giảm ${discount}%` : undefined}
                        >
                            <TextInput
                                value={formData.originalPrice}
                                onChange={(v) => updateField('originalPrice', v.replace(/[^0-9]/g, ''))}
                                placeholder="499000"
                                error={errors.originalPrice}
                            />
                        </FormField>
                    </motion.div>
                )}

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
                                className={`w-full px-3 py-2 rounded-lg bg-base-100 border ${
                                    errors.publishedAt
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
                            <span className="text-base-content/40">Danh mục:</span>{' '}
                            {formData.category || '—'}
                        </p>
                        <p>
                            <span className="text-base-content/40">Giá:</span>{' '}
                            {formData.isFree
                                ? 'Miễn phí'
                                : price > 0
                                ? `${price.toLocaleString('vi-VN')}₫`
                                : '—'}
                            {discount > 0 && (
                                <span className="text-rose-500 ml-1">(-{discount}%)</span>
                            )}
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

    const renderCurrentStep = () => {
        switch (step) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            default:
                return null;
        }
    };

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
                className="bg-base-100 rounded-2xl shadow-2xl border border-base-300/60 w-full max-w-lg max-h-[90vh] flex flex-col"
            >
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-md">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-base-content">
                                Tạo khóa học mới
                            </h2>
                            <p className="text-[11px] text-base-content/40 font-medium">
                                {STEPS[step - 1].desc}
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
                <div className="px-6 py-3 border-b border-base-200/50 flex-shrink-0">
                    <div className="flex items-center gap-1">
                        {STEPS.map((s, i) => {
                            const StepIcon = s.icon;
                            const isActive = step === s.id;
                            const isCompleted = step > s.id;
                            return (
                                <div key={s.id} className="flex items-center flex-1">
                                    <button
                                        type="button"
                                        onClick={() => goToStep(s.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 w-full ${
                                            isActive
                                                ? 'bg-emerald-500/10 text-emerald-700'
                                                : isCompleted
                                                ? 'text-emerald-600 hover:bg-emerald-500/5'
                                                : 'text-base-content/30 hover:text-base-content/50'
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all ${
                                                isActive
                                                    ? 'bg-emerald-600 text-white'
                                                    : isCompleted
                                                    ? 'bg-emerald-500/15 text-emerald-600'
                                                    : 'bg-base-200 text-base-content/30'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            ) : (
                                                s.id
                                            )}
                                        </div>
                                        <span className="text-[11px] font-bold hidden sm:inline truncate">
                                            {s.title}
                                        </span>
                                    </button>
                                    {i < STEPS.length - 1 && (
                                        <div
                                            className={`w-6 h-px mx-1 flex-shrink-0 ${
                                                step > s.id
                                                    ? 'bg-emerald-500/30'
                                                    : 'bg-base-300/40'
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ─── Body (scrollable) ─── */}
                <div
                    className="flex-1 overflow-y-auto px-6 py-5"
                    ref={formRef}
                >
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            {renderCurrentStep()}
                        </motion.div>
                    </AnimatePresence>

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
                <div className="flex items-center justify-between px-6 py-4 border-t border-base-200 bg-base-200/15 rounded-b-2xl flex-shrink-0">
                    <div>
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={goPrev}
                                disabled={submitting}
                                className="btn btn-sm btn-ghost font-bold rounded-xl gap-1 text-base-content/50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Quay lại
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="btn btn-sm btn-ghost font-bold rounded-xl text-base-content/50"
                            >
                                Hủy
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Step indicator for mobile */}
                        <span className="text-[11px] text-base-content/30 font-bold sm:hidden">
                            {step}/3
                        </span>

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-none shadow-lg shadow-emerald-500/15 font-bold rounded-xl gap-1"
                            >
                                Tiếp theo
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || submitSuccess}
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
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
