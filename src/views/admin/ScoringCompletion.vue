<template>
  <div class="scoring-completion">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="goBack" :icon="ArrowLeft" circle />
            <span style="margin-left: 10px" class="text-large font-600">
              评分完成情况
            </span>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="filters" class="demo-form-inline">
        <el-form-item label="年级">
          <el-select
            v-model="filters.yearCode"
            placeholder="请选择年级"
            style="width: 200px"
          >
            <el-option
              v-for="year in years"
              :key="year.year_code"
              :label="year.year_name"
              :value="year.year_code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="科目">
          <el-select
            v-model="filters.subjectCode"
            placeholder="请选择科目"
            style="width: 200px"
          >
            <el-option
              v-for="subject in subjects"
              :key="subject.subject_code"
              :label="subject.subject_name"
              :value="subject.subject_code"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData" :loading="loading"
            >查询</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt-4" v-if="hasSearched">
      <template #header>
        <div class="card-header">
          <span>班级评分进度列表</span>
          <div class="summary" v-if="statistics">
            <el-tag effect="dark" type="success" class="mr-2">
              完成度: {{ formatPercentage(statistics.avg_completion) }}
            </el-tag>
            <el-tag effect="dark" type="info">
              总班级数: {{ statistics.total_classes }}
            </el-tag>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="class_name" label="班级名称" width="180" />
        <el-table-column label="学科名称" min-width="150">
          <template #default="{ row }">
            <span>{{ row.subject_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评分教师" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="teacher in row.teachers"
              :key="teacher"
              class="mr-2"
              style="margin-right: 5px"
            >
              {{ teacher }}
            </el-tag>
            <span>{{ row.teacher_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成度" min-width="200">
          <template #default="{ row }">
            <el-progress
              :percentage="
                parsePercentage((row.finished_count / row.total_count) * 100)
              "
              :status="
                getProgressStatus((row.finished_count / row.total_count) * 100)
              "
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { adminAPI } from "@/api/admin";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const semesterId = route.params.semesterId;

const loading = ref(false);
const years = ref([]);
const subjects = ref([]);
const tableData = ref([]);
const statistics = ref(null);
const hasSearched = ref(false);

const filters = reactive({
  yearCode: "",
  subjectCode: "",
});

const goBack = () => {
  router.back();
};

const formatPercentage = (val) => {
  if (val === undefined || val === null) return "0%";
  return `${Number(val).toFixed(1)}%`;
};

const parsePercentage = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
};

const getProgressStatus = (val) => {
  const num = Number(val);
  if (num >= 100) return "success";
  if (num >= 60) return "warning";
  return "exception";
};

const getYearName = (code) => {
  const found = years.value.find((y) => y.year_code === code);
  return found ? found.year_name : code;
};

// 获取基础数据
const fetchBasicData = async () => {
  try {
    const [yearsRes, subjectsRes] = await Promise.all([
      adminAPI.getSchoolYears(),
      adminAPI.getCourses(),
    ]);

    if (yearsRes.status === 200) {
      years.value = yearsRes.data;
    }
    if (subjectsRes.status === 200) {
      subjects.value = subjectsRes.data;
    }
  } catch (error) {
    console.error("Failed to fetch basic data:", error);
    ElMessage.error("获取基础数据失败");
  }
};

const fetchData = async () => {
  if (!filters.yearCode || !filters.subjectCode) {
    ElMessage.warning("请选择年级和科目");
    return;
  }

  loading.value = true;
  hasSearched.value = true;
  tableData.value = [];
  statistics.value = null;

  try {
    const res = await adminAPI.getClassProcesses(
      semesterId,
      filters.yearCode,
      filters.subjectCode,
    );

    if (res.status === 200) {
      // 假设API返回结构：{ list: [...], statistics: {...} }
      // 或者是一个数组，我们自己计算统计数据
      if (Array.isArray(res.data)) {
        tableData.value = res.data;
        // 简单计算统计数据
        const total = tableData.value.length;
        const sum = tableData.value.reduce(
          (acc, cur) =>
            acc + (Number((cur.finished_count / cur.total_count) * 100) || 0),
          0,
        );
        statistics.value = {
          total_classes: total,
          avg_completion: total > 0 ? sum / total : 0,
        };
      } else {
        tableData.value = res.data.list || [];
        statistics.value = res.data.statistics || {
          total_classes: tableData.value.length,
          avg_completion: 0,
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
    ElMessage.error("获取评分完成情况失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBasicData();
});
</script>

<style scoped>
.scoring-completion {
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
.mt-4 {
  margin-top: 16px;
}
.mr-2 {
  margin-right: 8px;
}
</style>
