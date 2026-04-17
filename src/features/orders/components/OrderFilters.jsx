import { useState } from 'react';
import { motion } from 'motion/react';
import {
    Search,
    Filter,
    SlidersHorizontal,
    CalendarDays,
    ChevronDown,
    X
} from 'lucide-react';

/**
 * OrderFilters — Bộ lọc và tìm kiếm cho danh sách đơn hàng
 * 
 * @param {object} filters - Current filter state
 * @param {function} onFilterChange - Callback when filters change
 */

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
    { value: 'refunded', label: 'Đã hoàn tiền' }
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Giá cao nhất' },
    { value: 'lowest', label: 'Giá thấp nhất' }
];

const TIME_OPTIONS = [
    { value: 'all', label: 'Tất cả thời gian' },
    { value: '7d', label: '7 ngày qua' },
    { value: '30d', label: '30 ngày qua' },
    { value: '90d', label: '3 tháng qua' },
    { value: '1y', label: '1 năm qua' }
];

export default function OrderFilters({ filters, onFilterChange }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasActiveFilters = filters.status !== 'all'
        || filters.timeRange !== 'all'
        || filters.search;

    const handleReset = () => {
        onFilterChange({
            status: 'all',
            sortBy: 'newest',
            timeRange: 'all',
            search: ''
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden"
        >
            {/* Main filter bar */}
            <div className="p-4 flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn, tên sản phẩm..."
                        value={filters.search}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                        className="input input-bordered input-sm w-full pl-9 rounded-xl bg-base-200/50
                            border-base-300 focus:border-blue-500 focus:bg-base-100 font-medium text-sm"
                    />
                    {filters.search && (
                        <button
                            onClick={() => onFilterChange({ ...filters, search: '' })}
                            className="btn btn-ghost btn-xs btn-circle absolute right-1.5 top-1/2 -translate-y-1/2"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Status quick filter */}
                <div className="flex gap-1.5">
                    {STATUS_OPTIONS.slice(0, 4).map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onFilterChange({ ...filters, status: option.value })}
                            className={`btn btn-xs rounded-lg font-bold transition-all ${filters.status === option.value
                                ? 'btn-primary shadow-sm'
                                : 'btn-ghost text-base-content/50 hover:text-base-content'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Expand filters */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 ${isExpanded ? 'bg-blue-500/10 text-blue-600' : 'text-base-content/50'
                        }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Bộ lọc
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Reset */}
                {hasActiveFilters && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleReset}
                        className="btn btn-xs btn-ghost text-red-500 rounded-lg font-bold"
                    >
                        <X className="w-3 h-3" />
                        Xóa lọc
                    </motion.button>
                )}
            </div>

            {/* Expanded filters */}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-4 pt-1 border-t border-base-200"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                        {/* Status dropdown */}
                        <div>
                            <label className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider mb-1.5 block">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                                className="select select-bordered select-sm w-full rounded-xl font-medium"
                            >
                                {STATUS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider mb-1.5 block">
                                Sắp xếp
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
                                className="select select-bordered select-sm w-full rounded-xl font-medium"
                            >
                                {SORT_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Time range */}
                        <div>
                            <label className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                Thời gian
                            </label>
                            <select
                                value={filters.timeRange}
                                onChange={(e) => onFilterChange({ ...filters, timeRange: e.target.value })}
                                className="select select-bordered select-sm w-full rounded-xl font-medium"
                            >
                                {TIME_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
