<template>
  <div class="student-grade-query">
    <el-card>
      <template #header>
        <span class="title">学生成绩查询</span>
      </template>

      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="届别">
          <el-select
            v-model="filters.graduated_year"
            placeholder="全部"
            clearable
            style="width: 140px"
            @change="onYearChange"
          >
            <el-option v-for="y in graduatedYears" :key="y" :label="`${y}届`" :value="y" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select
            v-model="filters.class_id"
            placeholder="全部"
            clearable
            filterable
            style="width: 220px"
            @change="handleSearch"
          >
            <el-option
              v-for="c in classOptions"
              :key="c.class_id"
              :label="classLabel(c)"
              :value="c.class_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学生">
          <el-input
            v-model="filters.keyword"
            placeholder="姓名或学生ID"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="pagedStudents" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="user_id" label="学生ID" width="150" show-overflow-tooltip />
        <el-table-column prop="user_name" label="姓名" width="120" />
        <el-table-column label="届别" width="100">
          <template #default="{ row }">{{ row.graduated_year }}届</template>
        </el-table-column>
        <el-table-column label="班级" min-width="160">
          <template #default="{ row }">
            {{ row.class_name }}
            <el-tag v-if="row.is_graduated" size="small" type="info" style="margin-left: 6px">已毕业</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="300">
          <template #default="{ row }">
            <el-button v-if="isHighSchool(row)" type="primary" link @click="handleViewProof(row)">
              成绩证明
            </el-button>
            <el-button v-if="isHighSchool(row)" type="success" link @click="handleViewStatusCard(row)">
              学籍卡
            </el-button>
            <el-button type="warning" link @click="handleViewGradeTrend(row)">成绩趋势</el-button>
            <el-button type="danger" link @click="handleViewYearReport(row)">学年旅程</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && !searched" description="请选择届别或班级，或输入学生姓名后查询" />

      <div class="pagination" v-if="students.length > pageSize">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="students.length"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="proofDialogVisible"
      title="成绩证明预览"
      width="900px"
      top="5vh"
      destroy-on-close
      append-to-body
    >
      <div class="dialog-center">
        <ReportProof v-if="proofDialogVisible" :student-id="currentStudentId" />
      </div>
    </el-dialog>

    <el-dialog
      v-model="statusCardDialogVisible"
      title="学籍卡"
      :width="wordStatusCard ? '1100px' : '1000px'"
      top="5vh"
      destroy-on-close
      append-to-body
    >
      <WordStatusCard v-if="statusCardDialogVisible && wordStatusCard" :student-id="currentStudentId" />
      <div v-else-if="statusCardDialogVisible" class="dialog-center">
        <StatusCard :student-id="currentStudentId" />
      </div>
    </el-dialog>

    <el-dialog
      v-model="gradeTrendDialogVisible"
      title="学生成绩趋势"
      width="900px"
      top="5vh"
      destroy-on-close
      append-to-body
    >
      <div class="dialog-center">
        <GradeTrend v-if="gradeTrendDialogVisible" :student-id="currentStudentId" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { adminAPI } from "@/api/admin";
import ReportProof from "@/views/common/ReportProof.vue";
import StatusCard from "@/views/common/StatusCard.vue";
import WordStatusCard from "@/views/common/WordStatusCard.vue";
import GradeTrend from "@/views/common/GradeTrend.vue";

const router = useRouter();

const graduatedYears = ref([]);
const classes = ref([]);
const wordStatusCard = ref(false);
const filters = reactive({ graduated_year: null, class_id: null, keyword: "" });

const loading = ref(false);
const searched = ref(false);
const students = ref([]);
const page = ref(1);
const pageSize = 50;

const proofDialogVisible = ref(false);
const statusCardDialogVisible = ref(false);
const gradeTrendDialogVisible = ref(false);
const currentStudentId = ref(null);

const classOptions = computed(() =>
  filters.graduated_year ? classes.value.filter((c) => c.graduated_year === filters.graduated_year) : classes.value,
);
const pagedStudents = computed(() => students.value.slice((page.value - 1) * pageSize, page.value * pageSize));

const classLabel = (c) => {
  const prefix = filters.graduated_year ? "" : `${c.graduated_year}届 `;
  return `${prefix}${c.class_name}${c.is_graduated ? "（已毕业）" : ""}`;
};
// 成绩证明/学籍卡仅高中；毕业班学段识别不出时也显示
const isHighSchool = (row) => !row.phase_code || row.phase_code === "05";

const loadOptions = async () => {
  try {
    const res = await adminAPI.getStudentQueryOptions();
    graduatedYears.value = res.data?.graduated_years || [];
    classes.value = res.data?.classes || [];
    wordStatusCard.value = !!res.data?.word_status_card;
  } catch {
    ElMessage.error("获取届别与班级失败");
  }
};

const onYearChange = () => {
  if (filters.class_id && !classOptions.value.some((c) => c.class_id === filters.class_id)) {
    filters.class_id = null;
  }
  handleSearch();
};

const handleSearch = async () => {
  const keyword = filters.keyword.trim();
  if (!filters.graduated_year && !filters.class_id && !keyword) {
    students.value = [];
    searched.value = false;
    return;
  }
  loading.value = true;
  try {
    const params = {};
    if (filters.graduated_year) params.graduated_year = filters.graduated_year;
    if (filters.class_id) params.class_id = filters.class_id;
    if (keyword) params.keyword = keyword;
    const res = await adminAPI.queryStudents(params);
    students.value = res.data || [];
    page.value = 1;
    searched.value = true;
  } catch {
    students.value = [];
  } finally {
    loading.value = false;
  }
};

const handleViewProof = (row) => {
  currentStudentId.value = row.user_id;
  proofDialogVisible.value = true;
};

const handleViewStatusCard = (row) => {
  currentStudentId.value = row.user_id;
  statusCardDialogVisible.value = true;
};

const handleViewGradeTrend = (row) => {
  currentStudentId.value = row.user_id;
  gradeTrendDialogVisible.value = true;
};

const handleViewYearReport = (row) => {
  const routeData = router.resolve({ name: "YearReport", params: { studentId: row.user_id } });
  window.open(routeData.href, "_blank");
};

onMounted(loadOptions);
</script>

<style scoped>
.student-grade-query {
  padding: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
