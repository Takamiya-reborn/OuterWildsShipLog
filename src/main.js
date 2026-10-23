import Konva from "konva"
import graphData from './assets/data/graph-data.json'
import { stage, layer, contentGroup } from './scene.js'
import { drawGrid, drawStars } from './background.js'
import { drawNodes } from './nodes.js'
import { drawEdges } from './edges.js'
import { initInteractions } from './interactions.js'
import { loadImage } from './utils.js'

// 入口：初始化流程

drawGrid()
drawStars()
addLogo()
drawNodes()
drawEdges()
layer.add(contentGroup) // 节点/边就绪后再入层
initInteractions()

// 网页字体（Noto Sans SC）按 unicode-range 分包且异步加载，canvas 文字不会自动触发下载，
// 用所有节点标题强制加载对应字符子包，完成后重绘一次
const titleSample = graphData.nodes.map((n) => n.label).join('');
document.fonts.load('500 22px "Noto Sans SC"', titleSample).then(() => layer.batchDraw());

// logo（右下角）
async function addLogo() {
    try {
        const logoSrc = new URL('./assets/img/game-name.png', import.meta.url).href;
        const logoImg = await loadImage(logoSrc);
        const logo = new Konva.Image({
            image: logoImg,
            x: stage.width() - logoImg.width * 0.3 - 20,
            y: stage.height() - logoImg.height * 0.3 - 20,
            scaleX: 0.3,
            scaleY: 0.3,
        });
        layer.add(logo);
        contentGroup.moveToTop()
        layer.batchDraw();
    } catch (error) {
        console.error('Logo加载失败:', error);
    }
}

// 窗口 resize：网格/星空按新尺寸重绘
window.addEventListener('resize', () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);
    drawGrid();
    drawStars(); // 种子固定，星星位置不跳变
    layer.batchDraw();
});

// 剧透拦截弹窗：图谱在遮罩下照常初始化（模糊可见），确认后淡出展示
const spoilerGate = document.getElementById('spoilerGate');
document.getElementById('spoilerConfirm').addEventListener('click', () => {
    spoilerGate.classList.add('hidden');
});
