import { AlertCircle, Archive, CheckCircle2 } from 'lucide-react';

export function normalizeCourse(course) {
    const students = Number(course.purchaseCount ?? course.enrolledCount ?? course.totalStudents ?? course.students ?? 0);
    const price = Number(course.priceAmount ?? course.price ?? 0);
    const revenue = Number(course.revenue ?? 0) || (students * price);

    return {
        id: course.subjectId ?? course.courseId ?? course.id,
        name: course.subjectName ?? course.courseName ?? course.name ?? '',
        category: course.category ?? course.subjectCategory ?? '',
        price,
        originalPrice: Number(course.originalPrice ?? course.subjectPrice ?? course.priceAmount ?? 0),
        students,
        rating: Number(course.ratingAverage ?? course.averageRating ?? course.rating ?? 0),
        ratingCount: Number(course.ratingCount ?? 0),
        status: course.status ?? 'draft',
        lessons: Number(course.totalLessons ?? course.lessons ?? 0),
        chapters: Number(course.totalChapters ?? course.chapters ?? 0),
        image: course.subjectIconUrl ?? course.courseIconUrl ?? course.image ?? '',
        revenue,
        completionRate: Number(course.completionRate ?? 0),
        createdAt: course.createdAt ?? course.created_date ?? '',
        updatedAt: course.updatedAt ?? course.updated_date ?? '',
        instructor: course.instructorName ?? course.instructor ?? course.creator?.fullName ?? course.creator?.displayName ?? course.creatorName ?? '',
        bannerUrl: course.subjectBannerUrl ?? course.courseBannerUrl ?? course.bannerUrl ?? '',
        subjectCode: course.subjectCode ?? course.courseCode ?? '',
        description: course.subjectDescription ?? course.courseDescription ?? '',
        publishedAt: course.publishedAt ?? course.published_date ?? null,
        isFeatured: course.isFeatured ?? false,
    };
}

export const adminCourseStatusConfig = {
    published: {
        label: 'Đã xuất bản',
        color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20',
        icon: CheckCircle2,
        dotColor: 'bg-emerald-500',
    },
    draft: {
        label: 'Bản nháp',
        color: 'text-amber-700 bg-amber-500/10 border-amber-500/20',
        icon: AlertCircle,
        dotColor: 'bg-amber-500',
    },
    archived: {
        label: 'Đã lưu trữ',
        color: 'text-base-content/60 bg-base-200 border-base-300',
        icon: Archive,
        dotColor: 'bg-base-content/40',
    },
};

export function formatPrice(amount) {
    if (amount === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export function formatRevenue(amount) {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + 'B';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
    return amount.toString();
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}
