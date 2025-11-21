<template>
  <div class="data-backup">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>数据备份管理</h3>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="backup-card">
            <template #header>
              <h4>立即备份</h4>
            </template>
            <div class="backup-content">
              <p>创建当前系统的完整数据备份</p>
              <el-button type="primary" size="large" @click="createBackup" :loading="backupLoading">
                <el-icon><Download /></el-icon>
                开始备份
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="backup-card">
            <template #header>
              <h4>自动备份设置</h4>
            </template>
            <div class="backup-content">
              <el-form :model="autoBackupForm" label-width="120px">
                <el-form-item label="启用自动备份">
                  <el-switch v-model="autoBackupForm.enabled" />
                </el-form-item>
                <el-form-item label="备份频率">
                  <el-select v-model="autoBackupForm.frequency" :disabled="!autoBackupForm.enabled">
                    <el-option label="每天" value="daily" />
                    <el-option label="每周" value="weekly" />
                    <el-option label="每月" value="monthly" />
                  </el-select>
                </el-form-item>
                <el-form-item label="备份时间">
                  <el-time-picker
                    v-model="autoBackupForm.time"
                    :disabled="!autoBackupForm.enabled"
                    format="HH:mm"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveAutoBackupSettings" :disabled="!autoBackupForm.enabled">
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider />

      <h4>备份历史记录</h4>
      <el-table :data="backupHistory" style="width: 100%">
        <el-table-column prop="name" label="备份名称" />
        <el-table-column prop="size" label="文件大小" width="120" />
        <el-table-column prop="date" label="备份时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="downloadBackup(row)">
              <el-icon><Download /></el-icon>
            </el-button>
            <el-button size="small" type="danger" @click="deleteBackup(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button size="small" type="success" @click="restoreBackup(row)">
              <el-icon><RefreshLeft /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="backup-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总备份数" :value="backupHistory.length" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="总大小" :value="totalSize" suffix="MB" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="最后备份" :value="lastBackupDate" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="下次备份" :value="nextBackupDate" />
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Download, Delete, RefreshLeft } from '@element-plus/icons-vue'

const backupLoading = ref(false)

const autoBackupForm = ref({
  enabled: true,
  frequency: 'daily',
  time: new Date(2024, 0, 1, 2, 0) // 默认凌晨2点
})

const backupHistory = ref([
  {
    id: 1,
    name: 'backup_20241117_103000',
    size: '156.8 MB',
    date: '2024-11-17 10:30:00',
    status: 'completed'
  },
  {
    id: 2,
    name: 'backup_20241116_103000',
    size: '154.2 MB',
    date: '2024-11-16 10:30:00',
    status: 'completed'
  },
  {
    id: 3,
    name: 'backup_20241115_103000',
    size: '152.5 MB',
    date: '2024-11-15 10:30:00',
    status: 'failed'
  }
])

const totalSize = computed(() => {
  const sizes = backupHistory.value
    .filter(b => b.status === 'completed')
    .map(b => parseFloat(b.size))
  return sizes.reduce((sum, size) => sum + size, 0).toFixed(1)
})

const lastBackupDate = computed(() => {
  const last = backupHistory.value[0]
  return last ? last.date.split(' ')[0] : '无'
})

const nextBackupDate = computed(() => {
  return '2024-11-18 02:00:00'
})

const createBackup = async () => {
  backupLoading.value = true
  try {
    // 模拟备份过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    const newBackup = {
      id: backupHistory.value.length + 1,
      name: `backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().toTimeString().slice(0, 8).replace(/:/g, '')}`,
      size: `${(150 + Math.random() * 10).toFixed(1)} MB`,
      date: new Date().toLocaleString('zh-CN'),
      status: 'completed'
    }

    backupHistory.value.unshift(newBackup)
    ElMessage.success('备份创建成功')
  } catch (error) {
    ElMessage.error('备份创建失败')
  } finally {
    backupLoading.value = false
  }
}

const saveAutoBackupSettings = () => {
  ElMessage.success('自动备份设置已保存')
}

const downloadBackup = (backup) => {
  // 模拟下载
  ElMessage.success(`开始下载备份: ${backup.name}`)
}

const deleteBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份 "${backup.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = backupHistory.value.findIndex(b => b.id === backup.id)
    if (index !== -1) {
      backupHistory.value.splice(index, 1)
      ElMessage.success('备份已删除')
    }
  } catch {
    // 用户取消
  }
}

const restoreBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复到备份 "${backup.name}" 吗？此操作将覆盖当前数据。`,
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('数据恢复成功')
  } catch {
    // 用户取消
  }
}

const getStatusType = (status) => {
  const types = {
    completed: 'success',
    failed: 'danger',
    running: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    completed: '成功',
    failed: '失败',
    running: '进行中'
  }
  return texts[status] || status
}
</script>

<style scoped>
.data-backup {
  padding: 20px;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.backup-card {
  margin-bottom: 20px;
}

.backup-content {
  text-align: center;
}

.backup-content p {
  color: #666;
  margin-bottom: 20px;
}

.backup-stats {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>