<template>
  <div class="oauth-callback">
    <el-card class="callback-card">
      <template #header>
        <div class="card-header">
          <h3>正在处理登录...</h3>
        </div>
      </template>

      <div class="callback-content">
        <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
        <p class="loading-text">正在验证您的身份，请稍候...</p>

        <div v-if="error" class="error-message">
          <el-icon :size="24"><CircleClose /></el-icon>
          <p>{{ error }}</p>
          <el-button type="primary" @click="goToLogin">返回登录</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Loading, CircleClose } from "@element-plus/icons-vue";
import { authAPI } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const error = ref("");

const handleOAuthCallback = async () => {
  try {
    // 提取URL参数
    const query = route.query;

    // 验证必要参数
    if (!query.state || !query.accessToken) {
      throw new Error("缺少必要的OAuth参数");
    }

    // 准备提交数据
    const oauthData = {
      state: query.state,
      accessToken: query.accessToken,
      expiresIn: query.expires_in || 2592000,
    };

    // 提交到后端验证
    const response = await authAPI.oauthCallback("jyyun", {
      code: oauthData.accessToken,
      state: oauthData.state,
    });

    if (response.status === 200 && response.data.access_token) {
      // 存储token
      authStore.login(response.data.access_token, null);

      // 获取用户信息
      const userInfoResponse = await authAPI.getUserInfo();
      if (userInfoResponse.status === 200) {
        authStore.updateUserInfo(userInfoResponse.data);
        ElMessage.success("登录成功");

        // 跳转到对应角色的首页
        const role = userInfoResponse.data.role;
        const routeMap = {
          admin: "/admin/settings",
          teacher: "/teacher/grade-management",
          student: "/student/grades",
          maintenance: "/maintenance/system-status",
        };
        router.push(routeMap[role] || "/dashboard");
      } else {
        throw new Error("获取用户信息失败");
      }
    } else {
      throw new Error(response.data?.message || "OAuth认证失败");
    }
  } catch (err) {
    console.error("OAuth callback error:", err);
    error.value = err.message || "认证失败，请重试";
  }
};

const goToLogin = () => {
  router.push("/login");
};

onMounted(() => {
  handleOAuthCallback();
});
</script>

<style scoped>
.oauth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-card {
  width: 400px;
  max-width: 90%;
  text-align: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.callback-content {
  padding: 40px 20px;
}

.loading-icon {
  color: #409eff;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20px;
  font-size: 16px;
  color: #666;
}

.error-message {
  color: #f56c6c;
}

.error-message .el-icon {
  margin-bottom: 10px;
}

.error-message p {
  margin-bottom: 20px;
  font-size: 14px;
}
</style>
