import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    LearnSidebar,
    LearnVideoPlayer,
    LearnLessonContent,
    LearnHeader,
} from '../components/learn';

// ─── Mock Data ──────────────────────────────────────────
// Mirrors CourseDetail.jsx data — will be replaced by API calls

const experts = [
    { id: 1, name: 'TS. Nguyễn Văn Minh', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 2, name: 'ThS. Trần Thu Hà', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, name: 'TS. Đoàn Thế Anh', avatar: 'https://i.pravatar.cc/150?img=12' },
    { id: 4, name: 'PGS. Phạm Thanh Tùng', avatar: 'https://i.pravatar.cc/150?img=53' },
    { id: 5, name: 'ThS. Lê Hoàng Nam', avatar: 'https://i.pravatar.cc/150?img=60' },
];

const allCourses = [
    {
        id: 1, title: 'Toán Cao Cấp - Giải Tích & Đại Số', expertId: 1,
        gradient: 'from-blue-500 to-cyan-500', icon: '📐',
        totalChapters: 12, totalLessons: 48, tags: ['Đạo hàm', 'Tích phân', 'Ma trận', 'Giới hạn', 'Chuỗi số'],
    },
    {
        id: 2, title: 'IELTS Academic - Lộ Trình 7.0+', expertId: 2,
        gradient: 'from-emerald-500 to-teal-500', icon: '🇬🇧',
        totalChapters: 16, totalLessons: 64, tags: ['Reading', 'Writing', 'Speaking', 'Listening'],
    },
    {
        id: 3, title: 'Python & AI - Từ Cơ Bản Đến Ứng Dụng', expertId: 3,
        gradient: 'from-violet-500 to-purple-500', icon: '🐍',
        totalChapters: 14, totalLessons: 56, tags: ['Python', 'Machine Learning', 'Deep Learning', 'NumPy', 'Pandas'],
    },
    {
        id: 4, title: 'Nhập Môn Cơ Sở Dữ Liệu', expertId: 3,
        gradient: 'from-amber-500 to-orange-500', icon: '💾',
        totalChapters: 8, totalLessons: 32, tags: ['SQL', 'ERD', 'Normalization', 'MySQL'],
    },
    {
        id: 5, title: 'Vật Lý Đại Cương - Cơ Học & Nhiệt', expertId: 4,
        gradient: 'from-rose-500 to-pink-500', icon: '⚛️',
        totalChapters: 10, totalLessons: 40, tags: ['Newton', 'Nhiệt động', 'Sóng', 'Điện từ'],
    },
    {
        id: 6, title: 'Kinh Tế Vĩ Mô Nâng Cao', expertId: 5,
        gradient: 'from-indigo-500 to-sky-500', icon: '📊',
        totalChapters: 11, totalLessons: 44, tags: ['GDP', 'Lạm phát', 'Chính sách', 'Tỷ giá'],
    },
    {
        id: 7, title: 'React & Next.js - Fullstack Web Development', expertId: 3,
        gradient: 'from-cyan-500 to-blue-500', icon: '⚛️',
        totalChapters: 18, totalLessons: 72, tags: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Prisma'],
    },
    {
        id: 8, title: 'Luyện Thi TOEIC 800+', expertId: 2,
        gradient: 'from-teal-500 to-emerald-500', icon: '📝',
        totalChapters: 12, totalLessons: 48, tags: ['Listening', 'Reading', 'Grammar', 'Vocabulary'],
    },
    {
        id: 9, title: 'Xác Suất Thống Kê Ứng Dụng', expertId: 1,
        gradient: 'from-fuchsia-500 to-pink-500', icon: '🎲',
        totalChapters: 6, totalLessons: 24, tags: ['Xác suất', 'Phân phối', 'Kiểm định', 'Hồi quy'],
    },
];

// ─── Chapter Generator ──────────────────────────────────

const chaptersDataMap = {
    1: [
        {
            title: 'Giới hạn và Liên tục',
            lessons: [
                { title: 'Khái niệm giới hạn hàm số', type: 'video', durationMinutes: 25, isPreview: true },
                { title: 'Các quy tắc tính giới hạn', type: 'video', durationMinutes: 30, isPreview: false },
                { title: 'Tài liệu: Bảng công thức giới hạn', type: 'document', durationMinutes: 10, isPreview: true },
                { title: 'Bài tập giới hạn', type: 'quiz', durationMinutes: 20, isPreview: false },
            ],
        },
        {
            title: 'Đạo hàm',
            lessons: [
                { title: 'Định nghĩa và ý nghĩa đạo hàm', type: 'video', durationMinutes: 35, isPreview: true },
                { title: 'Quy tắc đạo hàm cơ bản', type: 'video', durationMinutes: 28, isPreview: false },
                { title: 'Đạo hàm hàm hợp', type: 'video', durationMinutes: 22, isPreview: false },
                { title: 'Flashcard: Bảng đạo hàm', type: 'flashcard', durationMinutes: 15, isPreview: false },
                { title: 'Bài kiểm tra chương 2', type: 'quiz', durationMinutes: 25, isPreview: false },
            ],
        },
        {
            title: 'Tích phân',
            lessons: [
                { title: 'Nguyên hàm và tích phân bất định', type: 'video', durationMinutes: 32, isPreview: false },
                { title: 'Phương pháp tích phân từng phần', type: 'video', durationMinutes: 28, isPreview: false },
                { title: 'Tích phân xác định và ứng dụng', type: 'video', durationMinutes: 35, isPreview: false },
                { title: 'Tài liệu: Bảng tích phân thường gặp', type: 'document', durationMinutes: 10, isPreview: false },
            ],
        },
        {
            title: 'Ma trận và Định thức',
            lessons: [
                { title: 'Phép toán ma trận cơ bản', type: 'video', durationMinutes: 30, isPreview: false },
                { title: 'Tính định thức ma trận', type: 'video', durationMinutes: 25, isPreview: false },
                { title: 'Ma trận khả nghịch', type: 'video', durationMinutes: 22, isPreview: false },
                { title: 'Bài kiểm tra chương 4', type: 'quiz', durationMinutes: 20, isPreview: false },
            ],
        },
    ],
    4: [
        {
            title: 'Giới thiệu CSDL',
            lessons: [
                { title: 'Tổng quan về Cơ sở dữ liệu', type: 'video', durationMinutes: 20, isPreview: true },
                { title: 'Mô hình dữ liệu quan hệ', type: 'video', durationMinutes: 28, isPreview: false },
                { title: 'Tài liệu: Thuật ngữ CSDL', type: 'document', durationMinutes: 10, isPreview: true },
                { title: 'Bài tập nhập môn', type: 'quiz', durationMinutes: 15, isPreview: false },
            ],
        },
        {
            title: 'Thiết kế ERD',
            lessons: [
                { title: 'Entity-Relationship Diagram', type: 'video', durationMinutes: 35, isPreview: false },
                { title: 'Quan hệ 1-1, 1-N, N-N', type: 'video', durationMinutes: 30, isPreview: false },
                { title: 'Flashcard: Ký hiệu ERD', type: 'flashcard', durationMinutes: 12, isPreview: false },
                { title: 'Thực hành thiết kế ERD', type: 'quiz', durationMinutes: 25, isPreview: false },
            ],
        },
        {
            title: 'Chuẩn hóa dữ liệu',
            lessons: [
                { title: 'Chuẩn 1NF, 2NF, 3NF', type: 'video', durationMinutes: 32, isPreview: false },
                { title: 'Chuẩn BCNF và 4NF', type: 'video', durationMinutes: 28, isPreview: false },
                { title: 'Tài liệu: Bảng tóm tắt chuẩn hóa', type: 'document', durationMinutes: 8, isPreview: false },
                { title: 'Bài kiểm tra chuẩn hóa', type: 'quiz', durationMinutes: 20, isPreview: false },
            ],
        },
        {
            title: 'SQL cơ bản',
            lessons: [
                { title: 'SELECT, WHERE, ORDER BY', type: 'video', durationMinutes: 30, isPreview: false },
                { title: 'JOIN và Subquery', type: 'video', durationMinutes: 35, isPreview: false },
                { title: 'INSERT, UPDATE, DELETE', type: 'video', durationMinutes: 22, isPreview: false },
                { title: 'Flashcard: Cú pháp SQL', type: 'flashcard', durationMinutes: 15, isPreview: false },
                { title: 'Bài kiểm tra SQL', type: 'quiz', durationMinutes: 25, isPreview: false },
            ],
        },
    ],
    3: [
        {
            title: 'Giới thiệu Python',
            lessons: [
                { title: 'Cài đặt môi trường Python', type: 'video', durationMinutes: 15, isPreview: true },
                { title: 'Cú pháp cơ bản & kiểu dữ liệu', type: 'video', durationMinutes: 35, isPreview: true },
                { title: 'Hàm và Module', type: 'video', durationMinutes: 28, isPreview: false },
                { title: 'Tài liệu: Python Cheat Sheet', type: 'document', durationMinutes: 10, isPreview: true },
            ],
        },
        {
            title: 'Xử lý dữ liệu với NumPy & Pandas',
            lessons: [
                { title: 'NumPy Arrays và Operations', type: 'video', durationMinutes: 32, isPreview: false },
                { title: 'Pandas DataFrame cơ bản', type: 'video', durationMinutes: 30, isPreview: false },
                { title: 'Data Cleaning & Transformation', type: 'video', durationMinutes: 35, isPreview: false },
                { title: 'Flashcard: NumPy/Pandas', type: 'flashcard', durationMinutes: 15, isPreview: false },
            ],
        },
        {
            title: 'Machine Learning cơ bản',
            lessons: [
                { title: 'Giới thiệu Machine Learning', type: 'video', durationMinutes: 25, isPreview: true },
                { title: 'Linear Regression', type: 'video', durationMinutes: 40, isPreview: false },
                { title: 'Classification với Decision Tree', type: 'video', durationMinutes: 35, isPreview: false },
                { title: 'Bài kiểm tra: ML Foundations', type: 'quiz', durationMinutes: 20, isPreview: false },
            ],
        },
        {
            title: 'Deep Learning với TensorFlow',
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

function generateChapters(course) {
    if (chaptersDataMap[course.id]) return chaptersDataMap[course.id];

    // Auto-generate for courses without explicit data
    const chapters = [];
    const lessonsPerChapter = Math.ceil(course.totalLessons / course.totalChapters);

    for (let i = 0; i < Math.min(course.totalChapters, 5); i++) {
        const lessons = [];
        for (let j = 0; j < Math.min(lessonsPerChapter, 5); j++) {
            const types = ['video', 'video', 'document', 'flashcard', 'quiz'];
            lessons.push({
                title: `${course.tags?.[j % course.tags.length] || 'Nội dung'} - Bài ${j + 1}`,
                type: types[j % types.length],
                durationMinutes: Math.floor(Math.random() * 20) + 15,
                isPreview: i === 0 && j === 0,
            });
        }
        chapters.push({
            title: `Chương ${i + 1}: ${course.tags?.[i % course.tags.length] || `Phần ${i + 1}`}`,
            lessons,
        });
    }
    return chapters;
}

// ─── Learn Page ─────────────────────────────────────────

export default function Learn() {
    const { id } = useParams();

    // Find course
    const course = useMemo(
        () => allCourses.find(c => c.id === Number(id)),
        [id]
    );
    const expert = useMemo(
        () => course ? experts.find(e => e.id === course.expertId) : null,
        [course]
    );
    const chapters = useMemo(
        () => course ? generateChapters(course) : [],
        [course]
    );

    // Active lesson state
    const [activeChapter, setActiveChapter] = useState(0);
    const [activeLesson, setActiveLesson] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [completedLessons, setCompletedLessons] = useState({
        // Pre-populate some completed lessons for demo
        '0-0': true,
        '0-1': true,
    });

    // Derived data
    const currentChapter = chapters[activeChapter];
    const currentLesson = currentChapter?.lessons[activeLesson];

    // Find next lesson
    const nextLesson = useMemo(() => {
        if (!currentChapter) return null;

        // Next in same chapter
        if (activeLesson < currentChapter.lessons.length - 1) {
            return currentChapter.lessons[activeLesson + 1];
        }
        // First of next chapter
        if (activeChapter < chapters.length - 1) {
            return chapters[activeChapter + 1]?.lessons[0];
        }
        return null;
    }, [activeChapter, activeLesson, chapters, currentChapter]);

    // Overall progress
    const totalLessons = chapters.reduce((a, ch) => a + ch.lessons.length, 0);
    const completedCount = Object.keys(completedLessons).length;
    const overallProgress = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

    // Handlers
    const handleLessonSelect = useCallback((chIdx, lIdx) => {
        setActiveChapter(chIdx);
        setActiveLesson(lIdx);
        setIsPlaying(false);
    }, []);

    const handleTogglePlay = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleComplete = useCallback(() => {
        const key = `${activeChapter}-${activeLesson}`;
        setCompletedLessons(prev => {
            if (prev[key]) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: true };
        });
    }, [activeChapter, activeLesson]);

    const handleNext = useCallback(() => {
        if (activeLesson < (currentChapter?.lessons.length || 0) - 1) {
            setActiveLesson(prev => prev + 1);
        } else if (activeChapter < chapters.length - 1) {
            setActiveChapter(prev => prev + 1);
            setActiveLesson(0);
        }
        setIsPlaying(false);
    }, [activeChapter, activeLesson, chapters.length, currentChapter?.lessons.length]);

    // Guard: course not found
    if (!course) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <div className="text-center">
                    <p className="text-6xl mb-4">😮</p>
                    <h2 className="text-xl font-black text-base-content mb-2">
                        Không tìm thấy khóa học
                    </h2>
                    <p className="text-sm text-base-content/50">
                        Khóa học này không tồn tại hoặc đã bị xóa.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Curriculum Sidebar */}
            <LearnSidebar
                chapters={chapters}
                activeChapter={activeChapter}
                activeLesson={activeLesson}
                completedLessons={completedLessons}
                onLessonSelect={handleLessonSelect}
                courseGradient={course.gradient}
                courseIcon={course.icon}
                courseTitle={course.title}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <LearnHeader
                    course={course}
                    lessonTitle={currentLesson?.title || ''}
                    progress={overallProgress}
                />

                {/* Scrollable content area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto px-6 py-6">
                        {/* Video Player */}
                        <LearnVideoPlayer
                            lesson={currentLesson}
                            gradient={course.gradient}
                            isPlaying={isPlaying}
                            onTogglePlay={handleTogglePlay}
                        />

                        {/* Lesson Content */}
                        <LearnLessonContent
                            lesson={currentLesson}
                            chapter={currentChapter}
                            nextLesson={nextLesson}
                            expertName={expert?.name}
                            expertAvatar={expert?.avatar}
                            gradient={course.gradient}
                            onNext={handleNext}
                            onComplete={handleComplete}
                            isCompleted={!!completedLessons[`${activeChapter}-${activeLesson}`]}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
