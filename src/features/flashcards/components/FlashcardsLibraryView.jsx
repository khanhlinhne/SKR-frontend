import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import Icon from '@/shared/ui/icons/Icon';
import {
    FilterSortControls,
    OwlDialog,
    OwlLoader,
    SectionHeader,
    ViewToggle,
} from '@/shared/ui/common';
import { isSameEntityId } from '@/features/flashcards/models/flashcardModel';
import FlashcardDeckCard, { AddDeckCard } from './FlashcardDeckCard';
import FlashcardDeckListItem from './FlashcardDeckListItem';
import FlashcardsHeader from './FlashcardsHeader';
import QuickStudySection from './QuickStudySection';
import AISuggestions from './AISuggestions';
import FlashcardDeleteModal from './FlashcardDeleteModal';
import FlashcardsStatsBar from './FlashcardsStatsBar';

function SubjectFilterMenu({
    selectedSubject,
    availableSubjects,
    onSelectSubject,
}) {
    return (
        <div className="dropdown-content z-[20] mt-2 w-72 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-2xl">
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-base-content/50">Lọc theo môn</p>
            <div className="flex flex-col gap-1">
                <button
                    type="button"
                    onClick={() => onSelectSubject('all')}
                    className={`btn btn-sm justify-start rounded-xl ${selectedSubject === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                >
                    Tất cả môn
                </button>
                {availableSubjects.map((subject) => (
                    <button
                        key={subject.value}
                        type="button"
                        onClick={() => onSelectSubject(subject.value)}
                        className={`btn btn-sm justify-start rounded-xl ${selectedSubject === subject.value ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        {subject.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function FlashcardsLibraryView({
    viewMode,
    setViewMode,
    decks,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedSubject,
    setSelectedSubject,
    availableSubjects,
    filteredDecks,
    stats,
    cardVariants,
    containerVariants,
    deletingDeckId,
    deckDeleteCandidate,
    dialog,
    onRetry,
    onOpenCreate,
    onStartStudy,
    onOpenEdit,
    onOpenDelete,
    onCloseDelete,
    onConfirmDelete,
    onDialogConfirm,
    onCloseDialog,
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-base-200">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <FlashcardsHeader
                    onCreateNew={onOpenCreate}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <motion.main className="flex-1 overflow-y-auto p-6 lg:p-8" variants={containerVariants} initial="hidden" animate="visible">
                    <FlashcardsStatsBar stats={stats} variants={cardVariants} />

                    <motion.div variants={cardVariants}>
                        <SectionHeader title="Bộ Flashcard" badge={`${decks.length} bộ`}>
                            <FilterSortControls
                                filterLabel={selectedSubject === 'all'
                                    ? 'Lọc'
                                    : `Môn: ${availableSubjects.find((option) => option.value === selectedSubject)?.label || 'Đã chọn'}`}
                                filterContent={(
                                    <SubjectFilterMenu
                                        selectedSubject={selectedSubject}
                                        availableSubjects={availableSubjects}
                                        onSelectSubject={setSelectedSubject}
                                    />
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
                            <button onClick={onRetry} className="btn btn-sm">Thử lại</button>
                        </div>
                    )}

                    {!loading && !error && decks.length === 0 && (
                        <div className="py-12 text-center">
                            <Icon name="FolderOpen" size="xl" className="mx-auto mb-4 text-base-content/30" />
                            <p className="mb-2 text-base-content/60">Chưa có flashcard public hoặc bộ nào do bạn tạo.</p>
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
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredDecks.map((deck, index) => (
                                    <FlashcardDeckCard
                                        key={deck.id}
                                        deck={deck}
                                        index={index}
                                        variants={cardVariants}
                                        onStartStudy={onStartStudy}
                                        onEdit={deck.isOwned ? () => void onOpenEdit(deck) : undefined}
                                        onDelete={deck.isOwned ? () => onOpenDelete(deck.id) : undefined}
                                        isDeleting={isSameEntityId(deck.id, deletingDeckId)}
                                    />
                                ))}
                                <AddDeckCard onClick={onOpenCreate} variants={cardVariants} />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredDecks.map((deck) => (
                                    <FlashcardDeckListItem
                                        key={deck.id}
                                        deck={deck}
                                        variants={cardVariants}
                                        onStartStudy={onStartStudy}
                                        onEdit={deck.isOwned ? () => void onOpenEdit(deck) : undefined}
                                        onDelete={deck.isOwned ? () => onOpenDelete(deck.id) : undefined}
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

            <FlashcardDeleteModal
                deckDeleteCandidate={deckDeleteCandidate}
                deletingDeckId={deletingDeckId}
                onClose={onCloseDelete}
                onConfirm={onConfirmDelete}
            />

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
                onConfirm={onDialogConfirm}
                onClose={onCloseDialog}
            />
        </div>
    );
}
