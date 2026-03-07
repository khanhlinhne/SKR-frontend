import axiosClient from "./axiosClient";

const subjectApi = {
    // Lấy danh sách môn học
    getAll(params) {
        // params = { page, limit, search, status, isFree, isFeatured, creatorId, sortBy, sortOrder }
        return axiosClient.get("/subjects", { params });
    },

    // Lấy chi tiết 1 môn học
    getById(id) {
        return axiosClient.get(`/subjects/${id}`);
    },
};

export default subjectApi;
