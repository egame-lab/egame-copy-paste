// 獨立精簡版：擷取自 Egame Tools 的 copy_paste_blocks_xml.js（MIT）。
// 處理 Blockly 積木 XML 的複製／貼上。
(() => {
  'use strict';

  if (window.__egameCopyPasteOnlyLoaded) return;
  window.__egameCopyPasteOnlyLoaded = true;

  const BlocklyReady = () => window.Blockly?.Xml;
  const getWorkspace = () => window.Blockly?.getMainWorkspace?.() ?? window.Blockly?.mainWorkspace;

  // 移除長度為 20 的積木 ID，避免重複貼上時 ID 衝突。
  // 只移除 XML 屬性，不改動積木中的文字內容。
  function serializeWithoutBlockIds(xmlNode) {
    const copy = xmlNode.cloneNode(true);
    const nodes = [copy, ...copy.querySelectorAll('[id]')];
    for (const element of nodes) {
      if (element.hasAttribute?.('id') && element.getAttribute('id').length === 20) {
        element.removeAttribute('id');
      }
    }
    return new XMLSerializer().serializeToString(copy);
  }

  function warnClipboard(action, error) {
    console.warn(`[E-game 積木複製貼上] ${action}失敗：`, error);
    alert(`${action}失敗。請確認 E-game 分頁位於前景、瀏覽器允許讀寫剪貼簿。\n${error?.message || ''}`);
  }

  function copyAll() {
    try {
      if (!BlocklyReady() || !getWorkspace()) throw new Error('找不到 Blockly 工作區');
      // 輸出 XML 片段，與原版的「複製全部」格式相容。
      const xml = Blockly.Xml.workspaceToDom(getWorkspace());
      const text = Array.from(xml.childNodes)
        .map(node => node.nodeType === 1 ? serializeWithoutBlockIds(node) : new XMLSerializer().serializeToString(node))
        .join('');
      navigator.clipboard.writeText(text).catch(error => warnClipboard('複製', error));
    } catch (error) {
      warnClipboard('複製', error);
    }
  }

  async function paste() {
    try {
      if (!BlocklyReady() || !getWorkspace()) throw new Error('找不到 Blockly 工作區');
      // 於按鈕的 click 事件中直接請求讀取，以保留瀏覽器的使用者操作授權。
      const clipboardText = (await navigator.clipboard.readText()).trim();
      if (!clipboardText) throw new Error('剪貼簿沒有內容');

      // 可貼上原版輸出的 <block> 片段，也接受完整的 <xml>...</xml>。
      const isFullXml = /^(?:<\?xml\s[^>]*\?>\s*)?<xml(?:\s|>)/i.test(clipboardText);
      const xmlText = isFullXml ? clipboardText : `<xml>${clipboardText}</xml>`;
      const root = Blockly.Xml.textToDom(xmlText);
      if (!root) throw new Error('XML 無法解析');

      // 原版 Blockly.Xml.domToWorkspace 會把積木「加入」現有工作區。
      Blockly.Xml.domToWorkspace(getWorkspace(), root);
    } catch (error) {
      warnClipboard('貼上', error);
    }
  }

  // 右鍵「複製／剪下」及 Ctrl+C／Ctrl+X：保留 Blockly 本身的操作，
  // 額外把單個積木的 XML 放入系統剪貼簿（原版功能）。
  const hookTimer = setInterval(() => {
    const blockly = window.Blockly;
    if (!blockly?.Xml || typeof blockly.copy_ !== 'function') return;
    clearInterval(hookTimer);
    const originalCopy = blockly.copy_;
    blockly.copy_ = function(block, ...args) {
      try {
        if (block) {
          const xml = serializeWithoutBlockIds(blockly.Xml.blockToDom(block));
          navigator.clipboard.writeText(xml).catch(error =>
            console.warn('[E-game 積木複製貼上] 單個積木複製失敗：', error)
          );
        }
      } catch (error) {
        console.warn('[E-game 積木複製貼上] 無法複製積木 XML：', error);
      }
      return originalCopy.call(this, block, ...args);
    };
  }, 200);

  function addButtons() {
    const pointerButton = document.getElementById('pointerButton');
    if (!pointerButton?.parentElement) return false;
    if (document.getElementById('egcp-copy-all')) return true;

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.id = 'egcp-copy-all';
    copyButton.className = 'egcp-button egcp-copy';
    copyButton.title = '複製工作區中的全部積木 XML';
    copyButton.setAttribute('aria-label', '複製全部積木');
    copyButton.addEventListener('click', copyAll);

    const pasteButton = document.createElement('button');
    pasteButton.type = 'button';
    pasteButton.id = 'egcp-paste';
    pasteButton.className = 'egcp-button egcp-paste';
    pasteButton.title = '從剪貼簿貼上積木 XML（不清除原有積木）';
    pasteButton.setAttribute('aria-label', '貼上積木');
    pasteButton.addEventListener('click', paste);

    pointerButton.parentElement.append(copyButton, pasteButton);
    return true;
  }

  const observer = new MutationObserver(() => {
    if (addButtons()) observer.disconnect();
  });
  function watchButtons() {
    if (addButtons()) return;
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.documentElement) watchButtons();
  else document.addEventListener('DOMContentLoaded', watchButtons, { once: true });
})();
