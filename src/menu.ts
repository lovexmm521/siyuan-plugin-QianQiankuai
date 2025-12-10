import { Plugin, Menu, fetchPost } from "siyuan";

/**
 * 负责管理所有与“块菜单”相关的逻辑
 */
export class BlockMenuManager {
    private plugin: Plugin;

    /**
     * @param plugin - 主插件的实例，用于访问 eventBus 和 i18n
     */
    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    /**
     * 初始化管理器，开始监听核心事件
     */
    public init() {
        this.plugin.eventBus.on("click-blockicon", ({ detail }) => {
            const menu = detail.menu;
            const blockEle = detail.blockElements[0];

            if (!blockEle) {
                return;
            }

            const blockId = blockEle.getAttribute("data-node-id");
            const initialCss = blockEle.getAttribute("custom-css") || "";
            const initialJs = blockEle.getAttribute("custom-js") || "";

            // --- 创建“千千块CSS”菜单项 ---
            const cssSubmenuElement = this.createInputSubmenu(
                this.plugin.i18n.cssPlaceholder,
                blockId,
                "custom-css",
                initialCss
            );
            menu.addItem({
                icon: "iconCSS",
                label: this.plugin.i18n.title1,
                type: "submenu",
                submenu: [{
                    element: cssSubmenuElement,
                }]
            });

            // --- 创建“千千块JS”菜单项 ---
            const jsSubmenuElement = this.createInputSubmenu(
                this.plugin.i18n.jsPlaceholder,
                blockId,
                "custom-js",
                initialJs
            );
            menu.addItem({
                label: this.plugin.i18n.title2,
                type: "submenu",
                submenu: [{
                    element: jsSubmenuElement,
                }]
            });
        });
    }

    /**
     * 创建一个包含输入框的自定义子菜单元素
     */
    private createInputSubmenu(placeholder: string, blockId: string, attrName: "custom-css" | "custom-js", initialValue: string): HTMLElement {
        const container = document.createElement("div");
        // 为容器添加一个专属类名，方便CSS样式定位
        container.className = "qianqian-edit-container";
        container.style.userSelect = "text";

        // 阻止在容器内的点击事件冒泡，防止菜单意外关闭
        container.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        const textarea = document.createElement("textarea");
        textarea.className = "b3-text-field";
        textarea.style.width = "300px";
        textarea.style.height = "150px";
        textarea.placeholder = placeholder || "";
        textarea.value = initialValue;

        textarea.addEventListener("blur", () => {
            const newValue = textarea.value;
            fetchPost("/api/attr/setBlockAttrs", {
                id: blockId,
                attrs: { [attrName]: newValue }
            });
        });

        container.appendChild(textarea);
        return container;
    }
}

