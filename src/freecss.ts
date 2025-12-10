/**
 * @file freecss.ts
 * @description (升级版) 智能管理自定义CSS的应用。
 * 这个版本经过了升级，可以智能区分并处理两种CSS：
 * 1. 简单的CSS片段（旧版功能）。
 * 2. 由Webpack等工具生成的、自带选择器（如 .class-name）的完整样式表。
 */

export class FreeCSS {
    private styleId = 'siyuan-block-custom-css-dynamic';
    private observer: MutationObserver | null = null;
    private debounceTimer: number | null = null;

    constructor() {}

    /**
     * 启用自定义CSS功能。
     */
    public enable() {
        console.log('[千千块] 自定义块css功能 (升级版): 已启用');
        this.applyStyles();
        this.observeDOMChanges();
    }

    /**
     * 禁用自定义CSS功能。
     */
    public disable() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        const styleTag = document.getElementById(this.styleId);
        if (styleTag) {
            styleTag.remove();
        }
        console.log('[千千块] 自定义块css功能 (升级版): 已禁用并清理');
    }

    /**
     * 扫描并智能应用样式。
     */
    private applyStyles() {
        const elements = document.querySelectorAll('[custom-css]');
        const cssRules: string[] = [];
        const containerSelector = ':is(#layouts, #preview, [data-key="dialog-exportimage"], #editor)';

        elements.forEach((element) => {
            const cssValue = element.getAttribute('custom-css')?.trim();
            const nodeId = element.getAttribute('data-node-id');

            if (cssValue && nodeId) {
                // ---- 这是我们新增的智能判断逻辑 ----
                if (cssValue.startsWith('/* @webpack */')) {
                    // **Webpack 模式**
                    // 如果CSS以魔法注释开头，我们认为它是一个完整的样式表。
                    // 我们移除注释，然后直接使用它，不再用 data-node-id 包裹。
                    const webpackCss = cssValue.replace('/* @webpack */', '').trim();
                    cssRules.push(webpackCss);
                } else {
                    // **传统片段模式**
                    // 否则，我们保持旧的行为，用 data-node-id 将其包裹起来，确保样式只作用于当前块。
                    const rule = `${containerSelector} div[data-node-id="${nodeId}"] { ${cssValue} }`;
                    cssRules.push(rule);
                }
            }
        });

        // 注入 <style> 标签 (逻辑不变)
        const oldStyleTag = document.getElementById(this.styleId);
        if (oldStyleTag) {
            oldStyleTag.remove();
        }

        if (cssRules.length > 0) {
            const styleTag = document.createElement('style');
            styleTag.id = this.styleId;
            styleTag.type = 'text/css';
            styleTag.textContent = cssRules.join('\n');
            document.head.appendChild(styleTag);
        }
    }

    /**
     * 设置 MutationObserver (逻辑不变)
     */
    private observeDOMChanges() {
        const targetNode = document.querySelector('.layout__center') || document.body;
        if (!targetNode) {
            setTimeout(() => this.observeDOMChanges(), 100);
            return;
        }
        const config: MutationObserverInit = {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['custom-css']
        };
        const callback: MutationCallback = () => {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = window.setTimeout(() => this.applyStyles(), 250);
        };
        this.observer = new MutationObserver(callback);
        this.observer.observe(targetNode, config);
    }
}
