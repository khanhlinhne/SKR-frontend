import { useMemo, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
    FlashcardStudyCard,
    KeyboardHints,
    StudyControls,
    StudyHeader,
} from '@/features/flashcards/components';

function normalizeLessonFlashcardItems(lesson) {
    const sets = Array.isArray(lesson?.flashcardSets) ? lesson.flashcardSets : [];
    const items = sets.flatMap((set) => {
        const setId = set?.flashcardSetId || set?.id || '';
        const setTitle = set?.setTitle || set?.title || 'Flashcard';
        const cards = Array.isArray(set?.items) ? set.items : [];

        return cards.map((item, index) => ({
            id: item.flashcardItemId || item.id || `${setId}-${index}`,
            setId,
            setTitle,
            front: item.frontText || '',
            back: item.backText || '',
            frontImageUrl: item.frontImageUrl || '',
            backImageUrl: item.backImageUrl || '',
            difficulty: item.difficulty || 'medium',
        }));
    });

    return items.filter((item) => item.front || item.back);
}

export default function FlashcardLessonPlayer({
    lesson,
    onComplete,
    isCompleted = false,
    completionLoading = false,
    loadingContent = false,
}) {
    const cards = useMemo(() => normalizeLessonFlashcardItems(lesson), [lesson]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

    const currentCard = cards[currentCardIndex] || null;
    const progress = cards.length > 0 ? Math.round(((currentCardIndex + 1) / cards.length) * 100) : 0;

    const handleFlip = () => {
        if (!currentCard) return;
        setIsFlipped((previous) => !previous);
    };

    const handleMove = (direction) => {
        if (cards.length === 0) return;
        setCurrentCardIndex((previous) => (
            direction === 'prev'
                ? (previous - 1 + cards.length) % cards.length
                : (previous + 1) % cards.length
        ));
        setIsFlipped(false);
    };

    const handleReview = (result) => {
        if (result === 'correct') {
            setStats((previous) => ({ ...previous, correct: previous.correct + 1 }));
        }
        if (result === 'incorrect') {
            setStats((previous) => ({ ...previous, incorrect: previous.incorrect + 1 }));
        }
        handleMove('next');
    };

    if (loadingContent) {
        return (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-10 shadow-xl">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center shadow-xl">
                <p className="text-lg font-black text-base-content">Bài học flashcard này chưa có thẻ</p>
                <p className="mt-2 text-sm text-base-content/50">
                    Giảng viên cần thêm mặt trước và mặt sau để người học bắt đầu ôn tập.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-11rem)] overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
            <StudyHeader
                deckName={currentCard.setTitle || lesson?.title || 'Flashcard'}
                currentIndex={currentCardIndex}
                totalCards={cards.length}
                stats={stats}
                progress={progress}
                onClose={() => {}}
            />
            <div className="flex min-h-[calc(100vh-16rem)] flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-lg font-black text-base-content">{lesson?.title || currentCard.setTitle || 'Flashcard'}</p>
                        <p className="mt-1 text-sm text-base-content/55">
                            Học hết các thẻ rồi bấm hoàn thành để lưu tiến độ thật của bạn.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onComplete}
                        disabled={isCompleted || completionLoading}
                        className={`btn rounded-2xl gap-1.5 font-bold ${
                            isCompleted
                                ? 'border border-green-500/20 bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                : 'border-none bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                        }`}
                    >
                        {completionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        {isCompleted ? 'Đã hoàn thành' : completionLoading ? 'Đang lưu...' : 'Hoàn thành bài học'}
                    </button>
                </div>

                <FlashcardStudyCard
                    card={currentCard}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                    cardHeightClass="h-[28rem] sm:h-[32rem] lg:h-[36rem]"
                />
                <StudyControls
                    onPrev={() => handleMove('prev')}
                    onNext={handleReview}
                    onSkip={() => handleMove('next')}
                    canGoPrev={cards.length > 1}
                    canGoNext={cards.length > 1}
                />
                <KeyboardHints />
            </div>
        </div>
    );
}
