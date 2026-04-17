import { useState } from 'react';
import { motion } from 'motion/react';
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    FolderPlus,
    Loader2,
    Pencil,
    Plus,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import {
    addableLessonTypes,
    buildQuestionEditorInitialState,
    lessonTypeConfig,
    validateChapterForm,
    validateLessonForm,
} from './curriculumDetailUtils';

export function AddChapterModal({ open, onClose, onSubmit, loading }) {
    const [form, setForm] = useState({ chapterName: '', chapterCode: '', chapterDescription: '' });

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.chapterName.trim()) return;
        onSubmit(form);
    };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box rounded-2xl border border-base-300 shadow-2xl"
            >
                <h3 className="font-black text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                        <FolderPlus className="w-4 h-4 text-white" />
                    </div>
                    {'ThÃªm chÆ°Æ¡ng má»›i'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'MÃ£ chÆ°Æ¡ng'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: CH01"
                            value={form.chapterCode}
                            onChange={e => setForm(f => ({ ...f, chapterCode: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'TÃªn chÆ°Æ¡ng'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: Giá»›i thiá»‡u React"
                            value={form.chapterName}
                            onChange={e => setForm(f => ({ ...f, chapterName: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'MÃ´ táº£ (tÃ¹y chá»n)'}</span>
                        </label>
                        <textarea
                            placeholder="MÃ´ táº£ ná»™i dung chÆ°Æ¡ng..."
                            value={form.chapterDescription}
                            onChange={e => setForm(f => ({ ...f, chapterDescription: e.target.value }))}
                            className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none"
                            rows={2}
                        />
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">{'Há»§y'}</button>
                        <button
                            type="submit"
                            disabled={loading || !form.chapterName.trim() || !form.chapterCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {'ThÃªm chÆ°Æ¡ng'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

export function AddLessonModal({ open, onClose, onSubmit, loading, chapterName, existingLessons = [], onValidationError }) {
    const [form, setForm] = useState({ lessonName: '', lessonCode: '', lessonType: 'video' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');

    if (!open) return null;

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
        setFormError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validation = validateLessonForm(form, existingLessons);
        if (!validation.isValid) {
            setFieldErrors(validation.fieldErrors);
            setFormError(validation.summary);
            onValidationError?.(validation);
            return;
        }
        onSubmit(form);
    };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box rounded-2xl border border-base-300 shadow-2xl"
            >
                <h3 className="font-black text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    {'ThÃªm bÃ i giáº£ng'}
                </h3>
                {chapterName && (
                    <p className="text-xs text-base-content/50 mt-1">
                        {'VÃ o chÆ°Æ¡ng:'} <span className="font-bold text-violet-600">{chapterName}</span>
                    </p>
                )}
                <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
                    {formError && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <div className="flex items-start gap-3">
                                <span className="text-lg leading-none">ðŸ¦‰</span>
                                <div>
                                    <p className="font-black">CÃº cáº§n báº¡n kiá»ƒm tra láº¡i má»™t chÃºt</p>
                                    <p className="mt-1 leading-relaxed">{formError}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'MÃ£ bÃ i giáº£ng'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: LS01"
                            value={form.lessonCode}
                            onChange={e => updateField('lessonCode', e.target.value)}
                            className={`input input-bordered input-sm rounded-xl w-full font-medium ${fieldErrors.lessonCode ? 'border-red-400 focus:border-red-500' : ''}`}
                        />
                        {fieldErrors.lessonCode && (
                            <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.lessonCode}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'TÃªn bÃ i giáº£ng'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: React lÃ  gÃ¬?"
                            value={form.lessonName}
                            onChange={e => updateField('lessonName', e.target.value)}
                            className={`input input-bordered input-sm rounded-xl w-full font-medium ${fieldErrors.lessonName ? 'border-red-400 focus:border-red-500' : ''}`}
                            autoFocus
                        />
                        {fieldErrors.lessonName && (
                            <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.lessonName}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Loáº¡i bÃ i giáº£ng'}</span>
                        </label>
                        <div className="flex gap-2">
                            {addableLessonTypes.map((type) => {
                                const config = lessonTypeConfig[type];
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, lessonType: type }))}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                                            form.lessonType === type
                                                ? `border-violet-500 ${config.color} shadow-md`
                                                : 'border-base-300 text-base-content/40 hover:border-base-content/20'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {config.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">{'Há»§y'}</button>
                        <button
                            type="submit"
                            disabled={loading || !form.lessonName.trim() || !form.lessonCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {'ThÃªm bÃ i'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

export function EditChapterModal({ open, onClose, onSubmit, loading, initialValue = null, onValidationError }) {
    const [form, setForm] = useState(() => ({
        chapterName: initialValue?.chapterName || '',
        chapterCode: initialValue?.chapterCode || '',
        chapterDescription: initialValue?.chapterDescription || '',
    }));
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');

    if (!open) return null;

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
        setFormError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validation = validateChapterForm(form);
        if (!validation.isValid) {
            setFieldErrors(validation.fieldErrors);
            setFormError(validation.summary);
            onValidationError?.(validation);
            return;
        }
        onSubmit({
            chapterName: form.chapterName.trim(),
            chapterCode: form.chapterCode.trim(),
            chapterDescription: form.chapterDescription.trim(),
        });
    };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box rounded-2xl border border-base-300 shadow-2xl"
            >
                <h3 className="font-black text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-white" />
                    </div>
                    {'Chinh sua chuong'}
                </h3>
                <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
                    {formError && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <div>
                                    <p className="font-black">Can kiem tra lai thong tin chuong</p>
                                    <p className="mt-1 leading-relaxed">{formError}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Ma chuong'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: CH01"
                            value={form.chapterCode}
                            onChange={e => updateField('chapterCode', e.target.value)}
                            className={`input input-bordered input-sm rounded-xl w-full font-medium ${fieldErrors.chapterCode ? 'border-red-400 focus:border-red-500' : ''}`}
                        />
                        {fieldErrors.chapterCode && (
                            <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.chapterCode}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Ten chuong'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: Gioi thieu React"
                            value={form.chapterName}
                            onChange={e => updateField('chapterName', e.target.value)}
                            className={`input input-bordered input-sm rounded-xl w-full font-medium ${fieldErrors.chapterName ? 'border-red-400 focus:border-red-500' : ''}`}
                            autoFocus
                        />
                        {fieldErrors.chapterName && (
                            <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.chapterName}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Mo ta'}</span>
                        </label>
                        <textarea
                            placeholder="Mo ta noi dung chuong..."
                            value={form.chapterDescription}
                            onChange={e => updateField('chapterDescription', e.target.value)}
                            className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none"
                            rows={3}
                        />
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">{'Huy'}</button>
                        <button
                            type="submit"
                            disabled={loading || !form.chapterName.trim() || !form.chapterCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {'Luu chuong'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

export function EditLessonModal({
    open,
    onClose,
    onSubmit,
    loading,
    chapterName,
    existingLessons = [],
    currentLessonId = null,
    initialValue = null,
    onValidationError,
}) {
    const [form, setForm] = useState(() => ({
        lessonName: initialValue?.lessonName || '',
        lessonCode: initialValue?.lessonCode || '',
    }));
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');

    if (!open) return null;

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
        setFormError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const filteredLessons = currentLessonId
            ? existingLessons.filter((lesson) => (lesson?.lessonId || lesson?.id) !== currentLessonId)
            : existingLessons;
        const validation = validateLessonForm(form, filteredLessons);
        if (!validation.isValid) {
            setFieldErrors(validation.fieldErrors);
            setFormError(validation.summary);
            onValidationError?.(validation);
            return;
        }
        onSubmit({
            lessonName: form.lessonName.trim(),
            lessonCode: form.lessonCode.trim(),
        });
    };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box rounded-2xl border border-base-300 shadow-2xl"
            >
                <h3 className="font-black text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-white" />
                    </div>
                    {'Chinh sua bai hoc'}
                </h3>
                {chapterName && (
                    <p className="text-xs text-base-content/50 mt-1">
                        {'Trong chuong:'} <span className="font-bold text-violet-600">{chapterName}</span>
                    </p>
                )}
                <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
                    {formError && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <div>
                                    <p className="font-black">Can kiem tra lai thong tin bai hoc</p>
                                    <p className="mt-1 leading-relaxed">{formError}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Ma bai hoc'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: LS01"
                            value={form.lessonCode}
                            onChange={e => updateField('lessonCode', e.target.value)}
                            className={`input input-bordered input-sm rounded-xl w-full font-medium ${fieldErrors.lessonCode ? 'border-red-400 focus:border-red-500' : ''}`}
                        />
                        {fieldErrors.lessonCode && (
                            <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.lessonCode}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Ten bai hoc'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: Props va State"
                            value={form.lessonName}
                            onChange={e => updateField('lessonName', e.target.value)}
                            className={`input input-bordered input-sm rounded-xl w-full font-medium ${fieldErrors.lessonName ? 'border-red-400 focus:border-red-500' : ''}`}
                            autoFocus
                        />
                        {fieldErrors.lessonName && (
                            <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.lessonName}</p>
                        )}
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">{'Huy'}</button>
                        <button
                            type="submit"
                            disabled={loading || !form.lessonName.trim() || !form.lessonCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {'Luu bai hoc'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

export function EditQuestionModal({ open, onClose, onSubmit, loading, initialValue = null }) {
    const [form, setForm] = useState(() => buildQuestionEditorInitialState(initialValue));
    const [formError, setFormError] = useState('');

    if (!open) return null;

    const updateField = (field, value) => {
        setForm((prev) => {
            if (field === 'questionType') {
                return {
                    ...prev,
                    questionType: value,
                    options: value === 'true_false'
                        ? [
                            { id: 'true-option', optionText: 'Dung', isCorrect: true },
                            { id: 'false-option', optionText: 'Sai', isCorrect: false },
                        ]
                        : [
                            { id: 'option-1', optionText: '', isCorrect: true },
                            { id: 'option-2', optionText: '', isCorrect: false },
                            { id: 'option-3', optionText: '', isCorrect: false },
                            { id: 'option-4', optionText: '', isCorrect: false },
                        ],
                };
            }

            return { ...prev, [field]: value };
        });
        setFormError('');
    };

    const updateOption = (optionId, field, value) => {
        setForm((prev) => ({
            ...prev,
            options: prev.options.map((option) => {
                if (option.id !== optionId) {
                    return field === 'isCorrect' && value ? { ...option, isCorrect: false } : option;
                }

                return { ...option, [field]: value };
            }),
        }));
        setFormError('');
    };

    const addOption = () => {
        setForm((prev) => ({
            ...prev,
            options: [
                ...prev.options,
                { id: `option-${Date.now()}-${prev.options.length + 1}`, optionText: '', isCorrect: false },
            ],
        }));
    };

    const removeOption = (optionId) => {
        setForm((prev) => {
            const nextOptions = prev.options.filter((option) => option.id !== optionId);
            if (nextOptions.length === 0) return prev;
            if (!nextOptions.some((option) => option.isCorrect)) {
                nextOptions[0] = { ...nextOptions[0], isCorrect: true };
            }
            return { ...prev, options: nextOptions };
        });
        setFormError('');
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const questionText = form.questionText.trim();
        if (!questionText) {
            setFormError('ðŸ¦‰ Hay nhap noi dung cau hoi truoc khi luu.');
            return;
        }

        const normalizedOptions = form.options
            .map((option, index) => ({
                optionText: String(option.optionText || '').trim(),
                isCorrect: Boolean(option.isCorrect),
                optionOrder: index,
            }))
            .filter((option) => option.optionText);

        if (form.questionType === 'multiple_choice' && normalizedOptions.length < 2) {
            setFormError('ðŸ¦‰ Cau hoi trac nghiem can it nhat 2 dap an.');
            return;
        }

        if (normalizedOptions.length === 0) {
            setFormError('ðŸ¦‰ Hay nhap it nhat mot dap an hop le.');
            return;
        }

        if (!normalizedOptions.some((option) => option.isCorrect)) {
            setFormError('ðŸ¦‰ Can chon it nhat mot dap an dung.');
            return;
        }

        onSubmit({
            questionText,
            questionType: form.questionType,
            difficultyLevel: form.difficultyLevel,
            questionExplanation: form.questionExplanation.trim() || undefined,
            options: normalizedOptions,
        });
    };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box max-w-4xl rounded-3xl border border-amber-200 bg-base-100 shadow-2xl"
            >
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-black text-base-content">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
                                <Pencil className="h-4 w-4" />
                            </div>
                            {'Chinh sua cau hoi'}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-base-content/50">
                            {'ðŸ¦‰ Chinh lai noi dung, dap an dung va giai thich cho learner.'}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <div className="flex items-start gap-3">
                                <span className="text-lg leading-none">ðŸ¦‰</span>
                                <p className="leading-relaxed">{formError}</p>
                            </div>
                        </div>
                    )}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-bold uppercase tracking-[0.16em] text-base-content/60">{'Noi dung cau hoi'}</span>
                        </label>
                        <textarea
                            rows={3}
                            value={form.questionText}
                            onChange={(event) => updateField('questionText', event.target.value)}
                            className="textarea textarea-bordered w-full rounded-2xl text-sm font-medium resize-none"
                            placeholder="Nhap noi dung cau hoi..."
                        />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-xs font-bold uppercase tracking-[0.16em] text-base-content/60">{'Loai cau hoi'}</span>
                            </label>
                            <select value={form.questionType} onChange={(event) => updateField('questionType', event.target.value)} className="select select-bordered rounded-xl text-sm font-medium">
                                <option value="multiple_choice">multiple_choice</option>
                                <option value="true_false">true_false</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-xs font-bold uppercase tracking-[0.16em] text-base-content/60">{'Do kho'}</span>
                            </label>
                            <select value={form.difficultyLevel} onChange={(event) => updateField('difficultyLevel', event.target.value)} className="select select-bordered rounded-xl text-sm font-medium">
                                <option value="easy">easy</option>
                                <option value="medium">medium</option>
                                <option value="hard">hard</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3 rounded-2xl border border-base-300 bg-base-200/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-black text-base-content">{'Dap an'}</p>
                                <p className="text-xs text-base-content/55">{'ðŸ¦‰ Chon dap an dung bang nut tron mau xanh.'}</p>
                            </div>
                            {form.questionType !== 'true_false' && form.options.length < 6 && (
                                <button type="button" onClick={addOption} className="btn btn-sm rounded-xl border-none bg-blue-50 text-blue-600 hover:bg-blue-100">
                                    <Plus className="h-4 w-4" />
                                    {'Them dap an'}
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {form.options.map((option, optionIndex) => (
                                <div key={option.id} className="flex items-center gap-2">
                                    <button type="button" onClick={() => updateOption(option.id, 'isCorrect', true)} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${option.isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-base-300 bg-white hover:border-emerald-400'}`}>
                                        {option.isCorrect && <CheckCircle2 className="h-4 w-4" />}
                                    </button>
                                    <input
                                        type="text"
                                        value={option.optionText}
                                        disabled={form.questionType === 'true_false'}
                                        onChange={(event) => updateOption(option.id, 'optionText', event.target.value)}
                                        className="input input-bordered flex-1 rounded-xl text-sm font-medium"
                                        placeholder={`Dap an ${optionIndex + 1}`}
                                    />
                                    {form.questionType !== 'true_false' && form.options.length > 2 && (
                                        <button type="button" onClick={() => removeOption(option.id)} className="btn btn-ghost btn-sm btn-circle text-red-500 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-bold uppercase tracking-[0.16em] text-base-content/60">{'Giai thich'}</span>
                        </label>
                        <textarea
                            rows={3}
                            value={form.questionExplanation}
                            onChange={(event) => updateField('questionExplanation', event.target.value)}
                            className="textarea textarea-bordered w-full rounded-2xl text-sm font-medium resize-none"
                            placeholder="Them giai thich cho dap an..."
                        />
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">{'Huy'}</button>
                        <button type="submit" disabled={loading} className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white shadow-lg shadow-amber-500/20">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {'Luu cau hoi'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}
