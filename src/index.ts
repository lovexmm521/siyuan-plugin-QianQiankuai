import { Plugin, Menu } from "siyuan";
import "./index.scss";
import { FreeCSS } from "./freecss";
import { FreeJS } from "./freejs";

// 定义一个浪漫的爱心SVG图标
const ROMANTIC_ICON_SVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><path d="M896 192c-53.024-53.024-124.928-81.92-200.448-81.92s-147.456 28.896-200.448 81.92L512 209.024 438.912 192C385.888 138.976 314 110.08 238.464 110.08S91.04 138.976 38.016 192C-14.976 244.992-14.976 331.008 38.016 384L512 857.984l473.984-473.984c53.024-53.024 53.024-139.008 0-192z"></path></svg>`;
const STORAGE_NAME = "romantic-plugin-config";

export default class RomanticPlugin extends Plugin {

    private freeCss: FreeCSS;
    private freeJs: FreeJS;
    private isCssEnabled: boolean;
    private isJsEnabled: boolean;

    async onload() {
        this.freeCss = new FreeCSS();
        this.freeJs = new FreeJS();

        // 读取保存的设置
        const config = await this.loadData(STORAGE_NAME);
        this.isCssEnabled = config?.isCssEnabled ?? false;
        this.isJsEnabled = config?.isJsEnabled ?? false;

        // 如果上次是启用状态，则在启动时自动启用
        if (this.isCssEnabled) {
            this.freeCss.enable();
        }
        if (this.isJsEnabled) {
            this.freeJs.enable();
        }
    }

    onLayoutReady() {
        this.addTopBar({
            icon: ROMANTIC_ICON_SVG,
            title: this.i18n.pluginName,
            position: "right",
            callback: (event) => {
                this.showMenu(event.target as HTMLElement);
            }
        });
    }

    onunload() {
        this.freeCss.disable();
        this.freeJs.disable();
    }

    private createCustomMenuItem(labelText: string, isChecked: boolean): HTMLElement {
        const menuItem = document.createElement("div");
        menuItem.className = "b3-menu__item";
        menuItem.innerHTML = `
            <div class="romantic-menu-item">
                <span class="item-label fn__flex-1">${labelText}</span>
                <span class="fn__space"></span>
                <input type="checkbox" class="b3-switch">
            </div>
        `;
        const switchInput = menuItem.querySelector("input[type='checkbox']") as HTMLInputElement;
        switchInput.checked = isChecked;
        return menuItem;
    }

    private showMenu(rectElement: HTMLElement) {
        const menu = new Menu("romantic-menu");
        const rect = rectElement.getBoundingClientRect();

        // "自定义块css" 菜单项
        const cssItem = this.createCustomMenuItem(this.i18n.title1, this.isCssEnabled);
        const cssSwitch = cssItem.querySelector("input[type='checkbox']") as HTMLInputElement;
        cssSwitch.addEventListener("click", () => {
            this.isCssEnabled = cssSwitch.checked;
            this.isCssEnabled ? this.freeCss.enable() : this.freeCss.disable();
            this.saveSettings(); // 保存设置
        });
        menu.addItem({ element: cssItem });

        // "自定义块js" 菜单项
        const jsItem = this.createCustomMenuItem(this.i18n.title2, this.isJsEnabled);
        const jsSwitch = jsItem.querySelector("input[type='checkbox']") as HTMLInputElement;
        jsSwitch.addEventListener("click", () => {
            this.isJsEnabled = jsSwitch.checked;
            this.isJsEnabled ? this.freeJs.enable() : this.freeJs.disable();
            this.saveSettings(); // 保存设置
        });
        menu.addItem({ element: jsItem });

        menu.addSeparator();

        // "自定义块提示词" 网站链接
        menu.addItem({
            icon: "iconLink",
            label: this.i18n.promptLink,
            click: () => {
                window.open("https://ld246.com/article/1758370873475");
            }
        });

        // "极简学习法" 网站链接
        menu.addItem({
            icon: "iconLink",
            label: this.i18n.learningLink,
            click: () => {
                window.open("https://sstudy.wiki/");
            }
        });

        if (this.isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        }
    }

    private saveSettings() {
        this.saveData(STORAGE_NAME, {
            isCssEnabled: this.isCssEnabled,
            isJsEnabled: this.isJsEnabled
        });
    }
}

