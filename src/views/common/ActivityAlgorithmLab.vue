<template>
  <div class="algo-visualizer">
    <h1 class="page-title">🔍 综合评分算法交互实验室</h1>

    <el-row :gutter="20">
      <!-- 左侧：控制面板 -->
      <el-col :span="9" :xs="24">
        <el-scrollbar height="calc(100vh - 120px)">
          <!-- 1. 算法参数配置 -->
          <el-card class="control-section">
            <template #header>
              <div class="card-header">
                <span>🛠️ 核心参数 (实时生效)</span>
              </div>
            </template>

            <el-form label-position="top" size="small">
              <!-- S_max & Mode -->
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-form-item label="满分标准 (s_max)">
                    <el-input-number
                      v-model="params.s_max"
                      :min="1"
                      :max="1000"
                      @change="handleParamChange"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="计算模式">
                    <el-select
                      v-model="params.mode"
                      @change="handleParamChange"
                    >
                      <el-option label="加权求和 (Sum)" value="sum"></el-option>
                      <el-option
                        label="乘积 (Product)"
                        value="product"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- Alpha -->
              <el-form-item>
                <template #label>
                  <span>权重 Alpha (次数 vs 质量)</span>
                  <el-tag size="small" type="info" style="margin-left: 8px">{{
                    params.alpha
                  }}</el-tag>
                </template>
                <div class="slider-row">
                  <el-slider
                    v-model="params.alpha"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    @input="handleParamChange"
                    style="flex: 1"
                  />
                  <el-input-number
                    v-model="params.alpha"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    controls-position="right"
                    style="width: 90px"
                    @change="handleParamChange"
                  />
                </div>
              </el-form-item>

              <!-- K -->
              <el-form-item>
                <template #label>
                  <span>饱和系数 K (次数增长速度)</span>
                  <el-tooltip
                    content="K值越小，次数分P增长越快"
                    placement="top"
                  >
                    <el-icon style="margin-left: 4px"><InfoFilled /></el-icon>
                  </el-tooltip>
                </template>
                <div class="slider-row">
                  <el-slider
                    v-model="params.k"
                    :min="0.1"
                    :max="50"
                    :step="0.1"
                    @input="handleParamChange"
                    style="flex: 1"
                  />
                  <el-input-number
                    v-model="params.k"
                    :min="0.1"
                    :max="100"
                    :step="0.5"
                    controls-position="right"
                    style="width: 90px"
                    @change="handleParamChange"
                  />
                </div>
              </el-form-item>

              <!-- Prior Strength -->
              <el-form-item>
                <template #label>
                  <span>先验强度 C (防刷分力度)</span>
                  <el-tooltip
                    content="贝叶斯平滑强度，值越大越偏向先验均值"
                    placement="top"
                  >
                    <el-icon style="margin-left: 4px"><InfoFilled /></el-icon>
                  </el-tooltip>
                </template>
                <div class="slider-row">
                  <el-slider
                    v-model="params.prior_strength"
                    :min="0"
                    :max="30"
                    :step="0.1"
                    @input="handleParamChange"
                    style="flex: 1"
                  />
                  <el-input-number
                    v-model="params.prior_strength"
                    :min="0"
                    :max="100"
                    :step="0.5"
                    controls-position="right"
                    style="width: 90px"
                    @change="handleParamChange"
                  />
                </div>
              </el-form-item>

              <el-divider content-position="center">可视化设置</el-divider>
              <el-form-item label="图表 X 轴最大次数 (Max N)">
                <el-input-number
                  v-model="viewSettings.maxN"
                  :min="10"
                  :max="500"
                  :step="10"
                  @change="handleParamChange"
                  style="width: 100%"
                />
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 2. 数据输入编辑器 -->
          <el-card class="control-section input-card">
            <template #header>
              <div class="card-header">
                <span>📝 评分数据编辑器</span>
                <el-button type="danger" link size="small" @click="clearScores"
                  >清空</el-button
                >
              </div>
            </template>

            <!-- 文本批量输入 -->
            <el-input
              v-model="inputString"
              type="textarea"
              :rows="2"
              placeholder="输入分数，用逗号分隔 (例: 5, 4, 3.5)"
              @input="handleTextInput"
            />

            <!-- 快捷按钮 -->
            <div class="quick-actions">
              <el-button size="small" @click="addScore(params.s_max)"
                >+ 满分({{ params.s_max }})</el-button
              >
              <el-button size="small" @click="addScore(params.s_max * 0.8)"
                >+ 良好</el-button
              >
              <el-button size="small" @click="addScore(params.s_max * 0.6)"
                >+ 及格</el-button
              >
              <el-button size="small" @click="addScore(1)">+ 1分</el-button>
            </div>

            <!-- 标签式管理 -->
            <div class="score-tags">
              <span v-if="scoreList.length === 0" class="empty-tip"
                >暂无数据，请添加...</span
              >
              <transition-group name="list">
                <el-tag
                  v-for="(score, index) in scoreList"
                  :key="index + '-' + score"
                  closable
                  :type="getScoreTagType(score)"
                  class="score-tag"
                  @close="removeScore(index)"
                >
                  {{ score }}
                </el-tag>
              </transition-group>
            </div>

            <!-- 结果展示 -->
            <div v-if="singleResult" class="result-area">
              <el-row :gutter="10">
                <el-col :span="12">
                  <div class="result-box main-score">
                    <div class="result-val">
                      {{ singleResult.total.toFixed(4) }}
                    </div>
                    <div class="result-label">综合总分 (Score)</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="result-box">
                    <div class="result-val highlight-dark">
                      {{ singleResult.n }} 次
                    </div>
                    <div class="result-label">参与次数 (N)</div>
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="10" style="margin-top: 10px">
                <el-col :span="8">
                  <div class="result-box">
                    <div class="result-val highlight-green">
                      {{ (singleResult.p * 100).toFixed(1) }}%
                    </div>
                    <div class="result-label">次数得分 P</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="result-box">
                    <div class="result-val highlight-orange">
                      {{ (singleResult.q_norm * 100).toFixed(1) }}%
                    </div>
                    <div class="result-label">质量得分 Q</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="result-box">
                    <div class="result-val highlight-gray">
                      {{ singleResult.rawAvg.toFixed(2) }}
                    </div>
                    <div class="result-label">原始均分</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-scrollbar>
      </el-col>

      <!-- 右侧：图表区域 -->
      <el-col :span="15" :xs="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>📊 模型热力图 (算法全局视角)</span>
              <el-tooltip
                content="X轴:次数, Y轴:平均分, 颜色:最终得分. 十字准星代表当前输入数据的落点。"
                placement="top"
              >
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div ref="heatmapRef" class="chart-container"></div>
        </el-card>

        <el-card style="margin-top: 15px">
          <template #header>
            <span>📈 增长曲线模拟</span>
          </template>
          <div
            ref="lineChartRef"
            class="chart-container"
            style="height: 300px"
          ></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { InfoFilled } from "@element-plus/icons-vue";
import * as echarts from "echarts";

// --- 1. 状态定义 ---
const params = reactive({
  s_max: 5,
  prior_mean: null, // 将在逻辑中处理默认值
  prior_strength: 5.0,
  k: 6.0,
  alpha: 0.5,
  mode: "sum",
});

const viewSettings = reactive({
  maxN: 50, // 图表X轴显示范围
});

const inputString = ref("5, 4, 5, 5, 3");
const scoreList = ref([]);
const singleResult = ref(null);

// DOM Refs for Charts
const heatmapRef = ref(null);
const lineChartRef = ref(null);

let myChart = null;
let lineChart = null;

// --- 2. 核心算法 (移植自 Python) ---
const calculateScore = (scores, p_n = null) => {
  const n = p_n !== null ? p_n : scores.length;

  // 次数得分 P: 饱和增长
  const p = 1.0 - Math.exp(-n / params.k);

  // 质量得分 Q: 贝叶斯收缩
  let avgScore = 0;
  let total = 0;
  if (Array.isArray(scores)) {
    // 真实数据模式
    total = scores.reduce((a, b) => a + b, 0);
    avgScore = scores.length > 0 ? total / scores.length : 0;
  } else {
    // 模拟绘图模式：传入的是假设的平均分
    avgScore = scores;
    total = avgScore * n;
  }

  const priorMean =
    params.prior_mean !== null ? params.prior_mean : 0.65 * params.s_max;
  // 公式: (C * m + sum(x)) / (C + n)
  const q_raw =
    (params.prior_strength * priorMean + total) / (params.prior_strength + n);
  const q_norm = Math.max(0.0, Math.min(q_raw / params.s_max, 1.0));

  // 综合得分
  let total_score = 0;
  if (params.mode === "sum") {
    total_score = params.alpha * p + (1.0 - params.alpha) * q_norm;
  } else {
    // product
    total_score = p * q_norm;
  }

  return {
    total: total_score,
    p: p,
    q_norm: q_norm,
    rawAvg: avgScore,
    n: n,
  };
};

// --- 3. 交互逻辑 ---

// 解析文本输入
const handleTextInput = () => {
  const str = inputString.value.replace(/，/g, ",");
  const arr = str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "" && !isNaN(Number(s)))
    .map(Number);
  scoreList.value = arr;
  updateAll();
};

// 同步回文本框
const syncString = () => {
  inputString.value = scoreList.value.join(", ");
  updateAll();
};

// 添加/删除/清空
const addScore = (val) => {
  scoreList.value.push(Number(val));
  syncString();
};

const removeScore = (index) => {
  scoreList.value.splice(index, 1);
  syncString();
};

const clearScores = () => {
  scoreList.value = [];
  syncString();
};

const getScoreTagType = (val) => {
  const ratio = val / params.s_max;
  if (ratio >= 0.8) return "success";
  if (ratio >= 0.6) return "warning";
  return "danger";
};

// --- 4. 图表更新逻辑 ---

const updateAll = () => {
  // 4.1 计算单次结果
  if (scoreList.value.length >= 0) {
    singleResult.value = calculateScore(scoreList.value);
  }

  if (!myChart || !lineChart) return;

  // 4.2 热力图数据
  const maxN = viewSettings.maxN;
  const nSteps = maxN;
  const sSteps = 50;

  const xData = [];
  const yData = [];
  const data = [];

  for (let i = 0; i <= nSteps; i++) xData.push(i);
  // Y轴刻度: 0 到 s_max
  for (let j = 0; j <= sSteps; j++)
    yData.push(((j / sSteps) * params.s_max).toFixed(1));

  // 生成矩阵数据
  for (let i = 0; i <= nSteps; i++) {
    for (let j = 0; j <= sSteps; j++) {
      const avg = parseFloat(yData[j]);
      const res = calculateScore(avg, i); // 传入 (均分, 次数)
      data.push([i, j, res.total.toFixed(3)]);
    }
  }

  // 标记点 (Crosshair)
  const markPointData = [];
  if (singleResult.value) {
    markPointData.push({
      xAxis: singleResult.value.n > maxN ? maxN : singleResult.value.n,
      yAxis: singleResult.value.rawAvg.toFixed(1), // 近似匹配Y轴字符串
      value: "当前",
      itemStyle: { color: "#fff", borderColor: "#333", borderWidth: 1 },
    });
  }

  myChart.setOption({
    xAxis: { data: xData },
    yAxis: { data: yData },
    visualMap: {
      max: 1, // 确保归一化颜色
    },
    series: [
      {
        data: data,
        markPoint: {
          symbol: "cross",
          symbolSize: 20,
          label: {
            show: true,
            position: "top",
            formatter: "YOU",
            color: "#fff",
            fontWeight: "bold",
          },
          data: markPointData,
          itemStyle: { color: "#000" }, // Fallback color
        },
      },
    ],
  });

  // 4.3 折线图数据
  const lineX = [];
  for (let i = 0; i <= maxN; i++) lineX.push(i);

  const getLineData = (percent) => {
    return lineX.map((n) => calculateScore(params.s_max * percent, n).total);
  };

  lineChart.setOption({
    xAxis: { data: lineX },
    series: [
      { data: getLineData(1.0) },
      { data: getLineData(0.6) },
      { data: getLineData(0.2) },
    ],
  });
};

const handleParamChange = () => {
  updateAll();
};

// --- 5. 生命周期 & 初始化 ---

const initCharts = () => {
  if (!heatmapRef.value || !lineChartRef.value) return;

  myChart = echarts.init(heatmapRef.value);
  lineChart = echarts.init(lineChartRef.value);

  // 热力图基础配置
  const heatmapOption = {
    tooltip: {
      position: "top",
      formatter: (p) => {
        return `次数: ${p.data[0]}<br/>均分: ${p.data[1]}<br/><b>得分: ${p.data[2]}</b>`;
      },
    },
    animation: false,
    grid: { height: "80%", top: "10%", right: "5%" },
    xAxis: {
      type: "category",
      name: "次数 N",
      nameLocation: "middle",
      nameGap: 25,
    },
    yAxis: { type: "category", name: "平均分", nameGap: 5 },
    visualMap: {
      min: 0,
      max: 1,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: { color: ["#f6efa6", "#d88273", "#bf444c"] }, // 黄 -> 红
    },
    series: [
      {
        type: "heatmap",
        emphasis: { itemStyle: { borderColor: "#333", borderWidth: 1 } },
      },
    ],
  };

  // 折线图基础配置
  const lineOption = {
    tooltip: { trigger: "axis" },
    legend: { data: ["满分用户 (100%)", "及格用户 (60%)", "低分用户 (20%)"] },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", boundaryGap: false },
    yAxis: { type: "value", min: 0, max: 1 },
    series: [
      {
        name: "满分用户 (100%)",
        type: "line",
        smooth: true,
        showSymbol: false,
      },
      { name: "及格用户 (60%)", type: "line", smooth: true, showSymbol: false },
      { name: "低分用户 (20%)", type: "line", smooth: true, showSymbol: false },
    ],
  };

  myChart.setOption(heatmapOption);
  lineChart.setOption(lineOption);
};

// 窗口大小监听
const resizeHandler = () => {
  myChart && myChart.resize();
  lineChart && lineChart.resize();
};

onMounted(() => {
  // 初始化数据
  handleTextInput();

  nextTick(() => {
    initCharts();
    updateAll();
    window.addEventListener("resize", resizeHandler);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeHandler);
  if (myChart) myChart.dispose();
  if (lineChart) lineChart.dispose();
});
</script>

<style scoped lang="scss">
.algo-visualizer {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100vh;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", Arial, sans-serif;
}

.page-title {
  text-align: center;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 300;
  font-size: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.control-section {
  margin-bottom: 20px;

  &.input-card {
    border-left: 4px solid #409eff;
  }
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.score-tags {
  margin-top: 15px;
  min-height: 48px;
  padding: 8px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  background: #fafafa;

  .empty-tip {
    color: #ccc;
    font-size: 12px;
    padding: 5px;
    width: 100%;
    text-align: center;
  }

  .score-tag {
    transition: all 0.3s;
  }
}

/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.result-area {
  margin-top: 20px;
}

.result-box {
  text-align: center;
  padding: 15px 5px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }

  &.main-score {
    border-color: #409eff;
    background: #ecf5ff;
  }
}

.result-val {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  line-height: 1.2;

  &.highlight-dark {
    color: #303133;
    font-size: 20px;
  }
  &.highlight-green {
    color: #67c23a;
    font-size: 18px;
  }
  &.highlight-orange {
    color: #e6a23c;
    font-size: 18px;
  }
  &.highlight-gray {
    color: #909399;
    font-size: 18px;
  }
}

.result-label {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.chart-container {
  width: 100%;
  height: 450px;
}
</style>
