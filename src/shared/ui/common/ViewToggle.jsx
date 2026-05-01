import Icon from '@/shared/ui/icons/Icon';

/**
 * ViewToggle - Toggle between grid and list view
 *
 * @param {string} viewMode - Current view mode ('grid' or 'list')
 * @param {function} onViewChange - Callback when view changes
 * @param {string} size - Button size ('sm', 'md')
 */
export default function ViewToggle({
    viewMode = 'grid',
    onViewChange,
    size = 'sm',
    className = ''
}) {
    return (
        <div className={`join ${className}`}>
            <button
                onClick={() => onViewChange('grid')}
                className={`btn btn-${size} join-item ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            >
                <Icon name="Grid3X3" size="sm" />
            </button>
            <button
                onClick={() => onViewChange('list')}
                className={`btn btn-${size} join-item ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            >
                <Icon name="List" size="sm" />
            </button>
        </div>
    );
}

export function FilterSortControls({
    filterLabel = 'Lọc',
    sortLabel = 'Sắp xếp',
    className = '',
    filterContent,
    sortContent,
    onFilter,
    onSort,
}) {
    return (
        <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${className}`}>
            <div className="dropdown dropdown-end">
                <button type="button" className="btn btn-ghost btn-sm gap-2" onClick={onFilter}>
                    <Icon name="Filter" size="sm" />
                    {filterLabel}
                </button>
                {filterContent}
            </div>
            <div className="dropdown dropdown-end">
                <button type="button" className="btn btn-ghost btn-sm gap-2" onClick={onSort}>
                    <Icon name="SortAsc" size="sm" />
                    {sortLabel}
                </button>
                {sortContent}
            </div>
        </div>
    );
}

export function SectionHeader({
    title,
    badge,
    children,
    className = ''
}) {
    return (
        <div className={`mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <h2 className="truncate text-lg font-black text-base-content sm:text-xl">{title}</h2>
                {badge && (
                    <div className="badge badge-primary badge-lg">{badge}</div>
                )}
            </div>
            {children && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
