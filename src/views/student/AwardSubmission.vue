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
        <el-table-column prop="activity_name" label="活动名称" />
        <el-table-column prop="name" label="荣誉奖项" />
        <el-table-column prop="approval_teacher_name" label="审核老师" />
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
        <el-form-item label="活动名称" prop="activity_id">
          <el-select
            v-model="form.activity_id"
            placeholder="请选择活动"
            filterable
            @change="handleActivityChange"
            style="width: 100%"
          >
            <el-option
              v-for="activity in activities"
              :key="activity.id"
              :label="activity.name"
              :value="activity.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="荣誉奖项" prop="name">
          <el-select
            v-model="form.name"
            placeholder="请选择荣誉奖项"
            filterable
            style="width: 100%"
            :disabled="!form.activity_id"
          >
            <el-option
              v-for="reward in availableRewards"
              :key="reward"
              :label="reward"
              :value="reward"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核老师" prop="approval_teacher_id">
          <el-select
            v-model="form.approval_teacher_id"
            placeholder="请选择审核老师"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            ></el-option>
          </el-select>
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
import { ref, reactive, onMounted, computed } from "vue";
import { studentAPI } from "@/api/student";
import { ElMessage } from "element-plus";

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const awards = ref([]);
const teachers = ref([]);
const activities = ref([]);
const formRef = ref(null);

const form = reactive({
  id: null,
  activity_id: "",
  name: "", // This will store the selected reward
  approval_teacher_id: "",
});

const rules = {
  activity_id: [{ required: true, message: "请选择活动", trigger: "change" }],
  name: [{ required: true, message: "请选择荣誉奖项", trigger: "change" }],
  approval_teacher_id: [
    { required: true, message: "请选择审核老师", trigger: "change" },
  ],
};

const availableRewards = computed(() => {
  const activity = activities.value.find((a) => a.id === form.activity_id);
  return activity ? activity.awards : [];
});

const handleActivityChange = () => {
  form.name = ""; // Reset reward when activity changes
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
    const [awardsRes, teachersRes, activitiesRes] = await Promise.all([
      studentAPI.getAwards(),
      studentAPI.getAllTeachers(),
      studentAPI.getActivities(),
    ]);

    if (awardsRes.status === 200) {
      awards.value = awardsRes.data;
    }
    if (teachersRes.status === 200) {
      teachers.value = teachersRes.data;
    }
    if (activitiesRes.status === 200) {
      // Ensure data structure matches expected activity list
      activities.value = activitiesRes.data.list || activitiesRes.data;
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  form.id = null;
  form.activity_id = "";
  form.name = "";
  form.approval_teacher_id = "";
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  form.id = row.id;
  form.activity_id = row.activity_id;
  form.name = row.name;
  form.approval_teacher_id = row.approval_teacher_id;
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
