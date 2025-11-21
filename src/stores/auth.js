import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => userInfo.value?.role || '')
  const userName = computed(() => userInfo.value?.name || '')
  const realname = computed(() => userInfo.value?.realname || '')

  // 登录
  function login(tokenValue, userInfoValue) {
    token.value = tokenValue
    userInfo.value = userInfoValue
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('userInfo', JSON.stringify(userInfoValue))
  }

  // 更新用户信息
  function updateUserInfo(userInfoValue) {
    userInfo.value = userInfoValue
    localStorage.setItem('userInfo', JSON.stringify(userInfoValue))
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 检查权限
  function hasRole(role) {
    return userRole.value === role
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userRole,
    userName,
    realname,
    login,
    updateUserInfo,
    logout,
    hasRole
  }
})
