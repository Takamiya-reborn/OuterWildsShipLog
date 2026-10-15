import { stage, layer, contentGroup } from './scene.js'

// 平移、缩放交互（滚轮 + 移动端双指）

const MIN_SCALE = 0.3;
const MAX_SCALE = 5;

// 双指缩放状态
let isPinching = false;
let startDistance = 0;
let startScaleX = 1;
let startScaleY = 1;
let startMidLocalX = 0;
let startMidLocalY = 0;

export function initInteractions() {
    // 拖拽平移
    contentGroup.draggable(true)

    stage.on('mousedown', () => { stage.container().style.cursor = 'grabbing' })
    stage.on('mouseup', () => { stage.container().style.cursor = 'auto' })

    // 滚轮缩放：手动实现以鼠标为中心
    stage.on('wheel', (e) => {
        e.evt.preventDefault();
        const stagePos = stage.getPointerPosition();
        if (!stagePos) return;

        const contentPos = contentGroup.position();
        const currentScaleX = contentGroup.scaleX();
        const currentScaleY = contentGroup.scaleY();

        // 鼠标在内容组内的本地坐标
        const localX = (stagePos.x - contentPos.x) / currentScaleX;
        const localY = (stagePos.y - contentPos.y) / currentScaleY;

        const scaleFactor = e.evt.deltaY < 0 ? 1.1 : 0.9;
        const newScaleX = currentScaleX * scaleFactor;
        const newScaleY = currentScaleY * scaleFactor;

        // 保持鼠标本地坐标不变
        contentGroup.scaleX(newScaleX);
        contentGroup.scaleY(newScaleY);
        contentGroup.position({
            x: stagePos.x - localX * newScaleX,
            y: stagePos.y - localY * newScaleY,
        });

        layer.batchDraw();
    });

    stage.on('touchstart', (e) => {
        const touches = e.evt.touches;
        if (touches.length !== 2) return; // 仅处理双指

        e.evt.preventDefault();
        isPinching = true;
        contentGroup.draggable(false) // 防止拖拽

        const [t0, t1] = touches;
        startDistance = Math.hypot(t1.pageX - t0.pageX, t1.pageY - t0.pageY);
        startScaleX = contentGroup.scaleX();
        startScaleY = contentGroup.scaleY();

        // 双指中点 → contentGroup 本地坐标
        const midStagePos = stage.getPointerPosition({
            x: (t0.pageX + t1.pageX) / 2,
            y: (t0.pageY + t1.pageY) / 2,
        });
        const contentPos = contentGroup.position();
        startMidLocalX = (midStagePos.x - contentPos.x) / startScaleX;
        startMidLocalY = (midStagePos.y - contentPos.y) / startScaleY;
    });

    stage.on('touchmove', (e) => {
        if (!isPinching) return;
        const touches = e.evt.touches;
        if (touches.length !== 2) return;

        e.evt.preventDefault();
        const [t0, t1] = touches;
        const scaleFactor = Math.hypot(t1.pageX - t0.pageX, t1.pageY - t0.pageY) / startDistance;

        const newScaleX = Math.min(Math.max(startScaleX * scaleFactor, MIN_SCALE), MAX_SCALE);
        const newScaleY = Math.min(Math.max(startScaleY * scaleFactor, MIN_SCALE), MAX_SCALE);

        const midStagePos = stage.getPointerPosition({
            x: (t0.pageX + t1.pageX) / 2,
            y: (t0.pageY + t1.pageY) / 2,
        });

        // 保持中点本地坐标不变
        contentGroup.scaleX(newScaleX);
        contentGroup.scaleY(newScaleY);
        contentGroup.position({
            x: midStagePos.x - startMidLocalX * newScaleX,
            y: midStagePos.y - startMidLocalY * newScaleY,
        });

        layer.batchDraw();
    });

    stage.on('touchend touchcancel', () => {
        isPinching = false;
        contentGroup.draggable(true)
    });
}
