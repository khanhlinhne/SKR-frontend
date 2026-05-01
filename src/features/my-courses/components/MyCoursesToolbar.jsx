import {
    Search,
    X,
    Grid3X3,
    List,
    ArrowUpDown,
    TrendingUp,
    Clock,
    Star,
    Filter,
    RotateCcw,
    BookOpen,
    Trophy,
    Play,
    CheckCircle2,
} from 'lucide-react';

/**
 * MyCoursesToolbar — Premium toolbar matching CoursesToolbar style.
 * Search + Status Filter + Sort + View Toggle + Count
 */
export default function MyCoursesToolbar({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    sortBy,
    onSortChange,
    viewMode,
    onViewChange,
    totalCourses,
}) {
    const statusOptions = [
        { value: 'all', label: 'Tất cả', icon: BookOpen },
        { value: 'in-progress', label: 'Đang học', icon: Play },
        { value: 'completed', label: 'Hoàn thành', icon: Trophy },
        { value: 'not-started', label: 'Chưa bắt đầu', icon: CheckCircle2 },
    ];

    const sortOptions = [
        { value: 'recent', label: 'Gần đây nhất', icon: Clock },
        { value: 'name', label: 'Tên A-Z', icon: ArrowUpDown },
        { value: 'progress', label: 'Tiến độ cao nhất', icon: TrendingUp },
    ];

    return (
        <div className="space-y-3">
            {/* Row 1: Search + Sort + View */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                        id="my-courses-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm khóa học, chuyên gia..."
                        className="input input-bordered input-sm w-full pl-9 pr-8 rounded-xl bg-base-100 border-base-300 focus:border-blue-500 text-sm font-medium"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost btn-xs"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Status filter pills */}
                <div className="flex w-full items-center gap-1.5 overflow-x-auto sm:w-auto sm:flex-shrink-0">
                    {statusOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => onStatusChange(opt.value)}
                            className={`flex-shrink-0 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                                statusFilter === opt.value
                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                                    : 'bg-base-200 text-base-content/60 hover:bg-base-300 hover:text-base-content'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Sort dropdown */}
                <div className="dropdown dropdown-end flex-shrink-0">
                    <label
                        tabIndex={0}
                        className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 text-base-content/60"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        <span className="hidden sm:inline">
                            {sortOptions.find((o) => o.value === sortBy)?.label}
                        </span>
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-2xl w-52 border border-base-200 mt-2"
                    >
                        {sortOptions.map((opt) => {
                            const Icon = opt.icon;
                            return (
                                <li key={opt.value}>
                                    <button
                                        onClick={() => onSortChange(opt.value)}
                                        className={`flex items-center gap-2 rounded-xl text-sm font-medium ${
                                            sortBy === opt.value
                                                ? 'bg-blue-500/10 text-blue-600 font-bold'
                                                : 'text-base-content/70'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {opt.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* View toggle */}
                <div className="join flex-shrink-0">
                    <button
                        onClick={() => onViewChange('grid')}
                        className={`btn btn-sm join-item ${
                            viewMode === 'grid'
                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none'
                                : 'btn-ghost text-base-content/50'
                        }`}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewChange('list')}
                        className={`btn btn-sm join-item ${
                            viewMode === 'list'
                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none'
                                : 'btn-ghost text-base-content/50'
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* Results count */}
                <span className="text-xs text-base-content/50 font-bold whitespace-nowrap flex-shrink-0">
                    {totalCourses} khóa học
                </span>
            </div>
        </div>
    );
}
