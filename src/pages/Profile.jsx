import { useState } from 'react';
import * as motion from 'motion/react-client';
import DashboardSidebar from '../components/DashboardSidebar';
import {
    Search,
    Bell,
    Camera,
    Mail,
    Calendar as CalendarIcon,
    Award,
    Star,
    Flame,
    Target,
    Trophy,
    Edit2,
    Save,
    Settings,
    Lock,
    Eye,
    EyeOff,
    Shield,
    Zap,
    CreditCard,
    FileText,
    User as UserIcon
} from 'lucide-react';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
        }
    };

    // Mock user data
    const [userData, setUserData] = useState({
        name: 'Đoàn Thế Anh',
        email: 'anh.nguyen@skr.edu.vn',
        phone: '+84 912 345 678',
        location: 'Hà Nội, Việt Nam',
        bio: 'Sinh viên năm 3 ngành Công nghệ thông tin. Đam mê học AI và Machine Learning.',
        joinDate: 'Tháng 1, 2024',
        isPremium: true
    });

    // User stats
    const userStats = {
        studyStreak: 27,
        totalFlashcards: 1234,
        testsCompleted: 45,
        hoursStudied: 156,
        achievements: 12,
        rank: 'Platinum Learner'
    };

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        studyReminders: true,
        weeklyReport: true,
        achievements: true,
        communityUpdates: false
    });

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header />

                {/* Profile Content */}
                <motion.main
                    className="flex-1 overflow-y-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Profile Header with Cover */}
                    <motion.div
                        variants={cardVariants}
                        className="relative h-64 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 overflow-hidden"
                    >
                        {/* Animated background elements */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0]
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                rotate: [90, 0, 90]
                            }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                        />

                        {/* Profile Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <div className="max-w-7xl mx-auto flex items-end gap-6">
                                {/* Avatar */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="relative group"
                                >
                                    <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-2xl bg-base-100">
                                        <img
                                            src="https://i.pravatar.cc/200?img=33"
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="absolute bottom-2 right-2 btn btn-circle btn-sm bg-white text-blue-600 border-none shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>

                                {/* User Info */}
                                <div className="flex-1 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-black text-white">{userData.name}</h1>
                                        {userData.isPremium && (
                                            <div className="badge bg-orange-500 border-none text-white font-bold gap-1 px-3 py-3">
                                                <Star className="w-3 h-3 fill-white" />
                                                Premium
                                            </div>
                                        )}
                                        <div className="badge bg-purple-500 border-none text-white font-bold px-3 py-3">
                                            {userStats.rank}
                                        </div>
                                    </div>
                                    <p className="text-white/90 text-sm mb-3 max-w-2xl">{userData.bio}</p>
                                    <div className="flex items-center gap-4 text-white/80 text-sm">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            {userData.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            Tham gia {userData.joinDate}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pb-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="btn bg-white text-blue-600 border-none font-bold rounded-xl hover:shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn btn-ghost text-white border-white/30 hover:bg-white/10 font-bold rounded-xl"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="max-w-7xl mx-auto px-8 pt-8 mb-8 bg-base-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 bg-base-200 py-6 rounded-3xl">
                            {[
                                { icon: Flame, label: 'Study Streak', value: `${userStats.studyStreak} ngày`, color: 'orange' },
                                { icon: CreditCard, label: 'Flashcards', value: userStats.totalFlashcards, color: 'blue' },
                                { icon: FileText, label: 'Tests', value: userStats.testsCompleted, color: 'green' },
                                { icon: Target, label: 'Study Hours', value: `${userStats.hoursStudied}h`, color: 'purple' },
                                { icon: Trophy, label: 'Achievements', value: userStats.achievements, color: 'yellow' },
                                { icon: Award, label: 'Rank', value: '#156', color: 'pink' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    variants={cardVariants}
                                    initial="collapsed"
                                    animate="collapsed"
                                    whileHover="expanded"
                                    className="bg-base-100 rounded-2xl shadow-lg border border-base-300 cursor-pointer overflow-hidden relative group"
                                >
                                    <motion.div
                                        className="p-4 flex flex-col items-center justify-center"
                                        variants={{
                                            collapsed: {
                                                height: 'auto',
                                                transition: { duration: 0.3 }
                                            },
                                            expanded: {
                                                height: 'auto',
                                                transition: { duration: 0.3 }
                                            }
                                        }}
                                    >
                                        {/* Icon - always visible */}
                                        <motion.div
                                            className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}
                                            variants={{
                                                collapsed: {
                                                    scale: 1,
                                                    marginBottom: 0
                                                },
                                                expanded: {
                                                    scale: 1.1,
                                                    marginBottom: 12,
                                                    transition: { duration: 0.3 }
                                                }
                                            }}
                                        >
                                            <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                                        </motion.div>

                                        {/* Value and Label - only visible on hover */}
                                        <motion.div
                                            className="text-center"
                                            variants={{
                                                collapsed: {
                                                    opacity: 0,
                                                    height: 0,
                                                    transition: { duration: 0.2 }
                                                },
                                                expanded: {
                                                    opacity: 1,
                                                    height: 'auto',
                                                    transition: { duration: 0.3, delay: 0.1 }
                                                }
                                            }}
                                        >
                                            <p className="text-2xl font-black text-base-content mb-1">{stat.value}</p>
                                            <p className="text-xs text-base-content/60 font-bold whitespace-nowrap">{stat.label}</p>
                                        </motion.div>
                                    </motion.div>

                                    {/* Hover glow effect */}
                                    <motion.div
                                        className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 to-${stat.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="max-w-7xl mx-auto px-8 pb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Profile Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Personal Information */}
                                <motion.div
                                    variants={cardVariants}
                                    className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-base-content flex items-center gap-2">
                                            <UserIcon className="w-5 h-5" />
                                            Thông Tin Cá Nhân
                                        </h2>
                                        {isEditing && (
                                            <button className="btn btn-sm btn-primary rounded-xl font-bold">
                                                <Save className="w-4 h-4" />
                                                Lưu thay đổi
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-bold">Họ và tên</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={userData.name}
                                                disabled={!isEditing}
                                                className="input input-bordered rounded-xl font-medium"
                                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                            />
                                        </div>


                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-bold">Email</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={userData.email}
                                                disabled={!isEditing}
                                                className="input input-bordered rounded-xl font-medium"
                                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-bold">Số điện thoại</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={userData.phone}
                                                disabled={!isEditing}
                                                className="input input-bordered rounded-xl font-medium"
                                                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-bold">Địa chỉ</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={userData.location}
                                                disabled={!isEditing}
                                                className="input input-bordered rounded-xl font-medium"
                                                onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-bold">Giới thiệu bản thân</span>
                                            </label>
                                            <textarea
                                                value={userData.bio}
                                                disabled={!isEditing}
                                                className="textarea textarea-bordered rounded-xl font-medium h-24"
                                                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Security Settings */}
                                <motion.div
                                    variants={cardVariants}
                                    className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                                >
                                    <h2 className="text-xl font-black text-base-content flex items-center gap-2 mb-6">
                                        <Shield className="w-5 h-5" />
                                        Bảo Mật
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-bold">Mật khẩu hiện tại</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="input input-bordered w-full rounded-xl font-medium pr-12"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-bold">Mật khẩu mới</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="input input-bordered w-full rounded-xl font-medium pr-12"
                                                />
                                                <button
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-bold">Xác nhận mật khẩu mới</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="input input-bordered w-full rounded-xl font-medium pr-12"
                                                />
                                                <button
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="btn btn-outline btn-primary rounded-xl font-bold w-full"
                                        >
                                            <Lock className="w-4 h-4" />
                                            Đổi mật khẩu
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Column - Settings & Preferences */}
                            <div className="space-y-6">
                                {/* Notification Settings */}
                                <motion.div
                                    variants={cardVariants}
                                    className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                                >
                                    <h2 className="text-xl font-black text-base-content flex items-center gap-2 mb-6">
                                        <Bell className="w-5 h-5" />
                                        Thông Báo
                                    </h2>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'emailNotifications', label: 'Email thông báo', desc: 'Nhận email về hoạt động' },
                                            { key: 'pushNotifications', label: 'Push notifications', desc: 'Thông báo trên trình duyệt' },
                                            { key: 'studyReminders', label: 'Nhắc nhở học tập', desc: 'Nhắc nhở ôn tập hàng ngày' },
                                            { key: 'weeklyReport', label: 'Báo cáo tuần', desc: 'Tổng kết tiến độ hàng tuần' },
                                            { key: 'achievements', label: 'Thành tích mới', desc: 'Thông báo khi đạt thành tích' },
                                            { key: 'communityUpdates', label: 'Cập nhật cộng đồng', desc: 'Tin tức từ cộng đồng SKR' }
                                        ].map((setting) => (
                                            <div key={setting.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-base-200 transition-colors">
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-base-content">{setting.label}</p>
                                                    <p className="text-xs text-base-content/60">{setting.desc}</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-primary"
                                                    checked={notifications[setting.key]}
                                                    onChange={(e) => setNotifications({
                                                        ...notifications,
                                                        [setting.key]: e.target.checked
                                                    })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Premium Status */}
                                {userData.isPremium && (
                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-3xl p-6 border border-orange-500/20"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="w-6 h-6 text-orange-500" />
                                            <h3 className="text-lg font-black text-base-content">Premium Active</h3>
                                        </div>
                                        <p className="text-sm text-base-content/70 mb-4">
                                            Gói Premium của bạn còn hiệu lực đến <span className="font-bold text-orange-500">31/12/2024</span>
                                        </p>
                                        <div className="space-y-2 mb-4">
                                            {['AI Assistant không giới hạn', 'Spaced Repetition thông minh', 'Download offline', 'Thách đấu nâng cao'].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                                                    <span className="font-medium text-base-content/80">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="btn btn-sm w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-none rounded-xl font-bold">
                                            Gia hạn Premium
                                        </button>
                                    </motion.div>
                                )}

                                {/* Danger Zone */}
                                <motion.div
                                    variants={cardVariants}
                                    className="bg-base-100 rounded-3xl p-6 shadow-lg border border-red-500/20"
                                >
                                    <h2 className="text-xl font-black text-red-500 mb-4">Vùng Nguy Hiểm</h2>
                                    <p className="text-sm text-base-content/70 mb-4">
                                        Các hành động này không thể hoàn tác. Vui lòng cân nhắc kỹ.
                                    </p>
                                    <div className="space-y-2">
                                        <button className="btn btn-sm btn-outline btn-error w-full rounded-xl font-bold">
                                            Xóa tất cả dữ liệu
                                        </button>
                                        <button className="btn btn-sm btn-error w-full rounded-xl font-bold">
                                            Xóa tài khoản
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.main>
            </div>
        </div>
    );
}

// Header Component
function Header() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-b border-base-300 px-8 py-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-base-content">Hồ Sơ Cá Nhân</h2>
                    <p className="text-sm text-base-content/60 font-medium">Quản lý thông tin và cài đặt tài khoản</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm cài đặt..."
                            className="input input-bordered w-80 pl-10 rounded-full bg-base-200 border-base-300 focus:border-blue-500"
                        />
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>

                    {/* Notifications */}
                    <div className="indicator">
                        <span className="indicator-item badge badge-sm badge-primary">3</span>
                        <button className="btn btn-circle btn-ghost">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
