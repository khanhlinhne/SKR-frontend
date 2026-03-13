import axios from 'axios';

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
        const token = localStorage.getItem('accessToken');

        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;

            if (isDev) {
                console.log('Sending request with token:', `${token.substring(0, 20)}...`);
            }
        } else if (token === 'undefined' || token === 'null') {
            if (isDev) {
                console.warn('Invalid token found in localStorage, removing it');
            }

            localStorage.removeItem('accessToken');
        } else if (isDev) {
            console.log('No valid token found in localStorage');
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
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');
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
