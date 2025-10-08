# 千千块 (自定义块 CSS + JS)

这是一款为思源笔记设计的强大插件，它允许您通过简单的块属性或便捷的菜单，为任意内容块注入自定义的 CSS 样式、JavaScript 脚本、以及全新的 **HTML块实时编辑** 功能，并集成了多个AI大模型的 **AI侧边栏**。

### 千千块QQ交流群：680418924

## 💗 版本更新

**v1.1.0 新增 AI侧边栏，集成多个AI大模型和一站式AI导航（注意：复制粘贴用ctrl+c和v操作）**

**v1.0.6 新增 html块实时编辑功能（注意：尽量不要快速连续按键，如果整个块被误删，按ctrl+z恢复）**

## ✨ 功能特性
- **AI 侧边栏**: 在思源笔记右侧快速启动一个功能强大的 AI 助手，集成了多个 AI大模型，并可通过下拉菜单轻松切换，让您在思源笔记中即可无缝使用 AI 服务。
- **HTML块实时编辑**: 直接点击任意 HTML 块即可开始实时编辑其内容。这是一个真正的所见即所得体验，具备自动光标恢复、焦点锁定和快速输入保护等特性，确保编辑过程稳定流畅。
- **便捷菜单编辑器**: 点击任意块左侧的块图标，即可在弹出的菜单中直接找到 “自定义块CSS” 和 “自定义块JS” 选项，并进行实时编辑，告别繁琐的属性面板操作。
- **自定义块 CSS**: 通过为块添加 `css` 属性，直接在块内编写 CSS 规则，实时美化您的笔记。
- **自定义块 JS**: 通过为块添加 `js` 属性，为块注入 JavaScript 代码，实现动态交互、数据处理等高级功能。
- **智能开关**: 在顶部栏提供独立的自定义块 CSS、JS 和 HTML块实时编辑功能总开关，一键启用或禁用，方便管理。
- **实时生效与清理**: 无论是 CSS 还是 JS，插件都能在您修改后实时应用。当您清空代码或关闭总开关时，插件会自动清理注入的样式和脚本，确保不留任何副作用。
- **高级 JS 清理机制**: 对于复杂的 JS 操作（如添加事件监听、定时器），您可以通过 `return` 一个清理函数来定义脚本结束时的行为，保证插件的健壮性。

## 🚀 如何使用

我们强烈推荐通过块菜单来使用本插件：

1. 点击您想修改的块左侧的块图标（例如段落块的 `¶` 图标）。
2. 在弹出的菜单中，选择 **插件** -\>  **“自定义块CSS”**  或  **“自定义块JS”** 。
3. 在展开的编辑区内直接输入您的代码。代码会自动保存并实时生效。

当然，您也可以通过手动为块添加 `css` 或 `js` 自定义属性的方式来进行操作，效果是完全相同的。

### 自定义 CSS 示例

将文字颜色变为红色，并增加一个左边框。

- **属性名**: `css`
- **属性值**: `color: red; border-left: 3px solid blue;`

### 自定义 JS 示例

点击块时，通过通知栏弹出块的ID。

- **属性名**: `js`
- **属性值**:

```
this.addEventListener('click', () => {
  fetch('/api/notification/pushMsg', {
    method: 'POST',
    body: JSON.stringify({
      msg: '块的ID是：' + this.getAttribute('data-node-id'),
      timeout: 3000,
    }),
  });
});
```

**高级用法：**  对于需要清理的 JS（如 `addEventListener` 或 `setInterval`），您可以 `return` 一个函数来执行清理操作。

- **属性值**:

```
const handleClick = () => {
  fetch('/api/notification/pushMsg', {
    method: 'POST',
    body: JSON.stringify({ msg: '块被点击了', timeout: 3000 }),
  });
};
this.addEventListener('click', handleClick);

// 返回一个清理函数
return () => {
  this.removeEventListener('click', handleClick);
  fetch('/api/notification/pushMsg', {
    method: 'POST',
    body: JSON.stringify({ msg: '事件监听器已移除', timeout: 3000 }),
  });
};
```

## ❤️ 支持作者

如果您觉得这款插件对您有帮助，欢迎在爱发电上支持作者。您的支持是我持续更新和维护的最大动力！

[爱发电链接](https://afdian.com/a/QianQian517 "千千块祝你心想事成，好运连连")
