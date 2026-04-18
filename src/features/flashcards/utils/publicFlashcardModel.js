export const PREVIEW_CARDS_LIMIT = 4;

export function extractPublicFlashcardResponseData(response) {
    return response?.data?.data || response?.data || response || {};
}

export function normalizePublicFlashcardSetDetail(data = {}) {
    const totalCards = Number(data.totalCards || 0);
    const parsedPreviewLimit = Number(data.previewLimit);
    const previewLimit = Number.isFinite(parsedPreviewLimit) && parsedPreviewLimit > 0
        ? parsedPreviewLimit
        : PREVIEW_CARDS_LIMIT;
    const isPreview = data.requiresLoginForFullAccess === true || data.previewLimit != null;

    return {
        id: data.flashcardSetId,
        slug: data.flashcardSetId,
        title: data.setTitle || 'Bộ flashcard',
        description: data.setDescription || '',
        subject: data.tags?.[0] || 'Công khai',
        tags: Array.isArray(data.tags) ? data.tags : [],
        totalCards,
        previewCardsCount: previewLimit,
        isPublic: data.visibility === 'public',
        isPreview,
        lockedCount: isPreview ? Math.max(0, totalCards - previewLimit) : 0,
        creatorName: data.creator?.displayName || data.creator?.fullName || 'Anonymous',
        creatorAvatar: data.creator?.avatarUrl || null,
        studyCount: Number(data.timesStudied || 0),
        ratingAverage: Number(data.averageRating || 0),
        ratingCount: 0,
        createdAt: data.createdAt,
    };
}

export function normalizePublicFlashcardCards(items = []) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items.map((card, index) => ({
        id: card.flashcardItemId || card.id || `card-${index}`,
        front: card.frontText || card.front || '',
        back: card.backText || card.back || '',
        order: card.cardOrder ?? card.order ?? index,
        isLocked: Boolean(card.isLocked),
    }));
}

export function parsePublicFlashcardDetailPayload(payload = {}) {
    const set = normalizePublicFlashcardSetDetail(payload);
    const cards = normalizePublicFlashcardCards(payload.items || payload.cards || []).map((card, index) => ({
        ...card,
        isLocked: Boolean(card.isLocked || (set.isPreview && index >= set.previewCardsCount)),
    }));

    return {
        set,
        cards,
    };
}
