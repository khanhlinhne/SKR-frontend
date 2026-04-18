import axiosClient from "./axiosClient";

const expertDashboardApi = {
    getMe(params) {
        return axiosClient.get("/experts/dashboard/me", { params });
    },
};

export default expertDashboardApi;
