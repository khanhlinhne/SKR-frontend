import { Link } from 'react-router-dom';
import * as motion from 'motion/react-client';
import {
    ArrowLeft,
    Star,
    Bell,
    ChevronRight,
    BookOpen
} from 'lucide-react';

/**
 * LearnHeader - Top bar for the learning page
 * Shows breadcrumb navigation, course progress, and user info.
 *
 * @param {object}  course       - Course data
 * @param {string}  lessonTitle  - Current lesson title
 * @param {number}  progress     - Overall course progress (0–100)
 */
export default function LearnHeader({ course, lessonTitle, progress = 0 }) {
    return (
        <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-b border-base-300 px-6 py-3 flex-shrink-0"
        >
            <div className="flex items-center justify-between">
                {/* Left: Breadcrumb */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Link
                        to={`/courses/${course?.id}`}
                        className="btn btn-circle btn-ghost btn-sm flex-shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>

                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-base-content/50 font-medium min-w-0">
                        <Link to="/courses" className="hover:text-base-content transition-colors">
                            Môn học
                        </Link>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        <Link
                            to={`/courses/${course?.id}`}
                            className="hover:text-base-content transition-colors truncate max-w-[160px]"
                        >
                            {course?.title}
                        </Link>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        <span className="text-base-content font-bold truncate max-w-[200px]">
                            {lessonTitle}
                        </span>
                    </div>

                    {/* Mobile: only lesson title */}
                    <div className="sm:hidden min-w-0">
                        <p className="text-sm font-bold text-base-content truncate">
                            {lessonTitle}
                        </p>
                    </div>
                </div>

                {/* Center: Progress bar */}
                <div className="hidden md:flex items-center gap-3 flex-shrink-0 mx-6">
                    <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="w-40 h-2 rounded-full bg-base-200 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                        />
                    </div>
                    <span className="text-xs font-bold text-base-content/60 min-w-[3ch]">
                        {progress}%
                    </span>
                </div>

                {/* Right: User */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="indicator">
                        <span className="indicator-item badge badge-sm badge-primary">3</span>
                        <button className="btn btn-circle btn-ghost btn-sm">
                            <Bell className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 pl-3 border-l border-base-300">
                        <div className="text-right hidden lg:block">
                            <p className="font-bold text-xs text-base-content">Đoàn Thế Anh</p>
                            <p className="text-[10px] text-orange-500 font-bold flex items-center justify-end gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-orange-500" /> Premium
                            </p>
                        </div>
                        <div className="avatar">
                            <div className="w-8 h-8 rounded-full ring-2 ring-blue-500 ring-offset-1 ring-offset-base-100">
                                <img src="https://i.pravatar.cc/150?img=33" alt="User" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
