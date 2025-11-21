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
  },
  {
    id: 4,
    username: 'maintenance',
    password: 'maintenance123',
    role: 'maintenance',
    name: '维护人员'
  }
]

export const mockSemesters = [
  {
    id: 1,
    name: '2024年春季学期',
    schoolId: 'school_001',
    schoolName: '清华大学',
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    status: 'active',
    remark: '春季学期正常进行'
  },
  {
    id: 2,
    name: '2024年秋季学期',
    schoolId: 'school_001',
    schoolName: '清华大学',
    startDate: '2024-09-01',
    endDate: '2025-01-31',
    status: 'upcoming',
    remark: '秋季学期准备中'
  },
  {
    id: 3,
    name: '2024年春季学期',
    schoolId: 'school_002',
    schoolName: '北京大学',
    startDate: '2024-02-15',
    endDate: '2024-07-15',
    status: 'active',
    remark: '北大春季学期'
  },
  {
    id: 4,
    name: '2023年秋季学期',
    schoolId: 'school_003',
    schoolName: '复旦大学',
    startDate: '2023-09-01',
    endDate: '2024-01-15',
    status: 'finished',
    remark: '已结束学期'
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

  // 获取学期列表（支持分页和筛选）
  async getSemesters(params = {}) {
    await delay()
    let semesters = [...mockSemesters]

    // 按学校筛选
    if (params.schoolId) {
      semesters = semesters.filter(s => s.schoolId === params.schoolId)
    }

    // 按学期名称搜索
    if (params.name) {
      semesters = semesters.filter(s =>
        s.name.toLowerCase().includes(params.name.toLowerCase())
      )
    }

    // 按状态筛选
    if (params.status) {
      semesters = semesters.filter(s => s.status === params.status)
    }

    // 分页处理
    const total = semesters.length
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      semesters = semesters.slice(start, end)
    }

    return {
      code: 200,
      data: {
        list: semesters,
        total: total
      }
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

  // 获取单个学期详情
  async getSemester(id) {
    await delay()
    const semester = mockSemesters.find(s => s.id === parseInt(id))
    if (semester) {
      return {
        code: 200,
        data: semester
      }
    }
    return {
      code: 404,
      message: '学期不存在'
    }
  },

  // 更新学期
  async updateSemester(id, semester) {
    await delay()
    const index = mockSemesters.findIndex(s => s.id === parseInt(id))
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

  // 删除学期
  async deleteSemester(id) {
    await delay()
    const index = mockSemesters.findIndex(s => s.id === parseInt(id))
    if (index !== -1) {
      mockSemesters.splice(index, 1)
      return {
        code: 200,
        message: '学期删除成功'
      }
    }
    return {
      code: 404,
      message: '学期不存在'
    }
  },

  // 维护人员专用：获取所有学期数据
  async getMaintanenceSemesters(params = {}) {
    await delay()
    let semesters = [...mockSemesters]

    // 添加维护人员需要的信息
    semesters = semesters.map(semester => ({
      ...semester,
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-15 14:30:00',
      createdBy: 'admin',
      updatedBy: 'system'
    }))

    // 按学校筛选
    if (params.schoolId) {
      semesters = semesters.filter(s => s.schoolId === params.schoolId)
    }

    // 按学期名称搜索
    if (params.name) {
      semesters = semesters.filter(s =>
        s.name.toLowerCase().includes(params.name.toLowerCase())
      )
    }

    // 按状态筛选
    if (params.status) {
      semesters = semesters.filter(s => s.status === params.status)
    }

    // 分页处理
    const total = semesters.length
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      semesters = semesters.slice(start, end)
    }

    return {
      code: 200,
      data: {
        list: semesters,
        total: total
      }
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
  },

  // 获取当前用户信息
  async getUserInfo() {
    await delay()
    // 模拟从token获取用户信息
    const token = localStorage.getItem('token') || ''
    const userId = token.split('_')[1] || '1'
    const user = mockUsers.find(u => u.id === parseInt(userId))

    if (user) {
      const { password, ...userInfo } = user
      return {
        code: 200,
        data: userInfo
      }
    }

    return {
      code: 401,
      message: '用户未登录'
    }
  },

  // 学校管理相关API - 模拟后端真实结构
  async getSchools(params = {}) {
    await delay()
    let schools = [
      {
        id: "school_001",
        schoolName: '清华大学',
        schoolCode: 'THU',
        is_enabled: true,
        created_at: '2024-01-15T10:30:00Z',
        admin_name: '张管理员',
        admin_email: 'admin@thu.edu.cn'
      },
      {
        id: "school_002",
        schoolName: '北京大学',
        schoolCode: 'PKU',
        is_enabled: true,
        created_at: '2024-01-16T09:15:00Z',
        admin_name: '李管理员',
        admin_email: 'admin@pku.edu.cn'
      },
      {
        id: "school_003",
        schoolName: '复旦大学',
        schoolCode: 'FDU',
        is_enabled: false,
        created_at: '2024-01-17T14:20:00Z',
        admin_name: '王管理员',
        admin_email: 'admin@fdu.edu.cn'
      }
    ]

    // 搜索过滤
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      schools = schools.filter(school =>
        school.schoolName.toLowerCase().includes(keyword) ||
        school.schoolCode.toLowerCase().includes(keyword) ||
        (school.admin_name && school.admin_name.toLowerCase().includes(keyword))
      )
    }

    if (params.status) {
      const enabled = params.status === 'active'
      schools = schools.filter(school => school.is_enabled === enabled)
    }

    // 分页
    const start = ((params.page || 1) - 1) * (params.limit || 10)
    const end = start + (params.limit || 10)
    const paginatedSchools = schools.slice(start, end)

    return {
      code: 200,
      data: {
        schools: paginatedSchools,
        total: schools.length
      }
    }
  },

  async createSchool(school) {
    await delay()
    const newSchool = {
      id: Date.now(),
      ...school,
      studentCount: 0,
      teacherCount: 0,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    return {
      code: 200,
      data: newSchool
    }
  },

  async updateSchool(id, school) {
    await delay()
    return {
      code: 200,
      data: { id, ...school }
    }
  },

  async deleteSchool(id) {
    await delay()
    return {
      code: 200,
      message: '学校删除成功'
    }
  },

  async getAvailableAdmins() {
    await delay()
    return {
      code: 200,
      data: [
        { id: 1, name: '张管理员', email: 'admin@thu.edu.cn' },
        { id: 2, name: '李管理员', email: 'admin@pku.edu.cn' },
        { id: 3, name: '王管理员', email: 'admin@fdu.edu.cn' },
        { id: 4, name: '赵管理员', email: 'admin@example.edu.cn' },
        { id: 5, name: '刘管理员', email: 'admin@test.edu.cn' }
      ]
    }
  },

  // OAuth 认证提交
  async submitOAuth(data) {
    await delay()
    console.log('OAuth submit data:', data)

    // 模拟成功响应
    return {
      code: 200,
      data: {
        access_token: `oauth_token_${Date.now()}`,
        token_type: 'bearer',
        expires_in: 2592000,
        user: {
          id: 1,
          username: 'oauth_user',
          role: 'student',
          name: 'OAuth用户'
        }
      }
    }
  },

  // 学生管理相关API
  async getStudents(params = {}) {
    await delay()
    let students = [
      {
        id: 1,
        name: '张三',
        studentId: '2024001',
        email: 'zhangsan@thu.edu.cn',
        phone: '13800138001',
        schoolId: 'school_001',
        schoolName: '清华大学',
        classId: 'class_001',
        className: '计算机科学1班',
        createdAt: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        name: '李四',
        studentId: '2024002',
        email: 'lisi@thu.edu.cn',
        phone: '13800138002',
        schoolId: 'school_001',
        schoolName: '清华大学',
        classId: 'class_002',
        className: '计算机科学2班',
        createdAt: '2024-01-16 09:15:00'
      },
      {
        id: 3,
        name: '王五',
        studentId: '2024003',
        email: 'wangwu@pku.edu.cn',
        phone: '13800138003',
        schoolId: 'school_002',
        schoolName: '北京大学',
        classId: 'class_003',
        className: '软件工程1班',
        createdAt: '2024-01-17 14:20:00'
      },
      {
        id: 4,
        name: '赵六',
        studentId: '2024004',
        email: 'zhaoliu@pku.edu.cn',
        phone: '13800138004',
        schoolId: 'school_002',
        schoolName: '北京大学',
        classId: 'class_004',
        className: '软件工程2班',
        createdAt: '2024-01-18 11:25:00'
      },
      {
        id: 5,
        name: '孙七',
        studentId: '2024005',
        email: 'sunqi@fdu.edu.cn',
        phone: '13800138005',
        schoolId: 'school_003',
        schoolName: '复旦大学',
        classId: 'class_005',
        className: '数学1班',
        createdAt: '2024-01-19 16:40:00'
      }
    ]

    // 应用筛选
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      students = students.filter(student =>
        student.name.toLowerCase().includes(keyword) ||
        student.studentId.toLowerCase().includes(keyword)
      )
    }

    if (params.schoolId) {
      students = students.filter(student => student.schoolId === params.schoolId)
    }

    if (params.classId) {
      students = students.filter(student => student.classId === params.classId)
    }

    // 分页
    const start = ((params.page || 1) - 1) * (params.limit || 10)
    const end = start + (params.limit || 10)
    const paginatedStudents = students.slice(start, end)

    return {
      code: 200,
      data: {
        students: paginatedStudents,
        total: students.length
      }
    }
  },

  async createStudent(student) {
    await delay()
    const newStudent = {
      id: Date.now(),
      ...student,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    return {
      code: 200,
      data: newStudent
    }
  },

  async updateStudent(id, student) {
    await delay()
    return {
      code: 200,
      data: { id, ...student }
    }
  },

  async deleteStudent(id) {
    await delay()
    return {
      code: 200,
      message: '学生删除成功'
    }
  }
}
