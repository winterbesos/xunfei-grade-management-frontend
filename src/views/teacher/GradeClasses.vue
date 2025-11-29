<template>
  <div class="grade-classes">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="handleBack" :icon="ArrowLeft" circle />
            <span style="margin-left: 10px">班级列表 - {{ semesterName }}</span>
          </div>
          <div class="header-right">
            <span class="semester-info">学期: {{ semesterName }}</span>
            &nbsp;&nbsp; &nbsp;&nbsp;
            <span class="semester-info">年级: {{ gradeName }}</span>
            &nbsp;&nbsp; &nbsp;&nbsp;
            <span class="semester-info">科目: {{ subjectName }}</span>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="班级总数" :value="statistics.totalClasses" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="学生总数" :value="statistics.totalStudents" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已录入成绩" :value="statistics.gradedStudents" />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="完成率"
            :value="statistics.completionRate"
            suffix="%"
            :precision="1"
          />
        </el-col>
      </el-row>

      <!-- 班级列表 -->
      <el-table
        v-loading="loading"
        :data="classes"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="class_id"
          label="班级ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="class_full_name"
          label="班级名称"
          min-width="150"
        />
        <el-table-column
          prop="student_count"
          label="学生数"
          width="80"
          align="center"
        />
        <el-table-column
          prop="graded_count"
          label="已评分"
          width="80"
          align="center"
        />
        <el-table-column label="完成率" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="getCompletionRate(row.gradedCount, row.studentCount)"
              :stroke-width="6"
              :color="getProgressColor(row.gradedCount, row.studentCount)"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getClassStatusType(row.gradedCount, row.studentCount)"
            >
              {{ getClassStatusText(row.gradedCount, row.studentCount) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEnterClass(row)"
            >
              录入成绩
            </el-button>
            <el-button
              v-if="row.is_header"
              type="success"
              size="small"
              link
              @click="handleCharacterComment(row)"
            >
              品格评语
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && classes.length === 0"
        description="暂无班级数据"
      />
    </el-card>

    <!-- 进度详情对话框 -->
    <el-dialog v-model="dialogVisible" title="班级成绩录入进度" width="500px">
      <div v-if="currentClass">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="班级名称">{{
            currentClass.name
          }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{
            currentClass.major
          }}</el-descriptions-item>
          <el-descriptions-item label="学生总数">{{
            currentClass.studentCount
          }}</el-descriptions-item>
          <el-descriptions-item label="已评分">{{
            currentClass.gradedCount
          }}</el-descriptions-item>
          <el-descriptions-item label="未评分">{{
            currentClass.studentCount - currentClass.gradedCount
          }}</el-descriptions-item>
          <el-descriptions-item label="完成率">
            <el-progress
              :percentage="
                getCompletionRate(
                  currentClass.gradedCount,
                  currentClass.studentCount,
                )
              "
              :stroke-width="8"
              :color="
                getProgressColor(
                  currentClass.gradedCount,
                  currentClass.studentCount,
                )
              "
            />
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";

const route = useRoute();
const router = useRouter();

const semesterId = route.params.semesterId;
const subjectCode = route.params.subjectCode;
const gradeCode = route.params.gradeCode;
const semesterName = route.query.semesterName || "未知学期";
const subjectName = route.query.subjectName || "未知科目";
const gradeName = route.query.gradeName || "未知年级";

const loading = ref(false);
const classes = ref([]);
const dialogVisible = ref(false);
const currentClass = ref({});

// 统计信息
const statistics = computed(() => {
  const allClasses = classes.value;
  const totalStudents = allClasses.reduce(
    (sum, c) => sum + (c.studentCount || 0),
    0,
  );
  const gradedStudents = allClasses.reduce(
    (sum, c) => sum + (c.gradedCount || 0),
    0,
  );

  return {
    totalClasses: allClasses.length,
    totalStudents: totalStudents,
    gradedStudents: gradedStudents,
    completionRate:
      totalStudents > 0 ? (gradedStudents / totalStudents) * 100 : 0,
  };
});

// 获取完成率
const getCompletionRate = (graded, total) => {
  return total > 0 ? Math.round((graded / total) * 100) : 0;
};

// 获取进度条颜色
const getProgressColor = (graded, total) => {
  const rate = getCompletionRate(graded, total);
  if (rate === 100) return "#67C23A";
  if (rate >= 80) return "#409EFF";
  if (rate >= 50) return "#E6A23C";
  return "#F56C6C";
};

// 获取班级状态类型
const getClassStatusType = (graded, total) => {
  const rate = getCompletionRate(graded, total);
  if (rate === 100) return "success";
  if (rate >= 80) return "";
  if (rate >= 50) return "warning";
  return "danger";
};

// 获取班级状态文本
const getClassStatusText = (graded, total) => {
  const rate = getCompletionRate(graded, total);
  if (rate === 100) return "已完成";
  if (rate > 0) return "进行中";
  return "未开始";
};

// 返回上级
const handleBack = () => {
  router.push("/teacher/grade-management");
};

// 加载班级列表
const loadClasses = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getClassesBySemester(semesterId, {
      subject_code: subjectCode,
      year_code: gradeCode,
    });
    if (response.status === 200) {
      classes.value = response.data;
    }
  } catch (error) {
    ElMessage.error("加载班级列表失败");
  } finally {
    loading.value = false;
  }
};

// 进入班级录入成绩
const handleEnterClass = (row) => {
  router.push({
    name: "TeacherGradeStudents",
    params: {
      semesterId: semesterId,
      subjectCode: subjectCode,
      gradeCode: gradeCode,
      classId: row.class_id,
    },
    query: {
      subjectName: subjectName,
      semesterName: semesterName,
      gradeName: gradeName,
      className: row.class_full_name,
    },
  });
};

// 进入品格评语
const handleCharacterComment = (row) => {
  router.push({
    name: "TeacherCharacterComments",
    params: {
      semesterId: semesterId,
      classId: row.class_id,
    },
  });
};

// 查看进度
const handleViewProgress = (row) => {
  currentClass.value = { ...row };
  dialogVisible.value = true;
};

onMounted(() => {
  loadClasses();
});
</script>

<style scoped>
.grade-classes {
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

.semester-info {
  color: #909399;
  font-size: 14px;
}
</style>
