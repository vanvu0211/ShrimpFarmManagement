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
    const errorData = error.response?.data || error.message || "Unknown error";

    if (error.code === "ERR_NETWORK") {
      alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/";
    }
    return Promise.reject(errorData);
  }
);

export default axiosClient;