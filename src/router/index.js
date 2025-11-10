import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // 管理员路由
      {
        path: '/admin/settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/SystemSettings.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: '/admin/semesters',
        name: 'AdminSemesters',
        component: () => import('@/views/admin/SemesterManagement.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },

      // 教师路由
      {
        path: '/teacher/grades',
        name: 'TeacherGrades',
        component: () => import('@/views/teacher/GradeEntry.vue'),
        meta: { requiresAuth: true, roles: ['teacher'] }
      },

      // 学生路由
      {
        path: '/student/grades',
        name: 'StudentGrades',
        component: () => import('@/views/student/GradeView.vue'),
        meta: { requiresAuth: true, roles: ['student'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 检查角色权限
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    // 根据用户角色重定向到相应的首页
    const redirectMap = {
      admin: '/admin/settings',
      teacher: '/teacher/grades',
      student: '/student/grades'
    }
    next(redirectMap[authStore.userRole] || '/login')
    return
  }

  // 如果已登录访问登录页，重定向到首页
  if (to.name === 'Login' && authStore.isLoggedIn) {
    const redirectMap = {
      admin: '/admin/settings',
      teacher: '/teacher/grades',
      student: '/student/grades'
    }
    next(redirectMap[authStore.userRole] || '/dashboard')
    return
  }

  next()
})

export default router
