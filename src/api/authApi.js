import axiosClient from "./axiosClient";

const authApi = {
    /**
     * Dang ky tai khoan
     * POST /api/auth/register
     * @param {Object} data - { username, email, password }
     * @returns {{ message: string }}
     */
    register(data) {
        return axiosClient.post("/auth/register", data);
    },

    /**
     * Dang nhap
     * POST /api/auth/login
     * @param {Object} data - { username, email, password }
     *   (co the truyen username HOAC email, kem password)
     * @returns {{ message: string, token: string }}
     */
    login(data) {
        return axiosClient.post("/auth/login", data);
    },
};

export default authApi;
