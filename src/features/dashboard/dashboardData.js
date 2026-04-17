import { BookOpen, Code2, Database, Languages, Sigma } from 'lucide-react';

const SUBJECT_PALETTE = ['blue', 'green', 'yellow', 'purple'];

function firstObject(...values) {
    return values.find((value) => value && typeof value === 'object' && !Array.isArray(value));
}

function firstArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function pickCandidate(source, candidates, fallback = undefined) {
    for (const candidate of candidates) {
        const value = typeof candidate === 'function' ? candidate(source) : source?.[candidate];
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }

    return fallback;
}

function unwrapDashboardPayload(response) {
    const base = firstObject(
        response?.dashboard,
        response?.data?.dashboard,
        response?.data,
        response,
    ) || {};

    return firstObject(
        base.dashboard,
        base.data,
        base.payload,
        base.result,
        base,
    ) || {};
}

function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.replace(/[^0-9.-]/g, '');
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function normalizeHours(value) {
    return Number(toNumber(value, 0).toFixed(1));
}

function formatTimeLabel(value) {
    if (!value) {
        return '';
    }

    if (typeof value === 'string' && /^\d{1,2}:\d{2}$/.test(value.trim())) {
        return value.trim();
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function detectSubjectColor(value, index = 0) {
    const normalized = String(value || '').toLowerCase();

    if (normalized.includes('blue') || normalized.includes('toan') || normalized.includes('math')) {
        return 'blue';
    }

    if (
        normalized.includes('green') ||
        normalized.includes('english') ||
        normalized.includes('language') ||
        normalized.includes('anh')
    ) {
        return 'green';
    }

    if (
        normalized.includes('yellow') ||
        normalized.includes('python') ||
        normalized.includes('code') ||
        normalized.includes('lap trinh') ||
        normalized.includes('typescript') ||
        normalized.includes('javascript') ||
        normalized.includes('business')
    ) {
        return 'yellow';
    }

    if (
        normalized.includes('purple') ||
        normalized.includes('sql') ||
        normalized.includes('database') ||
        normalized.includes('du lieu')
    ) {
        return 'purple';
    }

    return SUBJECT_PALETTE[index % SUBJECT_PALETTE.length];
}

function detectSubjectIcon(value) {
    const normalized = String(value || '').toLowerCase();

    if (normalized.includes('toan') || normalized.includes('math')) {
        return Sigma;
    }

    if (
        normalized.includes('english') ||
        normalized.includes('language') ||
        normalized.includes('anh')
    ) {
        return Languages;
    }

    if (
        normalized.includes('python') ||
        normalized.includes('code') ||
        normalized.includes('lap trinh') ||
        normalized.includes('typescript') ||
        normalized.includes('javascript') ||
        normalized.includes('business')
    ) {
        return Code2;
    }

    if (
        normalized.includes('sql') ||
        normalized.includes('database') ||
        normalized.includes('du lieu')
    ) {
        return Database;
    }

    return BookOpen;
}

function normalizeSubjectStatus(rawStatus, progress) {
    const normalized = String(rawStatus || '').toLowerCase();

    if (
        normalized.includes('complete') ||
        normalized.includes('done') ||
        normalized.includes('finished') ||
        progress >= 100
    ) {
        return 'completed';
    }

    return 'active';
}

function normalizeStudySeriesItem(item, index) {
    const label =
        pickCandidate(item, [
            'label',
            'shortLabel',
            'month',
            'name',
            'period',
            'week',
            'day',
            (value) => {
                const dateValue = pickCandidate(value, ['date', 'monthLabel']);
                if (!dateValue) {
                    return undefined;
                }

                const date = new Date(dateValue);
                return Number.isNaN(date.getTime()) ? undefined : `T${date.getMonth() + 1}`;
            },
        ]) || `T${index + 1}`;

    const studyHours = toNumber(
        pickCandidate(item, ['newStudyHours', 'study', 'studyHours', 'learningHours', 'learnHours', 'newStudy']),
        0,
    );
    const reviewHours = toNumber(
        pickCandidate(item, ['reviewHours', 'practice', 'revisionHours', 'review', 'spacedRepetition']),
        0,
    );
    const totalHours = toNumber(pickCandidate(item, ['totalHours']), 0);

    const studyMinutesFallback = toNumber(pickCandidate(item, ['newStudyMinutes']), 0);
    const reviewMinutesFallback = toNumber(pickCandidate(item, ['reviewMinutes']), 0);
    const totalMinutesFallback = toNumber(pickCandidate(item, ['totalMinutes']), 0);

    const study = studyHours > 0 ? studyHours : studyMinutesFallback;
    const practice = reviewHours > 0 ? reviewHours : reviewMinutesFallback;
    const total = totalHours > 0 ? totalHours : totalMinutesFallback;

    return {
        month: label,
        study,
        practice: practice > 0 ? practice : Math.max(0, total - study),
    };
}

function normalizeUpcomingReview(item, index) {
    const title = pickCandidate(
        item,
        [
            'title',
            'name',
            'reviewTitle',
            'subjectName',
            'courseName',
            () => 'Noi dung on tap',
        ],
        'Noi dung on tap',
    );

    const subject = pickCandidate(item, ['subject', 'subjectName', 'courseCategory', 'category', 'courseName'], title);

    return {
        id: pickCandidate(item, ['id', 'reviewId', 'flashcardSetId'], `${title}-${index}`),
        title,
        flashcards: toNumber(pickCandidate(item, ['flashcards', 'flashcardCount', 'cards', 'totalFlashcards']), 0),
        time: formatTimeLabel(pickCandidate(item, ['time', 'reviewTime', 'dueAt', 'scheduledAt'])),
        subject,
        color: detectSubjectColor(pickCandidate(item, ['color', 'subject', 'subjectName', 'category'], subject), index),
        icon: detectSubjectIcon(subject),
    };
}

function normalizeSubject(item, index) {
    const name = pickCandidate(item, ['name', 'subjectName', 'courseName', 'title'], 'Mon hoc');
    const progress = clamp(
        toNumber(pickCandidate(item, ['progress', 'progressPercent', 'completionPercent', 'completionRate', 'percentComplete']), 0),
        0,
        100,
    );

    return {
        id: pickCandidate(item, ['id', 'subjectId', 'courseId', 'enrollmentId'], `${name}-${index}`),
        name,
        progress,
        flashcards: toNumber(pickCandidate(item, ['flashcards', 'flashcardCount', 'totalFlashcards', 'cardCount']), 0),
        tests: toNumber(pickCandidate(item, ['tests', 'testCount', 'quizCount', 'totalTests']), 0),
        icon: detectSubjectIcon(pickCandidate(item, ['category', 'subjectName', 'courseName', 'name'], name)),
        color: detectSubjectColor(pickCandidate(item, ['color', 'category', 'subjectName', 'courseName', 'name'], name), index),
        status: normalizeSubjectStatus(pickCandidate(item, ['status', 'learningStatus', 'state']), progress),
    };
}

function normalizeRecentSubject(item, fallbackSubject) {
    const source = item || fallbackSubject;
    if (!source) {
        return null;
    }

    const name = pickCandidate(source, ['name', 'subjectName', 'courseName', 'title'], 'Mon hoc gan day');
    const progress = clamp(
        toNumber(
            pickCandidate(source, ['progress', 'progressPercent', 'completionPercent', 'completionRate']),
            fallbackSubject?.progress || 0,
        ),
        0,
        100,
    );

    let detailLine = pickCandidate(source, ['lessonProgressText', 'flashcardsLabel', 'lessonCountText']);
    if (!detailLine) {
        const reviewedFlashcards = pickCandidate(source, ['reviewedFlashcards', 'completedFlashcards']);
        const totalFlashcards = pickCandidate(
            source,
            ['flashcards', 'flashcardCount', 'totalFlashcards', 'cardCount'],
            fallbackSubject?.flashcards,
        );

        detailLine = `${toNumber(totalFlashcards, 0)} flashcards`;
        if (reviewedFlashcards !== undefined && totalFlashcards !== undefined) {
            detailLine = `${toNumber(reviewedFlashcards, 0)}/${toNumber(totalFlashcards, 0)} flashcards`;
        }
    }

    return {
        name,
        chapter: pickCandidate(
            source,
            ['chapterProgressText', 'chapter', 'chapterName', 'currentChapter', 'lessonName', 'latestLesson', 'currentLesson', 'topicName'],
            'Tiep tuc hoc noi dung gan nhat',
        ),
        progress,
        flashcards: detailLine,
        icon: detectSubjectIcon(pickCandidate(source, ['category', 'subjectName', 'courseName', 'name'], name)),
    };
}

function normalizeWeakTopic(item, index) {
    const accuracy = clamp(
        toNumber(pickCandidate(item, ['accuracy', 'correctRate', 'accuracyRate', 'score']), 0),
        0,
        100,
    );

    const rawPriority = String(pickCandidate(item, ['priority', 'level', 'severity'], '')).toLowerCase();
    const priority = rawPriority.includes('high') || rawPriority.includes('cao') || accuracy < 50 ? 'high' : 'medium';

    return {
        id: pickCandidate(item, ['id', 'topicId'], `weak-topic-${index}`),
        topic: pickCandidate(item, ['topic', 'name', 'title'], 'Chu de can on'),
        subject: pickCandidate(item, ['subject', 'subjectName', 'courseName', 'category'], 'Mon hoc'),
        accuracy,
        priority,
    };
}

function normalizePerformanceNote(source) {
    const note = pickCandidate(source, ['performanceNote', 'performanceTrendText', 'performanceLabel']);
    if (note) {
        return note;
    }

    const comparison = firstObject(source?.comparison);
    if (comparison) {
        const changeDisplay = pickCandidate(comparison, ['changeDisplay']);
        const trend = String(pickCandidate(comparison, ['trend'], '')).toLowerCase();

        if (changeDisplay) {
            return `${trend === 'down' ? 'Giam' : 'Tang'} ${changeDisplay.replace(/^\+/, '')} so voi ky truoc`;
        }
    }

    const delta = toNumber(pickCandidate(source, ['performanceDelta', 'performanceChange', 'scoreDelta', 'scoreChange']), 0);
    if (!delta) {
        return '';
    }

    return `${delta > 0 ? 'Tang' : 'Giam'} ${Math.abs(delta)}% so voi ky truoc`;
}

export function normalizeDashboardResponse(response) {
    const payload = unwrapDashboardPayload(response);
    const studyTimeSource = firstObject(payload.studyTime, payload.study_time, payload.studyStats) || {};
    const performanceSource = firstObject(payload.performance, payload.performanceStats, payload.accuracy) || {};
    const quickStatsSource = firstObject(payload.quickStats, payload.quick_stats, payload.stats, payload.summary) || {};
    const todayReviewsSource = firstObject(payload.todayReviews, payload.upcomingReviews, payload.reviewSchedule) || {};
    const myCoursesSource = firstObject(payload.myCourses, payload.subjects, payload.mySubjects, payload.enrollments) || {};
    const recentCourseSource = firstObject(
        payload.recentCourse,
        payload.recentSubject,
        payload.lastStudiedSubject,
        payload.latestSubject,
        payload.currentSubject,
    );

    const subjects = firstArray(
        myCoursesSource?.items,
        payload.subjects,
        payload.mySubjects,
        payload.enrollments,
        payload.courses,
        payload.myCourses,
        payload.items,
    ).map(normalizeSubject);

    return {
        user: firstObject(payload.user) || null,
        stats: {
            studyTime: normalizeHours(
                pickCandidate(studyTimeSource, ['totalHours', 'studyTime', 'studyHours', 'hoursStudied', 'totalStudyHours'], 0),
            ),
            performance: clamp(
                toNumber(
                    pickCandidate(
                        performanceSource,
                        ['averageAccuracy', 'performance', 'averageScore', 'avgScore', 'accuracy', 'accuracyRate'],
                        0,
                    ),
                ),
                0,
                100,
            ),
            flashcardsReviewed: toNumber(
                pickCandidate(
                    quickStatsSource,
                    ['flashcardsReviewed', 'reviewedFlashcards', 'totalReviewedFlashcards', 'flashcardReviews'],
                    0,
                ),
                0,
            ),
            testsCompleted: toNumber(
                pickCandidate(quickStatsSource, ['testsCompleted', 'completedTests', 'totalTestsCompleted', 'quizCompleted'], 0),
                0,
            ),
            studyStreak: toNumber(pickCandidate(quickStatsSource, ['streakDays', 'studyStreak', 'streak', 'currentStreak'], 0), 0),
            performanceNote: normalizePerformanceNote(performanceSource),
        },
        studyData: firstArray(
            studyTimeSource?.chart,
            payload.studyData,
            payload.studySeries,
            payload.monthlyStudy,
            payload.studyTimeSeries,
            payload.learningSeries,
        ).map(normalizeStudySeriesItem),
        upcomingReviews: firstArray(
            todayReviewsSource?.items,
            payload.upcomingReviews,
            payload.reviewSchedule,
            payload.todayReviews,
            payload.reviews,
        ).map(normalizeUpcomingReview),
        recentSubject: normalizeRecentSubject(recentCourseSource, subjects[0]),
        weakTopics: firstArray(
            recentCourseSource?.weakPoints,
            payload.weakTopics,
            payload.weakAreas,
            payload.aiWeakTopics,
            payload.aiAnalysis?.weakTopics,
        ).map(normalizeWeakTopic),
        subjects,
    };
}
