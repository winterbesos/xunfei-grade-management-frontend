import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

try {
  // 获取 git commit hash
  const commitHash = execSync('git rev-parse --short HEAD')
    .toString()
    .trim()

  // 获取当前日期
  const buildTime = new Date().toLocaleDateString('zh-CN')

  // 读取 package.json 获取版本号
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
  )
  const version = packageJson.version || '1.0.0'

  // 生成 .env.production 文件
  const envContent = `# API 基础 URL
VITE_API_BASE_URL=/api

# 是否使用 Mock 数据（true 或 false）
VITE_USE_MOCK=false

# 版本信息
VITE_APP_VERSION=v${version}
VITE_COMMIT_HASH=${commitHash}
VITE_BUILD_TIME=${buildTime}
`

  fs.writeFileSync(path.resolve(__dirname, '../.env.production'), envContent)

  console.log('✅ 版本信息已生成:')
  console.log(`   版本号: v${version}`)
  console.log(`   Commit: ${commitHash}`)
  console.log(`   时间: ${buildTime}`)
} catch (error) {
  console.error('⚠️  无法获取 git 信息，使用默认值')
  console.error(error.message)

  // 如果不是 git 仓库，使用默认值
  const buildTime = new Date().toLocaleDateString('zh-CN')
  const envContent = `# API 基础 URL
VITE_API_BASE_URL=/api

# 是否使用 Mock 数据（true 或 false）
VITE_USE_MOCK=false

# 版本信息
VITE_APP_VERSION=v1.0.0
VITE_COMMIT_HASH=no-git
VITE_BUILD_TIME=${buildTime}
`

  fs.writeFileSync(path.resolve(__dirname, '../.env.production'), envContent)
}
