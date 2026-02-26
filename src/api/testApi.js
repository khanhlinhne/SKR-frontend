import axiosClient from "./axiosClient";

const testApi = {
    // Lay danh sach bai test
    getAll(params) {
        // params = { page, limit, search, ... }
        return axiosClient.get("/tests", { params });
    },

    // Lay chi tiet 1 bai test
    getById(id) {
        return axiosClient.get(`/tests/${id}`);
    },

    // Bat dau lam bai test
    startTest(id) {
        return axiosClient.post(`/tests/${id}/start`);
    },

    // Nop bai test
    submitTest(id, data) {
        // data = { answers: [{ questionId, selectedOption }, ...] }
        return axiosClient.post(`/tests/${id}/submit`, data);
    },

    // Lay ket qua bai test
    getResults(id) {
        return axiosClient.get(`/tests/${id}/results`);
    },
};

export default testApi;
