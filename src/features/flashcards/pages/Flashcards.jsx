import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';

// Import Flashcard Components
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
    FlashcardsHeader
} from '@/features/flashcards/components';

// Import Common Components
import { StatCard, ViewToggle, FilterSortControls, SectionHeader } from '@/shared/ui/common';

export default function Flashcards() {
    // State Management
    const [viewMode, setViewMode] = useState('grid');
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [studyMode, setStudyMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });

    // Sample cards data (moved here for keyboard handler access)
    const sampleCards = [
        { id: 1, front: 'Đạo hàm của hàm số f(x) = x² là gì?', back: "f'(x) = 2x\n\nSử dụng công thức: (xⁿ)' = n·xⁿ⁻¹", difficulty: 'easy' },
        { id: 2, front: 'Tính đạo hàm của sin(x)', back: "(sin(x))' = cos(x)\n\nĐây là công thức cơ bản cần nhớ", difficulty: 'medium' },
        { id: 3, front: 'Quy tắc đạo hàm của tích: (uv)\' = ?', back: "(uv)' = u'v + uv'\n\nTích của đạo hàm u nhân v cộng u nhân đạo hàm v", difficulty: 'medium' },
        { id: 4, front: 'Đạo hàm của e^x là gì?', back: "(eˣ)' = eˣ\n\nHàm mũ cơ số e có đạo hàm bằng chính nó", difficulty: 'easy' },
        { id: 5, front: 'Đạo hàm của ln(x) là gì?', back: "(ln(x))' = 1/x\n\nVới x > 0", difficulty: 'medium' },
    ];

    // Keyboard event handler for study mode
    const handleKeyPress = useCallback((event) => {
        if (!studyMode) return;

        switch (event.key) {
            case ' ': // Space - flip card
                event.preventDefault();
                setIsFlipped(prev => !prev);
                break;
            case 'ArrowLeft': // Left arrow - previous card
                event.preventDefault();
                if (currentCardIndex > 0) {
                    setCurrentCardIndex(prev => prev - 1);
                    setIsFlipped(false);
                }
                break;
            case 'ArrowRight': // Right arrow - next card (skip)
                event.preventDefault();
                if (currentCardIndex < sampleCards.length - 1) {
                    setStudyStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
                    setCurrentCardIndex(prev => prev + 1);
                    setIsFlipped(false);
                }
                break;
            case '1': // 1 - incorrect
                event.preventDefault();
                setStudyStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
                if (currentCardIndex < sampleCards.length - 1) {
                    setCurrentCardIndex(prev => prev + 1);
                    setIsFlipped(false);
                } else {
                    setStudyMode(false);
                }
                break;
            case '2': // 2 - correct
                event.preventDefault();
                setStudyStats(prev => ({ ...prev, correct: prev.correct + 1 }));
                if (currentCardIndex < sampleCards.length - 1) {
                    setCurrentCardIndex(prev => prev + 1);
                    setIsFlipped(false);
                } else {
                    setStudyMode(false);
                }
                break;
            case 'Escape': // Escape - end study
                event.preventDefault();
                setStudyMode(false);
                setSelectedDeck(null);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                break;
            default:
                break;
        }
    }, [studyMode, currentCardIndex, sampleCards.length]);

    // Add/remove keyboard event listener
    useEffect(() => {
        if (studyMode) {
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [studyMode, handleKeyPress]);

    // Track if initial animation has played
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        // Set hasAnimated to true after initial render
        const timer = setTimeout(() => setHasAnimated(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Animation variants - only animate on first load
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: hasAnimated ? 0 : 0.08, delayChildren: hasAnimated ? 0 : 0.1 }
        }
    };

    const cardVariants = hasAnimated ? {
        hidden: { opacity: 1, y: 0, scale: 1 },
        visible: { opacity: 1, y: 0, scale: 1 }
    } : {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1, y: 0, scale: 1,
            transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
        }
    };

    // Mock Data - Will be replaced with API calls
    const flashcardDecks = [
        { id: 1, name: 'Toán Cao Cấp - Đạo Hàm', subject: 'Toán Cao Cấp', totalCards: 45, mastered: 28, learning: 12, new: 5, lastStudied: '2 giờ trước', color: 'blue', icon: '📐', streak: 5, dueToday: 8 },
        { id: 2, name: 'Vocabulary Unit 5-6', subject: 'Tiếng Anh', totalCards: 120, mastered: 67, learning: 35, new: 18, lastStudied: '1 ngày trước', color: 'green', icon: '🇬🇧', streak: 12, dueToday: 23 },
        { id: 3, name: 'Python Basics', subject: 'Lập Trình', totalCards: 78, mastered: 65, learning: 10, new: 3, lastStudied: '3 giờ trước', color: 'yellow', icon: '🐍', streak: 8, dueToday: 5 },
        { id: 4, name: 'SQL Commands', subject: 'Cơ Sở Dữ Liệu', totalCards: 56, mastered: 56, learning: 0, new: 0, lastStudied: '1 tuần trước', color: 'purple', icon: '💾', streak: 0, dueToday: 0 },
        { id: 5, name: 'Lịch Sử Việt Nam', subject: 'Lịch Sử', totalCards: 89, mastered: 34, learning: 40, new: 15, lastStudied: '5 giờ trước', color: 'red', icon: '📚', streak: 3, dueToday: 15 },
        { id: 6, name: 'Vật Lý - Cơ Học', subject: 'Vật Lý', totalCards: 62, mastered: 20, learning: 25, new: 17, lastStudied: '2 ngày trước', color: 'orange', icon: '⚛️', streak: 1, dueToday: 12 }
    ];

    const stats = { totalCards: 450, mastered: 270, dueToday: 63, streak: 12 };

    // Event Handlers
    const handleStartStudy = (deck) => {
        setSelectedDeck(deck);
        setStudyMode(true);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setStudyStats({ correct: 0, incorrect: 0, skipped: 0 });
    };

    const handleFlipCard = () => setIsFlipped(!isFlipped);

    const handleNextCard = (result) => {
        if (result === 'correct') setStudyStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        else if (result === 'incorrect') setStudyStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        else setStudyStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));

        if (currentCardIndex < sampleCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            setStudyMode(false);
        }
    };

    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleEndStudy = () => {
        setStudyMode(false);
        setSelectedDeck(null);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const handleCreateDeck = (deckData) => {
        console.log('Creating deck:', deckData);
        // TODO: API call to create deck
    };

    // Study Mode View
    if (studyMode && selectedDeck) {
        const currentCard = sampleCards[currentCardIndex];
        const progress = ((currentCardIndex + 1) / sampleCards.length) * 100;

        return (
            <div className="flex h-screen bg-base-200 overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <StudyHeader
                        deckName={selectedDeck.name}
                        currentIndex={currentCardIndex}
                        totalCards={sampleCards.length}
                        stats={studyStats}
                        progress={progress}
                        onClose={handleEndStudy}
                    />
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="w-full max-w-2xl">
                            <FlashcardStudyCard card={currentCard} isFlipped={isFlipped} onFlip={handleFlipCard} />
                            <StudyControls
                                onPrev={handlePrevCard}
                                onNext={handleNextCard}
                                onSkip={() => handleNextCard('skip')}
                                canGoPrev={currentCardIndex > 0}
                                canGoNext={currentCardIndex < sampleCards.length - 1}
                            />
                            <KeyboardHints />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Flashcards View
    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <FlashcardsHeader onCreateNew={() => setShowCreateModal(true)} />

                <motion.main className="flex-1 overflow-y-auto p-6 lg:p-8" variants={containerVariants} initial="hidden" animate="visible">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <StatCard icon="BookOpen" label="Tổng Flashcards" value={stats.totalCards} iconBgColor="bg-blue-500/10" iconColor="text-blue-500" variants={cardVariants} />
                        <StatCard icon="CheckCircle2" label="Đã Thuộc" value={stats.mastered} iconBgColor="bg-green-500/10" iconColor="text-green-500" variants={cardVariants} />
                        <StatCard icon="Target" label="Cần Ôn Hôm Nay" value={stats.dueToday} iconBgColor="bg-orange-500/10" iconColor="text-orange-500" variants={cardVariants} />
                        <StatCard icon="Flame" label="Streak" value={`${stats.streak} ngày`} iconBgColor="bg-red-500/10" iconColor="text-red-500" variants={cardVariants} />
                    </div>

                    {/* View Controls */}
                    <motion.div variants={cardVariants}>
                        <SectionHeader title="Bộ Flashcard Của Tôi" badge={`${flashcardDecks.length} bộ`}>
                            <FilterSortControls />
                            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                        </SectionHeader>
                    </motion.div>

                    {/* Flashcard Decks */}
                    {viewMode === 'grid' ? (
                        <div key="grid-view" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {flashcardDecks.map((deck, index) => (
                                <FlashcardDeckCard key={deck.id} deck={deck} index={index} variants={cardVariants} onStartStudy={handleStartStudy} />
                            ))}
                            <AddDeckCard onClick={() => setShowCreateModal(true)} variants={cardVariants} />
                        </div>
                    ) : (
                        <div key="list-view" className="space-y-3">
                            {flashcardDecks.map((deck) => (
                                <FlashcardDeckListItem key={deck.id} deck={deck} variants={cardVariants} onStartStudy={handleStartStudy} />
                            ))}
                        </div>
                    )}

                    {/* Quick Study Section */}
                    <QuickStudySection dueToday={stats.dueToday} variants={cardVariants} />

                    {/* AI Suggestions */}
                    <AISuggestions variants={cardVariants} />
                </motion.main>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateDeckModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateDeck} />
            )}
        </div>
    );
}
