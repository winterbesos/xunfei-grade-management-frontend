<template>
  <div class="elective-subject-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>选修课管理</h3>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            添加选修课
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索课程名称或教师"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
        </el-row>
      </div>

      <!-- 选修课列表 -->

      <el-table
        :data="filteredElectiveSubjects"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="name" label="课程名称" min-width="150" />
        <el-table-column prop="teacher_name" label="任课教师" width="150" />
        <el-table-column prop="enabled" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'danger'">
              {{ row.enabled ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="editSubject(row)">
              编辑
            </el-button>
            <el-button
              size="small"
              :type="row.enabled ? 'danger' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.enabled ? "禁用" : "启用" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑选修课对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑选修课' : '添加选修课'"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="subjectFormRef"
        :model="subjectForm"
        :rules="subjectRules"
        label-width="100px"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="subjectForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="任课教师" prop="teacher_id">
          <el-select
            v-model="subjectForm.teacher_id"
            filterable
            remote
            reserve-keyword
            placeholder="请输入教师姓名搜索"
            :remote-method="searchTeachers"
            :loading="teacherLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in teacherList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch
            v-model="subjectForm.enabled"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitSubject"
            :loading="submitLoading"
          >
            {{ isEdit ? "更新" : "添加" }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { adminAPI } from "@/api/admin";

// 数据
const loading = ref(false);
const searchKeyword = ref("");
const allElectiveSubjects = ref([]);

// 教师搜索相关
const allTeachers = ref([]);
const teacherList = ref([]);
const teacherLoading = ref(false);

// 表单相关
const showAddDialog = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const subjectFormRef = ref();

const subjectForm = reactive({
  id: null,
  name: "",
  teacher_id: "",
  enabled: true,
});

const subjectRules = {
  name: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  teacher_id: [{ required: true, message: "请输入教师ID", trigger: "blur" }],
};

// 计算属性
const filteredElectiveSubjects = computed(() => {
  if (!searchKeyword.value) {
    return allElectiveSubjects.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return allElectiveSubjects.value.filter(
    (subject) =>
      subject.name.toLowerCase().includes(keyword) ||
      (subject.teacher_name &&
        subject.teacher_name.toLowerCase().includes(keyword)),
  );
});

// 方法
const loadSubjects = async () => {
  loading.value = true;
  try {
    const response = await adminAPI.getElectiveSubjects();
    if (response.status === 200) {
      allElectiveSubjects.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load elective subjects:", error);
    ElMessage.error("获取选修课列表失败");
  } finally {
    loading.value = false;
  }
};

const loadAllTeachers = async () => {
  try {
    // 获取所有教师，假设 limit 足够大
    const response = await adminAPI.getTeachers({ limit: 1000 });
    if (response.status === 200) {
      const teachers = response.data.items || response.data || [];
      allTeachers.value = teachers.map((t) => ({
        id: t.user_id || t.id,
        name: t.name || t.user_name || t.teacher_name,
      }));
      teacherList.value = allTeachers.value;
    }
  } catch (error) {
    console.error("Failed to load teachers:", error);
  }
};

const handleSearch = () => {
  loadSubjects();
};

const searchTeachers = (query) => {
  if (query) {
    teacherLoading.value = true;
    setTimeout(() => {
      teacherList.value = allTeachers.value.filter((item) => {
        return item.name.toLowerCase().includes(query.toLowerCase());
      });
      teacherLoading.value = false;
    }, 200);
  } else {
    teacherList.value = allTeachers.value;
  }
};

const editSubject = (row) => {
  isEdit.value = true;
  subjectForm.id = row.id;
  subjectForm.name = row.name;
  subjectForm.teacher_id = row.teacher_id;
  subjectForm.enabled = row.enabled;

  // 确保列表包含当前教师
  if (teacherList.value.length === 0) {
    teacherList.value = allTeachers.value;
  }

  showAddDialog.value = true;
};

const openAddDialog = () => {
  showAddDialog.value = true;
  if (allTeachers.value.length === 0) {
    loadAllTeachers();
  } else {
    teacherList.value = allTeachers.value;
  }
};

const toggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.enabled ? "禁用" : "启用"}选修课 "${row.name}" 吗？`,
      "确认操作",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    const newStatus = !row.enabled;
    const response = await adminAPI.updateElectiveSubject(row.id, {
      ...row,
      enabled: newStatus,
    });

    if (response.status === 200) {
      row.enabled = newStatus;
      ElMessage.success("状态更新成功");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
};

const submitSubject = async () => {
  if (!subjectFormRef.value) return;

  await subjectFormRef.value.validate(async (valid) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      let response;
      if (isEdit.value) {
        response = await adminAPI.updateElectiveSubject(
          subjectForm.id,
          subjectForm,
        );
      } else {
        const createPayload = {
          name: subjectForm.name,
          teacher_id: subjectForm.teacher_id,
          enabled: subjectForm.enabled,
        };
        response = await adminAPI.createElectiveSubject(createPayload);
      }

      if (response.status === 200) {
        ElMessage.success(isEdit.value ? "选修课更新成功" : "选修课添加成功");
        showAddDialog.value = false;
        loadSubjects();
      }
    } catch (error) {
      console.error("Failed to submit subject:", error);
      ElMessage.error("操作失败");
    } finally {
      submitLoading.value = false;
    }
  });
};

const resetForm = () => {
  subjectForm.id = null;
  subjectForm.name = "";
  subjectForm.teacher_id = "";
  subjectForm.enabled = true;
  isEdit.value = false;
};

onMounted(() => {
  loadSubjects();
  loadAllTeachers();
});
</script>

<style scoped>
.elective-subject-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  margin-bottom: 20px;
}
</style>
