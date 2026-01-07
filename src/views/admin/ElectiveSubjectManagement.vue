<template>
  <div class="elective-subject-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>选修课管理</h3>
          <div class="header-actions">
            <el-select
              v-model="selectedSemester"
              placeholder="请选择学期"
              style="width: 200px; margin-right: 10px"
              @change="loadSubjects"
            >
              <el-option
                v-for="item in semesters"
                :key="item.id"
                :label="item.academic_year_name + item.term_name"
                :value="item.semester_id"
              />
            </el-select>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索课程名称/教师"
              style="width: 200px; margin-right: 10px"
              clearable
              :prefix-icon="Search"
            />
          </div>
        </div>
      </template>

      <!-- 选修课列表 -->

      <el-table
        :data="filteredElectiveSubjects"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="name" label="课程名称" min-width="180" />
        <el-table-column prop="semester_name" label="学期" width="200" />
        <el-table-column prop="teacher_name" label="任课教师" width="100" />
        <el-table-column label="学时" width="80" align="center">
          <template #default="{ row }">
            {{
              row.hours !== null && row.hours !== undefined ? row.hours : "—"
            }}
          </template>
        </el-table-column>
        <el-table-column label="学习" width="70" align="center">
          <template #default="{ row }">
            {{ row.abilities?.study_ability || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="逻辑" width="70" align="center">
          <template #default="{ row }">
            {{ row.abilities?.logical_thinking || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="创新" width="70" align="center">
          <template #default="{ row }">
            {{ row.abilities?.creativity || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="团队" width="70" align="center">
          <template #default="{ row }">
            {{ row.abilities?.teamwork || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="责任" width="70" align="center">
          <template #default="{ row }">
            {{ row.abilities?.responsibility || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="warning"
              @click="openStudentDialog(row)"
            >
              学生管理
            </el-button>
            <el-button size="small" type="primary" @click="editSubject(row)">
              编辑
            </el-button>
            <!--
            <el-button
              size="small"
              :type="row.enabled ? 'danger' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.enabled ? "禁用" : "启用" }}
            </el-button>
            -->
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑选修课对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑选修课' : '添加选修课'"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="subjectFormRef"
        :model="subjectForm"
        :rules="subjectRules"
        label-width="100px"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input
            v-model="subjectForm.name"
            disabled
            placeholder="请输入课程名称"
          />
        </el-form-item>
        <el-form-item label="学期" prop="semester_id">
          <el-select
            v-model="subjectForm.semester_id"
            :disabled="isEdit"
            placeholder="请选择学期"
          >
            <el-option
              v-for="item in semesters"
              :key="item.id"
              :label="item.academic_year_name + item.term_name"
              :value="item.semester_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任课教师" prop="teacher_id">
          <el-select
            v-model="subjectForm.teacher_id"
            disabled
            filterable
            remote
            reserve-keyword
            placeholder="请输入教师姓名搜索"
            :remote-method="searchTeachers"
            :loading="teacherLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in teacherList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学时" prop="hours">
          <el-input-number
            v-model="subjectForm.hours"
            :min="0"
            :step="1"
            :precision="0"
            controls-position="right"
            style="width: 100%"
            placeholder="可选"
          />
        </el-form-item>

        <el-divider content-position="left">能力评分标准</el-divider>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="学习能力">
              <el-input-number
                v-model="subjectForm.study_ability"
                :min="0"
                :max="10"
                :step="1"
                :precision="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="思维逻辑">
              <el-input-number
                v-model="subjectForm.logical_thinking"
                :min="0"
                :max="10"
                :step="1"
                :precision="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创新创造">
              <el-input-number
                v-model="subjectForm.creativity"
                :min="0"
                :max="10"
                :step="1"
                :precision="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="团队协作">
              <el-input-number
                v-model="subjectForm.teamwork"
                :min="0"
                :max="10"
                :step="1"
                :precision="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任心">
              <el-input-number
                v-model="subjectForm.responsibility"
                :min="0"
                :max="10"
                :step="1"
                :precision="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitSubject"
            :loading="submitLoading"
          >
            {{ isEdit ? "更新" : "添加" }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 学生管理对话框 -->
    <el-dialog
      v-model="showStudentDialog"
      :title="'学生管理 - ' + currentSubjectName"
      width="800px"
      @close="resetStudentDialog"
    >
      <div class="student-dialog-content">
        <!-- 添加学生区域 -->
        <!--
        <div class="add-student-section">
          <el-select
            v-model="addStudentId"
            filterable
            remote
            reserve-keyword
            placeholder="搜索学生姓名"
            :remote-method="searchStudents"
            :loading="searchStudentLoading"
            style="width: 300px; margin-right: 10px"
          >
            <el-option
              v-for="item in searchStudentList"
              :key="item.id"
              :label="item.name + ' (' + item.year_name + item.class_name + ')'"
              :value="item.id"
            />
          </el-select>

          <el-button
            type="primary"
            @click="handleAddStudent"
            :disabled="!addStudentId"
          >
            <el-icon><Plus /></el-icon>
            添加学生
          </el-button>

          <el-button type="success" @click="handleExportStudents">
            导出
          </el-button>
          <el-button type="warning" @click="triggerImport"> 导入 </el-button>
          <input
            type="file"
            ref="fileInputRef"
            style="display: none"
            accept=".xlsx,.xls"
            @change="handleImportStudents"
          />
        </div>
          -->

        <!-- 学生列表 -->
        <el-table
          :data="subjectStudents"
          style="width: 100%; margin-top: 20px"
          v-loading="studentLoading"
          border
        >
          <!--
          <el-table-column
            prop="student_id"
            label="学号"
            width="150"
            show-overflow-tooltip
          />
          -->
          <el-table-column prop="student_name" label="姓名" width="120" />
          <el-table-column prop="class_name" label="班级" min-width="150">
            <template #default="{ row }">
              <span>{{ row.year_name }} {{ row.class_name }}</span>
            </template>
          </el-table-column>
          <!--
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="danger"
                @click="handleRemoveStudent(row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
          -->
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { adminAPI } from "@/api/admin";
import * as XLSX from "xlsx";

// 数据
const loading = ref(false);
const searchKeyword = ref("");
const allElectiveSubjects = ref([]);

// 教师搜索相关
const allTeachers = ref([]);
const teacherList = ref([]);
const teacherLoading = ref(false);
const semesters = ref([]);
const selectedSemester = ref("");

// 学生管理相关
const showStudentDialog = ref(false);
const currentSubjectName = ref("");
const currentSubjectId = ref(null);
const subjectStudents = ref([]);
const studentLoading = ref(false);
const addStudentId = ref("");
const searchStudentList = ref([]);
const searchStudentLoading = ref(false);

// 表单相关
const showAddDialog = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const subjectFormRef = ref();

const subjectForm = reactive({
  id: null,
  name: "",
  teacher_id: "",
  semester_id: "",
  enabled: true,
  hours: null,
  study_ability: 0,
  logical_thinking: 0,
  creativity: 0,
  teamwork: 0,
  responsibility: 0,
});

const subjectRules = {
  name: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  teacher_id: [{ required: true, message: "请输入教师ID", trigger: "blur" }],
  semester_id: [{ required: true, message: "请选择学期", trigger: "change" }],
};

// 计算属性
const filteredElectiveSubjects = computed(() => {
  if (!searchKeyword.value) {
    return allElectiveSubjects.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return allElectiveSubjects.value.filter(
    (subject) =>
      subject.name.toLowerCase().includes(keyword) ||
      (subject.teacher_name &&
        subject.teacher_name.toLowerCase().includes(keyword)),
  );
});

// 方法
const loadSemesters = async () => {
  try {
    const response = await adminAPI.getSemesters();
    if (response.status === 200) {
      semesters.value = response.data;
      if (semesters.value.length > 0) {
        selectedSemester.value = semesters.value[0].semester_id;
        loadSubjects();
      }
    }
  } catch (error) {
    console.error("Failed to load semesters:", error);
  }
};

const loadSubjects = async () => {
  if (!selectedSemester.value) return;

  loading.value = true;
  try {
    const response = await adminAPI.getElectiveSubjects({
      semester_id: selectedSemester.value,
    });
    if (response.status === 200) {
      allElectiveSubjects.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load elective subjects:", error);
    ElMessage.error("获取选修课列表失败");
  } finally {
    loading.value = false;
  }
};

const loadAllTeachers = async () => {
  try {
    // 获取所有教师，假设 limit 足够大
    const response = await adminAPI.getTeachers({ limit: 1000 });
    if (response.status === 200) {
      const teachers = response.data.items || response.data || [];
      allTeachers.value = teachers.map((t) => ({
        id: t.user_id || t.id,
        name: t.name || t.user_name || t.teacher_name,
      }));
      teacherList.value = allTeachers.value;
    }
  } catch (error) {
    console.error("Failed to load teachers:", error);
  }
};

const handleSearch = () => {
  loadSubjects();
};

const searchTeachers = (query) => {
  if (query) {
    teacherLoading.value = true;
    setTimeout(() => {
      teacherList.value = allTeachers.value.filter((item) => {
        return item.name.toLowerCase().includes(query.toLowerCase());
      });
      teacherLoading.value = false;
    }, 200);
  } else {
    teacherList.value = allTeachers.value;
  }
};

const editSubject = (row) => {
  isEdit.value = true;
  subjectForm.id = row.id;
  subjectForm.name = row.name;
  subjectForm.teacher_id = row.teacher_id;
  subjectForm.semester_id = row.semester_id;
  subjectForm.enabled = row.enabled;
  subjectForm.hours = row.hours;
  subjectForm.study_ability = row.abilities.study_ability || 0;
  subjectForm.logical_thinking = row.abilities.logical_thinking || 0;
  subjectForm.creativity = row.abilities.creativity || 0;
  subjectForm.teamwork = row.abilities.teamwork || 0;
  subjectForm.responsibility = row.abilities.responsibility || 0;

  // 确保列表包含当前教师
  if (teacherList.value.length === 0) {
    teacherList.value = allTeachers.value;
  }

  showAddDialog.value = true;
};

const openAddDialog = () => {
  showAddDialog.value = true;
  if (allTeachers.value.length === 0) {
    loadAllTeachers();
  } else {
    teacherList.value = allTeachers.value;
  }
};

const toggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.enabled ? "禁用" : "启用"}选修课 "${row.name}" 吗？`,
      "确认操作",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    const newStatus = !row.enabled;
    const response = await adminAPI.updateElectiveSubject(row.id, {
      ...row,
      enabled: newStatus,
    });

    if (response.status === 200) {
      row.enabled = newStatus;
      ElMessage.success("状态更新成功");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
};

const submitSubject = async () => {
  if (!subjectFormRef.value) return;

  await subjectFormRef.value.validate(async (valid) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      let response;
      if (isEdit.value) {
        response = await adminAPI.updateElectiveSubject(
          subjectForm.id,
          subjectForm,
        );
      } else {
        const createPayload = {
          name: subjectForm.name,
          teacher_id: subjectForm.teacher_id,
          semester_id: subjectForm.semester_id,
          enabled: subjectForm.enabled,
          hours: subjectForm.hours,
          study_ability: subjectForm.study_ability,
          logical_thinking: subjectForm.logical_thinking,
          creativity: subjectForm.creativity,
          teamwork: subjectForm.teamwork,
          responsibility: subjectForm.responsibility,
        };
        response = await adminAPI.createElectiveSubject(createPayload);
      }

      if (response.status === 200) {
        ElMessage.success(isEdit.value ? "选修课更新成功" : "选修课添加成功");
        showAddDialog.value = false;
        loadSubjects();
      }
    } catch (error) {
      console.error("Failed to submit subject:", error);
      ElMessage.error("操作失败");
    } finally {
      submitLoading.value = false;
    }
  });
};

const resetForm = () => {
  subjectForm.id = null;
  subjectForm.name = "";
  subjectForm.teacher_id = "";
  subjectForm.semester_id = "";
  subjectForm.enabled = true;
  subjectForm.hours = null;
  subjectForm.study_ability = 0;
  subjectForm.logical_thinking = 0;
  subjectForm.creativity = 0;
  subjectForm.teamwork = 0;
  subjectForm.responsibility = 0;
  isEdit.value = false;
};

// 学生管理方法
const openStudentDialog = (row) => {
  currentSubjectId.value = row.id;
  currentSubjectName.value = row.name;
  showStudentDialog.value = true;
  loadSubjectStudents();
};

const resetStudentDialog = () => {
  currentSubjectId.value = null;
  currentSubjectName.value = "";
  subjectStudents.value = [];
  addStudentId.value = "";
  searchStudentList.value = [];
};

const loadSubjectStudents = async () => {
  if (!currentSubjectId.value) return;
  studentLoading.value = true;
  try {
    const response = await adminAPI.getElectiveSubjectGrades(
      currentSubjectId.value,
    );
    if (response.status === 200) {
      subjectStudents.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load subject students:", error);
    ElMessage.error("获取学生列表失败");
  } finally {
    studentLoading.value = false;
  }
};

const searchStudents = async (query) => {
  if (query) {
    searchStudentLoading.value = true;
    try {
      const response = await adminAPI.getStudents({ keyword: query });
      if (response.status === 200) {
        // 适配不同的 API 返回结构
        const students =
          response.data.students || response.data.items || response.data || [];
        searchStudentList.value = students.map((s) => ({
          id: s.user_id || s.id,
          name: s.user_name || s.name,
          student_id: s.student_id || s.studentId || "",
          year_name: s.year_name || s.yearName || "",
          class_name: s.class_name || s.className || "",
        }));
      }
    } catch (error) {
      console.error("Failed to search students:", error);
    } finally {
      searchStudentLoading.value = false;
    }
  } else {
    searchStudentList.value = [];
  }
};

const handleAddStudent = async () => {
  if (!addStudentId.value || !currentSubjectId.value) return;
  try {
    const response = await adminAPI.addStudentToElectiveSubject(
      currentSubjectId.value,
      addStudentId.value,
    );
    if (response.status === 200) {
      ElMessage.success("添加学生成功");
      addStudentId.value = "";
      loadSubjectStudents();
    }
  } catch (error) {
    console.error("Failed to add student:", error);
    ElMessage.error("添加学生失败");
  }
};

const handleRemoveStudent = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要将学生 "${row.student_name}" 从该选修课中移除吗？`,
      "确认移除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    // 优先使用 id，如果没有则尝试 student_id (根据后端API定义)
    const studentIdToRemove = row.id || row.student_id;
    const response = await adminAPI.removeStudentFromElectiveSubject(
      currentSubjectId.value,
      studentIdToRemove,
    );
    if (response.status === 200) {
      ElMessage.success("移除学生成功");
      loadSubjectStudents();
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to remove student:", error);
      ElMessage.error("移除学生失败");
    }
  }
};

const handleExportStudents = () => {
  const header = ["学号", "姓名", "班级"];
  const data = subjectStudents.value.map((s) => ({
    学号: s.student_id,
    姓名: s.student_name,
    班级: s.class_name,
  }));

  const ws = XLSX.utils.json_to_sheet(data, {
    header,
    skipHeader: false,
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "学生名单");

  XLSX.writeFile(wb, `${currentSubjectName.value}_学生名单.xlsx`);
};

const fileInputRef = ref(null);

const triggerImport = () => {
  fileInputRef.value.click();
};

const handleImportStudents = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const studentIds = jsonData
        .map((row) => row["学号"] || row["student_id"])
        .filter(
          (id) => id !== undefined && id !== null && String(id).trim() !== "",
        );

      if (studentIds.length === 0) {
        ElMessage.warning("未解析到有效的学号数据");
        return;
      }

      const response = await adminAPI.batchAddStudentsToElectiveSubject(
        currentSubjectId.value,
        studentIds,
      );

      if (response.status === 200) {
        ElMessage.success(`导入完成`);
        loadSubjectStudents();
      }
    } catch (error) {
      console.error("Import error:", error);
      ElMessage.error("导入失败，请检查文件格式");
    } finally {
      // 清空 input，允许重复上传同一文件
      event.target.value = "";
    }
  };
  reader.readAsArrayBuffer(file);
};

onMounted(() => {
  loadAllTeachers();
  loadSemesters();
});
</script>

<style scoped>
.elective-subject-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  margin-bottom: 20px;
}
</style>
