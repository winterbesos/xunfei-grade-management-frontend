<template>
  <div class="grade-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的成绩</span>
          <el-button type="primary" link @click="viewGradeTrend"
            >查看成绩趋势</el-button
          >
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="总课程数" :value="statistics.totalCourses" />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="平均分"
            :value="statistics.averageScore"
            :precision="2"
          />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="及格率"
            :value="statistics.passRate"
            suffix="%"
            :precision="1"
          />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="总学分"
            :value="statistics.totalCredits"
            :precision="1"
          />
        </el-col>
      </el-row>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="教学周期">
          <el-select
            v-model="queryForm.semesterId"
            placeholder="请选择教学周期"
            style="width: 200px"
            @change="handleQuery"
          >
            <el-option
              v-for="semester in semesters"
              :key="semester.semester_id"
              :label="semester.academic_year_name + semester.term_name"
              :value="semester.semester_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 成绩表格 -->
      <el-table
        v-loading="loading"
        :data="grades"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="subject_name" label="课程名称" />
        <el-table-column prop="term_name" label="学期" width="180">
          <template #default="{ row }">
            <span>{{ row.academic_year_name }}{{ row.term_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="100" align="center">
          <template #default="{ row }">
            <span
              :style="{ color: getScoreColor(row.score), fontWeight: 'bold' }"
            >
              {{ row.score !== null ? row.score : "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getGradeType(row.score)">
              {{ getGradeLevel(row.score) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacher_name" label="任课教师" width="120" />
      </el-table>

      <el-empty
        v-if="!loading && grades.length === 0"
        description="暂无成绩数据"
      />
    </el-card>

    <!-- 成绩趋势 Dialog -->
    <el-dialog
      title="成绩趋势"
      v-model="gradeTrendVisible"
      width="80%"
      :destroy-on-close="true"
    >
      <GradeTrend />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { studentAPI } from "@/api/student";
import GradeTrend from "@/views/common/GradeTrend.vue";

const loading = ref(false);
const semesters = ref([]);
const grades = ref([]);
const gradeTrendVisible = ref(false);

const queryForm = ref({
  semesterId: null,
});

// 统计信息
const statistics = computed(() => {
  const totalCourses = grades.value.length;
  const validGrades = grades.value.filter((g) => g.score !== null);
  if (validGrades.length === 0) {
    return {
      totalCourses: 0,
      averageScore: 0,
      passRate: 0,
      totalCredits: 0,
    };
  }

  const totalScore = validGrades.reduce((sum, g) => sum + Number(g.score), 0);
  const averageScore = totalScore / validGrades.length;
  const passedCourses = validGrades.filter((g) => g.score >= 60).length;
  const passRate =
    validGrades.length > 0 ? (passedCourses / validGrades.length) * 100 : 0;

  // 假设每门课程 3 学分
  const totalCredits = totalCourses * 3;

  return {
    totalCourses,
    averageScore,
    passRate,
    totalCredits,
  };
});

// 加载学期列表
const loadSemesters = async () => {
  try {
    const response = await studentAPI.getSemesters();
    if (response.status === 200) {
      semesters.value = response.data;
      // 默认选中最新的学期 (假设返回的列表是按时间排序的，或者可以通过ID排序)
      // 这里简单地取列表的第一个，通常API返回的应该是最近的或者有标记
      // 如果需要更精确的排序，可以根据 id 或其他字段排序
      if (semesters.value.length > 0) {
        // 尝试找到 ID 最大的作为最新学期
        const latestSemester = semesters.value.reduce((prev, current) => {
          return prev.semester_id > current.semester_id ? prev : current;
        });
        queryForm.value.semesterId = latestSemester.semester_id;
        handleQuery(); // 选中后立即查询
      }
    }
  } catch (error) {
    ElMessage.error("加载学期列表失败");
  }
};

// 查询成绩
const handleQuery = async () => {
  if (!queryForm.value.semesterId) return;

  loading.value = true;
  try {
    const response = await studentAPI.getMyGrades(queryForm.value.semesterId);
    if (response.status === 200) {
      grades.value = response.data;
    }
  } catch (error) {
    ElMessage.error("查询失败");
  } finally {
    loading.value = false;
  }
};

const viewGradeTrend = () => {
  gradeTrendVisible.value = true;
};

// 获取成绩颜色
const getScoreColor = (score) => {
  if (score === null || score === undefined) return "#909399";
  if (score >= 90) return "#67C23A";
  if (score >= 80) return "#409EFF";
  if (score >= 70) return "#E6A23C";
  if (score >= 60) return "#F56C6C";
  return "#F56C6C";
};

// 获取成绩等级
const getGradeLevel = (score) => {
  if (score === null || score === undefined) return "未录入";
  if (score >= 90) return "优秀";
  if (score >= 80) return "良好";
  if (score >= 70) return "中等";
  if (score >= 60) return "及格";
  return "不及格";
};

// 获取成绩等级标签类型
const getGradeType = (score) => {
  if (score === null || score === undefined) return "info";
  if (score >= 90) return "success";
  if (score >= 80) return "";
  if (score >= 70) return "warning";
  if (score >= 60) return "warning";
  return "danger";
};

onMounted(async () => {
  await loadSemesters();
});
</script>

<style scoped>
.grade-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
