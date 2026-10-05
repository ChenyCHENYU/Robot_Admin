<!--
  @Author: ChenYu ycyplus@gmail.com
  @Date: 2026-10-06
  @FilePath: \Robot_Admin\vendor\README.md
  @Description: 尚未发布组件包的不可变消费产物
  Copyright (c) 2026 by CHENY, All Rights Reserved.
-->

# 组件库 0.13.3 消费产物

当前 npm 发布身份未登录，`bun pm whoami` 返回 missing authentication。为让本轮样式、图标与菜单修复在项目中实际生效，项目暂时固定消费组件库通过完整验证后打出的发布格式 tarball，包内版本为 **0.13.3**。这不表示该版本已经发布到 npm。

- 文件：`robot-admin-naive-ui-components-0.13.3-74184bb62abc.tgz`
- SHA-256：`74184bb62abca26c01aa00d4e6472a72dcb14f9313443bd63b3d4fa48ae60905`
- 来源：同级 `naive-ui-components` 提交 `c410de7` 的发布构建，包含正式 `dist` 和标准 JS / CJS / DTS / CSS 入口。
- 安装：`bun install --frozen-lockfile`，无需本地源码仓库，也没有增加生产源码 alias。
- 文件名含内容摘要，禁止覆盖同名产物。Bun 可能复用相同路径的本地 tarball 缓存；内容变更时必须重新生成摘要文件名并更新依赖。

完成本机发布身份登录后，在组件库执行其发布流程。确认 npm 上的 0.13.3 与本产物一致后，项目执行：

```sh
bun add --exact @robot-admin/naive-ui-components@0.13.3
bun install --frozen-lockfile
bun run verify
```

随后移除当前 tarball 和这份临时说明。不要将发布令牌写入仓库或提交历史。
