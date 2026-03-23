<template>
  <div
    class="debug-panel"
    :class="{ collapsed: isCollapsed }"
  >
    <div class="panel-header">
      <div class="header-left">
        <h3 class="panel-title">
          执行日志
        </h3>
        <span class="log-count">{{ executionLog.length }} 条</span>
      </div>
      <div class="header-right">
        <button
          class="icon-btn"
          title="清空日志"
          @click="clearLogs"
        >
          <span>清空</span>
        </button>
        <button
          class="icon-btn"
          title="折叠/展开"
          @click="isCollapsed = !isCollapsed"
        >
          <span>{{ isCollapsed ? '▼' : '▲' }}</span>
        </button>
      </div>
    </div>

    <div
      v-if="!isCollapsed"
      class="panel-content"
    >
      <div
        v-if="executionLog.length === 0"
        class="empty-state"
      >
        <p class="empty-text">
          暂无执行日志
        </p>
      </div>

      <div
        v-else
        class="log-list"
      >
        <div 
          v-for="(log, index) in executionLog" 
          :key="index"
          class="log-item"
          :class="log.type"
        >
          <div class="log-content">
            <div class="log-header">
              <span class="log-node">{{ log.nodeName || log.nodeId }}</span>
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            </div>
            <div class="log-message">
              {{ log.message }}
            </div>
            <div
              v-if="log.data"
              class="log-data"
            >
              <pre>{{ formatData(log.data) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 调试控制栏 -->
    <div
      v-if="mode === 'debug' && !isCollapsed"
      class="debug-controls"
    >
      <button 
        class="control-btn" 
        :disabled="!canExecute || isRunning"
        @click="startDebug"
      >
        <span>开始</span>
      </button>
      
      <button 
        class="control-btn" 
        :disabled="!isRunning"
        @click="stepOver"
      >
        <span>单步</span>
      </button>
      
      <button 
        class="control-btn" 
        :disabled="!isRunning"
        @click="resume"
      >
        <span>继续</span>
      </button>
      
      <button 
        class="control-btn danger" 
        :disabled="!isRunning"
        @click="stopDebug"
      >
        <span>停止</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'

const workflowStore = useWorkflowStore()

const isCollapsed = ref(false)

const executionLog = computed(() => workflowStore.executionLog)
const mode = computed(() => workflowStore.mode)
const canExecute = computed(() => workflowStore.canExecute)
const isRunning = computed(() => workflowStore.isRunning)

const emit = defineEmits(['start-debug', 'step-over', 'resume', 'stop-debug'])

function clearLogs() {
  workflowStore.clearExecutionLog()
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatData(data) {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }
  return data
}

function startDebug() {
  emit('start-debug')
}

function stepOver() {
  emit('step-over')
}

function resume() {
  emit('resume')
}

function stopDebug() {
  emit('stop-debug')
}
</script>

<style scoped>
.debug-panel {
  height: 300px;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-default);
  display: flex;
  flex-direction: column;
  transition: height 0.3s ease;
}

.debug-panel.collapsed {
  height: 56px;
}

.panel-header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-subtle);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.log-count {
  padding: 4px 8px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

.header-right {
  display: flex;
  gap: 8px;
}

.icon-btn {
  padding: 6px 12px;
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
  font-size: 13px;
}

.icon-btn:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg-tertiary);
  border-left: 3px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  animation: fadeIn 0.3s ease;
}

.log-item.info {
  border-left-color: var(--color-accent-primary);
}

.log-item.success {
  border-left-color: var(--color-success);
}

.log-item.error {
  border-left-color: var(--color-error);
}

.log-item.warning {
  border-left-color: var(--color-warning);
}

.log-content {
  flex: 1;
  min-width: 0;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.log-node {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
}

.log-time {
  font-size: 11px;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
}

.log-message {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.log-data {
  margin-top: 8px;
  padding: 8px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-sm);
  overflow-x: auto;
}

.log-data pre {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  line-height: 1.4;
}

.debug-controls {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-bg-primary);
}

.control-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn.danger {
  color: var(--color-error);
}

.control-btn.danger:hover:not(:disabled) {
  background: var(--color-error);
  border-color: var(--color-error);
  color: white;
}
</style>
