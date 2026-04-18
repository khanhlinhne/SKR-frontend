import { AnimatePresence, motion } from 'motion/react';
import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowLeft,
    ArrowUpRight,
    BarChart3,
    BookOpen,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Clock,
    DollarSign,
    Download,
    Eye,
    GraduationCap,
    Hash,
    Loader2,
    Mail,
    Phone,
    Search,
    ShieldCheck,
    Star,
    Target,
    UserCheck,
    Users,
    UserX,
    Zap,
} from 'lucide-react';
import { useExpertAnalyticsDashboard, enrollmentStatusConfig } from '@/features/expert/hooks/useExpertAnalyticsDashboard';
import { BarChartCSS, DonutChart, Sparkline } from './AnalyticsCharts';

const iconMap = {
    DollarSign,
    Users,
    Target,
    Clock,
    Eye,
    Star,
    UserCheck,
    ShieldCheck,
};

function SortIcon({ active, direction }) {
    if (!active) {
        return <ChevronDown className="h-3 w-3 opacity-30" />;
    }

    return direction === 'asc'
        ? <ChevronUp className="h-3 w-3 text-violet-500" />
        : <ChevronDown className="h-3 w-3 text-violet-500" />;
}

function MetricCard({ card, index }) {
    const Icon = iconMap[card.icon];
    const showChange = Boolean(card.change);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg transition-shadow hover:shadow-xl"
        >
            <div className="mb-3 flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    {Icon && <Icon className="h-5 w-5 text-white" />}
                </div>
                {card.sparkData?.length > 1 && <Sparkline data={card.sparkData} color={card.sparkColor} />}
                {card.donut != null && <DonutChart value={card.donut} size={56} strokeWidth={6} color="#8b5cf6" />}
                {card.rating != null && (
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${star <= Math.round(card.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-base-300'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-base-content/45">{card.label}</p>
            <div className="flex items-end justify-between gap-3">
                <h3 className="text-xl font-black text-base-content">{card.value}</h3>
                {showChange && (
                    <span className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        card.trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                        {card.trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {card.change}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

function HeroBanner({ course, chapterCount, lessonCount, studentCount, activeTab, setActiveTab, onBack }) {
    return (
        <>
            <motion.button
                whileHover={{ x: -3 }}
                onClick={onBack}
                className="mb-4 flex items-center gap-2 text-sm font-bold text-base-content/60 transition-colors hover:text-violet-600"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách khóa học
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-6 overflow-hidden rounded-3xl"
            >
                <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600 p-6">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute left-10 top-2 h-20 w-20 rounded-full border-4 border-white" />
                        <div className="absolute bottom-2 right-16 h-28 w-28 rounded-full border-4 border-white" />
                        <div className="absolute right-40 top-4 h-12 w-12 rotate-45 rounded-lg border-4 border-white" />
                    </div>
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/30">
                                {course.courseBannerUrl ? (
                                    <img src={course.courseBannerUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-white/10">
                                        <GraduationCap className="h-7 w-7 text-white/60" />
                                    </div>
                                )}
                            </div>
                            <div>
                                {course.courseCode && (
                                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white/70 backdrop-blur-sm">
                                        {course.courseCode}
                                    </span>
                                )}
                                <h2 className="mt-1 text-xl font-black text-white drop-shadow-lg">{course.courseName}</h2>
                                <div className="mt-1 flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-xs text-white/70"><BookOpen className="h-3 w-3" />{chapterCount} chương</span>
                                    <span className="flex items-center gap-1 text-xs text-white/70"><BarChart3 className="h-3 w-3" />{lessonCount} bài</span>
                                    <span className="flex items-center gap-1 text-xs text-white/70"><Users className="h-3 w-3" />{studentCount} HV</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 rounded-xl bg-white/10 p-1 backdrop-blur-sm">
                            {[
                                { key: 'overview', label: 'Tổng quan', icon: BarChart3 },
                                { key: 'students', label: 'Học viên', icon: Users },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                        activeTab === tab.key
                                            ? 'bg-white text-violet-700 shadow-md'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <tab.icon className="h-3.5 w-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

function OverviewTab({ overview, chartPeriod, setChartPeriod, studentCount }) {
    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
        >
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                {overview.metricCards.map((card, index) => (
                    <MetricCard key={card.label} card={card} index={index} />
                ))}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="flex items-center gap-2 text-base font-black text-base-content">
                                <Activity className="h-4 w-4 text-violet-500" />
                                Số đăng ký mới
                            </h3>
                            <p className="mt-0.5 text-xs text-base-content/45">Xu hướng đăng ký theo thời gian</p>
                        </div>
                        <div className="flex gap-1 rounded-lg bg-base-200 p-0.5">
                            {['week', 'month'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setChartPeriod(period)}
                                    className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
                                        chartPeriod === period ? 'bg-violet-600 text-white shadow-md' : 'text-base-content/50 hover:text-base-content'
                                    }`}
                                >
                                    {period === 'week' ? 'Tuần' : 'Tháng'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <BarChartCSS data={overview.chartData} height={150} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
                    <div className="mb-5">
                        <h3 className="flex items-center gap-2 text-base font-black text-base-content">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Mức độ hoạt động
                        </h3>
                        <p className="mt-0.5 text-xs text-base-content/45">Số học viên hoạt động theo các ngày trong tuần</p>
                    </div>
                    <BarChartCSS data={overview.weeklyActivity} height={150} barColor="from-amber-500 to-orange-500" />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg lg:col-span-3">
                    <div className="mb-5">
                        <h3 className="flex items-center gap-2 text-base font-black text-base-content">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            Tiến độ theo bài giảng
                        </h3>
                        <p className="mt-0.5 text-xs text-base-content/45">% học viên đã chạm tới từng bài</p>
                    </div>
                    <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
                        {overview.lessonProgress.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-base-300 p-8 text-center text-sm font-bold text-base-content/45">
                                Chưa có dữ liệu tiến độ bài giảng cho khóa học này.
                            </div>
                        ) : overview.lessonProgress.map((lesson, index) => {
                            const isStuck = lesson.dropRate > 10;

                            return (
                                <motion.div
                                    key={lesson.lessonId || lesson.name}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.04 }}
                                    className={`rounded-xl border p-2.5 transition-all ${
                                        isStuck ? 'border-red-500/20 bg-red-500/3' : 'border-base-300/60 hover:border-violet-500/20'
                                    }`}
                                >
                                    <div className="mb-1 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-base-content">{lesson.name}</p>
                                            <p className="text-[11px] text-base-content/45">{lesson.studentsAtLesson} học viên đã chạm bài này</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isStuck ? 'bg-red-500/10 text-red-500' : 'bg-violet-500/10 text-violet-600'}`}>
                                            Rơi rụng {lesson.dropRate}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-base-200">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${lesson.completionRate}%` }}
                                                transition={{ duration: 0.6, delay: 0.45 + index * 0.03 }}
                                                className={`h-full rounded-full ${isStuck ? 'bg-red-400' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
                                            />
                                        </div>
                                        <span className="w-10 text-right text-[11px] font-black text-base-content">{lesson.completionRate}%</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg lg:col-span-2">
                    <div className="mb-5">
                        <h3 className="flex items-center gap-2 text-base font-black text-base-content">
                            <Target className="h-4 w-4 text-emerald-500" />
                            Phễu hoàn thành
                        </h3>
                        <p className="mt-0.5 text-xs text-base-content/45">Tỷ lệ học viên đi qua các mốc chính</p>
                    </div>
                    <div className="space-y-3">
                        {overview.funnelSteps.map((step, index) => (
                            <motion.div
                                key={step.label}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.08 }}
                            >
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-base-content/60">{step.label}</span>
                                    <span className="text-[10px] font-black text-base-content">{step.count} ({step.pct}%)</span>
                                </div>
                                <div className="mx-auto h-3 overflow-hidden rounded-full bg-base-200" style={{ width: `${50 + step.pct * 0.5}%` }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 0.8, delay: 0.55 + index * 0.08 }}
                                        className={`h-full rounded-full bg-gradient-to-r ${step.color}`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-6 border-t border-base-300 pt-5">
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-black text-base-content">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            Phân bố đánh giá
                        </h4>
                        <div className="space-y-1.5">
                            {overview.ratingBreakdown.map((item) => (
                                <div key={item.stars} className="flex items-center gap-2">
                                    <span className="w-3 text-[10px] font-bold text-base-content/50">{item.stars}</span>
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-200">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.pct}%` }}
                                            transition={{ duration: 0.6, delay: 0.8 }}
                                            className="h-full rounded-full bg-yellow-400"
                                        />
                                    </div>
                                    <span className="w-7 text-right text-[10px] font-bold text-base-content/40">{item.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-violet-500/5 p-4 text-sm text-base-content/60">
                        {studentCount > 0
                            ? `Đang theo dõi ${studentCount} học viên cho khóa học này.`
                            : 'Khóa học chưa có học viên nên các chỉ số đang hiển thị ở mức 0 hoặc --.'}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

function StudentsTab({
    quickStats,
    filteredEnrollments,
    totalEnrollments,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    onSort,
    loadingStudents,
    studentsError,
    page,
    totalPages,
    setPage,
    onExport,
    exportingCsv,
}) {
    const tableColumns = [
        { key: 'id', label: 'ID', icon: Hash },
        { key: 'name', label: 'Full Name', icon: null },
        { key: null, label: 'Email', icon: Mail },
        { key: null, label: 'Mobile', icon: Phone },
        { key: 'date', label: 'Date', icon: CalendarDays },
        { key: 'cost', label: 'Cost', icon: DollarSign },
        { key: null, label: 'Progress', icon: null },
        { key: null, label: 'Status', icon: null },
    ];

    return (
        <motion.div
            key="students"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
        >
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickStats.map((stat, index) => {
                    const Icon = iconMap[stat.icon];

                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3"
                        >
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                                {Icon && <Icon className={`h-4 w-4 ${stat.color}`} />}
                            </div>
                            <div>
                                <p className="text-base font-black leading-none text-base-content">{stat.value}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-base-content/40">{stat.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-base-300 bg-base-100 shadow-lg"
            >
                <div className="border-b border-base-300 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="flex items-center gap-2 text-sm font-black text-base-content">
                            <Users className="h-4 w-4 text-violet-500" />
                            Danh sách học viên
                            <span className="badge badge-sm badge-primary font-bold">{totalEnrollments}</span>
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-base-content/30" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, email, ID..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="input input-bordered input-sm w-52 rounded-xl pl-8 text-xs font-medium"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="select select-bordered select-sm rounded-xl text-xs font-bold"
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Đang học</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="expired">Hết hạn</option>
                                <option value="pending">Chờ duyệt</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loadingStudents ? (
                    <div className="flex items-center justify-center gap-3 py-16">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                        <p className="text-sm font-bold text-base-content/50">Đang tải danh sách học viên...</p>
                    </div>
                ) : studentsError ? (
                    <div className="py-16 text-center">
                        <AlertCircle className="mx-auto mb-2 h-10 w-10 text-red-500" />
                        <p className="text-sm font-bold text-base-content">{studentsError}</p>
                    </div>
                ) : filteredEnrollments.length === 0 ? (
                    <div className="py-16 text-center">
                        <UserX className="mx-auto mb-2 h-10 w-10 text-base-content/15" />
                        <p className="text-sm font-bold text-base-content/50">Không tìm thấy học viên nào</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="bg-base-200/40">
                                        {tableColumns.map((column) => (
                                            <th key={column.label} className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-base-content/45">
                                                {column.key ? (
                                                    <button type="button" onClick={() => onSort(column.key)} className="flex items-center gap-1 transition-colors hover:text-violet-600">
                                                        {column.icon && <column.icon className="h-3 w-3" />}
                                                        {column.label}
                                                        <SortIcon active={sortField === column.key} direction={sortDirection} />
                                                    </button>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        {column.icon && <column.icon className="h-3 w-3" />}
                                                        {column.label}
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEnrollments.map((enrollment, index) => {
                                        const status = enrollmentStatusConfig[enrollment.status] || enrollmentStatusConfig.active;

                                        return (
                                            <motion.tr
                                                key={enrollment.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="border-b border-base-200/50 transition-colors hover:bg-base-200/30 last:border-b-0"
                                            >
                                                <td className="px-3 py-2.5">
                                                    <span className="rounded bg-violet-500/8 px-1.5 py-0.5 text-[10px] font-bold text-violet-600">{enrollment.id}</span>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-black text-white">
                                                            {enrollment.fullName?.charAt(0) || '?'}
                                                        </div>
                                                        <span className="text-xs font-bold text-base-content">{enrollment.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5"><span className="text-[11px] text-base-content/55">{enrollment.email || '--'}</span></td>
                                                <td className="px-3 py-2.5"><span className="text-[11px] text-base-content/55">{enrollment.mobile || '--'}</span></td>
                                                <td className="px-3 py-2.5">
                                                    <span className="text-[11px] text-base-content/55">
                                                        {enrollment.date
                                                            ? new Date(enrollment.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                            : '--'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    {Number(enrollment.cost) > 0 ? (
                                                        <span className="text-[11px] font-black text-emerald-600">{Number(enrollment.cost).toLocaleString('vi-VN')}đ</span>
                                                    ) : <span className="text-[11px] font-bold text-base-content/30">Free</span>}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-base-200">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    enrollment.progress > 70
                                                                        ? 'bg-emerald-500'
                                                                        : enrollment.progress > 30
                                                                            ? 'bg-violet-500'
                                                                            : 'bg-amber-500'
                                                                }`}
                                                                style={{ width: `${enrollment.progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-6 text-[10px] font-bold text-base-content/45">{enrollment.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between border-t border-base-300 px-4 py-3">
                            <p className="text-xs text-base-content/40">
                                Hiển thị <span className="font-black text-base-content">{filteredEnrollments.length}</span> / {totalEnrollments} học viên
                            </p>
                            <div className="flex items-center gap-2">
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page <= 1}
                                            className="btn btn-xs btn-ghost rounded-lg font-bold disabled:text-base-content/25"
                                        >
                                            Trước
                                        </button>
                                        <span className="text-[11px] font-bold text-base-content/45">
                                            Trang {page}/{totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                                            disabled={page >= totalPages}
                                            className="btn btn-xs btn-ghost rounded-lg font-bold disabled:text-base-content/25"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={onExport}
                                    disabled={exportingCsv}
                                    className="btn btn-xs btn-ghost gap-1 rounded-lg font-bold text-base-content/50 disabled:text-base-content/25"
                                >
                                    {exportingCsv ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                                    Xuất CSV
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

export default function AnalyticsDashboard({ course, onBack }) {
    const {
        loading,
        error,
        loadingStudents,
        studentsError,
        dashboard,
        chartPeriod,
        setChartPeriod,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        sortField,
        sortDirection,
        handleSort,
        filteredEnrollments,
        studentCount,
        chapterCount,
        lessonCount,
        overview,
        page,
        setPage,
        exportingCsv,
        handleExportCsv,
    } = useExpertAnalyticsDashboard(course);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                <span className="ml-3 font-bold text-base-content/50">Đang tải dashboard...</span>
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-base-100 p-10 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                <p className="font-bold text-base-content">{error || 'Không thể dựng dashboard cho khóa học này.'}</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
        >
            <HeroBanner
                course={course}
                chapterCount={chapterCount}
                lessonCount={lessonCount}
                studentCount={studentCount}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onBack={onBack}
            />

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <OverviewTab
                        overview={overview}
                        chartPeriod={chartPeriod}
                        setChartPeriod={setChartPeriod}
                        studentCount={studentCount}
                    />
                ) : (
                    <StudentsTab
                        quickStats={overview.quickStudentStats}
                        filteredEnrollments={filteredEnrollments}
                        totalEnrollments={dashboard.pagination?.totalItems || dashboard.summary?.totalEnrollments || filteredEnrollments.length}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        loadingStudents={loadingStudents}
                        studentsError={studentsError}
                        page={page}
                        totalPages={dashboard.pagination?.totalPages || 1}
                        setPage={setPage}
                        onExport={handleExportCsv}
                        exportingCsv={exportingCsv}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
