# QianQian Block (Custom Block CSS + JS)

This is a powerful plugin for SiYuan Note that allows you to inject custom CSS styles and JavaScript scripts into any content block using simple block attributes.

Whether you want to fine-tune the style of a specific block or add unique interactive features, "QianQian Block" makes it easy.

## ✨ Features

- **Custom Block CSS**: Beautify your notes in real-time by adding a `css` attribute to a block and writing CSS rules directly.
- **Custom Block JS**: Inject JavaScript code into blocks via the `js` attribute to implement dynamic interactions, data processing, and other advanced features.
- **Smart Toggles**: Independent master switches for CSS and JS functionalities are provided in the top bar for easy management.
- **Real-time Application**  **&amp;**  **Cleanup**: Both CSS and JS are applied in real-time as you modify the attributes. The plugin automatically cleans up injected styles and scripts when you remove the attributes or turn off the master switch, ensuring no side effects.
- **Advanced JS Cleanup Mechanism**: For complex JS operations (like adding event listeners or timers), you can `return` a cleanup function to define the script's behavior upon termination, ensuring robustness.

## 🚀 How to Use

### Custom CSS

1. Locate the content block you want to style.
2. Open the block's attribute panel and add an attribute named `css`.
3. Write your CSS code directly in the attribute's value field.

**Example:**  Change the text color to red and add a left border.

- **Attribute Name**: `css`
- **Attribute Value**: `color: red; border-left: 3px solid blue;`

### Custom JS

1. Locate the content block you want to add functionality to.
2. Open the block's attribute panel and add an attribute named `js`.
3. Write your JavaScript code directly in the attribute's value field. Inside your code, you can use `this` to refer to the current block's DOM element.

**Example:**  Log the block's ID to the console when it's clicked.

- **Attribute Name**: `js`
- **Attribute Value**: `this.addEventListener('click', () => { console.log(this.getAttribute('data-node-id')); });`

**Advanced Usage:**  For JS that requires cleanup (like `addEventListener` or `setInterval`), you can return a function to perform the cleanup.

- **Attribute Value**:

  ```
  const handleClick = () => console.log('Block was clicked');
  this.addEventListener('click', handleClick);

  // Return a cleanup function
  return () => {
    this.removeEventListener('click', handleClick);
    console.log('Event listener removed');
  };

  ```

## ❤️ Support the Author

If you find this plugin helpful, please consider supporting the author on Afdian. Your support will motivate me to continue updating and maintaining it!

[Afdian Link](https://afdian.com/a/QianQian517 "null")