import { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as motion from 'motion/react-client';
import {
    Search,
    Bell,
    Star,
    ArrowLeft,
    BookOpen,
    Users,
    CheckCircle2,
    Frown,
    Loader2
} from 'lucide-react';

import { DashboardSidebar } from '../components/learner';
import {
    CourseDetailInfo,
    CourseDetailCurriculum,
    CourseDetailSidebar
} from '../components/courses';
import { subjectApi } from '../api';

// ─── Map API data to component format ──────────────────────

const mapApiToCourse = (subject) => ({
    id: subject.subjectId,
    subjectId: subject.subjectId,
    title: subject.subjectName,
    subjectName: subject.subjectName,
    description: subject.subjectDescription,
    category: subject.subjectName?.split(' ')[0] || 'Khác',
    isFree: subject.isFree,
    priceAmount: subject.priceAmount,
    originalPrice: subject.originalPrice,
    discountPercent: subject.discountPercent,
    ratingAverage: subject.ratingAverage,
    ratingCount: subject.ratingCount,
    purchaseCount: subject.purchaseCount,
    totalChapters: subject.totalChapters,
    totalLessons: subject.totalLessons,
    totalVideos: subject.totalVideos,
    totalDocuments: subject.totalDocuments,
    totalQuestions: subject.totalQuestions,
    estimatedDurationHours: subject.estimatedDurationHours,
    level: 'Cơ bản',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    icon: '📚',
    tags: [],
    bannerUrl: subject.subjectBannerUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=500&fit=crop',
    visibility: subject.status === 'published' ? 'public' : 'draft',
    isPurchased: false,
    publishedAt: subject.publishedAt,
    chapters: subject.chapters || [],
});

const mapApiToExpert = (creator) => {
    if (!creator) return null;
    return {
        id: creator.userId,
        userId: creator.userId,
        name: creator.displayName || creator.fullName || 'Chuyên gia',
        displayName: creator.displayName,
        fullName: creator.fullName,
        avatar: creator.avatarUrl || 'https://i.pravatar.cc/150?img=11',
        verified: true,
    };
};

// ─── Mock Reviews (static for now) ──────────────────────────

const mockReviews = [
    { name: 'Nguyễn Thảo Linh', avatar: 'https://i.pravatar.cc/150?img=25', rating: 5, date: '2 ngày trước', content: 'Khóa học rất hay và dễ hiểu! Giảng viên giải thích rất chi tiết, bài tập thực hành phong phú.' },
    { name: 'Trần Minh Đức', avatar: 'https://i.pravatar.cc/150?img=14', rating: 5, date: '1 tuần trước', content: 'Nội dung bám sát thực tế, rất hữu ích cho công việc. Flashcard giúp ôn tập hiệu quả!' },
    { name: 'Lê Phương Anh', avatar: 'https://i.pravatar.cc/150?img=45', rating: 4, date: '2 tuần trước', content: 'Chất lượng tốt, video rõ ràng. Mong có thêm bài tập nâng cao.' },
];

// ─── Page Component ─────────────────────────────────────

export default function CourseDetail() {
    const { id } = useParams();
    const [subject, setSubject] = useState(null);
    const [allSubjects, setAllSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch subject detail and all subjects for related courses
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch current subject detail
                const detailRes = await subjectApi.getById(id);
                const subjectData = detailRes.data?.data || detailRes.data;
                setSubject(mapApiToCourse(subjectData));

                // Fetch all subjects for related courses
                const allRes = await subjectApi.getAll({ limit: 100 });
                const items = allRes.data?.items || allRes.data || [];
                setAllSubjects(items.map(mapApiToCourse));
            } catch (err) {
                console.error('Error fetching subject:', err);
                setError(err.message || 'Không thể tải thông tin môn học');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const course = subject;
    const expert = course ? mapApiToExpert(subject?.creator || allSubjects.find(s => s.subjectId === subject?.subjectId)?.creator) : null;

    // Map chapters from API
    const chapters = useMemo(() => {
        if (!course || !subject?.chapters) return [];
        return subject.chapters.map(ch => ({
            title: ch.chapterName,
            chapterNumber: ch.chapterNumber,
            lessons: (ch.lessons || []).map(ls => ({
                title: ls.lessonName,
                lessonNumber: ls.lessonNumber,
                type: 'video', // Default type
                durationMinutes: ls.estimatedDurationMinutes || 20,
                isPreview: ls.displayOrder === 1,
            })),
            gradient: course.gradient,
        }));
    }, [course, subject]);

    // Get related courses
    const relatedCourses = useMemo(() => {
        if (!course) return [];
        return allSubjects
            .filter(c => c.subjectId !== course.subjectId)
            .slice(0, 3);
    }, [course, allSubjects]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
        },
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex h-screen bg-base-200 overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-sm text-base-content/50 font-medium">Đang tải thông tin môn học...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !course) {
        return (
            <div className="flex h-screen bg-base-200 overflow-hidden">
                <DashboardSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DetailPageHeader courseName={null} />
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center mb-5">
                                <Frown className="w-8 h-8 text-base-content/30" />
                            </div>
                            <h2 className="text-xl font-black text-base-content mb-2">Không tìm thấy môn học</h2>
                            <p className="text-sm text-base-content/50 font-medium mb-5">
                                {error || 'Môn học này không tồn tại hoặc đã bị xóa.'}
                            </p>
                            <Link to="/courses">
                                <button className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold">
                                    Xem tất cả môn học
                                </button>
                            </Link>
                        </motion.div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <DetailPageHeader courseName={course.title} />

                {/* Content */}
                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Back button */}
                    <motion.div variants={cardVariants} className="mb-4">
                        <Link
                            to="/courses"
                            className="inline-flex items-center gap-2 text-sm font-bold text-base-content/50 hover:text-base-content transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách
                        </Link>
                    </motion.div>

                    {/* Main layout: Content + Sidebar */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left: Info + Curriculum */}
                        <div className="flex-1 min-w-0">
                            <CourseDetailInfo
                                course={course}
                                expert={expert}
                                variants={cardVariants}
                            />

                            {/* Curriculum */}
                            <div className="mt-6">
                                <CourseDetailCurriculum
                                    chapters={chapters}
                                    isPurchased={course.isPurchased}
                                    variants={cardVariants}
                                />
                            </div>

                            {/* Reviews preview */}
                            <motion.div variants={cardVariants} className="mt-6">
                                <h3 className="text-base font-black text-base-content mb-3">Đánh giá từ học viên</h3>
                                <div className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-center">
                                            <p className="text-4xl font-black text-base-content">{course.ratingAverage || '0'}</p>
                                            <div className="flex items-center gap-0.5 my-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.round(course.ratingAverage || 0) ? 'fill-orange-500 text-orange-500' : 'text-base-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-base-content/50 font-bold">{course.ratingCount || 0} đánh giá</p>
                                        </div>
                                        {/* Rating bars */}
                                        <div className="flex-1 space-y-1.5">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const pct = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 2 : 1;
                                                return (
                                                    <div key={star} className="flex items-center gap-2 text-xs">
                                                        <span className="w-3 text-right font-bold text-base-content/50">{star}</span>
                                                        <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                                        <div className="flex-1 h-2 rounded-full bg-base-200 overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ duration: 0.8, delay: 0.5 + star * 0.1 }}
                                                                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                                                            />
                                                        </div>
                                                        <span className="w-8 text-right font-bold text-base-content/40">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Sample reviews */}
                                    <div className="space-y-3 border-t border-base-200 pt-4">
                                        {mockReviews.slice(0, 3).map((review, i) => (
                                            <div key={i} className="flex gap-3">
                                                <img
                                                    src={review.avatar}
                                                    alt={review.name}
                                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-xs font-bold text-base-content">{review.name}</span>
                                                        <div className="flex">
                                                            {Array.from({ length: review.rating }).map((_, j) => (
                                                                <Star key={j} className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] text-base-content/40 font-medium">{review.date}</span>
                                                    </div>
                                                    <p className="text-xs text-base-content/60 font-medium">{review.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Related courses */}
                            {relatedCourses.length > 0 && (
                                <motion.div variants={cardVariants} className="mt-6 mb-4">
                                    <h3 className="text-base font-black text-base-content mb-3">Môn học liên quan</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {relatedCourses.map(related => {
                                            const relatedExpert = mapApiToExpert(related.creator);
                                            return (
                                                <Link key={related.id} to={`/courses/${related.subjectId}`}>
                                                    <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                                        <div className="relative h-28 overflow-hidden">
                                                            <img src={related.bannerUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=500&fit=crop'; }} />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-base-100 to-transparent opacity-60" />
                                                            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md bg-gradient-to-r ${related.gradient} text-white text-[10px] font-bold shadow`}>
                                                                {related.icon} {related.category}
                                                            </span>
                                                        </div>
                                                        <div className="p-3">
                                                            <h4 className="text-xs font-black text-base-content line-clamp-2 mb-1">{related.title}</h4>
                                                            <div className="flex items-center justify-between text-[10px] text-base-content/50">
                                                                <span className="flex items-center gap-0.5">
                                                                    <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" /> {related.ratingAverage || 0}
                                                                </span>
                                                                <span className="font-black text-base-content">
                                                                    {related.isFree ? 'Miễn phí' : (related.priceAmount || 0).toLocaleString('vi-VN') + '₫'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Right: Sticky Sidebar */}
                        <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-0 lg:self-start">
                                <CourseDetailSidebar
                                    course={course}
                                    isPurchased={course.isPurchased}
                                    variants={cardVariants}
                                />
                        </div>
                    </div>
                </motion.main>
            </div>
        </div>
    );
}

// ─── Header ─────────────────────────────────────────────

function DetailPageHeader({ courseName }) {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-b border-base-300 px-8 py-4"
        >
            <div className="flex items-center justify-between">
                <div className="min-w-0">
                    <h2 className="text-2xl font-black text-base-content truncate">Chi tiết môn học</h2>
                    <p className="text-sm text-base-content/60 font-medium truncate">
                        {courseName || 'Đang tải...'}
                    </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="relative hidden lg:block">
                        <input
                            type="text"
                            placeholder="Tìm môn học, flashcard, bài thi..."
                            className="input input-bordered w-96 pl-10 rounded-full bg-base-200 border-base-300 focus:border-blue-500"
                        />
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>

                    <div className="indicator">
                        <span className="indicator-item badge badge-sm badge-primary">3</span>
                        <button className="btn btn-circle btn-ghost">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-base-300">
                        <div className="text-right">
                            <p className="font-bold text-sm text-base-content">Đoàn Thế Anh</p>
                            <div className="flex items-center justify-end gap-1">
                                <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                <p className="text-xs text-orange-500 font-bold">Premium User</p>
                            </div>
                        </div>
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full ring ring-blue-500 ring-offset-2 ring-offset-base-100">
                                <img src="https://i.pravatar.cc/150?img=33" alt="User" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
