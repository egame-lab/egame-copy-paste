# E-game 積木複製貼上（精簡版）

從 [wangicheng/egame-tools](https://github.com/wangicheng/egame-tools) 的 `copy_paste_blocks_xml.js` 拆出，依 MIT 授權改作。保留 E-game／Blockly **積木 XML 的複製、貼上**。

## 安裝（Chrome／Edge）

1. 解壓縮本 ZIP 檔。
2. 在 Chrome 開啟 `chrome://extensions/`（Edge 開啟 `edge://extensions/`）。
3. 啟用右上角的「開發人員模式」。
4. 按「載入未封裝項目」，選擇解壓後內含 `manifest.json` 的 `egame-copy-paste` 資料夾。
5. 重新整理已開啟的 E-game 積木編輯頁面。

## 使用
![複製與貼上按鈕位置](images/toolbar.png)
- 兩個按鈕位於武館上方工具列的右側，緊鄰音效控制與畫筆圖像按鈕。
- **單個積木複製**：右鍵「複製」／「剪下」，或 `Ctrl+C`／`Ctrl+X`，在原本的 Blockly 複製流程中額外將 XML 寫入剪貼簿。
- **複製（雙重方框圖示）**：按 E-game 編輯畫面右上方的「複製」圖示，將整個工作區輸出為積木 XML。
- **貼上（剪貼簿圖示）**：按複製旁邊的「貼上」圖示，將剪貼簿中的積木 XML **加入**目前工作區，不會先清空現有積木。
- 支援原版 Egame Tools 的 XML 片段，例如 `<block ...>...</block>`，也可貼上完整 `<xml>...</xml>`。


## 注意事項

- 此擴充功能在 `egame.kh.edu.tw` 的 E-game 積木頁面載入。
- 請在 E-game 分頁處於前景時按複製／貼上，瀏覽器可能因焦點或權限阻止剪貼簿操作。
- 建議先停用原版 **Egame Tools** 的相同功能或停用原版擴充功能，避免出現重複按鈕及攔截同一個複製動作。
- 此版本沿用原版的 Blockly XML API；若遊戲改版，可能需調整。

## 檔案

- `manifest.json`：指定 E-game 積木頁與剪貼簿讀取權限。
- `copy-paste.js`：全部複製、單個積木複製、貼上 XML。
- `copy-paste.css`：兩個按鈕的樣式。
- `LICENSE`：原專案 MIT 授權。
