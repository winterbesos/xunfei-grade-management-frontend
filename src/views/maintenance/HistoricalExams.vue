<template>
  <div class="historical-exams">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ name: 'maintenanceHistoricalImport' }">历史成绩导入</el-breadcrumb-item>
      <el-breadcrumb-item>{{ semester?.semester_name || semesterId }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card style="margin-top: 16px">
      <template #header>
        <div class="card-header">
          <span>考试列表</span>
          <el-button type="primary" @click="showCreateDialog = true">+ 新建考试</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="exams" stripe style="width: 100%">
        <el-table-column prop="exam_name" label="考试名称" min-width="180" />
        <el-table-column label="考试类型" width="100">
          <template #default="{ row }">{{ examTypeLabel(row.exam_type) }}</template>
        </el-table-column>
        <el-table-column label="涉及年级" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ (row.grade_codes || []).join("、") }}</template>
        </el-table-column>
        <el-table-column label="涉及科目" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ (row.subject_codes || []).map(c => subjectMap[c] || c).join("、") }}
          </template>
        </el-table-column>
        <el-table-column prop="exam_date" label="考试日期" width="120">
          <template #default="{ row }">{{ formatDate(row.exam_date) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToDetail(row)">成绩导入</el-button>
            <el-popconfirm title="确认删除该考试？仅允许删除无成绩数据的考试。" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建考试 Dialog -->
    <el-dialog v-model="showCreateDialog" title="新建历史考试" width="540px">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="考试名称" prop="exam_name">
          <el-input v-model="form.exam_name" placeholder="如：2022年期末考试" />
        </el-form-item>
        <el-form-item label="考试类型" prop="exam_type">
          <el-select v-model="form.exam_type" placeholder="请选择" style="width: 100%">
            <el-option :value="1" label="期中" />
            <el-option :value="2" label="期末" />
            <el-option :value="3" label="月考" />
            <el-option :value="4" label="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="涉及年级" prop="grade_codes">
          <el-select
            v-model="form.grade_codes"
            multiple
            placeholder="请选择年级"
            style="width: 100%"
          >
            <el-option
              v-for="g in gradeCodes"
              :key="g.code"
              :label="g.name"
              :value="g.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="涉及科目" prop="subject_codes">
          <el-select
            v-model="form.subject_codes"
            multiple
            placeholder="请选择科目"
            style="width: 100%"
          >
            <el-option
              v-for="s in subjects"
              :key="s.subject_code"
              :label="s.subject_name"
              :value="s.subject_code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考试日期">
          <el-date-picker v-model="form.exam_time" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { maintenanceAPI } from "@/api/maintenance";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const semesterId = route.params.semesterId;

const loading = ref(false);
const submitting = ref(false);
const showCreateDialog = ref(false);
const exams = ref([]);
const semester = ref(null);
const subjects = ref([]);
const gradeCodes = ref([]);
const formRef = ref(null);

const subjectMap = computed(() => {
  const m = {};
  subjects.value.forEach(s => { m[s.subject_code] = s.subject_name; });
  return m;
});

const form = ref({
  exam_name: "",
  exam_type: null,
  grade_codes: [],
  subject_codes: [],
  exam_time: "",
  remark: "",
});

const rules = {
  exam_name: [{ required: true, message: "请填写考试名称", trigger: "blur" }],
  exam_type: [{ required: true, message: "请选择考试类型", trigger: "change" }],
  grade_codes: [{ required: true, type: "array", min: 1, message: "请选择涉及年级", trigger: "change" }],
  subject_codes: [{ required: true, type: "array", min: 1, message: "请选择涉及科目", trigger: "change" }],
};

const examTypeLabel = (t) => ({ 1: "期中", 2: "期末", 3: "月考", 4: "其他" }[t] || t);
const formatDate = (dt) => (dt ? dayjs(dt).format("YYYY-MM-DD") : "-");

const fetchSemester = async () => {
  try {
    const res = await maintenanceAPI.getHistoricalSemesters();
    semester.value = (res.data || []).find(s => s.semester_id === semesterId) || null;
  } catch {
    // 忽略
  }
};

const fetchExams = async () => {
  loading.value = true;
  try {
    const res = await maintenanceAPI.getHistoricalExams(semesterId);
    exams.value = res.data || [];
  } catch {
    ElMessage.error("获取考试列表失败");
  } finally {
    loading.value = false;
  }
};

const fetchSubjectsAndGrades = async () => {
  const schoolId = semester.value?.school_id;
  if (!schoolId) return;
  try {
    const [subRes, classRes] = await Promise.all([
      maintenanceAPI.getSchoolSubjects(schoolId),
      maintenanceAPI.getSchoolClasses(schoolId),
    ]);
    subjects.value = subRes.data || [];
    // 提取唯一年级
    const gradeSet = new Map();
    for (const cls of (classRes.data || [])) {
      if (cls.grade_code && !gradeSet.has(cls.grade_code)) {
        gradeSet.set(cls.grade_code, cls.year_name || cls.grade_code);
      }
    }
    gradeCodes.value = [...gradeSet.entries()].map(([code, name]) => ({ code, name }));
  } catch {
    // 忽略
  }
};

const handleCreate = async () => {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    await maintenanceAPI.createHistoricalExam(semesterId, {
      exam_name: form.value.exam_name,
      exam_type: form.value.exam_type,
      grade_codes: form.value.grade_codes,
      subject_codes: form.value.subject_codes,
      exam_time: form.value.exam_time || null,
      remark: form.value.remark,
    });
    ElMessage.success("考试创建成功");
    showCreateDialog.value = false;
    form.value = { exam_name: "", exam_type: null, grade_codes: [], subject_codes: [], exam_time: "", remark: "" };
    fetchExams();
  } catch {
    // 错误已由 request 拦截器处理
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (row) => {
  try {
    await maintenanceAPI.deleteHistoricalExam(row.exam_id);
    ElMessage.success("删除成功");
    fetchExams();
  } catch {
    // 错误已由 request 拦截器处理
  }
};

const goToDetail = (row) => {
  router.push({
    name: "maintenanceHistoricalExamDetail",
    params: { semesterId, examId: row.exam_id },
  });
};

onMounted(async () => {
  await fetchSemester();
  await Promise.all([fetchExams(), fetchSubjectsAndGrades()]);
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-breadcrumb {
  margin-bottom: 4px;
}
</style>
