<template>
  <div class="system-status">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>系统状态监控</h3>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="status-card">
            <div class="status-item">
              <div class="status-icon online">
                <el-icon><Monitor /></el-icon>
              </div>
              <div class="status-info">
                <h4>服务器状态</h4>
                <p class="status-text">正常运行</p>
                <p class="status-time">运行时间: 3天12小时</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="status-card">
            <div class="status-item">
              <div class="status-icon warning">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="status-info">
                <h4>数据库状态</h4>
                <p class="status-text">正常</p>
                <p class="status-time">连接数: 12/100</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="status-card">
            <div class="status-item">
              <div class="status-icon online">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="status-info">
                <h4>API状态</h4>
                <p class="status-text">正常</p>
                <p class="status-time">响应时间: 45ms</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider />

      <h4>系统资源使用情况</h4>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="resource-item">
            <span>CPU使用率</span>
            <el-progress :percentage="35" status="success" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="resource-item">
            <span>内存使用率</span>
            <el-progress :percentage="68" status="warning" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <div class="resource-item">
            <span>磁盘使用率</span>
            <el-progress :percentage="45" status="success" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="resource-item">
            <span>网络带宽</span>
            <el-progress :percentage="25" status="success" />
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { Monitor, Warning, Connection } from '@element-plus/icons-vue'
</script>

<style scoped>
.system-status {
  padding: 20px;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.status-card {
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.status-icon.online {
  background-color: #f0f9ff;
  color: #1890ff;
}

.status-icon.warning {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.status-text {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #666;
}

.status-time {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #999;
}

.resource-item {
  margin-bottom: 15px;
}

.resource-item span {
  display: block;
  margin-bottom: 5px;
  color: #666;
}
</style>