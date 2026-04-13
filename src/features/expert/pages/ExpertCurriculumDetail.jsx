import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import courseApi from '@/shared/api/courseApi';
import { assignmentApi, flashcardApi, geminiApi, uploadApi } from '@/shared/api';
import AddQuestionModal from '@/features/expert/components/AddQuestionModal';
import AssignmentBuilderModal from '@/features/expert/components/AssignmentBuilderModal';
import DocumentPreviewContent from '@/features/expert/components/DocumentPreviewContent';
import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';
import { OwlLoader } from '@/shared/ui/common';
import {
    Plus,
    GripVertical,
    PlayCircle,
    FileText,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    Trash2,
    Pencil,
    Copy,
    Eye,
    Save,
    X,
    Check,
    FolderPlus,
    Layers,
    Clock,
    BookOpen,
    Loader2,
    AlertCircle,
    RefreshCw,
    ArrowLeft,
    GraduationCap,
    Hash,
    Upload,
    Link2,
    Video,
    MessageSquare,
    CheckCircle2,
    ExternalLink,
    Sparkles,
    ClipboardCheck,
} from 'lucide-react';

// ===== ANIMATION =====
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ===== LESSON TYPE CONFIG =====
const lessonTypeConfig = {
    video: { label: 'Video', icon: PlayCircle, color: 'text-blue-500 bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500' },
    document: { label: 'Tài liệu', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10', gradient: 'from-emerald-500 to-teal-500' },
    flashcard: { label: 'Flashcard', icon: Sparkles, color: 'text-indigo-500 bg-indigo-500/10', gradient: 'from-indigo-500 to-violet-500' },
    quiz: { label: 'Kiểm tra', icon: HelpCircle, color: 'text-amber-500 bg-amber-500/10', gradient: 'from-amber-500 to-orange-500' },
    assignment: { label: 'Assignment', icon: ClipboardCheck, color: 'text-rose-500 bg-rose-500/10', gradient: 'from-rose-500 to-orange-500' },
};

const addableLessonTypes = ['video', 'flashcard', 'quiz', 'assignment'];
const getLessonFlashcardSets = (content) => (
    Array.isArray(content?.flashcardSets)
        ? content.flashcardSets
        : Array.isArray(content?.flashcards)
            ? content.flashcards
            : []
);
const getFlashcardSetItems = (set) => (
    Array.isArray(set?.items)
        ? set.items
        : Array.isArray(set?.flashcardItems)
            ? set.flashcardItems
            : Array.isArray(set?.cards)
                ? set.cards
                : []
);
const MAX_FLASHCARD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const LESSON_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

function createFlashcardDraft(id) {
    return {
        id,
        itemId: null,
        cardOrder: null,
        frontText: '',
        backText: '',
        frontImageUrl: '',
        backImageUrl: '',
    };
}

function createFlashcardDraftFromItem(item, fallbackId = 1) {
    return {
        id: fallbackId,
        itemId: item?.flashcardItemId || item?.id || null,
        cardOrder: item?.cardOrder ?? item?.order ?? item?.displayOrder ?? null,
        frontText: item?.frontText || item?.front || '',
        backText: item?.backText || item?.back || '',
        frontImageUrl: resolveFlashcardImageUrl(
            item?.frontImageUrl || item?.frontImage || item?.frontMediaUrl || item?.frontImagePath || '',
        ),
        backImageUrl: resolveFlashcardImageUrl(
            item?.backImageUrl || item?.backImage || item?.backMediaUrl || item?.backImagePath || '',
        ),
    };
}

const DEFAULT_FLASHCARD_DRAFTS = [createFlashcardDraft(1)];

function extractUploadedImageUrl(response) {
    const payload = response?.data?.data || response?.data || response || {};
    return payload.imageUrl || payload.url || payload.secure_url || payload.fileUrl || payload.path || '';
}

function validateLessonForm(form, existingLessons = []) {
    const lessonCode = String(form?.lessonCode || '').trim();
    const lessonName = String(form?.lessonName || '').trim();
    const normalizedCode = lessonCode.toLowerCase();
    const normalizedName = lessonName.toLowerCase();

    const fieldErrors = {};
    let summary = '';

    if (!lessonCode) {
        fieldErrors.lessonCode = 'Cú cần mã bài giảng để sắp xếp và phân biệt nội dung trong chương.';
    } else if (lessonCode.length < 2) {
        fieldErrors.lessonCode = 'Mã bài giảng nên có ít nhất 2 ký tự, ví dụ LS01 hoặc QUIZ01.';
    } else if (!LESSON_CODE_PATTERN.test(lessonCode)) {
        fieldErrors.lessonCode = 'Mã bài giảng chỉ nên gồm chữ cái, số, dấu gạch ngang hoặc gạch dưới.';
    } else if (existingLessons.some((lesson) => String(lesson?.lessonCode || '').trim().toLowerCase() === normalizedCode)) {
        fieldErrors.lessonCode = 'Mã bài giảng này đã tồn tại trong chương. Bạn hãy chọn mã khác để tránh bị trùng.';
    }

    if (!lessonName) {
        fieldErrors.lessonName = 'Cú cần tên bài giảng để học viên nhận ra đúng nội dung cần học.';
    } else if (lessonName.length < 3) {
        fieldErrors.lessonName = 'Tên bài giảng hơi ngắn. Bạn nên nhập ít nhất 3 ký tự để hiển thị rõ ràng hơn.';
    } else if (existingLessons.some((lesson) => String(lesson?.lessonName || '').trim().toLowerCase() === normalizedName)) {
        fieldErrors.lessonName = 'Tên bài giảng này đã có trong chương. Bạn hãy đổi tên để người học không bị nhầm.';
    }

    if (fieldErrors.lessonCode) {
        summary = fieldErrors.lessonCode;
    } else if (fieldErrors.lessonName) {
        summary = fieldErrors.lessonName;
    }

    return {
        isValid: Object.keys(fieldErrors).length === 0,
        fieldErrors,
        summary,
    };
}

function normalizeDurationMinutes(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.round(parsed);
}

function getLessonDurationMinutes(source = {}) {
    return normalizeDurationMinutes(
        source?.timeLimitMinutes
        ?? source?.estimatedDurationMinutes
        ?? source?.durationMinutes
        ?? 0
    );
}

function formatDurationMinutes(minutes) {
    const normalized = normalizeDurationMinutes(minutes);
    if (!normalized) return 'Không giới hạn';
    if (normalized < 60) return `${normalized} phút`;
    const hours = Math.floor(normalized / 60);
    const remainingMinutes = normalized % 60;
    return remainingMinutes > 0 ? `${hours} giờ ${remainingMinutes} phút` : `${hours} giờ`;
}

// ===== ADD CHAPTER MODAL =====
function AddChapterModal({ open, onClose, onSubmit, loading }) {
    const [form, setForm] = useState({ chapterName: '', chapterCode: '', chapterDescription: '' });

    useEffect(() => {
        if (open) setForm({ chapterName: '', chapterCode: '', chapterDescription: '' });
    }, [open]);

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
                    {'Thêm chương mới'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Mã chương'} <span className="text-red-500">*</span></span>
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
                            <span className="label-text font-bold text-xs">{'Tên chương'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: Giới thiệu React"
                            value={form.chapterName}
                            onChange={e => setForm(f => ({ ...f, chapterName: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Mô tả (tùy chọn)'} </span>
                        </label>
                        <textarea
                            placeholder="Mô tả nội dung chương..."
                            value={form.chapterDescription}
                            onChange={e => setForm(f => ({ ...f, chapterDescription: e.target.value }))}
                            className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none"
                            rows={2}
                        />
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">{'Hủy'}</button>
                        <button
                            type="submit"
                            disabled={loading || !form.chapterName.trim() || !form.chapterCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {'Thêm chương'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

// ===== ADD LESSON MODAL =====
function AddLessonModal({ open, onClose, onSubmit, loading, chapterName, existingLessons = [], onValidationError }) {
    const [form, setForm] = useState({ lessonName: '', lessonCode: '', lessonType: 'video' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (open) {
            setForm({ lessonName: '', lessonCode: '', lessonType: 'video' });
            setFieldErrors({});
            setFormError('');
        }
    }, [open]);

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
                    {'Thêm bài giảng'}
                </h3>
                {chapterName && (
                    <p className="text-xs text-base-content/50 mt-1">
                        {'Vào chương:'} <span className="font-bold text-violet-600">{chapterName}</span>
                    </p>
                )}
                <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
                    {formError && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <div className="flex items-start gap-3">
                                <span className="text-lg leading-none">🦉</span>
                                <div>
                                    <p className="font-black">Cú cần bạn kiểm tra lại một chút</p>
                                    <p className="mt-1 leading-relaxed">{formError}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Mã bài giảng'} <span className="text-red-500">*</span></span>
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
                            <span className="label-text font-bold text-xs">{'Tên bài giảng'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: React là gì?"
                            value={form.lessonName}
                            onChange={e => updateField('lessonName', e.target.value)}
                            className={`input input-bordered input-sm rounded-xl w-full font-medium ${fieldErrors.lessonName ? 'border-red-400 focus:border-red-500' : ''}`}
                            autoFocus
                        />
                        {fieldErrors.lessonName && (
                            <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.lessonName}</p>
                        )}
                    </div>
                    {/* Lesson type selection */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'Loại bài giảng'}</span>
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
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">{'Hủy'}</button>
                        <button
                            type="submit"
                            disabled={loading || !form.lessonName.trim() || !form.lessonCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {'Thêm bài'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

function AddFlashcardCardModal({
    open,
    onClose,
    onSubmit,
    loading,
    setTitle,
    nextOrder,
    mode = 'create',
    initialCards = [],
}) {
    const normalizedInitialCards = initialCards.length > 0 ? initialCards : DEFAULT_FLASHCARD_DRAFTS;
    const nextDraftIdRef = useRef(normalizedInitialCards.length + 1);
    const [cards, setCards] = useState(() => normalizedInitialCards);
    const [uploadingSlots, setUploadingSlots] = useState({});
    const [formError, setFormError] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiCardCount, setAiCardCount] = useState(5);
    const [aiGenerating, setAiGenerating] = useState(false);
    const isEditMode = mode === 'edit';

    useEffect(() => {
        if (open) {
            nextDraftIdRef.current = normalizedInitialCards.length + 1;
            setCards(normalizedInitialCards);
            setUploadingSlots({});
            setFormError('');
            setAiCardCount(5);
            setAiPrompt(setTitle ? setTitle.replace(/\s*-\s*Flashcard\s*$/i, '').trim() : '');
        }
    }, [normalizedInitialCards, open, setTitle]);

    if (!open) return null;

    const isDraftEmpty = (card) => (
        !card.frontText.trim()
        && !card.backText.trim()
        && !card.frontImageUrl
        && !card.backImageUrl
    );

    const updateCard = (cardId, field, value) => {
        setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, [field]: value } : card)));
    };

    const addCard = () => {
        setCards((prev) => [...prev, createFlashcardDraft(nextDraftIdRef.current++)]);
    };

    const removeCard = (cardId) => {
        setCards((prev) => {
            if (prev.length === 1) {
                return [createFlashcardDraft(cardId)];
            }
            return prev.filter((card) => card.id !== cardId);
        });
    };

    const setSlotUploading = (cardId, side, isUploading) => {
        const key = `${cardId}-${side}`;
        setUploadingSlots((prev) => ({ ...prev, [key]: isUploading }));
    };

    const handleImageUpload = async (cardId, side, file) => {
        if (!file) return;

        if (!file.type?.startsWith('image/')) {
            setFormError('Chỉ hỗ trợ tệp ảnh cho flashcard.');
            return;
        }

        if (file.size > MAX_FLASHCARD_IMAGE_SIZE_BYTES) {
            setFormError('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
            return;
        }

        const imageField = side === 'front' ? 'frontImageUrl' : 'backImageUrl';

        setFormError('');
        setSlotUploading(cardId, side, true);
        try {
            const response = await uploadApi.uploadImage(file);
            const imageUrl = resolveFlashcardImageUrl(extractUploadedImageUrl(response));
            if (!imageUrl) {
                throw new Error('Cú chưa nhận được URL ảnh từ máy chủ.');
            }
            updateCard(cardId, imageField, imageUrl);
        } catch (error) {
            setFormError(error?.response?.data?.message || error?.message || 'Cú chưa tải được ảnh lên. Bạn thử lại nhé.');
        } finally {
            setSlotUploading(cardId, side, false);
        }
    };

    const clearCardImage = (cardId, side) => {
        const imageField = side === 'front' ? 'frontImageUrl' : 'backImageUrl';
        updateCard(cardId, imageField, '');
    };

    const buildPayload = () => {
        const halfFilled = cards.filter((card) => {
            const hasFront = card.frontText.trim() || card.frontImageUrl;
            const hasBack = card.backText.trim() || card.backImageUrl;
            return (hasFront || hasBack) && !(hasFront && hasBack);
        });

        if (halfFilled.length > 0) {
            setFormError('Mỗi thẻ cần đủ cả mặt trước và mặt sau. Bạn hãy điền đủ hoặc xóa dòng còn dang dở.');
            return null;
        }

        const validCards = cards
            .filter((card) => (card.frontText.trim() || card.frontImageUrl) && (card.backText.trim() || card.backImageUrl))
            .map((card, index) => ({
                ...(card.itemId ? { itemId: card.itemId } : {}),
                frontText: card.frontText.trim(),
                backText: card.backText.trim(),
                frontImageUrl: resolveFlashcardImageUrl(card.frontImageUrl) || null,
                backImageUrl: resolveFlashcardImageUrl(card.backImageUrl) || null,
                cardOrder: card.cardOrder ?? ((nextOrder ?? 0) + index),
            }));

        if (validCards.length === 0) {
            setFormError('Hãy nhập ít nhất một thẻ hoàn chỉnh trước khi lưu.');
            return null;
        }

        if (Object.values(uploadingSlots).some(Boolean)) {
            setFormError('Ảnh vẫn đang tải lên. Cú cần bạn chờ hoàn tất trước khi lưu.');
            return null;
        }

        setFormError('');
        return validCards;
    };

    const handleGenerateWithAI = async () => {
        const trimmedPrompt = aiPrompt.trim();
        const fallbackPrompt = setTitle ? setTitle.replace(/\s*-\s*Flashcard\s*$/i, '').trim() : '';
        const sourceText = trimmedPrompt || fallbackPrompt;

        if (!sourceText) {
            setFormError('Hay nhap chu de, doan ghi chu hoac dan noi dung bai hoc de Gemini tao flashcard.');
            return;
        }

        if (Object.values(uploadingSlots).some(Boolean)) {
            setFormError('Anh van dang tai len. Hay doi xong roi moi dung Gemini de tranh lech du lieu.');
            return;
        }

        setAiGenerating(true);
        setFormError('');
        try {
            const generatedCards = await geminiApi.generateFlashcards({
                sourceText,
                count: aiCardCount,
                contextTitle: setTitle || '',
            });

            setCards((prev) => {
                let nextId = nextDraftIdRef.current;
                const shouldReplaceInitialBlank = prev.length === 1 && isDraftEmpty(prev[0]);
                const generatedDrafts = generatedCards.map((card, index) => ({
                    id: shouldReplaceInitialBlank && index === 0 ? prev[0].id : nextId++,
                    frontText: card.frontText,
                    backText: card.backText,
                    frontImageUrl: '',
                    backImageUrl: '',
                }));

                nextDraftIdRef.current = nextId;
                return shouldReplaceInitialBlank ? generatedDrafts : [...prev, ...generatedDrafts];
            });
        } catch (error) {
            setFormError(error?.message || 'Gemini chua tao duoc noi dung flashcard. Ban thu lai voi mo ta cu the hon.');
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = buildPayload();
        if (!payload) return;
        onSubmit(payload, { keepOpen: false });
    };

    const handleSubmitAndContinue = () => {
        const payload = buildPayload();
        if (!payload) return;
        onSubmit(payload, { keepOpen: true });
        nextDraftIdRef.current = 2;
        setCards([createFlashcardDraft(1)]);
        setUploadingSlots({});
        setFormError('');
    };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-box max-w-5xl rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/40 shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-black text-xl text-base-content">{isEditMode ? 'Chinh sua the flashcard' : 'Them the flashcard'}</h3>
                        <p className="mt-1 text-sm text-base-content/55">
                            {isEditMode
                                ? 'Cap nhat lai noi dung mat truoc, mat sau va hinh anh cua the nay.'
                                : 'Nhap nhanh mat truoc va mat sau de tao nhieu the lien tiep cho bai hoc.'}
                        </p>
                        {setTitle && (
                            <p className="mt-2 text-xs text-base-content/50">
                                Bo: <span className="font-bold text-indigo-600">{setTitle}</span>
                            </p>
                        )}
                    </div>
                    </div>
                    {!isEditMode && (
                        <button
                            type="button"
                            onClick={addCard}
                            className="btn btn-sm rounded-xl border-indigo-200 bg-white font-bold text-indigo-600 hover:bg-indigo-50"
                        >
                            <Plus className="w-4 h-4" />
                            Them the
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {!isEditMode && (
                        <div className="rounded-[28px] border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-violet-50/60 to-white p-4 shadow-sm">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-base-content">Tao noi dung bang Gemini</p>
                                    <p className="mt-1 text-xs text-base-content/55">
                                        Dan chu de, doan ghi chu hoac noi dung bai hoc. Gemini se tao bo the tieng Viet de ban chinh sua va luu ngay trong modal nay.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 self-start">
                                    <label className="text-xs font-bold text-base-content/55">So the</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={aiCardCount}
                                        onChange={(e) => setAiCardCount(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                                        className="input input-sm w-20 rounded-xl border-indigo-200 bg-white font-bold text-indigo-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGenerateWithAI}
                                        disabled={aiGenerating}
                                        className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-white shadow-lg shadow-indigo-500/20"
                                    >
                                        {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        {aiGenerating ? 'Dang tao...' : 'Tao bang Gemini'}
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="VD: Tao 5 the flashcard ve JSX trong React, tap trung vao khai niem, cu phap va khi nao nen dung..."
                                className="textarea textarea-bordered mt-4 min-h-[120px] w-full rounded-2xl border-indigo-100 bg-white/90 text-sm font-medium resize-none focus:border-indigo-300 focus:outline-none"
                                rows={4}
                            />
                            <p className="mt-2 text-[11px] font-medium text-base-content/45">
                                Neu ben duoi da co the nhap tay, ket qua moi se duoc them tiep vao cuoi danh sach thay vi ghi de.
                            </p>
                        </div>
                    )}
                    <div className="max-h-[62vh] space-y-4 overflow-y-auto pr-1">
                        {cards.map((card, index) => (
                            <div key={card.id} className="rounded-[28px] border border-base-300/80 bg-white/95 p-4 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        The {index + 1}
                                    </div>
                                    {!isEditMode && (
                                        <button
                                            type="button"
                                            onClick={() => removeCard(card.id)}
                                            className="btn btn-ghost btn-xs rounded-full text-base-content/50 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid gap-4 xl:grid-cols-2">
                                    <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-indigo-500">
                                            Mặt trước <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={card.frontText}
                                            onChange={(e) => updateCard(card.id, 'frontText', e.target.value)}
                                            placeholder="VD: React Hook la gi?"
                                            className="textarea textarea-bordered min-h-[150px] w-full rounded-2xl border-indigo-100 bg-indigo-50/30 text-sm font-medium resize-none focus:border-indigo-300 focus:outline-none"
                                            rows={6}
                                            autoFocus={index === 0}
                                        />
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <label className="btn btn-sm rounded-xl border-indigo-200 bg-white font-bold text-indigo-600 hover:bg-indigo-50">
                                                <Upload className="w-4 h-4" />
                                                Tải ảnh mặt trước
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        handleImageUpload(card.id, 'front', file);
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>
                                            {uploadingSlots[`${card.id}-front`] && (
                                                <span className="inline-flex items-center gap-1 text-xs text-base-content/50">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    Cú đang tải ảnh...
                                                </span>
                                            )}
                                            {card.frontImageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => clearCardImage(card.id, 'front')}
                                                    className="btn btn-ghost btn-xs rounded-full text-red-500"
                                                >
                                                    Xóa ảnh
                                                </button>
                                            )}
                                        </div>
                                        {card.frontImageUrl && (
                                            <img
                                                src={resolveFlashcardImageUrl(card.frontImageUrl)}
                                                alt={`Front preview ${index + 1}`}
                                                className="mt-3 max-h-72 w-full rounded-2xl border border-base-300 bg-base-200/40 object-contain object-center"
                                            />
                                        )}
                                    </div>
                                    <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-violet-500">
                                            Mặt sau <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={card.backText}
                                            onChange={(e) => updateCard(card.id, 'backText', e.target.value)}
                                            placeholder="Giải thích ngắn gọn, ghi nhớ chính hoặc đáp án..."
                                            className="textarea textarea-bordered min-h-[150px] w-full rounded-2xl border-violet-100 bg-violet-50/30 text-sm font-medium resize-none focus:border-violet-300 focus:outline-none"
                                            rows={6}
                                        />
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <label className="btn btn-sm rounded-xl border-violet-200 bg-white font-bold text-violet-600 hover:bg-violet-50">
                                                <Upload className="w-4 h-4" />
                                                Tải ảnh mặt sau
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        handleImageUpload(card.id, 'back', file);
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>
                                            {uploadingSlots[`${card.id}-back`] && (
                                                <span className="inline-flex items-center gap-1 text-xs text-base-content/50">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    Cú đang tải ảnh...
                                                </span>
                                            )}
                                            {card.backImageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => clearCardImage(card.id, 'back')}
                                                    className="btn btn-ghost btn-xs rounded-full text-red-500"
                                                >
                                                    Xóa ảnh
                                                </button>
                                            )}
                                        </div>
                                        {card.backImageUrl && (
                                            <img
                                                src={resolveFlashcardImageUrl(card.backImageUrl)}
                                                alt={`Back preview ${index + 1}`}
                                                className="mt-3 max-h-72 w-full rounded-2xl border border-base-300 bg-base-200/40 object-contain object-center"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {formError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {formError}
                        </div>
                    )}
                    <div className="modal-action items-center justify-between">
                        <div className="text-xs text-base-content/45">
                            {isEditMode
                                ? 'Cập nhật trực tiếp thẻ đang chọn trong bộ flashcard'
                                : nextOrder != null
                                    ? `Thẻ tiếp theo: ${nextOrder + 1}`
                                    : 'Bạn có thể thêm nhiều thẻ liên tiếp'}
                        </div>
                        <div className="flex items-center gap-2">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">Hủy</button>
                        {!isEditMode && (
                            <button
                                type="button"
                                onClick={handleSubmitAndContinue}
                                disabled={loading}
                                className="btn btn-sm rounded-xl border-indigo-200 bg-white font-bold text-indigo-600 hover:bg-indigo-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Lưu và thêm tiếp
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditMode ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {isEditMode ? 'Lưu thay đổi' : 'Lưu các thẻ'}
                        </button>
                        </div>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

function OwlConfirmDialog({ dialog, onCancel, onConfirm }) {
    if (!dialog) return null;

    const toneStyles = dialog.tone === 'danger'
        ? {
            chip: 'bg-red-500/10 text-red-600 ring-red-500/20',
            button: 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
            accent: 'from-amber-100 via-orange-50 to-red-100',
        }
        : {
            chip: 'bg-violet-500/10 text-violet-600 ring-violet-500/20',
            button: 'from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700',
            accent: 'from-violet-100 via-fuchsia-50 to-blue-100',
        };

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 140 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="modal-box max-w-lg overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 p-0 shadow-2xl"
            >
                <div className={`h-1 w-full bg-gradient-to-r ${toneStyles.button}`} />
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${toneStyles.accent} shadow-lg ring-1 ring-base-300`}>
                            <span className="text-3xl leading-none">🦉</span>
                            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-base-100 shadow-md ring-1 ring-base-200">
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ring-1 ${toneStyles.chip}`}>
                                {dialog.badge || 'Cú nhắc bạn xác nhận'}
                            </span>
                            <h3 className="mt-3 text-xl font-black leading-tight text-base-content">
                                {dialog.title}
                            </h3>
                            {dialog.description && (
                                <p className="mt-2 text-sm leading-relaxed text-base-content/65">
                                    {dialog.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {dialog.hint && (
                        <div className="mt-5 rounded-2xl border border-base-300 bg-base-200/60 px-4 py-3 text-sm text-base-content/55">
                            {dialog.hint}
                        </div>
                    )}

                    <div className="modal-action mt-6 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-bold text-base-content/70 hover:bg-base-200"
                        >
                            {dialog.cancelLabel || 'Giữ lại'}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`btn btn-sm border-none rounded-xl bg-gradient-to-r font-bold text-white shadow-lg ${toneStyles.button}`}
                        >
                            {dialog.confirmLabel || 'Xác nhận'}
                        </button>
                    </div>
                </div>
            </motion.div>
            <div className="modal-backdrop bg-black/50 backdrop-blur-sm" onClick={onCancel} />
        </div>
    );
}

// ===== MAIN COMPONENT =====
export default function ExpertCurriculumDetail() {
    const { courseId } = useParams();

    // Data states
    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    // UI states
    const [expandedChapters, setExpandedChapters] = useState(new Set());
    const [editingTitle, setEditingTitle] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showAddChapter, setShowAddChapter] = useState(false);
    const [showAddLesson, setShowAddLesson] = useState(null); // chapterId or null
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);

    // Lesson content states
    const [selectedLesson, setSelectedLesson] = useState(null); // {chapterId, lessonId}
    const [lessonContent, setLessonContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [showAddVideo, setShowAddVideo] = useState(null); // {chapterId, lessonId}
    const [showAddDocument, setShowAddDocument] = useState(null);
    const [showAddQuestion, setShowAddQuestion] = useState(null);
    const [showAssignmentBuilder, setShowAssignmentBuilder] = useState(null);
    const [showAddFlashcardCard, setShowAddFlashcardCard] = useState(null);
    const [lessonTypeOverrides, setLessonTypeOverrides] = useState({});
    const [quizTimeLimitDraft, setQuizTimeLimitDraft] = useState('');

    // Preview states
    const [previewVideo, setPreviewVideo] = useState(null);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewQuestion, setPreviewQuestion] = useState(null);
    const toastTimeoutRef = useRef(null);
    const confirmResolverRef = useRef(null);

    // ===== TOAST HELPER =====
    const showToast = useCallback((payload, type = 'success') => {
        const toastPayload = typeof payload === 'string'
            ? { message: payload, type }
            : { ...payload, type: payload?.type || type };
        const resolvedType = toastPayload.type || type;
        const resolvedTitle = toastPayload.title || (
            resolvedType === 'error'
                ? 'Cú chưa xử lý được thao tác này'
                : 'Cú đã cập nhật giáo trình'
        );

        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        setToast({
            ...toastPayload,
            type: resolvedType,
            title: resolvedTitle,
            message: toastPayload.message || '',
        });

        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
            toastTimeoutRef.current = null;
        }, 4200);
    }, []);

    const dismissToast = useCallback(() => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = null;
        }
        setToast(null);
    }, []);

    const requestConfirmation = useCallback((options) => (
        new Promise((resolve) => {
            confirmResolverRef.current = resolve;
            setConfirmDialog({
                tone: 'danger',
                cancelLabel: 'Giữ lại',
                confirmLabel: 'Xác nhận',
                hint: 'Thay đổi này sẽ áp dụng ngay lên giáo trình bạn đang biên soạn.',
                ...options,
            });
        })
    ), []);

    const resolveConfirmation = useCallback((result) => {
        setConfirmDialog(null);
        if (confirmResolverRef.current) {
            confirmResolverRef.current(result);
            confirmResolverRef.current = null;
        }
    }, []);

    useEffect(() => () => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        if (confirmResolverRef.current) {
            confirmResolverRef.current(false);
            confirmResolverRef.current = null;
        }
    }, []);

    const getLessonById = useCallback((chapterId, lessonId) => (
        (chapters.find((chapter) => (chapter.chapterId || chapter.id) === chapterId)?.lessons || [])
            .find((lesson) => (lesson.lessonId || lesson.id) === lessonId)
        || null
    ), [chapters]);

    const getResolvedLessonType = useCallback((lesson, content = null) => {
        const lessonId = lesson?.lessonId || lesson?.id || null;
        const overrideType = lessonId ? lessonTypeOverrides[lessonId] : null;
        if (overrideType && lessonTypeConfig[overrideType]) {
            return overrideType;
        }

        if (getLessonFlashcardSets(content).length > 0) {
            return 'flashcard';
        }

        if (Number(lesson?.totalFlashcardSets || 0) > 0 || lesson?.hasFlashcardSet) {
            return 'flashcard';
        }

        if (content?.assignment?.assignmentId || content?.assignment?.title || lesson?.hasAssignment) {
            return 'assignment';
        }

        const explicitType = String(lesson?.lessonType || lesson?.type || '').trim().toLowerCase();
        if (lessonTypeConfig[explicitType]) {
            return explicitType;
        }

        return 'video';
    }, [lessonTypeOverrides]);

    useEffect(() => {
        if (!selectedLesson) {
            setQuizTimeLimitDraft('');
            return;
        }

        const selectedLessonMeta = getLessonById(selectedLesson.chapterId, selectedLesson.lessonId);
        if (!selectedLessonMeta || getResolvedLessonType(selectedLessonMeta, lessonContent) !== 'quiz') {
            setQuizTimeLimitDraft('');
            return;
        }

        const durationMinutes = getLessonDurationMinutes({
            ...selectedLessonMeta,
            ...lessonContent,
        });
        setQuizTimeLimitDraft(durationMinutes > 0 ? String(durationMinutes) : '');
    }, [
        getLessonById,
        getResolvedLessonType,
        lessonContent,
        selectedLesson,
    ]);

    const hydrateAssignmentLessonState = useCallback((inputChapters = []) => {
        const detectedOverrides = {};

        const nextChapters = (Array.isArray(inputChapters) ? inputChapters : []).map((chapter) => {
            const chapterId = chapter?.chapterId || chapter?.id;

            return {
                ...chapter,
                lessons: (chapter?.lessons || []).map((lesson) => {
                    const lessonId = lesson?.lessonId || lesson?.id;
                    const explicitType = String(lesson?.lessonType || lesson?.type || '').trim().toLowerCase();
                    const localAssignment = chapterId && lessonId
                        ? assignmentApi.peekLessonAssignment(courseId, chapterId, lessonId)
                        : null;
                    const hasAssignment = explicitType === 'assignment'
                        || Boolean(lesson?.hasAssignment)
                        || Boolean(localAssignment?.assignmentId || localAssignment?.title);

                    if (hasAssignment && lessonId) {
                        detectedOverrides[lessonId] = 'assignment';
                    }

                    return {
                        ...lesson,
                        hasAssignment,
                    };
                }),
            };
        });

        if (Object.keys(detectedOverrides).length > 0) {
            setLessonTypeOverrides((prev) => ({ ...prev, ...detectedOverrides }));
        }

        return nextChapters;
    }, [courseId]);

    // ===== FETCH DATA =====
    const fetchCourseData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const courseRes = await courseApi.getById(courseId);
            const courseData = courseRes?.data || courseRes;
            setCourse(courseData);

            // Course detail endpoint may return chapters nested
            const chaptersFromCourse = courseData?.chapters || [];
            if (chaptersFromCourse.length > 0) {
                const hydratedChapters = hydrateAssignmentLessonState(chaptersFromCourse);
                setChapters(hydratedChapters);
                // Auto-expand first chapter
                setExpandedChapters(new Set([hydratedChapters[0]?.chapterId || hydratedChapters[0]?.id]));
            } else {
                // Fallback: fetch chapters separately
                try {
                    const chapRes = await courseApi.getChapters(courseId);
                    const chapData = chapRes?.data || chapRes || [];
                    const chapArray = Array.isArray(chapData) ? chapData : chapData?.chapters || [];
                    const hydratedChapters = hydrateAssignmentLessonState(chapArray);
                    setChapters(hydratedChapters);
                    if (hydratedChapters.length > 0) {
                        setExpandedChapters(new Set([hydratedChapters[0]?.chapterId || hydratedChapters[0]?.id]));
                    }
                } catch {
                    setChapters([]);
                }
            }
        } catch (err) {
            console.error('[CurriculumDetail] fetch error:', err);
            setError(err.response?.data?.message || 'Không thể tải thông tin khóa học.');
        } finally {
            setLoading(false);
        }
    }, [courseId, hydrateAssignmentLessonState]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    // ===== TOGGLE CHAPTER =====
    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            next.has(chapterId) ? next.delete(chapterId) : next.add(chapterId);
            return next;
        });
    };

    // ===== ADD CHAPTER =====
    const handleAddChapter = async (form) => {
        setSaving(true);
        try {
            const payload = {
                chapterCode: form.chapterCode,
                chapterName: form.chapterName,
                chapterDescription: form.chapterDescription || undefined,
                displayOrder: chapters.length,
            };
            await courseApi.createChapter(courseId, payload);
            showToast({
                title: 'Đã thêm chương mới',
                message: `Chương "${form.chapterName}" đã sẵn sàng để bạn thêm bài giảng.`,
            });
            setShowAddChapter(false);
            await fetchCourseData();
        } catch (err) {
            showToast({
                title: 'Chưa thể thêm chương',
                message: err.response?.data?.message || 'Cú chưa tạo được chương mới. Bạn thử lại sau ít phút nhé.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== DELETE CHAPTER =====
    const handleDeleteChapter = async (chapter) => {
        const chId = chapter.chapterId || chapter.id;
        const confirmed = await requestConfirmation({
            badge: 'Xóa chương',
            title: `Xóa chương "${chapter.chapterName}"?`,
            description: 'Cú nhắc trước: toàn bộ bài giảng nằm trong chương này cũng sẽ được gỡ khỏi giáo trình.',
            confirmLabel: 'Xóa chương',
            cancelLabel: 'Giữ chương này',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            await courseApi.deleteChapter(courseId, chId);
            showToast({
                title: 'Đã xóa chương',
                message: `Chương "${chapter.chapterName}" đã được gỡ khỏi giáo trình.`,
            });
            setChapters(prev => prev.filter(c => (c.chapterId || c.id) !== chId));
        } catch (err) {
            showToast({
                title: 'Chưa thể xóa chương',
                message: err.response?.data?.message || 'Cú chưa gỡ được chương này. Bạn thử lại sau nhé.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== ADD LESSON =====
    const createFlashcardSetForLesson = useCallback(async ({ lessonId, lessonName }) => {
        const response = await flashcardApi.createSet({
            setTitle: `${lessonName} - Flashcard`,
            setDescription: `Bộ flashcard cho bài giảng "${lessonName}"`,
            lessonId,
            courseId,
            visibility: 'premium_only',
            status: 'active',
            tags: ['lesson-flashcard'],
        });

        const payload = response?.data?.data || response?.data || response;
        return payload?.flashcardSetId || payload?.id || null;
    }, [courseId]);

    const handleAddLesson = async (form) => {
        const chapterId = showAddLesson;
        const existingLessons = getChapterLessons(chapterId);
        const validation = validateLessonForm(form, existingLessons);
        if (!validation.isValid) {
            showToast({
                title: 'Cú chưa thể tạo bài giảng',
                message: validation.summary,
            }, 'error');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                lessonCode: form.lessonCode,
                lessonName: form.lessonName,
                lessonDescription: '',
                displayOrder: getChapterLessons(chapterId).length,
                lessonType: form.lessonType,
            };

            const response = await courseApi.createLesson(courseId, chapterId, payload);
            const createdLesson = response?.data || response;
            const createdLessonId = createdLesson?.lessonId || createdLesson?.id || null;
            const shouldCreateFlashcardSet = form.lessonType === 'flashcard' && Boolean(createdLessonId);
            const shouldOpenLessonBuilder = Boolean(createdLessonId) && (
                form.lessonType === 'flashcard'
                || form.lessonType === 'quiz'
                || form.lessonType === 'assignment'
            );
            const optimisticLesson = {
                ...createdLesson,
                lessonId: createdLessonId,
                lessonCode: form.lessonCode,
                lessonName: form.lessonName,
                lessonType: form.lessonType,
                type: form.lessonType,
                totalFlashcardSets: shouldCreateFlashcardSet ? 1 : (createdLesson?.totalFlashcardSets || 0),
                hasFlashcardSet: shouldCreateFlashcardSet ? true : Boolean(createdLesson?.hasFlashcardSet),
                hasAssignment: form.lessonType === 'assignment' ? true : Boolean(createdLesson?.hasAssignment),
            };

            if (createdLessonId) {
                if (form.lessonType === 'assignment') {
                    try {
                        await courseApi.updateLesson(courseId, chapterId, createdLessonId, {
                            lessonType: 'assignment',
                        });
                    } catch {
                        // Some backends still reject the new enum; keep the frontend override path active.
                    }
                }
                setLessonTypeOverrides((prev) => ({ ...prev, [createdLessonId]: form.lessonType }));
                setChapters((prev) => prev.map((chapter) => {
                    const currentChapterId = chapter.chapterId || chapter.id;
                    if (currentChapterId !== chapterId) return chapter;

                    const existingLessons = chapter.lessons || [];
                    const lessonExists = existingLessons.some((lesson) => (lesson.lessonId || lesson.id) === createdLessonId);
                    return {
                        ...chapter,
                        lessons: lessonExists ? existingLessons : [...existingLessons, optimisticLesson],
                    };
                }));
            }

            if (shouldCreateFlashcardSet) {
                try {
                    await createFlashcardSetForLesson({
                        chapterId,
                        lessonId: createdLessonId,
                        lessonName: form.lessonName,
                    });
                    showToast({
                        title: 'Đã thêm bài giảng mới',
                        message: `Bài "${form.lessonName}" đã được tạo kèm một bộ flashcard.`,
                    });
                } catch (flashcardErr) {
                    showToast({
                        title: 'Bài giảng đã được tạo',
                        message: flashcardErr.response?.data?.message
                            || 'Cú đã tạo bài giảng nhưng chưa dựng được bộ flashcard tự động. Bạn có thể thêm lại sau.',
                    }, 'error');
                }
            } else if (form.lessonType === 'quiz') {
                showToast({
                    title: 'Đã tạo bài kiểm tra mới',
                    message: `Bài "${form.lessonName}" đã sẵn sàng để bạn thêm câu hỏi.`,
                });
            } else {
                showToast({
                    title: 'Đã thêm bài giảng mới',
                    message: `Bài "${form.lessonName}" đã xuất hiện trong chương trình học.`,
                });
            }

            setShowAddLesson(null);
            await fetchCourseData();

            if (shouldOpenLessonBuilder) {
                await loadLessonContent(chapterId, createdLessonId, optimisticLesson);
            }

            if (form.lessonType === 'quiz' && createdLessonId) {
                setShowAddQuestion({ chapterId, lessonId: createdLessonId });
            }
            if (form.lessonType === 'assignment' && createdLessonId) {
                setShowAssignmentBuilder({
                    chapterId,
                    lessonId: createdLessonId,
                    lessonName: form.lessonName,
                    initialValue: null,
                });
            }
        } catch (err) {
            showToast({
                title: 'Chưa thể thêm bài giảng',
                message: err.response?.data?.message || 'Cú chưa tạo được bài giảng mới. Bạn thử lại sau ít phút nhé.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== DELETE LESSON =====
    const handleDeleteLesson = async (chapterId, lesson) => {
        const lsId = lesson.lessonId || lesson.id;
        const confirmed = await requestConfirmation({
            badge: 'Xóa bài giảng',
            title: `Xóa bài "${lesson.lessonName}"?`,
            description: 'Bài giảng này sẽ bị gỡ khỏi chương hiện tại. Nếu cần, bạn sẽ phải tạo lại từ đầu.',
            confirmLabel: 'Xóa bài giảng',
            cancelLabel: 'Giữ bài này',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            await courseApi.deleteLesson(courseId, chapterId, lsId);
            showToast({
                title: 'Đã xóa bài giảng',
                message: `Bài "${lesson.lessonName}" đã được gỡ khỏi chương trình học.`,
            });
            setLessonTypeOverrides((prev) => {
                if (!prev[lsId]) return prev;
                const next = { ...prev };
                delete next[lsId];
                return next;
            });
            setChapters(prev => prev.map(ch => {
                const chId = ch.chapterId || ch.id;
                if (chId !== chapterId) return ch;
                return {
                    ...ch,
                    lessons: (ch.lessons || []).filter(l => (l.lessonId || l.id) !== lsId),
                };
            }));
            if (selectedLesson?.chapterId === chapterId && selectedLesson?.lessonId === lsId) {
                setSelectedLesson(null);
                setLessonContent(null);
            }
        } catch (err) {
            showToast({
                title: 'Chưa thể xóa bài giảng',
                message: err.response?.data?.message || 'Cú chưa gỡ được bài này. Bạn thử lại thêm lần nữa nhé.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== EDIT TITLE (CHAPTER/LESSON) =====
    const startEdit = (id, currentTitle) => {
        setEditingTitle(id);
        setEditValue(currentTitle);
    };

    const saveChapterTitle = async (chapter) => {
        if (!editValue.trim()) return;
        const chId = chapter.chapterId || chapter.id;
        setSaving(true);
        try {
            await courseApi.updateChapter(courseId, chId, { chapterName: editValue.trim() });
            setChapters(prev => prev.map(ch =>
                (ch.chapterId || ch.id) === chId ? { ...ch, chapterName: editValue.trim() } : ch
            ));
            showToast({
                title: 'Đã đổi tên chương',
                message: 'Tên chương đã được cập nhật theo nội dung mới.',
            });
        } catch (err) {
            showToast({
                title: 'Chưa thể đổi tên chương',
                message: err.response?.data?.message || 'Cú chưa lưu được tên chương mới. Bạn thử lại nhé.',
            }, 'error');
        } finally {
            setSaving(false);
            setEditingTitle(null);
            setEditValue('');
        }
    };

    const saveLessonTitle = async (chapterId, lesson) => {
        if (!editValue.trim()) return;
        const lsId = lesson.lessonId || lesson.id;
        setSaving(true);
        try {
            await courseApi.updateLesson(courseId, chapterId, lsId, { lessonName: editValue.trim() });
            setChapters(prev => prev.map(ch => {
                if ((ch.chapterId || ch.id) !== chapterId) return ch;
                return {
                    ...ch,
                    lessons: (ch.lessons || []).map(l =>
                        (l.lessonId || l.id) === lsId ? { ...l, lessonName: editValue.trim() } : l
                    ),
                };
            }));
            showToast({
                title: 'Đã đổi tên bài giảng',
                message: 'Tên bài giảng mới đã được lưu vào chương trình học.',
            });
        } catch (err) {
            showToast({
                title: 'Chưa thể đổi tên bài giảng',
                message: err.response?.data?.message || 'Cú chưa lưu được tên bài giảng mới. Bạn thử lại nhé.',
            }, 'error');
        } finally {
            setSaving(false);
            setEditingTitle(null);
            setEditValue('');
        }
    };

    // ===== HELPERS =====
    const getChapterLessons = (chapterId) => {
        const ch = chapters.find(c => (c.chapterId || c.id) === chapterId);
        return ch?.lessons || [];
    };

    const getChapterName = (chapterId) => {
        const ch = chapters.find(c => (c.chapterId || c.id) === chapterId);
        return ch?.chapterName || '';
    };

    const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);

    const hydrateLessonFlashcardSets = useCallback(async (sets = []) => {
        if (!Array.isArray(sets) || sets.length === 0) {
            return [];
        }

        const hydratedSets = await Promise.all(sets.map(async (set) => {
            const existingItems = getFlashcardSetItems(set);
            if (existingItems.length > 0) {
                return {
                    ...set,
                    items: existingItems,
                };
            }

            const setId = set?.flashcardSetId || set?.id;
            if (!setId) {
                return {
                    ...set,
                    items: existingItems,
                };
            }

            try {
                const detailResponse = await flashcardApi.getSetById(setId);
                const detailPayload = detailResponse?.data || detailResponse || {};
                const detailItems = getFlashcardSetItems(detailPayload);

                return {
                    ...set,
                    ...detailPayload,
                    items: detailItems,
                };
            } catch (err) {
                console.error('Failed to hydrate flashcard set details:', err);
                return {
                    ...set,
                    items: existingItems,
                };
            }
        }));

        return hydratedSets;
    }, []);

    const handleCreateLessonFlashcardSet = async (chapterId, lesson) => {
        const lessonId = lesson?.lessonId || lesson?.id;
        if (!lessonId) {
            return;
        }

        try {
            await createFlashcardSetForLesson({
                chapterId,
                lessonId,
                lessonName: lesson?.lessonName || lesson?.title || 'Bài học',
            });
            showToast({
                title: 'Đã tạo bộ flashcard',
                message: 'Bài giảng này đã có bộ flashcard để bạn tiếp tục biên soạn.',
            });
            setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'flashcard' }));
            await loadLessonContent(chapterId, lessonId, {
                ...lesson,
                lessonType: 'flashcard',
                type: 'flashcard',
            });
            await fetchCourseData();
        } catch (err) {
            showToast({
                title: 'Chưa thể tạo bộ flashcard',
                message: err.response?.data?.message || 'Cú chưa dựng được bộ flashcard cho bài giảng này.',
            }, 'error');
        }
    };

    // ===== LESSON CONTENT HANDLERS =====
    const loadLessonContent = async (chapterId, lessonId, lesson = null) => {
        const lessonMeta = lesson || getLessonById(chapterId, lessonId);
        const resolvedLessonType = getResolvedLessonType(lessonMeta);

        setSelectedLesson({ chapterId, lessonId });
        setLoadingContent(true);
        try {
            const res = await courseApi.getLessonContent(courseId, chapterId, lessonId);
            const content = res?.data || res;
            const flashcardSets = await hydrateLessonFlashcardSets(getLessonFlashcardSets(content));
            const assignment = resolvedLessonType === 'assignment'
                ? await assignmentApi.getLessonAssignment(courseId, chapterId, lessonId)
                : null;
            const durationMinutes = getLessonDurationMinutes(content) || getLessonDurationMinutes(lessonMeta);

            if (resolvedLessonType === 'flashcard' || flashcardSets.length > 0) {
                setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'flashcard' }));
            }
            if (assignment?.assignmentId || assignment?.title) {
                setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'assignment' }));
            }

            setLessonContent({
                ...content,
                estimatedDurationMinutes: durationMinutes,
                timeLimitMinutes: durationMinutes,
                flashcardSets,
                assignment,
                lessonType: flashcardSets.length > 0 ? 'flashcard' : (assignment ? 'assignment' : resolvedLessonType),
            });
        } catch {
            const fallbackDurationMinutes = getLessonDurationMinutes(lessonMeta);
            const assignment = resolvedLessonType === 'assignment'
                ? await assignmentApi.getLessonAssignment(courseId, chapterId, lessonId)
                : null;
            setLessonContent({
                lessonType: assignment ? 'assignment' : resolvedLessonType,
                estimatedDurationMinutes: fallbackDurationMinutes,
                timeLimitMinutes: fallbackDurationMinutes,
                videos: [],
                documents: [],
                questions: [],
                flashcardSets: [],
                assignment,
            });
        } finally {
            setLoadingContent(false);
        }
    };

    const toggleLessonContent = async (chapterId, lessonId, lesson = null) => {
        const key = `${chapterId}-${lessonId}`;
        const currentKey = selectedLesson ? `${selectedLesson.chapterId}-${selectedLesson.lessonId}` : null;
        if (currentKey === key) {
            setSelectedLesson(null);
            setLessonContent(null);
            return;
        }

        await loadLessonContent(chapterId, lessonId, lesson);
    };

    const appendCreatedQuestionsToState = useCallback((chapterId, lessonId, createdQuestions = []) => {
        if (!Array.isArray(createdQuestions) || createdQuestions.length === 0) {
            return;
        }

        setChapters((prev) => prev.map((chapter) => {
            if ((chapter.chapterId || chapter.id) !== chapterId) {
                return chapter;
            }

            return {
                ...chapter,
                lessons: (chapter.lessons || []).map((lesson) => {
                    if ((lesson.lessonId || lesson.id) !== lessonId) {
                        return lesson;
                    }

                    const currentTotalQuestions = Number(lesson.totalQuestions ?? 0);
                    return {
                        ...lesson,
                        totalQuestions: currentTotalQuestions + createdQuestions.length,
                    };
                }),
            };
        }));

        setLessonContent((prev) => {
            if (!prev || selectedLesson?.chapterId !== chapterId || selectedLesson?.lessonId !== lessonId) {
                return prev;
            }

            const existingQuestions = Array.isArray(prev.questions) ? prev.questions : [];
            const currentTotalQuestions = Number(prev.totalQuestions ?? existingQuestions.length);

            return {
                ...prev,
                totalQuestions: currentTotalQuestions + createdQuestions.length,
                questions: [...createdQuestions.slice().reverse(), ...existingQuestions],
            };
        });
    }, [selectedLesson]);

    const handleAddVideo = async (form) => {
        const { chapterId, lessonId } = showAddVideo;
        setSaving(true);
        try {
            await courseApi.addVideo(courseId, chapterId, lessonId, form);
            showToast({
                title: 'Đã thêm video',
                message: 'Video mới đã được gắn vào bài giảng.',
            });
            setShowAddVideo(null);
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chưa thể thêm video',
                message: err.response?.data?.message || 'Cú chưa thêm được video vào bài giảng.',
            }, 'error');
        }
        finally { setSaving(false); }
    };

    const handleDeleteVideo = async (chapterId, lessonId, videoId) => {
        const confirmed = await requestConfirmation({
            badge: 'Xóa video',
            title: 'Xóa video này?',
            description: 'Video sẽ biến mất khỏi bài giảng hiện tại và học viên sẽ không còn xem được nội dung này.',
            confirmLabel: 'Xóa video',
            cancelLabel: 'Giữ video',
        });
        if (!confirmed) return;
        setSaving(true);
        try {
            await courseApi.deleteVideo(courseId, chapterId, lessonId, videoId);
            showToast({
                title: 'Đã xóa video',
                message: 'Video đã được gỡ khỏi bài giảng.',
            });
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chưa thể xóa video',
                message: err.response?.data?.message || 'Cú chưa gỡ được video này khỏi bài giảng.',
            }, 'error');
        }
        finally { setSaving(false); }
    };

    const handleAddDocument = async (form) => {
        const { chapterId, lessonId } = showAddDocument;

        const documentTitle = form.documentTitle?.trim();
        const fileUrl = form.fileUrl?.trim();
        const hasFile = form.file instanceof File;

        if (!documentTitle) {
            showToast({
                title: 'Thiếu tiêu đề tài liệu',
                message: 'Cú cần tên tài liệu trước khi thêm vào bài giảng.',
            }, 'error');
            return;
        }

        if (!hasFile && !fileUrl) {
            showToast({
                title: 'Thiếu nguồn tài liệu',
                message: 'Bạn hãy chọn file tải lên hoặc dán URL tài liệu để cú tiếp tục.',
            }, 'error');
            return;
        }

        setSaving(true);
        try {
            if (hasFile) {
                const payload = new FormData();
                payload.append('documentTitle', documentTitle);
                payload.append('file', form.file);
                payload.append('fileName', form.fileName || form.file.name);
                payload.append('fileType', form.fileType || 'pdf');
                if (form.documentDescription?.trim()) {
                    payload.append('documentDescription', form.documentDescription.trim());
                }
                await courseApi.addDocument(courseId, chapterId, lessonId, payload);
            } else {
                await courseApi.addDocument(courseId, chapterId, lessonId, {
                    documentTitle,
                    fileUrl,
                    fileName: form.fileName || documentTitle,
                    fileType: form.fileType || 'pdf',
                    documentDescription: form.documentDescription?.trim() || undefined,
                });
            }

            showToast({
                title: 'Đã thêm tài liệu',
                message: `Tài liệu "${documentTitle}" đã được gắn vào bài giảng.`,
            });
            setShowAddDocument(null);
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chưa thể thêm tài liệu',
                message: err.response?.data?.message || 'Cú chưa thêm được tài liệu vào bài giảng.',
            }, 'error');
        }
        finally { setSaving(false); }
    };

    const handleDeleteDocument = async (chapterId, lessonId, docId) => {
        const confirmed = await requestConfirmation({
            badge: 'Xóa tài liệu',
            title: 'Xóa tài liệu này?',
            description: 'Tài liệu sẽ bị gỡ khỏi bài giảng và học viên sẽ không còn truy cập được từ nội dung này.',
            confirmLabel: 'Xóa tài liệu',
            cancelLabel: 'Giữ tài liệu',
        });
        if (!confirmed) return;
        setSaving(true);
        try {
            await courseApi.deleteDocument(courseId, chapterId, lessonId, docId);
            showToast({
                title: 'Đã xóa tài liệu',
                message: 'Tài liệu đã được gỡ khỏi bài giảng.',
            });
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chưa thể xóa tài liệu',
                message: err.response?.data?.message || 'Cú chưa gỡ được tài liệu này khỏi bài giảng.',
            }, 'error');
        }
        finally { setSaving(false); }
    };

    const handleAddQuestion = async (form, options = {}) => {
        const { chapterId, lessonId } = showAddQuestion;
        const questionPayloads = Array.isArray(form) ? form.filter(Boolean) : [form].filter(Boolean);
        const totalQuestions = questionPayloads.length;

        if (!chapterId || !lessonId || totalQuestions === 0) {
            return false;
        }

        setSaving(true);
        const createdQuestions = [];
        try {
            for (const questionPayload of questionPayloads) {
                // Backend endpoint expects a single question object per request.
                const response = await courseApi.addQuestion(courseId, chapterId, lessonId, questionPayload);
                createdQuestions.push(response?.data || response);
            }
            appendCreatedQuestionsToState(chapterId, lessonId, createdQuestions);
            showToast({
                title: 'Đã thêm câu hỏi',
                message: 'Câu hỏi mới đã được thêm vào bài giảng.',
            });
            if (!options.keepOpen) {
                setShowAddQuestion(null);
            }
            return true;
        } catch (err) {
            if (createdQuestions.length > 0) {
                appendCreatedQuestionsToState(chapterId, lessonId, createdQuestions);
            }
            showToast({
                title: 'Chưa thể thêm câu hỏi',
                message: err.response?.data?.message || 'Cú chưa thêm được câu hỏi vào bài giảng.',
            }, 'error');
        }
        finally { setSaving(false); }
    };

    const handleSaveAssignment = async (payload) => {
        const chapterId = showAssignmentBuilder?.chapterId;
        const lessonId = showAssignmentBuilder?.lessonId;
        if (!chapterId || !lessonId) {
            return;
        }

        setSaving(true);
        try {
            const savedAssignment = await assignmentApi.upsertLessonAssignment(courseId, chapterId, lessonId, payload);
            setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'assignment' }));
            setShowAssignmentBuilder(null);

            setLessonContent((prev) => (
                prev && selectedLesson?.chapterId === chapterId && selectedLesson?.lessonId === lessonId
                    ? {
                        ...prev,
                        assignment: savedAssignment,
                        lessonType: 'assignment',
                    }
                    : prev
            ));

            showToast({
                title: 'Da luu assignment',
                message: 'De bai, rubric va cau hinh cham diem da duoc cap nhat.',
            });

            await loadLessonContent(chapterId, lessonId, {
                ...getLessonById(chapterId, lessonId),
                lessonType: 'assignment',
                type: 'assignment',
            });
        } catch (err) {
            showToast({
                title: 'Chua the luu assignment',
                message: err?.response?.data?.message || err?.message || 'Co loi xay ra khi luu assignment.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveQuizTiming = async (chapterId, lesson) => {
        const lessonId = lesson?.lessonId || lesson?.id;
        if (!lessonId) return;

        const rawValue = quizTimeLimitDraft.trim();
        const parsedValue = rawValue === '' ? 0 : Number(rawValue);

        if (rawValue !== '' && (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 300)) {
            showToast({
                title: 'Cú chưa lưu được thời gian làm bài',
                message: 'Thời gian bài kiểm tra nên là một số nguyên từ 1 đến 300 phút. Bạn có thể để trống nếu muốn không giới hạn.',
            }, 'error');
            return;
        }

        const durationMinutes = rawValue === '' ? 0 : parsedValue;

        setSaving(true);
        try {
            await courseApi.updateLesson(courseId, chapterId, lessonId, {
                estimatedDurationMinutes: durationMinutes,
            });

            setChapters((prev) => prev.map((chapter) => {
                if ((chapter.chapterId || chapter.id) !== chapterId) return chapter;
                return {
                    ...chapter,
                    lessons: (chapter.lessons || []).map((item) => {
                        if ((item.lessonId || item.id) !== lessonId) return item;
                        return {
                            ...item,
                            estimatedDurationMinutes: durationMinutes,
                            timeLimitMinutes: durationMinutes,
                        };
                    }),
                };
            }));

            setLessonContent((prev) => (
                prev
                    ? {
                        ...prev,
                        estimatedDurationMinutes: durationMinutes,
                        timeLimitMinutes: durationMinutes,
                    }
                    : prev
            ));

            showToast({
                title: durationMinutes > 0 ? 'Đã lưu thời gian làm bài' : 'Đã gỡ giới hạn thời gian',
                message: durationMinutes > 0
                    ? `Bài kiểm tra này hiện giới hạn ${formatDurationMinutes(durationMinutes)}. Phần learn sẽ hiển thị đồng hồ và tự động nộp khi hết giờ.`
                    : 'Bài kiểm tra này hiện không giới hạn thời gian, nên phần learn sẽ ẩn đồng hồ đếm ngược.',
            });
        } catch (err) {
            showToast({
                title: 'Cú chưa lưu được thời gian làm bài',
                message: err.response?.data?.message || 'Cài đặt thời gian chưa được ghi lại. Bạn thử lưu lại sau ít phút nhé.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteQuestion = async (chapterId, lessonId, qId) => {
        const confirmed = await requestConfirmation({
            badge: 'Xóa câu hỏi',
            title: 'Xóa câu hỏi này?',
            description: 'Câu hỏi sẽ bị gỡ khỏi bài giảng và không còn xuất hiện trong phần luyện tập của học viên.',
            confirmLabel: 'Xóa câu hỏi',
            cancelLabel: 'Giữ câu hỏi',
        });
        if (!confirmed) return;
        setSaving(true);
        try {
            await courseApi.deleteQuestion(courseId, chapterId, lessonId, qId);
            showToast({
                title: 'Đã xóa câu hỏi',
                message: 'Câu hỏi đã được gỡ khỏi bài giảng.',
            });
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chưa thể xóa câu hỏi',
                message: err.response?.data?.message || 'Cú chưa gỡ được câu hỏi này khỏi bài giảng.',
            }, 'error');
        }
        finally { setSaving(false); }
    };

    const handleSaveFlashcardCard = async (form, options = {}) => {
        if (!showAddFlashcardCard?.setId) {
            return;
        }

        const { chapterId, lessonId, setId, mode } = showAddFlashcardCard;
        const payloadItems = Array.isArray(form) ? form : [form];
        setSaving(true);
        try {
            if (mode === 'edit') {
                const [item] = payloadItems;
                if (!item?.itemId) {
                    throw new Error('Không tìm thấy thẻ flashcard cần cập nhật.');
                }

                await flashcardApi.updateItem(setId, item.itemId, {
                    frontText: item.frontText,
                    backText: item.backText,
                    front: item.frontText,
                    back: item.backText,
                    frontImageUrl: item.frontImageUrl,
                    backImageUrl: item.backImageUrl,
                    cardOrder: item.cardOrder,
                });
                showToast({
                    title: 'Đã cập nhật thẻ flashcard',
                    message: 'Nội dung thẻ đã được lưu lại trong bộ flashcard.',
                });
                setShowAddFlashcardCard(null);
            } else {
                await Promise.all(payloadItems.map((item) => flashcardApi.createItem(setId, item)));
                showToast({
                    title: 'Đã thêm thẻ flashcard',
                    message: payloadItems.length > 1
                        ? `Cú vừa thêm ${payloadItems.length} thẻ mới vào bộ flashcard.`
                        : 'Cú vừa thêm 1 thẻ mới vào bộ flashcard.',
                });
                setShowAddFlashcardCard((prev) => {
                    if (!options.keepOpen || !prev) {
                        return null;
                    }

                    return {
                        ...prev,
                        nextOrder: (prev.nextOrder ?? 0) + payloadItems.length,
                    };
                });
            }
            await loadLessonContent(chapterId, lessonId, {
                ...getLessonById(chapterId, lessonId),
                lessonType: 'flashcard',
                type: 'flashcard',
            });
            await fetchCourseData();
        } catch (err) {
            showToast({
                title: 'Chưa thể thêm thẻ flashcard',
                message: err.response?.data?.message || 'Cú chưa thêm được thẻ flashcard vào bộ này.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFlashcardItem = async ({ chapterId, lessonId, setId, itemId }) => {
        const confirmed = await requestConfirmation({
            badge: 'Xóa thẻ',
            title: 'Xóa thẻ flashcard này?',
            description: 'Mặt trước, mặt sau và ảnh của thẻ này sẽ bị gỡ khỏi bộ flashcard hiện tại.',
            confirmLabel: 'Xóa thẻ',
            cancelLabel: 'Giữ lại',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            await flashcardApi.deleteItem(setId, itemId);
            showToast({
                title: 'Đã xóa thẻ flashcard',
                message: 'Thẻ đã được gỡ khỏi bộ flashcard.',
            });
            await loadLessonContent(chapterId, lessonId, {
                ...getLessonById(chapterId, lessonId),
                lessonType: 'flashcard',
                type: 'flashcard',
            });
            await fetchCourseData();
        } catch (err) {
            showToast({
                title: 'Chưa thể xóa thẻ flashcard',
                message: err.response?.data?.message || 'Cú chưa xóa được thẻ flashcard này.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const isLessonSelected = (chId, lsId) =>
        selectedLesson?.chapterId === chId && selectedLesson?.lessonId === lsId;

    // ===== PREVIEW HELPERS =====
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : null;
    };

    // ===== LOADING STATE =====
    if (loading) {
        return (
            <ExpertLayout>
                <div className="flex items-center justify-center py-32">
                    <OwlLoader
                        message="Đang tải chi tiết chương trình..."
                        subMessage="SKR đang mở chương, bài học và tài nguyên hiện có của khóa học này."
                        className="py-8"
                    />
                </div>
            </ExpertLayout>
        );
    }

    // ===== ERROR STATE =====
    if (error) {
        return (
            <ExpertLayout>
                <div className="flex items-center justify-center py-32">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-black">{error}</h3>
                        <div className="flex gap-2 justify-center">
                            <Link to="/expert/curriculum" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                                <ArrowLeft className="w-4 h-4" />
                                {'Quay lại'}
                            </Link>
                            <button onClick={fetchCourseData} className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5">
                                <RefreshCw className="w-4 h-4" />
                                {'Thử lại'}
                            </button>
                        </div>
                    </div>
                </div>
            </ExpertLayout>
        );
    }

    const questionModalContextTitle = showAddQuestion
        ? [
            course?.courseName,
            chapters.find((chapter) => (chapter.chapterId || chapter.id) === showAddQuestion.chapterId)?.chapterName,
            getLessonById(showAddQuestion.chapterId, showAddQuestion.lessonId)?.lessonName,
        ].filter(Boolean).join(' / ')
        : '';

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Link to="/expert/curriculum" className="text-sm text-base-content/50 font-medium hover:text-violet-600 transition-colors">
                                {'Chương trình học'}
                            </Link>
                            <ChevronRight className="w-3 h-3 text-base-content/30" />
                            <span className="text-sm text-violet-600 font-bold truncate max-w-[300px]">
                                {course?.courseName || 'Khóa học'}
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">
                            {chapters.length === 0 ? 'Tạo Chương trình học' : 'Quản lý Chương trình học'}
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            {chapters.length === 0
                                ? 'Bắt đầu xây dựng nội dung khóa học bằng cách thêm các chương và bài giảng'
                                : 'Chỉnh sửa, thêm hoặc xóa chương và bài giảng'
                            }
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/expert/curriculum" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <ArrowLeft className="w-4 h-4" />
                            {'Quay lại'}
                        </Link>
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <Eye className="w-4 h-4" />
                            {'Xem trước'}
                        </button>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Chương', value: chapters.length, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        { label: 'Bài giảng', value: totalLessons, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Trạng thái', value: course?.status === 'published' ? 'Đã xuất bản' : 'Bản nháp', icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Mã khóa học', value: course?.courseCode || '—', icon: Hash, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-base-100 rounded-xl p-3.5 border border-base-300 flex items-center gap-3 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-lg font-black text-base-content">{stat.value}</p>
                                <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Empty state for no chapters */}
                {chapters.length === 0 && (
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl border-2 border-dashed border-violet-500/30 p-12 text-center mb-6">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mb-4">
                            <GraduationCap className="w-10 h-10 text-violet-500/50" />
                        </div>
                        <h3 className="text-lg font-black text-base-content mb-2">{'Khóa học chưa có nội dung'}</h3>
                        <p className="text-sm text-base-content/50 max-w-md mx-auto mb-5">
                            {'Bắt đầu xây dựng chương trình học bằng cách thêm chương đầu tiên. Mỗi chương sẽ chứa các bài giảng như video, tài liệu hoặc flashcard.'}
                        </p>
                        <button
                            onClick={() => setShowAddChapter(true)}
                            className="btn bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-black shadow-lg shadow-violet-500/25 gap-2"
                        >
                            <FolderPlus className="w-5 h-5" />
                            {'Thêm chương đầu tiên'}
                        </button>
                    </motion.div>
                )}

                {/* Chapters List */}
                <div className="space-y-4">
                    {chapters.map((chapter, chapterIdx) => {
                        const chId = chapter.chapterId || chapter.id;
                        const isExpanded = expandedChapters.has(chId);
                        const lessons = chapter.lessons || [];

                        return (
                            <motion.div
                                key={chId}
                                variants={cardVariants}
                                className="bg-base-100 rounded-2xl border border-base-300 shadow-lg overflow-hidden"
                            >
                                {/* Chapter Header */}
                                <div
                                    className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${
                                        isExpanded
                                            ? 'bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border-b border-base-300'
                                            : 'hover:bg-base-200/50'
                                    }`}
                                    onClick={() => toggleChapter(chId)}
                                >
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <GripVertical className="w-4 h-4 text-base-content/30 cursor-grab" />
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                            {chapterIdx + 1}
                                        </div>
                                    </div>

                                    {editingTitle === chId ? (
                                        <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && saveChapterTitle(chapter)}
                                                className="input input-sm input-bordered flex-1 font-bold rounded-xl"
                                                autoFocus
                                            />
                                            <button onClick={() => saveChapterTitle(chapter)} className="btn btn-sm btn-circle btn-ghost text-emerald-500" disabled={saving}>
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingTitle(null)} className="btn btn-sm btn-circle btn-ghost text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-base-content text-base">{chapter.chapterName}</h3>
                                            <div className="flex items-center gap-2">
                                                {chapter.chapterCode && (
                                                    <span className="text-[10px] font-bold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded">
                                                        {chapter.chapterCode}
                                                    </span>
                                                )}
                                                <p className="text-xs text-base-content/50">{`${lessons.length} bài giảng`}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => startEdit(chId, chapter.chapterName)}
                                            className="btn btn-ghost btn-xs btn-circle"
                                            title={'Đổi tên'}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteChapter(chapter)}
                                            className="btn btn-ghost btn-xs btn-circle text-red-500"
                                            title={'Xóa chương'}
                                            disabled={saving}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="ml-1">
                                            {isExpanded
                                                ? <ChevronDown className="w-5 h-5 text-base-content/40" />
                                                : <ChevronRight className="w-5 h-5 text-base-content/40" />
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Lessons */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 py-3 space-y-1.5">
                                                {lessons.length === 0 && (
                                                    <div className="text-center py-6">
                                                        <p className="text-sm text-base-content/40 font-medium">{'Chưa có bài giảng nào'}</p>
                                                        <p className="text-xs text-base-content/30">{'Nhấn nút bên dưới để thêm bài giảng đầu tiên'}</p>
                                                        <p className="text-xs text-base-content/30">{'Bạn có thể bắt đầu bằng video hoặc flashcard cho chương này.'}</p>
                                                    </div>
                                                )}

                                                {lessons.map((lesson, lessonIdx) => {
                                                    const lsId = lesson.lessonId || lesson.id;
                                                    const isCurrentLessonSelected = isLessonSelected(chId, lsId);
                                                    const resolvedLessonType = getResolvedLessonType(
                                                        lesson,
                                                        isCurrentLessonSelected ? lessonContent : null,
                                                    );
                                                    const isFlashcardLesson = resolvedLessonType === 'flashcard';
                                                    const isQuizLesson = resolvedLessonType === 'quiz';
                                                    const isAssignmentLesson = resolvedLessonType === 'assignment';
                                                    const lessonQuestions = isCurrentLessonSelected
                                                        ? (lessonContent?.questions || [])
                                                        : [];
                                                    const lessonFlashcardSets = isCurrentLessonSelected
                                                        ? getLessonFlashcardSets(lessonContent)
                                                        : [];
                                                    const lessonAssignment = isCurrentLessonSelected
                                                        ? (lessonContent?.assignment || null)
                                                        : null;
                                                    const lessonQuizTimeLimitMinutes = getLessonDurationMinutes(
                                                        isCurrentLessonSelected
                                                            ? { ...lesson, ...lessonContent }
                                                            : lesson,
                                                    );
                                                    const savedQuizTimeLimitDraft = lessonQuizTimeLimitMinutes > 0
                                                        ? String(lessonQuizTimeLimitMinutes)
                                                        : '';
                                                    const isQuizTimeLimitDirty = isCurrentLessonSelected
                                                        && quizTimeLimitDraft !== savedQuizTimeLimitDraft;
                                                    const ltConfig = lessonTypeConfig[resolvedLessonType] || lessonTypeConfig.video;
                                                    const LessonIcon = ltConfig.icon;

                                                    return (
                                                        <div key={lsId}>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: lessonIdx * 0.05 }}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-colors ${isLessonSelected(chId, lsId) ? 'bg-violet-500/10 border border-violet-500/20' : 'hover:bg-base-200/50'}`}
                                                            onClick={() => void toggleLessonContent(chId, lsId, lesson)}
                                                        >
                                                            <GripVertical className="w-4 h-4 text-base-content/20 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ltConfig.color}`}>
                                                                <LessonIcon className="w-4 h-4" />
                                                            </div>

                                                            {editingTitle === lsId ? (
                                                                <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                                    <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveLessonTitle(chId, lesson)} className="input input-sm input-bordered flex-1 font-medium rounded-xl" autoFocus />
                                                                    <button onClick={() => saveLessonTitle(chId, lesson)} className="btn btn-xs btn-circle btn-ghost text-emerald-500" disabled={saving}><Check className="w-3.5 h-3.5" /></button>
                                                                    <button onClick={() => setEditingTitle(null)} className="btn btn-xs btn-circle btn-ghost text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-sm text-base-content truncate">{lesson.lessonName}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ltConfig.color}`}>{ltConfig.label}</span>
                                                                        {lesson.lessonCode && <span className="text-[10px] text-base-content/40 font-mono">{lesson.lessonCode}</span>}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                                                    <button onClick={() => startEdit(lsId, lesson.lessonName)} className="btn btn-ghost btn-xs btn-circle" title={'Đổi tên'}><Pencil className="w-3 h-3" /></button>
                                                                    <button onClick={() => handleDeleteLesson(chId, lesson)} className="btn btn-ghost btn-xs btn-circle text-red-500" title={'Xóa bài'} disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                </div>
                                                                <ChevronDown className={`w-4 h-4 text-base-content/30 transition-transform ${isLessonSelected(chId, lsId) ? 'rotate-180 text-violet-500' : ''}`} />
                                                        </motion.div>

                                                        {/* ===== LESSON CONTENT PANEL ===== */}
                                                        <AnimatePresence>
                                                        {isLessonSelected(chId, lsId) && (
                                                            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
                                                                <div className="ml-11 mr-3 mb-2 mt-1 p-3 rounded-xl bg-base-200/50 border border-base-300 space-y-3">
                                                                    {loadingContent ? (
                                                                        <div className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-base-content/55">
                                                                            <span className="text-lg leading-none">🦉</span>
                                                                            <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                                                                            <span>Cú đang mở nội dung bài học...</span>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                        {!isFlashcardLesson && !isQuizLesson && !isAssignmentLesson && (
                                                                            <>
                                                                        {/* Videos */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-blue-600 flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" />{'Video'} ({lessonContent?.videos?.length || 0})</span>
                                                                                <button onClick={(e) => {e.stopPropagation(); setShowAddVideo({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-blue-600 gap-1 rounded-lg"><Plus className="w-3 h-3" />{'Thêm'}</button>
                                                                            </div>
                                                                            {(lessonContent?.videos || []).map(v => (
                                                                                <div key={v.videoId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-base-100 border border-base-300 mb-1">
                                                                                    <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-xs font-bold truncate">{v.videoTitle}</p>
                                                                                        <p className="text-[10px] text-base-content/40 truncate">{v.videoUrl}</p>
                                                                                    </div>
                                                                                    <button onClick={(e) => { e.stopPropagation(); setPreviewVideo(v); }} className="btn btn-ghost btn-xs btn-circle text-blue-500 hover:bg-blue-500/10" title={'Xem trước'}><Eye className="w-3 h-3" /></button>
                                                                                    <a href={v.videoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs btn-circle"><ExternalLink className="w-3 h-3" /></a>
                                                                                    <button onClick={() => handleDeleteVideo(chId, lsId, v.videoId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                                </div>
                                                                            ))}
                                                                            {(lessonContent?.videos?.length || 0) === 0 && <p className="text-[10px] text-base-content/30 italic">{'Chưa có video'}</p>}
                                                                        </div>

                                                                        {/* Documents */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-emerald-600 flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{'Tài liệu'} ({lessonContent?.documents?.length || 0})</span>
                                                                                <button onClick={(e) => {e.stopPropagation(); setShowAddDocument({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-emerald-600 gap-1 rounded-lg"><Plus className="w-3 h-3" />{'Thêm'}</button>
                                                                            </div>
                                                                            {(lessonContent?.documents || []).map(d => (
                                                                                <div key={d.documentId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-base-100 border border-base-300 mb-1">
                                                                                    <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-xs font-bold truncate">{d.documentTitle}</p>
                                                                                        <p className="text-[10px] text-base-content/40">{d.fileType || 'file'}{d.fileName ? ` • ${d.fileName}` : ''}</p>
                                                                                    </div>
                                                                                    <button onClick={(e) => { e.stopPropagation(); setPreviewDocument(d); }} className="btn btn-ghost btn-xs btn-circle text-emerald-500 hover:bg-emerald-500/10" title={'Xem trước'}><Eye className="w-3 h-3" /></button>
                                                                                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs btn-circle"><ExternalLink className="w-3 h-3" /></a>
                                                                                    <button onClick={() => handleDeleteDocument(chId, lsId, d.documentId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                                </div>
                                                                            ))}
                                                                            {(lessonContent?.documents?.length || 0) === 0 && <p className="text-[10px] text-base-content/30 italic">{'Chưa có tài liệu'}</p>}
                                                                        </div>

                                                                        {/* Questions */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-amber-600 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" />{'Câu hỏi'} ({lessonContent?.questions?.length || 0})</span>
                                                                                <button onClick={(e) => {e.stopPropagation(); setShowAddQuestion({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-amber-600 gap-1 rounded-lg"><Plus className="w-3 h-3" />{'Thêm'}</button>
                                                                            </div>
                                                                            {(lessonContent?.questions || []).map(q => (
                                                                                <div key={q.questionId} className="px-2 py-1.5 rounded-lg bg-base-100 border border-base-300 mb-1">
                                                                                    <div className="flex items-start gap-2">
                                                                                        <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="text-xs font-bold">{q.questionText}</p>
                                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                                <span className="text-[10px] badge badge-xs badge-ghost">{q.questionType}</span>
                                                                                                <span className="text-[10px] badge badge-xs badge-ghost">{q.difficultyLevel}</span>
                                                                                            </div>
                                                                                            {q.options?.length > 0 && (
                                                                                                <div className="mt-1 space-y-0.5">
                                                                                                    {q.options.map(o => (
                                                                                                        <div key={o.optionId} className={`text-[11px] flex items-center gap-1 ${o.isCorrect ? 'text-emerald-600 font-bold' : 'text-base-content/60'}`}>
                                                                                                            {o.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-base-content/20 inline-block" />}
                                                                                                            {o.optionText}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <button onClick={(e) => { e.stopPropagation(); setPreviewQuestion(q); }} className="btn btn-ghost btn-xs btn-circle text-amber-500 hover:bg-amber-500/10" title={'Xem trước'}><Eye className="w-3 h-3" /></button>
                                                                                        <button onClick={() => handleDeleteQuestion(chId, lsId, q.questionId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            {(lessonContent?.questions?.length || 0) === 0 && <p className="text-[10px] text-base-content/30 italic">{'Chưa có câu hỏi'}</p>}
                                                                        </div>

                                                                            </>
                                                                        )}
                                                                        {isAssignmentLesson && (
                                                                            <div className="space-y-3">
                                                                                <div className="overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 shadow-sm">
                                                                                    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
                                                                                        <div className="min-w-0">
                                                                                            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-rose-700">
                                                                                                <ClipboardCheck className="h-3.5 w-3.5" />
                                                                                                Assignment lesson
                                                                                            </div>
                                                                                            <h4 className="mt-3 text-sm font-black text-base-content">
                                                                                                {lessonAssignment?.title || lesson.lessonName || 'Assignment'}
                                                                                            </h4>
                                                                                            <p className="mt-1 max-w-2xl text-xs leading-5 text-base-content/60">
                                                                                                {lessonAssignment?.description || 'Tao de bai, huong dan nop bai va rubric de hoc vien lam bai trong phan learn. Sau khi nop, AI se cham va tra ve review cho expert xem lai.'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setShowAssignmentBuilder({
                                                                                                        chapterId: chId,
                                                                                                        lessonId: lsId,
                                                                                                        lessonName: lesson.lessonName,
                                                                                                        initialValue: lessonAssignment,
                                                                                                    });
                                                                                                }}
                                                                                                className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-rose-500 to-orange-500 font-bold text-white shadow-lg shadow-rose-500/20"
                                                                                            >
                                                                                                <ClipboardCheck className="h-4 w-4" />
                                                                                                {lessonAssignment ? 'Chinh assignment' : 'Tao assignment'}
                                                                                            </button>
                                                                                            <Link
                                                                                                to="/expert/assignments"
                                                                                                className="btn btn-sm rounded-xl border border-rose-200 bg-white font-bold text-rose-600"
                                                                                                onClick={(e) => e.stopPropagation()}
                                                                                            >
                                                                                                Xem bai nop
                                                                                            </Link>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="grid gap-3 border-t border-rose-100/80 bg-white/80 p-4 sm:grid-cols-2 xl:grid-cols-4">
                                                                                        <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3">
                                                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-700/70">Tong diem</p>
                                                                                            <p className="mt-1 text-2xl font-black text-base-content">{lessonAssignment?.maxScore || 100}</p>
                                                                                        </div>
                                                                                        <div className="rounded-xl border border-rose-100 bg-white p-3">
                                                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Tieu chi</p>
                                                                                            <p className="mt-1 text-2xl font-black text-base-content">{lessonAssignment?.rubricCriteria?.length || 0}</p>
                                                                                        </div>
                                                                                        <div className="rounded-xl border border-rose-100 bg-white p-3">
                                                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Nguon tao</p>
                                                                                            <p className="mt-1 text-base font-black capitalize text-base-content">{lessonAssignment?.sourceType || 'manual'}</p>
                                                                                        </div>
                                                                                        <div className="rounded-xl border border-rose-100 bg-white p-3">
                                                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">Trang thai</p>
                                                                                            <p className="mt-1 text-base font-black text-base-content">{lessonAssignment ? 'San sang nop bai' : 'Chua soan de'}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {lessonAssignment ? (
                                                                                    <div className="grid gap-3 lg:grid-cols-[1.1fr,0.9fr]">
                                                                                        <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                                                                                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Huong dan cho hoc vien</p>
                                                                                            <p className="mt-3 text-sm leading-6 text-base-content/75">
                                                                                                {lessonAssignment.instructions || lessonAssignment.submissionFormat || 'Chua co huong dan chi tiet.'}
                                                                                            </p>
                                                                                            {lessonAssignment.reviewFocus && (
                                                                                                <div className="mt-4 rounded-xl bg-base-200/60 px-3 py-3">
                                                                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Trong tam AI review</p>
                                                                                                    <p className="mt-2 text-xs leading-5 text-base-content/65">{lessonAssignment.reviewFocus}</p>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                                                                                            <div className="flex items-center justify-between gap-3">
                                                                                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-base-content/40">Rubric</p>
                                                                                                <span className="rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">
                                                                                                    {`${lessonAssignment.maxScore || 100} diem`}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="mt-3 space-y-2.5">
                                                                                                {(lessonAssignment.rubricCriteria || []).map((criterion) => (
                                                                                                    <div key={criterion.criterionId} className="rounded-xl border border-base-300 bg-base-200/30 px-3 py-3">
                                                                                                        <div className="flex items-center justify-between gap-2">
                                                                                                            <p className="text-sm font-bold text-base-content">{criterion.title}</p>
                                                                                                            <span className="text-xs font-bold text-base-content/45">{`${criterion.maxPoints} diem`}</span>
                                                                                                        </div>
                                                                                                        {criterion.description && (
                                                                                                            <p className="mt-1 text-xs leading-5 text-base-content/60">{criterion.description}</p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="rounded-2xl border border-dashed border-rose-300 bg-white px-4 py-5 text-center">
                                                                                        <p className="text-sm font-bold text-base-content">Lesson nay chua co de bai assignment.</p>
                                                                                        <p className="mt-1 text-xs text-base-content/55">Mo modal o tren de nhap de bai thu cong hoac nho AI tao goi y rubric.</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {isQuizLesson && (
                                                                            <div className="space-y-3">
                                                                                <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm">
                                                                                    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
                                                                                        <div className="min-w-0">
                                                                                            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                                                                                                <HelpCircle className="h-3.5 w-3.5" />
                                                                                                Quiz lesson
                                                                                            </div>
                                                                                            <h4 className="mt-3 text-sm font-black text-base-content">
                                                                                                {lesson.lessonName || 'Bài kiểm tra'}
                                                                                            </h4>
                                                                                            <p className="mt-1 max-w-2xl text-xs leading-5 text-base-content/60">
                                                                                                {'Học viên sẽ vào lesson này trong phần learn để làm bài trực tiếp, xem tiến độ từng câu và nhận kết quả ngay sau khi nộp.'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setShowAddQuestion({ chapterId: chId, lessonId: lsId });
                                                                                                }}
                                                                                                className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white shadow-lg shadow-amber-500/20"
                                                                                            >
                                                                                                <Plus className="h-4 w-4" />
                                                                                                {'Thêm câu hỏi'}
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="grid gap-3 border-t border-amber-100/80 bg-white/80 p-4 sm:grid-cols-2 xl:grid-cols-4">
                                                                                        <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                                                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700/70">{'Tổng câu hỏi'}</p>
                                                                                            <p className="mt-1 text-2xl font-black text-base-content">{lessonQuestions.length}</p>
                                                                                        </div>
                                                                                        <div className="rounded-xl border border-amber-100 bg-white p-3">
                                                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">{'Trắc nghiệm / đúng sai'}</p>
                                                                                            <p className="mt-1 text-2xl font-black text-base-content">
                                                                                                {lessonQuestions.filter((question) => question.questionType !== 'fill_blank').length}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="rounded-xl border border-amber-100 bg-white p-3">
                                                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">{'Điền từ'}</p>
                                                                                            <p className="mt-1 text-2xl font-black text-base-content">
                                                                                                {lessonQuestions.filter((question) => question.questionType === 'fill_blank').length}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className={`rounded-xl border p-3 ${lessonQuizTimeLimitMinutes > 0 ? 'border-amber-100 bg-white' : 'border-dashed border-amber-200 bg-white/70'}`}>
                                                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">{'Thời gian làm bài'}</p>
                                                                                            <p className="mt-1 text-base font-black text-base-content">
                                                                                                {lessonQuizTimeLimitMinutes > 0 ? formatDurationMinutes(lessonQuizTimeLimitMinutes) : 'Chưa giới hạn'}
                                                                                            </p>
                                                                                            <p className="mt-1 text-[11px] leading-4 text-base-content/45">
                                                                                                {lessonQuizTimeLimitMinutes > 0
                                                                                                    ? 'Phần learn sẽ hiển thị đồng hồ đếm ngược và tự nộp khi hết giờ.'
                                                                                                    : 'Để trống nếu bạn muốn học viên làm bài không giới hạn thời gian.'}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="border-t border-amber-100/80 bg-white/85 p-4">
                                                                                        <div className="rounded-2xl border border-amber-100 bg-white p-4">
                                                                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                                                                                <div className="min-w-0">
                                                                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700/70">{'Thiết lập thời gian'}</p>
                                                                                                    <h5 className="mt-1 text-sm font-black text-base-content">{'Giới hạn thời gian làm bài'}</h5>
                                                                                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-base-content/60">
                                                                                                        {'Nhập số phút nếu bạn muốn learner thấy đồng hồ và được tự động nộp bài khi hết giờ. Để trống và lưu nếu muốn bỏ khỏi giới hạn.'}
                                                                                                    </p>
                                                                                                </div>
                                                                                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
                                                                                                    <label className="form-control sm:min-w-[14rem]">
                                                                                                        <span className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">{'Thời gian (phút)'}</span>
                                                                                                        <input
                                                                                                            type="number"
                                                                                                            min="1"
                                                                                                            max="300"
                                                                                                            step="1"
                                                                                                            value={quizTimeLimitDraft}
                                                                                                            onChange={(event) => setQuizTimeLimitDraft(event.target.value)}
                                                                                                            onClick={(event) => event.stopPropagation()}
                                                                                                            placeholder={'Để trống nếu không giới hạn'}
                                                                                                            className="input input-bordered input-sm rounded-xl font-medium"
                                                                                                        />
                                                                                                    </label>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={(event) => {
                                                                                                            event.stopPropagation();
                                                                                                            void handleSaveQuizTiming(chId, lesson);
                                                                                                        }}
                                                                                                        disabled={saving || !isQuizTimeLimitDirty}
                                                                                                        className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white shadow-lg shadow-amber-500/20"
                                                                                                    >
                                                                                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                                                                        {'Lưu thời gian'}
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-[11px] text-amber-800">
                                                                                                {lessonQuizTimeLimitMinutes > 0
                                                                                                    ? `Đang lưu: ${formatDurationMinutes(lessonQuizTimeLimitMinutes)}. Nếu bạn xóa giá trị và lưu lại, learner sẽ không còn thấy đồng hồ.`
                                                                                                    : 'Hiện tại bài kiểm tra này chưa có giới hạn thời gian.'}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div>
                                                                                    <div className="mb-1.5 flex items-center justify-between">
                                                                                        <span className="text-xs font-black text-amber-600 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" />{'Ngân hàng câu hỏi'} ({lessonQuestions.length || 0})</span>
                                                                                        <button onClick={(e) => {e.stopPropagation(); setShowAddQuestion({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-amber-600 gap-1 rounded-lg"><Plus className="w-3 h-3" />{'Thêm'}</button>
                                                                                    </div>
                                                                                    {lessonQuestions.length === 0 ? (
                                                                                        <div className="rounded-xl border border-dashed border-amber-200 bg-base-100 px-4 py-6 text-center">
                                                                                            <HelpCircle className="mx-auto h-6 w-6 text-amber-500" />
                                                                                            <p className="mt-2 text-xs font-bold text-base-content/70">{'Bài kiểm tra này chưa có câu hỏi nào'}</p>
                                                                                            <p className="mt-1 text-[11px] text-base-content/45">{'Hãy thêm câu hỏi đầu tiên để học viên có thể làm bài trong phần learn.'}</p>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="space-y-2">
                                                                                            {lessonQuestions.map((q, questionIndex) => (
                                                                                                <div key={q.questionId} className="rounded-xl border border-base-300 bg-base-100 p-3">
                                                                                                    <div className="flex items-start gap-3">
                                                                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xs font-black text-amber-700">
                                                                                                            {questionIndex + 1}
                                                                                                        </div>
                                                                                                        <div className="min-w-0 flex-1">
                                                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                                                <span className="badge badge-xs badge-ghost">{q.questionType}</span>
                                                                                                                <span className="badge badge-xs badge-ghost">{q.difficultyLevel}</span>
                                                                                                                <span className="text-[10px] font-medium text-base-content/40">
                                                                                                                    {`${q.options?.filter((option) => option.isCorrect).length || 0} đáp án đúng`}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                            <p className="mt-2 text-xs font-bold leading-5 text-base-content">{q.questionText}</p>
                                                                                                            {q.options?.length > 0 && (
                                                                                                                <div className="mt-2 grid gap-1.5 lg:grid-cols-2">
                                                                                                                    {q.options.map((option) => (
                                                                                                                        <div key={option.optionId} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] ${option.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-base-300 bg-base-200/35 text-base-content/60'}`}>
                                                                                                                            {option.isCorrect ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <span className="inline-block h-2.5 w-2.5 rounded-full border border-base-content/20" />}
                                                                                                                            <span className="truncate">{option.optionText}</span>
                                                                                                                        </div>
                                                                                                                    ))}
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {q.questionExplanation && (
                                                                                                                <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2 text-[11px] text-blue-700">
                                                                                                                    <span className="font-bold">{'Giải thích:'}</span> {q.questionExplanation}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-1">
                                                                                                            <button onClick={(e) => { e.stopPropagation(); setPreviewQuestion(q); }} className="btn btn-ghost btn-xs btn-circle text-amber-500 hover:bg-amber-500/10" title={'Xem trước'}><Eye className="w-3 h-3" /></button>
                                                                                                            <button onClick={() => handleDeleteQuestion(chId, lsId, q.questionId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {isFlashcardLesson && (
                                                                            <div>
                                                                                <div className="mb-1.5 flex items-center justify-between">
                                                                                    <span className="flex items-center gap-1 text-xs font-black text-indigo-600">
                                                                                        <Sparkles className="h-3.5 w-3.5" />
                                                                                        {'Flashcard'} ({lessonFlashcardSets.length})
                                                                                    </span>
                                                                                    {lessonFlashcardSets.length === 0 && (
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                void handleCreateLessonFlashcardSet(chId, lesson);
                                                                                            }}
                                                                                            className="btn btn-xs btn-ghost gap-1 rounded-lg text-indigo-600"
                                                                                        >
                                                                                            <Plus className="h-3 w-3" />
                                                                                            {'Tạo bộ'}
                                                                                        </button>
                                                                                    )}
                                                                                </div>

                                                                                {lessonFlashcardSets.length === 0 ? (
                                                                                    <div className="rounded-xl border border-dashed border-indigo-500/20 bg-base-100 px-3 py-4 text-center">
                                                                                        <p className="text-xs font-bold text-base-content/70">{'Bài này chưa có bộ flashcard nào'}</p>
                                                                                        <p className="mt-1 text-[11px] text-base-content/45">{'Tạo một bộ trước, sau đó thêm các thẻ mặt trước và mặt sau.'}</p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="space-y-3">
                                                                                        {lessonFlashcardSets.map((set, setIndex) => {
                                                                                            const setId = set?.flashcardSetId || set?.id || `flashcard-set-${setIndex}`;
                                                                                            const setTitle = set?.setTitle || set?.title || `${lesson.lessonName} - Flashcard`;
                                                                                            const setItems = getFlashcardSetItems(set).filter((item) => (
                                                                                                item?.frontText
                                                                                                || item?.front
                                                                                                || item?.backText
                                                                                                || item?.back
                                                                                                || item?.frontImageUrl
                                                                                                || item?.frontImage
                                                                                                || item?.backImageUrl
                                                                                                || item?.backImage
                                                                                            ));
                                                                                            const totalCards = Number(set?.totalCards || set?.itemCount || setItems.length || 0);

                                                                                            return (
                                                                                                <div key={setId} className="rounded-xl border border-base-300 bg-base-100 p-3">
                                                                                                    <div className="flex items-center justify-between gap-2">
                                                                                                        <div className="min-w-0">
                                                                                                            <p className="truncate text-xs font-black text-base-content">{setTitle}</p>
                                                                                                            <p className="text-[10px] font-medium text-base-content/45">
                                                                                                                {totalCards} {totalCards === 1 ? 'thẻ' : 'thẻ'}
                                                                                                            </p>
                                                                                                        </div>
                                                                                                        <button
                                                                                                            onClick={(e) => {
                                                                                                                e.stopPropagation();
                                                                                                                setShowAddFlashcardCard({
                                                                                                                    mode: 'create',
                                                                                                                    chapterId: chId,
                                                                                                                    lessonId: lsId,
                                                                                                                    setId,
                                                                                                                    setTitle,
                                                                                                                    nextOrder: setItems.length,
                                                                                                                });
                                                                                                            }}
                                                                                                            className="btn btn-xs btn-ghost gap-1 rounded-lg text-indigo-600"
                                                                                                        >
                                                                                                            <Plus className="h-3 w-3" />
                                                                                                            {'Thêm thẻ'}
                                                                                                        </button>
                                                                                                    </div>

                                                                                                    {setItems.length === 0 ? (
                                                                                                        <p className="mt-2 text-[10px] italic text-base-content/35">{'Bộ này chưa có thẻ nào.'}</p>
                                                                                                    ) : (
                                                                                                        <div className="mt-3 space-y-2">
                                                                                                            {setItems.map((item, itemIndex) => {
                                                                                                                const itemId = item?.flashcardItemId || item?.id || null;
                                                                                                                const frontText = item?.frontText || item?.front || '';
                                                                                                                const backText = item?.backText || item?.back || '';
                                                                                                                const frontImageUrl = resolveFlashcardImageUrl(
                                                                                                                    item?.frontImageUrl || item?.frontImage || item?.frontMediaUrl || item?.frontImagePath || '',
                                                                                                                );
                                                                                                                const backImageUrl = resolveFlashcardImageUrl(
                                                                                                                    item?.backImageUrl || item?.backImage || item?.backMediaUrl || item?.backImagePath || '',
                                                                                                                );

                                                                                                                return (
                                                                                                                    <div key={itemId || `${setId}-${itemIndex}`} className="rounded-xl border border-base-300 bg-base-200/35 p-3">
                                                                                                                        <div className="mb-3 flex items-center justify-between gap-2">
                                                                                                                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-base-content/40">
                                                                                                                                {`The ${itemIndex + 1}`}
                                                                                                                            </span>
                                                                                                                            <div className="flex items-center gap-1.5">
                                                                                                                                <button
                                                                                                                                    type="button"
                                                                                                                                    onClick={(e) => {
                                                                                                                                        e.stopPropagation();
                                                                                                                                        setShowAddFlashcardCard({
                                                                                                                                            mode: 'edit',
                                                                                                                                            chapterId: chId,
                                                                                                                                            lessonId: lsId,
                                                                                                                                            setId,
                                                                                                                                            setTitle,
                                                                                                                                            itemId,
                                                                                                                                            initialCards: [createFlashcardDraftFromItem(item)],
                                                                                                                                        });
                                                                                                                                    }}
                                                                                                                                    disabled={!itemId}
                                                                                                                                    className="btn btn-xs btn-ghost gap-1 rounded-lg text-base-content/60 hover:text-indigo-600 disabled:bg-transparent"
                                                                                                                               >
                                                                                                                                    <Pencil className="h-3 w-3" />
                                                                                                                                    Sua
                                                                                                                                </button>
                                                                                                                                <button
                                                                                                                                    type="button"
                                                                                                                                    onClick={(e) => {
                                                                                                                                        e.stopPropagation();
                                                                                                                                        void handleDeleteFlashcardItem({
                                                                                                                                            chapterId: chId,
                                                                                                                                            lessonId: lsId,
                                                                                                                                            setId,
                                                                                                                                            itemId,
                                                                                                                                        });
                                                                                                                                    }}
                                                                                                                                    disabled={!itemId || saving}
                                                                                                                                    className="btn btn-xs btn-ghost gap-1 rounded-lg text-base-content/60 hover:text-red-500 disabled:bg-transparent"
                                                                                                                                >
                                                                                                                                    <Trash2 className="h-3 w-3" />
                                                                                                                                    Xoa
                                                                                                                                </button>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div className="grid gap-3 lg:grid-cols-2">
                                                                                                                            <div className="space-y-2">
                                                                                                                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">{'Mặt trước'}</p>
                                                                                                                                {frontImageUrl && (
                                                                                                                                    <img
                                                                                                                                        src={frontImageUrl}
                                                                                                                                        alt="Flashcard front"
                                                                                                                                        className="max-h-80 w-full rounded-lg border border-base-300 bg-base-200/40 object-contain object-center"
                                                                                                                                    />
                                                                                                                                )}
                                                                                                                                <p className="text-xs font-medium text-base-content/80">{frontText || 'Không có nội dung chữ'}</p>
                                                                                                                            </div>
                                                                                                                            <div className="space-y-2">
                                                                                                                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/45">{'Mặt sau'}</p>
                                                                                                                                {backImageUrl && (
                                                                                                                                    <img
                                                                                                                                        src={backImageUrl}
                                                                                                                                        alt="Flashcard back"
                                                                                                                                        className="max-h-80 w-full rounded-lg border border-base-300 bg-base-200/40 object-contain object-center"
                                                                                                                                    />
                                                                                                                                )}
                                                                                                                                <p className="text-xs font-medium text-base-content/80">{backText || 'Không có nội dung chữ'}</p>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                );
                                                                                                            })}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}

                                            {/* Add Lesson */}
                                            <div className="px-5 pb-4">
                                                <button
                                                    onClick={() => setShowAddLesson(chId)}
                                                    className="btn btn-sm btn-ghost rounded-xl font-bold text-violet-600 w-full border-2 border-dashed border-base-300 hover:border-violet-500/50 gap-1.5"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    {'Thêm bài giảng'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Add Chapter Button */}
                {chapters.length > 0 && (
                    <motion.div variants={cardVariants} className="mt-4">
                        <button
                            onClick={() => setShowAddChapter(true)}
                            className="btn btn-lg w-full rounded-2xl font-black text-violet-600 bg-base-100 border-2 border-dashed border-violet-500/30 hover:border-violet-500 hover:bg-violet-500/5 transition-all gap-2 shadow-lg"
                        >
                            <FolderPlus className="w-5 h-5" />
                            {'Thêm chương mới'}
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* Modals */}
            <AddChapterModal
                open={showAddChapter}
                onClose={() => setShowAddChapter(false)}
                onSubmit={handleAddChapter}
                loading={saving}
            />
            <AddLessonModal
                open={!!showAddLesson}
                onClose={() => setShowAddLesson(null)}
                onSubmit={handleAddLesson}
                loading={saving}
                chapterName={showAddLesson ? getChapterName(showAddLesson) : ''}
                existingLessons={showAddLesson ? getChapterLessons(showAddLesson) : []}
                onValidationError={(validation) => {
                    if (!validation?.summary) return;
                    showToast({
                        title: 'Cú cần bạn kiểm tra lại bài giảng mới',
                        message: validation.summary,
                    }, 'error');
                }}
            />
            <AddFlashcardCardModal
                open={!!showAddFlashcardCard}
                onClose={() => setShowAddFlashcardCard(null)}
                onSubmit={handleSaveFlashcardCard}
                loading={saving}
                setTitle={showAddFlashcardCard?.setTitle || ''}
                nextOrder={showAddFlashcardCard?.nextOrder}
                mode={showAddFlashcardCard?.mode || 'create'}
                initialCards={showAddFlashcardCard?.initialCards || []}
            />

            {/* Add Video Modal */}
            {showAddVideo && (
                <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-box rounded-2xl border border-base-300 shadow-2xl">
                        <h3 className="font-black text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><PlayCircle className="w-4 h-4 text-white" /></div>
                            {'Thêm Video'}
                        </h3>
                        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); handleAddVideo({ videoTitle: fd.get('videoTitle'), videoUrl: fd.get('videoUrl'), videoDescription: fd.get('videoDescription') }); }} className="mt-4 space-y-3">
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'Tiêu đề video'} <span className="text-red-500">*</span></span></label>
                                <input name="videoTitle" type="text" placeholder="VD: Giới thiệu bài học" className="input input-bordered input-sm rounded-xl w-full font-medium" required autoFocus /></div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">URL Video <span className="text-red-500">*</span></span></label>
                                <input name="videoUrl" type="url" placeholder="https://youtube.com/watch?v=..." className="input input-bordered input-sm rounded-xl w-full font-medium" required /></div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'Mô tả (tùy chọn)'}</span></label>
                                <textarea name="videoDescription" placeholder="Mô tả nội dung video..." className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none" rows={2} /></div>
                            <div className="modal-action">
                                <button type="button" onClick={() => setShowAddVideo(null)} className="btn btn-sm btn-ghost rounded-xl font-bold">{'Hủy'}</button>
                                <button type="submit" disabled={saving} className="btn btn-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-none rounded-xl font-bold gap-1.5">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {'Thêm video'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                    <div className="modal-backdrop bg-black/40" onClick={() => setShowAddVideo(null)} />
                </div>
            )}

            {/* Add Document Modal */}
            {showAddDocument && (
                <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-box rounded-2xl border border-base-300 shadow-2xl">
                        <h3 className="font-black text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"><FileText className="w-4 h-4 text-white" /></div>
                            {'Thêm Tài liệu'}
                        </h3>
                        <form onSubmit={e => {
                            e.preventDefault();
                            const fd = new FormData(e.target);
                            const file = fd.get('file');
                            const safeFile = file instanceof File && file.size > 0 ? file : null;
                            const fallbackTitle = fd.get('documentTitle');
                            handleAddDocument({
                                documentTitle: fallbackTitle,
                                file: safeFile,
                                fileUrl: fd.get('fileUrl'),
                                fileName: fd.get('fileName') || safeFile?.name || fallbackTitle,
                                fileType: fd.get('fileType') || 'pdf',
                                documentDescription: fd.get('documentDescription'),
                            });
                        }} className="mt-4 space-y-3">
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'Tiêu đề'} <span className="text-red-500">*</span></span></label>
                                <input name="documentTitle" type="text" placeholder="VD: Slide bài giảng" className="input input-bordered input-sm rounded-xl w-full font-medium" required autoFocus /></div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'Tải file từ máy'}</span></label>
                                <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" className="file-input file-input-bordered file-input-sm rounded-xl w-full font-medium" /></div>
                            <div className="divider text-[10px] font-bold text-base-content/40 uppercase my-1">{'hoặc dùng link'}</div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'URL Tài liệu'}</span></label>
                                <input name="fileUrl" type="url" placeholder="https://drive.google.com/..." className="input input-bordered input-sm rounded-xl w-full font-medium" /></div>
                            <div className="flex gap-2">
                                <div className="form-control flex-1"><label className="label py-1"><span className="label-text font-bold text-xs">{'Tên file'}</span></label>
                                    <input name="fileName" type="text" placeholder="document.pdf" className="input input-bordered input-sm rounded-xl w-full font-medium" /></div>
                                <div className="form-control w-28"><label className="label py-1"><span className="label-text font-bold text-xs">{'Loại file'}</span></label>
                                    <select name="fileType" className="select select-bordered select-sm rounded-xl font-medium"><option value="pdf">PDF</option><option value="doc">DOC</option><option value="docx">DOCX</option><option value="ppt">PPT</option><option value="txt">TXT</option></select></div>
                            </div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'Mô tả (tùy chọn)'}</span></label>
                                <textarea name="documentDescription" placeholder="Mô tả tài liệu..." className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none" rows={2} /></div>
                            <div className="modal-action">
                                <button type="button" onClick={() => setShowAddDocument(null)} className="btn btn-sm btn-ghost rounded-xl font-bold">{'Hủy'}</button>
                                <button type="submit" disabled={saving} className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none rounded-xl font-bold gap-1.5">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {'Thêm tài liệu'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                    <div className="modal-backdrop bg-black/40" onClick={() => setShowAddDocument(null)} />
                </div>
            )}

            {/* Add Question Modal */}
            {showAddQuestion && (
                <AddQuestionModal
                    open={true}
                    onClose={() => setShowAddQuestion(null)}
                    onSubmit={handleAddQuestion}
                    loading={saving}
                    contextTitle={questionModalContextTitle}
                />
            )}

            {showAssignmentBuilder && (
                <AssignmentBuilderModal
                    open={true}
                    onClose={() => setShowAssignmentBuilder(null)}
                    onSave={handleSaveAssignment}
                    loading={saving}
                    contextTitle={showAssignmentBuilder.lessonName || 'Assignment lesson'}
                    initialValue={showAssignmentBuilder.initialValue}
                />
            )}

            {/* ===== VIDEO PREVIEW MODAL ===== */}
            <AnimatePresence>
            {previewVideo && (
                <div className="modal modal-open" style={{ zIndex: 110 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="modal-box rounded-2xl border border-base-300 shadow-2xl max-w-3xl w-11/12"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <PlayCircle className="w-4 h-4 text-white" />
                                </div>
                                {'Xem trước Video'}
                            </h3>
                            <button onClick={() => setPreviewVideo(null)} className="btn btn-ghost btn-sm btn-circle"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-xl ring-1 ring-white/10">
                            {getYouTubeEmbedUrl(previewVideo.videoUrl) ? (
                                <iframe
                                    src={getYouTubeEmbedUrl(previewVideo.videoUrl)}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    title={previewVideo.videoTitle}
                                />
                            ) : (
                                <video src={previewVideo.videoUrl} controls className="w-full h-full">
                                    {'Trình duyệt không hỗ trợ phát video.'}
                                </video>
                            )}
                        </div>
                        <div className="mt-4 p-3 rounded-xl bg-base-200/50 border border-base-300">
                            <h4 className="font-bold text-base flex items-center gap-2">
                                <Video className="w-4 h-4 text-blue-500"/>
                                {previewVideo.videoTitle}
                            </h4>
                            {previewVideo.videoDescription && (
                                <p className="text-sm text-base-content/60 mt-1.5 leading-relaxed">{previewVideo.videoDescription}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-base-content/40">
                                <Link2 className="w-3 h-3"/>
                                <span className="truncate">{previewVideo.videoUrl}</span>
                            </div>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setPreviewVideo(null)} />
                </div>
            )}
            </AnimatePresence>

            {/* ===== DOCUMENT PREVIEW MODAL ===== */}
            <AnimatePresence>
            {previewDocument && (
                <div className="modal modal-open" style={{ zIndex: 110 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="modal-box rounded-2xl border border-base-300 shadow-2xl max-w-4xl w-11/12" style={{ maxHeight: '88vh' }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                    <FileText className="w-4 h-4 text-white" />
                                </div>
                                {'Xem trước Tài liệu'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <a href={previewDocument.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 text-emerald-600">
                                    <ExternalLink className="w-3.5 h-3.5"/> {'Mở link gốc'}
                                </a>
                                <button onClick={() => setPreviewDocument(null)} className="btn btn-ghost btn-sm btn-circle"><X className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-base-300 bg-base-200 shadow-inner" style={{ height: '62vh' }}>
                            <DocumentPreviewContent document={previewDocument} />
                        </div>
                        <div className="mt-4 p-3 rounded-xl bg-base-200/50 border border-base-300">
                            <h4 className="font-bold text-base flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-500"/>
                                {previewDocument.documentTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {previewDocument.fileName && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-base-300/80 text-base-content/60">{previewDocument.fileName}</span>
                                )}
                                {previewDocument.fileType && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase">{previewDocument.fileType}</span>
                                )}
                            </div>
                            {previewDocument.documentDescription && (
                                <p className="text-sm text-base-content/60 mt-1.5">{previewDocument.documentDescription}</p>
                            )}
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setPreviewDocument(null)} />
                </div>
            )}
            </AnimatePresence>

            {/* ===== QUESTION PREVIEW MODAL ===== */}
            <AnimatePresence>
            {previewQuestion && (
                <div className="modal modal-open" style={{ zIndex: 110 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="modal-box rounded-2xl border border-base-300 shadow-2xl max-w-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                                    <HelpCircle className="w-4 h-4 text-white" />
                                </div>
                                {'Xem trước Câu hỏi'}
                            </h3>
                            <button onClick={() => setPreviewQuestion(null)} className="btn btn-ghost btn-sm btn-circle"><X className="w-5 h-5"/></button>
                        </div>

                        {/* Student-like preview card */}
                        <div className="rounded-xl bg-gradient-to-br from-base-200/80 to-base-200/40 p-5 border border-base-300 shadow-inner">
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                                    previewQuestion.difficultyLevel === 'easy' ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20' :
                                    previewQuestion.difficultyLevel === 'hard' ? 'bg-red-500/10 text-red-600 ring-1 ring-red-500/20' :
                                    'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20'
                                }`}>
                                    {previewQuestion.difficultyLevel === 'easy' ? 'Dễ' : previewQuestion.difficultyLevel === 'hard' ? 'Khó' : 'Trung bình'}
                                </span>
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20">
                                    {previewQuestion.questionType === 'multiple_choice' ? 'Trắc nghiệm' : previewQuestion.questionType === 'true_false' ? 'Đúng/Sai' : 'Điền từ'}
                                </span>
                            </div>

                            {/* Question text */}
                            <h4 className="font-bold text-base leading-relaxed mb-4">{previewQuestion.questionText}</h4>

                            {/* Options */}
                            {previewQuestion.options?.length > 0 && (
                                <div className="space-y-2">
                                    {previewQuestion.options.map((o, idx) => (
                                        <div
                                            key={o.optionId || idx}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                                o.isCorrect
                                                    ? 'border-emerald-500 bg-emerald-500/5 shadow-sm shadow-emerald-500/10'
                                                    : 'border-base-300 bg-base-100 hover:border-base-content/20'
                                            }`}
                                        >
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${
                                                o.isCorrect
                                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                                    : 'bg-base-300 text-base-content/50'
                                            }`}>
                                                {o.isCorrect ? <CheckCircle2 className="w-4 h-4"/> : String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-sm ${
                                                o.isCorrect ? 'font-bold text-emerald-700' : 'text-base-content/70'
                                            }`}>{o.optionText}</span>
                                            {o.isCorrect && (
                                                <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{'Đáp án đúng'}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Explanation */}
                            {previewQuestion.questionExplanation && (
                                <div className="mt-4 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                    <p className="text-xs font-black text-blue-600 mb-1.5 flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5"/> {'Giải thích đáp án'}
                                    </p>
                                    <p className="text-sm text-base-content/70 leading-relaxed">{previewQuestion.questionExplanation}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-[10px] text-base-content/30 font-medium">{'Đây là giao diện xem trước câu hỏi mà học viên sẽ thấy.'}</p>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setPreviewQuestion(null)} />
                </div>
            )}
            </AnimatePresence>

            {/* Confirm Dialog */}
            <AnimatePresence>
                {confirmDialog && (
                    <OwlConfirmDialog
                        dialog={confirmDialog}
                        onCancel={() => resolveConfirmation(false)}
                        onConfirm={() => resolveConfirmation(true)}
                    />
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 max-w-sm"
                    >
                        <div className={`relative overflow-hidden rounded-[1.75rem] border shadow-2xl ${
                            toast.type === 'error'
                                ? 'border-red-400/20 bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 text-white'
                                : 'border-violet-400/20 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white'
                        }`}>
                            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                            <div className="relative flex items-start gap-3 p-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur">
                                    <span className="text-2xl leading-none">🦉</span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black leading-tight">{toast.title}</p>
                                            <p className="mt-1 text-sm leading-relaxed text-white/85">
                                                {toast.message}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={dismissToast}
                                            className="btn btn-ghost btn-xs btn-circle border-none text-white/80 hover:bg-white/10 hover:text-white"
                                            aria-label="Đóng thông báo"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
                                        {toast.type === 'error'
                                            ? <AlertCircle className="w-3.5 h-3.5" />
                                            : <Check className="w-3.5 h-3.5" />
                                        }
                                        <span>{toast.type === 'error' ? 'Cần kiểm tra lại' : 'Đã cập nhật thành công'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ExpertLayout>
    );
}
