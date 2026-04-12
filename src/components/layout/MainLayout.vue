<template>
  <el-container class="main-container">
    <el-aside
      :width="isCollapse ? '64px' : '200px'"
      class="aside-transition"
      :style="{ backgroundColor: authStore.themeColor }"
    >
      <div class="logo" :style="{ backgroundColor: authStore.themeColor }">
        <h3 v-show="!isCollapse">{{ settingsStore.systemConfig.siteName }}</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        :router="true"
        :collapse="isCollapse"
        :collapse-transition="false"
        :background-color="authStore.themeColor"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <!-- 管理员菜单 -->
        <template v-if="authStore.userRole === 'admin'">
          <el-menu-item index="/admin/semesters">
            <el-icon><Calendar /></el-icon>
            <template #title>学期管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/classes">
            <el-icon><User /></el-icon>
            <template #title>班级管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/subjects">
            <el-icon><Reading /></el-icon>
            <template #title>科目管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/elective-subjects">
            <el-icon><Reading /></el-icon>
            <template #title>选修课管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/activities">
            <el-icon><Trophy /></el-icon>
            <template #title>活动管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/activity-requests">
            <el-icon><Trophy /></el-icon>
            <template #title>奖项审核</template>
          </el-menu-item>
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
        </template>

        <!-- 教师菜单 -->
        <template v-if="authStore.userRole === 'teacher'">
          <el-menu-item index="/teacher/grade-management">
            <el-icon><Document /></el-icon>
            <template #title>成绩管理</template>
          </el-menu-item>
          <el-menu-item index="/teacher/classes">
            <el-icon><User /></el-icon>
            <template #title>学生管理</template>
          </el-menu-item>
          <el-menu-item index="/teacher/awards">
            <el-icon><Trophy /></el-icon>
            <template #title>获奖审核</template>
          </el-menu-item>
        </template>

        <!-- 学生菜单 -->
        <template v-if="authStore.userRole === 'student'">
          <el-menu-item index="/student/grades">
            <el-icon><Document /></el-icon>
            <template #title>我的成绩</template>
          </el-menu-item>
          <el-menu-item index="/student/semesters">
            <el-icon><Calendar /></el-icon>
            <template #title>学期列表</template>
          </el-menu-item>
          <el-menu-item index="/student/awards">
            <el-icon><Trophy /></el-icon>
            <template #title>奖项提交</template>
          </el-menu-item>
        </template>

        <!-- 维护人员菜单 -->
        <template v-if="authStore.userRole === 'maintenance'">
          <el-menu-item index="/maintenance/schools">
            <el-icon><School /></el-icon>
            <template #title>学校管理</template>
          </el-menu-item>

        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-content">
          <div class="header-left">
            <el-button link @click="toggleCollapse" class="collapse-btn">
              <el-icon :size="20">
                <Expand v-if="isCollapse" />
                <Fold v-else />
              </el-icon>
            </el-button>
            <span class="page-title">{{ pageTitle }}</span>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                <span class="username"
                  >{{ authStore.realname }} ({{
                    authStore.userInfo?.school_name
                  }}
                  - {{ roleText }})</span
                >
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="
                      authStore.originalRole === 'admin' &&
                      authStore.userRole === 'admin'
                    "
                    command="switch-to-teacher"
                  >
                    <el-icon><User /></el-icon>
                    切换为教师
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="
                      authStore.originalRole === 'admin' &&
                      authStore.userRole === 'teacher'
                    "
                    command="switch-to-admin"
                  >
                    <el-icon><Setting /></el-icon>
                    切换回管理员
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="authStore.loginType === 'password'"
                    divided
                    command="logout"
                    >退出登录</el-dropdown-item
                  >
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
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Setting,
  Calendar,
  Edit,
  Document,
  User,
  ArrowDown,
  School,
  Trophy,
  Fold,
  Expand,
  Reading,
} from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { authAPI } from "@/api/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const isCollapse = ref(false);

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 当前激活的菜单
const activeMenu = computed(() => route.path);

// 页面标题
const pageTitle = computed(() => {
  const titleMap = {
    AdminSemesters: "学期管理",
    AdminClasses: "班级管理",
    AdminActivities: "活动管理",
    AdminElectiveSubjects: "选修课管理",
    TeacherGradeManagement: "成绩管理",
    TeacherGradeSemesters: "可打分学期",
    TeacherGradeClasses: "班级列表",
    TeacherGradeStudents: "学生列表",
    TeacherClasses: "学生管理",
    TeacherClassStudents: "学生列表",
    TeacherReportProof: "成绩证明单",
    TeacherStatusCard: "学籍卡",
    TeacherCharacterCommentsList: "品格评语",
    TeacherCharacterComments: "品格评语",
    TeacherAwardReview: "获奖审核",
    TeacherElectiveSubjectList: "选修科目列表",
    TeacherElectiveGradeEntry: "选修成绩录入",
    StudentGrades: "我的成绩",
    StudentSemesters: "学期列表",
    StudentSemesterReport: "成绩单",
    StudentAwardSubmission: "奖项提交",
    maintenanceSettings: "系统设置",
    maintenanceSystemStatus: "系统状态",
    maintenanceLogs: "系统日志",
    maintenanceBackup: "数据备份",
    maintenanceSchools: "学校管理",
    maintenanceSchoolTeachers: "学校教师",
    maintenanceStudents: "学生管理",
    maintenanceSemesters: "学期管理",
  };
  return titleMap[route.name] || "首页";
});

// 角色文本
const roleText = computed(() => {
  const roleMap = {
    admin: "管理员",
    teacher: "教师",
    student: "学生",
    maintenance: "维护人员",
  };
  return roleMap[authStore.userRole] || "";
});

// 获取用户信息
const fetchUserInfo = async () => {
  if (authStore.isLoggedIn && !authStore.userInfo) {
    try {
      const response = await authAPI.getUserInfo();
      if (response.status === 200) {
        authStore.updateUserInfo(response.data);
      } else {
        ElMessage.error("获取用户信息失败");
        authStore.logout();
        router.push("/");
      }
    } catch (error) {
      ElMessage.error("获取用户信息失败");
      authStore.logout();
      router.push("/");
    }
  }
};

// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === "logout") {
    try {
      await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });

      authStore.logout();
      ElMessage.success("已退出登录");
      router.push("/login");
    } catch {
      // 用户取消
    }
  } else if (command === "switch-to-teacher") {
    authStore.switchRole("teacher");
    ElMessage.success("已切换为教师视角");
    router.push("/teacher/grade-management");
  } else if (command === "switch-to-admin") {
    authStore.switchRole("admin");
    ElMessage.success("已切换回管理员视角");
    router.push("/admin/semesters");
  }
};

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.main-container {
  height: 100vh;
}

.el-aside {
  color: #fff;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  overflow: hidden;
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
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 15px;
  color: #333;
}
.collapse-btn:hover {
  color: #409eff;
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

.username {
  margin-left: 5px;
  margin-right: 5px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
