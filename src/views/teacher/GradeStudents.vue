<template>
  <div class="grade-students">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="handleBack" :icon="ArrowLeft" circle />
            <span style="margin-left: 10px; font-weight: 600; font-size: 16px"
              >学生成绩录入</span
            >
          </div>
          <div class="header-info">
            <el-tag type="info">{{ semesterName }}</el-tag>
            <el-tag type="info">{{ className }}</el-tag>
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
        <el-table-column prop="user_name" label="姓名" min-width="80" />
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
            <el-popover
              placement="top"
              :width="420"
              trigger="hover"
              @show="handleDailyScoresShow(row.user_id)"
            >
              <template #reference>
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
              <div v-loading="loadingScores.get(row.user_id)">
                <el-table
                  v-if="(dailyScoresCache.get(row.user_id) || []).length > 0"
                  :data="dailyScoresCache.get(row.user_id)"
                  size="small"
                  border
                  stripe
                >
                  <el-table-column
                    prop="exam_name"
                    width="220"
                    label="考试名称"
                  />
                  <el-table-column prop="score" label="成绩" align="center" />
                  <el-table-column
                    prop="standard_score"
                    label="满分"
                    align="center"
                  />
                </el-table>
                <el-empty
                  v-else
                  :image-size="40"
                  description="暂无平时成绩记录"
                />
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="学时" width="110">
          <template #default="{ row }">
            <div class="grade-input-group">
              <el-input-number
                v-model="row.credits_hours"
                :min="0"
                :precision="0"
                :step="1"
                controls-position="right"
                style="width: 110px"
                @change="row.modified = true"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学时学分" width="80" align="center">
          <template #default="{ row }">
            <span>{{
              row.credits_hours ? (row.credits_hours / 18).toFixed(1) : "0.0"
            }}</span>
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

    <!-- 成绩报告对话框 -->
    <el-dialog
      v-model="reportDialogVisible"
      title="学生成绩单"
      width="900px"
      top="5vh"
      destroy-on-close
    >
      <Report
        v-if="reportDialogVisible"
        :student-id="currentStudentId"
        :semester-id="semesterId"
      />
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
import Report from "@/views/common/Report.vue";

const route = useRoute();
const router = useRouter();

const semesterId = route.params.semesterId;
const classId = route.params.classId;
const subjectCode = route.params.subjectCode;
const gradeCode = route.params.gradeCode;

const semesterName = route.query.semesterName || "未知学期";
const className = route.query.className || "未知班级";
const subjectName = route.query.subjectName || "未知课程";
const gradeName = route.query.gradeName || "未知年级";

const loading = ref(false);
const saveLoading = ref(false);
const students = ref([]);
const selectedStudents = ref([]);
const fileInput = ref(null);

const reportDialogVisible = ref(false);
const currentStudentId = ref(null);

// 平时成绩缓存
const dailyScoresCache = reactive(new Map());
const loadingScores = reactive(new Map());

const handleDailyScoresShow = async (studentId) => {
  if (dailyScoresCache.has(studentId)) return;

  loadingScores.set(studentId, true);
  try {
    const res = await teacherAPI.getStudentDailyScores(
      studentId,
      semesterId,
      subjectCode,
    );
    if (res.status === 200) {
      dailyScoresCache.set(studentId, res.data || []);
    }
  } catch (error) {
    console.error("Failed to fetch daily scores", error);
    dailyScoresCache.set(studentId, []);
  } finally {
    loadingScores.set(studentId, false);
  }
};

// 快速设置
const quickScore = ref("");
const quickCreditHours = ref("");
const filterScore = ref("all");

// ... (rest of the code)

// 导出 Excel (XLSX)
const handleExport = () => {
  if (students.value.length === 0) {
    ElMessage.warning("没有数据可导出");
    return;
  }

  // Header
  const headers = [
    "学生ID",
    "姓名",
    "期中成绩",
    "期末成绩",
    "平时成绩",
    "学时",
    "学时学分",
    "学期总评",
    "等第",
  ];
  const keys = [
    "user_id",
    "user_name",
    "midterm_score",
    "final_score",
    "usual_score",
    "credits_hours",

    "credits",
    "score",
    "level",
  ];

  // Generate data array
  const data = students.value.map((student) => {
    return keys.map((key) => {
      const val = student[key];
      if (key === "credits") {
        return student.credits_hours
          ? (student.credits_hours / 18).toFixed(1)
          : "0.0";
      } else if (key === "score") {
        return val !== null && val !== undefined ? `${val}分` : "未录入";
      } else if (key === "level") {
        if (val) return val;
        const score = student.score;
        if (score === null || score === undefined) return "未录入";
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "E";
      }

      return val === null || val === undefined ? "" : val;
    });
  });

  // Add headers to the beginning
  data.unshift(headers);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "成绩表");

  // Write file
  XLSX.writeFile(wb, `${className}_${subjectName}_成绩表.xlsx`);
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

      // Skip header (index 0)
      for (let i = 1; i < results.length; i++) {
        const row = results[i];
        if (!row || row.length === 0) continue;

        // Assuming order: ID, Name, Midterm, Final, Usual, Credit
        const studentId = row[0];
        // const name = row[1]; // Not used for lookup
        const usualScoreStr = row[4];
        const creditHoursStr = row[5];

        if (!studentId) continue;

        const student = students.value.find(
          (s) => String(s.user_id) === String(studentId),
        );

        if (student) {
          let changed = false;

          // Update Usual Score
          if (
            usualScoreStr !== undefined &&
            usualScoreStr !== "" &&
            !isNaN(parseFloat(usualScoreStr))
          ) {
            const newScore = parseFloat(usualScoreStr);
            if (student.usual_score !== newScore) {
              student.usual_score = newScore;
              changed = true;
            }
          }

          // Update Credit Hours
          if (
            creditHoursStr !== undefined &&
            creditHoursStr !== "" &&
            !isNaN(parseFloat(creditHoursStr))
          ) {
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
    name: "TeacherGradeClasses",
    params: {
      semesterId: semesterId,
      subjectCode: subjectCode,
      gradeCode: gradeCode,
    },
    query: {
      semesterName: semesterName,
      subjectName: subjectName,
      gradeName: gradeName,
    },
  });
};

// 查看成绩证明
const handleViewProof = () => {
  router.push({
    name: "TeacherGradeProof",
  });
};

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
    const response = await teacherAPI.getClassSemesterSubjectGrades(
      classId,
      semesterId,
      subjectCode,
    );
    if (response.status === 200) {
      students.value = response.data.map((student) => ({
        ...student,
        credits_hours: student.credits_hours || 0,
        modified: false,
        score: student.score,
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

    if (row.midterm_score === null && row.final_score === null) {
      // 如果期中和期末都为空，则总评等于平时成绩
      row.score = 0;
      row.level = "E";
      return;
    }

    // 构造请求数据
    const payload = {
      items: [
        {
          identifier: String(row.user_id),
          usual_score: String(row.usual_score),
          midterm_score: row.midterm_score ? String(row.midterm_score) : null,
          final_score: row.final_score ? String(row.final_score) : null,
        },
      ],
    };

    try {
      const res = await teacherAPI.computeFinalScore(payload);
      if (
        res.status === 200 &&
        res.data &&
        res.data.items &&
        res.data.items.length > 0
      ) {
        const result = res.data.items[0];
        // 更新总评和等级
        // 注意：后端返回的 comp_score 可能是字符串，为了统计方便，尝试转为数字
        row.score = parseFloat(result.comp_score);
        row.level = result.comp_level;
      } else {
        ElMessage.error("计算总评失败");
      }
    } catch (error) {
      console.error("Failed to compute score:", error);
      ElMessage.error("计算总评失败");
    }
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
  let count = 0;
  students.value.forEach((student) => {
    // 对未录入或不及格的学生进行处理
    if (student.midterm_score === null && student.final_score === null) {
      return; // 如果期中和期末都为空，则无法调整
    }

    if (
      student.score === null ||
      student.score === undefined ||
      student.score < 60
    ) {
      const mid = student.midterm_score;
      const final = student.final_score;

      // 检查期中和期末成绩是否存在 (0也算存在)
      const hasMid =
        mid !== null && mid !== undefined && String(mid).trim() !== "";
      const hasFinal =
        final !== null && final !== undefined && String(final).trim() !== "";

      let targetUsual = 60; // 默认给及格分

      // 当期中期末成绩都存在时，按照平时成绩30% 期中成绩30% 期末成绩40%计算
      if (hasMid && hasFinal) {
        const midVal = parseFloat(mid);
        const finalVal = parseFloat(final);

        // 目标: 60 = sqrt(mid * 0.3 + final * 0.4 + usual * 0.3) * 10
        // usual = ((60 / 10)^2 - mid * 0.3 - final * 0.4) / 0.3
        let calc = (36 - midVal * 0.3 - finalVal * 0.4) / 0.3;

        targetUsual = calc;
      } else {
        const midVal = parseFloat(mid);
        const finalVal = parseFloat(final);

        const val = hasMid ? midVal : finalVal;
        // 目标: 60 = sqrt(val * 0.6 + usual * 0.4) * 10
        // usual = ((60 / 10)^2 - val * 0.6) / 0.4
        let calc = (36 - val * 0.6) / 0.4;

        targetUsual = calc;
      }

      // 限制在 0-100 之间
      if (targetUsual < 0) targetUsual = 0;
      if (targetUsual > 100) targetUsual = 100;

      // 保留一位小数
      targetUsual = Math.round(targetUsual * 10) / 10;

      // 如果有变化则更新
      if (student.usual_score !== targetUsual) {
        student.usual_score = targetUsual;
        student.modified = true;
        count++;
        handleScoreChange(student);
      }
    }
  });

  if (count > 0) {
    ElMessage.success(`已为 ${count} 名学生调整平时成绩以确保及格`);
  } else {
    ElMessage.info("没有需要调整的学生");
  }
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
    const response = await teacherAPI.saveStudentGrade(
      semesterId,
      classId,
      subjectCode,
      {
        grades: [
          {
            student_id: row.user_id,
            usual_score: row.usual_score,
            credits_hours: row.credits_hours,
            remarks: row.remarks || "",
          },
        ],
      },
    );

    if (response.status === 200) {
      ElMessage.success("保存成功");
      row.modified = false;
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
    const grades = modifiedStudents.map((student) => ({
      student_id: student.user_id,
      usual_score: student.usual_score,
      credits_hours: student.credits_hours,
      remarks: student.remarks || "",
    }));

    const response = await teacherAPI.saveStudentGrade(
      semesterId,
      classId,
      subjectCode,
      {
        semester_id: semesterId,
        class_id: classId,
        subject_code: subjectCode,
        grades: grades,
      },
    );
    if (response.status === 200) {
      ElMessage.success(`成功保存${modifiedStudents.length}个学生的成绩`);
      modifiedStudents.forEach((s) => (s.modified = false));
      await loadStudents();
    }
  } catch (error) {
    ElMessage.error(error.message || "批量保存失败");
  } finally {
    saveLoading.value = false;
  }
};

const handleViewReport = (row) => {
  currentStudentId.value = row.user_id;
  reportDialogVisible.value = true;
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
