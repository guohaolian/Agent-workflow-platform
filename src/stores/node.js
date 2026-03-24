import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNodeStore = defineStore('node', () => {
  // 节点类型定义
  const nodeTypes = ref([
    {
      type: 'start',
      label: '开始',
      icon: 'play',
      color: '#00e676',
      config: {
        description: '工作流起点'
      }
    },
    {
      type: 'end',
      label: '结束',
      icon: 'stop',
      color: '#ff5252',
      config: {
        description: '工作流终点'
      }
    },
    {
      type: 'agent',
      label: 'LLM智能体',
      icon: 'robot',
      color: '#0066cc',
      config: {
        description: '通用大模型节点，可用于问答、生成和分析',
        agentName: 'LLM智能体',
        agentType: 'llm',
        llmProvider: 'deepseek',
        prompt: '',
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 1000,
        apiKey: ''
      }
    },
    {
      type: 'agent',
      label: 'HTTP请求',
      icon: 'link',
      color: '#17a2b8',
      config: {
        description: '调用外部HTTP接口，支持GET/POST等方法',
        agentName: 'HTTP请求',
        agentType: 'http',
        url: '',
        method: 'GET',
        headers: {},
        body: ''
      }
    },
    {
      type: 'agent',
      label: '视频下载',
      icon: 'video',
      color: '#e83e8c',
      config: {
        description: '抓取视频元数据并执行下载流程',
        agentName: '视频下载',
        agentType: 'video-download',
        platform: 'douyin',
        videoUrl: '',
        quality: 'high'
      }
    },
    {
      type: 'agent',
      label: '数据处理',
      icon: 'data',
      color: '#6c757d',
      config: {
        description: '对输入数据执行转换、过滤、聚合等处理',
        agentName: '数据处理',
        agentType: 'data-processor',
        operation: 'transform',
        inputData: ''
      }
    },
    {
      type: 'agent',
      label: '文本摘要',
      icon: 'analysis',
      color: '#3f8cff',
      config: {
        description: '将长文本压缩为结构化摘要',
        agentName: '文本摘要',
        agentType: 'llm',
        llmProvider: 'deepseek',
        prompt: '请对输入内容生成简洁摘要，并提取3个关键要点。',
        systemPrompt: '你是一个擅长信息压缩和结构化表达的助手。',
        temperature: 0.3,
        maxTokens: 800,
        apiKey: ''
      }
    },
    {
      type: 'agent',
      label: '多语言翻译',
      icon: 'robot',
      color: '#1d4ed8',
      config: {
        description: '将输入内容翻译为目标语言并保持语义准确',
        agentName: '多语言翻译',
        agentType: 'llm',
        llmProvider: 'deepseek',
        prompt: '请将输入内容翻译为英文，并保留专有名词。',
        systemPrompt: '你是专业翻译助手，输出准确、自然、可读。',
        temperature: 0.2,
        maxTokens: 1200,
        apiKey: ''
      }
    },
    {
      type: 'agent',
      label: '网页抓取',
      icon: 'web',
      color: '#0ea5a8',
      config: {
        description: '抓取网页或API数据，常用于数据采集',
        agentName: '网页抓取',
        agentType: 'http',
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        body: ''
      }
    },
    {
      type: 'agent',
      label: 'Webhook回调',
      icon: 'link',
      color: '#14b8a6',
      config: {
        description: '向业务系统发送回调通知或结果推送',
        agentName: 'Webhook回调',
        agentType: 'http',
        url: 'https://api.example.com/webhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: '{"status":"ok","message":"workflow completed"}'
      }
    },
    {
      type: 'agent',
      label: '数据过滤',
      icon: 'data',
      color: '#64748b',
      config: {
        description: '过滤无效字段或不满足条件的数据项',
        agentName: '数据过滤',
        agentType: 'data-processor',
        operation: 'filter',
        inputData: ''
      }
    },
    {
      type: 'agent',
      label: '结果聚合',
      icon: 'share',
      color: '#f97316',
      config: {
        description: '汇总多个步骤输出，生成统一结果',
        agentName: '结果聚合',
        agentType: 'data-processor',
        operation: 'aggregate',
        inputData: ''
      }
    },
    {
      type: 'agent',
      label: '人工审批',
      icon: 'analysis',
      color: '#ca8a04',
      config: {
        description: '等待人工确认后再继续执行后续流程',
        agentName: '人工审批',
        agentType: 'custom',
        customConfig: '{"approver":"operator","timeoutMinutes":30}'
      }
    },
    {
      type: 'condition',
      label: '条件分支',
      icon: 'branch',
      color: '#ffc107',
      config: {
        expression: ''
      }
    },
    {
      type: 'subprocess',
      label: '子流程',
      icon: 'folder',
      color: '#7c3aed',
      config: {
        workflowId: '',
        inputMapping: {},
        outputMapping: {}
      }
    },
    {
      type: 'parallel',
      label: '并行网关',
      icon: 'share',
      color: '#ff6b9d',
      config: {
        branches: [],
        waitAll: true
      }
    }
  ])

  // 已注册的Agent能力
  const registeredAgents = ref([
    {
      id: 'gpt-analyzer',
      name: 'GPT分析器',
      icon: 'analysis',
      type: 'llm',
      capabilities: ['文本分析', '情感识别', '摘要生成'],
      description: '基于GPT的智能分析Agent'
    },
    {
      id: 'data-processor',
      name: '数据处理器',
      icon: 'data',
      type: 'tool',
      capabilities: ['数据清洗', '格式转换', '统计分析'],
      description: '通用数据处理Agent'
    },
    {
      id: 'web-crawler',
      name: '网页爬虫',
      icon: 'web',
      type: 'tool',
      capabilities: ['网页抓取', '内容提取', 'API调用'],
      description: 'Web数据采集Agent'
    }
  ])

  // 当前选中的节点
  const selectedNode = ref(null)
  // 当前选中的连线
  const selectedEdge = ref(null)

  // Actions
  function getNodeType(type) {
    return nodeTypes.value.find(nt => nt.type === type)
  }

  function selectNode(node) {
    selectedNode.value = node
    selectedEdge.value = null
  }

  function selectEdge(edge) {
    selectedEdge.value = edge
    selectedNode.value = null
  }

  function clearSelection() {
    selectedNode.value = null
    selectedEdge.value = null
  }

  function registerAgent(agent) {
    registeredAgents.value.push(agent)
  }

  function getAgent(id) {
    return registeredAgents.value.find(a => a.id === id)
  }

  return {
    nodeTypes,
    registeredAgents,
    selectedNode,
    selectedEdge,
    getNodeType,
    selectNode,
    selectEdge,
    clearSelection,
    registerAgent,
    getAgent
  }
})
