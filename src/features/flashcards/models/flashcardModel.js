import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';
import { isTokenValid } from '@/shared/utils/tokenManager';

const FALLBACK_DECK_COLORS = ['blue', 'green', 'purple', 'orange', 'yellow', 'red'];

export function createClientReviewId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `review-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isBatchEndpointUnsupported(error) {
    const status = error?.response?.status;
    return status === 404 || status === 405 || status === 501;
}

export function resolveStudySyncConfig() {
    const effectiveType =
        typeof navigator !== 'undefined' ? navigator.connection?.effectiveType : null;

    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return {
            concurrency: 2,
            fallbackConcurrency: 2,
            batchSize: 2,
            flushIntervalMs: 200,
        };
    }

    if (effectiveType === '3g') {
        return {
            concurrency: 3,
            fallbackConcurrency: 3,
            batchSize: 4,
            flushIntervalMs: 150,
        };
    }

    return {
        concurrency: 6,
        fallbackConcurrency: 4,
        batchSize: 10,
        flushIntervalMs: 50,
    };
}

export function pickDeckColor(deck, index) {
    const seed = deck.setTitle || deck.setDescription || '';
    const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return FALLBACK_DECK_COLORS[(hash + index) % FALLBACK_DECK_COLORS.length];
}

export function pickDeckIcon(deck) {
    const source = `${deck.setTitle || ''} ${Array.isArray(deck.tags) ? deck.tags.join(' ') : ''}`.toLowerCase();

    if (source.includes('react') || source.includes('javascript') || source.includes('html') || source.includes('git')) {
        return '\u{1F4BB}';
    }
    if (source.includes('sql') || source.includes('database')) {
        return '\u{1F5C4}\uFE0F';
    }
    if (source.includes('vocabulary') || source.includes('từ vựng') || source.includes('tu vung') || source.includes('english')) {
        return '\u{1F4D8}';
    }

    return '\u{1F4DA}';
}

export function formatLastStudied(createdAt) {
    if (!createdAt) {
        return 'Chưa học';
    }

    const createdDate = new Date(createdAt);
    if (Number.isNaN(createdDate.getTime())) {
        return 'Chưa học';
    }

    const diffMs = Date.now() - createdDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return 'Hôm nay';
    }
    if (diffDays === 1) {
        return '1 ngày trước';
    }
    if (diffDays < 7) {
        return `${diffDays} ngày trước`;
    }

    return createdDate.toLocaleDateString('vi-VN');
}

export function readCurrentUserId() {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser?.userId || storedUser?.user_id) {
            return storedUser.userId || storedUser.user_id;
        }
    } catch {
        // Ignore malformed cached user data and fall back to the JWT payload.
    }

    if (!isTokenValid()) {
        return null;
    }

    const token = localStorage.getItem('accessToken');
    const payload = token?.split('.')[1];
    if (!payload) {
        return null;
    }

    try {
        const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
        const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
        const decodedPayload = JSON.parse(window.atob(paddedPayload));
        return decodedPayload.userId || decodedPayload.user_id || null;
    } catch {
        return null;
    }
}

export function normalizeComparableId(value) {
    if (value == null) {
        return '';
    }

    return String(value).trim().toLowerCase();
}

export function isSameEntityId(left, right) {
    const normalizedLeft = normalizeComparableId(left);
    const normalizedRight = normalizeComparableId(right);

    return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

export function normalizeSearchText(value) {
    if (value == null) {
        return '';
    }

    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .trim()
        .toLowerCase();
}

export function resolveDeckSubjectMeta(deck) {
    const subjectId = deck.courseId || deck.subjectId || deck.course?.subjectId || deck.course?.courseId || null;
    const subjectName =
        deck.course?.subjectName ||
        deck.course?.courseName ||
        deck.subjectName ||
        (Array.isArray(deck.tags) && deck.tags.length > 0 ? deck.tags[0] : '') ||
        '';

    return {
        subjectId,
        subjectName: subjectName || (deck.visibility === 'public' ? 'Công khai' : 'Cá nhân'),
    };
}

export function normalizeDeck(deck, index, currentUserId) {
    const totalCards = Number(deck.totalCards || 0);
    const mastered = Number(deck.masteredCount || deck.mastered || 0);
    const learning = Math.max(totalCards - mastered, 0);
    const creatorId = deck.creatorId || deck.creator?.userId || deck.creator?.id || deck.creator_id || null;

    return {
        id: deck.flashcardSetId || deck.id,
        name: deck.setTitle || deck.name || 'Bộ flashcard chưa đặt tên',
        subject: Array.isArray(deck.tags) && deck.tags.length > 0 ? deck.tags[0] : deck.visibility === 'public' ? 'Công khai' : 'Cá nhân',
        description: deck.setDescription || '',
        totalCards,
        mastered,
        learning,
        new: 0,
        dueToday: Number(deck.dueToday || 0),
        streak: 0,
        lastStudied: formatLastStudied(deck.updatedAt || deck.createdAt),
        color: pickDeckColor(deck, index),
        icon: pickDeckIcon(deck),
        visibility: deck.visibility || 'private',
        creatorId,
        creatorName: deck.creator?.displayName || deck.creator?.fullName || null,
        isOwned: isSameEntityId(creatorId, currentUserId),
        raw: deck,
    };
}

export function normalizeCard(item, index) {
    return {
        id: item.flashcardItemId || item.id || `card-${index}`,
        front: item.frontText || item.front || '',
        back: item.backText || item.back || '',
        frontImageUrl: resolveFlashcardImageUrl(
            item.frontImageUrl || item.frontImage || item.frontMediaUrl || item.frontImagePath || '',
        ),
        backImageUrl: resolveFlashcardImageUrl(
            item.backImageUrl || item.backImage || item.backMediaUrl || item.backImagePath || '',
        ),
        difficulty: item.difficulty || 'medium',
    };
}

export function extractDecksFromResponse(response, currentUserId) {
    const payload = response?.data?.data || response?.data || response;
    const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];

    return items.map((deck, index) => {
        const normalizedDeck = normalizeDeck(deck, index, currentUserId);
        const { subjectId, subjectName } = resolveDeckSubjectMeta(deck);

        return {
            ...normalizedDeck,
            subject: subjectName || normalizedDeck.subject,
            subjectId,
        };
    });
}

export function extractItemsFromResponse(response) {
    const payload = response?.data?.data || response?.data || response;
    const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
    return items.map(normalizeCard);
}

export function extractStudyPayload(response) {
    const payload = response?.data?.data || response?.data || response;
    return payload || {};
}

export function buildFlashcardItemPayload(card, index) {
    return {
        frontText: card.frontText.trim(),
        backText: card.backText.trim(),
        cardOrder: card.cardOrder ?? index,
        frontImageUrl: card.frontImageUrl || null,
        backImageUrl: card.backImageUrl || null,
        frontImage: card.frontImageUrl || null,
        backImage: card.backImageUrl || null,
        frontMediaUrl: card.frontImageUrl || null,
        backMediaUrl: card.backImageUrl || null,
    };
}

export function sanitizeDeckCards(cards) {
    return Array.isArray(cards)
        ? cards.filter((card) => card.frontText?.trim() && card.backText?.trim())
        : [];
}
