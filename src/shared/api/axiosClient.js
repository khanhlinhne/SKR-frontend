import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 giay timeout
});

// ===== REQUEST INTERCEPTOR =====
// Tu dong gan token vao moi request neu da dang nhap
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token && token !== "undefined" && token !== "null") {
            console.log('Sending request with token:', token.substring(0, 20) + '...');
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // Xoa token khong hop le (neu co)
            if (token === "undefined" || token === "null") {
                console.warn('Invalid token found in localStorage, removing it');
                localStorage.removeItem("accessToken");
            }
            console.log('No valid token found in localStorage');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ===== RESPONSE INTERCEPTOR =====
// Xu ly loi chung (401 -> chuyen ve login, 500 -> thong bao loi...)
axiosClient.interceptors.response.use(
    (response) => {
        // Tra ve data truc tiep thay vi response wrapper
        return response.data;
    },
    (error) => {
        const { response } = error;

        if (response) {
            switch (response.status) {
                case 401: {
                    // Token het han hoac khong hop le
                    const url = response.config?.url || '';

                    // Khong xoa token neu loi 401 den tu cac API user profile
                    // (de component tu xu ly, vi co the do StrictMode goi 2 lan)
                    const isUserDataEndpoint = url.includes('/user/profile') || url.includes('/user/change-password');

                    if (!isUserDataEndpoint) {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("user");
                    }

                    // Chi redirect neu la loi tu cac API auth quan trong
                    if (url.includes('/auth/login') || url.includes('/auth/register')) {
                        window.location.href = "/login";
                    }
                    break;
                }
                case 403:
                    console.error("Khong co quyen truy cap!");
                    break;
                case 500:
                    console.error("Loi server!");
                    break;
                default:
                    break;
            }
        } else {
            // Loi mang (khong ket noi duoc backend)
            console.error("Khong the ket noi den server!");
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
