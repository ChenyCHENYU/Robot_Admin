/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\e2e\runtime-resource-probe.ts
 * @Description: 透明记录原生观察目标与 Blob URL 所有权，不替代浏览器行为
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export interface RuntimeResources {
  resizeTargets: number
  intersectionTargets: number
  detachedTargets: number
  blobUrls: number
  domNodes: number
  mediaNodes: number
  programmaticMediaCreated: number
  programmaticMediaLive: number
  programmaticMediaActive: number
  heapBytes: number | null
  gcAvailable: boolean
}

declare global {
  interface Window {
    __runtimeResources: () => RuntimeResources
    __runtimeMediaElements: (kind: 'audio' | 'video') => HTMLMediaElement[]
    __runtimeObserverDetails: () => {
      kind: 'resize' | 'intersection'
      stack: string
      targets: { tag: string; className: string; connected: boolean }[]
    }[]
  }
}

/** 在应用脚本之前安装；以弱引用记录资源，不替代原生回调或阻止 GC。 */
export function installRuntimeResourceProbe(): void {
  type ObserverRecord = {
    observer: WeakRef<object>
    kind: 'resize' | 'intersection'
    targets: Set<WeakRef<Element>>
    references: WeakMap<Element, WeakRef<Element>>
    stack: string
  }
  const observed = new WeakMap<object, ObserverRecord>()
  const observations = new Set<ObserverRecord>()
  const programmaticMedia = new Set<WeakRef<HTMLMediaElement>>()
  let programmaticMediaCreated = 0
  const blobUrls = new Set<string>()
  const NativeResizeObserver = window.ResizeObserver
  const NativeIntersectionObserver = window.IntersectionObserver
  const NativeAudio = window.Audio

  /** 只在原生 observe 成功后登记；同一个目标重复观察不会累加。 */
  function register(
    observer: object,
    target: Element,
    kind: ObserverRecord['kind']
  ): void {
    let record = observed.get(observer)
    if (!record) {
      record = {
        observer: new WeakRef(observer),
        kind,
        targets: new Set(),
        references: new WeakMap(),
        stack: new Error().stack ?? '',
      }
      observed.set(observer, record)
      observations.add(record)
    }
    if (record.references.has(target)) return
    const reference = new WeakRef(target)
    record.references.set(target, reference)
    record.targets.add(reference)
  }

  /** 跟随真实 unobserve/disconnect 清理注册；不会忽略脱离文档的目标。 */
  function unregister(observer: object, target?: Element): void {
    const record = observed.get(observer)
    if (!record) return
    if (target) {
      const reference = record.references.get(target)
      if (reference) record.targets.delete(reference)
      record.references.delete(target)
      if (record.targets.size) return
    }
    observed.delete(observer)
    observations.delete(record)
  }

  /** 读数仅使用仍存活的弱引用；没有强制 GC，也不把归零解释为无堆泄漏。 */
  function currentObservations() {
    const result: {
      kind: ObserverRecord['kind']
      stack: string
      targets: Element[]
    }[] = []
    for (const record of observations) {
      if (!record.observer.deref()) {
        observations.delete(record)
        continue
      }
      const targets: Element[] = []
      for (const reference of record.targets) {
        const target = reference.deref()
        if (target) targets.push(target)
        else record.targets.delete(reference)
      }
      if (targets.length)
        result.push({ kind: record.kind, stack: record.stack, targets })
    }
    return result
  }

  /** 未挂入 DOM 的 Audio 同样是实际媒体，只记录原生构造器返回值。 */
  function currentProgrammaticMedia(): HTMLMediaElement[] {
    const result: HTMLMediaElement[] = []
    for (const reference of programmaticMedia) {
      const element = reference.deref()
      if (element) result.push(element)
      else programmaticMedia.delete(reference)
    }
    return result
  }

  window.Audio = new Proxy(NativeAudio, {
    /** 保留原生构造参数、原型和返回实例，仅增加弱引用观测。 */
    construct(target, argumentsList, newTarget) {
      const element = Reflect.construct(
        target,
        argumentsList,
        newTarget
      ) as HTMLAudioElement
      programmaticMedia.add(new WeakRef(element))
      programmaticMediaCreated++
      return element
    },
  })

  window.ResizeObserver = class extends NativeResizeObserver {
    /** 调用成功后才登记，重复 observe 不重复计数。 */
    override observe(target: Element, options?: ResizeObserverOptions): void {
      super.observe(target, options)
      register(this, target, 'resize')
    }

    /** 与原生 unobserve 一起释放目标。 */
    override unobserve(target: Element): void {
      super.unobserve(target)
      unregister(this, target)
    }

    /** 不保留已断开的观察器实例。 */
    override disconnect(): void {
      super.disconnect()
      unregister(this)
    }
  }
  window.IntersectionObserver = class extends NativeIntersectionObserver {
    /** 原生边界检测和回调时序保持不变。 */
    override observe(target: Element): void {
      super.observe(target)
      register(this, target, 'intersection')
    }

    /** 移除最后一个目标时也移除观察器记录。 */
    override unobserve(target: Element): void {
      super.unobserve(target)
      unregister(this, target)
    }

    /** 不阻止组件或 SDK 的原生清理。 */
    override disconnect(): void {
      super.disconnect()
      unregister(this)
    }
  }

  const createObjectURL = URL.createObjectURL.bind(URL)
  const revokeObjectURL = URL.revokeObjectURL.bind(URL)
  URL.createObjectURL = object => {
    const url = createObjectURL(object)
    blobUrls.add(url)
    return url
  }
  URL.revokeObjectURL = url => {
    revokeObjectURL(url)
    blobUrls.delete(url)
  }
  window.__runtimeMediaElements = kind => [
    ...new Set([
      ...document.querySelectorAll<HTMLMediaElement>(kind),
      ...currentProgrammaticMedia().filter(
        element => element.tagName.toLowerCase() === kind
      ),
    ]),
  ]
  window.__runtimeObserverDetails = () =>
    currentObservations().map(record => ({
      kind: record.kind,
      stack: record.stack,
      targets: record.targets.map(target => ({
        tag: target.tagName,
        className: target.getAttribute('class') ?? '',
        connected: target.isConnected,
      })),
    }))
  window.__runtimeResources = () => {
    const active = currentObservations()
    const resize = active
      .filter(record => record.kind === 'resize')
      .flatMap(record => record.targets)
    const intersection = active
      .filter(record => record.kind === 'intersection')
      .flatMap(record => record.targets)
    const media = currentProgrammaticMedia()
    const { memory } = performance as Performance & {
      memory?: { usedJSHeapSize: number }
    }
    return {
      resizeTargets: resize.length,
      intersectionTargets: intersection.length,
      detachedTargets: [...resize, ...intersection].filter(
        target => !target.isConnected
      ).length,
      blobUrls: blobUrls.size,
      domNodes: document.querySelectorAll('*').length,
      mediaNodes: document.querySelectorAll('audio,video').length,
      programmaticMediaCreated,
      programmaticMediaLive: media.length,
      programmaticMediaActive: media.filter(
        element =>
          !element.paused ||
          element.getAttribute('src') ||
          element.querySelector('source[src]') ||
          element.readyState !== HTMLMediaElement.HAVE_NOTHING ||
          element.networkState !== HTMLMediaElement.NETWORK_EMPTY
      ).length,
      heapBytes: memory?.usedJSHeapSize ?? null,
      gcAvailable: typeof Reflect.get(window, 'gc') === 'function',
    }
  }
}
