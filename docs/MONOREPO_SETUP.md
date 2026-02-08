# Robot Admin Monorepo 配置完成

## ✅ 已完成配置

### 1. Monorepo 基础设施 (`robot-admin-packages/`)

```
robot-admin-packages/
├── package.json              # 根配置，workspaces + scripts
├── .changeset/
│   ├── config.json          # Changesets 配置
│   └── README.md
├── packages/
│   └── request-core/        # 从 robot-admin-request-core 迁移
│       ├── src/             # 源代码
│       ├── dist/            # 构建产物
│       ├── package.json     # 包配置
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       └── README.md
└── README.md
```

**技术栈**:

- 包管理器: Bun 1.3.8
- 版本管理: Changesets
- 构建工具: tsup
- TypeScript: 5.8.0

### 2. 主项目链接配置

**Robot_Admin/package.json**:

```json
{
  "dependencies": {
    "@robot-admin/request-core": "link:@robot-admin/request-core"
  }
}
```

**符号链接已创建**:

```
Robot_Admin/node_modules/@robot-admin/request-core
  -> /d/project/robot/robot-admin-packages/packages/request-core/
```

### 3. 验证结果

- ✅ request-core 包已构建成功
- ✅ 主项目依赖已链接
- ✅ TypeScript 类型检查通过
- ✅ 插件导入无错误

## 🚀 本地开发工作流

### 开发 request-core 包

```bash
# 进入 monorepo
cd /d/project/robot/robot-admin-packages

# 开发模式（监听文件变化自动重新构建）
cd packages/request-core
bun run dev

# 或者在 monorepo 根目录运行所有包的 dev
cd /d/project/robot/robot-admin-packages
bun run dev
```

### 在主项目中测试

```bash
# 进入主项目
cd /d/project/robot/Robot_Admin

# 启动开发服务器
bun run dev
```

**实时生效**: 由于使用了符号链接，request-core 包的修改会立即反映在主项目中（需要刷新页面）。

### 构建包

```bash
cd /d/project/robot/robot-admin-packages/packages/request-core
bun run build
```

## 📝 发布流程

### 1. 添加变更集

```bash
cd /d/project/robot/robot-admin-packages
bun run changeset
```

交互式选择：

- 选择要发布的包: `@robot-admin/request-core`
- 选择版本类型: `patch` (修复) / `minor` (新功能) / `major` (破坏性更新)
- 输入变更描述

### 2. 更新版本号

```bash
bun run version-packages
```

这会：

- 根据变更集更新 `package.json` 中的版本号
- 自动生成/更新 `CHANGELOG.md`
- 删除已应用的变更集

### 3. 发布到 npm

```bash
# 登录 npm (首次)
npm login

# 发布
bun run release
```

这会：

- 构建所有包 (`bun run build`)
- 发布到 npm (`changeset publish`)

**发布到 `@robot-admin` 组织**:

- 包名: `@robot-admin/request-core`
- NPM 组织: `robot-admin` (npm 会自动加 `@`)
- 访问级别: public (已在 `.changeset/config.json` 中配置)

## 📦 添加新包

### 1. 创建包目录

```bash
cd /d/project/robot/robot-admin-packages
mkdir -p packages/new-package/src
```

### 2. 创建 package.json

```json
{
  "name": "@robot-admin/new-package",
  "version": "0.1.0",
  "description": "描述",
  "type": "module",
  "author": "ChenYu <ycyplus@gmail.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/ChenyCHENYU/robot-admin-packages",
    "directory": "packages/new-package"
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "clean": "rm -rf dist"
  }
}
```

### 3. 配置构建

复制 `request-core/tsconfig.json` 和 `tsup.config.ts`。

### 4. 在主项目中使用

```bash
# 在新包目录创建全局链接
cd packages/new-package
bun link

# 在主项目中链接
cd /d/project/robot/Robot_Admin
bun link @robot-admin/new-package
```

在 `Robot_Admin/package.json` 中添加:

```json
{
  "dependencies": {
    "@robot-admin/new-package": "link:@robot-admin/new-package"
  }
}
```

## 🔄 发布策略

### 独立发布（推荐）

每个包根据自身变化独立发布版本：

```bash
bun run changeset
# 只选择有变更的包
```

### 集中发布

所有包一起发布相同版本，在 `.changeset/config.json` 中配置:

```json
{
  "linked": [["@robot-admin/*"]]
}
```

## 🛠️ 常用命令

```bash
# Monorepo 根目录
cd /d/project/robot/robot-admin-packages

# 安装所有依赖
bun install

# 所有包并行开发
bun run dev

# 构建所有包
bun run build

# 清理所有包的构建产物
bun run clean

# 类型检查所有包
bun run type-check

# 只对特定包执行命令
bun run --filter @robot-admin/request-core dev
bun run --filter @robot-admin/request-core build
```

## 📊 目录结构总览

```
/d/project/robot/
├── Robot_Admin/                           # 主项目
│   ├── node_modules/
│   │   └── @robot-admin/
│   │       └── request-core -> (符号链接到 packages)
│   ├── src/
│   │   └── plugins/
│   │       └── request-core.ts           # 使用 @robot-admin/request-core
│   └── package.json                       # "link:@robot-admin/request-core"
│
├── robot-admin-packages/                  # Monorepo
│   ├── packages/
│   │   └── request-core/                 # 第一个包
│   │       ├── src/                      # 源代码
│   │       ├── dist/                     # 构建产物
│   │       └── package.json              # @robot-admin/request-core
│   ├── .changeset/                       # 版本管理
│   └── package.json                      # Workspace 配置
│
└── robot-admin-request-core/             # 旧包（可删除）
    └── ...
```

## ✨ 下一步

现在你可以：

1. **运行主项目测试**: `cd Robot_Admin && bun run dev`
2. **添加新包**: 按照上面的"添加新包"流程
3. **发布 request-core**: 按照"发布流程"发布到 npm
4. **配置 CI/CD**: 自动化测试和发布流程

## 🎯 优势

- ✅ **统一管理**: 所有 Robot Admin 相关包在一个仓库
- ✅ **独立发布**: 每个包可独立版本控制
- ✅ **本地开发**: 符号链接实时生效，无需频繁发布
- ✅ **类型安全**: TypeScript 类型定义完全共享
- ✅ **版本管理**: Changesets 自动化版本和 CHANGELOG

---

**配置完成！** 🎉

有任何问题随时询问！
