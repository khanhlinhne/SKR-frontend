import { motion } from 'motion/react';

/**
 * FlashcardStudyCard - Interactive flashcard with flip animation
 * 
 * @param {object} card - Card data with front, back, difficulty
 * @param {boolean} isFlipped - Whether card is flipped
 * @param {function} onFlip - Callback when card is clicked to flip
 */
export default function FlashcardStudyCard({
    card,
    isFlipped = false,
    onFlip
}) {
    const difficultyConfig = {
        easy: { label: 'Dễ', class: 'badge-success' },
        medium: { label: 'Trung bình', class: 'badge-warning' },
        hard: { label: 'Khó', class: 'badge-error' }
    };

    const difficulty = difficultyConfig[card.difficulty] || difficultyConfig.medium;

    return (
        <div className="perspective-1000 mb-8">
            <motion.div
                className="relative w-full h-80 cursor-pointer"
                onClick={onFlip}
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                {/* Front of card */}
                <div
                    className="absolute inset-0 bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-8 flex flex-col items-center justify-center backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Difficulty Badge */}
                    <div className="absolute top-4 left-4">
                        <span className={`badge ${difficulty.class}`}>
                            {difficulty.label}
                        </span>
                    </div>

                    {/* Question */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <p className="text-2xl font-bold text-base-content leading-relaxed">
                            {card.front}
                        </p>
                    </motion.div>

                    {/* Hint */}
                    <p className="absolute bottom-4 text-sm text-base-content/40">
                        Click để lật thẻ
                    </p>
                </div>

                {/* Back of card */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <p className="text-xl font-bold text-white leading-relaxed whitespace-pre-line">
                            {card.back}
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

// Study Progress Header
export function StudyProgress({
    stats,
    progress
}) {
    return (
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-500 font-bold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {stats.correct}
                </span>
                <span className="flex items-center gap-1 text-red-500 font-bold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {stats.incorrect}
                </span>
            </div>
            <div className="w-48 bg-base-300 rounded-full h-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-gradient-to-r from-blue-600 to-violet-600 h-2 rounded-full"
                />
            </div>
        </div>
    );
}

