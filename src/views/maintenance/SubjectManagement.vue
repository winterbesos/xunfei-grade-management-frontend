<template>
  <div class="subject-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left" v-if="!props.embedded">
            <el-button link @click="goBack">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <h3 class="title">学科管理</h3>
          </div>
          <div v-else>学科列表</div>
          <!-- Spacer or just let flex handle it -->
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            添加子学科
          </el-button>
        </div>
      </template>

      <!-- 学科列表 -->
      <el-table :data="subjects" style="width: 100%" v-loading="loading">
        <el-table-column prop="subject_name" label="学科名称" min-width="150" />
        <el-table-column prop="subject_code" label="学科代码" width="150" />
        <el-table-column prop="grades_type" label="成绩类型" width="120" />
        <el-table-column
          prop="master_subject_code"
          label="主学科代码"
          width="150"
        />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openEditDialog(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑学科' : '添加子学科'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <template v-if="!isEdit">
          <el-form-item label="学科名称" prop="subject_name">
            <el-input
              v-model="form.subject_name"
              placeholder="请输入学科名称"
            />
          </el-form-item>
          <el-form-item label="学科代码" prop="subject_code">
            <el-input
              v-model="form.subject_code"
              placeholder="请输入学科代码"
            />
          </el-form-item>
        </template>

        <el-form-item label="主学科代码" prop="master_subject_code">
          <el-select
            v-model="form.master_subject_code"
            filterable
            placeholder="请选择主学科"
            style="width: 100%"
          >
            <el-option
              v-for="item in existingSubjects"
              :key="item.subject_code"
              :label="item.subject_name + ' (' + item.subject_code + ')'"
              :value="item.subject_code"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitLoading"
          >
            {{ isEdit ? "更新" : "添加" }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Plus, ArrowLeft } from "@element-plus/icons-vue";
import { maintenanceAPI } from "@/api/maintenance";

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  schoolId: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const router = useRouter();
const currentSchoolId = computed(() => props.schoolId || route.params.schoolId);

const loading = ref(false);
const subjects = ref([]);
const showDialog = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref();

const form = ref({
  subject_name: "",
  subject_code: "",
  master_subject_code: "",
});

const rules = {
  subject_name: [
    { required: true, message: "请输入学科名称", trigger: "blur" },
  ],
  subject_code: [
    { required: true, message: "请输入学科代码", trigger: "blur" },
  ],
  master_subject_code: [
    { required: true, message: "请输入主学科代码", trigger: "change" },
  ],
};

// Compute existing subjects for the dropdown, possibly filtering out the current subject if in edit mode (though circular dependency prevention is good, for now just list all)
const existingSubjects = computed(() => {
  return subjects.value;
});

const goBack = () => {
  router.back();
};

const loadSubjects = async () => {
  loading.value = true;
  try {
    const response = await maintenanceAPI.getSchoolSubjects(
      currentSchoolId.value,
    );
    if (response.status === 200) {
      subjects.value = response.data || [];
    } else {
      ElMessage.error("获取学科列表失败");
    }
  } catch (error) {
    ElMessage.error("获取学科列表失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isEdit.value = false;
  form.value = {
    subject_name: "",
    subject_code: "",
    master_subject_code: "",
  };
  showDialog.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  form.value = {
    subject_name: row.subject_name,
    subject_code: row.subject_code,
    master_subject_code: row.master_subject_code,
  };
  showDialog.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      let response;
      if (isEdit.value) {
        response = await maintenanceAPI.updateSchoolSubject(
          currentSchoolId.value,
          form.value.subject_code,
          { master_subject_code: form.value.master_subject_code },
        );
      } else {
        response = await maintenanceAPI.createSchoolSubject(
          currentSchoolId.value,
          form.value,
        );
      }

      if (response.status === 200) {
        ElMessage.success(isEdit.value ? "更新成功" : "添加成功");
        showDialog.value = false;
        loadSubjects();
      } else {
        ElMessage.error(isEdit.value ? "更新失败" : "添加失败");
      }
    } catch (error) {
      ElMessage.error("操作失败");
      console.error(error);
    } finally {
      submitLoading.value = false;
    }
  });
};

const resetForm = () => {
  form.value = {
    subject_name: "",
    subject_code: "",
    master_subject_code: "",
  };
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

onMounted(() => {
  if (currentSchoolId.value) {
    loadSubjects();
  } else {
    ElMessage.error("参数错误：缺少学校ID");
  }
});
</script>

<style scoped>
.subject-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
</style>
