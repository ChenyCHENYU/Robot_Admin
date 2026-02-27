/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Upload\useFileHash.ts
 * @Description: 文件哈希计算（Web Worker + spark-md5）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/**
 * 文件哈希计算
 *
 * 使用 spark-md5 在 Web Worker 中对文件分片计算 MD5 hash，
 * 不阻塞主线程，支持进度回调。
 *
 * @param chunkSize  分片大小（bytes），也用于哈希分块读取
 */
export function useFileHash(chunkSize: import('vue').Ref<number>) {
  const hashing = ref(false)
  const hashProgress = ref(0)

  /**
   * 计算文件 hash
   * @param file  原生 File 对象
   * @returns     MD5 hash 字符串
   */
  async function calculateHash(file: File): Promise<string> {
    hashing.value = true
    hashProgress.value = 0

    return new Promise((resolve, reject) => {
      // 使用 inline Web Worker（避免额外文件）
      const workerCode = `
        self.importScripts('https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js');

        self.onmessage = function(e) {
          const { chunks } = e.data;
          const spark = new self.SparkMD5.ArrayBuffer();
          let current = 0;

          function processNext() {
            if (current >= chunks.length) {
              self.postMessage({ type: 'done', hash: spark.end() });
              return;
            }
            const reader = new FileReaderSync();
            const buffer = reader.readAsArrayBuffer(chunks[current]);
            spark.append(buffer);
            current++;
            self.postMessage({ type: 'progress', percent: Math.round((current / chunks.length) * 100) });
            processNext();
          }

          processNext();
        };
      `

      // 将文件分片
      const size = chunkSize.value
      const chunks: Blob[] = []
      let offset = 0
      while (offset < file.size) {
        chunks.push(file.slice(offset, offset + size))
        offset += size
      }

      // 如果浏览器不支持 Worker（SSR / 旧环境），走主线程降级
      if (typeof Worker === 'undefined') {
        computeHashMainThread(file, chunks)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            hashing.value = false
          })
        return
      }

      try {
        const blob = new Blob([workerCode], { type: 'application/javascript' })
        const workerUrl = URL.createObjectURL(blob)
        const worker = new Worker(workerUrl)

        worker.onmessage = (e: MessageEvent) => {
          const { type, hash, percent } = e.data
          if (type === 'progress') {
            hashProgress.value = percent
          } else if (type === 'done') {
            hashing.value = false
            worker.terminate()
            URL.revokeObjectURL(workerUrl)
            resolve(hash)
          }
        }

        worker.onerror = () => {
          hashing.value = false
          worker.terminate()
          URL.revokeObjectURL(workerUrl)
          // 降级到主线程
          computeHashMainThread(file, chunks).then(resolve).catch(reject)
        }

        worker.postMessage({ chunks })
      } catch {
        // Worker 创建失败，降级
        computeHashMainThread(file, chunks)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            hashing.value = false
          })
      }
    })
  }

  /** 主线程降级计算 */
  async function computeHashMainThread(
    file: File,
    chunks: Blob[]
  ): Promise<string> {
    const SparkMD5 = (await import('spark-md5' as string)).default
    const spark = new SparkMD5.ArrayBuffer()

    for (let i = 0; i < chunks.length; i++) {
      const buffer = await chunks[i].arrayBuffer() // eslint-disable-line no-await-in-loop
      spark.append(buffer)
      hashProgress.value = Math.round(((i + 1) / chunks.length) * 100)
    }

    hashing.value = false
    return spark.end()
  }

  return {
    /** 是否正在计算 hash */
    hashing: readonly(hashing),
    /** 哈希计算进度（0-100） */
    hashProgress: readonly(hashProgress),
    /** 计算文件 hash */
    calculateHash,
  }
}
