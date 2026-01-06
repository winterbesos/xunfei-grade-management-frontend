<template>
  <div class="grade-students">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="handleBack" :icon="ArrowLeft" circle />
            <span style="margin-left: 10px; font-weight: 600; font-size: 16px"
              >选修成绩录入</span
            >
          </div>
          <div class="header-info">
            <el-tag type="info">{{ semesterName }}</el-tag>
            <el-tag type="info">{{ subjectName }}</el-tag>
          </div>
          <div class="header-right">
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button @click="triggerImport">
              <el-icon><Upload /></el-icon>
              导入
            </el-button>
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              accept=".csv,.xlsx,.xls"
              @change="handleImport"
            />
            <el-button
              class="save"
              type="success"
              @click="handleBatchSave"
              :loading="saveLoading"
            >
              <el-icon><Check /></el-icon>
              保存全部
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="8">
          <el-statistic title="学生总数" :value="statistics.totalStudents" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="已录入" :value="statistics.gradedStudents" />
        </el-col>
        <el-col :span="8">
          <el-statistic
            title="合格率"
            :value="statistics.passRate"
            suffix="%"
            :precision="1"
          />
        </el-col>
      </el-row>

      <!-- 快速操作 -->
      <el-row :gutter="10" style="margin-bottom: 20px">
        <el-col :span="16">
          <div style="display: flex; align-items: center">
            <el-select
              v-model="quickScore"
              placeholder="快速设置评价"
              style="width: 180px; margin-right: 10px"
            >
              <el-option label="合格" :value="1" />
              <el-option label="不合格" :value="2" />
            </el-select>
            <el-button @click="handleQuickSet">应用</el-button>

            <el-button @click="handleSetAllPass" style="margin-left: 10px"
              >全部合格</el-button
            >
          </div>
        </el-col>
        <el-col :span="8" style="text-align: right">
          <el-select
            v-model="filterScore"
            placeholder="筛选状态"
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="全部学生" value="all" />
            <el-option label="已录入" value="graded" />
            <el-option label="未录入" value="ungraded" />
          </el-select>
        </el-col>
      </el-row>

      <!-- 学生列表 -->
      <el-table
        v-loading="loading"
        :data="filteredStudents"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="user_name" label="姓名" min-width="120" />
        <el-table-column label="评价" width="180">
          <template #default="{ row }">
            <div class="grade-input-group">
              <el-select
                v-model="row.evaluation"
                placeholder="请选择"
                style="width: 140px"
                @change="handleScoreChange(row)"
              >
                <el-option label="合格" :value="1" />
                <el-option label="不合格" :value="2" />
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.evaluation !== null ? 'success' : 'info'">
              {{ row.evaluation !== null ? "已录入" : "未录入" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleSaveSingle(row)"
              :disabled="row.modified !== true"
            >
              保存
            </el-button>
            <el-button
              type="info"
              size="small"
              link
              @click="handleViewReport(row)"
            >
              成绩单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && filteredStudents.length === 0"
        description="暂无学生数据"
      />
    </el-card>

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="成绩历史记录"
      width="600px"
    >
      <el-table :data="gradeHistory" style="width: 100%">
        <el-table-column prop="date" label="录入时间" width="160" />
        <el-table-column prop="evaluation" label="成绩" width="80">
          <template #default="{ row }">
            {{
              row.evaluation === 1
                ? "合格"
                : row.evaluation === 2
                  ? "不合格"
                  : row.evaluation
            }}
          </template>
        </el-table-column>
        <el-table-column prop="teacher" label="录入教师" width="120" />
        <el-table-column prop="remarks" label="评语" />
      </el-table>
      <template #footer>
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { ArrowLeft, Check, Download, Upload } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import * as XLSX from "xlsx";

const route = useRoute();
const router = useRouter();

const semesterId = route.params.semesterId;
const electiveSubjectId = route.params.electiveSubjectId;

const semesterName = route.query.semesterName || "未知学期";
const subjectName = route.query.subjectName || "未知选修课";

const loading = ref(false);
const saveLoading = ref(false);
const students = ref([]);
const selectedStudents = ref([]);
const historyDialogVisible = ref(false);
const gradeHistory = ref([]);
const fileInput = ref(null);

// 快速设置
const quickScore = ref(null);
const filterScore = ref("all");

// 导出 Excel (XLSX)
const handleExport = () => {
  if (students.value.length === 0) {
    ElMessage.warning("没有数据可导出");
    return;
  }

  // Header
  const headers = ["学生ID", "姓名", "评价"];
  const keys = ["user_id", "user_name", "evaluation_text"];

  // Generate data array
  const data = students.value.map((student) => {
    return keys.map((key) => {
      if (key === "evaluation_text") {
        return student.evaluation === 1
          ? "合格"
          : student.evaluation === 2
            ? "不合格"
            : "";
      }
      const val = student[key];
      return val === null || val === undefined ? "" : val;
    });
  });

  // Add headers
  data.unshift(headers);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "选修成绩表");

  // Write file
  XLSX.writeFile(wb, `${subjectName}_选修成绩表.xlsx`);
};

// 触发导入
const triggerImport = () => {
  fileInput.value.click();
};

// 处理导入
const handleImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const results = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let updatedCount = 0;

      // Skip header
      for (let i = 1; i < results.length; i++) {
        const row = results[i];
        if (!row || row.length === 0) continue;

        // Assuming order: StudentID, Name, Evaluation
        const studentId = row[0];
        const usualScoreStr = row[2]; // Evaluation text

        if (!studentId) continue;

        const student = students.value.find(
          (s) => String(s.user_id) === String(studentId),
        );

        if (student) {
          let changed = false;

          // Update Usual Score (Evaluation)
          let newScore = null;
          if (usualScoreStr) {
            const trimmed = String(usualScoreStr).trim();
            if (trimmed === "合格" || trimmed === "1") newScore = 1;
            else if (trimmed === "不合格" || trimmed === "2") newScore = 2;
          }

          if (newScore !== null && student.evaluation !== newScore) {
            student.evaluation = newScore;
            changed = true;
          }

          if (changed) {
            student.modified = true;
            handleScoreChange(student);
            updatedCount++;
          }
        }
      }

      if (updatedCount > 0) {
        ElMessage.success(`成功更新 ${updatedCount} 条记录`);
      } else {
        ElMessage.info("没有数据变更");
      }
    } catch (error) {
      console.error("Import error:", error);
      ElMessage.error("导入失败，请检查文件格式");
    }

    // Reset file input
    event.target.value = "";
  };

  reader.readAsArrayBuffer(file);
};

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 50,
  total: 0,
});

// 统计信息
const statistics = computed(() => {
  const allStudents = students.value;
  const validScores = allStudents.filter((s) => s.evaluation !== null);
  // Average score is not relevant for categorical data (1/2)
  const passedStudents = validScores.filter((s) => s.evaluation === 1);

  return {
    totalStudents: allStudents.length,
    gradedStudents: validScores.length,
    passRate:
      validScores.length > 0
        ? (passedStudents.length / validScores.length) * 100
        : 0,
  };
});

// 过滤后的学生列表
const filteredStudents = computed(() => {
  let result = students.value;

  if (filterScore.value === "graded") {
    result = result.filter((s) => s.evaluation !== null);
  } else if (filterScore.value === "ungraded") {
    result = result.filter((s) => s.evaluation === null);
  }

  // 分页
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  pagination.total = result.length;

  return result.slice(start, end);
});

// 返回上级
const handleBack = () => {
  router.push({
    name: "TeacherSemesterGradeManagement",
    params: {
      semesterId: semesterId,
    },
    query: {
      semesterName: semesterName,
    },
  });
};

// 加载学生列表
const loadStudents = async () => {
  loading.value = true;
  try {
    const response =
      await teacherAPI.getElectiveSubjectGrades(electiveSubjectId);
    if (response.status === 200) {
      students.value = response.data.map((student) => ({
        ...student,
        modified: false,
        evaluation: student.evaluation || null,
      }));
    }
  } catch (error) {
    ElMessage.error("加载学生列表失败");
  } finally {
    loading.value = false;
  }
};

// 成绩变化处理
const handleScoreChange = async (row) => {
  if (row.evaluation !== null) {
    row.modified = true;
  }
};

// 快速设置分数
const handleQuickSet = () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning("请先勾选学生");
    return;
  }

  if (!quickScore.value) {
    ElMessage.warning("请选择评价");
    return;
  }

  selectedStudents.value.forEach((student) => {
    student.evaluation = quickScore.value;
    student.modified = true;
    handleScoreChange(student);
  });

  ElMessage.success(`已为选中的${selectedStudents.value.length}个学生设置评价`);
};

// 全部合格
const handleSetAllPass = () => {
  students.value.forEach((student) => {
    student.evaluation = 1; // 1 = 合格
    student.modified = true;
    handleScoreChange(student);
  });
  ElMessage.success("已为所有学生设置合格");
};

// 筛选处理
const handleFilter = () => {
  pagination.currentPage = 1;
};

// 选择变化
const handleSelectionChange = (selection) => {
  selectedStudents.value = selection;
};

// 保存单个学生
const handleSaveSingle = async (row) => {
  if (row.evaluation === null) {
    ElMessage.warning("请选择评价");
    return;
  }

  try {
    const payload = {
      student_id: row.user_id,
      evaluation: row.evaluation,
    };

    let response = await teacherAPI.updateElectiveSubjectGrade(
      electiveSubjectId,
      row.user_id,
      payload,
    );

    if (response.status === 200 || response.status === 201) {
      ElMessage.success("保存成功");
      row.modified = false;
      row.has_grade = true;
    }
  } catch (error) {
    ElMessage.error(error.message || "保存失败");
  }
};

// 批量保存
const handleBatchSave = async () => {
  const modifiedStudents = students.value.filter(
    (s) => s.modified && s.evaluation !== null,
  );

  if (modifiedStudents.length === 0) {
    ElMessage.info("没有需要保存的修改");
    return;
  }

  saveLoading.value = true;
  try {
    let allPromises = [];

    for (const student of modifiedStudents) {
      allPromises.push(handleSaveSingle(student));
    }

    await Promise.all(allPromises);

    ElMessage.success(`成功保存${modifiedStudents.length}个学生的成绩`);
    modifiedStudents.forEach((s) => (s.modified = false));
    await loadStudents();
  } catch (error) {
    ElMessage.error(error.message || "批量保存失败");
  } finally {
    saveLoading.value = false;
  }
};

const handleViewReport = (row) => {
  router.push({
    name: "TeacherGradeReport",
    params: {
      studentId: row.user_id,
      semesterId: semesterId,
    },
    query: {
      studentName: row.user_name,
      semesterName: semesterName,
      subjectName: subjectName,
    },
  });
};

onMounted(() => {
  loadStudents();
});
</script>

<style scoped>
.grade-students {
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

.header-info {
  display: flex;
  gap: 10px;
}

.header-right {
  display: flex;
  align-items: center;
}

.grade-input-group {
  display: flex;
  align-items: center;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}

.save {
  margin-left: 30px;
}
</style>
