import axiosClient from "./axiosClient";

const enrollmentApi = {
    // Lấy danh sách khóa học đã đăng ký của user hiện tại
    getMyEnrollments(params) {
        return axiosClient.get("/enrollments/my", { params });
    },

    // Lấy danh sách khóa học đang học (có tiến độ > 0 và < 100)
    getInProgress() {
        return axiosClient.get("/enrollments/my/in-progress");
    },

    // Lấy danh sách khóa học đã hoàn thành
    getCompleted() {
        return axiosClient.get("/enrollments/my/completed");
    },

    // Lấy thống kê học tập tổng quan
    getStats() {
        return axiosClient.get("/enrollments/my/stats");
    },
};

export default enrollmentApi;
