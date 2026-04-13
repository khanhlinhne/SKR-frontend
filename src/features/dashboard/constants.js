export const SUBJECT_COLOR_STYLES = {
    blue: { softBg: 'bg-blue-500/10', text: 'text-blue-500', bar: 'bg-blue-500' },
    green: { softBg: 'bg-green-500/10', text: 'text-green-500', bar: 'bg-green-500' },
    yellow: { softBg: 'bg-yellow-500/10', text: 'text-yellow-500', bar: 'bg-yellow-500' },
    purple: { softBg: 'bg-purple-500/10', text: 'text-purple-500', bar: 'bg-purple-500' },
};

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

export const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};
