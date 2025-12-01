<template>
  <div class="character-comments-semester-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>品格评语 - 学期列表</span>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="semesters"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="semester_id"
          label="学期ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="semester_name"
          label="学期名称"
          min-width="150"
        />
        <el-table-column label="起止时间" width="250">
          <template #default="{ row }">
            {{ formatDate(row.start_date) }} ~ {{ formatDate(row.end_date) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleSelectSemester(row)"
            >
              <el-icon><View /></el-icon>
              查看班级
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && semesters.length === 0"
        description="暂无学期数据"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";
import { View } from "@element-plus/icons-vue";
import { formatDate } from "@/utils/date";

const router = useRouter();
const semesters = ref([]);
const loading = ref(false);

const fetchSemesters = async () => {
  loading.value = true;
  try {
    // 使用 getAvailableSemesters 或 getSemesterSubjects 获取学期
    // 这里假设 getAvailableSemesters 返回学期列表
    const response = await teacherAPI.getAvailableSemesters();
    if (response.status === 200) {
      semesters.value = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch semesters:", error);
    ElMessage.error("获取学期列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSelectSemester = (row) => {
  router.push({
    name: "TeacherCharacterCommentsClassList",
    params: {
      semesterId: row.semester_id
    }
  });
};

onMounted(() => {
  fetchSemesters();
});
</script>

<style scoped>
.character-comments-semester-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  font-weight: bold;
}
</style>
