<template>
  <div class="subject-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>科目管理</span>
        </div>
      </template>

      <el-table
        :data="courseList"
        v-loading="loading"
        style="width: 100%"
        border
      >
        <el-table-column
          prop="subject_code"
          label="Code"
          width="80"
          align="center"
        />
        <el-table-column prop="subject_name" label="科目名称" min-width="150" />
        <el-table-column
          prop="credits"
          label="学分"
          width="100"
          align="center"
        />
        <el-table-column label="是否启用" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_active"
              @change="handleSubjectChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="成绩类型" min-width="200">
          <template #default="{ row }">
            <el-radio-group
              v-model="row.grades_type"
              @change="handleSubjectChange(row)"
            >
              <el-radio label="1">分数 (百分制)</el-radio>
              <el-radio label="2">等级 (ABCD)</el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { adminAPI } from "@/api/admin";
import { ElMessage } from "element-plus";

const loading = ref(false);
const courseList = ref([]);

const fetchCourses = async () => {
  loading.value = true;
  try {
    const res = await adminAPI.getCourses();
    if (res.status === 200) {
      courseList.value = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    ElMessage.error("获取科目列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSubjectChange = async (row) => {
  try {
    const res = await adminAPI.updateCourse(row.id, {
      grades_type: row.grades_type,
      is_active: row.is_active,
    });
    if (res.status === 200) {
      ElMessage.success(`已更新 ${row.subject_name} 的信息`);
    } else {
      throw new Error(res.message || "更新失败");
    }
  } catch (error) {
    console.error("Failed to update course:", error);
    ElMessage.error("更新失败，请重试");
    // 失败时回滚（简单处理：重新获取列表）
    fetchCourses();
  }
};

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
