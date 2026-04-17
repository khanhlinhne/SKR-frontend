import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X,
    Edit3,
    BookOpen,
    FileText,
    DollarSign,
    Image as ImageIcon,
    Globe,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    Info,
    Sparkles,
    Upload,
    Type,
    AlignLeft,
    Hash,
} from 'lucide-react';
import adminApi from '@/shared/api/adminApi';
import { uploadApi } from '@/shared/api';

const MAX_BANNER_SIZE_BYTES = 5 * 1024 * 1024;

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

const SECTIONS = [
    { id: 1, title: 'Thông tin cơ bản', desc: 'Tên, mã', icon: BookOpen },
    { id: 2, title: 'Nội dung', desc: 'Mô tả, hình ảnh', icon: FileText },
    { id: 3, title: 'Giá & Xuất bản', desc: 'Định giá, trạng thái', icon: DollarSign },
];

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
}

function resolveUploadedImageUrl(response) {
    const payload = response?.data || response || {};
    return payload.imageUrl || payload.url || payload.secure_url || payload.fileUrl || payload.path || '';
}

function resolveBannerFileName(url) {
    if (!url) return '';
    try {
        const cleanUrl = url.split('?')[0];
        const segments = cleanUrl.split('/');
        return decodeURIComponent(segments[segments.length - 1] || '');
    } catch {
        return '';
    }
}

function buildInitialForm(course) {
    return {
        courseName: course?.name || '',
        courseCode: course?.subjectCode || course?.courseCode || '',
        description: course?.description || course?.courseDescription || '',
        bannerUrl: course?.bannerUrl || course?.subjectBannerUrl || course?.courseBannerUrl || '',
        price: String(Number(course?.price ?? course?.priceAmount ?? 0) || ''),
        status: course?.status || 'draft',
        publishedAt: course?.publishedAt ? formatDate(course.publishedAt) : '',
    };
}

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
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] text-red-500 font-medium flex items-center gap-1">
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
                className={`w-full px-4 py-2.5 rounded-xl bg-base-200/40 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-base-300/50 focus:border-emerald-500'} focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/25 transition-all duration-200 ${className}`}
                {...props}
            />
            {maxLength && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-base-content/25 font-mono tabular-nums">{value.length}/{maxLength}</span>}
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
                className={`w-full px-4 py-3 rounded-xl bg-base-200/40 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-base-300/50 focus:border-emerald-500'} focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/25 transition-all duration-200 resize-none`}
            />
            {maxLength && <span className="absolute right-3 bottom-3 text-[10px] text-base-content/25 font-mono tabular-nums">{value.length}/{maxLength}</span>}
        </div>
    );
}

function OwlToast({ toast }) {
    return (
        <AnimatePresence>
            {toast && (
                <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-6 right-6 z-[60] max-w-sm">
                    <div className={`relative overflow-hidden rounded-[1.75rem] border shadow-2xl ${toast.type === 'error' ? 'border-red-400/20 bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 text-white' : 'border-violet-400/20 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white'}`}>
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                        <div className="relative flex items-start gap-3 p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20">
                                <span className="text-2xl leading-none">{toast.owl || '🦉'}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black leading-tight">{toast.title}</p>
                                        {toast.message && <p className="mt-1 text-xs leading-relaxed text-white/80">{toast.message}</p>}
                                    </div>
                                    <button type="button" onClick={toast.onClose} className="btn btn-ghost btn-xs btn-circle border-none bg-white/0 text-white/70 hover:bg-white/10 hover:text-white">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                {toast.cta && <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/80 ring-1 ring-white/10">{toast.cta}</div>}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function CourseEditModal({ course, onClose, onSuccess }) {
    const initialForm = useMemo(() => buildInitialForm(course), [course]);
    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [bannerFileName, setBannerFileName] = useState(resolveBannerFileName(initialForm.bannerUrl));
    const [toast, setToast] = useState(null);
    const bannerInputRef = useRef(null);
    const toastTimeoutRef = useRef(null);

    useEffect(() => {
        setFormData(initialForm);
        setErrors({});
        setBannerFileName(resolveBannerFileName(initialForm.bannerUrl));
    }, [initialForm]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && !submitting) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose, submitting]);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
                toastTimeoutRef.current = null;
            }
        };
    }, []);

    const isPublished = formData.status === 'published';
    const price = Number(formData.price) || 0;

    const showToast = (payload) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({
            owl: '🦉',
            onClose: () => setToast(null),
            ...payload,
        });
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
            toastTimeoutRef.current = null;
        }, payload.type === 'error' ? 4200 : 2600);
    };

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const setFieldError = (field, message) => {
        setErrors((prev) => ({ ...prev, [field]: message }));
    };

    const validateForm = () => {
        const nextErrors = {};
        if (!formData.courseName.trim()) {
            nextErrors.courseName = 'Tên khóa học không được để trống';
        } else if (formData.courseName.trim().length < 3) {
            nextErrors.courseName = 'Tên khóa học phải có ít nhất 3 ký tự';
        }
        if (!formData.description.trim()) {
            nextErrors.description = 'Mô tả khóa học không được để trống';
        } else if (formData.description.trim().length < 20) {
            nextErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
        }
        if (!formData.price || Number.isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            nextErrors.price = 'Vui lòng nhập giá bán hợp lệ';
        }
        if (formData.publishedAt && formData.status !== 'published') {
            const pubDate = new Date(formData.publishedAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (pubDate < today) nextErrors.publishedAt = 'Ngày xuất bản không được là ngày trong quá khứ';
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
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

        try {
            const uploadResponse = await uploadApi.uploadImage(file);
            const uploadedUrl = resolveUploadedImageUrl(uploadResponse);
            if (!uploadedUrl) throw new Error('Máy chủ chưa trả về URL ảnh hợp lệ.');
            setBannerFileName(file.name);
            updateField('bannerUrl', uploadedUrl);
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Không thể tải ảnh lên lúc này.';
            setFieldError('bannerUrl', message);
            showToast({ type: 'error', title: 'Ảnh bìa chưa tải lên được', message, cta: 'Kiểm tra lại ảnh' });
        } finally {
            setUploadingBanner(false);
        }
    };

    const clearBannerImage = () => {
        setBannerFileName('');
        updateField('bannerUrl', '');
        setFieldError('bannerUrl', '');
    };

    const handleTogglePublish = () => {
        if (isPublished) {
            updateField('status', 'draft');
        } else {
            updateField('status', 'published');
            updateField('publishedAt', '');
        }
    };

    const handleSubmit = async () => {
        if (uploadingBanner) {
            showToast({ type: 'error', title: 'Ảnh bìa vẫn đang tải lên', message: 'Vui lòng chờ upload hoàn tất rồi lưu thay đổi.', cta: 'Chờ thêm chút nhé' });
            return;
        }
        if (!validateForm()) {
            showToast({ type: 'error', title: 'Biểu mẫu chưa hợp lệ', message: 'Mình đã đánh dấu những trường cần bạn kiểm tra lại trước khi lưu.', cta: 'Bổ sung thông tin' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                courseName: formData.courseName.trim(),
                courseDescription: formData.description.trim(),
                status: formData.status,
                isFree: false,
                priceAmount: String(Number(formData.price) || 0),
            };
            if (formData.courseCode.trim()) payload.courseCode = formData.courseCode.trim();
            if (formData.bannerUrl.trim()) payload.courseBannerUrl = formData.bannerUrl.trim();
            if (formData.publishedAt && formData.status !== 'published') {
                payload.publishedAt = new Date(formData.publishedAt).toISOString();
            }

            const response = await adminApi.updateCourse(course.id, payload);
            const updatedCourse = response?.data ?? response;
            showToast({ type: 'success', title: 'Đã lưu thay đổi khóa học', message: `${formData.courseName.trim() || 'Khóa học'} đã được cập nhật thành công.`, cta: 'Đã đồng bộ' });
            setTimeout(() => onSuccess(updatedCourse), 1100);
        } catch (error) {
            console.error('Lỗi khi cập nhật khóa học:', error);
            showToast({
                type: 'error',
                title: 'Chưa lưu được thay đổi',
                message: error?.response?.data?.message || error?.response?.data?.error || 'Không thể cập nhật khóa học. Vui lòng thử lại.',
                cta: 'Thử lại sau',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const renderBasicSection = () => (
        <div className="space-y-5">
            <FormField label="Tên khóa học" icon={Type} required error={errors.courseName}>
                <TextInput
                    value={formData.courseName}
                    onChange={(value) => updateField('courseName', value)}
                    placeholder="VD: Lập Trình Python Từ Cơ Bản Đến Nâng Cao"
                    error={errors.courseName}
                    maxLength={120}
                    className="min-h-[56px] py-4"
                />
            </FormField>

            <FormField label="Mã khóa học" icon={Hash} hint="Mã tùy chọn để quản lý nội bộ (VD: CS101, MATH201)">
                <TextInput
                    value={formData.courseCode}
                    onChange={(value) => updateField('courseCode', value.toUpperCase())}
                    placeholder="VD: PYTHON101"
                    maxLength={20}
                    className="min-h-[56px] py-4"
                />
            </FormField>
        </div>
    );

    const renderContentSection = () => (
        <div className="space-y-5">
            <FormField label="Mô tả khóa học" icon={AlignLeft} required error={errors.description} hint="Mô tả chi tiết giúp học viên hiểu rõ nội dung khóa học">
                <TextArea
                    value={formData.description}
                    onChange={(value) => updateField('description', value)}
                    placeholder="Mô tả ngắn gọn về nội dung, mục tiêu và đối tượng của khóa học..."
                    error={errors.description}
                    maxLength={2000}
                    rows={5}
                />
            </FormField>

            <FormField label="Ảnh bìa khóa học" icon={ImageIcon} error={errors.bannerUrl} hint="Tải ảnh từ máy tính (khuyến nghị 1200×630px, tối đa 5MB)">
                <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleBannerSelect} className="hidden" />
                <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className={`w-full rounded-xl border border-dashed px-4 py-4 text-left transition-all duration-200 ${uploadingBanner ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-base-300/50 bg-base-200/20 hover:border-emerald-500/40 hover:bg-emerald-500/5'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                            {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-base-content">{uploadingBanner ? 'Đang tải ảnh lên...' : formData.bannerUrl ? 'Đổi ảnh bìa' : 'Chọn ảnh từ máy'}</p>
                            <p className="truncate text-[11px] font-medium text-base-content/45">{uploadingBanner ? 'Vui lòng chờ trong giây lát' : bannerFileName || 'PNG, JPG, WEBP hoặc GIF'}</p>
                        </div>
                    </div>
                </button>

                {formData.bannerUrl && (
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-base-300/40 bg-base-200/20 px-3 py-2">
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-base-content">{bannerFileName || 'Ảnh bìa hiện tại'}</p>
                            <p className="text-[11px] font-medium text-emerald-600">Sẵn sàng áp dụng sau khi lưu</p>
                        </div>
                        <button type="button" onClick={clearBannerImage} disabled={uploadingBanner} className="btn btn-ghost btn-xs rounded-lg text-base-content/50">
                            Xóa ảnh
                        </button>
                    </div>
                )}

                {formData.bannerUrl && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 rounded-xl overflow-hidden border border-base-300/40">
                        <img
                            src={formData.bannerUrl}
                            alt="Banner preview"
                            className="w-full h-32 object-cover"
                            onError={(event) => {
                                event.target.style.display = 'none';
                            }}
                        />
                    </motion.div>
                )}
            </FormField>
        </div>
    );

    const renderPricingSection = () => (
        <div className="space-y-5">
            <FormField label="Giá bán (₫)" icon={DollarSign} required error={errors.price} hint="Đây là giá hiển thị cho học viên khi mua và cũng là giá dùng để tính doanh số.">
                <TextInput
                    value={formData.price}
                    onChange={(value) => updateField('price', value.replace(/[^0-9]/g, ''))}
                    placeholder="299000"
                    error={errors.price}
                />
            </FormField>

            <div className="bg-base-200/30 rounded-xl border border-base-300/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        {isPublished ? <Globe className="w-5 h-5 text-emerald-600" /> : <EyeOff className="w-5 h-5 text-base-content/40" />}
                        <div>
                            <p className="text-sm font-bold text-base-content">{isPublished ? 'Xuất bản ngay' : 'Lưu bản nháp'}</p>
                            <p className="text-[11px] text-base-content/40 font-medium">{isPublished ? 'Khóa học đang hiển thị cho người dùng sau khi lưu.' : 'Chỉ admin mới thấy khóa học cho tới khi bạn công khai.'}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleTogglePublish}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${isPublished ? 'bg-emerald-500' : 'bg-base-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {!isPublished && (
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-base-content/50 mb-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Lên lịch xuất bản (tùy chọn)
                        </label>
                        <input
                            type="date"
                            value={formData.publishedAt}
                            onChange={(event) => updateField('publishedAt', event.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-3 py-2 rounded-lg bg-base-100 border ${errors.publishedAt ? 'border-red-500' : 'border-base-300/50'} focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm text-base-content transition-all duration-200`}
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

            <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl border border-emerald-500/10 p-4">
                <p className="text-xs font-bold text-emerald-700 mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Tóm tắt khóa học sau chỉnh sửa
                </p>
                <div className="space-y-1.5 text-[12px] text-base-content/60 font-medium">
                    <p><span className="text-base-content/40">Tên:</span> <span className="text-base-content font-bold">{formData.courseName || '—'}</span></p>
                    <p><span className="text-base-content/40">Giá:</span> {price > 0 ? `${price.toLocaleString('vi-VN')}₫` : '—'}</p>
                    <p><span className="text-base-content/40">Trạng thái:</span> <span className={isPublished ? 'text-emerald-600' : 'text-amber-600'}>{isPublished ? '🟢 Xuất bản' : '🟡 Bản nháp'}</span></p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={(event) => {
                    if (event.target === event.currentTarget && !submitting) onClose();
                }}
            >
                <motion.div
                    variants={modalVariants}
                    className="bg-base-100 rounded-2xl shadow-2xl border border-base-300/60 w-full max-w-3xl min-h-[78vh] max-h-[90vh] flex flex-col"
                >
                    <div className="flex items-center justify-between px-7 py-5 md:px-8 border-b border-base-200 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shadow-md">
                                <Edit3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-base-content">Chỉnh sửa khóa học</h2>
                                <p className="text-[11px] text-base-content/40 font-medium">Tên, mô tả, hình ảnh, giá và xuất bản</p>
                            </div>
                        </div>
                        <button onClick={onClose} disabled={submitting} className="btn btn-ghost btn-sm btn-circle opacity-50 hover:opacity-100">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="px-7 py-4 md:px-8 border-b border-base-200/50 flex-shrink-0">
                        <div className="flex items-center gap-1">
                            {SECTIONS.map((section, index) => (
                                <div key={section.id} className="flex items-center flex-1">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-full bg-blue-500/10 text-blue-700">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold bg-blue-600 text-white">
                                            {section.id}
                                        </div>
                                        <span className="text-[11px] font-bold hidden sm:inline truncate">{section.title}</span>
                                    </div>
                                    {index < SECTIONS.length - 1 && <div className="w-6 h-px mx-1 flex-shrink-0 bg-blue-500/20" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-7 py-6 md:px-8">
                        <div className="space-y-8">
                            <section className="space-y-5">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600/80">{SECTIONS[0].title}</p>
                                    <p className="text-sm text-base-content/45">{SECTIONS[0].desc}</p>
                                </div>
                                {renderBasicSection()}
                            </section>

                            <section className="space-y-5 border-t border-base-200/70 pt-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600/80">{SECTIONS[1].title}</p>
                                    <p className="text-sm text-base-content/45">{SECTIONS[1].desc}</p>
                                </div>
                                {renderContentSection()}
                            </section>

                            <section className="space-y-5 border-t border-base-200/70 pt-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600/80">{SECTIONS[2].title}</p>
                                    <p className="text-sm text-base-content/45">{SECTIONS[2].desc}</p>
                                </div>
                                {renderPricingSection()}
                            </section>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-7 py-5 md:px-8 border-t border-base-200 bg-base-200/15 rounded-b-2xl flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={submitting || uploadingBanner} className="btn btn-sm btn-ghost font-bold rounded-xl text-base-content/50">
                            Hủy
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting || uploadingBanner}
                            className="btn btn-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none shadow-lg shadow-blue-500/15 font-bold rounded-xl gap-1.5"
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

            <OwlToast toast={toast} />
        </>
    );
}
