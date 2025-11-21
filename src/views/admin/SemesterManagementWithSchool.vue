<template>
  <div class="semester-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学期管理</span>
        </div>
      </template>

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
              type="primary"
              size="small"
              link
              @click="activeSemesterScore(row)"
            >
              {{ row.enabled ? '结束打分' : '开启打分' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && semesters.length === 0" description="暂无学期数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { semesterAPI } from '@/api/semester'
import { schoolAPI } from '@/api/school'

const loading = ref(false)
const submitLoading = ref(false)
const semesters = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加学期')
const formRef = ref(null)

// 查询表单
const queryForm = reactive({
  schoolId: null,
  name: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const form = ref({
  id: null,
  schoolId: '',
  name: '',
  startDate: '',
  endDate: '',
  status: 'upcoming',
  remark: ''
})

const rules = {
  schoolId: [
    { required: true, message: '请选择学校', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入学期名称', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取状态类型
const getStatusType = (cycle) => {
  if (cycle.enabled) return 'success'
  return null
}

// 获取状态文本
const getStatusText = (cycle) => {
  if (!cycle.enabled) return '未开始'
  else return '已开启'
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

    const response = await semesterAPI.getSemesters(params)
    if (response.status === 200) {
      semesters.value = response.data.list || response.data
      pagination.total = response.data.total || response.data.length
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

// 添加学期
const handleAdd = () => {
  dialogTitle.value = '添加学期'
  form.value = {
    id: null,
    schoolId: '',
    name: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    remark: ''
  }
  dialogVisible.value = true
}

const activeSemesterScore = (row) => {
  ElMessageBox.confirm(`确定要开启学期"${row.semester_name}"的打分功能吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await semesterAPI.toggleSemesterScore(row.semester_id)
      if (response.status === 200) {
        ElMessage.success('打分功能已开启')
        await loadSemesters()
      }
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 编辑学期
const handleEdit = (row) => {
  dialogTitle.value = '编辑学期'
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除学期
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除学期"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await semesterAPI.deleteSemester(row.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      await loadSemesters()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      let response
      if (form.value.id) {
        // 编辑
        response = await semesterAPI.updateSemester(form.value.id, form.value)
      } else {
        // 添加
        response = await semesterAPI.createSemester(form.value)
      }

      if (response.code === 200) {
        ElMessage.success(form.value.id ? '更新成功' : '添加成功')
        dialogVisible.value = false
        await loadSemesters()
      }
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(async () => {
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
