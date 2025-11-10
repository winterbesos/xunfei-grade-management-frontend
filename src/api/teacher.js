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
  }
}
