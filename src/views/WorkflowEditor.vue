<template>
  <div class="workflow-editor">
    <Toolbar @run="handleRun" @export="handleExport" @load-example="handleLoadExample" />

    <div class="editor-layout">
      <NodePanel />

      <div class="editor-main">
        <Canvas ref="canvasRef" @node-click="handleNodeClick" @node-update="handleNodeUpdate"
          @graph-change="handleGraphChange" />

        <DebugPanel v-if="mode === 'debug'" @start-debug="handleStartDebug" @step-over="handleStepOver"
          @resume="handleResume" @stop-debug="handleStopDebug" />
      </div>

      <PropertiesPanel @update-node="handleUpdateNode" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Toolbar from '@/components/toolbar/Toolbar.vue'
import NodePanel from '@/components/panels/NodePanel.vue'
import PropertiesPanel from '@/components/panels/PropertiesPanel.vue'
import DebugPanel from '@/components/panels/DebugPanel.vue'
import Canvas from '@/components/Canvas.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { useNodeStore } from '@/stores/node'
import { WorkflowEngine } from '@/utils/workflowEngine'
import { createDouyinVideoWorkflow } from '@/utils/realAgentExecutor'

const workflowStore = useWorkflowStore()
const nodeStore = useNodeStore()

const canvasRef = ref(null)
const workflowEngine = ref(null)

const mode = computed(() => workflowStore.mode)

onMounted(() => {
  // 初始化默认工作流
  if (workflowStore.workflows.length === 0) {
    workflowStore.createWorkflow('新建工作流')
  }
})

function handleNodeClick(node) {
  nodeStore.selectNode(node)
}

function handleNodeUpdate(data) {
  // 节点更新处理
}

function handleGraphChange(graphData) {
  // 图数据变化处理
}

function handleUpdateNode({ id, properties }) {
  if (canvasRef.value) {
    canvasRef.value.updateNode(id, properties)
  }
}

async function handleRun() {
  const graphData = canvasRef.value?.getGraphData()
  if (!graphData || graphData.nodes.length === 0) {
    alert('请先添加节点')
    return
  }

  workflowStore.startExecution()

  workflowEngine.value = new WorkflowEngine(graphData, {
    onNodeExecute: (node) => {
      workflowStore.setCurrentExecutionNode(node.id)
      workflowStore.addExecutionLog({
        type: 'info',
        nodeId: node.id,
        nodeName: node.text || node.type,
        message: `开始执行节点: ${node.text || node.type}`
      })
    },
    onNodeComplete: (node, result) => {
      workflowStore.addExecutionLog({
        type: result.success ? 'success' : 'error',
        nodeId: node.id,
        nodeName: node.text || node.type,
        message: result.success ? '节点执行成功' : '节点执行失败',
        data: result.output
      })
    },
    onError: (node, error) => {
      workflowStore.addExecutionLog({
        type: 'error',
        nodeId: node.id,
        nodeName: node.text || node.type,
        message: `执行错误: ${error.message}`,
        data: error
      })
    },
    breakpoints: workflowStore.breakpoints
  })

  try {
    const result = await workflowEngine.value.execute()

    if (result.finished) {
      workflowStore.addExecutionLog({
        type: 'success',
        nodeId: 'system',
        nodeName: '系统',
        message: '工作流执行完成',
        data: result.context
      })
      workflowStore.stopExecution()
    } else if (result.paused) {
      workflowStore.addExecutionLog({
        type: 'warning',
        nodeId: result.pausedAt.id,
        nodeName: result.pausedAt.text || result.pausedAt.type,
        message: '执行已暂停(断点)'
      })
    }
  } catch (error) {
    workflowStore.addExecutionLog({
      type: 'error',
      nodeId: 'system',
      nodeName: '系统',
      message: `工作流执行失败: ${error.message}`
    })
    workflowStore.stopExecution()
  }
}

function handleExport() {
  const graphData = canvasRef.value?.getGraphData()
  if (!graphData) return

  const dataStr = JSON.stringify(graphData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `workflow-${Date.now()}.json`
  a.click()

  URL.revokeObjectURL(url)
}

async function handleStartDebug() {
  await handleRun()
}

async function handleStepOver() {
  if (workflowEngine.value) {
    const result = await workflowEngine.value.stepOver()

    if (result.finished) {
      workflowStore.addExecutionLog({
        type: 'success',
        nodeId: 'system',
        nodeName: '系统',
        message: '工作流执行完成'
      })
      workflowStore.stopExecution()
    }
  }
}

async function handleResume() {
  if (workflowEngine.value) {
    const result = await workflowEngine.value.resume()

    if (result.finished) {
      workflowStore.stopExecution()
    }
  }
}

function handleStopDebug() {
  workflowStore.stopExecution()
  workflowStore.setCurrentExecutionNode(null)
}

function handleLoadExample() {
  if (confirm('加载示例工作流?\n这将清空当前画布内容。\n\n示例:抖音视频分析下载流程')) {
    const exampleWorkflow = createDouyinVideoWorkflow()
    workflowStore.updateGraphData(exampleWorkflow)
    alert('示例工作流已加载!\n\n包含:\n- LLM内容分析(使用DeepSeek)\n- 条件分支判断\n- 视频下载节点\n\n点击"运行"查看效果(模拟执行)')
  }
}
</script>

<style scoped>
.workflow-editor {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}

.editor-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
