<template>
  <div class="school-exam-grades">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="goBack" :icon="ArrowLeft" circle />
            <span class="header-title"
              >{{ examDetails?.exam_name || "考试" }} - 成绩列表</span
            >
          </div>
        </div>
      </template>

      <el-descriptions v-if="examDetails" :column="3" border class="mb-4">
        <el-descriptions-item label="考试名称">{{
          examDetails.exam_name
        }}</el-descriptions-item>
        <el-descriptions-item label="考试类型">{{
          examDetails.exam_type_name
        }}</el-descriptions-item>
        <el-descriptions-item label="学期">{{
          examDetails.semester_name
        }}</el-descriptions-item>
      </el-descriptions>

      <div class="toolbar mb-4">
        <el-space>
          <el-input
            v-model="searchQuery"
            placeholder="搜索学生姓名"
            style="width: 250px"
            clearable
            @input="filterGrades"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="selectedSubject"
            placeholder="筛选科目"
            clearable
            style="width: 150px"
            @change="filterGrades"
          >
            <el-option
              v-for="item in subjectOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-space>
      </div>

      <el-table
        :data="filteredGrades"
        v-loading="loading"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column
          prop="student_name"
          label="姓名"
          min-width="120"
          sortable
        />
        <el-table-column
          prop="subject_name"
          label="科目"
          width="150"
          sortable
        />
        <el-table-column prop="score" label="原始分" width="120" sortable />
        <el-table-column
          prop="standard_score"
          label="标准分"
          width="120"
          sortable
        />
        <el-table-column
          prop="class_rank"
          label="班级排名"
          width="120"
          sortable
        />
        <el-table-column
          prop="school_rank"
          label="年级排名"
          width="120"
          sortable
        />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { maintenanceAPI } from "@/api/maintenance";
import { ElMessage } from "element-plus";
import { Search, ArrowLeft } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

const schoolId = route.params.schoolId;
const examId = route.params.examId;

const loading = ref(false);
const gradeList = ref([]);
const searchQuery = ref("");
const selectedSubject = ref("");
const filteredGrades = ref([]);
const examDetails = ref(null);

const goBack = () => {
  router.back();
};

const fetchExamDetails = async () => {
  try {
    const res = await maintenanceAPI.getSchoolExamDetails(schoolId, examId);
    if (res.status === 200) {
      examDetails.value = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch exam details:", error);
  }
};

const fetchGrades = async () => {
  loading.value = true;
  try {
    const res = await maintenanceAPI.getSchoolExamGrades(schoolId, examId);
    if (res.status === 200) {
      gradeList.value = Array.isArray(res.data)
        ? res.data
        : res.data.items || [];
      filterGrades();
    } else {
      ElMessage.error("获取成绩失败");
    }
  } catch (error) {
    console.error("Failed to fetch grades:", error);
    ElMessage.error("获取成绩失败");
  } finally {
    loading.value = false;
  }
};

const filterGrades = () => {
  let result = gradeList.value;

  // 科目筛选
  if (selectedSubject.value) {
    result = result.filter(
      (item) => item.subject_name === selectedSubject.value,
    );
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((item) =>
      item.student_name.toLowerCase().includes(query),
    );
  }

  filteredGrades.value = result;
};

// Compute subject options for dropdown
const subjectOptions = computed(() => {
  return Array.from(new Set(gradeList.value.map((g) => g.subject_name)));
});

// Compute subject filters unique values for table column
const subjectFilters = computed(() => {
  return subjectOptions.value.map((s) => ({ text: s, value: s }));
});

const filterSubject = (value, row) => {
  return row.subject_name === value;
};

onMounted(() => {
  fetchExamDetails();
  fetchGrades();
});
</script>

<style scoped>
.school-exam-grades {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  margin-left: 10px;
  font-weight: 600;
  font-size: 16px;
}

.mb-4 {
  margin-bottom: 20px;
}
</style>
