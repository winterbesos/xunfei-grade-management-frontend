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
    const commitDate = execSync('git log -1 --format=%cd --date=short').toString().trim()
    return { commitHash, commitDate }
  } catch (error) {
    console.warn('⚠️  无法获取 git 信息，使用默认值')
    return {
      commitHash: 'dev-local',
      commitDate: new Date().toISOString().split('T')[0]
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
