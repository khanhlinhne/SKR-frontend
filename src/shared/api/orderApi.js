import axiosClient from "./axiosClient";

const orderApi = {
    // Lay danh sach don hang
    getAll(params) {
        return axiosClient.get("/orders", { params });
    },

    // Lay chi tiet 1 don hang
    getById(id) {
        return axiosClient.get(`/orders/${id}`);
    },

    // Tao don hang moi (checkout)
    create(data) {
        return axiosClient.post("/orders", data);
    },

    verify(orderCode) {
        return axiosClient.get(`/orders/${orderCode}/verify`);
    },
};

export default orderApi;
