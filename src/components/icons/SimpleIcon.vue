<template>
  <svg 
    :width="props.size" 
    :height="props.size" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 开始 - 圆形 -->
    <circle
      v-if="props.type === 'start'"
      cx="12"
      cy="12"
      r="8"
      :stroke="iconColor"
      stroke-width="2"
      fill="none"
    />
    
    <!-- 结束 - 方形 -->
    <rect
      v-if="props.type === 'end'"
      x="4"
      y="4"
      width="16"
      height="16"
      :stroke="iconColor"
      stroke-width="2"
      fill="none"
      rx="2"
    />
    
    <!-- LLM智能体 - 方块堆叠 -->
    <g v-if="props.type === 'robot'">
      <rect
        x="5"
        y="7"
        width="14"
        height="10"
        :stroke="iconColor"
        stroke-width="2"
        fill="none"
        rx="1"
      />
      <line
        x1="8"
        y1="12"
        x2="16"
        y2="12"
        :stroke="iconColor"
        stroke-width="1.5"
      />
      <circle
        cx="10"
        cy="10"
        r="1"
        :fill="iconColor"
      />
      <circle
        cx="14"
        cy="10"
        r="1"
        :fill="iconColor"
      />
    </g>
    
    <!-- HTTP请求 - 连接线 -->
    <g v-if="props.type === 'link'">
      <circle
        cx="6"
        cy="12"
        r="3"
        :stroke="iconColor"
        stroke-width="2"
        fill="none"
      />
      <circle
        cx="18"
        cy="12"
        r="3"
        :stroke="iconColor"
        stroke-width="2"
        fill="none"
      />
      <line
        x1="9"
        y1="12"
        x2="15"
        y2="12"
        :stroke="iconColor"
        stroke-width="2"
      />
      <line
        x1="6"
        y1="9"
        x2="3"
        y2="6"
        :stroke="iconColor"
        stroke-width="1.5"
      />
      <line
        x1="18"
        y1="9"
        x2="21"
        y2="6"
        :stroke="iconColor"
        stroke-width="1.5"
      />
      <line
        x1="18"
        y1="15"
        x2="21"
        y2="18"
        :stroke="iconColor"
        stroke-width="1.5"
      />
    </g>
    
    <!-- 视频下载 - 矩形播放 -->
    <g v-if="props.type === 'video'">
      <rect
        x="4"
        y="6"
        width="14"
        height="12"
        :stroke="iconColor"
        stroke-width="2"
        fill="none"
        rx="1"
      />
      <polygon
        points="9,10 9,14 13,12"
        :fill="iconColor"
      />
      <line
        x1="4"
        y1="6"
        x2="2"
        y2="4"
        :stroke="iconColor"
        stroke-width="1.5"
      />
      <line
        x1="18"
        y1="18"
        x2="20"
        y2="20"
        :stroke="iconColor"
        stroke-width="1.5"
      />
    </g>
    
    <!-- 数据处理 - 波浪线 -->
    <g v-if="props.type === 'data'">
      <path
        d="M 3 12 Q 6 8, 9 12 T 15 12 T 21 12"
        :stroke="iconColor"
        stroke-width="2"
        fill="none"
      />
      <circle
        cx="6"
        cy="12"
        r="1.5"
        :fill="iconColor"
      />
      <circle
        cx="12"
        cy="12"
        r="1.5"
        :fill="iconColor"
      />
      <circle
        cx="18"
        cy="12"
        r="1.5"
        :fill="iconColor"
      />
    </g>
    
    <!-- 条件分支 - Y 形分叉 -->
    <g v-if="props.type === 'branch'">
      <line
        x1="12"
        y1="4"
        x2="12"
        y2="14"
        :stroke="iconColor"
        stroke-width="2"
      />
      <line
        x1="12"
        y1="14"
        x2="6"
        y2="20"
        :stroke="iconColor"
        stroke-width="2"
      />
      <line
        x1="12"
        y1="14"
        x2="18"
        y2="20"
        :stroke="iconColor"
        stroke-width="2"
      />
      <circle
        cx="6"
        cy="20"
        r="2"
        :fill="iconColor"
      />
      <circle
        cx="18"
        cy="20"
        r="2"
        :fill="iconColor"
      />
    </g>
    
    <!-- 子流程 - 文件夹 -->
    <g v-if="props.type === 'folder'">
      <path
        d="M 4 7 L 4 19 L 20 19 L 20 9 L 12 9 L 10 7 Z"
        :stroke="iconColor"
        stroke-width="2"
        fill="none"
      />
      <line
        x1="4"
        y1="9"
        x2="10"
        y2="9"
        :stroke="iconColor"
        stroke-width="2"
      />
    </g>
    
    <!-- 并行网关 - 平行线 -->
    <g v-if="props.type === 'share'">
      <line
        x1="4"
        y1="8"
        x2="20"
        y2="8"
        :stroke="iconColor"
        stroke-width="2"
      />
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        :stroke="iconColor"
        stroke-width="2"
      />
      <line
        x1="4"
        y1="16"
        x2="20"
        y2="16"
        :stroke="iconColor"
        stroke-width="2"
      />
      <circle
        cx="4"
        cy="12"
        r="2"
        :stroke="iconColor"
        stroke-width="1.5"
        fill="none"
      />
      <circle
        cx="20"
        cy="12"
        r="2"
        :stroke="iconColor"
        stroke-width="1.5"
        fill="none"
      />
    </g>
    
    <!-- 分析 - 图表 -->
    <g v-if="props.type === 'analysis'">
      <rect
        x="3"
        y="15"
        width="3"
        height="5"
        :fill="iconColor"
        opacity="0.7"
      />
      <rect
        x="7"
        y="11"
        width="3"
        height="9"
        :fill="iconColor"
        opacity="0.7"
      />
      <rect
        x="11"
        y="8"
        width="3"
        height="12"
        :fill="iconColor"
        opacity="0.7"
      />
      <rect
        x="15"
        y="13"
        width="3"
        height="7"
        :fill="iconColor"
        opacity="0.7"
      />
      <line
        x1="3"
        y1="4"
        x2="18"
        y2="4"
        :stroke="iconColor"
        stroke-width="1.5"
      />
    </g>
    
    <!-- Web - 网络 -->
    <g v-if="props.type === 'web'">
      <circle
        cx="12"
        cy="12"
        r="6"
        :stroke="iconColor"
        stroke-width="1.5"
        fill="none"
      />
      <line
        x1="12"
        y1="6"
        x2="12"
        y2="18"
        :stroke="iconColor"
        stroke-width="1.5"
      />
      <line
        x1="6"
        y1="12"
        x2="18"
        y2="12"
        :stroke="iconColor"
        stroke-width="1.5"
      />
      <path
        d="M 8 8 Q 12 12, 16 8"
        :stroke="iconColor"
        stroke-width="1.5"
        fill="none"
      />
      <path
        d="M 8 16 Q 12 12, 16 16"
        :stroke="iconColor"
        stroke-width="1.5"
        fill="none"
      />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 20
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})

const iconColor = computed(() => props.color)
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}
</style>

