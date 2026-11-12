/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\views\production-sales\production-matrix\report.ts
 * @Description: 以同一检测记录快照导出文件和打印，保持数字、空值和时间口径一致
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { reportCsv, type MatrixReport } from './model'

/** 下载后释放临时 URL，不保留全局对象或弹窗引用。 */
export function downloadReportCsv(report: MatrixReport): void {
  const url = URL.createObjectURL(
    new Blob([reportCsv(report)], { type: 'text/csv;charset=utf-8' })
  )
  const link = document.createElement('a')
  link.href = url
  link.download = '酸洗检测记录.csv'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** 复用既有文件包，只有点击导出时加载 Excel 引擎；不把复合值拼成字符串。 */
export async function downloadReportXlsx(report: MatrixReport): Promise<void> {
  const { useExcel } = await import('@robot-admin/file-utils/excel')
  await useExcel().exportToExcel(report, {
    fileName: '酸洗检测记录.xlsx',
    sheetName: '检测明细',
    formulaPolicy: 'escape',
    maxRows: 5000,
    maxColumns: 20,
    autoFitColumns: true,
  })
}

/** 安全文本节点构造完整报告，打印不依赖屏幕虚拟行或当前横向滚动位置。 */
export function printReport(report: MatrixReport): boolean {
  const popup = window.open('', '_blank', 'width=1100,height=760')
  if (!popup) return false
  popup.opener = null
  const doc = popup.document
  doc.title = '酸洗检测记录'
  const style = doc.createElement('style')
  style.textContent =
    '@page{size:A4 landscape;margin:10mm}body{font:11px system-ui;color:#26354c}h1{font-size:18px;margin:0 0 8px}p{color:#68778b}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{padding:5px 7px;border:1px solid #dce3ed;text-align:center}th{background:#edf3fc}thead{display:table-header-group}tr{break-inside:avoid}'
  const title = doc.createElement('h1')
  title.textContent = '酸洗检测记录'
  const context = doc.createElement('p')
  context.textContent = `本地业务演示 · ${report.length} 条检测记录 · ${report[0]?.日期 ?? ''} 至 ${report.at(-1)?.日期 ?? ''}`
  const table = doc.createElement('table')
  const head = table.createTHead().insertRow()
  Object.keys(report[0] ?? {}).forEach(label => {
    const th = doc.createElement('th')
    th.textContent = label
    head.append(th)
  })
  const body = table.createTBody()
  report.forEach(record => {
    const tr = body.insertRow()
    Object.values(record).forEach(value => {
      tr.insertCell().textContent = value === null ? '—' : String(value)
    })
  })
  doc.head.append(style)
  doc.body.append(title, context, table)
  popup.focus()
  popup.print()
  return true
}
