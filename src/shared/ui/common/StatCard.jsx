import { motion } from 'motion/react';
import Icon from '@/shared/ui/icons/Icon';

/**
 * StatCard - Reusable statistic card component
 * 
 * @param {string} icon - Icon name from lucide-react
 * @param {string} label - Label text
 * @param {string|number} value - Value to display
 * @param {string} iconBgColor - Background color for icon container
 * @param {string} iconColor - Icon color
 * @param {React.ReactNode} suffix - Optional suffix element (e.g., emoji, badge)
 * @param {object} variants - Animation variants for motion
 */
export default function StatCard({
    icon,
    label,
    value,
    iconBgColor = 'bg-blue-500/10',
    iconColor = 'text-blue-500',
    suffix,
    className = '',
    variants
}) {
    const Wrapper = variants ? motion.div : 'div';
    const wrapperProps = variants ? { variants } : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={`bg-base-100 rounded-2xl p-5 shadow-lg border border-base-300 ${className}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center`}>
                    <Icon name={icon} size="lg" color={iconColor} />
                </div>
                <div>
                    <p className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
                        {label}
                    </p>
                    <p className="text-2xl font-black text-base-content flex items-center gap-1">
                        {value}
                        {suffix}
                    </p>
                </div>
            </div>
        </Wrapper>
    );
}

// Compact stat for use in grids
export function CompactStat({
    value,
    label,
    bgColor = 'bg-green-500/5',
    valueColor = 'text-green-600',
    className = ''
}) {
    return (
        <div className={`text-center p-2 rounded-xl ${bgColor} ${className}`}>
            <p className={`text-lg font-black ${valueColor}`}>{value}</p>
            <p className="text-[10px] text-base-content/60 font-bold uppercase">{label}</p>
        </div>
    );
}
