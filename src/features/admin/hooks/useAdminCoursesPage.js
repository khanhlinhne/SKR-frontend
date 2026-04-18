import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowUpDown,
    Clock,
    DollarSign,
    Star,
    Users,
} from 'lucide-react';
import adminApi from '@/shared/api/adminApi';
import { useOwlDialog } from '@/shared/ui/common';
import { normalizeCourse } from '@/features/admin/components/adminCourses/adminCourseDisplay';

const sortOptions = [
    { value: 'students', label: 'Nhiều học viên nhất', icon: Users },
    { value: 'revenue', label: 'Doanh thu cao nhất', icon: DollarSign },
    { value: 'rating', label: 'Đánh giá cao nhất', icon: Star },
    { value: 'newest', label: 'Mới tạo nhất', icon: Clock },
    { value: 'name', label: 'Tên A-Z', icon: ArrowUpDown },
];

export default function useAdminCoursesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('students');
    const [viewMode, setViewMode] = useState('grid');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editCourse, setEditCourse] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const navigate = useNavigate();
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await adminApi.getAllCourses();
            const items = Array.isArray(response?.items)
                ? response.items
                : Array.isArray(response?.data?.items)
                ? response.data.items
                : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                ? response
                : [];
            setCourses(items.map(normalizeCourse));
        } catch (err) {
            console.error('Lỗi khi tải khóa học:', err);
            setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const filteredCourses = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const result = courses.filter((course) => {
            const matchSearch = course.name.toLowerCase().includes(query)
                || course.category.toLowerCase().includes(query)
                || (course.instructor && course.instructor.toLowerCase().includes(query));
            const matchStatus = filterStatus === 'all' || course.status === filterStatus;
            return matchSearch && matchStatus;
        });

        switch (sortBy) {
            case 'students':
                result.sort((left, right) => right.students - left.students);
                break;
            case 'revenue':
                result.sort((left, right) => right.revenue - left.revenue);
                break;
            case 'rating':
                result.sort((left, right) => right.rating - left.rating);
                break;
            case 'newest':
                result.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
                break;
            case 'name':
                result.sort((left, right) => left.name.localeCompare(right.name));
                break;
            default:
                break;
        }

        return result;
    }, [courses, filterStatus, searchQuery, sortBy]);

    const statusCounts = useMemo(() => ({
        all: courses.length,
        published: courses.filter((course) => course.status === 'published').length,
        draft: courses.filter((course) => course.status === 'draft').length,
        archived: courses.filter((course) => course.status === 'archived').length,
    }), [courses]);

    const handleTogglePublish = useCallback(async (course) => {
        const newStatus = course.status === 'published' ? 'draft' : 'published';
        setTogglingId(course.id);

        try {
            await adminApi.togglePublish(course.id, newStatus);
            setCourses((previous) =>
                previous.map((item) => (item.id === course.id ? { ...item, status: newStatus } : item)),
            );
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
        } finally {
            setTogglingId(null);
        }
    }, []);

    const handleEditSuccess = useCallback((updatedCourse) => {
        const updatedId = updatedCourse?.courseId ?? updatedCourse?.id;
        setCourses((previous) =>
            previous.map((course) => (course.id === updatedId ? normalizeCourse(updatedCourse) : course)),
        );
        setEditCourse(null);
    }, []);

    const handleCreateSuccess = useCallback((newCourse) => {
        setCourses((previous) => [normalizeCourse(newCourse), ...previous]);
        setShowCreateModal(false);
    }, []);

    const handleDeleteCourse = useCallback((course) => {
        openDialog({
            variant: 'warning',
            title: `Xóa khóa học "${course.name}"?`,
            message: 'Cú quản trị đang chờ bạn xác nhận trước khi gửi yêu cầu xóa khóa học này.',
            details: 'Nếu tiếp tục, khóa học sẽ bị gỡ khỏi danh sách quản lý hiện tại.',
            showCancel: true,
            confirmLabel: 'Xóa khóa học',
            cancelLabel: 'Giữ lại',
            confirmTone: 'danger',
            onConfirm: async () => {
                try {
                    await adminApi.deleteCourse(course.id);
                    setCourses((previous) => previous.filter((item) => item.id !== course.id));
                    openDialog({
                        variant: 'success',
                        title: 'Đã xóa khóa học',
                        message: `Khóa học "${course.name}" đã được gỡ khỏi dashboard quản trị.`,
                        details: 'Danh sách khóa học vừa được cập nhật lại.',
                        confirmLabel: 'Đã rõ',
                        confirmTone: 'success',
                    });
                } catch (err) {
                    console.error('Lỗi khi xóa khóa học:', err);
                    openDialog({
                        variant: 'error',
                        title: 'Chưa thể xóa khóa học',
                        message: `Cú chưa thể xóa "${course.name}" ở thời điểm này.`,
                        details: 'Vui lòng thử lại sau hoặc kiểm tra dữ liệu liên quan rồi thao tác lại.',
                        confirmLabel: 'Đã hiểu',
                        confirmTone: 'warning',
                    });
                }

                return false;
            },
        });
    }, [openDialog]);

    const handleViewCourse = useCallback((course) => {
        navigate(`/admin/courses/${course.id}`);
    }, [navigate]);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setFilterStatus('all');
    }, []);

    return {
        courses,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        editCourse,
        setEditCourse,
        showCreateModal,
        setShowCreateModal,
        togglingId,
        dialog,
        closeDialog,
        handleDialogConfirm,
        filteredCourses,
        statusCounts,
        sortOptions,
        fetchCourses,
        handleTogglePublish,
        handleEditSuccess,
        handleCreateSuccess,
        handleDeleteCourse,
        handleViewCourse,
        clearFilters,
    };
}
