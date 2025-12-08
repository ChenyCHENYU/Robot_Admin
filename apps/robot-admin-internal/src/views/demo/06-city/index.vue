<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-30 08:36:17
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 19:15:42
 * @FilePath: \Robot_Admin\src\views\demo\06-city\index.vue
 * @Description: 城市选择器组件场景示例
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="city-demo-page">
    <NH1>城市选择器组件场景示例</NH1>

    <NGrid
      :cols="2"
      :x-gap="16"
      :y-gap="16"
      responsive="screen"
    >
      <!-- 场景1: 默认样式 -->
      <NGridItem>
        <NCard
          hoverable
          :bordered="false"
          class="demo-card"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">默认触发器</span>
              <NTag
                type="info"
                size="small"
                >基础用法</NTag
              >
            </div>
          </template>

          <NSpace
            vertical
            :size="16"
          >
            <NText depth="2">
              最基础的城市选择器，适用于大多数场景，支持搜索和分类切换
            </NText>

            <C_City v-model="city1" />

            <NAlert
              v-if="city1"
              type="success"
              :bordered="false"
            >
              <template #icon>
                <span class="i-mdi:city" />
              </template>
              已选择: {{ city1 }}
            </NAlert>
          </NSpace>
        </NCard>
      </NGridItem>

      <!-- 场景2: 输入框样式 -->
      <NGridItem>
        <NCard
          hoverable
          :bordered="false"
          class="demo-card"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">输入框触发器</span>
              <NTag
                type="warning"
                size="small"
              >
                表单场景
              </NTag>
            </div>
          </template>

          <NSpace
            vertical
            :size="16"
          >
            <NText depth="2">
              适用于表单场景，与其他输入框保持一致的视觉风格
            </NText>

            <C_City v-model="city2">
              <template #trigger="{ value }">
                <NInput
                  :value="value"
                  placeholder="请选择配送城市"
                  readonly
                  size="large"
                >
                  <template #prefix>
                    <NIcon :size="18">
                      <span class="i-mdi:city-switch" />
                    </NIcon>
                  </template>
                </NInput>
              </template>
            </C_City>

            <NAlert
              v-if="city2"
              type="warning"
              :bordered="false"
            >
              <template #icon>
                <span class="i-mdi:truck-delivery-outline" />
              </template>
              配送至: {{ city2 }}
            </NAlert>
          </NSpace>
        </NCard>
      </NGridItem>

      <!-- 场景3: 按钮样式 -->
      <NGridItem>
        <NCard
          hoverable
          :bordered="false"
          class="demo-card"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">按钮触发器</span>
              <NTag
                type="success"
                size="small"
                >操作场景</NTag
              >
            </div>
          </template>

          <NSpace
            vertical
            :size="16"
          >
            <NText depth="2"> 适用于操作栏或工具栏，突出操作意图 </NText>

            <NSpace>
              <C_City v-model="city3">
                <template #trigger="{ value }">
                  <NButton
                    type="primary"
                    size="small"
                  >
                    <template #icon>
                      <NIcon>
                        <span class="i-mdi:city-switch" />
                      </NIcon>
                    </template>
                    {{ value || '选择城市' }}
                  </NButton>
                </template>
              </C_City>

              <NButton
                @click="city3 = ''"
                :disabled="!city3"
                size="small"
              >
                清除
              </NButton>
            </NSpace>

            <NAlert
              v-if="city3"
              type="success"
              :bordered="false"
            >
              <template #icon>
                <span class="i-mdi:city" />
              </template>
              已选择: {{ city3 }}
            </NAlert>
          </NSpace>
        </NCard>
      </NGridItem>

      <!-- 场景4: 标签样式 -->
      <NGridItem>
        <NCard
          hoverable
          :bordered="false"
          class="demo-card"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">标签触发器</span>
              <NTag
                type="error"
                size="small"
                >状态展示</NTag
              >
            </div>
          </template>

          <NSpace
            vertical
            :size="16"
          >
            <NText depth="2">
              适用于状态展示，可以清晰地显示当前选择状态
            </NText>

            <NSpace>
              <C_City v-model="city4">
                <template #trigger="{ value }">
                  <NTag
                    :type="value ? 'info' : 'default'"
                    size="large"
                    round
                    style="cursor: pointer"
                    :closable="!!value"
                    @close="city4 = ''"
                  >
                    <template #icon>
                      <NIcon>
                        <span
                          class="i-mdi:city-switch size-16px vertical--2%"
                        />
                      </NIcon>
                    </template>
                    {{ value || '未选择城市' }}
                  </NTag>
                </template>
              </C_City>
            </NSpace>

            <NAlert
              v-if="city4"
              type="info"
              :bordered="false"
            >
              当前城市标签: {{ city4 }}
            </NAlert>
          </NSpace>
        </NCard>
      </NGridItem>

      <!-- 场景5: 文本链接样式 -->
      <NGridItem>
        <NCard
          hoverable
          :bordered="false"
          class="demo-card"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">文本链接触发器</span>
              <NTag
                type="default"
                size="small"
                >内联场景</NTag
              >
            </div>
          </template>

          <NSpace
            vertical
            :size="16"
          >
            <NText depth="2"> 适用于文本内容中的内联选择，不破坏文本流 </NText>

            <NText>
              <span>您当前的位置是</span>
              <C_City v-model="city5">
                <template #trigger="{ value }">
                  <NButton
                    text
                    type="info"
                    style="padding: 0 4px"
                  >
                    <template #icon>
                      <NIcon size="14">
                        <span class="i-mdi:city-switch" />
                      </NIcon>
                    </template>
                    {{ value || '点击选择' }}
                  </NButton>
                </template>
              </C_City>
              <span>，我们将为您提供本地化服务</span>
            </NText>

            <NAlert
              v-if="city5"
              type="default"
              :bordered="false"
            >
              <span class="i-mdi:city vertical--10%"></span>
              服务地区: {{ city5 }}
            </NAlert>
          </NSpace>
        </NCard>
      </NGridItem>

      <!-- 场景6: 表格集成 -->
      <NGridItem>
        <NCard
          hoverable
          :bordered="false"
          class="demo-card"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">表格集成</span>
              <NTag
                type="info"
                size="small"
                >数据场景</NTag
              >
            </div>
          </template>

          <NSpace
            vertical
            :size="16"
          >
            <NText depth="2"> 适用于表格或列表中的城市选择，紧凑且高效 </NText>

            <NTable
              :bordered="false"
              :single-line="false"
            >
              <thead>
                <tr>
                  <th>信息项</th>
                  <th>内容</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>收货地址</td>
                  <td>
                    <NTag
                      v-if="city6"
                      type="success"
                      >{{ city6 }}</NTag
                    >
                    <NText
                      v-else
                      depth="3"
                      >未设置</NText
                    >
                  </td>
                  <td>
                    <C_City v-model="city6">
                      <template #trigger="{ value }">
                        <NButton
                          text
                          type="primary"
                          size="small"
                        >
                          {{ value ? '修改' : '设置' }}
                        </NButton>
                      </template>
                    </C_City>
                  </td>
                </tr>
              </tbody>
            </NTable>
          </NSpace>
        </NCard>
      </NGridItem>

      <!-- 场景7: 纯下拉选择 -->
      <NGridItem>
        <NCard
          hoverable
          :bordered="false"
          class="demo-card"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">原生下拉选择</span>
              <NTag
                type="warning"
                size="small"
                >简单场景</NTag
              >
            </div>
          </template>

          <NSpace
            vertical
            :size="16"
          >
            <NText depth="2">
              使用原生 Select 组件，适用于简单快速的选择场景
            </NText>

            <NSelect
              v-model:value="city7"
              :options="cityOptions"
              placeholder="请选择城市"
              filterable
              clearable
              size="large"
            />

            <NAlert
              v-if="city7"
              type="warning"
              :bordered="false"
            >
              <template #icon>
                <span class="i-mdi:city-switch" />
              </template>
              快速选择: {{ city7 }}
            </NAlert>
          </NSpace>
        </NCard>
      </NGridItem>

      <!-- 场景8: 自定义复杂触发器 -->
      <NGridItem>
        <NCard
          hoverable
          :bordered="false"
          class="demo-card"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">自定义卡片触发器</span>
              <NTag
                type="success"
                size="small"
                >高级用法</NTag
              >
            </div>
          </template>

          <NSpace
            vertical
            :size="16"
          >
            <NText depth="2">
              完全自定义的触发器样式，展示组件的扩展能力
            </NText>

            <C_City v-model="city8">
              <template #trigger="{ value }">
                <NCard
                  size="small"
                  style="cursor: pointer"
                  hoverable
                  :bordered="false"
                  class="custom-trigger-card"
                >
                  <NSpace
                    align="center"
                    :size="12"
                  >
                    <NAvatar
                      :size="40"
                      :style="{
                        backgroundColor: value ? '#1890ff' : '#f0f0f0',
                        color: value ? '#fff' : '#999',
                      }"
                    >
                      <NIcon :size="24">
                        <span class="i-mdi:city-switch" />
                      </NIcon>
                    </NAvatar>
                    <div>
                      <NText
                        style="font-size: 12px"
                        depth="3"
                        >配送地址
                      </NText>
                      <NText strong>{{ value || '点击选择城市' }}</NText>
                    </div>
                  </NSpace>
                </NCard>
              </template>
            </C_City>
          </NSpace>
        </NCard>
      </NGridItem>
    </NGrid>

    <!-- 使用说明 -->
    <NCard
      style="margin-top: 24px"
      :bordered="false"
    >
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <NIcon style="margin-right: 8px">
              <span class="i-mdi:information-box" />
            </NIcon>
            使用说明
          </span>
        </div>
      </template>

      <NGrid
        :cols="3"
        :x-gap="16"
      >
        <NGridItem>
          <NList>
            <NListItem>
              <NThing title="组件引入">
                <template #description>
                  <NCode
                    code="import C_City from '@/components/C_City.vue'"
                    language="typescript"
                  />
                </template>
              </NThing>
            </NListItem>
          </NList>
        </NGridItem>

        <NGridItem>
          <NList>
            <NListItem>
              <NThing title="基础用法">
                <template #description>
                  <NCode
                    code="<C_City v-model='city' />"
                    language="html"
                  />
                </template>
              </NThing>
            </NListItem>
          </NList>
        </NGridItem>

        <NGridItem>
          <NList>
            <NListItem>
              <NThing title="自定义触发器">
                <template #description>
                  <NCode
                    code="<template #trigger='{ value }'>...</template>"
                    language="html"
                  />
                </template>
              </NThing>
            </NListItem>
          </NList>
        </NGridItem>
      </NGrid>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import { type SelectOption } from 'naive-ui/es/select'
  import provinceData from '@/assets/data/province.json'

  // 各种样式的数据
  const city1 = ref('')
  const city2 = ref('')
  const city3 = ref('')
  const city4 = ref('')
  const city5 = ref('')
  const city6 = ref('')
  const city7 = ref('')
  const city8 = ref('')

  // 为纯下拉选择准备选项
  const cityOptions = computed(() => {
    const options: SelectOption[] = []
    Object.values(provinceData).forEach(provinces => {
      provinces.forEach(province => {
        options.push({
          type: 'group',
          label: province.name,
          key: province.id || province.name,
          children: province.data.map(city => ({
            label: city,
            value: city,
          })),
        })
      })
    })
    return options
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
