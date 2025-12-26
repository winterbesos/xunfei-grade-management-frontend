<template>
  <div class="activity-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            发布活动
          </el-button>
        </div>
      </template>

      <!-- 活动列表 -->
      <el-table
        v-loading="loading"
        :data="activities"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="活动名称" min-width="150" />
        <el-table-column label="级别" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.level === 1
                  ? 'info'
                  : row.level === 2
                    ? 'success'
                    : row.level === 3
                      ? 'warning'
                      : 'danger'
              "
            >
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属学期" min-width="250">
          <template #default="{ row }">
            {{ row.academic_year_name }}{{ row.term_name
            }}{{ row.semester_name }}
          </template>
        </el-table-column>
        <el-table-column label="荣誉奖项" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="(award, index) in row.awards"
              :key="index"
              class="mx-1"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ award }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 发布活动对话框 -->
    <el-dialog v-model="dialogVisible" title="发布活动" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属学期" prop="semesterId">
          <el-select
            v-model="form.semesterId"
            placeholder="请选择学期"
            style="width: 100%"
          >
            <el-option
              v-for="item in semesterOptions"
              :key="item.semester_id"
              :label="item.academic_year_name + item.term_name"
              :value="item.semester_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" />
        </el-form-item>

        <el-form-item label="活动级别" required>
          <el-select
            v-model="form.level"
            placeholder="请选择活动级别"
            style="width: 100%"
          >
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="荣誉奖项" required>
          <div
            v-for="(award, index) in form.awards"
            :key="index"
            class="award-item"
          >
            <el-input
              v-model="form.awards[index]"
              placeholder="请输入奖项名称"
              style="width: 80%"
            />
            <el-button
              v-if="form.awards.length > 1"
              type="danger"
              circle
              size="small"
              @click="removeAward(index)"
              style="margin-left: 10px"
            >
              <el-icon><Minus /></el-icon>
            </el-button>
            <el-button
              v-if="index === form.awards.length - 1"
              type="primary"
              circle
              size="small"
              @click="addAward"
              style="margin-left: 5px"
            >
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
          <div class="form-tip">请添加该活动包含的所有荣誉奖项</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Minus, Delete } from "@element-plus/icons-vue";
import { adminAPI } from "@/api/admin";
import { formatDate } from "@/utils/date";

const loading = ref(false);
const submitLoading = ref(false);
const activities = ref([]);
const semesterOptions = ref([]);
const dialogVisible = ref(false);
const formRef = ref(null);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const form = reactive({
  semesterId: null,
  activityName: "",
  level: 1,
  awards: [""],
});

const levelOptions = [
  { label: "校级", value: 1 },
  { label: "市级", value: 2 },
  { label: "省级", value: 3 },
  { label: "国家级", value: 4 },
];

const getLevelText = (level) => {
  const option = levelOptions.find((opt) => opt.value === level);
  return option ? option.label : "未知";
};

const rules = {
  semesterId: [
    { required: true, message: "请选择所属学期", trigger: "change" },
  ],
  activityName: [
    { required: true, message: "请输入活动名称", trigger: "blur" },
  ],
};

// 加载活动列表
const loadActivities = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
    };
    const response = await adminAPI.getActivities(params);
    if (response.status === 200) {
      activities.value = response.data.list || response.data;
      pagination.total = response.data.total || response.data.length;
    }
  } catch (error) {
    ElMessage.error("加载活动列表失败");
  } finally {
    loading.value = false;
  }
};

// 加载学期选项
const loadSemesters = async () => {
  try {
    const response = await adminAPI.getSemesters();
    if (response.status === 200) {
      semesterOptions.value = response.data.list || response.data;
    }
  } catch (error) {
    console.error("加载学期列表失败", error);
  }
};

const handleAdd = () => {
  form.semesterId = null;
  form.activityName = "";
  form.level = 1;
  form.awards = [""];
  dialogVisible.value = true;
};

const addAward = () => {
  form.awards.push("");
};

const removeAward = (index) => {
  form.awards.splice(index, 1);
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    // 验证奖项
    const validAwards = form.awards.filter((a) => a.trim() !== "");
    if (validAwards.length === 0) {
      ElMessage.warning("请至少添加一个荣誉奖项");
      return;
    }

    submitLoading.value = true;
    try {
      const data = {
        semester_id: form.semesterId,
        name: form.activityName,
        level: form.level,
        awards: validAwards,
      };

      const response = await adminAPI.createActivity(form.semesterId, data);
      if (response.status === 200) {
        ElMessage.success("发布成功");
        dialogVisible.value = false;
        loadActivities();
      }
    } catch (error) {
      ElMessage.error(error.message || "发布失败");
    } finally {
      submitLoading.value = false;
    }
  });
};

const handleDelete = async (activityId) => {
  try {
    await ElMessageBox.confirm("确定要删除此活动吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await adminAPI.deleteActivity(activityId);
    ElMessage.success("活动删除成功");
    loadActivities();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除活动失败");
    }
  }
};

onMounted(() => {
  loadActivities();
  loadSemesters();
});
</script>

<style scoped>
.activity-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.award-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
