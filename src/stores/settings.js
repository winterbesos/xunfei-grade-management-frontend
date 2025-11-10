import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 系统设置
  const systemConfig = ref({
    siteName: '成绩管理系统',
    enablePasswordLogin: true,
    enableOAuthLogin: true,
    oauthProvider: '', // 可选: 'google', 'github', 'custom' 等
    oauthClientId: '',
    oauthRedirectUri: ''
  })

  // 从 localStorage 加载设置
  const savedConfig = localStorage.getItem('systemConfig')
  if (savedConfig) {
    try {
      systemConfig.value = JSON.parse(savedConfig)
    } catch (e) {
      console.error('Failed to parse system config:', e)
    }
  }

  // 更新系统设置
  function updateConfig(config) {
    systemConfig.value = { ...systemConfig.value, ...config }
    localStorage.setItem('systemConfig', JSON.stringify(systemConfig.value))
  }

  // 重置为默认设置
  function resetConfig() {
    systemConfig.value = {
      siteName: '成绩管理系统',
      enablePasswordLogin: true,
      enableOAuthLogin: true,
      oauthProvider: '',
      oauthClientId: '',
      oauthRedirectUri: ''
    }
    localStorage.removeItem('systemConfig')
  }

  return {
    systemConfig,
    updateConfig,
    resetConfig
  }
})
