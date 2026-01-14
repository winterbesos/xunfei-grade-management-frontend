<template>
  <div class="school-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="$router.back()" :icon="ArrowLeft" circle />
            <span class="header-title">学校详情</span>
          </div>
        </div>
      </template>

      <div class="detail-content" v-if="school">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="学校名称">{{
            school.name
          }}</el-descriptions-item>
          <el-descriptions-item label="学校ID">
            <el-tooltip
              :content="school.schoolId"
              placement="top"
              effect="dark"
            >
              <span class="ellipsis-id">{{ school.schoolId }}</span>
            </el-tooltip>
          </el-descriptions-item>
          <el-descriptions-item label="短ID">{{
            school.schoolShortId
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(school.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="school.status === 'active' ? 'success' : 'danger'">
              {{ school.status === "active" ? "启用" : "禁用" }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="tabs-section">
          <el-tabs v-model="activeTab" class="school-tabs">
            <el-tab-pane label="班级管理" name="classes">
              <SchoolClasses
                :embedded="true"
                :school-id="school.schoolId"
                v-if="school.schoolId"
              />
            </el-tab-pane>
            <el-tab-pane label="学生管理" name="students">
              <SchoolStudents
                :embedded="true"
                :school-id="school.schoolId"
                v-if="school.schoolId"
              />
            </el-tab-pane>
            <el-tab-pane label="学科管理" name="subjects">
              <SubjectManagement
                :embedded="true"
                :school-id="school.schoolId"
                v-if="school.schoolId"
              />
            </el-tab-pane>
            <el-tab-pane label="教师管理" name="teachers">
              <SchoolTeachers
                :embedded="true"
                :school-id="school.schoolId"
                v-if="school.schoolId"
              />
            </el-tab-pane>
            <el-tab-pane label="学期管理" name="semesters">
              <SchoolSemesters
                :embedded="true"
                :school-id="school.schoolId"
                v-if="school.schoolId"
              />
            </el-tab-pane>
            <el-tab-pane label="选修课管理" name="elective-subjects">
              <ElectiveSubjectManagement
                :embedded="true"
                :school-id="school.schoolId"
                v-if="school.schoolId"
              />
            </el-tab-pane>
            <el-tab-pane label="考试管理" name="exams">
              <SchoolExams
                :embedded="true"
                :school-id="school.schoolId"
                v-if="school.schoolId"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div v-else class="error-tip">
        <el-empty description="未找到学校信息，请返回列表页重新进入" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ArrowLeft } from "@element-plus/icons-vue";
import SchoolClasses from "./SchoolClasses.vue";
import SchoolStudents from "./SchoolStudents.vue";
import SubjectManagement from "./SubjectManagement.vue";
import SchoolTeachers from "./SchoolTeachers.vue";
import SchoolSemesters from "./SchoolSemesters.vue";
import ElectiveSubjectManagement from "./ElectiveSubjectManagement.vue";
import SchoolExams from "./SchoolExams.vue";
import { maintenanceAPI } from "@/api/maintenance";
import { useRoute } from "vue-router";
import { formatDate } from "@/utils/date";

const school = ref(null);
const activeTab = ref("classes");

const routes = useRoute();
const schoolId = routes.params.schoolId;

onMounted(() => {
  fetchSchoolDetails(schoolId);
});

const fetchSchoolDetails = async (schoolId) => {
  const response = await maintenanceAPI.getSchoolDetails(schoolId);
  school.value = {
    name: response.data.school_name,
    schoolId: response.data.school_id,
    schoolShortId: response.data.school_short_id,
    adminName: response.data.admin_name,
    createdAt: response.data.created_at,
    status: response.data.is_enabled ? "active" : "disabled",
  };
};
</script>

<style scoped>
.school-detail {
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

.detail-content {
  margin-top: 20px;
}

.tabs-section {
  margin-top: 20px;
}

.error-tip {
  padding: 40px;
  text-align: center;
}

.ellipsis-id {
  display: inline-block;
  width: 180px; /* 👈 控制宽度 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
