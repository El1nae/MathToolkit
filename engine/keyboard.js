/* ===== engine/keyboard.js — 输入系统 ===== */
/* 公式输入验证、模板插入、输入增强 */

/**
 * 验证公式字符串
 * @param {string} str - 用户输入
 * @param {string} [varName="x"] - 变量名
 * @returns {{valid: boolean, error: string|null, fn: Function|null}}
 */
function validateInput(str, varName) {
  varName = varName || "x";
  if (!str || !str.trim()) {
    return { valid: false, error: null, fn: null };
  }

  // 括号匹配检查
  var depth = 0;
  for (var i = 0; i < str.length; i++) {
    if (str[i] === '(') depth++;
    if (str[i] === ')') depth--;
    if (depth < 0) return { valid: false, error: "括号不匹配：多余的右括号", fn: null };
  }
  if (depth > 0) return { valid: false, error: "括号不匹配：缺少 " + depth + " 个右括号", fn: null };

  // 非法字符检查
  var allowed = /^[0-9a-zA-Z+\-*/^().!<>=&|?:,\s]+$/;
  if (!allowed.test(str)) {
    return { valid: false, error: "包含不支持的字符", fn: null };
  }

  // 尝试解析
  var fn = parseExpr(str, varName);
  if (!fn) {
    return { valid: false, error: "无法解析该公式，请检查语法", fn: null };
  }

  return { valid: true, error: null, fn: fn };
}

/**
 * 在输入框光标位置插入文本模板
 * @param {HTMLInputElement} inputEl - 输入框 DOM 元素
 * @param {string} template - 要插入的文本，如 "sin()"
 * @param {number} [cursorOffset=-1] - 插入后光标偏移量（-1 表示放在末尾括号前）
 */
function insertTemplate(inputEl, template, cursorOffset) {
  if (!inputEl) return;

  var start = inputEl.selectionStart || 0;
  var end = inputEl.selectionEnd || 0;
  var value = inputEl.value;

  var before = value.substring(0, start);
  var after = value.substring(end);
  var newValue = before + template + after;

  // 触发 React 的 onChange
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  ).set;
  nativeInputValueSetter.call(inputEl, newValue);
  inputEl.dispatchEvent(new Event('input', { bubbles: true }));

  // 设置光标位置
  var newCursor;
  if (cursorOffset !== undefined && cursorOffset !== null) {
    newCursor = start + template.length + cursorOffset;
  } else {
    // 默认：如果模板以 () 结尾，光标放在括号里
    if (template.endsWith('()')) {
      newCursor = start + template.length - 1;
    } else {
      newCursor = start + template.length;
    }
  }

  setTimeout(function() {
    inputEl.focus();
    inputEl.setSelectionRange(newCursor, newCursor);
  }, 0);
}

/**
 * 函数按钮列表（供 UI 层渲染）
 * label: 按钮显示文本, template: 插入模板
 */
var FUNC_BUTTONS = [
  { label: "sin",  template: "sin()" },
  { label: "cos",  template: "cos()" },
  { label: "tan",  template: "tan()" },
  { label: "log",  template: "log()" },
  { label: "ln",   template: "ln()" },
  { label: "√",    template: "sqrt()" },
  { label: "eˣ",   template: "exp()" },
  { label: "|x|",  template: "abs()" },
  { label: "π",    template: "pi" },
  { label: "e",    template: "e" },
  { label: "x²",   template: "^2" },
  { label: "xⁿ",   template: "^" },
];
