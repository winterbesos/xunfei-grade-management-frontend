<template>
  <div class="grade-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的成绩</span>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="总课程数" :value="statistics.totalCourses" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平均分" :value="statistics.averageScore" :precision="2" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="及格率" :value="statistics.passRate" suffix="%" :precision="1" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="总学分" :value="statistics.totalCredits" :precision="1" />
        </el-col>
      </el-row>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="学期">
          <el-select
            v-model="queryForm.semesterId"
            placeholder="请选择学期"
            style="width: 200px"
            @change="handleQuery"
          >
            <el-option label="全部学期" :value="null" />
            <el-option
              v-for="semester in semesters"
              :key="semester.id"
              :label="semester.name"
              :value="semester.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleExport">导出成绩单</el-button>
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
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="semesterId" label="学期" width="180">
          <template #default="{ row }">
            {{ getSemesterName(row.semesterId) }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: getScoreColor(row.score), fontWeight: 'bold' }">
              {{ row.score !== null ? row.score : '-' }}
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
        <el-table-column prop="teacherName" label="任课教师" width="120" />
      </el-table>

      <el-empty v-if="!loading && grades.length === 0" description="暂无成绩数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminAPI } from '@/api/admin'
import { studentAPI } from '@/api/student'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const semesters = ref([])
const grades = ref([])

const queryForm = ref({
  semesterId: null
})

// 统计信息
const statistics = computed(() => {
  const totalCourses = grades.value.length
  const validGrades = grades.value.filter(g => g.score !== null)
  const totalScore = validGrades.reduce((sum, g) => sum + g.score, 0)
  const averageScore = validGrades.length > 0 ? totalScore / validGrades.length : 0
  const passedCourses = validGrades.filter(g => g.score >= 60).length
  const passRate = validGrades.length > 0 ? (passedCourses / validGrades.length) * 100 : 0

  // 假设每门课程 3 学分
  const totalCredits = totalCourses * 3

  return {
    totalCourses,
    averageScore,
    passRate,
    totalCredits
  }
})

// 加载学期列表
const loadSemesters = async () => {
  try {
    const response = await adminAPI.getSemesters()
    if (response.code === 200) {
      semesters.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载学期列表失败')
  }
}

// 查询成绩
const handleQuery = async () => {
  loading.value = true
  try {
    const params = {
      studentId: authStore.userInfo.id
    }
    if (queryForm.value.semesterId) {
      params.semesterId = queryForm.value.semesterId
    }

    const response = await studentAPI.getMyGrades(params)
    if (response.code === 200) {
      grades.value = response.data
    }
  } catch (error) {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 导出成绩单
const handleExport = () => {
  ElMessage.info('导出功能开发中')
  // TODO: 实现导出功能
}

// 获取学期名称
const getSemesterName = (semesterId) => {
  const semester = semesters.value.find(s => s.id === semesterId)
  return semester ? semester.name : '-'
}

// 获取成绩颜色
const getScoreColor = (score) => {
  if (score === null || score === undefined) return '#909399'
  if (score >= 90) return '#67C23A'
  if (score >= 80) return '#409EFF'
  if (score >= 70) return '#E6A23C'
  if (score >= 60) return '#F56C6C'
  return '#F56C6C'
}

// 获取成绩等级
const getGradeLevel = (score) => {
  if (score === null || score === undefined) return '未录入'
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '不及格'
}

// 获取成绩等级标签类型
const getGradeType = (score) => {
  if (score === null || score === undefined) return 'info'
  if (score >= 90) return 'success'
  if (score >= 80) return ''
  if (score >= 70) return 'warning'
  if (score >= 60) return 'warning'
  return 'danger'
}

onMounted(async () => {
  await loadSemesters()
  await handleQuery()
})
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
