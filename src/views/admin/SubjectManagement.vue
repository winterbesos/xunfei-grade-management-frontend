<template>
  <div class="subject-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>科目管理</span>
        </div>
      </template>

      <el-table
        :data="courseList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column
          prop="subject_code"
          label="学科代码"
          width="100"
          align="center"
        />
        <el-table-column prop="subject_name" label="科目名称" min-width="150" />
        <el-table-column
          label="学时"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ row.hours !== null && row.hours !== undefined ? row.hours : "—" }}
          </template>
        </el-table-column>
        <el-table-column label="是否启用" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="成绩类型" min-width="200">
          <template #default="{ row }">
            <span v-if="row.grades_type == '1'">分数 (百分制)</span>
            <span v-else-if="row.grades_type == '2'">等级 (ABCD)</span>
            <span v-else-if="row.grades_type == '3'">合格/不合格</span>
            <span v-else>未知</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑科目" width="500px">
      <el-form
        ref="formRef"
        :model="editForm"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="科目名称">
          <el-input v-model="editForm.subject_name" disabled />
        </el-form-item>
        <el-form-item label="学时" prop="hours">
          <el-input-number
            v-model="editForm.hours"
            :min="0"
            :step="1"
            :precision="0"
            controls-position="right"
            style="width: 100%"
            placeholder="可选"
          />
        </el-form-item>
        <el-form-item label="状态" prop="is_active">
          <el-switch
            v-model="editForm.is_active"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        <el-form-item label="成绩类型" prop="grades_type">
          <el-radio-group v-model="editForm.grades_type">
            <el-radio label="1">分数 (百分制)</el-radio>
            <el-radio label="2">等级 (ABCD)</el-radio>
            <el-radio label="3">合格/不合格</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saveLoading">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { adminAPI } from "@/api/admin";
import { ElMessage } from "element-plus";

const loading = ref(false);
const saveLoading = ref(false);
const courseList = ref([]);
const dialogVisible = ref(false);
const formRef = ref(null);

const editForm = reactive({
  id: null,
  subject_name: "",
  hours: 0,
  is_active: true,
  grades_type: "1",
});

const rules = {
  hours: [{ required: false, message: "请输入学时", trigger: "blur" }],
  grades_type: [{ required: true, message: "请选择成绩类型", trigger: "change" }],
};

const fetchCourses = async () => {
  loading.value = true;
  try {
    const res = await adminAPI.getCourses();
    if (res.status === 200) {
      courseList.value = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    ElMessage.error("获取科目列表失败");
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row) => {
  editForm.id = row.id;
  editForm.subject_name = row.subject_name;
  editForm.hours = row.hours;
  editForm.is_active = row.is_active;
  // Ensure grades_type is a string for the radio group to work correctly if coming as number
  editForm.grades_type = String(row.grades_type);
  dialogVisible.value = true;
};

const handleSave = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true;
      try {
        const res = await adminAPI.updateCourse(editForm.id, {
          grades_type: editForm.grades_type,
          is_active: editForm.is_active,
          hours: editForm.hours,
        });
        
        if (res.status === 200) {
          ElMessage.success("更新成功");
          dialogVisible.value = false;
          fetchCourses();
        } else {
          throw new Error(res.message || "更新失败");
        }
      } catch (error) {
        console.error("Failed to update course:", error);
        ElMessage.error("更新失败，请重试");
      } finally {
        saveLoading.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
