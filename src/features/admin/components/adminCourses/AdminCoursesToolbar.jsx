import {
    ArrowUpDown,
    Grid3X3,
    List,
    Search,
    X,
} from 'lucide-react';

export default function AdminCoursesToolbar({
    searchQuery,
    onSearchChange,
    onSearchClear,
    filterStatus,
    onFilterChange,
    statusCounts,
    sortBy,
    onSortChange,
    sortOptions,
    viewMode,
    onViewModeChange,
    filteredCount,
}) {
    return (
        <div className="bg-base-100 rounded-2xl border border-base-300/60 p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm khóa học, giảng viên, danh mục..."
                        value={searchQuery}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-base-200/50 border border-base-300/50 focus:border-emerald-500/50 focus:bg-base-100 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/30 transition-all duration-200"
                    />
                    {searchQuery && (
                        <button
                            onClick={onSearchClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 bg-base-200/40 rounded-xl p-1 flex-shrink-0">
                    {[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'published', label: 'Xuất bản' },
                        { value: 'draft', label: 'Nháp' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onFilterChange(option.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                                filterStatus === option.value
                                    ? 'bg-base-100 text-base-content shadow-sm border border-base-300/50'
                                    : 'text-base-content/40 hover:text-base-content/70 hover:bg-base-200/40'
                            }`}
                        >
                            {option.label}
                            <span className="ml-1 text-[10px] opacity-60">
                                {statusCounts[option.value] || 0}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="hidden lg:block w-px h-6 bg-base-300/50 flex-shrink-0" />

                <div className="dropdown dropdown-end flex-shrink-0">
                    <label
                        tabIndex={0}
                        className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 text-base-content/50 text-xs"
                    >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                            {sortOptions.find((option) => option.value === sortBy)?.label}
                        </span>
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-2xl w-56 border border-base-200 mt-2"
                    >
                        {sortOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <li key={option.value}>
                                    <button
                                        onClick={() => onSortChange(option.value)}
                                        className={`flex items-center gap-2 rounded-xl text-sm font-medium ${
                                            sortBy === option.value
                                                ? 'bg-emerald-500/10 text-emerald-600 font-bold'
                                                : 'text-base-content/60'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {option.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="join flex-shrink-0">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`btn btn-sm join-item ${
                            viewMode === 'grid'
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none'
                                : 'btn-ghost text-base-content/40'
                        }`}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('table')}
                        className={`btn btn-sm join-item ${
                            viewMode === 'table'
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none'
                                : 'btn-ghost text-base-content/40'
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                <span className="text-[11px] font-semibold text-base-content/30 hidden lg:inline flex-shrink-0 tabular-nums">
                    {filteredCount} khóa học
                </span>
            </div>
        </div>
    );
}
