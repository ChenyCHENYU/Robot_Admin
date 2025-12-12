# Changelog

## [1.11.1](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.11.0...v1.11.1) (2025-12-12)


### Bug Fixes

* permanently remove auto-imports.d.ts from git ([d59e69b](https://github.com/ChenyCHENYU/Robot_Admin/commit/d59e69b65caba4eee7834c01d0de5df7e95ce9b1))
* remove auto-imports tracking and fix lint errors ([426f626](https://github.com/ChenyCHENYU/Robot_Admin/commit/426f6266b8c2f72a5e33127a871202337b553403))
* **table/C_Table:** 降低组件函数复杂圈度 ([eb98519](https://github.com/ChenyCHENYU/Robot_Admin/commit/eb9851908297fa5f806930f7d89055df3f609ee0))

## [1.11.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.10.0...v1.11.0) (2025-12-11)


### Features

* **table-setting:** 增加表格列宽调整配置 ([8c74ee0](https://github.com/ChenyCHENYU/Robot_Admin/commit/8c74ee003baa6372f7b537b8e679881e8a70cc6e))
* 增加表格高级配置能力 ([7fedaac](https://github.com/ChenyCHENYU/Robot_Admin/commit/7fedaacf0ec1b68e4abce329934a887e5d1cff09))


### Performance Improvements

* **config:** 优化清理vitest配置文件 ([0d31b35](https://github.com/ChenyCHENYU/Robot_Admin/commit/0d31b357d9ed9dfbbe44cf96381fc65684b6248f))
* **table-setting:** 表格高级设置功能完成 ([da2a803](https://github.com/ChenyCHENYU/Robot_Admin/commit/da2a8031e458201f2dad6044123aba5138ca0575))
* 优化表格列配置 ([6a9916c](https://github.com/ChenyCHENYU/Robot_Admin/commit/6a9916c42e10f9a1df09675408494a2c7e585e5f))

## [1.10.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.9.0...v1.10.0) (2025-12-02)


### Features

* 启用TypeScript文件翻译支持 ([6a875c4](https://github.com/ChenyCHENYU/Robot_Admin/commit/6a875c46740a1c972e4cf282cb319b5671468129))


### Bug Fixes

* **i18n:** 修复js内容翻译的问题，以及增加自动翻译临时开关命令 ([7eb4e28](https://github.com/ChenyCHENYU/Robot_Admin/commit/7eb4e28ae1f9a0212126defbc3a85f04c5507762))
* 生产环境启用i18n翻译功能 ([b766c39](https://github.com/ChenyCHENYU/Robot_Admin/commit/b766c39e6c5f119b4e05664ef045fdadfce57955))

## [1.9.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.8.1...v1.9.0) (2025-12-02)


### Features

* **C_Barcode:** 增加条形码组件，扩展插件组件菜单 ([570cd0a](https://github.com/ChenyCHENYU/Robot_Admin/commit/570cd0a9e659bdb7bb4fba22da41572a5eaad548))
* **error-page:** 增加异常页面菜单，包含401、403、404、500 ([c233016](https://github.com/ChenyCHENYU/Robot_Admin/commit/c233016b12a42f09fad52d1870e1f3c3c211691d))
* **i18n:** 增加日韩语翻译功能 ([ebe4c0e](https://github.com/ChenyCHENYU/Robot_Admin/commit/ebe4c0eddf482f4ab766e60760b74164d4381238))
* **Map:** 增加地图组件及演示页面 ([f82e340](https://github.com/ChenyCHENYU/Robot_Admin/commit/f82e3400a20b664dc319f034faa532677b1ba472))
* **merge:** 添加智能 JSON 合并驱动，解决翻译文件冲突 ([8250712](https://github.com/ChenyCHENYU/Robot_Admin/commit/8250712555dc1912bade15cde92032825ca6abca))
* 优化i18n配置，默认关闭开发环境自动翻译 ([820ef35](https://github.com/ChenyCHENYU/Robot_Admin/commit/820ef35859a0be6b100d95a3200914e961df900b))
* 优化i18n配置，默认关闭开发环境自动翻译 ([30167a3](https://github.com/ChenyCHENYU/Robot_Admin/commit/30167a3a93686099e8ba007193286dda6d78b4a1))
* 优化部署脚本，临时禁用i18n自动扫描 ([a168e75](https://github.com/ChenyCHENYU/Robot_Admin/commit/a168e75dcbbfaacad2cdb620f5880801cbb6f2d6))


### Bug Fixes

* **i18n/vite-auto-i18n-plugin:** 修复配置语法不被识别的问题，同步替换工具代码 ([a9a9cce](https://github.com/ChenyCHENYU/Robot_Admin/commit/a9a9ccec3361d1554ea3501592e07f7b12425872))
* **menu-manager:** 完善菜单逻辑，考虑非标菜单的有效展示 ([26d0b97](https://github.com/ChenyCHENYU/Robot_Admin/commit/26d0b97f70859a5c69adc091a008da9a923f286d))
* **merge:** 同步自动冲突解决功能 ([a25ca3f](https://github.com/ChenyCHENYU/Robot_Admin/commit/a25ca3f6c77a0001055d2eaf830ae30dd19182fd))
* **merge:** 增强自动合并功能，智能解决翻译文件冲突 ([95ded00](https://github.com/ChenyCHENYU/Robot_Admin/commit/95ded00e46439798b21e8fbc6676e57f337d3368))
* 部署脚本切换分支后清理自动生成文件修改 ([76df231](https://github.com/ChenyCHENYU/Robot_Admin/commit/76df231d50247703e4fd50eedf2e755ce592131e))


### Performance Improvements

* **permission.ts:** 优化代码逻辑，降低复杂圈数 ([afb80ce](https://github.com/ChenyCHENYU/Robot_Admin/commit/afb80ce874007259df8f4c0ab0331b2a58c84674))

## [1.8.1](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.8.0...v1.8.1) (2025-11-17)


### Performance Improvements

* **axios:** 增加插件系统，重新/缓存/取消/性能单测 ([9f57861](https://github.com/ChenyCHENYU/Robot_Admin/commit/9f57861d25131f790887c3eac8f4792f07969f5e))
* **Global Error Handle:** 增加全局错误处理，避免异常崩溃，作为异常兜底方案 ([56628f7](https://github.com/ChenyCHENYU/Robot_Admin/commit/56628f7967cc12c9d302f96763e2339ee26ec913))

## [1.8.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.7.0...v1.8.0) (2025-11-13)


### Features

* **C_Layout:** 增加反向菜单布局 ([e9b47c5](https://github.com/ChenyCHENYU/Robot_Admin/commit/e9b47c56dc13ed4b3e37409dd058be59404e649d))
* **C_Layout:** 增加反转菜单布局 ([a2c6fa6](https://github.com/ChenyCHENYU/Robot_Admin/commit/a2c6fa6f60f6ec7f3530fbe1f79815b968e39bac))
* **C_Layout:** 增加头部导航布局 ([9ca1525](https://github.com/ChenyCHENYU/Robot_Admin/commit/9ca1525a4f97614090b54f460bee5b1d37a61471))
* **C_Layout:** 增加左侧菜单混合布局 ([648ee8c](https://github.com/ChenyCHENYU/Robot_Admin/commit/648ee8c41c1ce9b81f658fa9e3086210333219c9))
* **C_Layout:** 增加新颖的卡片网格布局 ([d0843f6](https://github.com/ChenyCHENYU/Robot_Admin/commit/d0843f6e0c6d1173c0f82be370a999b9f40aa6e9))
* **C_Layout:** 增加顶部混合布局，剥离公共右侧部分 ([860c297](https://github.com/ChenyCHENYU/Robot_Admin/commit/860c2975d7a6b6e47efc92752e214108c1480623))
* **scripts:** 自动处理自动生成文件，避免合并冲突 ([d64fc2c](https://github.com/ChenyCHENYU/Robot_Admin/commit/d64fc2ce4a531f9bc87b31e64dfbeb826ba9dd3a))
* **布局设置:** 增加布局配置功能/外观部分 ([b1bebb6](https://github.com/ChenyCHENYU/Robot_Admin/commit/b1bebb652aa99426ff37e2435ab0130f8360e80f))


### Bug Fixes

* **dynamicRouter:** 修复重启后单页面路由跳转陷阱 ([c11434c](https://github.com/ChenyCHENYU/Robot_Admin/commit/c11434cee03db0024f75dbb11295428131499b57))
* **i18n:** 修复历史TAGS切换语言未变化的问题 ([5170b62](https://github.com/ChenyCHENYU/Robot_Admin/commit/5170b6296c07361467cdadf3fe7372b7b04af5f0))

## [1.7.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.6.4...v1.7.0) (2025-11-06)


### Features

* **i18n:** 增加 i18n 功能，插件和脚本，以及文档的编写 ([e5ae03f](https://github.com/ChenyCHENYU/Robot_Admin/commit/e5ae03ffb417df560379036bbbc591650686595c))


### Bug Fixes

* **TAGS:** 修复关闭所有导致出现关于页的固定配置 ([d64bea3](https://github.com/ChenyCHENYU/Robot_Admin/commit/d64bea3cada9d3d00e7abca675899f67b57f70d4))


### Performance Improvements

* **i18n:** 增加配置，解决切换菜单触发HMR导致刷新的问题 ([0afaa23](https://github.com/ChenyCHENYU/Robot_Admin/commit/0afaa235d33f4e850d5f55d19f7b8b4d7db3992c))

## [1.6.4](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.6.3...v1.6.4) (2025-11-04)


### Bug Fixes

* **generate-api/build:** 构建前自动生成 API 文件以修复 Vercel 部署失败 ([05bb594](https://github.com/ChenyCHENYU/Robot_Admin/commit/05bb59493902a1c206a469400f2fc4749ef39a05))
* **generated/openapi.json:** 在 ESLint 中忽略 generated/ 自动生成文件,修复 Vercel 构建失败 ([c4f800a](https://github.com/ChenyCHENYU/Robot_Admin/commit/c4f800a187cb186e4aa3e58070a6cb75fb9c1195))


### Performance Improvements

* **API:** 优化[@api](https://github.com/api)，增加sdk配置，自动生成接口，避免类型体操 ([18a079a](https://github.com/ChenyCHENYU/Robot_Admin/commit/18a079a89a818252ac56a89bc84cfccdb4d26a33))
* **Pagination:** 剔除冗余配置，保持精简默认 ([464282a](https://github.com/ChenyCHENYU/Robot_Admin/commit/464282a0d6e1aefd3df5af34807df54dbb0c11a0))
* **Table/Expand/Dynamic:** 示范组件表格相关的接口全部替换成sdk，验证完成 ([db6ca5b](https://github.com/ChenyCHENYU/Robot_Admin/commit/db6ca5ba1128c38ba5ea0ece565b065cef2d5302))
* **TypeScript moduleResolution:** typeScript moduleResolution 和 resolve.extensions 配置优化 ([7679c80](https://github.com/ChenyCHENYU/Robot_Admin/commit/7679c80dd3f9a3b56790abacc1f2163ccbd52c91))
* **vite.warmup:** 增加大文件预热配置 ([83b357e](https://github.com/ChenyCHENYU/Robot_Admin/commit/83b357e94e8dcbf7b60c3ab191573ca1cbb7ee45))
* **加载/启动/分包/构建:** 全面优化一版，后面在考虑收拾scss ([d210e26](https://github.com/ChenyCHENYU/Robot_Admin/commit/d210e26349930eb440eb010b30f9e7afab954032))

## [1.6.3](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.6.2...v1.6.3) (2025-10-29)


### Bug Fixes

* **viteBuildConfig:** 修复 manualChunks 函数调用构建异常，切为稳定的对象方式 ([feaeb5b](https://github.com/ChenyCHENYU/Robot_Admin/commit/feaeb5b3481fe7d494ddf89607d87a97342e7553))

## [1.6.2](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.6.1...v1.6.2) (2025-10-29)


### Bug Fixes

* **TAGS:** 修复关闭所有标签回退错误问题 ([8baee16](https://github.com/ChenyCHENYU/Robot_Admin/commit/8baee16422b42ccaac576aede4290039279d8ade))


### Performance Improvements

* **keepAlive:** 增加缓存配置 ([1443bc7](https://github.com/ChenyCHENYU/Robot_Admin/commit/1443bc74799a7116da3cdb7ccd6bd9aecd83b8e1))
* **vite:** 构建和预加载性能优化 ([74bc2e9](https://github.com/ChenyCHENYU/Robot_Admin/commit/74bc2e9c0f113c2593ad772538cf4b4ff83cc043))
* **首屏加载动画:** 性能优化 ([61e6dbe](https://github.com/ChenyCHENYU/Robot_Admin/commit/61e6dbe6a27e407244cee0ef6650529f293e68f3))

## [1.6.1](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.6.0...v1.6.1) (2025-10-28)


### Bug Fixes

* **TAGS:** 修复标签页智能跳转逻辑 ([06ec436](https://github.com/ChenyCHENYU/Robot_Admin/commit/06ec43601d18cf33d0ab39ffcf40d8678d9be213))
* **权限管理:** 修复操作异常 ([28d5c70](https://github.com/ChenyCHENYU/Robot_Admin/commit/28d5c70ccbb335b3c10887ddbb5c9c5785bf1752))
* **角色管理:** 详情等相关逻辑修复，显示关联内容 ([491c2ad](https://github.com/ChenyCHENYU/Robot_Admin/commit/491c2ada9e8c57b0e00e172c707fb60bfdea77a8))


### Performance Improvements

* **加载动画:** 性能优化，调整动画时间和加载时机 ([8fb5f8e](https://github.com/ChenyCHENYU/Robot_Admin/commit/8fb5f8e4e9442ddd91fa291275502e9832ade784))

## [1.6.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.5.0...v1.6.0) (2025-10-27)


### Features

* **工作流组件:** 增加暗色主题并调优演示页面 ([0512ca5](https://github.com/ChenyCHENYU/Robot_Admin/commit/0512ca50009cebeb71f0450c6e49d3a1fe80f56d))


### Bug Fixes

* **图编辑器:** 组件及演示页面暗色主题适配修复 ([766118f](https://github.com/ChenyCHENYU/Robot_Admin/commit/766118fa9d5dbaaf6c72a5672fe668cf60e16cc4))
* **富文本编辑器组件:** 增加全局样式控制，修复暗色主题下样式问题 ([7e3fdde](https://github.com/ChenyCHENYU/Robot_Admin/commit/7e3fdde02ec778ad3b0449f92f89943edc1d1cf6))
* **甘特图组件/页面:** 修复甘特图主题适配问题，自定义渲染报错 ([ae41cf7](https://github.com/ChenyCHENYU/Robot_Admin/commit/ae41cf71ba9ad6c8c393ddf7374fca2d987d7745))


### Performance Improvements

* **TAGS标签组件:** 优化复杂计算，利用浏览器原生方案，提高性能 ([002813f](https://github.com/ChenyCHENYU/Robot_Admin/commit/002813f116e55c7df593af660be5a4d7b30cd02f))

## [1.5.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.4.0...v1.5.0) (2025-10-26)


### Features

* **首页:** 增加统计真实数据获取 ([f8c4d8f](https://github.com/ChenyCHENYU/Robot_Admin/commit/f8c4d8fb8b22266147bdc985b422d603bb466a83))

## [1.4.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.3.0...v1.4.0) (2025-09-22)


### Features

* **C_Table:** 增加操作列固定，并优化相关样式 ([efc5105](https://github.com/ChenyCHENYU/Robot_Admin/commit/efc5105c4bb910e2552cd5ae2c4465ee9746af5e))
* **大屏模板/日成本看板:** 增加看板模板，同时升级bun、.husky版本和相关钩子命令 ([b7ed22a](https://github.com/ChenyCHENYU/Robot_Admin/commit/b7ed22ad2c58e784a4496b6c4bde4370c82b32ff))


### Bug Fixes

* **系统管理/菜单管理:** 修复非嵌套路由菜单name及path缺失情况下的逻辑短路问题 ([748f5c7](https://github.com/ChenyCHENYU/Robot_Admin/commit/748f5c7418eb19446643f590cefda73b6d5a37e3))

## [1.3.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.2.1...v1.3.0) (2025-09-05)


### Features

* **useTableData:** 增加获取表格列表钩子函数，封装通用的api，简化调用 ([8a4df86](https://github.com/ChenyCHENYU/Robot_Admin/commit/8a4df860db984941fa468fb9dd9debab5292ca8d))


### Bug Fixes

* **useTableData:** 解决异步回调提示的警告 ([e0b184f](https://github.com/ChenyCHENYU/Robot_Admin/commit/e0b184f43ecbc670ef4d060c5713e034053c0eb9))


### Performance Improvements

* **11-table-expand/展开表格:** 使用apifox接口替换写死的数据，演示页面优化完成 ([2ea064d](https://github.com/ChenyCHENYU/Robot_Admin/commit/2ea064d93ac7d48c48d40b03a6744aebbce1f256))
* **11-table-expand:** mock data optimiza ([c59267d](https://github.com/ChenyCHENYU/Robot_Admin/commit/c59267def9a44d0ad0d68322dee3b7315423736c))
* **12-table-dynamic/动态表格:** 使用 apifox 接口，优化相应的页面逻辑 ([3927d76](https://github.com/ChenyCHENYU/Robot_Admin/commit/3927d766d0cc2f14e8434439b3d900e4ffa761c6))
* **api:** 优化接口api定义 ([5ee0ee6](https://github.com/ChenyCHENYU/Robot_Admin/commit/5ee0ee6ac91357342acd0be0a6d1b52453ae4d5d))

## [1.2.1](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.2.0...v1.2.1) (2025-09-05)


### Performance Improvements

* **C_Table:** add Edit or View component optimiza ([cbcc06d](https://github.com/ChenyCHENYU/Robot_Admin/commit/cbcc06dae55bacd2a8210cbef3571e75e3b8d71c))
* **C_Table:** add useTableActions optimiza ([42436dc](https://github.com/ChenyCHENYU/Robot_Admin/commit/42436dc9555fea112ef50ab42f66f693cae8d2c4))
* **C_Table:** defineExpose code optimiza ([f7f13ed](https://github.com/ChenyCHENYU/Robot_Admin/commit/f7f13ed370744ff5111b83d5e74e45bcc03a2b2c))
* **table-dynamic:** code optimiza ([ee6813e](https://github.com/ChenyCHENYU/Robot_Admin/commit/ee6813e6f402635ea0a06e2537621ae4bc5345cf))
* **table:** optimiza auto config column config ([0c0fc45](https://github.com/ChenyCHENYU/Robot_Admin/commit/0c0fc4572401bfc275fdfdb01c4ec2b74653a58d))

## [1.2.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.1.2...v1.2.0) (2025-08-26)


### Features

* **@hey-api/openapi-ts:** add openapi auto type ([373bda9](https://github.com/ChenyCHENYU/Robot_Admin/commit/373bda93fe3cf3f77fc359ed3bc92eb96b34755e))
* **10-table:** detail modal replace api interface ([37b497c](https://github.com/ChenyCHENYU/Robot_Admin/commit/37b497c700b688e8690114d53fc4127291127092))
* **c_detail:** add c_detail local component ([3bd0786](https://github.com/ChenyCHENYU/Robot_Admin/commit/3bd078674410eac4332b80d421814eb12bbc7b4e))
* **login:** use apifox api ([76d66c0](https://github.com/ChenyCHENYU/Robot_Admin/commit/76d66c08fb659f9ec8ec7b20ba0c24f9ddf5bef2))
* **table:** add delete btn func ([7ea9244](https://github.com/ChenyCHENYU/Robot_Admin/commit/7ea9244b325e7a50176032737c179ee03d5c1644))


### Bug Fixes

* **C_VtableGantt:** move col width auto height repair ([a364e3d](https://github.com/ChenyCHENYU/Robot_Admin/commit/a364e3d0a10ebfc4c948a0aaf9ec359355f165f4))
* **table:** modal edit unfinish add list dispose ([eb4a229](https://github.com/ChenyCHENYU/Robot_Admin/commit/eb4a22961596d56b312fb95ade6341e808a0c3ed))


### Performance Improvements

* **api:** del abandoned api file ([466bd29](https://github.com/ChenyCHENYU/Robot_Admin/commit/466bd29241833d4504fcabae50662536d41d3018))
* **C_Time:** add custom optimiza ([ee87726](https://github.com/ChenyCHENYU/Robot_Admin/commit/ee877262f9a4828855130c6f9dc46aecbe704c74))
* **form:** delete repeat verify tip ([b59b8d9](https://github.com/ChenyCHENYU/Robot_Admin/commit/b59b8d9b01b95f576a4d9fe305c4eb62f25ac560))

## [1.1.2](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.1.1...v1.1.2) (2025-08-10)


### Performance Improvements

* **vite.config:** config optimization ([e25957a](https://github.com/ChenyCHENYU/Robot_Admin/commit/e25957a8c5c31ef21b0d8c9331c579779d0f0fc0))
* **vite.config:** viteBuildConfig optimization ([a5ff177](https://github.com/ChenyCHENYU/Robot_Admin/commit/a5ff177b6c39f930f96c81f53050dd09e594dd34))

## [1.1.1](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.1.0...v1.1.1) (2025-08-01)


### Bug Fixes

* **types:** all type error optimiza, dispose ts-type-cleaner plugin ([1d60a40](https://github.com/ChenyCHENYU/Robot_Admin/commit/1d60a4061b43ede0042a66ee8f347709b4adad9d))

## [1.1.0](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.0.1...v1.1.0) (2025-07-31)


### Features

* **vite:** update version 7 and optimiza vite.config up README ([36dc7b1](https://github.com/ChenyCHENYU/Robot_Admin/commit/36dc7b177f028d327a4a2d007782248953d07ccc))


### Bug Fixes

* **types:** optimiza finish ([0663507](https://github.com/ChenyCHENYU/Robot_Admin/commit/06635074441da371885f34d2e7e8aca240149d68))
* **types:** optimiza types all ([e508b82](https://github.com/ChenyCHENYU/Robot_Admin/commit/e508b821cf66b6af4e1dcd35c6048511f5c3becd))
* **vercel.json:** delete error file ([9712f8c](https://github.com/ChenyCHENYU/Robot_Admin/commit/9712f8cb4a948579b7ccadd85b007d7e0615af30))
* **vite.config:** build config optimiza ([91dac19](https://github.com/ChenyCHENYU/Robot_Admin/commit/91dac1938e6e36f1f6f904ebd740e9eb96d8826a))


### Performance Improvements

* **vercel.json:** add vercel json set regions ([3b9b5c6](https://github.com/ChenyCHENYU/Robot_Admin/commit/3b9b5c6e3b78fb99143b37434839d5904866d2d3))
* **vite.config:** build config optimiza ([0c470d8](https://github.com/ChenyCHENYU/Robot_Admin/commit/0c470d8165247b334a5388b5d9d532f44f4fa386))
* **vite.config:** optimiza build config ([d53cc17](https://github.com/ChenyCHENYU/Robot_Admin/commit/d53cc17918b4303be8ab13255b904816197b3cac))

## [1.0.1](https://github.com/ChenyCHENYU/Robot_Admin/compare/v1.0.0...v1.0.1) (2025-07-30)


### Bug Fixes

* **login/menu-top:** fix login route.push blank and optimiza func ([4366a07](https://github.com/ChenyCHENYU/Robot_Admin/commit/4366a07e9b7fbea44be039dbd4d88320442fb00b))


### Performance Improvements

* **login:** add Loading transition ([8adac6d](https://github.com/ChenyCHENYU/Robot_Admin/commit/8adac6d03ebbf26b4ecb0e270b834eb6ca76be62))

## 1.0.0 (2025-07-29)


### Features

* **16-text-editor:** 16-text-editor views page dev finish ([58ee77d](https://github.com/ChenyCHENYU/Robot_Admin/commit/58ee77d6868f353dd38ba11559cf0559c1f25e2a))
* **27-permission-direct:** permission direct and views page dev finish ([eda97db](https://github.com/ChenyCHENYU/Robot_Admin/commit/eda97db65f3ac3f3fa333b3083ce3aee82a4cb3b))
* **404/401:** 404 and 401 views dev finish ([de6bffc](https://github.com/ChenyCHENYU/Robot_Admin/commit/de6bffc00edb909f24882337d4c0b03925e3154e))
* **analysis:** analysis wip finish ([ca85dd9](https://github.com/ChenyCHENYU/Robot_Admin/commit/ca85dd9376b3b9a4ae7393f7de68f3a4a6beeb97))
* **analytics:** use analytics plugin ([dd50d3d](https://github.com/ChenyCHENYU/Robot_Admin/commit/dd50d3dcc73984f0bb15c822beea7d03acdf7b18))
* **blank-docs:** outside page and dynamicRouter config and blank-docs views page finish ([0e5d892](https://github.com/ChenyCHENYU/Robot_Admin/commit/0e5d892eb3bfcc5b0516f0dd506421dda05eb5d9))
* **Breadcrumb:** breadcrumb finish ([d4ef803](https://github.com/ChenyCHENYU/Robot_Admin/commit/d4ef8038fbb555a580e9cd7d39a85526da77da78))
* **C_Antv/antv-x6-editor:** antv compoents and views page finish ([5d46dd1](https://github.com/ChenyCHENYU/Robot_Admin/commit/5d46dd10d5a8ebb25f87c28e612f415e497ad837))
* **C_Captcha/login:** captcha component and doc finish, and integrate login page ([b3be326](https://github.com/ChenyCHENYU/Robot_Admin/commit/b3be32622d1eaf2f7140c5d3ace53b8ffc0535bd))
* **C_Cascade/cascade:** c_Cascade components or cascade views finish ([7835152](https://github.com/ChenyCHENYU/Robot_Admin/commit/7835152e10e7aa38b82ff74be5ec89590eba4fc3))
* **C_City/city:** c_City component and city view page wip finish ([7d8ab7c](https://github.com/ChenyCHENYU/Robot_Admin/commit/7d8ab7c428ce8757ba793f752465315a6e237efb))
* **C_Code:** c_Code and view page dev finish ([59f4c99](https://github.com/ChenyCHENYU/Robot_Admin/commit/59f4c990193ca6e93d5af3bacde7b9c98b00ea90))
* **C_Date/05-date:** c_Date compoent and 05_deta demo view wip fininsh ([e613509](https://github.com/ChenyCHENYU/Robot_Admin/commit/e613509480ecfae78945d3edc079a306a4ceffd2))
* **C_Draggable:** c_Draggable compoents and views page dev finish ([f5f92c7](https://github.com/ChenyCHENYU/Robot_Admin/commit/f5f92c72ccc2e92bcddb2eaf185cc346ae641e8a))
* **C_FilePreview/file-preview:** components and views page finish ([1c124e1](https://github.com/ChenyCHENYU/Robot_Admin/commit/1c124e15773c21b393ade2d18025695f33df2745))
* **C_Form/form:** c_Form compoents optimeza,form view page base version wip finish ([7c7e389](https://github.com/ChenyCHENYU/Robot_Admin/commit/7c7e3894d1e5abcb5429b8ededb30bb12fc4d27f))
* **C_Form/form:** multiple layouts Finish ([002c9ab](https://github.com/ChenyCHENYU/Robot_Admin/commit/002c9ab7bc85673d11a08e629023a68e9b714c8e))
* **C_FormSearch:** c_FormSearch and form views and style optimeza finish ([7691bb9](https://github.com/ChenyCHENYU/Robot_Admin/commit/7691bb99507879c5ad9b4f2c19ce279ca00b90a4))
* **C_FullCalendar:** c_FullCalendar and calendar view page dev finish ([0c9d1f8](https://github.com/ChenyCHENYU/Robot_Admin/commit/0c9d1f80944e29cbc8d96ee4207419326c017939))
* **C_GlobalSearch:** add global search components finish ([abd41d6](https://github.com/ChenyCHENYU/Robot_Admin/commit/abd41d6f7549da1ddd2959f5f49bfa79afced000))
* **C_Icon:** c_Icon 3 use method finish ([799d4e9](https://github.com/ChenyCHENYU/Robot_Admin/commit/799d4e947258f6eb2d09307ac574a40c13d1207b))
* **C_Icon:** 图标组件三种方式测验完成，配置了uno原子类 ([3188783](https://github.com/ChenyCHENYU/Robot_Admin/commit/3188783ea3c661d122aafcb3eb3af7f9f73f5b22))
* **C_Language:** c_Language wip finish ([6b9e5f2](https://github.com/ChenyCHENYU/Robot_Admin/commit/6b9e5f2a306f1d1b8c805d4b51b579c8a3418d8a))
* **C_MarkDonw:** markDown Editor dev finish await optimaze ([a960b0f](https://github.com/ChenyCHENYU/Robot_Admin/commit/a960b0f3a2518d018b8b5e1ce055df2ff3dcb428))
* **C_Notice:** c_Notice wip finish ([b6801a2](https://github.com/ChenyCHENYU/Robot_Admin/commit/b6801a25fde38ae7b32d45488887d393844adf69))
* **C_Progress/03-progress:** wip finish , style await optimeza ([c66542f](https://github.com/ChenyCHENYU/Robot_Admin/commit/c66542f7e68fea12373d878725c8ef400239ee7f))
* **C_Steps/steps:** compoents and views page finish ([53cc298](https://github.com/ChenyCHENYU/Robot_Admin/commit/53cc298dc8a8c09643717177abe71e2b20082bf8))
* **C_Table/DynamicTable:** dynamic Table dev finish ([b57ad3a](https://github.com/ChenyCHENYU/Robot_Admin/commit/b57ad3abe2fb9d08cf48248535fb064a35a308c8))
* **C_Table/Expand:** c_Table and Expand Hooks and table-expand views dev finish ([b1b31d3](https://github.com/ChenyCHENYU/Robot_Admin/commit/b1b31d339a9109eb15da03d4d3bed5f4f2eddfa9))
* **C_Table/table:** c_Table components and table view page dev fininsh ([498f21a](https://github.com/ChenyCHENYU/Robot_Admin/commit/498f21a1e37da203da28c31cc669e33a8f073393))
* **C_TagsView:** tagsView wip finish ([c0c097b](https://github.com/ChenyCHENYU/Robot_Admin/commit/c0c097b24375144ee4a7bc15d5850b8ee0c95bc5))
* **C_Time/04-time:** time component and time page wip finish ([f60d566](https://github.com/ChenyCHENYU/Robot_Admin/commit/f60d566b10a16f4580e4e728ba711be4cd291bbb))
* **C_Tree/menu-manage:** c_Tree components and menu-manage views page dev fininsh ([1fbca2c](https://github.com/ChenyCHENYU/Robot_Admin/commit/1fbca2ca44f4383c4d08bbec92e56daadedfa3fc))
* **C_VtableGantt/v-table-gantt:** component and views page finish ([29eca0f](https://github.com/ChenyCHENYU/Robot_Admin/commit/29eca0fb37c5daf46945915e65876dafd8b0de5d))
* **copy-direct:** copy direct and views page dev finish ([35c10ea](https://github.com/ChenyCHENYU/Robot_Admin/commit/35c10ead641858ad5de8efa06fdf365f002fe8f8))
* **debounce-direct:** debounce direct and views page dev finish ([4f243e2](https://github.com/ChenyCHENYU/Robot_Admin/commit/4f243e2fcfcbe3d3b4f81436477825aa50849f17))
* **dictionary-manage:** dictionary manage views page finish ([ab02300](https://github.com/ChenyCHENYU/Robot_Admin/commit/ab023008a39d0108e1272c429938e6d7a846a60a))
* **drag-direct:** drag direct and views page dev finish ([ee2ec3a](https://github.com/ChenyCHENYU/Robot_Admin/commit/ee2ec3a39f516efb54c3ffac84b286e28df6da9c))
* **dynamicRouter.json:** config finish all icon ([93f2740](https://github.com/ChenyCHENYU/Robot_Admin/commit/93f274009152ba89adbee8a242ba751e274dad97))
* **dynamicRouter.json:** dynamicRouter json data config finish ([2f300c2](https://github.com/ChenyCHENYU/Robot_Admin/commit/2f300c295126a525ea1e9ff1ed597e800bd63ef3))
* **dynamicRouter.json:** 优化dynamicRouter.json文件，优化源数据 ([392f3be](https://github.com/ChenyCHENYU/Robot_Admin/commit/392f3bedee52c21aaf7d27ad80a4421cdc6d4f9b))
* **form-modal:** form-modal dev finish ([e44096f](https://github.com/ChenyCHENYU/Robot_Admin/commit/e44096f80e7926c465ec4f7085511d3467fe0d32))
* **form-modal:** form-modal dev finish ([7bfd7d1](https://github.com/ChenyCHENYU/Robot_Admin/commit/7bfd7d11c14d6f5717e9f7418a2570fd9563c4c6))
* **form-modal:** form-modal optimeza finish ([b1ea9c7](https://github.com/ChenyCHENYU/Robot_Admin/commit/b1ea9c7a6a8baf2f6c31cad8e9d71c360f21589a))
* **hooks:** add useFormSubmit hooks function finish ([1c4416b](https://github.com/ChenyCHENYU/Robot_Admin/commit/1c4416b4c8951b923db2db0601de4e4cdd4c9f5e))
* **html:** add html loading plugin finish, optimize main use plugins finish ([f61b093](https://github.com/ChenyCHENYU/Robot_Admin/commit/f61b093ef10902a6b3dfc74ed14cb6643cfffe46))
* **login/C_Form:** login wip... C_Form base finish ([2281f54](https://github.com/ChenyCHENYU/Robot_Admin/commit/2281f54997dc8d9caaa87345f5074961091bb2a5))
* **login/dymicRouter|js|json:** login finish,dymicRouter wip finish, await wip layout or compoents ([44c0690](https://github.com/ChenyCHENYU/Robot_Admin/commit/44c06907fa285357b686bbb5488bafdc939e6712))
* **login/home?echars:** login or logout finish, home view finish ([61ed598](https://github.com/ChenyCHENYU/Robot_Admin/commit/61ed598cc7c06071d67f989659d56c8b967aed8d))
* **login:** login page transformation has been completed，Optimization eslint rules ([fccb753](https://github.com/ChenyCHENYU/Robot_Admin/commit/fccb753ab3da064df767e12791ca96eec72c38b8))
* **login:** login view optimeza ([f3ea401](https://github.com/ChenyCHENYU/Robot_Admin/commit/f3ea401ebc8f67e315d064b9c36791510ea6683d))
* **longpress-direct:** longpress direct and views page dev finish ([c0e1ddc](https://github.com/ChenyCHENYU/Robot_Admin/commit/c0e1ddcce9722116d7e4aaa60fb3c1291840fe57))
* **menuTop:** logo use menu-top-logo(robot).webm ([c58e2ee](https://github.com/ChenyCHENYU/Robot_Admin/commit/c58e2eebd9e52f7eb56d9637c882a4971617545a))
* **nprogress:** nprogress conifg router finish ([8ab9d17](https://github.com/ChenyCHENYU/Robot_Admin/commit/8ab9d17f65006c51ca1f98e80d0e9359f558634f))
* **Pagination:** c_Table add Pagination finish ([87ebea7](https://github.com/ChenyCHENYU/Robot_Admin/commit/87ebea7395aab1dfc9c62aa953a2934a92b5dee6))
* **permission-manage:** permission manage views page finish ([2159dee](https://github.com/ChenyCHENYU/Robot_Admin/commit/2159dee0934819987c6f125ec3cdbc8ecee64ea7))
* **production:** add .env.production ([924de05](https://github.com/ChenyCHENYU/Robot_Admin/commit/924de0537a6273d1b8cc584172e39b1062b51fef))
* **profile/useImage:** profile view and useImage hooks wip finish ([90dfdef](https://github.com/ChenyCHENYU/Robot_Admin/commit/90dfdef02ca8d4e561b056ff7ff3589bd8d68097))
* **release-please:** add version manage tools ([a017ed2](https://github.com/ChenyCHENYU/Robot_Admin/commit/a017ed21004ffba009a133997efc907a15042571))
* **script/type-check:** type-check Code debugging Finish ([4abd162](https://github.com/ChenyCHENYU/Robot_Admin/commit/4abd1621571a8841b5c1df90ebc6ae559042704d))
* **scripts:** add envs mdir and scripts optimiza check-branch ([476a67c](https://github.com/ChenyCHENYU/Robot_Admin/commit/476a67cc71078787d49059ba011385ee0c7c9776))
* **sys-manage/role-manage:** role manage views page finish ([b7dac79](https://github.com/ChenyCHENYU/Robot_Admin/commit/b7dac790d4e9151f2c797f240b30725c88ed6deb))
* **theme/menu:** theme optimeza finish, menu open state finish ([b1d5f5b](https://github.com/ChenyCHENYU/Robot_Admin/commit/b1d5f5b7c474aced1e74473b42f3b200df813f22))
* **theme/menu:** theme or menu fix or wip finish ([d0b57f5](https://github.com/ChenyCHENYU/Robot_Admin/commit/d0b57f5b7f4d09348dbb02bdec4cb79298c01604))
* **throttle-direct:** throttle direct and views page dev finish ([c90d0b8](https://github.com/ChenyCHENYU/Robot_Admin/commit/c90d0b894c63ca9ab1e25040b2cfc3b4d67d675a))
* **use Driver.js finish C_Guide:** style(C_TagsView): style optinmeza finish ([b9f5c56](https://github.com/ChenyCHENYU/Robot_Admin/commit/b9f5c56a5e0c0cfc89359a43b18371c99cbfc7dc))
* **useCopy/18-copy-text:** useCopy hooks and copy-test views page dev finish ([5ae0cf8](https://github.com/ChenyCHENYU/Robot_Admin/commit/5ae0cf83759ae0af3758fd77a5342e7f44180979))
* **useDownload/19-download-all:** useDownload hooks and 19-download-all views page dev finish ([51a2af9](https://github.com/ChenyCHENYU/Robot_Admin/commit/51a2af9b156caf05791625ab868e5d2f13dc5e2b))
* **useExcel/excel-all:** useExcel hooks and excel-all views page finish ([d65ff9e](https://github.com/ChenyCHENYU/Robot_Admin/commit/d65ff9e077bd3c261722ab31b373f80749f80a9b))
* **useJsZip/export-zip:** useJsZip Hooks and export-zip views page dev finish ([b65a446](https://github.com/ChenyCHENYU/Robot_Admin/commit/b65a446aac386747f6ddeeeec9f5fdce93d88f4c))
* **user-manage:** user manage views page finish ([9297fdc](https://github.com/ChenyCHENYU/Robot_Admin/commit/9297fdc35a5e0782ee3dec2908732b0108c32804))
* **version:** add main version updated ([8b63c18](https://github.com/ChenyCHENYU/Robot_Admin/commit/8b63c1844747386ac0a5a4ce809fd2a7c78a0ce5))
* **watermark-direct:** watermark direct and views page dev finish ([0b2e623](https://github.com/ChenyCHENYU/Robot_Admin/commit/0b2e6237020bf52ab02a673b61457d2aa6257273))
* **work-flow/C_WorkFlow:** compoents and views page finish ([3cbf78c](https://github.com/ChenyCHENYU/Robot_Admin/commit/3cbf78c60b567a3130f173185acbe3d244517737))


### Bug Fixes

* **.env.production:** fix VITE_API_BASE or apifox url ([3404b64](https://github.com/ChenyCHENYU/Robot_Admin/commit/3404b6432bc94fa11a128f334f1598b85d82893d))
* **15-markdown-editor:** type fix finish ([55d803c](https://github.com/ChenyCHENYU/Robot_Admin/commit/55d803c099fb37328573a64e1496656df9f692e1))
* **C_Calendar:** fix type error ([86f73a1](https://github.com/ChenyCHENYU/Robot_Admin/commit/86f73a161dd1511c7c6c91a6fa69b8a4a74d1311))
* **C_Editor:** resolve rendering jitter issue ([fc08b9d](https://github.com/ChenyCHENYU/Robot_Admin/commit/fc08b9d20a34992b32b2e967bb537effb47d9f02))
* **C_TagsView/stores/app:** fix removeOtherTags finish ([0aed109](https://github.com/ChenyCHENYU/Robot_Admin/commit/0aed109d03c96e9876282a69d3bc77a00f377df9))
* **C_WorkFlow:** fix func handleConfigSave data updated ([6f06d1e](https://github.com/ChenyCHENYU/Robot_Admin/commit/6f06d1e30b8832011c0299d315feeadd9c5436a7))
* **C_WorkFlow:** type fix ([bd0a8f3](https://github.com/ChenyCHENYU/Robot_Admin/commit/bd0a8f3161106a736b9eaab2e734465c15dc1c36))
* **copy-env.js:** optimiza checkout wrap manage and .env config file ([b05f8d2](https://github.com/ChenyCHENYU/Robot_Admin/commit/b05f8d2e46e0e71ea03282e17cf649594ea9d6e2))
* **d_menu:** icon style fix ([c5664bd](https://github.com/ChenyCHENYU/Robot_Admin/commit/c5664bd030d1b7d08e28fbf51430a72637181011))
* **d_router.ts:** getShowMenuList func fix, dispose child router 1 view ([2a9e824](https://github.com/ChenyCHENYU/Robot_Admin/commit/2a9e824eb7894f07d4ac871f72a3de54baf6a8ef))
* **dragable:** dragable views page fix finish ([8ef6546](https://github.com/ChenyCHENYU/Robot_Admin/commit/8ef6546805df0fabdcd2fe3e89a907a2966f626c))
* **dynamic title:** fix logout doucment.title(dynamic) ([4967cbe](https://github.com/ChenyCHENYU/Robot_Admin/commit/4967cbece794ffe485f229cec8edb60a1604aeee))
* **env:** fix VITE_API_BASE name ([ac36768](https://github.com/ChenyCHENYU/Robot_Admin/commit/ac36768964dcb5c21892863c47a62fa2abba8dd1))
* **menu-manage:** menu manage views page fix expandAll finish ([e7afe54](https://github.com/ChenyCHENYU/Robot_Admin/commit/e7afe541c34d0253fffa49c9374e1a6261b4655e))
* **menu/layout:** folding icon function and style repair ([87427e5](https://github.com/ChenyCHENYU/Robot_Admin/commit/87427e5d8f410e4d2a7347b3e27a7c51bfeb9162))
* **menu:** menu to next path fix finish ([6ec7c5f](https://github.com/ChenyCHENYU/Robot_Admin/commit/6ec7c5ff2299574a71c1ae13dcec70cf1766db5c))
* **package.json:** fix type checked shell and optimiza ([8d27bfa](https://github.com/ChenyCHENYU/Robot_Admin/commit/8d27bfa24561950e74fa8e2c8e5bb50bfca65d24))
* **permission:** fix permission login loop error ([6a6bbd2](https://github.com/ChenyCHENYU/Robot_Admin/commit/6a6bbd2a9d46e4917f07a4fb0cd5541046c5f5f2))
* **plugin/loading:** loading animition optimeza ([5b38f2f](https://github.com/ChenyCHENYU/Robot_Admin/commit/5b38f2f6bdbd275174995ae429829bef3cdda589))
* **plugin/loading:** loading animition optimeza ([0d850f9](https://github.com/ChenyCHENYU/Robot_Admin/commit/0d850f91b6afbec3e2037f3a2cd69dda1d26b9ef))
* **plugin/loading:** lodding optimize ([13cf3b3](https://github.com/ChenyCHENYU/Robot_Admin/commit/13cf3b3d6836a496afc787bc90ec65447603e9ea))
* **publicRouter.ts:** delete the redundant mete configuration items "link" ([0954678](https://github.com/ChenyCHENYU/Robot_Admin/commit/095467801f0d431431973279fd52b642e5804f91))
* **release-please.yml:** fix permissions all write ([fd09596](https://github.com/ChenyCHENYU/Robot_Admin/commit/fd09596fcfe241fcb7ac29c2e499ed16d907c554))
* **release-please:** delte lables prop ([faa441e](https://github.com/ChenyCHENYU/Robot_Admin/commit/faa441ee547540f6165271916252c6f3688d0745))
* **release-please:** json config and yml fix ([fc9ba78](https://github.com/ChenyCHENYU/Robot_Admin/commit/fc9ba789488e890742be83883d4869ff54e58bb2))
* **role-manage:** add and edit modal fix finish ([a7cb4e5](https://github.com/ChenyCHENYU/Robot_Admin/commit/a7cb4e55e83e989680528109592e64bf0e5a8c1b))
* **theme/layout:** layout theme switch config finish ([b75e5dd](https://github.com/ChenyCHENYU/Robot_Admin/commit/b75e5dd4362558d1f953d960956d3fd8037bb54d))
* **theme:** fix default theme bg color finish ([43ae621](https://github.com/ChenyCHENYU/Robot_Admin/commit/43ae6218541ed7c51b4bbdaa5d5fe159b209b08b))
* **theme:** fix theme style ([6075c4f](https://github.com/ChenyCHENYU/Robot_Admin/commit/6075c4f1699e0c4b5c8c1cf57ff88028c886f834))
* **theme:** theme switch or default optimiza finish ([a80f45c](https://github.com/ChenyCHENYU/Robot_Admin/commit/a80f45c998f8451ec72f4a17322ad6fb085e4b10))
* **thmem:** fix theme switch finish ([06ed267](https://github.com/ChenyCHENYU/Robot_Admin/commit/06ed267e16e99928e559ab2553e089852088a7db))
* **tsconfig.app.json:** fix type use json file warning ([774edc2](https://github.com/ChenyCHENYU/Robot_Admin/commit/774edc275243545746789e9e0c87b62652fc9bba))
* **tsconfig.vitest.json:** updated config info ([c338285](https://github.com/ChenyCHENYU/Robot_Admin/commit/c3382856d9e98dff7d32ad982058a04e5f3062fa))
* **tsconfig:** fix baseURL path ([fd61c55](https://github.com/ChenyCHENYU/Robot_Admin/commit/fd61c55cc672be83804479b8a38dafaf2ffd24d2))
* **type:** fix all type import error,from  naive-ui switch or naive-ui/es ([137653b](https://github.com/ChenyCHENYU/Robot_Admin/commit/137653b21ef428da9ba4caa2685600263503fb88))
* **version/release-please.yml:** file code updated, fix package-name ([7f4b980](https://github.com/ChenyCHENYU/Robot_Admin/commit/7f4b9806ded7a4e29ef598ff70a05d3bdc7f09de))


### Performance Improvements

* **C_AntV/ER/BPMN/UML:** components splice data scss finish ([296d7e8](https://github.com/ChenyCHENYU/Robot_Admin/commit/296d7e865b9f571af8ad922fd5c04510f2716c8b))
* **C_Breadcrumb/C_Tags:** breadcrumb and Tags compoents icon splice C_IcON finish ([c7112bc](https://github.com/ChenyCHENYU/Robot_Admin/commit/c7112bc8bb055d8ffa1e6135eeb44d4522bcc420))
* **C_FilePreview:** components optimiza finish ([7a60bb5](https://github.com/ChenyCHENYU/Robot_Admin/commit/7a60bb52441ecd4f92c7e542698879bb5156dcf0))
* **C_Menu:** optimiza route to expand menu ([42a1bdf](https://github.com/ChenyCHENYU/Robot_Admin/commit/42a1bdf6d5052cd61c4fd74fd947f166e64da28d))
* **c_role/role-manage:** slice role manage, c_role and role manage views page optimiza ([4766921](https://github.com/ChenyCHENYU/Robot_Admin/commit/476692182d3abb7452f6a12c8ae5d0af06dd8e88))
* **C_Table/table:** compoent add default action btn, optimiza table views page ([28ba8e6](https://github.com/ChenyCHENYU/Robot_Admin/commit/28ba8e61bab7ee1b50c4c1652107fd12b26cef6f))
* **C_Tree/menu-manage:** c_Tree compoents and menu-manage views page optimize finish ([3a8f879](https://github.com/ChenyCHENYU/Robot_Admin/commit/3a8f879f0a980f958300aef83156b86475aa26c2))
* **C_Tree:** c_Tree use C_Icon optimize ([e6d871d](https://github.com/ChenyCHENYU/Robot_Admin/commit/e6d871d98d313b3fd39de95967e0533aa1a3ad6a))
* **C_WorkFlow:** code optimiza fininsh ([c29f654](https://github.com/ChenyCHENYU/Robot_Admin/commit/c29f65448a2a7fca41529526738723d7bc239e44))
* **C_WorkFlow:** compoent perf optimiza and style optimiza ([9d0f767](https://github.com/ChenyCHENYU/Robot_Admin/commit/9d0f767e319cad97e6892be9246f6cfb19242046))
* **C_WorkFlow:** optimiza ([e429671](https://github.com/ChenyCHENYU/Robot_Admin/commit/e429671d537ffe480c90a6157e5394583141d659))
* **check-branch:** use npm optimiza check-branch scripts file, optimiza pacage command ([c7f0305](https://github.com/ChenyCHENYU/Robot_Admin/commit/c7f0305514531657660f6a5477f1afa6fa309e91))
* **copy-env.ejs:** perf copy-env.js or mjs, optimiza copy .env file code finish ([ca78ebc](https://github.com/ChenyCHENYU/Robot_Admin/commit/ca78ebcc16cf300c556e420dba93bf1dbd57101e))
* **copy-env/check-branch:** copy-env use npm manger，checkout-branch optimiza ([5ca3b30](https://github.com/ChenyCHENYU/Robot_Admin/commit/5ca3b30bf5e30e4c0066ef8eec38221c716290a7))
* **Custom/Form:** c_Draggable replace vuedraggable and optimeza Form layout style finish ([dd07a6a](https://github.com/ChenyCHENYU/Robot_Admin/commit/dd07a6a568a253f66e04deac727a04c1ed92e917))
* **dynamicRouter.ts:** optimiza code ,try error tip ([65260f1](https://github.com/ChenyCHENYU/Robot_Admin/commit/65260f1fee99e6da7c2a9e1a6e389c34fbac493b))
* **excel-all:** split data and scss file finish ([26147e9](https://github.com/ChenyCHENYU/Robot_Admin/commit/26147e99a94938023702879f962df7931a2fd490))
* **home:** home optimiza fininsh ([a595da4](https://github.com/ChenyCHENYU/Robot_Admin/commit/a595da4d467aedbebbb152cf6e0e50c3780aee8b))
* **home:** optimiza ([3cb4c5f](https://github.com/ChenyCHENYU/Robot_Admin/commit/3cb4c5f95d9d62bb88222b451b6d92749c16ff57))
* **main.ts:** 优化app实例链式调用 ([4f43af4](https://github.com/ChenyCHENYU/Robot_Admin/commit/4f43af48bef94bb90980ca1d16c5bc265cf6d3ce))
* **MarkdownEditor:** c_Markdown and page views optimeza finish ([c1603aa](https://github.com/ChenyCHENYU/Robot_Admin/commit/c1603aa558b10741b4d35fb75a38fcfde441e59d))
* **passive-scroll:** passive-scroll.ts optimeza finish ([50b7e31](https://github.com/ChenyCHENYU/Robot_Admin/commit/50b7e316d42ea5ff089956a1ee01f94a660a3638))
* **role-manage:** role manage views page optimiza ([db81ac7](https://github.com/ChenyCHENYU/Robot_Admin/commit/db81ac78a9194dbb14f1055fc957dc19117f1993))
* **sys-manage/user-manage:** user manage views page optimiza finish ([5ff2353](https://github.com/ChenyCHENYU/Robot_Admin/commit/5ff2353f90fed5a3d0daab57494abe4ea7d59c0d))
* **sys-mange/role-mange:** role manage code optimiza ([8031b53](https://github.com/ChenyCHENYU/Robot_Admin/commit/8031b53f5c8857930b72a61a99df86a4950beb6e))
* **tscofnig:** add mdir manage tsconfig all file, optimiza path import ([7b721cd](https://github.com/ChenyCHENYU/Robot_Admin/commit/7b721cdc84505f9ef4919254e87d37d4dc874d12))
* **useInitTreeMap:** optimeza finish ([be4b306](https://github.com/ChenyCHENYU/Robot_Admin/commit/be4b30626f1c7e1cdf557db75681c2833d483634))
* **work-flow-editor:** optimiza ([6cad2fd](https://github.com/ChenyCHENYU/Robot_Admin/commit/6cad2fdb6f678f57378449360414b65ab9349594))
