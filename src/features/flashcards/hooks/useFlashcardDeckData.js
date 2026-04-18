import { useCallback, useEffect, useMemo, useState } from 'react';
import { enrollmentApi, flashcardApi } from '@/shared/api';
import {
    extractDecksFromResponse,
    extractItemsFromResponse,
    isSameEntityId,
    normalizeComparableId,
    normalizeSearchText,
    readCurrentUserId,
} from '@/features/flashcards/models/flashcardModel';

const SUBJECT_PICKER_LIMIT = 40;

export function useFlashcardDeckData() {
    const [viewMode, setViewMode] = useState('grid');
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');

    const currentUserId = readCurrentUserId();

    const fetchDecks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await flashcardApi.getAllSets({ limit: 50 });
            setDecks(extractDecksFromResponse(response, readCurrentUserId()));
        } catch (err) {
            console.error('Failed to fetch decks:', err);
            setError(err.response?.data?.message || err.message || 'Không thể tải danh sách flashcard');
            setDecks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDeckItems = useCallback(async (deckId) => {
        try {
            const response = await flashcardApi.getItems(deckId, { limit: 100 });
            return extractItemsFromResponse(response);
        } catch (err) {
            console.error('Failed to fetch deck items:', err);
            return [];
        }
    }, []);

    const fetchSubjects = useCallback(async () => {
        try {
            const response = await enrollmentApi.getMyEnrollments({ limit: SUBJECT_PICKER_LIMIT });
            const payload = response?.data || response || {};
            const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];

            setSubjectOptions(
                items
                    .map((subject) => ({
                        value: subject.courseId || subject.subjectId || subject.id || '',
                        label: subject.courseName || subject.subjectName || subject.title || '',
                        courseId: subject.courseId || subject.subjectId || subject.id || null,
                        isOwnedByUser: true,
                    }))
                    .filter((option) => option.value && option.label)
                    .filter((option, index, arr) => arr.findIndex((item) => isSameEntityId(item.value, option.value)) === index),
            );
        } catch (err) {
            console.error('Failed to fetch learner-owned subjects:', err);
            setSubjectOptions([]);
        }
    }, []);

    const ensureSubjectsLoaded = useCallback(async () => {
        if (subjectOptions.length > 0) {
            return;
        }

        await fetchSubjects();
    }, [fetchSubjects, subjectOptions.length]);

    useEffect(() => {
        fetchDecks();
    }, [fetchDecks]);

    useEffect(() => {
        void fetchSubjects();
    }, [fetchSubjects]);

    const availableSubjects = useMemo(() => {
        const optionMap = new Map();

        subjectOptions.forEach((option) => {
            const normalizedId = normalizeComparableId(option.value);
            if (normalizedId && option.label) {
                optionMap.set(normalizedId, {
                    value: normalizedId,
                    label: option.label,
                });
            }
        });

        decks.forEach((deck) => {
            const normalizedId = normalizeComparableId(deck.subjectId);
            const fallbackValue = normalizedId || normalizeSearchText(deck.subject);
            const fallbackLabel = deck.subject || 'Chưa phân môn';

            if (!fallbackValue || optionMap.has(fallbackValue)) {
                return;
            }

            optionMap.set(fallbackValue, {
                value: fallbackValue,
                label: fallbackLabel,
            });
        });

        return Array.from(optionMap.values()).sort((left, right) => left.label.localeCompare(right.label, 'vi'));
    }, [decks, subjectOptions]);

    const filteredDecks = useMemo(() => {
        const normalizedQuery = normalizeSearchText(searchQuery);

        return decks.filter((deck) => {
            const deckSubjectKey = normalizeComparableId(deck.subjectId) || normalizeSearchText(deck.subject);
            const matchesSubject = selectedSubject === 'all' || deckSubjectKey === selectedSubject;

            if (!matchesSubject) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            const searchableText = normalizeSearchText([
                deck.name,
                deck.description,
                deck.subject,
                deck.creatorName,
            ].filter(Boolean).join(' '));

            return searchableText.includes(normalizedQuery);
        });
    }, [decks, searchQuery, selectedSubject]);

    const stats = useMemo(() => ({
        totalCards: filteredDecks.reduce((sum, deck) => sum + (deck.totalCards || 0), 0),
        mastered: filteredDecks.reduce((sum, deck) => sum + (deck.mastered || 0), 0),
        dueToday: filteredDecks.reduce((sum, deck) => sum + (deck.dueToday || 0), 0),
        streak: 0,
    }), [filteredDecks]);

    const applyDeckProgress = useCallback((deckId, deckProgress) => {
        if (!deckProgress) {
            return;
        }

        setDecks((prevDecks) =>
            prevDecks.map((deck) =>
                isSameEntityId(deck.id, deckId)
                    ? {
                          ...deck,
                          mastered: Number(deckProgress.masteredCount ?? deck.mastered ?? 0),
                          dueToday: Number(deckProgress.dueToday ?? deck.dueToday ?? 0),
                          raw: {
                              ...deck.raw,
                              masteredCount: Number(deckProgress.masteredCount ?? deck.mastered ?? 0),
                              dueToday: Number(deckProgress.dueToday ?? deck.dueToday ?? 0),
                          },
                      }
                    : deck,
            ),
        );
    }, []);

    const applyOptimisticDeckDelta = useCallback((deckId, { masteredDelta = 0, dueTodayDelta = 0 }) => {
        if (!deckId || (!masteredDelta && !dueTodayDelta)) {
            return;
        }

        setDecks((prevDecks) =>
            prevDecks.map((deck) => {
                if (!isSameEntityId(deck.id, deckId)) {
                    return deck;
                }

                const totalCards = Math.max(Number(deck.totalCards || 0), 0);
                const nextMastered = Math.min(
                    totalCards,
                    Math.max(Number(deck.mastered || 0) + Number(masteredDelta || 0), 0),
                );
                const nextDueToday = Math.max(Number(deck.dueToday || 0) + Number(dueTodayDelta || 0), 0);

                return {
                    ...deck,
                    mastered: nextMastered,
                    dueToday: nextDueToday,
                    raw: {
                        ...deck.raw,
                        masteredCount: nextMastered,
                        dueToday: nextDueToday,
                    },
                };
            }),
        );
    }, []);

    const upsertDeck = useCallback((deck) => {
        setDecks((prevDecks) =>
            prevDecks.some((item) => isSameEntityId(item.id, deck.id))
                ? prevDecks
                : [deck, ...prevDecks],
        );
    }, []);

    return {
        viewMode,
        setViewMode,
        decks,
        setDecks,
        loading,
        error,
        setError,
        currentUserId,
        subjectOptions,
        searchQuery,
        setSearchQuery,
        selectedSubject,
        setSelectedSubject,
        availableSubjects,
        filteredDecks,
        stats,
        fetchDecks,
        fetchDeckItems,
        ensureSubjectsLoaded,
        applyDeckProgress,
        applyOptimisticDeckDelta,
        upsertDeck,
    };
}
