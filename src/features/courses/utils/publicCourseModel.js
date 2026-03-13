const COURSE_ACCENTS = [
    {
        key: 'blue',
        surfaceClass: 'apple-tone-blue',
        gradient: 'from-sky-600 to-cyan-500',
        backgroundGradient: 'from-sky-500/16 to-cyan-500/10',
        badge: 'Bộ môn nổi bật',
    },
    {
        key: 'slate',
        surfaceClass: 'apple-tone-slate',
        gradient: 'from-emerald-600 to-teal-500',
        backgroundGradient: 'from-emerald-500/14 to-teal-500/10',
        badge: 'Được chọn nhiều',
    },
    {
        key: 'indigo',
        surfaceClass: 'apple-tone-indigo',
        gradient: 'from-indigo-600 to-fuchsia-500',
        backgroundGradient: 'from-indigo-500/16 to-fuchsia-500/10',
        badge: 'Khóa học mới',
    },
];

const COURSE_FALLBACK_BANNERS = [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=720&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=720&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=720&fit=crop',
];

function getAccent(index = 0) {
    return COURSE_ACCENTS[index % COURSE_ACCENTS.length];
}

export function hasAuthToken() {
    if (typeof window === 'undefined') {
        return false;
    }

    const token = localStorage.getItem('accessToken');
    return Boolean(token && token !== 'undefined' && token !== 'null');
}

export function buildCourseCheckoutPath(courseId) {
    return `/checkout?type=course&id=${courseId}`;
}

export function buildLoginRedirectPath(targetPath) {
    return `/login?redirect=${encodeURIComponent(targetPath)}`;
}

export function buildCourseBuyPath(courseId, isAuthenticated = hasAuthToken()) {
    const checkoutPath = buildCourseCheckoutPath(courseId);
    if (isAuthenticated) {
        return checkoutPath;
    }

    return buildLoginRedirectPath(checkoutPath);
}

export function buildCourseLearnPath(courseId, isAuthenticated = hasAuthToken()) {
    const learnPath = `/courses/${courseId}/learn`;
    if (isAuthenticated) {
        return learnPath;
    }

    return buildLoginRedirectPath(learnPath);
}

export function formatCoursePrice(amount) {
    const numericAmount = Number(amount) || 0;
    if (numericAmount <= 0) {
        return 'Miễn phí';
    }

    return `${new Intl.NumberFormat('vi-VN').format(numericAmount)}đ`;
}

export function formatCompactCount(value) {
    const numericValue = Number(value) || 0;
    return new Intl.NumberFormat('vi-VN', {
        notation: numericValue >= 1000 ? 'compact' : 'standard',
        maximumFractionDigits: numericValue >= 1000 ? 1 : 0,
    }).format(numericValue);
}

export function getPrimaryInstructorName(creator) {
    if (!creator) {
        return 'Giảng viên SKR';
    }

    return creator.displayName || creator.fullName || 'Giảng viên SKR';
}

function getCourseLevel(course) {
    if (course.level) {
        return course.level;
    }

    const lessonCount = Number(course.totalLessons) || 0;
    if (lessonCount >= 45) {
        return 'Nâng cao';
    }

    if (lessonCount >= 20) {
        return 'Trung cấp';
    }

    return 'Cơ bản';
}

function inferLessonType(lessonName = '') {
    const normalized = lessonName.toLowerCase();
    if (normalized.includes('flashcard')) {
        return 'flashcard';
    }
    if (normalized.includes('quiz') || normalized.includes('kiểm tra') || normalized.includes('câu hỏi')) {
        return 'quiz';
    }
    if (normalized.includes('tài liệu') || normalized.includes('document') || normalized.includes('pdf')) {
        return 'document';
    }

    return 'video';
}

function normalizeLesson(lesson, lessonIndex = 0) {
    return {
        id: lesson.lessonId ?? lesson.lesson_id ?? `${lesson.chapterId || 'chapter'}-${lesson.lessonNumber || lessonIndex + 1}`,
        title: lesson.lessonName ?? lesson.lesson_name ?? 'Bài học chưa đặt tên',
        description: lesson.lessonDescription ?? lesson.lesson_description ?? '',
        learningObjectives: lesson.learningObjectives ?? lesson.learning_objectives ?? '',
        durationMinutes: Number(lesson.estimatedDurationMinutes ?? lesson.estimated_duration_minutes) || 0,
        lessonNumber: lesson.lessonNumber ?? lesson.lesson_number ?? lessonIndex + 1,
        displayOrder: lesson.displayOrder ?? lesson.display_order ?? lessonIndex + 1,
        type: inferLessonType(lesson.lessonName ?? lesson.lesson_name ?? ''),
        isPreview: Boolean(lesson.isPreview ?? lesson.is_preview ?? lessonIndex === 0),
    };
}

function normalizeChapter(chapter, accent, chapterIndex = 0) {
    const lessons = Array.isArray(chapter.lessons)
        ? chapter.lessons.map((lesson, lessonIndex) => normalizeLesson(lesson, lessonIndex))
        : [];

    return {
        id: chapter.chapterId ?? chapter.chapter_id ?? `chapter-${chapterIndex + 1}`,
        title: chapter.chapterName ?? chapter.chapter_name ?? `Chương ${chapterIndex + 1}`,
        description: chapter.chapterDescription ?? chapter.chapter_description ?? '',
        chapterNumber: chapter.chapterNumber ?? chapter.chapter_number ?? chapterIndex + 1,
        durationMinutes: Number(chapter.estimatedDurationMinutes ?? chapter.estimated_duration_minutes) || 0,
        lessons,
        gradient: accent.gradient,
    };
}

export function mapCourseToPublicModel(course, index = 0) {
    const accent = getAccent(index);
    const priceAmount = Number(course.priceAmount) || 0;
    const originalPrice = Number(course.originalPrice) || 0;
    const ratingAverage = Number(course.ratingAverage) || 0;
    const purchaseCount = Number(course.purchaseCount) || 0;
    const totalLessons = Number(course.totalLessons) || 0;
    const totalQuestions = Number(course.totalQuestions) || 0;
    const totalVideos = Number(course.totalVideos) || 0;
    const totalDocuments = Number(course.totalDocuments) || 0;
    const estimatedDurationHours = Number(course.estimatedDurationHours) || 0;
    const chapters = Array.isArray(course.chapters)
        ? course.chapters.map((chapter, chapterIndex) => normalizeChapter(chapter, accent, chapterIndex))
        : [];
    const previewLessons = chapters
        .map((chapter) => chapter.lessons.find((lesson) => lesson.isPreview))
        .filter(Boolean)
        .map((lesson, lessonIndex) => ({ ...lesson, previewIndex: lessonIndex + 1 }));
    const creator = course.creator || null;
    const hasAccess = Boolean(course.isPurchased || course.hasAccess || course.isEnrolled);
    const isFree = Boolean(course.isFree || priceAmount === 0);

    return {
        id: course.courseId ?? course.subjectId ?? course.id,
        courseId: course.courseId ?? course.subjectId ?? course.id,
        title: course.courseName ?? course.subjectName ?? 'Khóa học chưa đặt tên',
        subtitle: course.courseDescription ?? course.subjectDescription ?? 'Khóa học được biên soạn theo lộ trình rõ ràng, dễ theo dõi tiến độ.',
        description: course.courseDescription ?? course.subjectDescription ?? '',
        bannerUrl:
            course.courseBannerUrl ??
            course.subjectBannerUrl ??
            COURSE_FALLBACK_BANNERS[index % COURSE_FALLBACK_BANNERS.length],
        previewVideoUrl: course.coursePreviewVideoUrl ?? '',
        instructorName: getPrimaryInstructorName(creator),
        instructorAvatar: creator?.avatarUrl || '',
        creator,
        priceAmount,
        originalPrice,
        discountPercent: Number(course.discountPercent) || 0,
        formattedPrice: formatCoursePrice(priceAmount),
        isFree,
        ratingAverage,
        ratingCount: Number(course.ratingCount) || 0,
        purchaseCount,
        totalChapters: Number(course.totalChapters) || chapters.length,
        totalLessons,
        totalVideos,
        totalDocuments,
        totalQuestions,
        estimatedDurationHours,
        level: getCourseLevel(course),
        status: course.status || 'draft',
        publishedAt: course.publishedAt || null,
        isFeatured: Boolean(course.isFeatured),
        hasAccess,
        chapters,
        previewLessons,
        stats: [
            `${totalLessons || chapters.reduce((count, chapter) => count + chapter.lessons.length, 0)} bài học`,
            `${totalQuestions || Math.max(totalVideos + totalDocuments, 0)} hoạt động`,
            `${estimatedDurationHours || Math.max(Math.round(chapters.reduce((total, chapter) => total + chapter.durationMinutes, 0) / 60), 1)} giờ`,
        ],
        socialProof: `${formatCompactCount(purchaseCount)} học viên`,
        ratingLabel: ratingAverage > 0 ? `${ratingAverage.toFixed(1)} sao` : 'Mới cập nhật',
        accent,
    };
}

export function getCourseOrderSummary(course) {
    return {
        id: course.id,
        name: course.title,
        description: course.subtitle,
        gradient: course.accent.gradient,
        price: course.priceAmount,
        originalPrice: course.originalPrice,
        discountPercent: course.discountPercent,
        features: [
            `${course.totalLessons} bài học có cấu trúc`,
            `${course.totalVideos} video và ${course.totalDocuments} tài liệu`,
            `${course.totalQuestions} hoạt động ôn tập`,
            `${course.estimatedDurationHours} giờ nội dung`,
            'Truy cập trọn đời trên tài khoản của bạn',
        ],
        stats: {
            rating: course.ratingAverage > 0 ? `${course.ratingAverage.toFixed(1)} (${formatCompactCount(course.ratingCount)} đánh giá)` : null,
            lessons: course.totalLessons,
            duration: `${course.estimatedDurationHours} giờ`,
            flashcards: course.totalQuestions,
        },
        instructorName: course.instructorName,
    };
}
