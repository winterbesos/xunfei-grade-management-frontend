<template>
  <div class="elective-subject-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>选修课管理</h3>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索课程名称或教师"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
        </el-row>
      </div>

      <!-- 选修课列表 -->
      <el-table
        :data="filteredElectiveSubjects"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="课程名称" min-width="150" />
        <el-table-column prop="semester_name" label="学期" width="200" />
        <el-table-column prop="teacher_name" label="任课教师" width="150" />
        <el-table-column prop="enabled" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'danger'">
              {{ row.enabled ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="openStudentDialog(row)"
            >
              学生列表
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 学生列表对话框 -->
    <el-dialog
      v-model="showStudentDialog"
      :title="'学生列表 - ' + currentSubjectName"
      width="800px"
      @close="resetStudentDialog"
    >
      <div class="student-dialog-content">
        <!-- 学生列表 -->
        <el-table
          :data="subjectStudents"
          style="width: 100%;"
          v-loading="studentLoading"
          border
        >
          <el-table-column
            prop="student_id"
            label="学号"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column prop="student_name" label="姓名" width="120" />
          <el-table-column prop="class_name" label="班级" min-width="150">
            <template #default="{ row }">
              <span>{{ row.year_name }} {{ row.class_name }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { maintenanceAPI } from "@/api/maintenance";

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  schoolId: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const currentSchoolId = computed(() => props.schoolId || route.params.schoolId);

// 数据
const loading = ref(false);
const searchKeyword = ref("");
const allElectiveSubjects = ref([]);

// 学生列表相关
const showStudentDialog = ref(false);
const currentSubjectName = ref("");
const currentSubjectId = ref(null);
const subjectStudents = ref([]);
const studentLoading = ref(false);

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
const loadSubjects = async () => {
  if (!currentSchoolId.value) return;
  loading.value = true;
  try {
    const response = await maintenanceAPI.getSchoolElectiveSubjects(currentSchoolId.value);
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

const handleSearch = () => {
  // Client-side filtering is handled by computed property
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
};

const loadSubjectStudents = async () => {
  if (!currentSubjectId.value) return;
  studentLoading.value = true;
  try {
    const response = await maintenanceAPI.getSchoolElectiveSubjectStudents(
      currentSchoolId.value,
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

onMounted(() => {
  if (currentSchoolId.value) {
    loadSubjects();
  } else {
      ElMessage.error("参数错误：缺少学校ID");
  }
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
