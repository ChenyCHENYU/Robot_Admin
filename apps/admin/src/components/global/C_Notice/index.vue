<template>
  <!-- 通知组件容器 -->
  <div class="notification-container">
    <!-- 通知弹出框 -->
    <NPopover
      :width="320"
      trigger="click"
      class="notification-popover"
    >
      <!-- 触发按钮 -->
      <template #trigger>
        <NTooltip
          trigger="hover"
          placement="bottom"
        >
          <template #trigger>
            <div
              class="notification-icon i-mdi:bell-outline w16px h16px vertical--6%"
            ></div>
          </template>
          消息通知
        </NTooltip>
      </template>

      <!-- 弹出内容 -->
      <div class="notification-content">
        <!-- 标签页组件 -->
        <NTabs
          v-model="activeTab"
          type="line"
          class="notification-tabs"
        >
          <!-- 标签页内容 -->
          <NTabPane
            v-for="(item, index) in LIST"
            :key="index"
            :name="index.toString()"
            :tab="item.title"
          >
            <!-- 滚动区域 -->
            <NScrollbar max-height="350px">
              <!-- 通知项列表 -->
              <div
                v-for="(item1, index1) in item.content"
                :key="index1"
                class="notification-item"
                @click="clickItem(item1, index1)"
              >
                <!-- 头像区域 -->
                <div
                  v-if="hasAvatar(item1)"
                  class="notification-avatar"
                >
                  <NAvatar
                    size="small"
                    :src="item1.avatar"
                  />
                </div>

                <!-- 内容详情区域 -->
                <div class="notification-details">
                  <!-- 标题和标签行 -->
                  <div class="notification-header">
                    <div
                      v-if="item1.title"
                      class="notification-title"
                    >
                      {{ item1.title }}
                    </div>
                    <NTag
                      v-if="hasTag(item1)"
                      size="small"
                      :type="item1.tagType || 'info'"
                      class="notification-tag"
                    >
                      {{ item1.tag }}
                    </NTag>
                  </div>

                  <!-- 描述文本 -->
                  <div
                    v-if="hasDesc(item1)"
                    class="notification-desc"
                  >
                    {{ item1.desc }}
                  </div>

                  <!-- 时间信息 -->
                  <div
                    v-if="hasTime(item1)"
                    class="notification-time"
                  >
                    {{ item1.time }}
                  </div>
                </div>
              </div>

              <!-- 底部操作区域 -->
              <div class="notification-actions">
                <div
                  v-for="(item, i) in ACTIONS"
                  :key="i"
                  class="action-item"
                  :class="{ 'action-divider': i !== ACTIONS.length - 1 }"
                  @click="clickAction(item, i)"
                >
                  <!-- 操作图标 -->
                  <span :class="[item.icon, 'mr-4px']"> </span>
                  <!-- 操作文本 -->
                  <span class="action-text">{{ item.text }}</span>
                </div>
              </div>
            </NScrollbar>
          </NTabPane>
        </NTabs>
      </div>
    </NPopover>
  </div>
</template>

<script setup lang="ts">
  /**
   * 类型定义
   */
  // 通知项类型：包含标题、时间和头像
  type NoticeItem = {
    title: string
    time: string
    avatar: string
  }

  // 关注项类型：包含头像、标题、描述和时间
  type FollowItem = {
    avatar: string
    title: string
    desc: string
    time: string
  }

  // 待办项类型：包含标题、描述、标签和标签类型
  type TodoItem = {
    title: string
    desc: string
    tag: string
    tagType: 'success' | 'warning' | 'error' | 'info' | ''
  }

  // 内容项类型：可以是通知、关注或待办项
  type ContentItem = NoticeItem | FollowItem | TodoItem

  // 列表项类型：包含标题和内容数组
  type ListItem = {
    title: string
    content: ContentItem[]
  }

  // 操作项类型：包含文本和图标
  type ActionItem = {
    text: string
    icon: string
  }

  /**
   * 类型守卫函数：用于检查内容项的具体类型
   */
  // 检查是否包含头像
  const hasAvatar = (item: ContentItem): item is NoticeItem | FollowItem =>
    'avatar' in item

  // 检查是否包含标签
  const hasTag = (item: ContentItem): item is TodoItem => 'tag' in item

  // 检查是否包含描述
  const hasDesc = (item: ContentItem): item is FollowItem | TodoItem =>
    'desc' in item

  // 检查是否包含时间
  const hasTime = (item: ContentItem): item is NoticeItem | FollowItem =>
    'time' in item

  /**
   * 事件处理函数
   */
  // 点击内容项
  const clickItem = (item: ContentItem, index: number) =>
    console.info('点击 item:', item, 'index:', index)

  // 点击操作按钮
  const clickAction = (item: ActionItem, index: number) =>
    console.info('点击 action:', item, 'index:', index)

  /**
   * 数据定义
   */
  // 通知列表数据
  // 通知列表数据：包含通知、关注和待办三个部分
  const LIST: ListItem[] = [
    // 通知部分
    {
      title: '通知',
      content: [
        {
          title: 'LiLi 回复了你的邮件',
          time: '2022-05-08 14:33:18',
          avatar:
            'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
        },
        {
          title: '超越老贼邀请你参加会议',
          time: '2022-05-18 15:13:28',
          avatar:
            'https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png',
        },
        {
          title: 'CHENY 已批准了你的休假申请',
          time: '2022-06-11 17:12:39',
          avatar:
            'https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png',
        },
      ],
    },
    // 关注部分
    {
      title: '关注',
      content: [
        {
          avatar:
            'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
          title: '赵成刚 评论了你',
          desc: '跟着 Cheny 有肉吃',
          time: '1小时前',
        },
        {
          avatar:
            'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
          title: '张东 评论了你',
          desc: 'Hey，Cheny，敢不敢跟我一样肝?',
          time: '3小时前',
        },
        {
          avatar:
            'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
          title: '小马哥 评论了你',
          desc: '来，喊上 Airs，把内谁大腿烤了我们一起吃',
          time: '6小时前',
        },
      ],
    },
    // 待办部分
    {
      title: '待办',
      content: [
        {
          title: '嘉为蓝鲸',
          desc: '任务需要在 2022-12-21 20:00 前启动',
          tag: '未开始',
          tagType: 'info', // 蓝色背景
        },
        {
          title: 'Code Review',
          desc: '伟伟提交于 2022-12-1，需在 2022-12-10 前完成代码变更任务',
          tag: '马上到期',
          tagType: 'error', // 红色背景
        },
        {
          title: '年终答辩',
          desc: '协同部门 2022-12-17 前完成答辩PPT准备',
          tag: '已耗时0天',
          tagType: 'warning', // 黄色背景
        },
      ],
    },
  ]

  // 底部操作按钮列表
  const ACTIONS: ActionItem[] = [
    { text: '清空代办', icon: 'i-mdi:delete-outline' }, // 清空按钮
    { text: '查看更多', icon: 'i-mdi:database-view-outline' }, // 查看更多按钮
  ]

  // 当前激活的标签页
  const activeTab = ref('0')
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
