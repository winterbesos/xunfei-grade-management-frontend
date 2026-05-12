<template>
  <div class="semester-leaderboard">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="goBack" :icon="ArrowLeft" circle />
            <span class="header-title">成绩榜单</span>
          </div>
        </div>
      </template>

      <div class="filter-bar">
        <el-form :inline="true">
          <el-form-item label="年级">
            <el-select
              v-model="selectedYearCode"
              placeholder="请选择年级"
              style="width: 180px"
              clearable
            >
              <el-option
                v-for="y in years"
                :key="y.year_code"
                :label="y.year_name"
                :value="y.year_code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="科目">
            <el-select
              v-model="selectedSubjectCode"
              placeholder="请选择科目"
              style="width: 180px"
              clearable
            >
              <el-option
                v-for="s in subjects"
                :key="s.subject_code"
                :label="s.subject_name"
                :value="s.subject_code"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="!canQuery"
              :loading="loading"
              @click="loadLeaderboard"
            >
              查询
            </el-button>
            <el-button
              type="success"
              :disabled="!hasData"
              @click="handleExport"
            >
              导出榜单
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-empty
        v-if="!loading && !hasQueried"
        description="请选择年级和科目后查询"
      />

      <template v-else>
        <el-descriptions
          v-if="leaderboard"
          :column="3"
          border
          class="mb-4"
        >
          <el-descriptions-item label="学期">
            {{ leaderboard.semester_name }}
          </el-descriptions-item>
          <el-descriptions-item label="年级">
            {{ leaderboard.year_name }}
          </el-descriptions-item>
          <el-descriptions-item label="科目">
            {{ leaderboard.subject_name }}
          </el-descriptions-item>
        </el-descriptions>

        <el-table
          :data="leaderboard?.items || []"
          v-loading="loading"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column prop="rank" label="排名" width="80" align="center" />
          <el-table-column prop="student_id" label="学号" width="200" />
          <el-table-column prop="student_name" label="姓名" min-width="120" />
          <el-table-column prop="class_name" label="班级" min-width="120">
            <template #default="{ row }">
              {{ row.class_name || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="score" label="成绩" width="120" sortable />
          <el-table-column prop="grade_level" label="等级" width="100" align="center">
            <template #default="{ row }">
              {{ row.grade_level || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="gpa" label="GPA" width="100" sortable />
        </el-table>

        <el-empty
          v-if="!loading && hasQueried && (leaderboard?.items?.length || 0) === 0"
          description="暂无成绩数据"
        />
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import * as XLSX from "xlsx";
import { adminAPI } from "@/api/admin";

const route = useRoute();
const router = useRouter();
const semesterId = route.params.semesterId;

const years = ref([]);
const subjects = ref([]);
const selectedYearCode = ref("");
const selectedSubjectCode = ref("");
const leaderboard = ref(null);
const loading = ref(false);
const hasQueried = ref(false);

const canQuery = computed(
  () => !!selectedYearCode.value && !!selectedSubjectCode.value,
);
const hasData = computed(() => (leaderboard.value?.items?.length || 0) > 0);

const goBack = () => router.back();

const loadOptions = async () => {
  try {
    const [yearRes, subjectRes] = await Promise.all([
      adminAPI.getSchoolYears(),
      adminAPI.getActiveSubjects(),
    ]);
    if (yearRes.status === 200) years.value = yearRes.data || [];
    if (subjectRes.status === 200) subjects.value = subjectRes.data || [];
  } catch (e) {
    ElMessage.error("加载筛选项失败");
  }
};

const loadLeaderboard = async () => {
  if (!canQuery.value) return;
  loading.value = true;
  try {
    const res = await adminAPI.getSemesterLeaderboard(semesterId, {
      year_code: selectedYearCode.value,
      subject_code: selectedSubjectCode.value,
    });
    if (res.status === 200) {
      leaderboard.value = res.data;
      hasQueried.value = true;
    }
  } catch (e) {
    // axios interceptor 已经弹错误
  } finally {
    loading.value = false;
  }
};

const handleExport = () => {
  if (!hasData.value) {
    ElMessage.warning("暂无数据可导出");
    return;
  }
  const rows = leaderboard.value.items.map((it) => ({
    排名: it.rank,
    学号: it.student_id,
    姓名: it.student_name,
    班级: it.class_name || "",
    成绩: it.score,
    等级: it.grade_level || "",
    GPA: it.gpa,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "成绩榜单");
  const fileName = `${leaderboard.value.semester_name}-${leaderboard.value.year_name}-${leaderboard.value.subject_name}-成绩榜单.xlsx`;
  XLSX.writeFile(wb, fileName);
};

onMounted(() => {
  loadOptions();
});
</script>

<style scoped>
.semester-leaderboard {
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

.filter-bar {
  margin-bottom: 20px;
}

.mb-4 {
  margin-bottom: 20px;
}
</style>
