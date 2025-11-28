<template>
  <div class="grade-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成绩管理 - 可打分学期</span>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic
            title="可打分学期数"
            :value="statistics.availableSemesters"
          />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="进行中学期"
            :value="statistics.activeSemesters"
          />
        </el-col>
        <el-col :span="6">
          <el-button
            type="success"
            @click="handleViewProof"
            style="margin-top: 10px"
          >
            <el-icon><Document /></el-icon>
            成绩证明
          </el-button>
        </el-col>
      </el-row>

      <!-- 学期列表 -->
      <el-table
        v-loading="loading"
        :data="semesters"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="semester_id"
          label="学期ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="semester_name"
          label="学期名称"
          min-width="150"
        />
        <el-table-column prop="year.year_name" label="年级" min-width="150" />
        <el-table-column
          prop="subject.subject_name"
          label="科目"
          min-width="150"
        />
        <el-table-column prop="begin_time" label="开始时间" width="200" />
        <el-table-column prop="end_time" label="结束时间" width="200" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              :disabled="!row.enabled"
              type="primary"
              size="small"
              link
              @click="handleEnterGrades(row)"
            >
              进入打分
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && semesters.length === 0"
        description="暂无可打分的学期"
      />
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="dialogVisible" title="学期详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="学期ID">{{
          currentSemester.id
        }}</el-descriptions-item>
        <el-descriptions-item label="学期名称">{{
          currentSemester.name
        }}</el-descriptions-item>
        <el-descriptions-item label="学校ID">{{
          currentSemester.schoolId
        }}</el-descriptions-item>
        <el-descriptions-item label="学校名称">{{
          currentSemester.schoolName
        }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{
          currentSemester.startDate
        }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{
          currentSemester.endDate
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentSemester)">
            {{ getStatusText(currentSemester) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="课程数">{{
          currentSemester.courseCount || 0
        }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{
          currentSemester.remark || "-"
        }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";

const router = useRouter();
const loading = ref(false);
const semesters = ref([]);
const dialogVisible = ref(false);
const currentSemester = ref({});

// 查询表单
const queryForm = reactive({
  name: "",
  status: null,
});

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 统计信息
const statistics = computed(() => {
  const allSemesters = semesters.value;
  return {
    availableSemesters: allSemesters.filter((s) => s.canGrade).length,
    activeSemesters: allSemesters.filter((s) => s.status === "active").length,
    totalCourses: allSemesters.reduce(
      (sum, s) => sum + (s.courseCount || 0),
      0,
    ),
  };
});

// 获取状态类型
const getStatusType = (cycle) => {
  if (cycle.enabled) return "success";
  return null;
};

// 获取状态文本
const getStatusText = (cycle) => {
  if (!cycle.enabled) return "未开始";
  else return "已开启";
};

// 加载可打分的学期列表
const loadAvailableSemesters = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      teacherId: 2, // TODO: 从authStore获取当前教师ID
      canGrade: true, // 只显示可打分的学期
      ...queryForm,
    };

    // 移除空值参数
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === "") {
        delete params[key];
      }
    });

    const response = await teacherAPI.getSemesterSubjects(params);
    if (response.status === 200) {
      semesters.value = response.data.map((item) => {
        item.semester.subject = item.subject;
        item.semester.year = item.year;
        return item.semester;
      });
      pagination.total = response.data.length;
    }
  } catch (error) {
    ElMessage.error("加载可打分学期列表失败");
  } finally {
    loading.value = false;
  }
};

// 进入打分
const handleEnterGrades = (row) => {
  router.push({
    name: "TeacherGradeClasses",
    params: {
      semesterId: row.semester_id,
      subjectCode: row.subject.subject_code,
    },
    query: {
      semesterName: row.semester_name,
      subjectName: row.subject.subject_name,
    },
  });
};

// 查看学生成绩报告
const handleViewReport = (row) => {
  router.push({
    name: "TeacherGradeReport",
    params: { semesterId: row.semester_id },
    query: { semesterName: row.semester_name },
  });
};

// 查看成绩证明
const handleViewProof = () => {
  router.push({
    name: "TeacherGradeProof",
  });
};

onMounted(() => {
  loadAvailableSemesters();
});
</script>

<style scoped>
.grade-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
