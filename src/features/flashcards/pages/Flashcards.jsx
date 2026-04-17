import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { DashboardSidebar } from '@/features/learner/components';
import { createStudyReviewTransport } from '@/features/flashcards/utils/studyReviewTransport';
import { resolveFlashcardImageUrl } from '@/features/flashcards/utils/imageUrl';
import { enrollmentApi, flashcardApi } from '@/shared/api';
import { mapWithConcurrency } from '@/shared/utils/mapWithConcurrency.js';
import { isTokenValid } from '@/shared/utils/tokenManager';
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
import { OwlDialog, OwlLoader, StatCard, ViewToggle, FilterSortControls, SectionHeader, useOwlDialog } from '@/shared/ui/common';

const FALLBACK_DECK_COLORS = ['blue', 'green', 'purple', 'orange', 'yellow', 'red'];
const SUBJECT_PICKER_LIMIT = 40;
const CREATE_ITEM_CONCURRENCY = 4;
const SYNC_STATUS_VISIBLE_THRESHOLD = 8;
const SYNC_NOW_BUTTON_THRESHOLD = 20;
const PROGRESS_SYNC_REVIEW_THRESHOLD = 2; // Sync after every 2 reviews (faster UX)
const PROGRESS_SYNC_INTERVAL_MS = 500; // Sync every 500ms max (was 10s!)

function createClientReviewId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `review-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isBatchEndpointUnsupported(error) {
    const status = error?.response?.status;
    return status === 404 || status === 405 || status === 501;
}

function resolveStudySyncConfig() {
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

    // Fast connection: sync nearly instantly (like Quizlet)
    return {
        concurrency: 6,
        fallbackConcurrency: 4,
        batchSize: 10,
        flushIntervalMs: 50, // Nearly instant sync
    };
}

function pickDeckColor(deck, index) {
    const seed = deck.setTitle || deck.setDescription || '';
    const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return FALLBACK_DECK_COLORS[(hash + index) % FALLBACK_DECK_COLORS.length];
}

function pickDeckIcon(deck) {
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

    if (!isTokenValid()) {
        return null;
    }

    const token = localStorage.getItem('accessToken');
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

function normalizeComparableId(value) {
    if (value == null) {
        return '';
    }

    return String(value).trim().toLowerCase();
}

function isSameEntityId(left, right) {
    const normalizedLeft = normalizeComparableId(left);
    const normalizedRight = normalizeComparableId(right);

    return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

function normalizeSearchText(value) {
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

function resolveDeckSubjectMeta(deck) {
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

function normalizeDeck(deck, index, currentUserId) {
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

function normalizeCard(item, index) {
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

function extractDecksFromResponse(response, currentUserId) {
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
    const [searchParams, setSearchParams] = useSearchParams();
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
    const [reviewSyncState, setReviewSyncState] = useState({
        pendingCount: 0,
        inFlightCount: 0,
        queuedCount: 0,
        isFlushing: false,
    });
    const [manualSyncing, setManualSyncing] = useState(false);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [hasAnimated, setHasAnimated] = useState(false);
    const [deletingDeckId, setDeletingDeckId] = useState(null);
    const [deckDeleteCandidate, setDeckDeleteCandidate] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDeck, setEditingDeck] = useState(null);
    const [editingDeckId, setEditingDeckId] = useState(null);
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();

    const reviewTransportRef = useRef(null);
    const pendingDeckProgressRef = useRef(null);
    const pendingProgressDeckIdRef = useRef(null);
    const pendingProgressReviewCountRef = useRef(0);
    const progressSyncTimerRef = useRef(null);
    const lastProgressAppliedAtRef = useRef(0);
    const deepLinkSignatureRef = useRef('');

    const deepLinkDeckId = searchParams.get('deckId') || searchParams.get('deck');
    const deepLinkAutoStudy = ['1', 'true', 'yes'].includes((searchParams.get('study') || '').toLowerCase());
    const deepLinkSignature = `${normalizeComparableId(deepLinkDeckId)}:${deepLinkAutoStudy ? '1' : '0'}`;
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

    useEffect(() => {
        fetchDecks();
    }, [fetchDecks]);

    useEffect(() => {
        void fetchSubjects();
    }, [fetchSubjects]);

    useEffect(() => {
        if (!showCreateModal || subjectOptions.length > 0) {
            return;
        }

        void fetchSubjects();
    }, [showCreateModal, subjectOptions.length, fetchSubjects]);

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

    const applyOptimisticDeckDelta = useCallback((deckId, { masteredDelta = 0, dueTodayDelta = 0 }) => {
        if (!deckId || (!masteredDelta && !dueTodayDelta)) {
            return;
        }

        const applyDelta = (deck) => {
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
        };

        setDecks((prevDecks) => prevDecks.map((deck) => (deck.id === deckId ? applyDelta(deck) : deck)));
        setSelectedDeck((prevDeck) => (prevDeck?.id === deckId ? applyDelta(prevDeck) : prevDeck));
    }, []);

    const updateStudyStat = useCallback((result, delta = 1) => {
        const statKey = result === 'correct' ? 'correct' : result === 'incorrect' ? 'incorrect' : 'skipped';
        setStudyStats((prev) => ({
            ...prev,
            [statKey]: Math.max((prev[statKey] || 0) + delta, 0),
        }));
    }, []);

    const resetReviewSyncState = useCallback(() => {
        setReviewSyncState({
            pendingCount: 0,
            inFlightCount: 0,
            queuedCount: 0,
            isFlushing: false,
        });
    }, []);

    const clearProgressSyncTimer = useCallback(() => {
        if (!progressSyncTimerRef.current) {
            return;
        }

        clearTimeout(progressSyncTimerRef.current);
        progressSyncTimerRef.current = null;
    }, []);

    const resetProgressSyncBuffer = useCallback(() => {
        pendingDeckProgressRef.current = null;
        pendingProgressDeckIdRef.current = null;
        pendingProgressReviewCountRef.current = 0;
        clearProgressSyncTimer();
    }, [clearProgressSyncTimer]);

    const flushProgressSyncBuffer = useCallback(
        ({ force = false } = {}) => {
            const deckProgress = pendingDeckProgressRef.current;
            const deckId = pendingProgressDeckIdRef.current;
            if (!deckProgress || !deckId) {
                return;
            }

            const elapsedMs = Date.now() - lastProgressAppliedAtRef.current;
            if (
                !force &&
                pendingProgressReviewCountRef.current < PROGRESS_SYNC_REVIEW_THRESHOLD &&
                elapsedMs < PROGRESS_SYNC_INTERVAL_MS
            ) {
                return;
            }

            applyDeckProgress(deckId, deckProgress);
            lastProgressAppliedAtRef.current = Date.now();
            resetProgressSyncBuffer();
        },
        [applyDeckProgress, resetProgressSyncBuffer],
    );

    const queueProgressSync = useCallback(
        (deckId, deckProgress, syncedReviewCount = 1) => {
            if (!deckProgress || !deckId) {
                return;
            }

            pendingDeckProgressRef.current = deckProgress;
            pendingProgressDeckIdRef.current = deckId;
            pendingProgressReviewCountRef.current += Math.max(Number(syncedReviewCount) || 0, 1);

            if (pendingProgressReviewCountRef.current >= PROGRESS_SYNC_REVIEW_THRESHOLD) {
                flushProgressSyncBuffer({ force: true });
                return;
            }

            if (!progressSyncTimerRef.current) {
                progressSyncTimerRef.current = setTimeout(() => {
                    progressSyncTimerRef.current = null;
                    flushProgressSyncBuffer({ force: true });
                }, PROGRESS_SYNC_INTERVAL_MS);
            }
        },
        [flushProgressSyncBuffer],
    );

    const disposeStudyReviewTransport = useCallback(() => {
        reviewTransportRef.current?.dispose();
        reviewTransportRef.current = null;
        resetReviewSyncState();
    }, [resetReviewSyncState]);

    const initializeStudyReviewTransport = useCallback(
        (deckId, sessionId) => {
            disposeStudyReviewTransport();
            resetProgressSyncBuffer();

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

                    // Fire-and-forget: Don't wait, don't show errors
                    // UI already updated with optimistic updates
                    try {
                        await flashcardApi.submitStudyReviewBatch(deckId, sessionId, {
                            reviews: normalizedReviews,
                        });
                    } catch (batchError) {
                        // Silently try fallback without showing errors
                        if (isBatchEndpointUnsupported(batchError)) {
                            // Try single API but don't wait
                            normalizedReviews.forEach((review) => {
                                flashcardApi.submitStudyReview(deckId, sessionId, {
                                    flashcardItemId: review.flashcardItemId,
                                    result: review.result,
                                    reviewedAt: review.reviewedAt,
                                    clientReviewId: review.clientReviewId,
                                }).catch(() => {}); // Silent fail
                            });
                        }
                        // Silent fail - UI already updated
                    }

                    // Return success even if backend failed - UI is already updated
                    return { success: true };
                },
                onBatchSuccess: (_response, _reviews) => {
                    // Silent success - UI already updated
                },
                onError: (_err) => {
                    // Silent error - don't disrupt UX
                    // Reviews are already saved in UI via optimistic updates
                },
            });

            transport.subscribe(setReviewSyncState);
            reviewTransportRef.current = transport;
            return transport;
        },
        [disposeStudyReviewTransport, queueProgressSync, resetProgressSyncBuffer],
    );

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
        resetProgressSyncBuffer();
        disposeStudyReviewTransport();
    }, [disposeStudyReviewTransport, resetProgressSyncBuffer]);

    const finalizeStudySession = useCallback(async (deckId, options = {}) => {
        const sessionId = options.sessionId ?? activeStudySessionId;
        if (!deckId || !sessionId) {
            return false;
        }

        let completed = false;
        setSavingReview(true);

        try {
            await reviewTransportRef.current?.flushAll({ timeoutMs: 20_000 });
            flushProgressSyncBuffer({ force: true });

            const startedAt = options.startedAt ?? studySessionStartedAt;
            const durationSeconds = startedAt
                ? Math.max(Math.round((Date.now() - startedAt) / 1000), 0)
                : 0;

            const response = await flashcardApi.completeStudySession(deckId, sessionId, {
                sessionDurationSeconds: durationSeconds,
            });
            const payload = extractStudyPayload(response);
            applyDeckProgress(deckId, payload.deckProgress);
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
    }, [activeStudySessionId, studySessionStartedAt, applyDeckProgress, disposeStudyReviewTransport, flushProgressSyncBuffer]);

    const enqueueStudyReview = useCallback((payload) => {
        const transport = reviewTransportRef.current;
        if (!transport) {
            throw new Error('Study review transport is not ready.');
        }

        transport.enqueue(payload);
    }, []);

    useEffect(() => {
        if (!studyMode) {
            return undefined;
        }

        const flushPendingReviews = () => {
            void reviewTransportRef.current?.flushAll({ timeoutMs: 4_000 }).then(() => {
                flushProgressSyncBuffer({ force: true });
            }).catch(() => {
                // Keep the optimistic UI responsive and let the next retry handle errors.
            });
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
    }, [studyMode, flushProgressSyncBuffer]);

    useEffect(() => {
        const timer = setTimeout(() => setHasAnimated(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => () => {
        clearProgressSyncTimer();
    }, [clearProgressSyncTimer]);

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

    const stats = {
        totalCards: filteredDecks.reduce((sum, deck) => sum + (deck.totalCards || 0), 0),
        mastered: filteredDecks.reduce((sum, deck) => sum + (deck.mastered || 0), 0),
        dueToday: filteredDecks.reduce((sum, deck) => sum + (deck.dueToday || 0), 0),
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
            setManualSyncing(false);
            resetProgressSyncBuffer();
            disposeStudyReviewTransport();

            const items = await fetchDeckItems(deck.id);
            setCurrentDeckItems(items);

            if (items.length > 0) {
                const response = await flashcardApi.startStudySession(deck.id);
                const payload = extractStudyPayload(response);
                const sessionId = payload.session?.sessionId || null;
                setActiveStudySessionId(sessionId);
                setStudySessionStartedAt(Date.now());
                applyDeckProgress(deck.id, payload.deckProgress);

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
    };

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

                    targetDeck = normalizeDeck(payload, 0, readCurrentUserId());
                    setDecks((prevDecks) =>
                        prevDecks.some((deck) => isSameEntityId(deck.id, targetDeck.id))
                            ? prevDecks
                            : [targetDeck, ...prevDecks],
                    );
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
        deepLinkDeckId,
        deepLinkAutoStudy,
        deepLinkSignature,
        loading,
        studyMode,
        decks,
        searchParams,
        setSearchParams,
        handleStartStudy,
    ]);

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

        const optimisticDeckDelta =
            result === 'correct'
                ? { masteredDelta: 1, dueTodayDelta: -1 }
                : { masteredDelta: 0, dueTodayDelta: 0 };
        applyOptimisticDeckDelta(deckId, optimisticDeckDelta);

        try {
            // Enqueue review - UI already updated via optimistic update
            // Fire-and-forget: don't wait for backend
            enqueueStudyReview({
                flashcardItemId: currentCard.id,
                result,
                reviewedAt: new Date().toISOString(),
                clientReviewId: createClientReviewId(),
            });
        } catch (err) {
            updateStudyStat(result, -1);
            if (optimisticDeckDelta.masteredDelta || optimisticDeckDelta.dueTodayDelta) {
                applyOptimisticDeckDelta(deckId, {
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
        currentDeckItems,
        savingReview,
        currentCardIndex,
        selectedDeck,
        activeStudySessionId,
        studySessionStartedAt,
        updateStudyStat,
        applyOptimisticDeckDelta,
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

    const handleManualSync = useCallback(async () => {
        if (!reviewTransportRef.current || manualSyncing) {
            return;
        }

        setManualSyncing(true);
        try {
            await reviewTransportRef.current.flushAll({ timeoutMs: 4_000 });
            flushProgressSyncBuffer({ force: true });
        } catch (syncError) {
            setError(syncError.message || 'Không thể đồng bộ nhanh tiến độ flashcard.');
        } finally {
            setManualSyncing(false);
        }
    }, [manualSyncing, flushProgressSyncBuffer]);

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
            const isOwnedCourse = subjectOptions.some((option) => isSameEntityId(option.courseId, deckData.courseId));
            if (!deckData.courseId || !isOwnedCourse) {
                throw new Error('Bạn chỉ được tạo flashcard cho môn học đã mua và thuộc quyền của tài khoản hiện tại.');
            }

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

            await mapWithConcurrency(
                cards,
                async (card, index) => {
                    const basePayload = {
                        frontText: card.frontText.trim(),
                        backText: card.backText.trim(),
                        cardOrder: card.cardOrder ?? index,
                    };
                    const imagePayload = {
                        ...basePayload,
                        frontImageUrl: card.frontImageUrl || null,
                        backImageUrl: card.backImageUrl || null,
                        frontImage: card.frontImageUrl || null,
                        backImage: card.backImageUrl || null,
                        frontMediaUrl: card.frontImageUrl || null,
                        backMediaUrl: card.backImageUrl || null,
                    };

                    return flashcardApi.createItem(createdSetId, imagePayload);
                },
                {
                    concurrency: CREATE_ITEM_CONCURRENCY,
                    retries: 1,
                    retryDelayMs: 150,
                },
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
        }
    };

    const handleOpenEditDeck = async (deck) => {
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

            const itemsResponse = await flashcardApi.getItems(requestDeckId, { limit: 100 });
            const deckItems = extractItemsFromResponse(itemsResponse);
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
    };

    const handleCloseEditModal = () => {
        if (editingDeckId) {
            return;
        }

        setShowEditModal(false);
        setEditingDeck(null);
    };

    const handleUpdateDeck = async (deckData) => {
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

            const cards = Array.isArray(deckData.cards)
                ? deckData.cards.filter((card) => card.frontText?.trim() && card.backText?.trim())
                : [];

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
                    const basePayload = {
                        frontText: card.frontText.trim(),
                        backText: card.backText.trim(),
                        cardOrder: card.cardOrder ?? index,
                    };
                    const imagePayload = {
                        ...basePayload,
                        frontImageUrl: card.frontImageUrl || null,
                        backImageUrl: card.backImageUrl || null,
                        frontImage: card.frontImageUrl || null,
                        backImage: card.backImageUrl || null,
                        frontMediaUrl: card.frontImageUrl || null,
                        backMediaUrl: card.backImageUrl || null,
                    };

                    if (card.itemId) {
                        return flashcardApi.updateItem(requestDeckId, card.itemId, imagePayload);
                    }

                    return flashcardApi.createItem(requestDeckId, imagePayload);
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
    };

    const handleDeleteDeck = async (deckId) => {
        const requestDeckId = deckId == null ? '' : String(deckId).trim();
        const normalizedDeckId = normalizeComparableId(requestDeckId);
        if (!normalizedDeckId || deletingDeckId === normalizedDeckId) {
            return;
        }

        const deckToDelete = decks.find((deck) => isSameEntityId(deck.id, normalizedDeckId));
        const deleteLabel = deckToDelete?.name || 'bộ flashcard này';
        const accepted = window.confirm(`Bạn có chắc muốn xóa "${deleteLabel}" không?`);
        if (!accepted) {
            return;
        }

        try {
            setError(null);
            setDeletingDeckId(normalizedDeckId);
            await flashcardApi.deleteSet(requestDeckId);
            setDecks((prevDecks) => prevDecks.filter((deck) => !isSameEntityId(deck.id, normalizedDeckId)));
            setSelectedDeck((prevDeck) => (prevDeck && isSameEntityId(prevDeck.id, normalizedDeckId) ? null : prevDeck));
            await fetchDecks();
        } catch (err) {
            console.error('Failed to delete deck:', err);
            setError(err.response?.data?.message || err.message || 'Không thể xóa flashcard');
        } finally {
            setDeletingDeckId(null);
        }
    };

    void handleDeleteDeck;

    const openDeleteDeckConfirm = (deckId) => {
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
    };

    const closeDeleteDeckConfirm = () => {
        if (deletingDeckId) {
            return;
        }
        setDeckDeleteCandidate(null);
    };

    const confirmDeleteDeck = async () => {
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
            setDecks((prevDecks) => prevDecks.filter((deck) => !isSameEntityId(deck.id, normalizedDeckId)));
            setSelectedDeck((prevDeck) => (prevDeck && isSameEntityId(prevDeck.id, normalizedDeckId) ? null : prevDeck));
            setDeckDeleteCandidate(null);
            await fetchDecks();
        } catch (err) {
            console.error('Failed to delete deck:', err);
            setError(err.response?.data?.message || err.message || 'Không thể xóa flashcard');
        } finally {
            setDeletingDeckId(null);
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
                        {reviewSyncState.queuedCount > SYNC_STATUS_VISIBLE_THRESHOLD && !error && (
                            <div className="mb-4 flex items-center justify-center gap-3 text-sm text-base-content/60">
                                <span>Đang đồng bộ {reviewSyncState.queuedCount} thẻ ở nền...</span>
                                {reviewSyncState.queuedCount > SYNC_NOW_BUTTON_THRESHOLD && (
                                    <button
                                        type="button"
                                        onClick={handleManualSync}
                                        disabled={manualSyncing || savingReview}
                                        className="btn btn-xs rounded-full"
                                    >
                                        {manualSyncing ? 'Đang đồng bộ...' : 'Đồng bộ nhanh'}
                                    </button>
                                )}
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
                <FlashcardsHeader
                    onCreateNew={() => setShowCreateModal(true)}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <motion.main className="flex-1 overflow-y-auto p-6 lg:p-8" variants={containerVariants} initial="hidden" animate="visible">
                    <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
                        <StatCard icon="BookOpen" label="Tổng Flashcards" value={stats.totalCards} iconBgColor="bg-blue-500/10" iconColor="text-blue-500" variants={cardVariants} />
                        <StatCard icon="CheckCircle2" label="Đã thuộc" value={stats.mastered} iconBgColor="bg-green-500/10" iconColor="text-green-500" variants={cardVariants} />
                        <StatCard icon="Target" label="Cần ôn hôm nay" value={stats.dueToday} iconBgColor="bg-orange-500/10" iconColor="text-orange-500" variants={cardVariants} />
                        <StatCard icon="Flame" label="Streak" value={`${stats.streak} ngày`} iconBgColor="bg-red-500/10" iconColor="text-red-500" variants={cardVariants} />
                    </div>

                    <motion.div variants={cardVariants}>
                        <SectionHeader title="Bộ Flashcard" badge={`${decks.length} bộ`}>
                            <FilterSortControls
                                filterLabel={selectedSubject === 'all'
                                    ? 'Lọc'
                                    : `Môn: ${availableSubjects.find((option) => option.value === selectedSubject)?.label || 'Đã chọn'}`}
                                filterContent={(
                                    <div className="dropdown-content z-[20] mt-2 w-72 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-2xl">
                                        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-base-content/50">Lọc theo môn</p>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedSubject('all')}
                                                className={`btn btn-sm justify-start rounded-xl ${selectedSubject === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                                            >
                                                Tất cả môn
                                            </button>
                                            {availableSubjects.map((subject) => (
                                                <button
                                                    key={subject.value}
                                                    type="button"
                                                    onClick={() => setSelectedSubject(subject.value)}
                                                    className={`btn btn-sm justify-start rounded-xl ${selectedSubject === subject.value ? 'btn-primary' : 'btn-ghost'}`}
                                                >
                                                    {subject.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            />
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

                    {!loading && !error && decks.length > 0 && filteredDecks.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
                            <Icon name="Search" size="xl" className="mx-auto mb-4 text-base-content/30" />
                            <p className="text-base-content/70">Không có bộ flashcard nào khớp với bộ lọc hiện tại.</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedSubject('all');
                                }}
                                className="btn btn-sm btn-ghost mt-4 rounded-xl"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredDecks.length > 0 && (
                        viewMode === 'grid' ? (
                            <div key="grid-view" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredDecks.map((deck, index) => (
                                    <FlashcardDeckCard
                                        key={deck.id}
                                        deck={deck}
                                        index={index}
                                        variants={cardVariants}
                                        onStartStudy={handleStartStudy}
                                        onEdit={deck.isOwned ? () => void handleOpenEditDeck(deck) : undefined}
                                        onDelete={deck.isOwned ? () => openDeleteDeckConfirm(deck.id) : undefined}
                                        isDeleting={isSameEntityId(deck.id, deletingDeckId)}
                                    />
                                ))}
                                <AddDeckCard onClick={() => setShowCreateModal(true)} variants={cardVariants} />
                            </div>
                        ) : (
                            <div key="list-view" className="space-y-3">
                                {filteredDecks.map((deck) => (
                                    <FlashcardDeckListItem
                                        key={deck.id}
                                        deck={deck}
                                        variants={cardVariants}
                                        onStartStudy={handleStartStudy}
                                        onEdit={deck.isOwned ? () => void handleOpenEditDeck(deck) : undefined}
                                        onDelete={deck.isOwned ? () => openDeleteDeckConfirm(deck.id) : undefined}
                                        isDeleting={isSameEntityId(deck.id, deletingDeckId)}
                                    />
                                ))}
                            </div>
                        )
                    )}

                    <QuickStudySection dueToday={stats.dueToday} variants={cardVariants} />
                    <AISuggestions variants={cardVariants} />
                </motion.main>
            </div>

            {deckDeleteCandidate && (
                <div className="modal modal-open modal-bottom sm:modal-middle" style={{ zIndex: 140 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="modal-box rounded-3xl border border-base-300 shadow-2xl max-w-lg"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/20 text-3xl">
                                🦉
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Xác nhận xóa</p>
                                <h3 className="mt-1 text-xl font-black text-base-content">Bạn muốn xóa bộ này không?</h3>
                                <p className="mt-2 text-sm text-base-content/70">
                                    Bộ <span className="font-bold text-base-content">"{deckDeleteCandidate.name}"</span> sẽ bị xóa khỏi danh sách của bạn.
                                </p>
                                <p className="mt-1 text-xs text-base-content/55">Con cú nhắc nhẹ: hành động này không thể hoàn tác.</p>
                            </div>
                        </div>

                        <div className="modal-action mt-6">
                            <button
                                type="button"
                                onClick={closeDeleteDeckConfirm}
                                className="btn btn-ghost rounded-xl font-bold"
                                disabled={Boolean(deletingDeckId)}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteDeck}
                                className="btn rounded-xl border-none bg-gradient-to-r from-red-500 to-rose-600 font-bold text-white"
                                disabled={Boolean(deletingDeckId)}
                            >
                                {deletingDeckId ? '🦉 Đang xóa...' : 'Xóa bộ flashcard'}
                            </button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop bg-black/45" onClick={closeDeleteDeckConfirm} />
                </div>
            )}

            {showCreateModal && (
                <CreateDeckModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateDeck}
                    subjects={subjectOptions}
                    currentUserId={currentUserId}
                />
            )}

            {showEditModal && editingDeck && (
                <CreateDeckModal
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    onUpdate={handleUpdateDeck}
                    subjects={subjectOptions}
                    currentUserId={currentUserId}
                    mode="edit"
                    initialDeck={editingDeck}
                />
            )}

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
        </div>
    );
}
