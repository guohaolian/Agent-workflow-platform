<template>
  <div class="canvas-container">
    <div class="canvas-toolbar">
      <div class="zoom-controls">
        <button class="zoom-btn" @click="zoomOut" title="缩小">
          <span>−</span>
        </button>
        <span class="zoom-value">{{ Math.round(zoom * 100) }}%</span>
        <button class="zoom-btn" @click="zoomIn" title="放大">
          <span>+</span>
        </button>
        <button class="zoom-btn" @click="resetZoom" title="重置">
          <span>重置</span>
        </button>
      </div>

      <div class="canvas-actions">
        <button class="action-btn" @click="fitView" title="适应画布">
          <span>适应</span>
        </button>
        <button class="action-btn" @click="clearCanvas" title="清空画布">
          <span>清空</span>
        </button>
      </div>
    </div>

    <div 
      ref="canvasRef" 
      class="canvas-content"
      @drop="handleDrop"
      @dragover="handleDragOver"
    ></div>

    <div v-if="isRunning && currentExecutionNode" class="execution-overlay">
      <div class="execution-indicator">
        <div class="indicator-pulse"></div>
        <span class="indicator-text">正在执行节点: {{ currentExecutionNode }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { initLogicFlow, registerCustomNodes } from '@/utils/logicflow'
import { useWorkflowStore } from '@/stores/workflow'
import { useNodeStore } from '@/stores/node'

const workflowStore = useWorkflowStore()
const nodeStore = useNodeStore()

const canvasRef = ref(null)
const zoom = ref(1)
let lf = null

const isRunning = computed(() => workflowStore.isRunning)
const currentExecutionNode = computed(() => workflowStore.currentExecutionNode)

const emit = defineEmits(['node-click', 'node-update', 'graph-change'])

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (lf) {
    lf = null
  }
})

watch(() => workflowStore.graphData, (newData) => {
  if (lf && newData) {
    lf.render(newData)
  }
}, { deep: true })

watch(currentExecutionNode, (nodeId) => {
  if (lf && nodeId) {
    highlightExecutingNode(nodeId)
  }
})

function initCanvas() {
  if (!canvasRef.value) return

  lf = initLogicFlow(canvasRef.value)
  registerCustomNodes(lf)

  // 监听节点点击事件
  lf.on('node:click', ({ data }) => {
    nodeStore.selectNode(data)
    emit('node-click', data)
  })

  // 监听节点双击事件
  lf.on('node:dblclick', ({ data }) => {
    // 可以打开配置面板或其他操作
  })

  // 监听画布变化
  lf.on('history:change', () => {
    const graphData = lf.getGraphData()
    workflowStore.updateGraphData(graphData)
    emit('graph-change', graphData)
  })

  // 监听边的添加
  lf.on('edge:add', ({ data }) => {
    const graphData = lf.getGraphData()
    workflowStore.updateGraphData(graphData)
  })

  // 监听节点删除
  lf.on('node:delete', () => {
    nodeStore.clearSelection()
  })

  // 加载初始数据
  if (workflowStore.graphData) {
    lf.render(workflowStore.graphData)
  }
}

function handleDrop(event) {
  event.preventDefault()
  
  if (!lf || !canvasRef.value) {
    console.warn('LogicFlow instance not initialized')
    return
  }
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'))
    
    // 获取鼠标的屏幕坐标
    const clientX = event.clientX
    const clientY = event.clientY
    
    // 使用 LogicFlow 的方法将屏幕坐标转换为画布逻辑坐标
    // getPointByClient 会自动处理缩放、平移和容器偏移
    let point = null
    
    try {
      point = lf.getPointByClient(clientX, clientY)
    } catch (e) {
      console.warn('getPointByClient failed:', e)
    }
    
    // 如果 getPointByClient 没有返回有效坐标，手动计算
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number' || 
        isNaN(point.x) || isNaN(point.y) || !isFinite(point.x) || !isFinite(point.y)) {
      
      // 获取画布容器的位置信息
      const containerRect = canvasRef.value.getBoundingClientRect()
      
      // 计算鼠标相对于容器的坐标
      const containerX = clientX - containerRect.left
      const containerY = clientY - containerRect.top
      
      // 获取 LogicFlow 的画布变换信息
      // LogicFlow 的 transform 包含 scaleX, scaleY, x, y (平移量)
      const transform = lf.getTransform()
      
      // 手动转换坐标：考虑缩放和平移
      // LogicFlow 的坐标系统：逻辑坐标 = (容器坐标 - 平移) / 缩放
      const scaleX = transform.scaleX || transform.scale || 1
      const scaleY = transform.scaleY || transform.scale || 1
      const translateX = transform.x || 0
      const translateY = transform.y || 0
      
      point = {
        x: (containerX - translateX) / scaleX,
        y: (containerY - translateY) / scaleY
      }
      
      // 如果转换后的坐标还是无效，直接使用容器坐标（作为最后备用方案）
      if (isNaN(point.x) || isNaN(point.y) || !isFinite(point.x) || !isFinite(point.y)) {
        point = {
          x: containerX,
          y: containerY
        }
      }
    }
    
    // 映射自定义节点类型到LogicFlow内置类型
    const typeMap = {
      'start': 'circle',
      'end': 'circle',
      'agent': 'rect',
      'condition': 'diamond',
      'subprocess': 'rect',
      'parallel': 'diamond'
    }
    
    const lfType = typeMap[data.type] || 'rect'
    
    const nodeConfig = {
      type: lfType,
      x: point.x,
      y: point.y,
      text: data.label,
      properties: { 
        ...data.config,
        customType: data.type,
        nodeColor: data.color
      }
    }
    
    // 根据节点类型设置样式 - 清晰简洁的配色
    if (data.type === 'start') {
      nodeConfig.style = {
        fill: '#e7f5ff',
        stroke: '#0066cc',
        strokeWidth: 2.5
      }
      nodeConfig.r = 32
    } else if (data.type === 'end') {
      nodeConfig.style = {
        fill: '#ffe0e0',
        stroke: '#dc3545',
        strokeWidth: 2.5
      }
      nodeConfig.r = 32
    } else if (data.type === 'agent') {
      nodeConfig.style = {
        fill: '#ffffff',
        stroke: '#0066cc',
        strokeWidth: 2
      }
      nodeConfig.width = 160
      nodeConfig.height = 64
    } else if (data.type === 'condition') {
      nodeConfig.style = {
        fill: '#fff8e1',
        stroke: '#ffc107',
        strokeWidth: 2
      }
    } else if (data.type === 'subprocess') {
      nodeConfig.style = {
        fill: '#f3e5f5',
        stroke: '#9c27b0',
        strokeWidth: 2,
        strokeDasharray: '4,4'
      }
      nodeConfig.width = 160
      nodeConfig.height = 64
    } else if (data.type === 'parallel') {
      nodeConfig.style = {
        fill: '#e8f5e9',
        stroke: '#28a745',
        strokeWidth: 2
      }
    }

    const node = lf.addNode(nodeConfig)
    console.log('Node added:', node)
  } catch (e) {
    console.error('Drop error:', e)
  }
}

function handleDragOver(event) {
  event.preventDefault()
}

function handleResize() {
  if (lf && canvasRef.value) {
    lf.resize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  }
}

function zoomIn() {
  if (lf) {
    zoom.value = Math.min(zoom.value + 0.1, 2)
    lf.zoom(zoom.value)
  }
}

function zoomOut() {
  if (lf) {
    zoom.value = Math.max(zoom.value - 0.1, 0.5)
    lf.zoom(zoom.value)
  }
}

function resetZoom() {
  if (lf) {
    zoom.value = 1
    lf.resetZoom()
  }
}

function fitView() {
  if (lf) {
    lf.fitView()
  }
}

function clearCanvas() {
  if (lf && confirm('确定要清空画布吗?')) {
    lf.clearData()
    nodeStore.clearSelection()
  }
}

function highlightExecutingNode(nodeId) {
  if (!lf) return
  
  // 高亮当前执行节点
  const node = lf.getNodeModelById(nodeId)
  if (node) {
    lf.selectElementById(nodeId)
  }
}

// 暴露方法给父组件
defineExpose({
  getGraphData: () => lf?.getGraphData(),
  updateNode: (nodeId, properties) => {
    if (lf) {
      const node = lf.getNodeModelById(nodeId)
      if (node) {
        node.setProperties(properties)
      }
    }
  }
})
</script>

<style scoped>
.canvas-container {
  flex: 1;
  position: relative;
  background: var(--color-bg-primary);
  overflow: hidden;
}

.canvas-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 12px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.zoom-btn {
  min-width: 32px;
  padding: 6px 10px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-btn:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-default);
}

.zoom-value {
  min-width: 50px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--color-text-primary);
}

.canvas-actions {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.action-btn {
  padding: 6px 12px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-default);
  transform: scale(1.05);
}

.canvas-content {
  width: 100%;
  height: 100%;
}

.execution-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  pointer-events: none;
}

.execution-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.indicator-pulse {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.indicator-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

/* LogicFlow样式覆盖 */
:deep(.lf-canvas-overlay) {
  background: var(--color-bg-canvas);
}

:deep(.lf-node-text) {
  font-weight: 500;
}

:deep(.lf-node:hover) {
  filter: brightness(0.98);
}

:deep(.lf-node-selected) {
  filter: drop-shadow(0 0 8px rgba(0, 102, 204, 0.4));
}
</style>
