# 🤖 Robot Admin 贡献指南

> **来啊，快活啊！一起搞事情啊！** 🎉  
> 欢迎各路英雄好汉加入 Robot Admin 的开发大军！

## � 项目架构

Robot Admin 采用 **Bun Workspaces Monorepo** 架构：

```
Robot_Admin/
├── apps/
│   ├── admin-internal/    # 内部版 - 企业级完整功能版
│   └── admin-saas/        # SaaS 版 - 轻量多租户版（开发中）
├── packages/
│   └── shared-config/     # 共享配置（TypeScript 基础配置）
├── package.json           # Monorepo 根配置（Bun Workspaces）
└── .bunfig.toml           # Bun 运行时配置
```

## 🚀 新手必看：完整贡献流程

### 第一步：在GitHub上Fork项目 🍴

1. **访问项目主页**：[https://github.com/ChenyCHENYU/Robot_Admin](https://github.com/ChenyCHENYU/Robot_Admin)
2. **点击右上角的 "Fork" 按钮**
   - 这会在你的GitHub账号下创建一个项目副本
   - 等待几秒钟，GitHub会自动跳转到你的Fork页面
3. **现在你有了自己的项目副本**：`https://github.com/你的用户名/Robot_Admin`

### 第二步：克隆到本地 💻

```bash
# 克隆你Fork的项目（不是原项目！）
git clone https://github.com/你的用户名/Robot_Admin.git

# 进入项目目录
cd Robot_Admin

# 添加原项目为上游仓库（重要！用来同步最新代码）
git remote add upstream https://github.com/ChenyCHENYU/Robot_Admin.git

# 验证远程仓库设置
git remote -v
# 应该看到：
# origin    https://github.com/你的用户名/Robot_Admin.git (fetch)
# origin    https://github.com/你的用户名/Robot_Admin.git (push)
# upstream  https://github.com/ChenyCHENYU/Robot_Admin.git (fetch)
# upstream  https://github.com/ChenyCHENYU/Robot_Admin.git (push)
```

### 第三步：设置开发环境 ⚙️

```bash
# ⚠️ 强制使用 Bun 作为包管理器（不支持 npm/yarn/pnpm）
bun install

# 启动 internal 版（默认，毫秒级启动）
bun run dev
# 或者明确指定
bun run dev:internal

# 启动 saas 版
bun run dev:saas

# 打开浏览器访问 http://localhost:1988
# 看到机器人就算成功了 🤖
```

### 第四步：开始开发 🛠️

```bash
# 1. 先同步最新代码（很重要！避免冲突）
git fetch upstream
git checkout main
git merge upstream/main

# 2. 创建新分支（永远不要在main分支直接改代码！）
git checkout -b feat/你的功能名称
# 或者
git checkout -b fix/修复的问题

# 3. 开始写代码
# ...编码ing...

# 4. 提交代码（我们使用 git cz，不是普通的 git commit）
git add .
git cz  # 这会启动交互式提交工具，按提示选择即可

# 5. 推送到你的Fork
git push origin feat/你的功能名称
```

### 第五步：创建Pull Request 📤

1. **回到你的GitHub Fork页面**：`https://github.com/你的用户名/Robot_Admin`
2. **你会看到一个黄色提示条**："Compare & pull request"
3. **点击 "Compare & pull request" 按钮**
4. **填写PR信息**：
   - **标题**：简洁描述你做了什么
   - **描述**：详细说明改动内容、为什么要这样做
   - **如果修复了Issue**：在描述中写 `Fixes #issue号码`
5. **点击 "Create pull request"**
6. **等待审核**：我会尽快查看并反馈

### 第六步：处理反馈 🔄

1. **如果需要修改**：
   ```bash
   # 在同一个分支继续修改
   # ...改代码...
   git add .
   git cz
   git push origin feat/你的功能名称
   # PR会自动更新，不需要创建新的PR
   ```

2. **如果PR被合并**：
   ```bash
   # 同步最新代码
   git checkout main
   git fetch upstream
   git merge upstream/main
   
   # 删除已完成的分支
   git branch -d feat/你的功能名称
   git push origin --delete feat/你的功能名称
   ```

## 🎯 常见贡献类型

### 🐛 发现Bug了？

**完整流程**：
1. **先确认**：在 [Issues](https://github.com/ChenyCHENYU/Robot_Admin/issues) 搜索看是否已存在
2. **创建Issue**：如果没有，就新建一个Bug报告
3. **修复Bug**：按上面的流程Fork → 修复 → PR
4. **在PR中关联Issue**：写上 `Fixes #issue号码`

**Bug报告模板**：
```markdown
**Bug描述**
简洁描述问题

**复现步骤**
1. 访问xxx页面
2. 点击xxx按钮
3. 看到xxx错误

**期望结果**
应该怎样

**实际结果**
实际怎样

**环境信息**
- 浏览器：Chrome 120
- 系统：Windows 11
- 项目版本：v1.0.1
```

### 💡 有好点子？

1. **先讨论**：在 [Discussions](https://github.com/ChenyCHENYU/Robot_Admin/discussions) 发起讨论
2. **创建Issue**：讨论通过后创建Feature Request
3. **开发实现**：按完整流程开发
4. **关联Issue**：PR中写上 `Closes #issue号码`

### 📚 文档改进

- **小改动**：直接在GitHub网页上编辑，点击文件右上角的铅笔图标
- **大改动**：按完整流程Fork → 修改 → PR

### 🎨 新功能开发

**推荐方向**：
- **新演示页面**：在 `apps/admin-internal/src/views/demo/` 下添加
- **实用组件**：在 `apps/admin-internal/src/components/global/` 下添加
- **工具函数**：在 `apps/admin-internal/src/utils/` 下添加
- **共享配置**：在 `packages/shared-config/` 下添加

## 🛠️ 开发规范

### 代码提交规范

我们使用 **git cz** 进行规范化提交：

```bash
# 提交代码（不要用 git commit）
git add .
bun run cz  # 启动交互式提交

# 选择提交类型：
# feat:     新功能
# fix:      修复bug
# docs:     文档更新
# style:    代码格式（不影响代码运行）
# refactor: 重构（既不是新增功能，也不是修复bug）
# perf:     性能优化
# test:     增加测试
# chore:    构建过程或辅助工具的变动
```

### 代码风格

```bash
# 检查代码风格（Oxlint + ESLint 双重检查）
bun run lint

# 格式化代码
bun run format
```

### 分支命名规范

```bash
# 新功能
git checkout -b feat/用户权限管理
git checkout -b feat/add-user-permission

# 修复bug
git checkout -b fix/登录页面验证码问题
git checkout -b fix/login-captcha-issue

# 文档更新
git checkout -b docs/更新安装说明
git checkout -b docs/update-installation

# 重构
git checkout -b refactor/优化工具函数
git checkout -b refactor/optimize-utils
```

### 目录结构

```
Robot_Admin/                    # Monorepo 根
├── apps/
│   ├── admin-internal/         # 内部版应用
│   │   ├── src/
│   │   │   ├── components/global/  # 全局组件（C_ 前缀）
│   │   │   ├── views/demo/         # 演示页面
│   │   │   ├── stores/             # 状态管理
│   │   │   ├── api/                # API 接口
│   │   │   ├── utils/              # 工具函数
│   │   │   └── types/              # TypeScript 类型
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── admin-saas/             # SaaS 版应用
│       └── ...（同 internal 结构）
├── packages/
│   └── shared-config/          # 共享 TypeScript 配置
└── package.json                # Monorepo 工作区
```

## 🚨 重要注意事项

### 技术栈限制

- **前端框架**：Vue 3 + TypeScript（这个别改）
- **UI组件库**：Naive UI（统一用这个）
- **样式**：UnoCSS + Sass（别引入其他CSS框架）
- **构建工具**：Vite + Bun（性能杠杠的）

### 开发要求

- **浏览器兼容**：Chrome/Firefox/Safari/Edge 最新两个版本
- **Node.js版本**：>= 22.0.0
- **包管理器**：Bun >= 1.2.0（**强制使用**，不支持 npm/yarn/pnpm）
- **不支持IE**：拜拜了您嘞 👋

### 性能要求

- 新功能不能拖慢整体性能
- 图片要压缩，代码要优化
- 大的第三方库要按需引入

## 🎨 UI/UX 规范

### 设计原则

- **保持简洁**：界面不要太花哨
- **用户友好**：操作要符合直觉
- **响应式**：手机、平板、电脑都要能用
- **主题统一**：跟现有风格保持一致

### 组件规范

```typescript
// 组件示例
<script setup lang="ts">
interface Props {
  title: string
  description?: string
  loading?: boolean
}

// 使用 C_ 前缀
defineOptions({
  name: 'C_MyComponent'
})

const props = withDefaults(defineProps<Props>(), {
  description: '',
  loading: false
})
</script>
```

## 🧪 测试流程

### 开发时测试

```bash
# 启动开发服务器
bun run dev         # 启动 internal 版
bun run dev:saas    # 启动 saas 版

# 测试功能
# ✅ 不同浏览器测试
# ✅ 移动端响应式测试
# ✅ 功能完整性测试
```

### 提交前检查

```bash
# 代码检查（所有应用）
bun run lint

# 类型检查（所有应用）
bun run type-check

# 构建测试（所有应用）
bun run build

# 仅构建特定应用
bun run build:internal
bun run build:saas

# 确保没有报错再提交
```

## 🆘 遇到问题怎么办？

### 常见问题

1. **Fork同步问题**：
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **提交冲突**：
   ```bash
   # 先同步最新代码
   git fetch upstream
   git rebase upstream/main
   # 解决冲突后
   git add .
   git rebase --continue
   ```

3. **忘记创建分支**：
   ```bash
   # 如果在main分支改了代码
   git stash  # 暂存改动
   git checkout -b feat/新分支名
   git stash pop  # 恢复改动
   ```

### 获取帮助

1. **查看文档**：[在线文档](https://www.robotadmin.cn)
2. **搜索Issues**：看看是否有相同问题
3. **创建Issue**：描述清楚问题，最好有截图
4. **发邮件**：[ycyplus@gmail.com](mailto:ycyplus@gmail.com)

## 🏆 贡献者福利

### 成就解锁

- **首次贡献**：获得Contributor徽章
- **Bug修复达人**：修复5个bug获得Bug Hunter徽章
- **功能开发者**：开发新功能获得Feature Developer徽章
- **文档贡献者**：完善文档获得Documentation Writer徽章

### 特别感谢

所有贡献者都会在README中展示，重要贡献者会被邀请成为项目维护者！

## 📞 联系方式

**作者**：CHENY（就是我）

- **邮箱**：[ycyplus@gmail.com](mailto:ycyplus@gmail.com)
- **GitHub**：[@ChenyCHENYU](https://github.com/ChenyCHENYU)

**项目地址**：

- **在线预览**：[https://www.robotadmin.cn](https://www.robotadmin.cn)
- **GitHub**：[https://github.com/ChenyCHENYU/Robot_Admin](https://github.com/ChenyCHENYU/Robot_Admin)

---

## 🎉 最后的话

Robot Admin 不是什么高大上的项目，就是想做一个**真正好用**的后台管理系统模板。

**第一次贡献开源项目？** 不要紧张，按照上面的流程一步步来，有问题就问！

**GitHub操作不熟练？** 多练几次就会了，每个大牛都是从新手过来的！

**不知道贡献什么？** 从修改一个错别字开始，从简单的做起！

如果你觉得这个项目还不错，**给个 Star ⭐ 呗**！

如果你想让它变得更好，**来贡献代码吧**！

**一起搞事情，让开发变得更有趣！** 🚀

---

<div align="center">
  <strong>Made with ❤️ by Robot Admin Community</strong><br>
  <em>开源让世界更美好</em>
</div>
