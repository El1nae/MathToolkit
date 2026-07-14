/* ===== engine/linalg.js — 2×2 线性代数工具 ===== */
/* 特征值、SVD、矩阵运算等，供线性代数可视化页面复用 */

/**
 * 2×2 矩阵特征值与特征向量
 * @param {number} a - M[0][0]
 * @param {number} b - M[0][1]
 * @param {number} c - M[1][0]
 * @param {number} d - M[1][1]
 * @returns {{real: boolean, T: number, D: number, l1?: number, l2?: number, v1?: number[], v2?: number[]}}
 */
function eig(a, b, c, d) {
  var T = a + d, D = a * d - b * c, disc = T * T - 4 * D;
  if (disc < 0) return { real: false, T: T, D: D };
  var s = Math.sqrt(disc), l1 = (T + s) / 2, l2 = (T - s) / 2;
  var vecFor = function(l) {
    var vx, vy;
    if (Math.abs(b) > 1e-9) { vx = b; vy = l - a; }
    else if (Math.abs(c) > 1e-9) { vx = l - d; vy = c; }
    else { vx = Math.abs(a - l) < 1e-9 ? 1 : 0; vy = 1 - vx; }
    var n = Math.hypot(vx, vy) || 1;
    return [vx / n, vy / n];
  };
  return { real: true, l1: l1, l2: l2, v1: vecFor(l1), v2: vecFor(l2), T: T, D: D };
}

/**
 * 2×2 奇异值分解 A = U Σ Vᵀ
 * @param {number} a - A[0][0]
 * @param {number} b - A[0][1]
 * @param {number} c - A[1][0]
 * @param {number} d - A[1][1]
 * @returns {{s1: number, s2: number, U: number[][], Vt: number[][], Sig: number[][]}}
 */
function svd2(a, b, c, d) {
  // eigen-decompose AᵀA = [[p,q],[q,r]] to get V and singular values
  var p = a * a + c * c, q = a * b + c * d, r = b * b + d * d;
  var T = p + r, disc = Math.sqrt(Math.max(0, T * T - 4 * (p * r - q * q)));
  var e1 = (T + disc) / 2, e2 = (T - disc) / 2;
  var s1 = Math.sqrt(Math.max(0, e1)), s2 = Math.sqrt(Math.max(0, e2));
  var vx, vy;
  if (Math.abs(q) > 1e-9) { vx = e1 - r; vy = q; }
  else { vx = p >= r ? 1 : 0; vy = p >= r ? 0 : 1; }
  var n = Math.hypot(vx, vy) || 1; vx /= n; vy /= n;
  var V = [[vx, -vy], [vy, vx]];
  // U columns = A·vᵢ / σᵢ
  var u1x = a * vx + b * vy, u1y = c * vx + d * vy;
  var u2x = a * (-vy) + b * vx, u2y = c * (-vy) + d * vx;
  var U = [[s1 > 1e-9 ? u1x / s1 : 1, s2 > 1e-9 ? u2x / s2 : 0],
           [s1 > 1e-9 ? u1y / s1 : 0, s2 > 1e-9 ? u2y / s2 : 1]];
  return { s1: s1, s2: s2, U: U, Vt: [[V[0][0], V[1][0]], [V[0][1], V[1][1]]], Sig: [[s1, 0], [0, s2]] };
}

/**
 * 2×2 矩阵乘法
 * @param {number[][]} M - 左矩阵 [[a,b],[c,d]]
 * @param {number[][]} N - 右矩阵 [[e,f],[g,h]]
 * @returns {number[][]} 乘积矩阵
 */
function mul2x2(M, N) {
  return [
    [M[0][0] * N[0][0] + M[0][1] * N[1][0], M[0][0] * N[0][1] + M[0][1] * N[1][1]],
    [M[1][0] * N[0][0] + M[1][1] * N[1][0], M[1][0] * N[0][1] + M[1][1] * N[1][1]]
  ];
}

/**
 * 2×2 矩阵应用到向量
 * @param {number[][]} M - 矩阵 [[a,b],[c,d]]
 * @param {number} x - 向量 x 分量
 * @param {number} y - 向量 y 分量
 * @returns {number[]} 变换后的 [x', y']
 */
function applyMat(M, x, y) {
  return [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
}
