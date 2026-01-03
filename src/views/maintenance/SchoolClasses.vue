<template>
  <div class="school-classes">
    <div class="page-header" v-if="!props.embedded">
      <el-page-header @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3"> 学校班级列表 </span>
        </template>
      </el-page-header>
    </div>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>班级列表</span>
          <div class="header-actions">
            <el-select
              v-model="gradeFilter"
              placeholder="筛选年级"
              clearable
              style="width: 150px; margin-right: 10px"
            >
              <el-option
                v-for="grade in gradeOptions"
                :key="grade"
                :label="grade"
                :value="grade"
              />
            </el-select>
            <el-input
              v-model="queryParams.keyword"
              placeholder="搜索班级名称"
              style="width: 200px; margin-right: 10px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredClassList"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column
          prop="class_id"
          label="班级ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="class_name" label="班级名称" />
        <el-table-column prop="year_name" label="年级" />
        <el-table-column prop="student_count" label="学生人数" align="center" />
        <el-table-column
          prop="header_teacher_name"
          label="班主任"
          align="center"
        />
      </el-table>
    </el-card>

    <!-- 生成测试数据对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="生成测试数据"
      width="400px"
      @close="resetDialog"
    >
      <div v-loading="dialogLoading">
        <p class="mb-4">
          请选择要生成数据的学期。这将为班级
          <span class="font-bold text-primary">{{
            currentClass?.class_name
          }}</span>
          的所有学生生成随机成绩数据。
        </p>
        <el-form label-position="top">
          <el-form-item label="学期">
            <el-select
              v-model="selectedSemester"
              placeholder="请选择学期"
              style="width: 100%"
            >
              <el-option
                v-for="semester in semesterList"
                :key="semester.semester_id"
                :label="semester.semester_name"
                :value="semester.semester_id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitGenerateData"
            :loading="submitLoading"
            :disabled="!selectedSemester"
          >
            开始生成
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { maintenanceAPI } from "@/api/maintenance";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";

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
const router = useRouter();
const currentSchoolId = computed(() => props.schoolId || route.params.schoolId);

const loading = ref(false);
const classList = ref([]);
const gradeFilter = ref("");

// 对话框相关
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const submitLoading = ref(false);
const currentClass = ref(null);
const selectedSemester = ref(null);
const semesterList = ref([]);

const queryParams = reactive({
  page: 1,
  pageSize: 100,
  keyword: "",
});

const goBack = () => {
  router.back();
};

const fetchClasses = async () => {
  loading.value = true;
  try {
    const res = await maintenanceAPI.getSchoolClasses(
      currentSchoolId.value,
      queryParams,
    );
    if (res.status === 200) {
      // Adjust based on actual API response structure.
      // Assuming it returns an array or an object with a list.
      // If it matches adminAPI, it might be directly the data array or data.data
      classList.value = Array.isArray(res.data)
        ? res.data
        : res.data.classes || [];
      classList.value = classList.value.sort((a, b) =>
        a.year_code.localeCompare(b.year_code),
      );
    }
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    ElMessage.error("获取班级列表失败");
  } finally {
    loading.value = false;
  }
};

const fetchSemesters = async () => {
  if (semesterList.value.length > 0) return;
  dialogLoading.value = true;
  try {
    const res = await maintenanceAPI.getMaintenanceSemesters();
    if (res.status === 200) {
      semesterList.value = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch semesters:", error);
    ElMessage.error("获取学期列表失败");
  } finally {
    dialogLoading.value = false;
  }
};

const gradeOptions = computed(() => {
  const grades = new Set();
  classList.value.forEach((item) => {
    const name = item.class_name || "";
    let grade = "";
    if (name.includes("高一")) grade = "高一";
    else if (name.includes("高二")) grade = "高二";
    else if (name.includes("高三")) grade = "高三";
    else if (name.includes("初一")) grade = "初一";
    else if (name.includes("初二")) grade = "初二";
    else if (name.includes("初三")) grade = "初三";
    else {
      const match = name.match(/(\d{4}级)/);
      if (match) {
        grade = match[1];
      } else {
        grade = name.substring(0, 2);
      }
    }

    if (grade) {
      grades.add(grade);
    }
  });
  return Array.from(grades).sort();
});

const filteredClassList = computed(() => {
  if (!gradeFilter.value) return classList.value;
  return classList.value.filter((item) => {
    const name = item.class_name || "";
    return name.includes(gradeFilter.value);
  });
});

const handleSearch = () => {
  queryParams.page = 1;
  fetchClasses();
};

const handleGenerateData = (row) => {
  currentClass.value = row;
  dialogVisible.value = true;
  fetchSemesters();
};

const resetDialog = () => {
  selectedSemester.value = null;
  currentClass.value = null;
};

const submitGenerateData = async () => {
  if (!currentClass.value || !selectedSemester.value) return;

  submitLoading.value = true;
  try {
    const res = await maintenanceAPI.generateClassGradeData(
      currentClass.value.class_id,
      selectedSemester.value,
    );

    if (res.status === 200) {
      ElMessage.success("测试数据生成任务已提交");
      dialogVisible.value = false;
    } else {
      ElMessage.error(res.message || "生成失败");
    }
  } catch (error) {
    console.error("Failed to generate data:", error);
    ElMessage.error("生成测试数据失败");
  } finally {
    submitLoading.value = false;
  }
};

onMounted(() => {
  if (currentSchoolId.value) {
    fetchClasses();
  } else {
    ElMessage.error("缺少学校ID参数");
  }
});
</script>

<style scoped>
.school-classes {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.text-primary {
  color: var(--el-color-primary);
}

.font-bold {
  font-weight: bold;
}
</style>
