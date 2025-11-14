# QianQian AI Block (Custom Block CSS + JS)

This is a powerful plugin for SiYuan Note that allows you to inject custom CSS styles, JavaScript scripts, 和 the new **real-time HTML block editing** feature into any content block through simple block attributes or a convenient menu, and it also integrates a powerful **AI Sidebar** with multiple large AI models.

## 💗 Release Notes

**v1.2.0 Adds Unlimited AI, providing unlimited free use of all the world's top large AI models.**

**v1.1.30 Adds AI Platform API Interface, Prompt Optimizer, n8n and Dify Workflows (Note: n8n defaults to local port 5678)**

**v1.1.0 Adds the AI Sidebar, integrating multiple large AI models and a one-stop AI navigation hub (Note: Use Ctrl+C and Ctrl+V for copy-paste).**

**v1.0.6 adds the real-time HTML block editing feature. (Note: Please avoid rapid consecutive key presses. If a block is accidentally deleted, use Ctrl+Z to restore it.)**

## ✨ Features

- **AI Sidebar**: Quickly launch a powerful AI assistant on the right side of SiYuan Note. It integrates multiple large AI models, easily switchable via a dropdown menu, allowing you to seamlessly use AI services within your notes.
- **Real-time HTML Block Editing**: Click directly into any HTML block to start editing its content live. It's a true WYSIWYG experience with features like automatic cursor restoration, focus lock, and rapid input protection to ensure stability.
- **Convenient Menu Editor**: Click the block icon to the left of any block to directly find and use the "Custom Block CSS" and "Custom Block JS" options in the context menu for real-time editing, saying goodbye to the cumbersome attribute panel workflow.
- **Custom Block CSS**: Beautify your notes in real-time by adding a `css` attribute to a block and writing CSS rules directly.
- **Custom Block JS**: Inject JavaScript code into blocks via the `js` attribute to implement dynamic interactions, data processing, and other advanced features.
- **Smart Toggles**: Independent master switches for Custom Block CSS, JS, and Real-time HTML Editing functionalities are provided in the top bar for easy management.
- **Real-time Application**  **&amp;**  **Cleanup**: Both CSS and JS are applied in real-time as you modify them. The plugin automatically cleans up injected styles and scripts when you clear the code or turn off the master switch, ensuring no side effects.
- **Advanced JS Cleanup Mechanism**: For complex JS operations (like adding event listeners or timers), you can `return` a cleanup function to define the script's behavior upon termination, ensuring robustness.

## 🚀 How to Use

The recommended way to use this plugin is through the block context menu:

1. Click the block icon (e.g., the `¶` icon for a paragraph) to the left of the block you want to modify.
2. In the pop-up menu, select **Plugin** -\>  **"Custom Block CSS"**  or  **"Custom Block JS"** .
3. Write your code directly in the editor that appears. Your code is saved automatically and takes effect in real-time.

Alternatively, you can still use the traditional block attribute method. The effect is the same.

### Custom CSS Example

Change the text color to red and add a left border.

- **Attribute Name**: `css`
- **Attribute Value**: `color: red; border-left: 3px solid blue;`

### Custom JS Example

Show the block's ID via a notification when clicked.

- **Attribute Name**: `js`
- **Attribute Value**:

```
this.addEventListener('click', () => {
  fetch('/api/notification/pushMsg', {
    method: 'POST',
    body: JSON.stringify({
      msg: 'Block ID is: ' + this.getAttribute('data-node-id'),
      timeout: 3000,
    }),
  });
});

```

**Advanced Usage:**  For JS that requires cleanup (like `addEventListener` or `setInterval`), you can return a function to perform the cleanup.

- **Attribute Value**:

```
const handleClick = () => {
  fetch('/api/notification/pushMsg', {
    method: 'POST',
    body: JSON.stringify({ msg: 'Block was clicked', timeout: 3000 }),
  });
};
this.addEventListener('click', handleClick);

// Return a cleanup function
return () => {
  this.removeEventListener('click', handleClick);
  fetch('/api/notification/pushMsg', {
    method: 'POST',
    body: JSON.stringify({ msg: 'Event listener removed', timeout: 3000 }),
  });
};

```

## ❤️ Support the Author

If you find this plugin helpful, please consider supporting the author on Afdian. Your support will motivate me to continue updating and maintaining it!

[Afdian Link](https://afdian.com/a/QianQian517 "QianQian good lucky")
