import axiosClient from './axiosClient';

const uploadApi = {
    uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        return axiosClient.post('/upload/image', formData);
    },
};

export default uploadApi;
