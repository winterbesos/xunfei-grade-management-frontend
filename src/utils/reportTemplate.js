import { createApp, nextTick } from "vue";
import Report from "@/views/common/Report.vue";
import router from "@/router";

/**
 * 成绩单批量 PDF 导出。
 *
 * 排版直接复用 Report.vue：把组件离屏挂载、喂入已拉好的数据，再对渲染结果截图。
 * 早先的做法是另写一份 HTML + 样式，与页面上的成绩单是两套代码，很容易对不齐，
 * 所以这里改成挂载真实组件，样式和结构只有一个来源。
 */

// A4 尺寸（mm）
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
// 96dpi 下 1mm ≈ 3.7795px，离屏容器按 A4 实际宽度渲染，保证截图比例正确
const CONTAINER_WIDTH_PX = Math.round(A4_WIDTH_MM * 3.7795);
// 截图倍率：2 倍在清晰度和体积之间比较平衡，再高体积增长很快
const CANVAS_SCALE = 2;
// JPEG 质量，PNG 体积约为其 5 倍以上，批量导出必须用 JPEG
const JPEG_QUALITY = 0.92;
// echarts 出图是异步的，挂载后留一点时间再截图
const CHART_RENDER_DELAY_MS = 120;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 离屏挂载一份 Report.vue，返回渲染好的 A4 容器元素和卸载函数。
 */
function mountReport(data) {
  const host = document.createElement("div");
  // 必须在文档流内且有尺寸，html2canvas 才能拿到真实布局；用负偏移移出视口
  host.style.cssText = `position:fixed;left:-99999px;top:0;width:${CONTAINER_WIDTH_PX}px;background:#fff;`;
  document.body.appendChild(host);

  const app = createApp(Report, { reportData: data });
  // Report.vue 内部用了 useRoute()，不注册 router 会挂载失败
  app.use(router);
  app.mount(host);

  return {
    host,
    // 组件里的 .a4-container 才是纸张内容，外层的操作按钮不该进 PDF
    getTarget: () => host.querySelector(".a4-container") || host,
    unmount: () => {
      app.unmount();
      host.remove();
    },
  };
}

/**
 * 把多份成绩单导出成一个 PDF，一人一页（内容超长时自动续页）。
 *
 * @param {Array<object>} reports 学期成绩单接口返回的数据数组
 * @param {string} fileName 下载文件名
 * @param {(done: number, total: number) => void} onProgress 渲染进度回调
 */
export async function exportReportsToPdf(reports, fileName, onProgress) {
  // jspdf + html2canvas 合计约 590kB，只在真正导出时才加载，不拖慢页面首次打开
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  for (let i = 0; i < reports.length; i += 1) {
    const instance = mountReport(reports[i]);
    try {
      await nextTick();
      await sleep(CHART_RENDER_DELAY_MS);

      const canvas = await html2canvas(instance.getTarget(), {
        scale: CANVAS_SCALE,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

      // 成绩单按 A4 单页设计（.a4-container 是 210mm × min-height 297mm），
      // 一人固定一页。先按宽度铺满，高度超出时改按高度适配、水平居中。
      // 注意 mm→px 换算有小数，实测高度会是 297.05mm 这类值，不做等比缩放
      // 就会多出一整页几乎全白的内容。
      let widthMm = A4_WIDTH_MM;
      let heightMm = (canvas.height * A4_WIDTH_MM) / canvas.width;
      if (heightMm > A4_HEIGHT_MM) {
        heightMm = A4_HEIGHT_MM;
        widthMm = (canvas.width * A4_HEIGHT_MM) / canvas.height;
      }

      if (i > 0) pdf.addPage();
      pdf.addImage(
        imgData,
        "JPEG",
        (A4_WIDTH_MM - widthMm) / 2,
        0,
        widthMm,
        heightMm,
      );
    } finally {
      instance.unmount();
    }

    onProgress?.(i + 1, reports.length);
    // 让出主线程，避免长时间批量渲染把页面卡死
    await sleep(0);
  }

  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}
