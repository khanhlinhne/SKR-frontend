import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    CreateDeckModal,
    FlashcardsLibraryView,
    FlashcardsStudyView,
} from '@/features/flashcards/components';
import { useFlashcardDeckData } from '@/features/flashcards/hooks/useFlashcardDeckData';
import { useFlashcardDeckMutations } from '@/features/flashcards/hooks/useFlashcardDeckMutations';
import { useFlashcardStudySession } from '@/features/flashcards/hooks/useFlashcardStudySession';
import { useOwlDialog } from '@/shared/ui/common';

export default function Flashcards() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [hasAnimated, setHasAnimated] = useState(false);
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();

    const deckData = useFlashcardDeckData();
    const studySession = useFlashcardStudySession({
        searchParams,
        setSearchParams,
        decks: deckData.decks,
        loading: deckData.loading,
        currentUserId: deckData.currentUserId,
        fetchDecks: deckData.fetchDecks,
        fetchDeckItems: deckData.fetchDeckItems,
        applyDeckProgress: deckData.applyDeckProgress,
        applyOptimisticDeckDelta: deckData.applyOptimisticDeckDelta,
        upsertDeck: deckData.upsertDeck,
        setError: deckData.setError,
    });
    const deckMutations = useFlashcardDeckMutations({
        decks: deckData.decks,
        selectedDeck: studySession.selectedDeck,
        setSelectedDeck: studySession.setSelectedDeck,
        subjectOptions: deckData.subjectOptions,
        fetchDecks: deckData.fetchDecks,
        fetchDeckItems: deckData.fetchDeckItems,
        ensureSubjectsLoaded: deckData.ensureSubjectsLoaded,
        setError: deckData.setError,
        openDialog,
    });

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

    if (studySession.studyMode && studySession.selectedDeck) {
        return (
            <FlashcardsStudyView
                selectedDeck={studySession.selectedDeck}
                currentDeckItems={studySession.currentDeckItems}
                currentCardIndex={studySession.currentCardIndex}
                studyStats={studySession.studyStats}
                itemsLoading={studySession.itemsLoading}
                error={deckData.error}
                reviewSyncState={studySession.reviewSyncState}
                showSyncStatus={studySession.showSyncStatus}
                showSyncNowButton={studySession.showSyncNowButton}
                manualSyncing={studySession.manualSyncing}
                savingReview={studySession.savingReview}
                activeStudySessionId={studySession.activeStudySessionId}
                isFlipped={studySession.isFlipped}
                onEndStudy={studySession.handleEndStudy}
                onManualSync={studySession.handleManualSync}
                onFlipCard={studySession.handleFlipCard}
                onPrevCard={studySession.handlePrevCard}
                onNextCard={studySession.handleNextCard}
                onSkipCard={studySession.handleSkipCard}
            />
        );
    }

    return (
        <>
            <FlashcardsLibraryView
                viewMode={deckData.viewMode}
                setViewMode={deckData.setViewMode}
                decks={deckData.decks}
                loading={deckData.loading}
                error={deckData.error}
                searchQuery={deckData.searchQuery}
                setSearchQuery={deckData.setSearchQuery}
                selectedSubject={deckData.selectedSubject}
                setSelectedSubject={deckData.setSelectedSubject}
                availableSubjects={deckData.availableSubjects}
                filteredDecks={deckData.filteredDecks}
                stats={deckData.stats}
                cardVariants={cardVariants}
                containerVariants={containerVariants}
                deletingDeckId={deckMutations.deletingDeckId}
                deckDeleteCandidate={deckMutations.deckDeleteCandidate}
                dialog={dialog}
                onRetry={deckData.fetchDecks}
                onOpenCreate={deckMutations.openCreateModal}
                onStartStudy={studySession.handleStartStudy}
                onOpenEdit={deckMutations.handleOpenEditDeck}
                onOpenDelete={deckMutations.openDeleteDeckConfirm}
                onCloseDelete={deckMutations.closeDeleteDeckConfirm}
                onConfirmDelete={deckMutations.confirmDeleteDeck}
                onDialogConfirm={handleDialogConfirm}
                onCloseDialog={closeDialog}
            />

            {deckMutations.showCreateModal && (
                <CreateDeckModal
                    isOpen={deckMutations.showCreateModal}
                    onClose={deckMutations.closeCreateModal}
                    onCreate={deckMutations.handleCreateDeck}
                    subjects={deckData.subjectOptions}
                    currentUserId={deckData.currentUserId}
                />
            )}

            {deckMutations.showEditModal && deckMutations.editingDeck && (
                <CreateDeckModal
                    isOpen={deckMutations.showEditModal}
                    onClose={deckMutations.handleCloseEditModal}
                    onUpdate={deckMutations.handleUpdateDeck}
                    subjects={deckData.subjectOptions}
                    currentUserId={deckData.currentUserId}
                    mode="edit"
                    initialDeck={deckMutations.editingDeck}
                />
            )}
        </>
    );
}
