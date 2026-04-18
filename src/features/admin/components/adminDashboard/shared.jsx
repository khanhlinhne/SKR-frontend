import { Loader2, Star } from 'lucide-react';

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
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

export const TIME_RANGE_LABELS = {
    week: 'Tuần',
    month: 'Tháng',
    year: 'Năm',
};

export function SectionLoading() {
    return (
        <div className="flex items-center justify-center py-16 text-base-content/60">
            <Loader2 className="h-6 w-6 animate-spin" />
        </div>
    );
}

export function EmptyState({ message }) {
    return (
        <div className="rounded-2xl border border-dashed border-base-300 px-4 py-10 text-center">
            <div className="mb-2 flex justify-center">
                <Star className="h-5 w-5 text-base-content/30" />
            </div>
            <p className="text-sm font-medium text-base-content/60">{message}</p>
        </div>
    );
}
