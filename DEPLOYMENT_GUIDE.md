# Vercel 部署指南

## ✅ 已解决的问题

### 1. 依赖版本冲突
- **问题**: `@auth/core` 和 `react-day-picker`/`date-fns` 版本冲突导致构建失败
- **解决方案**: 
  - 固定所有依赖版本号，避免使用 `latest`
  - 将 `date-fns` 从 `4.1.0` 降级到 `3.6.0` 以兼容 `react-day-picker@8.10.1`
- **状态**: ✅ 已解决

### 2. Prisma客户端生成
- **问题**：构建时未生成Prisma客户端
- **解决**：在package.json中添加构建前生成步骤

### 3. 构建配置优化
- **问题**：Vercel构建配置不完整
- **解决**：创建vercel.json配置文件

## 剩余部署问题

### 数据库配置（仍需解决）
1. **本地环境**：使用SQLite文件数据库
2. **Vercel环境**：无服务器环境不支持文件系统数据库
3. **解决方案**：必须迁移到云数据库

## 解决方案

### 1. 构建配置已修复

✅ **package.json** - 已添加Prisma生成步骤：
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

✅ **vercel.json** - 已创建Vercel配置文件

### 2. 数据库迁移（必需）

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

### 3. Vercel环境变量配置

在Vercel项目设置 → Environment Variables 中添加：

```bash
# 必需变量
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.vercel.app
GROK_API_KEY=your-grok-api-key

# 可选变量
WECHAT_CLIENT_ID=your-wechat-client-id
WECHAT_CLIENT_SECRET=your-wechat-client-secret
# ... 其他第三方登录凭证

# 生产模式
NEXT_PUBLIC_TEST_MODE=false
```

### 4. 数据库迁移步骤

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

### 5. 部署检查清单

- [ ] 更新Prisma schema数据库提供商
- [ ] 配置生产数据库连接
- [ ] 在Vercel中设置所有环境变量
- [ ] 运行数据库迁移
- [ ] 测试API路由
- [ ] 验证用户认证功能

## 常见问题

### Q: 构建时出现"prisma generate"错误
A: 确保在Vercel项目设置中添加了正确的DATABASE_URL

### Q: 数据库连接失败
A: 检查数据库URL格式和网络访问权限

### Q: NextAuth认证问题
A: 确保NEXTAUTH_SECRET和NEXTAUTH_URL正确配置

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