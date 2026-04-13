import axiosClient from './axiosClient';

const dashboardApi = {
    /**
     * Lay dashboard cua hoc vien hien tai
     * GET /api/dashboard/me
     * @returns {Object}
     */
    getMe() {
        return axiosClient.get('/dashboard/me');
    },
};

export default dashboardApi;
