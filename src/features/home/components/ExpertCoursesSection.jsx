import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShoppingCart, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trustNotes } from '@/features/home/constants';
import { subjectApi } from '@/shared/api';
import { OwlLoader } from '@/shared/ui/common';
import { buildCourseBuyPath, mapCourseToPublicModel } from '@/features/courses/utils/publicCourseModel';

export default function ExpertCoursesSection({
    badge = 'Môn học nổi bật',
    titleMain = 'Nội dung được xếp để',
    titleHighlight = 'dễ học, dễ dạy, dễ quay lại',
    subtitle = 'Từ các môn nền tảng đến lộ trình chuyên sâu, SKR giúp người học tiếp cận nội dung có cấu trúc rõ ràng, dễ theo dõi tiến độ và dễ quay lại ôn tập.',
} = {}) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadFeaturedCourses = async () => {
            try {
                setLoading(true);
                setError('');

                const featuredResponse = await subjectApi.getAll({
                    status: 'published',
                    isFeatured: true,
                    limit: 3,
                    sortBy: 'displayOrder',
                    sortOrder: 'asc',
                });

                const featuredItems = featuredResponse.data?.items || [];
                let selectedCourses = featuredItems;

                if (featuredItems.length < 3) {
                    const fallbackResponse = await subjectApi.getAll({
                        status: 'published',
                        limit: 6,
                        sortBy: 'purchaseCount',
                        sortOrder: 'desc',
                    });

                    const fallbackItems = fallbackResponse.data?.items || [];
                    const existingIds = new Set(featuredItems.map((item) => item.subjectId ?? item.courseId ?? item.id));

                    selectedCourses = [
                        ...featuredItems,
                        ...fallbackItems.filter((item) => !existingIds.has(item.subjectId ?? item.courseId ?? item.id)),
                    ].slice(0, 3);
                }

                if (!isMounted) {
                    return;
                }

                setCourses(selectedCourses.map((course, index) => mapCourseToPublicModel(course, index)));
            } catch (fetchError) {
                if (!isMounted) {
                    return;
                }

                console.error('Failed to load featured public courses:', fetchError);
                setError('Chưa tải được danh sách khóa học nổi bật. Bạn có thể thử lại sau ít phút.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void loadFeaturedCourses();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section id="curriculum" className="px-6 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.82fr_1.18fr]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="lg:sticky lg:top-28 lg:self-start"
                >
                    <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl">
                        {badge}
                    </div>
                    <h2 className="apple-main-text mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                        {titleMain}
                        <br />
                        <span className="apple-highlight-text">{titleHighlight}</span>
                    </h2>
                    <p className="apple-secondary-text mt-6 text-lg leading-8">{subtitle}</p>

                    <div className="mt-10 space-y-4">
                        {trustNotes.map((note, index) => (
                            <motion.div
                                key={note.title}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.45, delay: index * 0.06 }}
                                whileHover={{ y: -4 }}
                                className="apple-panel apple-card-shadow apple-transition rounded-[28px] border p-5 backdrop-blur-xl"
                            >
                                <note.icon className="apple-muted-text h-5 w-5" />
                                <h3 className="apple-main-text mt-4 text-lg font-semibold tracking-[-0.02em]">{note.title}</h3>
                                <p className="apple-secondary-text mt-2 text-sm leading-6">{note.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className="space-y-5">
                    {loading ? (
                        <div className="apple-panel apple-card-shadow rounded-[32px] border p-8">
                            <OwlLoader
                                message="Đang tải khóa học nổi bật..."
                                subMessage="SKR đang lấy một vài khóa học public nổi bật từ dữ liệu thật."
                                className="py-8"
                            />
                        </div>
                    ) : error ? (
                        <div className="apple-panel apple-card-shadow rounded-[32px] border p-8">
                            <p className="apple-main-text text-xl font-semibold">Chưa hiển thị được khóa học nổi bật</p>
                            <p className="apple-secondary-text mt-3 text-sm leading-7">{error}</p>
                            <Link
                                to="/courses"
                                className="apple-primary-button apple-transition mt-6 inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
                            >
                                Xem toàn bộ khóa học
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        courses.map((course, index) => (
                            <motion.article
                                key={course.id}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -6 }}
                                className={`apple-card-shadow apple-transition overflow-hidden rounded-[32px] border p-7 sm:p-8 ${course.accent.surfaceClass}`}
                            >
                                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                                    <div className="max-w-2xl">
                                        <div className="apple-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                                            {course.instructorName}
                                        </div>
                                        <h3 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">
                                            {course.title}
                                        </h3>
                                        <p className="apple-secondary-text mt-3 text-base leading-7">{course.subtitle}</p>

                                        <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
                                            <span className="apple-chip inline-flex items-center gap-1.5 rounded-full px-3 py-2 backdrop-blur-xl">
                                                <Users className="h-3.5 w-3.5" />
                                                {course.socialProof}
                                            </span>
                                            <span className="apple-chip inline-flex items-center gap-1.5 rounded-full px-3 py-2 backdrop-blur-xl">
                                                <Star className="h-3.5 w-3.5" />
                                                {course.ratingLabel}
                                            </span>
                                            <span className="apple-chip rounded-full px-3 py-2 backdrop-blur-xl">
                                                {course.level}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="apple-panel relative overflow-hidden rounded-[28px] border backdrop-blur-xl">
                                        <motion.img
                                            src={course.bannerUrl}
                                            alt={`Minh họa cho khóa học ${course.title}`}
                                            className="aspect-[16/10] w-full object-cover"
                                            whileHover={{ scale: 1.06 }}
                                            transition={{ duration: 0.45, ease: 'easeOut' }}
                                        />
                                        <div className="apple-img-overlay absolute inset-0" />
                                        <div className="apple-glass-overlay apple-glass-border absolute left-4 top-4 rounded-full border px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xl">
                                            {course.accent.badge}
                                        </div>
                                        <div className="apple-glass-overlay apple-glass-border absolute bottom-4 left-4 rounded-2xl border px-4 py-3 backdrop-blur-xl">
                                            <p className="text-xs font-medium text-white/72">Học phí</p>
                                            <p className="mt-1 text-lg font-semibold text-white">{course.formattedPrice}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="apple-border mt-8 flex flex-col gap-6 border-t pt-6">
                                    <div className="flex flex-wrap gap-3">
                                        {course.stats.map((item) => (
                                            <span key={item} className="apple-chip rounded-full px-4 py-2 text-sm backdrop-blur-xl">
                                                {item}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                        <Link
                                            to={`/courses/${course.id}`}
                                            className="apple-secondary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                                        >
                                            Xem khóa học
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                        <Link
                                            to={buildCourseBuyPath(course.id)}
                                            className="apple-primary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold hover:-translate-y-px"
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Mua ngay
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
