# HTTPS 本地开发配置指南

## 快速开始

### 1. 证书已生成
SSL证书已自动生成在 `ssl/` 目录下：
- `ssl/cert.pem` - 证书文件
- `ssl/key.pem` - 私钥文件

### 2. 启动HTTPS开发服务器

```bash
# 启动HTTPS开发服务器
npm run dev

# 或者使用HTTPS模式
npm run dev:https
```

### 3. 访问地址
- **HTTPS**: https://localhost:5173
- **HTTP**: http://localhost:5173 (自动重定向到HTTPS)

## 浏览器配置

### Chrome/Edge
1. 访问 https://localhost:5173
2. 点击"高级" → "继续前往localhost(不安全)"
3. 证书将被信任，后续访问不再提示

### Firefox
1. 访问 https://localhost:5173
2. 点击"高级" → "接受风险并继续"

### Safari
1. 访问 https://localhost:5173
2. 点击"显示详细信息" → "访问此网站"

## 环境变量配置

### 当前配置 (.env)
```bash
# HTTPS配置
VITE_HTTPS_ENABLED=true
VITE_BASE_URL=https://localhost:5173
VITE_OAUTH_CALLBACK_URL=https://localhost:5173/callback/university
VITE_API_BASE_URL=https://192.168.5.133:8000
```

### 切换回HTTP
如需切换回HTTP，修改 `.env` 文件：
```bash
VITE_HTTPS_ENABLED=false
VITE_BASE_URL=http://localhost:5173
VITE_OAUTH_CALLBACK_URL=http://localhost:5173/callback/university
VITE_API_BASE_URL=http://192.168.5.133:8000
```

## 常见问题

### 1. 证书无效警告
这是正常的，因为使用的是自签名证书。点击"继续访问"即可。

### 2. 端口被占用
如果5173端口被占用，可以修改 `vite.config.js` 中的端口：
```javascript
server: {
  port: 3000, // 改为其他端口
  https: { ... }
}
```

### 3. 重新生成证书
```bash
# 删除旧证书
rm -rf ssl/

# 重新生成
./ssl/generate-cert.sh
```

### 4. 移动端调试
确保手机和电脑在同一网络，使用电脑的IP地址访问：
```
https://[你的IP]:5173
```

## 生产环境注意事项

1. **不要使用自签名证书**：生产环境应使用Let's Encrypt等CA颁发的证书
2. **更新API配置**：确保后端API也支持HTTPS
3. **CORS配置**：检查跨域配置是否支持HTTPS

## 开发命令

```bash
# 启动HTTPS开发服务器
npm run dev

# 启动HTTP开发服务器（如需）
HTTPS=false npm run dev

# 构建生产版本
npm run build
```