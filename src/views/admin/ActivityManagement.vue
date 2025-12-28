<template>
  <div class="activity-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <div class="header-actions">
            <el-button @click="handleDownloadTemplate" type="info" link>
              下载导入模板
            </el-button>
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
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              发布活动
            </el-button>
          </div>
        </div>
      </template>

      <!-- 筛选 -->
      <div style="margin-bottom: 20px">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="学期">
            <el-select
              v-model="filterSemesterId"
              placeholder="全部学期"
              style="width: 200px"
              clearable
              @change="handleFilterChange"
            >
              <el-option
                v-for="item in semesterOptions"
                :key="item.semester_id"
                :label="item.academic_year_name + item.term_name"
                :value="item.semester_id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 活动列表 -->
      <el-table
        v-loading="loading"
        :data="activities"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="活动名称" min-width="150" />
        <el-table-column label="级别" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.level === 1
                  ? 'info'
                  : row.level === 2
                    ? 'success'
                    : row.level === 3
                      ? 'warning'
                      : 'danger'
              "
            >
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column label="所属学期" min-width="250">
          <template #default="{ row }">
            {{ row.academic_year_name }}{{ row.term_name
            }}{{ row.semester_name }}
          </template>
        </el-table-column>
        <el-table-column label="荣誉奖项" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="(award, index) in row.awards"
              :key="index"
              class="mx-1"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ typeof award === "string" ? award : award.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 发布活动对话框 -->
    <el-dialog v-model="dialogVisible" title="发布活动" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属学期" prop="semesterId">
          <el-select
            v-model="form.semesterId"
            placeholder="请选择学期"
            style="width: 100%"
          >
            <el-option
              v-for="item in semesterOptions"
              :key="item.semester_id"
              :label="item.academic_year_name + item.term_name"
              :value="item.semester_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" />
        </el-form-item>

        <el-form-item label="活动级别" required>
          <el-select
            v-model="form.level"
            placeholder="请选择活动级别"
            style="width: 100%"
          >
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="学分">
          <el-input-number
            v-model="form.credit"
            :min="0"
            :precision="1"
            :step="0.5"
            placeholder="请输入学分 (可选)"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item required>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>荣誉奖项</span>
              <el-tooltip
                content="学生学期能力项会综合学期内的所有活动和选修课的能力评分计算综合能力评分，点击进入试算页面"
                placement="top"
              >
                <el-icon
                  style="margin-left: 4px; cursor: pointer; color: #909399"
                  @click.stop="labDialogVisible = true"
                >
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <div
            v-for="(award, index) in form.awards"
            :key="index"
            class="award-item-container"
          >
            <div class="award-header">
              <el-input
                v-model="award.name"
                placeholder="请输入奖项名称"
                style="width: 200px; margin-right: 10px"
              />
              <el-button
                v-if="form.awards.length > 1"
                type="danger"
                circle
                size="small"
                @click="removeAward(index)"
              >
                <el-icon><Minus /></el-icon>
              </el-button>
              <el-button
                v-if="index === form.awards.length - 1"
                type="primary"
                circle
                size="small"
                @click="addAward"
                style="margin-left: 5px"
              >
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div class="award-scores">
              <el-form-item
                label="学习能力"
                label-width="80px"
                style="margin-bottom: 5px"
              >
                <el-input-number
                  v-model="award.study_ability"
                  :min="0"
                  :max="10"
                  :step="0.5"
                  size="small"
                />
              </el-form-item>
              <el-form-item
                label="思维逻辑"
                label-width="80px"
                style="margin-bottom: 5px"
              >
                <el-input-number
                  v-model="award.logical_thinking"
                  :min="0"
                  :max="10"
                  :step="0.5"
                  size="small"
                />
              </el-form-item>
              <el-form-item
                label="创新创造"
                label-width="80px"
                style="margin-bottom: 5px"
              >
                <el-input-number
                  v-model="award.creativity"
                  :min="0"
                  :max="10"
                  :step="0.5"
                  size="small"
                />
              </el-form-item>
              <el-form-item
                label="团队协作"
                label-width="80px"
                style="margin-bottom: 5px"
              >
                <el-input-number
                  v-model="award.teamwork"
                  :min="0"
                  :max="10"
                  :step="0.5"
                  size="small"
                />
              </el-form-item>
              <el-form-item
                label="责任心"
                label-width="80px"
                style="margin-bottom: 0"
              >
                <el-input-number
                  v-model="award.responsibility"
                  :min="0"
                  :max="10"
                  :step="0.5"
                  size="small"
                />
              </el-form-item>
            </div>
            <el-divider
              v-if="index !== form.awards.length - 1"
              style="margin: 10px 0"
            />
          </div>
          <div class="form-tip">
            请添加该活动包含的所有荣誉奖项及对应能力分值
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 算法试算实验室对话框 -->
    <el-dialog
      v-model="labDialogVisible"
      title="能力值算法试算"
      width="1200px"
      append-to-body
    >
      <ActivityAlgorithmLab />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Minus,
  Delete,
  Download,
  Upload,
  QuestionFilled,
} from "@element-plus/icons-vue";
import { adminAPI } from "@/api/admin";
import { formatDate } from "@/utils/date";
import * as XLSX from "xlsx";
import ActivityAlgorithmLab from "@/views/common/ActivityAlgorithmLab.vue";

const loading = ref(false);
const submitLoading = ref(false);
const activities = ref([]);
const semesterOptions = ref([]);
const dialogVisible = ref(false);
const labDialogVisible = ref(false);
const formRef = ref(null);
const filterSemesterId = ref(null);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const form = reactive({
  semesterId: null,
  activityName: "",
  level: 1,
  credit: null, // Make credit optional by initializing to null
  awards: [
    {
      name: "",
      study_ability: 0,
      logical_thinking: 0,
      creativity: 0,
      teamwork: 0,
      responsibility: 0,
    },
  ],
});

const levelOptions = [
  { label: "校级", value: 1 },
  { label: "市级", value: 2 },
  { label: "省级", value: 3 },
  { label: "国家级", value: 4 },
];

const getLevelText = (level) => {
  const option = levelOptions.find((opt) => opt.value === level);
  return option ? option.label : "未知";
};

const rules = {
  semesterId: [
    { required: true, message: "请选择所属学期", trigger: "change" },
  ],
  activityName: [
    { required: true, message: "请输入活动名称", trigger: "blur" },
  ],
};

// 加载活动列表
const loadActivities = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      semester_id: filterSemesterId.value,
    };
    const response = await adminAPI.getActivities(params);
    if (response.status === 200) {
      activities.value = response.data.list || response.data;
      pagination.total = response.data.total || response.data.length;
    }
  } catch (error) {
    ElMessage.error("加载活动列表失败");
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  pagination.currentPage = 1;
  loadActivities();
};

// 加载学期选项
const loadSemesters = async () => {
  try {
    const response = await adminAPI.getSemesters();
    if (response.status === 200) {
      semesterOptions.value = response.data.list || response.data;
    }
  } catch (error) {
    console.error("加载学期列表失败", error);
  }
};

const fileInput = ref(null);

// 下载导入模板
const handleDownloadTemplate = () => {
  const headers = ["活动名称", "级别", "学分", "所属学期", "荣誉奖项"];
  const sampleData = [
    [
      "校园艺术节",
      "校级",
      1.0,
      "2023-2024学年第一学期",
      "一等奖，二等奖，三等奖",
    ],
    ["市物理竞赛", "市级", 2.0, "2023-2024学年第一学期", "优胜奖"],
  ];
  const data = [headers, ...sampleData];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "导入模板");
  XLSX.writeFile(wb, "活动导入模板.xlsx");
};

// 导出 Excel
const handleExport = () => {
  if (activities.value.length === 0) {
    ElMessage.warning("没有数据可导出");
    return;
  }

  const headers = ["活动名称", "级别", "学分", "所属学期", "荣誉奖项"];
  const data = activities.value.map((item) => [
    item.name,
    getLevelText(item.level),
    item.credit || "",
    item.academic_year_name + item.term_name + (item.semester_name || ""),
    item.awards.map((a) => (typeof a === "string" ? a : a.name)).join("，"),
  ]);

  data.unshift(headers);

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "活动列表");
  XLSX.writeFile(wb, "活动列表.xlsx");
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
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const results = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // remove header
      results.shift();

      let successCount = 0;
      let failCount = 0;

      for (const row of results) {
        if (!row || row.length === 0) continue;

        // format: Name, LevelStr, Credit, SemesterName, AwardsStr
        const [name, levelStr, credit, semesterName, awardsStr] = row;

        if (!name || !semesterName) {
          failCount++;
          continue;
        }

        // Find Semester ID
        const semester = semesterOptions.value.find(
          (s) =>
            s.academic_year_name + s.term_name === semesterName ||
            s.academic_year_name + s.term_name + (s.semester_name || "") ===
              semesterName,
        );

        if (!semester) {
          failCount++;
          continue;
        }

        // Find Level
        const levelOpt = levelOptions.find((l) => l.label === levelStr);
        const level = levelOpt ? levelOpt.value : 1;

        // Parse Awards
        // Import logic will default scores to 0 since Excel format doesn't specify them
        const awards = awardsStr
          ? String(awardsStr)
              .split(/[,，|]/)
              .map((s) => ({
                name: s.trim(),
                study_ability: 0,
                logical_thinking: 0,
                creativity: 0,
                teamwork: 0,
                responsibility: 0,
              }))
              .filter((s) => s.name)
          : [];

        if (awards.length === 0) {
          failCount++;
          continue;
        }

        try {
          await adminAPI.createActivity(semester.semester_id, {
            name: name,
            level: level,
            credit: credit ? parseFloat(credit) : null,
            awards: awards,
          });
          successCount++;
        } catch (err) {
          console.error(err);
          failCount++;
        }
      }

      if (successCount > 0) {
        ElMessage.success(`成功导入 ${successCount} 个活动`);
        loadActivities();
      }
      if (failCount > 0) {
        ElMessage.warning(`${failCount} 个活动导入失败 (学期不匹配或格式错误)`);
      }
    } catch (error) {
      console.error(error);
      ElMessage.error("导入失败");
    }
    event.target.value = "";
  };
  reader.readAsArrayBuffer(file);
};

const handleAdd = () => {
  form.semesterId = null;
  form.activityName = "";
  form.level = 1;
  form.credit = null;
  form.awards = [
    {
      name: "",
      study_ability: 0,
      logical_thinking: 0,
      creativity: 0,
      teamwork: 0,
      responsibility: 0,
    },
  ];
  dialogVisible.value = true;
};

const addAward = () => {
  form.awards.push({
    name: "",
    study_ability: 0,
    logical_thinking: 0,
    creativity: 0,
    teamwork: 0,
    responsibility: 0,
  });
};

const removeAward = (index) => {
  form.awards.splice(index, 1);
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    // 验证奖项
    const validAwards = form.awards.filter((a) => a.name.trim() !== "");
    if (validAwards.length === 0) {
      ElMessage.warning("请至少添加一个荣誉奖项");
      return;
    }

    submitLoading.value = true;
    try {
      const data = {
        semester_id: form.semesterId,
        name: form.activityName,
        level: form.level,
        credit: form.credit, // Include credit in the payload
        awards: validAwards,
      };

      const response = await adminAPI.createActivity(form.semesterId, data);
      if (response.status === 200) {
        ElMessage.success("发布成功");
        dialogVisible.value = false;
        loadActivities();
      }
    } catch (error) {
      ElMessage.error(error.message || "发布失败");
    } finally {
      submitLoading.value = false;
    }
  });
};

const handleDelete = async (activityId) => {
  try {
    await ElMessageBox.confirm("确定要删除此活动吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await adminAPI.deleteActivity(activityId);
    ElMessage.success("活动删除成功");
    loadActivities();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除活动失败");
    }
  }
};

onMounted(() => {
  loadActivities();
  loadSemesters();
});
</script>

<style scoped>
.activity-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.award-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.award-item-container {
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.award-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.award-scores {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
