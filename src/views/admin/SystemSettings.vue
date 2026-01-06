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
        <el-form-item label="成绩单签名">
          <el-input
            v-model="form.reportSignature"
            placeholder="请输入成绩单签名"
          />
        </el-form-item>

        <el-form-item label="主题颜色">
          <el-color-picker
            v-model="form.themeColor"
            color-format="hex"
            predefined
            :rules="[
              { required: true, message: '请选择主题颜色', trigger: 'change' },
            ]"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSave">
            保存设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useSettingsStore } from "@/stores/settings";
import { useAuthStore } from "@/stores/auth";
import { adminAPI } from "@/api/admin";

const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);

const form = ref({
  reportSignature: "",
  themeColor: "#409EFF",
});

const loadSchoolInfo = async () => {
  adminAPI
    .getSchoolInfo()
    .then((response) => {
      if (response.status === 200) {
        form.value = {
          reportSignature: response.data.signature,
          themeColor: response.data.theme_color || "#409EFF",
        };
      }
    })
    .catch(() => {
      ElMessage.error("加载学校信息失败");
    });
};

// 加载当前设置
onMounted(() => {
  loadSchoolInfo();
});

// 保存设置
const handleSave = async () => {
  const regex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;
  if (!regex.test(form.value.themeColor)) {
    ElMessage.error("请选择主题颜色");
    return;
  }

  loading.value = true;
  adminAPI
    .updateSchoolInfo({
      signature: form.value.reportSignature,
      theme_color: form.value.themeColor,
    })
    .then((response) => {
      if (response.status === 200) {
        settingsStore.updateConfig(form.value);
        // Also update authStore's user info to refresh the theme color in the layout
        authStore.updateUserInfo({
          ...authStore.userInfo,
          theme_color: form.value.themeColor,
        });
        ElMessage.success("设置保存成功");
      } else {
        ElMessage.error("保存失败");
      }
    })
    .catch(() => {
      ElMessage.error("保存失败");
    })
    .finally(() => {
      loading.value = false;
    });
};
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
