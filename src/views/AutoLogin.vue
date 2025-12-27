<template>
  <div
    class="auto-login-container"
    v-loading="true"
    element-loading-text="正在跳转登录..."
  ></div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { useSettingsStore } from "@/stores/settings";
import { authAPI } from "@/api/auth";

const settingsStore = useSettingsStore();

const oauthProvider = computed(() => {
  return settingsStore.systemConfig.oauthProvider || "模拟登录";
});

const handleOAuthLogin = async () => {
  try {
    const response = await authAPI.getOAuthUrl(oauthProvider.value);

    if (response.status === 200 && response.data.authorization_url) {
      window.location.href = response.data.authorization_url;
    } else {
      throw new Error("无法获取登录地址");
    }
  } catch (error) {
    console.error(error);
    ElMessage.error(error.message || "OAuth 登录初始化失败");
  }
};

onMounted(() => {
  handleOAuthLogin();
});
</script>

<style scoped>
.auto-login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}
</style>
