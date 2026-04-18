import { OwlLoader } from '@/shared/ui/common';

export default function LearnTransitionState({
    gradient = 'from-blue-500 to-violet-500',
    message,
    subMessage,
}) {
    return (
        <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
            <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
            <OwlLoader
                message={message}
                subMessage={subMessage}
                className="min-h-[calc(100vh-16rem)] px-6 py-10"
            />
        </div>
    );
}
