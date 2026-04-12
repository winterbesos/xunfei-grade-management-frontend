<template>
  <div class="historical-import">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>历史成绩导入 — 历史学期管理</span>
          <el-button type="primary" @click="showCreateDialog = true">
            + 新建历史学期
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="semesters" stripe style="width: 100%">
        <el-table-column prop="academic_year_name" label="学年" width="180" />
        <el-table-column prop="term_name" label="学期" width="120" />
        <el-table-column prop="semester_name" label="全称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="school_name" label="学校" width="180" />
        <el-table-column label="起止时间" width="220">
          <template #default="{ row }">
            {{ formatDate(row.begin_time) }} ~ {{ formatDate(row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToExams(row)">查看考试</el-button>
            <el-popconfirm
              title="确认删除该历史学期？仅允许删除无成绩数据的学期。"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建历史学期 Dialog -->
    <el-dialog v-model="showCreateDialog" title="新建历史学期" width="520px">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="所属学校" prop="school_id">
          <el-select v-model="form.school_id" placeholder="请选择学校" style="width: 100%" filterable>
            <el-option
              v-for="s in schools"
              :key="s.school_id"
              :label="s.school_name"
              :value="s.school_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学年名称" prop="academic_year_name">
          <el-input v-model="form.academic_year_name" placeholder="如：2022-2023学年" />
        </el-form-item>
        <el-form-item label="学年起止" prop="academic_year_range">
          <el-date-picker
            v-model="form.academic_year_range"
            type="daterange"
            start-placeholder="学年开始"
            end-placeholder="学年结束"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="学期名称" prop="term_name">
          <el-input v-model="form.term_name" placeholder="如：第一学期" />
        </el-form-item>
        <el-form-item label="学期起止" prop="term_range">
          <el-date-picker
            v-model="form.term_range"
            type="daterange"
            start-placeholder="学期开始"
            end-placeholder="学期结束"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="如：历史归档数据" />
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { maintenanceAPI } from "@/api/maintenance";
import dayjs from "dayjs";

const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const showCreateDialog = ref(false);
const semesters = ref([]);
const schools = ref([]);
const formRef = ref(null);

const form = ref({
  school_id: "",
  academic_year_name: "",
  academic_year_range: [],
  term_name: "",
  term_range: [],
  remark: "",
});

const rules = {
  school_id: [{ required: true, message: "请选择学校", trigger: "change" }],
  academic_year_name: [{ required: true, message: "请填写学年名称", trigger: "blur" }],
  academic_year_range: [{ required: true, message: "请选择学年起止时间", trigger: "change" }],
  term_name: [{ required: true, message: "请填写学期名称", trigger: "blur" }],
  term_range: [{ required: true, message: "请选择学期起止时间", trigger: "change" }],
};

const formatDate = (dt) => (dt ? dayjs(dt).format("YYYY-MM-DD") : "-");

const fetchSemesters = async () => {
  loading.value = true;
  try {
    const res = await maintenanceAPI.getHistoricalSemesters();
    semesters.value = res.data || [];
  } catch {
    ElMessage.error("获取历史学期列表失败");
  } finally {
    loading.value = false;
  }
};

const fetchSchools = async () => {
  try {
    const res = await maintenanceAPI.getSchools();
    schools.value = res.data?.schools || [];
  } catch {
    // 忽略
  }
};

const handleCreate = async () => {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    await maintenanceAPI.createHistoricalSemester({
      school_id: form.value.school_id,
      academic_year_name: form.value.academic_year_name,
      academic_year_begin: form.value.academic_year_range?.[0],
      academic_year_end: form.value.academic_year_range?.[1],
      term_name: form.value.term_name,
      term_begin: form.value.term_range?.[0],
      term_end: form.value.term_range?.[1],
      remark: form.value.remark,
    });
    ElMessage.success("历史学期创建成功");
    showCreateDialog.value = false;
    form.value = { school_id: "", academic_year_name: "", academic_year_range: [], term_name: "", term_range: [], remark: "" };
    fetchSemesters();
  } catch {
    // 错误已由 request 拦截器处理
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (row) => {
  try {
    await maintenanceAPI.deleteHistoricalSemester(row.semester_id);
    ElMessage.success("删除成功");
    fetchSemesters();
  } catch {
    // 错误已由 request 拦截器处理
  }
};

const goToExams = (row) => {
  router.push({
    name: "maintenanceHistoricalExams",
    params: { semesterId: row.semester_id },
    state: { semesterName: row.semester_name },
  });
};

onMounted(() => {
  fetchSemesters();
  fetchSchools();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
