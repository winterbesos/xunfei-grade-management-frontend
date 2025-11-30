import request from "@/utils/request";

export const maintenanceAPI = {
  // 获取学生列表
  async getStudents(params = {}) {
    return request({
      url: "/api/maintenance/students",
      method: "get",
      params,
    });
  },

  async getSchools(params = {}) {
    return request({
      url: "/api/maintenance/schools",
      method: "get",
      params,
    });
  },

  async getMaintenanceSemesters() {
    return request({
      url: "/api/maintenance/semesters",
      method: "get",
    });
  },

  // 获取未注册学校
  async getUnregisteredSchool(school_id) {
    return request({
      url: `/api/maintenance/unregistered-schools/${school_id}`,
      method: "get",
    });
  },

  async syncSchoolData(school_id) {
    return request({
      url: `/api/schools/sync/${school_id}`,
      method: "post",
    });
  },

  // 创建新学校
  async createSchool(school) {
    return request({
      url: "/api/maintenance/schools",
      method: "post",
      data: school,
    });
  },

  // 更新学校信息
  async updateSchool(id, school) {
    return request({
      url: `/api/maintenance/schools/${id}`,
      method: "put",
      data: school,
    });
  },
};
