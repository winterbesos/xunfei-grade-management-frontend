import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/components/layout/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      // 管理员路由
      {
        path: "/admin/semesters",
        name: "AdminSemesters",
        component: () =>
          import("@/views/admin/SemesterManagementWithSchool.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },
      {
        path: "/admin/classes",
        name: "AdminClasses",
        component: () => import("@/views/admin/ClassManagement.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },
      {
        path: "/admin/classes/:id",
        name: "AdminClassDetail",
        component: () => import("@/views/admin/ClassDetail.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },
      {
        path: "/admin/settings",
        name: "AdminSettings",
        component: () => import("@/views/admin/SystemSettings.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },
      {
        path: "/admin/activities",
        name: "AdminActivities",
        component: () => import("@/views/admin/ActivityManagement.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },
      {
        path: "/admin/subjects",
        name: "AdminSubjects",
        component: () => import("@/views/admin/SubjectManagement.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },
      {
        path: "/admin/elective-subjects",
        name: "AdminElectiveSubjects",
        component: () => import("@/views/admin/ElectiveSubjectManagement.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },
      {
        path: "/admin/student/:studentId/grade-trend",
        name: "AdminStudentGradeTrend",
        component: () => import("@/views/common/GradeTrend.vue"),
        meta: { requiresAuth: true, roles: ["admin"] },
      },

      // 教师路由
      {
        path: "/teacher/grade-management",
        name: "TeacherGradeManagement",
        component: () => import("@/views/teacher/GradeManagement.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/grade-management/semesters",
        name: "TeacherGradeSemesters",
        component: () => import("@/views/teacher/GradeManagement.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/grade-management/classes/grades/:gradeCode/:semesterId/subject/:subjectCode",
        name: "TeacherGradeClasses",
        component: () => import("@/views/teacher/GradeClasses.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/grade-management/students/:semesterId/:classId/:subjectCode/:gradeCode",
        name: "TeacherGradeStudents",
        component: () => import("@/views/teacher/GradeStudents.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/grade-management/report/:semesterId",
        name: "TeacherGradeReport",
        component: () => import("@/views/common/Report.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/grade-management/proof",
        name: "TeacherGradeProof",
        component: () => import("@/views/common/ReportProof.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },

      // 班级管理
      {
        path: "/teacher/classes",
        name: "TeacherClasses",
        component: () => import("@/views/teacher/ClassManagement.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/classes/:classId/students",
        name: "TeacherClassStudents",
        component: () => import("@/views/teacher/ClassStudents.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/report-proof/:studentId",
        name: "TeacherReportProof",
        component: () => import("@/views/common/ReportProof.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/status-card/:studentId",
        name: "TeacherStatusCard",
        component: () => import("@/views/common/StatusCard.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/character-comments",
        name: "TeacherCharacterCommentsList",
        component: () => import("@/views/teacher/CharacterCommentsSemesterList.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/character-comments/:semesterId/classes",
        name: "TeacherCharacterCommentsClassList",
        component: () => import("@/views/teacher/CharacterCommentsClassList.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/classes/:semesterId/:classId/character-comments",
        name: "TeacherCharacterComments",
        component: () => import("@/views/teacher/CharacterComments.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/awards",
        name: "TeacherAwardReview",
        component: () => import("@/views/teacher/AwardReview.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },
      {
        path: "/teacher/student/:studentId/grade-trend",
        name: "TeacherStudentGradeTrend",
        component: () => import("@/views/common/GradeTrend.vue"),
        meta: { requiresAuth: true, roles: ["teacher"] },
      },

      // 学生路由
      {
        path: "/student/grades",
        name: "StudentGrades",
        component: () => import("@/views/student/GradeView.vue"),
        meta: { requiresAuth: true, roles: ["student"] },
      },
      {
        path: "/student/grade-trend",
        name: "StudentGradeTrend",
        component: () => import("@/views/common/GradeTrend.vue"),
        meta: { requiresAuth: true, roles: ["student"] },
      },
      {
        path: "/student/semesters",
        name: "StudentSemesters",
        component: () => import("@/views/student/SemesterList.vue"),
        meta: { requiresAuth: true, roles: ["student"] },
      },
      {
        path: "/student/semesters/:semesterId/report",
        name: "StudentSemesterReport",
        component: () => import("@/views/common/Report.vue"),
        meta: { requiresAuth: true, roles: ["student"] },
      },
      {
        path: "/student/awards",
        name: "StudentAwardSubmission",
        component: () => import("@/views/student/AwardSubmission.vue"),
        meta: { requiresAuth: true, roles: ["student"] },
      },

      // 维护人员路由
      {
        path: "/maintenance/system-status",
        name: "maintenanceSystemStatus",
        component: () => import("@/views/maintenance/SystemStatus.vue"),
        meta: { requiresAuth: true, roles: ["maintenance"] },
      },
      {
        path: "/maintenance/logs",
        name: "maintenanceLogs",
        component: () => import("@/views/maintenance/SystemLogs.vue"),
        meta: { requiresAuth: true, roles: ["maintenance"] },
      },
      {
        path: "/maintenance/backup",
        name: "maintenanceBackup",
        component: () => import("@/views/maintenance/DataBackup.vue"),
        meta: { requiresAuth: true, roles: ["maintenance"] },
      },
      {
        path: "/maintenance/schools",
        name: "maintenanceSchools",
        component: () => import("@/views/maintenance/SchoolManagement.vue"),
        meta: { requiresAuth: true, roles: ["maintenance"] },
      },
      {
        path: "/maintenance/schools/:schoolId/classes",
        name: "maintenanceSchoolClasses",
        component: () => import("@/views/maintenance/SchoolClasses.vue"),
        meta: { requiresAuth: true, roles: ["maintenance"] },
      },
      {
        path: "/maintenance/schools/:schoolId/teachers",
        name: "maintenanceSchoolTeachers",
        component: () => import("@/views/maintenance/SchoolTeachers.vue"),
        meta: { requiresAuth: true, roles: ["maintenance"] },
      },
      {
        path: "/maintenance/students",
        name: "maintenanceStudents",
        component: () => import("@/views/maintenance/StudentManagement.vue"),
        meta: { requiresAuth: true, roles: ["maintenance"] },
      },
      {
        path: "/maintenance/semesters",
        name: "maintenanceSemesters",
        component: () => import("@/views/maintenance/SemesterManagement.vue"),
        meta: { requiresAuth: true, roles: ["maintenance"] },
      },
    ],
  },
  {
    path: "/callback/university",
    name: "OAuthCallback",
    component: () => import("@/views/OAuthCallback.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/year-report/:studentId",
    name: "YearReport",
    component: () => import("@/views/common/YearReport.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: "Login", query: { redirect: to.fullPath } });
    return;
  }

  // 检查角色权限
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    // 根据用户角色重定向到相应的首页
    const redirectMap = {
      admin: "/admin/semesters",
      teacher: "/teacher/grade-management",
      student: "/student/grades",
      maintenance: "/maintenance/system-status",
    };
    next(redirectMap[authStore.userRole] || "/login");
    return;
  }

  // 如果已登录访问登录页，重定向到首页
  if (to.name === "Login" && authStore.isLoggedIn) {
    const redirectMap = {
      admin: "/admin/semesters",
      teacher: "/teacher/grade-management",
      student: "/student/grades",
      maintenance: "/maintenance/system-status",
    };
    next(redirectMap[authStore.userRole] || "/dashboard");
    return;
  }

  next();
});

export default router;
