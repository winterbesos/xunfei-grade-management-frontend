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
          prop="semester_name"
          label="学期名称"
          min-width="180"
        />
        <el-table-column label="评分开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.scoring_begin_time) }}
          </template>
        </el-table-column>
        <el-table-column label="评分结束时间" width="180">
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
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              :disabled="!row.is_scoring"
              type="primary"
              size="small"
              link
              @click="handleSelectSemester(row)"
            >
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
import { formatDate } from "@/utils/date";

const router = useRouter();
const semesters = ref([]);
const loading = ref(false);

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
      semesterId: row.semester_id,
    },
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
