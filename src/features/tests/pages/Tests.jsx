import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import { OwlLoader } from '@/shared/ui/common';
import {
    TestCard,
    TestListItem,
    TestsFilters,
    TestsHeader,
    TestsModalLayer,
    TestsStatsBar,
} from '@/features/tests/components';
import useTestsPage from '@/features/tests/hooks/useTestsPage';

export default function Tests() {
    const {
        practices,
        loading,
        error,
        refresh,
        dialog,
        closeDialog,
        handleDialogConfirm,
        profile,
        viewMode,
        setViewMode,
        showCreateModal,
        setShowCreateModal,
        showEditModal,
        filterDifficulty,
        setFilterDifficulty,
        sortBy,
        setSortBy,
        deletingTestId,
        editingTestId,
        editingTestData,
        subjectOptions,
        containerVariants,
        cardVariants,
        stats,
        filteredTests,
        deletableFilteredTests,
        handleCreateTest,
        handleDeleteTest,
        handleOpenEditTest,
        handleCloseEditModal,
        handleUpdateTest,
        handleDeleteFilteredTests,
        clearDifficultyFilter,
        isDeletablePractice,
    } = useTestsPage();

    return (
        <div className="flex h-screen overflow-hidden bg-base-200">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <TestsHeader onCreateNew={() => setShowCreateModal(true)} />

                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <TestsStatsBar stats={stats} variants={cardVariants} />

                    <TestsFilters
                        variants={cardVariants}
                        filteredCount={filteredTests.length}
                        filterDifficulty={filterDifficulty}
                        onFilterDifficultyChange={setFilterDifficulty}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        deletableCount={deletableFilteredTests.length}
                        onDeleteDeletable={handleDeleteFilteredTests}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />

                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <OwlLoader
                                message="Đang tải danh sách bài thi..."
                                subMessage="SKR đang tổng hợp đề thi, độ khó và số lượt làm gần đây cho bạn."
                                className="py-6"
                            />
                        </div>
                    )}

                    {error && !loading && (
                        <div className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                            </div>
                            <h3 className="mb-2 text-lg font-black text-base-content/60">{error}</h3>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={refresh}
                                className="btn rounded-xl border-none bg-gradient-to-r from-blue-600 to-violet-600 gap-2 font-bold text-white"
                            >
                                Thử lại
                            </motion.button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {filteredTests.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {filteredTests.map((test, index) => (
                                            <TestCard
                                                key={test.practiceTestId}
                                                test={test}
                                                index={index}
                                                variants={cardVariants}
                                                onEdit={isDeletablePractice(test) ? handleOpenEditTest : undefined}
                                                onDelete={isDeletablePractice(test) ? handleDeleteTest : undefined}
                                                deleting={deletingTestId === test.practiceTestId}
                                                editing={editingTestId === test.practiceTestId}
                                            />
                                        ))}

                                        <motion.div variants={cardVariants} initial="hidden" animate="visible">
                                            <motion.button
                                                whileHover={{ y: -4, scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowCreateModal(true)}
                                                className="group flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-base-300 bg-base-100/50 transition-all hover:border-blue-500/40 hover:bg-blue-500/5"
                                            >
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                                                    <motion.div animate={{ rotate: [0, 90, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                                    </motion.div>
                                                </div>
                                                <span className="text-sm font-black text-base-content/50 transition-colors group-hover:text-blue-500">
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
                                                onEdit={isDeletablePractice(test) ? handleOpenEditTest : undefined}
                                                onDelete={isDeletablePractice(test) ? handleDeleteTest : undefined}
                                                deleting={deletingTestId === test.practiceTestId}
                                                editing={editingTestId === test.practiceTestId}
                                            />
                                        ))}
                                    </div>
                                )
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-16 text-center"
                                >
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-base-300/50">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-base-content/30"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                                    </div>
                                    <h3 className="mb-2 text-lg font-black text-base-content/60">
                                        {practices.length === 0 ? 'Chưa có bài thi nào' : 'Không tìm thấy bài thi nào'}
                                    </h3>
                                    <p className="mb-6 text-sm text-base-content/40">
                                        {practices.length === 0 ? 'Tạo bài thi thử đầu tiên của bạn' : 'Thử thay đổi bộ lọc'}
                                    </p>
                                    {practices.length > 0 && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={clearDifficultyFilter}
                                            className="btn btn-ghost mr-3 rounded-xl gap-2 font-bold"
                                        >
                                            Xóa bộ lọc
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowCreateModal(true)}
                                        className="btn rounded-xl border-none bg-gradient-to-r from-blue-600 to-violet-600 gap-2 font-bold text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                        Tạo bài thi
                                    </motion.button>
                                </motion.div>
                            )}
                        </>
                    )}

                    <motion.div
                        variants={cardVariants}
                        className="mt-8 rounded-2xl border border-blue-500/10 bg-gradient-to-r from-blue-600/5 to-violet-600/5 p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" /></svg>
                            </div>
                            <div>
                                <h4 className="mb-2 text-sm font-black text-base-content">💡 Mẹo luyện thi hiệu quả</h4>
                                <ul className="space-y-1 text-xs text-base-content/60">
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        Ôn tập đều đặn mỗi ngày thay vì nhồi nhét trước kỳ thi
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        Xem lại các câu sai để hiểu rõ kiến thức còn thiếu
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        Tăng dần độ khó để thử thách bản thân
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        Kết hợp Flashcards và Thi Thử để ghi nhớ lâu hơn
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </motion.main>
            </div>

            <TestsModalLayer
                showCreateModal={showCreateModal}
                onCloseCreate={() => setShowCreateModal(false)}
                onCreate={handleCreateTest}
                showEditModal={showEditModal}
                editingTestData={editingTestData}
                onCloseEdit={handleCloseEditModal}
                onUpdate={handleUpdateTest}
                subjects={subjectOptions}
                currentUserId={profile?.userId || ''}
                dialog={dialog}
                closeDialog={closeDialog}
                handleDialogConfirm={handleDialogConfirm}
            />
        </div>
    );
}
