<template>
  <div class="character-comments">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="$router.back()" :icon="ArrowLeft" circle />
            <span style="margin-left: 10px">品格评语</span>
          </div>
          <div class="header-right">
            <el-button
              type="primary"
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
        <el-table-column
          prop="student_id"
          label="学生ID"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="student_name" label="姓名" width="100" />

        <el-table-column label="学习能力" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.study_ability"
              :min="0"
              :max="10"
              size="small"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>
        <el-table-column label="逻辑思维" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.logical_thinking"
              :min="0"
              :max="10"
              size="small"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>
        <el-table-column label="创新创造" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.creativity"
              :min="0"
              :max="10"
              size="small"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>
        <el-table-column label="团队协作" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.teamwork"
              :min="0"
              :max="10"
              size="small"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>
        <el-table-column label="责任心" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.abilities.responsibility"
              :min="0"
              :max="10"
              size="small"
              @change="row.modified = true"
            />
          </template>
        </el-table-column>

        <el-table-column label="品格等第" width="120">
          <template #default="{ row }">
            <el-select
              v-model="row.grade"
              placeholder="请选择"
              size="small"
              @change="row.modified = true"
            >
              <el-option
                v-for="item in gradeOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="品格评语">
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
        <el-table-column label="操作" width="100">
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
import { ArrowLeft, Check } from "@element-plus/icons-vue";
import { teacherAPI } from "@/api/teacher";

const route = useRoute();
const classId = route.params.classId;
const semesterId = route.params.semesterId;
const loading = ref(false);
const saveLoading = ref(false);
const students = ref([]);

const gradeOptions = ["A", "B", "C", "D", "E"];

const gradeMap = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
};

const scoreMap = {
  5: "A",
  4: "B",
  3: "C",
  2: "D",
  1: "E",
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
  try {
    const response = await teacherAPI.saveCharacterComment(
      semesterId,
      classId,
      {
        comments: [
          {
            student_id: row.student_id,
            comment: row.comment,
            grade: gradeMap[row.grade] || row.grade,
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

  saveLoading.value = true;
  try {
    const promises = modifiedStudents.map((row) =>
      teacherAPI.saveCharacterComment(semesterId, classId, {
        comments: [
          {
            student_id: row.student_id,
            comment: row.comment,
            grade: gradeMap[row.grade] || row.grade,
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
</style>
