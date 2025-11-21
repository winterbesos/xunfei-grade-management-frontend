import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { execSync } from 'child_process'
import fs from 'fs'

// 获取 git 信息
function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
    // 使用 ISO 8601 格式，包含时间
    const commitDate = execSync('git log -1 --format=%cd --date=iso').toString().trim()
    // 转换为更友好的格式：2024-11-10 17:45:30
    const formattedDate = commitDate.replace(/\s[\+\-]\d{4}$/, '').substring(0, 19)
    return { commitHash, commitDate: formattedDate }
  } catch (error) {
    console.warn('⚠️  无法获取 git 信息，使用默认值')
    const now = new Date()
    const formattedDate = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
    return {
      commitHash: 'dev-local',
      commitDate: formattedDate
    }
  }
}

// 获取版本号
function getVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
    return packageJson.version || '1.0.0'
  } catch (error) {
    return '1.0.0'
  }
}

const { commitHash, commitDate } = getGitInfo()
const version = getVersion()

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5173,      // 可改成你想用的端口
    https: {
      key: fs.readFileSync('./ssl/key.pem'),
      cert: fs.readFileSync('./ssl/cert.pem')
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    '__APP_VERSION__': JSON.stringify(`v${version}`),
    '__COMMIT_HASH__': JSON.stringify(commitHash),
    '__BUILD_TIME__': JSON.stringify(commitDate),
  }
})
