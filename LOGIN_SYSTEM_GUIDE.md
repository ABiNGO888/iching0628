# 易经占卜应用 - 登录系统使用指南

## 概述

本应用已成功集成了完整的多方式登录系统，支持邮箱密码、短信验证码、微信、支付宝、QQ、Google等多种登录方式，并实现了免费用户每日使用限制功能。

## 功能特性

### 1. 多种登录方式
- **邮箱密码登录**: 传统的邮箱和密码登录方式
- **短信验证码登录**: 使用手机号接收验证码登录
- **第三方OAuth登录**: 支持微信、支付宝、QQ、Google等平台
- **开发者快速登录**: 开发环境下的快速登录功能

### 2. 用户权限管理
- **免费用户**: 每日1次AI占卜机会
- **注册用户**: 每日1次AI占卜机会
- **高级会员**: 无限次AI占卜
- **开发者用户**: 1000次AI积分，用于开发测试

### 3. 数据库结构
- 用户信息存储（邮箱、手机号、第三方ID等）
- 每日使用量跟踪（按用户ID或IP地址）
- 短信验证码管理
- 会话和认证令牌管理

## 使用方法

### 访问登录页面
1. 启动应用: `npm run dev`
2. 访问: http://localhost:3000/login
3. 选择合适的登录方式

### 邮箱密码登录
1. 点击"邮箱登录"标签
2. 输入邮箱地址和密码
3. 点击"登录"按钮

### 短信验证码登录
1. 点击"短信登录"标签
2. 输入手机号码（支持中国大陆手机号）
3. 点击"发送验证码"按钮
4. 输入收到的6位验证码
5. 点击"短信登录"按钮

### 第三方登录
1. 点击"第三方登录"标签
2. 选择对应的登录平台（微信、支付宝、QQ、Google）
3. 按照平台提示完成授权

### 开发者快速登录（仅开发环境）
1. 在开发环境下，登录页面会显示"🚀 开发者快速登录"按钮
2. 点击即可使用预设的开发者账户登录
3. 开发者账户拥有管理员权限和充足的AI积分

## 技术实现

### 核心技术栈
- **NextAuth.js**: 认证框架
- **Prisma**: 数据库ORM
- **SQLite**: 开发环境数据库
- **React Hook Form**: 表单处理
- **Tailwind CSS**: 样式框架

### 关键文件
- `app/login/page.tsx`: 登录页面组件
- `lib/auth.ts`: NextAuth配置
- `lib/auth-providers/`: 第三方登录提供商配置
- `app/api/auth/sms/route.ts`: 短信验证API
- `app/api/auth/developer-login/route.ts`: 开发者登录API
- `lib/usage-tracker.ts`: 使用量跟踪工具
- `lib/rate-limit.ts`: 频率限制工具
- `prisma/schema.prisma`: 数据库模式

### 环境变量配置
```env
# NextAuth配置
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# 数据库
DATABASE_URL="file:./dev.db"

# 第三方登录凭证
WECHAT_CLIENT_ID="your-wechat-id"
WECHAT_CLIENT_SECRET="your-wechat-secret"
ALIPAY_CLIENT_ID="your-alipay-id"
ALIPAY_CLIENT_SECRET="your-alipay-secret"
QQ_CLIENT_ID="your-qq-id"
QQ_CLIENT_SECRET="your-qq-secret"
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"

# 测试模式
NEXT_PUBLIC_TEST_MODE="true"
```

## 安全特性

### 1. 密码安全
- 使用bcrypt进行密码哈希
- 密码强度要求
- 防止暴力破解

### 2. 短信验证
- 验证码5分钟有效期
- 发送频率限制（60秒间隔）
- 验证码使用后立即失效

### 3. 会话管理
- JWT令牌认证
- 会话过期自动处理
- 安全的会话存储

### 4. 使用量控制
- IP地址跟踪（未登录用户）
- 用户ID跟踪（已登录用户）
- 每日重置机制
- 防止滥用

## 国际化支持

应用支持中英文双语：
- 中文: `messages/zh.json`
- 英文: `messages/en.json`

登录界面会根据用户的语言偏好自动切换显示语言。

## 测试账户

### 开发者账户
- 邮箱: developer@iching.dev
- 密码: developer123
- 权限: 管理员
- AI积分: 1000

### 测试模式
当`NEXT_PUBLIC_TEST_MODE=true`时：
- 第三方登录使用模拟数据
- 短信验证码会在控制台显示
- 开发者登录按钮可见

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查`.env`文件中的`DATABASE_URL`
   - 运行`npx prisma db push`同步数据库

2. **短信发送失败**
   - 检查手机号格式（中国大陆11位）
   - 确认网络连接正常
   - 查看控制台错误信息

3. **第三方登录失败**
   - 检查对应平台的客户端ID和密钥
   - 确认回调URL配置正确
   - 在测试模式下使用模拟登录

4. **会话过期**
   - 重新登录即可
   - 检查`NEXTAUTH_SECRET`配置

### 日志查看
- 开发环境下，详细日志会在浏览器控制台显示
- 服务器日志可在终端查看
- 数据库操作日志通过Prisma输出

## 部署注意事项

1. **生产环境配置**
   - 使用强密码作为`NEXTAUTH_SECRET`
   - 配置真实的第三方登录凭证
   - 使用生产级数据库（PostgreSQL/MySQL）
   - 关闭测试模式

2. **安全设置**
   - 启用HTTPS
   - 配置CORS策略
   - 设置适当的会话过期时间
   - 定期更新依赖包

3. **监控和维护**
   - 监控登录成功率
   - 跟踪异常登录尝试
   - 定期清理过期数据
   - 备份用户数据

## 更新日志

### v1.0.0 (当前版本)
- ✅ 多方式登录系统
- ✅ 用户权限管理
- ✅ 每日使用限制
- ✅ 国际化支持
- ✅ 开发者工具
- ✅ 安全特性

---

如有问题或建议，请联系开发团队。