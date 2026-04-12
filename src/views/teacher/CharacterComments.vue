<template>
  <div class="character-comments">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="$router.back()" :icon="ArrowLeft" circle />
            <span style="margin-left: 10px; font-weight: 600; font-size: 16px"
              >品格评语</span
            >
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
              type="success"
              class="save"
              @click="handleBatchSave"
              :loading="saveLoading"
            >
              <el-icon><Check /></el-icon>
              保存全部
            </el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="students" stripe style="width: 100%">
        <!--
        <el-table-column
          prop="student_id"
          label="学生ID"
          width="120"
          show-overflow-tooltip
        />
        -->
        <el-table-column
          type="index"
          label="序号"
          width="60"
          align="center"
          fixed="left"
        />
        <el-table-column prop="student_name" label="姓名" width="100" fixed="left" />

        <el-table-column label="学习能力" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.study_ability"
              :min="0"
              :max="10"
              :precision="0"
              :step="1"
              controls-position="right"
              style="width: 90px"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>
        <el-table-column label="逻辑思维" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.logical_thinking"
              :min="0"
              :max="10"
              :precision="0"
              :step="1"
              controls-position="right"
              style="width: 90px"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>
        <el-table-column label="创新创造" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.creativity"
              :min="0"
              :max="10"
              :precision="0"
              :step="1"
              controls-position="right"
              style="width: 90px"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>
        <el-table-column label="团队协作" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.teamwork"
              :min="0"
              :max="10"
              :precision="0"
              :step="1"
              controls-position="right"
              style="width: 90px"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>
        <el-table-column label="责任心" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.responsibility"
              :min="0"
              :max="10"
              :precision="0"
              :step="1"
              controls-position="right"
              style="width: 90px"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>

        <el-table-column label="等第" width="120">
          <template #default="{ row }">
            <el-select
              v-model="row.grade"
              placeholder="请选择"
              clearable
              @change="row.modified = true"
            >
              <el-option
                v-for="opt in gradeOptions"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="品格评语" min-width="220">
          <template #default="{ row }">
            <el-input
              v-model="row.comment"
              type="textarea"
              :rows="2"
              placeholder="请输入品格评语"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :disabled="!row.modified"
              @click="handleSaveSingle(row)"
            >
              保存
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft, Check, Download, Upload } from "@element-plus/icons-vue";
import { teacherAPI } from "@/api/teacher";
import * as XLSX from "xlsx";

const route = useRoute();
const classId = route.params.classId;
const semesterId = route.params.semesterId;
const className = route.query.className || "班级";
const loading = ref(false);
const saveLoading = ref(false);
const students = ref([]);
const fileInput = ref(null);

const gradeOptions = ["A", "B", "C", "D", "E"];

const gradeMap = { A: 5, B: 4, C: 3, D: 2, E: 1 };
const scoreMap = { 5: "A", 4: "B", 3: "C", 2: "D", 1: "E" };

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
    "学习能力",
    "逻辑思维",
    "创新创造",
    "团队协作",
    "责任心",
    "品格评语",
  ];

  // Generate data array
  const data = students.value.map((student) => {
    return [
      student.student_id,
      student.student_name,
      student.abilities.study_ability,
      student.abilities.logical_thinking,
      student.abilities.creativity,
      student.abilities.teamwork,
      student.abilities.responsibility,
      student.comment,
    ];
  });

  // Add headers to the beginning
  data.unshift(headers);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "品格评语");

  // Write file
  XLSX.writeFile(wb, `品格评语_${className}.xlsx`);
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

        // Order: ID, Name, Study, Logic, Creative, Team, Resp, Grade, Comment
        const studentId = row[0];

        if (!studentId) continue;

        const student = students.value.find(
          (s) => String(s.student_id) === String(studentId),
        );

        if (student) {
          let changed = false;

          // Helper to update ability safely
          const updateAbility = (key, value) => {
            if (
              value !== undefined &&
              value !== "" &&
              !isNaN(parseInt(value))
            ) {
              const numVal = Math.min(10, Math.max(0, parseInt(value))); // Clamp 0-10
              if (student.abilities[key] !== numVal) {
                student.abilities[key] = numVal;
                changed = true;
              }
            }
          };

          updateAbility("study_ability", row[2]);
          updateAbility("logical_thinking", row[3]);
          updateAbility("creativity", row[4]);
          updateAbility("teamwork", row[5]);
          updateAbility("responsibility", row[6]);

          // Update Comment
          const commentVal = row[7];
          if (commentVal !== undefined) {
            // Handle conversion if it's not a string (though it likely is)
            const commentStr = String(commentVal);
            if (student.comment !== commentStr) {
              student.comment = commentStr;
              changed = true;
            }
          }

          if (changed) {
            student.modified = true;
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

// 加载学生列表
const loadStudents = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getCharacterComments(semesterId, classId);
    if (response.status === 200) {
      students.value = response.data.map((student) => {
        // Ensure abilities object exists and populate it
        const abilities = student.abilities || {};
        return {
          ...student,
          comment: student.comment || "",
          grade: scoreMap[student.grade] || student.grade || "",
          abilities: {
            study_ability:
              abilities.study_ability || student.study_ability || 0,
            logical_thinking:
              abilities.logical_thinking || student.logical_thinking || 0,
            creativity: abilities.creativity || student.creativity || 0,
            teamwork: abilities.teamwork || student.teamwork || 0,
            responsibility:
              abilities.responsibility || student.responsibility || 0,
          },
          modified: false,
        };
      });
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("加载学生列表失败");
  } finally {
    loading.value = false;
  }
};

// 保存单个
const handleSaveSingle = async (row) => {
  const student = row;
  if (row.comment.length > 200) {
    ElMessage.error("品格评语不能超过200个字符");
    return;
  }

  if (
    student.abilities.study_ability === null ||
    student.abilities.logical_thinking === null ||
    student.abilities.creativity === null ||
    student.abilities.teamwork === null ||
    student.abilities.responsibility === null ||
    student.abilities.study_ability < 0 ||
    student.abilities.study_ability > 10 ||
    student.abilities.logical_thinking < 0 ||
    student.abilities.logical_thinking > 10 ||
    student.abilities.creativity < 0 ||
    student.abilities.creativity > 10 ||
    student.abilities.teamwork < 0 ||
    student.abilities.teamwork > 10 ||
    student.abilities.responsibility < 0 ||
    student.abilities.responsibility > 10
  ) {
    ElMessage.error(`学生[${student.student_name}]的能力评分必须在0到10之间`);
    return;
  }

  try {
    const response = await teacherAPI.saveCharacterComment(
      semesterId,
      classId,
      {
        comments: [
          {
            student_id: row.student_id,
            comment: row.comment,
            grade: gradeMap[row.grade] ?? null,
            abilities: row.abilities,
          },
        ],
      },
    );

    if (response.status === 200) {
      ElMessage.success("保存成功");
      row.modified = false;
    }
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

// 批量保存
const handleBatchSave = async () => {
  const modifiedStudents = students.value.filter((s) => s.modified);
  if (modifiedStudents.length === 0) {
    ElMessage.info("没有需要保存的更改");
    return;
  }

  for (const student of modifiedStudents) {
    if (student.comment.length > 200) {
      ElMessage.error(`学生[${student.student_name}]品格评语不能超过200个字符`);
      return;
    }

    if (
      student.abilities.study_ability === null ||
      student.abilities.logical_thinking === null ||
      student.abilities.creativity === null ||
      student.abilities.teamwork === null ||
      student.abilities.responsibility === null ||
      student.abilities.study_ability < 0 ||
      student.abilities.study_ability > 10 ||
      student.abilities.logical_thinking < 0 ||
      student.abilities.logical_thinking > 10 ||
      student.abilities.creativity < 0 ||
      student.abilities.creativity > 10 ||
      student.abilities.teamwork < 0 ||
      student.abilities.teamwork > 10 ||
      student.abilities.responsibility < 0 ||
      student.abilities.responsibility > 10
    ) {
      ElMessage.error(`学生[${student.student_name}]的能力评分必须在0到10之间`);
      return;
    }
  }

  saveLoading.value = true;
  try {
    const promises = modifiedStudents.map((row) =>
      teacherAPI.saveCharacterComment(semesterId, classId, {
        comments: [
          {
            student_id: row.student_id,
            comment: row.comment,
            grade: gradeMap[row.grade] ?? null,
            abilities: row.abilities,
          },
        ],
      }),
    );

    await Promise.all(promises);

    ElMessage.success(`成功保存${modifiedStudents.length}条评语`);
    modifiedStudents.forEach((s) => (s.modified = false));
  } catch (error) {
    ElMessage.error("批量保存失败");
  } finally {
    saveLoading.value = false;
  }
};

onMounted(() => {
  loadStudents();
});
</script>

<style scoped>
.character-comments {
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

.header-right {
  display: flex;
  align-items: center;
}

.save {
  margin-left: 30px;
}
</style>
