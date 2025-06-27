# 易经占卜应用部署指南

## 项目概述

这是一个基于 Next.js 15.2.4 构建的易经占卜应用，支持多语言（中文、英文、日文、韩文），集成了 AI 功能、用户认证、支付系统等功能。

## 技术栈

- **前端框架**: Next.js 15.2.4
- **UI 组件**: Radix UI + Tailwind CSS
- **数据库**: Prisma ORM
- **认证**: NextAuth.js
- **国际化**: next-intl
- **部署**: Vercel

## 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器
- 数据库（PostgreSQL/MySQL/SQLite）

## 本地开发环境搭建

### 1. 克隆项目

```bash
git clone <repository-url>
cd iching-0616
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境变量配置

创建 `.env.local` 文件，参考以下配置：

```env
# 数据库配置
DATABASE_URL="your-database-url"

# NextAuth 配置
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth 提供商配置
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 微信/QQ/支付宝登录配置（可选）
WECHAT_CLIENT_ID="your-wechat-client-id"
WECHAT_CLIENT_SECRET="your-wechat-client-secret"

# AI 服务配置
OPENAI_API_KEY="your-openai-api-key"
OPENAI_BASE_URL="your-openai-base-url"

# 支付配置（可选）
STRIPE_PUBLIC_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
```

### 4. 数据库初始化

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push

# （可选）填充初始数据
npx prisma db seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

## 生产环境部署

### Vercel 部署（推荐）

1. **连接 GitHub 仓库**
   - 登录 [Vercel](https://vercel.com)
   - 导入 GitHub 仓库
   - 选择 Next.js 框架预设

2. **配置环境变量**
   在 Vercel 项目设置中添加所有必要的环境变量

3. **数据库配置**
   - 推荐使用 Vercel Postgres 或 PlanetScale
   - 配置 `DATABASE_URL` 环境变量

4. **域名配置**
   - 在 Vercel 中配置自定义域名
   - 更新 `NEXTAUTH_URL` 环境变量

### 其他平台部署

#### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

构建和运行：

```bash
docker build -t iching-app .
docker run -p 3000:3000 --env-file .env.local iching-app
```

#### 传统服务器部署

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

## 重要配置说明

### 1. 国际化配置

- 支持语言：中文（zh）、英文（en）、日文（ja）、韩文（ko）、繁体中文（zh-TW）
- 配置文件：`i18n.ts`、`navigation.ts`
- 翻译文件：`messages/` 目录

### 2. 认证配置

- 使用 NextAuth.js
- 支持 Google、微信、QQ、支付宝登录
- 配置文件：`lib/auth.ts`

### 3. 数据库配置

- 使用 Prisma ORM
- Schema 文件：`prisma/schema.prisma`
- 支持 PostgreSQL、MySQL、SQLite

### 4. AI 集成

- 支持 OpenAI 兼容的 API
- 配置文件：`app/api/ai/` 目录
- 支持自定义 AI 服务端点

## 常见问题解决

### 1. 端口冲突

如果默认端口 3000 被占用，应用会自动使用其他端口（如 3001、3002）。

### 2. 构建错误

确保所有必要的环境变量都已配置，特别是：
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### 3. 数据库连接问题

检查数据库 URL 格式和网络连接：

```bash
# 测试数据库连接
npx prisma db pull
```

### 4. 样式问题

确保 Tailwind CSS 正确配置：

```bash
# 重新构建样式
npm run build
```

## 监控和维护

### 1. 日志监控

- 使用 Vercel Analytics（如果部署在 Vercel）
- 配置错误追踪服务（如 Sentry）

### 2. 性能监控

- 使用 Next.js 内置的性能分析工具
- 监控 Core Web Vitals

### 3. 数据库维护

```bash
# 数据库备份
npx prisma db pull > backup.sql

# 查看数据库状态
npx prisma studio
```

## 更新指南

### 1. 代码更新

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 运行数据库迁移
npx prisma db push

# 重新构建
npm run build
```

### 2. 依赖更新

```bash
# 检查过时的包
npm outdated

# 更新依赖
npm update

# 更新 Next.js
npm install next@latest
```

## 安全注意事项

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 使用强密码和密钥
   - 定期轮换 API 密钥

2. **数据库安全**
   - 使用强密码
   - 启用 SSL 连接
   - 定期备份数据

3. **认证安全**
   - 配置强 `NEXTAUTH_SECRET`
   - 使用 HTTPS（生产环境）
   - 配置适当的 CORS 策略

## 支持和联系

如果在部署过程中遇到问题，请：

1. 检查本文档的常见问题部分
2. 查看项目的 GitHub Issues
3. 联系开发团队

---

**最后更新**: 2024年1月
**版本**: 1.0.0
**维护者**: 开发团队