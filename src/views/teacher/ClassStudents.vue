<template>
  <div>
    <el-card>
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
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 学籍卡 Dialog -->
    <el-dialog v-model="statusCardVisible" width="80%" :destroy-on-close="true">
      <template #header="{ titleId, titleClass }">
        <div class="dialog-header">
          <h4 :id="titleId" :class="titleClass">学籍卡</h4>
          <el-button type="primary" @click="handlePrintStatusCard"
            >🖨️ 打印</el-button
          >
        </div>
      </template>
      <div class="dialog-content-wrapper">
        <StatusCard
          ref="statusCardRef"
          v-if="selectedStudentId"
          :student-id="selectedStudentId"
        />
      </div>
    </el-dialog>

    <!-- 成绩证明 Dialog -->
    <el-dialog
      v-model="reportProofVisible"
      width="80%"
      :destroy-on-close="true"
    >
      <template #header="{ titleId, titleClass }">
        <div class="dialog-header">
          <h4 :id="titleId" :class="titleClass">成绩证明</h4>
          <el-button type="primary" @click="handlePrintReportProof"
            >🖨️ 打印</el-button
          >
        </div>
      </template>
      <div class="dialog-content-wrapper">
        <ReportProof
          ref="reportProofRef"
          v-if="selectedStudentId"
          :student-id="selectedStudentId"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";
import StatusCard from "@/views/common/StatusCard.vue";
import ReportProof from "@/views/common/ReportProof.vue";

const route = useRoute();
const students = ref([]);
const loading = ref(false);
const classId = ref(route.params.classId);

const statusCardVisible = ref(false);
const reportProofVisible = ref(false);
const selectedStudentId = ref(null);

const statusCardRef = ref(null);
const reportProofRef = ref(null);

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

const handlePrintStatusCard = () => {
  statusCardRef.value?.printPage();
};

const handlePrintReportProof = () => {
  reportProofRef.value?.handlePrint();
};

onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
.el-card {
  min-height: 400px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-content-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 20px;
  background-color: #f0f2f5;
}

@media print {
  .dialog-content-wrapper {
    overflow-y: visible !important;
    display: block !important;
    padding: 0 !important;
    background-color: transparent !important;
  }
}
</style>
