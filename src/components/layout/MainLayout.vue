<template>
  <el-container class="main-container">
    <el-aside width="200px">
      <div class="logo">
        <h3>{{ settingsStore.systemConfig.siteName }}</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        :router="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <!-- 管理员菜单 -->
        <template v-if="authStore.userRole === 'admin'">
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
          <el-menu-item index="/admin/semesters">
            <el-icon><Calendar /></el-icon>
            <span>学期管理</span>
          </el-menu-item>
        </template>

        <!-- 教师菜单 -->
        <template v-if="authStore.userRole === 'teacher'">
          <el-menu-item index="/teacher/grades">
            <el-icon><Edit /></el-icon>
            <span>成绩录入</span>
          </el-menu-item>
        </template>

        <!-- 学生菜单 -->
        <template v-if="authStore.userRole === 'student'">
          <el-menu-item index="/student/grades">
            <el-icon><Document /></el-icon>
            <span>我的成绩</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-content">
          <div class="header-left">
            <span class="page-title">{{ pageTitle }}</span>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                {{ authStore.userName }} ({{ roleText }})
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Calendar,
  Edit,
  Document,
  User,
  ArrowDown
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 页面标题
const pageTitle = computed(() => {
  const titleMap = {
    '/admin/settings': '系统设置',
    '/admin/semesters': '学期管理',
    '/teacher/grades': '成绩录入',
    '/student/grades': '我的成绩'
  }
  return titleMap[route.path] || '首页'
})

// 角色文本
const roleText = computed(() => {
  const roleMap = {
    admin: '管理员',
    teacher: '教师',
    student: '学生'
  }
  return roleMap[authStore.userRole] || ''
})

// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.main-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3849;
  border-bottom: 1px solid #1f2d3d;
}

.logo h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 12px;
  height: 60px;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
