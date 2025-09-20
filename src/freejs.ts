/**
 * @file freejs.ts
 * @description Manages the execution and cleanup of custom JavaScript in Siyuan blocks.
 * This version introduces a smart default cleanup mechanism that automatically restores
 * the original inline style of an element, while still allowing advanced users to
 * return their own custom cleanup functions.
 */

export class FreeJS {
    // 使用 Map 来跟踪活动的脚本，存储它们的清理函数和原始代码
    private activeScripts = new Map<string, { code: string, cleanup: Function }>();
    private observer: MutationObserver | null = null;
    private debounceTimer: number | null = null;

    constructor() {
        // Functionality is dormant until `enable` is called.
    }

    /**
     * 启用自定义JS功能。
     */
    public enable() {
        console.log('Block Custom JS has been enabled (with smart cleanup).');
        this.scanAndApplyJS();
        this.observeDOMChanges();
    }

    /**
     * 禁用自定义JS功能。
     */
    public disable() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        this.activeScripts.forEach(script => {
            try {
                script.cleanup();
            } catch (e) {
                console.error('Error during script cleanup:', e);
            }
        });

        this.activeScripts.clear();
        console.log('Block Custom JS has been disabled and all scripts cleaned up.');
    }

    /**
     * 扫描文档，同步脚本状态。
     */
    private scanAndApplyJS() {
        const currentNodeIds = new Set<string>();
        document.querySelectorAll('[custom-js]').forEach(element => {
            const nodeId = element.getAttribute('data-node-id');
            if (nodeId) {
                currentNodeIds.add(nodeId);
            }
        });

        this.activeScripts.forEach((script, nodeId) => {
            if (!currentNodeIds.has(nodeId)) {
                try {
                    script.cleanup();
                } catch(e) {
                    console.error(`Error cleaning up script for block [${nodeId}]:`, e);
                }
                this.activeScripts.delete(nodeId);
            }
        });

        document.querySelectorAll('[custom-js]').forEach((element: HTMLElement) => {
            const nodeId = element.getAttribute('data-node-id');
            const newCode = element.getAttribute('custom-js');

            if (!nodeId || !newCode.trim()) return;

            const existingScript = this.activeScripts.get(nodeId);
            if (existingScript && existingScript.code === newCode) {
                return;
            }

            if (existingScript) {
                try {
                    existingScript.cleanup();
                } catch(e) {
                    console.error(`Error cleaning up outdated script for block [${nodeId}]:`, e);
                }
            }

            try {
                // 1. 在执行任何代码之前，保存当前块的原始 style 属性。
                const originalStyle = element.getAttribute('style');

                const func = new Function(newCode);
                const potentialCleanup = func.call(element);

                let cleanup: Function;

                // 2. 检查用户是否返回了自定义的清理函数。
                if (typeof potentialCleanup === 'function') {
                    // 如果是，则优先使用用户提供的清理逻辑。
                    cleanup = potentialCleanup;
                } else {
                    // 如果否，则使用我们智能生成的默认清理函数，用于恢复原始样式。
                    cleanup = () => {
                        if (originalStyle) {
                            // 如果原来有 style，就恢复它。
                            element.setAttribute('style', originalStyle);
                        } else {
                            // 如果原来没有 style，就彻底移除。
                            element.removeAttribute('style');
                        }
                    };
                }

                this.activeScripts.set(nodeId, {
                    code: newCode,
                    cleanup: cleanup
                });

            } catch (e) {
                console.error(`Error executing custom JS for block [${nodeId}]:`, e);
            }
        });
    }

    /**
     * 设置 MutationObserver 来监听 DOM 变化。
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
            attributeFilter: ['custom-js']
        };

        const callback: MutationCallback = () => {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = window.setTimeout(() => this.scanAndApplyJS(), 250);
        };

        this.observer = new MutationObserver(callback);
        this.observer.observe(targetNode, config);
    }
}

