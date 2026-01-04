<template>
  <div class="report-container">
    <!-- 1. 背景层 -->
    <div class="particles">
      <div
        v-for="(p, i) in particles"
        :key="i"
        class="particle"
        :style="p.style"
      ></div>
    </div>

    <!-- 2. 音乐控制 -->
    <audio ref="audioRef" loop>
      <!-- 替换为您自己的音乐链接 -->
      <source
        src="https://music.163.com/song/media/outer/url?id=139774.mp3"
        type="audio/mpeg"
      />
    </audio>
    <div
      class="music-btn"
      :class="{ playing: isMusicPlaying }"
      @click="toggleMusic"
      v-show="isStarted"
    ></div>

    <!-- 3. 启动遮罩 -->
    <transition name="fade">
      <div v-if="!isStarted" class="start-overlay">
        <div class="title">年度成长报告</div>
        <div class="subtitle">点击开启 {{ reportData.year_name }} 的记忆</div>
        <button class="start-btn" @click="startJourney">开启旅程</button>
      </div>
    </transition>

    <!-- 4. 内容滑动区 -->
    <div class="swiper-box" ref="swiperRef">
      <!-- Page 1: 封面 -->
      <section
        class="page"
        :class="{ active: activeIndex === 0 }"
        data-index="0"
      >
        <div class="anim-item d-1 avatar-box">🎓</div>
        <div class="anim-item d-2 intro-text">
          Hi, <span class="bold">{{ reportData.student_name }}</span>
        </div>
        <div class="anim-item d-3">
          <h1 class="main-title">这是你的<br />年度学业总结</h1>
        </div>
        <div class="anim-item d-4 desc mt-20">
          <p>{{ reportData.school_name }}</p>
          <p>{{ reportData.class_name }} | {{ reportData.year_name }}</p>
        </div>
        <div class="anim-item d-5 hint-text">向上滑动查看详情</div>
        <div class="arrow-up"></div>
      </section>

      <!-- Page 2: 成绩单 -->
      <section
        class="page"
        :class="{ active: activeIndex === 1 }"
        data-index="1"
      >
        <div class="anim-item d-1">
          <h1>学业足迹</h1>
          <p class="desc">这一年，你在这些课程中留下了汗水</p>
        </div>

        <div class="glass-card anim-item d-2 scroll-card">
          <div class="grade-header">
            <span>科目</span>
            <span class="sub-header">一学期 / 二学期 / 总评</span>
          </div>
          <div class="grade-scroll">
            <div
              v-for="(g, idx) in reportData.grades"
              :key="idx"
              class="grade-row"
            >
              <div class="subject-col">
                <span class="subject-name">{{ g.subject_name }}</span>
                <span v-if="g.makeup_score" class="tag-makeup"
                  >补考:{{ g.makeup_score }}</span
                >
              </div>
              <div class="score-col">
                <span class="s-term">{{ g.term_1_score || "-" }}</span>
                <span class="s-divider">/</span>
                <span class="s-term">{{ g.term_2_score || "-" }}</span>
                <span class="s-divider">➜</span>
                <span class="s-final">{{ g.score || "-" }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="arrow-up"></div>
      </section>

      <!-- Page 3: 荣誉/奖项 (如果有) -->
      <section
        class="page"
        :class="{ active: activeIndex === 2 }"
        data-index="2"
      >
        <div class="anim-item d-1">
          <h1>高光时刻</h1>
          <p class="desc" v-if="hasAwards">你的努力，闪闪发光 ✨</p>
          <p class="desc" v-else>蓄力待发，静待花开 🌱</p>
        </div>

        <div class="glass-card anim-item d-2 list-card">
          <!-- 有奖项的情况 -->
          <div v-if="hasAwards" class="awards-list">
            <div
              v-for="(award, idx) in reportData.awards"
              :key="award.id"
              class="award-item"
            >
              <div class="award-icon">🏆</div>
              <div class="award-info">
                <div class="award-name">{{ award.name }}</div>
                <div class="activity-name">{{ award.activity_name }}</div>
                <div class="award-date" v-if="award.approved_at">
                  {{ formatDate(award.approved_at) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 无奖项的情况 -->
          <div v-else class="empty-state">
            <div class="empty-icon">🌟</div>
            <p>每一份努力都在扎根<br />明年继续加油！</p>
          </div>
        </div>
        <div class="arrow-up"></div>
      </section>

      <!-- Page 4: 评语 -->
      <section
        class="page"
        :class="{ active: activeIndex === 3 }"
        data-index="3"
      >
        <div class="anim-item d-1">
          <h1>成长寄语</h1>
          <p class="desc">老师眼中的你</p>
        </div>

        <div class="anim-item d-2 comment-container">
          <!-- 第一学期 -->
          <div class="glass-card comment-card mb-20">
            <div class="card-title">
              <span>第一学期</span>
              <span class="level-badge" v-if="comments.term_1_level">{{
                comments.term_1_level
              }}</span>
            </div>
            <p class="comment-text">
              {{ comments.term_1_comment || "暂无评语" }}
            </p>
          </div>

          <!-- 第二学期 -->
          <div class="glass-card comment-card">
            <div class="card-title">
              <span>第二学期</span>
              <span class="level-badge" v-if="comments.term_2_level">{{
                comments.term_2_level
              }}</span>
            </div>
            <p class="comment-text">
              {{ comments.term_2_comment || "暂无评语" }}
            </p>
          </div>
        </div>

        <div class="arrow-up"></div>
      </section>

      <!-- Page 5: 结尾 -->
      <section
        class="page"
        :class="{ active: activeIndex === 4 }"
        data-index="4"
      >
        <div class="anim-item d-1 text-center">
          <div class="avatar-box small">🎓</div>
          <h2 class="mt-20">再见，{{ reportData.year_name }}</h2>
          <p class="desc mt-10">凡是过往，皆为序章</p>
        </div>

        <div class="glass-card anim-item d-3 summary-card">
          <p>姓名：{{ reportData.student_name }}</p>
          <!-- <p>学号：{{ reportData.student_id }}</p> -->
          <p>班级：{{ reportData.class_name }}</p>
        </div>

        <div class="anim-item d-4 footer-note">
          <!-- Generated by Annual Report System -->
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { studentAPI } from "@/api/student";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();

const studentId = route.params.studentId;
const academicYearId = route.params.academicYearId;

// --- 1. 数据模拟 (对应 StudentYearReportResponse) ---
const reportData = ref({
  student_id: "",
  student_name: "",
  school_name: "",
  class_name: "",
  year_name: "",
  grades: [
    {
      subject_code: "01",
      subject_name: "语文",
      year_code: "2024",
      year_name: "2024",
      term_1_score: "88.5",
      term_2_score: "90.0",
      score: "89.5",
      makeup_score: null,
    },
    {
      subject_code: "02",
      subject_name: "数学",
      year_code: "2024",
      year_name: "2024",
      term_1_score: "92.0",
      term_2_score: "95.5",
      score: "94.0",
      makeup_score: null,
    },
    {
      subject_code: "03",
      subject_name: "英语",
      year_code: "2024",
      year_name: "2024",
      term_1_score: "85.0",
      term_2_score: "82.0",
      score: "83.5",
      makeup_score: null,
    },
    {
      subject_code: "04",
      subject_name: "物理",
      year_code: "2024",
      year_name: "2024",
      term_1_score: "58.0",
      term_2_score: "70.0",
      score: "64.0",
      makeup_score: "60 (已过)",
    },
  ],
  character_comments: {
    year_code: "2024",
    year_name: "2024",
    term_1_comment:
      "该生学习态度端正，乐于助人，但在理科方面需要投入更多精力。",
    term_1_level: "优",
    term_2_comment: "本学期进步明显，积极参与社团活动，展现了良好的领导力。",
    term_2_level: "优+",
  },
  awards: [
    {
      id: 1,
      activity_id: 101,
      activity_name: "校园文化节",
      name: "优秀志愿者",
      student_id: "2023001",
      student_name: "蔡欣妍",
      status: "approved",
      approval_teacher_name: "张老师",
      approved_at: "2024-12-20T10:00:00",
    },
    {
      id: 2,
      activity_id: 102,
      activity_name: "全国中学生数学联赛",
      name: "市级三等奖",
      student_id: "2023001",
      student_name: "蔡欣妍",
      status: "approved",
      approval_teacher_name: "李老师",
      approved_at: "2025-01-15T14:30:00",
    },
  ],
});

// --- 2. 状态控制 ---
const isStarted = ref(false);
const isMusicPlaying = ref(false);
const activeIndex = ref(0);
const audioRef = ref(null);
const swiperRef = ref(null);

// --- 3. 计算属性 ---
const comments = computed(() => reportData.value.character_comments || {});
const hasAwards = computed(
  () => reportData.value.awards && reportData.value.awards.length > 0,
);

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

// --- 4. 粒子效果 ---
const particles = ref([]);
const initParticles = () => {
  for (let i = 0; i < 25; i++) {
    const size = Math.random() * 15 + 3;
    particles.value.push({
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 15 + 10}s`,
        animationDelay: `${Math.random() * 5}s`,
      },
    });
  }
};

// --- 5. 交互逻辑 ---
const startJourney = async () => {
  isStarted.value = true;
  if (audioRef.value) {
    try {
      await audioRef.value.play();
      isMusicPlaying.value = true;
    } catch (e) {
      console.warn("Autoplay blocked", e);
    }
  }
};

const toggleMusic = () => {
  if (!audioRef.value) return;
  if (isMusicPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play();
  }
  isMusicPlaying.value = !isMusicPlaying.value;
};

// --- 6. 滚动监听 ---
onMounted(async () => {
  const response = await studentAPI.getYearReport(studentId, academicYearId);
  reportData.value = response.data;

  initParticles();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeIndex.value = Number(entry.target.dataset.index);
        }
      });
    },
    { threshold: 0.4 },
  );

  document.querySelectorAll(".page").forEach((page) => observer.observe(page));
});
</script>

<style scoped>
.report-container {
  --bg-deep: #0f0c29;
  --bg-mid: #302b63;
  --bg-light: #24243e;
  --accent-gold: #fbd786;
  --accent-pink: #f7797d;
  --text-main: #ffffff;
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);

  background: linear-gradient(
    to bottom,
    var(--bg-deep),
    var(--bg-mid),
    var(--bg-light)
  );
  font-family: "Helvetica Neue", "PingFang SC", sans-serif;
  color: var(--text-main);
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

/* 粒子 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: floatUp infinite linear;
}
@keyframes floatUp {
  0% {
    transform: translateY(110vh) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-10vh) scale(1.5);
    opacity: 0;
  }
}

/* 音乐按钮 */
.music-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  z-index: 100;
  background: url("https://s1.ax1x.com/2023/01/01/pSjLZ4K.png") no-repeat
    center/contain;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}
.music-btn.playing {
  animation: rotate 4s linear infinite;
}
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

/* 启动页 */
.start-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.fade-leave-active {
  transition: opacity 0.8s;
}
.fade-leave-to {
  opacity: 0;
}
.start-btn {
  padding: 12px 40px;
  margin-top: 30px;
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 滑动容器 */
.swiper-box {
  height: 100%;
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  scroll-behavior: smooth;
}
.swiper-box::-webkit-scrollbar {
  display: none;
}

.page {
  height: 100vh;
  width: 100vw;
  scroll-snap-align: start;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

/* 动画系统 */
.anim-item {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}
.page.active .anim-item {
  opacity: 1;
  transform: translateY(0);
}
.d-1 {
  transition-delay: 0.1s;
}
.d-2 {
  transition-delay: 0.2s;
}
.d-3 {
  transition-delay: 0.3s;
}
.d-4 {
  transition-delay: 0.4s;
}
.d-5 {
  transition-delay: 0.5s;
}

/* 通用样式 */
h1 {
  font-size: 26px;
  font-weight: 300;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.desc {
  font-size: 14px;
  color: #ccc;
  line-height: 1.5;
}
.bold {
  font-weight: bold;
  color: var(--accent-gold);
}
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  width: 100%;
  margin-top: 20px;
}
.mt-20 {
  margin-top: 20px;
}
.mb-20 {
  margin-bottom: 20px;
}

/* P1 封面 */
.avatar-box {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  background: rgba(255, 255, 255, 0.15);
  margin-bottom: 20px;
}
.avatar-box.small {
  width: 60px;
  height: 60px;
  font-size: 25px;
  margin: 0 auto;
}
.intro-text {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 10px;
}
.main-title {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(to right, #fff, #a1c4fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* P2 成绩单 */
.grade-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 10px;
  padding: 0 5px;
}
.grade-scroll {
  max-height: 50vh;
  overflow-y: auto;
}
.grade-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.subject-name {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  display: block;
}
.tag-makeup {
  font-size: 10px;
  background: #e74c3c;
  color: #fff;
  padding: 1px 4px;
  border-radius: 4px;
  margin-left: 5px;
}
.score-col {
  font-family: "Arial";
  font-size: 14px;
  color: #ddd;
}
.s-term {
  color: #bbb;
}
.s-divider {
  margin: 0 3px;
  color: #555;
  font-size: 10px;
}
.s-final {
  color: var(--accent-gold);
  font-weight: bold;
  font-size: 17px;
  margin-left: 2px;
}

/* P3 奖项 */
.awards-list {
  max-height: 50vh;
  overflow-y: auto;
}
.award-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 8px;
}
.award-icon {
  font-size: 24px;
  margin-right: 12px;
}
.award-name {
  font-size: 16px;
  font-weight: bold;
  color: var(--accent-gold);
  margin-bottom: 2px;
}
.activity-name {
  font-size: 12px;
  color: #ddd;
}
.award-date {
  font-size: 10px;
  color: #888;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #999;
}
.empty-icon {
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.5;
}

/* P4 评语 */
.comment-container {
  max-height: 60vh;
  overflow-y: auto;
  width: 100%;
  margin-top: 10px;
}
.comment-card {
  padding: 15px;
  border-left: 4px solid var(--accent-pink);
}
.comment-card:last-child {
  border-left-color: var(--accent-gold);
}
.card-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #aaa;
}
.level-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 6px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}
.comment-text {
  font-size: 14px;
  line-height: 1.6;
  text-align: justify;
}

/* P5 结尾 */
.summary-card {
  text-align: center;
  line-height: 2;
  color: #ddd;
  font-size: 14px;
}
.text-center {
  text-align: center;
  width: 100%;
}
.footer-note {
  text-align: center;
  width: 100%;
  margin-top: 40px;
  font-size: 12px;
  color: #555;
}

/* 箭头 */
.arrow-up {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 20px;
  height: 20px;
  border-top: 2px solid rgba(255, 255, 255, 0.4);
  border-left: 2px solid rgba(255, 255, 255, 0.4);
  animation: arrowAnim 2s infinite;
  opacity: 0;
}
.page.active .arrow-up {
  opacity: 1;
  transition-delay: 1s;
}
@keyframes arrowAnim {
  0% {
    transform: translateX(-50%) rotate(45deg) translate(0, 0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) rotate(45deg) translate(-6px, -6px);
    opacity: 0;
  }
}
</style>
