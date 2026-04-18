import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const STYLES = {
    error: {
        icon: AlertCircle,
        className: 'border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300',
    },
    success: {
        icon: CheckCircle2,
        className: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    },
    info: {
        icon: Info,
        className: 'border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300',
    },
};

export default function AuthStatusBanner({ variant = 'error', message }) {
    if (!message) {
        return null;
    }

    const style = STYLES[variant] || STYLES.error;
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${style.className}`}
        >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{message}</span>
        </motion.div>
    );
}
