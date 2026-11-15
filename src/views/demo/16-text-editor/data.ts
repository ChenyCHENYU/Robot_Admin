/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-16
 * @FilePath: \Robot_Admin\src\views\demo\16-text-editor\data.ts
 * @Description: 富文本演示的内容操作和控制配置，主题由组件继承 Provider
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  C_Editor,
  EditorProps,
} from '@robot-admin/naive-ui-components/C_Editor'

/** 使用真实组件实例演示命令式内容 API，配置无需反推组件 $props。 */
export function useTextEditorDemo() {
  const message = useMessage()
  const dialog = useDialog()

  const editorRef = ref<InstanceType<typeof C_Editor>>()
  const editorId = 'demo-editor-' + Date.now()
  const editorContent = ref(
    '<h2>欢迎使用富文本编辑器</h2><p>这是一个基于 <strong>WangEditor</strong> 封装的 Vue3 富文本编辑器组件。</p>'
  )
  const isEditorReady = ref(false)

  const editorConfig = reactive<EditorProps>({
    height: 554,
    placeholder: '请输入内容...',
    disabled: false,
    readonly: false,
  })

  const contentLength = computed(() => {
    if (!editorContent.value) return 0
    return editorContent.value.replace(/<[^>]*>/g, '').length
  })

  const handleEditorMounted = () => {
    isEditorReady.value = true
    message.success('富文本编辑器已成功初始化！')
  }

  const handleSetContent = () => {
    const currentTime = new Date().toLocaleString()
    const sampleContent = `<h2>示例内容</h2><p>这是通过 setContent 方法设置的示例内容。</p><h3>功能展示：</h3><ol><li><strong>粗体文本</strong></li><li><em>斜体文本</em></li><li><u>下划线文本</u></li></ol><p>当前时间：${currentTime}</p>`

    if (editorRef.value) {
      editorRef.value.setContent(sampleContent)
      message.success('内容设置成功！')
    }
  }

  const handleGetContent = () => {
    if (editorRef.value) {
      const content = editorRef.value.getContent()
      dialog.info({
        title: '编辑器内容',
        content: `内容长度：${content.length} 字符\n\n${content}`,
        positiveText: '确定',
      })
    }
  }

  const handleClearContent = () => {
    dialog.warning({
      title: '确认清空',
      content: '确定要清空编辑器中的所有内容吗？此操作不可撤销。',
      positiveText: '确认清空',
      negativeText: '取消',
      onPositiveClick: () => {
        if (editorRef.value) {
          editorRef.value.setContent('')
          message.success('内容已清空！')
        }
      },
    })
  }
  return {
    editorRef,
    editorId,
    editorContent,
    isEditorReady,
    editorConfig,
    contentLength,
    handleEditorMounted,
    handleSetContent,
    handleGetContent,
    handleClearContent,
  }
}
