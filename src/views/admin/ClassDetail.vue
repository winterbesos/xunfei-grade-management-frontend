<template>
  <div class="class-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="$router.back()">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <span class="title">班级详情</span>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <!-- 班级基本信息 -->
        <el-descriptions title="基本信息" border :column="2" class="mb-4">
          <el-descriptions-item label="班级名称">
            <span class="ellipsis-id">{{ classInfo.class_name }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="班级ID">
            <el-tooltip
              :content="classInfo.class_id"
              placement="top"
              effect="dark"
            >
              <span class="ellipsis-id">{{ classInfo.class_id }}</span>
            </el-tooltip>
          </el-descriptions-item>
          <el-descriptions-item label="班主任">
            <span class="ellipsis-id">{{ classInfo.header_teacher_name }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="班主任ID">
            <el-tooltip
              :content="classInfo.class_id"
              placement="top"
              effect="dark"
            >
              <span class="ellipsis-id">{{ classInfo.header_teacher_id }}</span>
            </el-tooltip>
          </el-descriptions-item>
          <el-descriptions-item label="学生人数">{{
            classInfo.student_count
          }}</el-descriptions-item>
          <el-descriptions-item label="所属学期">
            <span class="ellipsis-id">{{ classInfo.semester_name }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 科目老师列表 -->
        <div class="teacher-list-section mt-4 mb-4">
          <div class="section-header">
            <h3>任课教师</h3>
          </div>
          <el-table
            :data="classInfo.subject_teachers"
            stripe
            style="width: 100%"
            border
          >
            <el-table-column
              prop="teacher_id"
              label="教师ID"
              width="150"
              show-overflow-tooltip
            />
            <el-table-column prop="teacher_name" label="教师姓名" width="150" />
            <el-table-column label="科目">
              <template #default="{ row }">
                <el-tag
                  v-for="sub in row.subjects"
                  :key="sub"
                  class="mr-2"
                  style="margin-right: 5px"
                >
                  {{ sub.subject_name }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 学生列表 -->
        <div class="student-list-section mt-4">
          <div class="section-header">
            <h3>学生列表</h3>
          </div>
          <el-table :data="classInfo.students" stripe style="width: 100%">
            <el-table-column
              prop="user_id"
              label="学生ID"
              width="150"
              show-overflow-tooltip
            />
            <el-table-column prop="user_name" label="姓名" width="150" />
            <el-table-column label="操作" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="classInfo.class_phase_code === '05'"
                  type="primary"
                  link
                  @click="handleViewProof(row)"
                >
                  成绩证明
                </el-button>
                <el-button
                  v-if="classInfo.class_phase_code === '05'"
                  type="success"
                  link
                  @click="handleViewStatusCard(row)"
                >
                  学籍卡
                </el-button>
                <el-button
                  type="warning"
                  link
                  @click="handleViewGradeTrend(row)"
                >
                  成绩趋势
                </el-button>
                <el-button
                  type="danger"
                  link
                  @click="handleViewYearReport(row)"
                >
                  年度账单
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="proofDialogVisible"
      title="成绩证明预览"
      width="900px"
      top="5vh"
      destroy-on-close
      append-to-body
    >
      <div class="dialog-center">
        <ReportProof v-if="proofDialogVisible" :student-id="currentStudentId" />
      </div>
    </el-dialog>

    <el-dialog
      v-model="statusCardDialogVisible"
      title="学籍卡预览"
      width="1000px"
      top="5vh"
      destroy-on-close
      append-to-body
    >
      <div class="dialog-center">
        <StatusCard
          v-if="statusCardDialogVisible"
          ref="statusCardRef"
          :student-id="currentStudentId"
        />
      </div>
      <template #footer>
        <el-button @click="statusCardDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrintStatusCard">
          打印
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="gradeTrendDialogVisible"
      title="学生成绩趋势"
      width="900px"
      top="5vh"
      destroy-on-close
      append-to-body
    >
      <div class="dialog-center">
        <GradeTrend v-if="gradeTrendDialogVisible" :student-id="currentStudentId" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { adminAPI } from "@/api/admin";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import ReportProof from "@/views/common/ReportProof.vue";
import StatusCard from "@/views/common/StatusCard.vue";
import GradeTrend from "@/views/common/GradeTrend.vue";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const classInfo = ref({
  students: [],
});

const proofDialogVisible = ref(false);
const statusCardDialogVisible = ref(false);
const gradeTrendDialogVisible = ref(false);
const currentStudentId = ref(null);
const statusCardRef = ref(null);

const fetchClassDetail = async () => {
  const id = route.params.id;
  if (!id) return;

  loading.value = true;
  try {
    const res = await adminAPI.getClassDetail(id);
    if (res.status === 200) {
      classInfo.value = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch class detail:", error);
    ElMessage.error("获取班级详情失败");
  } finally {
    loading.value = false;
  }
};

const handleViewProof = (row) => {
  currentStudentId.value = row.user_id;
  proofDialogVisible.value = true;
};

const handleViewStatusCard = (row) => {
  currentStudentId.value = row.user_id;
  statusCardDialogVisible.value = true;
};

const handleViewGradeTrend = (row) => {
  currentStudentId.value = row.user_id;
  gradeTrendDialogVisible.value = true;
};

const handleViewYearReport = (row) => {
  const routeData = router.resolve({
    name: "YearReport",
    params: { studentId: row.user_id },
  });
  window.open(routeData.href, "_blank");
};

const handlePrintStatusCard = () => {
  if (statusCardRef.value) {
    statusCardRef.value.printPage();
  }
};

onMounted(() => {
  fetchClassDetail();
});
</script>

<style scoped>
.class-detail {
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

.mb-4 {
  margin-bottom: 20px;
}

.mt-4 {
  margin-top: 20px;
}

.section-header {
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.ellipsis-id {
  display: inline-block;
  width: 180px; /* 👈 控制宽度 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.dialog-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
