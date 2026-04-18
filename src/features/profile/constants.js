import { Award, CreditCard, FileText, Flame, Target, Trophy } from 'lucide-react';

export const PROFILE_STAT_STYLES = {
    orange: { softBg: 'bg-orange-500/10', text: 'text-orange-500', overlay: 'bg-gradient-to-br from-orange-500/5 to-orange-500/10' },
    blue: { softBg: 'bg-blue-500/10', text: 'text-blue-500', overlay: 'bg-gradient-to-br from-blue-500/5 to-blue-500/10' },
    green: { softBg: 'bg-green-500/10', text: 'text-green-500', overlay: 'bg-gradient-to-br from-green-500/5 to-green-500/10' },
    purple: { softBg: 'bg-purple-500/10', text: 'text-purple-500', overlay: 'bg-gradient-to-br from-purple-500/5 to-purple-500/10' },
    yellow: { softBg: 'bg-yellow-500/10', text: 'text-yellow-500', overlay: 'bg-gradient-to-br from-yellow-500/5 to-yellow-500/10' },
    pink: { softBg: 'bg-pink-500/10', text: 'text-pink-500', overlay: 'bg-gradient-to-br from-pink-500/5 to-pink-500/10' },
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

export const DEFAULT_USER_DATA = {
    name: 'Người dùng SKR',
    email: '',
    phone: '',
    location: '',
    bio: 'Thêm giới thiệu ngắn để các trang học tập hiển thị hồ sơ của bạn đầy đủ hơn.',
    avatarUrl: '',
    joinDate: 'gần đây',
    isPremium: false,
};

export const USER_STATS = {
    studyStreak: 27,
    totalFlashcards: 1234,
    testsCompleted: 45,
    hoursStudied: 156,
    achievements: 12,
    rank: 'Platinum Learner',
};

export const DEFAULT_NOTIFICATIONS = {
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    weeklyReport: true,
    achievements: true,
    communityUpdates: false,
};

export const NOTIFICATION_OPTIONS = [
    { key: 'emailNotifications', label: 'Email thông báo', desc: 'Nhận email về hoạt động và cập nhật quan trọng.' },
    { key: 'pushNotifications', label: 'Thông báo đẩy', desc: 'Nhận nhắc nhở trực tiếp trên trình duyệt.' },
    { key: 'studyReminders', label: 'Nhắc nhở học tập', desc: 'Ôn tập hằng ngày theo lịch đã đặt.' },
    { key: 'weeklyReport', label: 'Báo cáo tuần', desc: 'Tổng kết tiến độ và nhịp học mỗi tuần.' },
    { key: 'achievements', label: 'Thành tích mới', desc: 'Thông báo khi bạn mở khóa mốc tiến bộ mới.' },
    { key: 'communityUpdates', label: 'Cập nhật cộng đồng', desc: 'Tin tức, bài viết và hoạt động từ cộng đồng SKR.' },
];

export const PREMIUM_FEATURES = [
    'AI Assistant không giới hạn',
    'Spaced repetition thông minh',
    'Tải nội dung để học offline',
    'Báo cáo phân tích chuyên sâu',
];

export function getProfileStats(userStats) {
    return [
        { icon: Flame, label: 'Chuỗi học', value: `${userStats.studyStreak} ngày`, color: 'orange' },
        { icon: CreditCard, label: 'Flashcards', value: userStats.totalFlashcards, color: 'blue' },
        { icon: FileText, label: 'Bài test', value: userStats.testsCompleted, color: 'green' },
        { icon: Target, label: 'Giờ học', value: `${userStats.hoursStudied}h`, color: 'purple' },
        { icon: Trophy, label: 'Thành tích', value: userStats.achievements, color: 'yellow' },
        { icon: Award, label: 'Xếp hạng', value: '#156', color: 'pink' },
    ];
}
