import Konva from "konva"

// 共享状态：舞台、图层与各容器组

export const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight,
});

export const layer = new Konva.Layer();
stage.add(layer);

// 网格、星空：先于内容组入层，保持在底层
export const gridGroup = new Konva.Group();
layer.add(gridGroup);

export const starGroup = new Konva.Group();
layer.add(starGroup);

// 内容组：承载节点和边，平移缩放作用于此
// 注意：在节点/边绘制完成后再加入图层（见 main.js）
export const contentGroup = new Konva.Group({
    x: stage.width() / 2,
    y: stage.height() / 2,
    scaleX: 1,
    scaleY: 1,
})

// 透明背景，撑满拖拽/缩放范围
export const contentBackground = new Konva.Rect({
    x: -stage.width() * 10,
    y: -stage.height() * 10,
    width: stage.width() * 20,
    height: stage.height() * 20,
    fill: 'transparent'
})
contentGroup.add(contentBackground)

export const edgesGroup = new Konva.Group()
export const nodesGroup = new Konva.Group()
contentGroup.add(edgesGroup)
contentGroup.add(nodesGroup)
