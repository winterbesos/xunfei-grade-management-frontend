<template>
  <div class="semester-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学期列表</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="semesters"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="academic_year_name" label="学年" width="150">
          <template #default="{ row }">
            {{ row.academic_year_name }}
          </template>
        </el-table-column>
        <el-table-column label="学期">
          <template #default="{ row }">
            {{ row.academic_year_name + row.term_name }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewReport(row)"
            >
              查看成绩单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { studentAPI } from "@/api/student";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const loading = ref(false);
const semesters = ref([]);

const loadSemesters = async () => {
  loading.value = true;
  try {
    const response = await studentAPI.getSemesters();
    if (response.status === 200) {
      semesters.value = response.data;
    }
  } catch (error) {
    ElMessage.error("加载学期列表失败");
  } finally {
    loading.value = false;
  }
};

const handleViewReport = (row) => {
  // Assuming studentId is needed, but Report.vue often assumes context.
  // We can pass semesterId as query or param.
  // Reusing existing Report.vue logic.
  const authStore = useAuthStore();
  const studentId = authStore.userInfo.user_id;

  router.push({
    name: "StudentSemesterReport",
    params: { semesterId: row.semester_id, studentId: studentId },
    query: { semesterName: row.semester_name },
  });
};

onMounted(() => {
  loadSemesters();
});
</script>

<style scoped>
.semester-list {
  padding: 20px;
}
</style>
