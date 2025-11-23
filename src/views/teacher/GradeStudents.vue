<template>
  <div class="grade-students">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="handleBack" :icon="ArrowLeft" circle />
            <span style="margin-left: 10px;">学生成绩录入</span>
          </div>
          <div class="header-info">
            <el-tag type="info">{{ semesterName }}</el-tag>
            <el-tag type="info">{{ className }}</el-tag>
          </div>
          <div class="header-right">
            <el-button type="success" @click="handleBatchSave" :loading="saveLoading">
              <el-icon><Check /></el-icon>
              保存全部
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="学生总数" :value="statistics.totalStudents" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已录入" :value="statistics.gradedStudents" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平均分" :value="statistics.averageScore" :precision="1" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="及格率" :value="statistics.passRate" suffix="%" :precision="1" />
        </el-col>
      </el-row>

      <!-- 快速操作 -->
      <el-row :gutter="10" style="margin-bottom: 20px">
        <el-col :span="12">
          <el-input
            v-model="quickScore"
            placeholder="快速设置分数"
            style="width: 150px"
            @keyup.enter="handleQuickSet"
          >
            <template #append>
              <el-button @click="handleQuickSet">应用</el-button>
            </template>
          </el-input>
          <el-button @click="handleSetAllPass" style="margin-left: 10px">全部及格</el-button>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-button type="success" @click="handleViewProof" style="margin-right: 10px">
            <el-icon><Document /></el-icon>
            成绩证明
          </el-button>
          <el-select v-model="filterScore" placeholder="筛选状态" style="width: 120px" @change="handleFilter">
            <el-option label="全部学生" value="all" />
            <el-option label="已录入" value="graded" />
            <el-option label="未录入" value="ungraded" />
          </el-select>
        </el-col>
      </el-row>

      <!-- 学生列表 -->
      <el-table
        v-loading="loading"
        :data="filteredStudents"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="user_name" label="姓名" width="100" />
        <el-table-column label="当前成绩" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.score !== null" class="current-score">{{ row.score }}分</span>
            <span v-else class="no-score">未录入</span>
          </template>
        </el-table-column>
        <el-table-column label="课程成绩" width="200">
          <template #default="{ row }">
            <div class="grade-input-group">
              <el-input-number
                v-model="row.score"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                controls-position="right"
                style="width: 120px"
                @change="handleScoreChange(row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getGradeTagType(row.score)">
              {{ getGradeLevel(row.score) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评语" min-width="200">
          <template #default="{ row }">
            <el-input
              v-model="row.comment"
              placeholder="输入评语(可选)"
              size="small"
              clearable
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.score !== null ? 'success' : 'info'">
              {{ row.score !== null ? '已录入' : '未录入' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleSaveSingle(row)"
              :disabled="row.score === null"
            >
              保存
            </el-button>
            <el-button
              type="info"
              size="small"
              link
              @click="handleViewHistory(row)"
            >
              历史
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredStudents.length === 0" description="暂无学生数据" />
    </el-card>

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="成绩历史记录"
      width="600px"
    >
      <el-table :data="gradeHistory" style="width: 100%">
        <el-table-column prop="date" label="录入时间" width="160" />
        <el-table-column prop="score" label="成绩" width="80" />
        <el-table-column prop="teacher" label="录入教师" width="120" />
        <el-table-column prop="comment" label="评语" />
      </el-table>
      <template #footer>
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { teacherAPI } from '@/api/teacher'

const route = useRoute()
const router = useRouter()

const semesterId = route.params.semesterId
const classId = route.params.classId
const semesterName = route.query.semesterName || '未知学期'
const className = route.query.className || '未知班级'

const loading = ref(false)
const saveLoading = ref(false)
const students = ref([])
const selectedStudents = ref([])
const historyDialogVisible = ref(false)
const gradeHistory = ref([])

// 快速设置
const quickScore = ref('')
const filterScore = ref('all')

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 50,
  total: 0
})

// 统计信息
const statistics = computed(() => {
  const allStudents = students.value
  const validScores = allStudents.filter(s => s.score !== null)
  const totalScore = validScores.reduce((sum, s) => sum + (s.score || 0), 0)
  const passedStudents = validScores.filter(s => (s.score || 0) >= 60)

  return {
    totalStudents: allStudents.length,
    gradedStudents: validScores.length,
    averageScore: validScores.length > 0 ? totalScore / validScores.length : 0,
    passRate: validScores.length > 0 ? (passedStudents.length / validScores.length) * 100 : 0
  }
})

// 过滤后的学生列表
const filteredStudents = computed(() => {
  let result = students.value

  if (filterScore.value === 'graded') {
    result = result.filter(s => s.score !== null)
  } else if (filterScore.value === 'ungraded') {
    result = result.filter(s => s.score === null)
  }

  // 分页
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  pagination.total = result.length

  return result.slice(start, end)
})

// 返回上级
const handleBack = () => {
  router.push({
    name: 'TeacherGradeClasses',
    params: { semesterId: semesterId },
    query: { semesterName: semesterName }
  })
}

// 查看成绩证明
const handleViewProof = () => {
  router.push({
    name: 'TeacherGradeProof'
  })
}

// 获取成绩标签类型
const getGradeTagType = (score) => {
  if (score === null || score === undefined) return 'info'
  if (score >= 90) return 'success'
  if (score >= 80) return ''
  if (score >= 70) return 'warning'
  if (score >= 60) return 'warning'
  return 'danger'
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

// 加载学生列表
const loadStudents = async () => {
  loading.value = true
  try {
    const response = await teacherAPI.getStudentsByClass(classId)
    if (response.status === 200) {
      students.value = response.data
      pagination.total = response.data.length
    }
  } catch (error) {
    ElMessage.error('加载学生列表失败')
  } finally {
    loading.value = false
  }
}

// 成绩变化处理
const handleScoreChange = (row) => {
  if (row.score !== null) {
    row.modified = true
  }
}

// 快速设置分数
const handleQuickSet = () => {
  if (!quickScore.value && quickScore.value !== 0) {
    ElMessage.warning('请输入分数')
    return
  }

  selectedStudents.value.forEach(student => {
    student.score = parseFloat(quickScore.value)
    student.modified = true
  })

  ElMessage.success(`已为选中的${selectedStudents.value.length}个学生设置分数`)
}

// 全部及格
const handleSetAllPass = () => {
  students.value.forEach(student => {
    if (student.score == null) {
      student.score = 60
      student.modified = true
    }
  })
  ElMessage.success('已为所有未评分学生设置及格分数')
}

// 筛选处理
const handleFilter = () => {
  pagination.currentPage = 1
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedStudents.value = selection
}

// 保存单个学生
const handleSaveSingle = async (row) => {
  if (row.score === null) {
    ElMessage.warning('请输入分数')
    return
  }

  try {
    const response = await teacherAPI.saveStudentGrade({
      studentId: row.id,
      semesterId: semesterId,
      classId: classId,
      score: row.score,
      comment: row.comment
    })

    if (response.code === 200) {
      ElMessage.success('保存成功')
      row.modified = false
    }
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  }
}

// 批量保存
const handleBatchSave = async () => {
  const modifiedStudents = students.value.filter(s => s.modified && s.score !== null)

  if (modifiedStudents.length === 0) {
    ElMessage.info('没有需要保存的修改')
    return
  }

  saveLoading.value = true
  try {
    const grades = modifiedStudents.map(student => ({
      studentId: student.id,
      semesterId: semesterId,
      classId: classId,
      score: student.score,
      comment: student.comment
    }))

    const response = await teacherAPI.batchSaveGrades(grades)
    if (response.code === 200) {
      ElMessage.success(`成功保存${modifiedStudents.length}个学生的成绩`)
      modifiedStudents.forEach(s => s.modified = false)
      await loadStudents()
    }
  } catch (error) {
    ElMessage.error(error.message || '批量保存失败')
  } finally {
    saveLoading.value = false
  }
}

// 查看历史
const handleViewHistory = (row) => {
  // 模拟历史数据
  gradeHistory.value = [
    {
      date: '2024-01-15 14:30:00',
      score: 85,
      teacher: '张老师',
      comment: '表现良好'
    },
    {
      date: '2024-01-10 10:15:00',
      score: 82,
      teacher: '李老师',
      comment: '有进步'
    }
  ]
  historyDialogVisible.value = true
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadStudents()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadStudents()
}

onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.grade-students {
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

.header-info {
  display: flex;
  gap: 10px;
}

.header-right {
  display: flex;
  align-items: center;
}

.grade-input-group {
  display: flex;
  align-items: center;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}
</style>
