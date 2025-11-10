<template>
  <div class="version-info">
    <div class="logo-section">
      <img
        :src="logoUrl"
        alt="eitsh logo"
        class="logo-image"
      />
    </div>

    <div class="info-section">
      <div class="info-item">
        <span class="label">版本</span>
        <span class="value">{{ version }}</span>
      </div>

      <div class="info-item">
        <span class="label">Commit</span>
        <span class="value commit">{{ commitHash }}</span>
      </div>

      <div class="info-item">
        <span class="label">更新</span>
        <span class="value">{{ lastUpdate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import logoUrl from '@/assets/logo-white.png'

// 版本信息 - 这些可以通过环境变量或构建时注入
const version = ref(import.meta.env.VITE_APP_VERSION || 'v1.0.0')
const commitHash = ref(import.meta.env.VITE_COMMIT_HASH || 'dev-local')
const lastUpdate = ref(import.meta.env.VITE_BUILD_TIME || new Date().toLocaleDateString('zh-CN'))
</script>

<style scoped>
.version-info {
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-size: 11px;
  z-index: 1000;
  transition: all 0.3s ease;
  user-select: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.version-info:hover {
  background: rgba(0, 0, 0, 0.65);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.logo-section {
  text-align: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-image {
  height: 20px;
  width: auto;
  object-fit: contain;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  white-space: nowrap;
}

.value {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
  text-align: right;
}

.value.commit {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 1px 4px;
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.9);
}

/* 响应式 */
@media (max-width: 768px) {
  .version-info {
    bottom: 10px;
    right: 10px;
    font-size: 10px;
    padding: 8px 10px;
  }

  .logo-text {
    font-size: 12px;
  }

  .value.commit {
    font-size: 9px;
  }
}
</style>
