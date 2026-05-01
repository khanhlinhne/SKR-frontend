import Icon from '@/shared/ui/icons/Icon';
import { DashboardSidebar } from '@/features/learner/components';
import { OwlLoader } from '@/shared/ui/common';
import FlashcardStudyCard from './FlashcardStudyCard';
import StudyControls, { KeyboardHints, StudyHeader } from './StudyControls';

export default function FlashcardsStudyView({
    selectedDeck,
    currentDeckItems,
    currentCardIndex,
    studyStats,
    itemsLoading,
    error,
    reviewSyncState,
    showSyncStatus,
    showSyncNowButton,
    manualSyncing,
    savingReview,
    activeStudySessionId,
    isFlipped,
    onEndStudy,
    onManualSync,
    onFlipCard,
    onPrevCard,
    onNextCard,
    onSkipCard,
}) {
    const currentCard = currentDeckItems[currentCardIndex];
    const progress = currentDeckItems.length > 0 ? ((currentCardIndex + 1) / currentDeckItems.length) * 100 : 0;

    if (itemsLoading) {
        return (
            <div className="flex h-dvh overflow-hidden bg-base-200">
                <DashboardSidebar />
                <div className="flex min-w-0 flex-1 items-center justify-center px-4 pb-24 md:pb-0">
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
            <div className="flex h-dvh overflow-hidden bg-base-200">
                <DashboardSidebar />
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <StudyHeader
                        deckName={selectedDeck.name}
                        currentIndex={0}
                        totalCards={0}
                        stats={studyStats}
                        progress={0}
                        onClose={onEndStudy}
                    />
                    <div className="flex flex-1 items-center justify-center px-4 py-5 pb-24 sm:p-8 sm:pb-24 md:pb-8">
                        <div className="max-w-md rounded-3xl border border-base-300 bg-base-100 p-5 text-center shadow-lg sm:p-8">
                            <Icon name="Layers3" size="xl" className="mx-auto mb-4 text-base-content/30" />
                            <h3 className="text-xl font-bold text-base-content">Bộ này chưa có thẻ nào</h3>
                            <p className="mt-2 text-sm text-base-content/60">Hãy thêm item vào bộ flashcard trước khi bắt đầu học.</p>
                            <button onClick={onEndStudy} className="btn btn-primary mt-6 rounded-xl">
                                Quay lại danh sách
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-dvh overflow-hidden bg-base-200">
            <DashboardSidebar />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <StudyHeader
                    deckName={selectedDeck.name}
                    currentIndex={currentCardIndex}
                    totalCards={currentDeckItems.length}
                    stats={studyStats}
                    progress={progress}
                    onClose={onEndStudy}
                />
                <div className="flex flex-1 flex-col px-4 py-5 pb-24 sm:p-8 sm:pb-24 md:pb-8">
                    {error && (
                        <div className="alert alert-error mb-4">
                            <Icon name="AlertCircle" />
                            <span>{error}</span>
                        </div>
                    )}
                    {showSyncStatus && !error && (
                        <div className="mb-4 flex items-center justify-center gap-3 text-sm text-base-content/60">
                            <span>Đang đồng bộ {reviewSyncState.queuedCount} thẻ ở nền...</span>
                            {showSyncNowButton && (
                                <button
                                    type="button"
                                    onClick={onManualSync}
                                    disabled={manualSyncing || savingReview}
                                    className="btn btn-xs rounded-full"
                                >
                                    {manualSyncing ? 'Đang đồng bộ...' : 'Đồng bộ nhanh'}
                                </button>
                            )}
                        </div>
                    )}
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-2xl">
                            <FlashcardStudyCard card={currentCard} isFlipped={isFlipped} onFlip={onFlipCard} />
                            <StudyControls
                                onPrev={onPrevCard}
                                onNext={onNextCard}
                                onSkip={onSkipCard}
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
