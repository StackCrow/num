# 计数器 PWA

一个简单的60秒倒计时计数器应用，支持iOS添加到主屏幕。

## 功能

- 大按钮计数，带震动反馈
- 60秒自动倒计时
- 实时数据表格
- 历史记录保存
- 离线可用

## 使用方法

1. 在浏览器中打开 `index.html`
2. 点击按钮开始计数
3. 60秒后自动停止并保存记录
4. 点击"历史"查看过往记录

## 添加到iOS主屏幕

1. 在Safari中打开应用
2. 点击分享按钮（方框+箭头）
3. 选择"添加到主屏幕"
4. 点击"添加"

## 部署到GitHub Pages

1. 创建GitHub仓库
2. 上传所有文件
3. 在Settings > Pages中启用
4. 选择main分支

## 部署到Vercel

1. 访问 vercel.com
2. 导入GitHub仓库
3. 自动部署

## 文件结构

- `index.html` - 主页面
- `style.css` - 样式
- `app.js` - 逻辑
- `manifest.json` - PWA配置
- `service-worker.js` - 离线缓存
- `icons/` - 应用图标
