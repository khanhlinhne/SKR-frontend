import axiosClient from "./axiosClient";

const courseApi = {
    // Lay danh sach khoa hoc
    getAll(params) {
        // params = { page, limit, search, category, ... }
        return axiosClient.get("/courses", { params });
    },

    // Lay chi tiet 1 khoa hoc
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
};

export default courseApi;
