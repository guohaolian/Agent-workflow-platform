import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWorkflowStore = defineStore('workflow', () => {
  const LAST_WORKFLOW_ID_KEY = 'lastWorkflowId'

  // 状态
  const workflows = ref([])
  const currentWorkflow = ref(null)
  const mode = ref('edit') // edit | debug
  const isRunning = ref(false)
  const executionLog = ref([])
  const breakpoints = ref([])
  const currentExecutionNode = ref(null)
  const activeRunId = ref(null)

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
    try {
      localStorage.setItem(LAST_WORKFLOW_ID_KEY, workflow.id)
    } catch {
      // ignore
    }
    persistToStorage()
  }

  function loadWorkflow(id) {
    const workflow = workflows.value.find(w => w.id === id)
    if (workflow) {
      currentWorkflow.value = workflow
      graphData.value = JSON.parse(JSON.stringify(workflow.savedData))
      try {
        localStorage.setItem(LAST_WORKFLOW_ID_KEY, workflow.id)
      } catch {
        // ignore
      }
    }
  }

  function saveWorkflow() {
    if (currentWorkflow.value) {
      currentWorkflow.value.savedData = JSON.parse(JSON.stringify(graphData.value))
      currentWorkflow.value.updatedAt = new Date().toISOString()
      try {
        localStorage.setItem(LAST_WORKFLOW_ID_KEY, currentWorkflow.value.id)
      } catch {
        // ignore
      }
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
    // 如果传入了 runId，则只记录当前批次的日志，避免并发运行互相串台
    if (log?.runId && activeRunId.value && log.runId !== activeRunId.value) {
      return
    }

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

  function startExecution(runId) {
    const nextRunId = runId || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    activeRunId.value = nextRunId
    isRunning.value = true
    clearExecutionLog()
    currentExecutionNode.value = null
    return nextRunId
  }

  function stopExecution() {
    isRunning.value = false
    currentExecutionNode.value = null
    activeRunId.value = null
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

      // 初始化当前工作流（用于启用保存/未保存状态等）
      if (!currentWorkflow.value && workflows.value.length > 0) {
        let lastId = null
        try {
          lastId = localStorage.getItem(LAST_WORKFLOW_ID_KEY)
        } catch {
          // ignore
        }

        const lastWorkflow = lastId ? workflows.value.find(w => w.id === lastId) : null
        const fallbackWorkflow = workflows.value.slice().sort((a, b) => {
          const aTime = Date.parse(a.updatedAt || a.createdAt || 0) || 0
          const bTime = Date.parse(b.updatedAt || b.createdAt || 0) || 0
          return bTime - aTime
        })[0]

        currentWorkflow.value = lastWorkflow || fallbackWorkflow || null
        if (currentWorkflow.value) {
          graphData.value = JSON.parse(
            JSON.stringify(currentWorkflow.value.savedData || { nodes: [], edges: [] })
          )
        }
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
    activeRunId,
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
