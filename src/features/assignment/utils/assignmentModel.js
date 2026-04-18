function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function clampScore(value, maxScore) {
    const parsed = toNumber(value, 0);
    const ceiling = Math.max(0, toNumber(maxScore, 0));
    return Math.max(0, Math.min(parsed, ceiling || parsed));
}

export function buildAssignmentLessonKey(courseId, chapterId, lessonId) {
    return [courseId, chapterId, lessonId].filter(Boolean).join(':');
}

export function createDefaultRubricCriterion(index, totalPoints = 100) {
    const defaultMaxPoints = Math.max(5, Math.round(totalPoints / 4) || 25);

    return {
        criterionId: `criterion-${index}`,
        title: '',
        description: '',
        maxPoints: defaultMaxPoints,
    };
}

export function normalizeRubricCriteria(criteria, maxScore = 100) {
    const items = Array.isArray(criteria) ? criteria : [];
    
    const fallback = [
        { 
            title: 'Mức độ đúng yêu cầu', 
            description: 'Trả lời đúng trọng tâm và giải quyết bài toán.', 
            maxPoints: 40 
        },
        { 
            title: 'Lập luận và giải thích', 
            description: 'Diễn giải rõ ràng, có logic và dễ theo dõi.', 
            maxPoints: 35 
        },
        { 
            title: 'Trình bày', 
            description: 'Cấu trúc gọn gàng, dễ đọc và dễ đánh giá.', 
            maxPoints: 25 
        },
    ];

    const normalized = (items.length > 0 ? items : fallback)
        .map((criterion, index) => ({
            criterionId: criterion?.criterionId || criterion?.id || `criterion-${index + 1}`,
            title: String(criterion?.title || criterion?.criterionTitle || '').trim(),
            description: String(criterion?.description || criterion?.criterionDescription || '').trim(),
            maxPoints: Math.max(0, toNumber(
                criterion?.maxPoints ?? criterion?.score ?? criterion?.weight,
                0
            )),
        }))
        .filter((criterion) => criterion.title);

    const total = normalized.reduce((sum, criterion) => sum + criterion.maxPoints, 0);

    if (normalized.length === 0) {
        return normalizeRubricCriteria(fallback, maxScore);
    }

    if (total <= 0) {
        const evenMaxPoints = Math.max(1, Math.round(Math.max(1, toNumber(maxScore, 100)) / normalized.length));
        return normalized.map((criterion) => ({
            ...criterion,
            maxPoints: evenMaxPoints,
        }));
    }

    return normalized;
}

export function createDefaultAssignmentDraft() {
    return {
        title: '',
        description: '',
        instructions: '',
        submissionFormat: 'Trả lời bằng văn bản, có thể chia thành các ý nhỏ để dễ chấm điểm.',
        maxScore: 100,
        rubricCriteria: normalizeRubricCriteria([], 100),
        sourceType: 'manual',
    };
}

export function normalizeAssignmentDetail(source = {}, context = {}) {
    const maxScore = Math.max(
        1,
        toNumber(
            source?.maxScore
            ?? source?.maximumScore
            ?? source?.totalPoints
            ?? context?.maxScore
            ?? 100,
            100
        )
    );

    const rubricCriteria = normalizeRubricCriteria(
        source?.rubricCriteria
        ?? source?.rubric
        ?? source?.criteria,
        maxScore
    );

    return {
        assignmentId: source?.assignmentId || source?.id || context?.assignmentId || null,
        courseId: source?.courseId || context?.courseId || null,
        chapterId: source?.chapterId || context?.chapterId || null,
        lessonId: source?.lessonId || context?.lessonId || null,
        title: String(source?.title || source?.assignmentTitle || context?.title || '').trim(),
        description: String(source?.description || source?.brief || source?.prompt || '').trim(),
        instructions: String(source?.instructions || source?.submissionInstructions || '').trim(),
        submissionFormat: String(
            source?.submissionFormat
            || source?.answerFormat
            || 'Trả lời bằng văn bản, có thể chia thành các ý nhỏ để dễ chấm điểm.'
        ).trim(),
        maxScore,
        rubricCriteria,
        sourceType: String(source?.sourceType || source?.createdBy || context?.sourceType || 'manual')
            .trim()
            .toLowerCase() || 'manual',
        reviewFocus: String(source?.reviewFocus || source?.feedbackFocus || '').trim(),
        totalSubmissions: Math.max(0, toNumber(source?.totalSubmissions ?? source?.submissionCount, 0)),
        updatedAtUtc: source?.updatedAtUtc || source?.updatedAt || new Date().toISOString(),
        status: String(source?.status || 'active').trim().toLowerCase(),
    };
}

export function normalizeSubmissionRubricScores(scores, assignment = null) {
    const assignmentCriteria = Array.isArray(assignment?.rubricCriteria) ? assignment.rubricCriteria : [];
    const rawScores = Array.isArray(scores) ? scores : [];

    const normalized = rawScores.map((score, index) => {
        const matchedCriterion = assignmentCriteria.find((criterion) => (
            criterion.criterionId === score?.criterionId
            || criterion.title === score?.criterionTitle
        )) || assignmentCriteria[index];

        const maxPoints = Math.max(
            0,
            toNumber(score?.maxPoints ?? matchedCriterion?.maxPoints, matchedCriterion?.maxPoints ?? 0)
        );

        return {
            criterionId: score?.criterionId || matchedCriterion?.criterionId || `criterion-${index + 1}`,
            criterionTitle: String(
                score?.criterionTitle
                || score?.title
                || matchedCriterion?.title
                || `Tiêu chí ${index + 1}`
            ).trim(),
            feedback: String(score?.feedback || score?.comment || '').trim(),
            awardedPoints: clampScore(score?.awardedPoints ?? score?.score, maxPoints),
            maxPoints,
        };
    });

    if (normalized.length > 0) {
        return normalized;
    }

    // Nếu không có điểm nào, trả về khung tiêu chí mặc định
    return assignmentCriteria.map((criterion) => ({
        criterionId: criterion.criterionId,
        criterionTitle: criterion.title,
        feedback: '',
        awardedPoints: 0,
        maxPoints: criterion.maxPoints,
    }));
}

export function normalizeAssignmentSubmission(source = {}, context = {}) {
    const assignment = context?.assignment 
        ? normalizeAssignmentDetail(context.assignment, context) 
        : null;

    const maxScore = Math.max(
        1,
        toNumber(
            source?.maxScore
            ?? source?.maximumScore
            ?? assignment?.maxScore
            ?? context?.maxScore
            ?? 100,
            100
        )
    );

    const rubricScores = normalizeSubmissionRubricScores(
        source?.rubricScores
        ?? source?.rubricBreakdown
        ?? source?.criteriaScores,
        assignment
    );

    const score = clampScore(
        source?.score
        ?? source?.awardedScore
        ?? rubricScores.reduce((sum, item) => sum + item.awardedPoints, 0),
        maxScore
    );

    return {
        submissionId: source?.submissionId || source?.id || null,
        assignmentId: source?.assignmentId || assignment?.assignmentId || context?.assignmentId || null,
        courseId: source?.courseId || assignment?.courseId || context?.courseId || null,
        chapterId: source?.chapterId || assignment?.chapterId || context?.chapterId || null,
        lessonId: source?.lessonId || assignment?.lessonId || context?.lessonId || null,
        courseTitle: String(source?.courseTitle || context?.courseTitle || '').trim(),
        chapterTitle: String(source?.chapterTitle || context?.chapterTitle || '').trim(),
        lessonTitle: String(source?.lessonTitle || context?.lessonTitle || assignment?.title || '').trim(),
        assignmentTitle: String(source?.assignmentTitle || assignment?.title || context?.assignmentTitle || '').trim(),
        learnerId: source?.learnerId || source?.userId || source?.studentId || null,
        learnerName: String(source?.learnerName || source?.studentName || source?.userName || 'Học viên').trim(),
        learnerAvatarUrl: source?.learnerAvatarUrl || source?.studentAvatarUrl || source?.avatarUrl || '',
        answerText: String(source?.answerText || source?.submissionText || source?.answer || '').trim(),
        submittedAtUtc: source?.submittedAtUtc || source?.submittedAt || source?.createdAt || new Date().toISOString(),
        gradedAtUtc: source?.gradedAtUtc || source?.reviewedAt || source?.updatedAt || null,
        status: String(source?.status || 'graded').trim().toLowerCase(),
        score,
        maxScore,
        scorePercent: Math.round((score / maxScore) * 100),
        summary: String(source?.summary || source?.reviewSummary || source?.feedbackSummary || '').trim(),
        strengths: Array.isArray(source?.strengths)
            ? source.strengths.map((item) => String(item || '').trim()).filter(Boolean)
            : [],
        improvements: Array.isArray(source?.improvements)
            ? source.improvements.map((item) => String(item || '').trim()).filter(Boolean)
            : [],
        rubricScores,
    };
}

export function formatAssignmentScore(score, maxScore) {
    const resolvedMaxScore = Math.max(1, toNumber(maxScore, 100));
    const resolvedScore = clampScore(score, resolvedMaxScore);
    return `${resolvedScore}/${resolvedMaxScore}`;
}

export function summarizeAnswer(answerText, maxLength = 140) {
    const text = String(answerText || '').trim().replace(/\s+/g, ' ');
    if (!text) {
        return 'Chưa có nội dung nộp bài.';
    }

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}