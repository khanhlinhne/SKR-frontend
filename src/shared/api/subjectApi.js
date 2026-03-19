import axiosClient from './axiosClient';
import { createTimedRequestMemo } from '../utils/requestMemo.js';

const LIST_CACHE_TTL_MS = 45 * 1000;
const DETAIL_CACHE_TTL_MS = 60 * 1000;
const subjectRequestMemo = createTimedRequestMemo();

function stableSerialize(value) {
    if (Array.isArray(value)) {
        return `[${value.map(stableSerialize).join(',')}]`;
    }

    if (value && typeof value === 'object') {
        return `{${Object.keys(value)
            .sort()
            .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
            .join(',')}}`;
    }

    return JSON.stringify(value);
}

function buildListCacheKey(params) {
    return `subjects:list:${stableSerialize(params || {})}`;
}

function buildDetailCacheKey(id) {
    return `subjects:detail:${id}`;
}

function normalizeSubject(course) {
    if (!course || typeof course !== 'object') {
        return course;
    }

    return {
        ...course,
        subjectId: course.subjectId ?? course.courseId ?? null,
        subjectCode: course.subjectCode ?? course.courseCode ?? null,
        subjectName: course.subjectName ?? course.courseName ?? '',
        subjectDescription: course.subjectDescription ?? course.courseDescription ?? '',
        subjectIconUrl: course.subjectIconUrl ?? course.courseIconUrl ?? null,
        subjectBannerUrl: course.subjectBannerUrl ?? course.courseBannerUrl ?? null,
    };
}

function resolveCollectionItems(payload) {
    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (Array.isArray(payload?.data?.items)) {
        return payload.data.items;
    }

    if (Array.isArray(payload)) {
        return payload;
    }

    return [];
}

function normalizeCollectionResponse(response) {
    const payload = response?.data || response || {};
    const items = resolveCollectionItems(payload).map(normalizeSubject);

    return {
        ...response,
        data: {
            ...(payload && typeof payload === 'object' ? payload : {}),
            items,
        },
    };
}

function normalizeDetailResponse(response) {
    const payload = response?.data || response || {};

    return {
        ...response,
        data: normalizeSubject(payload),
    };
}

const subjectApi = {
    async getAll(params = {}, options = {}) {
        const forceRefresh = options.forceRefresh === true;
        const ttlMs = Number.isFinite(options.ttlMs) ? options.ttlMs : LIST_CACHE_TTL_MS;
        const key = buildListCacheKey(params);

        return subjectRequestMemo.run(
            key,
            async () => {
                const response = await axiosClient.get('/courses', { params });
                return normalizeCollectionResponse(response);
            },
            {
                ttlMs,
                force: forceRefresh,
            },
        );
    },

    async getById(id, options = {}) {
        if (!id && id !== 0) {
            throw new Error('Subject id is required');
        }

        const forceRefresh = options.forceRefresh === true;
        const ttlMs = Number.isFinite(options.ttlMs) ? options.ttlMs : DETAIL_CACHE_TTL_MS;
        const key = buildDetailCacheKey(id);

        return subjectRequestMemo.run(
            key,
            async () => {
                const response = await axiosClient.get(`/courses/${id}`);
                return normalizeDetailResponse(response);
            },
            {
                ttlMs,
                force: forceRefresh,
            },
        );
    },

    clearCache() {
        subjectRequestMemo.clear();
    },
};

export default subjectApi;
