import * as motion from 'motion/react-client';
import * as LucideIcons from 'lucide-react';

/**
 * Icon Component - Reusable icon wrapper with animation support
 * 
 * @param {string} name - Tên icon từ lucide-react (VD: 'Search', 'Bell', 'Plus')
 * @param {string} size - Kích thước: 'xs', 'sm', 'md', 'lg', 'xl' hoặc số cụ thể
 * @param {string} color - Màu sắc (Tailwind class hoặc hex)
 * @param {string} className - Class CSS bổ sung
 * @param {boolean} animate - Có animation không
 * @param {string} animationType - Loại animation: 'pulse', 'bounce', 'spin', 'ping'
 * @param {object} wrapperProps - Props cho wrapper div
 */

// Size mapping
const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
    '3xl': 'w-12 h-12'
};

// Animation variants
const animationVariants = {
    pulse: {
        scale: [1, 1.1, 1],
        transition: { duration: 1.5, repeat: Infinity }
    },
    bounce: {
        y: [0, -4, 0],
        transition: { duration: 0.6, repeat: Infinity }
    },
    spin: {
        rotate: 360,
        transition: { duration: 1, repeat: Infinity, ease: 'linear' }
    },
    ping: {
        scale: [1, 1.2, 1],
        opacity: [1, 0.8, 1],
        transition: { duration: 1, repeat: Infinity }
    }
};

export default function Icon({
    name,
    size = 'md',
    color,
    className = '',
    animate = false,
    animationType = 'pulse',
    ...props
}) {
    // Get the icon component from lucide-react
    const IconComponent = LucideIcons[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in lucide-react`);
        return null;
    }

    // Determine size class
    const sizeClass = sizeMap[size] || `w-${size} h-${size}`;

    // Build className
    const iconClassName = `${sizeClass} ${color || ''} ${className}`.trim();

    // If animation is enabled, wrap with motion
    if (animate) {
        return (
            <motion.span
                animate={animationVariants[animationType]}
                className="inline-flex"
            >
                <IconComponent className={iconClassName} {...props} />
            </motion.span>
        );
    }

    return <IconComponent className={iconClassName} {...props} />;
}

// Preset Icon Components for common use cases
export function IconButton({
    name,
    size = 'md',
    variant = 'ghost', // 'ghost', 'primary', 'secondary', 'circle'
    onClick,
    className = '',
    disabled = false,
    children,
    ...props
}) {
    const variantClasses = {
        ghost: 'btn btn-ghost',
        primary: 'btn btn-primary',
        secondary: 'btn btn-secondary',
        circle: 'btn btn-circle btn-ghost',
        'circle-primary': 'btn btn-circle btn-primary'
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={onClick}
            disabled={disabled}
            className={`${variantClasses[variant]} ${className}`}
            {...props}
        >
            <Icon name={name} size={size} />
            {children}
        </motion.button>
    );
}

// Icon with background container
export function IconBox({
    name,
    size = 'md',
    bgColor = 'bg-primary/10',
    iconColor = 'text-primary',
    rounded = 'rounded-xl',
    className = '',
    ...props
}) {
    const boxSizes = {
        xs: 'w-8 h-8',
        sm: 'w-10 h-10',
        md: 'w-12 h-12',
        lg: 'w-14 h-14',
        xl: 'w-16 h-16'
    };

    return (
        <div className={`${boxSizes[size]} ${rounded} ${bgColor} flex items-center justify-center ${className}`}>
            <Icon name={name} size={size} color={iconColor} {...props} />
        </div>
    );
}

// Badge with icon
export function IconBadge({
    name,
    label,
    variant = 'default', // 'default', 'success', 'warning', 'error', 'info'
    size = 'sm',
    className = ''
}) {
    const variantClasses = {
        default: 'badge-ghost',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        info: 'badge-info',
        primary: 'badge-primary'
    };

    return (
        <span className={`badge ${variantClasses[variant]} gap-1 ${className}`}>
            <Icon name={name} size={size} />
            {label && <span>{label}</span>}
        </span>
    );
}

// Stat icon - icon with value display
export function StatIcon({
    name,
    value,
    color = 'text-base-content',
    size = 'sm',
    className = ''
}) {
    return (
        <span className={`flex items-center gap-1 ${color} font-bold ${className}`}>
            <Icon name={name} size={size} />
            {value}
        </span>
    );
}
