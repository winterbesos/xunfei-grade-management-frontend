<template>
  <div class="class-students-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="router.back()">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <span class="title">班级学生列表</span>
          </div>
        </div>
      </template>

      <el-table :data="students" v-loading="loading" style="width: 100%">
        <el-table-column
          prop="user_id"
          label="学生ID"
          width="150"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="user_name" label="姓名"></el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="viewStatusCard(row.user_id)"
              >学籍卡</el-button
            >
            <el-button
              type="success"
              size="small"
              @click="viewReportProof(row.user_id)"
              >成绩证明</el-button
            >
            <el-button
              type="warning"
              size="small"
              @click="viewGradeTrend(row.user_id)"
              >成绩趋势</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 学籍卡 Dialog -->
    <el-dialog
      title="学籍卡"
      v-model="statusCardVisible"
      width="80%"
      :destroy-on-close="true"
    >
      <div class="dialog-content-wrapper">
        <StatusCard v-if="selectedStudentId" :student-id="selectedStudentId" />
      </div>
    </el-dialog>

    <!-- 成绩证明 Dialog -->
    <el-dialog
      title="成绩证明"
      v-model="reportProofVisible"
      width="80%"
      :destroy-on-close="true"
    >
      <div class="dialog-content-wrapper">
        <ReportProof v-if="selectedStudentId" :student-id="selectedStudentId" />
      </div>
    </el-dialog>

    <!-- 成绩趋势 Dialog -->
    <el-dialog
      title="成绩趋势"
      v-model="gradeTrendVisible"
      width="80%"
      :destroy-on-close="true"
    >
      <div class="dialog-content-wrapper">
        <GradeTrend v-if="selectedStudentId" :student-id="selectedStudentId" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";
import StatusCard from "@/views/common/StatusCard.vue";
import ReportProof from "@/views/common/ReportProof.vue";
import GradeTrend from "@/views/common/GradeTrend.vue";
import { ArrowLeft } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const students = ref([]);
const loading = ref(false);
const classId = ref(route.params.classId);

const statusCardVisible = ref(false);
const reportProofVisible = ref(false);
const gradeTrendVisible = ref(false);
const selectedStudentId = ref(null);

const fetchStudents = async () => {
  if (!classId.value) return;
  loading.value = true;
  try {
    const response = await teacherAPI.getStudentsByClass(classId.value);
    if (response.data) {
      students.value = response.data;
    }
  } catch (error) {
    ElMessage.error("获取学生列表失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const viewStatusCard = (studentId) => {
  selectedStudentId.value = studentId;
  statusCardVisible.value = true;
};

const viewReportProof = (studentId) => {
  selectedStudentId.value = studentId;
  reportProofVisible.value = true;
};

const viewGradeTrend = (studentId) => {
  selectedStudentId.value = studentId;
  gradeTrendVisible.value = true;
};

onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
.class-students-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.el-card {
  min-height: 400px;
}

.dialog-content-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background-color: #f0f2f5;
}

@media print {
  .dialog-content-wrapper {
    display: block !important;
    padding: 0 !important;
    background-color: transparent !important;
  }
}
</style>
