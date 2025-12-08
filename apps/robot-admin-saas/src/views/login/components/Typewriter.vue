<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-30 16:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-30 14:59:36
 * @FilePath: \Robot_Admin\src\views\login\components\Typewriter.vue
 * @Description: 打字机效果组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <Transition
    name="typewriter-fade"
    @after-leave="$emit('hidden')"
  >
    <div
      v-if="visible"
      class="typewriter-overlay"
    >
      <div class="typewriter-content">
        <h1 class="typewriter-text">
          {{ displayText }}
        </h1>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  interface Props {
    text?: string
    duration?: number
    delay?: number
    pauseAfter?: number
    autoHide?: boolean
  }

  interface Emits {
    (e: 'complete'): void
    (e: 'hidden'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    text: 'Hey！伙计，欢迎来到我的世界。',
    duration: 2000,
    delay: 300,
    pauseAfter: 1000,
    autoHide: true,
  })

  const emit = defineEmits<Emits>()

  // 组件状态
  const visible = ref(true)
  const displayText = ref('')

  let typeInterval: NodeJS.Timeout | null = null

  // 打字机效果
  const startTyping = () => {
    let index = 0
    const typeSpeed = props.duration / props.text.length

    typeInterval = setInterval(() => {
      if (index < props.text.length) {
        displayText.value += props.text[index]
        index++
      } else {
        // 打字完成
        clearInterval(typeInterval!)
        typeInterval = null
        emit('complete')
        // console.log('打字完成，准备隐藏组件')

        // 自动隐藏
        if (props.autoHide) {
          setTimeout(() => {
            // console.log('开始隐藏打字机组件')
            visible.value = false
          }, props.pauseAfter)
        }
      }
    }, typeSpeed)
  }

  // 手动隐藏
  const hide = () => {
    visible.value = false
  }

  // 清理定时器
  const cleanup = () => {
    if (typeInterval) {
      clearInterval(typeInterval)
      typeInterval = null
    }
  }

  // 组件挂载时启动效果
  onMounted(() => {
    setTimeout(() => {
      startTyping()
    }, props.delay)
  })

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
  })

  // 暴露方法给父组件
  defineExpose({
    hide,
    cleanup,
  })
</script>

<style scoped lang="scss">
  .typewriter-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    clip-path: circle(100% at center);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background:
        radial-gradient(
          circle at 20% 80%,
          rgba(120, 119, 198, 0.1) 0%,
          transparent 50%
        ),
        radial-gradient(
          circle at 80% 20%,
          rgba(74, 114, 227, 0.08) 0%,
          transparent 50%
        ),
        radial-gradient(
          circle at 40% 40%,
          rgba(17, 17, 17, 0.3) 0%,
          transparent 50%
        );
      animation: backgroundPulse 4s ease-in-out infinite alternate;
    }

    // 添加微妙的粒子效果
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image:
        radial-gradient(
          2px 2px at 20px 30px,
          rgba(255, 255, 255, 0.03),
          transparent
        ),
        radial-gradient(
          2px 2px at 40px 70px,
          rgba(255, 255, 255, 0.02),
          transparent
        ),
        radial-gradient(
          1px 1px at 90px 40px,
          rgba(255, 255, 255, 0.04),
          transparent
        ),
        radial-gradient(
          1px 1px at 130px 80px,
          rgba(255, 255, 255, 0.02),
          transparent
        );
      background-repeat: repeat;
      background-size: 200px 100px;
      animation: particleFloat 20s linear infinite;
    }
  }

  @keyframes backgroundPulse {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0.8;
    }
  }

  @keyframes particleFloat {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(-200px, -100px);
    }
  }

  .typewriter-content {
    text-align: center;
  }

  .typewriter-text {
    font-size: 3.5rem;
    font-weight: 700;
    color: #ffffff;
    font-family:
      'SF Pro Display',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
    letter-spacing: 2px;
    line-height: 1.2;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }

    @media (max-width: 480px) {
      font-size: 2rem;
    }
  }

  .typewriter-fade-enter-active {
    transition: all 1.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .typewriter-fade-leave-active {
    transition: all 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .typewriter-fade-enter-from {
    opacity: 0.9;
    clip-path: circle(0% at center);
    filter: blur(1px);
  }

  .typewriter-fade-leave-to {
    opacity: 0;
    clip-path: circle(0% at center);
    filter: blur(2px);
    transform: scale(0.98);
  }
</style>
