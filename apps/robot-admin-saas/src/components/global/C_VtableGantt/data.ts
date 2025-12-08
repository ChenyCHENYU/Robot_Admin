// 甘特图相关类型定义和预设配置

// ==================== 类型定义 ====================
export interface GanttTask {
  id: string | number
  title: string
  start: string | Date
  end?: string | Date
  progress?: number
  priority?: string
  type?: 'milestone' | 'task'
  children?: GanttTask[]
  [key: string]: any
}

export interface GanttOptions {
  [key: string]: any
}

export type GanttPreset =
  | 'basic'
  | 'project'
  | 'timeline'
  | 'milestone'
  | 'official'

// ==================== 通用主题配置 ====================
// 移除硬编码颜色，让背景透明以跟随系统主题
export const commonTheme = {
  headerStyle: {
    borderColor: 'rgba(128, 128, 128, 0.2)',
    borderLineWidth: 1,
    fontSize: 14,
    fontWeight: 'bold',
    // bgColor 留空或透明，自动跟随主题
  },
  bodyStyle: {
    borderColor: 'rgba(128, 128, 128, 0.2)',
    borderLineWidth: [1, 0, 1, 0],
    fontSize: 13,
    // bgColor 留空或透明，自动跟随主题
  },
}

// ==================== 预设配置 ====================
export const presetConfigs = {
  basic: {
    overscrollBehavior: 'none',
    headerRowHeight: 40,
    rowHeight: 40,
    taskListTable: {
      columns: [
        { field: 'title', title: '任务名称', width: 220, tree: true },
        { field: 'start', title: '开始时间', width: 120 },
        { field: 'end', title: '结束时间', width: 120 },
        { field: 'progress', title: '进度', width: 80 },
      ],
      tableWidth: 420,
      minTableWidth: 300,
      theme: commonTheme,
    },
    frame: {
      outerFrameStyle: {
        borderLineWidth: 1,
        borderColor: '#e1e4e8',
        cornerRadius: 6,
      },
      verticalSplitLineMoveable: true,
      verticalSplitLine: { lineColor: '#e1e4e8', lineWidth: 2 },
    },
    grid: {
      // 移除 weekendBackgroundColor，让它透明跟随主题
      verticalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
      horizontalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
    },
    taskBar: {
      startDateField: 'start',
      endDateField: 'end',
      progressField: 'progress',
      moveable: true,
      resizable: true,
      labelText: '{title}',
      labelTextStyle: { fontSize: 12, textAlign: 'left' },
      barStyle: {
        width: 18,
        barColor: '#1890ff',
        completedBarColor: '#52c41a',
        cornerRadius: 4,
        borderLineWidth: 0,
      },
      milestoneStyle: {
        borderColor: '#fa8c16',
        borderLineWidth: 1,
        fillColor: '#ffd666',
        width: 12,
      },
    },
    timelineHeader: {
      // 移除 backgroundColor，让它透明跟随主题
      colWidth: 60,
      horizontalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
      verticalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
      scales: [
        {
          unit: 'week',
          step: 1,
          format: (date: any) => `第${date.dateIndex}周`,
          style: { fontSize: 12, fontWeight: 'bold' },
        },
        {
          unit: 'day',
          step: 1,
          format: (date: any) => `${date.dateIndex}`,
          style: { fontSize: 11 },
        },
      ],
    },
    scrollStyle: {
      scrollRailColor: 'rgba(246,246,246,0.5)',
      visible: 'scrolling',
      width: 6,
      scrollSliderCornerRadius: 2,
      scrollSliderColor: '#1890ff',
    },
  },

  project: {
    overscrollBehavior: 'none',
    headerRowHeight: 40,
    rowHeight: 40,
    taskListTable: {
      columns: [
        {
          field: 'title',
          title: '任务名称',
          width: 200,
          tree: true,
          editor: 'input',
        },
        {
          field: 'start',
          title: '开始时间',
          width: 120,
          editor: 'date-input',
        },
        { field: 'end', title: '结束时间', width: 120, editor: 'date-input' },
        { field: 'priority', title: '优先级', width: 80, editor: 'input' },
        { field: 'progress', title: '进度%', width: 80, editor: 'input' },
      ],
      tableWidth: 480,
      minTableWidth: 350,
      maxTableWidth: 800,
      theme: commonTheme,
      hierarchyExpandLevel: 2,
    },
    frame: {
      outerFrameStyle: {
        borderLineWidth: 2,
        borderColor: '#e1e4e8',
        cornerRadius: 8,
      },
      verticalSplitLineMoveable: true,
      verticalSplitLine: { lineColor: '#e1e4e8', lineWidth: 3 },
    },
    grid: {
      verticalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
      horizontalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
    },
    taskBar: {
      startDateField: 'start',
      endDateField: 'end',
      progressField: 'progress',
      moveable: true,
      resizable: true,
      hoverBarStyle: { barOverlayColor: 'rgba(24, 144, 255, 0.3)' },
      labelText: '{title} {progress}%',
      labelTextStyle: {
        fontSize: 12,
        textAlign: 'left',
        textOverflow: 'ellipsis',
      },
      barStyle: {
        width: 20,
        barColor: '#1890ff',
        completedBarColor: '#52c41a',
        cornerRadius: 6,
        borderLineWidth: 0,
      },
    },
    timelineHeader: {
      colWidth: 60,
      horizontalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
      verticalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
      scales: [
        {
          unit: 'week',
          step: 1,
          startOfWeek: 'monday',
          format: (date: any) => `第${date.dateIndex}周`,
          style: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
        },
        {
          unit: 'day',
          step: 1,
          format: (date: any) => `${date.dateIndex}`,
          style: { fontSize: 11, textAlign: 'center' },
        },
      ],
    },
    rowSeriesNumber: {
      title: '序号',
      dragOrder: true,
      headerStyle: { borderColor: 'rgba(128, 128, 128, 0.2)' },
      style: { borderColor: 'rgba(128, 128, 128, 0.2)' },
    },
    scrollStyle: {
      scrollRailColor: 'rgba(246,246,246,0.5)',
      visible: 'scrolling',
      width: 6,
      scrollSliderCornerRadius: 2,
      scrollSliderColor: '#1890ff',
    },
  },

  timeline: {
    overscrollBehavior: 'none',
    headerRowHeight: 45,
    rowHeight: 40,
    taskListTable: {
      columns: [
        { field: 'title', title: '事件名称', width: 250, tree: true },
        { field: 'start', title: '时间', width: 150 },
      ],
      tableWidth: 400,
      minTableWidth: 300,
      theme: {
        headerStyle: { ...commonTheme.headerStyle },
        bodyStyle: commonTheme.bodyStyle,
      },
    },
    frame: {
      outerFrameStyle: {
        borderLineWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.3)',
        cornerRadius: 4,
      },
      verticalSplitLineMoveable: true,
    },
    grid: {
      verticalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
      horizontalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
    },
    taskBar: {
      startDateField: 'start',
      endDateField: 'end',
      progressField: 'progress',
      moveable: true,
      resizable: true,
      labelText: '{title}',
      labelTextStyle: { fontSize: 12, textAlign: 'left' },
      barStyle: {
        width: 22,
        barColor: '#722ed1',
        completedBarColor: '#b37feb',
        cornerRadius: 8,
        borderLineWidth: 0,
      },
    },
    timelineHeader: {
      colWidth: 60,
      scales: [
        {
          unit: 'month',
          step: 1,
          format: (date: any) => `${date.dateIndex}月`,
          style: { fontSize: 13, fontWeight: 'bold' },
        },
        {
          unit: 'day',
          step: 1,
          format: (date: any) => `${date.dateIndex}`,
          style: { fontSize: 11 },
        },
      ],
    },
    scrollStyle: {
      scrollRailColor: 'rgba(246,246,246,0.5)',
      visible: 'scrolling',
      width: 6,
      scrollSliderCornerRadius: 2,
      scrollSliderColor: '#1890ff',
    },
  },

  milestone: {
    overscrollBehavior: 'none',
    headerRowHeight: 40,
    rowHeight: 38,
    taskListTable: {
      columns: [
        { field: 'title', title: '里程碑', width: 200, tree: true },
        { field: 'start', title: '目标日期', width: 120 },
        { field: 'priority', title: '重要性', width: 100 },
      ],
      tableWidth: 400,
      minTableWidth: 300,
      theme: {
        headerStyle: {
          ...commonTheme.headerStyle,
          borderColor: '#ffa940',
        },
        bodyStyle: { ...commonTheme.bodyStyle, borderColor: '#ffa940' },
      },
    },
    frame: {
      outerFrameStyle: {
        borderLineWidth: 2,
        borderColor: '#ffa940',
        cornerRadius: 6,
      },
      verticalSplitLineMoveable: true,
    },
    grid: {
      verticalLine: { lineWidth: 1, lineColor: 'rgba(255, 168, 64, 0.3)' },
      horizontalLine: { lineWidth: 1, lineColor: 'rgba(255, 168, 64, 0.3)' },
    },
    taskBar: {
      startDateField: 'start',
      endDateField: 'start',
      labelText: '{title}',
      labelTextStyle: { fontSize: 12, fontWeight: 'bold' },
      barStyle: { width: 0, barColor: 'transparent' },
      milestoneStyle: {
        borderColor: '#fa8c16',
        borderLineWidth: 2,
        fillColor: '#ffd666',
        width: 16,
      },
    },
    timelineHeader: {
      colWidth: 80,
      scales: [
        {
          unit: 'month',
          step: 1,
          format: (date: any) => `${date.dateIndex}月`,
          style: { fontSize: 13, fontWeight: 'bold' },
        },
        {
          unit: 'week',
          step: 1,
          format: (date: any) => `第${date.dateIndex}周`,
          style: { fontSize: 11 },
        },
      ],
    },
    scrollStyle: {
      scrollRailColor: 'rgba(246,246,246,0.5)',
      visible: 'scrolling',
      width: 6,
      scrollSliderCornerRadius: 2,
      scrollSliderColor: '#1890ff',
    },
  },

  official: {
    overscrollBehavior: 'none',
    headerRowHeight: 40,
    rowHeight: 40,
    taskListTable: {
      columns: [
        {
          field: 'title',
          title: 'title',
          width: 180,
          sort: true,
          tree: true,
          editor: 'input',
        },
        {
          field: 'start',
          title: 'start',
          width: 120,
          sort: true,
          editor: 'date-input',
        },
        {
          field: 'end',
          title: 'end',
          width: 120,
          sort: true,
          editor: 'date-input',
        },
        {
          field: 'priority',
          title: 'priority',
          width: 80,
          sort: true,
          editor: 'input',
        },
        {
          field: 'progress',
          title: 'progress',
          width: 80,
          sort: true,
          editor: 'input',
        },
      ],
      tableWidth: 460,
      minTableWidth: 350,
      maxTableWidth: 800,
      theme: {
        headerStyle: {
          ...commonTheme.headerStyle,
          fontSize: 18,
          color: 'red',
        },
        bodyStyle: {
          ...commonTheme.bodyStyle,
          fontSize: 16,
          color: '#4D4D4D',
        },
      },
      hierarchyExpandLevel: 2,
    },
    frame: {
      outerFrameStyle: {
        borderLineWidth: 2,
        borderColor: '#e1e4e8',
        cornerRadius: 8,
      },
      verticalSplitLineMoveable: true,
      verticalSplitLine: { lineColor: '#e1e4e8', lineWidth: 3 },
      horizontalSplitLine: { lineColor: '#e1e4e8', lineWidth: 3 },
    },
    grid: {
      verticalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
      horizontalLine: { lineWidth: 1, lineColor: 'rgba(128, 128, 128, 0.2)' },
    },
    taskBar: {
      startDateField: 'start',
      endDateField: 'end',
      progressField: 'progress',
      moveable: true,
      resizable: true,
      hoverBarStyle: { barOverlayColor: 'rgba(99, 144, 0, 0.4)' },
      labelText: '{title} {progress}%',
      labelTextStyle: {
        fontSize: 16,
        textAlign: 'left',
        textOverflow: 'ellipsis',
      },
      barStyle: {
        width: 20,
        barColor: '#ee8800',
        completedBarColor: '#91e8e0',
        cornerRadius: 8,
        borderLineWidth: 1,
        borderColor: 'black',
      },
      milestoneStyle: {
        borderColor: 'red',
        borderLineWidth: 1,
        fillColor: 'green',
        width: 15,
      },
    },
    timelineHeader: {
      backgroundColor: '#EEF1F5',
      colWidth: 60,
      horizontalLine: { lineWidth: 1, lineColor: '#e1e4e8' },
      verticalLine: { lineWidth: 1, lineColor: '#e1e4e8' },
      scales: [
        {
          unit: 'week',
          step: 1,
          startOfWeek: 'sunday',
          format: (date: any) => `Week ${date.dateIndex}`,
          style: {
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            strokeColor: 'black',
            textAlign: 'right',
            textBaseline: 'bottom',
            textStick: true,
          },
        },
        {
          unit: 'day',
          step: 1,
          format: (date: any) => date.dateIndex.toString(),
          style: {
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            strokeColor: 'black',
            textAlign: 'right',
            textBaseline: 'bottom',
          },
        },
      ],
    },
    markLine: [
      {
        date: '2024-07-28',
        style: { lineWidth: 1, lineColor: 'blue', lineDash: [8, 4] },
      },
      {
        date: '2024-08-17',
        style: { lineWidth: 2, lineColor: 'red', lineDash: [8, 4] },
      },
    ],
    rowSeriesNumber: {
      title: '行号',
      dragOrder: true,
      headerStyle: { borderColor: 'rgba(128, 128, 128, 0.2)' },
      style: { borderColor: 'rgba(128, 128, 128, 0.2)' },
    },
    scrollStyle: {
      scrollRailColor: 'rgba(246,246,246,0.5)',
      visible: 'scrolling',
      width: 6,
      scrollSliderCornerRadius: 2,
      scrollSliderColor: '#1890ff',
    },
  },
}
