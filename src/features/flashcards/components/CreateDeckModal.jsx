import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';
import { geminiApi, uploadApi } from '@/shared/api';
import { OwlDialog, useOwlDialog } from '@/shared/ui/common';
import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';

const INITIAL_CARD_COUNT = 4;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_AI_CARDS = 10;
const DAILY_AI_REQUEST_LIMIT = 2;
const AI_USAGE_STORAGE_KEY = 'skr-flashcard-ai-usage';

function createEmptyCard(id) {
    return { id, front: '', back: '', frontImageUrl: '', backImageUrl: '' };
}

function getInitialCards() {
    return Array.from({ length: INITIAL_CARD_COUNT }, (_, index) => createEmptyCard(index + 1));
}

function createCardFromInitialItem(item, fallbackId) {
    if (!item) {
        return createEmptyCard(fallbackId);
    }

    return {
        id: fallbackId,
        itemId: item.itemId || item.id || null,
        front: item.front || item.frontText || '',
        back: item.back || item.backText || '',
        frontImageUrl: item.frontImageUrl || '',
        backImageUrl: item.backImageUrl || '',
    };
}

function buildCardsFromInitialDeck(initialDeck = null) {
    const items = Array.isArray(initialDeck?.cards) ? initialDeck.cards : [];
    if (items.length === 0) {
        return getInitialCards();
    }

    const mappedItems = items.map((item, index) => createCardFromInitialItem(item, index + 1));
    const missingSlots = Math.max(INITIAL_CARD_COUNT - mappedItems.length, 0);

    return [
        ...mappedItems,
        ...Array.from({ length: missingSlots }, (_, index) => createEmptyCard(mappedItems.length + index + 1)),
    ];
}

function extractUploadedImageUrl(response) {
    const payload = response?.data?.data || response?.data || response || {};
    return payload.imageUrl || payload.url || payload.secure_url || payload.fileUrl || payload.path || '';
}

function readAiUsageMap() {
    if (typeof window === 'undefined') {
        return {};
    }

    try {
        const parsed = JSON.parse(localStorage.getItem(AI_USAGE_STORAGE_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeAiUsageMap(value) {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem(AI_USAGE_STORAGE_KEY, JSON.stringify(value));
}

function getAiUsageKey(userId) {
    return `${userId || 'anonymous'}:${new Date().toISOString().slice(0, 10)}`;
}

function getAiUsageCount(userId) {
    const usageMap = readAiUsageMap();
    return Number(usageMap[getAiUsageKey(userId)] || 0);
}

function incrementAiUsageCount(userId) {
    const usageMap = readAiUsageMap();
    const key = getAiUsageKey(userId);
    usageMap[key] = Number(usageMap[key] || 0) + 1;
    writeAiUsageMap(usageMap);
    return usageMap[key];
}

function formatRuleList(items) {
    return items.map((item) => `- ${item}`).join('\n');
}

export default function CreateDeckModal({
    isOpen = true,
    onClose,
    onCreate,
    onUpdate,
    subjects = [],
    currentUserId = '',
    mode = 'create',
    initialDeck = null,
}) {
    const nextCardIdRef = useRef(INITIAL_CARD_COUNT + 1);
    const isEditMode = mode === 'edit';

    const [deckName, setDeckName] = useState(initialDeck?.name || '');
    const [subject, setSubject] = useState(initialDeck?.subjectValue || '');
    const [description, setDescription] = useState(initialDeck?.description || '');
    const [visibility, setVisibility] = useState(initialDeck?.visibility || 'private');
    const [cards, setCards] = useState(() => buildCardsFromInitialDeck(initialDeck));
    const [uploadingSlots, setUploadingSlots] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [aiCardCount, setAiCardCount] = useState(5);
    const [aiGenerating, setAiGenerating] = useState(false);
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();

    const subjectOptions = Array.isArray(subjects) ? subjects : [];
    const selectedSubject = subjectOptions.find((option) => String(option.value) === String(subject));
    const validCards = cards.filter((card) => card.front.trim() && card.back.trim());
    const halfFilledCards = cards.filter(
        (card) => (card.front.trim() || card.back.trim()) && !(card.front.trim() && card.back.trim()),
    );
    const hasUploadingImages = Object.values(uploadingSlots).some(Boolean);
    const aiUsageCount = useMemo(() => getAiUsageCount(currentUserId), [currentUserId, aiGenerating]);
    const aiUsageRemaining = Math.max(DAILY_AI_REQUEST_LIMIT - aiUsageCount, 0);

    const modalBadgeLabel = isEditMode ? 'Cập nhật theo kiểu bộ thẻ học' : 'Tạo theo kiểu bộ thẻ học';
    const modalTitle = isEditMode ? 'Cập nhật FlashCard' : 'Tạo bộ flashcard mới';
    const modalDescription = isEditMode
        ? 'Chỉnh sửa tiêu đề, môn học đã mua và toàn bộ nội dung thẻ rồi lưu lại thay đổi.'
        : 'Điền tiêu đề, chọn môn học đã mua và tạo hoặc nhập thẻ để học ngay.';
    const submitButtonLabel = submitting
        ? (isEditMode ? 'Đang cập nhật bộ thẻ...' : 'Đang tạo bộ thẻ...')
        : (isEditMode ? 'Cập nhật FlashCard' : 'Tạo bộ flashcard');
    const footerDescription = isEditMode
        ? 'Khi bấm cập nhật, hệ thống sẽ lưu lại cả bộ thẻ lẫn từng flashcard bạn vừa chỉnh sửa.'
        : 'Khi bấm tạo, hệ thống sẽ lưu cả bộ thẻ lẫn từng flashcard để bạn học ngay.';

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const nextCards = buildCardsFromInitialDeck(initialDeck);
        nextCardIdRef.current = nextCards.length + 1;
        setDeckName(initialDeck?.name || '');
        setSubject(initialDeck?.subjectValue || '');
        setDescription(initialDeck?.description || '');
        setVisibility(initialDeck?.visibility || 'private');
        setCards(nextCards);
        setUploadingSlots({});
        setFormError('');
        setSubmitting(false);
        setAiCardCount(5);
        setAiGenerating(false);
    }, [initialDeck, isOpen]);

    const resetForm = () => {
        nextCardIdRef.current = INITIAL_CARD_COUNT + 1;
        setDeckName('');
        setSubject('');
        setDescription('');
        setVisibility('private');
        setCards(getInitialCards());
        setUploadingSlots({});
        setFormError('');
        setSubmitting(false);
        setAiCardCount(5);
        setAiGenerating(false);
    };

    const handleClose = () => {
        if (submitting || aiGenerating) {
            return;
        }

        resetForm();
        onClose?.();
    };

    const addCardRow = () => {
        setCards((prevCards) => [...prevCards, createEmptyCard(nextCardIdRef.current++)]);
    };

    const updateCard = (cardId, field, value) => {
        setCards((prevCards) =>
            prevCards.map((card) => (card.id === cardId ? { ...card, [field]: value } : card)),
        );
    };

    const removeCard = (cardId) => {
        setCards((prevCards) => {
            if (prevCards.length === 1) {
                return [createEmptyCard(cardId)];
            }

            return prevCards.filter((card) => card.id !== cardId);
        });
    };

    const setSlotUploading = (cardId, side, isUploading) => {
        setUploadingSlots((prev) => ({ ...prev, [`${cardId}-${side}`]: isUploading }));
    };

    const handleImageUpload = async (cardId, side, file) => {
        if (!file) {
            return;
        }

        if (!file.type?.startsWith('image/')) {
            setFormError('Chỉ hỗ trợ tệp ảnh cho flashcard.');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setFormError('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
            return;
        }

        setFormError('');
        setSlotUploading(cardId, side, true);

        try {
            const response = await uploadApi.uploadImage(file);
            const imageUrl = resolveFlashcardImageUrl(extractUploadedImageUrl(response));

            if (!imageUrl) {
                throw new Error('Không nhận được URL ảnh từ máy chủ.');
            }

            updateCard(cardId, side === 'front' ? 'frontImageUrl' : 'backImageUrl', imageUrl);
        } catch (error) {
            setFormError(error?.response?.data?.message || error?.message || 'Không thể tải ảnh lên lúc này.');
        } finally {
            setSlotUploading(cardId, side, false);
        }
    };

    const clearCardImage = (cardId, side) => {
        updateCard(cardId, side === 'front' ? 'frontImageUrl' : 'backImageUrl', '');
    };

    const mergeGeneratedCards = (generatedCards) => {
        setCards((prevCards) => {
            const nextCards = [...prevCards];
            let generatedIndex = 0;

            for (let index = 0; index < nextCards.length && generatedIndex < generatedCards.length; index += 1) {
                const currentCard = nextCards[index];
                const isBlank =
                    !currentCard.front.trim() &&
                    !currentCard.back.trim() &&
                    !currentCard.frontImageUrl &&
                    !currentCard.backImageUrl;

                if (!isBlank) {
                    continue;
                }

                nextCards[index] = {
                    ...currentCard,
                    front: generatedCards[generatedIndex].frontText,
                    back: generatedCards[generatedIndex].backText,
                };
                generatedIndex += 1;
            }

            while (generatedIndex < generatedCards.length) {
                nextCards.push({
                    ...createEmptyCard(nextCardIdRef.current++),
                    front: generatedCards[generatedIndex].frontText,
                    back: generatedCards[generatedIndex].backText,
                });
                generatedIndex += 1;
            }

            return nextCards;
        });
    };

    const handleGenerateAiCards = async () => {
        const violations = [];

        if (!currentUserId) {
            violations.push('Bạn chưa đăng nhập learner hợp lệ.');
        }
        if (!subject) {
            violations.push('Bạn chưa chọn môn học.');
        }
        if (subject && !selectedSubject?.courseId) {
            violations.push('Môn học đã chọn không nằm trong danh sách môn đã mua.');
        }
        if (selectedSubject?.isOwnedByUser === false) {
            violations.push('Môn học đã chọn không thuộc quyền sử dụng của user hiện tại.');
        }
        if ((Number(aiCardCount) || 0) < 1 || Number(aiCardCount) > MAX_AI_CARDS) {
            violations.push(`Mỗi lần AI chỉ được tạo từ 1 đến ${MAX_AI_CARDS} thẻ.`);
        }
        if (aiUsageRemaining <= 0) {
            violations.push(`Bạn đã dùng hết ${DAILY_AI_REQUEST_LIMIT} lượt AI trong hôm nay.`);
        }

        if (violations.length > 0) {
            openDialog({
                variant: 'error',
                title: 'Con cú chưa thể tạo flashcard',
                message: 'Yêu cầu này đang vi phạm một hoặc nhiều quy tắc.',
                details: formatRuleList(violations),
                confirmLabel: 'Đã hiểu',
            });
            return;
        }

        setAiGenerating(true);
        setFormError('');

        try {
            incrementAiUsageCount(currentUserId);

            const generatedCards = await geminiApi.generateFlashcards({
                sourceText: [
                    selectedSubject?.label ? `Môn học: ${selectedSubject.label}` : '',
                    deckName.trim() ? `Tên bộ flashcard: ${deckName.trim()}` : '',
                    description.trim() ? `Mô tả bộ flashcard: ${description.trim()}` : '',
                    'Yêu cầu của learner: Tạo các flashcard ôn tập cốt lõi theo môn học đã chọn, ưu tiên khái niệm, câu hỏi và định nghĩa ngắn gọn để học nhanh.',
                ]
                    .filter(Boolean)
                    .join('\n'),
                count: Math.min(Number(aiCardCount) || 5, MAX_AI_CARDS),
                contextTitle: `${selectedSubject?.label || 'Môn học'} - ${deckName.trim() || 'Bộ flashcard mới'}`,
            });

            const finalCards = generatedCards.slice(0, MAX_AI_CARDS);
            mergeGeneratedCards(finalCards);

            openDialog({
                variant: 'success',
                title: 'Con cú đã tạo xong flashcard',
                message: `AI vừa thêm ${finalCards.length} thẻ cho môn ${selectedSubject?.label || 'đã chọn'}.`,
                details: `Số lượt AI còn lại hôm nay: ${Math.max(DAILY_AI_REQUEST_LIMIT - getAiUsageCount(currentUserId), 0)}.\nBạn có thể sửa lại từng thẻ trước khi lưu.`,
                confirmLabel: 'Tuyệt vời',
                confirmTone: 'success',
            });
        } catch (error) {
            const message =
                error?.response?.data?.message || error?.message || 'Không thể tạo flashcard bằng AI lúc này.';

            openDialog({
                variant: 'error',
                title: 'Con cú gặp trục trặc',
                message: 'Yêu cầu AI không hoàn thành.',
                details: `Chi tiết lỗi:\n- ${message}\n- Rule hiện tại: tối đa ${MAX_AI_CARDS} thẻ mỗi lần, ${DAILY_AI_REQUEST_LIMIT} lượt mỗi ngày, chỉ dùng cho môn learner đã mua.`,
                confirmLabel: 'Đã hiểu',
            });
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (!deckName.trim()) {
            setFormError('Bạn cần nhập tên bộ flashcard.');
            return;
        }

        if (!selectedSubject?.courseId) {
            setFormError('Bạn chỉ được tạo hoặc cập nhật bộ flashcard gắn với môn học learner đã mua.');
            return;
        }

        if (selectedSubject?.isOwnedByUser === false) {
            setFormError('Môn học này không thuộc quyền sử dụng của user hiện tại.');
            return;
        }

        if (halfFilledCards.length > 0) {
            setFormError('Có thẻ đang nhập dở. Hãy điền đủ cả hai mặt hoặc xóa dòng đó trước khi lưu.');
            return;
        }

        if (validCards.length === 0) {
            setFormError('Hãy thêm ít nhất một thẻ có đủ mặt trước và mặt sau.');
            return;
        }

        if (hasUploadingImages) {
            setFormError('Ảnh đang tải lên. Vui lòng đợi hoàn tất trước khi lưu bộ thẻ.');
            return;
        }

        setSubmitting(true);
        setFormError('');

        try {
            const submitAction = isEditMode ? onUpdate : onCreate;
            const submitResult = await submitAction?.({
                deckId: initialDeck?.deckId || initialDeck?.id || null,
                name: deckName.trim(),
                subject: selectedSubject?.label || '',
                subjectValue: selectedSubject?.value || subject,
                courseId: selectedSubject?.courseId || null,
                description: description.trim(),
                visibility,
                cards: validCards.map((card, index) => ({
                    itemId: card.itemId || null,
                    frontText: card.front.trim(),
                    backText: card.back.trim(),
                    frontImageUrl: resolveFlashcardImageUrl(card.frontImageUrl) || null,
                    backImageUrl: resolveFlashcardImageUrl(card.backImageUrl) || null,
                    cardOrder: index,
                })),
            });

            if (submitResult !== true) {
                setFormError(
                    isEditMode
                        ? 'Không thể cập nhật flashcard lúc này. Hãy kiểm tra lại dữ liệu hoặc thử lại sau.'
                        : 'Không thể tạo bộ flashcard lúc này. Hãy kiểm tra lại dữ liệu hoặc thử lại sau.',
                );
                setSubmitting(false);
                return;
            }

            resetForm();
            onClose?.();
        } catch (error) {
            setFormError(
                error?.message ||
                    (isEditMode
                        ? 'Không thể cập nhật flashcard lúc này. Vui lòng thử lại.'
                        : 'Không thể tạo bộ flashcard lúc này. Vui lòng thử lại.'),
            );
            setSubmitting(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-base-300 px-6 py-5 lg:px-8">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
                            <Icon name="BookOpen" size="sm" />
                            {modalBadgeLabel}
                        </div>
                        <h2 className="text-2xl font-black text-base-content lg:text-3xl">{modalTitle}</h2>
                        <p className="mt-2 text-sm text-base-content/60">{modalDescription}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="btn btn-circle btn-ghost"
                        disabled={submitting || aiGenerating}
                    >
                        <Icon name="X" size="lg" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
                    {formError && (
                        <div className="alert alert-error mb-5">
                            <Icon name="AlertCircle" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[360px,minmax(0,1fr)]">
                        <div className="space-y-4">
                            <div className="rounded-3xl border border-base-300 bg-base-200/60 p-5">
                                <h3 className="mb-4 text-lg font-black text-base-content">Thông tin bộ thẻ</h3>
                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-bold">Tên bộ flashcard</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: React Hooks - Chương 1"
                                            className="input input-bordered w-full rounded-2xl"
                                            value={deckName}
                                            onChange={(event) => setDeckName(event.target.value)}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-bold">Môn học</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full rounded-2xl"
                                            value={subject}
                                            onChange={(event) => setSubject(event.target.value)}
                                        >
                                            <option value="">Chọn môn học</option>
                                            {subjectOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {subjectOptions.length === 0 && (
                                            <p className="mt-2 text-xs text-amber-600">
                                                Tài khoản này chưa có môn học đã mua, nên con cú sẽ không mở AI cho bộ thẻ này.
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-bold">Mô tả</span>
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder="Thêm ghi chú ngắn để sau này dễ tìm và chia sẻ hơn."
                                            className="textarea textarea-bordered w-full rounded-2xl"
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-base-300 bg-base-100 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <Icon name="Globe" size="sm" className="text-blue-500" />
                                    <h3 className="text-lg font-black text-base-content">Quyền riêng tư</h3>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setVisibility('private')}
                                        className={`rounded-2xl border p-4 text-left transition-all ${
                                            visibility === 'private'
                                                ? 'border-blue-500 bg-blue-500/10 shadow-sm'
                                                : 'border-base-300 bg-base-200/40'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <Icon name="Lock" size="sm" className="text-base-content" />
                                            <span className="font-bold text-base-content">Riêng tư</span>
                                        </div>
                                        <p className="text-sm text-base-content/60">Chỉ bạn nhìn thấy và học bộ thẻ này.</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setVisibility('public')}
                                        className={`rounded-2xl border p-4 text-left transition-all ${
                                            visibility === 'public'
                                                ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                                                : 'border-base-300 bg-base-200/40'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <Icon name="Globe" size="sm" className="text-base-content" />
                                            <span className="font-bold text-base-content">Công khai</span>
                                        </div>
                                        <p className="text-sm text-base-content/60">Người khác có thể tìm thấy và học cùng bạn.</p>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-base-200/70 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-base-content/50">Thẻ hợp lệ</p>
                                    <p className="mt-2 text-2xl font-black text-base-content">{validCards.length}</p>
                                </div>
                                <div className="rounded-2xl bg-base-200/70 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-base-content/50">Đang nhập dở</p>
                                    <p className="mt-2 text-2xl font-black text-base-content">{halfFilledCards.length}</p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50 p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                                        🦉
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-base-content">Con cú tạo nội dung flashcard</h3>
                                        <p className="text-sm text-base-content/60">
                                            AI chỉ tạo cho môn learner đã mua, tối đa {MAX_AI_CARDS} thẻ mỗi lần và {DAILY_AI_REQUEST_LIMIT} lượt mỗi ngày.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-blue-200/70 bg-white/80 p-4 text-sm text-base-content/70">
                                    <p className="font-semibold text-base-content">Trạng thái rule hiện tại</p>
                                    <p className="mt-2">
                                        Lượt AI còn lại hôm nay: <span className="font-bold text-blue-600">{aiUsageRemaining}</span>
                                    </p>
                                    <p className="mt-1">Môn hợp lệ: chỉ các môn học đã mua và gắn với user hiện tại.</p>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-bold">Số thẻ muốn tạo</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full rounded-2xl bg-white"
                                            value={aiCardCount}
                                            onChange={(event) => setAiCardCount(Number(event.target.value) || 5)}
                                        >
                                            {Array.from({ length: MAX_AI_CARDS }, (_, index) => index + 1).map((count) => (
                                                <option key={count} value={count}>
                                                    {count} thẻ
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: aiGenerating ? 1 : 1.01 }}
                                        whileTap={{ scale: aiGenerating ? 1 : 0.99 }}
                                        onClick={() => void handleGenerateAiCards()}
                                        disabled={aiGenerating || submitting || subjectOptions.length === 0}
                                        className="btn w-full rounded-2xl border-none bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white shadow-lg shadow-blue-600/20"
                                    >
                                        <Icon name="Sparkles" size="sm" />
                                        {aiGenerating ? 'Con cú đang tạo thẻ...' : 'Nhờ con cú tạo flashcard'}
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-base-300 bg-base-100 p-5">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-base-content">Thẻ trong bộ</h3>
                                    <p className="text-sm text-base-content/60">
                                        Nhập ngắn gọn ở mặt trước và giải thích rõ ở mặt sau để học hiệu quả hơn.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addCardRow}
                                    className="btn btn-outline rounded-2xl"
                                    disabled={submitting || aiGenerating}
                                >
                                    <Icon name="Plus" size="sm" />
                                    Thêm thẻ
                                </button>
                            </div>

                            <div className="mb-3 hidden grid-cols-[56px,minmax(0,1fr),minmax(0,1fr),44px] gap-3 px-1 text-xs font-bold uppercase tracking-wide text-base-content/45 md:grid">
                                <span>STT</span>
                                <span>Mặt trước</span>
                                <span>Mặt sau</span>
                                <span />
                            </div>

                            <div className="space-y-3">
                                {cards.map((card, index) => (
                                    <div
                                        key={card.id}
                                        className="grid gap-3 rounded-3xl border border-base-300 bg-base-200/40 p-4 md:grid-cols-[56px,minmax(0,1fr),minmax(0,1fr),44px]"
                                    >
                                        <div className="flex items-start md:justify-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-base-100 text-sm font-black text-base-content shadow-sm">
                                                {index + 1}
                                            </div>
                                        </div>

                                        <div className="form-control">
                                            <label className="label py-0 md:hidden">
                                                <span className="label-text font-bold">Mặt trước</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={card.front}
                                                onChange={(event) => updateCard(card.id, 'front', event.target.value)}
                                                placeholder="Thuật ngữ, câu hỏi, khái niệm..."
                                                className="textarea textarea-bordered min-h-[110px] w-full rounded-2xl bg-base-100"
                                            />
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <label htmlFor={`front-image-${card.id}`} className="btn btn-xs btn-outline rounded-xl">
                                                    <Icon name="Upload" size="sm" />
                                                    {uploadingSlots[`${card.id}-front`] ? 'Đang tải ảnh...' : 'Thêm ảnh mặt trước'}
                                                </label>
                                                <input
                                                    id={`front-image-${card.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={submitting || aiGenerating || uploadingSlots[`${card.id}-front`]}
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0];
                                                        if (file) {
                                                            void handleImageUpload(card.id, 'front', file);
                                                        }
                                                        event.target.value = '';
                                                    }}
                                                />
                                                {card.frontImageUrl && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-ghost rounded-xl"
                                                        onClick={() => clearCardImage(card.id, 'front')}
                                                        disabled={submitting || aiGenerating}
                                                    >
                                                        <Icon name="X" size="sm" />
                                                        Xóa ảnh
                                                    </button>
                                                )}
                                            </div>
                                            {card.frontImageUrl && (
                                                <div className="mt-2 rounded-2xl border border-base-300 bg-base-100 p-2">
                                                    <img
                                                        src={resolveFlashcardImageUrl(card.frontImageUrl)}
                                                        alt={`Front ${index + 1}`}
                                                        className="h-28 w-full rounded-xl object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-control">
                                            <label className="label py-0 md:hidden">
                                                <span className="label-text font-bold">Mặt sau</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={card.back}
                                                onChange={(event) => updateCard(card.id, 'back', event.target.value)}
                                                placeholder="Định nghĩa, đáp án, ví dụ hoặc ghi chú..."
                                                className="textarea textarea-bordered min-h-[110px] w-full rounded-2xl bg-base-100"
                                            />
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <label htmlFor={`back-image-${card.id}`} className="btn btn-xs btn-outline rounded-xl">
                                                    <Icon name="Upload" size="sm" />
                                                    {uploadingSlots[`${card.id}-back`] ? 'Đang tải ảnh...' : 'Thêm ảnh mặt sau'}
                                                </label>
                                                <input
                                                    id={`back-image-${card.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={submitting || aiGenerating || uploadingSlots[`${card.id}-back`]}
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0];
                                                        if (file) {
                                                            void handleImageUpload(card.id, 'back', file);
                                                        }
                                                        event.target.value = '';
                                                    }}
                                                />
                                                {card.backImageUrl && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-ghost rounded-xl"
                                                        onClick={() => clearCardImage(card.id, 'back')}
                                                        disabled={submitting || aiGenerating}
                                                    >
                                                        <Icon name="X" size="sm" />
                                                        Xóa ảnh
                                                    </button>
                                                )}
                                            </div>
                                            {card.backImageUrl && (
                                                <div className="mt-2 rounded-2xl border border-base-300 bg-base-100 p-2">
                                                    <img
                                                        src={resolveFlashcardImageUrl(card.backImageUrl)}
                                                        alt={`Back ${index + 1}`}
                                                        className="h-28 w-full rounded-xl object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-start justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeCard(card.id)}
                                                className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-error"
                                                aria-label={`Xóa thẻ ${index + 1}`}
                                                disabled={submitting || aiGenerating}
                                            >
                                                <Icon name="Trash2" size="sm" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addCardRow}
                                className="btn btn-ghost mt-4 rounded-2xl"
                                disabled={submitting || aiGenerating}
                            >
                                <Icon name="Plus" size="sm" />
                                Thêm một dòng nữa
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-base-300 bg-base-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p className="text-sm text-base-content/60">{footerDescription}</p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-ghost rounded-2xl"
                            disabled={submitting || aiGenerating}
                        >
                            Hủy
                        </button>
                        <motion.button
                            whileHover={{ scale: submitting ? 1 : 1.02 }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                            onClick={handleSubmit}
                            disabled={submitting || aiGenerating || hasUploadingImages}
                            className="btn rounded-2xl border-none bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white shadow-lg shadow-blue-600/20"
                        >
                            <Icon name="Sparkles" size="sm" />
                            {submitButtonLabel}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <OwlDialog
                isOpen={dialog.isOpen}
                variant={dialog.variant}
                title={dialog.title}
                message={dialog.message}
                details={dialog.details}
                confirmLabel={dialog.confirmLabel}
                cancelLabel={dialog.cancelLabel}
                showCancel={dialog.showCancel}
                confirmTone={dialog.confirmTone}
                loading={dialog.loading}
                onConfirm={handleDialogConfirm}
                onClose={closeDialog}
            />
        </motion.div>
    );
}
