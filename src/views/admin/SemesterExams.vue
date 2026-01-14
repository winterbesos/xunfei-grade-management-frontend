<template>
  <div class="semester-exams">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="$router.back()" :icon="ArrowLeft" circle />
            <span class="header-title">考试列表</span>
          </div>
          <el-button type="primary" @click="handleCreateExam">
            创建考试
          </el-button>
        </div>
      </template>

      <el-table
        :data="examList"
        v-loading="loading"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column prop="exam_name" label="考试名称" min-width="200" />
        <el-table-column prop="exam_type_name" label="考试类型" width="150" />
        <el-table-column prop="source" label="成绩来源" width="120">
          <template #default="{ row }">
            {{ row.source === 1 ? '智学网' : '手动维护' }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
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
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              v-if="row.source !== 1"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && examList.length === 0"
        description="暂无考试数据"
      />
    </el-card>

    <!-- 创建考试对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建考试"
      width="500px"
      @close="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="考试名称" prop="exam_name">
          <el-input v-model="createForm.exam_name" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="考试类型" prop="exam_type">
          <el-select
            v-model="createForm.exam_type"
            placeholder="请选择考试类型"
            style="width: 100%"
          >
            <el-option label="月考" :value="3"></el-option>
            <el-option label="期中考试" :value="1"></el-option>
            <el-option label="期末考试" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="考试日期" prop="exam_date">
          <el-date-picker
            v-model="createForm.exam_date"
            type="date"
            placeholder="选择考试日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitCreateExam"
            :loading="createLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { adminAPI } from "@/api/admin";
import { ArrowLeft } from "@element-plus/icons-vue";
import { formatDate } from "@/utils/date";
import { ElMessage, ElMessageBox } from "element-plus";

const route = useRoute();
const router = useRouter();
const semesterId = route.params.semesterId;

const loading = ref(false);
const examList = ref([]);
const resyncLoading = ref(null);

// 创建考试相关
const createDialogVisible = ref(false);
const createLoading = ref(false);
const createFormRef = ref(null);
const createForm = reactive({
  exam_name: "",
  exam_type: null,
  exam_date: "",
});

const createRules = {
  exam_name: [{ required: true, message: "请输入考试名称", trigger: "blur" }],
  exam_type: [{ required: true, message: "请选择考试类型", trigger: "change" }],
  exam_date: [{ required: true, message: "请选择考试日期", trigger: "change" }],
};

const handleCreateExam = () => {
  createDialogVisible.value = true;
};

const resetCreateForm = () => {
  createForm.exam_name = "";
  createForm.exam_type = null;
  createForm.exam_date = "";
  if (createFormRef.value) {
    createFormRef.value.resetFields();
  }
};

const submitCreateExam = async () => {
  if (!createFormRef.value) return;

  await createFormRef.value.validate(async (valid) => {
    if (!valid) return;

    createLoading.value = true;
    try {
      const res = await adminAPI.createSemesterExam(semesterId, createForm);
      if (res.status === 200) {
        ElMessage.success("考试创建成功");
        createDialogVisible.value = false;
        fetchExams();
      } else {
        ElMessage.error("创建失败");
      }
    } catch (error) {
      console.error("Create exam error:", error);
      ElMessage.error("创建失败");
    } finally {
      createLoading.value = false;
    }
  });
};

const fetchExams = async () => {
  loading.value = true;
  try {
    const res = await adminAPI.getSemesterExams(semesterId);
    if (res.status === 200) {
      examList.value = res.data;
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

const handleViewGrades = (row) => {
  router.push({
    name: "AdminSemesterExamGrades",
    params: {
      semesterId: semesterId,
      examId: row.exam_id,
    },
  });
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
    const res = await adminAPI.resyncExamEvents(row.exam_id);

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

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除考试 "${row.exam_name}" 吗？此操作不可恢复。`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const res = await adminAPI.deleteExam(row.exam_id);
    if (res.status === 200) {
      ElMessage.success("考试删除成功");
      fetchExams();
    } else {
      ElMessage.error("删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("Delete exam error:", error);
      ElMessage.error(error.response?.data?.detail || "删除操作失败");
    }
  }
};

onMounted(() => {
  fetchExams();
});
</script>

<style scoped>
.semester-exams {
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
}

.header-title {
  margin-left: 10px;
  font-weight: 600;
  font-size: 16px;
}
</style>
