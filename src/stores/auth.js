import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || "");
  const userInfo = ref(JSON.parse(localStorage.getItem("userInfo") || "null"));
  const activeRole = ref(
    localStorage.getItem("activeRole") || userInfo.value?.role || "",
  );
  const loginType = ref(localStorage.getItem("loginType") || "password");

  const isLoggedIn = computed(() => !!token.value);
  const userRole = computed(() => activeRole.value);
  const originalRole = computed(() => userInfo.value?.role || "");
  const userName = computed(() => userInfo.value?.name || "");
  const realname = computed(() => userInfo.value?.realname || "");
  const themeColor = computed(() => userInfo.value?.theme_color || "#304156");

  // 登录
  function login(tokenValue, userInfoValue, type = "password") {
    token.value = tokenValue;
    userInfo.value = userInfoValue;
    activeRole.value = userInfoValue?.role;
    loginType.value = type;
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("userInfo", JSON.stringify(userInfoValue));
    localStorage.setItem("loginType", type);
    localStorage.removeItem("activeRole");
  }

  // 更新用户信息
  function updateUserInfo(userInfoValue) {
    userInfo.value = userInfoValue;
    if (!activeRole.value) {
      activeRole.value = userInfoValue.role;
    }
    localStorage.setItem("userInfo", JSON.stringify(userInfoValue));
  }

  // 切换角色
  function switchRole(role) {
    activeRole.value = role;
    localStorage.setItem("activeRole", role);
  }

  // 登出
  function logout() {
    token.value = "";
    userInfo.value = null;
    activeRole.value = "";
    loginType.value = "password";
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("loginType");
  }

  // 检查权限
  function hasRole(role) {
    return userRole.value === role;
  }

  return {
    token,
    userInfo,
    activeRole,
    loginType,
    isLoggedIn,
    userRole,
    originalRole,
    userName,
    realname,
    themeColor,
    login,
    updateUserInfo,
    switchRole,
    logout,
    hasRole,
  };
});
