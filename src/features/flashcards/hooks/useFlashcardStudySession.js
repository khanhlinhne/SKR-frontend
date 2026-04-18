import { useCallback, useEffect, useRef, useState } from 'react';
import { createStudyReviewTransport } from '@/features/flashcards/utils/studyReviewTransport';
import { flashcardApi } from '@/shared/api';
import {
    createClientReviewId,
    extractStudyPayload,
    isBatchEndpointUnsupported,
    isSameEntityId,
    normalizeComparableId,
    normalizeDeck,
    readCurrentUserId,
    resolveStudySyncConfig,
} from '@/features/flashcards/models/flashcardModel';

const SYNC_STATUS_VISIBLE_THRESHOLD = 8;
const SYNC_NOW_BUTTON_THRESHOLD = 20;

export function useFlashcardStudySession({
    searchParams,
    setSearchParams,
    decks,
    loading,
    currentUserId,
    fetchDecks,
    fetchDeckItems,
    applyDeckProgress,
    applyOptimisticDeckDelta,
    upsertDeck,
    setError,
}) {
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [studyMode, setStudyMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });
    const [currentDeckItems, setCurrentDeckItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [activeStudySessionId, setActiveStudySessionId] = useState(null);
    const [studySessionStartedAt, setStudySessionStartedAt] = useState(null);
    const [savingReview, setSavingReview] = useState(false);
    const [reviewSyncState, setReviewSyncState] = useState({
        pendingCount: 0,
        inFlightCount: 0,
        queuedCount: 0,
        isFlushing: false,
    });
    const [manualSyncing, setManualSyncing] = useState(false);

    const reviewTransportRef = useRef(null);
    const deepLinkSignatureRef = useRef('');

    const deepLinkDeckId = searchParams.get('deckId') || searchParams.get('deck');
    const deepLinkAutoStudy = ['1', 'true', 'yes'].includes((searchParams.get('study') || '').toLowerCase());
    const deepLinkSignature = `${normalizeComparableId(deepLinkDeckId)}:${deepLinkAutoStudy ? '1' : '0'}`;

    const resetReviewSyncState = useCallback(() => {
        setReviewSyncState({
            pendingCount: 0,
            inFlightCount: 0,
            queuedCount: 0,
            isFlushing: false,
        });
    }, []);

    const updateSelectedDeckProgress = useCallback((deckId, deckProgress) => {
        setSelectedDeck((prevDeck) =>
            isSameEntityId(prevDeck?.id, deckId)
                ? {
                      ...prevDeck,
                      mastered: Number(deckProgress.masteredCount ?? prevDeck.mastered ?? 0),
                      dueToday: Number(deckProgress.dueToday ?? prevDeck.dueToday ?? 0),
                      raw: {
                          ...prevDeck.raw,
                          masteredCount: Number(deckProgress.masteredCount ?? prevDeck.mastered ?? 0),
                          dueToday: Number(deckProgress.dueToday ?? prevDeck.dueToday ?? 0),
                      },
                  }
                : prevDeck,
        );
    }, []);

    const applyStudyDeckProgress = useCallback((deckId, deckProgress) => {
        if (!deckProgress) {
            return;
        }

        applyDeckProgress(deckId, deckProgress);
        updateSelectedDeckProgress(deckId, deckProgress);
    }, [applyDeckProgress, updateSelectedDeckProgress]);

    const applySelectedDeckOptimisticDelta = useCallback((deckId, delta) => {
        setSelectedDeck((prevDeck) => {
            if (!isSameEntityId(prevDeck?.id, deckId)) {
                return prevDeck;
            }

            const totalCards = Math.max(Number(prevDeck.totalCards || 0), 0);
            const nextMastered = Math.min(
                totalCards,
                Math.max(Number(prevDeck.mastered || 0) + Number(delta.masteredDelta || 0), 0),
            );
            const nextDueToday = Math.max(Number(prevDeck.dueToday || 0) + Number(delta.dueTodayDelta || 0), 0);

            return {
                ...prevDeck,
                mastered: nextMastered,
                dueToday: nextDueToday,
                raw: {
                    ...prevDeck.raw,
                    masteredCount: nextMastered,
                    dueToday: nextDueToday,
                },
            };
        });
    }, []);

    const applyStudyOptimisticDeckDelta = useCallback((deckId, delta) => {
        applyOptimisticDeckDelta(deckId, delta);
        applySelectedDeckOptimisticDelta(deckId, delta);
    }, [applyOptimisticDeckDelta, applySelectedDeckOptimisticDelta]);

    const disposeStudyReviewTransport = useCallback(() => {
        reviewTransportRef.current?.dispose();
        reviewTransportRef.current = null;
        resetReviewSyncState();
    }, [resetReviewSyncState]);

    const initializeStudyReviewTransport = useCallback((deckId, sessionId) => {
        disposeStudyReviewTransport();

        const syncConfig = resolveStudySyncConfig();
        const transport = createStudyReviewTransport({
            maxConcurrent: syncConfig.concurrency,
            maxBatchSize: syncConfig.batchSize,
            flushIntervalMs: syncConfig.flushIntervalMs,
            maxAttempts: 3,
            retryBaseDelayMs: 1000,
            retryMaxDelayMs: 8000,
            submitBatch: async (reviews) => {
                const normalizedReviews = reviews.map((review) => ({
                    flashcardItemId: review.flashcardItemId,
                    result: review.result,
                    reviewedAt: review.reviewedAt || new Date().toISOString(),
                    clientReviewId: review.clientReviewId || createClientReviewId(),
                }));

                try {
                    await flashcardApi.submitStudyReviewBatch(deckId, sessionId, {
                        reviews: normalizedReviews,
                    });
                } catch (batchError) {
                    if (isBatchEndpointUnsupported(batchError)) {
                        normalizedReviews.forEach((review) => {
                            flashcardApi.submitStudyReview(deckId, sessionId, {
                                flashcardItemId: review.flashcardItemId,
                                result: review.result,
                                reviewedAt: review.reviewedAt,
                                clientReviewId: review.clientReviewId,
                            }).catch(() => {});
                        });
                    }
                }

                return { success: true };
            },
            onBatchSuccess: () => {},
            onError: () => {},
        });

        transport.subscribe(setReviewSyncState);
        reviewTransportRef.current = transport;
        return transport;
    }, [disposeStudyReviewTransport]);

    const resetStudyState = useCallback(() => {
        setStudyMode(false);
        setSelectedDeck(null);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setCurrentDeckItems([]);
        setItemsLoading(false);
        setSavingReview(false);
        setActiveStudySessionId(null);
        setStudySessionStartedAt(null);
        setStudyStats({ correct: 0, incorrect: 0, skipped: 0 });
        setManualSyncing(false);
        disposeStudyReviewTransport();
    }, [disposeStudyReviewTransport]);

    const finalizeStudySession = useCallback(async (deckId, options = {}) => {
        const sessionId = options.sessionId ?? activeStudySessionId;
        if (!deckId || !sessionId) {
            return false;
        }

        let completed = false;
        setSavingReview(true);

        try {
            await reviewTransportRef.current?.flushAll({ timeoutMs: 20_000 });

            const startedAt = options.startedAt ?? studySessionStartedAt;
            const durationSeconds = startedAt
                ? Math.max(Math.round((Date.now() - startedAt) / 1000), 0)
                : 0;

            const response = await flashcardApi.completeStudySession(deckId, sessionId, {
                sessionDurationSeconds: durationSeconds,
            });
            const payload = extractStudyPayload(response);
            applyStudyDeckProgress(deckId, payload.deckProgress);
            completed = true;
            return true;
        } catch (err) {
            console.error('Failed to complete study session:', err);
            setError(err.response?.data?.message || err.message || 'Không thể hoàn tất phiên học flashcard');
            return false;
        } finally {
            setSavingReview(false);
            if (completed) {
                setActiveStudySessionId(null);
                setStudySessionStartedAt(null);
                disposeStudyReviewTransport();
            }
        }
    }, [activeStudySessionId, applyStudyDeckProgress, disposeStudyReviewTransport, setError, studySessionStartedAt]);

    const enqueueStudyReview = useCallback((payload) => {
        const transport = reviewTransportRef.current;
        if (!transport) {
            throw new Error('Study review transport is not ready.');
        }

        transport.enqueue(payload);
    }, []);

    const updateStudyStat = useCallback((result, delta = 1) => {
        const statKey = result === 'correct' ? 'correct' : result === 'incorrect' ? 'incorrect' : 'skipped';
        setStudyStats((prev) => ({
            ...prev,
            [statKey]: Math.max((prev[statKey] || 0) + delta, 0),
        }));
    }, []);

    const handleStartStudy = useCallback(async (deck) => {
        try {
            setError(null);
            setSelectedDeck(deck);
            setStudyMode(true);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setStudyStats({ correct: 0, incorrect: 0, skipped: 0 });
            setItemsLoading(true);
            setSavingReview(false);
            setManualSyncing(false);
            disposeStudyReviewTransport();

            const items = await fetchDeckItems(deck.id);
            setCurrentDeckItems(items);

            if (items.length > 0) {
                const response = await flashcardApi.startStudySession(deck.id);
                const payload = extractStudyPayload(response);
                const sessionId = payload.session?.sessionId || null;
                setActiveStudySessionId(sessionId);
                setStudySessionStartedAt(Date.now());
                applyStudyDeckProgress(deck.id, payload.deckProgress);

                if (sessionId) {
                    initializeStudyReviewTransport(deck.id, sessionId);
                }
            } else {
                setActiveStudySessionId(null);
                setStudySessionStartedAt(null);
            }
        } catch (err) {
            console.error('Failed to start study session:', err);
            setError(err.response?.data?.message || err.message || 'Không thể bắt đầu phiên học flashcard');
            resetStudyState();
        } finally {
            setItemsLoading(false);
        }
    }, [applyStudyDeckProgress, disposeStudyReviewTransport, fetchDeckItems, initializeStudyReviewTransport, resetStudyState, setError]);

    const handleFlipCard = useCallback(() => {
        setIsFlipped((prev) => !prev);
    }, []);

    const handleNextCard = useCallback((result) => {
        if (currentDeckItems.length === 0 || savingReview) {
            return;
        }

        const currentCard = currentDeckItems[currentCardIndex];
        const deckId = selectedDeck?.id;
        const sessionId = activeStudySessionId;

        if (!currentCard || !deckId || !sessionId) {
            setError('Phiên học chưa sẵn sàng để lưu tiến độ. Vui lòng mở lại bộ flashcard.');
            return;
        }

        setError(null);
        updateStudyStat(result, 1);

        const optimisticDeckDelta =
            result === 'correct'
                ? { masteredDelta: 1, dueTodayDelta: -1 }
                : { masteredDelta: 0, dueTodayDelta: 0 };
        applyStudyOptimisticDeckDelta(deckId, optimisticDeckDelta);

        try {
            enqueueStudyReview({
                flashcardItemId: currentCard.id,
                result,
                reviewedAt: new Date().toISOString(),
                clientReviewId: createClientReviewId(),
            });
        } catch (err) {
            updateStudyStat(result, -1);
            if (optimisticDeckDelta.masteredDelta || optimisticDeckDelta.dueTodayDelta) {
                applyStudyOptimisticDeckDelta(deckId, {
                    masteredDelta: -optimisticDeckDelta.masteredDelta,
                    dueTodayDelta: -optimisticDeckDelta.dueTodayDelta,
                });
            }
            setError(err.message || 'Không thể khởi tạo đồng bộ tiến độ flashcard.');
            return;
        }

        const isLastCard = currentCardIndex >= currentDeckItems.length - 1;

        if (!isLastCard) {
            setCurrentCardIndex((prev) => prev + 1);
            setIsFlipped(false);
            return;
        }

        void (async () => {
            const finalized = await finalizeStudySession(deckId, {
                sessionId,
                startedAt: studySessionStartedAt,
            });

            if (finalized) {
                resetStudyState();
                void fetchDecks();
            }
        })();
    }, [
        activeStudySessionId,
        applyStudyOptimisticDeckDelta,
        currentCardIndex,
        currentDeckItems,
        enqueueStudyReview,
        fetchDecks,
        finalizeStudySession,
        resetStudyState,
        savingReview,
        selectedDeck,
        setError,
        studySessionStartedAt,
        updateStudyStat,
    ]);

    const handleEndStudy = useCallback(async () => {
        const deckId = selectedDeck?.id;
        const sessionId = activeStudySessionId;
        const startedAt = studySessionStartedAt;

        if (!deckId || !sessionId) {
            resetStudyState();
            return;
        }

        const finalized = await finalizeStudySession(deckId, { sessionId, startedAt });
        if (finalized) {
            resetStudyState();
            void fetchDecks();
        }
    }, [activeStudySessionId, fetchDecks, finalizeStudySession, resetStudyState, selectedDeck, studySessionStartedAt]);

    const handleManualSync = useCallback(async () => {
        if (!reviewTransportRef.current || manualSyncing) {
            return;
        }

        setManualSyncing(true);
        try {
            await reviewTransportRef.current.flushAll({ timeoutMs: 4_000 });
        } catch (syncError) {
            setError(syncError.message || 'Không thể đồng bộ nhanh tiến độ flashcard.');
        } finally {
            setManualSyncing(false);
        }
    }, [manualSyncing, setError]);

    const handlePrevCard = useCallback(() => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex((prev) => prev - 1);
            setIsFlipped(false);
        }
    }, [currentCardIndex]);

    const handleSkipCard = useCallback(() => {
        handleNextCard('skip');
    }, [handleNextCard]);

    useEffect(() => {
        if (!studyMode) {
            return undefined;
        }

        const flushPendingReviews = () => {
            void reviewTransportRef.current?.flushAll({ timeoutMs: 4_000 }).catch(() => {});
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                flushPendingReviews();
            }
        };

        window.addEventListener('beforeunload', flushPendingReviews);
        window.addEventListener('pagehide', flushPendingReviews);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', flushPendingReviews);
            window.removeEventListener('pagehide', flushPendingReviews);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [studyMode]);

    useEffect(() => {
        if (!studyMode) {
            return undefined;
        }

        const handleKeyPress = (event) => {
            if (currentDeckItems.length === 0 || savingReview) {
                return;
            }

            switch (event.key) {
                case ' ':
                    event.preventDefault();
                    setIsFlipped((prev) => !prev);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    if (currentCardIndex > 0) {
                        setCurrentCardIndex((prev) => prev - 1);
                        setIsFlipped(false);
                    }
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    handleSkipCard();
                    break;
                case '1':
                    event.preventDefault();
                    handleNextCard('incorrect');
                    break;
                case '2':
                    event.preventDefault();
                    handleNextCard('correct');
                    break;
                case 'Escape':
                    event.preventDefault();
                    void handleEndStudy();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentCardIndex, currentDeckItems, handleEndStudy, handleNextCard, handleSkipCard, savingReview, studyMode]);

    useEffect(() => {
        if (!deepLinkDeckId) {
            deepLinkSignatureRef.current = '';
            return;
        }

        if (loading || studyMode) {
            return;
        }

        if (deepLinkSignatureRef.current === deepLinkSignature) {
            return;
        }
        deepLinkSignatureRef.current = deepLinkSignature;

        const openFromDeepLink = async () => {
            const normalizedDeckId = normalizeComparableId(deepLinkDeckId);
            if (!normalizedDeckId) {
                return;
            }

            let targetDeck = decks.find((deck) => isSameEntityId(deck.id, normalizedDeckId)) || null;

            if (!targetDeck) {
                try {
                    const response = await flashcardApi.getSetById(deepLinkDeckId);
                    const payload = extractStudyPayload(response);
                    if (!payload) {
                        return;
                    }

                    targetDeck = normalizeDeck(payload, 0, currentUserId || readCurrentUserId());
                    upsertDeck(targetDeck);
                } catch (err) {
                    setError(err.response?.data?.message || err.message || 'Không thể mở bộ flashcard từ liên kết');
                    return;
                }
            }

            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('deckId');
            nextParams.delete('deck');
            nextParams.delete('study');
            setSearchParams(nextParams, { replace: true });

            if (deepLinkAutoStudy) {
                await handleStartStudy(targetDeck);
                return;
            }

            setSelectedDeck(targetDeck);
        };

        void openFromDeepLink();
    }, [
        currentUserId,
        decks,
        deepLinkAutoStudy,
        deepLinkDeckId,
        deepLinkSignature,
        handleStartStudy,
        loading,
        searchParams,
        setError,
        setSearchParams,
        studyMode,
        upsertDeck,
    ]);

    return {
        selectedDeck,
        setSelectedDeck,
        studyMode,
        currentCardIndex,
        isFlipped,
        studyStats,
        currentDeckItems,
        itemsLoading,
        activeStudySessionId,
        savingReview,
        reviewSyncState,
        manualSyncing,
        showSyncStatus: reviewSyncState.queuedCount > SYNC_STATUS_VISIBLE_THRESHOLD,
        showSyncNowButton: reviewSyncState.queuedCount > SYNC_NOW_BUTTON_THRESHOLD,
        handleStartStudy,
        handleFlipCard,
        handlePrevCard,
        handleNextCard,
        handleSkipCard,
        handleEndStudy,
        handleManualSync,
    };
}
