<!--
  @Author: ChenYu ycyplus@gmail.com
  @Date: 2026-10-06
  @FilePath: \Robot_Admin\vendor\README.md
  @Description: 尚未发布组件包的不可变消费产物
  Copyright (c) 2026 by CHENY, All Rights Reserved.
-->

# 组件库 0.13.4 消费产物

项目固定消费组件库通过完整验证后打出的发布格式 tarball，包内版本为 **0.13.4**，包含样式、图标、菜单修复，以及 C_GlobalSearch 常驻模糊导致的 Chrome 高分屏合成裁切修复。本次未执行 npm 发布；接入正式发布包前，使用本产物即可复现当前修复结果。

- 文件：`robot-admin-naive-ui-components-0.13.4-e758608f0c15.tgz`
- SHA-256：`e758608f0c1563ba1a247c07bd16650f7426d2f8fc8df80b42748ff35177e8f8`
- 来源：同级 `naive-ui-components` 提交 `f13d617` 的发布构建，包含正式 `dist` 和标准 JS / CJS / DTS / CSS 入口。
- 安装：`bun install --frozen-lockfile`，无需本地源码仓库，也没有增加生产源码 alias。
- 文件名含内容摘要，禁止覆盖同名产物。Bun 可能复用相同路径的本地 tarball 缓存；内容变更时必须重新生成摘要文件名并更新依赖。

完成本机发布身份登录后，在组件库执行其发布流程。确认 npm 上的 0.13.4 与本产物一致后，项目执行：

```sh
bun add --exact @robot-admin/naive-ui-components@0.13.4
bun install --frozen-lockfile
bun run verify
```

随后移除当前 tarball 和这份临时说明。不要将发布令牌写入仓库或提交历史。
