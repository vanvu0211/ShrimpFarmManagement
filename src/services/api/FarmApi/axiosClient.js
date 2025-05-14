import axios from "axios";
import { api as apiConfig } from "../../../config";

const axiosClient = axios.create(apiConfig.URLDomain);

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý lỗi mạng
    if (error.code === "ERR_NETWORK") {
      alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
      localStorage.removeItem("token");
      window.location.href = "/";
      return Promise.reject(error);
    }

    // Xử lý các lỗi HTTP (400, 500, v.v.)
    if (error.response) {
      const { status, data } = error.response;
      error.responseData = data; // Lưu dữ liệu lỗi
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;