import axiosClient from "./axiosClient";

function normalizeLessonMutationPayload(data) {
    if (!data || typeof data !== 'object' || (typeof FormData !== 'undefined' && data instanceof FormData)) {
        return data;
    }

    const payload = { ...data };
    const resolvedLessonType = String(
        payload.lessonType
        ?? payload.type
        ?? payload.lesson_type
        ?? ''
    ).trim().toLowerCase();

    if (resolvedLessonType) {
        payload.lessonType = resolvedLessonType;
        payload.type = resolvedLessonType;
        payload.lesson_type = resolvedLessonType;
    }

    return payload;
}

const courseApi = {
    // Lay danh sach khoa hoc
    getAll(params) {
        // params = { page, limit, search, category, creatorId, ... }
        return axiosClient.get("/courses", { params });
    },

    // Lay chi tiet 1 khoa hoc (bao gom chapters + lessons)
    getById(id) {
        return axiosClient.get(`/courses/${id}`);
    },

    // Dang ky / mua khoa hoc
    enroll(id) {
        return axiosClient.post(`/courses/${id}/enroll`);
    },

    // Lay tien do hoc cua user
    getProgress(id) {
        return axiosClient.get(`/courses/${id}/progress`);
    },

    // Cap nhat tien do hoc (hoan thanh 1 bai)
    updateProgress(id, data) {
        // data = { lessonId, completed: true }
        return axiosClient.put(`/courses/${id}/progress`, data);
    },

    // ══════════════════════════════════════════════
    //  CHAPTERS
    // ══════════════════════════════════════════════
    getChapters(courseId) {
        return axiosClient.get(`/courses/${courseId}/chapters`);
    },

    createChapter(courseId, data) {
        return axiosClient.post(`/courses/${courseId}/chapters`, data);
    },

    updateChapter(courseId, chapterId, data) {
        return axiosClient.patch(`/courses/${courseId}/chapters/${chapterId}`, data);
    },

    deleteChapter(courseId, chapterId) {
        return axiosClient.delete(`/courses/${courseId}/chapters/${chapterId}`);
    },

    // ══════════════════════════════════════════════
    //  LESSONS
    // ══════════════════════════════════════════════
    getLessons(courseId, chapterId) {
        return axiosClient.get(`/courses/${courseId}/chapters/${chapterId}/lessons`);
    },

    createLesson(courseId, chapterId, data) {
        return axiosClient.post(
            `/courses/${courseId}/chapters/${chapterId}/lessons`,
            normalizeLessonMutationPayload(data),
        );
    },

    updateLesson(courseId, chapterId, lessonId, data) {
        return axiosClient.patch(
            `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
            normalizeLessonMutationPayload(data),
        );
    },

    deleteLesson(courseId, chapterId, lessonId) {
        return axiosClient.delete(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`);
    },

    // ══════════════════════════════════════════════
    //  LESSON CONTENT
    // ══════════════════════════════════════════════
    getLessonContent(courseId, chapterId, lessonId, config) {
        return axiosClient.get(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/content`, config);
    },

    // Videos
    addVideo(courseId, chapterId, lessonId, data) {
        return axiosClient.post(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/videos`, data);
    },
    deleteVideo(courseId, chapterId, lessonId, videoId) {
        return axiosClient.delete(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/videos/${videoId}`);
    },

    // Documents
    addDocument(courseId, chapterId, lessonId, data) {
        const config = (typeof FormData !== 'undefined' && data instanceof FormData)
            ? { headers: { 'Content-Type': undefined } }
            : undefined;
        return axiosClient.post(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/documents`, data, config);
    },
    deleteDocument(courseId, chapterId, lessonId, documentId) {
        return axiosClient.delete(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/documents/${documentId}`);
    },

    // Questions
    addQuestion(courseId, chapterId, lessonId, data) {
        return axiosClient.post(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/questions`, data);
    },
    deleteQuestion(courseId, chapterId, lessonId, questionId) {
        return axiosClient.delete(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/questions/${questionId}`);
    },
};

export default courseApi;

