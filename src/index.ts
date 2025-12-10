import { Plugin, Menu, getFrontend, getBackend, showMessage } from "siyuan";
import "./index.scss";
import { FreeCSS } from "./freecss";
import { FreeJS } from "./freejs";
import { FreeHTML } from "./freehtml";
import { BlockMenuManager } from "./menu";
import Dock from "./dock";
import SettingsTab from "./setting";
// --- vvv 助手添加 vvv ---
import MinimalistAI from "./minimalist";
// --- ^^^ 助手添加 ^^^ ---

const ROMANTIC_ICON_SVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><path d="M896 192c-53.024-53.024-124.928-81.92-200.448-81.92s-147.456 28.896-200.448-81.92L512 209.024 438.912 192C385.888 138.976 314 110.08 238.464 110.08S91.04 138.976 38.016 192C-14.976 244.992-14.976 331.008 38.016 384L512 857.984l473.984-473.984c53.024-53.024 124.928-81.92 200.448-81.92s147.456 28.896 200.448 81.92z" fill="#e91e63"></path></svg>`;
const SETTINGS_FILE = "settings.json";

export default class QianQianPlugin extends Plugin {
    private settings: {
        isCssEnabled: boolean;
        isJsEnabled: boolean;
        isHtmlEnabled: boolean;
        customSettingInput: string;
        isActivated: boolean;
    };

    private isPhoneForMenu: boolean;
    private isMobileForDock: boolean;
    private freeCss: FreeCSS;
    private freeJs: FreeJS;
    private freeHtml: FreeHTML;
    private topBarElement: HTMLElement;
    private blockMenuManager: BlockMenuManager;
    private dock: Dock;
    // --- vvv 助手添加 vvv ---
    public minimalistAI: MinimalistAI; // 改为 public 供 dock.ts 访问 (或者保持 private)
    // --- ^^^ 助手添加 ^^^ ---

    async onload() {
        const frontend = getFrontend();
        const backend = getBackend();
        this.isMobileForDock = frontend === "mobile" || frontend === "browser-mobile" || backend === "android" || backend === "ios";
        const isPhoneScreen = window.innerWidth < 768;
        this.isPhoneForMenu = this.isMobileForDock && isPhoneScreen;

        await this.loadSettings();

        this.freeCss = new FreeCSS();
        this.freeJs = new FreeJS();
        this.freeHtml = new FreeHTML();

        if (this.settings.isCssEnabled) {
            this.freeCss.enable();
        }
        if (this.settings.isJsEnabled) {
            this.freeJs.enable();
        }
        if (this.settings.isHtmlEnabled) {
            setTimeout(() => {
                if (this.settings.isHtmlEnabled) {
                    this.freeHtml.enable();
                }
            }, 500);
        }

        this.topBarElement = this.addTopBar({
            icon: ROMANTIC_ICON_SVG,
            title: this.i18n.pluginName,
            position: "right",
            callback: () => {
                this.showTopBarMenu();
            }
        });

        this.blockMenuManager = new BlockMenuManager(this);
        this.blockMenuManager.init();

        // --- vvv 助手修改 vvv ---
        // 1. 初始化 MinimalistAI (必须在 Dock 之前)
        this.minimalistAI = new MinimalistAI(this);

        // 2. 修改 Dock 的初始化，将 'this' 传递进去
        this.dock = new Dock(this);
        // --- ^^^ 助手修改 ^^^ ---

        this.addDock({
            config: {
                position: "Right",
                size: { width: 408, height: 0 },
                icon: "iconSparkles",
                title: "千千AI助手",
            },
            data: {},
            type: "baidu_dock",
            init: (dock: any) => {
                this.dock.render(dock.element, this.isMobileForDock, this.settings);
            }
        });
    }

    openSetting() {
        const settingsDialog = new SettingsTab(this);
        settingsDialog.open(this.settings, (newSettings) => {
            this.settings = newSettings;
            this.saveSettings();
            this.dock.update(this.settings);
        });
    }

    onunload() {
        this.freeCss.disable();
        this.freeJs.disable();
        this.freeHtml.disable();
        console.log("QianQian Plugin unloaded.");
    }

    // --- 新增: 实现 uninstall 方法 ---
    // 这个方法会在用户卸载插件时被思源笔记自动调用
    uninstall() {
        // 调用 removeData API 来删除存储的设置文件
        this.removeData(SETTINGS_FILE);
        console.log("QianQian Plugin uninstalled and all settings data have been removed.");
    }

    private createCustomMenuItem(label: string, isChecked: boolean): HTMLElement {
        const item = document.createElement("div");
        item.className = "b3-menu__item";
        item.innerHTML = `
            <div class="romantic-menu-item">
                <span class="b3-menu__label">${label}</span>
                <input type="checkbox" class="b3-switch" ${isChecked ? "checked" : ""}>
            </div>
        `;
        return item;
    }

    private showTopBarMenu() {
        const rect = this.topBarElement.getBoundingClientRect();
        const menu = new Menu("romantic-menu");

        const cssItem = this.createCustomMenuItem(this.i18n.title1, this.settings.isCssEnabled);
        const cssSwitch = cssItem.querySelector("input[type='checkbox']") as HTMLInputElement;
        cssSwitch.addEventListener("click", () => {
            this.settings.isCssEnabled = cssSwitch.checked;
            this.settings.isCssEnabled ? this.freeCss.enable() : this.freeCss.disable();
            this.saveSettings();
        });
        menu.addItem({ element: cssItem });

        const jsItem = this.createCustomMenuItem(this.i18n.title2, this.settings.isJsEnabled);
        const jsSwitch = jsItem.querySelector("input[type='checkbox']") as HTMLInputElement;
        jsSwitch.addEventListener("click", () => {
            this.settings.isJsEnabled = jsSwitch.checked;
            this.settings.isJsEnabled ? this.freeJs.enable() : this.freeJs.disable();
            this.saveSettings();
        });
        menu.addItem({ element: jsItem });

        const htmlItem = this.createCustomMenuItem(this.i18n.title3, this.settings.isHtmlEnabled);
        const htmlSwitch = htmlItem.querySelector("input[type='checkbox']") as HTMLInputElement;
        htmlSwitch.addEventListener("click", () => {
            this.settings.isHtmlEnabled = htmlSwitch.checked;
            if (this.settings.isHtmlEnabled) {
                this.freeHtml.enable();
            } else {
                this.freeHtml.disable();
            }
            this.saveSettings();
        });
        menu.addItem({ element: htmlItem });


        menu.addSeparator();

        menu.addItem({
            icon: "iconLink",
            label: this.i18n.promptLink,
            click: () => { window.open("https://ld246.com/article/1758370873475?r=lovexmm521"); }
        });

        menu.addItem({
            icon: "iconLink",
            label: this.i18n.learningLink,
            click: () => { window.open("https://ld246.com/article/1759373550544?r=lovexmm521"); }
        });

        if (this.isPhoneForMenu) {
            menu.fullscreen();
        } else {
            menu.open({ x: rect.right, y: rect.bottom, isLeft: true });
        }
    }

    private async loadSettings() {
        const loadedSettings = await this.loadData(SETTINGS_FILE);
        const defaultSettings = {
            isCssEnabled: true,
            isJsEnabled: true,
            isHtmlEnabled: false,
            customSettingInput: "",
            isActivated: false
        };
        this.settings = Object.assign({}, defaultSettings, loadedSettings);
    }

    private saveSettings() {
        this.saveData(SETTINGS_FILE, this.settings);
    }
}