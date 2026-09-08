<template>
  <div class="semester-reports">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="goBack" :icon="ArrowLeft" circle />
            <span class="header-title">成绩单</span>
          </div>
          <div class="header-right">
            <el-button
              type="primary"
              :disabled="!selectedStudents.length || exporting"
              @click="handleExport(selectedStudents)"
            >
              导出选中（{{ selectedStudents.length }}）
            </el-button>
            <el-button
              type="success"
              :disabled="!students.length || exporting"
              @click="handleExport(students)"
            >
              导出全部（{{ students.length }}）
            </el-button>
          </div>
        </div>
      </template>

      <div class="filter-bar">
        <el-form :inline="true">
          <el-form-item label="年级" required>
            <el-select
              v-model="selectedYearCode"
              placeholder="请选择年级"
              style="width: 180px"
              @change="handleYearChange"
            >
              <el-option
                v-for="y in years"
                :key="y.year_code"
                :label="y.year_name"
                :value="y.year_code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="班级">
            <el-select
              v-model="selectedClassId"
              placeholder="全部班级"
              style="width: 180px"
              clearable
              filterable
              :disabled="!selectedYearCode"
            >
              <el-option
                v-for="c in selectableClasses"
                :key="c.class_id"
                :label="c.class_name"
                :value="c.class_id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="!selectedYearCode"
              :loading="loading"
              @click="loadStudents"
            >
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-alert
        v-if="exporting"
        type="info"
        :closable="false"
        class="export-progress"
      >
        {{ exportPhase === "fetch" ? "正在读取成绩数据" : "正在生成 PDF" }}
        {{ exportDone }} / {{ exportTotal }}，请勿关闭页面
        <el-progress
          :percentage="exportPercent"
          :stroke-width="10"
          style="margin-top: 8px"
        />
      </el-alert>

      <el-empty
        v-if="!loading && hasQueried && !students.length"
        description="该筛选条件下没有学生"
      />

      <el-table
        v-else-if="students.length"
        ref="tableRef"
        :data="students"
        v-loading="loading"
        border
        stripe
        row-key="student_id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" reserve-selection />
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="student_name" label="姓名" min-width="140" />
        <el-table-column prop="class_name" label="班级" min-width="160" />
        <el-table-column label="详情" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewReport(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="failureDialogVisible"
      title="以下学生的成绩单导出失败"
      width="640px"
    >
      <el-alert type="warning" :closable="false" style="margin-bottom: 12px">
        已重试 {{ RETRY_TIMES }} 次仍失败，这些学生未包含在导出的 PDF 中
      </el-alert>
      <el-table :data="failures" border max-height="380">
        <el-table-column
          type="index"
          label="序号"
          width="70"
          align="center"
        />
        <el-table-column prop="student_name" label="姓名" width="130" />
        <el-table-column prop="class_name" label="班级" width="140" />
        <el-table-column prop="reason" label="失败原因" min-width="200" />
      </el-table>
      <template #footer>
        <el-button @click="failureDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleRetryFailures">
          重新导出这些学生
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { adminAPI } from "@/api/admin";
import { teacherAPI } from "@/api/teacher";
import { exportReportsToPdf } from "@/utils/reportTemplate";

// 逐个拉取成绩单时的并发上限，一个年级可能有几百人，放开并发会打垮后端
const FETCH_CONCURRENCY = 5;
// 单个学生的最大请求次数，超过仍失败才计入失败列表
const RETRY_TIMES = 3;

const route = useRoute();
const router = useRouter();
const semesterId = route.params.semesterId;

const classes = ref([]);
const students = ref([]);
const selectedStudents = ref([]);
const selectedYearCode = ref("");
const selectedClassId = ref("");
const loading = ref(false);
const hasQueried = ref(false);
const tableRef = ref(null);

const exporting = ref(false);
const exportPhase = ref("fetch"); // fetch: 拉取成绩数据；render: 生成 PDF
const exportDone = ref(0);
const exportTotal = ref(0);
const failures = ref([]);
const failureDialogVisible = ref(false);

// numeric 让「高一10班」排在「高一2班」之后，而不是按字符逐位比
const collator = new Intl.Collator("zh-CN", {
  numeric: true,
  sensitivity: "base",
});

const years = computed(() => {
  const seen = new Map();
  classes.value.forEach((c) => {
    if (c.year_code && !seen.has(c.year_code)) {
      seen.set(c.year_code, { year_code: c.year_code, year_name: c.year_name });
    }
  });
  return [...seen.values()].sort((a, b) =>
    collator.compare(a.year_code, b.year_code),
  );
});

const selectableClasses = computed(() => {
  if (!selectedYearCode.value) return [];
  return classes.value
    .filter((c) => c.year_code === selectedYearCode.value)
    .sort((a, b) => collator.compare(a.class_name || "", b.class_name || ""));
});

const exportPercent = computed(() =>
  exportTotal.value
    ? Math.round((exportDone.value / exportTotal.value) * 100)
    : 0,
);

const goBack = () => router.back();

const handleYearChange = () => {
  // 换年级后原结果和勾选都不再适用，一并清掉避免跨年级误导出
  selectedClassId.value = "";
  students.value = [];
  selectedStudents.value = [];
  hasQueried.value = false;
  tableRef.value?.clearSelection();
};

const handleSelectionChange = (rows) => {
  selectedStudents.value = rows;
};

const handleViewReport = (row) => {
  const routeData = router.resolve({
    name: "AdminSemesterReport",
    params: { semesterId, studentId: row.student_id },
  });
  window.open(routeData.href, "_blank");
};

const loadClasses = async () => {
  try {
    const res = await adminAPI.getClasses();
    if (res.status === 200) classes.value = res.data || [];
  } catch (e) {
    ElMessage.error("加载班级列表失败");
  }
};

const loadStudents = async () => {
  if (!selectedYearCode.value) return;

  const targets = selectedClassId.value
    ? selectableClasses.value.filter(
        (c) => c.class_id === selectedClassId.value,
      )
    : selectableClasses.value;

  if (!targets.length) {
    ElMessage.warning("该年级下没有班级");
    return;
  }

  loading.value = true;
  selectedStudents.value = [];
  tableRef.value?.clearSelection();
  try {
    const details = await Promise.all(
      targets.map((c) =>
        adminAPI
          .getClassDetail(c.class_id)
          .then((res) => ({ klass: c, detail: res.data }))
          .catch(() => null),
      ),
    );

    students.value = details.filter(Boolean).flatMap(({ klass, detail }) =>
      (detail?.students || []).map((s) => ({
        student_id: s.user_id,
        student_name: s.user_name || "",
        class_id: klass.class_id,
        class_name: klass.class_name,
      })),
    );
    hasQueried.value = true;
  } catch (e) {
    ElMessage.error("加载学生列表失败");
  } finally {
    loading.value = false;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const describeError = (error) => {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;
  if (detail) return `${status ? status + " " : ""}${detail}`;
  if (status) return `HTTP ${status}`;
  return error?.message || "请求失败";
};

// 单个学生最多请求 RETRY_TIMES 次，退避递增，全部失败才返回错误
const fetchOneReport = async (target) => {
  let lastError = "请求失败";
  for (let attempt = 1; attempt <= RETRY_TIMES; attempt += 1) {
    try {
      const res = await teacherAPI.getStudentSemesterReport(
        target.student_id,
        semesterId,
        { silent: true },
      );
      if (res.status === 200) return { data: res.data };
      lastError = `HTTP ${res.status}`;
    } catch (error) {
      lastError = describeError(error);
    }
    if (attempt < RETRY_TIMES) await sleep(300 * attempt);
  }
  return { error: lastError };
};

// 分批并发拉取，保持与入参一致的顺序，便于导出的 PDF 按班级/姓名排列
const fetchReports = async (targets) => {
  const results = new Array(targets.length).fill(null);
  const failed = [];
  let cursor = 0;

  const worker = async () => {
    while (cursor < targets.length) {
      const index = cursor;
      cursor += 1;
      const target = targets[index];
      const { data, error } = await fetchOneReport(target);
      if (data) {
        results[index] = data;
      } else {
        failed.push({
          student_id: target.student_id,
          student_name: target.student_name,
          class_id: target.class_id,
          class_name: target.class_name,
          reason: error,
        });
      }
      exportDone.value += 1;
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(FETCH_CONCURRENCY, targets.length) }, worker),
  );
  return { results, failed };
};

const buildFileName = (first) => {
  const scope = selectedClassId.value
    ? selectableClasses.value.find((c) => c.class_id === selectedClassId.value)
        ?.class_name
    : `${first.year_name || ""}全年级`;
  return `成绩单_${first.academic_year_name || ""}${first.term_name || ""}_${scope || ""}`;
};

const handleExport = async (targets) => {
  if (!targets.length || exporting.value) return;

  exporting.value = true;
  exportPhase.value = "fetch";
  exportDone.value = 0;
  exportTotal.value = targets.length;
  failures.value = [];

  try {
    const { results, failed } = await fetchReports(targets);
    const succeeded = results.filter(Boolean);
    failures.value = failed;

    if (!succeeded.length) {
      ElMessage.error("没有获取到任何成绩单数据");
      if (failed.length) failureDialogVisible.value = true;
      return;
    }

    // 渲染阶段每份都要截图，比拉数据慢得多，进度单独计
    exportPhase.value = "render";
    exportDone.value = 0;
    exportTotal.value = succeeded.length;

    await exportReportsToPdf(
      succeeded,
      buildFileName(succeeded[0]),
      (done) => {
        exportDone.value = done;
      },
    );

    if (failed.length) {
      ElMessage.warning(`已导出 ${succeeded.length} 份，${failed.length} 份失败`);
      failureDialogVisible.value = true;
    } else {
      ElMessage.success(`已导出 ${succeeded.length} 份成绩单`);
    }
  } catch (e) {
    ElMessage.error("导出成绩单失败");
  } finally {
    exporting.value = false;
  }
};

const handleRetryFailures = () => {
  const retryTargets = failures.value.map((f) => ({
    student_id: f.student_id,
    student_name: f.student_name,
    class_id: f.class_id,
    class_name: f.class_name,
  }));
  failureDialogVisible.value = false;
  handleExport(retryTargets);
};

onMounted(loadClasses);
</script>

<style scoped>
.semester-reports {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  margin-bottom: 16px;
}

.export-progress {
  margin-bottom: 16px;
}
</style>
