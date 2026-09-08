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
    // 批量请求（如成绩单导出）逐个弹提示会刷屏，由调用方汇总展示结果
    const silent = error.config?.silent;

    if (response && response.status >= 400 && response.status < 500) {
      if (!silent) {
        ElMessage({
          message: response.data.detail || "Error",
          type: "error",
          duration: 5000,
        });
      }

      // 401: 未授权，跳转到登录页。静默请求同样需要处理，否则 token 失效后会一直失败
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        window.location.href = "/";
      }

      // 静默模式保留原始 error，调用方要靠 response.status / detail 归类失败原因
      if (silent) return Promise.reject(error);
      return Promise.reject(new Error(response.data.detail || "Error"));
    } else {
      if (!silent) {
        ElMessage({
          message: error.message || "网络错误",
          type: "error",
          duration: 5000,
        });
      }
      return Promise.reject(error);
    }
  },
);

export default request;
