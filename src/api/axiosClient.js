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
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
                case 401:
                    // Token het han hoac khong hop le -> xoa token, chuyen ve login
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                    break;
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
