import { useState } from 'react';
import {
    Search,
    X,
    Grid3X3,
    List,
    ArrowUpDown,
    TrendingUp,
    Clock,
    DollarSign,
    Star,
    Tag,
    GraduationCap,
    Filter,
    ChevronDown,
    RotateCcw
} from 'lucide-react';

/**
 * CoursesToolbar - Search + Filters + Sort + View Toggle
 * Compact toolbar designed for dashboard layout
 *
 * @param {string}   searchQuery     - Current search term
 * @param {function} onSearchChange  - Callback(value)
 * @param {object}   filters         - Current filter state
 * @param {function} onFilterChange  - Callback(filterKey, value)
 * @param {function} onResetFilters  - Callback to reset all
 * @param {string}   sortBy          - Current sort key
 * @param {function} onSortChange    - Callback(sortKey)
 * @param {string}   viewMode        - 'grid' | 'list'
 * @param {function} onViewChange    - Callback(viewMode)
 * @param {number}   totalCourses    - Total visible count
 * @param {number}   activeFilterCount - Number of active filters
 * @param {Array}    categories       - Available categories
 * @param {Array}    levels           - Available levels
 */
export default function CoursesToolbar({
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange,
    onResetFilters,
    sortBy,
    onSortChange,
    viewMode,
    onViewChange,
    totalCourses = 0,
    activeFilterCount = 0,
    categories = [],
    levels = [],
}) {
    const [showFilters, setShowFilters] = useState(false);

    const sortOptions = [
        { value: 'popular', label: 'Phổ biến nhất', icon: TrendingUp },
        { value: 'newest', label: 'Mới nhất', icon: Clock },
        { value: 'price_asc', label: 'Giá thấp → cao', icon: DollarSign },
        { value: 'price_desc', label: 'Giá cao → thấp', icon: DollarSign },
        { value: 'rating', label: 'Đánh giá cao', icon: Star },
    ];

    const priceRanges = [
        { label: 'Tất cả', value: 'all' },
        { label: 'Miễn phí', value: 'free' },
        { label: 'Dưới 200K', value: 'under200' },
        { label: '200K - 500K', value: '200to500' },
        { label: 'Trên 500K', value: 'above500' },
    ];

    const ratingOptions = [
        { label: 'Từ 4.5 ⭐', value: 4.5 },
        { label: 'Từ 4.0 ⭐', value: 4.0 },
        { label: 'Từ 3.5 ⭐', value: 3.5 },
        { label: 'Tất cả', value: 0 },
    ];

    return (
        <div className="space-y-4">
            {/* Row 1: Search + Sort + View */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                        id="courses-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm kiếm môn học, chuyên gia..."
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

                {/* Filter toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn btn-sm rounded-xl font-bold gap-1.5 ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
                >
                    <Filter className="w-4 h-4" />
                    Lọc
                    {activeFilterCount > 0 && (
                        <span className="badge badge-error badge-xs text-white">{activeFilterCount}</span>
                    )}
                </button>

                {/* Sort dropdown */}
                <div className="dropdown dropdown-end">
                    <label
                        tabIndex={0}
                        className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 text-base-content/60"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        <span className="hidden sm:inline">
                            {sortOptions.find(o => o.value === sortBy)?.label}
                        </span>
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-2xl w-52 border border-base-200 mt-2"
                    >
                        {sortOptions.map(opt => {
                            const Icon = opt.icon;
                            return (
                                <li key={opt.value}>
                                    <button
                                        onClick={() => onSortChange(opt.value)}
                                        className={`flex items-center gap-2 rounded-xl text-sm font-medium ${sortBy === opt.value
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
                <div className="join">
                    <button
                        onClick={() => onViewChange('grid')}
                        className={`btn btn-sm join-item ${viewMode === 'grid'
                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none'
                            : 'btn-ghost text-base-content/50'
                            }`}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewChange('list')}
                        className={`btn btn-sm join-item ${viewMode === 'list'
                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none'
                            : 'btn-ghost text-base-content/50'
                            }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* Results count */}
                <span className="text-xs text-base-content/50 font-bold whitespace-nowrap">
                    {totalCourses} môn học
                </span>
            </div>

            {/* Row 2: Filter chips (collapsible) */}
            {showFilters && (
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 space-y-4 shadow-sm">
                    {/* Active filter reset */}
                    {activeFilterCount > 0 && (
                        <div className="flex justify-end">
                            <button
                                onClick={onResetFilters}
                                className="btn btn-ghost btn-xs text-red-500 hover:bg-red-500/10 font-bold gap-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Xóa bộ lọc ({activeFilterCount})
                            </button>
                        </div>
                    )}

                    {/* Categories */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-violet-500" />
                            Danh mục
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            <FilterChip
                                label="Tất cả"
                                active={!filters.category}
                                onClick={() => onFilterChange('category', '')}
                            />
                            {categories.map(cat => (
                                <FilterChip
                                    key={cat.value}
                                    label={`${cat.icon} ${cat.label}`}
                                    active={filters.category === cat.value}
                                    onClick={() => onFilterChange('category', cat.value)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Price + Rating + Level in row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Price */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1.5">
                                <DollarSign className="w-3 h-3 text-emerald-500" />
                                Mức giá
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {priceRanges.map(range => (
                                    <FilterChip
                                        key={range.value}
                                        label={range.label}
                                        active={filters.priceRange === range.value}
                                        onClick={() => onFilterChange('priceRange', range.value)}
                                        size="xs"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1.5">
                                <Star className="w-3 h-3 text-orange-500" />
                                Đánh giá
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {ratingOptions.map(opt => (
                                    <FilterChip
                                        key={opt.value}
                                        label={opt.label}
                                        active={filters.minRating === opt.value}
                                        onClick={() => onFilterChange('minRating', opt.value)}
                                        size="xs"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Level */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1.5">
                                <GraduationCap className="w-3 h-3 text-blue-500" />
                                Trình độ
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                <FilterChip
                                    label="Tất cả"
                                    active={!filters.level}
                                    onClick={() => onFilterChange('level', '')}
                                    size="xs"
                                />
                                {levels.map(lvl => (
                                    <FilterChip
                                        key={lvl.value}
                                        label={lvl.label}
                                        active={filters.level === lvl.value}
                                        onClick={() => onFilterChange('level', lvl.value)}
                                        size="xs"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/** Chip toggle button */
function FilterChip({ label, active, onClick, size = 'sm' }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${size === 'xs' ? 'text-[11px]' : 'text-xs'
                } ${active
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                    : 'bg-base-200 text-base-content/60 hover:bg-base-300 hover:text-base-content'
                }`}
        >
            {label}
        </button>
    );
}
