// scripts/download-openapi.js
import fs from 'fs'
import { performance } from 'perf_hooks'

const APIFOX_LOCAL_URL = 'http://127.0.0.1:4523/export/openapi/2?version=3.0'
const OUTPUT_FILE = './openapi.json'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
}

// 完全禁用警告输出
process.emitWarning = () => {} // 屏蔽所有警告

// 同时屏蔽 stderr 中的警告
const originalStderrWrite = process.stderr.write
process.stderr.write = function (chunk, encoding, callback) {
  const str = chunk.toString()
  // 过滤掉 Node.js 模块类型警告
  if (
    str.includes('MODULE_TYPELESS_PACKAGE_JSON') ||
    str.includes('module syntax was detected') ||
    str.includes('add "type": "module"')
  ) {
    return true
  }
  return originalStderrWrite.call(this, chunk, encoding, callback)
}

// 获取项目版本信息
function getProjectVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
    return packageJson.version || null
  } catch  {
    return null
  }
}

async function downloadOpenAPI() {
  const startTime = performance.now()

  try {
    console.log(
      `${colors.cyan}${colors.bright}🚀 正在从 Apifox 下载 OpenAPI 文档...${colors.reset}`
    )
    console.log(`${colors.gray}   📡 ${APIFOX_LOCAL_URL}${colors.reset}`)

    const response = await fetch(APIFOX_LOCAL_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Apifox-OpenAPI-Generator/1.0.0',
        'Cache-Control': 'no-cache',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.text()

    if (data.trim().startsWith('<')) {
      throw new Error('服务器返回HTML页面，请检查 Apifox 服务状态')
    }

    let jsonData
    try {
      jsonData = JSON.parse(data)
    } catch {
      fs.writeFileSync('./debug-response.txt', data, 'utf8')
      throw new Error('响应内容不是有效的JSON格式，已保存调试文件')
    }

    if (!jsonData.openapi && !jsonData.swagger) {
      throw new Error('响应不符合 OpenAPI 规范格式')
    }

    // 保存文件
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jsonData, null, 2), 'utf8')

    // 计算耗时
    const duration = Math.round(performance.now() - startTime)
    const fileSize = fs.statSync(OUTPUT_FILE).size

    // 获取项目版本（优先使用 package.json 中的版本）
    const projectVersion = getProjectVersion() || jsonData.info?.version
    const projectName = jsonData.info?.title || '未知项目'

    // 简洁的成功信息
    console.log(
      `${colors.green}✅ 下载完成${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`
    )
    console.log(
      `${colors.blue}📋 ${projectName}${colors.reset}${projectVersion ? ` ${colors.gray}v${projectVersion}${colors.reset}` : ''}`
    )
    console.log(
      `${colors.cyan}📊 ${Object.keys(jsonData.paths || {}).length} 个接口${colors.reset} ${colors.gray}• ${Math.round(fileSize / 1024)}KB${colors.reset}`
    )
    console.log(
      `${colors.yellow}🔍 查看生成的类型定义: ${colors.bright}src/api/generated/${colors.reset}`
    )
  } catch {
    const duration = Math.round(performance.now() - startTime)

    console.log(
      `${colors.red}❌ 下载失败${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`
    )
    console.log(`${colors.red}   ${error.message}${colors.reset}`)

    console.log(`\n${colors.yellow}💡 解决方案:${colors.reset}`)
    console.log(
      `${colors.gray}   • 确保 Apifox 正在运行且项目已打开${colors.reset}`
    )
    console.log(
      `${colors.gray}   • 在浏览器访问: ${APIFOX_LOCAL_URL}${colors.reset}`
    )
    console.log(
      `${colors.gray}   • 手动导出: 项目设置 → 数据管理 → 导出 OpenAPI 3.0${colors.reset}`
    )

    process.exit(1)
  }
}

// 超时控制
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('请求超时，请检查 Apifox 服务状态')), 8000)
})

Promise.race([downloadOpenAPI(), timeoutPromise]).catch(error => {
  console.log(`${colors.red}❌ ${error.message}${colors.reset}`)
  process.exit(1)
})
