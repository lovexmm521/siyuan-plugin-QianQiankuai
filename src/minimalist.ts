import { Plugin } from "siyuan";

/**
 * MinimalistAI.ts
 *
 * This class builds and manages the "Minimalist AI" chat interface,
 * which is entirely self-contained within this TypeScript file.
 * It creates the HTML, CSS, and JS logic dynamically.
 */
export default class MinimalistAI {
    private plugin: Plugin;
    private element: HTMLElement;
    private chatWindow: HTMLElement;
    private messageInput: HTMLTextAreaElement;
    private sendBtn: HTMLButtonElement;
    private modelSelect: HTMLSelectElement;
    private clearBtn: HTMLButtonElement;
    private settingsBtn: HTMLButtonElement;
    private settingsModal: HTMLElement;
    private closeModalBtn: HTMLElement;
    private saveSettingsBtn: HTMLButtonElement;
    private maxTurnsInput: HTMLInputElement;

    private conversationHistory: Array<{ role: string, content: string }> = [];
    private maxTurns = 27;

    // API 配置 (暂时硬编码)
    private readonly API_KEY = '123123';
    private readonly API_URL = 'https://api.algion.dev/v1/chat/completions';
    private readonly MODELS = [
        { id: 'gpt-5-mini', name: 'gpt-5 mini' },
        { id: 'gpt-4.1', name: 'gpt-4.1' },
        { id: 'gpt-4o', name: 'gpt-4o' },
        { id: 'gpt-4o-mini', name: 'gpt-4o mini' },
        { id: 'gpt-4-0125-preview', name: 'gpt 4 Turbo' },
        { id: 'gpt-4', name: 'gpt 4' },
        { id: 'gpt-3.5-turbo', name: 'gpt 3.5 Turbo' }
    ];

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    /**
     * 创建并返回 极简AI 的 UI 元素
     * @returns {HTMLElement} - 包含 AI 聊天和 Modal 的根容器
     */
    public load(): HTMLElement {
        // 1. 注入 CSS (如果需要)
        // 我们假设 CSS 只在第一次加载时注入
        if (!document.getElementById('minimalist-ai-styles')) {
            this.injectStyles();
        }

        // 2. 构建 HTML 结构
        // buildHTML 现在会返回一个包含聊天UI和Modal的父容器
        const rootContainer = this.buildHTML();

        // 3. 绑定所有事件监听器
        // (此时元素尚未附加到 DOM, 但引用已建立)
        this.bindEvents();

        // 4. 初始化聊天界面
        this.initializeChat();

        // 5. 返回创建的根容器
        return rootContainer;
    }

    // --- vvv 助手添加 vvv ---
    /**
     * 在元素附加到 DOM 后调用，用于执行依赖 DOM 的计算
     */
    public onAppendedToDOM() {
        // 现在调用 autoResizeTextarea，因为元素已经在 DOM 中
        this.autoResizeTextarea();
    }
    // --- ^^^ 助手添加 ^^^ ---

    /**
     * 注入所有的 CSS 样式
     */
    private injectStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'minimalist-ai-styles'; // 添加 ID 防止重复注入
        styleElement.textContent = `
            /* 1. 全局和布局 */
            :root {
                --primary-color: #6366F1; /* 现代靛蓝色 */
                --secondary-color: #F9FAFB; /* 非常浅的灰色背景 */
                --text-color: #1F2937; /* 深灰色文本 */
                --border-color: #E5E7EB; /* 浅灰色边框 */
                --bubble-user: #6366F1; /* 用户气泡 = 主色调 */
                --bubble-ai: #ffffff; /* AI 气泡 = 白色 */
            }

            /* 聊天容器 - 确保它填满 dock.ts 传入的父容器 */
            .minimalist-ai-chat-container {
                display: flex;
                flex-direction: column;
                height: 100%; /* 关键: 填满父容器高度 */
                width: 100%;  /* 关键: 填满父容器宽度 */
                margin: 0;
                background-color: #fff;
                overflow: hidden; /* 内部滚动, 容器本身不滚 */
            }

            /* 3. 头部 */
            .minimalist-ai-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 18px 20px;
                background-color: var(--primary-color);
                color: white;
                flex-shrink: 0;
            }

            .minimalist-ai-header h1 {
                margin: 0;
                font-size: 1.5rem;
            }

            .minimalist-ai-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .minimalist-ai-controls select,
            .minimalist-ai-controls button {
                padding: 6px 10px;
                border: none;
                border-radius: 5px;
                background-color: rgba(255, 255, 255, 0.2);
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .minimalist-ai-controls button:hover, .minimalist-ai-controls select:hover {
                background-color: rgba(255, 255, 255, 0.3);
            }
            
            .minimalist-ai-controls select option {
                background-color: #ffffff;
                color: var(--text-color);
            }

            /* 4. 聊天窗口 */
            .minimalist-ai-chat-window {
                flex-grow: 1; /* 占据剩余所有空间 */
                overflow-y: auto;
                overflow-x: hidden;
                padding: 20px;
                background-color: var(--secondary-color);
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .minimalist-ai-message {
                max-width: 80%;
                padding: 10px 15px;
                border-radius: 18px;
                line-height: 1.5;
                word-wrap: break-word;
            }

            .minimalist-ai-message.user {
                background-color: var(--bubble-user);
                color: #ffffff;
                align-self: flex-end;
                border-bottom-right-radius: 5px;
            }

            .minimalist-ai-message.assistant {
                background-color: var(--bubble-ai);
                color: var(--text-color);
                align-self: flex-start;
                border: 1px solid var(--border-color);
                border-bottom-left-radius: 5px;
            }

            .minimalist-ai-message.system {
                background-color: transparent;
                color: #888;
                font-style: italic;
                font-size: 0.9rem;
                text-align: center;
                width: 100%;
                max-width: 100%;
            }

            /* 5. 输入区域 */
            .minimalist-ai-input-area {
                display: flex;
                align-items: flex-end;
                padding: 15px;
                border-top: 1px solid var(--border-color);
                background-color: #fff;
                flex-shrink: 0;
            }

            #minimalist-ai-message-input {
                flex-grow: 1;
                padding: 10px 15px;
                border: 1px solid var(--border-color);
                border-radius: 20px;
                resize: none;
                font-size: 1rem;
                line-height: 1.4;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            
            #minimalist-ai-message-input:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
            }

            #minimalist-ai-send-btn {
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 50%;
                width: 44px;
                height: 44px;
                margin-left: 10px;
                margin-bottom: 9px;
                font-size: 1.5rem;
                cursor: pointer;
                transition: background-color 0.2s;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            #minimalist-ai-send-btn:hover {
                background-color: #4F46E5;
            }

            /* 6. 设置弹窗 (Modal) */
            .minimalist-ai-modal {
                display: none; 
                position: absolute; /* 修改: 相对于父容器定位 */
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.4);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .minimalist-ai-modal:not(.show) {
                display: none;
            }

            .minimalist-ai-modal-content {
                background-color: #fff;
                padding: 25px 30px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                width: 90%;
                max-width: 400px;
            }
            
            .minimalist-ai-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .minimalist-ai-modal-header h2 {
                margin: 0;
                color: var(--primary-color);
            }

            .minimalist-ai-modal-close-btn {
                font-size: 1.8rem;
                color: #aaa;
                cursor: pointer;
                font-weight: bold;
            }
            
            .minimalist-ai-modal-close-btn:hover {
                color: #333;
            }

            .minimalist-ai-form-group {
                margin-bottom: 20px;
            }

            .minimalist-ai-form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #555;
            }

            .minimalist-ai-form-group input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                box-sizing: border-box;
            }
            
            .minimalist-ai-modal-footer {
                text-align: right;
            }

            #minimalist-ai-save-settings-btn {
                background-color: var(--primary-color);
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1rem;
            }
        `;
        document.head.appendChild(styleElement);
    }

    /**
     * 动态创建 HTML DOM 结构并返回
     * @returns {HTMLElement} - 包含 .chat-container 和 .modal 的父容器
     */
    private buildHTML(): HTMLElement {
        // --- vvv 助手修改 vvv ---
        // 0. 创建一个总的父容器，用于返回
        // 这样 .chat-container 和 .modal 就是兄弟节点
        const rootContainer = document.createElement('div');
        // 让这个容器填满
        rootContainer.style.width = '100%';
        rootContainer.style.height = '100%';
        rootContainer.style.position = 'relative'; // 确保 modal 可以正确定位
        // --- ^^^ 助手修改 ^^^ ---

        // 1. 聊天容器 (根元素)
        this.element = document.createElement('div');
        this.element.className = 'minimalist-ai-chat-container';

        // 2. 头部
        const header = document.createElement('header');
        header.className = 'minimalist-ai-header';

        const h1 = document.createElement('h1');
        h1.textContent = this.plugin.i18n.minimalistAIDock || '极简 AI';

        const controls = document.createElement('div');
        controls.className = 'minimalist-ai-controls';

        this.modelSelect = document.createElement('select');
        this.modelSelect.id = 'minimalist-ai-model-select';

        this.clearBtn = document.createElement('button');
        this.clearBtn.id = 'minimalist-ai-clear-btn';
        this.clearBtn.title = '清空记录';
        this.clearBtn.textContent = '清空';

        this.settingsBtn = document.createElement('button');
        this.settingsBtn.id = 'minimalist-ai-settings-btn';
        this.settingsBtn.title = '设置';
        this.settingsBtn.textContent = '设置';

        controls.append(this.modelSelect, this.clearBtn, this.settingsBtn);
        header.append(h1, controls);

        // 3. 聊天窗口
        this.chatWindow = document.createElement('div');
        this.chatWindow.className = 'minimalist-ai-chat-window';
        this.chatWindow.id = 'minimalist-ai-chat-window';

        // 4. 输入区域
        const inputArea = document.createElement('div');
        inputArea.className = 'minimalist-ai-input-area';

        this.messageInput = document.createElement('textarea');
        this.messageInput.id = 'minimalist-ai-message-input';
        this.messageInput.placeholder = '输入消息...';
        this.messageInput.rows = 1;

        this.sendBtn = document.createElement('button');
        this.sendBtn.id = 'minimalist-ai-send-btn';
        this.sendBtn.title = '发送';
        this.sendBtn.innerHTML = '➤';

        inputArea.append(this.messageInput, this.sendBtn);

        // 5. 设置弹窗 (Modal)
        this.settingsModal = document.createElement('div');
        this.settingsModal.id = 'minimalist-ai-settings-modal';
        this.settingsModal.className = 'minimalist-ai-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'minimalist-ai-modal-content';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'minimalist-ai-modal-header';
        const modalH2 = document.createElement('h2');
        modalH2.textContent = '设置';
        this.closeModalBtn = document.createElement('span');
        this.closeModalBtn.className = 'minimalist-ai-modal-close-btn';
        this.closeModalBtn.id = 'minimalist-ai-modal-close-btn';
        this.closeModalBtn.innerHTML = '&times;';
        modalHeader.append(modalH2, this.closeModalBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'minimalist-ai-modal-body';
        const formGroup = document.createElement('div');
        formGroup.className = 'minimalist-ai-form-group';
        const label = document.createElement('label');
        label.htmlFor = 'minimalist-ai-max-turns-input';
        label.textContent = '最大对话轮数 (上下文)';
        this.maxTurnsInput = document.createElement('input');
        this.maxTurnsInput.type = 'number';
        this.maxTurnsInput.id = 'minimalist-ai-max-turns-input';
        this.maxTurnsInput.min = '1';
        this.maxTurnsInput.max = '50';
        this.maxTurnsInput.value = '10';
        formGroup.append(label, this.maxTurnsInput);
        modalBody.append(formGroup);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'minimalist-ai-modal-footer';
        this.saveSettingsBtn = document.createElement('button');
        this.saveSettingsBtn.id = 'minimalist-ai-save-settings-btn';
        this.saveSettingsBtn.textContent = '保存';
        modalFooter.append(this.saveSettingsBtn);

        modalContent.append(modalHeader, modalBody, modalFooter);
        this.settingsModal.append(modalContent);

        // 6. 组装所有部件
        this.element.append(header, this.chatWindow, inputArea);

        // --- vvv 助手修改 vvv ---
        // 将 modal 和 chat-container 附加到我们创建的父容器中
        rootContainer.append(this.element, this.settingsModal);

        // 返回这个父容器
        return rootContainer;
        // --- ^^^ 助手修改 ^^^ ---
    }

    /**
     * 绑定所有 DOM 事件监听器
     */
    private bindEvents() {
        this.sendBtn.addEventListener('click', this.handleSendMessage.bind(this));

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        this.messageInput.addEventListener('input', this.autoResizeTextarea.bind(this));
        this.clearBtn.addEventListener('click', this.clearHistory.bind(this));
        this.settingsBtn.addEventListener('click', this.openSettingsModal.bind(this));
        this.closeModalBtn.addEventListener('click', this.closeSettingsModal.bind(this));
        this.saveSettingsBtn.addEventListener('click', this.saveSettings.bind(this));

        // 点击 modal 外部区域关闭
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });
    }

    /**
     * 初始化聊天窗口, 填充模型并显示欢迎消息
     */
    private initializeChat() {
        this.populateModels();
        // 使用 i18n
        const welcomeMsg = this.plugin.i18n.minimalistAIWelcome || '你好！我是 极简 AI。今天有什么可以帮你的吗？';
        this.addMessageToChat('assistant', welcomeMsg);
        // this.autoResizeTextarea(); // <--- 已移除, 转移到 onAppendedToDOM
    }

    // --- 3. 核心功能函数 (移植自 HTML) ---

    /**
     * @desc 将消息添加到聊天窗口
     */
    private addMessageToChat(role: string, content: string): HTMLElement {
        const messageElement = document.createElement('div');
        messageElement.classList.add('minimalist-ai-message', role);
        messageElement.innerHTML = content.replace(/\n/g, '<br>'); // 基础渲染
        this.chatWindow.appendChild(messageElement);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
        return messageElement;
    }

    /**
     * @desc 处理用户发送消息的逻辑
     */
    private async handleSendMessage() {
        const content = this.messageInput.value.trim();
        if (!content) return;

        this.addMessageToChat('user', content);
        this.conversationHistory.push({ role: 'user', content: content });
        this.messageInput.value = '';
        this.autoResizeTextarea();

        const thinkingMessage = this.addMessageToChat('system', '极简 AI 正在思考中...');

        try {
            const aiResponse = await this.callAPI();
            thinkingMessage.remove();
            this.addMessageToChat('assistant', aiResponse);
            this.conversationHistory.push({ role: 'assistant', content: aiResponse });

        } catch (error) {
            thinkingMessage.remove();
            this.addMessageToChat('system', '哎呀，出错了：' + error.message);
            console.error('API Call Error:', error);
        }
    }

    /**
     * @desc 调用后端 API
     */
    private async callAPI(): Promise<string> {
        const currentModel = this.modelSelect.value;

        // 1. 获取要发送的对话历史切片
        const messagesToSend = this.conversationHistory.slice(-this.maxTurns * 2);

        // --- vvv 助手修改 vvv ---
        // 2. 从 i18n 获取内置的系统提示词
        const systemPromptText = this.plugin.i18n.minimalistAISystemPrompt || "极简学习法真好";

        // 3. 创建 system prompt 对象
        const systemPrompt = { role: 'system', content: systemPromptText };

        // 4. 将 system prompt 添加到要发送的消息数组的最前面
        const finalMessages = [systemPrompt, ...messagesToSend];
        // --- ^^^ 助手修改 ^^^ ---

        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.API_KEY
            },
            body: JSON.stringify({
                model: currentModel,
                // --- vvv 助手修改 vvv ---
                messages: finalMessages, // 5. 使用包含 system prompt 的新数组
                // --- ^^^ 助手修改 ^^^ ---
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error ? errorData.error.message : 'API 请求失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * @desc 清空聊天记录
     */
    private clearHistory() {
        this.chatWindow.innerHTML = '';
        this.conversationHistory = [];
        const welcomeMsg = this.plugin.i18n.minimalistAIWelcome || '你好！我是 极简 AI。今天有什么可以帮你的吗？';
        this.addMessageToChat('assistant', welcomeMsg);
    }

    /**
     * @desc 填充模型下拉列表
     */
    private populateModels() {
        this.modelSelect.innerHTML = ''; // 清空
        this.MODELS.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;

            if (model.id === 'gpt-5-mini') {
                option.selected = true;
            }
            this.modelSelect.appendChild(option);
        });
    }

    /**
     * @desc 自动调整 textarea 高度
     */
    private autoResizeTextarea() {
        if (!this.messageInput) return; // 增加一个安全检查
        this.messageInput.style.height = 'auto';
        const maxHeight = 150;
        const scrollHeight = this.messageInput.scrollHeight;

        if (scrollHeight > maxHeight) {
            this.messageInput.style.height = maxHeight + 'px';
            this.messageInput.style.overflowY = 'auto';
        } else {
            this.messageInput.style.height = scrollHeight + 'px';
            this.messageInput.style.overflowY = 'hidden';
        }
    }

    // --- 4. 设置弹窗 (Modal) 逻辑 ---

    private openSettingsModal() {
        this.maxTurnsInput.value = String(this.maxTurns);
        this.settingsModal.classList.add('show');
    }

    private closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }

    private saveSettings() {
        const newMaxTurns = parseInt(this.maxTurnsInput.value, 10);
        if (newMaxTurns > 0 && newMaxTurns <= 50) {
            this.maxTurns = newMaxTurns;
            this.closeSettingsModal();
            this.addMessageToChat('system', `设置已保存：最大对话轮数更新为 ${this.maxTurns}。`);
        } else {
            console.warn('请输入 1 到 50 之间的有效数字。');
            // 你可以在这里添加一个非阻塞的提示
        }
    }
}