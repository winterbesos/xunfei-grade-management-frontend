<template>
  <div class="grade-entry">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成绩录入</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="学期">
          <el-select
            v-model="queryForm.semesterId"
            placeholder="请选择学期"
            style="width: 200px"
            @change="handleQuery"
          >
            <el-option
              v-for="semester in semesters"
              :key="semester.id"
              :label="semester.name"
              :value="semester.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="课程">
          <el-select
            v-model="queryForm.courseId"
            placeholder="请选择课程"
            style="width: 200px"
            @change="handleQuery"
          >
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 成绩表格 -->
      <el-table
        v-loading="loading"
        :data="grades"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="studentNumber" label="学号" width="120" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column label="成绩" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.score"
              :min="0"
              :max="100"
              :precision="1"
              style="width: 120px"
              @change="handleScoreChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getGradeType(row.score)">
              {{ getGradeLevel(row.score) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :loading="row.saving"
              @click="handleSave(row)"
            >
              保存
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && grades.length === 0" description="暂无数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminAPI } from '@/api/admin'
import { teacherAPI } from '@/api/teacher'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const semesters = ref([])
const courses = ref([])
const grades = ref([])

const queryForm = ref({
  semesterId: null,
  courseId: null
})

// 加载学期和课程列表
const loadOptions = async () => {
  try {
    const [semestersRes, coursesRes] = await Promise.all([
      adminAPI.getSemesters(),
      teacherAPI.getCourses()
    ])

    if (semestersRes.code === 200) {
      semesters.value = semestersRes.data
      // 默认选择第一个学期
      if (semesters.value.length > 0) {
        queryForm.value.semesterId = semesters.value[0].id
      }
    }

    if (coursesRes.code === 200) {
      courses.value = coursesRes.data
      // 默认选择第一个课程
      if (courses.value.length > 0) {
        queryForm.value.courseId = courses.value[0].id
      }
    }
  } catch (error) {
    ElMessage.error('加载选项失败')
  }
}

// 查询成绩
const handleQuery = async () => {
  if (!queryForm.value.semesterId || !queryForm.value.courseId) {
    ElMessage.warning('请选择学期和课程')
    return
  }

  loading.value = true
  try {
    const response = await teacherAPI.getGrades({
      semesterId: queryForm.value.semesterId,
      courseId: queryForm.value.courseId
    })

    if (response.code === 200) {
      grades.value = response.data.map(item => ({
        ...item,
        saving: false,
        changed: false
      }))
    }
  } catch (error) {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 重置查询
const handleReset = () => {
  queryForm.value = {
    semesterId: semesters.value[0]?.id || null,
    courseId: courses.value[0]?.id || null
  }
  grades.value = []
}

// 成绩变化
const handleScoreChange = (row) => {
  row.changed = true
}

// 保存成绩
const handleSave = async (row) => {
  row.saving = true
  try {
    const response = await teacherAPI.saveGrade({
      studentId: row.studentId,
      courseId: row.courseId,
      semesterId: row.semesterId,
      score: row.score,
      teacherId: authStore.userInfo.id,
      teacherName: authStore.userName
    })

    if (response.code === 200) {
      ElMessage.success('保存成功')
      row.changed = false
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    row.saving = false
  }
}

// 获取成绩等级
const getGradeLevel = (score) => {
  if (score === null || score === undefined) return '-'
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
  await loadOptions()
  if (queryForm.value.semesterId && queryForm.value.courseId) {
    await handleQuery()
  }
})
</script>

<style scoped>
.grade-entry {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
