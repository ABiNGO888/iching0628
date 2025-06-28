# AI API 配置指南

## 问题诊断

如果您遇到以下错误：
```
AI解读失败：Dashscope API Error: 401 - {"code":"InvalidApiKey","message":"Invalid API-key provided."}
```

这表明您的AI API密钥配置有问题。请按照以下步骤进行配置。

## 配置步骤

### 1. 检查环境变量文件

确保您的 `.env.local` 文件包含以下配置：

```env
# ===========================================
# AI API 密钥配置 (必需)
# ===========================================

# Groq API 密钥 - 用于AI解读爻辞功能
GROK_API_KEY=gsk-your-actual-groq-api-key

# 阿里云百炼API密钥 - 用于AI解读卦象功能
ALI_API_KEY=sk-your-actual-ali-api-key
NEXT_PUBLIC_ALI_API_KEY=sk-your-actual-ali-api-key

# NewAPI密钥 - 用于图像生成功能
NEWAPI_KEY=sk-your-actual-newapi-key
```

### 2. 获取API密钥

#### 阿里云百炼 API (推荐)

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 登录您的阿里云账号
3. 创建应用并获取API密钥
4. 将密钥填入 `ALI_API_KEY` 和 `NEXT_PUBLIC_ALI_API_KEY`

#### Groq API (可选)

1. 访问 [Groq控制台](https://console.groq.com/keys)
2. 注册并创建API密钥
3. 将密钥填入 `GROK_API_KEY`

#### NewAPI (图像生成)

1. 如果您有自建的NewAPI服务，使用您的密钥
2. 或者使用其他兼容OpenAI格式的API服务
3. 将密钥填入 `NEWAPI_KEY`

### 3. 重启应用

配置完成后，重启开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

## 功能说明

### AI解读功能分工

- **阿里云百炼 (ALI_API_KEY)**: 主要用于卦象解读
- **Groq (GROK_API_KEY)**: 用于爻辞解读
- **NewAPI (NEWAPI_KEY)**: 用于生成卦象相关图像

### 环境变量说明

- `ALI_API_KEY`: 后端API使用的阿里云密钥
- `NEXT_PUBLIC_ALI_API_KEY`: 前端使用的阿里云密钥（需要NEXT_PUBLIC_前缀）
- `GROK_API_KEY`: Groq API密钥
- `NEWAPI_KEY`: NewAPI或兼容服务的密钥

## 测试配置

配置完成后，您可以：

1. 访问卜卦页面进行测试
2. 查看浏览器控制台是否有错误信息
3. 检查网络请求是否成功返回AI解读结果

## 常见问题

### Q: 为什么需要两个阿里云密钥？
A: `ALI_API_KEY` 用于服务器端API调用，`NEXT_PUBLIC_ALI_API_KEY` 用于客户端调用。出于安全考虑，建议使用相同的密钥值。

### Q: 可以只配置一个AI服务吗？
A: 可以，但建议至少配置阿里云百炼API，因为它是主要的解读服务。

### Q: 如何验证配置是否正确？
A: 进行一次完整的卜卦流程，如果能看到AI解读结果，说明配置成功。

## 安全提醒

- 不要将API密钥提交到版本控制系统
- `.env.local` 文件已在 `.gitignore` 中，确保不会被意外提交
- 定期轮换API密钥以提高安全性