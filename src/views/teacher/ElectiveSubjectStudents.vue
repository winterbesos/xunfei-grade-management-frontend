<template>
  <div class="elective-subject-students">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="goBack">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <span style="margin-left: 10px">
              {{ subjectName }} - 学生列表
            </span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="dialogVisible = true">
              <el-icon><Plus /></el-icon> 新增学生
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="students"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="user_id"
          label="学生ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="user_name"
          label="学生姓名"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="credits_hours" label="学时" width="120" />
        <el-table-column prop="credits" label="学分" width="120" />
        <el-table-column
          prop="evaluation"
          label="评价"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.evaluation === 1">合格</span>
            <span v-else-if="row.evaluation === 2">不合格</span>
            <span v-else>未评价</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && students.length === 0"
        description="暂无学生"
      />
    </el-card>

    <!-- 新增学生弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学生' : '新增学生'"
      width="400px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="选择学生" prop="student_id">
          <el-select
            v-model="form.student_id"
            :disabled="isEdit"
            filterable
            remote
            reserve-keyword
            placeholder="请输入学生姓名或ID搜索"
            :remote-method="handleSearchStudent"
            :loading="searchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in studentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学时" prop="study_hours">
          <el-input-number
            v-model="form.study_hours"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="评价" prop="evaluation">
          <el-select
            v-model="form.evaluation"
            placeholder="请选择评价"
            style="width: 100%"
          >
            <el-option label="合格" :value="1" />
            <el-option label="不合格" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";
import { ArrowLeft, Plus } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const submitting = ref(false);
const students = ref([]);
const dialogVisible = ref(false);
const formRef = ref(null);
const isEdit = ref(false);

const electiveSubjectId = route.params.electiveSubjectId;
const semesterId = route.params.semesterId;
const subjectName = route.query.subjectName || "选修课";

const form = reactive({
  student_id: "",
  study_hours: 0,
  evaluation: 1,
});

const rules = {
  student_id: [{ required: true, message: "请选择学生", trigger: "change" }],
  study_hours: [{ required: true, message: "请输入学时", trigger: "blur" }],
  evaluation: [{ required: true, message: "请选择评价", trigger: "change" }],
};

const studentOptions = ref([]);
const searchLoading = ref(false);

const handleSearchStudent = async (query) => {
  if (query) {
    searchLoading.value = true;
    try {
      const response = await teacherAPI.searchStudents({ keyword: query });
      if (response.status === 200) {
        // Assuming the API returns a list of students or an object with a students array
        const list = Array.isArray(response.data)
          ? response.data
          : response.data.students || [];
        studentOptions.value = list.map((item) => ({
          label: `${item.user_name} (${item.user_id.slice(-4)}) ${item.year_name}${item.class_name}`,
          value: item.user_id,
        }));
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      searchLoading.value = false;
    }
  } else {
    studentOptions.value = [];
  }
};

const loadStudents = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getElectiveSubjectStudents(
      electiveSubjectId,
      semesterId,
    );
    if (response.status === 200) {
      students.value = response.data;
    }
  } catch (error) {
    ElMessage.error("加载学生列表失败");
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row) => {
  isEdit.value = true;
  form.student_id = row.user_id;
  form.study_hours = row.credits_hours;
  form.evaluation = row.evaluation;
  
  // Create a display option for the current student so the select shows their name (or at least ID) correctly
  // Ideally we would have the student object or name here, using row.user_name
  studentOptions.value = [{
    label: row.user_name, 
    value: row.user_id
  }];
  
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        let response;
        if (isEdit.value) {
            response = await teacherAPI.updateElectiveSubjectStudent(
                electiveSubjectId,
                semesterId,
                form.student_id,
                {
                    credits_hours: form.study_hours,
                    evaluation: form.evaluation,
                }
            );
        } else {
            response = await teacherAPI.addElectiveSubjectStudent(
                electiveSubjectId,
                semesterId,
                {
                    student_id: form.student_id,
                    credits_hours: form.study_hours,
                    evaluation: form.evaluation,
                },
            );
        }

        if (response.status === 200 || response.status === 201) {
          ElMessage.success(isEdit.value ? "修改成功" : "添加成功");
          dialogVisible.value = false;
          loadStudents();
        } else {
          ElMessage.error(response.message || (isEdit.value ? "修改失败" : "添加失败"));
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? "修改失败" : "添加学生失败");
      } finally {
        submitting.value = false;
      }
    }
  });
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.student_id = "";
  form.study_hours = 0;
  form.evaluation = 1;
  studentOptions.value = [];
  isEdit.value = false;
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadStudents();
});
</script>

<style scoped>
.elective-subject-students {
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
</style>
