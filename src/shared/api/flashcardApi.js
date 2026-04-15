import axiosClient from "./axiosClient";

const flashcardApi = {
    // ========== FLASHCODE SETS ==========

    /**
     * Lấy danh sách flashcard sets public + của user hiện tại
     * GET /api/flashcard-sets
     * @param {Object} params - { page, limit, search }
     */
    getAllSets(params) {
        return axiosClient.get("/flashcard-sets", { params });
    },

    /**
     * Lấy chi tiết 1 flashcard set theo ID (bao gồm items)
     * GET /api/flashcard-sets/{id}
     * @param {string|number} id - Flashcard set ID
     */
    getSetById(id) {
        return axiosClient.get(`/flashcard-sets/${id}`);
    },

    /**
     * Tạo flashcard set mới
     * POST /api/flashcard-sets
     * @param {Object} data - { name, description, subject, color, icon }
     */
    createSet(data) {
        return axiosClient.post("/flashcard-sets", data);
    },

    /**
     * Cập nhật flashcard set
     * PATCH /api/flashcard-sets/{id}
     * @param {string|number} id - Flashcard set ID
     * @param {Object} data - { name, description, subject, color, icon }
     */
    updateSet(id, data) {
        return axiosClient.patch(`/flashcard-sets/${id}`, data);
    },

    /**
     * Xóa flashcard set
     * DELETE /api/flashcard-sets/{id}
     * @param {string|number} id - Flashcard set ID
     */
    deleteSet(id) {
        return axiosClient.delete(`/flashcard-sets/${id}`);
    },

    /**
     * Bắt đầu 1 phiên học flashcard
     * POST /api/flashcard-sets/{setId}/study-sessions
     * @param {string|number} setId - Flashcard set ID
     */
    startStudySession(setId) {
        return axiosClient.post(`/flashcard-sets/${setId}/study-sessions`);
    },

    /**
     * Lưu kết quả học 1 flashcard trong phiên học
     * POST /api/flashcard-sets/{setId}/study-sessions/{sessionId}/reviews
     * @param {string|number} setId - Flashcard set ID
     * @param {string|number} sessionId - Study session ID
     * @param {Object} data - { flashcardItemId, result, timeToAnswerSeconds }
     */
    submitStudyReview(setId, sessionId, data) {
        return axiosClient.post(`/flashcard-sets/${setId}/study-sessions/${sessionId}/reviews`, data);
    },

    /**
     * Lưu nhiều review trong 1 request (nếu backend hỗ trợ)
     * POST /api/flashcard-sets/{setId}/study-sessions/{sessionId}/reviews/batch
     * @param {string|number} setId - Flashcard set ID
     * @param {string|number} sessionId - Study session ID
     * @param {Object} data - { reviews: Array<{ flashcardItemId, result, reviewedAt, clientReviewId }> }
     */
    submitStudyReviewBatch(setId, sessionId, data) {
        return axiosClient.post(`/flashcard-sets/${setId}/study-sessions/${sessionId}/reviews/batch`, data);
    },

    /**
     * Kết thúc phiên học flashcard
     * POST /api/flashcard-sets/{setId}/study-sessions/{sessionId}/complete
     * @param {string|number} setId - Flashcard set ID
     * @param {string|number} sessionId - Study session ID
     * @param {Object} data - { sessionDurationSeconds }
     */
    completeStudySession(setId, sessionId, data) {
        return axiosClient.post(`/flashcard-sets/${setId}/study-sessions/${sessionId}/complete`, data);
    },

    // ========== FLASHCODE ITEMS ==========

    /**
     * Lấy danh sách items của 1 flashcard set
     * GET /api/flashcard-sets/{setId}/items
     * @param {string|number} setId - Flashcard set ID
     * @param {Object} params - { page, limit, search }
     */
    getItems(setId, params) {
        return axiosClient.get(`/flashcard-sets/${setId}/items`, { params });
    },

    /**
     * Tạo flashcard item mới
     * POST /api/flashcard-sets/{setId}/items
     * @param {string|number} setId - Flashcard set ID
     * @param {Object} data - { front, back, difficulty }
     */
    createItem(setId, data) {
        return axiosClient.post(`/flashcard-sets/${setId}/items`, data);
    },

    /**
     * Cập nhật flashcard item
     * PATCH /api/flashcard-sets/{setId}/items/{itemId}
     * @param {string|number} setId - Flashcard set ID
     * @param {string|number} itemId - Flashcard item ID
     * @param {Object} data - { front, back, difficulty }
     */
    updateItem(setId, itemId, data) {
        return axiosClient.patch(`/flashcard-sets/${setId}/items/${itemId}`, data);
    },

    /**
     * Xóa flashcard item
     * DELETE /api/flashcard-sets/{setId}/items/{itemId}
     * @param {string|number} setId - Flashcard set ID
     * @param {string|number} itemId - Flashcard item ID
     */
    deleteItem(setId, itemId) {
        return axiosClient.delete(`/flashcard-sets/${setId}/items/${itemId}`);
    },

    // ========== PUBLIC FLASHcard SETS (Guest Access) ==========

    /**
     * Tìm kiếm flashcard sets công khai (không cần auth)
     * GET /api/public/flashcard-sets
     * @param {Object} params - { q, search, page, limit, sortBy, sortOrder }
     */
    searchPublic(params = {}) {
        const normalizedParams = { ...params };

        if (normalizedParams.q && !normalizedParams.search) {
            normalizedParams.search = normalizedParams.q;
        }

        delete normalizedParams.q;
        delete normalizedParams.subject;
        delete normalizedParams.sortBy;
        delete normalizedParams.sortOrder;

        return axiosClient.get("/public/flashcard-sets", { params: normalizedParams });
    },

    /**
     * Lấy preview của 1 flashcard set (giới hạn số thẻ)
     * GET /api/public/flashcard-sets/{id}
     * @param {string|number} id - Flashcard set ID hoặc slug
     */
    getPreviewBySlug(idOrSlug) {
        return axiosClient.get(`/public/flashcard-sets/${idOrSlug}`);
    },

    /**
     * Lấy preview theo ID (giới hạn số thẻ)
     * GET /api/public/flashcard-sets/{id}
     * @param {string|number} id - Flashcard set ID
     */
    getPreviewById(id) {
        return axiosClient.get(`/public/flashcard-sets/${id}`);
    },

    /**
     * Lấy full flashcard set (yêu cầu auth)
     * GET /api/flashcard-sets/{id}
     * @param {string|number} id - Flashcard set ID hoặc slug
     */
    getFullSet(idOrSlug) {
        return axiosClient.get(`/flashcard-sets/${idOrSlug}`);
    },
};

export default flashcardApi;
