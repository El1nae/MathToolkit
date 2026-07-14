/* ===== engine/parser.js — 公式解析器 ===== */
/* 将用户输入的数学表达式字符串解析为可执行的 JS 函数 */
/* 用法: var fn = parseExpr("x^2 + sin(x)"); fn(1.5) → 2.7474... */

/**
 * 将数学表达式字符串解析为 JavaScript 函数
 * @param {string} str - 用户输入的公式，如 "x^2", "sin(2x+1)"
 * @param {string} [varName="x"] - 变量名，默认 "x"，卷积页面可传 "l" (lambda)
 * @returns {Function|null} 成功返回 (varName) => number，失败返回 null
 */
function parseExpr(str, varName) {
  varName = varName || "x";
  if (!str || !str.trim()) return null;

  var cleaned = str.replace(/\s+/g, '');

  // ^ → **
  cleaned = cleaned.replace(/\^/g, '**');

  // 隐式乘法规则（按顺序应用）
  // 数字紧跟变量: 2x → 2*x
  cleaned = cleaned.replace(new RegExp('(\\d)(' + varName + ')', 'g'), '$1*$2');
  // 变量紧跟数字: x2 → x*2 (罕见但支持)
  cleaned = cleaned.replace(new RegExp('(' + varName + ')(\\d)', 'g'), '$1*$2');
  // 右括号紧跟变量: )x → )*x
  cleaned = cleaned.replace(new RegExp('\\)(' + varName + ')', 'g'), ')*$1');
  // 变量紧跟左括号: x( → x*(
  cleaned = cleaned.replace(new RegExp('(' + varName + ')\\(', 'g'), '$1*(');
  // 数字紧跟左括号: 2( → 2*(
  cleaned = cleaned.replace(/(\d)\(/g, '$1*(');
  // 右括号紧跟数字: )2 → )*2
  cleaned = cleaned.replace(/\)(\d)/g, ')*$1');
  // 右括号紧跟左括号: )( → )*(
  cleaned = cleaned.replace(/\)\(/g, ')*(');
  // 数字紧跟函数名: 2sin → 2*sin
  cleaned = cleaned.replace(/(\d)(sin|cos|tan|asin|acos|atan|log|ln|exp|sqrt|abs)/g, '$1*$2');
  // 右括号紧跟函数名: )sin → )*sin
  cleaned = cleaned.replace(/\)(sin|cos|tan|asin|acos|atan|log|ln|exp|sqrt|abs)/g, ')*$1');
  // 变量紧跟函数名: xsin → x*sin
  cleaned = cleaned.replace(new RegExp('(' + varName + ')(sin|cos|tan|asin|acos|atan|log|ln|exp|sqrt|abs)', 'g'), '$1*$2');

  // 函数名 → Math 方法（长名优先避免冲突）
  cleaned = cleaned.replace(/asin/g, 'Math.asin');
  cleaned = cleaned.replace(/acos/g, 'Math.acos');
  cleaned = cleaned.replace(/atan/g, 'Math.atan');
  cleaned = cleaned.replace(/sqrt/g, 'Math.sqrt');
  cleaned = cleaned.replace(/abs/g, 'Math.abs');
  cleaned = cleaned.replace(/exp/g, 'Math.exp');
  cleaned = cleaned.replace(/sin/g, 'Math.sin');
  cleaned = cleaned.replace(/cos/g, 'Math.cos');
  cleaned = cleaned.replace(/tan/g, 'Math.tan');
  cleaned = cleaned.replace(/\bln\b/g, 'Math.log');
  cleaned = cleaned.replace(/\blog\b/g, 'Math.log');

  // 常量（在函数替换之后）
  cleaned = cleaned.replace(/\bpi\b/gi, 'Math.PI');
  // e 但不是已经被替换的 Math.exp 或 Math.E 的一部分
  cleaned = cleaned.replace(/\be\b(?!xp)/g, 'Math.E');

  try {
    var fn = new Function(varName, '"use strict"; return (' + cleaned + ')');
    // 验证：在几个点上测试返回有限数字
    var t1 = fn(1);
    if (typeof t1 !== 'number') return null;
    // 允许 NaN/Infinity 在某些点（如 1/x 在 x=0），但至少一个点要有限
    var hasFinite = isFinite(t1);
    var tests = [0, -1, 0.5, 2, -0.5];
    for (var i = 0; i < tests.length; i++) {
      try {
        var v = fn(tests[i]);
        if (typeof v === 'number' && isFinite(v)) hasFinite = true;
      } catch(e) { /* 允许某些点报错 */ }
    }
    if (!hasFinite) return null;
    return fn;
  } catch(e) {
    return null;
  }
}

/**
 * 预设公式列表
 * label: 显示文本, expr: 公式字符串, xRange: [min, max] 推荐范围
 */
var PRESETS = [
  { label: "x²",       expr: "x^2",        xRange: [-3, 3] },
  { label: "sin(x)",   expr: "sin(x)",     xRange: [-1, 7] },
  { label: "cos(x)",   expr: "cos(x)",     xRange: [-1, 7] },
  { label: "x³−3x",    expr: "x^3-3x",     xRange: [-3, 3] },
  { label: "eˣ",       expr: "exp(x)",     xRange: [-2, 3] },
  { label: "1/x",      expr: "1/x",        xRange: [0.01, 5] },
  { label: "√x",       expr: "sqrt(x)",    xRange: [0, 5] },
  { label: "ln(x)",    expr: "ln(x)",      xRange: [0.01, 5] },
  { label: "x·sin(x)", expr: "x*sin(x)",   xRange: [-10, 10] },
  { label: "|x|",      expr: "abs(x)",     xRange: [-3, 3] },
];

/**
 * 卷积页面的预设（两个函数 x(λ) 和 h(λ)）
 */
var CONV_PRESETS = [
  {
    name: "两个方波 · Two pulses",
    xExpr: "l>=0&&l<=1?1:0", hExpr: "l>=0&&l<=1?1:0",
    lamMin: -1.5, lamMax: 3, tMin: -0.5, tMax: 3, t0: 0.6, yMax: 1.15,
    note: "两个一样的方波卷积，结果是一个三角形。重叠越多，面积越大。",
  },
  {
    name: "脉冲 × 衰减 · Pulse × decay",
    xExpr: "l>=0&&l<=1?1:0", hExpr: "l>=0?exp(-1.5*l):0",
    lamMin: -1.5, lamMax: 4.5, tMin: -0.5, tMax: 4.5, t0: 0.8, yMax: 0.75,
    note: "给系统一个脉冲输入，系统的'余响'会慢慢衰减——就像敲一下钟。",
  },
];

/**
 * 将二元数学表达式字符串解析为 JavaScript 函数
 * @param {string} str - 用户输入的公式，如 "x^2+y^2", "sin(x)*cos(y)"
 * @returns {Function|null} 成功返回 (x, y) => number，失败返回 null
 */
function parseExpr2D(str) {
  if (!str || !str.trim()) return null;

  var cleaned = str.replace(/\s+/g, '');
  cleaned = cleaned.replace(/\^/g, '**');

  // 隐式乘法规则（处理 x 和 y 两个变量）
  cleaned = cleaned.replace(/(\d)([xy])/g, '$1*$2');
  cleaned = cleaned.replace(/([xy])([xy])/g, '$1*$2');
  cleaned = cleaned.replace(/\)([xy(])/g, ')*$1');
  cleaned = cleaned.replace(/([xy])\(/g, '$1*(');
  cleaned = cleaned.replace(/(\d)\(/g, '$1*(');
  cleaned = cleaned.replace(/\)(\d)/g, ')*$1');
  cleaned = cleaned.replace(/\)\(/g, ')*(');
  cleaned = cleaned.replace(/(\d)(sin|cos|tan|asin|acos|atan|log|ln|exp|sqrt|abs)/g, '$1*$2');
  cleaned = cleaned.replace(/\)(sin|cos|tan|asin|acos|atan|log|ln|exp|sqrt|abs)/g, ')*$1');
  cleaned = cleaned.replace(/([xy])(sin|cos|tan|asin|acos|atan|log|ln|exp|sqrt|abs)/g, '$1*$2');

  // 函数名 → Math 方法（长名优先避免冲突）
  cleaned = cleaned.replace(/asin/g, 'Math.asin');
  cleaned = cleaned.replace(/acos/g, 'Math.acos');
  cleaned = cleaned.replace(/atan/g, 'Math.atan');
  cleaned = cleaned.replace(/sqrt/g, 'Math.sqrt');
  cleaned = cleaned.replace(/abs/g, 'Math.abs');
  cleaned = cleaned.replace(/exp/g, 'Math.exp');
  cleaned = cleaned.replace(/sin/g, 'Math.sin');
  cleaned = cleaned.replace(/cos/g, 'Math.cos');
  cleaned = cleaned.replace(/tan/g, 'Math.tan');
  cleaned = cleaned.replace(/\bln\b/g, 'Math.log');
  cleaned = cleaned.replace(/\blog\b/g, 'Math.log');

  // 常量
  cleaned = cleaned.replace(/\bpi\b/gi, 'Math.PI');
  cleaned = cleaned.replace(/\be\b(?!xp)/g, 'Math.E');

  try {
    var fn = new Function('x', 'y', '"use strict"; return (' + cleaned + ')');
    if (typeof fn(0.5, 0.5) !== 'number') return null;
    // 多点验证
    var hasFinite = false;
    var tests = [[1,1],[0,0],[-1,1],[0.5,-0.5],[2,0]];
    for (var i = 0; i < tests.length; i++) {
      try {
        var v = fn(tests[i][0], tests[i][1]);
        if (typeof v === 'number' && isFinite(v)) hasFinite = true;
      } catch(e) { /* 允许某些点报错 */ }
    }
    if (!hasFinite) return null;
    return fn;
  } catch(e) {
    return null;
  }
}

/**
 * 编译斜率表达式 dy/dx = f(x, y)
 * 用于方向场和欧拉法等 ODE 场景
 * @param {string} str - 表达式字符串，如 "x-y", "x*y"
 * @returns {Function} (x, y) => number，解析失败返回恒零函数
 */
function compileSlopeExpr(str) {
  var fn = parseExpr2D(str);
  return fn || function() { return 0; };
}
