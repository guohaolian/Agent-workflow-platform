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
        agentName: '数据处理',
        agentType: 'data-processor',
        operation: 'transform',
        inputData: ''
      }
    },
    {
      type: 'condition',
      label: '条件分支',
      icon: 'branch',
      color: '#ffc107',
      config: {
        expression: '',
        conditions: [
          { name: 'true', expression: '', target: '' },
          { name: 'false', expression: '', target: '' }
        ]
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

  // Actions
  function getNodeType(type) {
    return nodeTypes.value.find(nt => nt.type === type)
  }

  function selectNode(node) {
    selectedNode.value = node
  }

  function clearSelection() {
    selectedNode.value = null
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
    getNodeType,
    selectNode,
    clearSelection,
    registerAgent,
    getAgent
  }
})
