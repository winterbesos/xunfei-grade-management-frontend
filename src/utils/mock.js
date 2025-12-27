// Mock 数据和模拟 API
export const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "管理员",
  },
  {
    id: 2,
    username: "teacher1",
    password: "teacher123",
    role: "teacher",
    name: "张老师",
  },
  {
    id: 3,
    username: "student1",
    password: "student123",
    role: "student",
    name: "李明",
    studentId: "2024001",
  },
  {
    id: 4,
    username: "maintenance",
    password: "maintenance123",
    role: "maintenance",
    name: "维护人员",
  },
];

export const mockSemesters = [
  {
    id: 1,
    name: "2024年春季学期",
    schoolId: "school_001",
    schoolName: "清华大学",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
    status: "active",
    canGrade: true,
    courseCount: 4,
    remark: "春季学期正常进行",
  },
  {
    id: 2,
    name: "2024年秋季学期",
    schoolId: "school_001",
    schoolName: "清华大学",
    startDate: "2024-09-01",
    endDate: "2025-01-31",
    status: "upcoming",
    canGrade: false,
    courseCount: 5,
    remark: "秋季学期准备中",
  },
  {
    id: 3,
    name: "2024年春季学期",
    schoolId: "school_002",
    schoolName: "北京大学",
    startDate: "2024-02-15",
    endDate: "2024-07-15",
    status: "active",
    canGrade: true,
    courseCount: 3,
    remark: "北大春季学期",
  },
  {
    id: 4,
    name: "2023年秋季学期",
    schoolId: "school_003",
    schoolName: "复旦大学",
    startDate: "2023-09-01",
    endDate: "2024-01-15",
    status: "finished",
    canGrade: false,
    courseCount: 4,
    remark: "已结束学期",
  },
];

export const mockCourses = [
  { id: 1, name: "高等数学", code: "MATH101", credits: 4 },
  { id: 2, name: "大学英语", code: "ENG101", credits: 3 },
  { id: 3, name: "计算机科学导论", code: "CS101", credits: 3 },
  { id: 4, name: "数据结构", code: "CS201", credits: 4 },
];

export const mockGrades = [
  {
    id: 1,
    studentId: 3,
    studentName: "李明",
    studentNumber: "2024001",
    courseId: 1,
    courseName: "高等数学",
    semesterId: 1,
    score: 85,
    teacherId: 2,
    teacherName: "张老师",
  },
  {
    id: 2,
    studentId: 3,
    studentName: "李明",
    studentNumber: "2024001",
    courseId: 2,
    courseName: "大学英语",
    semesterId: 1,
    score: 90,
    teacherId: 2,
    teacherName: "张老师",
  },
];

// Mock API 延迟
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API 方法
export const mockAPI = {
  // 账号密码登录
  async loginByPassword(username, password) {
    await delay();
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password,
    );
    if (user) {
      const { password, ...userInfo } = user;
      return {
        status: 200,
        data: {
          token: `mock_token_${user.id}_${Date.now()}`,
          userInfo,
        },
      };
    }
    return {
      status: 401,
      message: "用户名或密码错误",
    };
  },

  // OAuth 登录（模拟）
  async loginByOAuth(provider, code) {
    await delay();
    // 模拟 OAuth 登录成功
    const user = mockUsers[0]; // 默认返回管理员
    const { password, ...userInfo } = user;
    return {
      status: 200,
      data: {
        token: `oauth_token_${user.id}_${Date.now()}`,
        userInfo,
      },
    };
  },

  // 获取学期列表（支持分页和筛选）
  async getSemesters(params = {}) {
    await delay();
    let semesters = [...mockSemesters];

    // 按学校筛选
    if (params.schoolId) {
      semesters = semesters.filter((s) => s.schoolId === params.schoolId);
    }

    // 按学期名称搜索
    if (params.name) {
      semesters = semesters.filter((s) =>
        s.name.toLowerCase().includes(params.name.toLowerCase()),
      );
    }

    // 按状态筛选
    if (params.status) {
      semesters = semesters.filter((s) => s.status === params.status);
    }

    // 分页处理
    const total = semesters.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      semesters = semesters.slice(start, end);
    }

    return {
      status: 200,
      data: {
        list: semesters,
        total: total,
      },
    };
  },

  // 创建学期
  async createSemester(semester) {
    await delay();
    const newSemester = {
      id: mockSemesters.length + 1,
      ...semester,
    };
    mockSemesters.push(newSemester);
    return {
      status: 200,
      data: newSemester,
    };
  },

  // 获取单个学期详情
  async getSemester(id) {
    await delay();
    const semester = mockSemesters.find((s) => s.id === parseInt(id));
    if (semester) {
      return {
        status: 200,
        data: semester,
      };
    }
    return {
      status: 404,
      message: "学期不存在",
    };
  },

  // 更新学期
  async updateSemester(id, semester) {
    await delay();
    const index = mockSemesters.findIndex((s) => s.id === parseInt(id));
    if (index !== -1) {
      mockSemesters[index] = { ...mockSemesters[index], ...semester };
      return {
        status: 200,
        data: mockSemesters[index],
      };
    }
    return {
      status: 404,
      message: "学期不存在",
    };
  },

  // 删除学期
  async deleteSemester(id) {
    await delay();
    const index = mockSemesters.findIndex((s) => s.id === parseInt(id));
    if (index !== -1) {
      mockSemesters.splice(index, 1);
      return {
        status: 200,
        message: "学期删除成功",
      };
    }
    return {
      status: 404,
      message: "学期不存在",
    };
  },

  // 维护人员专用：获取所有学期数据
  async getMaintanenceSemesters(params = {}) {
    await delay();
    let semesters = [...mockSemesters];

    // 添加维护人员需要的信息
    semesters = semesters.map((semester) => ({
      ...semester,
      createdAt: "2024-01-01 10:00:00",
      updatedAt: "2024-01-15 14:30:00",
      createdBy: "admin",
      updatedBy: "system",
    }));

    // 按学校筛选
    if (params.schoolId) {
      semesters = semesters.filter((s) => s.schoolId === params.schoolId);
    }

    // 按学期名称搜索
    if (params.name) {
      semesters = semesters.filter((s) =>
        s.name.toLowerCase().includes(params.name.toLowerCase()),
      );
    }

    // 按状态筛选
    if (params.status) {
      semesters = semesters.filter((s) => s.status === params.status);
    }

    // 分页处理
    const total = semesters.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      semesters = semesters.slice(start, end);
    }

    return {
      status: 200,
      data: {
        list: semesters,
        total: total,
      },
    };
  },

  // 管理员专用：获取所有班级列表
  async getAdminClasses(params = {}) {
    await delay();
    let classes = [
      {
        id: "class_001",
        name: "计算机科学1班",
        major: "计算机科学",
        studentCount: 45,
        schoolId: "school_001",
        semesterId: 1,
      },
      {
        id: "class_002",
        name: "计算机科学2班",
        major: "计算机科学",
        studentCount: 42,
        schoolId: "school_001",
        semesterId: 1,
      },
      {
        id: "class_003",
        name: "软件工程1班",
        major: "软件工程",
        studentCount: 38,
        schoolId: "school_002",
        semesterId: 2,
      },
      {
        id: "class_004",
        name: "软件工程2班",
        major: "软件工程",
        studentCount: 40,
        schoolId: "school_002",
        semesterId: 2,
      },
      {
        id: "class_005",
        name: "数学1班",
        major: "数学",
        studentCount: 35,
        schoolId: "school_003",
        semesterId: 1,
      },
    ];

    // 按学校筛选
    if (params.schoolId) {
      classes = classes.filter((c) => c.schoolId === params.schoolId);
    }

    // 按班级名称搜索
    if (params.keyword) {
      classes = classes.filter((c) =>
        c.name.toLowerCase().includes(params.keyword.toLowerCase()),
      );
    }

    // 分页处理
    const total = classes.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      classes = classes.slice(start, end);
    }

    return {
      status: 200,
      data: {
        list: classes,
        total: total,
      },
    };
  },

  // 管理员专用：获取班级详情
  async getAdminClassDetail(id) {
    await delay();
    const classInfo = {
      id: id,
      name: "计算机科学1班",
      major: "计算机科学",
      studentCount: 45,
      schoolId: "school_001",
      semesterId: 1,
      description: "这是一个优秀的班级",
      createdAt: "2024-01-15",
    };

    // 模拟班级学生列表
    const students = [];
    for (let i = 1; i <= 45; i++) {
      students.push({
        id: i,
        studentId: `2024${String(i).padStart(3, "0")}`,
        name: `学生${i}`,
        gender: i % 2 === 0 ? "男" : "女",
        status: "在读",
      });
    }

    // 模拟科目老师列表
    const teachers = [
      { subject: ["语文", "历史"], name: "张老师", id: "t1" },
      { subject: ["数学"], name: "李老师", id: "t2" },
      { subject: ["英语"], name: "王老师", id: "t3" },
      { subject: ["物理"], name: "赵老师", id: "t4" },
      { subject: ["化学", "生物"], name: "钱老师", id: "t5" },
      { subject: ["生物"], name: "孙老师", id: "t6" },
    ];

    return {
      status: 200,
      data: {
        ...classInfo,
        students: students,
        teachers: teachers,
      },
    };
  },

  // 获取课程列表
  async getCourses() {
    await delay();
    return {
      status: 200,
      data: mockCourses,
    };
  },

  // 获取成绩列表
  async getGrades(params) {
    await delay();
    let result = [...mockGrades];

    if (params.studentId) {
      result = result.filter((g) => g.studentId === params.studentId);
    }
    if (params.semesterId) {
      result = result.filter((g) => g.semesterId === params.semesterId);
    }
    if (params.courseId) {
      result = result.filter((g) => g.courseId === params.courseId);
    }

    return {
      status: 200,
      data: result,
    };
  },

  // 录入/更新成绩
  async saveGrade(grade) {
    await delay();
    const existingIndex = mockGrades.findIndex(
      (g) =>
        g.studentId === grade.studentId &&
        g.courseId === grade.courseId &&
        g.semesterId === grade.semesterId,
    );

    if (existingIndex !== -1) {
      mockGrades[existingIndex] = { ...mockGrades[existingIndex], ...grade };
      return {
        status: 200,
        data: mockGrades[existingIndex],
      };
    } else {
      const newGrade = {
        id: mockGrades.length + 1,
        ...grade,
      };
      mockGrades.push(newGrade);
      return {
        status: 200,
        data: newGrade,
      };
    }
  },

  // 获取当前用户信息
  async getUserInfo() {
    await delay();
    // 模拟从token获取用户信息
    const token = localStorage.getItem("token") || "";
    const userId = token.split("_")[1] || "1";
    const user = mockUsers.find((u) => u.id === parseInt(userId));

    if (user) {
      const { password, ...userInfo } = user;
      return {
        status: 200,
        data: userInfo,
      };
    }

    return {
      status: 401,
      message: "用户未登录",
    };
  },

  // 教师专用：获取可打分的学期列表
  async getAvailableSemesters(params = {}) {
    await delay();
    let semesters = mockSemesters.filter(
      (s) => s.status === "active" && s.canGrade,
    );

    // 按学期名称搜索
    if (params.name) {
      semesters = semesters.filter((s) =>
        s.name.toLowerCase().includes(params.name.toLowerCase()),
      );
    }

    // 按状态筛选
    if (params.status) {
      semesters = semesters.filter((s) => s.status === params.status);
    }

    // 分页处理
    const total = semesters.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      semesters = semesters.slice(start, end);
    }

    return {
      status: 200,
      data: {
        list: semesters,
        total: total,
      },
    };
  },

  // 教师专用：根据学期获取班级列表
  async getClassesBySemester(params = {}) {
    await delay();

    // 模拟班级数据
    let classes = [
      {
        id: "class_001",
        name: "计算机科学1班",
        major: "计算机科学",
        studentCount: 45,
        gradedCount: 32,
        semesterId: params.semesterId,
        is_header: true,
      },
      {
        id: "class_002",
        name: "计算机科学2班",
        major: "计算机科学",
        studentCount: 42,
        gradedCount: 28,
        semesterId: params.semesterId,
        is_header: false,
      },
      {
        id: "class_003",
        name: "软件工程1班",
        major: "软件工程",
        studentCount: 38,
        gradedCount: 15,
        semesterId: params.semesterId,
        is_header: true,
      },
      {
        id: "class_004",
        name: "软件工程2班",
        major: "软件工程",
        studentCount: 40,
        gradedCount: 40,
        semesterId: params.semesterId,
        is_header: false,
      },
      {
        id: "class_005",
        name: "数学1班",
        major: "数学",
        studentCount: 35,
        gradedCount: 0,
        semesterId: params.semesterId,
        is_header: true,
      },
    ];

    // 按专业筛选
    if (params.major) {
      classes = classes.filter((c) => c.major === params.major);
    }

    // 按班级名称搜索
    if (params.className) {
      classes = classes.filter((c) =>
        c.name.toLowerCase().includes(params.className.toLowerCase()),
      );
    }

    // 按完成状态筛选
    if (params.completionStatus) {
      classes = classes.filter((c) => {
        const rate =
          c.studentCount > 0 ? (c.gradedCount / c.studentCount) * 100 : 0;
        switch (params.completionStatus) {
          case "completed":
            return rate === 100;
          case "inprogress":
            return rate > 0 && rate < 100;
          case "notstarted":
            return rate === 0;
          default:
            return true;
        }
      });
    }

    // 分页处理
    const total = classes.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      classes = classes.slice(start, end);
    }

    return {
      status: 200,
      data: {
        list: classes,
        total: total,
      },
    };
  },

  // 教师专用：根据班级获取学生列表
  async getStudentsByClass(params = {}) {
    await delay();

    // 模拟学生数据
    let students = [];
    for (let i = 1; i <= 50; i++) {
      students.push({
        id: i,
        studentId: `202400${String(i).padStart(3, "0")}`,
        name: `学生${i}`,
        gender: i % 2 === 0 ? "male" : "female",
        major: "计算机科学",
        score: Math.random() > 0.6 ? Math.round(Math.random() * 40 + 60) : null,
        comment: "",
        modified: false,
      });
    }

    // 分页处理
    const total = students.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      students = students.slice(start, end);
    }

    return {
      status: 200,
      data: {
        list: students,
        total: total,
      },
    };
  },

  // 教师专用：获取班级列表 (不区分学期)
  async getTeacherClasses(params = {}) {
    await delay();
    let classes = [
      {
        id: "class_001",
        name: "计算机科学1班",
        major: "计算机科学",
        studentCount: 45,
        gradedCount: 32,
        semesterId: 1, // Assign a default semester ID for mock consistency
        semesterName: "2024年春季学期",
      },
      {
        id: "class_002",
        name: "计算机科学2班",
        major: "计算机科学",
        studentCount: 42,
        gradedCount: 28,
        semesterId: 1,
        semesterName: "2024年春季学期",
      },
      {
        id: "class_003",
        name: "软件工程1班",
        major: "软件工程",
        studentCount: 38,
        gradedCount: 15,
        semesterId: 2, // Different semester
        semesterName: "2024年秋季学期",
      },
      {
        id: "class_004",
        name: "软件工程2班",
        major: "软件工程",
        studentCount: 40,
        gradedCount: 40,
        semesterId: 2,
        semesterName: "2024年秋季学期",
      },
      {
        id: "class_005",
        name: "数学1班",
        major: "数学",
        studentCount: 35,
        gradedCount: 0,
        semesterId: 1,
        semesterName: "2024年春季学期",
      },
    ];

    // Apply filtering and pagination if needed (similar to getClassesBySemester)
    // For simplicity, returning all mock classes for now.
    const total = classes.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      classes = classes.slice(start, end);
    }

    return {
      status: 200,
      data: {
        list: classes,
        total: total,
      },
    };
  },

  // 教师专用：保存单个学生成绩
  async saveStudentGrade(data) {
    await delay();
    console.log("保存单个学生成绩:", data);
    return {
      status: 200,
      data: data,
      message: "成绩保存成功",
    };
  },

  // 教师专用：批量保存学生成绩
  async batchSaveGrades(data) {
    await delay();
    console.log("批量保存学生成绩:", data);
    return {
      status: 200,
      data: data,
      message: "批量保存成功",
    };
  },

  // 学生专用：提交奖项
  async submitAward(data) {
    await delay();
    console.log("提交奖项:", data);
    return {
      status: 200,
      message: "提交成功",
    };
  },

  // 学生专用：更新奖项
  async updateAward(id, data) {
    await delay();
    console.log("更新奖项:", id, data);
    return {
      status: 200,
      message: "更新成功",
    };
  },

  // 学生专用：获取我的奖项
  async getStudentAwards() {
    await delay();
    return {
      status: 200,
      data: [
        {
          id: 1,
          name: "三好学生",
          content: "表现优异",
          approval_teacher_id: 2,
          approval_teacher_name: "张老师",
          awarded_at: "2023-12-01",
          status: "pending",
        },
        {
          id: 2,
          name: "优秀班干部",
          content: "管理能力强",
          approval_teacher_id: 2,
          approval_teacher_name: "张老师",
          awarded_at: "2023-06-15",
          status: "approved",
        },
      ],
    };
  },

  // 获取所有教师列表 (用于下拉选择)
  async getAllTeachers() {
    await delay();
    return {
      status: 200,
      data: [
        { id: 2, name: "张老师" },
        { id: 5, name: "李老师" },
        { id: 6, name: "王老师" },
      ],
    };
  },

  // 教师专用：获取奖项审核列表
  async getTeacherAwards(params = {}) {
    await delay();
    return {
      status: 200,
      data: [
        {
          id: 1,
          studentName: "李明",
          name: "三好学生",
          content: "表现优异",
          awarded_at: "2023-12-01",
          status: "pending",
        },
        {
          id: 3,
          studentName: "王小红",
          name: "科技创新奖",
          content: "获得市级一等奖",
          awarded_at: "2023-11-15",
          status: "pending",
        },
        {
          id: 2,
          studentName: "张三",
          name: "优秀班干部",
          content: "管理能力强",
          awarded_at: "2023-06-15",
          status: "approved",
        },
      ],
    };
  },

  // 教师专用：审核奖项
  async reviewAward(id, status, comment) {
    await delay();
    console.log("审核奖项:", id, status, comment);
    return {
      status: 200,
      message: "审核完成",
    };
  },

  // 学校管理相关API - 模拟后端真实结构
  async getSchools(params = {}) {
    await delay();
    let schools = [
      {
        id: "school_001",
        schoolName: "清华大学",
        schoolCode: "THU",
        is_enabled: true,
        created_at: "2024-01-15T10:30:00Z",
        admin_name: "张管理员",
        admin_email: "admin@thu.edu.cn",
      },
      {
        id: "school_002",
        schoolName: "北京大学",
        schoolCode: "PKU",
        is_enabled: true,
        created_at: "2024-01-16T09:15:00Z",
        admin_name: "李管理员",
        admin_email: "admin@pku.edu.cn",
      },
      {
        id: "school_003",
        schoolName: "复旦大学",
        schoolCode: "FDU",
        is_enabled: false,
        created_at: "2024-01-17T14:20:00Z",
        admin_name: "王管理员",
        admin_email: "admin@fdu.edu.cn",
      },
    ];

    // 搜索过滤
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      schools = schools.filter(
        (school) =>
          school.schoolName.toLowerCase().includes(keyword) ||
          school.schoolCode.toLowerCase().includes(keyword) ||
          (school.admin_name &&
            school.admin_name.toLowerCase().includes(keyword)),
      );
    }

    if (params.status) {
      const enabled = params.status === "active";
      schools = schools.filter((school) => school.is_enabled === enabled);
    }

    // 分页
    const start = ((params.page || 1) - 1) * (params.limit || 10);
    const end = start + (params.limit || 10);
    const paginatedSchools = schools.slice(start, end);

    return {
      status: 200,
      data: {
        schools: paginatedSchools,
        total: schools.length,
      },
    };
  },

  async createSchool(school) {
    await delay();
    const newSchool = {
      id: Date.now(),
      ...school,
      studentCount: 0,
      teacherCount: 0,
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    return {
      status: 200,
      data: newSchool,
    };
  },

  async updateSchool(id, school) {
    await delay();
    return {
      status: 200,
      data: { id, ...school },
    };
  },

  async deleteSchool(id) {
    await delay();
    return {
      status: 200,
      message: "学校删除成功",
    };
  },

  async getAvailableAdmins() {
    await delay();
    return {
      status: 200,
      data: [
        { id: 1, name: "张管理员", email: "admin@thu.edu.cn" },
        { id: 2, name: "李管理员", email: "admin@pku.edu.cn" },
        { id: 3, name: "王管理员", email: "admin@fdu.edu.cn" },
        { id: 4, name: "赵管理员", email: "admin@example.edu.cn" },
        { id: 5, name: "刘管理员", email: "admin@test.edu.cn" },
      ],
    };
  },

  // OAuth 认证提交
  async submitOAuth(data) {
    await delay();
    console.log("OAuth submit data:", data);

    // 模拟成功响应
    return {
      status: 200,
      data: {
        access_token: `oauth_token_${Date.now()}`,
        token_type: "bearer",
        expires_in: 2592000,
        user: {
          id: 1,
          username: "oauth_user",
          role: "student",
          name: "OAuth用户",
        },
      },
    };
  },

  // 学生管理相关API
  async getStudents(params = {}) {
    await delay();
    let students = [
      {
        id: 1,
        name: "张三",
        studentId: "2024001",
        email: "zhangsan@thu.edu.cn",
        phone: "13800138001",
        schoolId: "school_001",
        schoolName: "清华大学",
        classId: "class_001",
        className: "计算机科学1班",
        createdAt: "2024-01-15 10:30:00",
      },
      {
        id: 2,
        name: "李四",
        studentId: "2024002",
        email: "lisi@thu.edu.cn",
        phone: "13800138002",
        schoolId: "school_001",
        schoolName: "清华大学",
        classId: "class_002",
        className: "计算机科学2班",
        createdAt: "2024-01-16 09:15:00",
      },
      {
        id: 3,
        name: "王五",
        studentId: "2024003",
        email: "wangwu@pku.edu.cn",
        phone: "13800138003",
        schoolId: "school_002",
        schoolName: "北京大学",
        classId: "class_003",
        className: "软件工程1班",
        createdAt: "2024-01-17 14:20:00",
      },
      {
        id: 4,
        name: "赵六",
        studentId: "2024004",
        email: "zhaoliu@pku.edu.cn",
        phone: "13800138004",
        schoolId: "school_002",
        schoolName: "北京大学",
        classId: "class_004",
        className: "软件工程2班",
        createdAt: "2024-01-18 11:25:00",
      },
      {
        id: 5,
        name: "孙七",
        studentId: "2024005",
        email: "sunqi@fdu.edu.cn",
        phone: "13800138005",
        schoolId: "school_003",
        schoolName: "复旦大学",
        classId: "class_005",
        className: "数学1班",
        createdAt: "2024-01-19 16:40:00",
      },
    ];

    // 应用筛选
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      students = students.filter(
        (student) =>
          student.name.toLowerCase().includes(keyword) ||
          student.studentId.toLowerCase().includes(keyword),
      );
    }

    if (params.schoolId) {
      students = students.filter(
        (student) => student.schoolId === params.schoolId,
      );
    }

    if (params.classId) {
      students = students.filter(
        (student) => student.classId === params.classId,
      );
    }

    // 分页
    const start = ((params.page || 1) - 1) * (params.limit || 10);
    const end = start + (params.limit || 10);
    const paginatedStudents = students.slice(start, end);

    return {
      status: 200,
      data: {
        students: paginatedStudents,
        total: students.length,
      },
    };
  },

  // 教师专用：根据班级获取学生列表
  // Added getTeacherClasses to mock for previous task
  async getTeacherClasses(params = {}) {
    await delay();
    let classes = [
      {
        id: "class_001",
        name: "计算机科学1班",
        major: "计算机科学",
        studentCount: 45,
        gradedCount: 32,
        semesterId: 1, // Assign a default semester ID for mock consistency
        semesterName: "2024年春季学期",
      },
      {
        id: "class_002",
        name: "计算机科学2班",
        major: "计算机科学",
        studentCount: 42,
        gradedCount: 28,
        semesterId: 1,
        semesterName: "2024年春季学期",
      },
      {
        id: "class_003",
        name: "软件工程1班",
        major: "软件工程",
        studentCount: 38,
        gradedCount: 15,
        semesterId: 2, // Different semester
        semesterName: "2024年秋季学期",
      },
      {
        id: "class_004",
        name: "软件工程2班",
        major: "软件工程",
        studentCount: 40,
        gradedCount: 40,
        semesterId: 2,
        semesterName: "2024年秋季学期",
      },
      {
        id: "class_005",
        name: "数学1班",
        major: "数学",
        studentCount: 35,
        gradedCount: 0,
        semesterId: 1,
        semesterName: "2024年春季学期",
      },
    ];

    // Apply filtering and pagination if needed (similar to getClassesBySemester)
    // For simplicity, returning all mock classes for now.
    const total = classes.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      classes = classes.slice(start, end);
    }

    return {
      status: 200,

      data: {
        list: classes,

        total: total,
      },
    };
  },

  // 获取学生平时成绩
  async getStudentDailyScores(studentId, semesterId, subjectCode) {
    await delay();
    return {
      status: 200,
      data: [
        { exam_name: "课堂测验1", score: 85, date: "2024-03-10" },
        { exam_name: "期中模拟", score: 78, date: "2024-04-15" },
        { exam_name: "小组作业", score: 92, date: "2024-05-20" },
      ],
    };
  },

  // 获取成绩趋势
  async getGradeTrend(studentId) {
    await delay();

    // 生成扁平化的 SemesterGradeItem 列表
    const dataList = [
      // 2022年秋季 (202202)
      {
        semester_id: "202202",
        semester_name: "2022年秋季",
        subject_name: "高等数学",
        score: "82",
      },
      {
        semester_id: "202202",
        semester_name: "2022年秋季",
        subject_name: "大学英语",
        score: "75",
      },
      {
        semester_id: "202202",
        semester_name: "2022年秋季",
        subject_name: "计算机科学导论",
        score: "88",
      },

      // 2023年春季 (202301)
      {
        semester_id: "202301",
        semester_name: "2023年春季",
        subject_name: "高等数学",
        score: "85",
      },
      {
        semester_id: "202301",
        semester_name: "2023年春季",
        subject_name: "大学英语",
        score: "78",
      },
      {
        semester_id: "202301",
        semester_name: "2023年春季",
        subject_name: "计算机科学导论",
        score: "90",
      },
      {
        semester_id: "202301",
        semester_name: "2023年春季",
        subject_name: "数据结构",
        score: "80",
      },

      // 2023年秋季 (202302)
      {
        semester_id: "202302",
        semester_name: "2023年秋季",
        subject_name: "高等数学",
        score: "88",
      },
      {
        semester_id: "202302",
        semester_name: "2023年秋季",
        subject_name: "大学英语",
        score: "80",
      },
      {
        semester_id: "202302",
        semester_name: "2023年秋季",
        subject_name: "计算机科学导论",
        score: "92",
      },
      {
        semester_id: "202302",
        semester_name: "2023年秋季",
        subject_name: "数据结构",
        score: "85",
      },
      {
        semester_id: "202302",
        semester_name: "2023年秋季",
        subject_name: "操作系统",
        score: "78",
      },

      // 2024年春季 (202401)
      {
        semester_id: "202401",
        semester_name: "2024年春季",
        subject_name: "高等数学",
        score: "90",
      },
      {
        semester_id: "202401",
        semester_name: "2024年春季",
        subject_name: "大学英语",
        score: "82",
      },
      {
        semester_id: "202401",
        semester_name: "2024年春季",
        subject_name: "计算机科学导论",
        score: "95",
      },
      {
        semester_id: "202401",
        semester_name: "2024年春季",
        subject_name: "数据结构",
        score: "88",
      },
      {
        semester_id: "202401",
        semester_name: "2024年春季",
        subject_name: "操作系统",
        score: "82",
      },
      {
        semester_id: "202401",
        semester_name: "2024年春季",
        subject_name: "计算机网络",
        score: "80",
      },

      // 2024年秋季 (202402)
      {
        semester_id: "202402",
        semester_name: "2024年秋季",
        subject_name: "高等数学",
        score: "88",
      },
      {
        semester_id: "202402",
        semester_name: "2024年秋季",
        subject_name: "大学英语",
        score: "85",
      },
      {
        semester_id: "202402",
        semester_name: "2024年秋季",
        subject_name: "计算机科学导论",
        score: "93",
      },
      {
        semester_id: "202402",
        semester_name: "2024年秋季",
        subject_name: "数据结构",
        score: "90",
      },
      {
        semester_id: "202402",
        semester_name: "2024年秋季",
        subject_name: "操作系统",
        score: "85",
      },
      {
        semester_id: "202402",
        semester_name: "2024年秋季",
        subject_name: "计算机网络",
        score: "84",
      },
    ];

    return {
      status: 200,
      data: dataList,
    };
  },
};
