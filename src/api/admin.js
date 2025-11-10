import request from '@/utils/request'
import { mockAPI } from '@/utils/mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const adminAPI = {
  // 获取学期列表
  getSemesters() {
    if (USE_MOCK) {
      return mockAPI.getSemesters()
    }
    return request({
      url: '/admin/semesters',
      method: 'get'
    })
  },

  // 创建学期
  createSemester(data) {
    if (USE_MOCK) {
      return mockAPI.createSemester(data)
    }
    return request({
      url: '/admin/semesters',
      method: 'post',
      data
    })
  },

  // 更新学期
  updateSemester(id, data) {
    if (USE_MOCK) {
      return mockAPI.updateSemester(id, data)
    }
    return request({
      url: `/admin/semesters/${id}`,
      method: 'put',
      data
    })
  },

  // 删除学期
  deleteSemester(id) {
    return request({
      url: `/admin/semesters/${id}`,
      method: 'delete'
    })
  },

  // 获取课程列表
  getCourses() {
    if (USE_MOCK) {
      return mockAPI.getCourses()
    }
    return request({
      url: '/admin/courses',
      method: 'get'
    })
  }
}
