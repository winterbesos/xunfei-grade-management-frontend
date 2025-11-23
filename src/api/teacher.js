import request from '@/utils/request'
import { mockAPI } from '@/utils/mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const teacherAPI = {
  // 获取成绩列表
  getGrades(params) {
    if (USE_MOCK) {
      return mockAPI.getGrades(params)
    }
    return request({
      url: '/teacher/grades',
      method: 'get',
      params
    })
  },

  // 录入/更新成绩
  saveGrade(data) {
    if (USE_MOCK) {
      return mockAPI.saveGrade(data)
    }
    return request({
      url: '/teacher/grades',
      method: 'post',
      data
    })
  },

  // 批量导入成绩
  importGrades(data) {
    return request({
      url: '/teacher/grades/import',
      method: 'post',
      data
    })
  },

  // 获取课程列表
  getCourses() {
    if (USE_MOCK) {
      return mockAPI.getCourses()
    }
    return request({
      url: '/teacher/courses',
      method: 'get'
    })
  },

  // 获取教师可打分的学期列表
  getAvailableSemesters(params) {
    return request({
      url: '/api/teacher/semesters',
      method: 'get',
      params
    })
  },

  getClassesBySemester(semesterId) {
    return request({
      url: `/api/teacher/semesters/${semesterId}/classes`,
      method: 'get',
    })
  },

  // 根据班级获取学生列表（包含成绩信息）
  getStudentsByClass(classId) {
    return request({
      url: `/api/teacher/classes/${classId}/students`,
      method: 'get',
    })
  },

  // 保存单个学生成绩
  saveStudentGrade(data) {
    if (USE_MOCK) {
      return mockAPI.saveStudentGrade(data)
    }
    return request({
      url: '/teacher/grades/single',
      method: 'post',
      data
    })
  },

  // 批量保存学生成绩
  batchSaveGrades(data) {
    if (USE_MOCK) {
      return mockAPI.batchSaveGrades(data)
    }
    return request({
      url: '/teacher/grades/batch',
      method: 'post',
      data
    })
  }
}
