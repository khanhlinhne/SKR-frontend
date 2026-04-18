import axiosClient from "./axiosClient";

const expertAnalyticsApi = {
    getOverview(courseId, params) {
        return axiosClient.get(`/experts/courses/${courseId}/analytics/overview`, { params });
    },

    getEnrollments(courseId, params) {
        return axiosClient.get(`/experts/courses/${courseId}/enrollments`, { params });
    },

    exportEnrollments(courseId, params) {
        return axiosClient.get(`/experts/courses/${courseId}/enrollments/export`, {
            params: {
                ...params,
                format: 'csv',
            },
            responseType: 'blob',
        });
    },
};

export default expertAnalyticsApi;
