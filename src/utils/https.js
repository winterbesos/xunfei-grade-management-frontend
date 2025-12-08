// HTTPS 配置工具
export const HTTPS_CONFIG = {
  enabled: import.meta.env.VITE_HTTPS_ENABLED === "true",
  baseUrl: import.meta.env.VITE_BASE_URL || "https://localhost:5173",
  oauthCallbackUrl:
    import.meta.env.VITE_OAUTH_CALLBACK_URL ||
    "https://localhost:5173/callback/university",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
};

// 获取完整的OAuth回调URL
export function getOAuthCallbackUrl() {
  return HTTPS_CONFIG.oauthCallbackUrl;
}

// 获取当前协议
export function getCurrentProtocol() {
  return HTTPS_CONFIG.enabled ? "https" : "http";
}

// 获取当前域名和端口
export function getCurrentOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return HTTPS_CONFIG.baseUrl;
}
