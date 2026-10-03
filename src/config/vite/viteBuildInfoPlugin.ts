/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-03
 * @FilePath: \Robot_Admin\src\config\vite\viteBuildInfoPlugin.ts
 * @Description: 生成不含运行时配置和敏感环境变量的构建身份卡
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */

import { execFileSync } from 'node:child_process'
import type { Plugin } from 'vite'
import packageJson from '../../../package.json' with { type: 'json' }
import type { ValidatedViteEnv } from './viteEnvConfig.ts'

interface BuildProvenance {
  branch: string | null
  commitSha: string | null
  dirty: boolean | null
  pipelineId: string | null
}

const BUILD_INFO_FILE = 'build-info.json'

const safeLabel = (value: string | undefined): string | null => {
  const label = value?.trim().slice(0, 120)
  return label && /^[\w./-]+$/.test(label) ? label : null
}

const safeSha = (value: string | undefined): string | null => {
  const sha = value?.trim()
  return sha && /^[a-f\d]{40,64}$/i.test(sha) ? sha : null
}

const readGit = (args: string[]): string | null => {
  try {
    return execFileSync('git', args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 2000,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return null
  }
}

const getBuildProvenance = (): BuildProvenance => {
  const branch = safeLabel(
    process.env.VERCEL_GIT_COMMIT_REF ||
      process.env.GITHUB_REF_NAME ||
      readGit(['branch', '--show-current']) ||
      undefined
  )
  const commitSha = safeSha(
    process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GITHUB_SHA ||
      readGit(['rev-parse', 'HEAD']) ||
      undefined
  )
  const gitStatus = readGit(['status', '--porcelain'])
  return {
    branch,
    commitSha,
    dirty: gitStatus === null ? null : gitStatus.length > 0,
    pipelineId: safeLabel(
      process.env.VERCEL_DEPLOYMENT_ID || process.env.GITHUB_RUN_ID
    ),
  }
}

/** 仅白名单字段可进入公网文件；不读取或序列化 API、令牌与原始环境变量。 */
export const createBuildInfo = (
  env: ValidatedViteEnv,
  provenance: BuildProvenance,
  builtAt: string | null
) => ({
  schemaVersion: 1,
  application: {
    id: packageJson.name,
    name: 'Robot Admin',
    version: packageJson.version,
  },
  build: {
    environment: env.appEnv,
    deploymentProfile: env.deploymentProfile,
    authMode: env.authMode,
    dataMode: env.dataMode,
    branch: provenance.branch,
    commitSha: provenance.commitSha,
    commitShort: provenance.commitSha?.slice(0, 8) ?? null,
    dirty: provenance.dirty,
    pipelineId: provenance.pipelineId,
    builtAt,
  },
})

export const createBuildInfoPlugin = (env: ValidatedViteEnv): Plugin => {
  const provenance = getBuildProvenance()
  return {
    name: 'robot-admin-build-info',
    /** 开发态按需提供身份卡，不伪造构建时间。 */
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const { pathname } = new URL(request.url ?? '/', 'http://localhost')
        if (pathname !== `${server.config.base}${BUILD_INFO_FILE}`) {
          next()
          return
        }
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader(
          'Cache-Control',
          'no-cache, no-store, must-revalidate'
        )
        response.end(
          JSON.stringify(createBuildInfo(env, provenance, null), null, 2)
        )
      })
    },
    /** 构建产物内固定写入本次构建的 UTC 时间。 */
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: BUILD_INFO_FILE,
        source: JSON.stringify(
          createBuildInfo(env, provenance, new Date().toISOString()),
          null,
          2
        ),
      })
    },
  }
}
