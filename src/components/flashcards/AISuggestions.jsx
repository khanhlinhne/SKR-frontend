import * as motion from 'motion/react-client';
import Icon from '../icons/Icon';

/**
 * AISuggestions - AI-powered suggestions section
 * 
 * @param {array} suggestions - Array of suggestion objects
 * @param {object} variants - Animation variants
 */
export default function AISuggestions({ suggestions, variants }) {
    // Default suggestions if none provided
    const defaultSuggestions = [
        {
            id: 1,
            type: 'review',
            icon: 'TrendingUp',
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-500/5',
            borderColor: 'border-purple-500/10',
            title: 'Nên ôn tập',
            message: '"Vocabulary Unit 5-6" có 23 thẻ sắp quên. Ôn ngay để giữ kiến thức!'
        },
        {
            id: 2,
            type: 'achievement',
            icon: 'Award',
            iconColor: 'text-green-500',
            bgColor: 'bg-green-500/5',
            borderColor: 'border-green-500/10',
            title: 'Thành tích',
            message: 'Bạn đã học liên tục 12 ngày! Tiếp tục để đạt huy hiệu "Chuyên cần".'
        },
        {
            id: 3,
            type: 'suggest',
            icon: 'Sparkles',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-500/5',
            borderColor: 'border-blue-500/10',
            title: 'Đề xuất',
            message: 'Thử tạo flashcards cho "Tích phân từng phần" - chủ đề bạn đang yếu.'
        }
    ];

    const items = suggestions || defaultSuggestions;

    return (
        <motion.div
            variants={variants}
            className="mt-6 bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Icon name="Brain" size="md" color="text-purple-500" />
                <h3 className="text-lg font-black text-base-content">Gợi Ý AI</h3>
                <div className="badge badge-ghost badge-sm">Premium</div>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map((suggestion) => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
            </div>
        </motion.div>
    );
}

// Individual suggestion card
function SuggestionCard({ suggestion }) {
    return (
        <div className={`p-4 rounded-2xl ${suggestion.bgColor} border ${suggestion.borderColor}`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon name={suggestion.icon} size="sm" color={suggestion.iconColor} />
                <span className="text-sm font-bold text-base-content">{suggestion.title}</span>
            </div>
            <p className="text-sm text-base-content/70">
                {suggestion.message}
            </p>
        </div>
    );
}

// Single highlight suggestion (can be used standalone)
export function SuggestionHighlight({
    icon = 'Lightbulb',
    iconColor = 'text-yellow-500',
    title,
    message,
    action,
    onAction,
    className = ''
}) {
    return (
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={icon} size="md" color={iconColor} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-base-content mb-1">{title}</h4>
                    <p className="text-sm text-base-content/70 mb-2">{message}</p>
                    {action && (
                        <button
                            onClick={onAction}
                            className="btn btn-sm btn-ghost text-yellow-600 hover:bg-yellow-500/10"
                        >
                            {action}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
