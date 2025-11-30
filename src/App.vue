<script setup>
import { watch, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import VersionInfo from "@/components/common/VersionInfo.vue";

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const updateTitle = () => {
  const schoolName = authStore.userInfo?.schoolName || authStore.userInfo?.school_name;
  if (schoolName) {
    document.title = `${schoolName}成绩管理系统`;
  } else {
    document.title = settingsStore.systemConfig.siteName;
  }
};

watch(
  () => [authStore.userInfo, settingsStore.systemConfig.siteName],
  () => {
    updateTitle();
  },
  { deep: true }
);

onMounted(() => {
  updateTitle();
});
</script>

<template>
  <router-view />
  <VersionInfo />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family:
    "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
