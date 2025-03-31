import axios from "axios";
import { api as apiConfig } from "../../../config";

const axiosClient = axios.create(apiConfig.URLDomain);

axiosClient.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        return config;
    },
    async (error) => Promise.reject(new Error(error))
);

axiosClient.interceptors.response.use(
    async (response) => {
        if (response && response.data) {
            return response.data;
        }
    },
    async (error) => {
        const errorData = error.response?.data || "";
        // Không xử lý 401 ở đây, để useCallApi quản lý
        return Promise.reject(error); // Trả lỗi về cho useCallApi
    }
);

export default axiosClient;