<template>
  <div class="student-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>学生管理</h3>
          <div class="header-actions"></div>
        </div>
      </template>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学生姓名或ID"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="selectedSchool"
              placeholder="选择学校"
              clearable
              filterable
            >
              <el-option
                v-for="school in schools"
                :key="school.id"
                :label="school.name"
                :value="school.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="selectedClass"
              placeholder="选择班级"
              clearable
              filterable
              :disabled="!selectedSchool"
              @change="handleSearch"
            >
              <el-option
                v-for="classItem in filteredClasses"
                :key="classItem.id"
                :label="classItem.name"
                :value="classItem.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 学生列表 -->
      <el-table
        :data="filteredStudents"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column
          prop="user_id"
          label="学生ID"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="user_name" label="学生姓名" width="120" />
        <el-table-column label="学校信息" width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div>
              <div>{{ row.school_info.name }}</div>
              <div class="text-secondary">ID: {{ row.school_info.id }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="班级信息" width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div>
              <div>{{ row.class_info.name }}</div>
              <div class="text-secondary">ID: {{ row.class_info.id }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { maintenanceAPI } from "@/api/maintenance";

// 数据
const loading = ref(false);
const searchKeyword = ref("");
const selectedSchool = ref("");
const selectedClass = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const students = ref([]);
const classes = ref([]);

// 表单相关
const showAddDialog = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const studentFormRef = ref();

const studentForm = ref({
  id: null,
  name: "",
  studentId: "",
  email: "",
  phone: "",
  schoolId: "",
  classId: "",
  schoolName: "",
  className: "",
});

const studentRules = {
  name: [
    { required: true, message: "请输入学生姓名", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  studentId: [
    { required: true, message: "请输入学号", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  email: [{ type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号格式",
      trigger: "blur",
    },
  ],
  schoolId: [{ required: true, message: "请选择学校", trigger: "change" }],
  classId: [{ required: true, message: "请选择班级", trigger: "change" }],
};

// 计算属性
const schools = computed(() => {
  const schoolMap = {};
  students.value.forEach((student) => {
    if (student.school_info && !schoolMap[student.school_info.id]) {
      schoolMap[student.school_info.id] = student.school_info;
    }
  });
  return Object.values(schoolMap);
});

const filteredClasses = computed(() => {
  if (!selectedSchool.value) return [];

  const classMap = {};
  students.value.forEach((student) => {
    if (
      student.school_info &&
      student.school_info.id === selectedSchool.value
    ) {
      const classInfo = student.class_info;
      if (classInfo && !classMap[classInfo.id]) {
        classMap[classInfo.id] = classInfo;
      }
    }
  });
  return Object.values(classMap);
});

const filteredStudents = computed(() => {
  var result = students.value;
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (student) =>
        student.name.toLowerCase().includes(keyword) ||
        student.studentId.toLowerCase().includes(keyword),
    );
  }

  if (selectedSchool.value) {
    result = result.filter(
      (student) => student.school_info.id === selectedSchool.value,
    );
  }

  if (selectedClass.value) {
    result = result.filter(
      (student) => student.class_info.id === selectedClass.value,
    );
  }

  total.value = result.length;
  return result;
});

// 方法
const loadStudents = async () => {
  loading.value = true;
  maintenanceAPI
    .getStudents()
    .then((response) => {
      if (response.status === 200) {
        students.value = response.data.students;
        total.value = response.data.students.length;
      } else {
        ElMessage.error("加载学生列表失败");
      }
    })
    .catch((error) => {
      console.error("Error loading students:", error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const resetSearch = () => {
  searchKeyword.value = "";
  selectedSchool.value = "";
  selectedClass.value = "";
  loadStudents();
};

const deleteStudent = async (student) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 "${student.name}" 吗？`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    const index = students.value.findIndex((s) => s.id === student.id);
    if (index !== -1) {
      students.value.splice(index, 1);
      total.value--;
      ElMessage.success("学生删除成功");
    }
  } catch {
    // 用户取消
  }
};

const submitStudent = async () => {
  if (!studentFormRef.value) return;

  await studentFormRef.value.validate(async (valid) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const school = schools.value.find(
        (s) => s.id === studentForm.value.schoolId,
      );
      const classItem = classes.value.find(
        (c) => c.id === studentForm.value.classId,
      );

      const studentData = {
        ...studentForm.value,
        schoolName: school?.name || "",
        className: classItem?.name || "",
      };

      if (isEdit.value) {
        const index = students.value.findIndex((s) => s.id === studentData.id);
        if (index !== -1) {
          students.value[index] = studentData;
        }
        ElMessage.success("学生信息更新成功");
      } else {
        studentData.id = Date.now();
        studentData.createdAt = new Date().toLocaleString("zh-CN");
        students.value.unshift(studentData);
        total.value++;
        ElMessage.success("学生添加成功");
      }

      showAddDialog.value = false;
      resetForm();
      loadStudents();
    } catch (error) {
      ElMessage.error("操作失败");
    } finally {
      submitLoading.value = false;
    }
  });
};

const resetForm = () => {
  studentForm.value = {
    id: null,
    name: "",
    studentId: "",
    email: "",
    phone: "",
    schoolId: "",
    classId: "",
    schoolName: "",
    className: "",
  };
  isEdit.value = false;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  loadStudents();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadStudents();
};

onMounted(() => {
  loadStudents();
});
</script>

<style scoped>
.student-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.filter-section {
  margin-bottom: 20px;
}

.text-secondary {
  color: #909399;
  font-size: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
