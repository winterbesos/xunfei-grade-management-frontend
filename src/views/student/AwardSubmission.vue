<template>
  <div class="award-submission">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>奖项提交</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleAdd">提交新奖项</el-button>
          </div>
        </div>
      </template>

      <el-table :data="awards" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="奖项名称" />
        <el-table-column prop="approval_teacher_name" label="审核老师" />
        <el-table-column prop="awarded_at" label="获奖日期" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{
              getStatusText(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
            >
              修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '修改奖项' : '提交新奖项'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="奖项名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入奖项名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="奖项内容" prop="content">
          <el-input
            type="textarea"
            v-model="form.content"
            placeholder="请输入奖项内容"
            :rows="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="审核老师" prop="approval_teacher_id">
          <el-select
            v-model="form.approval_teacher_id"
            placeholder="请选择审核老师"
            filterable
          >
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="获奖日期" prop="awarded_at">
          <el-date-picker
            v-model="form.awarded_at"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting"
            >提交</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { studentAPI } from "@/api/student";
import { ElMessage } from "element-plus";

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const awards = ref([]);
const teachers = ref([]);
const formRef = ref(null);

const form = reactive({
  id: null,
  name: "",
  content: "",
  approval_teacher_id: "",
  awarded_at: "",
});

const rules = {
  name: [{ required: true, message: "请输入奖项名称", trigger: "blur" }],
  approval_teacher_id: [
    { required: true, message: "请选择审核老师", trigger: "change" },
  ],
  awarded_at: [
    { required: true, message: "请选择获奖日期", trigger: "change" },
  ],
};

const getStatusType = (status) => {
  const map = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };
  return map[status] || "info";
};

const getStatusText = (status) => {
  const map = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
  };
  return map[status] || status;
};

const loadData = async () => {
  loading.value = true;
  try {
    const [awardsRes, teachersRes] = await Promise.all([
      studentAPI.getAwards(),
      studentAPI.getAllTeachers(),
    ]);

    if (awardsRes.status === 200) {
      awards.value = awardsRes.data;
    }
    if (teachersRes.status === 200) {
      teachers.value = teachersRes.data;
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  form.id = null;
  form.name = "";
  form.content = "";
  form.approval_teacher_id = "";
  form.awarded_at = "";
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  form.id = row.id;
  form.name = row.name;
  form.content = row.content;
  form.approval_teacher_id = row.approval_teacher_id;
  form.awarded_at = row.awarded_at;
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        let res;
        if (form.id) {
          res = await studentAPI.updateAward(form.id, form);
        } else {
          res = await studentAPI.submitAward(form);
        }

        if (res.status === 200) {
          ElMessage.success(form.id ? "修改成功" : "提交成功");
          dialogVisible.value = false;
          loadData(); // Reload list
        }
      } catch (error) {
        ElMessage.error("提交失败");
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.award-submission {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>