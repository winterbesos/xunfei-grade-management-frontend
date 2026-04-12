<template>
  <div class="historical-import-tab">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" style="margin-bottom: 16px">
      <el-breadcrumb-item @click="goTo('semesters')" style="cursor:pointer">历史学期</el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentView !== 'semesters'" @click="goTo('exams')" style="cursor:pointer">
        {{ selectedSemester?.semester_name }}
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentView === 'exam-detail'">
        {{ selectedExam?.exam_name }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 历史学期列表 -->
    <div v-if="currentView === 'semesters'">
      <div style="margin-bottom: 12px; text-align: right">
        <el-button type="primary" @click="showCreateSemesterDialog = true">+ 新建历史学期</el-button>
      </div>
      <el-table v-loading="semestersLoading" :data="semesters" stripe style="width: 100%">
        <el-table-column prop="academic_year_name" label="学年" width="180" />
        <el-table-column prop="term_name" label="学期" width="120" />
        <el-table-column prop="semester_name" label="全称" min-width="180" show-overflow-tooltip />
        <el-table-column label="起止时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.begin_time) }} ~ {{ formatDate(row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="selectSemester(row)">查看成绩导入</el-button>
            <el-popconfirm title="确认删除？仅允许删除无成绩数据的学期。" @confirm="deleteSemester(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 考试列表 -->
    <div v-if="currentView === 'exams'">
      <div style="margin-bottom: 12px; text-align: right">
        <el-button type="primary" @click="showCreateExamDialog = true">+ 新建学期科目成绩</el-button>
      </div>
      <el-table v-loading="examsLoading" :data="exams" stripe style="width: 100%">
        <el-table-column label="历史年级" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.grade_name || gradeCodeMap[row.grade_code] || row.grade_code }}
          </template>
        </el-table-column>
        <el-table-column label="当前等效年级" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.current_equiv_grade_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="科目" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ subjectMap[row.subject_code] || row.subject_code }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="selectExam(row)">查看成绩导入</el-button>
            <el-popconfirm title="确认删除？仅允许删除无成绩数据的考试。" @confirm="deleteExam(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 考试详情 & 导入 -->
    <div v-if="currentView === 'exam-detail'">
      <div style="margin-bottom: 16px; display: flex; justify-content: flex-end; gap: 8px">
        <el-button @click="handleDownloadTemplate" :loading="downloading">下载成绩模板</el-button>
        <el-button type="primary" @click="triggerUpload" :loading="importing">上传成绩文件</el-button>
        <input ref="fileInputRef" type="file" accept=".xlsx" style="display:none" @change="handleFileChange" />
      </div>

      <!-- 本次导入结果 -->
      <div v-if="lastResult">
        <el-divider content-position="left">本次导入结果</el-divider>
        <el-row :gutter="16" style="margin-bottom: 16px">
          <el-col :span="6"><el-statistic title="总行数" :value="lastResult.total_rows" /></el-col>
          <el-col :span="6"><el-statistic title="成功行数" :value="lastResult.success_rows" /></el-col>
          <el-col :span="6"><el-statistic title="跳过行数" :value="lastResult.skip_rows" /></el-col>
          <el-col :span="6"><el-statistic title="失败行数" :value="lastResult.fail_rows" /></el-col>
        </el-row>
        <el-table :data="lastResult.details" stripe border max-height="360">
          <el-table-column prop="row" label="行号" width="70" align="center" />
          <el-table-column prop="student_name" label="学生姓名" width="100" />
          <el-table-column prop="class_name" label="班级" width="120" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="usual_score" label="平时分" width="75" align="center" />
          <el-table-column prop="midterm_score" label="期中分" width="75" align="center" />
          <el-table-column prop="final_score" label="期末分" width="75" align="center" />
          <el-table-column prop="score" label="综合分" width="75" align="center" />
          <el-table-column prop="reason" label="失败原因" min-width="160" show-overflow-tooltip />
        </el-table>
        <div style="margin-top: 8px; text-align: right">
          <el-button size="small" @click="exportReport(lastResult.log_id)">导出本次报告</el-button>
        </div>
      </div>

      <!-- 历次导入记录 -->
      <el-divider content-position="left">历次导入记录</el-divider>
      <el-table v-loading="logsLoading" :data="importLogs" stripe style="width: 100%">
        <el-table-column prop="file_name" label="文件名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="total_rows" label="总行数" width="80" align="center" />
        <el-table-column prop="success_rows" label="成功" width="70" align="center" />
        <el-table-column prop="skip_rows" label="跳过" width="70" align="center" />
        <el-table-column prop="fail_rows" label="失败" width="70" align="center" />
        <el-table-column label="导入时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewLogDetail(row)">查看详情</el-button>
            <el-button link @click="exportReport(row.log_id)">导出</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新建历史学期 Dialog -->
    <el-dialog v-model="showCreateSemesterDialog" title="新建历史学期" width="520px" @close="semesterForm = { academic_year_name: '', term_name: '' }; semesterFormRef?.clearValidate()">
      <el-form :model="semesterForm" label-width="80px" :rules="semesterRules" ref="semesterFormRef">
        <el-form-item label="学年" prop="academic_year_name">
          <el-select v-model="semesterForm.academic_year_name" placeholder="请选择学年" style="width:100%">
            <el-option v-for="y in academicYearOptions" :key="y" :label="y" :value="y" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="term_name">
          <el-select v-model="semesterForm.term_name" placeholder="请选择学期" style="width:100%">
            <el-option value="第一学期" label="第一学期" />
            <el-option value="第二学期" label="第二学期" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateSemesterDialog = false">取消</el-button>
        <el-button type="primary" :loading="semesterSubmitting" @click="createSemester">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 新建学期科目成绩 Dialog -->
    <el-dialog v-model="showCreateExamDialog" title="新建学期科目成绩" width="500px" @close="examForm = { current_grade_code: null, subject_code: null, remark: '' }; examFormRef?.clearValidate()">
      <el-form :model="examForm" label-width="80px" :rules="examRules" ref="examFormRef">
        <el-form-item label="当前年级" prop="current_grade_code">
          <el-select v-model="examForm.current_grade_code" placeholder="请选择当前年级" style="width:100%">
            <el-option v-for="g in gradeCodes" :key="g.code" :label="g.name" :value="g.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="历史年级">
          <el-input
            :value="inferredHistGradeName"
            disabled
            :placeholder="inferredHistGradeInvalid ? '推断年级不存在，请换一个当前年级' : '根据当前年级自动推断'"
            :class="{ 'is-error': inferredHistGradeInvalid }"
          />
          <div v-if="inferredHistGradeInvalid" style="color: #f56c6c; font-size: 12px; margin-top: 4px;">
            该学期对应的历史年级不存在于当前学校年级列表中，无法创建
          </div>
        </el-form-item>
        <el-form-item label="科目" prop="subject_code">
          <el-select v-model="examForm.subject_code" placeholder="请选择科目" style="width:100%">
            <el-option v-for="s in subjects" :key="s.subject_code" :label="s.subject_name" :value="s.subject_code" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="examForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateExamDialog = false">取消</el-button>
        <el-button type="primary" :loading="examSubmitting" :disabled="inferredHistGradeInvalid" @click="createExam">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 导入详情 Dialog -->
    <el-dialog v-model="logDetailVisible" title="导入详情" width="800px">
      <el-table v-loading="logDetailLoading" :data="logDetail" stripe border max-height="500">
        <el-table-column prop="row" label="行号" width="70" align="center" />
        <el-table-column prop="student_name" label="学生姓名" width="100" />
        <el-table-column prop="class_name" label="班级" width="120" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usual_score" label="平时分" width="75" align="center" />
        <el-table-column prop="midterm_score" label="期中分" width="75" align="center" />
        <el-table-column prop="final_score" label="期末分" width="75" align="center" />
        <el-table-column prop="score" label="综合分" width="75" align="center" />
        <el-table-column prop="reason" label="失败原因" min-width="160" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { maintenanceAPI } from "@/api/maintenance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const props = defineProps({ schoolId: { type: String, required: true } });

// 静态学年选项：从当前学年往前 7 年
const currentYear = new Date().getFullYear();
const academicStartYear = new Date().getMonth() >= 8 ? currentYear : currentYear - 1; // 9月前属于上一学年
const academicYearOptions = Array.from({ length: 7 }, (_, i) => {
  const start = academicStartYear - i;
  return `${start}-${start + 1}学年`;
});

const currentView = ref("semesters");
const selectedSemester = ref(null);
const selectedExam = ref(null);

// 学期
const semestersLoading = ref(false);
const semesters = ref([]);
const showCreateSemesterDialog = ref(false);
const semesterSubmitting = ref(false);
const semesterFormRef = ref(null);
const semesterForm = ref({ academic_year_name: "", term_name: "" });
const semesterRules = {
  academic_year_name: [{ required: true, message: "请选择学年", trigger: "change" }],
  term_name: [{ required: true, message: "请选择学期", trigger: "change" }],
  term_range: [{ required: true, message: "请选择学期起止", trigger: "change" }],
};

// 考试
const examsLoading = ref(false);
const exams = ref([]);
const showCreateExamDialog = ref(false);
const examSubmitting = ref(false);
const examFormRef = ref(null);
const examForm = ref({ current_grade_code: null, subject_code: null, remark: "" });
const examRules = {
  current_grade_code: [{ required: true, message: "请选择当前年级", trigger: "change" }],
  subject_code: [{ required: true, message: "请选择科目", trigger: "change" }],
};

// 根据当前年级推断历史年级
const inferredHistGradeCode = computed(() => {
  if (!examForm.value.current_grade_code) return null;
  const diff = semesterYearDiff.value;
  if (diff <= 0) return examForm.value.current_grade_code;
  const code = examForm.value.current_grade_code;
  const histCode = String(parseInt(code) - diff).padStart(code.length, '0');
  return parseInt(histCode) > 0 ? histCode : null;
});

const inferredHistGradeInvalid = computed(() => {
  if (!examForm.value.current_grade_code) return false;
  if (!inferredHistGradeCode.value) return true;
  return !gradeCodeMap.value[inferredHistGradeCode.value];
});

const inferredHistGradeName = computed(() => {
  if (!inferredHistGradeCode.value) return '';
  return gradeCodeMap.value[inferredHistGradeCode.value] || '';
});

// 年级/科目选项
const subjects = ref([]);
const gradeCodes = ref([]);
const subjectMap = computed(() => {
  const m = {};
  subjects.value.forEach(s => { m[s.subject_code] = s.subject_name; });
  return m;
});

const gradeCodeMap = computed(() => {
  const m = {};
  gradeCodes.value.forEach(g => { m[g.code] = g.name; });
  return m;
});

// 根据选中的学期学年名计算年份差（正数表示几年前）
const semesterYearDiff = computed(() => {
  const name = selectedSemester.value?.academic_year_name || '';
  const m = name.match(/(\d{4})-\d{4}学年/);
  if (!m) return 0;
  const histYear = parseInt(m[1]);
  const now = new Date();
  const currentAyYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return currentAyYear - histYear;
});


// 导入
const fileInputRef = ref(null);
const importing = ref(false);
const downloading = ref(false);
const lastResult = ref(null);
const logsLoading = ref(false);
const importLogs = ref([]);
const logDetailVisible = ref(false);
const logDetailLoading = ref(false);
const logDetail = ref([]);

const formatDate = (dt) => (dt ? dayjs(dt).format("YYYY-MM-DD") : "-");
const formatDateTime = (dt) => (dt ? dayjs.utc(dt).local().format("YYYY-MM-DD HH:mm") : "-");
const examTypeLabel = (t) => ({ 1: "期中", 2: "期末", 3: "月考", 4: "其他" }[t] || t);
const statusType = (s) => ({ success: "success", skip: "warning", fail: "danger" }[s] || "info");
const statusLabel = (s) => ({ success: "成功", skip: "跳过", fail: "失败" }[s] || s);

const goTo = (view) => {
  if (view === "semesters") { currentView.value = "semesters"; selectedSemester.value = null; selectedExam.value = null; }
  if (view === "exams") { currentView.value = "exams"; selectedExam.value = null; }
};

const fetchSemesters = async () => {
  semestersLoading.value = true;
  try {
    const res = await maintenanceAPI.getHistoricalSemesters(props.schoolId);
    semesters.value = res.data || [];
  } catch { ElMessage.error("获取历史学期失败"); }
  finally { semestersLoading.value = false; }
};

const createSemester = async () => {
  await semesterFormRef.value?.validate();
  semesterSubmitting.value = true;
  try {
    await maintenanceAPI.createHistoricalSemester({
      school_id: props.schoolId,
      academic_year_name: semesterForm.value.academic_year_name,
      term_name: semesterForm.value.term_name,
    });
    ElMessage.success("历史学期创建成功");
    showCreateSemesterDialog.value = false;
    semesterForm.value = { academic_year_name: "", term_name: "" };
    fetchSemesters();
  } catch { } finally { semesterSubmitting.value = false; }
};

const deleteSemester = async (row) => {
  try {
    await maintenanceAPI.deleteHistoricalSemester(row.semester_id);
    ElMessage.success("删除成功");
    fetchSemesters();
  } catch { }
};

const selectSemester = async (row) => {
  selectedSemester.value = row;
  currentView.value = "exams";
  fetchExams(row.semester_id);
  fetchSubjectsAndGrades();
};

const fetchExams = async (semesterId) => {
  examsLoading.value = true;
  try {
    const res = await maintenanceAPI.getHistoricalExams(semesterId);
    exams.value = res.data || [];
  } catch { ElMessage.error("获取考试列表失败"); }
  finally { examsLoading.value = false; }
};

const fetchSubjectsAndGrades = async () => {
  try {
    const [subRes, classRes] = await Promise.all([
      maintenanceAPI.getSchoolSubjects(props.schoolId),
      maintenanceAPI.getSchoolClasses(props.schoolId),
    ]);
    subjects.value = subRes.data || [];
    const gradeSet = new Map();
    for (const cls of (classRes.data || [])) {
      if (cls.year_code && !gradeSet.has(cls.year_code)) {
        gradeSet.set(cls.year_code, cls.year_name || cls.year_code);
      }
    }
    gradeCodes.value = [...gradeSet.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => parseInt(a.code) - parseInt(b.code));
  } catch { }
};

const createExam = async () => {
  await examFormRef.value?.validate();
  examSubmitting.value = true;
  try {
    if (!inferredHistGradeCode.value) {
      ElMessage.error("无法推断历史年级，请检查学期设置");
      return;
    }
    await maintenanceAPI.createHistoricalExam(selectedSemester.value.semester_id, {
      grade_code: inferredHistGradeCode.value,
      subject_code: examForm.value.subject_code,
      remark: examForm.value.remark,
    });
    ElMessage.success("创建成功");
    showCreateExamDialog.value = false;
    examForm.value = { current_grade_code: null, subject_code: null, remark: "" };
    fetchExams(selectedSemester.value.semester_id);
  } catch { } finally { examSubmitting.value = false; }
};

const deleteExam = async (row) => {
  try {
    await maintenanceAPI.deleteHistoricalExam(row.exam_id);
    ElMessage.success("删除成功");
    fetchExams(selectedSemester.value.semester_id);
  } catch { }
};

const selectExam = async (row) => {
  selectedExam.value = row;
  currentView.value = "exam-detail";
  lastResult.value = null;
  fetchLogs(row.exam_id);
};

const fetchLogs = async (examId) => {
  logsLoading.value = true;
  try {
    const res = await maintenanceAPI.getHistoricalImportLogs(examId);
    importLogs.value = res.data || [];
  } catch { } finally { logsLoading.value = false; }
};

const handleDownloadTemplate = async () => {
  downloading.value = true;
  try {
    const res = await maintenanceAPI.downloadHistoricalTemplate(selectedExam.value.exam_id);
    const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const disposition = res.headers?.["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?(.+)/i);
    a.download = match ? decodeURIComponent(match[1]) : "成绩导入模板.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch { ElMessage.error("下载模板失败"); }
  finally { downloading.value = false; }
};

const triggerUpload = () => fileInputRef.value?.click();

const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.name.endsWith(".xlsx")) { ElMessage.error("请上传 .xlsx 格式文件"); return; }
  if (file.size > 10 * 1024 * 1024) { ElMessage.error("文件大小超过 10MB"); return; }
  const formData = new FormData();
  formData.append("file", file);
  importing.value = true;
  try {
    const res = await maintenanceAPI.importHistoricalGrades(selectedExam.value.exam_id, formData);
    lastResult.value = res.data;
    ElMessage.success(`导入完成：成功 ${res.data.success_rows} 行，跳过 ${res.data.skip_rows} 行，失败 ${res.data.fail_rows} 行`);
    fetchLogs(selectedExam.value.exam_id);
  } catch { } finally { importing.value = false; e.target.value = ""; }
};

const viewLogDetail = async (log) => {
  logDetailVisible.value = true;
  logDetailLoading.value = true;
  try {
    const res = await maintenanceAPI.getHistoricalImportLogDetail(log.log_id);
    logDetail.value = res.data?.details || [];
  } catch { ElMessage.error("获取详情失败"); }
  finally { logDetailLoading.value = false; }
};

const exportReport = async (logId) => {
  try {
    const res = await maintenanceAPI.exportHistoricalImportReport(logId);
    const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "导入结果报告.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch { ElMessage.error("导出失败"); }
};

onMounted(() => {
  fetchSemesters();
  fetchSubjectsAndGrades();
});
</script>
