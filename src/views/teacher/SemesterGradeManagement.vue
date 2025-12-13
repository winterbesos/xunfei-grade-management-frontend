<template>
  <div class="semester-grade-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <span style="margin-left: 10px">{{ semesterName }} - 成绩管理</span>
          </div>
        </div>
      </template>

      <el-tabs
        v-model="activeTab"
        class="demo-tabs"
        @tab-change="handleTabChange"
      >
        <el-tab-pane label="必修学科" name="compulsory">
          <el-table
            v-loading="loadingCompulsorySubjects"
            :data="currentCompulsorySubjects"
            stripe
            style="width: 100%; margin-top: 20px"
          >
            <el-table-column
              prop="subject.subject_name"
              label="学科"
              min-width="150"
            />
            <el-table-column
              prop="year.year_name"
              label="年级"
              min-width="150"
            />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
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
            v-if="
              !loadingCompulsorySubjects &&
              currentCompulsorySubjects.length === 0
            "
            description="该学期暂无必修学科"
          />
        </el-tab-pane>

        <el-tab-pane label="选修学科" name="elective">
          <el-table
            v-loading="loadingElectiveSubjects"
            :data="currentElectiveSubjects"
            stripe
            style="width: 100%; margin-top: 20px"
          >
            <el-table-column prop="name" label="学科名称" min-width="150" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="handleEnterElectiveStudentList(row)"
                >
                  进入录入
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="
              !loadingElectiveSubjects && currentElectiveSubjects.length === 0
            "
            description="该学期暂无选修学科"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { ArrowLeft } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();

const semesterId = route.params.semesterId;
const semesterName = route.query.semesterName || "学期";

const activeTab = ref("compulsory");

// 必修课学科列表
const loadingCompulsorySubjects = ref(false);
const currentCompulsorySubjects = ref([]);

// 选修课学科列表
const loadingElectiveSubjects = ref(false);
const currentElectiveSubjects = ref([]);

// 返回上一页
const handleBack = () => {
  router.push({
    name: "TeacherGradeManagement",
  });
};

// 切换 Tab
const handleTabChange = (tabName) => {
  if (
    tabName === "compulsory" &&
    currentCompulsorySubjects.value.length === 0
  ) {
    loadCompulsorySubjects();
  } else if (
    tabName === "elective" &&
    currentElectiveSubjects.value.length === 0
  ) {
    loadElectiveSubjects();
  }
};

// 加载当前学期的必修学科
const loadCompulsorySubjects = async () => {
  loadingCompulsorySubjects.value = true;
  try {
    const response = await teacherAPI.getSemesterSubjects(semesterId);
    if (response.status === 200) {
      currentCompulsorySubjects.value = response.data.map((item) => ({
        ...item,
      }));
    }
  } catch (error) {
    ElMessage.error("加载必修学科列表失败");
  } finally {
    loadingCompulsorySubjects.value = false;
  }
};

// 加载当前学期的选修学科
const loadElectiveSubjects = async () => {
  loadingElectiveSubjects.value = true;
  try {
    const response = await teacherAPI.getElectiveSubjects({
      semester_id: semesterId,
    });
    if (response.status === 200) {
      currentElectiveSubjects.value = response.data;
    }
  } catch (error) {
    ElMessage.error("加载选修学科列表失败");
  } finally {
    loadingElectiveSubjects.value = false;
  }
};

// 进入必修课打分
const handleEnterGrades = (row) => {
  router.push({
    name: "TeacherGradeClasses",
    params: {
      semesterId: semesterId,
      subjectCode: row.subject.subject_code,
      gradeCode: row.year.year_code,
    },
    query: {
      semesterName: semesterName,
      subjectName: row.subject.subject_name,
      gradeName: row.year.year_name,
    },
  });
};

// 进入选修课成绩录入
const handleEnterElectiveStudentList = (row) => {
  router.push({
    name: "TeacherElectiveGradeEntry",
    params: {
      semesterId: semesterId,
      electiveSubjectId: row.id,
    },
    query: {
      subjectName: row.name,
    },
  });
};

onMounted(() => {
  // 默认加载必修课
  loadCompulsorySubjects();
});
</script>

<style scoped>
.semester-grade-management {
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
