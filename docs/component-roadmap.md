# Robot Admin 组件扩展路线图

> 更新日期：2026-02-25
> 状态标记：⬜ 待开发 · 🔵 进行中 · ✅ 已完成

---

## 进度总览

|  阶段  | 组件                 |   难度   | 工时 | 外部依赖      | 状态 |
| :----: | -------------------- | :------: | :--: | ------------- | :--: |
| **一** | C_QRCode             |    ⭐    |  1d  | `qrcode`      |  ⬜  |
| **一** | C_Signature          |   ⭐⭐   | 1.5d | 无            |  ⬜  |
| **一** | C_SplitPane          |   ⭐⭐   | 1.5d | 无            |  ✅  |
| **一** | C_CollapsePanel      |   ⭐⭐   |  1d  | 无            |  ✅  |
| **二** | C_ImageCropper       |   ⭐⭐   | 1.5d | `vue-cropper` |  ✅  |
| **二** | C_Cron               |  ⭐⭐⭐  | 2.5d | 无            |  ✅  |
| **二** | C_WaterFall          |   ⭐⭐   |  2d  | 无            |  ⬜  |
| **三** | C_Upload             | ⭐⭐⭐⭐ | 3.5d | `spark-md5`   |  ⬜  |
| **三** | C_NotificationCenter |  ⭐⭐⭐  | 2.5d | 无            |  ⬜  |

> **排序逻辑**：阶段一选的是依赖少/复杂度低/可快速产出的组件，先把简单的收掉跑起来；阶段二是有一定逻辑深度的业务组件；阶段三是涉及分片、WebSocket 等重型场景，放到最后啃。

---

## 已完成项

| 内容                                             | 完成日期   | 备注                                       |
| ------------------------------------------------ | ---------- | ------------------------------------------ |
| C_VideoPlayer 视频播放器                         | 2026-02-24 | 分支 `feat/video`，含 28+ 文件             |
| v-lazy / v-loading / v-tooltip / v-click-outside | 2026-02-24 | `@robot-admin/directives@1.1.0` 已发布 npm |

---

## 阶段一：快速产出（约 4 天）

> 目标：3 个零/轻依赖组件，快速出成果。

### 1. C_QRCode 二维码

与 C_Barcode 对齐，补全码类生态。

```
C_QRCode/
├── types.ts
├── index.vue
├── composables/useQRCode.ts
└── README.md
```

**核心能力**

- 文本 / URL / JSON 生成二维码
- Logo 嵌入（自动提升容错等级）
- 前景色 / 背景色 / 圆角 / 点样式
- 下载导出 PNG / SVG / Canvas
- 容错级别 L / M / Q / H

**依赖** `qrcode ^1.5.x`（~33KB gzip）  
**Demo** `39-qrcode`

---

### 2. C_Signature 电子签名

审批流 C_WorkFlow 的配套组件。

```
C_Signature/
├── types.ts
├── constants.ts
├── index.vue
├── composables/
│   ├── useSignatureCanvas.ts      # Canvas 绑定与绘制
│   ├── useSignatureHistory.ts     # 撤销/重做历史栈
│   └── useSignatureExport.ts      # 导出处理
└── README.md
```

**核心能力**

- Canvas 手写签名（鼠标 + 触摸）
- 笔触粗细 / 颜色 / 透明度
- 撤销 / 重做 / 清除 / 重签
- 导出 PNG / JPEG / Base64 / Blob
- 透明背景导出、时间戳水印
- 签名回显（加载已有签名图片）

**依赖** 无  
**Demo** `42-signature`

---

### 3. C_SplitPane 分割面板

编辑器布局、主从列表的常用容器。

```
C_SplitPane/
├── types.ts
├── index.vue
├── composables/useSplitResize.ts
├── components/
│   ├── SplitHandle.vue            # 分割线手柄
│   └── SplitPanel.vue             # 面板插槽
└── README.md
```

**核心能力**

- 水平 / 垂直分割
- 拖拽调整面板大小
- 最小 / 最大比例限制
- 面板折叠 / 展开（双击或按钮）
- 嵌套分割（SplitPane 套 SplitPane）
- 键盘微调（方向键）

**依赖** 无  
**Demo** `43-split-pane`

---

## 阶段二：业务组件（约 6 天）

> 目标：3 个有一定逻辑深度的业务组件。

### 4. C_ImageCropper 图片裁剪

头像上传、Banner 裁剪，可与 C_Upload 联动。

```
C_ImageCropper/
├── index.vue                      # 主组件（内联 + 弹窗）
├── index.scss                     # 组件样式
├── components/
│   ├── CropperToolbar.vue         # 操作工具栏
│   └── CropperPreview.vue         # 预览面板（@realTime 驱动）
└── README.md

composables/ImageCropper/
└── useCropperCore.ts              # vue-cropper 实例管理 + 输出
types/modules/image-cropper.d.ts   # 类型定义
```

**核心能力**

- 自由 / 固定比例裁剪（1:1 / 16:9 / 4:3 / 自定义）
- 旋转 / 缩放 / 翻转
- 实时预览（裁剪框 + 结果双面板）
- 输出 PNG / JPEG / WebP + 质量控制
- Modal 弹窗模式（适配上传场景）
- centerBox 边界约束，裁剪框不超出图片
- 禁止滚轮缩放背景图

**依赖** `vue-cropper ^1.1.4`（Vue 3 裁剪组件库）  
**Demo** `45-image-cropper`

---

### 5. C_Cron 表达式编辑器

定时任务管理刚需，纯逻辑实现无外部依赖。

```
C_Cron/
├── index.vue                      # 主组件
├── constants.ts                   # 常量（字段元数据、模板）
├── components/
│   ├── CronFieldEditor.vue        # 单字段编辑器
│   ├── CronPreview.vue            # 执行时间预览
│   └── CronTemplates.vue          # 常用模板选择
└── README.md

composables/Cron/
├── useCronParser.ts               # 解析 & 生成引擎
├── useCronPreview.ts              # 执行时间预测
└── useCronDescription.ts          # 中文描述生成
types/modules/cron.d.ts            # 类型定义
```

**核心能力**

- 可视化编辑（秒/分/时/日/月/周）
- Cron 表达式双向绑定（可视化 ↔ 文本）
- 语法校验 + 错误提示
- 预览未来 N 次执行时间
- 常用模板快选（每天0点 / 每小时 / 每周一…）
- 自动生成中文描述（如 "每天 08:30 执行"）

**依赖** 无  
**Demo** `46-cron`

---

### 6. C_WaterFall 瀑布流 【到这里了哈，再这个开始之前考虑下是否要搞公式编辑器】

图片库、素材管理、商品展示的常用布局。

```
C_WaterFall/
├── types.ts
├── constants.ts
├── index.vue
├── composables/
│   ├── useWaterFallLayout.ts      # 布局算法引擎
│   ├── useInfiniteScroll.ts       # 无限滚动
│   └── useResponsiveColumns.ts    # 响应式列数
└── README.md
```

**核心能力**

- 响应式列数（自动计算或手动指定）
- 图片懒加载（联动 v-lazy 指令）
- 无限滚动加载
- 骨架屏占位动画
- 间距 / 动画过渡配置
- 自定义卡片渲染（slot）
- 窗口 resize 自动重排

**依赖** 无  
**Demo** `44-waterfall`

---

## 阶段三：重型组件（约 6 天）

> 目标：2 个涉及分片上传、WebSocket 等复杂场景的重型组件。

### 7. C_Upload 增强型上传

全项目最高频需求，分片 + 断点续传 + 秒传。

```
C_Upload/
├── types.ts
├── constants.ts
├── index.vue
├── composables/
│   ├── useUploadCore.ts           # 核心上传逻辑
│   ├── useChunkUpload.ts          # 分片上传引擎
│   ├── useFileHash.ts             # 文件哈希（Web Worker）
│   ├── useUploadQueue.ts          # 并发队列管理
│   └── useDragDrop.ts             # 拖拽 & 粘贴
├── components/
│   ├── UploadArea.vue             # 上传区域
│   ├── FileList.vue               # 文件列表
│   └── ImagePreview.vue           # 图片预览缩略图
└── README.md
```

**核心能力**

- 单文件 / 多文件 / 目录上传
- 拖拽上传 + 粘贴上传（Ctrl+V）
- 分片上传（可配置 chunkSize）
- 断点续传（spark-md5 校验已上传分片）
- 秒传校验（相同 hash 跳过）
- 并发控制（可配最大并发数）
- 单文件进度 + 总体进度
- 图片预裁剪（联动 C_ImageCropper）
- 文件类型 / 大小前置校验
- 自定义上传函数（OSS 直传 / 七牛等）

**依赖** `spark-md5 ^3.0.x`（~6KB gzip）  
**Demo** `38-upload`

> **与 @robot-admin/file-utils 的关系**：零耦合。file-utils 是文件下载/导出方向（downloadBlob、Excel、ZIP），C_Upload 是上传方向，完全相反。

---

### 8. C_NotificationCenter 通知中心

升级现有 C_Notice（纯静态硬编码 → Props 驱动 + WebSocket 实时推送）。

```
C_NotificationCenter/
├── types.ts
├── constants.ts
├── index.vue
├── composables/
│   ├── useNotificationCore.ts     # 核心状态管理
│   ├── useNotificationWS.ts       # WebSocket 连接
│   └── useNotificationFormat.ts   # 时间格式化
├── components/
│   ├── NotificationBadge.vue      # 未读角标
│   ├── NotificationList.vue       # 消息列表
│   ├── NotificationItem.vue       # 单条消息
│   └── NotificationDetail.vue     # 消息详情
└── README.md
```

**核心能力**

- Props 驱动（API 拉取 + WebSocket 推送）
- 消息分类（系统通知 / 业务消息 / 告警预警）
- 未读角标（红点 / 数字）
- 已读管理（单条 / 全部 / API 回调）
- WebSocket 实时推送 + 桌面 Notification
- 消息持久化（未读状态 localStorage 缓存）
- 时间格式化（刚刚 / X分钟前 / 昨天…）

**依赖** 无  
**Demo** 直接嵌入 Layout Header

---

## 新增依赖汇总

| 包            | 版本   | 用于           | 体积             |
| ------------- | ------ | -------------- | ---------------- |
| `qrcode`      | ^1.5.x | C_QRCode       | ~33KB gzip       |
| `vue-cropper` | ^1.1.4 | C_ImageCropper | Vue 3 裁剪组件库 |
| `spark-md5`   | ^3.0.x | C_Upload       | ~6KB gzip        |

> 其余 5 个组件均无外部依赖，纯逻辑实现。
