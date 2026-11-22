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

        <el-form-item label="成绩单等级列">
          <el-checkbox-group v-model="form.reportLevelColumns">
            <el-checkbox value="midterm">期中等级</el-checkbox>
            <el-checkbox value="final">期末等级</el-checkbox>
            <el-checkbox value="score">总评等级</el-checkbox>
          </el-checkbox-group>
          <div class="form-tip">勾选的等级列显示在成绩单对应成绩的后面，不勾选则不显示</div>
        </el-form-item>

        <el-form-item label="等级计算方式">
          <el-radio-group v-model="form.reportLevelMode" :disabled="form.reportLevelColumns.length === 0">
            <el-radio value="score">按分数</el-radio>
            <el-radio value="rank">按排名</el-radio>
          </el-radio-group>
          <div class="form-tip">
            三个等级列使用同一种方式。按分数：90 分以上为 A，80 以上为 B，70 以上为 C，60 以上为 D，其余为 E；
            按排名：按该项成绩在本学期本年级同科目中的名次占人数比例，每 5% 一档，分为 A1~A3、B1~B6、C1~C6、D1~D4、E
          </div>
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
  reportLevelMode: "score",
  reportLevelColumns: [],
  themeColor: "#409EFF",
});

const loadSchoolInfo = async () => {
  adminAPI
    .getSchoolInfo()
    .then((response) => {
      if (response.status === 200) {
        form.value = {
          reportSignature: response.data.signature,
          reportLevelMode: response.data.report_level_mode || "score",
          reportLevelColumns: response.data.report_level_columns || [],
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
      report_level_mode: form.value.reportLevelMode,
      report_level_columns: form.value.reportLevelColumns,
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

.form-tip {
  width: 100%;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
