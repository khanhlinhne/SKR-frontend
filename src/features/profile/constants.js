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
    name: 'Doan The Anh',
    email: 'anh.nguyen@skr.edu.vn',
    phone: '+84 912 345 678',
    location: 'Ha Noi, Viet Nam',
    bio: 'Sinh vien nam 3 nganh Cong nghe thong tin. Dam me hoc AI va Machine Learning.',
    joinDate: 'Thang 1, 2024',
    isPremium: true,
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
    { key: 'emailNotifications', label: 'Email thong bao', desc: 'Nhan email ve hoat dong' },
    { key: 'pushNotifications', label: 'Push notifications', desc: 'Thong bao tren trinh duyet' },
    { key: 'studyReminders', label: 'Nhac nho hoc tap', desc: 'Nhac nho on tap hang ngay' },
    { key: 'weeklyReport', label: 'Bao cao tuan', desc: 'Tong ket tien do hang tuan' },
    { key: 'achievements', label: 'Thanh tich moi', desc: 'Thong bao khi dat thanh tich' },
    { key: 'communityUpdates', label: 'Cap nhat cong dong', desc: 'Tin tuc tu cong dong SKR' },
];

export const PREMIUM_FEATURES = [
    'AI Assistant khong gioi han',
    'Spaced Repetition thong minh',
    'Download offline',
    'Thach dau nang cao',
];

export function getProfileStats(userStats) {
    return [
        { icon: Flame, label: 'Study Streak', value: `${userStats.studyStreak} ngay`, color: 'orange' },
        { icon: CreditCard, label: 'Flashcards', value: userStats.totalFlashcards, color: 'blue' },
        { icon: FileText, label: 'Tests', value: userStats.testsCompleted, color: 'green' },
        { icon: Target, label: 'Study Hours', value: `${userStats.hoursStudied}h`, color: 'purple' },
        { icon: Trophy, label: 'Achievements', value: userStats.achievements, color: 'yellow' },
        { icon: Award, label: 'Rank', value: '#156', color: 'pink' },
    ];
}
