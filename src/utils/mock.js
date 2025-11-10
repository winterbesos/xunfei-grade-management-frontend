// Mock 数据和模拟 API
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: '管理员'
  },
  {
    id: 2,
    username: 'teacher1',
    password: 'teacher123',
    role: 'teacher',
    name: '张老师'
  },
  {
    id: 3,
    username: 'student1',
    password: 'student123',
    role: 'student',
    name: '李明',
    studentId: '2024001'
  }
]

export const mockSemesters = [
  {
    id: 1,
    name: '2024年春季学期',
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    status: 'active'
  },
  {
    id: 2,
    name: '2024年秋季学期',
    startDate: '2024-09-01',
    endDate: '2025-01-31',
    status: 'active'
  }
]

export const mockCourses = [
  { id: 1, name: '高等数学', code: 'MATH101', credits: 4 },
  { id: 2, name: '大学英语', code: 'ENG101', credits: 3 },
  { id: 3, name: '计算机科学导论', code: 'CS101', credits: 3 },
  { id: 4, name: '数据结构', code: 'CS201', credits: 4 }
]

export const mockGrades = [
  {
    id: 1,
    studentId: 3,
    studentName: '李明',
    studentNumber: '2024001',
    courseId: 1,
    courseName: '高等数学',
    semesterId: 1,
    score: 85,
    teacherId: 2,
    teacherName: '张老师'
  },
  {
    id: 2,
    studentId: 3,
    studentName: '李明',
    studentNumber: '2024001',
    courseId: 2,
    courseName: '大学英语',
    semesterId: 1,
    score: 90,
    teacherId: 2,
    teacherName: '张老师'
  }
]

// Mock API 延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API 方法
export const mockAPI = {
  // 账号密码登录
  async loginByPassword(username, password) {
    await delay()
    const user = mockUsers.find(u => u.username === username && u.password === password)
    if (user) {
      const { password, ...userInfo } = user
      return {
        code: 200,
        data: {
          token: `mock_token_${user.id}_${Date.now()}`,
          userInfo
        }
      }
    }
    return {
      code: 401,
      message: '用户名或密码错误'
    }
  },

  // OAuth 登录（模拟）
  async loginByOAuth(provider, code) {
    await delay()
    // 模拟 OAuth 登录成功
    const user = mockUsers[0] // 默认返回管理员
    const { password, ...userInfo } = user
    return {
      code: 200,
      data: {
        token: `oauth_token_${user.id}_${Date.now()}`,
        userInfo
      }
    }
  },

  // 获取学期列表
  async getSemesters() {
    await delay()
    return {
      code: 200,
      data: mockSemesters
    }
  },

  // 创建学期
  async createSemester(semester) {
    await delay()
    const newSemester = {
      id: mockSemesters.length + 1,
      ...semester
    }
    mockSemesters.push(newSemester)
    return {
      code: 200,
      data: newSemester
    }
  },

  // 更新学期
  async updateSemester(id, semester) {
    await delay()
    const index = mockSemesters.findIndex(s => s.id === id)
    if (index !== -1) {
      mockSemesters[index] = { ...mockSemesters[index], ...semester }
      return {
        code: 200,
        data: mockSemesters[index]
      }
    }
    return {
      code: 404,
      message: '学期不存在'
    }
  },

  // 获取课程列表
  async getCourses() {
    await delay()
    return {
      code: 200,
      data: mockCourses
    }
  },

  // 获取成绩列表
  async getGrades(params) {
    await delay()
    let result = [...mockGrades]

    if (params.studentId) {
      result = result.filter(g => g.studentId === params.studentId)
    }
    if (params.semesterId) {
      result = result.filter(g => g.semesterId === params.semesterId)
    }
    if (params.courseId) {
      result = result.filter(g => g.courseId === params.courseId)
    }

    return {
      code: 200,
      data: result
    }
  },

  // 录入/更新成绩
  async saveGrade(grade) {
    await delay()
    const existingIndex = mockGrades.findIndex(
      g => g.studentId === grade.studentId &&
           g.courseId === grade.courseId &&
           g.semesterId === grade.semesterId
    )

    if (existingIndex !== -1) {
      mockGrades[existingIndex] = { ...mockGrades[existingIndex], ...grade }
      return {
        code: 200,
        data: mockGrades[existingIndex]
      }
    } else {
      const newGrade = {
        id: mockGrades.length + 1,
        ...grade
      }
      mockGrades.push(newGrade)
      return {
        code: 200,
        data: newGrade
      }
    }
  }
}
