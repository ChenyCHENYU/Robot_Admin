# 智慧物流系统 - 独立部署说明

## 🎯 微前端独立部署架构

本子应用完全独立，可部署到任何服务器，通过以下方式与主应用通信：

### 1️⃣ 通信机制

**使用浏览器原生 `postMessage` API**

- ✅ 跨域支持（不同域名、端口）
- ✅ 无需任何npm包依赖
- ✅ 浏览器原生支持，稳定可靠

```javascript
// 子应用发送消息
window.parent.postMessage({
  type: 'CUSTOM_MESSAGE',
  payload: { ... }
}, '*')

// 主应用接收消息
window.addEventListener('message', (event) => {
  const { type, payload } = event.data
  // 处理消息...
})
```

### 2️⃣ 部署配置

#### **开发环境**

```javascript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3003,
    cors: true, // 允许跨域
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
```

**主应用配置：**

```typescript
// src/views/portal/data.ts
{
  id: 'logistics',
  name: '智慧物流管理系统',
  url: 'http://localhost:3003',  // 开发环境
  integrated: true,
}
```

#### **生产环境**

```javascript
// vite.config.ts
export default defineConfig({
  base: '/', // 根路径部署
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': 'https://your-main-app.com', // 限制来源
    },
  },
})
```

**主应用配置：**

```typescript
// src/views/portal/data.ts
{
  id: 'logistics',
  name: '智慧物流管理系统',
  url: 'https://logistics.your-company.com',  // 生产环境URL
  integrated: true,
}
```

### 3️⃣ 部署示例

#### **场景1：独立域名部署**

```
主应用：https://admin.company.com
子应用：https://logistics.company.com
```

**Nginx 配置示例：**

```nginx
# 子应用
server {
    listen 80;
    server_name logistics.company.com;

    root /var/www/logistics/dist;
    index index.html;

    # 添加CORS头
    add_header Access-Control-Allow-Origin "https://admin.company.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, Content-Type" always;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### **场景2：同域子路径部署**

```
主应用：https://company.com/admin
子应用：https://company.com/logistics
```

**子应用配置：**

```javascript
// vite.config.ts
export default defineConfig({
  base: '/logistics/', // 子路径
})
```

#### **场景3：Docker 容器部署**

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4️⃣ 安全加固

#### **生产环境必须做的事：**

1. **限制 postMessage 来源**

```typescript
// 子应用 microApp.ts
export function sendMessageToMainApp(data: any) {
  if (window !== window.parent) {
    // ❌ 开发环境：window.parent.postMessage(data, '*')
    // ✅ 生产环境：
    window.parent.postMessage(data, 'https://admin.company.com')
  }
}

// 主应用 index.vue
const handlePostMessage = (event: MessageEvent) => {
  // ✅ 验证消息来源
  if (event.origin !== 'https://logistics.company.com') {
    console.warn('非法消息来源:', event.origin)
    return
  }
  // 处理消息...
}
```

2. **配置环境变量**

```bash
# .env.production
VITE_MAIN_APP_URL=https://admin.company.com
VITE_ALLOWED_ORIGINS=https://admin.company.com,https://company.com
```

3. **CORS 白名单**

```javascript
// vite.config.ts
const allowedOrigins = process.env.VITE_ALLOWED_ORIGINS?.split(',') || ['*']

export default defineConfig({
  server: {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  },
})
```

### 5️⃣ 验证清单

部署前检查：

- [ ] CORS 配置正确
- [ ] postMessage origin 验证
- [ ] 环境变量配置
- [ ] 资源路径正确（base URL）
- [ ] 子应用可独立访问
- [ ] 主应用能加载子应用
- [ ] 消息通信正常
- [ ] 路由跳转正常
- [ ] 主题同步正常

### 6️⃣ 常见问题

**Q: 子应用白屏？**
A: 检查 `base` 配置和资源路径是否正确

**Q: 跨域错误？**
A: 检查子应用服务器的 CORS 配置

**Q: postMessage 无反应？**
A: 检查 origin 验证，开发环境用 `'*'`，生产环境用具体域名

**Q: 独立访问子应用功能正常吗？**
A: 完全正常！子应用是独立的 Vue 应用，可以单独访问和使用

### 7️⃣ 总结

✅ **完全独立**：子应用是独立项目，有自己的 package.json、依赖、构建配置
✅ **任意部署**：可部署到任何服务器、域名、CDN
✅ **标准通信**：使用浏览器原生 postMessage，无需额外依赖
✅ **安全可控**：生产环境可严格限制通信来源
✅ **灵活扩展**：可随时添加新的子应用，互不影响
