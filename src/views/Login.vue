<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>{{ settingsStore.systemConfig.siteName }}</h2>
        </div>
      </template>

      <el-tabs v-model="activeTab" v-if="showTabs">
        <!-- 账号密码登录 -->
        <el-tab-pane
          v-if="settingsStore.systemConfig.enablePasswordLogin"
          label="账号密码登录"
          name="password"
        >
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="80px"
            @submit.prevent="handlePasswordLogin"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                clearable
              />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                style="width: 100%"
                @click="handlePasswordLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- OAuth 登录 -->
        <el-tab-pane
          v-if="settingsStore.systemConfig.enableOAuthLogin"
          label="OAuth 登录"
          name="oauth"
        >
          <div class="oauth-container">
            <el-button
              type="primary"
              :loading="loading"
              style="width: 100%"
              @click="handleOAuthLogin"
            >
              使用 OAuth 登录
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 只有一种登录方式时不显示 tabs -->
      <div v-else>
        <el-form
          v-if="settingsStore.systemConfig.enablePasswordLogin"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="80px"
          @submit.prevent="handlePasswordLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              style="width: 100%"
              @click="handlePasswordLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div
          v-else-if="settingsStore.systemConfig.enableOAuthLogin"
          class="oauth-container"
        >
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleOAuthLogin"
          >
            使用 OAuth 登录
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { authAPI } from "@/api/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const activeTab = ref("password");
const loading = ref(false);
const loginFormRef = ref(null);

const loginForm = ref({
  username: "",
  password: "",
});

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少为 6 位", trigger: "blur" },
  ],
};

// 是否显示 tabs（两种登录方式都启用时显示）
const showTabs = computed(() => {
  return (
    settingsStore.systemConfig.enablePasswordLogin &&
    settingsStore.systemConfig.enableOAuthLogin
  );
});

// OAuth 提供者
const oauthProvider = computed(() => {
  return settingsStore.systemConfig.oauthProvider || "模拟登录";
});

// 账号密码登录
const handlePasswordLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      const response = await authAPI.loginByPassword(
        loginForm.value.username,
        loginForm.value.password,
      );

      if (response.status === 200 && response.data.access_token) {
        const token = response.data.access_token;

        // 存储token
        authStore.login(token, null);

        // 获取用户信息
        const userInfoResponse = await authAPI.getUserInfo();
        if (userInfoResponse.status === 200) {
          authStore.updateUserInfo(userInfoResponse.data);
          ElMessage.success("登录成功");

          const redirect = route.query.redirect || getDefaultRoute();
          router.push(redirect);
        } else {
          throw new Error("获取用户信息失败");
        }
      } else {
        throw new Error("登录响应无效");
      }
    } catch (error) {
      ElMessage.error(error.message || "登录失败");
    } finally {
      loading.value = false;
    }
  });
};

// OAuth 登录
const handleOAuthLogin = async () => {
  loading.value = true;
  try {
    const response = await authAPI.getOAuthUrl(oauthProvider.value);

    if (response.status === 200 && response.data.authorization_url) {
      console.log(
        "重定向到 OAuth 提供者登录页：",
        response.data.authorization_url,
      );
      window.location.href = response.data.authorization_url;
    }

    // // 模拟 OAuth 登录
    // const response = await authAPI.loginByOAuth(oauthProvider.value, 'mock_code')
    // if (response.code === 200) {
    //   const token = response.data.token

    //   // 存储token
    //   authStore.login(token, null)

    //   // 获取用户信息
    //   const userInfoResponse = await authAPI.getUserInfo()
    //   if (userInfoResponse.code === 200) {
    //     authStore.updateUserInfo(userInfoResponse.data)
    //     ElMessage.success('OAuth 登录成功')

    //     const redirect = route.query.redirect || getDefaultRoute()
    //     router.push(redirect)
    //   } else {
    //     throw new Error('获取用户信息失败')
    //   }
    // }
  } catch (error) {
    ElMessage.error(error.message || "OAuth 登录失败");
  } finally {
    loading.value = false;
  }
};

// 根据角色获取默认路由
const getDefaultRoute = () => {
  const role = authStore.userRole;
  const routeMap = {
    admin: "/admin/semesters",
    teacher: "/teacher/grade-management",
    student: "/student/grades",
    maintenance: "/maintenance/system-status",
  };
  return routeMap[role] || "/dashboard";
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 450px;
  max-width: 90%;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
}

.oauth-container {
  padding: 20px 0;
}
</style>
