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
            placeholder="请输入成绩单落款签名"
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
import { ElMessage, ElMessageBox } from "element-plus";
import { useSettingsStore } from "@/stores/settings";
import { adminAPI } from "@/api/admin";

const settingsStore = useSettingsStore();
const formRef = ref(null);
const loading = ref(false);

const form = ref({
  reportSignature: "",
});

const loadSchoolInfo = async () => {
  adminAPI
    .getSchoolInfo()
    .then((response) => {
      if (response.status === 200) {
        form.value = { reportSignature: response.data.signature };
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
  loading.value = true;
  adminAPI
    .updateSchoolInfo({ signature: form.value.reportSignature })
    .then((response) => {
      if (response.status === 200) {
        settingsStore.updateConfig(form.value);
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
