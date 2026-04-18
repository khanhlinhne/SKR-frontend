import { useCallback, useState } from 'react';
import { flashcardApi } from '@/shared/api';
import { mapWithConcurrency } from '@/shared/utils/mapWithConcurrency.js';
import {
    buildFlashcardItemPayload,
    extractStudyPayload,
    isSameEntityId,
    normalizeComparableId,
    sanitizeDeckCards,
} from '@/features/flashcards/models/flashcardModel';

const CREATE_ITEM_CONCURRENCY = 4;

export function useFlashcardDeckMutations({
    decks,
    selectedDeck,
    setSelectedDeck,
    subjectOptions,
    fetchDecks,
    fetchDeckItems,
    ensureSubjectsLoaded,
    setError,
    openDialog,
}) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDeck, setEditingDeck] = useState(null);
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [deletingDeckId, setDeletingDeckId] = useState(null);
    const [deckDeleteCandidate, setDeckDeleteCandidate] = useState(null);

    const openCreateModal = useCallback(() => {
        void ensureSubjectsLoaded();
        setShowCreateModal(true);
    }, [ensureSubjectsLoaded]);

    const closeCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleCreateDeck = useCallback(async (deckData) => {
        let createdSetId = null;

        try {
            setError(null);
            const isOwnedCourse = subjectOptions.some((option) => isSameEntityId(option.courseId, deckData.courseId));
            if (!deckData.courseId || !isOwnedCourse) {
                throw new Error('Bạn chỉ được tạo flashcard cho môn học đã mua và thuộc quyền của tài khoản hiện tại.');
            }

            const cards = sanitizeDeckCards(deckData.cards);

            const createSetResponse = await flashcardApi.createSet({
                setTitle: deckData.name?.trim(),
                setDescription: deckData.description?.trim() || null,
                courseId: deckData.courseId || null,
                visibility: deckData.visibility || 'private',
                status: cards.length > 0 ? 'active' : 'draft',
                tags: deckData.subject ? [deckData.subject] : null,
            });

            const createdSet = extractStudyPayload(createSetResponse);
            createdSetId = createdSet?.flashcardSetId || createdSet?.id || null;

            if (!createdSetId) {
                throw new Error('Không nhận được mã bộ flashcard mới từ máy chủ.');
            }

            await mapWithConcurrency(
                cards,
                async (card, index) => flashcardApi.createItem(createdSetId, buildFlashcardItemPayload(card, index)),
                {
                    concurrency: CREATE_ITEM_CONCURRENCY,
                    retries: 1,
                    retryDelayMs: 150,
                },
            );

            await fetchDecks();
            setShowCreateModal(false);
            return true;
        } catch (err) {
            console.error('Failed to create deck:', err);
            if (createdSetId) {
                try {
                    await flashcardApi.deleteSet(createdSetId);
                } catch (rollbackError) {
                    console.error('Failed to rollback incomplete flashcard set:', rollbackError);
                }
            }

            const message =
                err.response?.data?.message ||
                (createdSetId
                    ? 'Không thể lưu đầy đủ các thẻ flashcard. Hệ thống đã hoàn tác bộ vừa tạo, bạn hãy thử lại.'
                    : err.message) ||
                'Không thể tạo flashcard';

            setError(message);
            return false;
        }
    }, [fetchDecks, setError, subjectOptions]);

    const handleOpenEditDeck = useCallback(async (deck) => {
        const requestDeckId = deck?.id == null ? '' : String(deck.id).trim();
        const normalizedDeckId = normalizeComparableId(requestDeckId);

        if (!normalizedDeckId || editingDeckId === normalizedDeckId) {
            return;
        }

        if (!deck?.isOwned) {
            openDialog({
                variant: 'error',
                title: 'Con cú chưa thể mở chỉnh sửa',
                message: 'Bạn chỉ được chỉnh sửa bộ flashcard do chính mình tạo.',
                details: 'Quy tắc hiện tại:\n- Chỉ owner của bộ flashcard mới có quyền cập nhật nội dung.\n- Các bộ public của người khác vẫn chỉ xem và học được.',
                confirmLabel: 'Đã hiểu',
            });
            return;
        }

        try {
            setError(null);
            setEditingDeckId(normalizedDeckId);

            const deckItems = await fetchDeckItems(requestDeckId);
            const matchedSubject =
                subjectOptions.find((option) => isSameEntityId(option.courseId, deck.subjectId)) ||
                subjectOptions.find((option) => isSameEntityId(option.value, deck.subjectId));

            setEditingDeck({
                id: requestDeckId,
                deckId: requestDeckId,
                name: deck.name || '',
                description: deck.description || deck.raw?.setDescription || '',
                visibility: deck.visibility || deck.raw?.visibility || 'private',
                subjectValue: matchedSubject?.value || deck.subjectId || '',
                courseId: matchedSubject?.courseId || deck.subjectId || null,
                cards: deckItems.map((item) => ({
                    itemId: item.id,
                    front: item.front || '',
                    back: item.back || '',
                    frontImageUrl: item.frontImageUrl || '',
                    backImageUrl: item.backImageUrl || '',
                })),
            });
            setShowEditModal(true);
        } catch (err) {
            console.error('Failed to open edit deck modal:', err);
            const message = err.response?.data?.message || err.message || 'Không thể tải dữ liệu bộ flashcard để chỉnh sửa.';
            openDialog({
                variant: 'error',
                title: 'Con cú chưa mở được bộ flashcard',
                message: 'Dữ liệu hiện tại chưa tải xong nên chưa thể vào chế độ cập nhật.',
                details: `Chi tiết lỗi:\n- ${message}`,
                confirmLabel: 'Đã hiểu',
            });
        } finally {
            setEditingDeckId(null);
        }
    }, [editingDeckId, fetchDeckItems, openDialog, setError, subjectOptions]);

    const handleCloseEditModal = useCallback(() => {
        if (editingDeckId) {
            return;
        }

        setShowEditModal(false);
        setEditingDeck(null);
    }, [editingDeckId]);

    const handleUpdateDeck = useCallback(async (deckData) => {
        const requestDeckId = deckData?.deckId == null ? '' : String(deckData.deckId).trim();
        const normalizedDeckId = normalizeComparableId(requestDeckId);

        if (!normalizedDeckId) {
            const message = 'Không tìm thấy mã bộ flashcard để cập nhật.';
            openDialog({
                variant: 'error',
                title: 'Con cú chưa thể cập nhật flashcard',
                message: 'Thiếu thông tin nhận diện của bộ flashcard.',
                details: `Chi tiết lỗi:\n- ${message}`,
                confirmLabel: 'Đã hiểu',
            });
            throw new Error(message);
        }

        try {
            setError(null);

            const targetDeck = decks.find((deck) => isSameEntityId(deck.id, normalizedDeckId));
            if (!targetDeck?.isOwned) {
                throw new Error('Bạn chỉ được cập nhật bộ flashcard do chính mình tạo.');
            }

            const isOwnedCourse = subjectOptions.some((option) => isSameEntityId(option.courseId, deckData.courseId));
            if (!deckData.courseId || !isOwnedCourse) {
                throw new Error('Bạn chỉ được cập nhật flashcard cho môn học đã mua và thuộc quyền của tài khoản hiện tại.');
            }

            const cards = sanitizeDeckCards(deckData.cards);

            await flashcardApi.updateSet(requestDeckId, {
                setTitle: deckData.name?.trim(),
                setDescription: deckData.description?.trim() || null,
                courseId: deckData.courseId || null,
                visibility: deckData.visibility || 'private',
                status: cards.length > 0 ? 'active' : 'draft',
                tags: deckData.subject ? [deckData.subject] : null,
            });

            const existingCards = Array.isArray(editingDeck?.cards) ? editingDeck.cards : [];
            const existingItemIds = existingCards
                .map((card) => card.itemId || card.id || null)
                .filter(Boolean);
            const submittedItemIds = new Set(
                cards
                    .map((card) => normalizeComparableId(card.itemId))
                    .filter(Boolean),
            );
            const removedItemIds = existingItemIds.filter(
                (itemId) => !submittedItemIds.has(normalizeComparableId(itemId)),
            );

            await mapWithConcurrency(
                removedItemIds,
                async (itemId) => flashcardApi.deleteItem(requestDeckId, itemId),
                {
                    concurrency: CREATE_ITEM_CONCURRENCY,
                    retries: 1,
                    retryDelayMs: 150,
                },
            );

            await mapWithConcurrency(
                cards,
                async (card, index) => {
                    const payload = buildFlashcardItemPayload(card, index);

                    if (card.itemId) {
                        return flashcardApi.updateItem(requestDeckId, card.itemId, payload);
                    }

                    return flashcardApi.createItem(requestDeckId, payload);
                },
                {
                    concurrency: CREATE_ITEM_CONCURRENCY,
                    retries: 1,
                    retryDelayMs: 150,
                },
            );

            await fetchDecks();
            openDialog({
                variant: 'success',
                title: 'Con cú đã cập nhật flashcard',
                message: `Bộ "${deckData.name?.trim() || targetDeck.name}" đã được lưu lại thành công.`,
                details: 'Bạn có thể tiếp tục học ngay với nội dung mới nhất.',
                confirmLabel: 'Tuyệt vời',
                confirmTone: 'success',
            });
            setEditingDeck(null);
            setShowEditModal(false);
            return true;
        } catch (err) {
            console.error('Failed to update deck:', err);
            const message = err.response?.data?.message || err.message || 'Không thể cập nhật flashcard lúc này.';
            setError(message);
            openDialog({
                variant: 'error',
                title: 'Con cú gặp trục trặc khi cập nhật',
                message: 'Bộ flashcard chưa được lưu vì có lỗi xảy ra.',
                details: `Chi tiết lỗi:\n- ${message}`,
                confirmLabel: 'Đã hiểu',
            });
            throw new Error(message);
        }
    }, [decks, editingDeck, fetchDecks, openDialog, setError, subjectOptions]);

    const openDeleteDeckConfirm = useCallback((deckId) => {
        const requestDeckId = deckId == null ? '' : String(deckId).trim();
        const normalizedDeckId = normalizeComparableId(requestDeckId);
        if (!normalizedDeckId || deletingDeckId === normalizedDeckId) {
            return;
        }

        const deckToDelete = decks.find((deck) => isSameEntityId(deck.id, normalizedDeckId));
        setDeckDeleteCandidate({
            id: requestDeckId,
            name: deckToDelete?.name || 'bộ flashcard này',
        });
    }, [decks, deletingDeckId]);

    const closeDeleteDeckConfirm = useCallback(() => {
        if (deletingDeckId) {
            return;
        }

        setDeckDeleteCandidate(null);
    }, [deletingDeckId]);

    const confirmDeleteDeck = useCallback(async () => {
        if (!deckDeleteCandidate?.id) {
            setDeckDeleteCandidate(null);
            return;
        }

        const requestDeckId = String(deckDeleteCandidate.id).trim();
        const normalizedDeckId = normalizeComparableId(requestDeckId);
        if (!normalizedDeckId || deletingDeckId === normalizedDeckId) {
            return;
        }

        try {
            setError(null);
            setDeletingDeckId(normalizedDeckId);
            await flashcardApi.deleteSet(requestDeckId);
            setDeckDeleteCandidate(null);
            if (selectedDeck && isSameEntityId(selectedDeck.id, normalizedDeckId)) {
                setSelectedDeck(null);
            }
            await fetchDecks();
        } catch (err) {
            console.error('Failed to delete deck:', err);
            setError(err.response?.data?.message || err.message || 'Không thể xóa flashcard');
        } finally {
            setDeletingDeckId(null);
        }
    }, [deckDeleteCandidate, deletingDeckId, fetchDecks, selectedDeck, setError, setSelectedDeck]);

    return {
        showCreateModal,
        showEditModal,
        editingDeck,
        editingDeckId,
        deletingDeckId,
        deckDeleteCandidate,
        openCreateModal,
        closeCreateModal,
        handleCreateDeck,
        handleOpenEditDeck,
        handleCloseEditModal,
        handleUpdateDeck,
        openDeleteDeckConfirm,
        closeDeleteDeckConfirm,
        confirmDeleteDeck,
    };
}
