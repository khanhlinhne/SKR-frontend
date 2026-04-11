import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import { OwlDialog, OwlLoader, StatCard, ViewToggle, useOwlDialog } from '@/shared/ui/common';
import quizApi from '@/shared/api/quizApi';
import Icon from '@/shared/ui/icons/Icon';
import {
    TestCard,
    TestListItem,
    TestsHeader,
    CreateTestModal,
    DIFFICULTY_CONFIG,
} from '@/features/tests/components';
import { useQuizPractices } from '@/features/tests/hooks/useQuiz';

const SYSTEM_PRACTICE_SEED_TITLES = new Set([
    'kiem tra kien thuc lap trinh web co ban',
    'thu thach javascript nang cao',
    'on tap git & devops',
    'tong hop kien thuc backend',
    'mini quiz - nhanh tri cntt',
]);

function normalizePracticeTitle(title) {
    return String(title || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

function isDeletablePractice(test) {
    return !SYSTEM_PRACTICE_SEED_TITLES.has(normalizePracticeTitle(test?.testTitle));
}

/**
 * Tests Page — Danh sách bài thi thử
 * Route: /tests
 * Data: quizApi.getPractices()
 */
export default function Tests() {
    const { practices, loading, error, refresh } = useQuizPractices();
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();

    const [viewMode, setViewMode] = useState('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [deletingTestId, setDeletingTestId] = useState(null);

    // Track if initial animation has played
    const [hasAnimated, setHasAnimated] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setHasAnimated(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: hasAnimated ? 0 : 0.08, delayChildren: hasAnimated ? 0 : 0.1 }
        }
    };

    const cardVariants = hasAnimated ? {
        hidden: { opacity: 1, y: 0, scale: 1 },
        visible: { opacity: 1, y: 0, scale: 1 }
    } : {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1, y: 0, scale: 1,
            transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
        }
    };

    // Stats
    const stats = {
        totalTests: practices.length,
        totalAttempts: practices.reduce((sum, t) => sum + (t.attemptsCount || 0), 0),
        avgScore: (() => {
            const scored = practices.filter(t => t.averageScore != null);
            return scored.length > 0
                ? (scored.reduce((sum, t) => sum + Number(t.averageScore), 0) / scored.length).toFixed(1)
                : '—';
        })(),
        bestScore: (() => {
            const scored = practices.filter(t => t.bestScore != null);
            return scored.length > 0 ? Math.max(...scored.map(t => Number(t.bestScore))).toFixed(1) + '%' : '—';
        })(),
    };

    // Filter & Sort
    const filteredTests = practices
        .filter(t => filterDifficulty === 'all' || t.difficultyLevels?.includes(filterDifficulty))
        .sort((a, b) => {
            switch (sortBy) {
                case 'recent': return new Date(b.lastAttemptAtUtc || 0) - new Date(a.lastAttemptAtUtc || 0);
                case 'score': return (Number(b.bestScore) || 0) - (Number(a.bestScore) || 0);
                case 'attempts': return (b.attemptsCount || 0) - (a.attemptsCount || 0);
                case 'name': return (a.testTitle || '').localeCompare(b.testTitle || '');
                default: return 0;
            }
        });
    const deletableFilteredTests = filteredTests.filter(isDeletablePractice);

    const handleCreateTest = () => {
        refresh(); // Refetch after creating
    };

    const handleDeleteTest = (test) => {
        if (!isDeletablePractice(test)) {
            return;
        }

        openDialog({
            variant: 'warning',
            title: 'Xóa bài thi này?',
            message: `Cú nhắc bạn rằng bài thi "${test.testTitle}" sẽ bị xóa khỏi danh sách luyện tập của bạn.`,
            details: 'Bạn vẫn nên cân nhắc nếu bài thi này đang có lịch sử làm bài hoặc kết quả muốn giữ lại.',
            confirmLabel: 'Xóa bài thi',
            cancelLabel: 'Giữ lại',
            showCancel: true,
            confirmTone: 'danger',
            onConfirm: async () => {
                try {
                    setDeletingTestId(test.practiceTestId);
                    await quizApi.deletePractice(test.practiceTestId);
                    await refresh();
                    openDialog({
                        variant: 'success',
                        title: 'Đã xóa bài thi',
                        message: `Bài thi "${test.testTitle}" đã được gỡ khỏi danh sách của bạn.`,
                        details: 'Nếu cần, bạn có thể tạo lại một bài thi mới với bộ câu hỏi khác.',
                        confirmLabel: 'Đã hiểu',
                        confirmTone: 'success',
                    });
                } catch (deleteError) {
                    const backendMessage = deleteError?.response?.data?.message || '';
                    if (deleteError?.response?.status === 404) {
                        await refresh();
                        openDialog({
                            variant: 'warning',
                            title: 'Bài thi không còn trong danh sách',
                            message: backendMessage || 'Bài thi này đã bị xóa hoặc không còn khả dụng.',
                            details: 'Cú đã làm mới lại danh sách để đồng bộ với backend.',
                            confirmLabel: 'Đã hiểu',
                            confirmTone: 'warning',
                        });
                    } else {
                        openDialog({
                            variant: 'error',
                            title: 'Chưa thể xóa bài thi',
                            message: backendMessage || 'Máy chủ chưa xử lý được yêu cầu xóa bài thi này.',
                            details: 'Thử lại sau ít phút. Nếu lỗi lặp lại, kiểm tra backend hoặc trạng thái kết nối.',
                            confirmLabel: 'Đóng',
                            confirmTone: 'danger',
                        });
                    }
                } finally {
                    setDeletingTestId(null);
                }

                return false;
            },
        });
    };

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TestsHeader onCreateNew={() => setShowCreateModal(true)} />

                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <StatCard icon="FileText" label="Tổng Bài Thi" value={stats.totalTests} iconBgColor="bg-blue-500/10" iconColor="text-blue-500" variants={cardVariants} />
                        <StatCard icon="PlayCircle" label="Lượt Thi" value={stats.totalAttempts} iconBgColor="bg-green-500/10" iconColor="text-green-500" variants={cardVariants} />
                        <StatCard icon="TrendingUp" label="Điểm TB" value={stats.avgScore} iconBgColor="bg-orange-500/10" iconColor="text-orange-500" variants={cardVariants} />
                        <StatCard icon="Trophy" label="Điểm Cao Nhất" value={stats.bestScore} iconBgColor="bg-yellow-500/10" iconColor="text-yellow-500" variants={cardVariants} />
                    </div>

                    {/* Section Header with Filters */}
                    <motion.div variants={cardVariants} className="mb-6">
                        <div className="flex flex-row items-center justify-between gap-3 overflow-x-auto">
                            <div className="flex items-center gap-3 shrink-0">
                                <h2 className="text-xl font-black text-base-content whitespace-nowrap">Bài Thi Của Tôi</h2>
                                <div className="badge badge-primary badge-lg shrink-0">{filteredTests.length} bài</div>
                            </div>

                            <div className="flex flex-row items-center gap-2 shrink-0">
                                {/* Difficulty Filter */}
                                <select
                                    value={filterDifficulty}
                                    onChange={(e) => setFilterDifficulty(e.target.value)}
                                    className="select select-sm select-bordered rounded-xl font-bold text-xs"
                                >
                                    <option value="all">Tất cả độ khó</option>
                                    {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>

                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="select select-sm select-bordered rounded-xl font-bold text-xs"
                                >
                                    <option value="recent">Gần đây nhất</option>
                                    <option value="score">Điểm cao nhất</option>
                                    <option value="attempts">Nhiều lượt thi</option>
                                    <option value="name">Theo tên</option>
                                </select>

                                {deletableFilteredTests.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            openDialog({
                                                variant: 'warning',
                                                title: 'Xóa tất cả bài tự tạo đang hiển thị?',
                                                message: `Cú nhắc bạn rằng thao tác này sẽ xóa ${deletableFilteredTests.length} bài thi do bạn tạo trong danh sách hiện tại.`,
                                                details: 'Các bài thi mẫu của hệ thống sẽ được giữ nguyên và không bị ảnh hưởng.',
                                                confirmLabel: 'Xóa bài tự tạo',
                                                cancelLabel: 'Hủy',
                                                showCancel: true,
                                                confirmTone: 'danger',
                                                onConfirm: async () => {
                                                    try {
                                                        setDeletingTestId('__bulk__');
                                                        const results = await Promise.allSettled(
                                                            deletableFilteredTests.map((test) => quizApi.deletePractice(test.practiceTestId))
                                                        );
                                                        const failedCount = results.filter((result) => result.status === 'rejected').length;
                                                        await refresh();

                                                        if (failedCount > 0) {
                                                            openDialog({
                                                                variant: 'warning',
                                                                title: 'Xóa chưa hoàn tất',
                                                                message: `Đã xóa ${deletableFilteredTests.length - failedCount}/${deletableFilteredTests.length} bài thi tự tạo.`,
                                                                details: 'Một vài bài chưa xóa được. Bạn có thể thử lại thêm lần nữa.',
                                                                confirmLabel: 'Đã hiểu',
                                                                confirmTone: 'warning',
                                                            });
                                                        } else {
                                                            openDialog({
                                                                variant: 'success',
                                                                title: 'Đã xóa toàn bộ',
                                                                message: `Cú đã gỡ ${deletableFilteredTests.length} bài thi tự tạo khỏi danh sách của bạn.`,
                                                                details: 'Các bài thi mẫu của hệ thống vẫn được giữ nguyên.',
                                                                confirmLabel: 'Đã hiểu',
                                                                confirmTone: 'success',
                                                            });
                                                        }
                                                    } catch (bulkError) {
                                                        openDialog({
                                                            variant: 'error',
                                                            title: 'Chưa thể xóa toàn bộ',
                                                            message: bulkError?.response?.data?.message || 'Máy chủ chưa xử lý được yêu cầu xóa hàng loạt.',
                                                            details: 'Thử lại sau hoặc xóa từng bài nếu cần xử lý ngay.',
                                                            confirmLabel: 'Đóng',
                                                            confirmTone: 'danger',
                                                        });
                                                    } finally {
                                                        setDeletingTestId(null);
                                                    }

                                                    return false;
                                                },
                                            });
                                        }}
                                        className="btn btn-sm rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                    >
                                        <Icon name="Trash2" size="sm" />
                                        Xóa bài tự tạo
                                    </button>
                                )}

                                {/* View Toggle */}
                                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <OwlLoader
                                message="Đang tải danh sách bài thi..."
                                subMessage="SKR đang tổng hợp đề thi, độ khó và số lượt làm gần đây cho bạn."
                                className="py-6"
                            />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-3xl flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                            </div>
                            <h3 className="text-lg font-black text-base-content/60 mb-2">{error}</h3>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={refresh}
                                className="btn bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold gap-2"
                            >
                                Thử lại
                            </motion.button>
                        </div>
                    )}

                    {/* Tests List */}
                    {!loading && !error && (
                        <>
                            {filteredTests.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredTests.map((test, index) => (
                                            <TestCard
                                                key={test.practiceTestId}
                                                test={test}
                                                index={index}
                                                variants={cardVariants}
                                                onDelete={isDeletablePractice(test) ? handleDeleteTest : undefined}
                                                deleting={deletingTestId === test.practiceTestId}
                                            />
                                        ))}

                                        {/* Add Test Card */}
                                        <motion.div variants={cardVariants} initial="hidden" animate="visible">
                                            <motion.button
                                                whileHover={{ y: -4, scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowCreateModal(true)}
                                                className="w-full h-full min-h-[320px] bg-base-100/50 rounded-2xl border-2 border-dashed border-base-300 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                                    <motion.div animate={{ rotate: [0, 90, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                                    </motion.div>
                                                </div>
                                                <span className="font-black text-sm text-base-content/50 group-hover:text-blue-500 transition-colors">
                                                    Tạo bài thi mới
                                                </span>
                                            </motion.button>
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredTests.map((test) => (
                                            <TestListItem
                                                key={test.practiceTestId}
                                                test={test}
                                                variants={cardVariants}
                                                onDelete={isDeletablePractice(test) ? handleDeleteTest : undefined}
                                                deleting={deletingTestId === test.practiceTestId}
                                            />
                                        ))}
                                    </div>
                                )
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-16"
                                >
                                    <div className="w-20 h-20 mx-auto bg-base-300/50 rounded-3xl flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-base-content/30"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                                    </div>
                                    <h3 className="text-lg font-black text-base-content/60 mb-2">
                                        {practices.length === 0 ? 'Chưa có bài thi nào' : 'Không tìm thấy bài thi nào'}
                                    </h3>
                                    <p className="text-sm text-base-content/40 mb-6">
                                        {practices.length === 0 ? 'Tạo bài thi thử đầu tiên của bạn' : 'Thử thay đổi bộ lọc'}
                                    </p>
                                    {practices.length > 0 && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setFilterDifficulty('all')}
                                            className="btn btn-ghost rounded-xl font-bold gap-2 mr-3"
                                        >
                                            Xóa bộ lọc
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowCreateModal(true)}
                                        className="btn bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                        Tạo bài thi
                                    </motion.button>
                                </motion.div>
                            )}
                        </>
                    )}

                    {/* Quick Tips Section */}
                    <motion.div
                        variants={cardVariants}
                        className="mt-8 bg-gradient-to-r from-blue-600/5 to-violet-600/5 border border-blue-500/10 rounded-2xl p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-black text-sm text-base-content mb-2">💡 Mẹo luyện thi hiệu quả</h4>
                                <ul className="space-y-1 text-xs text-base-content/60">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Ôn tập đều đặn mỗi ngày thay vì nhồi nhét trước kỳ thi
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Xem lại các câu sai để hiểu rõ kiến thức còn thiếu
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Tăng dần độ khó để thử thách bản thân
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Kết hợp Flashcards và Thi Thử để ghi nhớ lâu hơn
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </motion.main>
            </div>

            {/* Create Test Modal */}
            {showCreateModal && (
                <CreateTestModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateTest}
                />
            )}

            <OwlDialog
                isOpen={dialog.isOpen}
                variant={dialog.variant}
                title={dialog.title}
                message={dialog.message}
                details={dialog.details}
                confirmLabel={dialog.confirmLabel}
                cancelLabel={dialog.cancelLabel}
                showCancel={dialog.showCancel}
                confirmTone={dialog.confirmTone}
                loading={dialog.loading}
                onConfirm={handleDialogConfirm}
                onClose={closeDialog}
            />
        </div>
    );
}
