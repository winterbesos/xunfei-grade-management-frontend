import request from '@/utils/request'
import { mockAPI } from '@/utils/mock'

// 是否使用 Mock 数据
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const authAPI = {
  // 账号密码登录
  loginByPassword(username, password) {
    if (USE_MOCK) {
      return mockAPI.loginByPassword(username, password)
    }
    return request({
      url: '/auth/login',
      method: 'post',
      data: { username, password }
    })
  },

  // OAuth 登录
  loginByOAuth(provider, code) {
    if (USE_MOCK) {
      return mockAPI.loginByOAuth(provider, code)
    }
    return request({
      url: `/auth/oauth/${provider}`,
      method: 'post',
      data: { code }
    })
  },

  // 获取 OAuth 授权 URL
  getOAuthUrl(provider) {
    return request({
      url: `/auth/oauth/${provider}/url`,
      method: 'get'
    })
  },

  // 登出
  logout() {
    return request({
      url: '/auth/logout',
      method: 'post'
    })
  }
}
