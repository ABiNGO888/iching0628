# 部署指南

本文档将指导您如何将易经卜卦应用部署到 Vercel。

## 前置要求

1. GitHub 账户
2. Vercel 账户
3. PostgreSQL 数据库（推荐使用 Supabase 或 Neon）

## ✅ 已解决的问题

### 1. 依赖版本冲突
- **问题**: `@auth/core` 和 `react-day-picker`/`date-fns` 版本冲突导致构建失败
- **解决方案**: 
  - 固定所有依赖版本号，避免使用 `latest`
  - 将 `date-fns` 从 `4.1.0` 降级到 `3.6.0` 以兼容 `react-day-picker@8.10.1`
- **状态**: ✅ 已解决

### 2. Prisma Schema 文件找不到错误
- **问题**: 部署时出现 "Could not find Prisma Schema that is required for this command" 错误
- **原因**: Vercel构建过程中Prisma客户端生成时机不正确
- **解决方案**:
  - 修改 `vercel.json` 中的 `buildCommand` 为 `npx prisma generate && npm run build`
  - 简化 `package.json` 中的 `build` 脚本为 `next build`
  - 保持 `postinstall` 脚本为 `prisma generate`
  - 添加 `SKIP_ENV_VALIDATION=true` 环境变量
- **状态**: ✅ 已解决

### 3. 构建配置优化
- **问题**：Vercel构建配置不完整
- **解决**：创建vercel.json配置文件

## 部署步骤

### 1. 准备代码仓库

1. 将代码推送到 GitHub 仓库
2. 确保所有必要文件都已提交
3. 确认 `vercel.json` 配置正确

✅ **package.json** - 已优化构建脚本：
```json
{
  "scripts": {
    "build": "next build",
    "postinstall": "prisma generate"
  }
}
```

✅ **vercel.json** - 已创建Vercel配置文件：
```json
{
  "framework": "nextjs",
  "buildCommand": "npx prisma generate && npm run build",
  "installCommand": "npm ci",
  "env": {
    "PRISMA_GENERATE_SKIP_AUTOINSTALL": "false",
    "SKIP_ENV_VALIDATION": "true"
  }
}
```

### 2. 创建数据库

推荐使用 Supabase：
1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 获取数据库连接字符串
4. 运行 Prisma 迁移：`npx prisma db push`

### 3. 配置 Vercel

1. 登录 [Vercel](https://vercel.com/)
2. 点击 "New Project"
3. 导入您的 GitHub 仓库
4. 配置环境变量（见下方）
5. 部署

### 4. 数据库迁移（必需）

#### 选项A：Vercel Postgres（推荐）
1. 在Vercel项目中添加Postgres数据库
2. 获取连接字符串
3. 更新Prisma schema：

```prisma
datasource db {
  provider = "postgresql"  // 改为postgresql
  url      = env("DATABASE_URL")
}
```

#### 选项B：Supabase
1. 注册 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取数据库连接字符串
4. 更新Prisma schema为PostgreSQL

#### 选项C：PlanetScale
1. 注册 [PlanetScale](https://planetscale.com)
2. 创建数据库
3. 获取连接字符串
4. 更新Prisma schema为MySQL

### 5. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

**必需变量：**
```
DATABASE_URL=postgresql://username:password@host:5432/database
NEXTAUTH_SECRET=your_32_character_secret_key
NEXTAUTH_URL=https://your-app.vercel.app
GROQ_API_KEY=gsk-your-groq-api-key
```

**可选变量：**
```
NEXT_PUBLIC_TEST_MODE=false
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
WECHAT_CLIENT_ID=your_wechat_app_id
WECHAT_CLIENT_SECRET=your_wechat_app_secret
```

### 6. 构建设置

确保 Vercel 项目设置中：
- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm ci`
- Output Directory: `.next`

## 修复的问题

### Prisma Schema 错误修复

1. **更新了 vercel.json 配置：**
   - 移除了重复的 `npx prisma generate`
   - 设置 `PRISMA_GENERATE_SKIP_AUTOINSTALL=false`
   - 让 package.json 中的 `postinstall` 脚本处理 Prisma 生成

2. **构建流程优化：**
   - `npm ci` 安装依赖
   - `postinstall` 脚本自动运行 `prisma generate`
   - `npm run build` 执行构建（包含 `prisma generate && next build`）

### 数据库迁移步骤

1. **更新Prisma schema**（如果使用PostgreSQL）：
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **生成迁移文件**：
```bash
npx prisma migrate dev --name init
```

3. **推送到生产数据库**：
```bash
npx prisma db push
```

### 部署检查清单

- [ ] 更新Prisma schema数据库提供商
- [ ] 配置生产数据库连接
- [ ] 在Vercel中设置所有环境变量
- [ ] 运行数据库迁移
- [ ] 测试API路由
- [ ] 验证用户认证功能

## 故障排除

### 常见问题

1. **Prisma Schema 找不到**
   - ✅ 已修复：确保 `prisma/schema.prisma` 文件存在
   - ✅ 已修复：优化了构建命令顺序

2. **构建超时**
   - 检查依赖项是否过多
   - 考虑优化构建过程
   - 使用 `npm ci` 而不是 `npm install`

3. **环境变量未生效**
   - 确保在 Vercel 项目设置中正确添加
   - 重新部署项目
   - 检查变量名拼写

4. **数据库连接失败**
   - 验证 `DATABASE_URL` 格式正确
   - 确保数据库允许外部连接
   - 检查防火墙设置

## 部署后验证

1. 访问部署的应用
2. 测试登录功能
3. 测试卜卦功能
4. 检查数据库连接
5. 验证 AI 功能正常

## 更新部署

推送代码到 GitHub 主分支会自动触发重新部署。

## 环境变量生成工具

生成 NEXTAUTH_SECRET：
```bash
openssl rand -base64 32
```

或在 Node.js 中：
```javascript
require('crypto').randomBytes(32).toString('base64')
```

## 监控和调试

1. **Vercel函数日志**：在Vercel仪表板查看函数执行日志
2. **数据库连接**：使用Prisma Studio验证数据库连接
3. **环境变量**：确保所有必需变量已设置

## 性能优化建议

1. **数据库连接池**：使用连接池减少冷启动时间
2. **缓存策略**：实施适当的缓存机制
3. **函数超时**：已在vercel.json中设置30秒超时

---

**注意**：部署前请确保在本地测试所有更改，特别是数据库迁移。