/**
 * @file freecss.ts
 * @description Manages the application of custom CSS to Siyuan blocks.
 * Originally based on a standalone script, this class encapsulates the logic
 * for enabling, disabling, and dynamically applying styles based on the 'custom-css' attribute.
 */

export class FreeCSS {
    // 用于动态创建的 <style> 标签的唯一ID
    private styleId = 'siyuan-block-custom-css-dynamic';
    // 用于监听DOM变化的 MutationObserver 实例
    private observer: MutationObserver | null = null;
    // 用于防抖的定时器
    private debounceTimer: number | null = null;

    constructor() {
        // The class is instantiated, but functionality is dormant until `enable` is called.
    }

    /**
     * 启用自定义CSS功能。
     * 首次应用样式并设置MutationObserver以监听后续变化。
     */
    public enable() {
        console.log('Block Custom CSS has been enabled.');
        this.applyStyles();
        this.observeDOMChanges();
    }

    /**
     * 禁用自定义CSS功能。
     * 断开observer并移除注入的style标签，用于清理。
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
        console.log('Block Custom CSS has been disabled.');
    }

    /**
     * 扫描整个文档，查找所有带有 'custom-css' 属性的块，并应用其样式。
     */
    private applyStyles() {
        const elements = document.querySelectorAll('[custom-css]');
        const cssRules: string[] = [];

        // 定义一个通用的父容器选择器，确保样式在笔记正文、预览、导出图片等场景下都能生效
        const containerSelector = ':is(#layouts, #preview, [data-key="dialog-exportimage"], #editor)';

        elements.forEach((element) => {
            const cssValue = element.getAttribute('custom-css');
            const nodeId = element.getAttribute('data-node-id');

            if (cssValue && nodeId) {
                // 构建CSS规则
                const rule = `${containerSelector} div[data-node-id="${nodeId}"] { ${cssValue} }`;
                cssRules.push(rule);
            }
        });

        // 注入 <style> 标签
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
     * 设置 MutationObserver 来监听 'custom-css' 属性的变化。
     */
    private observeDOMChanges() {
        // 优先选择 .layout__center，如果没有则降级到 body
        const targetNode = document.querySelector('.layout__center') || document.body;

        if (!targetNode) {
            setTimeout(() => this.observeDOMChanges(), 100);
            return;
        }

        const config: MutationObserverInit = {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['custom-css'] // 只关心 'custom-css' 属性
        };

        const callback: MutationCallback = () => {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = window.setTimeout(() => this.applyStyles(), 250);
        };

        this.observer = new MutationObserver(callback);
        this.observer.observe(targetNode, config);
    }
}
