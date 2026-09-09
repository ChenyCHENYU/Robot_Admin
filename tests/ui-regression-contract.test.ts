/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\tests\ui-regression-contract.test.ts
 * @Description: UI capability and stylesheet regression contracts
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */

import { describe, expect, test } from 'bun:test'
import { RobotNaiveUiResolver } from '@robot-admin/naive-ui-components/resolver'
import { iconSafelist } from '../src/utils/unocss/icon-safelist'
import { LOGIN_FEATURES } from '../src/views/login/data'

const readText = (relativePath: string): Promise<string> =>
  Bun.file(new URL(relativePath, import.meta.url)).text()

describe('UI regression contracts', () => {
  test('login page keeps every existing entry and demo credential', async () => {
    expect(LOGIN_FEATURES).toEqual({
      passwordLogin: true,
      rememberMe: true,
      forgotPassword: true,
      captchaVerify: true,
      captchaLogin: true,
      qrcodeLogin: true,
      socialLogin: true,
      register: true,
    })

    const loginSource = await readText('../src/views/login/index.vue')
    expect(loginSource).toContain('default-username="CHENY"')
    expect(loginSource).toContain('default-password="123456"')
    expect(loginSource).toContain('login-container bg-[#181818]')

    const loginStyles = await readText('../src/views/login/index.scss')
    expect(loginStyles).toContain('background-color: #181818')
  })

  test('navbar components load their styles through the resolver', async () => {
    const resolver = RobotNaiveUiResolver({ importStyle: 'base' })
    const componentNames = [
      'C_GlobalSearch',
      'C_NotificationCenter',
      'C_Language',
      'C_Theme',
      'C_Guide',
    ]

    for (const componentName of componentNames) {
      const resolved = resolver.resolve(componentName)
      expect(resolved).toBeDefined()
      expect(resolved?.from).toBe(
        `@robot-admin/naive-ui-components/${componentName}`
      )
      expect(resolved?.sideEffects).toBe(
        `@robot-admin/naive-ui-components/${componentName}/style.css`
      )
    }

    const navbarSource = await readText(
      '../src/components/global/C_NavbarRight/index.vue'
    )
    for (const componentName of componentNames) {
      expect(navbarSource).not.toMatch(
        new RegExp(`import\\s+${componentName}\\s+from`)
      )
    }
  })

  test('manually imported components explicitly load their styles', async () => {
    const contracts = [
      ['../src/composables/useLayoutBridge.ts', 'C_Icon', 'style.css'],
      ['../src/views/sys-manage/user-manage/index.vue', 'C_Tree', 'style.css'],
      ['../src/views/sys-manage/role-manage/index.vue', 'C_Icon', 'style.css'],
      [
        '../src/views/sys-manage/dictionary-manage/index.vue',
        'C_Tree',
        'style.css',
      ],
      ['../src/views/sys-manage/menu-manage/index.vue', 'C_Tree', 'style.css'],
      ['../src/views/demo/11-table-expand/index.vue', 'C_Table', 'base.css'],
    ] as const

    await Promise.all(
      contracts.map(async ([relativePath, componentName, stylesheet]) => {
        const source = await readText(relativePath)
        const entry = `@robot-admin/naive-ui-components/${componentName}`
        expect(source).toContain(`from '${entry}'`)
        expect(source).toContain(`import '${entry}/${stylesheet}'`)
      })
    )
  })

  test('runtime component icons are covered by the UnoCSS safelist', () => {
    expect([...iconSafelist].sort()).toEqual(
      [
        'i-mdi:align-horizontal-left',
        'i-mdi:align-horizontal-right',
        'i-mdi:arrow-left-right-bold',
        'i-mdi:check',
        'i-mdi:chevron-down',
        'i-mdi:chevron-up',
        'i-mdi:clock-time-four-outline',
        'i-mdi:close',
        'i-mdi:delete-outline',
        'i-mdi:drag-vertical',
        'i-mdi:file-document-outline',
        'i-mdi:inbox-outline',
        'i-mdi:magnify',
        'i-mdi:menu',
        'i-mdi:refresh',
        'i-mdi:search',
        'i-mdi:tally-mark-5',
      ].sort()
    )
  })

  test('highlighting stays enabled and navigation does not wait for auxiliary permissions', async () => {
    const mainSource = await readText('../src/main.ts')
    expect(mainSource).toContain(
      "import { setupHighlight } from '@/plugins/highlight'"
    )
    expect(mainSource).toContain('setupHighlight(app)')

    const dynamicRouterSource = await readText('../src/router/dynamicRouter.ts')
    expect(dynamicRouterSource).not.toContain(
      'await permissionStore.initializeAuxiliaryPermissions()'
    )
  })

  test('development startup does not include duplicate preload work', async () => {
    const packageJson = await Bun.file(
      new URL('../package.json', import.meta.url)
    ).json()
    const viteConfig = await readText('../vite.config.ts')
    const serverConfig = await readText(
      '../src/config/vite/viteServerConfig.ts'
    )
    const componentsConfig = await readText(
      '../src/config/vite/viteComponentsConfig.ts'
    )

    expect(packageJson.devDependencies['vite-plugin-preloader']).toBeUndefined()
    expect(packageJson.scripts.dev).toContain('VITE_CONSOLE_BANNER=false')
    expect(packageJson.scripts['dev:banner']).toContain(
      'VITE_CONSOLE_BANNER=true'
    )
    expect(viteConfig).not.toContain('vite-plugin-preloader')
    expect(serverConfig).not.toContain('warmup:')
    expect(viteConfig).toContain("'@robot-admin/naive-ui-components'")
    expect(viteConfig).toContain("'@visactor/vtable'")
    expect(viteConfig).toContain("'@visactor/vtable-gantt'")
    expect(viteConfig).toContain("'@robot-admin/naive-ui-components > qrcode'")
    expect(viteConfig).toContain(
      "'@robot-admin/naive-ui-components > spark-md5'"
    )
    expect(viteConfig).toContain(
      "'@robot-admin/naive-ui-components > html2canvas'"
    )
    expect(viteConfig).toContain(
      "'@robot-admin/naive-ui-components > jsbarcode'"
    )
    expect(viteConfig).toContain("'@robot-admin/naive-ui-components > mammoth'")
    expect(viteConfig).toContain(
      "'@robot-admin/naive-ui-components > xgplayer'"
    )
    expect(viteConfig).toContain(
      "'@robot-admin/naive-ui-components > xgplayer-hls'"
    )
    expect(viteConfig).toContain("'@visactor/vutils > eventemitter3'")
    expect(viteConfig).toContain("'@visactor/vtable > gifuct-js'")
    expect(viteConfig).toContain("'@visactor/vrender-kits > gifuct-js'")
    expect(viteConfig).toContain("'@visactor/vrender-kits > lottie-web'")
    expect(viteConfig).toContain("'@visactor/vtable > cssfontparser'")
    expect(viteConfig).toContain("'@visactor/vtable > lodash/get'")
    expect(viteConfig).toContain("'@visactor/vtable > @visactor/vdataset'")
    expect(componentsConfig).toContain("componentName === 'Icon'")
    expect(componentsConfig).toContain("from: '@iconify/vue'")
  })

  test('first authenticated frame and route intent have stable loading contracts', async () => {
    const unoConfig = await readText('../unocss.config.ts')
    const loginSource = await readText('../src/views/login/index.vue')
    const layoutSource = await readText(
      '../src/components/global/C_Layout/index.vue'
    )
    const groupedMenuSource = await readText(
      '../src/components/global/C_MenuGrouped/index.vue'
    )
    const dynamicRouterSource = await readText('../src/router/dynamicRouter.ts')

    expect(unoConfig).toContain("'src/components/global/**/*.{vue,ts,tsx}'")
    expect(unoConfig).toContain("'src/views/home/**/*.{vue,ts,tsx}'")
    expect(loginSource).toContain('preloadAuthenticatedShell()')
    expect(loginSource).toContain('requestIdleCallback')
    expect(loginSource).toContain(':paused="loading"')
    expect(layoutSource).toContain('@intent="prefetchRoute"')
    expect(groupedMenuSource).toContain('prefetchRoute(fullPath(menu))')
    expect(groupedMenuSource).not.toContain('router.push(path)')
    expect(dynamicRouterSource).toContain('dynamicRouteLoaders.set(fullPath')
    expect(dynamicRouterSource).toContain(
      'export const prefetchDynamicRouteComponent'
    )
  })

  test('composed package styles remain self-contained', async () => {
    const packageRoot = new URL(
      '../node_modules/@robot-admin/naive-ui-components/dist/',
      import.meta.url
    )
    const loginCss = await Bun.file(new URL('C_Login.css', packageRoot)).text()
    const guideCss = await Bun.file(new URL('C_Guide.css', packageRoot)).text()

    expect(loginCss).toContain('.c-captcha-modern[')
    expect(loginCss).toContain('.c-icon[')
    expect(loginCss).toContain('.vue-puzzle-vcode')
    expect(guideCss).toContain('.c-icon[')
  })

  test('component package runtime imports stay on deep on-demand entries', async () => {
    const sourceGlob = new Bun.Glob('src/**/*.{ts,vue}')
    const rootRuntimeImports: string[] = []

    for await (const file of sourceGlob.scan({
      cwd: import.meta.dir + '/..',
    })) {
      const source = await Bun.file(
        new URL(`../${file.replaceAll('\\', '/')}`, import.meta.url)
      ).text()

      const lines = source.split('\n')
      for (const [index, line] of lines.entries()) {
        if (!line.includes("from '@robot-admin/naive-ui-components'")) continue

        let importStart = index
        while (importStart >= 0 && !/^\s*import\b/.test(lines[importStart])) {
          importStart -= 1
        }
        if (
          importStart < 0 ||
          !/^\s*import\s+type\b/.test(lines[importStart])
        ) {
          rootRuntimeImports.push(file)
        }
      }
    }

    expect(rootRuntimeImports).toEqual([])
  })
})
