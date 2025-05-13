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
    return response.data || response;
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error); // Trả về lỗi đầy đủ
  }
);

export default axiosClient;