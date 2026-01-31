import Icon from '../icons/Icon';

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

// Filter and Sort controls
export function FilterSortControls({
    onFilter,
    onSort,
    filterLabel = 'Lọc',
    sortLabel = 'Sắp xếp',
    className = ''
}) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="dropdown dropdown-end">
                <button className="btn btn-ghost btn-sm gap-2" onClick={onFilter}>
                    <Icon name="Filter" size="sm" />
                    {filterLabel}
                </button>
            </div>
            <div className="dropdown dropdown-end">
                <button className="btn btn-ghost btn-sm gap-2" onClick={onSort}>
                    <Icon name="SortAsc" size="sm" />
                    {sortLabel}
                </button>
            </div>
        </div>
    );
}

// Section header with title, badge and controls
export function SectionHeader({
    title,
    badge,
    children,
    className = ''
}) {
    return (
        <div className={`flex items-center justify-between mb-6 ${className}`}>
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-base-content">{title}</h2>
                {badge && (
                    <div className="badge badge-primary badge-lg">{badge}</div>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
