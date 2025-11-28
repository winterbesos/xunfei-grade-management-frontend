<template>
  <div class="semester-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学期管理 - 系统维护</span>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="总学期数" :value="statistics.totalSemesters" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="进行中学期" :value="statistics.activeSemesters" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="未开始学期" :value="statistics.upcomingSemesters" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已结束学期" :value="statistics.finishedSemesters" />
        </el-col>
      </el-row>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="学校">
          <el-select
            v-model="queryForm.schoolId"
            placeholder="请选择学校"
            style="width: 200px"
            @change="handleQuery"
          >
            <el-option label="全部学校" :value="null" />
            <el-option
              v-for="school in schools"
              :key="school.id"
              :label="school.name"
              :value="school.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="学期名称">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入学期名称"
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择状态"
            style="width: 150px"
            @change="handleQuery"
          >
            <el-option label="全部状态" :value="null" />
            <el-option label="未开始" value="upcoming" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="finished" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">导出数据</el-button>
        </el-form-item>
      </el-form>

      <!-- 学期列表 -->
      <el-table
        v-loading="loading"
        :data="semesters"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="semester_id" label="学期ID" width="150" show-overflow-tooltip />
        <el-table-column prop="semester_name" label="学期名称" min-width="150" />
        <el-table-column prop="school_id" label="学校ID" width="150" show-overflow-tooltip />
        <el-table-column prop="school_name" label="学校名称" min-width="120" />
        <el-table-column prop="begin_time" label="开始时间" width="200" />
        <el-table-column prop="end_time" label="结束时间" width="200" />
      </el-table>

      <el-empty v-if="!loading && semesters.length === 0" description="暂无学期数据" />
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="学期详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="学期ID">{{ currentSemester.id }}</el-descriptions-item>
        <el-descriptions-item label="学期名称">{{ currentSemester.name }}</el-descriptions-item>
        <el-descriptions-item label="学校ID">{{ currentSemester.schoolId }}</el-descriptions-item>
        <el-descriptions-item label="学校名称">{{ currentSemester.schoolName }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentSemester.startDate }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentSemester.endDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentSemester.status)">
            {{ getStatusText(currentSemester.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentSemester.createdAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentSemester.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { semesterAPI } from '@/api/semester'
import { schoolAPI } from '@/api/school'

const loading = ref(false)
const semesters = ref([])
const schools = ref([])
const dialogVisible = ref(false)
const currentSemester = ref({})

// 查询表单
const queryForm = reactive({
  schoolId: null,
  name: '',
  status: null
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 统计信息
const statistics = computed(() => {
  const allSemesters = semesters.value
  return {
    totalSemesters: allSemesters.length,
    activeSemesters: allSemesters.filter(s => s.status === 'active').length,
    upcomingSemesters: allSemesters.filter(s => s.status === 'upcoming').length,
    finishedSemesters: allSemesters.filter(s => s.status === 'finished').length
  }
})

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    upcoming: 'info',
    active: 'success',
    finished: 'warning'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    upcoming: '未开始',
    active: '进行中',
    finished: '已结束'
  }
  return texts[status] || '未知'
}

// 加载学校列表
const loadSchools = async () => {
  try {
    const response = await schoolAPI.getSchools()
    if (response.status === 200) {
      schools.value = response.data.schools || response.data
    }
  } catch (error) {
    ElMessage.error('加载学校列表失败')
  }
}

// 加载学期列表
const loadSemesters = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...queryForm
    }

    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === '') {
        delete params[key]
      }
    })

    const response = await semesterAPI.getMaintanenceSemesters(params)
    if (response.status === 200) {
      semesters.value = response.data
      pagination.total = response.data.length

      // 处理学校名称显示
      semesters.value.forEach(semester => {
        const school = schools.value.find(s => s.id === semester.schoolId)
        if (school && !semester.schoolName) {
          semester.schoolName = school.schoolName || school.name
        }
      })
    }
  } catch (error) {
    ElMessage.error('加载学期列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  pagination.currentPage = 1
  loadSemesters()
}

// 重置查询条件
const handleReset = () => {
  queryForm.schoolId = null
  queryForm.name = ''
  queryForm.status = null
  handleQuery()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadSemesters()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadSemesters()
}

// 查看详情
const handleView = (row) => {
  currentSemester.value = { ...row }
  dialogVisible.value = true
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中')
  // TODO: 实现导出功能
}

onMounted(async () => {
  await loadSchools()
  await loadSemesters()
})
</script>

<style scoped>
.semester-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
