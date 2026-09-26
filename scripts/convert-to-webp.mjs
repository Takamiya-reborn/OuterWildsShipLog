// 一次性图片压缩脚本：把 public/img 下的 PNG 转成 WebP 并删除原文件，
// 同时更新 graph-data.json 中的图片路径。
// 用法：node scripts/convert-to-webp.mjs
import { glob } from 'node:fs/promises'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const QUALITY = 82
const IMG_DIR = path.resolve('public/img')
const DATA_FILE = path.resolve('src/assets/data/graph-data.json')

let totalBefore = 0
let totalAfter = 0
const converted = []

for await (const entry of glob(`${IMG_DIR}/**/*.png`)) {
    const outPath = entry.replace(/\.png$/, '.webp')
    const before = (await readFile(entry)).length
    await sharp(entry).webp({ quality: QUALITY }).toFile(outPath)
    const after = (await readFile(outPath)).length

    totalBefore += before
    totalAfter += after
    converted.push(path.basename(entry))
    await unlink(entry)
    console.log(`${path.basename(entry)}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
}

// 同步更新数据文件里的图片路径
if (converted.length > 0) {
    const raw = await readFile(DATA_FILE, 'utf-8')
    const updated = raw.replaceAll('.png', '.webp')
    await writeFile(DATA_FILE, updated)
}

console.log(`\n共转换 ${converted.length} 张图片`)
console.log(`总大小: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`)
