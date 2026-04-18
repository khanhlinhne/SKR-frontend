import { useCallback, useEffect, useMemo, useState } from 'react';
import { enrollmentApi, quizApi } from '@/shared/api';
import { useOwlDialog } from '@/shared/ui/common';
import { useCurrentUserProfile } from '@/shared/user';
import { useQuizPractices } from './useQuiz';
import { getPracticeDraft } from '@/features/tests/utils/practiceDraftCache';
import { extractPracticeManualQuestions } from '@/features/tests/utils/practiceQuestionDraft';

const SYSTEM_PRACTICE_SEED_TITLES = new Set([
    'kiem tra kien thuc lap trinh web co ban',
    'thu thach javascript nang cao',
    'on tap git & devops',
    'tong hop kien thuc backend',
    'mini quiz - nhanh tri cntt',
]);

const SUBJECT_PICKER_LIMIT = 40;

function normalizePracticeTitle(title) {
    return String(title || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

function isDeletablePractice(test) {
    return !SYSTEM_PRACTICE_SEED_TITLES.has(normalizePracticeTitle(test?.testTitle));
}

export default function useTestsPage() {
    const { practices, loading, error, refresh } = useQuizPractices();
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();
    const { profile } = useCurrentUserProfile();
    const [viewMode, setViewMode] = useState('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [deletingTestId, setDeletingTestId] = useState(null);
    const [editingTestId, setEditingTestId] = useState(null);
    const [editingTestData, setEditingTestData] = useState(null);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setHasAnimated(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchSubjects = async () => {
            try {
                const response = await enrollmentApi.getMyEnrollments({ limit: SUBJECT_PICKER_LIMIT });
                const payload = response?.data || response || {};
                const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];

                const nextOptions = items
                    .map((subject) => ({
                        value: subject.courseId || subject.subjectId || subject.id || '',
                        label: subject.courseName || subject.subjectName || subject.title || '',
                        courseId: subject.courseId || subject.subjectId || subject.id || null,
                        isOwnedByUser: true,
                    }))
                    .filter((option) => option.value && option.label)
                    .filter((option, index, array) => (
                        array.findIndex((item) => String(item.value) === String(option.value)) === index
                    ));

                if (isMounted) {
                    setSubjectOptions(nextOptions);
                }
            } catch (fetchError) {
                console.error('Failed to fetch learner-owned test subjects:', fetchError);
                if (isMounted) {
                    setSubjectOptions([]);
                }
            }
        };

        void fetchSubjects();

        return () => {
            isMounted = false;
        };
    }, []);

    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: hasAnimated ? 0 : 0.08, delayChildren: hasAnimated ? 0 : 0.1 },
        },
    }), [hasAnimated]);

    const cardVariants = useMemo(() => (
        hasAnimated
            ? {
                hidden: { opacity: 1, y: 0, scale: 1 },
                visible: { opacity: 1, y: 0, scale: 1 },
            }
            : {
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                },
            }
    ), [hasAnimated]);

    const stats = useMemo(() => ({
        totalTests: practices.length,
        totalAttempts: practices.reduce((sum, test) => sum + (test.attemptsCount || 0), 0),
        avgScore: (() => {
            const scored = practices.filter((test) => test.averageScore != null);
            return scored.length > 0
                ? (scored.reduce((sum, test) => sum + Number(test.averageScore), 0) / scored.length).toFixed(1)
                : '—';
        })(),
        bestScore: (() => {
            const scored = practices.filter((test) => test.bestScore != null);
            return scored.length > 0 ? Math.max(...scored.map((test) => Number(test.bestScore))).toFixed(1) + '%' : '—';
        })(),
    }), [practices]);

    const filteredTests = useMemo(() => (
        practices
            .filter((test) => filterDifficulty === 'all' || test.difficultyLevels?.includes(filterDifficulty))
            .sort((left, right) => {
                switch (sortBy) {
                    case 'recent':
                        return new Date(right.lastAttemptAtUtc || 0) - new Date(left.lastAttemptAtUtc || 0);
                    case 'score':
                        return (Number(right.bestScore) || 0) - (Number(left.bestScore) || 0);
                    case 'attempts':
                        return (right.attemptsCount || 0) - (left.attemptsCount || 0);
                    case 'name':
                        return (left.testTitle || '').localeCompare(right.testTitle || '');
                    default:
                        return 0;
                }
            })
    ), [filterDifficulty, practices, sortBy]);

    const deletableFilteredTests = useMemo(
        () => filteredTests.filter(isDeletablePractice),
        [filteredTests],
    );

    const handleCreateTest = useCallback(async (createdTestMeta = null) => {
        await refresh();

        openDialog({
            variant: 'success',
            title: 'Con cú đã lưu bài thi',
            message: createdTestMeta?.testTitle
                ? `Bài thi "${createdTestMeta.testTitle}" đã được tạo thành công.`
                : 'Bài thi mới đã được tạo thành công.',
            details: createdTestMeta?.details || 'Bạn có thể mở lại bài thi để làm ngay hoặc tiếp tục tạo bài khác.',
            confirmLabel: 'Đã hiểu',
            confirmTone: 'success',
        });
    }, [openDialog, refresh]);

    const handleDeleteTest = useCallback((test) => {
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
    }, [openDialog, refresh]);

    const handleOpenEditTest = useCallback(async (test) => {
        if (!isDeletablePractice(test)) {
            return;
        }

        try {
            setEditingTestId(test.practiceTestId);
            const response = await quizApi.getPracticeById(test.practiceTestId);
            const payload = response?.data?.data || response?.data || response || {};
            const nestedDetail = payload.practice || payload.item || {};
            const cachedDetail = getPracticeDraft({
                practiceTestId: test.practiceTestId,
                testTitle: test.testTitle,
                testDescription: test.testDescription,
                courseId: test.courseId,
                subjectId: test.subjectId,
            });

            let recoveredManualQuestions = extractPracticeManualQuestions({
                ...payload,
                ...nestedDetail,
                cachedDetail,
            });

            if (recoveredManualQuestions.length === 0 && Number(test?.attemptsCount || 0) > 0) {
                const attemptsResponse = await quizApi.getMyAttempts({ practiceTestId: test.practiceTestId, limit: 1 });
                const latestAttempt = Array.isArray(attemptsResponse?.data?.items) ? attemptsResponse.data.items[0] : null;
                const latestAttemptId = latestAttempt?.attemptId;

                if (latestAttemptId) {
                    try {
                        const reviewResponse = await quizApi.reviewAttempt(latestAttemptId);
                        recoveredManualQuestions = extractPracticeManualQuestions(reviewResponse?.data || reviewResponse || {});
                    } catch (reviewError) {
                        console.warn('Failed to recover practice questions from review attempt:', reviewError);
                    }
                }

                if (recoveredManualQuestions.length === 0 && latestAttemptId) {
                    try {
                        const attemptResponse = await quizApi.getAttempt(latestAttemptId);
                        recoveredManualQuestions = extractPracticeManualQuestions(attemptResponse?.data || attemptResponse || {});
                    } catch (attemptError) {
                        console.warn('Failed to recover practice questions from latest attempt:', attemptError);
                    }
                }
            }

            const detail = {
                ...cachedDetail,
                ...payload,
                ...nestedDetail,
                practiceTestId: nestedDetail.practiceTestId || payload.practiceTestId || test.practiceTestId,
                questions: recoveredManualQuestions,
                practiceQuestions: recoveredManualQuestions,
                practiceTestQuestions: recoveredManualQuestions,
                manualQuestions: recoveredManualQuestions,
            };

            if (recoveredManualQuestions.length === 0) {
                openDialog({
                    variant: 'warning',
                    title: 'Con cú chưa khôi phục được nội dung câu hỏi',
                    message: 'Frontend đã thử lấy nội dung từ chi tiết bài thi, cache cục bộ và cả attempt gần nhất nhưng vẫn chưa tìm thấy bộ câu hỏi đầy đủ.',
                    details: 'Cần backend trả lại question detail cho bài thi này, hoặc bạn cần có ít nhất một lần làm bài / một bản nháp đã được lưu cục bộ để phục hồi nội dung chỉnh sửa.',
                    confirmLabel: 'Đã hiểu',
                    confirmTone: 'warning',
                });
                return;
            }

            setEditingTestData(detail);
            setShowEditModal(true);
        } catch (loadError) {
            console.error('Failed to load practice test for editing:', loadError);
            openDialog({
                variant: 'error',
                title: 'Con cú chưa mở được bài thi để sửa',
                message: loadError?.response?.data?.message || 'Không thể tải dữ liệu bài thi thử này để chỉnh sửa.',
                details: 'Thử lại sau ít phút. Nếu lỗi còn lặp lại, kiểm tra dữ liệu backend của bài thi này.',
                confirmLabel: 'Đóng',
                confirmTone: 'danger',
            });
        } finally {
            setEditingTestId(null);
        }
    }, [openDialog]);

    const handleCloseEditModal = useCallback(() => {
        if (editingTestId) {
            return;
        }

        setShowEditModal(false);
        setEditingTestData(null);
    }, [editingTestId]);

    const handleUpdateTest = useCallback(async (updatedTestMeta = null) => {
        await refresh();
        setShowEditModal(false);
        setEditingTestData(null);

        openDialog({
            variant: 'success',
            title: 'Con cú đã cập nhập nội dung thi',
            message: updatedTestMeta?.testTitle
                ? `Bài thi "${updatedTestMeta.testTitle}" đã được cập nhập thành công.`
                : 'Nội dung bài thi đã được cập nhập thành công.',
            details: updatedTestMeta?.details || 'Danh sách bài thi đã được làm mới với nội dung mới nhất.',
            confirmLabel: 'Đã hiểu',
            confirmTone: 'success',
        });
    }, [openDialog, refresh]);

    const handleDeleteFilteredTests = useCallback(() => {
        if (deletableFilteredTests.length === 0) {
            return;
        }

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
                        deletableFilteredTests.map((test) => quizApi.deletePractice(test.practiceTestId)),
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
    }, [deletableFilteredTests, openDialog, refresh]);

    const clearDifficultyFilter = useCallback(() => {
        setFilterDifficulty('all');
    }, []);

    return {
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
        setShowEditModal,
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
    };
}
