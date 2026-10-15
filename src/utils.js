// 通用工具

export function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`图片加载失败：${src}`))
        img.src = src
    })
}

// 颜色向白色插值（amount: 0~1）
export function lightenColor(hex, amount) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(char => char.repeat(2)).join('');

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    const mix = c => Math.round(c * (1 - amount) + 255 * amount);
    const toHex = num => num.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

// mulberry32 伪随机数：种子固定，重绘后分布一致
export function createRandom(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
