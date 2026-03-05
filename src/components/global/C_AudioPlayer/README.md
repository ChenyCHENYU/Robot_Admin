# C_AudioPlayer 音频播放器

音频播放组件，支持播放列表、进度控制、音量调节、多种播放模式。

## 基本用法

```vue
<C_AudioPlayer :tracks="playlist" show-playlist />
```

## Props

| 属性         | 类型                                        | 默认值      | 说明             |
| ------------ | ------------------------------------------- | ----------- | ---------------- |
| tracks       | `AudioTrack[]`                              | —           | 播放列表         |
| initialIndex | `number`                                    | `0`         | 初始播放索引     |
| showPlaylist | `boolean`                                   | `true`      | 是否显示播放列表 |
| showCover    | `boolean`                                   | `true`      | 是否显示封面     |
| autoplay     | `boolean`                                   | `false`     | 是否自动播放     |
| mode         | `'list' \| 'loop' \| 'single' \| 'shuffle'` | `'list'`    | 循环模式         |
| theme        | `'default' \| 'minimal'`                    | `'default'` | 主题外观         |

## Events

| 事件       | 参数           | 说明         |
| ---------- | -------------- | ------------ |
| play       | `index`        | 开始播放     |
| pause      | —              | 暂停         |
| ended      | `index`        | 播放结束     |
| modeChange | `mode: string` | 播放模式切换 |
