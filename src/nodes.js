import Konva from "konva"
import graphData from './assets/data/graph-data.json'
import { stage, layer, nodesGroup } from './scene.js'
import { showDetail } from './popup.js'
import { loadImage, lightenColor } from './utils.js'

// 节点绘制

// 节点类型（按颜色分区）
const nodeTypes = {
    purple: { color: '#4f3a8d', label: '量子卫星探索' },
    orange: { color: '#ffa768', label: '灰烬双星计划' },
    green: { color: '#388a5d', label: '寻找宇宙之眼' },
    red: { color: '#b44a4a', label: '挪麦生活' },
    gray: { color: '#7f807a', label: '过渡记录' },
    blue: { color: '#1d4a94', label: '鹿人文明' }
};

const nodes = graphData.nodes.map(node => ({
    ...node,
    img: new URL(node.img, import.meta.url).href
}))

// 图片异步加载：节点先以色块占位，加载完替换并重绘
function loadNodeImage(node, contentImage) {
    loadImage(node.img)
        .then(img => {
            // 等比缩放适配容器
            const containerW = node.width * 0.95
            const containerH = node.height * 0.95
            const scale = Math.min(containerW / img.width, containerH / img.height)

            contentImage.image(img)
            contentImage.width(img.width * scale)
            contentImage.height(img.height * scale)
            layer.batchDraw()
        })
        .catch(err => console.error(err.message))
}

export function drawNodes() {
    nodes.forEach(node => {
        const group = new Konva.Group({
            x: node.x,
            y: node.y,
            id: node.id,
            cursor: 'pointer',
        })

        // 标题栏
        const titleHeight = node.width * 0.35
        const titleRect = new Konva.Rect({
            width: node.width,
            height: titleHeight,
            fill: nodeTypes[node.type].color,
            strokeWidth: 1,
            shadowColor: nodeTypes[node.type].color,
            shadowBlur: 1,
            shadowOpacity: 0.6
        })

        const titleText = new Konva.Text({
            text: node.label,
            fontSize: 22 * (node.width / 160),
            fill: '#1b1b1bff',
            align: 'center',
            verticalAlign: 'middle',
            width: node.width * 0.95,
            height: titleHeight * 0.95,
            fontStyle: '500', // 中等字重，canvas 小字号下不糊
            fontFamily: 'Space Mono, Noto Sans SC, Microsoft YaHei UI, sans-serif',
        })

        // 内容区
        const contentRect = new Konva.Rect({
            y: titleHeight - 1,
            width: node.width,
            height: node.height,
            fill: nodeTypes[node.type].color,
            strokeWidth: 1,
        })

        // 内容图片（占位，异步加载）
        const offsetX = 0.05 * node.width / 2
        const offsetY = 0.05 * node.height / 2
        const contentImage = new Konva.Image({
            x: offsetX,
            y: titleHeight + offsetY,
        })
        loadNodeImage(node, contentImage)

        // 交互：hover 变浅色 / 点击显示详情
        group.on('mouseover', () => {
            const lighter = lightenColor(nodeTypes[node.type].color, 0.3)
            titleRect.fill(lighter)
            contentRect.fill(lighter)
            stage.container().style.cursor = 'pointer'
            layer.batchDraw()
        })
        group.on('mouseout', () => {
            titleRect.fill(nodeTypes[node.type].color)
            contentRect.fill(nodeTypes[node.type].color)
            stage.container().style.cursor = 'auto'
            layer.batchDraw()
        })
        group.on('click', (e) => {
            e.cancelBubble = true
            showDetail(node)
        })
        group.on('tap', (e) => {
            e.cancelBubble = true
            showDetail(node)
        })

        group.add(titleRect)
        group.add(titleText)
        group.add(contentRect)
        group.add(contentImage)
        nodesGroup.add(group)
    })
}
