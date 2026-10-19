/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 单队列上传、筛选和安全清理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  UploadExpose,
  UploadFileItem,
} from '@robot-admin/naive-ui-components/C_Upload'
import { UPLOAD_SCENES, createDemoUploadRequest } from './data'
/** 各场景共用一个队列，操作始终作用于当前可见的文件集合。 */
export function useUploadWorkspace() {
  const message = useMessage()
  const dialog = useDialog()
  const uploadRef = ref<UploadExpose | null>(null)
  const scene = ref('files')
  const failFirst = ref(false)
  const pasteable = ref(false)
  const files = shallowRef<UploadFileItem[]>([])
  const filter = ref('all')
  const currentScene = computed(
    () =>
      UPLOAD_SCENES.find(item => item.value === scene.value) ?? UPLOAD_SCENES[0]
  )
  const isBusy = (file: UploadFileItem) =>
    ['pending', 'validating', 'hashing', 'uploading'].includes(file.status)
  const busy = computed(() => files.value.some(isBusy))
  const paused = computed(() =>
    files.value.some(file => file.status === 'paused')
  )
  const successful = computed(
    () =>
      files.value.filter(file => ['success', 'instant'].includes(file.status))
        .length
  )
  const errors = computed(
    () => files.value.filter(file => file.status === 'error').length
  )
  const visibleFiles = computed(() =>
    files.value.filter(
      file =>
        filter.value === 'all' ||
        (filter.value === 'done'
          ? ['success', 'instant'].includes(file.status)
          : file.status === filter.value)
    )
  )
  const customRequest = createDemoUploadRequest(() => failFirst.value)
  const updateFiles = (value: UploadFileItem[]) => {
    files.value = value
  }
  const retryErrors = () =>
    files.value
      .filter(file => file.status === 'error')
      .forEach(file => uploadRef.value?.retryFile(file.uid))
  const clearCompleted = () =>
    files.value
      .filter(file => ['success', 'instant'].includes(file.status))
      .forEach(file => uploadRef.value?.removeFile(file.uid))
  const clearQueue = () => {
    if (!files.value.length) return
    if (!busy.value && !paused.value) {
      uploadRef.value?.clearAll()
      return
    }
    dialog.warning({
      title: '清空上传队列',
      content: '进行中的演示传输将停止，文件会从队列移除。',
      positiveText: '清空队列',
      negativeText: '保留',
      onPositiveClick: () => uploadRef.value?.clearAll(),
    })
  }
  const onExceed = () =>
    message.warning('队列最多 20 个文件，请先清理已完成项目')
  return {
    uploadRef,
    scene,
    failFirst,
    pasteable,
    files,
    filter,
    currentScene,
    busy,
    paused,
    successful,
    errors,
    visibleFiles,
    customRequest,
    updateFiles,
    retryErrors,
    clearCompleted,
    clearQueue,
    onExceed,
  }
}
