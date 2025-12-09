import request from "@/utils/request";

export const authAPI = {
  // 账号密码登录
  loginByPassword(username, password) {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    return request({
      url: "/api/auth/login",
      method: "post",
      data: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  // OAuth 登录
  loginByOAuth(provider, code) {
    return request({
      url: `/auth/oauth/${provider}`,
      method: "post",
      data: { code },
    });
  },

  // 获取 OAuth 授权 URL
  getOAuthUrl(provider) {
    return request({
      url: `/api/auth/oauth/authorize`,
      method: "get",
      params: {
        provider: provider,
      },
    });
  },

  oauthCallback(provider, data) {
    return request({
      url: `/api/auth/oauth/callback`,
      method: "post",
      data: {
        ...data,
        provider: provider,
      },
    });
  },

  // 获取当前用户信息
  getUserInfo() {
    return request({
      url: "/api/auth/me",
      method: "get",
    });
  },

  // 登出
  logout() {
    return request({
      url: "/auth/logout",
      method: "post",
    });
  },

  // OAuth 认证提交
  submitOAuth(data) {
    return request({
      url: "/api/auth/oauth/submit",
      method: "post",
      data,
    });
  },
};
