/* ===== engine/plot.js — SVG 图表引擎 ===== */

function createPlotContext(opts) {
  var W = opts.W || 360, H = opts.H || 220;
  var pad = opts.pad || { l: 32, r: 14, t: 14, b: 26 };
  var xMin = opts.xMin, xMax = opts.xMax, yMin = opts.yMin, yMax = opts.yMax;
  var plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  return {
    W: W, H: H, pad: pad, plotW: plotW, plotH: plotH,
    xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax,
    sx: function(x) { return pad.l + ((x - xMin) / (xMax - xMin)) * plotW; },
    sy: function(y) { return pad.t + (1 - (y - yMin) / (yMax - yMin)) * plotH; },
  };
}

function createCenteredContext(opts) {
  var W = opts.W || 360, H = opts.H || 340, unit = opts.unit || 28;
  return {
    W: W, H: H, unit: unit,
    sx: function(vx) { return W / 2 + vx * unit; },
    sy: function(vy) { return H / 2 - vy * unit; },
  };
}

function buildCurvePath(f, ctx, opts) {
  opts = opts || {};
  var n = opts.n || 300, margin = opts.clampMargin !== undefined ? opts.clampMargin : 1;
  var d = "", started = false;
  for (var i = 0; i <= n; i++) {
    var x = ctx.xMin + (i / n) * (ctx.xMax - ctx.xMin);
    var y = f(x);
    if (!isFinite(y)) { started = false; continue; }
    var cy = Math.max(ctx.yMin - margin, Math.min(ctx.yMax + margin, y));
    d += (!started ? "M" : "L") + ctx.sx(x).toFixed(2) + " " + ctx.sy(cy).toFixed(2) + " ";
    started = true;
  }
  return d.trim();
}

function buildFillPath(f, ctx, xStart, xEnd, n) {
  n = n || 120;
  if (xEnd <= xStart) return "";
  var y0 = ctx.sy(0);
  var d = "M" + ctx.sx(xStart).toFixed(2) + " " + y0.toFixed(2) + " ";
  for (var i = 0; i <= n; i++) {
    var x = xStart + (i / n) * (xEnd - xStart);
    var y = f(x);
    var cy = isFinite(y) ? Math.max(ctx.yMin, Math.min(ctx.yMax, y)) : 0;
    d += "L" + ctx.sx(x).toFixed(2) + " " + ctx.sy(cy).toFixed(2) + " ";
  }
  d += "L" + ctx.sx(xEnd).toFixed(2) + " " + y0.toFixed(2) + " Z";
  return d;
}

function buildBetweenPath(f1, f2, ctx, n) {
  n = n || 200;
  var top = [], bot = [];
  for (var i = 0; i <= n; i++) {
    var x = ctx.xMin + (i / n) * (ctx.xMax - ctx.xMin);
    var clamp = function(v) { return Math.max(ctx.yMin, Math.min(ctx.yMax, v)); };
    top.push(ctx.sx(x).toFixed(1) + " " + ctx.sy(clamp(f1(x))).toFixed(1));
    bot.push(ctx.sx(x).toFixed(1) + " " + ctx.sy(clamp(f2(x))).toFixed(1));
  }
  return "M" + top.join(" L") + " L" + bot.reverse().join(" L") + " Z";
}

function buildAccumPath(f, a, ctx, xEnd, n) {
  n = n || 160;
  var pts = [], fMax = 1e-6, fMin = 0;
  for (var i = 0; i <= n; i++) {
    var x = ctx.xMin + (i / n) * (ctx.xMax - ctx.xMin);
    var val = x >= a ? numericalIntegral(f, a, x, 200) : -numericalIntegral(f, x, a, 200);
    pts.push({ x: x, val: val });
    if (val > fMax) fMax = val;
    if (val < fMin) fMin = val;
  }
  var pad = (fMax - fMin) * 0.12 + 0.001;
  fMax += pad; fMin -= pad;
  var accCtx = createPlotContext({
    W: ctx.W, H: 150, pad: { l: 30, r: ctx.pad.r, t: 12, b: 22 },
    xMin: ctx.xMin, xMax: ctx.xMax, yMin: fMin, yMax: fMax,
  });
  var gray = "", green = "", started = false;
  pts.forEach(function(p, i) {
    gray += (i === 0 ? "M" : "L") + accCtx.sx(p.x).toFixed(2) + " " + accCtx.sy(p.val).toFixed(2) + " ";
  });
  pts.forEach(function(p) {
    if (p.x <= xEnd + 1e-9) {
      green += (!started ? "M" : "L") + accCtx.sx(p.x).toFixed(2) + " " + accCtx.sy(p.val).toFixed(2) + " ";
      started = true;
    }
  });
  var Fb = xEnd >= a ? numericalIntegral(f, a, xEnd, 200) : -numericalIntegral(f, xEnd, a, 200);
  green += "L" + accCtx.sx(xEnd).toFixed(2) + " " + accCtx.sy(Fb).toFixed(2) + " ";
  return { gray: gray, green: green, Fb: Fb, ctx: accCtx, fMax: fMax, fMin: fMin };
}

function computeTicks(min, max) {
  var range = max - min, step;
  if (range > 20) step = 5;
  else if (range > 10) step = 2;
  else if (range > 4) step = 1;
  else step = 0.5;
  var ticks = [];
  for (var v = Math.ceil(min / step) * step; v <= Math.floor(max / step) * step + 0.001; v += step) {
    ticks.push(Math.round(v * 1000) / 1000);
  }
  return ticks;
}

function buildRiemannRects(f, ctx, a, b, rectN) {
  rectN = rectN || 20;
  var rects = [];
  if (b <= a) return rects;
  var dx = (b - a) / rectN;
  for (var i = 0; i < rectN; i++) {
    var x0 = a + i * dx, xm = x0 + dx / 2;
    var h = f(xm);
    if (!isFinite(h)) continue;
    rects.push({
      x: ctx.sx(x0), y: h >= 0 ? ctx.sy(h) : ctx.sy(0),
      w: ctx.sx(x0 + dx) - ctx.sx(x0), h: Math.abs(ctx.sy(h) - ctx.sy(0)),
    });
  }
  return rects;
}

function buildConvPaths(xFn, hFn, t, lamMin, lamMax, ctx, n) {
  n = n || 360;
  var samples = [];
  for (var i = 0; i <= n; i++) {
    var l = lamMin + (i / n) * (lamMax - lamMin);
    samples.push({ l: l, x: xFn(l), hf: hFn(t - l) });
  }
  var pathFrom = function(sel) {
    var d = "";
    samples.forEach(function(p, i) {
      var v = sel(p);
      d += (i === 0 ? "M" : "L") + ctx.sx(p.l).toFixed(1) + " " + ctx.sy(isFinite(v) ? v : 0).toFixed(1) + " ";
    });
    return d;
  };
  var fillFrom = function(sel) {
    return pathFrom(sel) + "L" + ctx.sx(lamMax).toFixed(1) + " " + ctx.sy(0).toFixed(1) +
      " L" + ctx.sx(lamMin).toFixed(1) + " " + ctx.sy(0).toFixed(1) + " Z";
  };
  return {
    xPath: pathFrom(function(p) { return p.x; }),
    xFill: fillFrom(function(p) { return p.x; }),
    hPath: pathFrom(function(p) { return p.hf; }),
    prodFill: fillFrom(function(p) { return p.x * p.hf; }),
  };
}

function buildOutputPath(xFn, hFn, lamMin, lamMax, tMin, tMax, yMax, n) {
  n = n || 240;
  var oW = 360, oP = 26, oH = 150;
  var ox = function(t) { return oP + ((t - tMin) / (tMax - tMin)) * (oW - 2 * oP); };
  var oy = function(v) { return (oH - oP) - (v / yMax) * (oH - 2 * oP); };
  var d = "";
  for (var i = 0; i <= n; i++) {
    var t = tMin + (i / n) * (tMax - tMin);
    d += (i === 0 ? "M" : "L") + ox(t).toFixed(1) + " " + oy(convolve(xFn, hFn, t, lamMin, lamMax)).toFixed(1) + " ";
  }
  return { full: d, ox: ox, oy: oy, W: oW, H: oH, P: oP };
}

function buildOutputDone(xFn, hFn, lamMin, lamMax, tMin, tMax, tCur, yMax, outCtx) {
  var d = "", started = false;
  for (var i = 0; i <= 240; i++) {
    var t = tMin + (i / 240) * (tMax - tMin);
    if (t > tCur) break;
    d += (!started ? "M" : "L") + outCtx.ox(t).toFixed(1) + " " + outCtx.oy(convolve(xFn, hFn, t, lamMin, lamMax)).toFixed(1) + " ";
    started = true;
  }
  return d;
}

var GLOW_FILTER_SVG = '<filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
var AREA_GRADIENT_SVG = '<linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(160,100,255,1)" stop-opacity="0.28"/><stop offset="100%" stop-color="rgba(100,140,255,1)" stop-opacity="0.03"/></linearGradient>';
