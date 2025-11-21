<template>
  <div class="system-logs">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>系统日志</h3>
          <div class="header-actions">
            <el-button type="primary" @click="refreshLogs">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="success" @click="exportLogs">
              <el-icon><Download /></el-icon>
              导出日志
            </el-button>
          </div>
        </div>
      </template>

      <div class="log-filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="logLevel" placeholder="日志级别" clearable>
              <el-option label="全部" value="" />
              <el-option label="错误" value="error" />
              <el-option label="警告" value="warning" />
              <el-option label="信息" value="info" />
              <el-option label="调试" value="debug" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索日志内容"
              clearable
            />
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="filterLogs">搜索</el-button>
          </el-col>
        </el-row>
      </div>

      <el-table :data="filteredLogs" style="width: 100%" height="500">
        <el-table-column prop="timestamp" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getLogLevelType(row.level)"
              size="small"
            >
              {{ row.level.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="150" />
        <el-table-column prop="message" label="消息" />
        <el-table-column prop="user" label="用户" width="120" />
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalLogs"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Refresh, Download } from '@element-plus/icons-vue'

const logLevel = ref('')
const dateRange = ref([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalLogs = ref(0)

// 模拟日志数据
const mockLogs = ref([
  {
    timestamp: '2024-11-17 10:30:45',
    level: 'info',
    source: 'auth',
    message: '用户 admin 登录成功',
    user: 'admin'
  },
  {
    timestamp: '2024-11-17 10:28:12',
    level: 'warning',
    source: 'database',
    message: '数据库连接池使用率超过80%',
    user: 'system'
  },
  {
    timestamp: '2024-11-17 10:25:33',
    level: 'error',
    source: 'api',
    message: 'API请求超时: /api/grades',
    user: 'student1'
  },
  {
    timestamp: '2024-11-17 10:20:15',
    level: 'info',
    source: 'backup',
    message: '自动备份任务完成',
    user: 'system'
  },
  {
    timestamp: '2024-11-17 10:15:22',
    level: 'debug',
    source: 'cache',
    message: '缓存清理完成，释放内存 256MB',
    user: 'system'
  }
])

const filteredLogs = computed(() => {
  let logs = mockLogs.value

  // 按级别过滤
  if (logLevel.value) {
    logs = logs.filter(log => log.level === logLevel.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    logs = logs.filter(log =>
      log.message.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      log.source.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  totalLogs.value = logs.length

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return logs.slice(start, end)
})

const getLogLevelType = (level) => {
  const types = {
    error: 'danger',
    warning: 'warning',
    info: 'info',
    debug: 'success'
  }
  return types[level] || 'info'
}

const refreshLogs = () => {
  // 模拟刷新日志
  mockLogs.value.unshift({
    timestamp: new Date().toLocaleString('zh-CN'),
    level: 'info',
    source: 'system',
    message: '日志刷新完成',
    user: 'maintance'
  })
  ElMessage.success('日志已刷新')
}

const exportLogs = () => {
  // 模拟导出日志
  const logContent = filteredLogs.value.map(log =>
    `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.source}: ${log.message} (${log.user})`
  ).join('\n')

  const blob = new Blob([logContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('日志导出成功')
}

const filterLogs = () => {
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  totalLogs.value = mockLogs.value.length
})
</script>

<style scoped>
.system-logs {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.log-filters {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>