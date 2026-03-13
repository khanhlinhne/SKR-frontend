import axiosClient from "./axiosClient";

function normalizeSubject(course) {
    if (!course) return course;

    return {
        ...course,
        subjectId: course.subjectId ?? course.courseId ?? null,
        subjectCode: course.subjectCode ?? course.courseCode ?? null,
        subjectName: course.subjectName ?? course.courseName ?? "",
        subjectDescription: course.subjectDescription ?? course.courseDescription ?? "",
        subjectIconUrl: course.subjectIconUrl ?? course.courseIconUrl ?? null,
        subjectBannerUrl: course.subjectBannerUrl ?? course.courseBannerUrl ?? null,
    };
}

function normalizeCollectionResponse(response) {
    const payload = response?.data || {};
    const items = Array.isArray(payload.items) ? payload.items.map(normalizeSubject) : [];

    return {
        ...response,
        data: {
            ...payload,
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
    // Lấy danh sách môn học
    async getAll(params) {
        // params = { page, limit, search, status, isFree, isFeatured, creatorId, sortBy, sortOrder }
        const response = await axiosClient.get("/courses", { params });
        return normalizeCollectionResponse(response);
    },

    // Lấy chi tiết 1 môn học
    async getById(id) {
        const response = await axiosClient.get(`/courses/${id}`);
        return normalizeDetailResponse(response);
    },
};

export default subjectApi;
