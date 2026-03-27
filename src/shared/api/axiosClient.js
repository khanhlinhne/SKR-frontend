import axios from 'axios';
import { getAccessToken, clearTokens } from '@/shared/utils/tokenManager';

const isDev = import.meta.env.DEV;

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        // Let browser set multipart boundary automatically for FormData payloads
        if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;

            if (isDev) {
                console.log('Sending request with token:', `${token.substring(0, 20)}...`);
            }
        } else if (isDev) {
            console.log('No valid token found - token expired or not set');
        }

        return config;
    },
    (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const { response } = error;

        if (response) {
            switch (response.status) {
                case 401: {
                    const url = response.config?.url || '';
                    const isUserDataEndpoint = url.includes('/user/profile') || url.includes('/user/change-password');

                    if (!isUserDataEndpoint) {
                        clearTokens();
                    }

                    if (url.includes('/auth/login') || url.includes('/auth/register')) {
                        window.location.href = '/login';
                    }
                    break;
                }
                case 403:
                    if (isDev) {
                        console.error('Khong co quyen truy cap!');
                    }
                    break;
                case 500:
                    if (isDev) {
                        console.error('Loi server!');
                    }
                    break;
                default:
                    break;
            }
        } else if (isDev) {
            console.error('Khong the ket noi den server!');
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
