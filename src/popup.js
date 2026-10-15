import { stage } from './scene.js'

// 详情弹窗

const popup = document.getElementById('detailPopup');
const popupList = document.getElementById('popupList');

export function showDetail(node) {
    // 再次点击同一节点时收起
    const isSameNode = popup.dataset.nodeId === node.id;
    if (!isSameNode) {
        popup.dataset.nodeId = node.id;
        // content 按 \n 分隔为多条记录
        popupList.innerHTML = node.content
            .split('\n')
            .filter(line => line.trim())
            .map(line => `<li>${line}</li>`)
            .join('');
        popup.style.display = 'block'
    } else {
        closePopup()
    }
}

export function closePopup() {
    popup.style.display = 'none';
    delete popup.dataset.nodeId;
    popupList.innerHTML = '';
}

// 点击空白处关闭
stage.on('click', closePopup);
stage.on('tap', closePopup);
