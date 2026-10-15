import Konva from "konva"
import { stage, layer, gridGroup, starGroup } from './scene.js'
import { createRandom } from './utils.js'

// 网格背景 + 星空装饰

export function drawGrid() {
    gridGroup.destroyChildren();
    const gridSize = 50;
    const gridColor = '#1e2a3a';
    const lines = [];
    for (let x = 0; x < stage.width(); x += gridSize)
        lines.push(new Konva.Line({ points: [x, 0, x, stage.height()], stroke: gridColor, strokeWidth: 1 }));
    for (let y = 0; y < stage.height(); y += gridSize)
        lines.push(new Konva.Line({ points: [0, y, stage.width(), y], stroke: gridColor, strokeWidth: 1 }));
    gridGroup.add(...lines);
    layer.batchDraw();
}

// 参与闪烁的星星（各自相位与速度）
const twinklingStars = [];

export function drawStars() {
    starGroup.destroyChildren();
    twinklingStars.length = 0;
    const rand = createRandom(20260415);
    // 数量随屏幕面积缩放
    const count = Math.round((stage.width() * stage.height()) / 18000);
    for (let i = 0; i < count; i++) {
        const x = rand() * stage.width();
        const y = rand() * stage.height();
        // 按亮度分三档
        const bright = rand();
        const dot = new Konva.Circle({
            x, y,
            radius: 0.7 + rand() * 1.1,
            fill: bright < 0.6 ? '#9fb4d8' : bright < 0.9 ? '#c8d6f0' : '#ffffff',
            opacity: 0.25 + rand() * 0.55,
        });
        starGroup.add(dot);
        // 约三成星点参与闪烁
        if (rand() < 0.3)
            twinklingStars.push({ node: dot, phase: rand() * Math.PI * 2, speed: 0.4 + rand() * 0.8, base: dot.opacity(), amp: 0.2 });
    }
    layer.batchDraw();
}

// 闪烁动画：正弦呼吸，限频约 20fps
let lastTwinkle = 0;
const starAnim = new Konva.Animation((frame) => {
    if (frame.time - lastTwinkle < 50) return;
    lastTwinkle = frame.time;
    const t = frame.time / 1000;
    for (const s of twinklingStars)
        s.node.opacity(Math.max(0.05, s.base + Math.sin(t * s.speed + s.phase) * s.amp));
}, layer);
starAnim.start();
