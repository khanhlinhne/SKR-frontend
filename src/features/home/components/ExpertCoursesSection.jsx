import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Gift, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subjectApi } from '@/shared/api';
import { OwlLoader } from '@/shared/ui/common';
import { CourseCard } from '@/features/courses/components';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop';

function mapApiToCourse(subject) {
    const priceAmount = Number(subject.priceAmount) || 0;

    return {
        id: subject.subjectId,
        subjectId: subject.subjectId,
        title: subject.subjectName,
        subjectName: subject.subjectName,
        description: subject.subjectDescription,
        category: subject.subjectName?.split(' ')[0] || 'Khác',
        isFree: subject.isFree || priceAmount === 0,
        priceAmount,
        originalPrice: Number(subject.originalPrice) || 0,
        discountPercent: Number(subject.discountPercent) || 0,
        ratingAverage: Number(subject.ratingAverage) || 0,
        ratingCount: Number(subject.ratingCount) || 0,
        purchaseCount: Number(subject.purchaseCount) || 0,
        totalChapters: Number(subject.totalChapters) || 0,
        totalLessons: Number(subject.totalLessons) || 0,
        totalVideos: Number(subject.totalVideos) || 0,
        totalDocuments: Number(subject.totalDocuments) || 0,
        totalQuestions: Number(subject.totalQuestions) || 0,
        estimatedDurationHours: Number(subject.estimatedDurationHours) || 0,
        level: 'Cơ bản',
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-500/10 to-cyan-500/10',
        icon: '📚',
        tags: [],
        bannerUrl: subject.subjectBannerUrl || DEFAULT_BANNER,
        visibility: subject.status === 'published' ? 'public' : 'draft',
        isPurchased: false,
        publishedAt: subject.publishedAt,
        creator: subject.creator,
    };
}

function mapApiToExpert(creator) {
    if (!creator) return null;

    return {
        id: creator.userId,
        userId: creator.userId,
        name: creator.displayName || creator.fullName || 'Chuyên gia',
        avatar: creator.avatarUrl || 'https://i.pravatar.cc/150?img=11',
        verified: true,
    };
}

const MOCK_DEMO_COURSE = {
    id: 1,
    subjectId: 1,
    title: 'Toán Cao Cấp - Giải Tích & Đại Số',
    subjectName: 'Toán Cao Cấp - Giải Tích & Đại Số',
    description: 'Khóa học toán cao cấp toàn diện dành cho sinh viên đại học.',
    category: 'Toán học',
    isFree: true,
    priceAmount: 0,
    originalPrice: 0,
    discountPercent: 0,
    ratingAverage: 4.9,
    ratingCount: 1248,
    purchaseCount: 3420,
    totalChapters: 12,
    totalLessons: 48,
    totalVideos: 36,
    totalDocuments: 8,
    totalQuestions: 120,
    estimatedDurationHours: 24,
    level: 'Cơ bản -> Nâng cao',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    icon: '📐',
    tags: ['Đạo hàm', 'Tích phân', 'Ma trận'],
    bannerUrl: DEFAULT_BANNER,
    visibility: 'public',
    isPurchased: false,
    publishedAt: '2024-01-15T00:00:00Z',
    creator: {
        userId: 'expert-1',
        displayName: 'TS. Nguyễn Văn Minh',
        fullName: 'TS. Nguyễn Văn Minh',
        avatarUrl: 'https://i.pravatar.cc/150?img=11',
    },
};

function SectionBlock({ title, icon, iconBg, courses, variants }) {
    if (!courses.length) return null;

    return (
        <section>
            <div className="mb-5 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg} text-white shadow-lg`}>
                    {icon}
                </div>
                <h3 className="text-2xl font-black tracking-tight text-base-content">{title}</h3>
            </div>

            <motion.div
                variants={variants.container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
                {courses.map((course) => (
                    <CourseCard
                        key={`${title}-${course.id}`}
                        course={course}
                        expert={mapApiToExpert(course.creator)}
                        variants={variants.card}
                    />
                ))}
            </motion.div>
        </section>
    );
}

export default function ExpertCoursesSection() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadCourses = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await subjectApi.getAll({
                    status: 'published',
                    limit: 100,
                    sortBy: 'purchaseCount',
                    sortOrder: 'desc',
                });

                const items = response.data?.items || response.data || [];
                const mapped = [MOCK_DEMO_COURSE, ...items.map(mapApiToCourse)];

                if (isMounted) {
                    const uniqueCourses = mapped.filter(
                        (course, index, arr) => arr.findIndex((item) => item.id === course.id) === index
                    );
                    setCourses(uniqueCourses);
                }
            } catch (fetchError) {
                console.error('Failed to load homepage courses:', fetchError);
                if (isMounted) {
                    setError('Chưa tải được danh sách môn học lúc này. Bạn có thể xem toàn bộ ở trang môn học.');
                    setCourses([MOCK_DEMO_COURSE]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void loadCourses();

        return () => {
            isMounted = false;
        };
    }, []);

    const topSellers = useMemo(
        () => [...courses].sort((a, b) => b.purchaseCount - a.purchaseCount).slice(0, 4),
        [courses]
    );

    const topRated = useMemo(
        () => [...courses]
            .filter((course) => course.ratingAverage > 0)
            .sort((a, b) => b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount)
            .slice(0, 4),
        [courses]
    );

    const freeCourses = useMemo(
        () => [...courses].filter((course) => course.isFree).sort((a, b) => b.purchaseCount - a.purchaseCount).slice(0, 4),
        [courses]
    );

    const variants = {
        container: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: { staggerChildren: 0.06, delayChildren: 0.08 },
            },
        },
        card: {
            hidden: { opacity: 0, y: 20 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
            },
        },
    };

    return (
        <section id="curriculum" className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-7xl space-y-10">
                {loading ? (
                    <div className="rounded-[32px] border border-base-300 bg-base-100 p-8 shadow-sm">
                        <OwlLoader
                            message="Đang tải các môn học nổi bật..."
                            subMessage="SKR đang lấy danh sách top bán chạy, top đánh giá cao và khóa học miễn phí."
                            className="py-8"
                        />
                    </div>
                ) : error ? (
                    <div className="rounded-[32px] border border-base-300 bg-base-100 p-8 shadow-sm">
                        <p className="text-xl font-semibold text-base-content">Chưa hiển thị được danh sách môn học</p>
                        <p className="mt-3 text-sm leading-7 text-base-content/60">{error}</p>
                        <Link
                            to="/courses"
                            className="mt-6 inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Xem tất cả môn học
                        </Link>
                    </div>
                ) : (
                    <>
                        <SectionBlock
                            title="Top Bán Chạy"
                            icon={<Flame className="h-5 w-5" />}
                            iconBg="from-orange-500 to-red-500"
                            courses={topSellers}
                            variants={variants}
                        />
                        <SectionBlock
                            title="Top Đánh Giá Cao"
                            icon={<ThumbsUp className="h-5 w-5" />}
                            iconBg="from-violet-500 to-purple-500"
                            courses={topRated}
                            variants={variants}
                        />
                        <SectionBlock
                            title="Khóa Học Miễn Phí"
                            icon={<Gift className="h-5 w-5" />}
                            iconBg="from-emerald-500 to-teal-500"
                            courses={freeCourses}
                            variants={variants}
                        />
                    </>
                )}
            </div>
        </section>
    );
}
