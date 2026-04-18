import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { geminiApi, uploadApi } from '@/shared/api';
import {
    DEFAULT_FLASHCARD_DRAFTS,
    MAX_FLASHCARD_IMAGE_SIZE_BYTES,
    createFlashcardDraft,
    extractUploadedImageUrl,
} from '@/features/expert/components/curriculum-detail/curriculumDetailUtils';
import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';
import { Check, Loader2, Plus, Sparkles, Trash2, Upload } from 'lucide-react';

export default function AddFlashcardCardModal({
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
            setAiPrompt(
                setTitle ? setTitle.replace(/\s*-\s*Flashcard\s*$/i, '').trim() : ''
            );
        }
    }, [normalizedInitialCards, open, setTitle]);

    if (!open) return null;

    const isDraftEmpty = (card) => (
        !card.frontText.trim() &&
        !card.backText.trim() &&
        !card.frontImageUrl &&
        !card.backImageUrl
    );

    const updateCard = (cardId, field, value) => {
        setCards((prev) =>
            prev.map((card) => (card.id === cardId ? { ...card, [field]: value } : card))
        );
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
            setFormError('Chỉ hỗ trợ tập tin ảnh cho flashcard.');
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
                throw new Error('Không nhận được URL ảnh từ máy chủ.');
            }

            updateCard(cardId, imageField, imageUrl);
        } catch (error) {
            setFormError(
                error?.response?.data?.message ||
                error?.message ||
                'Không thể tải ảnh lên. Bạn thử lại nhé.'
            );
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
            setFormError('Mỗi thẻ cần đủ cả mặt trước và mặt sau. Hãy điền đủ hoặc xóa những thẻ còn dang dở.');
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
                cardOrder: card.cardOrder ?? (nextOrder ?? 0) + index,
            }));

        if (validCards.length === 0) {
            setFormError('Hãy nhập ít nhất một thẻ hoàn chỉnh trước khi lưu.');
            return null;
        }

        if (Object.values(uploadingSlots).some(Boolean)) {
            setFormError('Ảnh vẫn đang tải lên. Vui lòng chờ hoàn tất trước khi lưu.');
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
            setFormError('Hãy nhập chủ đề, đoạn ghi chú hoặc nội dung bài học để Gemini tạo flashcard.');
            return;
        }

        if (Object.values(uploadingSlots).some(Boolean)) {
            setFormError('Ảnh vẫn đang tải lên. Hãy đợi xong rồi mới dùng Gemini.');
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
            setFormError(error?.message || 'Gemini chưa tạo được nội dung flashcard. Bạn thử lại với mô tả cụ thể hơn.');
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const payload = buildPayload();
        if (!payload) return;
        onSubmit(payload, { keepOpen: false });
    };

    const handleSubmitAndContinue = () => {
        const payload = buildPayload();
        if (!payload) return;

        onSubmit(payload, { keepOpen: true });

        // Reset form để thêm tiếp
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xl font-black text-base-content">
                                {isEditMode ? 'Chỉnh sửa thẻ flashcard' : 'Thêm thẻ flashcard'}
                            </h3>
                            <p className="mt-1 text-sm text-base-content/55">
                                {isEditMode
                                    ? 'Cập nhật lại nội dung mặt trước, mặt sau và hình ảnh của thẻ này.'
                                    : 'Nhập nhanh mặt trước và mặt sau để tạo nhiều thẻ liên tiếp cho bài học.'}
                            </p>
                            {setTitle && (
                                <p className="mt-2 text-xs text-base-content/50">
                                    Bộ: <span className="font-bold text-indigo-600">{setTitle}</span>
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
                            <Plus className="h-4 w-4" />
                            Thêm thẻ
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Phần tạo bằng Gemini */}
                    {!isEditMode && (
                        <div className="rounded-[28px] border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-violet-50/60 to-white p-4 shadow-sm">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-base-content">Tạo nội dung bằng Gemini</p>
                                    <p className="mt-1 text-xs text-base-content/55">
                                        Dán chủ đề, đoạn ghi chú hoặc nội dung bài học. Gemini sẽ tạo bộ thẻ tiếng Việt để bạn chỉnh sửa và lưu ngay.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 self-start">
                                    <label className="text-xs font-bold text-base-content/55">Số thẻ</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={aiCardCount}
                                        onChange={(event) =>
                                            setAiCardCount(Math.max(1, Math.min(12, Number(event.target.value) || 1)))
                                        }
                                        className="input input-sm w-20 rounded-xl border-indigo-200 bg-white font-bold text-indigo-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGenerateWithAI}
                                        disabled={aiGenerating}
                                        className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-white shadow-lg shadow-indigo-500/20"
                                    >
                                        {aiGenerating ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                        {aiGenerating ? 'Đang tạo...' : 'Tạo bằng Gemini'}
                                    </button>
                                </div>
                            </div>

                            <textarea
                                value={aiPrompt}
                                onChange={(event) => setAiPrompt(event.target.value)}
                                placeholder="VD: Tạo 5 thẻ flashcard về JSX trong React, tập trung vào khái niệm, cú pháp và khi nào nên dùng..."
                                className="textarea textarea-bordered mt-4 min-h-[120px] w-full rounded-2xl border-indigo-100 bg-white/90 text-sm font-medium resize-none focus:border-indigo-300 focus:outline-none"
                                rows={4}
                            />

                            <p className="mt-2 text-[11px] font-medium text-base-content/45">
                                Nếu bạn muốn nhập tay, kết quả mới sẽ được thêm tiếp vào cuối danh sách.
                            </p>
                        </div>
                    )}

                    {/* Danh sách thẻ */}
                    <div className="max-h-[62vh] space-y-4 overflow-y-auto pr-1">
                        {cards.map((card, index) => (
                            <div key={card.id} className="rounded-[28px] border border-base-300/80 bg-white/95 p-4 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Thẻ {index + 1}
                                    </div>
                                    {!isEditMode && (
                                        <button
                                            type="button"
                                            onClick={() => removeCard(card.id)}
                                            className="btn btn-ghost btn-xs rounded-full text-base-content/50 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid gap-4 xl:grid-cols-2">
                                    {/* Mặt trước */}
                                    <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-indigo-500">
                                            Mặt trước <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={card.frontText}
                                            onChange={(event) => updateCard(card.id, 'frontText', event.target.value)}
                                            placeholder="VD: React Hook là gì?"
                                            className="textarea textarea-bordered min-h-[150px] w-full rounded-2xl border-indigo-100 bg-indigo-50/30 text-sm font-medium resize-none focus:border-indigo-300 focus:outline-none"
                                            rows={6}
                                            autoFocus={index === 0}
                                        />

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <label className="btn btn-sm rounded-xl border-indigo-200 bg-white font-bold text-indigo-600 hover:bg-indigo-50">
                                                <Upload className="h-4 w-4" />
                                                Tải ảnh mặt trước
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0];
                                                        handleImageUpload(card.id, 'front', file);
                                                        event.target.value = '';
                                                    }}
                                                />
                                            </label>

                                            {uploadingSlots[`${card.id}-front`] && (
                                                <span className="inline-flex items-center gap-1 text-xs text-base-content/50">
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Đang tải ảnh...
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
                                                alt={`Mặt trước thẻ ${index + 1}`}
                                                className="mt-3 max-h-72 w-full rounded-2xl border border-base-300 bg-base-200/40 object-contain object-center"
                                            />
                                        )}
                                    </div>

                                    {/* Mặt sau */}
                                    <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-violet-500">
                                            Mặt sau <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={card.backText}
                                            onChange={(event) => updateCard(card.id, 'backText', event.target.value)}
                                            placeholder="Giải thích ngắn gọn, ghi nhớ chính hoặc đáp án..."
                                            className="textarea textarea-bordered min-h-[150px] w-full rounded-2xl border-violet-100 bg-violet-50/30 text-sm font-medium resize-none focus:border-violet-300 focus:outline-none"
                                            rows={6}
                                        />

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <label className="btn btn-sm rounded-xl border-violet-200 bg-white font-bold text-violet-600 hover:bg-violet-50">
                                                <Upload className="h-4 w-4" />
                                                Tải ảnh mặt sau
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0];
                                                        handleImageUpload(card.id, 'back', file);
                                                        event.target.value = '';
                                                    }}
                                                />
                                            </label>

                                            {uploadingSlots[`${card.id}-back`] && (
                                                <span className="inline-flex items-center gap-1 text-xs text-base-content/50">
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Đang tải ảnh...
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
                                                alt={`Mặt sau thẻ ${index + 1}`}
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
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-sm btn-ghost rounded-xl font-bold"
                            >
                                Hủy
                            </button>

                            {!isEditMode && (
                                <button
                                    type="button"
                                    onClick={handleSubmitAndContinue}
                                    disabled={loading}
                                    className="btn btn-sm rounded-xl border-indigo-200 bg-white font-bold text-indigo-600 hover:bg-indigo-50"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Lưu và thêm tiếp
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-indigo-600 to-violet-600 font-bold gap-1.5 text-white"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isEditMode ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
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