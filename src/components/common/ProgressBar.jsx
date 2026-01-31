import * as motion from 'motion/react-client';

/**
 * ProgressBar - Animated progress bar component
 * 
 * @param {number} progress - Progress value (0-100)
 * @param {string} color - Gradient color class or solid color
 * @param {string} height - Height class (h-1, h-2, h-3, etc.)
 * @param {boolean} showLabel - Show progress percentage
 * @param {string} label - Custom label text
 * @param {boolean} animate - Enable animation
 * @param {number} delay - Animation delay
 */
export default function ProgressBar({
    progress = 0,
    color = 'bg-gradient-to-r from-blue-500 to-blue-600',
    height = 'h-2',
    showLabel = false,
    label,
    labelLeft,
    animate = true,
    delay = 0,
    className = ''
}) {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className={className}>
            {(showLabel || label || labelLeft) && (
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-base-content/60">{labelLeft || label}</span>
                    {showLabel && (
                        <span className="font-bold text-base-content">
                            {Math.round(clampedProgress)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-base-300 rounded-full ${height}`}>
                {animate ? (
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${clampedProgress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay }}
                        className={`${color} ${height} rounded-full`}
                    />
                ) : (
                    <div
                        className={`${color} ${height} rounded-full`}
                        style={{ width: `${clampedProgress}%` }}
                    />
                )}
            </div>
        </div>
    );
}

// Circular progress indicator
export function CircularProgress({
    progress = 0,
    size = 'md', // 'sm', 'md', 'lg'
    strokeWidth = 4,
    color = 'stroke-primary',
    bgColor = 'stroke-base-300',
    showValue = true,
    className = ''
}) {
    const sizes = {
        sm: 40,
        md: 60,
        lg: 80
    };

    const sizeValue = sizes[size] || sizes.md;
    const radius = (sizeValue - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={sizeValue} height={sizeValue} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={sizeValue / 2}
                    cy={sizeValue / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                    className={bgColor}
                />
                {/* Progress circle */}
                <motion.circle
                    cx={sizeValue / 2}
                    cy={sizeValue / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                    className={color}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    style={{
                        strokeDasharray: circumference
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            {showValue && (
                <span className="absolute text-sm font-bold">
                    {Math.round(progress)}%
                </span>
            )}
        </div>
    );
}
