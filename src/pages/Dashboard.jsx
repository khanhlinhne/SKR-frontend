import { useState } from 'react';
import * as motion from 'motion/react-client';
import DashboardSidebar from '../components/DashboardSidebar';
import {
    Search,
    Bell,
    Clock,
    Target,
    CheckCircle2,
    Star,
    Flame,
    Brain,
    TrendingUp,
    CreditCard,
    FileText,
    Play,
    Sparkles
} from 'lucide-react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('all');

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

    // Mock data phù hợp với SKR
    const stats = {
        studyTime: 13.6, // giờ học
        performance: 85, // % điểm trung bình
        avgTime: '2h 15m', // thời gian học TB/ngày
        flashcardsReviewed: 156, // số flashcard đã ôn
        testsCompleted: 12, // số bài thi đã hoàn thành
        studyStreak: 7 // chuỗi ngày học liên tiếp
    };

    // Lịch ôn tập sắp tới (Spaced Repetition)
    const upcomingReviews = [
        { title: 'Toán Cao Cấp - Đạo Hàm', flashcards: 28, time: '2:00 PM', subject: 'Toán', color: 'blue' },
        { title: 'Tiếng Anh - Vocabulary Unit 5', flashcards: 45, time: '4:30 PM', subject: 'English', color: 'green' }
    ];

    // Môn học của tôi
    const subjects = [
        {
            id: 1,
            name: 'Toán Cao Cấp',
            progress: 68,
            flashcards: 234,
            tests: 8,
            icon: '📐',
            color: 'blue',
            status: 'active'
        },
        {
            id: 2,
            name: 'Tiếng Anh Chuyên Ngành',
            progress: 45,
            flashcards: 567,
            tests: 5,
            icon: '🇬🇧',
            color: 'green',
            status: 'active'
        },
        {
            id: 3,
            name: 'Lập Trình Python',
            progress: 82,
            flashcards: 189,
            tests: 12,
            icon: '🐍',
            color: 'yellow',
            status: 'active'
        },
        {
            id: 4,
            name: 'Cơ Sở Dữ Liệu',
            progress: 100,
            flashcards: 156,
            tests: 10,
            icon: '💾',
            color: 'purple',
            status: 'completed'
        }
    ];

    // Môn học gần đây
    const recentSubject = {
        name: 'Toán Cao Cấp',
        chapter: 'Chương 3: Tích Phân',
        progress: 68,
        flashcards: '156/234 Flashcards',
        icon: '📐'
    };

    // Điểm yếu cần ôn (AI Analysis)
    const weakTopics = [
        { topic: 'Tích phân từng phần', subject: 'Toán', accuracy: 45, priority: 'high' },
        { topic: 'Passive Voice', subject: 'English', accuracy: 62, priority: 'medium' },
        { topic: 'SQL Joins', subject: 'Database', accuracy: 58, priority: 'medium' }
    ];

    // Study time data (12 tháng)
    const studyData = [
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
        { month: 'D', study: 10, practice: 3 }
    ];

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header />

                {/* Dashboard Content */}
                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Study Time Card */}
                        <motion.div
                            variants={cardVariants}
                            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-base-content/60 uppercase tracking-wider">Thời Gian Học</h3>
                                <button className="btn btn-circle btn-ghost btn-sm">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                </button>
                            </div>
                            <div className="mb-4">
                                <h2 className="text-4xl font-black text-base-content mb-2">{stats.studyTime} Giờ</h2>
                                <div className="flex gap-4 text-xs">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Học mới
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                        Ôn tập
                                    </span>
                                </div>
                            </div>
                            {/* Stacked Bar Chart */}
                            <div className="flex items-end justify-between gap-1.5 h-32 relative px-1">
                                {studyData.map((item, i) => {
                                    const maxValue = 17; // Max for scaling
                                    const studyHeight = (item.study / maxValue) * 100;
                                    const practiceHeight = (item.practice / maxValue) * 100;
                                    const isHighlighted = i === 7; // August highlighted

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                                            <div className="w-full flex flex-col gap-0.5 items-center">
                                                {/* Practice bar (orange) on top */}
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${practiceHeight}%` }}
                                                    transition={{ delay: 0.6 + i * 0.05, duration: 0.6 }}
                                                    className={`w-full rounded-t ${isHighlighted ? 'bg-orange-500' : 'bg-orange-400/60'
                                                        }`}
                                                    style={{ minHeight: practiceHeight > 0 ? '3px' : '0' }}
                                                />
                                                {/* Study bar (blue) below */}
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${studyHeight}%` }}
                                                    transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                                                    className={`w-full ${practiceHeight > 0 ? '' : 'rounded-t'
                                                        } ${isHighlighted ? 'bg-blue-500' : 'bg-blue-400/60'}`}
                                                    style={{ minHeight: studyHeight > 0 ? '3px' : '0' }}
                                                />
                                            </div>
                                            <span className="text-[9px] text-base-content/50 font-bold">
                                                {item.month}
                                            </span>
                                        </div>
                                    );
                                })}
                                {/* Tooltip */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.4 }}
                                    className="absolute -top-2 left-[62%] bg-base-content text-base-100 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-lg"
                                >
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content rotate-45"></div>
                                    14H
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Performance Card */}
                        <motion.div
                            variants={cardVariants}
                            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-base-content/60 uppercase tracking-wider">Hiệu Suất</h3>
                                <button className="btn btn-circle btn-ghost btn-sm">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </button>
                            </div>
                            <div className="flex flex-col items-center justify-center py-4">
                                {/* Circular Progress */}
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-base-300"
                                        />
                                        <motion.circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 70}`}
                                            strokeLinecap="round"
                                            className="text-green-500"
                                            initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - stats.performance / 100) }}
                                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-base-content">{stats.performance}%</span>
                                        <span className="text-xs text-base-content/60">Điểm TB</span>
                                    </div>
                                </div>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                    className="text-sm font-bold text-green-600 mt-4 flex items-center gap-1"
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    Tăng 12% so với tuần trước!
                                </motion.p>
                            </div>
                        </motion.div>

                        {/* Upcoming Reviews - Spaced Repetition */}
                        <motion.div
                            variants={cardVariants}
                            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                <h3 className="text-base sm:text-lg font-black text-base-content whitespace-nowrap">Lịch Ôn Tập Hôm Nay</h3>
                                <div className="badge badge-primary badge-sm whitespace-nowrap flex-shrink-0">Spaced Rep.</div>
                            </div>
                            <div className="space-y-3">
                                {upcomingReviews.map((review, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + i * 0.1 }}
                                        className="flex items-center justify-between p-3 rounded-xl bg-base-200 hover:bg-base-300 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-10 h-10 rounded-lg bg-${review.color}-500/10 flex items-center justify-center`}>
                                                <CreditCard className={`w-5 h-5 text-${review.color}-500`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-base-content truncate">{review.title}</h4>
                                                <p className="text-xs text-base-content/60 flex items-center gap-2">
                                                    <Clock className="w-3 h-3" />
                                                    {review.time} • {review.flashcards} flashcards
                                                </p>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none hover:shadow-lg font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            Ôn ngay
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <motion.div
                            variants={cardVariants}
                            className="bg-base-100 rounded-2xl p-4 shadow border border-base-300 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Flame className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs text-base-content/60 font-bold">Study Streak</p>
                                <p className="text-2xl font-black text-base-content flex items-center gap-1">
                                    {stats.studyStreak} Ngày
                                    <Flame className="w-5 h-5 text-orange-500" />
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            className="bg-base-100 rounded-2xl p-4 shadow border border-base-300 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-base-content/60 font-bold">Flashcards Reviewed</p>
                                <p className="text-2xl font-black text-base-content">{stats.flashcardsReviewed}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            className="bg-base-100 rounded-2xl p-4 shadow border border-base-300 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-base-content/60 font-bold">Tests Completed</p>
                                <p className="text-2xl font-black text-base-content">{stats.testsCompleted} Bài</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Subject & AI Weak Topics */}
                        <motion.div
                            variants={cardVariants}
                            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                        >
                            <h3 className="text-lg font-black text-base-content mb-4">Môn Học Gần Đây</h3>
                            <div className="bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-2xl p-4 mb-6 border border-blue-500/10">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                        {recentSubject.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-base-content text-lg">{recentSubject.name}</h4>
                                        <p className="text-sm text-base-content/70">{recentSubject.chapter}</p>
                                        <p className="text-xs text-blue-600 font-bold mt-1">{recentSubject.flashcards}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-base-300 rounded-full h-2.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${recentSubject.progress}%` }}
                                        transition={{ duration: 1, delay: 0.8 }}
                                        className="bg-gradient-to-r from-blue-600 to-violet-600 h-2.5 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* AI Analysis - Weak Topics */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-base-content/60 flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-purple-500" />
                                        Điểm Yếu Cần Ôn (AI Analysis)
                                    </h4>
                                    <div className="badge badge-sm badge-ghost">Premium</div>
                                </div>
                                <div className="space-y-2">
                                    {weakTopics.map((topic, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1 + i * 0.1 }}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors group cursor-pointer"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-sm font-bold text-base-content truncate">{topic.topic}</h5>
                                                    <span className={`badge badge-xs ${topic.priority === 'high' ? 'badge-error' : 'badge-warning'
                                                        }`}>
                                                        {topic.priority === 'high' ? 'Cao' : 'TB'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-base-content/60">{topic.subject} • Độ chính xác: {topic.accuracy}%</p>
                                            </div>
                                            <button className="btn btn-xs btn-ghost text-blue-500 opacity-0 group-hover:opacity-100">
                                                Ôn ngay
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* My Subjects */}
                        <motion.div
                            variants={cardVariants}
                            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-base-content">Môn Học Của Tôi</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`btn btn-xs font-bold ${activeTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                                    >
                                        Tất cả
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('active')}
                                        className={`btn btn-xs font-bold ${activeTab === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                                    >
                                        Đang học
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('completed')}
                                        className={`btn btn-xs font-bold ${activeTab === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
                                    >
                                        Hoàn thành
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {subjects
                                    .filter(subject => activeTab === 'all' || subject.status === activeTab)
                                    .map((subject, i) => (
                                        <motion.div
                                            key={subject.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-4 rounded-xl bg-base-200 hover:bg-base-300 transition-all group cursor-pointer border border-transparent hover:border-blue-500/20"
                                        >
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-base-100 flex items-center justify-center text-2xl shadow-sm">
                                                    {subject.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-base-content truncate">{subject.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-xs text-base-content/60 flex items-center gap-1">
                                                            <CreditCard className="w-3 h-3" />
                                                            {subject.flashcards} thẻ
                                                        </p>
                                                        <p className="text-xs text-base-content/60 flex items-center gap-1">
                                                            <FileText className="w-3 h-3" />
                                                            {subject.tests} bài thi
                                                        </p>
                                                    </div>
                                                </div>
                                                <button className="btn btn-sm btn-circle btn-ghost opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-base-300 rounded-full h-1.5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${subject.progress}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                                                        className={`bg-${subject.color}-500 h-1.5 rounded-full`}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-base-content/60 min-w-[3ch]">{subject.progress}%</span>
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>

                            {/* Add new subject button */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="w-full mt-4 btn btn-outline btn-primary rounded-xl font-bold"
                            >
                                <Sparkles className="w-4 h-4" />
                                Thêm Môn Học Mới
                            </motion.button>
                        </motion.div>
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
                    <h2 className="text-2xl font-black text-base-content">Xin chào, Anh!</h2>
                    <p className="text-sm text-base-content/60 font-medium">Hôm nay bạn muốn học gì?</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm môn học, flashcard, bài thi..."
                            className="input input-bordered w-96 pl-10 rounded-full bg-base-200 border-base-300 focus:border-blue-500"
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

                    {/* User Profile */}
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
