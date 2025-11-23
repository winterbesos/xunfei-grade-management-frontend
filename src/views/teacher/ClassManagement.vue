<template>
  <div class="class-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>学生管理</span>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="班级总数" :value="statistics.totalClasses" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="学生总数" :value="statistics.totalStudents" />
        </el-col>
      </el-row>

      <!-- 班级列表 -->
      <el-table
        v-loading="loading"
        :data="classes"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="class_id"
          label="班级ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="class_name" label="班级名称" min-width="150" />
        <el-table-column
          prop="student_count"
          label="学生数"
          width="120"
          align="center"
        />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="viewStudents(row.class_id)"
            >
              查看学生
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && classes.length === 0"
        description="暂无班级数据"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";

const router = useRouter();
const classes = ref([]);
const loading = ref(false);

const statistics = computed(() => {
  const totalStudents = classes.value.reduce(
    (sum, c) => sum + (c.student_count || 0),
    0,
  );
  return {
    totalClasses: classes.value.length,
    totalStudents: totalStudents,
  };
});

const fetchClasses = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getTeacherClasses();
    if (response.data) {
      // Assuming the API returns objects with class_id, class_name, and student_count
      classes.value = response.data;
    }
  } catch (error) {
    ElMessage.error("获取班级列表失败");
  } finally {
    loading.value = false;
  }
};

const viewStudents = (classId) => {
  router.push(`/teacher/classes/${classId}/students`);
};

onMounted(() => {
  fetchClasses();
});
</script>

<style scoped>
.class-management {
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
  font-weight: bold;
}
</style>
