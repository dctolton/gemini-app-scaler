const STYLE_ID = 'wider-gemini-injected-styles';

function applyStyles(config) {
  if (chrome.runtime.lastError) {
    console.error('Wider Gemini Storage Error:', chrome.runtime.lastError);
    return;
  }

  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  const mode = config.mode === 'px' ? 'px' : '%';
  const customPx = Number(config.customPx) || 1200;
  const customPct = Number(config.customPct) || 85;
  const lineHeight = Number(config.lineHeight) || 1.5;
  const paraSpacing = Number(config.paraSpacing) || 1.0;
  const isCodeWrap = Boolean(config.codeWrap);

  const widthVal = mode === 'px' ? `${customPx}px` : `${customPct}%`;
  
  const css = `
    :root {
      --wg-width: ${widthVal};
      --wg-line-height: ${lineHeight};
      --wg-para-spacing: ${paraSpacing}em;
    }

    /* Target all possible primary layout roots */
    .conversation-container, .message-content, message-content,
    [data-test-id="message-content"], .input-area-container,
    .bottom-container, .chat-history, .rich-text-container,
    .model-response-text, model-response, user-message {
      max-width: var(--wg-width) !important;
      width: var(--wg-width) !important;
      margin-left: auto !important;
      margin-right: auto !important;
      transition: width 0.2s ease, max-width 0.2s ease;
    }

    /* Aggressive Table Scaling Protocol */
    /* Forces the table itself to act as a full-width block */
    table {
      width: 100% !important;
      max-width: 100% !important;
      display: table !important;
      box-sizing: border-box !important;
    }

    /* Uses :has() to bypass obfuscated class names and force any parent div wrapping a table to scale */
    div:has(> table),
    div:has(> div > table),
    model-response-table,
    [class*="table-wrapper"],
    [class*="table-container"],
    [data-test-id*="table"] {
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: auto !important;
    }

    /* Apply Reading Density */
    .message-content p, .message-content li, 
    .model-response-text p, .model-response-text li {
      line-height: var(--wg-line-height) !important;
      margin-bottom: var(--wg-para-spacing) !important;
    }

    /* Code Wrapping Protocol */
    ${isCodeWrap ? `
    pre, code, .code-block pre, snackbar-content pre {
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
      word-break: break-word !important;
      overflow-x: hidden !important;
    }
    ` : ''}
  `;

  styleEl.textContent = css;
}

const defaultConfig = {
  mode: '%', customPx: 1200, customPct: 85,
  lineHeight: 1.5, paraSpacing: 1.0, codeWrap: true
};

chrome.storage.sync.get(defaultConfig, applyStyles);

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') chrome.storage.sync.get(defaultConfig, applyStyles);
});