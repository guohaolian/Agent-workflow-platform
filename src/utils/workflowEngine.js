/**
 * 工作流执行引擎
 * 负责工作流的运行时执行逻辑
 */
import { RealAgentExecutor } from './realAgentExecutor'

export class WorkflowEngine {
  constructor(graphData, options = {}) {
    this.nodes = graphData.nodes
    this.edges = graphData.edges
    this.options = options
    this.context = {} // 执行上下文
    this.executionStack = [] // 执行栈
    this.onNodeExecute = options.onNodeExecute || (() => {})
    this.onNodeComplete = options.onNodeComplete || (() => {})
    this.onError = options.onError || (() => {})
    this.breakpoints = options.breakpoints || []
    this.isPaused = false
  }

  // 获取节点的运行时类型（优先使用 properties.customType）
  getNodeRuntimeType(node) {
    return node?.properties?.customType || node?.type
  }

  // 兜底推断开始节点：入度为 0 且有出边的唯一节点
  inferStartNode() {
    const indegree = new Map()
    const outdegree = new Map()

    this.nodes.forEach(n => {
      indegree.set(n.id, 0)
      outdegree.set(n.id, 0)
    })

    this.edges.forEach(e => {
      if (e?.sourceNodeId != null) {
        outdegree.set(e.sourceNodeId, (outdegree.get(e.sourceNodeId) || 0) + 1)
      }
      if (e?.targetNodeId != null) {
        indegree.set(e.targetNodeId, (indegree.get(e.targetNodeId) || 0) + 1)
      }
    })

    const candidates = this.nodes.filter(n => {
      const t = this.getNodeRuntimeType(n)
      return (indegree.get(n.id) || 0) === 0 && (outdegree.get(n.id) || 0) > 0 && t !== 'end'
    })

    return candidates.length === 1 ? candidates[0] : null
  }

  // 查找开始节点
  findStartNode() {
    return (
      this.nodes.find(node => this.getNodeRuntimeType(node) === 'start') || this.inferStartNode()
    )
  }

  // 查找节点的下一个节点
  findNextNodes(nodeId) {
    const outgoingEdges = this.edges.filter(edge => edge.sourceNodeId === nodeId)
    return outgoingEdges
      .map(edge => {
        const node = this.nodes.find(n => n.id === edge.targetNodeId)
        return { node, edge }
      })
      .filter(({ node }) => Boolean(node))
  }

  // 执行单个节点
  async executeNode(node) {
    this.onNodeExecute(node)

    // 检查断点
    if (this.breakpoints.includes(node.id)) {
      this.isPaused = true
      return { paused: true, node }
    }

    try {
      let result = null

      // 获取节点的实际类型（从properties.customType或直接使用type）
      const nodeType = node.properties?.customType || node.type

      switch (nodeType) {
        case 'start':
        case 'circle':
          result = await this.executeStartNode(node)
          break
        case 'end':
          result = await this.executeEndNode(node)
          break
        case 'agent':
        case 'rect':
          result = await this.executeAgentNode(node)
          break
        case 'condition':
        case 'diamond':
          result = await this.executeConditionNode(node)
          break
        case 'subprocess':
          result = await this.executeSubprocessNode(node)
          break
        case 'parallel':
          result = await this.executeParallelNode(node)
          break
        default:
          // 默认作为普通节点执行
          result = await this.executeAgentNode(node)
      }

      this.onNodeComplete(node, result)
      return result
    } catch (error) {
      this.onError(node, error)
      throw error
    }
  }

  async executeStartNode(_node) {
    return { success: true, output: this.context }
  }

  async executeEndNode(_node) {
    return { success: true, output: this.context, finished: true }
  }

  async executeAgentNode(node) {
    // 使用真实的Agent执行器
    const executor = new RealAgentExecutor(node, this.context)

    try {
      const result = await executor.execute()

      // 更新上下文
      this.context[node.id] = result.output
      this.context.lastOutput = result.output

      return {
        success: true,
        output: result.output,
        details: result
      }
    } catch (error) {
      console.error('Agent执行错误:', error)
      return {
        success: false,
        error: error.message,
        output: null
      }
    }
  }

  async executeConditionNode(node) {
    const config = node.properties || {}

    // 简单的条件判断模拟
    await this.sleep(500)

    // 评估条件表达式
    const conditionResult = this.evaluateExpression(config.expression)

    return {
      success: true,
      output: conditionResult,
      branch: conditionResult ? 'true' : 'false'
    }
  }

  async executeSubprocessNode(node) {
    const config = node.properties || {}

    await this.sleep(1500)

    return {
      success: true,
      output: {
        workflowId: config.workflowId,
        result: '子流程执行完成'
      }
    }
  }

  async executeParallelNode(node) {
    const config = node.properties || {}

    await this.sleep(800)

    return {
      success: true,
      output: {
        branches: config.branches || [],
        result: '并行任务启动'
      }
    }
  }

  // 简单的表达式求值
  evaluateExpression(expression) {
    if (!expression) return true

    try {
      // 在实际应用中应该使用安全的表达式求值库
      // 这里只是简单模拟
      if (expression.includes('>')) {
        const [left, right] = expression.split('>').map(s => s.trim())
        return parseFloat(left) > parseFloat(right)
      }
      return Math.random() > 0.5
    } catch (e) {
      return true
    }
  }

  // 开始执行工作流
  async execute({ reset = true } = {}) {
    if (reset || this.executionStack.length === 0) {
      const startNode = this.findStartNode()
      if (!startNode) {
        throw new Error('No start node found')
      }

      this.executionStack = [startNode]
      this.context = {}
    }

    this.isPaused = false

    while (this.executionStack.length > 0 && !this.isPaused) {
      const currentNode = this.executionStack.shift()
      const result = await this.executeNode(currentNode)

      if (result.paused) {
        // 暂停执行,等待继续
        this.executionStack.unshift(currentNode)
        return { paused: true, pausedAt: currentNode }
      }

      if (result.finished) {
        return { finished: true, context: this.context }
      }

      // 查找下一个节点
      const nextNodes = this.findNextNodes(currentNode.id)

      const currentType = this.getNodeRuntimeType(currentNode)

      // 如果是条件节点,根据分支选择下一个节点
      if (currentType === 'condition' && result.branch) {
        const branchEdge = nextNodes.find(
          ({ edge }) => edge.properties?.condition === result.branch
        )
        if (branchEdge) {
          this.executionStack.push(branchEdge.node)
        }
      } else if (currentType === 'parallel') {
        // 并行节点,将所有分支加入执行栈
        nextNodes.forEach(({ node }) => this.executionStack.push(node))
      } else {
        // 普通节点,按顺序执行
        nextNodes.forEach(({ node }) => this.executionStack.push(node))
      }
    }

    return { finished: !this.isPaused, context: this.context }
  }

  // 继续执行(用于断点调试)
  async resume() {
    this.isPaused = false
    return await this.execute({ reset: false })
  }

  // 单步执行
  async stepOver() {
    if (this.executionStack.length === 0) {
      return { finished: true }
    }

    const currentNode = this.executionStack.shift()
    const result = await this.executeNode(currentNode)

    if (!result.finished) {
      const nextNodes = this.findNextNodes(currentNode.id)

      const currentType = this.getNodeRuntimeType(currentNode)

      if (currentType === 'condition' && result.branch) {
        const branchEdge = nextNodes.find(
          ({ edge }) => edge.properties?.condition === result.branch
        )
        if (branchEdge) {
          this.executionStack.push(branchEdge.node)
        }
      } else {
        nextNodes.forEach(({ node }) => this.executionStack.push(node))
      }
    }

    return {
      finished: result.finished || this.executionStack.length === 0,
      result,
      nextNode: this.executionStack[0]
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
