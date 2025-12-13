<template>
  <div class="grade-students">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="handleBack" :icon="ArrowLeft" circle />
            <span style="margin-left: 10px">选修成绩录入</span>
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
        <el-col :span="6">
          <el-statistic title="学生总数" :value="statistics.totalStudents" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已录入" :value="statistics.gradedStudents" />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="平均分"
            :value="statistics.averageScore"
            :precision="1"
          />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="及格率"
            :value="statistics.passRate"
            suffix="%"
            :precision="1"
          />
        </el-col>
      </el-row>

      <!-- 快速操作 -->
      <el-row :gutter="10" style="margin-bottom: 20px">
        <el-col :span="16">
          <el-input
            v-model="quickScore"
            placeholder="快速设置分数"
            style="width: 180px"
            @keyup.enter="handleQuickSet"
          >
            <template #append>
              <el-button @click="handleQuickSet">应用</el-button>
            </template>
          </el-input>
          <el-input
            v-model="quickCreditHours"
            placeholder="快速设置学时"
            style="width: 180px; margin-left: 10px"
            @keyup.enter="handleQuickSetCreditHours"
          >
            <template #append>
              <el-button @click="handleQuickSetCreditHours">应用</el-button>
            </template>
          </el-input>
          <el-button @click="handleSetAllPass" style="margin-left: 10px"
            >全部及格</el-button
          >
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
        <el-table-column prop="user_name" label="姓名" width="80" />
        <el-table-column
          prop="midterm_score"
          label="期中成绩"
          width="80"
          align="center"
        />
        <el-table-column
          prop="final_score"
          label="期末成绩"
          width="80"
          align="center"
        />
        <el-table-column label="平时成绩" width="120">
          <template #default="{ row }">
            <div class="grade-input-group">
              <el-input-number
                v-model="row.usual_score"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                controls-position="right"
                style="width: 100px"
                @change="handleScoreChange(row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学时" width="110">
          <template #default="{ row }">
            <div class="grade-input-group">
              <el-input-number
                v-model="row.credits_hours"
                :min="0"
                :precision="1"
                :step="0.5"
                controls-position="right"
                style="width: 110px"
                @change="row.modified = true"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学时学分" width="80" align="center">
          <template #default="{ row }">
            <span>{{ (row.credits_hours / 18).toFixed(1) || "0.0" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="学期总评" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.score !== null" class="current-score"
              >{{ row.score }}分</span
            >
            <span v-else class="no-score">未录入</span>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getGradeTagType(row)">
              {{ getGradeLevel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.score !== null ? 'success' : 'info'">
              {{ row.score !== null ? "已录入" : "未录入" }}
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
        <el-table-column prop="score" label="成绩" width="80" />
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
const quickScore = ref("");
const quickCreditHours = ref("");
const filterScore = ref("all");

// ... (rest of the code)

// 导出 Excel (CSV)
const handleExport = () => {
  if (students.value.length === 0) {
    ElMessage.warning("没有数据可导出");
    return;
  }

  // CSV Header
  const headers = [
    "学生ID",
    "姓名",
    "平时成绩",
    "学时",
  ];
  const keys = [
    "user_id",
    "user_name",
    "usual_score",
    "credits_hours",
  ];

  // Generate CSV content
  let csvContent = headers.join(",") + "\n";

  students.value.forEach((student) => {
    const row = keys.map((key) => {
      const val = student[key];
      return val === null || val === undefined ? "" : val;
    });
    csvContent += row.join(",") + "\n";
  });

  // Add BOM for Excel UTF-8 compatibility
  const blob = new Blob(["\uFEFF" + csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${subjectName}_选修成绩表.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
    const content = e.target.result;
    const lines = content.split(/\r\n|\n/);
    let updatedCount = 0;

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [studentId, name, usualScoreStr, creditHoursStr] =
        line.split(",");

      if (!studentId) continue;

      const student = students.value.find(
        (s) => String(s.user_id) === String(studentId),
      );

      if (student) {
        let changed = false;

        // Update Usual Score
        if (usualScoreStr && !isNaN(parseFloat(usualScoreStr))) {
          const newScore = parseFloat(usualScoreStr);
          if (student.usual_score !== newScore) {
            student.usual_score = newScore;
            changed = true;
          }
        }

        // Update Credit Hours
        if (creditHoursStr && !isNaN(parseFloat(creditHoursStr))) {
          const newCredit = parseFloat(creditHoursStr);
          if (student.credits_hours !== newCredit) {
            student.credits_hours = newCredit;
            changed = true;
          }
        }

        if (changed) {
          student.modified = true;
          handleScoreChange(student); // Recalculate total score
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      ElMessage.success(`成功更新 ${updatedCount} 条记录`);
    } else {
      ElMessage.info("没有数据变更");
    }

    // Reset file input
    event.target.value = "";
  };

  reader.readAsText(file);
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
  const validScores = allStudents.filter((s) => s.score !== null);
  const totalScore = validScores.reduce((sum, s) => sum + (s.score || 0), 0);
  const passedStudents = validScores.filter((s) => (s.score || 0) >= 60);

  return {
    totalStudents: allStudents.length,
    gradedStudents: validScores.length,
    averageScore: validScores.length > 0 ? totalScore / validScores.length : 0,
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
    result = result.filter((s) => s.score !== null);
  } else if (filterScore.value === "ungraded") {
    result = result.filter((s) => s.score === null);
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
    name: "TeacherElectiveSubjectList",
    params: {
      semesterId: semesterId,
    },
    query: {
      semesterName: semesterName,
    },
  });
};

// 查看成绩证明
// const handleViewProof = () => {
//   router.push({
//     name: "TeacherGradeProof",
//   });
// };

// 获取成绩标签类型
const getGradeTagType = (row) => {
  if (row.level) {
    const level = row.level;
    if (["A", "B", "优秀", "良好"].includes(level)) return "success";
    if (["C", "D", "中等", "及格"].includes(level)) return "warning";
    return "danger";
  }
  const score = row.score;
  if (score === null || score === undefined) return "info";
  if (score >= 80) return "success"; // A & B
  if (score >= 60) return "warning"; // C & D
  return "danger"; // E
};

// 获取成绩等级
const getGradeLevel = (row) => {
  if (row.level) return row.level;
  const score = row.score;
  if (score === null || score === undefined) return "未录入";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
};

// 加载学生列表
const loadStudents = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getElectiveSubjectGrades(
      electiveSubjectId,
      semesterId,
    );
    if (response.status === 200) {
      students.value = response.data.map((student) => ({
        ...student,
        credits_hours: student.credits_hours || 0,
        modified: false,
        usual_score: student.usual_score || null,
        midterm_score: student.midterm_score || null,
        final_score: student.final_score || null,
        score: student.score || null, // Assuming 'score' is the total elective score
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
  if (row.usual_score !== null) {
    row.modified = true;

    // For elective subjects, assume usual_score directly contributes to total score
    // If there are other components (midterm/final), they should be handled here
    row.score = row.usual_score; // Simple assignment for now

    // Optional: Call a backend API to compute final score if logic is complex
    // const payload = {
    //   items: [
    //     {
    //       identifier: String(row.user_id),
    //       usual_score: String(row.usual_score),
    //       // Include other scores if applicable, e.g., midterm_score, final_score
    //     },
    //   ],
    // };
    // try {
    //   const res = await teacherAPI.computeFinalScore(payload);
    //   if (
    //     res.status === 200 &&
    //     res.data &&
    //     res.data.items &&
    //     res.data.items.length > 0
    //   ) {
    //     const result = res.data.items[0];
    //     row.score = parseFloat(result.comp_score);
    //     row.level = result.comp_level;
    //   } else {
    //     ElMessage.error("计算总评失败");
    //   }
    // } catch (error) {
    //   console.error("Failed to compute score:", error);
    //   ElMessage.error("计算总评失败");
    // }
  }
};

// 快速设置分数
const handleQuickSet = () => {
  if (!quickScore.value && quickScore.value !== 0) {
    ElMessage.warning("请输入分数");
    return;
  }

  selectedStudents.value.forEach((student) => {
    student.usual_score = parseFloat(quickScore.value);
    student.modified = true;
    handleScoreChange(student); // Recalculate total score
  });

  ElMessage.success(`已为选中的${selectedStudents.value.length}个学生设置分数`);
};

// 快速设置学时
const handleQuickSetCreditHours = () => {
  if (!quickCreditHours.value && quickCreditHours.value !== 0) {
    ElMessage.warning("请输入学时");
    return;
  }

  const targetStudents =
    selectedStudents.value.length > 0 ? selectedStudents.value : students.value;

  targetStudents.forEach((student) => {
    student.credits_hours = parseFloat(quickCreditHours.value);
    student.modified = true;
  });

  ElMessage.success(
    `已为${targetStudents.length}个学生设置学时: ${quickCreditHours.value}`,
  );
};

// 全部及格
const handleSetAllPass = () => {
  students.value.forEach((student) => {
    // For elective subjects, assume usual_score is the main score
    if (student.usual_score == null || student.usual_score < 60) {
      student.usual_score = 60;
      student.modified = true;
      handleScoreChange(student); // Recalculate total score
    }
  });
  ElMessage.success("已为所有未评分学生设置及格分数");
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
  if (row.usual_score === null) {
    ElMessage.warning("请输入分数");
    return;
  }

  try {
    const payload = {
      student_id: row.user_id,
      usual_score: row.usual_score,
      credits_hours: row.credits_hours,
      score: row.score, // Include the computed score
      remarks: row.remarks || "",
    };

    let response;
    // Assuming a POST for new entry and PUT for update. 
    // This logic might need refinement based on backend API.
    // For simplicity, let's assume update always for now if grade exists, otherwise add.
    // A better way would be to check if the student already has a grade for this elective.
    if (row.has_grade) { // Assuming a flag 'has_grade' from backend or check if score is not null
      response = await teacherAPI.updateElectiveSubjectGrade(
        electiveSubjectId,
        semesterId,
        row.user_id,
        payload,
      );
    } else {
      response = await teacherAPI.addElectiveSubjectGrade(
        electiveSubjectId,
        semesterId,
        payload,
      );
    }

    if (response.status === 200 || response.status === 201) {
      ElMessage.success("保存成功");
      row.modified = false;
      // After saving, update the 'has_grade' flag for future operations
      row.has_grade = true;
    }
  } catch (error) {
    ElMessage.error(error.message || "保存失败");
  }
};

// 批量保存
const handleBatchSave = async () => {
  const modifiedStudents = students.value.filter(
    (s) => s.modified && (s.usual_score !== null || s.credits_hours !== null),
  );

  if (modifiedStudents.length === 0) {
    ElMessage.info("没有需要保存的修改");
    return;
  }

  saveLoading.value = true;
  try {
    const gradesToAdd = [];
    const gradesToUpdate = [];

    modifiedStudents.forEach((student) => {
      const payload = {
        student_id: student.user_id,
        usual_score: student.usual_score,
        credits_hours: student.credits_hours,
        score: student.score,
        remarks: student.remarks || "",
      };
      if (student.has_grade) {
        gradesToUpdate.push(payload);
      } else {
        gradesToAdd.push(payload);
      }
    });

    // Send batch add/update requests. This assumes backend supports batch operations
    // or we send individual requests in a loop. For simplicity, assume a single batch endpoint
    // or adapt based on actual API design.
    // If batch add/update is not supported, then loop through each student and call handleSaveSingle.

    let allPromises = [];

    // Assuming teacherAPI.addElectiveSubjectGrade and updateElectiveSubjectGrade can take a list of grades
    // or modify them to loop for individual save. 
    // For now, let's just make multiple requests for each modified student
    for (const student of modifiedStudents) {
        allPromises.push(handleSaveSingle(student)); // This will re-trigger handleScoreChange for each
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