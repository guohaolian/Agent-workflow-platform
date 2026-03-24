import LogicFlow from '@logicflow/core'

/**
 * LogicFlow配置和初始化
 */
export function initLogicFlow(container, options = {}) {
  const lf = new LogicFlow({
    container,
    width: options.width || container.clientWidth,
    height: options.height || container.clientHeight,
    background: {
      color: '#fafbfc'
    },
    grid: {
      visible: true,
      type: 'dot',
      size: 20,
      config: {
        color: '#e0e0e0'
      }
    },
    keyboard: {
      enabled: true
    },
    style: {
      rect: {
        width: 160,
        height: 64,
        radius: 6,
        fill: '#ffffff',
        stroke: '#0066cc',
        strokeWidth: 2
      },
      circle: {
        r: 32,
        fill: '#ffffff',
        stroke: '#0066cc',
        strokeWidth: 2
      },
      diamond: {
        fill: '#ffffff',
        stroke: '#0066cc',
        strokeWidth: 2
      },
      ellipse: {
        fill: '#ffffff',
        stroke: '#0066cc',
        strokeWidth: 2
      },
      polygon: {
        fill: '#ffffff',
        stroke: '#0066cc',
        strokeWidth: 2
      },
      polyline: {
        stroke: '#6c757d',
        strokeWidth: 2
      },
      text: {
        color: '#212529',
        fontSize: 13,
        fontWeight: 500
      },
      nodeText: {
        color: '#212529',
        fontSize: 13,
        fontWeight: 500
      },
      edgeText: {
        color: '#495057',
        fontSize: 12,
        background: {
          fill: '#ffffff',
          height: 20,
          stroke: '#e9ecef',
          radius: 4
        }
      }
    },
    edgeTextDraggable: true,
    adjustEdge: true,
    hoverOutline: true,
    nodeSelectedOutline: true,
    ...options
  })

  return lf
}

/**
 * 注册自定义节点
 * 使用简化的节点定义方式
 */
export function registerCustomNodes(_lf) {
  // 由于 LogicFlow 2.0 的基类可能不同，我们使用内置节点类型并自定义样式
  // 这里不需要复杂的自定义节点
  // LogicFlow 会根据配置自动应用样式
  // 我们只需要确保节点类型存在即可
}

/**
 * 导出工作流数据
 */
export function exportWorkflowData(lf) {
  return lf.getGraphData()
}

/**
 * 导入工作流数据
 */
export function importWorkflowData(lf, data) {
  lf.render(data)
}
