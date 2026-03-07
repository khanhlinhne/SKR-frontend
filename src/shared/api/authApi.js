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
     * Xac minh email bang OTP
     * POST /api/auth/verify-email
     * @param {Object} data - { email, otp }
     * @returns {{ message: string }}
     */
    verifyEmail(data) {
        return axiosClient.post("/auth/verify-email", data);
    },

    /**
     * Gui lai ma OTP
     * POST /api/auth/resend-otp
     * @param {Object} data - { email }
     * @returns {{ message: string }}
     */
    resendOtp(data) {
        return axiosClient.post("/auth/resend-otp", data);
    },

    /**
     * Gui ma OTP de dat lai mat khau
     * POST /api/auth/forgot-password
     * @param {Object} data - { email }
     * @returns {{ message: string }}
     */
    forgotPassword(data) {
        return axiosClient.post("/auth/forgot-password", data);
    },

    /**
     * Xac nhan OTP va dat lai mat khau
     * POST /api/auth/reset-password
     * @param {Object} data - { email, otp, newPassword }
     * @returns {{ message: string }}
     */
    resetPassword(data) {
        return axiosClient.post("/auth/reset-password", data);
    },

    /**
     * Gui lai ma OTP
     * POST /api/auth/resend-forgot-otp
     * @param {Object} data - { email }
     * @returns {{ message: string }}
     */
    resendForgotOtp(data) {
        return axiosClient.post("/auth/resend-forgot-otp", data);
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

    /**
     * Lay thong tin nguoi dung hien tai
     * GET /api/user/profile
     * @returns {{ user: Object }}
     */
    getMe() {
        return axiosClient.get("/user/profile");
    },

    /**
     * Cap nhat thong tin nguoi dung
     * PUT /api/user/profile
     * @param {Object} data - { name, phone, location, bio }
     * @returns {{ message: string, user: Object }}
     */
    updateProfile(data) {
        return axiosClient.put("/user/profile", data);
    },

    /**
     * Doi mat khau
     * POST /api/user/change-password
     * @param {Object} data - { currentPassword, newPassword }
     * @returns {{ message: string }}
     */
    changePassword(data) {
        return axiosClient.post("/user/change-password", data);
    },
};

export default authApi;
