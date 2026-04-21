import axiosClient from './axiosClient';
import aiGeminiApi from './aiGeminiApi';
import { readCachedUserProfile } from '@/shared/user';
import {
    buildAssignmentLessonKey,
    normalizeAssignmentDetail,
    normalizeAssignmentSubmission,
} from '@/features/assignment/utils/assignmentModel';

const ASSIGNMENT_STORAGE_KEY = 'skr-lesson-assignments-v1';
const ASSIGNMENT_SUBMISSION_STORAGE_KEY = 'skr-assignment-submissions-v1';
const ASSIGNMENT_CAPABILITY_STORAGE_KEY = 'skr-assignment-capabilities-v1';

function isBrowser() {
    return typeof window !== 'undefined';
}

function safeParse(value, fallback) {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function readStorageMap(key) {
    if (!isBrowser()) {
        return {};
    }

    return safeParse(localStorage.getItem(key), {});
}

function writeStorageMap(key, value) {
    if (!isBrowser()) {
        return;
    }

    localStorage.setItem(key, JSON.stringify(value));
}

function readCapabilityMap() {
    return readStorageMap(ASSIGNMENT_CAPABILITY_STORAGE_KEY);
}

function writeCapabilityMap(value) {
    writeStorageMap(ASSIGNMENT_CAPABILITY_STORAGE_KEY, value);
}

function readSubmissionList() {
    if (!isBrowser()) {
        return [];
    }

    return safeParse(localStorage.getItem(ASSIGNMENT_SUBMISSION_STORAGE_KEY), []);
}

function writeSubmissionList(items) {
    if (!isBrowser()) {
        return;
    }

    localStorage.setItem(ASSIGNMENT_SUBMISSION_STORAGE_KEY, JSON.stringify(items));
}

function shouldUseLocalFallback(error) {
    const status = error?.response?.status;
    return !status || [404, 405, 500, 501, 503].includes(status);
}

function resolvePayload(response) {
    return response?.data || response || null;
}

function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function extractSubmissionList(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (Array.isArray(payload?.submissions)) {
        return payload.submissions;
    }

    if (Array.isArray(payload?.data?.items)) {
        return payload.data.items;
    }

    return [];
}

function upsertStoredAssignment(courseId, chapterId, lessonId, payload) {
    const store = readStorageMap(ASSIGNMENT_STORAGE_KEY);
    const lessonKey = buildAssignmentLessonKey(courseId, chapterId, lessonId);
    const normalized = normalizeAssignmentDetail(payload, {
        courseId,
        chapterId,
        lessonId,
        assignmentId: payload?.assignmentId || payload?.id || lessonKey,
    });

    store[lessonKey] = normalized;
    writeStorageMap(ASSIGNMENT_STORAGE_KEY, store);
    return normalized;
}

function readStoredAssignment(courseId, chapterId, lessonId) {
    const store = readStorageMap(ASSIGNMENT_STORAGE_KEY);
    const lessonKey = buildAssignmentLessonKey(courseId, chapterId, lessonId);
    const stored = store[lessonKey];

    return stored
        ? normalizeAssignmentDetail(stored, { courseId, chapterId, lessonId, assignmentId: lessonKey })
        : null;
}

function isLessonRouteUnsupported(courseId, chapterId, lessonId) {
    const capabilityMap = readCapabilityMap();
    const lessonKey = buildAssignmentLessonKey(courseId, chapterId, lessonId);
    return Boolean(capabilityMap?.unsupportedLessonRoutes?.[lessonKey]);
}

function markLessonRouteUnsupported(courseId, chapterId, lessonId, value = true) {
    const capabilityMap = readCapabilityMap();
    const lessonKey = buildAssignmentLessonKey(courseId, chapterId, lessonId);
    const nextUnsupportedRoutes = {
        ...(capabilityMap?.unsupportedLessonRoutes || {}),
    };

    if (value) {
        nextUnsupportedRoutes[lessonKey] = true;
    } else {
        delete nextUnsupportedRoutes[lessonKey];
    }

    writeCapabilityMap({
        ...capabilityMap,
        unsupportedLessonRoutes: nextUnsupportedRoutes,
    });
}

function listStoredSubmissions() {
    return readSubmissionList()
        .map((item) => normalizeAssignmentSubmission(item))
        .filter((item) => isValidAssignmentSubmission(item));
}

function estimateSubmissionGrade(assignment, answerText) {
    const text = String(answerText || '').trim();
    const maxScore = Math.max(assignment?.maxScore || 100, 1);
    const criteria = Array.isArray(assignment?.rubricCriteria) ? assignment.rubricCriteria : [];

    if (!text) {
        return {
            score: 0,
            summary: 'Bai nop khong co noi dung de cham diem.',
            strengths: [],
            improvements: ['Can nop cau tra loi day du theo de bai.'],
            rubricScores: criteria.map((criterion) => ({
                criterionId: criterion.criterionId,
                criterionTitle: criterion.title,
                awardedPoints: 0,
                maxPoints: criterion.maxPoints,
                feedback: 'Chua co noi dung de danh gia.',
            })),
        };
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const coverageRatio = Math.max(0.25, Math.min(1, wordCount / 180));
    const clarityBoost = /(\n|- |\d+\.)/.test(text) ? 0.08 : 0;
    const scoreRatio = Math.min(0.94, coverageRatio + clarityBoost);

    const rubricScores = criteria.map((criterion) => {
        const awardedPoints = Math.round((criterion.maxPoints || 0) * scoreRatio);
        return {
            criterionId: criterion.criterionId,
            criterionTitle: criterion.title,
            awardedPoints,
            maxPoints: criterion.maxPoints,
            feedback: awardedPoints >= criterion.maxPoints * 0.8
                ? 'Bai lam dap ung kha tot tieu chi nay.'
                : 'Can bo sung them ly giai, vi du hoac cau truc de dat diem cao hon.',
        };
    });
    const score = Math.min(
        maxScore,
        rubricScores.reduce((sum, item) => sum + item.awardedPoints, 0) || Math.round(maxScore * scoreRatio),
    );

    return {
        score,
        summary: 'Diem nay duoc uoc tinh bang fallback local vi dich vu cham AI chua san sang.',
        strengths: scoreRatio >= 0.7 ? ['Bai lam co cau truc va bao phu duoc yeu cau chinh.'] : [],
        improvements: ['Nen bo sung ly giai cu the hon de tang do thuyet phuc.'],
        rubricScores,
    };
}

async function gradeSubmission(assignment, answerText) {
    try {
        return await aiGeminiApi.gradeAssignment({
            assignment,
            learnerAnswer: answerText,
            language: 'vi',
        });
    } catch {
        return estimateSubmissionGrade(assignment, answerText);
    }
}

function persistSubmission(payload) {
    if (!isValidAssignmentSubmission(payload)) {
        return null;
    }

    const submissions = readSubmissionList();
    const next = submissions.filter((item) => item.submissionId !== payload.submissionId);
    next.push(payload);
    writeSubmissionList(next);
    return payload;
}

function isValidAssignmentSubmission(submission) {
    return Boolean(
        submission?.submissionId
        && String(submission?.answerText || '').trim()
    );
}

const assignmentApi = {
    peekLessonAssignment(courseId, chapterId, lessonId) {
        return readStoredAssignment(courseId, chapterId, lessonId);
    },

    async getLessonAssignment(courseId, chapterId, lessonId) {
        if (isLessonRouteUnsupported(courseId, chapterId, lessonId)) {
            return readStoredAssignment(courseId, chapterId, lessonId);
        }

        try {
            const response = await axiosClient.get(
                `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/assignment`,
            );
            const payload = resolvePayload(response);
            const normalized = normalizeAssignmentDetail(payload, { courseId, chapterId, lessonId });
            markLessonRouteUnsupported(courseId, chapterId, lessonId, false);
            upsertStoredAssignment(courseId, chapterId, lessonId, normalized);
            return normalized;
        } catch (error) {
            if (!shouldUseLocalFallback(error)) {
                throw error;
            }

            markLessonRouteUnsupported(courseId, chapterId, lessonId, true);
            return readStoredAssignment(courseId, chapterId, lessonId);
        }
    },

    async upsertLessonAssignment(courseId, chapterId, lessonId, data) {
        const payload = normalizeAssignmentDetail(data, {
            courseId,
            chapterId,
            lessonId,
            assignmentId: data?.assignmentId || buildAssignmentLessonKey(courseId, chapterId, lessonId),
        });

        try {
            const response = await axiosClient.put(
                `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/assignment`,
                payload,
            );
            const normalized = normalizeAssignmentDetail(resolvePayload(response), {
                courseId,
                chapterId,
                lessonId,
                assignmentId: payload.assignmentId,
            });
            markLessonRouteUnsupported(courseId, chapterId, lessonId, false);
            upsertStoredAssignment(courseId, chapterId, lessonId, normalized);
            return normalized;
        } catch (error) {
            if (!shouldUseLocalFallback(error)) {
                throw error;
            }

            markLessonRouteUnsupported(courseId, chapterId, lessonId, true);
            return upsertStoredAssignment(courseId, chapterId, lessonId, payload);
        }
    },

    async getMySubmission(courseId, chapterId, lessonId) {
        const profile = readCachedUserProfile();

        try {
            const response = await axiosClient.get(
                `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/assignment/submissions/me`,
            );
            const payload = normalizeAssignmentSubmission(resolvePayload(response), {
                courseId,
                chapterId,
                lessonId,
            });

            if (!isValidAssignmentSubmission(payload)) {
                return null;
            }

            persistSubmission(payload);
            return payload;
        } catch (error) {
            if (!shouldUseLocalFallback(error)) {
                throw error;
            }

            const lessonKey = buildAssignmentLessonKey(courseId, chapterId, lessonId);
            const stored = listStoredSubmissions()
                .filter((item) => (
                    buildAssignmentLessonKey(item.courseId, item.chapterId, item.lessonId) === lessonKey
                    && (!profile?.userId || item.learnerId === profile.userId)
                ))
                .sort((a, b) => new Date(b.submittedAtUtc).getTime() - new Date(a.submittedAtUtc).getTime())[0];

            return stored || null;
        }
    },

    async submitLessonAssignment(courseId, chapterId, lessonId, data = {}) {
        const profile = readCachedUserProfile();

        try {
            const response = await axiosClient.post(
                `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/assignment/submissions`,
                data,
            );
            const payload = normalizeAssignmentSubmission(resolvePayload(response), {
                courseId,
                chapterId,
                lessonId,
            });

            if (!isValidAssignmentSubmission(payload)) {
                throw new Error('Backend chua tra ve bai nop assignment hop le.');
            }

            persistSubmission(payload);
            return payload;
        } catch (error) {
            if (!shouldUseLocalFallback(error)) {
                throw error;
            }

            const assignment = normalizeAssignmentDetail(
                data?.assignment || await this.getLessonAssignment(courseId, chapterId, lessonId),
                { courseId, chapterId, lessonId },
            );
            const review = await gradeSubmission(assignment, data?.answerText || '');
            const payload = normalizeAssignmentSubmission(
                {
                    submissionId: createId('assignment_submission'),
                    assignmentId: assignment.assignmentId,
                    courseId,
                    chapterId,
                    lessonId,
                    courseTitle: data?.courseTitle,
                    chapterTitle: data?.chapterTitle,
                    lessonTitle: data?.lessonTitle,
                    assignmentTitle: assignment.title,
                    learnerId: profile?.userId || 'local-user',
                    learnerName: profile?.name || 'Nguoi dung',
                    learnerAvatarUrl: profile?.avatarUrl || '',
                    answerText: data?.answerText || '',
                    status: 'graded',
                    submittedAtUtc: new Date().toISOString(),
                    gradedAtUtc: new Date().toISOString(),
                    score: review.score,
                    maxScore: assignment.maxScore,
                    summary: review.summary,
                    strengths: review.strengths,
                    improvements: review.improvements,
                    rubricScores: review.rubricScores,
                },
                {
                    assignment,
                    courseId,
                    chapterId,
                    lessonId,
                    courseTitle: data?.courseTitle,
                    chapterTitle: data?.chapterTitle,
                    lessonTitle: data?.lessonTitle,
                },
            );

            persistSubmission(payload);
            return payload;
        }
    },

    async listExpertSubmissions(params = {}) {
        try {
            const response = await axiosClient.get('/expert/assignment-submissions', { params });
            const payload = resolvePayload(response);
            return extractSubmissionList(payload).map((item) => normalizeAssignmentSubmission(item));
        } catch (error) {
            if (!shouldUseLocalFallback(error)) {
                throw error;
            }

            const { search, status, courseId, lessonId } = params;
            return listStoredSubmissions().filter((item) => {
                const matchesStatus = !status || status === 'all' || item.status === status;
                const matchesCourse = !courseId || item.courseId === courseId;
                const matchesLesson = !lessonId || item.lessonId === lessonId;
                const searchValue = String(search || '').trim().toLowerCase();
                const haystack = [
                    item.learnerName,
                    item.assignmentTitle,
                    item.courseTitle,
                    item.lessonTitle,
                    item.answerText,
                ].join(' ').toLowerCase();
                const matchesSearch = !searchValue || haystack.includes(searchValue);
                return matchesStatus && matchesCourse && matchesLesson && matchesSearch;
            });
        }
    },

    async getSubmissionDetail(submissionId) {
        try {
            const response = await axiosClient.get(`/expert/assignment-submissions/${submissionId}`);
            const payload = normalizeAssignmentSubmission(resolvePayload(response));
            persistSubmission(payload);
            return payload;
        } catch (error) {
            if (!shouldUseLocalFallback(error)) {
                throw error;
            }

            return listStoredSubmissions().find((item) => item.submissionId === submissionId) || null;
        }
    },
};

export default assignmentApi;
