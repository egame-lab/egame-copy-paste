# E-game 積木工具（精簡版） v1.1.0

以 Hello Bug（wangicheng）的 [E-game Tools](https://github.com/wangicheng/egame-tools) 為基礎，整理積木複製、貼上與加速功能的輕量版 Chrome／Edge 擴充工具。

## 功能

- **加速**：在武館的「執行」旁按「加速」，以分批方式快速執行積木繪圖；執行中同一按鈕切換為「暫停」，暫停時切換為「繼續」。
- **一般執行**：保留 E-game 原本的「執行」按鈕及逐步動畫。
- **重置**：按原本的「重置」可取消目前的分批加速工作。

- **複製單個積木**：使用 Blockly 的右鍵「複製」，或其原生快捷鍵 `Ctrl+C`，若操作有呼叫 `Blockly.copy_()`，就同步把選取積木的 XML 寫入系統剪貼簿。
- **剪下**：使用遊戲本身的右鍵「剪下」或 `Ctrl+X`，僅在 Blockly 呼叫 `Blockly.copy_()` 時同步輸出 XML。原工作區哪些積木會保留取決於遊戲 Blockly。
- **複製**：按武館畫面右上方的雙方框圖示，把整個工作區積木複製為 XML。
- **貼上**：按複製旁邊的剪貼簿圖示，從系統剪貼簿讀取 XML 並新增至原工作區。
- **`Ctrl+V`**：原版腳本沒有另行實作 `Ctrl+V`；使用右上角的貼上按鈕。

![武館上方工具列。右側雙方框為複製全部，剪貼簿為貼上。](images/toolbar.png)

> 圖中的「雙方框」和「剪貼簿」是工具提供的兩個按鈕。複製／剪下單個積木則使用 Blockly 本身的操作。

## 安裝（Chrome／Edge）

1. 下載專案 ZIP 並解壓縮。
2. 開啟 Chrome 的 `chrome://extensions/` 或 Edge 的 `edge://extensions/`。
3. 啟用「開發人員模式」，按「載入未封裝項目」。
4. 選擇**包含 `manifest.json`** 的解壓縮資料夾。
5. 停用其他同時修改複製貼上或加速功能的 E-game Tools，以免重複加入按鈕或覆寫執行函式；重新整理武館頁面。

## 專案檔案

```text
egame-copy-paste-speedup-v1.1.0/
├── manifest.json       # Chrome/Edge 擴充功能設定
├── copy-paste.js       # 原作者複製貼上邏輯（未修改）
├── turtle-speedup.js    # 分批加速、暫停及繼續
├── copy-paste.css      # 原作者工具列按鈕的必要樣式
├── images/
│   └── toolbar.png     # 使用者提供的按鈕位置截圖
├── README.md
└── LICENSE             # MIT；保留原作者著作權聲明
```

## 原始專案與授權
- 原始碼：[wangicheng/egame-tools](https://github.com/wangicheng/egame-tools)
- 原始檔案：`js/copy_paste_blocks_xml.js`、`js/turtle_speedup.js`、`css/dotcode_gaming.css`
- 授權：[MIT License](LICENSE)，保留原專案 `Copyright (c) 2025 wangicheng`。

## 加速功能注意事項

- 快速執行分成多個小批次，讓頁面有機會回應暫停；**大型作品仍可能因事先產生 Blockly 執行紀錄而卡頓**，加速並不保證立即完成。
- 加速功能採用分批繪圖，並在一般執行或重置時取消先前的加速排程。
- 已於 E-game 武館進行基本操作測試，回報功能正常。初次使用或匯入大量積木時，仍建議先確認「執行／加速／暫停／繼續／重置」運作符合預期。
- 若需在官方頁面提交過關或儲存，請在繪圖完成後確認顯示結果，勿在尚未完成時重複點擊。
