/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\33-v-table-gantt\\customRendering.ts
 * @Description: 甘特示例的任务单元、任务条、时间轴自绘及对应选项
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { VRender } from '@visactor/vtable-gantt'
import {
  appendGanttGroup,
  type GanttOptions,
  type GanttTaskBarLayout,
  type GanttTaskCellLayout,
  type GanttTimelineLayout,
} from '@robot-admin/naive-ui-components/C_VtableGantt'
import {
  DATE_CONSTANTS,
  GANTT_COLORS,
  LAYOUT_CONSTANTS,
  type DemoGanttTask,
} from './data'

// 任务单元格自定义布局
const createTaskCellLayout =
  (barColors: string[]): GanttTaskCellLayout<DemoGanttTask> =>
  args => {
    const { table, row, col, rect } = args
    const taskRecord = table.getCellOriginRecord(col, row)
    const { height, width } = rect ?? table.getCellRect(col, row)
    const container = new VRender.Group({
      y: 10,
      x: 20,
      height: height - 20,
      width: width - 40,
      fill: 'white',
      display: 'flex',
      flexDirection: 'column',
      cornerRadius: 30,
    })

    if (!taskRecord) {
      return { rootContainer: container, renderDefault: true }
    }

    container.add(
      new VRender.Text({
        text: taskRecord.developer,
        fontSize: 16,
        fontFamily: 'sans-serif',
        fill: barColors[args.row % barColors.length],
        fontWeight: 'bold',
        maxLineWidth: width - 120,
        boundsPadding: [10, 0, 0, 0],
        alignSelf: 'center',
      })
    )

    container.add(
      new VRender.Text({
        text: `${new Date(taskRecord.start).toLocaleDateString()}-${new Date(taskRecord.end ?? taskRecord.start).toLocaleDateString()}`,
        fontSize: 12,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fill: 'black',
        boundsPadding: [10, 0, 0, 0],
        alignSelf: 'center',
      })
    )

    return { rootContainer: container, expectedWidth: 160 }
  }

// 任务条自定义布局
const createTaskBarLayout =
  (
    barColors0: string[],
    barColors: string[]
  ): GanttTaskBarLayout<DemoGanttTask> =>
  args => {
    const { width, height, index, taskDays, progress, taskRecord } = args
    const colorLength = barColors.length
    const container = new VRender.Group({
      width,
      height,
      cornerRadius: 30,
      fill: {
        gradient: 'linear',
        x0: 0,
        y0: 0,
        x1: 1,
        y1: 0,
        stops: [
          { offset: 0, color: barColors0[index % colorLength] },
          { offset: 0.5, color: barColors[index % colorLength] },
          { offset: 1, color: barColors0[index % colorLength] },
        ],
      },
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
    })

    // 左侧头像
    const containerLeft = new VRender.Group({
      height,
      width: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-around',
    })
    containerLeft.add(
      new VRender.Image({
        width: 50,
        height: 50,
        image: taskRecord.avatar,
        cornerRadius: 25,
      })
    )
    appendGanttGroup(container, containerLeft)

    // 中间信息
    const containerCenter = new VRender.Group({
      height,
      width: width - (width >= 120 ? 120 : 60),
      display: 'flex',
      flexDirection: 'column',
    })

    containerCenter.add(
      new VRender.Text({
        text: taskRecord.developer,
        fontSize: 16,
        fontFamily: 'sans-serif',
        fill: 'white',
        fontWeight: 'bold',
        maxLineWidth: width - (width >= 120 ? 120 : 60),
        boundsPadding: [10, 0, 0, 0],
      })
    )

    containerCenter.add(
      new VRender.Text({
        text: `${taskDays || 1}天`,
        fontSize: 13,
        fontFamily: 'sans-serif',
        fill: 'white',
        boundsPadding: [10, 0, 0, 0],
      })
    )
    appendGanttGroup(container, containerCenter)

    // 右侧进度
    if (width >= 120) {
      const containerRight = new VRender.Group({
        cornerRadius: 20,
        fill: 'white',
        height: 40,
        width: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boundsPadding: [10, 0, 0, 0],
      })
      containerRight.add(
        new VRender.Text({
          text: `${progress || 0}%`,
          fontSize: 12,
          fontFamily: 'sans-serif',
          fill: 'black',
          alignSelf: 'center',
          fontWeight: 'bold',
          maxLineWidth: (width - 60) / 2,
          boundsPadding: [0, 0, 0, 0],
        })
      )
      appendGanttGroup(container, containerRight)
    }

    return { rootContainer: container }
  }

// 时间轴头部自定义布局
const createTimelineLayout = (): GanttTimelineLayout => args => {
  const { width, height, dateIndex } = args
  const container = new VRender.Group({
    width,
    height,
    fill: '#f0f0fb',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  })

  const containerLeft = new VRender.Group({
    height,
    width: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
  })
  containerLeft.add(new VRender.Text({ text: '📅', fontSize: 16 }))
  appendGanttGroup(container, containerLeft)

  const containerCenter = new VRender.Group({
    height,
    width: width - 30,
    display: 'flex',
    flexDirection: 'column',
  })
  containerCenter.add(
    new VRender.Text({
      text: String(dateIndex).padStart(2, '0'),
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: 'sans-serif',
      fill: 'black',
      textAlign: 'right',
      maxLineWidth: width - 30,
      boundsPadding: [15, 0, 0, 0],
    })
  )
  appendGanttGroup(container, containerCenter)

  return { rootContainer: container }
}

/** 每个页面实例独立持有图表选项，以便第三方画布引擎调整配置。 */
export const createCustomGanttOptions = (): GanttOptions<DemoGanttTask> => ({
  overscrollBehavior: 'none',
  headerRowHeight: LAYOUT_CONSTANTS.HEADER_ROW_HEIGHT,
  rowHeight: LAYOUT_CONSTANTS.ROW_HEIGHT,
  minDate: DATE_CONSTANTS.PROJECT_START,
  maxDate: DATE_CONSTANTS.PROJECT_END,
  taskListTable: {
    columns: [
      {
        field: 'title',
        title: 'TASK',
        width: LAYOUT_CONSTANTS.TASK_COLUMN_WIDTH,
        headerStyle: {
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          color: 'black',
          bgColor: GANTT_COLORS.BACKGROUND,
        },
        style: { bgColor: GANTT_COLORS.BACKGROUND },
        customLayout: createTaskCellLayout(GANTT_COLORS.BAR_DARK),
      },
    ],
    tableWidth: 'auto',
    theme: {
      headerStyle: {
        borderColor: GANTT_COLORS.BORDER,
        borderLineWidth: 0,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
      },
      bodyStyle: {
        borderColor: GANTT_COLORS.BORDER,
        borderLineWidth: 0,
        fontSize: 16,
        color: '#4D4D4D',
        bgColor: '#FFF',
      },
    },
  },
  frame: {
    outerFrameStyle: {
      borderLineWidth: 0,
      borderColor: 'red',
      cornerRadius: 8,
    },
  },
  grid: {
    backgroundColor: GANTT_COLORS.BACKGROUND,
    horizontalLine: {
      lineWidth: 2,
      lineColor: GANTT_COLORS.GRID_LINE,
    },
  },
  taskBar: {
    startDateField: 'start',
    endDateField: 'end',
    progressField: 'progress',
    barStyle: { width: LAYOUT_CONSTANTS.TASK_BAR_WIDTH },
    customLayout: createTaskBarLayout(
      GANTT_COLORS.BAR_LIGHT,
      GANTT_COLORS.BAR_DARK
    ),
  },
  timelineHeader: {
    backgroundColor: GANTT_COLORS.BACKGROUND,
    colWidth: LAYOUT_CONSTANTS.TIMELINE_COL_WIDTH,
    scales: [
      {
        unit: 'day',
        step: 1,
        format: date => date.dateIndex.toString(),
        customLayout: createTimelineLayout(),
      },
    ],
  },
  markLine: [
    {
      date: '2024-07-29',
      style: { lineWidth: 1, lineColor: 'blue', lineDash: [8, 4] },
    },
    {
      date: '2024-08-17',
      style: { lineWidth: 2, lineColor: 'red', lineDash: [8, 4] },
    },
  ],
  scrollStyle: {
    scrollRailColor: 'RGBA(246,246,246,0.5)',
    visible: 'focus',
    width: 6,
    scrollSliderCornerRadius: 2,
    scrollSliderColor: '#5cb85c',
  },
})
