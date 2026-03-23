<template>
  <div class="node-panel">
    <div class="panel-header">
      <h3 class="panel-title">节点库</h3>
      <button class="collapse-btn" @click="collapsed = !collapsed">
        <span v-if="collapsed">›</span>
        <span v-else>‹</span>
      </button>
    </div>

    <div v-if="!collapsed" class="panel-content">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索节点..."
          class="search-input"
        />
      </div>

      <div class="node-list">
        <div 
          v-for="nodeType in filteredNodeTypes" 
          :key="nodeType.type"
          class="node-item"
          :draggable="true"
          @dragstart="handleDragStart($event, nodeType)"
          @dragend="handleDragEnd"
        >
          <div class="node-icon-wrapper" :style="{ color: nodeType.color }">
            <SimpleIcon 
              v-if="nodeType.icon"
              :type="getIconType(nodeType.icon)"
              :size="20"
              :color="nodeType.color"
            />
          </div>
          <div class="node-info">
            <div class="node-label">{{ nodeType.label }}</div>
            <div class="node-desc">{{ nodeType.config.description }}</div>
          </div>
        </div>
      </div>

      <div class="agent-section">
        <h4 class="section-title">已注册Agent</h4>
        <div class="agent-list">
          <div 
            v-for="agent in registeredAgents" 
            :key="agent.id"
            class="agent-item"
          >
            <div class="agent-icon-wrapper">
              <SimpleIcon 
                v-if="agent.icon"
                :type="getIconType(agent.icon)"
                :size="18"
              />
            </div>
            <div class="agent-info">
              <div class="agent-name">{{ agent.name }}</div>
              <div class="agent-type">{{ agent.type }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNodeStore } from '@/stores/node'
import SimpleIcon from '@/components/icons/SimpleIcon.vue'

const nodeStore = useNodeStore()

const collapsed = ref(false)
const searchQuery = ref('')

const nodeTypes = computed(() => nodeStore.nodeTypes)
const registeredAgents = computed(() => nodeStore.registeredAgents)

// 图标类型映射（转为小写）
function getIconType(iconName) {
  if (!iconName) return null
  const map = {
    'play': 'start',
    'stop': 'end',
    'robot': 'robot',
    'link': 'link',
    'video': 'video',
    'data': 'data',
    'branch': 'branch',
    'folder': 'folder',
    'share': 'share',
    'analysis': 'analysis',
    'web': 'web'
  }
  return map[iconName.toLowerCase()] || iconName.toLowerCase()
}

const filteredNodeTypes = computed(() => {
  if (!searchQuery.value) return nodeTypes.value
  return nodeTypes.value.filter(nt => 
    nt.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const emit = defineEmits(['node-drag-start', 'node-drag-end'])

function handleDragStart(event, nodeType) {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify(nodeType))
  emit('node-drag-start', nodeType)
}

function handleDragEnd() {
  emit('node-drag-end')
}
</script>

<style scoped>
.node-panel {
  width: 280px;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-default);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.panel-header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-subtle);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  cursor: grab;
  transition: all 0.2s;
}

.node-item:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-default);
  transform: translateX(4px);
}

.node-item:active {
  cursor: grabbing;
}

.node-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.node-desc {
  font-size: 12px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agent-section {
  padding-top: 16px;
  border-top: 1px solid var(--color-border-subtle);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.agent-item:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-default);
}

.agent-icon-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.agent-info {
  flex: 1;
  min-width: 0;
}

.agent-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.agent-type {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}
</style>
