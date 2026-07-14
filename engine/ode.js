/* ===== engine/ode.js — ODE 数值求解器 ===== */
/* 前向欧拉法和经典 RK4 法，供微分方程可视化页面复用 */

/**
 * 前向欧拉法求解 dy/dx = slope(x, y)
 * @param {Function} slope - 斜率函数 (x, y) => dy/dx
 * @param {number} x0 - 初始 x
 * @param {number} y0 - 初始 y
 * @param {number} xEnd - 终点 x
 * @param {number} h - 步长
 * @returns {Array<number[]>} 解轨迹 [[x0,y0], [x1,y1], ...]
 */
function eulerSolve(slope, x0, y0, xEnd, h) {
  var pts = [];
  var x = x0, y = y0;
  while (x <= xEnd + 1e-9) {
    pts.push([x, y]);
    var k = slope(x, y);
    if (!isFinite(k)) break;
    y += h * k;
    x += h;
  }
  return pts;
}

/**
 * 经典四阶 Runge-Kutta 法求解 dy/dx = slope(x, y)
 * @param {Function} slope - 斜率函数 (x, y) => dy/dx
 * @param {number} x0 - 初始 x
 * @param {number} y0 - 初始 y
 * @param {number} xEnd - 终点 x
 * @param {number} h - 步长（默认 0.01）
 * @returns {Array<number[]>} 解轨迹 [[x0,y0], [x1,y1], ...]
 */
function rk4Solve(slope, x0, y0, xEnd, h) {
  h = h || 0.01;
  var pts = [];
  var x = x0, y = y0;
  while (x <= xEnd + 1e-9) {
    pts.push([x, y]);
    var k1 = slope(x, y);
    var k2 = slope(x + h / 2, y + h / 2 * k1);
    var k3 = slope(x + h / 2, y + h / 2 * k2);
    var k4 = slope(x + h, y + h * k3);
    y += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
    x += h;
    if (!isFinite(y)) break;
  }
  return pts;
}
