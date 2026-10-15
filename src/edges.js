import Konva from "konva"
import graphData from './assets/data/graph-data.json'
import { stage, layer, contentGroup, edgesGroup } from './scene.js'

// 边绘制

const edges = graphData.edges

const PAGE_BG = '#06101a';   // 页面底色，用于光晕/留白描边
const EDGE_GREY = '#7f807a'; // 连线默认色（hover 变白）
const LINE_W = 5;
const CHEVRON = { w: 39, h: 29, base: 0.6, halo: 1.65, hover: 1.25 };
const CHEVRON_PATH = 'M14.166 0L.16 14.41l13.995 14.417 24.164.007-14.995-14.418L38.328.007z';

// 射线从节点中心指向目标，求与节点矩形的交点（线画到边框为止）
function edgeIntersection(centre, size, targetCentre) {
    const sign = v => (v >= 0 ? 1 : -1);
    const dx = targetCentre.x - centre.x;
    const dy = targetCentre.y - centre.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len, uy = dy / len;
    const hw = size.width / 2, hh = size.height / 2;
    if (Math.abs(uy / ux) < Math.abs(hh / hw)) { // 从左右边穿出
        const x = sign(ux) * hw;
        return { x: centre.x + x, y: centre.y + (uy / ux) * x };
    }
    const y = sign(uy) * hh; // 从上下边穿出
    return { x: centre.x + (ux / uy) * y, y: centre.y + y };
}

// 线段上 t 处的点
function pointAlong(p, q, t) {
    return { x: t * p.x + (1 - t) * q.x, y: t * p.y + (1 - t) * q.y };
}

// 雪佛龙：nudge 为沿箭头方向的前移量
function makeChevron(point, angle, scale, fill, nudge = 0) {
    return new Konva.Path({
        data: CHEVRON_PATH,
        x: point.x + nudge * Math.cos(angle * Math.PI / 180),
        y: point.y + nudge * Math.sin(angle * Math.PI / 180),
        offsetX: CHEVRON.w / 2,
        offsetY: CHEVRON.h / 2,
        rotation: angle,
        scale: { x: scale, y: scale },
        fill,
        listening: false, // 命中检测交给加粗的线
    });
}

export function drawEdges() {
    edges.forEach(edge => {
        const fromNode = contentGroup.findOne(`#${edge.from}`);
        const toNode = contentGroup.findOne(`#${edge.to}`);
        if (!fromNode || !toNode) return;

        // 相对 contentGroup 取矩形（与边的坐标系一致）
        const fromRect = fromNode.getClientRect({ relativeTo: contentGroup });
        const toRect = toNode.getClientRect({ relativeTo: contentGroup });
        const fromCentre = { x: fromRect.x + fromRect.width / 2, y: fromRect.y + fromRect.height / 2 };
        const toCentre = { x: toRect.x + toRect.width / 2, y: toRect.y + toRect.height / 2 };
        const fromSize = { width: fromRect.width, height: fromRect.height };
        const toSize = { width: toRect.width, height: toRect.height };

        const from = edgeIntersection(fromCentre, fromSize, toCentre);
        const to = edgeIntersection(toCentre, toSize, fromCentre);
        const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;

        // 双向连线两个雪佛龙（0.65/0.35，第二个转 180°），单向只有中点
        const chevronTs = edge.reversible ? [0.65, 0.35] : [0.5];

        const group = new Konva.Group();
        // 底层背景色宽线：线条交叉处产生留白断开效果
        group.add(new Konva.Line({
            points: [from.x, from.y, to.x, to.y],
            stroke: PAGE_BG,
            strokeWidth: LINE_W * 2,
            lineCap: 'square',
            hitStrokeWidth: 20,
        }));
        // 上层正常颜色的线
        group.add(new Konva.Line({
            points: [from.x, from.y, to.x, to.y],
            stroke: EDGE_GREY,
            strokeWidth: LINE_W,
            lineCap: 'square',
            hitStrokeWidth: 20,
        }));

        chevronTs.forEach((t, i) => {
            const point = pointAlong(from, to, t);
            const rotation = angle + 180 * i;
            // 光晕雪佛龙：放大 + 背景色 + 前移，给主体留出空隙
            group.add(makeChevron(point, rotation, CHEVRON.base * CHEVRON.halo, PAGE_BG, 3.4 * CHEVRON.base * CHEVRON.halo));
            group.add(makeChevron(point, rotation, CHEVRON.base, EDGE_GREY));
        });

        // hover：线变白 + 雪佛龙放大
        const mainLines = group.getChildren(n => n.getClassName() === 'Line' && n.stroke() === EDGE_GREY);
        const mainChevrons = group.getChildren(n => n.getClassName() === 'Path');
        group.on('mouseenter', () => {
            mainLines.forEach(l => l.stroke('#ffffff'));
            mainChevrons.forEach(c => c.scale({ x: c.scaleX() * CHEVRON.hover, y: c.scaleY() * CHEVRON.hover }));
            stage.container().style.cursor = 'pointer';
            layer.batchDraw();
        });
        group.on('mouseleave', () => {
            mainLines.forEach(l => l.stroke(EDGE_GREY));
            mainChevrons.forEach(c => {
                const s = c === mainChevrons[0] ? CHEVRON.base * CHEVRON.halo : CHEVRON.base;
                c.scale({ x: s, y: s });
            });
            stage.container().style.cursor = 'auto';
            layer.batchDraw();
        });

        edgesGroup.add(group);
    });
}
