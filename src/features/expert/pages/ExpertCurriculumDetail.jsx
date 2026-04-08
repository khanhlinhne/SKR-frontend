import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import courseApi from '@/shared/api/courseApi';
import { flashcardApi, uploadApi } from '@/shared/api';
import AddQuestionModal from '@/features/expert/components/AddQuestionModal';
import DocumentPreviewContent from '@/features/expert/components/DocumentPreviewContent';
import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';
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
    quiz: { label: 'Trắc nghiệm', icon: HelpCircle, color: 'text-amber-500 bg-amber-500/10', gradient: 'from-amber-500 to-orange-500' },
};

const addableLessonTypes = ['video', 'flashcard'];
const getLessonFlashcardSets = (content) => (
    Array.isArray(content?.flashcardSets)
        ? content.flashcardSets
        : Array.isArray(content?.flashcards)
            ? content.flashcards
            : []
);
const getFlashcardSetId = (set) => set?.flashcardSetId || set?.id || null;
const getFlashcardItemId = (item) => item?.flashcardItemId || item?.id || null;
const MAX_FLASHCARD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function createFlashcardDraft(id) {
    return {
        id,
        frontText: '',
        backText: '',
        frontImageUrl: '',
        backImageUrl: '',
    };
}

function extractUploadedImageUrl(response) {
    const payload = response?.data?.data || response?.data || response || {};
    return payload.imageUrl || payload.url || payload.secure_url || payload.fileUrl || payload.path || '';
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
                    {'\u0054h\u00eam ch\u01b0\u01a1ng m\u1edbi'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'\u004d\u00e3 ch\u01b0\u01a1ng'} <span className="text-red-500">*</span></span>
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
                            <span className="label-text font-bold text-xs">{'\u0054\u00ean ch\u01b0\u01a1ng'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: Gi\u1edbi thi\u1ec7u React"
                            value={form.chapterName}
                            onChange={e => setForm(f => ({ ...f, chapterName: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'\u004d\u00f4 t\u1ea3 (t\u00f9y ch\u1ecdn)'} </span>
                        </label>
                        <textarea
                            placeholder="M\u00f4 t\u1ea3 n\u1ed9i dung ch\u01b0\u01a1ng..."
                            value={form.chapterDescription}
                            onChange={e => setForm(f => ({ ...f, chapterDescription: e.target.value }))}
                            className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none"
                            rows={2}
                        />
                    </div>
                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">{'H\u1ee7y'}</button>
                        <button
                            type="submit"
                            disabled={loading || !form.chapterName.trim() || !form.chapterCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {'\u0054h\u00eam ch\u01b0\u01a1ng'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

// ===== ADD LESSON MODAL =====
function AddLessonModal({ open, onClose, onSubmit, loading, chapterName }) {
    const [form, setForm] = useState({ lessonName: '', lessonCode: '', lessonType: 'video' });

    useEffect(() => {
        if (open) setForm({ lessonName: '', lessonCode: '', lessonType: 'video' });
    }, [open]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.lessonName.trim()) return;
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
                    {'\u0054h\u00eam b\u00e0i gi\u1ea3ng'}
                </h3>
                {chapterName && (
                    <p className="text-xs text-base-content/50 mt-1">
                        {'\u0056\u00e0o ch\u01b0\u01a1ng:'} <span className="font-bold text-violet-600">{chapterName}</span>
                    </p>
                )}
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'\u004d\u00e3 b\u00e0i gi\u1ea3ng'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: LS01"
                            value={form.lessonCode}
                            onChange={e => setForm(f => ({ ...f, lessonCode: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'\u0054\u00ean b\u00e0i gi\u1ea3ng'} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: React l\u00e0 g\u00ec?"
                            value={form.lessonName}
                            onChange={e => setForm(f => ({ ...f, lessonName: e.target.value }))}
                            className="input input-bordered input-sm rounded-xl w-full font-medium"
                            autoFocus
                            required
                        />
                    </div>
                    {/* Lesson type selection */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs">{'\u004c\u006f\u1ea1i b\u00e0i gi\u1ea3ng'}</span>
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
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">{'H\u1ee7y'}</button>
                        <button
                            type="submit"
                            disabled={loading || !form.lessonName.trim() || !form.lessonCode.trim()}
                            className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {'\u0054h\u00eam b\u00e0i'}
                        </button>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
        </div>
    );
}

function AddFlashcardCardModal({ open, onClose, onSubmit, loading, setTitle, nextOrder }) {
    const nextDraftIdRef = useRef(2);
    const [cards, setCards] = useState(() => [createFlashcardDraft(1)]);
    const [uploadingSlots, setUploadingSlots] = useState({});
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (open) {
            nextDraftIdRef.current = 2;
            setCards([createFlashcardDraft(1)]);
            setUploadingSlots({});
            setFormError('');
        }
    }, [open]);

    if (!open) return null;

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
            setFormError('Chi ho tro tep anh cho flashcard.');
            return;
        }

        if (file.size > MAX_FLASHCARD_IMAGE_SIZE_BYTES) {
            setFormError('Anh qua lon. Vui long chon anh duoi 5MB.');
            return;
        }

        const imageField = side === 'front' ? 'frontImageUrl' : 'backImageUrl';

        setFormError('');
        setSlotUploading(cardId, side, true);
        try {
            const response = await uploadApi.uploadImage(file);
            const imageUrl = resolveFlashcardImageUrl(extractUploadedImageUrl(response));
            if (!imageUrl) {
                throw new Error('Khong nhan duoc URL anh tu may chu.');
            }
            updateCard(cardId, imageField, imageUrl);
        } catch (error) {
            setFormError(error?.response?.data?.message || error?.message || 'Khong the tai anh len. Vui long thu lai.');
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
            setFormError('Moi the can co du mat truoc va mat sau. Hay dien du hoac xoa dong dang nhap do.');
            return null;
        }

        const validCards = cards
            .filter((card) => (card.frontText.trim() || card.frontImageUrl) && (card.backText.trim() || card.backImageUrl))
            .map((card, index) => ({
                frontText: card.frontText.trim(),
                backText: card.backText.trim(),
                frontImageUrl: resolveFlashcardImageUrl(card.frontImageUrl) || null,
                backImageUrl: resolveFlashcardImageUrl(card.backImageUrl) || null,
                cardOrder: (nextOrder ?? 0) + index,
            }));

        if (validCards.length === 0) {
            setFormError('Hay nhap it nhat mot the hoan chinh truoc khi luu.');
            return null;
        }

        if (Object.values(uploadingSlots).some(Boolean)) {
            setFormError('Anh dang tai len. Vui long doi hoan tat truoc khi luu.');
            return null;
        }

        setFormError('');
        return validCards;
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
                        <h3 className="font-black text-xl text-base-content">Them the flashcard</h3>
                        <p className="mt-1 text-sm text-base-content/55">
                            Nhap nhanh mat truoc va mat sau de tao nhieu the lien tiep cho bai hoc.
                        </p>
                        {setTitle && (
                            <p className="mt-2 text-xs text-base-content/50">
                                Bo: <span className="font-bold text-indigo-600">{setTitle}</span>
                            </p>
                        )}
                    </div>
                    </div>
                    <button
                        type="button"
                        onClick={addCard}
                        className="btn btn-sm rounded-xl border-indigo-200 bg-white font-bold text-indigo-600 hover:bg-indigo-50"
                    >
                        <Plus className="w-4 h-4" />
                        Them the
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div className="max-h-[62vh] space-y-4 overflow-y-auto pr-1">
                        {cards.map((card, index) => (
                            <div key={card.id} className="rounded-[28px] border border-base-300/80 bg-white/95 p-4 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        The {index + 1}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeCard(card.id)}
                                        className="btn btn-ghost btn-xs rounded-full text-base-content/50 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid gap-4 xl:grid-cols-2">
                                    <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-indigo-500">
                                            Mat truoc <span className="text-red-500">*</span>
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
                                                Tai anh mat truoc
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
                                                    Dang tai anh...
                                                </span>
                                            )}
                                            {card.frontImageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => clearCardImage(card.id, 'front')}
                                                    className="btn btn-ghost btn-xs rounded-full text-red-500"
                                                >
                                                    Xoa anh
                                                </button>
                                            )}
                                        </div>
                                        {card.frontImageUrl && (
                                            <img
                                                src={resolveFlashcardImageUrl(card.frontImageUrl)}
                                                alt={`Front preview ${index + 1}`}
                                                className="mt-3 h-32 w-full rounded-2xl border border-base-300 object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-violet-500">
                                            Mat sau <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={card.backText}
                                            onChange={(e) => updateCard(card.id, 'backText', e.target.value)}
                                            placeholder="Giai thich ngan gon, ghi nho chinh hoac dap an..."
                                            className="textarea textarea-bordered min-h-[150px] w-full rounded-2xl border-violet-100 bg-violet-50/30 text-sm font-medium resize-none focus:border-violet-300 focus:outline-none"
                                            rows={6}
                                        />
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <label className="btn btn-sm rounded-xl border-violet-200 bg-white font-bold text-violet-600 hover:bg-violet-50">
                                                <Upload className="w-4 h-4" />
                                                Tai anh mat sau
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
                                                    Dang tai anh...
                                                </span>
                                            )}
                                            {card.backImageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => clearCardImage(card.id, 'back')}
                                                    className="btn btn-ghost btn-xs rounded-full text-red-500"
                                                >
                                                    Xoa anh
                                                </button>
                                            )}
                                        </div>
                                        {card.backImageUrl && (
                                            <img
                                                src={resolveFlashcardImageUrl(card.backImageUrl)}
                                                alt={`Back preview ${index + 1}`}
                                                className="mt-3 h-32 w-full rounded-2xl border border-base-300 object-cover"
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
                            {nextOrder != null ? `The tiep theo: ${nextOrder + 1}` : 'Co the them nhieu the lien tiep'}
                        </div>
                        <div className="flex items-center gap-2">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-ghost rounded-xl font-bold">Huy</button>
                        <button
                            type="button"
                            onClick={handleSubmitAndContinue}
                            disabled={loading}
                            className="btn btn-sm rounded-xl border-indigo-200 bg-white font-bold text-indigo-600 hover:bg-indigo-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Luu va them tiep
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none rounded-xl font-bold gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Luu cac the
                        </button>
                        </div>
                    </div>
                </form>
            </motion.div>
            <div className="modal-backdrop bg-black/40" onClick={onClose} />
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

    // Lesson content states
    const [selectedLesson, setSelectedLesson] = useState(null); // {chapterId, lessonId}
    const [lessonContent, setLessonContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [showAddVideo, setShowAddVideo] = useState(null); // {chapterId, lessonId}
    const [showAddDocument, setShowAddDocument] = useState(null);
    const [showAddQuestion, setShowAddQuestion] = useState(null);
    const [showAddFlashcardCard, setShowAddFlashcardCard] = useState(null);
    const [creatingFlashcardLessonKey, setCreatingFlashcardLessonKey] = useState(null);
    const [lessonTypeOverrides, setLessonTypeOverrides] = useState({});
    const [flashcardItemsBySet, setFlashcardItemsBySet] = useState({});
    const [loadingFlashcardItems, setLoadingFlashcardItems] = useState(false);
    const [previewingFlashcardSetId, setPreviewingFlashcardSetId] = useState(null);

    // Preview states
    const [previewVideo, setPreviewVideo] = useState(null);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewQuestion, setPreviewQuestion] = useState(null);

    // ===== TOAST HELPER =====
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
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

        const explicitType = String(lesson?.lessonType || lesson?.type || '').trim().toLowerCase();
        if (lessonTypeConfig[explicitType]) {
            return explicitType;
        }

        return 'video';
    }, [lessonTypeOverrides]);

    const loadFlashcardItemsForSets = useCallback(async (sets) => {
        const validSets = (sets || []).filter((set) => getFlashcardSetId(set));

        if (validSets.length === 0) {
            setFlashcardItemsBySet({});
            return;
        }

        setLoadingFlashcardItems(true);
        try {
            const entries = await Promise.all(
                validSets.map(async (set) => {
                    const setId = getFlashcardSetId(set);
                    const response = await flashcardApi.getItems(setId, { limit: 200 });
                    const items = response?.data?.items || response?.data || response?.items || response || [];
                    return [setId, Array.isArray(items) ? items : []];
                }),
            );

            setFlashcardItemsBySet(Object.fromEntries(entries));
        } catch (err) {
            console.error('[CurriculumDetail] failed to load flashcard items:', err);
            setFlashcardItemsBySet({});
        } finally {
            setLoadingFlashcardItems(false);
        }
    }, []);

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
                setChapters(chaptersFromCourse);
                // Auto-expand first chapter
                setExpandedChapters(new Set([chaptersFromCourse[0]?.chapterId || chaptersFromCourse[0]?.id]));
            } else {
                // Fallback: fetch chapters separately
                try {
                    const chapRes = await courseApi.getChapters(courseId);
                    const chapData = chapRes?.data || chapRes || [];
                    const chapArray = Array.isArray(chapData) ? chapData : chapData?.chapters || [];
                    setChapters(chapArray);
                    if (chapArray.length > 0) {
                        setExpandedChapters(new Set([chapArray[0]?.chapterId || chapArray[0]?.id]));
                    }
                } catch {
                    setChapters([]);
                }
            }
        } catch (err) {
            console.error('[CurriculumDetail] fetch error:', err);
            setError(err.response?.data?.message || '\u004b\u0068\u00f4ng th\u1ec3 t\u1ea3i th\u00f4ng tin kh\u00f3a h\u1ecdc.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

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
            showToast(`\u0110\u00e3 th\u00eam ch\u01b0\u01a1ng "${form.chapterName}"`);
            setShowAddChapter(false);
            await fetchCourseData();
        } catch (err) {
            showToast(err.response?.data?.message || '\u0054h\u00eam ch\u01b0\u01a1ng th\u1ea5t b\u1ea1i', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== DELETE CHAPTER =====
    const handleDeleteChapter = async (chapter) => {
        const chId = chapter.chapterId || chapter.id;
        if (!window.confirm(`\u0058\u00f3a ch\u01b0\u01a1ng "${chapter.chapterName}"? T\u1ea5t c\u1ea3 b\u00e0i gi\u1ea3ng trong ch\u01b0\u01a1ng s\u1ebd b\u1ecb x\u00f3a.`)) return;

        setSaving(true);
        try {
            await courseApi.deleteChapter(courseId, chId);
            showToast(`\u0110\u00e3 x\u00f3a ch\u01b0\u01a1ng "${chapter.chapterName}"`);
            setChapters(prev => prev.filter(c => (c.chapterId || c.id) !== chId));
        } catch (err) {
            showToast(err.response?.data?.message || '\u0058\u00f3a ch\u01b0\u01a1ng th\u1ea5t b\u1ea1i', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== ADD LESSON =====
    const createFlashcardSetForLesson = useCallback(async ({ chapterId, lessonId, lessonName }) => {
        const lessonKey = `${chapterId}-${lessonId}`;
        setCreatingFlashcardLessonKey(lessonKey);
        try {
            const response = await flashcardApi.createSet({
                setTitle: `${lessonName} - Flashcard`,
                setDescription: `\u0042\u1ed9 flashcard cho b\u00e0i gi\u1ea3ng "${lessonName}"`,
                lessonId,
                courseId,
                visibility: 'premium_only',
                status: 'active',
                tags: ['lesson-flashcard'],
            });

            const payload = response?.data?.data || response?.data || response;
            return payload?.flashcardSetId || payload?.id || null;
        } finally {
            setCreatingFlashcardLessonKey(prev => (prev === lessonKey ? null : prev));
        }
    }, [courseId]);

    const handleAddLesson = async (form) => {
        const chapterId = showAddLesson;
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
            const optimisticLesson = {
                ...createdLesson,
                lessonId: createdLessonId,
                lessonCode: form.lessonCode,
                lessonName: form.lessonName,
                lessonType: form.lessonType,
                type: form.lessonType,
                totalFlashcardSets: shouldCreateFlashcardSet ? 1 : (createdLesson?.totalFlashcardSets || 0),
                hasFlashcardSet: shouldCreateFlashcardSet ? true : Boolean(createdLesson?.hasFlashcardSet),
            };

            if (createdLessonId) {
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
                    showToast(`\u0110\u00e3 th\u00eam b\u00e0i "${form.lessonName}" v\u00e0 t\u1ea1o b\u1ed9 flashcard`);
                } catch (flashcardErr) {
                    showToast(
                        flashcardErr.response?.data?.message
                        || '\u0110\u00e3 t\u1ea1o b\u00e0i gi\u1ea3ng nh\u01b0ng ch\u01b0a t\u1ea1o \u0111\u01b0\u1ee3c b\u1ed9 flashcard t\u1ef1 \u0111\u1ed9ng',
                        'error',
                    );
                }
            } else {
                showToast(`\u0110\u00e3 th\u00eam b\u00e0i "${form.lessonName}"`);
            }

            setShowAddLesson(null);
            await fetchCourseData();

            if (shouldCreateFlashcardSet) {
                await loadLessonContent(chapterId, createdLessonId, optimisticLesson);
            }
        } catch (err) {
            showToast(err.response?.data?.message || '\u0054h\u00eam b\u00e0i gi\u1ea3ng th\u1ea5t b\u1ea1i', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ===== DELETE LESSON =====
    const handleDeleteLesson = async (chapterId, lesson) => {
        const lsId = lesson.lessonId || lesson.id;
        if (!window.confirm(`\u0058\u00f3a b\u00e0i "${lesson.lessonName}"?`)) return;

        setSaving(true);
        try {
            await courseApi.deleteLesson(courseId, chapterId, lsId);
            showToast(`\u0110\u00e3 x\u00f3a b\u00e0i "${lesson.lessonName}"`);
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
                setFlashcardItemsBySet({});
            }
        } catch (err) {
            showToast(err.response?.data?.message || '\u0058\u00f3a b\u00e0i th\u1ea5t b\u1ea1i', 'error');
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
            showToast('\u0110\u00e3 c\u1eadp nh\u1eadt t\u00ean ch\u01b0\u01a1ng');
        } catch (err) {
            showToast(err.response?.data?.message || '\u0043\u1eadp nh\u1eadt th\u1ea5t b\u1ea1i', 'error');
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
            showToast('\u0110\u00e3 c\u1eadp nh\u1eadt t\u00ean b\u00e0i gi\u1ea3ng');
        } catch (err) {
            showToast(err.response?.data?.message || '\u0043\u1eadp nh\u1eadt th\u1ea5t b\u1ea1i', 'error');
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

    const handleCreateLessonFlashcardSet = async (chapterId, lesson) => {
        const lessonId = lesson?.lessonId || lesson?.id;
        if (!lessonId) {
            return;
        }

        try {
            await createFlashcardSetForLesson({
                chapterId,
                lessonId,
                lessonName: lesson?.lessonName || lesson?.title || '\u0042\u00e0i h\u1ecdc',
            });
            showToast('\u0110\u00e3 t\u1ea1o b\u1ed9 flashcard cho b\u00e0i gi\u1ea3ng');
            setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'flashcard' }));
            await loadLessonContent(chapterId, lessonId, {
                ...lesson,
                lessonType: 'flashcard',
                type: 'flashcard',
            });
            await fetchCourseData();
        } catch (err) {
            showToast(err.response?.data?.message || '\u004b\u0068\u00f4ng th\u1ec3 t\u1ea1o b\u1ed9 flashcard cho b\u00e0i gi\u1ea3ng', 'error');
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
            const flashcardSets = getLessonFlashcardSets(content);

            if (resolvedLessonType === 'flashcard' || flashcardSets.length > 0) {
                setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'flashcard' }));
            }

            setLessonContent({
                ...content,
                lessonType: flashcardSets.length > 0 ? 'flashcard' : resolvedLessonType,
            });
            await loadFlashcardItemsForSets(flashcardSets);
        } catch {
            setLessonContent({
                lessonType: resolvedLessonType,
                videos: [],
                documents: [],
                questions: [],
                flashcardSets: [],
            });
            setFlashcardItemsBySet({});
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
            setFlashcardItemsBySet({});
            return;
        }

        await loadLessonContent(chapterId, lessonId, lesson);
    };

    const handleAddVideo = async (form) => {
        const { chapterId, lessonId } = showAddVideo;
        setSaving(true);
        try {
            await courseApi.addVideo(courseId, chapterId, lessonId, form);
            showToast('\u0110\u00e3 th\u00eam video');
            setShowAddVideo(null);
            await loadLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || '\u0054h\u00eam video th\u1ea5t b\u1ea1i', 'error'); }
        finally { setSaving(false); }
    };

    const handleDeleteVideo = async (chapterId, lessonId, videoId) => {
        if (!window.confirm('\u0058\u00f3a video n\u00e0y?')) return;
        setSaving(true);
        try {
            await courseApi.deleteVideo(courseId, chapterId, lessonId, videoId);
            showToast('\u0110\u00e3 x\u00f3a video');
            await loadLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || '\u0058\u00f3a th\u1ea5t b\u1ea1i', 'error'); }
        finally { setSaving(false); }
    };

    const handleAddDocument = async (form) => {
        const { chapterId, lessonId } = showAddDocument;

        const documentTitle = form.documentTitle?.trim();
        const fileUrl = form.fileUrl?.trim();
        const hasFile = form.file instanceof File;

        if (!documentTitle) {
            showToast('\u0056ui l\u00f2ng nh\u1eadp ti\u00eau \u0111\u1ec1 t\u00e0i li\u1ec7u', 'error');
            return;
        }

        if (!hasFile && !fileUrl) {
            showToast('\u0056ui l\u00f2ng ch\u1ecdn file t\u1ea3i l\u00ean ho\u1eb7c nh\u1eadp URL t\u00e0i li\u1ec7u', 'error');
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

            showToast('\u0110\u00e3 th\u00eam t\u00e0i li\u1ec7u');
            setShowAddDocument(null);
            await loadLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || '\u0054h\u00eam t\u00e0i li\u1ec7u th\u1ea5t b\u1ea1i', 'error'); }
        finally { setSaving(false); }
    };

    const handleDeleteDocument = async (chapterId, lessonId, docId) => {
        if (!window.confirm('\u0058\u00f3a t\u00e0i li\u1ec7u n\u00e0y?')) return;
        setSaving(true);
        try {
            await courseApi.deleteDocument(courseId, chapterId, lessonId, docId);
            showToast('\u0110\u00e3 x\u00f3a t\u00e0i li\u1ec7u');
            await loadLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || '\u0058\u00f3a th\u1ea5t b\u1ea1i', 'error'); }
        finally { setSaving(false); }
    };

    const handleAddQuestion = async (form) => {
        const { chapterId, lessonId } = showAddQuestion;
        setSaving(true);
        try {
            await courseApi.addQuestion(courseId, chapterId, lessonId, form);
            showToast('\u0110\u00e3 th\u00eam c\u00e2u h\u1ecfi');
            setShowAddQuestion(null);
            await loadLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || '\u0054h\u00eam c\u00e2u h\u1ecfi th\u1ea5t b\u1ea1i', 'error'); }
        finally { setSaving(false); }
    };

    const handleDeleteQuestion = async (chapterId, lessonId, qId) => {
        if (!window.confirm('\u0058\u00f3a c\u00e2u h\u1ecfi n\u00e0y?')) return;
        setSaving(true);
        try {
            await courseApi.deleteQuestion(courseId, chapterId, lessonId, qId);
            showToast('\u0110\u00e3 x\u00f3a c\u00e2u h\u1ecfi');
            await loadLessonContent(chapterId, lessonId);
        } catch (err) { showToast(err.response?.data?.message || '\u0058\u00f3a th\u1ea5t b\u1ea1i', 'error'); }
        finally { setSaving(false); }
    };

    const handleAddFlashcardCard = async (form, options = {}) => {
        if (!showAddFlashcardCard?.setId) {
            return;
        }

        const { chapterId, lessonId, setId } = showAddFlashcardCard;
        const payloadItems = Array.isArray(form) ? form : [form];
        setSaving(true);
        try {
            await Promise.all(payloadItems.map((item) => flashcardApi.createItem(setId, item)));
            showToast(payloadItems.length > 1 ? `Da them ${payloadItems.length} the flashcard` : 'Da them the flashcard');
            setShowAddFlashcardCard((prev) => {
                if (!options.keepOpen || !prev) {
                    return null;
                }

                return {
                    ...prev,
                    nextOrder: (prev.nextOrder ?? 0) + payloadItems.length,
                };
            });
            await loadLessonContent(chapterId, lessonId, {
                ...getLessonById(chapterId, lessonId),
                lessonType: 'flashcard',
                type: 'flashcard',
            });
            await fetchCourseData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Khong the them the flashcard', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFlashcardCard = async (chapterId, lessonId, setId, itemId) => {
        if (!setId || !itemId) {
            return;
        }

        if (!window.confirm('Xoa the flashcard nay?')) return;

        setSaving(true);
        try {
            await flashcardApi.deleteItem(setId, itemId);
            showToast('Da xoa the flashcard');
            await loadLessonContent(chapterId, lessonId, {
                ...getLessonById(chapterId, lessonId),
                lessonType: 'flashcard',
                type: 'flashcard',
            });
            await fetchCourseData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Khong the xoa the flashcard', 'error');
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
                    <div className="text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
                        <p className="text-sm text-base-content/50 font-medium">{'\u0110ang t\u1ea3i ch\u01b0\u01a1ng tr\u00ecnh h\u1ecdc...'}</p>
                    </div>
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
                                {'\u0051\u0075\u0061\u0079 \u006c\u1ea1i'}
                            </Link>
                            <button onClick={fetchCourseData} className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5">
                                <RefreshCw className="w-4 h-4" />
                                {'\u0054h\u1eed l\u1ea1i'}
                            </button>
                        </div>
                    </div>
                </div>
            </ExpertLayout>
        );
    }

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Link to="/expert/curriculum" className="text-sm text-base-content/50 font-medium hover:text-violet-600 transition-colors">
                                {'\u0043\u0068\u01b0\u01a1ng tr\u00ecnh h\u1ecdc'}
                            </Link>
                            <ChevronRight className="w-3 h-3 text-base-content/30" />
                            <span className="text-sm text-violet-600 font-bold truncate max-w-[300px]">
                                {course?.courseName || '\u004b\u0068\u00f3\u0061 \u0068\u1ecdc'}
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">
                            {chapters.length === 0 ? '\u0054\u1ea1o \u0043\u0068\u01b0\u01a1ng tr\u00ecnh h\u1ecdc' : '\u0051\u0075\u1ea3n l\u00fd \u0043\u0068\u01b0\u01a1ng tr\u00ecnh h\u1ecdc'}
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            {chapters.length === 0
                                ? '\u0042\u1eaft \u0111\u1ea7u x\u00e2y d\u1ef1ng n\u1ed9i dung kh\u00f3a h\u1ecdc b\u1eb1ng c\u00e1ch th\u00eam c\u00e1c ch\u01b0\u01a1ng v\u00e0 b\u00e0i gi\u1ea3ng'
                                : '\u0043\u0068\u1ec9nh s\u1eeda, th\u00eam ho\u1eb7c x\u00f3a ch\u01b0\u01a1ng v\u00e0 b\u00e0i gi\u1ea3ng'
                            }
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/expert/curriculum" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <ArrowLeft className="w-4 h-4" />
                            {'\u0051\u0075\u0061\u0079 \u006c\u1ea1i'}
                        </Link>
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <Eye className="w-4 h-4" />
                            {'\u0058\u0065\u006d tr\u01b0\u1edbc'}
                        </button>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: '\u0043\u0068\u01b0\u01a1ng', value: chapters.length, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        { label: '\u0042\u00e0i gi\u1ea3ng', value: totalLessons, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: '\u0054\u0072\u1ea1ng th\u00e1i', value: course?.status === 'published' ? '\u0110\u00e3 xu\u1ea5t b\u1ea3n' : '\u0042\u1ea3n nh\u00e1p', icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: '\u004d\u00e3 kh\u00f3a h\u1ecdc', value: course?.courseCode || '\u2014', icon: Hash, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
                        <h3 className="text-lg font-black text-base-content mb-2">{'\u004b\u0068\u00f3a h\u1ecdc ch\u01b0a c\u00f3 n\u1ed9i dung'}</h3>
                        <p className="text-sm text-base-content/50 max-w-md mx-auto mb-5">
                            {'\u0042\u1eaft \u0111\u1ea7u x\u00e2y d\u1ef1ng ch\u01b0\u01a1ng tr\u00ecnh h\u1ecdc b\u1eb1ng c\u00e1ch th\u00eam ch\u01b0\u01a1ng \u0111\u1ea7u ti\u00ean. M\u1ed7i ch\u01b0\u01a1ng s\u1ebd ch\u1ee9a c\u00e1c b\u00e0i gi\u1ea3ng nh\u01b0 video, t\u00e0i li\u1ec7u ho\u1eb7c flashcard.'}
                        </p>
                        <button
                            onClick={() => setShowAddChapter(true)}
                            className="btn bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-black shadow-lg shadow-violet-500/25 gap-2"
                        >
                            <FolderPlus className="w-5 h-5" />
                            {'\u0054h\u00eam ch\u01b0\u01a1ng \u0111\u1ea7u ti\u00ean'}
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
                                                <p className="text-xs text-base-content/50">{`${lessons.length} b\u00e0i gi\u1ea3ng`}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => startEdit(chId, chapter.chapterName)}
                                            className="btn btn-ghost btn-xs btn-circle"
                                            title={'\u0110\u1ed5i t\u00ean'}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteChapter(chapter)}
                                            className="btn btn-ghost btn-xs btn-circle text-red-500"
                                            title={'\u0058\u00f3a ch\u01b0\u01a1ng'}
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
                                                        <p className="text-sm text-base-content/40 font-medium">{'Ch\u01b0a c\u00f3 b\u00e0i gi\u1ea3ng n\u00e0o'}</p>
                                                        <p className="text-xs text-base-content/30">{'Nh\u1ea5n n\u00fat b\u00ean d\u01b0\u1edbi \u0111\u1ec3 th\u00eam b\u00e0i gi\u1ea3ng \u0111\u1ea7u ti\u00ean'}</p>
                                                        <p className="text-xs text-base-content/30">{'B\u1ea1n c\u00f3 th\u1ec3 b\u1eaft \u0111\u1ea7u b\u1eb1ng video ho\u1eb7c flashcard cho ch\u01b0\u01a1ng n\u00e0y.'}</p>
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
                                                    const ltConfig = lessonTypeConfig[resolvedLessonType] || lessonTypeConfig.video;
                                                    const LessonIcon = ltConfig.icon;
                                                    const lessonFlashcards = isCurrentLessonSelected ? getLessonFlashcardSets(lessonContent) : [];
                                                    const isCreatingLessonFlashcard = creatingFlashcardLessonKey === `${chId}-${lsId}`;

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
                                                                    <button onClick={() => startEdit(lsId, lesson.lessonName)} className="btn btn-ghost btn-xs btn-circle" title={'\u0110\u1ed5i t\u00ean'}><Pencil className="w-3 h-3" /></button>
                                                                    <button onClick={() => handleDeleteLesson(chId, lesson)} className="btn btn-ghost btn-xs btn-circle text-red-500" title={'X\u00f3a b\u00e0i'} disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                </div>
                                                                <ChevronDown className={`w-4 h-4 text-base-content/30 transition-transform ${isLessonSelected(chId, lsId) ? 'rotate-180 text-violet-500' : ''}`} />
                                                        </motion.div>

                                                        {/* ===== LESSON CONTENT PANEL ===== */}
                                                        <AnimatePresence>
                                                        {isLessonSelected(chId, lsId) && (
                                                            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
                                                                <div className="ml-11 mr-3 mb-2 mt-1 p-3 rounded-xl bg-base-200/50 border border-base-300 space-y-3">
                                                                    {loadingContent ? (
                                                                        <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-violet-500" /><span className="ml-2 text-xs text-base-content/50">{'\u0110ang t\u1ea3i n\u1ed9i dung...'}</span></div>
                                                                    ) : (
                                                                        <>
                                                                        {!isFlashcardLesson && (
                                                                            <>
                                                                        {/* Videos */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-blue-600 flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" />{'Video'} ({lessonContent?.videos?.length || 0})</span>
                                                                                <button onClick={(e) => {e.stopPropagation(); setShowAddVideo({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-blue-600 gap-1 rounded-lg"><Plus className="w-3 h-3" />{'\u0054h\u00eam'}</button>
                                                                            </div>
                                                                            {(lessonContent?.videos || []).map(v => (
                                                                                <div key={v.videoId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-base-100 border border-base-300 mb-1">
                                                                                    <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-xs font-bold truncate">{v.videoTitle}</p>
                                                                                        <p className="text-[10px] text-base-content/40 truncate">{v.videoUrl}</p>
                                                                                    </div>
                                                                                    <button onClick={(e) => { e.stopPropagation(); setPreviewVideo(v); }} className="btn btn-ghost btn-xs btn-circle text-blue-500 hover:bg-blue-500/10" title={'Xem tr\u01b0\u1edbc'}><Eye className="w-3 h-3" /></button>
                                                                                    <a href={v.videoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs btn-circle"><ExternalLink className="w-3 h-3" /></a>
                                                                                    <button onClick={() => handleDeleteVideo(chId, lsId, v.videoId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                                </div>
                                                                            ))}
                                                                            {(lessonContent?.videos?.length || 0) === 0 && <p className="text-[10px] text-base-content/30 italic">{'Ch\u01b0a c\u00f3 video'}</p>}
                                                                        </div>

                                                                        {/* Documents */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-emerald-600 flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{'\u0054\u00e0i li\u1ec7u'} ({lessonContent?.documents?.length || 0})</span>
                                                                                <button onClick={(e) => {e.stopPropagation(); setShowAddDocument({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-emerald-600 gap-1 rounded-lg"><Plus className="w-3 h-3" />{'\u0054h\u00eam'}</button>
                                                                            </div>
                                                                            {(lessonContent?.documents || []).map(d => (
                                                                                <div key={d.documentId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-base-100 border border-base-300 mb-1">
                                                                                    <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-xs font-bold truncate">{d.documentTitle}</p>
                                                                                        <p className="text-[10px] text-base-content/40">{d.fileType || 'file'}{d.fileName ? ` \u2022 ${d.fileName}` : ''}</p>
                                                                                    </div>
                                                                                    <button onClick={(e) => { e.stopPropagation(); setPreviewDocument(d); }} className="btn btn-ghost btn-xs btn-circle text-emerald-500 hover:bg-emerald-500/10" title={'Xem tr\u01b0\u1edbc'}><Eye className="w-3 h-3" /></button>
                                                                                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs btn-circle"><ExternalLink className="w-3 h-3" /></a>
                                                                                    <button onClick={() => handleDeleteDocument(chId, lsId, d.documentId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                                </div>
                                                                            ))}
                                                                            {(lessonContent?.documents?.length || 0) === 0 && <p className="text-[10px] text-base-content/30 italic">{'Ch\u01b0a c\u00f3 t\u00e0i li\u1ec7u'}</p>}
                                                                        </div>

                                                                        {/* Questions */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-amber-600 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" />{'C\u00e2u h\u1ecfi'} ({lessonContent?.questions?.length || 0})</span>
                                                                                <button onClick={(e) => {e.stopPropagation(); setShowAddQuestion({chapterId:chId,lessonId:lsId});}} className="btn btn-xs btn-ghost text-amber-600 gap-1 rounded-lg"><Plus className="w-3 h-3" />{'\u0054h\u00eam'}</button>
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
                                                                                        <button onClick={(e) => { e.stopPropagation(); setPreviewQuestion(q); }} className="btn btn-ghost btn-xs btn-circle text-amber-500 hover:bg-amber-500/10" title={'Xem tr\u01b0\u1edbc'}><Eye className="w-3 h-3" /></button>
                                                                                        <button onClick={() => handleDeleteQuestion(chId, lsId, q.questionId)} className="btn btn-ghost btn-xs btn-circle text-red-500" disabled={saving}><Trash2 className="w-3 h-3" /></button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            {(lessonContent?.questions?.length || 0) === 0 && <p className="text-[10px] text-base-content/30 italic">{'Ch\u01b0a c\u00f3 c\u00e2u h\u1ecfi'}</p>}
                                                                        </div>

                                                                            </>
                                                                        )}

                                                                        {/* Flashcards */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="text-xs font-black text-indigo-600 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Flashcard ({lessonFlashcards.length})</span>
                                                                                {lessonFlashcards.length === 0 && (
                                                                                    <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        void handleCreateLessonFlashcardSet(chId, lesson);
                                                                                    }}
                                                                                    className="btn btn-xs btn-ghost text-indigo-600 gap-1 rounded-lg"
                                                                                    disabled={isCreatingLessonFlashcard}
                                                                                >
                                                                                    {isCreatingLessonFlashcard ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                                                                    {isCreatingLessonFlashcard ? '\u0110ang t\u1ea1o' : '\u0054h\u00eam'}
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            {lessonFlashcards.map((set) => {
                                                                                const setId = getFlashcardSetId(set);
                                                                                const setItems = setId ? (flashcardItemsBySet[setId] || []) : [];
                                                                                const isPreviewOpen = previewingFlashcardSetId === setId;
                                                                                if (!setId) return null;

                                                                                return (
                                                                                    <div key={setId} className="rounded-lg border border-base-300 bg-base-100 mb-1 p-2">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <p className="text-xs font-bold truncate">{set.setTitle || set.title || '\u0042\u1ed9 flashcard'}</p>
                                                                                                <p className="text-[10px] text-base-content/40">
                                                                                                    {set.totalCards || 0} th\u1ebb \u2022 {set.visibility || 'premium_only'} \u2022 {set.status || 'active'}
                                                                                                </p>
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setShowAddFlashcardCard({
                                                                                                        chapterId: chId,
                                                                                                        lessonId: lsId,
                                                                                                        setId,
                                                                                                        setTitle: set.setTitle || set.title || '\u0042\u1ed9 flashcard',
                                                                                                        nextOrder: setItems.length,
                                                                                                    });
                                                                                                }}
                                                                                                className="btn btn-ghost btn-xs rounded-lg text-indigo-600"
                                                                                                title="\u0054h\u00eam th\u1ebb"
                                                                                            >
                                                                                                <Plus className="w-3 h-3" />
                                                                                                {'\u0054h\u00eam th\u1ebb'}
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setPreviewingFlashcardSetId((prev) => (prev === setId ? null : setId));
                                                                                                }}
                                                                                                className="btn btn-ghost btn-xs rounded-lg text-indigo-600"
                                                                                                title={'Xem tr\u01b0\u1edbc n\u1ed9i dung'}
                                                                                            >
                                                                                                <Eye className="w-3 h-3" />
                                                                                                {isPreviewOpen ? '\u1ea8n xem tr\u01b0\u1edbc' : 'Xem tr\u01b0\u1edbc n\u1ed9i dung'}
                                                                                            </button>
                                                                                        </div>
                                                                                        {isPreviewOpen && (
                                                                                            <div className="ml-6 mt-2 space-y-2">
                                                                                                {loadingFlashcardItems ? (
                                                                                                    <div className="flex items-center gap-2 text-[11px] text-base-content/50">
                                                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                                                                                                        {'\u0110ang t\u1ea3i danh s\u00e1ch th\u1ebb...'}
                                                                                                    </div>
                                                                                                ) : setItems.length > 0 ? (
                                                                                                    setItems.map((item, itemIdx) => {
                                                                                                        const itemId = getFlashcardItemId(item);
                                                                                                        return (
                                                                                                            <div key={itemId || `${setId}-${itemIdx}`} className="grid gap-3 rounded-xl border border-base-300 bg-base-200/40 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                                                                                                                <div className="min-w-0">
                                                                                                                    <p className="text-[10px] font-black uppercase tracking-wide text-indigo-600">{'\u004d\u1eb7t tr\u01b0\u1edbc'}</p>
                                                                                                                    <p className="text-xs text-base-content break-words">{item.frontText || '\u0043h\u01b0a c\u00f3 n\u1ed9i dung'}</p>
                                                                                                                    {item.frontImageUrl && (
                                                                                                                        <img
                                                                                                                            src={resolveFlashcardImageUrl(item.frontImageUrl)}
                                                                                                                            alt={`Flashcard front ${itemIdx + 1}`}
                                                                                                                            className="mt-2 h-24 w-full rounded-xl border border-base-300 object-cover"
                                                                                                                        />
                                                                                                                    )}
                                                                                                                </div>
                                                                                                                <div className="min-w-0">
                                                                                                                    <p className="text-[10px] font-black uppercase tracking-wide text-violet-600">{'\u004d\u1eb7t sau'}</p>
                                                                                                                    <p className="text-xs text-base-content/80 break-words">{item.backText || '\u0043h\u01b0a c\u00f3 n\u1ed9i dung'}</p>
                                                                                                                    {item.backImageUrl && (
                                                                                                                        <img
                                                                                                                            src={resolveFlashcardImageUrl(item.backImageUrl)}
                                                                                                                            alt={`Flashcard back ${itemIdx + 1}`}
                                                                                                                            className="mt-2 h-24 w-full rounded-xl border border-base-300 object-cover"
                                                                                                                        />
                                                                                                                    )}
                                                                                                                </div>
                                                                                                                <div className="flex items-start justify-end">
                                                                                                                    <button
                                                                                                                        onClick={() => handleDeleteFlashcardCard(chId, lsId, setId, itemId)}
                                                                                                                        className="btn btn-ghost btn-xs btn-circle text-red-500"
                                                                                                                        disabled={saving || !itemId}
                                                                                                                        title="\u0058\u00f3a th\u1ebb"
                                                                                                                    >
                                                                                                                        <Trash2 className="w-3 h-3" />
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        );
                                                                                                    })
                                                                                                ) : (
                                                                                                    <p className="text-[10px] text-base-content/30 italic">
                                                                                                        {isFlashcardLesson ? '\u0042\u00e0i gi\u1ea3ng n\u00e0y ch\u01b0a c\u00f3 th\u1ebb n\u00e0o. Nh\u1ea5n Th\u00eam th\u1ebb \u0111\u1ec3 nh\u1eadp m\u1eb7t tr\u01b0\u1edbc v\u00e0 m\u1eb7t sau.' : '\u0042\u1ed9 flashcard n\u00e0y ch\u01b0a c\u00f3 th\u1ebb n\u00e0o'}
                                                                                                    </p>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                            {lessonFlashcards.length === 0 && <p className="text-[10px] text-base-content/30 italic">{'\u0043h\u01b0a c\u00f3 b\u1ed9 flashcard'}</p>}
                                                                        </div>
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
                                                    {'\u0054h\u00eam b\u00e0i gi\u1ea3ng'}
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
                            {'\u0054h\u00eam ch\u01b0\u01a1ng m\u1edbi'}
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
            />
            <AddFlashcardCardModal
                open={!!showAddFlashcardCard}
                onClose={() => setShowAddFlashcardCard(null)}
                onSubmit={handleAddFlashcardCard}
                loading={saving}
                setTitle={showAddFlashcardCard?.setTitle || ''}
                nextOrder={showAddFlashcardCard?.nextOrder}
            />

            {/* Add Video Modal */}
            {showAddVideo && (
                <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 100 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-box rounded-2xl border border-base-300 shadow-2xl">
                        <h3 className="font-black text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><PlayCircle className="w-4 h-4 text-white" /></div>
                            {'\u0054h\u00eam Video'}
                        </h3>
                        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); handleAddVideo({ videoTitle: fd.get('videoTitle'), videoUrl: fd.get('videoUrl'), videoDescription: fd.get('videoDescription') }); }} className="mt-4 space-y-3">
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'Ti\u00eau \u0111\u1ec1 video'} <span className="text-red-500">*</span></span></label>
                                <input name="videoTitle" type="text" placeholder="VD: Gi\u1edbi thi\u1ec7u b\u00e0i h\u1ecdc" className="input input-bordered input-sm rounded-xl w-full font-medium" required autoFocus /></div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">URL Video <span className="text-red-500">*</span></span></label>
                                <input name="videoUrl" type="url" placeholder="https://youtube.com/watch?v=..." className="input input-bordered input-sm rounded-xl w-full font-medium" required /></div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'\u004d\u00f4 t\u1ea3 (t\u00f9y ch\u1ecdn)'}</span></label>
                                <textarea name="videoDescription" placeholder="M\u00f4 t\u1ea3 n\u1ed9i dung video..." className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none" rows={2} /></div>
                            <div className="modal-action">
                                <button type="button" onClick={() => setShowAddVideo(null)} className="btn btn-sm btn-ghost rounded-xl font-bold">{'H\u1ee7y'}</button>
                                <button type="submit" disabled={saving} className="btn btn-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-none rounded-xl font-bold gap-1.5">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {'\u0054h\u00eam video'}
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
                            {'\u0054h\u00eam T\u00e0i li\u1ec7u'}
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
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'Ti\u00eau \u0111\u1ec1'} <span className="text-red-500">*</span></span></label>
                                <input name="documentTitle" type="text" placeholder="VD: Slide b\u00e0i gi\u1ea3ng" className="input input-bordered input-sm rounded-xl w-full font-medium" required autoFocus /></div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'T\u1ea3i file t\u1eeb m\u00e1y'}</span></label>
                                <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" className="file-input file-input-bordered file-input-sm rounded-xl w-full font-medium" /></div>
                            <div className="divider text-[10px] font-bold text-base-content/40 uppercase my-1">{'ho\u1eb7c d\u00f9ng link'}</div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'URL T\u00e0i li\u1ec7u'}</span></label>
                                <input name="fileUrl" type="url" placeholder="https://drive.google.com/..." className="input input-bordered input-sm rounded-xl w-full font-medium" /></div>
                            <div className="flex gap-2">
                                <div className="form-control flex-1"><label className="label py-1"><span className="label-text font-bold text-xs">{'T\u00ean file'}</span></label>
                                    <input name="fileName" type="text" placeholder="document.pdf" className="input input-bordered input-sm rounded-xl w-full font-medium" /></div>
                                <div className="form-control w-28"><label className="label py-1"><span className="label-text font-bold text-xs">{'Lo\u1ea1i file'}</span></label>
                                    <select name="fileType" className="select select-bordered select-sm rounded-xl font-medium"><option value="pdf">PDF</option><option value="doc">DOC</option><option value="docx">DOCX</option><option value="ppt">PPT</option><option value="txt">TXT</option></select></div>
                            </div>
                            <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-xs">{'\u004d\u00f4 t\u1ea3 (t\u00f9y ch\u1ecdn)'}</span></label>
                                <textarea name="documentDescription" placeholder="M\u00f4 t\u1ea3 t\u00e0i li\u1ec7u..." className="textarea textarea-bordered rounded-xl text-sm font-medium resize-none" rows={2} /></div>
                            <div className="modal-action">
                                <button type="button" onClick={() => setShowAddDocument(null)} className="btn btn-sm btn-ghost rounded-xl font-bold">{'H\u1ee7y'}</button>
                                <button type="submit" disabled={saving} className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none rounded-xl font-bold gap-1.5">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {'\u0054h\u00eam t\u00e0i li\u1ec7u'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                    <div className="modal-backdrop bg-black/40" onClick={() => setShowAddDocument(null)} />
                </div>
            )}

            {/* Add Question Modal */}
            {showAddQuestion && <AddQuestionModal open={true} onClose={() => setShowAddQuestion(null)} onSubmit={handleAddQuestion} loading={saving} />}

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
                                {'Xem tr\u01b0\u1edbc Video'}
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
                                    {'Tr\u00ecnh duy\u1ec7t kh\u00f4ng h\u1ed7 tr\u1ee3 ph\u00e1t video.'}
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
                                {'Xem tr\u01b0\u1edbc T\u00e0i li\u1ec7u'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <a href={previewDocument.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 text-emerald-600">
                                    <ExternalLink className="w-3.5 h-3.5"/> {'M\u1edf link g\u1ed1c'}
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
                                {'Xem tr\u01b0\u1edbc C\u00e2u h\u1ecfi'}
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
                                    {previewQuestion.difficultyLevel === 'easy' ? '\u0044\u1ec5' : previewQuestion.difficultyLevel === 'hard' ? '\u004b\u0068\u00f3' : '\u0054\u0072\u0075\u006e\u0067 b\u00ecnh'}
                                </span>
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20">
                                    {previewQuestion.questionType === 'multiple_choice' ? '\u0054\u0072\u1eafc nghi\u1ec7m' : previewQuestion.questionType === 'true_false' ? '\u0110\u00fang/Sai' : '\u0110i\u1ec1n t\u1eeb'}
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
                                                <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{'\u0110\u00e1p \u00e1n \u0111\u00fang'}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Explanation */}
                            {previewQuestion.questionExplanation && (
                                <div className="mt-4 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                    <p className="text-xs font-black text-blue-600 mb-1.5 flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5"/> {'Gi\u1ea3i th\u00edch \u0111\u00e1p \u00e1n'}
                                    </p>
                                    <p className="text-sm text-base-content/70 leading-relaxed">{previewQuestion.questionExplanation}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-[10px] text-base-content/30 font-medium">{'\u0110\u00e2y l\u00e0 giao di\u1ec7n xem tr\u01b0\u1edbc c\u00e2u h\u1ecfi m\u00e0 h\u1ecdc vi\u00ean s\u1ebd th\u1ea5y.'}</p>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setPreviewQuestion(null)} />
                </div>
            )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <div className={`alert shadow-2xl rounded-2xl border-none font-bold text-sm max-w-sm ${
                            toast.type === 'error'
                                ? 'bg-red-500 text-white'
                                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                        }`}>
                            {toast.type === 'error'
                                ? <AlertCircle className="w-5 h-5" />
                                : <Check className="w-5 h-5" />
                            }
                            <span>{toast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ExpertLayout>
    );
}
