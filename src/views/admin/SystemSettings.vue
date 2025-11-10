<template>
  <div class="system-settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        label-width="150px"
        style="max-width: 600px"
      >
        <el-form-item label="站点名称">
          <el-input v-model="form.siteName" placeholder="请输入站点名称" />
        </el-form-item>

        <el-divider content-position="left">登录方式配置</el-divider>

        <el-form-item label="启用账号密码登录">
          <el-switch v-model="form.enablePasswordLogin" />
        </el-form-item>

        <el-form-item label="启用 OAuth 登录">
          <el-switch v-model="form.enableOAuthLogin" />
        </el-form-item>

        <el-form-item
          label="OAuth 提供者"
          v-if="form.enableOAuthLogin"
        >
          <el-select v-model="form.oauthProvider" placeholder="请选择 OAuth 提供者">
            <el-option label="Google" value="google" />
            <el-option label="GitHub" value="github" />
            <el-option label="统一认证平台" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item
          label="OAuth Client ID"
          v-if="form.enableOAuthLogin && form.oauthProvider"
        >
          <el-input
            v-model="form.oauthClientId"
            placeholder="请输入 OAuth Client ID"
          />
        </el-form-item>

        <el-form-item
          label="OAuth Redirect URI"
          v-if="form.enableOAuthLogin && form.oauthProvider"
        >
          <el-input
            v-model="form.oauthRedirectUri"
            placeholder="请输入 OAuth Redirect URI"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSave">
            保存设置
          </el-button>
          <el-button @click="handleReset">重置为默认</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        title="提示"
        type="info"
        :closable="false"
        style="margin-top: 20px"
      >
        <div>设置将保存到浏览器本地存储中</div>
        <div>至少需要启用一种登录方式</div>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const formRef = ref(null)
const loading = ref(false)

const form = ref({
  siteName: '',
  enablePasswordLogin: true,
  enableOAuthLogin: false,
  oauthProvider: '',
  oauthClientId: '',
  oauthRedirectUri: ''
})

// 加载当前设置
onMounted(() => {
  form.value = { ...settingsStore.systemConfig }
})

// 保存设置
const handleSave = async () => {
  // 验证至少启用一种登录方式
  if (!form.value.enablePasswordLogin && !form.value.enableOAuthLogin) {
    ElMessage.warning('至少需要启用一种登录方式')
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    settingsStore.updateConfig(form.value)
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 重置设置
const handleReset = async () => {
  try {
    await ElMessageBox.confirm('确定要重置为默认设置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    settingsStore.resetConfig()
    form.value = { ...settingsStore.systemConfig }
    ElMessage.success('已重置为默认设置')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.system-settings {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
