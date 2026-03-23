import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWorkflowStore = defineStore('workflow', () => {
  // 状态
  const workflows = ref([])
  const currentWorkflow = ref(null)
  const mode = ref('edit') // edit | debug
  const isRunning = ref(false)
  const executionLog = ref([])
  const breakpoints = ref([])
  const currentExecutionNode = ref(null)

  // 当前工作流的图数据
  const graphData = ref({
    nodes: [],
    edges: []
  })

  // 计算属性
  const hasUnsavedChanges = computed(() => {
    if (!currentWorkflow.value) return false
    return JSON.stringify(graphData.value) !== JSON.stringify(currentWorkflow.value.savedData)
  })

  const canExecute = computed(() => {
    return graphData.value.nodes.length > 0 && !isRunning.value
  })

  // Actions
  function createWorkflow(name) {
    const workflow = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      savedData: { nodes: [], edges: [] }
    }
    workflows.value.push(workflow)
    currentWorkflow.value = workflow
    graphData.value = { nodes: [], edges: [] }
  }

  function loadWorkflow(id) {
    const workflow = workflows.value.find(w => w.id === id)
    if (workflow) {
      currentWorkflow.value = workflow
      graphData.value = JSON.parse(JSON.stringify(workflow.savedData))
    }
  }

  function saveWorkflow() {
    if (currentWorkflow.value) {
      currentWorkflow.value.savedData = JSON.parse(JSON.stringify(graphData.value))
      currentWorkflow.value.updatedAt = new Date().toISOString()
      persistToStorage()
    }
  }

  function updateGraphData(data) {
    graphData.value = data
  }

  function setMode(newMode) {
    mode.value = newMode
    if (newMode === 'edit') {
      stopExecution()
    }
  }

  function addExecutionLog(log) {
    executionLog.value.push({
      ...log,
      timestamp: new Date().toISOString()
    })
  }

  function clearExecutionLog() {
    executionLog.value = []
  }

  function toggleBreakpoint(nodeId) {
    const index = breakpoints.value.indexOf(nodeId)
    if (index > -1) {
      breakpoints.value.splice(index, 1)
    } else {
      breakpoints.value.push(nodeId)
    }
  }

  function startExecution() {
    isRunning.value = true
    clearExecutionLog()
    currentExecutionNode.value = null
  }

  function stopExecution() {
    isRunning.value = false
    currentExecutionNode.value = null
  }

  function setCurrentExecutionNode(nodeId) {
    currentExecutionNode.value = nodeId
  }

  function persistToStorage() {
    try {
      localStorage.setItem('workflows', JSON.stringify(workflows.value))
    } catch (e) {
      console.warn('Failed to persist workflows:', e)
    }
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('workflows')
      if (stored) {
        workflows.value = JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Failed to load workflows:', e)
    }
  }

  // 初始化
  loadFromStorage()

  return {
    // State
    workflows,
    currentWorkflow,
    mode,
    isRunning,
    executionLog,
    breakpoints,
    currentExecutionNode,
    graphData,
    // Computed
    hasUnsavedChanges,
    canExecute,
    // Actions
    createWorkflow,
    loadWorkflow,
    saveWorkflow,
    updateGraphData,
    setMode,
    addExecutionLog,
    clearExecutionLog,
    toggleBreakpoint,
    startExecution,
    stopExecution,
    setCurrentExecutionNode
  }
})
