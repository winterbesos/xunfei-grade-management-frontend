<template>
  <div class="grade-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成绩管理 - 可打分学期</span>
        </div>
      </template>

      <!-- 学期列表 -->
      <el-table
        v-loading="loading"
        :data="semesters"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="semester_name"
          label="学期名称"
          min-width="180"
        />
        <el-table-column prop="begin_time" label="评分开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.scoring_begin_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="end_time" label="评分结束时间" width="180">
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
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              :disabled="!row.is_scoring"
              type="primary"
              size="small"
              link
              @click="handleEnterGrades(row)"
            >
              进入打分
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && semesters.length === 0"
        description="暂无可打分的学期"
      />
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="dialogVisible" title="学期详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="学期ID">{{
          currentSemester.id
        }}</el-descriptions-item>
        <el-descriptions-item label="学期名称">{{
          currentSemester.name
        }}</el-descriptions-item>
        <el-descriptions-item label="学校ID">{{
          currentSemester.schoolId
        }}</el-descriptions-item>
        <el-descriptions-item label="学校名称">{{
          currentSemester.schoolName
        }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{
          currentSemester.startDate
        }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{
          currentSemester.endDate
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentSemester)">
            {{ getStatusText(currentSemester) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="课程数">{{
          currentSemester.courseCount || 0
        }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{
          currentSemester.remark || "-"
        }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { formatDate } from "@/utils/date";

const router = useRouter();
const loading = ref(false);
const semesters = ref([]);
const dialogVisible = ref(false);
const currentSemester = ref({});

// 获取状态类型
const getStatusType = (cycle) => {
  if (cycle.is_scoring) return "success";
  return null;
};

// 获取状态文本
const getStatusText = (cycle) => {
  if (!cycle.is_scoring) return "未开始";
  else return "已开启";
};

// 加载可打分的学期列表
const loadAvailableSemesters = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getAvailableSemesters();
    if (response.status === 200) {
      semesters.value = response.data;
    }
  } catch (error) {
    ElMessage.error("加载可打分学期列表失败");
  } finally {
    loading.value = false;
  }
};

// 进入打分
const handleEnterGrades = (row) => {
  router.push({
    name: "TeacherSemesterGradeManagement",
    params: {
      semesterId: row.semester_id,
    },
    query: {
      semesterName: row.semester_name,
    },
  });
};

onMounted(() => {
  loadAvailableSemesters();
});
</script>

<style scoped>
.grade-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
