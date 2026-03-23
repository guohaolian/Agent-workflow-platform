<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="logo">
        <span class="logo-text">AgentFlow</span>
      </div>

      <div class="workflow-info">
        <input v-model="workflowName" class="workflow-name-input" placeholder="未命名工作流" @blur="updateWorkflowName" />
        <span v-if="hasUnsavedChanges" class="unsaved-indicator">●</span>
      </div>
    </div>

    <div class="toolbar-center">
      <div class="mode-switch">
        <button :class="['mode-btn', { active: mode === 'edit' }]" @click="switchMode('edit')">
          <span>编辑</span>
        </button>
        <button :class="['mode-btn', { active: mode === 'debug' }]" @click="switchMode('debug')">
          <span>调试</span>
        </button>
      </div>
    </div>

    <div class="toolbar-right">
      <button class="toolbar-btn" @click="loadExample">
        <span>加载示例</span>
      </button>

      <button class="toolbar-btn" @click="saveWorkflow" :disabled="!hasUnsavedChanges">
        <span>保存</span>
      </button>

      <button class="toolbar-btn primary" @click="runWorkflow" :disabled="!canExecute">
        <span>{{ isRunning ? '运行中...' : '运行' }}</span>
      </button>

      <button class="toolbar-btn" @click="exportWorkflow">
        <span>导出</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'

const workflowStore = useWorkflowStore()

const workflowName = ref('新建工作流')

const mode = computed(() => workflowStore.mode)
const hasUnsavedChanges = computed(() => workflowStore.hasUnsavedChanges)
const canExecute = computed(() => workflowStore.canExecute)
const isRunning = computed(() => workflowStore.isRunning)

watch(
  () => workflowStore.currentWorkflow,
  (wf) => {
    workflowName.value = wf?.name || '新建工作流'
  },
  { immediate: true }
)

const emit = defineEmits(['run', 'export', 'load-example'])

function switchMode(newMode) {
  workflowStore.setMode(newMode)
}

function updateWorkflowName() {
  if (workflowStore.currentWorkflow) {
    workflowStore.currentWorkflow.name = workflowName.value
  }
}

function saveWorkflow() {
  workflowStore.saveWorkflow()
}

function runWorkflow() {
  emit('run')
}

function exportWorkflow() {
  emit('export')
}

function loadExample() {
  emit('load-example')
}
</script>

<style scoped>
.toolbar {
  height: 56px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  gap: 20px;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.3px;
}

.workflow-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 20px;
  border-left: 1px solid var(--color-border-light);
}

.workflow-name-input {
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  max-width: 200px;
}

.workflow-name-input:hover {
  background: var(--color-bg-tertiary);
}

.workflow-name-input:focus {
  outline: none;
  background: var(--color-bg-tertiary);
}

.unsaved-indicator {
  color: var(--color-warning);
  font-size: 10px;
}

.mode-switch {
  display: flex;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 2px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.mode-btn:hover {
  color: var(--color-text-primary);
}

.mode-btn.active {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.toolbar-btn:hover:not(:disabled) {
  border-color: var(--color-border-strong);
  background: var(--color-bg-tertiary);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.toolbar-btn.primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}
</style>
