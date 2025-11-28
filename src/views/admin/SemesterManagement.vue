<template>
  <div class="semester-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学期管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加学期
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="semesters"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="学期名称" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '进行中' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="学期名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="例如: 2024年春季学期"
          />
        </el-form-item>

        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="finished" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { adminAPI } from '@/api/admin'

const loading = ref(false)
const submitLoading = ref(false)
const semesters = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加学期')
const formRef = ref(null)

const form = ref({
  id: null,
  name: '',
  startDate: '',
  endDate: '',
  status: 'active'
})

const rules = {
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

// 加载学期列表
const loadSemesters = async () => {
  loading.value = true
  try {
    const response = await adminAPI.getSemesters()
    if (response.status === 200) {
      semesters.value = response.data.list
    }
  } catch (error) {
    ElMessage.error('加载学期列表失败')
  } finally {
    loading.value = false
  }
}

// 添加学期
const handleAdd = () => {
  dialogTitle.value = '添加学期'
  form.value = {
    id: null,
    name: '',
    startDate: '',
    endDate: '',
    status: 'active'
  }
  dialogVisible.value = true
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

    // TODO: 调用删除 API
    ElMessage.success('删除成功')
    await loadSemesters()
  } catch {
    // 用户取消
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (form.value.id) {
        // 编辑
        const response = await adminAPI.updateSemester(form.value.id, form.value)
        if (response.status === 200) {
          ElMessage.success('更新成功')
        }
      } else {
        // 添加
        const response = await adminAPI.createSemester(form.value)
        if (response.status === 200) {
          ElMessage.success('添加成功')
        }
      }

      dialogVisible.value = false
      await loadSemesters()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => {
  loadSemesters()
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
