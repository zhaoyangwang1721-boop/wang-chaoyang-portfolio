# 王朝阳个人作品集

React + Vite + Tailwind CSS v4 + Motion + hls.js 制作的响应式个人作品集。首屏采用全屏 Mux HLS 影像和透明玻璃导航，后续保留完整个人介绍、服务、履历、代表电影项目及 20 张原海报灯箱。

## 本地运行

```bash
pnpm install
pnpm dev
```

默认访问 Vite 输出的本地地址。本机当前 `5173` 被其他项目占用，因此本轮预览使用 `http://127.0.0.1:5174/`。

## 构建

```bash
pnpm build
```

生产文件输出到 `dist/`。

## 关键目录

- `src/main.jsx`：页面组件、HLS 视频、电影交互与灯箱。
- `src/data/profile.js`：个人资料、服务、经历和电影项目数据。
- `src/styles.css`：Tailwind v4 入口、玻璃首屏和长页样式。
- `static/images/filmography/`：20 张用户提供的原版电影海报。
- `qa/`：桌面、手机与灯箱验证截图。

## 发布边界

上线前仍需确认正式域名、数据公开口径、身份表述及电影海报公开展示授权。
