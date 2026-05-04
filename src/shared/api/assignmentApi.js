import axiosClient from './axiosClient';
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

function shouldUseReadFallback(error) {
    const status = error?.response?.status;
    return !status || [404, 405, 501, 503].includes(status);
}

function resolvePayload(response) {
    return response?.data || response || null;
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
            if (!shouldUseReadFallback(error)) {
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

        // Backend might fail if we send a string assignmentId (like "1:2:3") 
        // that is meant to be a database ID. If it looks like a temporary key, 
        // we remove it and let the backend identify the assignment by course/chapter/lesson.
        const cleanedPayload = { ...payload };
        if (typeof cleanedPayload.assignmentId === 'string' && cleanedPayload.assignmentId.includes(':')) {
            delete cleanedPayload.assignmentId;
        }

        try {
            const response = await axiosClient.put(
                `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/assignment`,
                cleanedPayload,
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
            throw error;
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
            if (!shouldUseReadFallback(error)) {
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
        try {
            const response = await axiosClient.post(
                `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/assignment/submissions`,
                data,
                { timeout: 30000 },
            );
            const payload = normalizeAssignmentSubmission(resolvePayload(response), {
                courseId,
                chapterId,
                lessonId,
            });

            if (!isValidAssignmentSubmission(payload)) {
                throw new Error('Backend chưa trả về bài nộp assignment hợp lệ.');
            }

            persistSubmission(payload);
            return payload;
        } catch (error) {
            throw error;
        }
    },

    async listExpertSubmissions(params = {}) {
        try {
            const response = await axiosClient.get('/experts/assignment-submissions', { params });
            const payload = resolvePayload(response);
            return extractSubmissionList(payload).map((item) => normalizeAssignmentSubmission(item));
        } catch (error) {
            if (!shouldUseReadFallback(error)) {
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
            const response = await axiosClient.get(`/experts/assignment-submissions/${submissionId}`);
            const payload = normalizeAssignmentSubmission(resolvePayload(response));
            persistSubmission(payload);
            return payload;
        } catch (error) {
            if (!shouldUseReadFallback(error)) {
                throw error;
            }

            return listStoredSubmissions().find((item) => item.submissionId === submissionId) || null;
        }
    },
};

export default assignmentApi;
