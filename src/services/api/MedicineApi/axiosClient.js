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
    // Xử lý khi token hết hạn (401)
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Xóa token
      localStorage.removeItem("username"); // Xóa thông tin người dùng nếu cần
      window.location.href = "/"; // Điều hướng về trang đăng nhập
    }
    return Promise.reject(new Error(errorData));
  }
);

export default axiosClient;