import { motion } from 'motion/react';
import { ViewToggle } from '@/shared/ui/common';
import Icon from '@/shared/ui/icons/Icon';
import { DIFFICULTY_CONFIG } from './utils';

export default function TestsFilters({
    variants,
    filteredCount,
    filterDifficulty,
    onFilterDifficultyChange,
    sortBy,
    onSortChange,
    deletableCount,
    onDeleteDeletable,
    viewMode,
    onViewModeChange,
}) {
    return (
        <motion.div variants={variants} className="mb-6">
            <div className="flex flex-row items-center justify-between gap-3 overflow-x-auto">
                <div className="shrink-0 flex items-center gap-3">
                    <h2 className="whitespace-nowrap text-xl font-black text-base-content">Bài Thi Của Tôi</h2>
                    <div className="badge badge-primary badge-lg shrink-0">{filteredCount} bài</div>
                </div>

                <div className="shrink-0 flex flex-row items-center gap-2">
                    <select
                        value={filterDifficulty}
                        onChange={(event) => onFilterDifficultyChange(event.target.value)}
                        className="select select-bordered select-sm rounded-xl text-xs font-bold"
                    >
                        <option value="all">Tất cả độ khó</option>
                        {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(event) => onSortChange(event.target.value)}
                        className="select select-bordered select-sm rounded-xl text-xs font-bold"
                    >
                        <option value="recent">Gần đây nhất</option>
                        <option value="score">Điểm cao nhất</option>
                        <option value="attempts">Nhiều lượt thi</option>
                        <option value="name">Theo tên</option>
                    </select>

                    {deletableCount > 0 && (
                        <button
                            type="button"
                            onClick={onDeleteDeletable}
                            className="btn btn-sm rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        >
                            <Icon name="Trash2" size="sm" />
                            Xóa bài tự tạo
                        </button>
                    )}

                    <ViewToggle viewMode={viewMode} onViewChange={onViewModeChange} />
                </div>
            </div>
        </motion.div>
    );
}
