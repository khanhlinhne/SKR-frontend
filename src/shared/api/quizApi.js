import axiosClient from "./axiosClient";

const quizApi = {
    // ========== QUIZ PRACTICES (Bài thi thử) ==========

    /**
     * Lấy danh sách bài thi thử của user hiện tại
     * GET /api/quiz-practices
     * @param {Object} params - { page, limit, search, status }
     */
    getPractices(params) {
        return axiosClient.get("/quiz-practices", { params });
    },

    /**
     * Lấy chi tiết 1 bài thi thử
     * GET /api/quiz-practices/{practiceTestId}
     * @param {string} practiceTestId
     */
    getPracticeById(practiceTestId) {
        return axiosClient.get(`/quiz-practices/${practiceTestId}`);
    },

    /**
     * Tạo bài thi thử mới
     * POST /api/quiz-practices
     * @param {Object} data - { testTitle, testDescription, courseIds, difficultyLevels, questionTypes, totalQuestions, timeLimitMinutes, ... }
     */
    createPractice(data) {
        return axiosClient.post("/quiz-practices", data);
    },

    /**
     * Cập nhật bài thi thử
     * PATCH /api/quiz-practices/{practiceTestId}
     * @param {string} practiceTestId
     * @param {Object} data
     */
    updatePractice(practiceTestId, data) {
        return axiosClient.patch(`/quiz-practices/${practiceTestId}`, data);
    },

    /**
     * Xóa bài thi thử (soft delete)
     * DELETE /api/quiz-practices/{practiceTestId}
     * @param {string} practiceTestId
     */
    deletePractice(practiceTestId) {
        return axiosClient.delete(`/quiz-practices/${practiceTestId}`);
    },

    // ========== QUIZ ATTEMPTS (Lượt thi) ==========

    /**
     * Bắt đầu 1 lượt thi mới
     * POST /api/quiz-practices/{practiceTestId}/attempts
     * @param {string} practiceTestId
     * @param {Object} [data] - { passingScore }
     * @returns attempt object với questions
     */
    startAttempt(practiceTestId, data = {}) {
        return axiosClient.post(`/quiz-practices/${practiceTestId}/attempts`, data);
    },

    /**
     * Lấy thông tin lượt thi + danh sách câu hỏi (khi đang thi)
     * GET /api/quiz-attempts/{attemptId}
     * @param {string} attemptId
     */
    getAttempt(attemptId) {
        return axiosClient.get(`/quiz-attempts/${attemptId}`);
    },

    /**
     * Nộp bài thi
     * POST /api/quiz-attempts/{attemptId}/submit
     * @param {string} attemptId
     * @param {Object} data - { answers: [{ questionId, selectedOptionIds?, answerText? }] }
     */
    submitAttempt(attemptId, data) {
        return axiosClient.post(`/quiz-attempts/${attemptId}/submit`, data);
    },

    /**
     * Lấy kết quả tổng quan sau khi nộp bài
     * GET /api/quiz-attempts/{attemptId}/result
     * @param {string} attemptId
     */
    getAttemptResult(attemptId) {
        return axiosClient.get(`/quiz-attempts/${attemptId}/result`);
    },

    /**
     * Xem lại chi tiết bài làm (đáp án đúng/sai)
     * GET /api/quiz-attempts/{attemptId}/review
     * @param {string} attemptId
     */
    reviewAttempt(attemptId) {
        return axiosClient.get(`/quiz-attempts/${attemptId}/review`);
    },

    /**
     * Lấy danh sách lượt thi của user (lịch sử)
     * GET /api/quiz-attempts
     * @param {Object} params - { page, limit, status, practiceTestId }
     */
    getMyAttempts(params) {
        return axiosClient.get("/quiz-attempts", { params });
    },
};

export default quizApi;
