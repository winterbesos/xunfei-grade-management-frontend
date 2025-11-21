import request from '@/utils/request'
import { mockAPI } from '@/utils/mock'

// 是否使用 Mock 数据
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const schoolAPI = {
  // 获取学校列表
  async getSchools(params = {}) {
    if (USE_MOCK) {
      return mockAPI.getSchools(params)
    }
    return request({
      url: '/api/schools',
      method: 'get',
      params
    })
  },

  // 创建新学校
  async createSchool(school) {
    if (USE_MOCK) {
      return mockAPI.createSchool(school)
    }
    return request({
      url: '/api/schools',
      method: 'post',
      data: school
    })
  },

  // 更新学校信息
  async updateSchool(id, school) {
    if (USE_MOCK) {
      return mockAPI.updateSchool(id, school)
    }
    return request({
      url: `/api/schools/${id}`,
      method: 'put',
      data: school
    })
  },

  // 删除学校
  async deleteSchool(id) {
    if (USE_MOCK) {
      return mockAPI.deleteSchool(id)
    }
    return request({
      url: `/api/schools/${id}`,
      method: 'delete'
    })
  },

  // 获取可用的管理员列表
  async getAvailableAdmins() {
    if (USE_MOCK) {
      return mockAPI.getAvailableAdmins()
    }
    return request({
      url: '/api/admin-users',
      method: 'get'
    })
  },

  // 获取未注册学校
  async getUnregisteredSchool(school_id) {
    return request({
      url: `/api/unregistered-schools/${school_id}`,
      method: 'get'
    })
  },

  async syncSchoolData(school_id) {
    return request({
      url: `/api/schools/sync/${school_id}`,
      method: 'post'
    })
  }
}
