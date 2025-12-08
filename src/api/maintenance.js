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

  // 获取学校下的班级列表
  async getSchoolClasses(schoolId, params = {}) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/classes`,
      method: "get",
      params,
    });
  },

  // 获取学校下的教师列表
  async getSchoolTeachers(schoolId, params = {}) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/teachers`,
      method: "get",
      params,
    });
  },

  // 获取教师列表
  async getTeachers(params = {}) {
    return request({
      url: "/api/maintenance/teachers",
      method: "get",
      params,
    });
  },

  // 生成班级测试数据
  async generateClassGradeData(classId, semesterId) {
    return request({
      url: `/api/test/generate-class-grades`,
      method: "post",
      data: { semester_id: semesterId, class_id: classId },
    });
  },
};
