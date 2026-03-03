import { useState } from 'react';
import * as motion from 'motion/react-client';
import { AdminLayout } from '../../components/admin';
import {
    Search,
    Plus,
    MoreHorizontal,
    Eye,
    Edit3,
    Trash2,
    Star,
    Users,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Download,
    Filter,
} from 'lucide-react';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

// Mock data
const mockCourses = [
    { id: 1, name: 'Toán Cao Cấp Pro', category: 'Toán học', price: '₫299,000', students: 567, rating: 4.8, status: 'published', lessons: 48, image: '📐' },
    { id: 2, name: 'IELTS Speaking Pack', category: 'Tiếng Anh', price: '₫499,000', students: 432, rating: 4.9, status: 'published', lessons: 36, image: '🇬🇧' },
    { id: 3, name: 'Lập Trình Python', category: 'IT', price: '₫199,000', students: 389, rating: 4.7, status: 'published', lessons: 52, image: '🐍' },
    { id: 4, name: 'Data Science Bundle', category: 'IT', price: '₫799,000', students: 245, rating: 4.6, status: 'published', lessons: 80, image: '📊' },
    { id: 5, name: 'Vật Lý Đại Cương', category: 'Vật lý', price: '₫249,000', students: 178, rating: 4.5, status: 'draft', lessons: 30, image: '⚛️' },
    { id: 6, name: 'Hóa Học Hữu Cơ', category: 'Hóa học', price: '₫199,000', students: 0, rating: 0, status: 'draft', lessons: 12, image: '🧪' },
];

const statusConfig = {
    published: { label: 'Đã xuất bản', color: 'text-emerald-600 bg-emerald-500/10' },
    draft: { label: 'Bản nháp', color: 'text-amber-600 bg-amber-500/10' },
    archived: { label: 'Đã lưu trữ', color: 'text-base-content/50 bg-base-200' },
};

export default function AdminCourses() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

    const filteredCourses = mockCourses.filter(course => {
        const matchSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'all' || course.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">Quản lý Khóa học</h1>
                        <p className="text-sm text-base-content/60 mt-1">Tổng cộng {mockCourses.length} khóa học</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-ghost font-bold rounded-xl gap-1">
                            <Download className="w-4 h-4" />
                            Xuất file
                        </button>
                        <button className="btn btn-sm bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none shadow-lg font-bold rounded-xl gap-1">
                            <Plus className="w-4 h-4" />
                            Tạo khóa học
                        </button>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl p-4 shadow-lg border border-base-300 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Tìm kiếm khóa học..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input input-bordered w-full pl-10 rounded-xl bg-base-200 border-base-300 focus:border-emerald-500 text-sm"
                            />
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="select select-bordered select-sm rounded-xl bg-base-200 border-base-300 font-bold text-sm"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="draft">Bản nháp</option>
                            <option value="archived">Đã lưu trữ</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex bg-base-200 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`btn btn-xs rounded-lg ${viewMode === 'grid' ? 'bg-base-100 shadow' : 'btn-ghost'}`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`btn btn-xs rounded-lg ${viewMode === 'table' ? 'bg-base-100 shadow' : 'btn-ghost'}`}
                            >
                                Table
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Courses Grid View */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCourses.map((course, i) => (
                            <CourseCard key={course.id} course={course} index={i} />
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <motion.div variants={cardVariants} className="bg-base-100 rounded-3xl shadow-lg border border-base-300 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-base-200/50">
                                        <th className="font-bold text-xs uppercase text-base-content/60">Khóa học</th>
                                        <th className="font-bold text-xs uppercase text-base-content/60">Danh mục</th>
                                        <th className="font-bold text-xs uppercase text-base-content/60">Giá</th>
                                        <th className="font-bold text-xs uppercase text-base-content/60">Học viên</th>
                                        <th className="font-bold text-xs uppercase text-base-content/60">Đánh giá</th>
                                        <th className="font-bold text-xs uppercase text-base-content/60">Trạng thái</th>
                                        <th className="font-bold text-xs uppercase text-base-content/60">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map((course, i) => {
                                        const status = statusConfig[course.status];
                                        return (
                                            <motion.tr
                                                key={course.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + i * 0.05 }}
                                                className="hover:bg-base-200/50 cursor-pointer group"
                                            >
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center text-xl">
                                                            {course.image}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-base-content">{course.name}</p>
                                                            <p className="text-xs text-base-content/50">{course.lessons} bài học</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="badge badge-sm badge-ghost font-bold">{course.category}</span></td>
                                                <td><span className="font-bold text-sm">{course.price}</span></td>
                                                <td>
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <Users className="w-3 h-3 text-base-content/40" />
                                                        <span className="font-bold">{course.students}</span>
                                                    </span>
                                                </td>
                                                <td>
                                                    {course.rating > 0 ? (
                                                        <span className="flex items-center gap-1 text-sm">
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                            <span className="font-bold">{course.rating}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-base-content/40">N/A</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="btn btn-ghost btn-xs btn-circle" title="Xem"><Eye className="w-3.5 h-3.5" /></button>
                                                        <button className="btn btn-ghost btn-xs btn-circle" title="Sửa"><Edit3 className="w-3.5 h-3.5" /></button>
                                                        <button className="btn btn-ghost btn-xs btn-circle text-red-500" title="Xóa"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AdminLayout>
    );
}

// ===== Course Card Component =====
function CourseCard({ course, index }) {
    const status = statusConfig[course.status];

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden group hover:shadow-xl transition-shadow"
        >
            {/* Header with emoji icon */}
            <div className="bg-gradient-to-br from-blue-500/5 to-violet-500/5 p-6 flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 flex items-center justify-center text-4xl border border-blue-500/10">
                    {course.image}
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${status.color}`}>
                        {status.label}
                    </span>
                    <button className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-5">
                <h3 className="font-black text-base text-base-content mb-1 truncate">{course.name}</h3>
                <p className="text-xs text-base-content/60 mb-4">
                    {course.category} • {course.lessons} bài học
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-base-content/70">
                            <Users className="w-3 h-3" />
                            <span className="font-bold">{course.students}</span>
                        </span>
                        {course.rating > 0 && (
                            <span className="flex items-center gap-1 text-xs text-base-content/70">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="font-bold">{course.rating}</span>
                            </span>
                        )}
                    </div>
                    <span className="font-black text-base-content">{course.price}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button className="btn btn-sm flex-1 btn-ghost rounded-xl font-bold gap-1">
                        <Edit3 className="w-3.5 h-3.5" />
                        Sửa
                    </button>
                    <button className="btn btn-sm flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none rounded-xl font-bold gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Xem
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
