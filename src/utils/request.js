import axios from "axios";
import { ElMessage } from "element-plus";

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    return response;
  },
  (error) => {
    const response = error.response;

    if (response && response.status >= 400 && response.status < 500) {
      ElMessage({
        message: response.data.detail || "Error",
        type: "error",
        duration: 5000,
      });

      // 401: 未授权，跳转到登录页
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        window.location.href = "/";
      }

      return Promise.reject(new Error(response.data.detail || "Error"));
    } else {
      ElMessage({
        message: error.message || "网络错误",
        type: "error",
        duration: 5000,
      });
      return Promise.reject(error);
    }
  },
);

export default request;
