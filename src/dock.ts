/**
 * Dock.ts
 *
 * This class is responsible for rendering the content within the dock panel.
 * It intelligently switches between <iframe> and <webview> and updates its content
 * based on the plugin's activation status.
 *
 * --- vvv 思源笔记插件开发助手 修改 vvv ---
 * 1. 导入 MinimalistAI。
 * 2. 添加了 `plugin` 属性和 `constructor` 来接收主插件实例。
 * 3. (新) 添加 `previousUrl` 属性, 用于恢复下拉框状态。
 * 4. 在 `populateSelectWithOptions` 的 `baseUrls` 中添加了 '极简AI' 和 (新) '切换位置' 选项。
 * 5. 在 `render` 方法的 `change` 事件中添加了加载 '极简AI' 的逻辑。
 * 6. (新) 移除了 (dblclick) 逻辑。
 * 7. (新) 在 'change' 事件中添加了 '切换位置' 选项的特殊处理逻辑。
 * --- ^^^ 思源笔记插件开发助手 修改 ^^^ ---
 */
// --- vvv 助手添加 vvv ---
import MinimalistAI from "./minimalist";
// --- ^^^ 助手添加 ^^^ ---

export default class Dock {
    private selectElement: HTMLSelectElement;
    private currentElement: HTMLElement;
    private wrapper: HTMLElement;
    private isMobile: boolean;
    // --- vvv 助手添加 vvv ---
    private plugin: any;
    private previousUrl: string = null; // 助手添加: 记住上一个选择的URL
    // --- ^^^ 助手添加 ^^^ ---

    // --- vvv 助手添加 vvv ---
    /**
     * @param plugin - 传入主插件实例 (index.ts 中的 'this')
     */
    constructor(plugin: any) {
        this.plugin = plugin;
    }
    // --- ^^^ 助手添加 ^^^ ---

    /**
     * Rebuilds the dropdown options based on the activation status.
     * @param settings The current plugin settings.
     */
    private populateSelectWithOptions(settings: any) {
        const baseUrls = {

            '免费ai': 'https://e12.free-chat.asia/',
            '当贝ai': 'https://ai.dangbei.com/chat',
            '深度ai': 'https://chat.deepseek.com/sign_in',
            '豆包ai': 'https://www.doubao.com/chat/',
            '通义ai': 'https://www.tongyi.com/',
            '千问ai': 'https://chat.qwen.ai/',
            '智谱ai': 'https://chatglm.cn/main/alltoolsdetail?lang=zh',
            '月之ai': 'https://www.kimi.com/',
            '秘塔ai': 'https://metaso.cn/',
            '迷你ai': 'https://agent.minimaxi.com/',
            '知识ai': 'https://ima.qq.com/',
            '发现ai': 'https://www.faxianai.com/',
        };

        const advancedUrls = {
            '接口ai': 'https://web.chatboxai.app/',
            '无限ai': 'https://g4f.dev/chat',
            '极简ai': 'local::minimalist-ai',
            '赛博ai': 'https://mumuverse.space:1520/',
            '知识库': 'https://ima.qq.com/wikis',
            '提示词': 'https://prompt.always200.com/',
            'n8n工作流': 'http://localhost:5678/',
            'Dify工作流': 'http://localhost/apps',
            '切换位置': 'local::toggle-position',
            'Notion': 'https://www.notion.com/zh-cn',
            'Gemini': 'https://gemini.google.com/app',
            'ChatGPT': 'https://sharedchat.fun/',
            'chatgpt': 'https://chatgpt.com/?model=auto',
            'grok': 'https://grok.com/',
            '香蕉ai': 'https://labs.google/fx/tools/whisk',
            '即梦ai': 'https://jimeng.jianying.com/ai-tool/home',
            '图书馆': 'https://vxc3hj17dym.feishu.cn/wiki/VDb1wMKDNiNj0mkJn6VcFgRenVc',
            'AGI之路': 'https://waytoagi.feishu.cn/wiki/QPe5w5g7UisbEkkow8XcDmOpn8e',
            'n8n社区': 'https://n8ncn.io/',
            '谷歌登录': 'https://accounts.google.com/ServiceLogin?passive=1209600&continue=https://gemini.google.com/app&followup=https://gemini.google.com/app&ec=GAZAkgU',
            '即梦登录': 'https://open.douyin.com/platform/oauth/connect?client_key=aw97st49sighch6k&response_type=code&scope=user_info&state=7742f5c93gAToVCgoVPZIDA5NDFmOWYxMjRmZWFkZTdkM2MwYzY4ZWJlZjNmMGQzoU7ZOGh0dHBzOi8vamltZW5nLmplYW55aW5nLmNvbS9haS10b29sL3RoaXJkLXBhcnR5LWNhbGxiYWNroVYBoUkAoUQAoUHSAAfWn6FNAKFIs2ppbWVuZy5qaWFueWluZy5jb22hUgKiUEzROl6mQUNUSU9OoKFMoKFU2SBhODIxMzc5Zjg5OWZkNjU1ZDMxMjQxOWZiZGVkODZhYaFXAKFGAKJTQQChVcKiTUzC&redirect_uri=https://jimeng.jianying.com/passport/web/web_login_success',
            'grok登录': 'https://accounts.x.ai/sign-in',
        };

        // 步骤 1: 先根据激活状态确定总列表
        let finalUrls = { ...baseUrls };
        if (settings.isActivated) {
            finalUrls = { ...baseUrls, ...advancedUrls };
        }

        // 步骤 2: 再根据是否为移动端, 从总列表中移除所有不兼容的选项
        if (this.isMobile) {
            // ... (移除不兼容选项的代码保持不变) ...
            delete finalUrls['深度ai'];
            delete finalUrls['秘塔ai'];
            delete finalUrls['通义ai'];
            delete finalUrls['智谱ai'];
            delete finalUrls['知识ai'];
            delete finalUrls['知识库'];
            delete finalUrls['千问ai'];
            delete finalUrls['提示词'];
            delete finalUrls['迷你ai'];
            delete finalUrls['n8n工作流'];
            delete finalUrls['Dify工作流'];
            delete finalUrls['Notion'];
            delete finalUrls['ChatGPT'];
            delete finalUrls['Gemini'];
            delete finalUrls['香蕉ai'];
            delete finalUrls['即梦ai'];
            delete finalUrls['谷歌登录'];
            delete finalUrls['即梦登录'];
            delete finalUrls['chatgpt'];
            delete finalUrls['grok'];
            delete finalUrls['grok登录'];
        }

        this.selectElement.innerHTML = ''; // Clear previous options
        Object.keys(finalUrls).forEach(key => {
            const option = document.createElement('option');
            option.value = finalUrls[key as keyof typeof finalUrls];
            option.dataset.key = key;
            option.textContent = key;
            this.selectElement.appendChild(option);
        });

        // Trigger a change to load the first item in the new list
        this.selectElement.dispatchEvent(new Event('change'));
    }

    /**
     * Public method called from index.ts to update the UI when settings change.
     * @param settings The new settings from the plugin.
     */
    public update(settings: any) {
        this.populateSelectWithOptions(settings);
    }

    /**
     * Renders the initial structure of the dock panel.
     * @param element The HTMLElement of the dock panel provided by Siyuan.
     * @param isMobile A boolean flag indicating the environment.
     * @param settings The initial plugin settings.
     */
    public render(element: HTMLElement, isMobile: boolean, settings: any) {
        this.isMobile = isMobile;
        const isDesktop = !isMobile;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.overflowX = 'auto';
        wrapper.style.overflowY = 'hidden';
        this.wrapper = wrapper;
        element.appendChild(wrapper);

        const iphoneUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1';
        const desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

        const createIframe = (url: string, minWidth = '300px'): HTMLIFrameElement => {
            // ... (函数保持不变) ...
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.minWidth = minWidth;
            return iframe;
        };

        const createWebview = (url: string, userAgent: string, minWidth = '300px'): HTMLElement => {
            // ... (函数保持不变) ...
            const webview = document.createElement('webview') as any;
            webview.src = url;
            webview.setAttribute('useragent', userAgent);
            webview.setAttribute('webpreferences', 'contextIsolation, javascript=yes');
            webview.setAttribute('allowpopups', '');
            webview.style.width = '100%';
            webview.style.height = '100%';
            webview.style.border = 'none';
            webview.style.minWidth = minWidth;
            return webview;
        };

        const controlsContainer = document.createElement('div');
        controlsContainer.style.position = 'absolute';
        controlsContainer.style.top = '10px';
        controlsContainer.style.right = '10px'; // 默认在右上角
        controlsContainer.style.zIndex = '10';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';

        // --- vvv 助手修改: 恢复透明度和过渡效果 ---
        controlsContainer.style.opacity = '0.3';
        controlsContainer.style.transition = 'opacity 0.3s ease-in-out';
        // --- ^^^ 助手修改 ^^^ ---

        wrapper.appendChild(controlsContainer);

        // --- vvv 助手修改: 恢复悬浮显示/隐藏的事件监听 ---
        controlsContainer.addEventListener('mouseenter', () => controlsContainer.style.opacity = '1');
        controlsContainer.addEventListener('mouseleave', () => controlsContainer.style.opacity = '0.3');
        // --- ^^^ 助手修改 ^^^ ---


        // --- vvv 助手添加: 移除双击 (dblclick) 逻辑 ---
        // controlsContainer.addEventListener('dblclick', (e: MouseEvent) => { ... });
        // --- ^^^ 助手添加 ^^^ ---


        const select = document.createElement('select');
        select.className = "b3-select";
        select.style.cursor = 'pointer';
        this.selectElement = select;
        controlsContainer.appendChild(select);

        // --- vvv 助手添加: 阻止 select 上的 mousedown 冒泡 vvv ---
        select.addEventListener('mousedown', (e: MouseEvent) => {
            // 阻止事件冒泡
            e.stopPropagation();
        });
        // --- ^^^ 助手添加 ^^^ ---

        // --- vvv 助手添加: 移除 select 上的 dblclick 阻止 vvv ---
        // select.addEventListener('dblclick', (e: MouseEvent) => { ... });
        // --- ^^^ 助手添加 ^^^ ---

        select.addEventListener('change', (event) => {
            const selectedOption = (event.target as HTMLSelectElement).selectedOptions[0];
            if (!selectedOption) {
                return;
            }
            const siteKey = selectedOption.dataset.key;
            const newUrl = selectedOption.value;


            // --- vvv 助手添加: 切换位置逻辑 vvv ---
            if (newUrl === 'local::toggle-position') {
                // 1. 执行切换
                if (controlsContainer.style.left === 'auto' || controlsContainer.style.left === '') {
                    // 当前在右上角 -> 切换到左上角
                    controlsContainer.style.left = '10px';
                    controlsContainer.style.right = 'auto';
                } else {
                    // 当前在左上角 -> 切换回右上角
                    controlsContainer.style.left = 'auto';
                    controlsContainer.style.right = '10px';
                }

                // 2. 将 select 恢复到 "切换位置" 之前的值
                if (this.previousUrl) {
                    this.selectElement.value = this.previousUrl;
                }

                // 3. 停止执行, 不加载任何内容
                return;
            }
            // --- ^^^ 助手添加 ^^^ ---


            if (this.currentElement) {
                this.wrapper.removeChild(this.currentElement);
                this.currentElement = null; // 置空
            }

            let isMinimalistAI = false;

            if (newUrl === 'local::minimalist-ai') {
                if (this.plugin.minimalistAI) {
                    this.currentElement = this.plugin.minimalistAI.load();
                    isMinimalistAI = true;
                } else {
                    console.error("MinimalistAI 模块未在主插件中初始化！");
                    const errorEl = document.createElement('div');
                    errorEl.textContent = "模块加载失败";
                    errorEl.style.padding = "20px";
                    this.currentElement = errorEl;
                }
            }
            else {
                const minWidth = siteKey === '当贝ai' ? '408px' : '300px';
                const specialUserAgents: { [key: string]: string } = {
                    '谷歌登录': iphoneUserAgent,
                    '秘塔ai': desktopUserAgent,
                };

                if (isDesktop) {
                    const userAgent = specialUserAgents[siteKey] || desktopUserAgent;
                    this.currentElement = createWebview(newUrl, userAgent, minWidth);
                } else {
                    this.currentElement = createIframe(newUrl, minWidth);
                }
            }

            // --- vvv 助手添加: 缓存当前成功的 URL (排除切换位置选项) vvv ---
            this.previousUrl = newUrl;
            // --- ^^^ 助手添加 ^^^ ---

            this.wrapper.appendChild(this.currentElement);

            if (isMinimalistAI && this.plugin.minimalistAI) {
                this.plugin.minimalistAI.onAppendedToDOM();
            }
        });

        const dockContainer = element.closest('.layout__dockr');
        if (dockContainer) {
            // ... (resizer 逻辑保持不变) ...
            const resizer = dockContainer.previousElementSibling;
            if (resizer) {
                resizer.addEventListener('mousedown', () => {
                    if (this.currentElement) this.currentElement.style.pointerEvents = 'none';
                });
            }
            window.addEventListener('mouseup', () => {
                if (this.currentElement) this.currentElement.style.pointerEvents = 'auto';
            });
        }

        this.populateSelectWithOptions(settings);
    }
}