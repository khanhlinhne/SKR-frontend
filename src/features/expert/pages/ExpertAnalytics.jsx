import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import courseApi from '@/shared/api/courseApi';
import { OwlLoader } from '@/shared/ui/common';
import {
    ArrowLeft,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    DollarSign,
    Download,
    Eye,
    FolderOpen,
    GraduationCap,
    Hash,
    Hourglass,
    Layers,
    Loader2,
    Mail,
    Pencil,
    Phone,
    RefreshCw,
    Search,
    ShieldCheck,
    Star,
    TrendingUp,
    Users,
    UserCheck,
    UserX,
    XCircle,
    AlertCircle,
    Zap,
    Target,
    Activity,
} from 'lucide-react';

// ===== ANIMATION =====
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ===== SVG SPARKLINE COMPONENT =====
function Sparkline({ data, color = '#8b5cf6', height = 32, width = 80 }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <svg width={width} height={height} className="flex-shrink-0">
            <defs>
                <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#spark-${color.replace('#', '')})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ===== DONUT CHART =====
function DonutChart({ value, size = 80, strokeWidth = 8, color = '#8b5cf6', label }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor"
                    strokeWidth={strokeWidth} className="text-base-300" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
                    strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-black text-base-content">{value}%</span>
                {label && <span className="text-[8px] font-bold text-base-content/40 uppercase">{label}</span>}
            </div>
        </div>
    );
}

// ===== BAR CHART (CSS) =====
function BarChartCSS({ data, barColor = 'from-violet-500 to-fuchsia-500', height = 160 }) {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div className="flex items-end gap-1.5" style={{ height }}>
            {data.map((item, i) => {
                const h = Math.max(4, (item.value / (max * 1.15)) * (height - 20));
                const isMax = item.value === max;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-base-content text-base-100 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {item.value.toLocaleString()} {item.suffix || ''}
                        </div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: h }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className={`w-full rounded-lg transition-colors cursor-pointer ${isMax
                                ? `bg-gradient-to-t ${barColor} shadow-md`
                                : 'bg-violet-500/20 group-hover:bg-violet-500/40'
                            }`}
                        />
                        <span className="text-[9px] text-base-content/40 font-bold">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ===== MOCK DATA GENERATORS =====
function generateMockDashboard(course) {
    const studentCount = course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0;
    const price = course.priceAmount || 0;

    // Revenue sparkline (12 weeks)
    const revSparkline = Array.from({ length: 12 }, () => Math.floor(Math.random() * price * 15 + price * 5));
    // Student sparkline (12 weeks)
    const stdSparkline = Array.from({ length: 12 }, (_, i) => Math.floor(studentCount * 0.3 + Math.random() * studentCount * 0.1 * i));
    // Weekly enrollment
    const weekLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const weeklyEnrollments = weekLabels.map(label => ({
        label,
        value: Math.floor(Math.random() * 30 + 5),
    }));
    // Monthly enrollment (12 months)
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const monthlyEnrollments = months.map(label => ({
        label,
        value: Math.floor(Math.random() * 80 + 20),
    }));

    // Daily activity in a week
    const weeklyActivity = weekLabels.map(label => ({
        label,
        value: Math.floor(Math.random() * 80 + 10),
        suffix: ' lượt',
    }));

    // lesson progress
    const lessonNames = [
        'Giới thiệu khóa học', 'Setup môi trường', 'Kiến thức nền tảng',
        'Bài thực hành 1', 'Lý thuyết nâng cao', 'Design Patterns',
        'Project thực tế', 'Tối ưu hóa', 'Testing', 'Dự án cuối khóa',
    ];
    const lessonProgress = lessonNames.map((name, i) => ({
        name,
        studentsAtLesson: Math.max(0, Math.floor(studentCount * (1 - i * 0.08) * (0.8 + Math.random() * 0.2))),
        completionRate: Math.max(5, Math.floor(95 - i * 8 + Math.random() * 10)),
        dropRate: Math.floor(Math.random() * 15 + (i > 5 ? 10 : 2)),
    }));

    // Enrollments table
    const names = [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức',
        'Hoàng Thu Hà', 'Vũ Quang Huy', 'Đặng Thị Kim', 'Bùi Văn Long',
        'Ngô Thị Mai', 'Đinh Quốc Nam', 'Lý Thái Phong', 'Hồ Thị Quỳnh',
        'Trịnh Văn Sơn', 'Dương Thị Trang', 'Phan Anh Tuấn', 'Mai Thị Uyên',
    ];
    const statuses = ['active', 'active', 'active', 'active', 'completed', 'completed', 'expired', 'pending'];
    const enrollments = [];
    const count = Math.max(studentCount, 5);
    for (let i = 0; i < count; i++) {
        const daysAgo = Math.floor(Math.random() * 90);
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        enrollments.push({
            id: `ENR-${String(1000 + i).slice(-4)}`,
            fullName: names[i % names.length],
            email: `user${i + 1}@example.com`,
            mobile: `0${9e8 + Math.floor(Math.random() * 1e8)}`.slice(0, 10),
            date: date.toISOString(),
            cost: price,
            status: statuses[i % statuses.length],
            progress: Math.floor(Math.random() * 100),
        });
    }

    return {
        stats: {
            totalRevenue: price * studentCount,
            revenueChange: '+12.5%',
            revSparkline,
            newStudentsWeek: Math.floor(studentCount * 0.1),
            newStudentsToday: Math.floor(studentCount * 0.02),
            stdSparkline,
            completionRate: Math.floor(40 + Math.random() * 40),
            avgStudyTime: (Math.random() * 20 + 10).toFixed(1),
            lessonsViewed: Math.floor(studentCount * 3.5),
            avgRating: (3.5 + Math.random() * 1.5).toFixed(1),
        },
        weeklyEnrollments,
        monthlyEnrollments,
        weeklyActivity,
        lessonProgress,
        enrollments,
    };
}

// ===== STATUS CONFIG =====
const enrollmentStatusConfig = {
    active: { label: 'Đang học', color: 'text-emerald-700 bg-emerald-500/10', icon: CheckCircle2 },
    completed: { label: 'Hoàn thành', color: 'text-blue-700 bg-blue-500/10', icon: ShieldCheck },
    expired: { label: 'Hết hạn', color: 'text-red-600 bg-red-500/10', icon: XCircle },
    pending: { label: 'Chờ duyệt', color: 'text-amber-700 bg-amber-500/10', icon: Hourglass },
};

// ===== COURSE ROW =====
function CourseRow({ course, onViewDetail }) {
    const navigate = useNavigate();
    const chapterCount = course._count?.chapters || course.chaptersCount || 0;
    const lessonCount = course._count?.lessons || course.lessonsCount || 0;
    const studentCount = course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-base-100 rounded-2xl border border-base-300 shadow-sm hover:shadow-lg transition-all duration-300 p-4 flex items-center gap-4 group"
        >
            <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
                {course.courseBannerUrl ? (
                    <img src={course.courseBannerUrl} alt={course.courseName} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-purple-600/20 flex items-center justify-center">
                        <GraduationCap className="w-7 h-7 text-violet-500/40" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-black text-base-content text-sm leading-tight truncate">{course.courseName}</h3>
                {course.courseCode && <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mt-0.5">{course.courseCode}</p>}
                <div className="flex items-center gap-4 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-base-content/50"><Layers className="w-3 h-3 text-violet-500" /><span className="font-bold">{chapterCount}</span> chương</span>
                    <span className="flex items-center gap-1 text-xs text-base-content/50"><BookOpen className="w-3 h-3 text-blue-500" /><span className="font-bold">{lessonCount}</span> bài</span>
                    <span className="flex items-center gap-1 text-xs text-base-content/50"><Users className="w-3 h-3 text-emerald-500" /><span className="font-bold">{studentCount}</span> HV</span>
                </div>
            </div>
            <div className="text-right flex-shrink-0 hidden sm:block">
                {course.priceAmount > 0 ? (
                    <span className="text-sm font-black text-emerald-600">{Number(course.priceAmount).toLocaleString('vi-VN')}đ</span>
                ) : <span className="badge badge-sm badge-ghost font-bold">Miễn phí</span>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => onViewDetail(course)}
                    className="flex items-center gap-0 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow-lg shadow-violet-500/20 px-2.5 overflow-hidden transition-all duration-300 group/btn hover:gap-1.5 hover:px-3.5 cursor-pointer">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover/btn:max-w-[8rem]">DS đăng ký</span>
                </button>
                <button onClick={() => navigate(`/expert/curriculum/${course.courseId || course.id}`)}
                    className="flex items-center gap-0 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 px-2.5 overflow-hidden transition-all duration-300 group/btn2 hover:gap-1.5 hover:px-3.5 cursor-pointer">
                    <Pencil className="w-4 h-4 flex-shrink-0" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover/btn2:max-w-[8rem]">Nội dung</span>
                </button>
            </div>
        </motion.div>
    );
}

// ===== ANALYTICS DASHBOARD =====
function AnalyticsDashboard({ course, onBack }) {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState('week');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [activeTab, setActiveTab] = useState('overview'); // overview | students

    const studentCount = course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0;
    const chapterCount = course._count?.chapters || course.chaptersCount || 0;
    const lessonCount = course._count?.lessons || course.lessonsCount || 0;

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setDashboard(generateMockDashboard(course));
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [course]);

    // Filtered enrollments
    const filtered = useMemo(() => {
        if (!dashboard) return [];
        let list = dashboard.enrollments.filter(e => {
            const matchSearch = !searchTerm ||
                e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'all' || e.status === statusFilter;
            return matchSearch && matchStatus;
        });
        list.sort((a, b) => {
            let vA, vB;
            if (sortField === 'date') { vA = new Date(a.date); vB = new Date(b.date); }
            else if (sortField === 'cost') { vA = a.cost; vB = b.cost; }
            else if (sortField === 'name') { vA = a.fullName; vB = b.fullName; }
            else { vA = a.id; vB = b.id; }
            if (vA < vB) return sortDirection === 'asc' ? -1 : 1;
            if (vA > vB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [dashboard, searchTerm, statusFilter, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDirection('desc'); }
    };
    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
        return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-violet-500" /> : <ChevronDown className="w-3 h-3 text-violet-500" />;
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <span className="ml-3 font-bold text-base-content/50">Đang tải dashboard...</span>
        </div>
    );

    if (!dashboard) return null;
    const { stats, weeklyEnrollments, monthlyEnrollments, weeklyActivity, lessonProgress, enrollments } = dashboard;

    // Metric cards config
    const metricCards = [
        {
            label: 'Doanh thu tổng', value: stats.totalRevenue > 0 ? `${(stats.totalRevenue / 1e6).toFixed(1)}M` : '0đ',
            change: stats.revenueChange, trend: 'up', icon: DollarSign,
            gradient: 'from-emerald-500 to-teal-600', sparkData: stats.revSparkline, sparkColor: '#10b981',
        },
        {
            label: 'Học viên mới tuần này', value: stats.newStudentsWeek,
            change: `+${stats.newStudentsToday} hôm nay`, trend: 'up', icon: Users,
            gradient: 'from-blue-500 to-cyan-600', sparkData: stats.stdSparkline, sparkColor: '#3b82f6',
        },
        {
            label: 'Tỷ lệ hoàn thành', value: `${stats.completionRate}%`,
            change: '+3.2%', trend: 'up', icon: Target,
            gradient: 'from-violet-500 to-fuchsia-600', sparkData: null, sparkColor: null, donut: stats.completionRate,
        },
        {
            label: 'Thời gian học TB', value: `${stats.avgStudyTime} phút`,
            change: '+1.5 phút', trend: 'up', icon: Clock,
            gradient: 'from-amber-500 to-orange-600', sparkData: Array.from({ length: 12 }, () => Math.random() * 20 + 10), sparkColor: '#f59e0b',
        },
        {
            label: 'Bài học đã xem', value: stats.lessonsViewed.toLocaleString(),
            change: '+247', trend: 'up', icon: Eye,
            gradient: 'from-pink-500 to-rose-600', sparkData: Array.from({ length: 12 }, () => Math.random() * 300 + 100), sparkColor: '#ec4899',
        },
        {
            label: 'Rating trung bình', value: `${stats.avgRating} ★`,
            change: '+0.2', trend: 'up', icon: Star,
            gradient: 'from-yellow-500 to-amber-600', sparkData: null, sparkColor: null, rating: parseFloat(stats.avgRating),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
        >
            {/* Back + Course header */}
            <motion.button
                whileHover={{ x: -3 }}
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold text-base-content/60 hover:text-violet-600 transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách khóa học
            </motion.button>

            {/* Hero Banner */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden mb-6"
            >
                <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600 p-6">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-2 left-10 w-20 h-20 border-4 border-white rounded-full" />
                        <div className="absolute bottom-2 right-16 w-28 h-28 border-4 border-white rounded-full" />
                        <div className="absolute top-4 right-40 w-12 h-12 border-4 border-white rounded-lg rotate-45" />
                    </div>
                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 flex-shrink-0">
                                {course.courseBannerUrl ? (
                                    <img src={course.courseBannerUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                        <GraduationCap className="w-7 h-7 text-white/60" />
                                    </div>
                                )}
                            </div>
                            <div>
                                {course.courseCode && (
                                    <span className="text-[10px] font-black text-white/70 bg-white/10 px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-sm">
                                        {course.courseCode}
                                    </span>
                                )}
                                <h2 className="text-xl font-black text-white drop-shadow-lg mt-1">{course.courseName}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-white/70 flex items-center gap-1"><Layers className="w-3 h-3" />{chapterCount} chương</span>
                                    <span className="text-xs text-white/70 flex items-center gap-1"><BookOpen className="w-3 h-3" />{lessonCount} bài</span>
                                    <span className="text-xs text-white/70 flex items-center gap-1"><Users className="w-3 h-3" />{studentCount} HV</span>
                                </div>
                            </div>
                        </div>
                        {/* Tab switcher */}
                        <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
                            {[
                                { key: 'overview', label: 'Tổng quan', icon: BarChart3 },
                                { key: 'students', label: 'Học viên', icon: Users },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        activeTab === tab.key
                                            ? 'bg-white text-violet-700 shadow-md'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                    >
                        {/* ===== METRIC CARDS ===== */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {metricCards.map((card, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="bg-base-100 rounded-2xl p-4 shadow-lg border border-base-300 hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                                            <card.icon className="w-5 h-5 text-white" />
                                        </div>
                                        {card.sparkData && <Sparkline data={card.sparkData} color={card.sparkColor} />}
                                        {card.donut != null && <DonutChart value={card.donut} size={56} strokeWidth={6} color="#8b5cf6" />}
                                        {card.rating && (
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(card.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-base-300'}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-base-content/45 font-bold uppercase tracking-wider mb-0.5">{card.label}</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-xl font-black text-base-content">{card.value}</h3>
                                        <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                            card.trend === 'up' ? 'text-emerald-600 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                                        }`}>
                                            {card.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {card.change}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* ===== CHARTS ROW ===== */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Enrollment Trend Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-base font-black text-base-content flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-violet-500" />
                                            Số đăng ký mới
                                        </h3>
                                        <p className="text-xs text-base-content/45 mt-0.5">Xu hướng đăng ký theo thời gian</p>
                                    </div>
                                    <div className="flex gap-1 bg-base-200 rounded-lg p-0.5">
                                        {['week', 'month'].map(p => (
                                            <button key={p} onClick={() => setChartPeriod(p)}
                                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                                    chartPeriod === p ? 'bg-violet-600 text-white shadow-md' : 'text-base-content/50 hover:text-base-content'
                                                }`}
                                            >
                                                {p === 'week' ? 'Tuần' : 'Tháng'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <BarChartCSS
                                    data={chartPeriod === 'week' ? weeklyEnrollments : monthlyEnrollments}
                                    height={150}
                                />
                            </motion.div>

                            {/* Weekly Activity Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                            >
                                <div className="mb-5">
                                    <h3 className="text-base font-black text-base-content flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        Mức độ hoạt động
                                    </h3>
                                    <p className="text-xs text-base-content/45 mt-0.5">Số lượt thao tác của học viên theo các ngày trong tuần</p>
                                </div>
                                <BarChartCSS data={weeklyActivity} height={150} barColor="from-amber-500 to-orange-500" />
                            </motion.div>
                        </div>

                        {/* ===== LESSON PROGRESS & COMPLETION FUNNEL ===== */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                            {/* Lesson Progress */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300 lg:col-span-3"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-base font-black text-base-content flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-blue-500" />
                                            Tiến độ theo Bài giảng
                                        </h3>
                                        <p className="text-xs text-base-content/45 mt-0.5">% học viên hoàn thành từng bài</p>
                                    </div>
                                </div>
                                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                                    {lessonProgress.map((lesson, i) => {
                                        const isStuck = lesson.dropRate > 10;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 + i * 0.04 }}
                                                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                                                    isStuck ? 'border-red-500/20 bg-red-500/3' : 'border-base-300/60 hover:border-violet-500/20'
                                                }`}
                                            >
                                                <div className="w-7 text-center">
                                                    <span className="text-[10px] font-black text-base-content/30">{i + 1}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold text-base-content truncate">{lesson.name}</span>
                                                        {isStuck && (
                                                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                                                <AlertCircle className="w-2.5 h-2.5" />
                                                                Drop {lesson.dropRate}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${lesson.completionRate}%` }}
                                                            transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                                                            className={`h-full rounded-full ${
                                                                lesson.completionRate > 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                                                lesson.completionRate > 40 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' :
                                                                'bg-gradient-to-r from-amber-500 to-orange-500'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0 w-20">
                                                    <p className="text-xs font-black text-base-content">{lesson.completionRate}%</p>
                                                    <p className="text-[9px] text-base-content/35 font-bold">{lesson.studentsAtLesson} HV</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Completion Funnel */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300 lg:col-span-2"
                            >
                                <h3 className="text-base font-black text-base-content flex items-center gap-2 mb-5">
                                    <Target className="w-4 h-4 text-violet-500" />
                                    Phễu hoàn thành
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Đăng ký', pct: 100, count: studentCount, color: 'from-violet-500 to-violet-600' },
                                        { label: 'Bắt đầu học', pct: 85, count: Math.floor(studentCount * 0.85), color: 'from-blue-500 to-blue-600' },
                                        { label: 'Hoàn thành 50%', pct: 58, count: Math.floor(studentCount * 0.58), color: 'from-cyan-500 to-cyan-600' },
                                        { label: 'Hoàn thành 75%', pct: 35, count: Math.floor(studentCount * 0.35), color: 'from-amber-500 to-amber-600' },
                                        { label: 'Hoàn thành 100%', pct: stats.completionRate, count: Math.floor(studentCount * stats.completionRate / 100), color: 'from-emerald-500 to-emerald-600' },
                                    ].map((step, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.08 }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-base-content/60">{step.label}</span>
                                                <span className="text-[10px] font-black text-base-content">{step.count} ({step.pct}%)</span>
                                            </div>
                                            <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden"
                                                style={{ width: `${50 + step.pct * 0.5}%`, margin: '0 auto' }}
                                            >
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                                                    className={`h-full rounded-full bg-gradient-to-r ${step.color}`}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Rating breakdown */}
                                <div className="mt-6 pt-5 border-t border-base-300">
                                    <h4 className="text-xs font-black text-base-content mb-3 flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        Phân bố đánh giá
                                    </h4>
                                    <div className="space-y-1.5">
                                        {[
                                            { stars: 5, pct: 45 },
                                            { stars: 4, pct: 28 },
                                            { stars: 3, pct: 15 },
                                            { stars: 2, pct: 8 },
                                            { stars: 1, pct: 4 },
                                        ].map(r => (
                                            <div key={r.stars} className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-base-content/50 w-3">{r.stars}</span>
                                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                <div className="flex-1 bg-base-200 rounded-full h-1.5 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${r.pct}%` }}
                                                        transition={{ duration: 0.6, delay: 0.8 }}
                                                        className="h-full rounded-full bg-yellow-400"
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-base-content/40 w-7 text-right">{r.pct}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    /* ===== STUDENTS TAB ===== */
                    <motion.div
                        key="students"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                    >
                        {/* Quick stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                            {[
                                { icon: Users, label: 'Tổng đăng ký', value: enrollments.length, bg: 'bg-violet-500/10', color: 'text-violet-500' },
                                { icon: UserCheck, label: 'Đang học', value: enrollments.filter(e => e.status === 'active').length, bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
                                { icon: ShieldCheck, label: 'Hoàn thành', value: enrollments.filter(e => e.status === 'completed').length, bg: 'bg-blue-500/10', color: 'text-blue-500' },
                                { icon: DollarSign, label: 'Doanh thu', value: stats.totalRevenue > 0 ? `${(stats.totalRevenue / 1e6).toFixed(1)}M` : '0đ', bg: 'bg-amber-500/10', color: 'text-amber-500' },
                            ].map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="bg-base-100 rounded-xl p-3 border border-base-300 flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                                        <s.icon className={`w-4 h-4 ${s.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-base-content leading-none">{s.value}</p>
                                        <p className="text-[9px] font-bold text-base-content/40 uppercase tracking-wider">{s.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-base-100 rounded-2xl border border-base-300 shadow-lg"
                        >
                            {/* Toolbar */}
                            <div className="p-4 border-b border-base-300">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="text-sm font-black text-base-content flex items-center gap-2">
                                        <Users className="w-4 h-4 text-violet-500" />
                                        Danh sách học viên
                                        <span className="badge badge-sm badge-primary font-bold">{filtered.length}</span>
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/30" />
                                            <input type="text" placeholder="Tìm theo tên, email, ID..."
                                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                                className="input input-bordered input-sm pl-8 rounded-xl font-medium text-xs w-52" />
                                        </div>
                                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                            className="select select-bordered select-sm rounded-xl font-bold text-xs">
                                            <option value="all">Tất cả</option>
                                            <option value="active">Đang học</option>
                                            <option value="completed">Hoàn thành</option>
                                            <option value="expired">Hết hạn</option>
                                            <option value="pending">Chờ duyệt</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {filtered.length === 0 ? (
                                <div className="text-center py-16">
                                    <UserX className="w-10 h-10 mx-auto text-base-content/15 mb-2" />
                                    <p className="text-sm font-bold text-base-content/50">Không tìm thấy học viên nào</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr className="bg-base-200/40">
                                                {[
                                                    { key: 'id', label: 'ID', icon: Hash },
                                                    { key: 'name', label: 'Full Name', icon: null },
                                                    { key: null, label: 'Email', icon: Mail },
                                                    { key: null, label: 'Mobile', icon: Phone },
                                                    { key: 'date', label: 'Date', icon: CalendarDays },
                                                    { key: 'cost', label: 'Cost', icon: DollarSign },
                                                    { key: null, label: 'Progress', icon: null },
                                                    { key: null, label: 'Status', icon: null },
                                                ].map((col, ci) => (
                                                    <th key={ci} className="text-[10px] font-black uppercase tracking-wider text-base-content/45 py-3 px-3">
                                                        {col.key ? (
                                                            <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                                                                {col.icon && <col.icon className="w-3 h-3" />} {col.label}
                                                                <SortIcon field={col.key} />
                                                            </button>
                                                        ) : (
                                                            <span className="flex items-center gap-1">
                                                                {col.icon && <col.icon className="w-3 h-3" />} {col.label}
                                                            </span>
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((e, idx) => {
                                                const st = enrollmentStatusConfig[e.status] || enrollmentStatusConfig.active;
                                                const StIcon = st.icon;
                                                return (
                                                    <motion.tr key={e.id}
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.02 }}
                                                        className="hover:bg-base-200/30 transition-colors border-b border-base-200/50 last:border-b-0">
                                                        <td className="py-2.5 px-3">
                                                            <span className="text-[10px] font-bold text-violet-600 bg-violet-500/8 px-1.5 py-0.5 rounded">{e.id}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-[10px] font-black">
                                                                    {e.fullName.charAt(0)}
                                                                </div>
                                                                <span className="text-xs font-bold text-base-content">{e.fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3"><span className="text-[11px] text-base-content/55">{e.email}</span></td>
                                                        <td className="py-2.5 px-3"><span className="text-[11px] text-base-content/55">{e.mobile}</span></td>
                                                        <td className="py-2.5 px-3">
                                                            <span className="text-[11px] text-base-content/55">
                                                                {new Date(e.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            {e.cost > 0 ? (
                                                                <span className="text-[11px] font-black text-emerald-600">{Number(e.cost).toLocaleString('vi-VN')}đ</span>
                                                            ) : <span className="text-[11px] text-base-content/30 font-bold">Free</span>}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-12 bg-base-200 rounded-full h-1.5 overflow-hidden">
                                                                    <div className={`h-full rounded-full ${
                                                                        e.progress > 70 ? 'bg-emerald-500' : e.progress > 30 ? 'bg-violet-500' : 'bg-amber-500'
                                                                    }`} style={{ width: `${e.progress}%` }} />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-base-content/45 w-6">{e.progress}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${st.color}`}>
                                                                <StIcon className="w-3 h-3" />{st.label}
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {filtered.length > 0 && (
                                <div className="px-4 py-3 border-t border-base-300 flex items-center justify-between">
                                    <p className="text-xs text-base-content/40">
                                        Hiển thị <span className="font-black text-base-content">{filtered.length}</span> / {enrollments.length} học viên
                                    </p>
                                    <button className="btn btn-xs rounded-lg btn-ghost font-bold text-base-content/50 gap-1">
                                        <Download className="w-3 h-3" />Xuất CSV
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ===== MAIN COMPONENT =====
export default function ExpertAnalytics() {
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = storedUser.userId || storedUser.id || storedUser.user_id;
            if (!userId) { setCourses([]); setLoading(false); return; }

            const res = await courseApi.getAll({ limit: 50, creatorId: userId, admin: true });
            const data = res?.data?.courses || res?.data?.items || res?.data || res?.courses || res?.items || [];
            const list = Array.isArray(data) ? data : [];
            setCourses(list);

            // Auto-select course if navigated with courseId in state
            const targetId = location.state?.courseId;
            if (targetId && list.length > 0) {
                const found = list.find(c => (c.courseId || c.id) === targetId);
                if (found) setSelectedCourse(found);
            }
        } catch (err) {
            console.error('[ExpertAnalytics] fetch error:', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách khóa học.');
        } finally {
            setLoading(false);
        }
    }, [location.state?.courseId]);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    const filteredCourses = useMemo(() => {
        if (!searchTerm) return courses;
        const q = searchTerm.toLowerCase();
        return courses.filter(c =>
            c.courseName?.toLowerCase().includes(q) ||
            c.courseCode?.toLowerCase().includes(q)
        );
    }, [courses, searchTerm]);

    const overallStats = useMemo(() => ({
        totalCourses: courses.length,
        totalStudents: courses.reduce((s, c) => s + (c._count?.enrollments || c.enrollmentsCount || c.purchaseCount || 0), 0),
        published: courses.filter(c => c.status === 'published').length,
        totalRevenue: courses.reduce((s, c) => {
            const p = c.priceAmount || 0;
            const st = c._count?.enrollments || c.enrollmentsCount || c.purchaseCount || 0;
            return s + (p * st);
        }, 0),
    }), [courses]);

    return (
        <ExpertLayout>
            <AnimatePresence mode="wait">
                {selectedCourse ? (
                    <AnalyticsDashboard
                        key="dashboard"
                        course={selectedCourse}
                        onBack={() => setSelectedCourse(null)}
                    />
                ) : (
                    <motion.div
                        key="list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {/* Header */}
                        <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                                    <BarChart3 className="w-8 h-8 text-violet-500" />
                                    Dữ liệu & Thống kê
                                </h1>
                                <p className="text-sm text-base-content/60 mt-1">Xem danh sách khóa học và quản lý đăng ký học viên</p>
                            </div>
                            <button onClick={fetchCourses} className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5" disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Làm mới
                            </button>
                        </motion.div>

                        {/* Overall Stats */}
                        <motion.div variants={cardVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Khóa học', value: overallStats.totalCourses, icon: GraduationCap, gradient: 'from-violet-500 to-fuchsia-600' },
                                { label: 'Tổng học viên', value: overallStats.totalStudents, icon: Users, gradient: 'from-blue-500 to-cyan-600' },
                                { label: 'Đã xuất bản', value: overallStats.published, icon: Eye, gradient: 'from-emerald-500 to-teal-600' },
                                { label: 'Doanh thu ước tính', value: overallStats.totalRevenue > 0 ? `${(overallStats.totalRevenue / 1e6).toFixed(1)}M` : '0đ', icon: TrendingUp, gradient: 'from-amber-500 to-orange-600' },
                            ].map((stat, i) => (
                                <motion.div key={i} variants={cardVariants} className="bg-base-100 rounded-2xl p-5 shadow-lg border border-base-300">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg mb-3`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-base-content">{stat.value}</h3>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Search bar */}
                        <motion.div variants={cardVariants} className="mb-5">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                                <input type="text" placeholder="Tìm khóa học theo tên hoặc mã..."
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input input-bordered w-full pl-10 rounded-xl font-medium text-sm h-11" />
                            </div>
                        </motion.div>

                        {/* Course list */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <OwlLoader message="Đang tải danh sách khóa học..." subMessage="SKR đang lấy dữ liệu thống kê." className="py-8" />
                            </div>
                        ) : error ? (
                            <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl border border-red-500/20 p-12 text-center">
                                <AlertCircle className="w-10 h-10 mx-auto text-red-500 mb-3" />
                                <h3 className="text-lg font-black text-base-content mb-2">Lỗi tải dữ liệu</h3>
                                <p className="text-sm text-base-content/50 mb-4">{error}</p>
                                <button onClick={fetchCourses} className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5">
                                    <RefreshCw className="w-4 h-4" />Thử lại
                                </button>
                            </motion.div>
                        ) : filteredCourses.length === 0 ? (
                            <motion.div variants={cardVariants}>
                                <div className="bg-base-100 rounded-2xl border-2 border-dashed border-base-300 p-12 text-center">
                                    <FolderOpen className="w-10 h-10 mx-auto text-violet-500/50 mb-3" />
                                    <h3 className="text-lg font-black text-base-content mb-2">
                                        {searchTerm ? 'Không tìm thấy khóa học' : 'Chưa có khóa học nào'}
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        {searchTerm ? `Không trùng khớp với "${searchTerm}".` : 'Bạn chưa được phân công khóa học nào.'}
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div className="space-y-3" initial="hidden" animate="visible" variants={containerVariants}>
                                {filteredCourses.map(course => (
                                    <CourseRow key={course.courseId || course.id} course={course} onViewDetail={setSelectedCourse} />
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </ExpertLayout>
    );
}
