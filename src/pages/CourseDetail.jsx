import { useMemo } from 'react';
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
    Frown
} from 'lucide-react';

import { DashboardSidebar } from '../components/learner';
import {
    CourseDetailInfo,
    CourseDetailCurriculum,
    CourseDetailSidebar
} from '../components/courses';

// ─── Mock Data (mirrored from Courses.jsx — sẽ thay bằng API call) ──

const experts = [
    { id: 1, name: 'TS. Nguyễn Văn Minh', title: 'Tiến sĩ Toán học - ĐH Bách Khoa', avatar: 'https://i.pravatar.cc/150?img=11', rating: 4.9, students: 12500, courses: 8, verified: true, speciality: 'Toán học' },
    { id: 2, name: 'ThS. Trần Thu Hà', title: 'Thạc sĩ Ngôn ngữ Anh - ĐH Ngoại Ngữ', avatar: 'https://i.pravatar.cc/150?img=5', rating: 4.8, students: 9800, courses: 12, verified: true, speciality: 'Ngôn ngữ' },
    { id: 3, name: 'TS. Đoàn Thế Anh', title: 'Tiến sĩ CNTT - ĐH Công Nghệ', avatar: 'https://i.pravatar.cc/150?img=12', rating: 4.9, students: 15200, courses: 10, verified: true, speciality: 'Lập trình' },
    { id: 4, name: 'PGS. Phạm Thanh Tùng', title: 'Phó Giáo sư Vật lý - ĐH KHTN', avatar: 'https://i.pravatar.cc/150?img=53', rating: 4.7, students: 7600, courses: 6, verified: true, speciality: 'Khoa học' },
    { id: 5, name: 'ThS. Lê Hoàng Nam', title: 'Thạc sĩ Kinh tế - ĐH Kinh tế TP.HCM', avatar: 'https://i.pravatar.cc/150?img=60', rating: 4.6, students: 5400, courses: 4, verified: true, speciality: 'Kinh tế' },
];

const allCourses = [
    {
        id: 1, title: 'Toán Cao Cấp - Giải Tích & Đại Số', expertId: 1, category: 'Toán học',
        isFree: false, priceAmount: 299000, originalPrice: 499000, discountPercent: 40,
        ratingAverage: 4.9, ratingCount: 328, purchaseCount: 4520,
        totalChapters: 12, totalLessons: 48, totalVideos: 36, totalDocuments: 15, totalQuestions: 200,
        estimatedDurationHours: 32, level: 'Nâng cao',
        gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-500/10 to-cyan-500/10',
        icon: '📐', tags: ['Đạo hàm', 'Tích phân', 'Ma trận', 'Giới hạn', 'Chuỗi số'],
        flashcards: 450,
        bannerUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=500&fit=crop',
        visibility: 'public', isPurchased: false, publishedAt: '2025-12-01',
        description: 'Khóa học toàn diện từ cơ bản đến nâng cao về Giải tích và Đại số tuyến tính. Bạn sẽ nắm vững các khái niệm từ đạo hàm, tích phân, chuỗi số đến ma trận, không gian vector. Mỗi chương đều có video bài giảng chi tiết, tài liệu tóm tắt và bài tập thực hành.',
    },
    {
        id: 2, title: 'IELTS Academic - Lộ Trình 7.0+', expertId: 2, category: 'Ngôn ngữ',
        isFree: false, priceAmount: 599000, originalPrice: 899000, discountPercent: 33,
        ratingAverage: 4.8, ratingCount: 512, purchaseCount: 3890,
        totalChapters: 16, totalLessons: 64, totalVideos: 52, totalDocuments: 24, totalQuestions: 500,
        estimatedDurationHours: 45, level: 'Trung bình',
        gradient: 'from-emerald-500 to-teal-500', bgGradient: 'from-emerald-500/10 to-teal-500/10',
        icon: '🇬🇧', tags: ['Reading', 'Writing', 'Speaking', 'Listening'],
        flashcards: 1200,
        bannerUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=500&fit=crop',
        visibility: 'public', isPurchased: true, publishedAt: '2025-11-15',
        description: 'Chinh phục IELTS Academic 7.0+ với lộ trình bài bản. Khóa học bao gồm 4 kỹ năng: Reading, Writing, Speaking và Listening với phương pháp giảng dạy hiệu quả, nhiều đề thi thực hành và feedback chi tiết từ giảng viên.',
    },
    {
        id: 3, title: 'Python & AI - Từ Cơ Bản Đến Ứng Dụng', expertId: 3, category: 'Lập trình',
        isFree: false, priceAmount: 399000, originalPrice: 699000, discountPercent: 43,
        ratingAverage: 4.9, ratingCount: 687, purchaseCount: 6200,
        totalChapters: 14, totalLessons: 56, totalVideos: 48, totalDocuments: 18, totalQuestions: 300,
        estimatedDurationHours: 40, level: 'Cơ bản',
        gradient: 'from-violet-500 to-purple-500', bgGradient: 'from-violet-500/10 to-purple-500/10',
        icon: '🐍', tags: ['Python', 'Machine Learning', 'Deep Learning', 'NumPy', 'Pandas'],
        flashcards: 680,
        bannerUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=500&fit=crop',
        visibility: 'public', isPurchased: false, publishedAt: '2026-01-10',
        description: 'Học Python từ con số 0 đến ứng dụng AI thực tế. Bạn sẽ xây dựng được các project Machine Learning và Deep Learning với TensorFlow/PyTorch, xử lý dữ liệu với NumPy/Pandas, và triển khai model AI lên production.',
    },
    {
        id: 4, title: 'Nhập Môn Cơ Sở Dữ Liệu', expertId: 3, category: 'Lập trình',
        isFree: true, priceAmount: 0, originalPrice: 0, discountPercent: 0,
        ratingAverage: 4.7, ratingCount: 245, purchaseCount: 8900,
        totalChapters: 8, totalLessons: 32, totalVideos: 24, totalDocuments: 10, totalQuestions: 150,
        estimatedDurationHours: 20, level: 'Cơ bản',
        gradient: 'from-amber-500 to-orange-500', bgGradient: 'from-amber-500/10 to-orange-500/10',
        icon: '💾', tags: ['SQL', 'ERD', 'Normalization', 'MySQL'],
        flashcards: 320,
        bannerUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=500&fit=crop',
        visibility: 'public', isPurchased: false, publishedAt: '2026-01-20',
        description: 'Khóa học miễn phí giúp bạn hiểu rõ về cơ sở dữ liệu quan hệ, thiết kế ERD, chuẩn hóa dữ liệu và viết SQL thành thạo. Phù hợp cho sinh viên năm nhất và những ai mới bắt đầu học lập trình.',
    },
    {
        id: 5, title: 'Vật Lý Đại Cương - Cơ Học & Nhiệt', expertId: 4, category: 'Khoa học',
        isFree: false, priceAmount: 249000, originalPrice: 349000, discountPercent: 29,
        ratingAverage: 4.6, ratingCount: 178, purchaseCount: 2100,
        totalChapters: 10, totalLessons: 40, totalVideos: 30, totalDocuments: 12, totalQuestions: 180,
        estimatedDurationHours: 28, level: 'Trung bình',
        gradient: 'from-rose-500 to-pink-500', bgGradient: 'from-rose-500/10 to-pink-500/10',
        icon: '⚛️', tags: ['Newton', 'Nhiệt động', 'Sóng', 'Điện từ'],
        flashcards: 280,
        bannerUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=500&fit=crop',
        visibility: 'public', isPurchased: false, publishedAt: '2025-10-05',
        description: 'Nắm vững kiến thức Vật lý Đại cương từ Cơ học Newton, Nhiệt động lực học đến Sóng cơ và Điện từ trường. Khóa học bám sát chương trình đại học, có nhiều thí nghiệm mô phỏng trực quan.',
    },
    {
        id: 6, title: 'Kinh Tế Vĩ Mô Nâng Cao', expertId: 5, category: 'Kinh tế',
        isFree: false, priceAmount: 449000, originalPrice: 649000, discountPercent: 31,
        ratingAverage: 4.5, ratingCount: 134, purchaseCount: 1800,
        totalChapters: 11, totalLessons: 44, totalVideos: 33, totalDocuments: 16, totalQuestions: 220,
        estimatedDurationHours: 35, level: 'Nâng cao',
        gradient: 'from-indigo-500 to-sky-500', bgGradient: 'from-indigo-500/10 to-sky-500/10',
        icon: '📊', tags: ['GDP', 'Lạm phát', 'Chính sách', 'Tỷ giá'],
        flashcards: 360,
        bannerUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
        visibility: 'public', isPurchased: false, publishedAt: '2025-09-15',
        description: 'Phân tích chuyên sâu các mô hình kinh tế vĩ mô: IS-LM, AD-AS, Mundell-Fleming, lý thuyết tăng trưởng Solow. Hiểu rõ cách chính sách tiền tệ và tài khóa ảnh hưởng đến nền kinh tế.',
    },
    {
        id: 7, title: 'React & Next.js - Fullstack Web Development', expertId: 3, category: 'Lập trình',
        isFree: false, priceAmount: 699000, originalPrice: 999000, discountPercent: 30,
        ratingAverage: 4.9, ratingCount: 432, purchaseCount: 5100,
        totalChapters: 18, totalLessons: 72, totalVideos: 60, totalDocuments: 22, totalQuestions: 350,
        estimatedDurationHours: 55, level: 'Nâng cao',
        gradient: 'from-cyan-500 to-blue-500', bgGradient: 'from-cyan-500/10 to-blue-500/10',
        icon: '⚛️', tags: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Prisma'],
        flashcards: 520,
        bannerUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=500&fit=crop',
        visibility: 'premium_only', isPurchased: false, publishedAt: '2026-02-01',
        description: 'Xây dựng ứng dụng web fullstack với React, Next.js 14, TypeScript, Tailwind CSS và Prisma ORM. Từ server components, app router đến deployment Vercel — tất cả trong một khóa học toàn diện.',
    },
    {
        id: 8, title: 'Luyện Thi TOEIC 800+ - Chiến Lược Toàn Diện', expertId: 2, category: 'Ngôn ngữ',
        isFree: false, priceAmount: 349000, originalPrice: 499000, discountPercent: 30,
        ratingAverage: 4.7, ratingCount: 289, purchaseCount: 3200,
        totalChapters: 12, totalLessons: 48, totalVideos: 40, totalDocuments: 20, totalQuestions: 400,
        estimatedDurationHours: 38, level: 'Trung bình',
        gradient: 'from-teal-500 to-emerald-500', bgGradient: 'from-teal-500/10 to-emerald-500/10',
        icon: '📝', tags: ['Listening', 'Reading', 'Grammar', 'Vocabulary'],
        flashcards: 900,
        bannerUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop',
        visibility: 'public', isPurchased: true, publishedAt: '2025-12-20',
        description: 'Chiến lược toàn diện đạt TOEIC 800+ trong 3 tháng. Phân tích chi tiết từng dạng câu hỏi Part 1-7, luyện nghe với accent đa dạng, và nắm vững 1000 từ vựng TOEIC thường gặp nhất.',
    },
    {
        id: 9, title: 'Xác Suất Thống Kê Ứng Dụng', expertId: 1, category: 'Toán học',
        isFree: true, priceAmount: 0, originalPrice: 0, discountPercent: 0,
        ratingAverage: 4.5, ratingCount: 156, purchaseCount: 6700,
        totalChapters: 6, totalLessons: 24, totalVideos: 18, totalDocuments: 8, totalQuestions: 120,
        estimatedDurationHours: 16, level: 'Cơ bản',
        gradient: 'from-fuchsia-500 to-pink-500', bgGradient: 'from-fuchsia-500/10 to-pink-500/10',
        icon: '🎲', tags: ['Xác suất', 'Phân phối', 'Kiểm định', 'Hồi quy'],
        flashcards: 200,
        bannerUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=500&fit=crop',
        visibility: 'public', isPurchased: false, publishedAt: '2026-01-28',
        description: 'Khóa học miễn phí về xác suất thống kê ứng dụng: biến ngẫu nhiên, phân phối xác suất, kiểm định giả thuyết, hồi quy tuyến tính. Có nhiều ví dụ thực tế từ y học, kinh tế và kỹ thuật.',
    },
];

// ─── Mock Chapters & Lessons (maps to mst_chapters, mst_lessons) ──

function generateChapters(course) {
    const chaptersData = {
        1: [ // Toán Cao Cấp
            {
                title: 'Giới hạn và Liên tục', gradient: 'from-blue-500 to-cyan-500',
                lessons: [
                    { title: 'Khái niệm giới hạn hàm số', type: 'video', durationMinutes: 25, isPreview: true },
                    { title: 'Các quy tắc tính giới hạn', type: 'video', durationMinutes: 30, isPreview: false },
                    { title: 'Tài liệu: Bảng công thức giới hạn', type: 'document', durationMinutes: 10, isPreview: true },
                    { title: 'Bài tập giới hạn', type: 'quiz', durationMinutes: 20, isPreview: false },
                ],
            },
            {
                title: 'Đạo hàm', gradient: 'from-blue-500 to-cyan-500',
                lessons: [
                    { title: 'Định nghĩa và ý nghĩa đạo hàm', type: 'video', durationMinutes: 35, isPreview: true },
                    { title: 'Quy tắc đạo hàm cơ bản', type: 'video', durationMinutes: 28, isPreview: false },
                    { title: 'Đạo hàm hàm hợp', type: 'video', durationMinutes: 22, isPreview: false },
                    { title: 'Flashcard: Bảng đạo hàm', type: 'flashcard', durationMinutes: 15, isPreview: false },
                    { title: 'Bài kiểm tra chương 2', type: 'quiz', durationMinutes: 25, isPreview: false },
                ],
            },
            {
                title: 'Tích phân', gradient: 'from-blue-500 to-cyan-500',
                lessons: [
                    { title: 'Nguyên hàm và tích phân bất định', type: 'video', durationMinutes: 32, isPreview: false },
                    { title: 'Phương pháp tích phân từng phần', type: 'video', durationMinutes: 28, isPreview: false },
                    { title: 'Tích phân xác định và ứng dụng', type: 'video', durationMinutes: 35, isPreview: false },
                    { title: 'Tài liệu: Bảng tích phân thường gặp', type: 'document', durationMinutes: 10, isPreview: false },
                ],
            },
            {
                title: 'Ma trận và Định thức', gradient: 'from-blue-500 to-cyan-500',
                lessons: [
                    { title: 'Phép toán ma trận cơ bản', type: 'video', durationMinutes: 30, isPreview: false },
                    { title: 'Tính định thức ma trận', type: 'video', durationMinutes: 25, isPreview: false },
                    { title: 'Ma trận khả nghịch', type: 'video', durationMinutes: 22, isPreview: false },
                    { title: 'Bài kiểm tra chương 4', type: 'quiz', durationMinutes: 20, isPreview: false },
                ],
            },
        ],
        3: [ // Python & AI
            {
                title: 'Giới thiệu Python', gradient: 'from-violet-500 to-purple-500',
                lessons: [
                    { title: 'Cài đặt môi trường Python', type: 'video', durationMinutes: 15, isPreview: true },
                    { title: 'Cú pháp cơ bản & kiểu dữ liệu', type: 'video', durationMinutes: 35, isPreview: true },
                    { title: 'Hàm và Module', type: 'video', durationMinutes: 28, isPreview: false },
                    { title: 'Tài liệu: Python Cheat Sheet', type: 'document', durationMinutes: 10, isPreview: true },
                ],
            },
            {
                title: 'Xử lý dữ liệu với NumPy & Pandas', gradient: 'from-violet-500 to-purple-500',
                lessons: [
                    { title: 'NumPy Arrays và Operations', type: 'video', durationMinutes: 32, isPreview: false },
                    { title: 'Pandas DataFrame cơ bản', type: 'video', durationMinutes: 30, isPreview: false },
                    { title: 'Data Cleaning & Transformation', type: 'video', durationMinutes: 35, isPreview: false },
                    { title: 'Flashcard: NumPy/Pandas', type: 'flashcard', durationMinutes: 15, isPreview: false },
                ],
            },
            {
                title: 'Machine Learning cơ bản', gradient: 'from-violet-500 to-purple-500',
                lessons: [
                    { title: 'Giới thiệu Machine Learning', type: 'video', durationMinutes: 25, isPreview: true },
                    { title: 'Linear Regression', type: 'video', durationMinutes: 40, isPreview: false },
                    { title: 'Classification với Decision Tree', type: 'video', durationMinutes: 35, isPreview: false },
                    { title: 'Bài kiểm tra: ML Foundations', type: 'quiz', durationMinutes: 20, isPreview: false },
                ],
            },
            {
                title: 'Deep Learning với TensorFlow', gradient: 'from-violet-500 to-purple-500',
                lessons: [
                    { title: 'Neural Network từ đầu', type: 'video', durationMinutes: 45, isPreview: false },
                    { title: 'TensorFlow/Keras cơ bản', type: 'video', durationMinutes: 38, isPreview: false },
                    { title: 'CNN cho Computer Vision', type: 'video', durationMinutes: 42, isPreview: false },
                    { title: 'Tài liệu: Model Architectures', type: 'document', durationMinutes: 15, isPreview: false },
                    { title: 'Project: Image Classification', type: 'quiz', durationMinutes: 60, isPreview: false },
                ],
            },
        ],
    };

    // If we have specific data for this course, use it, otherwise generate from course stats
    if (chaptersData[course.id]) {
        return chaptersData[course.id];
    }

    // Auto-generate chapters from course metadata
    const chapters = [];
    const lessonsPerChapter = Math.ceil(course.totalLessons / course.totalChapters);

    for (let i = 0; i < Math.min(course.totalChapters, 5); i++) {
        const lessons = [];
        for (let j = 0; j < Math.min(lessonsPerChapter, 6); j++) {
            const types = ['video', 'video', 'video', 'document', 'flashcard', 'quiz'];
            const type = types[j % types.length];
            lessons.push({
                title: `Bài ${i * lessonsPerChapter + j + 1}: ${course.tags?.[j % course.tags.length] || 'Nội dung'} (${type === 'video' ? 'Video' : type === 'document' ? 'Tài liệu' : type === 'flashcard' ? 'Flashcard' : 'Bài tập'})`,
                type,
                durationMinutes: type === 'video' ? Math.floor(Math.random() * 20) + 20 : type === 'document' ? 10 : type === 'flashcard' ? 15 : 20,
                isPreview: i === 0 && j === 0,
            });
        }
        chapters.push({
            title: `Chương ${i + 1}: ${course.tags?.[i % course.tags.length] || `Phần ${i + 1}`}`,
            gradient: course.gradient,
            lessons,
        });
    }
    return chapters;
}

// ─── Related Courses ────────────────────────────────────

function getRelatedCourses(course, all) {
    return all
        .filter(c => c.id !== course.id && (c.category === course.category || c.expertId === course.expertId))
        .slice(0, 3);
}

// ─── Page Component ─────────────────────────────────────

export default function CourseDetail() {
    const { id } = useParams();

    const course = useMemo(() => allCourses.find(c => c.id === Number(id)), [id]);
    const expert = useMemo(() => course ? experts.find(e => e.id === course.expertId) : null, [course]);
    const chapters = useMemo(() => course ? generateChapters(course) : [], [course]);
    const relatedCourses = useMemo(() => course ? getRelatedCourses(course, allCourses) : [], [course]);

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

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <DetailPageHeader courseName={course?.title} />

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

                    {!course ? (
                        /* 404 state */
                        <motion.div
                            variants={cardVariants}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center mb-5">
                                <Frown className="w-8 h-8 text-base-content/30" />
                            </div>
                            <h2 className="text-xl font-black text-base-content mb-2">Không tìm thấy môn học</h2>
                            <p className="text-sm text-base-content/50 font-medium mb-5">
                                Môn học này không tồn tại hoặc đã bị xóa.
                            </p>
                            <Link to="/courses">
                                <button className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold">
                                    Xem tất cả môn học
                                </button>
                            </Link>
                        </motion.div>
                    ) : (
                        /* Main layout: Content + Sidebar */
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
                                                <p className="text-4xl font-black text-base-content">{course.ratingAverage}</p>
                                                <div className="flex items-center gap-0.5 my-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < Math.round(course.ratingAverage) ? 'fill-orange-500 text-orange-500' : 'text-base-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-base-content/50 font-bold">{course.ratingCount} đánh giá</p>
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
                                                const relatedExpert = experts.find(e => e.id === related.expertId);
                                                return (
                                                    <Link key={related.id} to={`/courses/${related.id}`}>
                                                        <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                                            <div className="relative h-28 overflow-hidden">
                                                                <img src={related.bannerUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-base-100 to-transparent opacity-60" />
                                                                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md bg-gradient-to-r ${related.gradient} text-white text-[10px] font-bold shadow`}>
                                                                    {related.icon} {related.category}
                                                                </span>
                                                            </div>
                                                            <div className="p-3">
                                                                <h4 className="text-xs font-black text-base-content line-clamp-2 mb-1">{related.title}</h4>
                                                                <div className="flex items-center justify-between text-[10px] text-base-content/50">
                                                                    <span className="flex items-center gap-0.5">
                                                                        <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" /> {related.ratingAverage}
                                                                    </span>
                                                                    <span className="font-black text-base-content">
                                                                        {related.isFree ? 'Miễn phí' : related.priceAmount.toLocaleString('vi-VN') + '₫'}
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
                    )}
                </motion.main>
            </div>
        </div>
    );
}

// ─── Mock Reviews ───────────────────────────────────────

const mockReviews = [
    { name: 'Nguyễn Thảo Linh', avatar: 'https://i.pravatar.cc/150?img=25', rating: 5, date: '2 ngày trước', content: 'Khóa học rất hay và dễ hiểu! Giảng viên giải thích rất chi tiết, bài tập thực hành phong phú.' },
    { name: 'Trần Minh Đức', avatar: 'https://i.pravatar.cc/150?img=14', rating: 5, date: '1 tuần trước', content: 'Nội dung bám sát thực tế, rất hữu ích cho công việc. Flashcard giúp ôn tập hiệu quả!' },
    { name: 'Lê Phương Anh', avatar: 'https://i.pravatar.cc/150?img=45', rating: 4, date: '2 tuần trước', content: 'Chất lượng tốt, video rõ ràng. Mong có thêm bài tập nâng cao.' },
];

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
