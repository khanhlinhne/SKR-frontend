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
    avgTime: '2h 15m',
    flashcardsReviewed: 156,
    testsCompleted: 12,
    studyStreak: 7,
};

export const UPCOMING_REVIEWS = [
    { title: 'Toan Cao Cap - Dao Ham', flashcards: 28, time: '2:00 PM', subject: 'Toan', color: 'blue' },
    { title: 'Tieng Anh - Vocabulary Unit 5', flashcards: 45, time: '4:30 PM', subject: 'English', color: 'green' },
];

export const SUBJECTS = [
    { id: 1, name: 'Toan Cao Cap', progress: 68, flashcards: 234, tests: 8, icon: '??', color: 'blue', status: 'active' },
    { id: 2, name: 'Tieng Anh Chuyen Nganh', progress: 45, flashcards: 567, tests: 5, icon: '????', color: 'green', status: 'active' },
    { id: 3, name: 'Lap Trinh Python', progress: 82, flashcards: 189, tests: 12, icon: '??', color: 'yellow', status: 'active' },
    { id: 4, name: 'Co So Du Lieu', progress: 100, flashcards: 156, tests: 10, icon: '??', color: 'purple', status: 'completed' },
];

export const RECENT_SUBJECT = {
    name: 'Toan Cao Cap',
    chapter: 'Chuong 3: Tich Phan',
    progress: 68,
    flashcards: '156/234 Flashcards',
    icon: '??',
};

export const WEAK_TOPICS = [
    { topic: 'Tich phan tung phan', subject: 'Toan', accuracy: 45, priority: 'high' },
    { topic: 'Passive Voice', subject: 'English', accuracy: 62, priority: 'medium' },
    { topic: 'SQL Joins', subject: 'Database', accuracy: 58, priority: 'medium' },
];

export const STUDY_DATA = [
    { month: 'J', study: 8, practice: 3 },
    { month: 'F', study: 10, practice: 4 },
    { month: 'M', study: 7, practice: 2 },
    { month: 'A', study: 9, practice: 5 },
    { month: 'M', study: 12, practice: 4 },
    { month: 'J', study: 11, practice: 3 },
    { month: 'J', study: 8, practice: 2 },
    { month: 'A', study: 14, practice: 6 },
    { month: 'S', study: 10, practice: 4 },
    { month: 'O', study: 13, practice: 5 },
    { month: 'N', study: 11, practice: 4 },
    { month: 'D', study: 10, practice: 3 },
];
