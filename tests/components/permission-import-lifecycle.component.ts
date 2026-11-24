/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\tests\components\permission-import-lifecycle.component.ts
 * @Description: 权限文件预览隔离、重复确认与当前编码校验回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import {
  NDialogProvider,
  NMessageProvider,
  useDialogReactiveList,
} from 'naive-ui'
import { usePermissionImport } from '@/views/sys-manage/permission-manage/usePermissionImport'
import { deferred } from './d_deferred'

const contents = (code: string) =>
  JSON.stringify([
    {
      code,
      name: code,
      module: 'system',
      type: 'button',
      status: 0,
      sort: 0,
      resources: [],
    },
  ])

test('后选文件废弃旧预览和慢读取，确认使用当下权限编码且只写一次', async () => {
  const codes: string[] = []
  const commit = vi.fn().mockResolvedValue(undefined)
  let controller!: ReturnType<typeof usePermissionImport>
  let dialogs!: ReturnType<typeof useDialogReactiveList>
  const child = defineComponent({
    /** 使用真实确认弹层，验证已销毁弹层的回调不会再写入。 */
    setup() {
      dialogs = useDialogReactiveList()
      controller = usePermissionImport({
        enabled: true,
        codes: () => codes,
        commit,
      })
      return () => h('input', { ref: controller.inputRef, type: 'file' })
    },
  })
  const wrapper = mount(
    defineComponent({
      /** 使用与权限管理页面一致的反馈上下文。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(child))
        ),
    })
  )
  const selectFile = (text: () => Promise<string>) => {
    Object.defineProperty(controller.inputRef.value, 'files', {
      configurable: true,
      value: [{ size: 400, text }],
    })
    return controller.read()
  }

  try {
    await selectFile(async () => contents('first'))
    const original = dialogs.value.at(-1)!
    const slow = deferred<string>()
    const staleRead = selectFile(() => slow.promise)
    await original.onPositiveClick?.(new MouseEvent('click'))
    expect(commit).not.toHaveBeenCalled()

    await selectFile(async () => contents('latest'))
    slow.resolve(contents('superseded'))
    await staleRead

    const current = dialogs.value.at(-1)!
    expect(current.content).toContain('latest')
    codes.push('latest')
    expect(await current.onPositiveClick?.(new MouseEvent('click'))).toBe(false)
    expect(commit).not.toHaveBeenCalled()

    codes.length = 0
    await Promise.all([
      current.onPositiveClick?.(new MouseEvent('click')),
      current.onPositiveClick?.(new MouseEvent('click')),
    ])
    expect(commit).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledWith([
      expect.objectContaining({ code: 'latest', status: 0, sort: 0 }),
    ])
  } finally {
    wrapper.unmount()
  }
})
