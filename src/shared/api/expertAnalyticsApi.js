import axiosClient from "./axiosClient";

const expertAnalyticsApi = {
    getOverview(courseId, params, config = {}) {
        return axiosClient.get(`/experts/courses/${courseId}/analytics/overview`, {
            ...config,
            params,
        });
    },

    getEnrollments(courseId, params, config = {}) {
        return axiosClient.get(`/experts/courses/${courseId}/enrollments`, {
            ...config,
            params,
        });
    },

    exportEnrollments(courseId, params, config = {}) {
        return axiosClient.get(`/experts/courses/${courseId}/enrollments/export`, {
            ...config,
            params: {
                ...params,
                format: 'csv',
            },
            responseType: 'blob',
        });
    },
};

export default expertAnalyticsApi;
