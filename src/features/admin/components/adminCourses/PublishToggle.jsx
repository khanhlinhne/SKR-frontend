import { Loader2 } from 'lucide-react';

export default function PublishToggle({ course, onToggle, loading }) {
    const isPublished = course.status === 'published';

    const handleClick = (event) => {
        event.stopPropagation();
        onToggle(course);
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                isPublished ? 'bg-emerald-500' : 'bg-base-300'
            }`}
            title={isPublished ? 'Hủy công khai' : 'Công khai khóa học'}
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white mx-auto" />
            ) : (
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        isPublished ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            )}
        </button>
    );
}
