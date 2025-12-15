<template>
  <div class="school-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="$router.back()">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <h3>学校详情</h3>
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
          <el-descriptions-item label="管理员">{{
            school.adminName
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            school.createdAt
          }}</el-descriptions-item>
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

const school = ref(null);
const activeTab = ref("classes");

onMounted(() => {
  if (history.state.schoolData) {
    school.value = JSON.parse(history.state.schoolData);
  }
});
</script>

<style scoped>
.school-detail {
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

.header-left h3 {
  margin: 0;
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
