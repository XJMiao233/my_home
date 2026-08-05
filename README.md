# xjmiao.top 优化文件

## 📁 文件清单

| 文件 | 说明 | 替换位置 |
|------|------|----------|
| `index.html` | 优化后的 HTML | 网站根目录 `index.html` |
| `style.css` | 优化后的 CSS | `css/style.css` |
| `main.js` | 优化后的 JS | `js/main.js` |
| `original-style.css` | 原始 CSS 备份 | - |
| `original-main.js` | 原始 JS 备份 | - |

---

## ✨ 优化内容汇总

### 🔴 SEO 优化（新增）
- `<meta name="description">` 搜索描述
- `<meta name="keywords">` 关键词
- `<meta name="author">` 作者
- `<meta name="theme-color">` 移动端状态栏颜色
- Open Graph 标签（社交分享卡片）
- Twitter Card 标签
- JSON-LD 结构化数据（搜索引擎理解个人信息）
- `<main>` 语义化标签

### 🚀 性能优化
- **头像 WebP 支持**：`<picture>` 标签，优先加载 WebP 格式
- **头像 `fetchpriority="high"`**：提升首屏关键图片优先级
- **头像 `width`/`height` 属性**：避免布局偏移（CLS）
- **Google Fonts 异步加载**：`preload` + `media="print"` + `onload` 方案，不再阻塞渲染
- **Font Awesome 升级到 6.5.1** 并异步加载
- **`<link rel="preconnect">`**：预连接字体服务器
- **`<link rel="preload">`**：预加载 CSS、JS、头像图片
- **Loading 骨架屏**：页面加载时显示旋转动画，避免白屏
- **`will-change` 提示**：为动画元素添加 GPU 加速提示
- **`requestAnimationFrame` 节流**：滚动事件使用 rAF 节流
- **移动端粒子系统禁用**：768px 以下关闭背景粒子和浮动元素
- **`prefers-reduced-motion` 支持**：尊重用户系统级减少动画偏好

### ♿ 无障碍优化
- **`aria-label`**：导航、按钮、社交链接添加无障碍标签
- **`aria-hidden="true"`**：装饰性图标标记为隐藏
- **`aria-expanded`**：汉堡菜单展开状态
- **`role="navigation"`**：导航栏语义角色
- **`role="alert"` + `aria-live="polite"`**：通知弹窗无障碍
- **表单 `<label>`**：添加 `sr-only` 标签（屏幕阅读器可读）
- **`autocomplete`**：表单输入添加自动填充提示
- **键盘支持**：汉堡菜单支持 Enter/Space 操作
- **链接 `target="_blank"` 安全**：添加 `rel="noopener noreferrer"`

### 🐛 Bug 修复
- **`Codeing` → `Coding`**：修复拼写错误
- **年份动态化**：页脚年份用 JS 自动获取，不再硬编码
- **`<button>` → `<a>`**：导航按钮改为语义正确的链接标签
- **`lang="ja"`**：日语问候添加语言标注

### 📝 其他改进
- **表单增强**：添加 Formspree 后端支持（替换 `your-form-id` 即可启用）
- **表单验证**：提交前检查必填字段
- **Font Awesome 升级**：6.0.0-beta3 → 6.5.1 正式版
- **通知系统增强**：新增 error 类型样式，添加 max-width 防溢出
- **CSS `::before`/`::after` reset**：`box-sizing` 覆盖伪元素
- **`-webkit-backdrop-filter`**：Safari 兼容性前缀
- **`flex-shrink: 0`**：联系图标防止被压缩

---

## 🛠️ 使用方法

### 方式一：直接替换（推荐）
1. 将 `index.html` 替换网站根目录的 `index.html`
2. 将 `style.css` 替换 `css/style.css`
3. 将 `main.js` 替换 `js/main.js`

### 方式二：手动合并
如果网站有其他自定义修改，对照 `README.md` 中的优化项逐一合并。

---

## ⚠️ 需要你做的

1. **头像 WebP**：用 `cwebp -q 80 images/avatar.jpg -o images/avatar.webp` 生成 WebP 版本（可选，不生成也能正常回退到 JPG）
2. **表单后端**：如需联系表单真正可用，去 [Formspree](https://formspree.io/) 注册，获取 form ID 替换 HTML 中的 `your-form-id`
3. **GitHub 链接**：确认 `https://github.com/XJMiao233` 是否正确（原始代码中有此链接）
