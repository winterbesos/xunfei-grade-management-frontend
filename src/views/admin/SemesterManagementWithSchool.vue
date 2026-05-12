<template>
  <div class="semester-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学期管理</span>
        </div>
      </template>

      <!-- 学期列表 -->
      <el-table
        v-loading="loading"
        :data="semesters"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="semester_name" label="学期名称" min-width="300">
          <template #default="{ row }">
            {{ row.academic_year_name }} {{ row.term_name }}
          </template>
        </el-table-column>
        <el-table-column prop="begin_time" label="开始时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.begin_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="end_time" label="结束时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="scoring_begin_time"
          label="评分开始时间"
          width="200"
        >
          <template #default="{ row }">
            {{ formatDate(row.scoring_begin_time) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="scoring_end_time"
          label="评分结束时间"
          width="200"
        >
          <template #default="{ row }">
            {{ formatDate(row.scoring_end_time) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleViewExams(row)"
            >
              考试信息
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="handleSetScoringTime(row)"
            >
              设置打分时间
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="handleScoringCompletion(row)"
            >
              评分完成情况
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="handleLeaderboard(row)"
            >
              成绩榜单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && semesters.length === 0"
        description="暂无学期数据"
      />
    </el-card>

    <!-- 设置打分时间对话框 -->
    <el-dialog
      v-model="scoringTimeDialogVisible"
      title="设置打分时间"
      width="500px"
    >
      <el-form
        ref="scoringTimeFormRef"
        :model="scoringTimeForm"
        :rules="scoringTimeRules"
        label-width="120px"
      >
        <el-form-item label="打分开始时间" prop="scoringBeginTime">
          <el-date-picker
            v-model="scoringTimeForm.scoringBeginTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="打分结束时间" prop="scoringEndTime">
          <el-date-picker
            v-model="scoringTimeForm.scoringEndTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scoringTimeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="scoringTimeSubmitLoading"
          @click="submitScoringTime"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { adminAPI } from "@/api/admin";
import { formatDate, toISODate } from "@/utils/date";

const router = useRouter();
const loading = ref(false);
const semesters = ref([]);

// 打分时间设置相关
const scoringTimeDialogVisible = ref(false);
const scoringTimeSubmitLoading = ref(false);
const scoringTimeFormRef = ref(null);
const scoringTimeForm = reactive({
  semesterId: null,
  scoringBeginTime: "",
  scoringEndTime: "",
});

const scoringTimeRules = {
  scoringBeginTime: [
    { required: true, message: "请选择打分开始时间", trigger: "change" },
  ],
  scoringEndTime: [
    { required: true, message: "请选择打分结束时间", trigger: "change" },
  ],
};

// 打开设置打分时间对话框
const handleSetScoringTime = (row) => {
  scoringTimeForm.semesterId = row.semester_id;
  scoringTimeForm.scoringBeginTime = formatDate(row.scoring_begin_time) || "";
  scoringTimeForm.scoringEndTime = formatDate(row.scoring_end_time) || "";
  scoringTimeDialogVisible.value = true;
};

const handleScoringCompletion = (row) => {
  router.push({
    name: "AdminScoringCompletion",
    params: { semesterId: row.semester_id },
  });
};

const handleViewExams = (row) => {
  router.push({
    name: "AdminSemesterExams",
    params: { semesterId: row.semester_id },
  });
};

const handleLeaderboard = (row) => {
  router.push({
    name: "AdminSemesterLeaderboard",
    params: { semesterId: row.semester_id },
  });
};

// 提交打分时间设置
const submitScoringTime = async () => {
  if (!scoringTimeFormRef.value) return;

  await scoringTimeFormRef.value.validate(async (valid) => {
    if (!valid) return;

    if (
      new Date(scoringTimeForm.scoringBeginTime) >=
      new Date(scoringTimeForm.scoringEndTime)
    ) {
      ElMessage.error("打分结束时间必须晚于开始时间");
      return;
    }

    scoringTimeSubmitLoading.value = true;
    try {
      const response = await adminAPI.updateSemesterScoringTime(
        scoringTimeForm.semesterId,
        {
          begin_time: toISODate(scoringTimeForm.scoringBeginTime),
          end_time: toISODate(scoringTimeForm.scoringEndTime),
        },
      );

      if (response.status === 200) {
        ElMessage.success("打分时间设置成功");
        scoringTimeDialogVisible.value = false;
        await loadSemesters();
      }
    } catch (error) {
      ElMessage.error(error.message || "设置失败");
    } finally {
      scoringTimeSubmitLoading.value = false;
    }
  });
};

// 查询表单
const queryForm = reactive({
  schoolId: null,
  name: "",
});

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 获取状态类型
const getStatusType = (cycle) => {
  if (cycle.is_scoring) return "success";
  if (cycle.scoring_end_time && new Date() > new Date(cycle.scoring_end_time))
    return "disabled";
  return null;
};

// 获取状态文本
const getStatusText = (cycle) => {
  if (cycle.is_scoring) return "已开始";
  if (cycle.scoring_end_time && new Date() > new Date(cycle.scoring_end_time))
    return "已结束";
  else return "未开始";
};

// 加载学期列表
const loadSemesters = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...queryForm,
    };

    // 移除空值参数
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === "") {
        delete params[key];
      }
    });

    const response = await adminAPI.getSemesters(params);
    if (response.status === 200) {
      semesters.value = response.data.list || response.data;
      pagination.total = response.data.total || response.data.length;
    }
  } catch (error) {
    ElMessage.error("加载学期列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadSemesters();
});
</script>

<style scoped>
.semester-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
