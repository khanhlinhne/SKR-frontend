import * as motion from 'motion/react-client';
import Icon from '../icons/Icon';
import ProgressBar from '../common/ProgressBar';
import { CompactStat } from '../common/StatCard';

/**
 * FlashcardDeckCard - Card component for displaying a flashcard deck in grid view
 * 
 * @param {object} deck - Deck data object
 * @param {function} onStartStudy - Callback when start studying
 * @param {function} onEdit - Callback for edit action
 * @param {function} onCopy - Callback for copy action
 * @param {function} onShare - Callback for share action
 * @param {function} onDelete - Callback for delete action
 * @param {number} index - Index for animation delay
 * @param {object} variants - Animation variants
 */
export default function FlashcardDeckCard({
    deck,
    onStartStudy,
    onEdit,
    onCopy,
    onShare,
    onDelete,
    index = 0,
    variants
}) {
    const progressPercent = Math.round((deck.mastered / deck.totalCards) * 100);

    return (
        <motion.div
            variants={variants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300 group cursor-pointer hover:border-blue-500/30 transition-all"
        >
            {/* Streak Badge */}
            {deck.streak > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                    className="absolute -top-2 -right-2 z-10"
                >
                    <div className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        <Icon name="Flame" size="xs" />
                        {deck.streak}
                    </div>
                </motion.div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-${deck.color}-500/10 flex items-center justify-center text-3xl shadow-sm`}>
                        {deck.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-base-content text-lg leading-tight">
                            {deck.name}
                        </h3>
                        <p className="text-sm text-base-content/60">{deck.subject}</p>
                    </div>
                </div>

                {/* Dropdown Menu */}
                <div className="dropdown dropdown-end">
                    <button className="btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="MoreVertical" size="sm" />
                    </button>
                    <ul className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-xl w-48 border border-base-300">
                        <li>
                            <a onClick={onEdit}>
                                <Icon name="Edit3" size="sm" /> Chỉnh sửa
                            </a>
                        </li>
                        <li>
                            <a onClick={onCopy}>
                                <Icon name="Copy" size="sm" /> Sao chép
                            </a>
                        </li>
                        <li>
                            <a onClick={onShare}>
                                <Icon name="Share2" size="sm" /> Chia sẻ
                            </a>
                        </li>
                        <li>
                            <a className="text-error" onClick={onDelete}>
                                <Icon name="Trash2" size="sm" /> Xóa
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <CompactStat
                    value={deck.mastered}
                    label="Thuộc"
                    bgColor="bg-green-500/5"
                    valueColor="text-green-600"
                />
                <CompactStat
                    value={deck.learning}
                    label="Đang học"
                    bgColor="bg-orange-500/5"
                    valueColor="text-orange-600"
                />
                <CompactStat
                    value={deck.new}
                    label="Mới"
                    bgColor="bg-blue-500/5"
                    valueColor="text-blue-600"
                />
            </div>

            {/* Progress Bar */}
            <ProgressBar
                progress={progressPercent}
                color={`bg-gradient-to-r from-${deck.color}-500 to-${deck.color}-600`}
                showLabel
                labelLeft="Tiến độ"
                delay={0.2 + index * 0.1}
                className="mb-4"
            />

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-base-content/60">
                    <span className="flex items-center gap-1">
                        <Icon name="Clock" size="xs" />
                        {deck.lastStudied}
                    </span>
                    {deck.dueToday > 0 && (
                        <span className="flex items-center gap-1 text-orange-500 font-bold">
                            <Icon name="Target" size="xs" />
                            {deck.dueToday} cần ôn
                        </span>
                    )}
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStartStudy(deck)}
                    className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold shadow-lg shadow-blue-600/20"
                >
                    <Icon name="Play" size="sm" />
                    Học
                </motion.button>
            </div>
        </motion.div>
    );
}

// Add New Deck Card
export function AddDeckCard({ onClick, variants }) {
    return (
        <motion.div
            variants={variants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="bg-base-100/50 rounded-3xl p-6 shadow border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
        >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Icon name="Plus" size="xl" color="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-base-content/60 group-hover:text-blue-500 transition-colors">
                Tạo Bộ Flashcard Mới
            </h3>
            <p className="text-sm text-base-content/40 mt-1">
                Hoặc import từ file
            </p>
        </motion.div>
    );
}
