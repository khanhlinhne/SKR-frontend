import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';

const DECK_COLOR_STYLES = {
    blue: { softBg: 'bg-blue-500/10', progress: 'bg-blue-500' },
    green: { softBg: 'bg-green-500/10', progress: 'bg-green-500' },
    yellow: { softBg: 'bg-yellow-500/10', progress: 'bg-yellow-500' },
    purple: { softBg: 'bg-purple-500/10', progress: 'bg-purple-500' },
    red: { softBg: 'bg-red-500/10', progress: 'bg-red-500' },
    orange: { softBg: 'bg-orange-500/10', progress: 'bg-orange-500' },
};

/**
 * FlashcardDeckListItem - List item component for displaying a flashcard deck
 * 
 * @param {object} deck - Deck data object
 * @param {function} onStartStudy - Callback when start studying
 * @param {function} onMenuClick - Callback when menu clicked
 * @param {object} variants - Animation variants
 */
export default function FlashcardDeckListItem({
    deck,
    onStartStudy,
    onMenuClick,
    variants
}) {
    const progressPercent = (deck.mastered / deck.totalCards) * 100;

    return (
        <motion.div
            variants={variants}
            whileHover={{ x: 5 }}
            className="bg-base-100 rounded-2xl p-4 shadow border border-base-300 flex items-center gap-4 group cursor-pointer hover:border-blue-500/30 transition-all"
        >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl ${(DECK_COLOR_STYLES[deck.color] || DECK_COLOR_STYLES.blue).softBg} flex items-center justify-center text-2xl flex-shrink-0`}>
                {deck.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base-content truncate">{deck.name}</h3>
                    {deck.streak > 0 && (
                        <span className="badge badge-sm bg-orange-500/10 text-orange-500 border-none flex-shrink-0">
                            <Icon name="Flame" size="xs" className="mr-1" />
                            {deck.streak}
                        </span>
                    )}
                </div>
                <p className="text-sm text-base-content/60">
                    {deck.subject} • {deck.totalCards} thẻ
                </p>
            </div>

            {/* Stats - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                    <p className="text-sm font-bold text-green-600">{deck.mastered}</p>
                    <p className="text-xs text-base-content/60">Thuộc</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-orange-600">{deck.learning}</p>
                    <p className="text-xs text-base-content/60">Đang học</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-blue-600">{deck.new}</p>
                    <p className="text-xs text-base-content/60">Mới</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-24 flex-shrink-0 hidden sm:block">
                <div className="w-full bg-base-300 rounded-full h-1.5">
                    <div
                        className={`${(DECK_COLOR_STYLES[deck.color] || DECK_COLOR_STYLES.blue).progress} h-1.5 rounded-full transition-all`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStartStudy(deck)}
                    className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold"
                >
                    <Icon name="Play" size="sm" />
                    Học
                </motion.button>
                <button
                    onClick={onMenuClick}
                    className="btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Icon name="MoreVertical" size="sm" />
                </button>
            </div>
        </motion.div>
    );
}



