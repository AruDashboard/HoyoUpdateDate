# MiHoYo游戏更新日历

包含原神、崩坏：星穹铁道、绝区零的版本更新日期。

## 本地开发

```sh
npm install
npm run dev
```

裁剪字体（发布时会自动裁剪，这个只用于本地预览）：

```sh
npm run predev
```

## 维护数据

编辑 `src/data/updates.ts` 中的 `UPDATE_DATES`，`games` 决定表格列，`events` 每条记录包含：

```js
{
  date: "2026-11-04",  // 更新时间
  game: "原神",
  image: "images/genshin/7.2.avif", // 版本PV图
  text: "7.2 - 坏灭肇始之时",
}
```

数据按时间顺序排列。版本图像放在 `public/images/`，版本PV图来源于对应视频的OG图像，使用`.avif`版本来减小存储。
