import { Code2, Database, Languages, Sigma } from 'lucide-react';

export const SUBJECT_COLOR_STYLES = {
    blue: { softBg: 'bg-blue-500/10', text: 'text-blue-500', bar: 'bg-blue-500' },
    green: { softBg: 'bg-green-500/10', text: 'text-green-500', bar: 'bg-green-500' },
    yellow: { softBg: 'bg-yellow-500/10', text: 'text-yellow-500', bar: 'bg-yellow-500' },
    purple: { softBg: 'bg-purple-500/10', text: 'text-purple-500', bar: 'bg-purple-500' },
};

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
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

export const DASHBOARD_STATS = {
    studyTime: 13.6,
    performance: 85,
    avgTime: '2 giờ 15 phút',
    flashcardsReviewed: 156,
    testsCompleted: 12,
    studyStreak: 7,
};

export const UPCOMING_REVIEWS = [
    {
        title: 'Toán Cao Cấp - Đạo Hàm',
        flashcards: 28,
        time: '14:00',
        subject: 'Toán',
        color: 'blue',
        icon: Sigma,
    },
    {
        title: 'Tiếng Anh - Vocabulary Unit 5',
        flashcards: 45,
        time: '16:30',
        subject: 'Tiếng Anh',
        color: 'green',
        icon: Languages,
    },
];

export const SUBJECTS = [
    { id: 1, name: 'Toán Cao Cấp', progress: 68, flashcards: 234, tests: 8, icon: Sigma, color: 'blue', status: 'active' },
    { id: 2, name: 'Tiếng Anh Chuyên Ngành', progress: 45, flashcards: 567, tests: 5, icon: Languages, color: 'green', status: 'active' },
    { id: 3, name: 'Lập Trình Python', progress: 82, flashcards: 189, tests: 12, icon: Code2, color: 'yellow', status: 'active' },
    { id: 4, name: 'Cơ Sở Dữ Liệu', progress: 100, flashcards: 156, tests: 10, icon: Database, color: 'purple', status: 'completed' },
];

export const RECENT_SUBJECT = {
    name: 'Toán Cao Cấp',
    chapter: 'Chương 3: Tích Phân',
    progress: 68,
    flashcards: '156/234 flashcards',
    icon: Sigma,
};

export const WEAK_TOPICS = [
    { topic: 'Tích phân từng phần', subject: 'Toán', accuracy: 45, priority: 'high' },
    { topic: 'Passive Voice', subject: 'Tiếng Anh', accuracy: 62, priority: 'medium' },
    { topic: 'SQL Joins', subject: 'Cơ Sở Dữ Liệu', accuracy: 58, priority: 'medium' },
];

export const STUDY_DATA = [
    { month: 'T1', study: 8, practice: 3 },
    { month: 'T2', study: 10, practice: 4 },
    { month: 'T3', study: 7, practice: 2 },
    { month: 'T4', study: 9, practice: 5 },
    { month: 'T5', study: 12, practice: 4 },
    { month: 'T6', study: 11, practice: 3 },
    { month: 'T7', study: 8, practice: 2 },
    { month: 'T8', study: 14, practice: 6 },
    { month: 'T9', study: 10, practice: 4 },
    { month: 'T10', study: 13, practice: 5 },
    { month: 'T11', study: 11, practice: 4 },
    { month: 'T12', study: 10, practice: 3 },
];
