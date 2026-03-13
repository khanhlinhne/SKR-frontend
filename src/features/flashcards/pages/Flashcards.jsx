import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import { flashcardApi, subjectApi } from '@/shared/api';
import Icon from '@/shared/ui/icons/Icon';
import {
    FlashcardDeckCard,
    AddDeckCard,
    FlashcardDeckListItem,
    FlashcardStudyCard,
    StudyControls,
    KeyboardHints,
    StudyHeader,
    QuickStudySection,
    AISuggestions,
    CreateDeckModal,
    FlashcardsHeader,
} from '@/features/flashcards/components';
import { OwlLoader, StatCard, ViewToggle, FilterSortControls, SectionHeader } from '@/shared/ui/common';

const FALLBACK_DECK_COLORS = ['blue', 'green', 'purple', 'orange', 'yellow', 'red'];

function pickDeckColor(deck, index) {
    const seed = deck.setTitle || deck.setDescription || '';
    const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return FALLBACK_DECK_COLORS[(hash + index) % FALLBACK_DECK_COLORS.length];
}

function pickDeckIcon(deck) {
    const source = `${deck.setTitle || ''} ${Array.isArray(deck.tags) ? deck.tags.join(' ') : ''}`.toLowerCase();

    if (source.includes('react') || source.includes('javascript') || source.includes('html') || source.includes('git')) {
        return '💻';
    }
    if (source.includes('sql') || source.includes('database')) {
        return '🗄️';
    }
    if (source.includes('vocabulary') || source.includes('từ vựng') || source.includes('tu vung') || source.includes('english')) {
        return '📘';
    }

    return '📚';
}

function formatLastStudied(createdAt) {
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

function readCurrentUserId() {
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

    const token = localStorage.getItem('accessToken');
    if (!token) {
        return null;
    }

    const payload = token.split('.')[1];
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

function normalizeDeck(deck, index, currentUserId) {
    const totalCards = Number(deck.totalCards || 0);
    const mastered = Number(deck.masteredCount || deck.mastered || 0);
    const learning = Math.max(totalCards - mastered, 0);
    const creatorId = deck.creatorId || deck.creator?.userId || null;

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
        isOwned: Boolean(currentUserId && creatorId === currentUserId),
        raw: deck,
    };
}

function normalizeCard(item, index) {
    return {
        id: item.flashcardItemId || item.id || `card-${index}`,
        front: item.frontText || item.front || '',
        back: item.backText || item.back || '',
        difficulty: item.difficulty || 'medium',
    };
}

function extractDecksFromResponse(response, currentUserId) {
    const payload = response?.data?.data || response?.data || response;
    const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
    return items.map((deck, index) => normalizeDeck(deck, index, currentUserId));
}

function extractItemsFromResponse(response) {
    const payload = response?.data?.data || response?.data || response;
    const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
    return items.map(normalizeCard);
}

function extractStudyPayload(response) {
    const payload = response?.data?.data || response?.data || response;
    return payload || {};
}

export default function Flashcards() {
    const [viewMode, setViewMode] = useState('grid');
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [studyMode, setStudyMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });

    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDeckItems, setCurrentDeckItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [activeStudySessionId, setActiveStudySessionId] = useState(null);
    const [studySessionStartedAt, setStudySessionStartedAt] = useState(null);
    const [savingReview, setSavingReview] = useState(false);
    const [pendingReviewCount, setPendingReviewCount] = useState(0);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [hasAnimated, setHasAnimated] = useState(false);

    const reviewQueueRef = useRef(Promise.resolve());

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
            const response = await subjectApi.getAll({ limit: 100, status: 'published' });
            const payload = response?.data || response || {};
            const items = Array.isArray(payload.items) ? payload.items : [];

            setSubjectOptions(
                items
                    .map((subject) => ({
                        value: subject.subjectId || subject.courseId || '',
                        label: subject.subjectName || subject.courseName || '',
                        courseId: subject.subjectId || subject.courseId || null,
                    }))
                    .filter((option) => option.value && option.label),
            );
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
            setSubjectOptions([]);
        }
    }, []);

    useEffect(() => {
        fetchDecks();
        fetchSubjects();
    }, [fetchDecks, fetchSubjects]);

    const applyDeckProgress = useCallback((deckId, deckProgress) => {
        if (!deckProgress) {
            return;
        }

        setDecks((prevDecks) =>
            prevDecks.map((deck) =>
                deck.id === deckId
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

        setSelectedDeck((prevDeck) =>
            prevDeck?.id === deckId
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

    const updateStudyStat = useCallback((result, delta = 1) => {
        const statKey = result === 'correct' ? 'correct' : result === 'incorrect' ? 'incorrect' : 'skipped';
        setStudyStats((prev) => ({
            ...prev,
            [statKey]: Math.max((prev[statKey] || 0) + delta, 0),
        }));
    }, []);

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
        setPendingReviewCount(0);
        setStudyStats({ correct: 0, incorrect: 0, skipped: 0 });
        reviewQueueRef.current = Promise.resolve();
    }, []);

    const finalizeStudySession = useCallback(async (deckId, options = {}) => {
        const sessionId = options.sessionId ?? activeStudySessionId;
        if (!deckId || !sessionId) {
            return false;
        }

        setSavingReview(true);

        try {
            await reviewQueueRef.current;

            const startedAt = options.startedAt ?? studySessionStartedAt;
            const durationSeconds = startedAt
                ? Math.max(Math.round((Date.now() - startedAt) / 1000), 0)
                : 0;

            const response = await flashcardApi.completeStudySession(deckId, sessionId, {
                sessionDurationSeconds: durationSeconds,
            });
            const payload = extractStudyPayload(response);
            applyDeckProgress(deckId, payload.deckProgress);
            return true;
        } catch (err) {
            console.error('Failed to complete study session:', err);
            setError(err.response?.data?.message || err.message || 'Không thể hoàn tất phiên học flashcard');
            return false;
        } finally {
            reviewQueueRef.current = Promise.resolve();
            setPendingReviewCount(0);
            setSavingReview(false);
            setActiveStudySessionId(null);
            setStudySessionStartedAt(null);
        }
    }, [activeStudySessionId, studySessionStartedAt, applyDeckProgress]);

    const enqueueStudyReview = useCallback((payload) => {
        setPendingReviewCount((current) => current + 1);

        const persistReview = async () => {
            const response = await flashcardApi.submitStudyReview(payload.deckId, payload.sessionId, {
                flashcardItemId: payload.flashcardItemId,
                result: payload.result,
            });
            const reviewPayload = extractStudyPayload(response);
            applyDeckProgress(payload.deckId, reviewPayload.deckProgress);
            return reviewPayload;
        };

        const queuedPromise = reviewQueueRef.current.then(persistReview, persistReview);
        reviewQueueRef.current = queuedPromise.then(
            () => undefined,
            () => undefined,
        );

        return queuedPromise
            .catch((err) => {
                updateStudyStat(payload.result, -1);
                console.error('Failed to save flashcard progress:', err);
                setError(err.response?.data?.message || err.message || 'Không thể lưu tiến độ flashcard');
                throw err;
            })
            .finally(() => {
                setPendingReviewCount((current) => Math.max(current - 1, 0));
            });
    }, [applyDeckProgress, updateStudyStat]);

    useEffect(() => {
        const timer = setTimeout(() => setHasAnimated(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: hasAnimated ? 0 : 0.08, delayChildren: hasAnimated ? 0 : 0.1 },
        },
    };

    const cardVariants = hasAnimated
        ? {
              hidden: { opacity: 1, y: 0, scale: 1 },
              visible: { opacity: 1, y: 0, scale: 1 },
          }
        : {
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              },
          };

    const stats = {
        totalCards: decks.reduce((sum, deck) => sum + (deck.totalCards || 0), 0),
        mastered: decks.reduce((sum, deck) => sum + (deck.mastered || 0), 0),
        dueToday: decks.reduce((sum, deck) => sum + (deck.dueToday || 0), 0),
        streak: 0,
    };

    const handleStartStudy = async (deck) => {
        try {
            setError(null);
            setSelectedDeck(deck);
            setStudyMode(true);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setStudyStats({ correct: 0, incorrect: 0, skipped: 0 });
            setItemsLoading(true);
            setSavingReview(false);
            setPendingReviewCount(0);
            reviewQueueRef.current = Promise.resolve();

            const items = await fetchDeckItems(deck.id);
            setCurrentDeckItems(items);

            if (items.length > 0) {
                const response = await flashcardApi.startStudySession(deck.id);
                const payload = extractStudyPayload(response);
                setActiveStudySessionId(payload.session?.sessionId || null);
                setStudySessionStartedAt(Date.now());
                applyDeckProgress(deck.id, payload.deckProgress);
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
    };

    const handleFlipCard = () => setIsFlipped((prev) => !prev);

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

        const isLastCard = currentCardIndex >= currentDeckItems.length - 1;

        if (!isLastCard) {
            setCurrentCardIndex((prev) => prev + 1);
            setIsFlipped(false);
        }

        const savePromise = enqueueStudyReview({
            deckId,
            sessionId,
            flashcardItemId: currentCard.id,
            result,
        });

        if (!isLastCard) {
            return;
        }

        setSavingReview(true);

        void (async () => {
            try {
                await savePromise;
                const finalized = await finalizeStudySession(deckId, {
                    sessionId,
                    startedAt: studySessionStartedAt,
                });

                if (finalized) {
                    resetStudyState();
                    void fetchDecks();
                }
            } catch {
                setSavingReview(false);
            }
        })();
    }, [
        currentDeckItems,
        savingReview,
        currentCardIndex,
        selectedDeck,
        activeStudySessionId,
        studySessionStartedAt,
        updateStudyStat,
        enqueueStudyReview,
        finalizeStudySession,
        fetchDecks,
        resetStudyState,
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
    }, [selectedDeck, activeStudySessionId, studySessionStartedAt, finalizeStudySession, fetchDecks, resetStudyState]);

    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex((prev) => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleSkipCard = useCallback(() => {
        handleNextCard('skip');
    }, [handleNextCard]);

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
    }, [studyMode, currentDeckItems, savingReview, currentCardIndex, handleSkipCard, handleNextCard, handleEndStudy]);

    const handleCreateDeck = async (deckData) => {
        let createdSetId = null;

        try {
            setError(null);

            const cards = Array.isArray(deckData.cards)
                ? deckData.cards.filter((card) => card.frontText?.trim() && card.backText?.trim())
                : [];

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

            await Promise.all(
                cards.map((card, index) =>
                    flashcardApi.createItem(createdSetId, {
                        frontText: card.frontText.trim(),
                        backText: card.backText.trim(),
                        cardOrder: card.cardOrder ?? index,
                    }),
                ),
            );

            await fetchDecks();
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
            if (err.response?.data) {
                err.response.data.message = message;
            } else {
                err.response = { data: { message } };
            }
            setError(message);
            setError(err.response?.data?.message || err.message || 'Không thể tạo flashcard');
        }
    };

    const handleDeleteDeck = async (deckId) => {
        try {
            await flashcardApi.deleteSet(deckId);
            await fetchDecks();
        } catch (err) {
            console.error('Failed to delete deck:', err);
            setError(err.response?.data?.message || err.message || 'Không thể xóa flashcard');
        }
    };

    if (studyMode && selectedDeck) {
        const currentCard = currentDeckItems[currentCardIndex];
        const progress = currentDeckItems.length > 0 ? ((currentCardIndex + 1) / currentDeckItems.length) * 100 : 0;

        if (itemsLoading) {
            return (
                <div className="flex h-screen bg-base-200 overflow-hidden">
                    <DashboardSidebar />
                    <div className="flex-1 flex items-center justify-center">
                        <OwlLoader
                            message="Đang mở bộ flashcard..."
                            subMessage="Owl đang chuẩn bị thẻ học cho bạn."
                            className="py-12"
                        />
                    </div>
                </div>
            );
        }

        if (currentDeckItems.length === 0) {
            return (
                <div className="flex h-screen bg-base-200 overflow-hidden">
                    <DashboardSidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <StudyHeader
                            deckName={selectedDeck.name}
                            currentIndex={0}
                            totalCards={0}
                            stats={studyStats}
                            progress={0}
                            onClose={handleEndStudy}
                        />
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="max-w-md rounded-3xl border border-base-300 bg-base-100 p-8 text-center shadow-lg">
                                <Icon name="Layers3" size="xl" className="mx-auto mb-4 text-base-content/30" />
                                <h3 className="text-xl font-bold text-base-content">Bộ này chưa có thẻ nào</h3>
                                <p className="mt-2 text-sm text-base-content/60">Hãy thêm item vào bộ flashcard trước khi bắt đầu học.</p>
                                <button onClick={handleEndStudy} className="btn btn-primary mt-6 rounded-xl">
                                    Quay lại danh sách
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex h-screen bg-base-200 overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <StudyHeader
                        deckName={selectedDeck.name}
                        currentIndex={currentCardIndex}
                        totalCards={currentDeckItems.length}
                        stats={studyStats}
                        progress={progress}
                        onClose={handleEndStudy}
                    />
                    <div className="flex-1 flex flex-col p-8">
                        {error && (
                            <div className="alert alert-error mb-4">
                                <Icon name="AlertCircle" />
                                <span>{error}</span>
                            </div>
                        )}
                        {pendingReviewCount > 0 && !error && (
                            <div className="mb-4 text-center text-sm text-base-content/60">
                                Đang lưu {pendingReviewCount} thẻ ở nền...
                            </div>
                        )}
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-full max-w-2xl">
                                <FlashcardStudyCard card={currentCard} isFlipped={isFlipped} onFlip={handleFlipCard} />
                                <StudyControls
                                    onPrev={handlePrevCard}
                                    onNext={handleNextCard}
                                    onSkip={handleSkipCard}
                                    canGoPrev={currentCardIndex > 0}
                                    canGoNext={currentCardIndex < currentDeckItems.length - 1}
                                    disabled={savingReview || !activeStudySessionId}
                                />
                                <KeyboardHints />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <FlashcardsHeader onCreateNew={() => setShowCreateModal(true)} />

                <motion.main className="flex-1 overflow-y-auto p-6 lg:p-8" variants={containerVariants} initial="hidden" animate="visible">
                    <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
                        <StatCard icon="BookOpen" label="Tổng Flashcards" value={stats.totalCards} iconBgColor="bg-blue-500/10" iconColor="text-blue-500" variants={cardVariants} />
                        <StatCard icon="CheckCircle2" label="Đã thuộc" value={stats.mastered} iconBgColor="bg-green-500/10" iconColor="text-green-500" variants={cardVariants} />
                        <StatCard icon="Target" label="Cần ôn hôm nay" value={stats.dueToday} iconBgColor="bg-orange-500/10" iconColor="text-orange-500" variants={cardVariants} />
                        <StatCard icon="Flame" label="Streak" value={`${stats.streak} ngày`} iconBgColor="bg-red-500/10" iconColor="text-red-500" variants={cardVariants} />
                    </div>

                    <motion.div variants={cardVariants}>
                        <SectionHeader title="Bộ Flashcard" badge={`${decks.length} bộ`}>
                            <FilterSortControls />
                            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                        </SectionHeader>
                    </motion.div>

                    {loading && (
                        <OwlLoader
                            message="Đang tải bộ flashcard..."
                            subMessage="Owl đang gom cả deck public và deck của bạn."
                            className="py-12"
                        />
                    )}

                    {error && !loading && (
                        <div className="alert alert-error mb-4">
                            <Icon name="AlertCircle" />
                            <span>{error}</span>
                            <button onClick={fetchDecks} className="btn btn-sm">Thử lại</button>
                        </div>
                    )}

                    {!loading && !error && decks.length === 0 && (
                        <div className="text-center py-12">
                            <Icon name="FolderOpen" size="xl" className="mx-auto mb-4 text-base-content/30" />
                            <p className="text-base-content/60 mb-2">Chưa có flashcard public hoặc bộ nào do bạn tạo.</p>
                            <p className="text-sm text-base-content/50">API này trả về cả deck public và deck của chính bạn.</p>
                        </div>
                    )}

                    {!loading && !error && decks.length > 0 && (
                        viewMode === 'grid' ? (
                            <div key="grid-view" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {decks.map((deck, index) => (
                                    <FlashcardDeckCard
                                        key={deck.id}
                                        deck={deck}
                                        index={index}
                                        variants={cardVariants}
                                        onStartStudy={handleStartStudy}
                                        onDelete={deck.isOwned ? () => handleDeleteDeck(deck.id) : undefined}
                                    />
                                ))}
                                <AddDeckCard onClick={() => setShowCreateModal(true)} variants={cardVariants} />
                            </div>
                        ) : (
                            <div key="list-view" className="space-y-3">
                                {decks.map((deck) => (
                                    <FlashcardDeckListItem key={deck.id} deck={deck} variants={cardVariants} onStartStudy={handleStartStudy} />
                                ))}
                            </div>
                        )
                    )}

                    <QuickStudySection dueToday={stats.dueToday} variants={cardVariants} />
                    <AISuggestions variants={cardVariants} />
                </motion.main>
            </div>

            {showCreateModal && (
                <CreateDeckModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateDeck}
                    subjects={subjectOptions}
                />
            )}
        </div>
    );
}
