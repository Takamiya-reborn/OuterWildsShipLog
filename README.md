# <img src="src/assets/img/favicon.ico" alt="icon" style="vertical-align: middle; width: 26px; height: 26px;"> OuterWildsShipLog

模仿游戏内的航行日志，打造出的用于对照补完《星际拓荒》（Outer Wilds）的飞船日志，解决强迫症和找不到路的问题的页面。

整个星系的知识节点以图表形式铺开，可以自由拖拽平移、缩放浏览，点击节点查看详情，用来对照检查自己还有哪些传闻没有补完、哪些地点还没去过。

## 功能特性

- **交互式知识图谱**：还原游戏内飞船日志的节点连线形式，收录 89 个知识节点、74 条关联关系
- **六大分类分区**：按颜色划分——量子卫星探索、灰烬双星计划、寻找宇宙之眼、挪麦生活、鹿人文明、过渡记录
- **自由浏览**：鼠标拖拽平移、滚轮以鼠标为中心缩放；移动端支持单指拖拽、双指捏合缩放
- **节点详情**：点击节点弹出详情面板，点击空白处关闭
- **响应式布局**：窗口大小变化时自动适配
- **性能优化**：节点先以色块占位立即绘制，图片异步加载后替换，不阻塞首屏

## 技术栈

- [Vite](https://vitejs.dev/) — 开发与构建
- [Konva](https://konvajs.org/) — Canvas 图表渲染与交互
- [Docker](https://www.docker.com/) + Nginx — 生产部署

## 快速开始

环境要求：Node.js 24（仓库通过 [Volta](https://volta.sh/) 固定了版本）

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本（输出到 dist/）
npm run build
```

## Docker 部署

```bash
docker compose up -d --build
```

会在 80 端口启动一个 Nginx 容器，托管构建后的静态文件。多阶段构建：Node 阶段负责构建，运行阶段只保留 Nginx 与静态产物。Nginx 配置了 gzip、静态资源缓存与 SPA 回退规则。

## 项目结构

```
├── index.html                      # 入口页面
├── src/
│   ├── main.js                     # 主逻辑：渲染节点/边、平移缩放、详情弹窗、移动端适配
│   ├── style.css
│   └── assets/
│       ├── data/
│       │   ├── graph-data.json     # 图谱数据（nodes + edges）
│       │   └── 数据命名参考.js       # 各地点节点的命名 id 对照表
│       └── img/
├── public/
│   └── img/                        # 节点配图
├── scripts/
│   └── convert-to-webp.mjs         # PNG 转 WebP 的一次性压缩脚本
├── nginx.conf
├── Dockerfile
└── docker-compose.yml
```

## 数据维护

图谱内容全部来自 [graph-data.json](src/assets/data/graph-data.json)：

- `nodes`：每个节点包含 `id`、`title`、`img`、`x`、`y`、`width`、`height`、`type`（颜色分区）与 `detail`（点击详情文本）
- `edges`：通过 `from` / `to` 引用节点 `id` 建立连线

新增节点时，命名 id 请参考[数据命名参考.js](src/assets/data/数据命名参考.js) 中的 `星系区域-地点` 约定（如 `TH-Village`、`ET-QuantumCaves`）。

节点配图放在 `public/img/` 下。如需批量压缩 PNG 图片，可运行：

```bash
node scripts/convert-to-webp.mjs
```

该脚本会把 `public/img` 下的 PNG 转为 WebP（质量 82）并删除原文件，同时自动更新 `graph-data.json` 中的图片路径。

## 许可证

[MIT](LICENSE)
