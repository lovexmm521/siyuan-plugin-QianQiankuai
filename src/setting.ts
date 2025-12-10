import { Dialog, Plugin, showMessage } from "siyuan";

export default class SettingsTab {
    private plugin: Plugin;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    public open(currentSettings: any, saveCallback: (newSettings: any) => void) {
        const isActivated = currentSettings.isActivated;

        // 1. 根据激活状态定义不同的 HTML 内容
        let dialogContent = "";

        if (isActivated) {
            // --- 场景 A: 已激活界面 ---
            dialogContent = `
            <div class="b3-dialog__content">
                <div class="config-container" style="text-align: center; padding: 2rem 0;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <div class="fn__hr"></div>
                    <div style="margin-bottom: 0.5rem; font-weight: bold; font-size: 1.2em;">
                        千千·遇见版 已激活
                    </div>
                    <span class="b3-chip b3-chip--success">永久授权</span>
                    <div class="b3-label__text" style="margin-top: 2rem;">
                        未来将加入千千AI块与思源笔记深度结合的 MCP 等更多功能，敬请期待。
                    </div>
                </div>
            </div>
            <div class="b3-dialog__action">
                <button class="b3-button b3-button--cancel">关闭</button>
            </div>`;
        } else {
            // --- 场景 B: 未激活界面 (保留原有逻辑) ---
            dialogContent = `
            <div class="b3-dialog__content">
                <div class="config-container">
                    <div style="margin-bottom: 1rem;">
                        当前状态: <span class="b3-chip b3-chip--info">未激活</span>
                    </div>
                    <label for="activationCode" style="display: block; margin-bottom: 0.5rem;">请输入激活码:</label>
                    <input id="activationCode" class="b3-text-field" placeholder="输入激活码">
                    <div class="b3-label__text">输入正确的激活码即可激活。</div>
                </div>
            </div>
            <div class="b3-dialog__action">
                <button class="b3-button b3-button--cancel">取消</button>
                <button class="b3-button b3-button--text">激活</button>
            </div>`;
        }

        // 2. 创建 Dialog
        const dialog = new Dialog({
            title: "千千·遇见版",
            content: dialogContent,
            width: "520px",
        });

        // 3. 事件绑定 (逻辑分流)
        const cancelBtn = dialog.element.querySelector(".b3-button--cancel");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                dialog.destroy();
            });
        }

        // 仅在未激活状态下绑定“激活”逻辑
        if (!isActivated) {
            const inputElement = dialog.element.querySelector("#activationCode") as HTMLInputElement;
            const saveBtn = dialog.element.querySelector(".b3-button--text");

            if (saveBtn && inputElement) {
                saveBtn.addEventListener("click", () => {
                    // 原始验证逻辑
                    const correctCode = 'W'.charCodeAt(0) + 'Y'.charCodeAt(0) + 'Q'.charCodeAt(0) + Math.pow(2, 7) + Math.pow(2, 1) + Math.pow(2, 2) + Math.pow(2, 7) - Math.pow(2, 1);

                    if (parseInt(inputElement.value, 10) === correctCode) {
                        const newSettings = { ...currentSettings, isActivated: true };
                        saveCallback(newSettings);

                        showMessage("激活成功！");
                        dialog.destroy();

                        // 可选：激活成功后立即重新打开窗口展示成功状态，或者直接关闭
                        // this.open(newSettings, saveCallback);
                    } else {
                        showMessage("激活码错误", 3000, "error");
                    }
                });
            }
        }
    }
}