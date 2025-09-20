(()=>{"use strict";var __webpack_modules__={"./src/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`{__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CustomBlockPlugin)
/* harmony export */ });
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! siyuan */ "siyuan");
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(siyuan__WEBPACK_IMPORTED_MODULE_0__);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

const HEART_ICON_SVG = \`<svg viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>\`;
class CustomBlockPlugin extends siyuan__WEBPACK_IMPORTED_MODULE_0__.Plugin {
  // \u63D2\u4EF6\u52A0\u8F7D\u65F6\u6267\u884C
  onload() {
    return __async(this, null, function* () {
      console.log("Custom Block UI Plugin loaded.");
      this.topBarElement = this.addTopBar({
        icon: HEART_ICON_SVG,
        title: this.i18n.pluginName,
        // \u9F20\u6807\u60AC\u505C\u65F6\u7684\u63D0\u793A\u6587\u5B57
        position: "right",
        callback: () => {
          this.showSettingsMenu();
        }
      });
    });
  }
  // \u63D2\u4EF6\u5378\u8F7D\u65F6\u6267\u884C
  onunload() {
    console.log("Custom Block UI Plugin unloaded.");
    this.topBarElement.remove();
  }
  // \u663E\u793A\u8BBE\u7F6E\u83DC\u5355\u7684\u65B9\u6CD5
  showSettingsMenu() {
    const menu = new siyuan__WEBPACK_IMPORTED_MODULE_0__.Menu("custom-block-settings-menu");
    const rect = this.topBarElement.getBoundingClientRect();
    if (document.querySelector("#commonMenu[data-name=custom-block-settings-menu]")) {
      menu.close();
      return;
    }
    const container = document.createElement("div");
    container.className = "custom-block-settings-container";
    container.innerHTML = \`
            <div class="b3-menu__items" style="width: 280px; padding: 8px;">
                <div class="setting-item" style="display: flex; align-items: center; padding: 8px; user-select: none;">
                    <span style="flex-grow: 1;">\\u81EA\\u5B9A\\u4E49\\u5757\\u7684CSS</span>
                    <input class="b3-switch" type="checkbox" id="custom-css-switch">
                </div>
                <div class="setting-item" style="display: flex; align-items: center; padding: 8px; user-select: none;">
                    <span style="flex-grow: 1;">\\u81EA\\u5B9A\\u4E49\\u5757\\u7684JS</span>
                    <input class="b3-switch" type="checkbox" id="custom-js-switch">
                </div>
            </div>
        \`;
    menu.addItem({
      element: container,
      disabled: true
      // \u8BBE\u4E3Adisabled\uFF0C\u8FD9\u6837\u5B83\u672C\u8EAB\u4E0D\u53EF\u70B9\u51FB\uFF0C\u53EA\u4F5C\u4E3A\u5BB9\u5668
    });
    if (this.isMobile) {
      menu.fullscreen();
    } else {
      menu.open({
        x: rect.right,
        y: rect.bottom,
        isLeft: true
        // \u4ECE\u53F3\u5411\u5DE6\u5C55\u5F00
      });
    }
  }
}


//# sourceURL=webpack://plugin-sample/./src/index.ts?
}`)},siyuan:e=>{e.exports=require("siyuan")}},__webpack_module_cache__={};function __webpack_require__(e){var n=__webpack_module_cache__[e];if(n!==void 0)return n.exports;var _=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](_,_.exports,__webpack_require__),_.exports}__webpack_require__.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return __webpack_require__.d(n,{a:n}),n},__webpack_require__.d=(e,n)=>{for(var _ in n)__webpack_require__.o(n,_)&&!__webpack_require__.o(e,_)&&Object.defineProperty(e,_,{enumerable:!0,get:n[_]})},__webpack_require__.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),__webpack_require__.r=e=>{typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var __webpack_exports__=__webpack_require__("./src/index.ts");module.exports=__webpack_exports__})();
