import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Clock3, Layers3, Star, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { HomeFooter, HomeNavBar } from '@/features/home/components';
import {
    PublicCourseCurriculumPreview,
    PublicCourseHero,
    PublicCoursePurchasePanel,
} from '@/features/courses/components';
import { subjectApi } from '@/shared/api';
import { OwlLoader } from '@/shared/ui/common';
import { buildCourseBuyPath, mapCourseToPublicModel } from '@/features/courses/utils/publicCourseModel';

const PREVIEW_SECTION_ID = 'preview-lessons';

export default function PublicCourseDetail() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [relatedCourses, setRelatedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadCourseDetail = async () => {
            try {
                setLoading(true);
                setError('');

                const detailResponse = await subjectApi.getById(id);
                const detailData = detailResponse.data?.data || detailResponse.data || detailResponse;

                if (!detailData || (detailData.status && detailData.status !== 'published')) {
                    throw new Error('Khóa học này hiện chưa mở công khai.');
                }

                const mappedCourse = mapCourseToPublicModel(detailData, 0);

                const relatedResponse = await subjectApi.getAll({
                    status: 'published',
                    limit: 4,
                    sortBy: 'purchaseCount',
                    sortOrder: 'desc',
                });

                const relatedItems = (relatedResponse.data?.items || [])
                    .filter((item) => (item.subjectId ?? item.courseId ?? item.id) !== mappedCourse.id)
                    .slice(0, 3)
                    .map((item, index) => mapCourseToPublicModel(item, index + 1));

                if (!isMounted) {
                    return;
                }

                setCourse(mappedCourse);
                setRelatedCourses(relatedItems);
            } catch (fetchError) {
                if (!isMounted) {
                    return;
                }

                console.error('Failed to load public course detail:', fetchError);
                setError(fetchError.message || 'Chưa tải được chi tiết khóa học.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (id) {
            void loadCourseDetail();
        }

        return () => {
            isMounted = false;
        };
    }, [id]);

    const learningHighlights = useMemo(() => {
        if (!course) {
            return [];
        }

        return [
            {
                icon: Layers3,
                title: 'Lộ trình đủ rõ để theo được mỗi ngày',
                description: `${course.totalChapters} chương được chia thành ${course.totalLessons} bài, giúp người học luôn biết mình đang ở đâu và cần học tiếp gì.`,
            },
            {
                icon: Clock3,
                title: 'Khối lượng vừa đủ để quay lại đều đặn',
                description: `${course.estimatedDurationHours} giờ nội dung chính, kèm các hoạt động ôn tập giúp bạn giữ nhịp thay vì học dồn.`,
            },
            {
                icon: BookOpen,
                title: 'Ôn tập và áp dụng ngay trong cùng khóa học',
                description: `${course.totalQuestions} hoạt động ôn tập được đặt cạnh bài học để người dùng chuyển từ xem sang nhớ mà không đổi ngữ cảnh.`,
            },
        ];
    }, [course]);

    if (loading) {
        return (
            <div className="apple-home apple-transition min-h-screen">
                <HomeNavBar />
                <main className="px-6 py-20 lg:px-8">
                    <div className="mx-auto max-w-5xl">
                        <OwlLoader
                            message="Đang tải chi tiết khóa học..."
                            subMessage="SKR đang lấy dữ liệu public của khóa học từ backend để dựng landing page."
                            className="py-16"
                        />
                    </div>
                </main>
                <HomeFooter />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="apple-home apple-transition min-h-screen">
                <HomeNavBar />
                <main className="px-6 py-20 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="apple-panel apple-card-shadow rounded-[36px] border p-8 sm:p-10">
                            <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                                Course unavailable
                            </div>
                            <h1 className="apple-main-text mt-6 text-3xl font-semibold tracking-[-0.03em]">
                                Không mở được trang khóa học này
                            </h1>
                            <p className="apple-secondary-text mt-4 text-base leading-7">
                                {error || 'Khóa học không tồn tại hoặc hiện chưa được xuất bản công khai.'}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to="/"
                                    className="apple-secondary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                                >
                                    Về trang chủ
                                </Link>
                                <Link
                                    to="/courses"
                                    className="apple-primary-button apple-transition inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                                >
                                    Xem danh sách khóa học
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
                <HomeFooter />
            </div>
        );
    }

    return (
        <div className="apple-home apple-transition min-h-screen">
            <HomeNavBar />

            <main className="pb-20">
                <PublicCourseHero course={course} previewAnchorId={PREVIEW_SECTION_ID} />

                <section className="px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.04fr_0.96fr]">
                        <div className="space-y-6">
                            <motion.section
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                                className="apple-panel apple-card-shadow rounded-[36px] border p-7 sm:p-9"
                            >
                                <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                                    What you'll learn
                                </div>
                                <h2 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">
                                    Những gì người học nhận được trước và sau khi mua
                                </h2>
                                <p className="apple-secondary-text mt-4 text-base leading-7">
                                    Khóa học này được xây theo kiểu landing page public giống các hệ e-learning lớn: cho xem đủ để đánh giá chất lượng, nhưng giữ phần học sâu cho sau khi checkout để tiến độ và quyền truy cập nằm đúng trên tài khoản.
                                </p>

                                <div className="mt-8 grid gap-4 md:grid-cols-3">
                                    {learningHighlights.map((item) => (
                                        <div key={item.title} className="rounded-[28px] border border-white/45 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                                            <div className="apple-soft-panel flex h-11 w-11 items-center justify-center rounded-2xl">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="apple-main-text mt-4 text-lg font-semibold">{item.title}</h3>
                                            <p className="apple-secondary-text mt-3 text-sm leading-7">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>

                            <PublicCourseCurriculumPreview course={course} sectionId={PREVIEW_SECTION_ID} />

                            <motion.section
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.06 }}
                                className="apple-panel apple-card-shadow rounded-[36px] border p-7 sm:p-9"
                            >
                                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                    <div className="max-w-3xl">
                                        <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                                            Instructor and trust
                                        </div>
                                        <h2 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">
                                            Học với {course.instructorName} trong một flow rõ ràng từ khám phá đến checkout
                                        </h2>
                                        <p className="apple-secondary-text mt-4 text-base leading-7">
                                            SKR không biến homepage thành catalog dài vô tận. Trang chủ chỉ đưa ra vài public courses nổi bật, còn trang chi tiết này là nơi người dùng đọc kỹ curriculum preview, xem social proof và quyết định mua.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3 text-sm font-semibold">
                                        <span className="apple-chip inline-flex items-center gap-2 rounded-full px-4 py-2">
                                            <Star className="h-4 w-4" />
                                            {course.ratingAverage > 0 ? `${course.ratingAverage.toFixed(1)} sao` : 'Mới cập nhật'}
                                        </span>
                                        <span className="apple-chip inline-flex items-center gap-2 rounded-full px-4 py-2">
                                            <Users className="h-4 w-4" />
                                            {course.socialProof}
                                        </span>
                                    </div>
                                </div>
                            </motion.section>

                            {relatedCourses.length > 0 ? (
                                <motion.section
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: 0.1 }}
                                    className="apple-panel apple-card-shadow rounded-[36px] border p-7 sm:p-9"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium">
                                                More public courses
                                            </div>
                                            <h2 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">
                                                Một vài khóa public khác đang được người học quan tâm
                                            </h2>
                                        </div>
                                        <Link
                                            to="/courses"
                                            className="apple-secondary-button apple-transition inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
                                        >
                                            Xem tất cả
                                        </Link>
                                    </div>

                                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                                        {relatedCourses.map((relatedCourse) => (
                                            <article key={relatedCourse.id} className="overflow-hidden rounded-[28px] border border-white/45 bg-white/75 shadow-sm backdrop-blur-xl">
                                                <img
                                                    src={relatedCourse.bannerUrl}
                                                    alt={`Khóa học ${relatedCourse.title}`}
                                                    className="aspect-[16/10] w-full object-cover"
                                                />
                                                <div className="space-y-4 p-5">
                                                    <div>
                                                        <p className="apple-secondary-text text-xs font-semibold uppercase tracking-[0.16em]">
                                                            {relatedCourse.instructorName}
                                                        </p>
                                                        <h3 className="apple-main-text mt-2 text-lg font-semibold">{relatedCourse.title}</h3>
                                                        <p className="apple-secondary-text mt-2 text-sm leading-7">{relatedCourse.subtitle}</p>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-base font-semibold text-base-content">
                                                            {relatedCourse.formattedPrice}
                                                        </span>
                                                        <Link
                                                            to={`/courses/${relatedCourse.id}`}
                                                            className="apple-primary-button apple-transition inline-flex h-10 items-center justify-center rounded-full px-4 text-xs font-semibold"
                                                        >
                                                            Xem khóa học
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </motion.section>
                            ) : null}
                        </div>

                        <div>
                            <PublicCoursePurchasePanel course={course} previewAnchorId={PREVIEW_SECTION_ID} />

                            {!course.hasAccess && !course.isFree ? (
                                <div className="mt-6 rounded-[28px] border border-white/45 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                                    <p className="text-sm font-semibold text-base-content">
                                        Muốn vào checkout ngay?
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-base-content/65">
                                        Từ homepage người dùng có thể bấm thẳng `Mua ngay`, còn trên trang chi tiết này họ có thêm curriculum preview để tự tin ra quyết định hơn.
                                    </p>
                                    <Link
                                        to={buildCourseBuyPath(course.id)}
                                        className="apple-primary-button apple-transition mt-4 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
                                    >
                                        Mua ngay
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>
            </main>

            <HomeFooter />
        </div>
    );
}
