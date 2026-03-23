<template>
  <div class="properties-panel">
    <div class="panel-header">
      <h3 class="panel-title">属性配置</h3>
      <button v-if="selectedNode" class="close-btn" @click="closePanel">✕</button>
    </div>

    <div v-if="!selectedNode" class="empty-state">
      <p class="empty-text">选择一个节点来配置属性</p>
    </div>

    <div v-else class="panel-content">
      <div class="node-header">
        <div class="node-type-badge" :style="{ borderColor: nodeTypeInfo.color }">
          <span class="badge-label">{{ nodeTypeInfo.label }}</span>
        </div>
      </div>

      <!-- 基础信息 -->
      <div class="form-section">
        <label class="form-label">节点ID</label>
        <input 
          type="text" 
          class="form-input" 
          :value="selectedNode.id" 
          disabled
        />
      </div>

      <div class="form-section">
        <label class="form-label">节点名称</label>
        <input 
          v-model="nodeProperties.text" 
          type="text" 
          class="form-input" 
          placeholder="输入节点名称"
          @input="updateProperties"
        />
      </div>

      <!-- Agent节点配置 -->
      <template v-if="actualNodeType === 'agent'">
        <div class="form-section">
          <label class="form-label">Agent类型</label>
          <select v-model="nodeProperties.agentType" class="form-select" @change="updateProperties">
            <option value="llm">LLM智能体</option>
            <option value="http">HTTP请求</option>
            <option value="video-download">视频下载</option>
            <option value="data-processor">数据处理</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        <!-- LLM配置 -->
        <template v-if="nodeProperties.agentType === 'llm'">
          <div class="form-section">
            <label class="form-label">LLM提供商</label>
            <select v-model="nodeProperties.llmProvider" class="form-select" @change="updateProperties">
              <option value="deepseek">DeepSeek</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="claude">Claude</option>
            </select>
          </div>

          <div class="form-section">
            <label class="form-label">API Key (可选,不填使用模拟)</label>
            <input 
              v-model="nodeProperties.apiKey" 
              type="password"
              class="form-input"
              placeholder="sk-..."
              @input="updateProperties"
            />
          </div>

          <div class="form-section">
            <label class="form-label">提示词</label>
            <textarea 
              v-model="nodeProperties.prompt" 
              class="form-textarea"
              placeholder="输入LLM提示词..."
              rows="4"
              @input="updateProperties"
            ></textarea>
          </div>

          <div class="form-section">
            <label class="form-label">系统提示词</label>
            <textarea 
              v-model="nodeProperties.systemPrompt" 
              class="form-textarea"
              placeholder="定义LLM角色和行为..."
              rows="2"
              @input="updateProperties"
            ></textarea>
          </div>

          <div class="form-section">
            <label class="form-label">温度 ({{ nodeProperties.temperature }})</label>
            <input 
              v-model="nodeProperties.temperature" 
              type="range" 
              class="form-range"
              min="0" 
              max="1" 
              step="0.1"
              @input="updateProperties"
            />
          </div>

          <div class="form-section">
            <label class="form-label">最大Token数</label>
            <input 
              v-model="nodeProperties.maxTokens" 
              type="number" 
              class="form-input"
              min="1"
              max="4000"
              @input="updateProperties"
            />
          </div>
        </template>

        <!-- HTTP请求配置 -->
        <template v-if="nodeProperties.agentType === 'http'">
          <div class="form-section">
            <label class="form-label">请求URL</label>
            <input 
              v-model="nodeProperties.url" 
              type="text"
              class="form-input"
              placeholder="https://api.example.com/data"
              @input="updateProperties"
            />
          </div>

          <div class="form-section">
            <label class="form-label">请求方法</label>
            <select v-model="nodeProperties.method" class="form-select" @change="updateProperties">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div class="form-section">
            <label class="form-label">请求头 (JSON)</label>
            <textarea 
              v-model="nodeProperties.headers" 
              class="form-textarea"
              placeholder='{"Content-Type": "application/json"}'
              rows="3"
              @input="updateProperties"
            ></textarea>
          </div>

          <div class="form-section" v-if="nodeProperties.method !== 'GET'">
            <label class="form-label">请求体 (JSON)</label>
            <textarea 
              v-model="nodeProperties.body" 
              class="form-textarea"
              placeholder='{"key": "value"}'
              rows="4"
              @input="updateProperties"
            ></textarea>
          </div>
        </template>

        <!-- 视频下载配置 -->
        <template v-if="nodeProperties.agentType === 'video-download'">
          <div class="form-section">
            <label class="form-label">平台</label>
            <select v-model="nodeProperties.platform" class="form-select" @change="updateProperties">
              <option value="douyin">抖音</option>
              <option value="kuaishou">快手</option>
              <option value="bilibili">哔哩哔哩</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div class="form-section">
            <label class="form-label">视频URL</label>
            <input 
              v-model="nodeProperties.videoUrl" 
              type="text"
              class="form-input"
              placeholder="https://v.douyin.com/..."
              @input="updateProperties"
            />
          </div>

          <div class="form-section">
            <label class="form-label">下载质量</label>
            <select v-model="nodeProperties.quality" class="form-select" @change="updateProperties">
              <option value="high">高清</option>
              <option value="medium">标清</option>
              <option value="low">流畅</option>
            </select>
          </div>
        </template>

        <!-- 数据处理配置 -->
        <template v-if="nodeProperties.agentType === 'data-processor'">
          <div class="form-section">
            <label class="form-label">处理操作</label>
            <select v-model="nodeProperties.operation" class="form-select" @change="updateProperties">
              <option value="transform">转换</option>
              <option value="filter">过滤</option>
              <option value="aggregate">聚合</option>
              <option value="sort">排序</option>
            </select>
          </div>

          <div class="form-section">
            <label class="form-label">输入数据 (JSON)</label>
            <textarea 
              v-model="nodeProperties.inputData" 
              class="form-textarea"
              placeholder='{"data": [...]}'
              rows="4"
              @input="updateProperties"
            ></textarea>
          </div>
        </template>

        <!-- 自定义Agent配置 -->
        <template v-if="nodeProperties.agentType === 'custom'">
          <div class="form-section">
            <label class="form-label">Agent名称</label>
            <input 
              v-model="nodeProperties.agentName" 
              type="text" 
              class="form-input"
              placeholder="输入Agent名称"
              @input="updateProperties"
            />
          </div>

          <div class="form-section">
            <label class="form-label">配置参数 (JSON)</label>
            <textarea 
              v-model="nodeProperties.customConfig" 
              class="form-textarea"
              placeholder='{"param1": "value1"}'
              rows="4"
              @input="updateProperties"
            ></textarea>
          </div>
        </template>
      </template>

      <!-- 条件节点配置 -->
      <template v-if="actualNodeType === 'condition'">
        <div class="form-section">
          <label class="form-label">条件表达式</label>
          <input 
            v-model="nodeProperties.expression" 
            type="text" 
            class="form-input"
            placeholder="例如: value > 10"
            @input="updateProperties"
          />
        </div>

        <div class="conditions-list">
          <div class="list-header">
            <span class="list-title">分支条件</span>
            <button class="add-btn" @click="addCondition">+ 添加</button>
          </div>
          
          <div 
            v-for="(condition, index) in nodeProperties.conditions" 
            :key="index"
            class="condition-item"
          >
            <input 
              v-model="condition.name" 
              type="text" 
              class="condition-input"
              placeholder="分支名称"
              @input="updateProperties"
            />
            <input 
              v-model="condition.expression" 
              type="text" 
              class="condition-input"
              placeholder="条件表达式"
              @input="updateProperties"
            />
            <button class="remove-btn" @click="removeCondition(index)">✕</button>
          </div>
        </div>
      </template>

      <!-- 子流程节点配置 -->
      <template v-if="actualNodeType === 'subprocess'">
        <div class="form-section">
          <label class="form-label">子流程ID</label>
          <select v-model="nodeProperties.workflowId" class="form-select" @change="updateProperties">
            <option value="">选择子流程</option>
            <option v-for="workflow in workflows" :key="workflow.id" :value="workflow.id">
              {{ workflow.name }}
            </option>
          </select>
        </div>
      </template>

      <!-- 并行节点配置 -->
      <template v-if="actualNodeType === 'parallel'">
        <div class="form-section">
          <label class="form-label">
            <input 
              v-model="nodeProperties.waitAll" 
              type="checkbox"
              @change="updateProperties"
            />
            等待所有分支完成
          </label>
        </div>
      </template>

      <!-- 调试选项 -->
      <div v-if="mode === 'debug'" class="debug-section">
        <div class="section-header">
          <span class="section-title">调试选项</span>
        </div>
        <button 
          class="breakpoint-btn"
          :class="{ active: hasBreakpoint }"
          @click="toggleBreakpoint"
        >
          <span>{{ hasBreakpoint ? '移除断点' : '添加断点' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNodeStore } from '@/stores/node'
import { useWorkflowStore } from '@/stores/workflow'

const nodeStore = useNodeStore()
const workflowStore = useWorkflowStore()

const selectedNode = computed(() => nodeStore.selectedNode)
const mode = computed(() => workflowStore.mode)
const workflows = computed(() => workflowStore.workflows)

const nodeProperties = ref({})

const nodeTypeInfo = computed(() => {
  if (!selectedNode.value) return {}
  const nodeType = selectedNode.value.properties?.customType || selectedNode.value.type
  return nodeStore.getNodeType(nodeType) || {}
})

// 创建一个计算属性来获取实际的节点类型
const actualNodeType = computed(() => {
  if (!selectedNode.value) return null
  return selectedNode.value.properties?.customType || selectedNode.value.type
})

const hasBreakpoint = computed(() => {
  if (!selectedNode.value) return false
  return workflowStore.breakpoints.includes(selectedNode.value.id)
})

watch(selectedNode, (newNode) => {
  if (newNode) {
    nodeProperties.value = { ...newNode.properties || {} }
  }
}, { immediate: true })

const emit = defineEmits(['update-node'])

function updateProperties() {
  if (selectedNode.value) {
    emit('update-node', {
      id: selectedNode.value.id,
      properties: { ...nodeProperties.value }
    })
  }
}

function closePanel() {
  nodeStore.clearSelection()
}

function addCondition() {
  if (!nodeProperties.value.conditions) {
    nodeProperties.value.conditions = []
  }
  nodeProperties.value.conditions.push({
    name: `分支${nodeProperties.value.conditions.length + 1}`,
    expression: '',
    target: ''
  })
  updateProperties()
}

function removeCondition(index) {
  nodeProperties.value.conditions.splice(index, 1)
  updateProperties()
}

function toggleBreakpoint() {
  if (selectedNode.value) {
    workflowStore.toggleBreakpoint(selectedNode.value.id)
  }
}
</script>

<style scoped>
.properties-panel {
  width: 320px;
  background: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border-default);
  display: flex;
  flex-direction: column;
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

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-tertiary);
  text-align: center;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.node-header {
  margin-bottom: 24px;
}

.node-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-bg-tertiary);
  border: 2px solid;
  border-radius: var(--radius-lg);
}

.badge-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-section {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 14px;
  font-family: var(--font-display);
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  background: var(--color-bg-elevated);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

.form-range {
  width: 100%;
  height: 6px;
  background: var(--color-bg-tertiary);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--color-accent-primary);
  border-radius: 50%;
  cursor: pointer;
}

.conditions-list {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.list-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.add-btn {
  padding: 4px 12px;
  background: var(--color-accent-primary);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-bg-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: var(--color-accent-hover);
}

.condition-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.condition-input {
  flex: 1;
  padding: 8px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: 13px;
}

.remove-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-error);
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: var(--color-error);
  color: var(--color-text-primary);
}

.debug-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border-subtle);
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.breakpoint-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.breakpoint-btn:hover {
  background: var(--color-bg-elevated);
}

.breakpoint-btn.active {
  background: var(--color-error);
  border-color: var(--color-error);
  color: white;
}
</style>
