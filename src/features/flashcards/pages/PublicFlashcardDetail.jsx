import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Layers3,
    Lock,
    LogIn,
    Unlock,
    Users,
} from 'lucide-react';

import { HomeFooter, HomeNavBar } from '@/features/home/components';
import {
    PREVIEW_CARDS_LIMIT,
    extractPublicFlashcardResponseData,
    parsePublicFlashcardDetailPayload,
} from '@/features/flashcards/utils/publicFlashcardModel';
import { flashcardApi } from '@/shared/api';
import { useCurrentUserProfile } from '@/shared/user/useCurrentUserProfile';
import { OwlLoader } from '@/shared/ui/common';

function FlashcardPreviewCard({ card, isFlipped, onFlip, isLocked, index, totalCards, onLogin }) {
    const rotation = isLocked ? 0 : isFlipped ? 180 : 0;

    return (
        <div className="mx-auto w-full max-w-xl" style={{ perspective: '1000px' }}>
            <motion.div
                initial={false}
                animate={{ rotateY: rotation }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`relative aspect-[3/2] ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={isLocked ? undefined : onFlip}
                style={{ transformStyle: 'preserve-3d', WebkitTransformStyle: 'preserve-3d' }}
            >
                <div
                    className="absolute inset-0 flex items-center justify-center rounded-3xl border border-base-300 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-8 shadow-xl"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <p className={`whitespace-pre-line text-center text-2xl font-semibold leading-relaxed text-base-content ${isLocked ? 'select-none blur-sm opacity-80' : ''}`}>
                        {card.front}
                    </p>
                </div>

                <div
                    className="absolute inset-0 flex items-center justify-center rounded-3xl border border-base-300 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 shadow-xl"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        WebkitTransform: 'rotateY(180deg)',
                    }}
                >
                    <p className={`whitespace-pre-line text-center text-2xl font-semibold leading-relaxed text-blue-600 dark:text-blue-400 ${isLocked ? 'select-none blur-sm opacity-80' : ''}`}>
                        {card.back}
                    </p>
                </div>

                {isLocked && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-base-100/45 px-6 text-center backdrop-blur-[2px]">
                        <Lock className="h-12 w-12 text-orange-500" />
                        <h3 className="mt-4 text-xl font-semibold text-base-content">Thẻ {index + 1} đang bị khóa</h3>
                        <p className="mt-2 max-w-sm text-sm text-base-content/70">
                            Bạn vẫn có thể thấy cấu trúc nội dung, nhưng cần đăng nhập để xem rõ và lật mặt sau.
                        </p>
                        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link to="/login" onClick={onLogin} className="btn btn-primary rounded-full">
                                <LogIn className="h-4 w-4" />
                                Đăng nhập để xem
                            </Link>
                            <Link to="/signup" className="btn btn-outline rounded-full">
                                Tạo tài khoản
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>

            <p className="mt-4 text-center text-sm text-base-content/50">
                {isLocked
                    ? `Thẻ ${index + 1}/${totalCards} đang bị làm mờ cho khách xem trước`
                    : `Nhấn để lật thẻ • ${index + 1}/${totalCards}`}
            </p>
        </div>
    );
}

function PreviewControls({ totalCards, onPrev, onNext, canGoPrev, canGoNext, currentIndex }) {
    return (
        <div className="mt-8 flex items-center justify-center gap-4">
            <button
                onClick={onPrev}
                disabled={!canGoPrev}
                className="btn btn-circle btn-lg btn-outline disabled:opacity-30"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalCards, 10) }).map((_, i) => {
                    const actualIndex = Math.floor((i / Math.min(totalCards, 10)) * totalCards);
                    const isActive = actualIndex === currentIndex;

                    return (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all ${isActive ? 'w-8 bg-blue-500' : 'w-2 bg-base-300'}`}
                        />
                    );
                })}
            </div>

            <button
                onClick={onNext}
                disabled={!canGoNext}
                className="btn btn-circle btn-lg btn-outline disabled:opacity-30"
            >
                <ChevronRight className="h-6 w-6" />
            </button>
        </div>
    );
}

function LockedOverlay({ lockedCount, totalCards, onLogin }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mt-8 rounded-3xl border border-orange-200 bg-gradient-to-b from-orange-50/80 to-amber-50/80 p-8 text-center dark:border-orange-800 dark:from-orange-950/30 dark:to-amber-950/30"
        >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/60 to-transparent dark:from-black/20" />

            <div className="relative">
                <Lock className="mx-auto h-12 w-12 text-orange-500" />
                <h3 className="mt-4 text-xl font-semibold">
                    Bạn đang xem đầy đủ {totalCards} thẻ, nhưng {lockedCount} thẻ sau đang bị làm mờ
                </h3>
                <p className="mt-2 text-base-content/60">
                    Đăng nhập để mở khóa nội dung rõ nét, lật mặt sau và tiếp tục học không giới hạn.
                </p>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link to="/login" onClick={onLogin} className="btn btn-primary btn-lg rounded-full">
                        <LogIn className="h-5 w-5" />
                        Đăng nhập để học tiếp
                    </Link>
                    <Link to="/signup" className="btn btn-outline btn-lg rounded-full">
                        Tạo tài khoản miễn phí
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

function PreviewInfo({ visibleCount, totalCards }) {
    return (
        <div className="mt-6 text-center">
            <p className="text-sm text-base-content/50">
                Bạn đang xem miễn phí {visibleCount}/{totalCards} thẻ đầu tiên. Các thẻ sau vẫn hiển thị nhưng sẽ bị làm mờ cho tới khi đăng nhập.
            </p>
        </div>
    );
}

function FlashcardOverviewGrid({ cards, currentIndex, onSelectCard }) {
    return (
        <section className="mt-10 border-t border-base-300/70 pt-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-base-content">Toàn bộ thẻ trong bộ này</h2>
                    <p className="mt-1 text-sm text-base-content/60">
                        Bạn có thể xem trước cấu trúc tất cả thẻ ngay bên dưới.
                    </p>
                </div>
                <span className="rounded-full bg-base-200 px-3 py-1 text-sm font-medium text-base-content/70">
                    {cards.length} thẻ
                </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card, index) => {
                    const isActive = index === currentIndex;
                    const isLocked = Boolean(card.isLocked);

                    return (
                        <button
                            key={card.id}
                            type="button"
                            onClick={() => onSelectCard(index)}
                            className={`group relative min-h-44 rounded-2xl border p-5 text-left transition-all ${
                                isActive
                                    ? 'border-blue-500 bg-blue-500/5 shadow-lg ring-2 ring-blue-500/20'
                                    : 'border-base-300 bg-base-100 hover:border-base-400 hover:shadow-md'
                            }`}
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold text-base-content/70">Thẻ {index + 1}</span>
                                {isLocked ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                                        <Lock className="h-3 w-3" />
                                        Locked
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                        <Unlock className="h-3 w-3" />
                                        Preview
                                    </span>
                                )}
                            </div>

                            <div className={`space-y-3 ${isLocked ? 'select-none blur-sm opacity-75' : ''}`}>
                                <p className="line-clamp-4 text-base font-semibold leading-relaxed text-base-content">
                                    {card.front}
                                </p>
                                <div className="h-px bg-base-300" />
                                <p className="line-clamp-3 text-sm leading-relaxed text-base-content/60">
                                    {card.back}
                                </p>
                            </div>

                            {isLocked && (
                                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-base-100/35 backdrop-blur-[1px]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function EmptyFlashcardState() {
    return (
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 bg-base-200/40 px-8 py-14 text-center">
            <Layers3 className="h-12 w-12 text-base-content/25" />
            <h2 className="mt-4 text-2xl font-semibold text-base-content">Bộ flashcard này chưa có thẻ nào</h2>
            <p className="mt-2 max-w-md text-base-content/60">
                Hiện chưa có dữ liệu thẻ để xem trước. Bạn có thể quay lại danh sách và chọn bộ khác.
            </p>
            <Link to="/flashcards/explore" className="btn btn-primary mt-6 rounded-full">
                Quay lại danh sách
            </Link>
        </div>
    );
}

export default function PublicFlashcardDetail() {
    const { slug } = useParams();
    const { isAuthenticated } = useCurrentUserProfile();

    const [set, setSet] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const fetchSetDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await flashcardApi.getPreviewBySlug(slug);
            const payload = extractPublicFlashcardResponseData(response);
            const { set: normalizedSet, cards: normalizedCards } = parsePublicFlashcardDetailPayload(payload);

            setSet(normalizedSet);
            setCards(normalizedCards);
        } catch (err) {
            console.error('Failed to fetch flashcard set:', err);
            setError(err.response?.data?.message || err.message || 'Không thể tải chi tiết flashcard');
            setSet(null);
            setCards([]);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    const fetchFullSet = useCallback(async () => {
        if (!isAuthenticated || !slug) {
            return;
        }

        try {
            const response = await flashcardApi.getFullSet(slug);
            const payload = extractPublicFlashcardResponseData(response);
            const { set: normalizedSet, cards: normalizedCards } = parsePublicFlashcardDetailPayload({
                ...payload,
                requiresLoginForFullAccess: false,
                previewLimit: null,
            });

            setSet(normalizedSet);
            setCards(normalizedCards);
        } catch (err) {
            console.error('Failed to fetch full flashcard set:', err);
        }
    }, [isAuthenticated, slug]);

    useEffect(() => {
        void fetchSetDetail();
    }, [fetchSetDetail]);

    useEffect(() => {
        if (isAuthenticated && set?.isPreview) {
            void fetchFullSet();
        }
    }, [fetchFullSet, isAuthenticated, set?.isPreview]);

    useEffect(() => {
        setCurrentCardIndex(0);
        setIsFlipped(false);
    }, [slug]);

    useEffect(() => {
        if (currentCardIndex >= cards.length && cards.length > 0) {
            setCurrentCardIndex(0);
            setIsFlipped(false);
        }
    }, [cards.length, currentCardIndex]);

    const handleFlip = () => setIsFlipped((prev) => !prev);

    const handlePrev = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex((prev) => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleNext = () => {
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex((prev) => prev + 1);
            setIsFlipped(false);
        }
    };

    const handleSelectCard = (index) => {
        setCurrentCardIndex(index);
        setIsFlipped(false);
    };

    const handleLogin = () => {
        sessionStorage.setItem('flashcardRedirect', `/flashcards/${slug}`);
    };

    useEffect(() => {
        const redirectPath = sessionStorage.getItem('flashcardRedirect');
        if (isAuthenticated && redirectPath) {
            sessionStorage.removeItem('flashcardRedirect');
        }
    }, [isAuthenticated]);

    const totalCards = cards.length;
    const previewOpenCards = useMemo(() => Math.min(PREVIEW_CARDS_LIMIT, totalCards), [totalCards]);
    const currentCard = cards[currentCardIndex];
    const isLocked = Boolean(currentCard?.isLocked);
    const hasLockedCards = Boolean(set?.isPreview && set.lockedCount > 0);

    if (loading) {
        return (
            <div className="apple-home apple-transition min-h-screen">
                <HomeNavBar />
                <main className="px-6 pb-20 pt-24 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        <OwlLoader
                            message="Đang tải chi tiết flashcard..."
                            subMessage="Lấy dữ liệu từ cộng đồng."
                            className="py-16"
                        />
                    </div>
                </main>
                <HomeFooter />
            </div>
        );
    }

    if (error || !set) {
        return (
            <div className="apple-home apple-transition min-h-screen">
                <HomeNavBar />
                <main className="px-6 pb-20 pt-24 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        <Link to="/flashcards/explore" className="mb-8 inline-flex items-center gap-2 text-base-content/60 hover:text-base-content">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại danh sách
                        </Link>

                        <div className="apple-panel apple-card-shadow rounded-[36px] border p-8 text-center">
                            <Layers3 className="mx-auto h-16 w-16 text-base-content/30" />
                            <h1 className="apple-main-text mt-6 text-2xl font-semibold">Không tìm thấy bộ flashcard</h1>
                            <p className="apple-secondary-text mt-3">
                                {error || 'Bộ flashcard này không tồn tại hoặc đã bị xóa.'}
                            </p>
                            <Link to="/flashcards/explore" className="btn btn-primary mt-6 rounded-full">
                                Xem danh sách flashcard
                            </Link>
                        </div>
                    </div>
                </main>
                <HomeFooter />
            </div>
        );
    }

    return (
        <div className="apple-home apple-transition min-h-screen">
            <HomeNavBar />

            <main className="px-6 pb-20 pt-24 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <Link
                        to="/flashcards/explore"
                        className="mb-6 inline-flex items-center gap-2 text-base-content/60 transition-colors hover:text-base-content"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </Link>

                    <motion.header
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="mb-8"
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                                {set.subject}
                            </span>
                            {set.isPreview && (
                                <span className="inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-600 dark:text-orange-400">
                                    <Unlock className="mr-1 h-3 w-3" />
                                    Preview
                                </span>
                            )}
                        </div>

                        <h1 className="apple-main-text text-4xl font-semibold tracking-tight">{set.title}</h1>

                        {set.description && <p className="apple-secondary-text mt-3 text-lg">{set.description}</p>}

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                            <span className="flex items-center gap-1.5">
                                <Layers3 className="h-4 w-4" />
                                {set.totalCards} thẻ
                            </span>
                            {set.studyCount > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4" />
                                    {set.studyCount.toLocaleString()} lượt học
                                </span>
                            )}
                            {set.creatorName && (
                                <span className="flex items-center gap-1.5">
                                    <BookOpen className="h-4 w-4" />
                                    {set.creatorName}
                                </span>
                            )}
                        </div>
                    </motion.header>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="apple-panel apple-card-shadow rounded-[36px] border bg-gradient-to-br from-base-100 to-base-200/50 p-6 sm:p-8">
                            {cards.length === 0 ? (
                                <EmptyFlashcardState />
                            ) : currentCard ? (
                                <FlashcardPreviewCard
                                    card={currentCard}
                                    isFlipped={isFlipped}
                                    onFlip={handleFlip}
                                    isLocked={isLocked}
                                    index={currentCardIndex}
                                    totalCards={totalCards}
                                    onLogin={handleLogin}
                                />
                            ) : null}

                            {cards.length > 0 && (
                                <PreviewControls
                                    currentIndex={currentCardIndex}
                                    totalCards={totalCards}
                                    onPrev={handlePrev}
                                    onNext={handleNext}
                                    canGoPrev={currentCardIndex > 0}
                                    canGoNext={currentCardIndex < totalCards - 1}
                                />
                            )}

                            {hasLockedCards && (
                                isLocked ? (
                                    <LockedOverlay
                                        lockedCount={set.lockedCount}
                                        totalCards={set.totalCards}
                                        onLogin={handleLogin}
                                    />
                                ) : (
                                    <PreviewInfo visibleCount={previewOpenCards} totalCards={set.totalCards} />
                                )
                            )}

                            {cards.length > 0 && (
                                <FlashcardOverviewGrid
                                    cards={cards}
                                    currentIndex={currentCardIndex}
                                    onSelectCard={handleSelectCard}
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>

            <HomeFooter />
        </div>
    );
}
