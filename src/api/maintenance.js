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

  async getSchoolDetails(schoolId) {
    return request({
      url: `/api/maintenance/schools/${schoolId}`,
      method: "get",
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

  // 获取学校下的学生列表
  async getSchoolStudents(schoolId, params = {}) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/students`,
      method: "get",
      params,
    });
  },

  // 获取学校下的学期列表
  async getSchoolSemesters(schoolId) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/semesters`,
      method: "get",
    });
  },

  // 同步学期考试成绩
  async syncSemesterExamGrades(schoolId, semesterId, examId, examType) {
    return request({
      url: `/api/schools/${schoolId}/semesters/${semesterId}/sync-exam-grades`,
      method: "post",
      data: { exam_id: examId, type: examType },
    });
  },

  // 绑定学生短ID
  async bindStudentShortId(schoolId, studentId, shortId) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/students/${studentId}/short-id`,
      method: "post",
      data: { short_id: shortId },
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

  // 获取学校下的学科列表
  async getSchoolSubjects(schoolId) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/subjects`,
      method: "get",
    });
  },

  // 创建子学科 (Matching the provided backend route)
  async createSchoolSubject(schoolId, subjectData) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/students`,
      method: "post",
      data: subjectData,
    });
  },

  // 更新子学科 (Matching the provided backend route)
  async updateSchoolSubject(schoolId, subjectCode, subjectData) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/students/${subjectCode}`,
      method: "put",
      data: subjectData,
    });
  },

  // 获取学校下的选修课列表
  async getSchoolElectiveSubjects(schoolId, params = {}) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/elective-subjects`,
      method: "get",
      params,
    });
  },

  // 创建选修课
  async createSchoolElectiveSubject(schoolId, data) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/elective-subjects`,
      method: "post",
      data,
    });
  },

  // 更新选修课
  async updateSchoolElectiveSubject(schoolId, subjectId, data) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/elective-subjects/${subjectId}`,
      method: "put",
      data,
    });
  },

  // 删除选修课 (Standard REST, adding just in case needed)
  async deleteSchoolElectiveSubject(schoolId, subjectId) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/elective-subjects/${subjectId}`,
      method: "delete",
    });
  },

  // 获取选修课下的学生
  async getSchoolElectiveSubjectStudents(schoolId, subjectId) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/elective-subjects/${subjectId}/students`,
      method: "get",
    });
  },

  // 添加学生到选修课
  async addStudentToSchoolElectiveSubject(schoolId, subjectId, studentId) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/elective-subjects/${subjectId}/students`,
      method: "post",
      data: { student_id: studentId },
    });
  },

  // 从选修课移除学生
  async removeStudentFromSchoolElectiveSubject(schoolId, subjectId, studentId) {
    return request({
      url: `/api/maintenance/schools/${schoolId}/elective-subjects/${subjectId}/students/${studentId}`,
      method: "delete",
    });
  },
};
