<template>
  <div class="school-exams">
    <div class="page-header" v-if="!props.embedded">
      <el-page-header @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3"> 学校考试列表 </span>
        </template>
      </el-page-header>
    </div>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>考试列表</span>
          <el-button type="primary" @click="openImportDialog">导入考试ID</el-button>
        </div>
      </template>

      <el-table
        :data="examList"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column
          prop="exam_id"
          label="考试ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="exam_name" label="考试名称" min-width="200" />
        <el-table-column prop="exam_type_name" label="考试类型" width="150" />
        <el-table-column prop="semester_name" label="学期" width="200" />
        <el-table-column prop="source" label="成绩来源" width="120">
          <template #default="{ row }">
            {{ row.source === 1 ? '智学网' : '手动维护' }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="最后同步时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewGrades(row)"
            >
              查看成绩
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleResync(row)"
              :loading="resyncLoading === row.exam_id"
              v-if="row.source === 1"
            >
              重新同步
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && examList.length === 0"
        description="暂无考试数据"
      />
    </el-card>

    <!-- 导入考试ID对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入考试ID"
      width="500px"
      @close="resetImportForm"
    >
      <el-form
        ref="importFormRef"
        :model="importForm"
        :rules="importRules"
        label-width="100px"
      >
        <el-form-item label="学期" prop="semesterId">
          <el-select
            v-model="importForm.semesterId"
            placeholder="请选择学期"
            style="width: 100%"
            v-loading="semesterLoading"
          >
            <el-option
              v-for="s in semesterList"
              :key="s.semester_id"
              :label="s.academic_year_name + s.term_name"
              :value="s.semester_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考试ID" prop="examId">
          <el-input v-model="importForm.examId" placeholder="请输入考试ID" />
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select
            v-model="importForm.examType"
            placeholder="请选择考试类型"
            style="width: 100%"
          >
            <el-option label="月考" :value="3" />
            <el-option label="期中考试" :value="1" />
            <el-option label="期末考试" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleImportExam"
            :loading="importLoading"
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
import { ElMessage, ElMessageBox } from "element-plus";
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
const examList = ref([]);
const resyncLoading = ref(null);

// 导入考试ID对话框相关
const importDialogVisible = ref(false);
const importLoading = ref(false);
const semesterLoading = ref(false);
const semesterList = ref([]);
const importFormRef = ref(null);
const importForm = reactive({
  semesterId: null,
  examId: "",
  examType: null,
});
const importRules = {
  semesterId: [{ required: true, message: "请选择学期", trigger: "change" }],
  examId: [{ required: true, message: "请输入考试ID", trigger: "blur" }],
  examType: [{ required: true, message: "请选择考试类型", trigger: "change" }],
};

const goBack = () => {
  router.back();
};

const handleViewGrades = (row) => {
  router.push({
    name: "maintenanceSchoolExamGrades",
    params: {
      schoolId: currentSchoolId.value,
      examId: row.exam_id,
    },
  });
};

const fetchExams = async () => {
  loading.value = true;
  try {
    const res = await maintenanceAPI.getSchoolExams(currentSchoolId.value);
    if (res.status === 200) {
      if (Array.isArray(res.data)) {
        examList.value = res.data;
      } else {
        // Fallback if wrapped in an object
        examList.value = res.data.exams || res.data.items || [];
      }
    } else {
      ElMessage.error("获取考试列表失败");
    }
  } catch (error) {
    console.error("Failed to fetch exams:", error);
    ElMessage.error("获取考试列表失败");
  } finally {
    loading.value = false;
  }
};

const handleResync = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要重新同步考试 "${row.exam_name}" 的事件吗？`,
      "确认同步",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    resyncLoading.value = row.exam_id;
    const res = await maintenanceAPI.resyncExamEvents(
      currentSchoolId.value,
      row.exam_id
    );

    if (res.status === 200) {
      ElMessage.success("同步请求已提交");
    } else {
      ElMessage.error("同步失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("Resync error:", error);
      ElMessage.error("同步操作失败");
    }
  } finally {
    resyncLoading.value = null;
  }
};

const loadSemesters = async () => {
  semesterLoading.value = true;
  try {
    const res = await maintenanceAPI.getSchoolSemesters(currentSchoolId.value);
    if (res.status === 200) {
      if (Array.isArray(res.data)) {
        semesterList.value = res.data;
      } else if (res.data && Array.isArray(res.data.list)) {
        semesterList.value = res.data.list;
      } else if (res.data && Array.isArray(res.data.semesters)) {
        semesterList.value = res.data.semesters;
      } else {
        semesterList.value = [];
      }
    } else {
      ElMessage.error("获取学期列表失败");
    }
  } catch (error) {
    console.error("Failed to fetch semesters:", error);
    ElMessage.error("获取学期列表失败");
  } finally {
    semesterLoading.value = false;
  }
};

const openImportDialog = () => {
  importDialogVisible.value = true;
  if (semesterList.value.length === 0) {
    loadSemesters();
  }
};

const resetImportForm = () => {
  importForm.semesterId = null;
  importForm.examId = "";
  importForm.examType = null;
  if (importFormRef.value) {
    importFormRef.value.resetFields();
  }
};

const handleImportExam = async () => {
  if (!importFormRef.value) return;

  await importFormRef.value.validate(async (valid) => {
    if (!valid) return;

    importLoading.value = true;
    try {
      const res = await maintenanceAPI.syncSemesterExamGrades(
        currentSchoolId.value,
        importForm.semesterId,
        importForm.examId,
        importForm.examType,
      );
      if (res.status === 200) {
        ElMessage.success("考试成绩同步任务已提交");
        importDialogVisible.value = false;
        fetchExams();
      } else {
        ElMessage.error("导入失败");
      }
    } catch (error) {
      console.error("Import exam error:", error);
      ElMessage.error("导入操作失败");
    } finally {
      importLoading.value = false;
    }
  });
};

onMounted(() => {
  if (currentSchoolId.value) {
    fetchExams();
  } else {
    ElMessage.error("缺少学校ID参数");
  }
});
</script>

<style scoped>
.school-exams {
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
