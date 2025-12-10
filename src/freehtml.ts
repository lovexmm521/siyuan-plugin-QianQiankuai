/**
  * @file freehtml.ts
  * @description Manages the editing functionality for HTML blocks.
  * Based on the Siyuan HTML Block Editor (v2.9.1 - Instant Enable).
  * @version 2.9.7 - Applied rapid input protection to all key presses and IME composition.
  */

export class FreeHTML {
    private executedBlocks: Set<string> = new Set();
    private observer: MutationObserver | null = null;
    private debounceTimer: number | null = null;
    private cursorPositions: Map<string, number> = new Map();

    private focusLockId: string | null = null;
    private lastGoodCursorPosition: Map<string, number> = new Map();
    private isSaving: boolean = false;

    // [升级] 将时间戳记录应用于所有输入行为
    private lastActionTimestamps: Map<string, number> = new Map();

    private handleDocSwitch: () => void;

    constructor() {
        this.handleDocSwitch = this._handleDocSwitch.bind(this);
    }

    public enable() {
        console.log('[千千块] HTML块编辑功能: 已启用');
        this.applyToAllHtmlBlocks();
        this.observeDOMChanges();
        document.addEventListener('switch-protyle', this.handleDocSwitch);
    }

    public disable() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        document.removeEventListener('switch-protyle', this.handleDocSwitch);

        this.executedBlocks.forEach(nodeId => {
            const protyleHtmlElement = document.querySelector(`[data-node-id="${nodeId}"] protyle-html`) as HTMLElement;
            if (protyleHtmlElement) {
                const editableContent = this.findEditableContent(protyleHtmlElement);
                if (editableContent) {
                    editableContent.removeAttribute('contenteditable');
                    editableContent.style.outline = '';
                }
            }
        });

        this.executedBlocks.clear();
        this.cursorPositions.clear();
        this.focusLockId = null;
        this.lastGoodCursorPosition.clear();
        this.isSaving = false;
        this.lastActionTimestamps.clear(); // 清理状态
        console.log('[千千块] HTML块编辑功能: 已禁用并清理');
    }

    private _handleDocSwitch() {
        this.executedBlocks.clear();
        this.cursorPositions.clear();
        this.focusLockId = null;
        this.lastGoodCursorPosition.clear();
        this.isSaving = false;
        this.lastActionTimestamps.clear(); // 清理状态
        setTimeout(() => this.applyToAllHtmlBlocks(), 200);
    }

    private findEditableContent(htmlElement: HTMLElement): HTMLElement | null {
        if (!htmlElement || !htmlElement.shadowRoot) return null;
        for (const node of htmlElement.shadowRoot.childNodes) {
            // [修复] 使用 indexOf 替代 includes 以增强兼容性
            if (node.nodeType === Node.ELEMENT_NODE && ['STYLE', 'SCRIPT'].indexOf((node as HTMLElement).tagName.toUpperCase()) === -1) {
                return node as HTMLElement;
            }
        }
        return null;
    }

    private getCursorPosition(element: HTMLElement): number {
        const shadowRoot = element.getRootNode() as ShadowRoot;
        // [修复] 使用类型断言 (as any) 来解决 getSelection 的类型错误
        const selection = (shadowRoot as any).getSelection();
        if (!selection || selection.rangeCount === 0) return 0;
        const range = selection.getRangeAt(0);
        if (!element.contains(range.startContainer)) return 0;
        const preCaretRange = document.createRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        return preCaretRange.toString().length;
    }

    private _setCursorPosition(element: HTMLElement, offset: number): boolean {
        try {
            if (document.activeElement !== element && (element.getRootNode() as Document | ShadowRoot).activeElement !== element) {
                element.focus({ preventScroll: true });
            }
            let charCount = 0;
            const nodeIterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT);
            let currentNode: Node;
            while (currentNode = nodeIterator.nextNode()) {
                const nodeLength = currentNode.textContent!.length;
                if (charCount + nodeLength >= offset) {
                    const localOffset = Math.min(offset - charCount, nodeLength);
                    if (!currentNode.isConnected) return false;
                    // [修复] 使用类型断言 (as any) 来解决 getSelection 的类型错误
                    const selection = (element.getRootNode() as any).getSelection() || window.getSelection();
                    if (!selection) return false;
                    const range = document.createRange();
                    range.setStart(currentNode, localOffset);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return true;
                }
                charCount += nodeLength;
            }
        } catch (e) {
            console.error(`[CURSOR-LOG] _setCursorPosition failed:`, e);
        }
        return false;
    }

    private restoreCursorPosition(nodeId: string) {
        const offset = this.cursorPositions.get(nodeId);
        if (typeof offset !== 'number') return;

        const checkAndRestore = (retryCount = 0) => {
            if (retryCount > 60) {
                this.cursorPositions.delete(nodeId);
                return;
            }
            const htmlElement = document.querySelector(`[data-node-id="${nodeId}"] protyle-html`) as HTMLElement;
            if (!htmlElement) {
                setTimeout(() => checkAndRestore(retryCount + 1), 50);
                return;
            }
            const editableContent = this.findEditableContent(htmlElement);
            if (!editableContent) {
                setTimeout(() => checkAndRestore(retryCount + 1), 50);
                return;
            }

            setTimeout(() => {
                if (this._setCursorPosition(editableContent, offset)) {
                    this.focusLockId = nodeId;
                    this.lastGoodCursorPosition.set(nodeId, offset);
                }
            }, 0);

            this.cursorPositions.delete(nodeId);
        };
        checkAndRestore();
    }

    private applyToAllHtmlBlocks() {
        if (!this.observer && document.querySelectorAll('[data-node-id]').length > 0) return;
        document.querySelectorAll('div.protyle-wysiwyg protyle-html').forEach((htmlElement: HTMLElement) => {
            const container = htmlElement.closest('[data-node-id]') as HTMLElement;
            if (!container) return;
            const nodeId = container.getAttribute('data-node-id');
            if (!nodeId || this.executedBlocks.has(nodeId)) return;

            const editableContent = this.findEditableContent(htmlElement);
            if (editableContent) {
                this.makeContentEditable(nodeId, editableContent);
                if (this.cursorPositions.has(nodeId)) {
                    setTimeout(() => this.restoreCursorPosition(nodeId), 0);
                }
            }
        });
    }

    private makeContentEditable(nodeId: string, element: HTMLElement) {
        element.setAttribute('contenteditable', 'true');
        element.style.outline = '1px dashed #95a5a6';
        element.addEventListener('focus', () => element.style.outline = '1px solid #3498db');

        element.addEventListener('blur', (event: FocusEvent) => {
            if (this.focusLockId === nodeId) {
                event.preventDefault();
                const lastOffset = this.lastGoodCursorPosition.get(nodeId);
                setTimeout(() => {
                    if (typeof lastOffset === 'number') {
                        this._setCursorPosition(element, lastOffset);
                    } else {
                        element.focus();
                    }
                }, 0);
            } else if (!this.isSaving) {
                element.style.outline = '1px dashed #95a5a6';
                const lastPos = this.lastGoodCursorPosition.get(nodeId);
                if (typeof lastPos === 'number') {
                    this.cursorPositions.set(nodeId, lastPos);
                }
                this.saveContent(nodeId, element);
            }
        });

        element.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.ctrlKey || event.altKey || event.metaKey) {
                return;
            }

            // [升级] 此逻辑现在适用于所有单字符输入和Backspace
            if (event.key === 'Backspace' || event.key.length === 1) {
                event.preventDefault();
                event.stopImmediatePropagation();

                // 1. 处理长按：event.repeat 为 true 表示按键被按住不放
                if (event.repeat) {
                    return;
                }

                const now = Date.now();
                const lastPress = this.lastActionTimestamps.get(nodeId) || 0;

                // 2. 处理快按：检查与上次按键的间隔是否小于 50ms
                if (now - lastPress < 50) {
                    return; // 小于间隔，阻止本次行为
                }

                // 如果通过了所有检查，则执行操作，并更新时间戳
                this.lastActionTimestamps.set(nodeId, now);
                if (event.key === 'Backspace') {
                    document.execCommand('delete', false, null);
                } else {
                    document.execCommand('insertText', false, event.key);
                }
            }
        });

        let isComposing = false;
        element.addEventListener('compositionstart', () => { isComposing = true; });

        const handleInput = () => {
            if (this.focusLockId === nodeId) this.focusLockId = null;
            const pos = this.getCursorPosition(element);
            this.lastGoodCursorPosition.set(nodeId, pos);
        };

        // [升级] 监听输入法完成事件
        element.addEventListener('compositionend', () => {
            isComposing = false;
            // 将输入法上屏视为一次有效操作，更新时间戳
            this.lastActionTimestamps.set(nodeId, Date.now());
            handleInput();
        });

        element.addEventListener('input', () => {
            if (!isComposing) handleInput();
        });

        this.executedBlocks.add(nodeId);
    }

    private async saveContent(nodeId: string, element: HTMLElement) {
        if (this.isSaving) return;
        try {
            this.isSaving = true;
            const tempWrapper = element.cloneNode(true) as HTMLElement;
            tempWrapper.removeAttribute('contenteditable');
            tempWrapper.style.outline = '';
            tempWrapper.querySelectorAll('[contenteditable="true"]').forEach(el => el.removeAttribute('contenteditable'));
            const htmlToSave = tempWrapper.innerHTML;
            const requestData = {
                dataType: "markdown",
                data: `<div>${htmlToSave}</div>`,
                id: nodeId
            };
            await fetch('/api/block/updateBlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
        } catch (error) {
            console.error(`[ERROR] 请求错误 [${nodeId}]:`, error);
        } finally {
            this.isSaving = false;
        }
    }

    private observeDOMChanges() {
        if (this.observer) return; // 防止重复初始化
        const targetNode = document.querySelector('.layout__center');
        if (!targetNode) {
            setTimeout(() => this.observeDOMChanges(), 100);
            return;
        }
        const config: MutationObserverInit = { attributes: true, childList: true, subtree: true, attributeFilter: ['data-content'] };
        const callback: MutationCallback = (mutationsList) => {
            const cleanNode = (nodeId: string) => {
                this.executedBlocks.delete(nodeId);
                if (this.focusLockId === nodeId) {
                    this.focusLockId = null;
                    this.lastGoodCursorPosition.delete(nodeId);
                }
            };

            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach(node => {
                        if (node.nodeType !== 1) return;
                        const checkAndClean = (element: Element) => {
                            const nodeId = element.getAttribute('data-node-id');
                            if (nodeId && this.executedBlocks.has(nodeId)) cleanNode(nodeId);
                        };
                        checkAndClean(node as Element);
                        (node as Element).querySelectorAll('[data-node-id]').forEach(checkAndClean);
                    });
                }
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-content') {
                    const targetElement = mutation.target as HTMLElement;
                    if (targetElement.tagName === 'PROTYLE-HTML') {
                        const container = targetElement.closest('[data-node-id]');
                        const nodeId = container?.getAttribute('data-node-id');
                        if (nodeId && this.executedBlocks.has(nodeId)) cleanNode(nodeId);
                    }
                }
            }
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            // [修复] 将重新扫描的延迟从 100ms 改为 0ms，以最快速度重新应用按键逻辑
            this.debounceTimer = window.setTimeout(() => this.applyToAllHtmlBlocks(), 0);
        };
        this.observer = new MutationObserver(callback);
        this.observer.observe(targetNode, config);
    }
}

