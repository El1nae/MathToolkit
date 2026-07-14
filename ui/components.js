/* ===== 不妙工具 · 公共组件（宝石终端版） ===== */

var el = React.createElement;

var C = {
  bg: "#0C0C0E",
  ink: "rgba(255,255,255,0.92)",
  sub: "rgba(255,255,255,0.55)",
  dim: "rgba(255,255,255,0.30)",
  ghost: "rgba(255,255,255,0.16)",
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.10)",

  fn: "rgba(100,140,255,0.90)",
  fill: "rgba(160,100,255,0.80)",
  fillLight: "rgba(160,100,255,0.12)",
  acc: "#26A69A",
  accDim: "#80CBC4",
  warn: "#EF5350",
  warnDim: "#EF9A9A",
  rose: "rgba(255,140,180,0.80)",
};

var STEP_COLORS = [
  "rgba(100,140,255,0.75)",
  "rgba(100,140,255,0.55)",
  "rgba(160,100,255,0.65)",
  "rgba(38,166,154,0.75)",
];

function Card(props) {
  var cls = "glass-1 " + (props.variant === "chart" ? "chart-card" : "card");
  if (props.className) cls += " " + props.className;
  return el("div", { className: cls, style: props.style }, props.children);
}

function BackLink(props) {
  return el("a", { href: props.href || "../index.html", className: "back-link" }, "← 返回首页");
}

function PageHeader(props) {
  return el("div", null,
    el(BackLink, { href: props.backHref }),
    el("h1", { className: "page-title" }, props.title),
    props.subtitle ? el("p", { className: "page-subtitle" }, props.subtitle) : null
  );
}

function Intuition(props) {
  return el("div", { className: "intuition-card" },
    el("div", { className: "intuition-label" }, "直觉"),
    el("div", { className: "intuition-text" }, props.children)
  );
}

function Legend(props) {
  return el("div", { className: "legend" },
    (props.items || []).map(function(it, i) {
      var swatchStyle = it.dashed
        ? { borderTopColor: it.color, background: "transparent" }
        : { background: it.color };
      return el("div", { key: i, className: "legend-item" },
        el("span", { className: "legend-swatch" + (it.dashed ? " dashed" : ""), style: swatchStyle }),
        el("span", null, it.label)
      );
    })
  );
}

function Steps(props) {
  return el("div", null,
    props.title ? el("div", {
      style: { fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 700, marginBottom: 12, color: C.ink }
    }, props.title) : null,
    el("div", { className: "step-list" },
      (props.items || []).map(function(s, i) {
        return el("div", { key: i, className: "step-item" },
          el("div", { className: "step-dot", style: { background: s.color || STEP_COLORS[i % 4] } }, i + 1),
          el("div", null,
            el("div", { className: "step-title" }, s.title),
            s.en ? el("div", { className: "step-en" }, s.en) : null,
            el("div", { className: "step-desc" }, s.desc)
          )
        );
      })
    )
  );
}

function ExampleSwitcher(props) {
  return el("div", { style: { display: "flex", gap: 6, marginBottom: 16 } },
    (props.examples || []).map(function(ex, i) {
      return el("button", {
        key: i, className: "ex-btn" + (i === (props.active || 0) ? " active" : ""),
        onClick: function() { props.onChange(i); }
      }, ex.name || ex);
    })
  );
}

function SliderControl(props) {
  return el("div", { style: { marginBottom: props.last ? 0 : 16 } },
    el("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } },
      el("span", { className: "section-label" }, props.label),
      el("span", { style: { fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: props.color || C.fn } }, props.display)
    ),
    el("input", {
      type: "range", min: props.min, max: props.max,
      step: props.step || 0.01, value: props.value,
      onChange: function(e) { props.onChange(parseFloat(e.target.value)); }
    }),
    props.hint ? el("div", { style: { fontSize: 10, color: C.ghost, marginTop: 4 } }, props.hint) : null
  );
}

function FormulaInput(props) {
  return el("div", null,
    el("input", {
      ref: props.inputRef,
      className: "formula-input" + (props.isError ? " error" : ""),
      value: props.value,
      onChange: function(e) { props.onChange(e.target.value); },
      placeholder: props.placeholder || "例如 x^2, sin(x), x^3 - 3x",
      spellCheck: false, autoComplete: "off",
    }),
    props.errorMsg ? el("div", { style: { fontSize: 11, color: C.warn, marginTop: 6 } }, props.errorMsg) : null,
    el("div", { style: { fontSize: 11, color: C.dim, marginTop: 8, lineHeight: 1.6 } },
      "支持：x^2 sin(x) cos(x) tan(x) exp(x) log(x) sqrt(x) abs(x) pi，乘法可省略（2x = 2*x）"
    )
  );
}

function PresetBar(props) {
  return el("div", { style: { marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 } },
    (props.presets || PRESETS).map(function(p) {
      return el("button", {
        key: p.label || p.name, className: "preset-btn",
        onClick: function() { props.onSelect(p); }
      }, p.label || p.name);
    })
  );
}

function RangeInputs(props) {
  return el("div", { style: { marginTop: 14, display: "flex", gap: 10 } },
    el("div", { style: { flex: 1 } },
      el("div", { className: "section-label", style: { marginBottom: 4 } }, props.minLabel || "x 最小值"),
      el("input", {
        type: "number", className: "num-input", value: props.min, step: props.step || 0.5,
        onChange: function(e) { var v = parseFloat(e.target.value); if (isFinite(v) && v < props.max) props.onMinChange(v); }
      })
    ),
    el("div", { style: { flex: 1 } },
      el("div", { className: "section-label", style: { marginBottom: 4 } }, props.maxLabel || "x 最大值"),
      el("input", {
        type: "number", className: "num-input", value: props.max, step: props.step || 0.5,
        onChange: function(e) { var v = parseFloat(e.target.value); if (isFinite(v) && v > props.min) props.onMaxChange(v); }
      })
    )
  );
}

function StatTile(props) {
  return el("div", { className: "glass-1 stat-tile" },
    el("div", { className: "stat-value", style: props.color ? { color: props.color } : null }, props.value),
    el("div", { className: "stat-label" }, props.label)
  );
}

function GridLines(props) {
  var ctx = props.ctx;
  var xTicks = props.xTicks || computeTicks(ctx.xMin, ctx.xMax);
  var yTicks = props.yTicks || computeTicks(ctx.yMin, ctx.yMax);
  var elems = [];
  xTicks.forEach(function(gx, i) {
    elems.push(el("line", { key: "gx" + i, x1: ctx.sx(gx), y1: ctx.pad.t, x2: ctx.sx(gx), y2: ctx.H - ctx.pad.b, stroke: "rgba(255,255,255,0.03)", strokeWidth: 0.5 }));
    elems.push(el("text", { key: "tx" + i, x: ctx.sx(gx), y: ctx.H - ctx.pad.b + 14, fontSize: 9, fill: "rgba(255,255,255,0.12)", textAnchor: "middle", fontFamily: "'Source Code Pro', monospace" }, gx));
  });
  yTicks.forEach(function(gy, i) {
    elems.push(el("line", { key: "gy" + i, x1: ctx.pad.l, y1: ctx.sy(gy), x2: ctx.W - ctx.pad.r, y2: ctx.sy(gy), stroke: "rgba(255,255,255,0.03)", strokeWidth: 0.5 }));
    elems.push(el("text", { key: "ty" + i, x: ctx.pad.l - 6, y: ctx.sy(gy) + 3, fontSize: 9, fill: "rgba(255,255,255,0.12)", textAnchor: "end", fontFamily: "'Source Code Pro', monospace" }, gy));
  });
  return el("g", null, elems);
}

function Axes(props) {
  var ctx = props.ctx, elems = [];
  if (ctx.yMin <= 0 && ctx.yMax >= 0)
    elems.push(el("line", { key: "xa", x1: ctx.pad.l, y1: ctx.sy(0), x2: ctx.W - ctx.pad.r, y2: ctx.sy(0), stroke: C.axis, strokeWidth: 1 }));
  if (ctx.xMin <= 0 && ctx.xMax >= 0)
    elems.push(el("line", { key: "ya", x1: ctx.sx(0), y1: ctx.pad.t, x2: ctx.sx(0), y2: ctx.H - ctx.pad.b, stroke: C.axis, strokeWidth: 1 }));
  return el("g", null, elems);
}

function DashedMarker(props) {
  var ctx = props.ctx;
  return el("g", null,
    el("line", {
      x1: ctx.sx(props.x), y1: ctx.pad.t, x2: ctx.sx(props.x), y2: ctx.H - ctx.pad.b,
      stroke: props.color || "rgba(255,255,255,0.10)", strokeWidth: props.width || 0.5,
      strokeDasharray: props.dash || "3 4",
    }),
    props.label ? el("text", {
      x: ctx.sx(props.x), y: ctx.H - ctx.pad.b + 14,
      fontSize: 9, fill: props.color || "rgba(255,255,255,0.20)",
      textAnchor: "middle", fontFamily: "'Source Code Pro', monospace",
      fontWeight: props.bold ? 600 : 400,
    }, props.label) : null
  );
}

/**
 * 向量箭头组件（用于线性代数可视化页面）
 * @param {object} props - { ctx, x, y, x0?, y0?, color, w? }
 *   ctx: createCenteredContext 返回的上下文
 *   x, y: 箭头终点（数据坐标）
 *   x0, y0: 箭头起点（默认原点 0,0）
 *   color: 箭头颜色
 *   w: 线宽（默认 2.5）
 */
function Arrow(props) {
  var ctx = props.ctx;
  var ox = props.x0 || 0, oy = props.y0 || 0;
  var x2 = ctx.sx(props.x), y2 = ctx.sy(props.y);
  var x1 = ctx.sx(ox), y1 = ctx.sy(oy);
  var ang = Math.atan2(y2 - y1, x2 - x1), h = 9;
  var p1 = [x2 - h * Math.cos(ang - 0.4), y2 - h * Math.sin(ang - 0.4)];
  var p2 = [x2 - h * Math.cos(ang + 0.4), y2 - h * Math.sin(ang + 0.4)];
  return el("g", null,
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: props.color, strokeWidth: props.w || 2.5, strokeLinecap: "round" }),
    el("polygon", { points: x2 + "," + y2 + " " + p1[0] + "," + p1[1] + " " + p2[0] + "," + p2[1], fill: props.color })
  );
}
