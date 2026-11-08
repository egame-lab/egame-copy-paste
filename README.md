# E-game 積木複製貼上（精簡版）

從 [wangicheng/egame-tools](https://github.com/wangicheng/egame-tools) 的 `js/copy_paste_blocks_xml.js` 獨立整理出的 Chrome／Edge 擴充功能。

## 功能

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
4. 選擇**包含 `manifest.json`** 的 `egame-copy-paste` 資料夾。
5. 停用其他同時修改複製貼上的 Egame Tools，重新整理武館頁面。

## 專案檔案

```text
egame-copy-paste/
├── manifest.json       # Chrome/Edge 擴充功能設定
├── copy-paste.js       # 原作者複製貼上邏輯（未修改）
├── copy-paste.css      # 原作者工具列按鈕的必要樣式
├── images/
│   └── toolbar.png     # 使用者提供的按鈕位置截圖
├── README.md
└── LICENSE             # MIT；保留原作者著作權聲明
```

## 原始專案與授權
- 原始碼：[wangicheng/egame-tools](https://github.com/wangicheng/egame-tools)
- 原始檔案：`js/copy_paste_blocks_xml.js`、`css/dotcode_gaming.css`
- 授權：[MIT License](LICENSE)，保留原專案 `Copyright (c) 2025 wangicheng`。
