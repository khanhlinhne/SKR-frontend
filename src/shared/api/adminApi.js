import axiosClient from './axiosClient';
import subjectApi from './subjectApi';

const adminApi = {
    // ===== USER MANAGEMENT =====

    /**
     * Lay danh sach tat ca users (Admin only)
     * GET /api/user/all
     * @param {Object} params - { page, limit, search, role, status }
     * @returns {{ users: Array, total: number }}
     */
    getAllUsers(params) {
        return axiosClient.get("/user/all", { params });
    },

    /**
     * Lay thong tin chi tiet 1 user
     * GET /api/user/:id
     * @param {string} id - User ID
     * @returns {{ user: Object }}
     */
    getUserById(id) {
        return axiosClient.get(`/user/${id}`);
    },

    /**
     * Cap nhat trang thai user (ban/unban)
     * PUT /api/user/:id/status
     * @param {string} id - User ID
     * @param {Object} data - { status: 'active' | 'banned' }
     * @returns {{ message: string }}
     */
    updateUserStatus(id, data) {
        return axiosClient.put(`/user/${id}/status`, data);
    },

    // ===== COURSE MANAGEMENT =====

    /**
     * Lay tat ca khoa hoc (Admin view)
     * GET /api/courses?admin=true
     * @param {Object} params - { page, limit, search, status }
     * @returns {{ courses: Array, total: number }}
     */
    getAllCourses(params) {
        return axiosClient.get("/courses", { params: { ...params, admin: true } });
    },

    /**
     * Tao khoa hoc moi
     * POST /api/courses
     * @param {Object} data - Course data
     * @returns {{ course: Object }}
     */
    async createCourse(data) {
        const response = await axiosClient.post('/courses', data);
        subjectApi.clearCache();
        return response;
    },

    /**
     * Cap nhat khoa hoc
     * PUT /api/courses/:id
     * @param {string} id - Course ID
     * @param {Object} data - Updated course data
     * @returns {{ course: Object }}
     */
    async updateCourse(id, data) {
        const response = await axiosClient.put(`/courses/${id}`, data);
        subjectApi.clearCache();
        return response;
    },

    /**
     * Xoa khoa hoc
     * DELETE /api/courses/:id
     * @param {string} id - Course ID
     * @returns {{ message: string }}
     */
    async deleteCourse(id) {
        const response = await axiosClient.delete(`/courses/${id}`);
        subjectApi.clearCache();
        return response;
    },

    // ===== ORDER MANAGEMENT =====

    /**
     * Lay tat ca don hang (Admin view)
     * GET /api/orders?admin=true
     * @param {Object} params - { page, limit, status }
     * @returns {{ orders: Array, total: number }}
     */
    getAllOrders(params) {
        return axiosClient.get("/orders", { params: { ...params, admin: true } });
    },

    /**
     * Cap nhat trang thai don hang
     * PUT /api/orders/:id/status
     * @param {string} id - Order ID
     * @param {Object} data - { status }
     * @returns {{ message: string }}
     */
    updateOrderStatus(id, data) {
        return axiosClient.put(`/orders/${id}/status`, data);
    },

    // ===== DASHBOARD STATS =====

    /**
     * Lay thong ke tong quan cho admin dashboard
     * GET /api/admin/stats
     * @returns {{ totalUsers, totalCourses, totalOrders, revenue, ... }}
     */
    getDashboardStats() {
        return axiosClient.get("/admin/stats");
    },
};

export default adminApi;
