<template>
  <div class="school-semesters">
    <div class="page-header" v-if="!props.embedded">
      <el-page-header @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3"> 学校学期列表 </span>
        </template>
      </el-page-header>
    </div>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>学期列表</span>
          <div class="header-actions"></div>
        </div>
      </template>

      <el-table
        :data="semesters"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column
          prop="semester_id"
          label="学期ID"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column prop="semester_name" label="学期名称" min-width="180">
          <template #default="{ row }">
            <span>{{ row.academic_year_name + row.term_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="begin_time" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.begin_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="end_time" label="结束时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openSyncDialog(row)">
              同步考试成绩
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && semesters.length === 0"
        description="暂无学期数据"
      />
    </el-card>

    <!-- 同步考试成绩对话框 -->
    <el-dialog
      v-model="syncDialogVisible"
      title="同步考试成绩"
      width="500px"
      @close="resetSyncForm"
    >
      <el-form
        ref="syncFormRef"
        :model="syncForm"
        :rules="syncRules"
        label-width="100px"
      >
        <el-form-item label="考试ID" prop="examId">
          <el-input v-model="syncForm.examId" placeholder="请输入考试ID" />
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select
            v-model="syncForm.examType"
            placeholder="请选择考试类型"
            style="width: 100%"
          >
            <el-option label="月考" :value="3"></el-option>
            <el-option label="期中考试" :value="1"></el-option>
            <el-option label="期末考试" :value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="syncDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSyncGrades"
            :loading="syncLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { maintenanceAPI } from "@/api/maintenance";
import { ElMessage } from "element-plus";
import { formatDate } from "@/utils/date";

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
const semesters = ref([]);
const syncLoading = ref(false);

// 同步对话框相关
const syncDialogVisible = ref(false);
const currentSemester = ref(null);
const syncFormRef = ref(null);
const syncForm = reactive({
  examId: "",
  examType: null, // Add examType field
});
const syncRules = {
  examId: [{ required: true, message: "请输入考试ID", trigger: "blur" }],
  examType: [{ required: true, message: "请选择考试类型", trigger: "change" }], // Add rule for examType
};

const goBack = () => {
  router.back();
};

const loadSemesters = async () => {
  loading.value = true;
  try {
    const res = await maintenanceAPI.getSchoolSemesters(currentSchoolId.value);
    if (res.status === 200) {
      // Handle different possible response structures
      if (Array.isArray(res.data)) {
        semesters.value = res.data;
      } else if (res.data && Array.isArray(res.data.list)) {
        semesters.value = res.data.list;
      } else if (res.data && Array.isArray(res.data.semesters)) {
        semesters.value = res.data.semesters;
      } else {
        semesters.value = [];
      }
    } else {
      ElMessage.error("获取学期列表失败");
    }
  } catch (error) {
    console.error("Failed to fetch semesters:", error);
    ElMessage.error("获取学期列表失败");
  } finally {
    loading.value = false;
  }
};

const openSyncDialog = (semester) => {
  currentSemester.value = semester;
  syncDialogVisible.value = true;
};

const resetSyncForm = () => {
  syncForm.examId = "";
  syncForm.examType = null; // Reset examType
  currentSemester.value = null;
  if (syncFormRef.value) {
    syncFormRef.value.resetFields();
  }
};

const handleSyncGrades = async () => {
  if (!syncFormRef.value) return;

  await syncFormRef.value.validate(async (valid) => {
    if (!valid) return;

    syncLoading.value = true;
    try {
      const res = await maintenanceAPI.syncSemesterExamGrades(
        currentSchoolId.value,
        currentSemester.value.semester_id,
        syncForm.examId,
        syncForm.examType, // Pass examType
      );
      if (res.status === 200) {
        ElMessage.success(`学期成绩同步任务已提交`);
        syncDialogVisible.value = false;
      } else {
        ElMessage.error("同步失败");
      }
    } catch (error) {
      console.error("Sync error:", error);
      ElMessage.error("同步操作失败");
    } finally {
      syncLoading.value = false;
    }
  });
};

onMounted(() => {
  if (currentSchoolId.value) {
    loadSemesters();
  } else {
    ElMessage.error("缺少学校ID参数");
  }
});
</script>

<style scoped>
.school-semesters {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 16px;
}
</style>
