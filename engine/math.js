/* ===== engine/math.js — 数学计算引擎 ===== */
/* 纯数学函数，无 UI 依赖 */

/**
 * 数值微分（中心差分法）
 * @param {Function} f - 函数
 * @param {number} x - 求导点
 * @param {number} [h=1e-7] - 步长
 * @returns {number} f'(x) 的近似值
 */
function numericalDerivative(f, x, h) {
  h = h || 1e-7;
  return (f(x + h) - f(x - h)) / (2 * h);
}

/**
 * 数值积分（梯形法）
 * @param {Function} f - 被积函数
 * @param {number} a - 下限
 * @param {number} b - 上限
 * @param {number} [n=1000] - 分割段数
 * @returns {number} ∫ₐᵇ f(x)dx 的近似值
 */
function numericalIntegral(f, a, b, n) {
  n = n || 1000;
  if (a >= b) return 0;
  var h = (b - a) / n;
  var sum = 0;
  for (var i = 0; i <= n; i++) {
    var x = a + i * h;
    var y = f(x);
    if (!isFinite(y)) y = 0;
    var w = (i === 0 || i === n) ? 0.5 : 1;
    sum += w * y;
  }
  return sum * h;
}

/**
 * 数值卷积
 * @param {Function} xFn - 输入信号 x(λ)
 * @param {Function} hFn - 响应 h(λ)
 * @param {number} t - 时间/平移量
 * @param {number} lamMin - λ 下限
 * @param {number} lamMax - λ 上限
 * @param {number} [dl=0.004] - 步长
 * @returns {number} y(t) = ∫ x(λ)h(t-λ) dλ
 */
function convolve(xFn, hFn, t, lamMin, lamMax, dl) {
  dl = dl || 0.004;
  var s = 0;
  for (var l = lamMin; l <= lamMax; l += dl) {
    var val = xFn(l) * hFn(t - l);
    if (isFinite(val)) s += val * dl;
  }
  return s;
}

/**
 * 自动计算 y 轴范围
 * @param {Function} f - 函数
 * @param {number} xMin - x 最小值
 * @param {number} xMax - x 最大值
 * @param {number} [samples=300] - 采样数
 * @returns {{yMin: number, yMax: number}}
 */
function autoRange(f, xMin, xMax, samples) {
  samples = samples || 300;
  var lo = Infinity, hi = -Infinity;
  for (var i = 0; i <= samples; i++) {
    var x = xMin + (i / samples) * (xMax - xMin);
    var y = f(x);
    if (isFinite(y)) {
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    }
  }
  if (!isFinite(lo) || !isFinite(hi)) { lo = -1; hi = 1; }
  var pad = (hi - lo) * 0.15;
  if (pad < 0.1) pad = 0.5;
  return { yMin: lo - pad, yMax: hi + pad };
}

/**
 * 采样生成曲线数据点（处理不连续点）
 * @param {Function} f - 函数
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} [n=300] - 采样数
 * @returns {Array<{x: number, y: number, finite: boolean}>}
 */
function sampleCurve(f, xMin, xMax, n) {
  n = n || 300;
  var points = [];
  for (var i = 0; i <= n; i++) {
    var x = xMin + (i / n) * (xMax - xMin);
    var y = f(x);
    points.push({ x: x, y: y, finite: isFinite(y) });
  }
  return points;
}

/**
 * 将采样点转为 SVG path 字符串（自动断开不连续点）
 * @param {Array} points - sampleCurve 的返回值
 * @param {Function} sx - x 坐标映射
 * @param {Function} sy - y 坐标映射
 * @param {number} yMin - 裁剪下界
 * @param {number} yMax - 裁剪上界
 * @returns {string} SVG path d 属性
 */
function pointsToPath(points, sx, sy, yMin, yMax) {
  var d = "";
  var started = false;
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    if (!p.finite) { started = false; continue; }
    var cy = Math.max(yMin, Math.min(yMax, p.y));
    d += (!started ? "M" : "L") + sx(p.x).toFixed(2) + " " + sy(cy).toFixed(2) + " ";
    started = true;
  }
  return d.trim();
}

/**
 * 生成带填充的 SVG path（封闭到 y=0 轴）
 * @param {Array} points - sampleCurve 的返回值
 * @param {Function} sx - x 坐标映射
 * @param {Function} sy - y 坐标映射
 * @param {number} xStart - 填充起始 x
 * @param {number} xEnd - 填充结束 x
 * @returns {string} SVG path d 属性（封闭）
 */
function pointsToFillPath(points, sx, sy, xStart, xEnd) {
  var filtered = points.filter(function(p) {
    return p.finite && p.x >= xStart && p.x <= xEnd;
  });
  if (filtered.length < 2) return "";
  var d = "M" + sx(filtered[0].x).toFixed(2) + " " + sy(0).toFixed(2) + " ";
  for (var i = 0; i < filtered.length; i++) {
    d += "L" + sx(filtered[i].x).toFixed(2) + " " + sy(filtered[i].y).toFixed(2) + " ";
  }
  d += "L" + sx(filtered[filtered.length - 1].x).toFixed(2) + " " + sy(0).toFixed(2) + " Z";
  return d;
}

/**
 * 阶乘
 * @param {number} n - 非负整数
 * @returns {number} n!
 */
function factorial(n) {
  var r = 1;
  for (var i = 2; i <= n; i++) r *= i;
  return r;
}

/**
 * 泰勒多项式求值
 * @param {Function} coeffFn - 系数函数 (k, x0) => cₖ
 * @param {number} x0 - 展开中心
 * @param {number} n - 阶数
 * @param {number} x - 求值点
 * @returns {number} T_n(x) = Σ cₖ·(x−x₀)ᵏ
 */
function taylorVal(coeffFn, x0, n, x) {
  var s = 0, dx = x - x0;
  for (var k = 0; k <= n; k++) s += coeffFn(k, x0) * Math.pow(dx, k);
  return s;
}

/**
 * 二分法求根：在 [a, b] 上找 f(x)=0 的根
 * @param {Function} f - 连续函数
 * @param {number} a - 区间左端
 * @param {number} b - 区间右端
 * @param {number} [iter=40] - 迭代次数
 * @returns {number} 近似根
 */
function bisectRoot(f, a, b, iter) {
  iter = iter || 40;
  var lo = a, hi = b;
  for (var k = 0; k < iter; k++) {
    var mid = (lo + hi) / 2;
    if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}
