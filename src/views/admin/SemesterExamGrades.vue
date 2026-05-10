<template>
  <div class="semester-exam-grades">
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

          <el-button @click="handleDownloadTemplate" type="info" link>
            下载导入模板
          </el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="exportLoading"
          >
            导出成绩
          </el-button>
          <el-button
            type="success"
            @click="triggerImport"
            v-if="examDetails?.source !== 1"
          >
            导入成绩
          </el-button>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept=".xlsx, .xls"
            @change="handleFileChange"
          />
        </el-space>
      </div>

      <div class="batch-toolbar mb-4">
        <span class="selected-count">已选 {{ selectedRows.length }} 条</span>
        <el-tooltip
          :content="notDeletableHint"
          :disabled="canDelete"
          placement="top"
        >
          <span>
            <el-button
              type="danger"
              :disabled="!canDelete || selectedRows.length === 0 || selectedRows.length > BATCH_LIMIT"
              :loading="batchDeleting"
              @click="handleBatchDelete"
            >
              批量删除（已选 {{ selectedRows.length }} 条）
            </el-button>
          </span>
        </el-tooltip>
        <span v-if="selectedRows.length > BATCH_LIMIT" class="batch-warning">
          单次最多删除 {{ BATCH_LIMIT }} 条，请减少选中后再操作
        </span>
      </div>

      <el-table
        ref="tableRef"
        :data="filteredGrades"
        v-loading="loading"
        style="width: 100%"
        stripe
        border
        :row-key="(row) => row.grade_id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" :selectable="(row) => !!row.grade_id && canDelete" />
        <el-table-column
          prop="student_name"
          label="姓名"
          min-width="120"
          sortable
        />
        <el-table-column prop="year_name" label="年级" width="100" sortable />
        <el-table-column prop="class_name" label="班级" width="100" sortable />
        <el-table-column
          prop="subject_name"
          label="科目"
          width="150"
          sortable
        />
        <el-table-column
          prop="topic_set_name"
          label="试卷名称"
          min-width="150"
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
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip
              :content="notDeletableHint"
              :disabled="canDelete"
              placement="top"
            >
              <span>
                <el-popconfirm
                  v-if="canDelete"
                  :title="singleDeleteTitle"
                  confirm-button-text="删除"
                  confirm-button-type="danger"
                  cancel-button-text="取消"
                  :width="280"
                  @confirm="handleSingleDelete(row)"
                >
                  <template #reference>
                    <el-button
                      type="danger"
                      link
                      :disabled="!row.grade_id || singleDeletingId === row.grade_id"
                      :loading="singleDeletingId === row.grade_id"
                    >
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
                <el-button v-else type="danger" link disabled>删除</el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 导入预览对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入成绩预览"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="!importing"
      :show-close="!importing"
      :before-close="handleBeforeClose"
      destroy-on-close
    >
      <div class="mb-4">
        <el-alert
          title="请确认数据无误后提交。提交成功的数据将自动从列表中移除，失败的数据可直接编辑后重试。"
          type="info"
          show-icon
          :closable="false"
        />
      </div>
      <el-table
        :data="importData"
        style="width: 100%"
        border
        height="500"
        v-loading="importing"
      >
        <el-table-column prop="student_name" label="姓名" width="120">
          <template #default="{ row }">
            <el-input v-model="row.student_name" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="year_name" label="年级" width="100">
          <template #default="{ row }">
            <el-input v-model="row.year_name" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="class_name" label="班级" width="100">
          <template #default="{ row }">
            <el-input v-model="row.class_name" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="subject_name" label="科目" width="120">
          <template #default="{ row }">
            <el-input v-model="row.subject_name" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="topic_set_name" label="试卷名称" width="150">
          <template #default="{ row }">
            <el-input v-model="row.topic_set_name" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="score" label="原始分" width="100">
          <template #default="{ row }">
            <el-input v-model="row.score" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="standard_score" label="标准分" width="100">
          <template #default="{ row }">
            <el-input v-model="row.standard_score" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="class_rank" label="班级排名" width="100">
          <template #default="{ row }">
            <el-input v-model="row.class_rank" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="school_rank" label="年级排名" width="100">
          <template #default="{ row }">
            <el-input v-model="row.school_rank" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150" fixed="right">
          <template #default="{ row }">
            <el-tag v-if="row._status === 'pending'" type="info">待提交</el-tag>
            <el-tag v-else-if="row._status === 'success'" type="success"
              >成功</el-tag
            >
            <el-tooltip
              v-else-if="row._status === 'error'"
              :content="row._error"
              placement="top"
            >
              <el-tag type="danger">失败: {{ row._error }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right" align="center">
          <template #default="{ $index }">
            <el-button
              type="danger"
              icon="Delete"
              circle
              size="small"
              @click="removeImportRow($index)"
            />
          </template>
        </el-table-column>
      </el-table>
      <div v-if="importing" class="mt-4">
        <div
          class="progress-info mb-2"
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <span>导入进度</span>
          <span>{{ currentImportIndex }} / {{ totalImportCount }}</span>
        </div>
        <el-progress
          :text-inside="true"
          :stroke-width="20"
          :percentage="importProgress"
          status="success"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false" :disabled="importing">
            取消
          </el-button>
          <el-button
            type="danger"
            @click="cancelImportProcess"
            v-if="importing"
          >
            停止导入
          </el-button>
          <el-button
            type="primary"
            @click="submitImport"
            :loading="importing"
            :disabled="importData.length === 0"
            v-else
          >
            提交 ({{ importData.length }})
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { adminAPI } from "@/api/admin";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { Search, ArrowLeft, Delete } from "@element-plus/icons-vue";
import * as XLSX from "xlsx";

const BATCH_LIMIT = 200;

const route = useRoute();
const router = useRouter();

const examId = route.params.examId;

const loading = ref(false);
const gradeList = ref([]);
const searchQuery = ref("");
const selectedSubject = ref("");
const filteredGrades = ref([]);
const examDetails = ref(null);

// 导入相关
const fileInput = ref(null);
const importDialogVisible = ref(false);
const importData = ref([]);
const importing = ref(false);
const exportLoading = ref(false);
const importProgress = ref(0);
const isImportCancelled = ref(false);
const currentImportIndex = ref(0);
const totalImportCount = ref(0);

// 删除相关
const tableRef = ref(null);
const selectedRows = ref([]);
const singleDeletingId = ref(null);
const batchDeleting = ref(false);

const examTypeName = computed(() => {
  const t = examDetails.value?.exam_type;
  if (t === 1) return "期中";
  if (t === 2) return "期末";
  return null;
});

// v1.2.1：仅手动录入考试 (source=2) 的成绩可删；智学网同步 (source=1) 不可删
const canDelete = computed(() => examDetails.value?.source === 2);
const notDeletableHint = "智学网同步的考试成绩不可删除";

const singleDeleteTitle = computed(() => {
  const base = "确认删除该条成绩？";
  return examTypeName.value
    ? `${base}\n该考试为${examTypeName.value}成绩，对应内部综合成绩将被重新计算。删除后无法恢复。`
    : `${base}\n删除后无法恢复。`;
});

const handleSelectionChange = (rows) => {
  selectedRows.value = rows || [];
};

const clearTableSelection = () => {
  if (tableRef.value && typeof tableRef.value.clearSelection === "function") {
    tableRef.value.clearSelection();
  }
  selectedRows.value = [];
};

const goBack = () => {
  router.back();
};

const fetchExamDetails = async () => {
  try {
    const res = await adminAPI.getExamDetails(examId);
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
    const res = await adminAPI.getExamGrades(examId);
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
  // 切筛选条件时清空选中（PRD §4.1 reserveSelection=false 行为）
  clearTableSelection();
};

const handleSingleDelete = async (row) => {
  if (!row.grade_id) {
    ElMessage.warning("该行缺少 grade_id，无法删除");
    return;
  }
  singleDeletingId.value = row.grade_id;
  try {
    await adminAPI.deleteOriginGrade(row.grade_id);
    ElMessage.success("已删除");
    await fetchGrades();
  } catch (e) {
    // 错误提示由 axios interceptor 统一处理
  } finally {
    singleDeletingId.value = null;
  }
};

const handleBatchDelete = async () => {
  const rows = selectedRows.value;
  if (rows.length === 0) return;
  if (rows.length > BATCH_LIMIT) {
    ElMessage.warning(`单次最多删除 ${BATCH_LIMIT} 条`);
    return;
  }

  const ids = rows.map((r) => r.grade_id).filter(Boolean);
  if (ids.length === 0) {
    ElMessage.warning("选中行缺少 grade_id");
    return;
  }
  const N = ids.length;
  // 本页所有行共享同一 exam_type，X = 期中/期末场景下选中条数
  const examType = examDetails.value?.exam_type;
  const X = examType === 1 || examType === 2 ? N : 0;
  // Y = 受影响 Grade 行数（按学生+学科+学期去重）
  const Y = X > 0
    ? new Set(rows.map((r) => `${r.student_id}|${r.subject_code}`)).size
    : 0;

  const message =
    X > 0
      ? `确认删除选中的 ${N} 条成绩？\n其中 ${X} 条为期中/期末成绩，将触发 ${Y} 名学生的综合成绩重新计算。\n删除后无法恢复。`
      : `确认删除选中的 ${N} 条成绩？\n删除后无法恢复。`;

  try {
    await ElMessageBox.confirm(message, "批量删除", {
      confirmButtonText: "确认删除",
      confirmButtonClass: "el-button--danger",
      cancelButtonText: "取消",
      type: "warning",
      dangerouslyUseHTMLString: false,
    });
  } catch {
    return; // 用户取消
  }

  batchDeleting.value = true;
  try {
    const res = await adminAPI.batchDeleteOriginGrades(ids);
    const data = res.data || {};
    const total = data.total || 0;
    const successCount = data.success_count || 0;
    const failCount = data.fail_count || 0;

    if (failCount === 0) {
      ElMessage.success(`已删除 ${successCount} 条成绩`);
      clearTableSelection();
      await fetchGrades();
    } else if (successCount === 0) {
      ElMessage.error(`全部 ${total} 条删除失败`);
    } else {
      const failItems = (data.results || []).filter((r) => r.status === "fail");
      const failHtml = failItems
        .slice(0, 30)
        .map((r) => `<li>${r.grade_id}: ${r.reason || "未知原因"}</li>`)
        .join("");
      const more = failItems.length > 30 ? `<p>仅显示前 30 项，共 ${failItems.length} 项失败</p>` : "";
      try {
        await ElMessageBox.alert(
          `<p>成功 ${successCount} 条，失败 ${failCount} 条。</p><ul>${failHtml}</ul>${more}`,
          "批量删除部分成功",
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "知道了",
          },
        );
      } catch {}
      clearTableSelection();
      await fetchGrades();
    }
  } catch (e) {
    // axios interceptor 已弹错误 toast
  } finally {
    batchDeleting.value = false;
  }
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

// 下载导入模板
const handleDownloadTemplate = () => {
  const headers = ["姓名", "年级", "班级", "科目", "试卷名称", "原始分", "标准分", "班级排名", "年级排名"];
  const sampleData = [
    ["张三", "高一", "6班", "语文", "2023-2024学年第一学期考试", "85", "100", "28", "48"],
  ];
  const data = [headers, ...sampleData];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "导入模板");
  XLSX.writeFile(wb, "考试成绩导入模板.xlsx");
};

const handleExport = () => {
  if (filteredGrades.value.length === 0) {
    ElMessage.warning("暂无数据可导出");
    return;
  }

  exportLoading.value = true;
  try {
    const dataToExport = filteredGrades.value.map((item) => ({
      姓名: item.student_name,
      年级: item.year_name,
      班级: item.class_name,
      科目: item.subject_name,
      试卷名称: item.topic_set_name,
      原始分: item.score,

      标准分: item.standard_score,
      班级排名: item.class_rank,
      年级排名: item.school_rank,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "成绩列表");

    const fileName = `${examDetails.value?.exam_name || "考试"}成绩.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error("Export error:", error);
    ElMessage.error("导出失败");
  } finally {
    exportLoading.value = false;
  }
};

// 导入功能
const triggerImport = () => {
  fileInput.value.click();
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const loadingInstance = ElLoading.service({
    lock: true,
    text: "正在解析 Excel 文件...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  const reader = new FileReader();
  reader.onload = (e) => {
    // Use setTimeout to allow the UI to render the loading state before heavy parsing
    setTimeout(() => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const results = XLSX.utils.sheet_to_json(worksheet);

        importData.value = results.map((row) => ({
          student_name: row["姓名"] || "",
          year_name: String(row["年级"] || row["学年"] || ""),
          class_name: String(row["班级"] || ""),
          subject_name: row["科目"] || "",
          topic_set_name: row["试卷名称"] || "",
          score: String(row["原始分"] || ""),
          standard_score: String(row["标准分"] || ""),
          class_rank: parseInt(row["班级排名"] || 0),
          school_rank: parseInt(row["年级排名"] || 0),
          _status: "pending",
          _error: "",
        }));

        importDialogVisible.value = true;
      } catch (error) {
        console.error("Parse excel error:", error);
        ElMessage.error("解析文件失败，请检查文件格式");
      } finally {
        // Clear input so same file can be selected again
        fileInput.value.value = "";
        loadingInstance.close();
      }
    }, 100);
  };
  reader.onerror = () => {
    ElMessage.error("文件读取失败");
    loadingInstance.close();
    fileInput.value.value = "";
  };
  reader.readAsArrayBuffer(file);
};

const handleBeforeClose = (done) => {
  if (importing.value) {
    ElMessage.warning("正在导入中，请勿关闭窗口");
    return;
  }
  done();
};

const removeImportRow = (index) => {
  importData.value.splice(index, 1);
};

const cancelImportProcess = () => {
  isImportCancelled.value = true;
};

const submitImport = async () => {
  if (importData.value.length === 0) return;

  importing.value = true;
  isImportCancelled.value = false;
  importProgress.value = 0;
  currentImportIndex.value = 0;
  totalImportCount.value = importData.value.length;
  let successCount = 0;
  let failCount = 0;
  const total = totalImportCount.value;

  const CONCURRENCY_LIMIT = 5;
  const pool = [];

  // Store results in a temporary Map to avoid frequent reactive updates
  const resultsMap = new Map(); // index -> { status, error }
  let completedCount = 0;

  // Flush updates to UI every 100ms

  const updateInterval = setInterval(() => {
    currentImportIndex.value = completedCount;
    importProgress.value = Math.floor((completedCount / total) * 100);
  }, 1000);

  const processRow = async (row, index) => {
    if (isImportCancelled.value) return;

    // Skip already successful ones
    if (row._status === "success") {
      completedCount++;
      return;
    }

    try {
      const payload = {
        year_name: row.year_name,
        class_name: row.class_name,
        student_name: row.student_name,
        score: row.score,
        standard_score: row.standard_score,
        topic_set_name: row.topic_set_name,
        class_rank: row.class_rank,
        subject_name: row.subject_name,
        school_rank: row.school_rank,
        student_id: "",
      };

      await adminAPI.addOriginExamGrade(examId, payload);
      resultsMap.set(index, { status: "success", error: "" });
      successCount++;
    } catch (error) {
      resultsMap.set(index, {
        status: "error",
        error: error.response?.data?.detail || "提交失败",
      });
      failCount++;
    } finally {
      completedCount++;
    }
  };

  for (let i = 0; i < total; i++) {
    if (isImportCancelled.value) {
      ElMessage.info("导入已取消");
      break;
    }

    const row = importData.value[i];
    const p = processRow(row, i);

    // Attach cleanup to promise
    const pWithCleanup = p.then(() => {
      const idx = pool.indexOf(pWithCleanup);
      if (idx > -1) pool.splice(idx, 1);
    });

    pool.push(pWithCleanup);

    // If pool size reaches limit, wait for one to finish
    if (pool.length >= CONCURRENCY_LIMIT) {
      await Promise.race(pool);
    }
  }

  // Wait for remaining tasks
  await Promise.all(pool);

  // Clear interval
  clearInterval(updateInterval);

  // Final flush: Apply all statuses to rows
  resultsMap.forEach((result, index) => {
    const row = importData.value[index];
    if (row) {
      row._status = result.status;
      row._error = result.error;
    }
  });

  // Final progress update
  currentImportIndex.value = completedCount;
  importProgress.value = Math.floor((completedCount / total) * 100);

  // Remove successful rows
  importData.value = importData.value.filter(
    (item) => item._status !== "success",
  );

  importing.value = false;
  importProgress.value = 0;

  if (isImportCancelled.value) {
    fetchGrades(); // Refresh even if cancelled to show partial success
    return;
  }

  if (importData.value.length === 0) {
    ElMessage.success(`成功导入 ${successCount} 条数据`);
    importDialogVisible.value = false;
    fetchGrades(); // Refresh list
  } else {
    ElMessage.warning(
      `导入完成：成功 ${successCount} 条，失败 ${failCount} 条。请检查失败项并重试。`,
    );
    fetchGrades(); // Refresh list to show successful ones
  }
};

onMounted(() => {
  fetchExamDetails();
  fetchGrades();
});
</script>

<style scoped>
.semester-exam-grades {
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

.batch-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.batch-toolbar .selected-count {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.batch-toolbar .batch-warning {
  color: var(--el-color-danger);
  font-size: 13px;
}
</style>
