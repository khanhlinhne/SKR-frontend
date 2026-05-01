import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';

/**
 * StudyControls - Control buttons for flashcard study mode
 *
 * @param {function} onPrev - Previous card callback
 * @param {function} onNext - Next card callback with result
 * @param {function} onSkip - Skip card callback
 * @param {boolean} canGoPrev - Can navigate to previous card
 * @param {boolean} canGoNext - Can navigate to next card
 */
export default function StudyControls({
    onPrev,
    onNext,
    onSkip,
    canGoPrev = true,
    canGoNext = true,
    disabled = false,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4"
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPrev}
                disabled={disabled || !canGoPrev}
                className="btn btn-circle btn-lg btn-ghost disabled:opacity-30"
            >
                <Icon name="ChevronLeft" size="xl" />
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNext('incorrect')}
                disabled={disabled}
                className="btn btn-lg bg-red-500 hover:bg-red-600 text-white border-none rounded-2xl px-8 gap-2"
            >
                <Icon name="XCircle" size="md" />
                Chưa nhớ
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSkip}
                disabled={disabled}
                className="btn btn-lg btn-ghost rounded-2xl px-6"
            >
                Bỏ qua
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNext('correct')}
                disabled={disabled}
                className="btn btn-lg bg-green-500 hover:bg-green-600 text-white border-none rounded-2xl px-8 gap-2"
            >
                <Icon name="CheckCircle2" size="md" />
                Đã nhớ
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSkip}
                disabled={disabled || !canGoNext}
                className="btn btn-circle btn-lg btn-ghost disabled:opacity-30"
            >
                <Icon name="ChevronRight" size="xl" />
            </motion.button>
        </motion.div>
    );
}

export function KeyboardHints() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-base-content/40"
        >
            <span className="kbd kbd-sm">Space</span> để lật thẻ •{' '}
            <span className="kbd kbd-sm">←</span> <span className="kbd kbd-sm">→</span> để di chuyển •{' '}
            <span className="kbd kbd-sm">1</span> Chưa nhớ •{' '}
            <span className="kbd kbd-sm">2</span> Đã nhớ
        </motion.div>
    );
}

export function StudyHeader({
    deckName,
    currentIndex,
    totalCards,
    stats,
    progress,
    onClose,
}) {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-b border-base-300 bg-base-100 px-4 py-4 sm:px-6 lg:px-8"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="btn btn-circle btn-ghost"
                    >
                        <Icon name="X" size="lg" />
                    </motion.button>
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-black text-base-content sm:text-xl">{deckName}</h2>
                        <p className="text-sm text-base-content/60">
                            Thẻ {currentIndex + 1} / {totalCards}
                        </p>
                    </div>
                </div>

                <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-green-500 font-bold">
                            <Icon name="CheckCircle2" size="sm" />
                            {stats.correct}
                        </span>
                        <span className="flex items-center gap-1 text-red-500 font-bold">
                            <Icon name="XCircle" size="sm" />
                            {stats.incorrect}
                        </span>
                    </div>
                    <div className="h-2 min-w-24 flex-1 rounded-full bg-base-300 sm:w-48 sm:flex-none">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="bg-gradient-to-r from-blue-600 to-violet-600 h-2 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
