# 银行流水图片金额自动汇总

一款前端优先、默认本地处理的银行流水图片 OCR 汇总工具。用户上传银行流水截图或照片后，系统会在浏览器内识别文字、提取金额，并合并多张图片的金额统计结果。

## 功能

- 支持 jpg、jpeg、png 图片上传，支持多张批量上传和手机拍照上传。
- 默认使用 Tesseract.js 在本地浏览器内进行 OCR，不上传银行流水图片。
- 每张图片单独识别，识别完成后立即追加金额到总明细。
- 单张图片识别失败不会影响其他图片继续处理。
- 支持收入、支出、未分类金额统计。
- 支持按图片筛选、取消某张图片全部金额、删除图片并同步删除金额。
- 支持编辑金额、切换类型、取消计入、删除记录、手动新增金额。
- 支持导出 CSV、复制汇总结果、生成简单文字报表。
- 支持 PWA，可添加到手机桌面使用。

## 安装和运行

```bash
cd bank-statement-sum
npm install
npm run dev
```

打开终端显示的本地地址，例如：

```text
http://localhost:5173
```

## 构建和预览

```bash
npm run build
npm run preview
```

构建产物会生成在 `dist/` 目录。

## 部署到 Vercel

1. 将项目推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 新建项目并导入仓库。
3. Framework Preset 选择 `Vite`。
4. Build Command 使用：

```bash
npm run build
```

5. Output Directory 使用：

```text
dist
```

6. 点击 Deploy。

## 部署到 Netlify

1. 将项目推送到代码仓库。
2. 在 Netlify 新建站点并导入仓库。
3. Build command 使用：

```bash
npm run build
```

4. Publish directory 使用：

```text
dist
```

5. 点击 Deploy。

## PWA 添加到手机桌面

### iPhone Safari

1. 用 Safari 打开部署后的网址。
2. 点击底部分享按钮。
3. 选择“添加到主屏幕”。
4. 确认名称后点击“添加”。

### Android Chrome

1. 用 Chrome 打开部署后的网址。
2. 点击右上角菜单。
3. 选择“添加到主屏幕”或“安装应用”。
4. 确认安装。

## 隐私说明

- 默认所有 OCR 都在本地浏览器完成。
- 系统不保存用户图片。
- 系统不上传银行流水到服务器。
- OCR 引擎和语言包首次加载时可能需要网络下载依赖资源，但图片文件不会上传。
- 请自行核对识别结果，本软件只做辅助统计。

## 后续移动端打包

当前项目已经具备 PWA 能力。后续如需发布到 Android 或 iOS，可考虑使用 Capacitor 将 Web 应用打包为原生 App，再接入应用商店发布流程。
