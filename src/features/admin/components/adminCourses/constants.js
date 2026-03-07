import {
    CheckCircle2,
    AlertCircle,
    Archive,
} from 'lucide-react';

// ===== ANIMATION VARIANTS =====
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

export const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

// ===== STATUS CONFIG =====
export const statusConfig = {
    published: { label: 'Đã xuất bản', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10', dot: 'bg-emerald-500' },
    draft: { label: 'Bản nháp', icon: AlertCircle, color: 'text-amber-600 bg-amber-500/10', dot: 'bg-amber-500' },
    archived: { label: 'Đã lưu trữ', icon: Archive, color: 'text-base-content/50 bg-base-200', dot: 'bg-base-content/40' },
};

// ===== MOCK DATA CHI TIẾT =====
export const mockCourseDetail = {
    id: 1,
    name: 'Toán Cao Cấp Pro',
    subjectCode: 'MATH101',
    category: 'Toán học',
    description: 'Khóa học Toán Cao Cấp chuyên sâu dành cho sinh viên đại học. Bao gồm đầy đủ các chủ đề từ giới hạn, đạo hàm, tích phân đến phương trình vi phân. Giảng viên sử dụng phương pháp trực quan giúp sinh viên dễ dàng nắm bắt và ứng dụng.',
    image: '📐',
    bannerUrl: null,
    previewVideoUrl: null,
    price: 299000,
    originalPrice: 499000,
    currency: 'VND',
    discountPercent: 40,
    isFree: false,
    isFeatured: true,
    status: 'published',
    publishedAt: '2026-01-10T08:00:00Z',
    createdAt: '2025-12-15T10:30:00Z',
    updatedAt: '2026-03-01T14:20:00Z',

    // Stats
    totalStudents: 567,
    rating: 4.8,
    ratingCount: 128,
    totalChapters: 8,
    totalLessons: 48,
    totalVideos: 42,
    totalDocuments: 15,
    totalQuestions: 200,
    estimatedHours: 24,
    completionRate: 72,
    revenue: 169533000,

    // Creator
    creator: {
        userId: 'uuid-1',
        fullName: 'PGS. TS. Nguyễn Văn Hùng',
        displayName: 'Hùng',
        avatarUrl: 'https://i.pravatar.cc/150?img=60',
        bio: 'Giảng viên Toán học tại ĐH Bách khoa TP.HCM, 15 năm kinh nghiệm.',
    },

    // Chapters with lessons
    chapters: [
        {
            chapterId: 'ch-1',
            chapterName: 'Giới hạn và Liên tục',
            chapterNumber: 1,
            estimatedMinutes: 180,
            lessons: [
                { lessonId: 'ls-1', lessonName: 'Khái niệm giới hạn', lessonNumber: 1, estimatedMinutes: 30 },
                { lessonId: 'ls-2', lessonName: 'Giới hạn hàm số', lessonNumber: 2, estimatedMinutes: 35 },
                { lessonId: 'ls-3', lessonName: 'Tính liên tục', lessonNumber: 3, estimatedMinutes: 25 },
                { lessonId: 'ls-4', lessonName: 'Bài tập tổng hợp', lessonNumber: 4, estimatedMinutes: 40 },
            ],
        },
        {
            chapterId: 'ch-2',
            chapterName: 'Đạo hàm',
            chapterNumber: 2,
            estimatedMinutes: 240,
            lessons: [
                { lessonId: 'ls-5', lessonName: 'Định nghĩa đạo hàm', lessonNumber: 1, estimatedMinutes: 30 },
                { lessonId: 'ls-6', lessonName: 'Công thức đạo hàm cơ bản', lessonNumber: 2, estimatedMinutes: 40 },
                { lessonId: 'ls-7', lessonName: 'Đạo hàm hàm hợp', lessonNumber: 3, estimatedMinutes: 35 },
                { lessonId: 'ls-8', lessonName: 'Đạo hàm cấp cao', lessonNumber: 4, estimatedMinutes: 30 },
                { lessonId: 'ls-9', lessonName: 'Vi phân và ứng dụng', lessonNumber: 5, estimatedMinutes: 45 },
                { lessonId: 'ls-10', lessonName: 'Bài tập tổng hợp', lessonNumber: 6, estimatedMinutes: 60 },
            ],
        },
        {
            chapterId: 'ch-3',
            chapterName: 'Tích phân',
            chapterNumber: 3,
            estimatedMinutes: 300,
            lessons: [
                { lessonId: 'ls-11', lessonName: 'Nguyên hàm', lessonNumber: 1, estimatedMinutes: 35 },
                { lessonId: 'ls-12', lessonName: 'Tích phân bất định', lessonNumber: 2, estimatedMinutes: 40 },
                { lessonId: 'ls-13', lessonName: 'Tích phân xác định', lessonNumber: 3, estimatedMinutes: 45 },
                { lessonId: 'ls-14', lessonName: 'Phương pháp đổi biến', lessonNumber: 4, estimatedMinutes: 40 },
                { lessonId: 'ls-15', lessonName: 'Tích phân từng phần', lessonNumber: 5, estimatedMinutes: 40 },
                { lessonId: 'ls-16', lessonName: 'Ứng dụng tích phân', lessonNumber: 6, estimatedMinutes: 50 },
                { lessonId: 'ls-17', lessonName: 'Bài tập tổng hợp', lessonNumber: 7, estimatedMinutes: 50 },
            ],
        },
        {
            chapterId: 'ch-4',
            chapterName: 'Chuỗi số và Chuỗi hàm',
            chapterNumber: 4,
            estimatedMinutes: 200,
            lessons: [
                { lessonId: 'ls-18', lessonName: 'Chuỗi số dương', lessonNumber: 1, estimatedMinutes: 35 },
                { lessonId: 'ls-19', lessonName: 'Chuỗi đan dấu', lessonNumber: 2, estimatedMinutes: 30 },
                { lessonId: 'ls-20', lessonName: 'Chuỗi lũy thừa', lessonNumber: 3, estimatedMinutes: 40 },
                { lessonId: 'ls-21', lessonName: 'Chuỗi Taylor-Maclaurin', lessonNumber: 4, estimatedMinutes: 45 },
                { lessonId: 'ls-22', lessonName: 'Bài tập tổng hợp', lessonNumber: 5, estimatedMinutes: 50 },
            ],
        },
        {
            chapterId: 'ch-5',
            chapterName: 'Phương trình Vi phân',
            chapterNumber: 5,
            estimatedMinutes: 280,
            lessons: [
                { lessonId: 'ls-23', lessonName: 'Phương trình vi phân cấp 1', lessonNumber: 1, estimatedMinutes: 40 },
                { lessonId: 'ls-24', lessonName: 'Phương trình vi phân tách biến', lessonNumber: 2, estimatedMinutes: 35 },
                { lessonId: 'ls-25', lessonName: 'PT vi phân tuyến tính cấp 2', lessonNumber: 3, estimatedMinutes: 45 },
                { lessonId: 'ls-26', lessonName: 'Ứng dụng thực tế', lessonNumber: 4, estimatedMinutes: 50 },
                { lessonId: 'ls-27', lessonName: 'Bài tập tổng hợp', lessonNumber: 5, estimatedMinutes: 60 },
            ],
        },
    ],

    // Recent reviews
    recentReviews: [
        { userId: 'u1', userName: 'Trần Minh Tuấn', avatar: 'https://i.pravatar.cc/40?img=1', rating: 5, comment: 'Khóa học rất hay, giảng viên giảng dễ hiểu!', date: '2 ngày trước' },
        { userId: 'u2', userName: 'Nguyễn Thị Lan', avatar: 'https://i.pravatar.cc/40?img=5', rating: 5, comment: 'Nội dung đầy đủ, bài tập phong phú.', date: '5 ngày trước' },
        { userId: 'u3', userName: 'Lê Hoàng Nam', avatar: 'https://i.pravatar.cc/40?img=8', rating: 4, comment: 'Tốt nhưng cần thêm bài tập thực hành.', date: '1 tuần trước' },
    ],
};
