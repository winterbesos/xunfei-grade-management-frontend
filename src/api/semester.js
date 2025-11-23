import request from '@/utils/request'

export const semesterAPI = {
  // 获取学期列表（支持分页和筛选）
  getSemesters(params = {}) {
    return request({
      url: '/api/semesters',
      method: 'get',
      params
    })
  },

  // 获取单个学期详情
  getSemester(id) {
    return request({
      url: `/api/semesters/${id}`,
      method: 'get'
    })
  },

  // 创建学期
  createSemester(data) {
    return request({
      url: '/api/semesters',
      method: 'post',
      data
    })
  },

  // 更新学期
  updateSemester(id, data) {
    return request({
      url: `/api/semesters/${id}`,
      method: 'put',
      data
    })
  },

  // 删除学期
  deleteSemester(id) {
    return request({
      url: `/api/semesters/${id}`,
      method: 'delete'
    })
  },

  getMaintanenceSemesters() {
    return request({
      url: '/api/maintanence/semesters',
      method: 'get'
    })
  },

  toggleSemesterScore(semesterId) {
    return request({
      url: `/api/semesters/${semesterId}/toggle-events`,
      method: 'post'
    })
  },

  // 获取可打分的学期列表（教师专用）
  getAvailableSemesters(params) {
    return request({
      url: '/api/semesters/available',
      method: 'get',
      params
    })
  }
}
