/* ===== engine/signal.js — 信号处理工具 ===== */
/* DFT 等离散信号计算，供信号与变换可视化页面复用 */

/**
 * 离散傅里叶变换 — 计算幅度谱（前 N/2 个频率 bin）
 * @param {number[]} signal - 长度为 N 的时域信号数组
 * @returns {number[]} 长度为 N/2 的归一化幅度数组
 */
function dftMagnitude(signal) {
  var N = signal.length;
  var half = Math.floor(N / 2);
  var mag = [];
  for (var k = 0; k < half; k++) {
    var re = 0, im = 0;
    for (var n = 0; n < N; n++) {
      var ph = -2 * Math.PI * k * n / N;
      re += signal[n] * Math.cos(ph);
      im += signal[n] * Math.sin(ph);
    }
    mag.push(Math.hypot(re, im) / half);
  }
  return mag;
}
