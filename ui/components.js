/* ===== 不妙工具 · 公共组件（宝石终端版） ===== */

var el = React.createElement;

var C = {
  bg: "#101116",
  ink: "rgba(255,255,255,0.92)",
  sub: "rgba(255,255,255,0.62)",
  dim: "rgba(255,255,255,0.40)",
  ghost: "rgba(255,255,255,0.24)",
  grid: "rgba(255,255,255,0.08)",
  axis: "rgba(255,255,255,0.55)",

  fn: "#7C9CC4",          // 主曲线 — 钢蓝（图纸唯一强调色）
  fill: "#B79B77",        // 次要 — 赭黄（制图墨）
  fillLight: "rgba(183,155,119,0.14)",
  acc: "#7FB0A6",         // 强调 — 灰绿
  accDim: "#A6C8C0",
  warn: "#E0655C",
  warnDim: "#E8938C",
  rose: "#C98B9E",
};

var STEP_COLORS = [
  "#7C9CC4",
  "rgba(124,156,196,0.65)",
  "#B79B77",
  "#7FB0A6",
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
    (props.tag || props.index) ? el("div", { className: "bp-head" },
      el("div", { className: "bp-tag" }, props.tag || ""),
      props.index ? el("div", { className: "bp-index" }, props.index) : null
    ) : null,
    el("h1", { className: "page-title" }, props.title),
    props.subtitle ? el("p", { className: "page-subtitle" }, props.subtitle) : null
  );
}

/* 底部方括号关键句 */
function KeyLine(props) {
  return el("div", { className: "bp-bracket", style: props.style },
    el("span", { className: "br" }, "["),
    props.children,
    el("span", { className: "br" }, "]")
  );
}

function Intuition(props) {
  return el("div", { className: "intuition-card" },
    el("div", { className: "intuition-label" }, "我将用最直白不绕弯子的方式一针见血地告诉你..."),
    el("div", { className: "intuition-text" }, props.children)
  );
}

function Legend(props) {
  return el("div", { className: "legend" },
    (props.items || []).map(function(it, i) {
      var swatchStyle = { color: it.color, borderTopStyle: it.dashed ? "dashed" : "solid" };
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
    elems.push(el("line", { key: "gx" + i, x1: ctx.sx(gx), y1: ctx.pad.t, x2: ctx.sx(gx), y2: ctx.H - ctx.pad.b, stroke: "rgba(255,255,255,0.08)", strokeWidth: 0.5 }));
    elems.push(el("text", { key: "tx" + i, x: ctx.sx(gx), y: ctx.H - ctx.pad.b + 13, fontSize: 9, fill: "rgba(255,255,255,0.40)", textAnchor: "middle", fontFamily: "'Source Code Pro', monospace" }, gx));
  });
  yTicks.forEach(function(gy, i) {
    elems.push(el("line", { key: "gy" + i, x1: ctx.pad.l, y1: ctx.sy(gy), x2: ctx.W - ctx.pad.r, y2: ctx.sy(gy), stroke: "rgba(255,255,255,0.08)", strokeWidth: 0.5 }));
    elems.push(el("text", { key: "ty" + i, x: ctx.pad.l - 6, y: ctx.sy(gy) + 3, fontSize: 9, fill: "rgba(255,255,255,0.40)", textAnchor: "end", fontFamily: "'Source Code Pro', monospace" }, gy));
  });
  return el("g", null, elems);
}

/* 十字准星（registration mark）：某一屏幕坐标点处画短线段十字 */
function Crosshair(props) {
  var s = props.size || 7;
  var color = props.color || "rgba(124,156,196,0.6)";
  return el("g", { stroke: color, strokeWidth: 0.5 },
    el("line", { x1: props.px - s, y1: props.py, x2: props.px + s, y2: props.py }),
    el("line", { x1: props.px, y1: props.py - s, x2: props.px, y2: props.py + s })
  );
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

/* ============================================================
   交互浮层组件（全站统一）
   - StickyChart : 图表吸顶容器
   - SidePanel   : 左侧拉出的"输入 + 说明书"浮窗（自管开合）
   - SyntaxHelp  : 公式语法说明表（默认放进 SidePanel）
   - BottomDock  : 底部悬浮滑块坞（自管开合 + 向上拖拽增高）
   ============================================================ */

/* 默认公式语法说明（一元 x） */
var SYNTAX_X = [
  { code: "x^2", desc: "幂运算" },
  { code: "2x", desc: "省略乘号 = 2*x" },
  { code: "sin cos tan", desc: "三角函数" },
  { code: "exp(x)", desc: "指数 eˣ" },
  { code: "log(x)", desc: "自然对数 ln" },
  { code: "sqrt(x)", desc: "平方根" },
  { code: "abs(x)", desc: "绝对值" },
  { code: "pi", desc: "圆周率 π" },
];

/* 图表吸顶容器：把 <Card variant="chart"> 包进来即可 */
function StickyChart(props) {
  return el("div", { className: "sticky-chart", style: props.style }, props.children);
}

/* 公式语法说明表 */
function SyntaxHelp(props) {
  var rows = props.rows || SYNTAX_X;
  return el("div", { className: "panel-block", style: { marginBottom: 0 } },
    el("h4", null, props.title || "语法说明书"),
    rows.map(function(s, i) {
      return el("div", { key: i, className: "syntax-row" },
        el("code", null, s.code),
        el("span", null, s.desc)
      );
    })
  );
}

/* 左侧拉出面板：自管开合。把输入框/预设/范围等放进 children，
   末尾默认附一份语法说明书（可用 syntax={false} 关闭，或 syntax=[...] 自定义）。 */
function SidePanel(props) {
  var st = React.useState(false), open = st[0], setOpen = st[1];
  var syntax = props.syntax;
  var showSyntax = syntax !== false;
  return el(React.Fragment, null,
    el("div", { className: "side-handle" + (open ? " open" : ""), onClick: function() { setOpen(!open); } },
      el("span", { className: "grip" }, open ? "收起 ‹" : (props.handleLabel || "输入") + " ›")
    ),
    el("div", { className: "side-panel" + (open ? " open" : "") },
      props.children,
      showSyntax ? el(SyntaxHelp, { rows: Array.isArray(syntax) ? syntax : null }) : null
    )
  );
}

/* 面板内的分区块（带小标题） */
function PanelBlock(props) {
  return el("div", { className: "panel-block", style: props.style },
    props.title ? el("h4", null, props.title) : null,
    props.children
  );
}

/* 底部悬浮滑块坞：自管开合（默认收起）+ 顶部把手向上拖拽增高。
   把若干 <SliderControl last /> 包进 children。 */
function BottomDock(props) {
  var so = React.useState(false), open = so[0], setOpen = so[1];
  var sh = React.useState(props.height || 132), h = sh[0], setH = sh[1];
  var drag = React.useRef(null);

  var onGripDown = function(e) {
    e.preventDefault();
    var startY = e.touches ? e.touches[0].clientY : e.clientY;
    drag.current = { startY: startY, startH: h };
    var move = function(ev) {
      var y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      var next = drag.current.startH + (drag.current.startY - y);
      var max = window.innerHeight * 0.8;
      setH(Math.max(84, Math.min(max, next)));
    };
    var up = function() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  return el(React.Fragment, null,
    el("div", { className: "dock-ball" + (open ? " hidden" : ""), onClick: function() { setOpen(true); } },
      el("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none" },
        el("line", { x1: 4, y1: 8, x2: 20, y2: 8, stroke: "#7C9CC4", strokeWidth: 1.5 }),
        el("circle", { cx: 9, cy: 8, r: 3, fill: "#101116", stroke: "#7C9CC4", strokeWidth: 1.5 }),
        el("line", { x1: 4, y1: 16, x2: 20, y2: 16, stroke: "rgba(255,255,255,0.5)", strokeWidth: 1.5 }),
        el("circle", { cx: 15, cy: 16, r: 3, fill: "#101116", stroke: "rgba(255,255,255,0.5)", strokeWidth: 1.5 })
      )
    ),
    el("div", { className: "dock" + (open ? " open" : ""), style: { "--dock-h": h + "px" } },
      el("div", { className: "dock-grip", onMouseDown: onGripDown, onTouchStart: onGripDown }),
      el("div", { className: "dock-bar" },
        el("span", { className: "dock-title" }, props.title || "参数控制台 · drag to explore"),
        el("span", { className: "dock-close", onClick: function() { setOpen(false); } }, "×")
      ),
      el("div", { className: "dock-tracks" }, props.children)
    )
  );
}

/* 底部预留空间：避免悬浮球盖住页面最后内容 */
function DockSpacer(props) {
  return el("div", { style: { height: props.height || 80 } });
}
