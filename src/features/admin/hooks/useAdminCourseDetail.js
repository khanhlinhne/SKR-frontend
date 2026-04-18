import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOwlDialog } from '@/shared/ui/common';
import adminApi from '@/shared/api/adminApi';
import {
    buildCourseAnalytics,
    mergeCourseWithAnalytics,
    normalizeCourse,
} from '@/features/admin/utils/adminCourseDetailAnalytics';
import { extractOrderList } from '@/features/admin/utils/adminCourseDetailOrders';

export default function useAdminCourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [timeRange, setTimeRange] = useState('month');
    const [pendingRange, setPendingRange] = useState('month');
    const [isRangeLoading, setIsRangeLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toggling, setToggling] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();
    const rangeSwitchTimeoutRef = useRef(null);

    const fetchCourse = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError('');

        try {
            const [courseResult, ordersResult] = await Promise.allSettled([
                adminApi.getCourseById(id),
                adminApi.getAllOrders({ limit: 1000 }),
            ]);

            if (courseResult.status !== 'fulfilled') {
                throw courseResult.reason;
            }

            const normalizedCourse = normalizeCourse(courseResult.value?.data ?? courseResult.value);
            const rawOrders = ordersResult.status === 'fulfilled' ? extractOrderList(ordersResult.value) : [];
            const nextAnalytics = buildCourseAnalytics(normalizedCourse, rawOrders);

            if (ordersResult.status !== 'fulfilled') {
                console.error('Không thể tải danh sách đơn hàng khóa học:', ordersResult.reason);
            }

            setAnalytics(nextAnalytics);
            setCourse(mergeCourseWithAnalytics(normalizedCourse, nextAnalytics));
        } catch (err) {
            console.error('Lỗi khi tải chi tiết khóa học:', err);
            setError('Không thể tải thông tin khóa học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    useEffect(() => () => {
        if (rangeSwitchTimeoutRef.current) {
            clearTimeout(rangeSwitchTimeoutRef.current);
        }
    }, []);

    const handleTogglePublish = useCallback(async () => {
        if (!course) return;

        const newStatus = course.status === 'published' ? 'draft' : 'published';
        setToggling(true);

        try {
            await adminApi.togglePublish(course.id, newStatus);
            setCourse((previous) => ({ ...previous, status: newStatus }));
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
        } finally {
            setToggling(false);
        }
    }, [course]);

    const handleEditSuccess = useCallback((updatedCourse) => {
        const normalizedCourse = normalizeCourse(updatedCourse);
        setCourse(mergeCourseWithAnalytics(normalizedCourse, analytics));
        setShowEditModal(false);
    }, [analytics]);

    const handleExpertAssigned = useCallback((updatedCourse) => {
        setCourse(mergeCourseWithAnalytics(normalizeCourse(updatedCourse), analytics));
    }, [analytics]);

    const handleDelete = useCallback(() => {
        if (!course) return;

        openDialog({
            variant: 'warning',
            title: `Xóa khóa học "${course.name}"?`,
            message: 'Cú quản trị cần bạn xác nhận trước khi xóa khóa học này khỏi hệ thống.',
            details: 'Hành động này không thể hoàn tác. Sau khi xóa, bạn sẽ được đưa về lại danh sách khóa học.',
            showCancel: true,
            confirmLabel: 'Xóa ngay',
            cancelLabel: 'Quay lại',
            confirmTone: 'danger',
            onConfirm: async () => {
                try {
                    await adminApi.deleteCourse(course.id);
                    navigate('/admin/courses');
                    return true;
                } catch (err) {
                    console.error('Lỗi khi xóa khóa học:', err);
                    openDialog({
                        variant: 'error',
                        title: 'Không thể xóa khóa học',
                        message: `Cú chưa thể xóa "${course.name}" lúc này.`,
                        details: 'Vui lòng thử lại sau vài giây hoặc kiểm tra dữ liệu liên quan.',
                        confirmLabel: 'Đã hiểu',
                        confirmTone: 'warning',
                    });
                    return false;
                }
            },
        });
    }, [course, navigate, openDialog]);

    const handleRangeChange = useCallback((nextRange) => {
        if (nextRange === pendingRange && !isRangeLoading) {
            return;
        }

        setPendingRange(nextRange);

        if (nextRange === timeRange) {
            setIsRangeLoading(false);
            return;
        }

        if (rangeSwitchTimeoutRef.current) {
            clearTimeout(rangeSwitchTimeoutRef.current);
        }

        setIsRangeLoading(true);
        rangeSwitchTimeoutRef.current = setTimeout(() => {
            setTimeRange(nextRange);
            setIsRangeLoading(false);
        }, 220);
    }, [isRangeLoading, pendingRange, timeRange]);

    const activeAnalytics = useMemo(
        () => analytics?.ranges?.[timeRange] || analytics?.ranges?.month || null,
        [analytics, timeRange],
    );

    const goBack = useCallback(() => {
        navigate('/admin/courses');
    }, [navigate]);

    return {
        course,
        analytics,
        activeAnalytics,
        timeRange,
        pendingRange,
        isRangeLoading,
        loading,
        error,
        toggling,
        showEditModal,
        setShowEditModal,
        dialog,
        closeDialog,
        handleDialogConfirm,
        fetchCourse,
        handleTogglePublish,
        handleEditSuccess,
        handleExpertAssigned,
        handleDelete,
        handleRangeChange,
        goBack,
    };
}
