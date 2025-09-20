# 千千块 (自定义块 CSS + JS)

这是一款为思源笔记设计的强大插件，它允许您通过简单的块属性，为任意内容块注入自定义的 CSS 样式和 JavaScript 脚本。

无论您是想微调某个块的样式，还是想为一个块添加独特的交互功能，“千千块”都能帮您轻松实现。

## ✨ 功能特性

- **自定义块 CSS**: 通过为块添加 `css` 属性，直接在块内编写 CSS 规则，实时美化您的笔记。
- **自定义块 JS**: 通过为块添加 `js` 属性，为块注入 JavaScript 代码，实现动态交互、数据处理等高级功能。
- **智能开关**: 在顶部栏提供独立的 CSS 和 JS 功能总开关，一键启用或禁用，方便管理。
- **实时生效与清理**: 无论是 CSS 还是 JS，插件都能在您修改属性后实时应用。当您删除属性或关闭总开关时，插件会自动清理注入的样式和脚本，确保不留任何副作用。
- **高级 JS 清理机制**: 对于复杂的 JS 操作（如添加事件监听、定时器），您可以通过 `return` 一个清理函数来定义脚本结束时的行为，保证插件的健壮性。

## 🚀 如何使用

### 自定义 CSS

1. 找到您想修改样式的内容块。
2. 打开块属性面板，添加一个名为 `css` 的属性。
3. 在属性值中直接写入您的 CSS 代码即可。

**示例：**  将文字颜色变为红色，并增加一个左边框。

- **属性名**: `css`
- **属性值**: `color: red; border-left: 3px solid blue;`

### 自定义 JS

1. 找到您想添加功能的内容块。
2. 打开块属性面板，添加一个名为 `js` 的属性。
3. 在属性值中直接写入您的 JavaScript 代码。在代码中，您可以使用 `this` 来指代当前块的 DOM 元素。

**示例：**  点击块时，在控制台打印出块的 ID。

- **属性名**: `js`
- **属性值**: `this.addEventListener('click', () => { console.log(this.getAttribute('data-node-id')); });`

**高级用法：**  对于需要清理的 JS（如 `addEventListener` 或 `setInterval`），您可以返回一个函数来执行清理操作。

- **属性值**:

  ```
  const handleClick = () => console.log('块被点击了');
  this.addEventListener('click', handleClick);

  // 返回一个清理函数
  return () => {
    this.removeEventListener('click', handleClick);
    console.log('事件监听已移除');
  };

  ```

## ❤️ 支持作者

如果您觉得这款插件对您有帮助，欢迎通过爱发电支持作者，这将激励我持续更新和维护！

[爱发电链接](https://afdian.com/a/QianQian517 "null")