// @ts-nocheck
export const abs = Math.abs, min = Math.min, max = Math.max, Rt2 = Math.sqrt(2), Inf = Infinity;
export const add = (p, d) => isFinite(d) ? p + d : d;
export const dfn = (x, d) => isNaN(x) ? d : x;
export const fnt = (x, d) => isFinite(x) ? x : d;
export const get = (a, k, d) => a[k] ?? d;
export const set = (a, k, v) => (a[k] = v, a)
export const pre = (a, k, d) => (a[k] = get(a, k, d))
export const pop = (a, k, d) => { const v = get(a, k, d); delete a[k]; return v }
export const pow = (x, a) => sgn(x) * Math.pow(abs(x), a || 2)
export const sgn = (x) => x < 0 ? -1 : 1;
export const clip = (x, m, M) => min(max(x, m), M);
export const each = (a, f) => a && a.map ? a.map(f) : f(a, 0);
export const map = (a, f) => [].concat(a || []).map(f);
export const up = Object.assign;
export const noop = () => {};

export const randInt = (m, M) => Math.round((M - m) * Math.random()) + m;

export const trig = {
  rad: function (a) { return Math.PI / 180 * a },
  sin: function (a) { return Math.sin(trig.rad(a)) },
  cos: function (a) { return Math.cos(trig.rad(a)) },
  cut: function (x) { return util.clip(x, -359.999, 359.999) },
  polar: function (r, a) { return [r * trig.cos(a), r * trig.sin(a)] }
}

export function units(o, u) {
  const t = {}
  for (const k in o)
    t[k] = Q.unify(k, o[k], u)
  return t;
}
export const Q = up(units, {
    defaults: {
      top: 'px',
      left: 'px',
      right: 'px',
      bottom: 'px',
      width: 'px',
      height: 'px',
      size: 'px', // NB: generalized magnitude
      translate: 'px',
      rotate: 'deg',
      skewX: 'deg',
      skewY: 'deg',
      borderRadius: 'px'
    },

    unify: (k, v, u = Q.defaults) => {
      const d = u[k] || ''
      return each(v, (x) => isFinite(x) ? x + d : x)
    },

    strip: (k, v, u = Q.defaults) => {
      const d = u[k], n = d && d.length;
      if (d)
        return each(v, (x) => x.substr(-n) == d ? parseFloat(x) : x)
      return v;
    },

    each: (ks, o, u = Q.defaults) => each(ks, (k) => Q.unify(k, o[k], u)),
    map: (ks, vs, u = Q.defaults) => each(ks, (k, i) => Q.unify(k, vs[i], u)),
    rect: (b, u) => `rect(${Q.each(['top', 'right', 'bottom', 'left'], b, u)})`,
    calc: (a, o) => `calc(${[].concat(a).join(' ' + (o || '-') + ' ')})`,
    url: (a) => `url(${a})`
  })

export function path(cmd, ...args) { return cmd + args }
export const P: any = up(path, {
    M: (xy) => P('M', xy),
    L: (xy) => P('L', xy),
    join: (...args) => args.reduce((d, a) => d + P.apply(null, a), ''),
    line: (x1, y1, x2, y2, open = P.M) => open([x1, y1]) + P.L([x2, y2]),
    rect: (x, y, w, h, open = P.M) => {
      h = dfn(h, w)
      return open([x, y]) + P('H', x + w) + P('V', y + h) + P('H', x) + 'Z'
    },

    border: (box, t, r, b, l, open = P.M) => {
      t = dfn(t, 0)
      r = dfn(r, t)
      b = dfn(b, t)
      l = dfn(l, r)
      const {x, y, w, h} = box;
      const ix = x + l, iy = y + t, iw = w - l - r, ih = h - t - b;
      return (P.line(x, y, x + w, y, open) + P('v', h) + P('h', -w) + P('v', -h) +
              P.line(ix, iy, ix, iy + ih) + P('h', iw) + P('v', -ih) + P('h', -iw))
      },

    corner: (x1, y1, x2, y2, rx, ry, vh, iv, open = P.M) => {
      rx = dfn(rx, 0)
      ry = dfn(ry, rx)
      iv = dfn(iv, 0)
      const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
      const dx = sx * rx, dy = sy * ry;
      const sd = vh ^ iv ? +(sx * sy < 0) : +(sx * sy > 0)
      if (vh) {
        const cx = x1 + dx, cy = y2 - dy;
        return open([x1, y1]) + P('v', cy - y1) + P('a', rx, ry, 0, 0, sd, dx, dy) + P('h', x2 - cx)
      } else {
        const cx = x2 - dx, cy = y1 + dy;
        return open([x1, y1]) + P('h', cx - x1) + P('a', rx, ry, 0, 0, sd, dx, dy) + P('v', y2 - cy)
      }
    },

    chevron: (cx, cy, w, h, t, open = P.M) => {
      h = dfn(h, 2 * w)
      t = dfn(t, w * Rt2 / 5)
      const g = h / 2;
      const o = t / Rt2;
      const z = t / abs(Math.sin(Math.atan2(g, w - o)))
      const x = cx - w / 2, y = cy - g + o;
      return open([x, y]) + P('l', o, -o) + P('l', w - o, g) + P('l', o - w, g) + P('l', -o, -o) + P('l', w - z, o - g) + 'z'
    },

    triangle: (cx, cy, b, h, open = P.M) => {
      h = dfn(h, b)
      const x = cx - b / 2, y = cy - h / 2;
      return open([x, y]) + P('L', cx, y + h) + P('L', x + b, y) + 'Z'
    },

    arc: (cx, cy, rx, ry, len, off, open = P.M) => {
      len = trig.cut(dfn(len, 360))
      off = off || 0;
      const ix = cx + rx * cos(off), iy = cy + ry * sin(off)
      const fx = cx + rx * cos(off + len), fy = cy + ry * sin(off + len)
      return (open([ix, iy]) +
              P('A',
                rx, ry, 0,
                abs(len) > 180 ? 1 : 0,
                len > 0 ? 1 : 0,
                fx, fy))
    },

    oval: (cx, cy, rx, ry, open = P.M) => {
      ry = dfn(ry, rx)
      return P.arc(cx, cy, rx, ry, 360, 0, open)
    },

    arch: (cx, cy, rx, ry, t, len, off, open = P.M) => {
      len = trig.cut(dfn(len, 360))
      off = off || 0;
      t = dfn(t, 1)
      return (P.arc(cx, cy, rx, ry, len, off, open) +
              P.arc(cx, cy, rx + t, ry + t, -len, off + len, P.L) + 'Z')
    },

    ring: (cx, cy, rx, ry, t, open = P.M) => {
      t = dfn(t, 1)
      return (P.arc(cx, cy, rx, ry, 360, 0, open) +
              P.arc(cx, cy, rx + t, ry + t, -360, 360))
    },

    wedge: (cx, cy, rx, ry, len, off, open = P.M) => {
      return open([cx, cy]) + P.arc(cx, cy, rx, ry, len, off, P.L) + 'Z';
    },

    snake: (x1, y1, x2, y2, vh) => {
      if (vh) {
        const my = (y1 + y2) / 2;
        return P('C', x1, my, x2, my, x2, y2)
      } else {
        const mx = (x1 + x2) / 2;
        return P('C', mx, y1, mx, y2, x2, y2)
      }
    }
  })

export const SVGTransform = window.SVGTransform;
export interface Transformation {
  matrix?: number[];
  translate?: number[];
  scale?: number[];
  rotate?: number[];
  skewX?: number;
  skewY?: number;
}

export function $(q) { return new Elem(document).$(q) }
export function elem(...args) { return new Elem(...args) }
export function svg(...args) { return new SVGElem('svg', ...args) }
export function wrap(node) {
  if (node)
    switch (node.namespaceURI) {
      case SVGElem.xmlns: return new SVGElem(node)
      case Elem.xmlns:
      default: return new Elem(node)
    }
}

export class Elem {
  static get xml() { return "http://www.w3.org/XML/1998/namespace" }
  static get xmlns() { return "http://www.w3.org/1999/xhtml" }

  node: Node;

  constructor(elem, attrs?, props?, doc) {
    this.node = elem && elem.nodeType ? elem : (doc || document).createElementNS(this.constructor.xmlns, elem)
    this.attrs(attrs)
    this.props(props)
  }

  update(obj) { return up(this, obj) }

  addTo(parent) {
    return (parent.node || parent).appendChild(this.node), this;
  }

  append(child) {
    return child.addTo(this), this;
  }

  before(other) {
    if (other)
      other.node.parentNode.insertBefore(this.node, other.node)
    return this;
  }

  child(elem, attrs?, props?) {
    return new this.constructor(elem, attrs, props).addTo(this)
  }

  clear() {
    const n = this.node;
    while (n.firstChild)
      n.removeChild(n.firstChild)
    return this;
  }

  order(k?) {
    const n = this.node, p = n.parentNode;
    const c = [].filter.call(p.childNodes, o => o !== n), C = c.length;
    const t = n.scrollTop, l = n.scrollLeft;
    p.insertBefore(n, c[clip(k < 0 ? C + k + 1 : k, 0, C)])
    n.scrollTop = t; n.scrollLeft = l;
    return this;
  }

  remove(b) {
    const n = this.node, p = n.parentNode;
    if (p && dfn(b, true))
      p.removeChild(n)
    return this;
  }

  $(q) {
    return wrap(typeof(q) == 'string' ? this.node.querySelector(q) : q)
  }

  doc() {
    return this.node.ownerDocument ? new this.constructor(this.node.ownerDocument) : this;
  }

  each(sel, fun, acc?) {
    for (let q = this.node.querySelectorAll(sel), i = 0; i < q.length; i++)
      acc = fun(q[i], acc, i, q)
    return acc;
  }

  fold(fun, acc) {
    for (let c = this.node.firstElementChild, i = 0; c; c = c.nextSibling)
      acc = fun(acc, c, i++)
    return acc;
  }

  nth(n) {
    const c = this.node.children, C = c.length;
    return wrap(c[n < 0 ? C + n : n])
  }

  parent() {
    return wrap(this.node.parentNode)
  }

  root() {
    const n = this.node;
    while (n.parentNode)
      n = n.parentNode;
    return n;
  }

  attached(o) {
    return this.root() == (o ? o.root() : this.doc().node)
  }

  detached(o) {
    return !this.attached(o)
  }

  unique(q, fun) {
    return this.$(q) || fun(this)
  }

  hide(b) { return this.attrs({hidden: dfn(b, true) ? '' : null}) }
  show(b) { return this.attrs({hidden: dfn(b, true) ? null : ''}) }
  activate(b) { return this.instate(b, 'activated') }
  collapse(b) { return this.instate(b, 'collapsed') }
  validate(b) {
    let n = this.node, v;
    if (n.checkValidity) {
      if (v = !n.checkValidity())
        b = false;
      this.instate(v, 'invalidated')
    }
    return this.fold((a, c) => elem(c).validate(a) && a, dfn(b, true))
  }

  instate(b, c, d) {
    b = dfn(b, true)
    return this.toggleClass(c, b).fire(c, up({value: b}, d))
  }

  attr(name, ns) {
    return this.node.getAttributeNS(ns || null, name)
  }

  attrs(attrs?, ns) {
    for (let k in attrs) {
      const v = attrs[k]
      if (v == null)
        this.node.removeAttributeNS(ns || null, k)
      else
        this.node.setAttributeNS(ns || null, k, v)
    }
    return this;
  }

  props(props?) {
    for (let k in props)
      this.node[k] = props[k]
    return this;
  }

  style(attrs?) {
    for (let k in attrs)
      this.node.style[k] = attrs[k]
    return this;
  }

  href(href) {
    return this.attrs({href: href})
  }

  space(space) {
    return this.attrs({space: space}, this.xml)
  }

  txt(text, order?) {
    if (isFinite(order))
      return elem(this.doc().node.createTextNode(text)).addTo(this).order(order), this;
    return this.props({textContent: text})
  }

  uid() {
    const id = (new Date - 0) + Math.random() + ''
    return this.attrs({id: id}), id;
  }

  url() {
    return Q.url('#' + (this.attr('id') || this.uid()))
  }

  addClass(cls) {
    const node = this.node;
    map(cls, (c) => node.classList.add(c))
    return this;
  }

  hasClass(cls) {
    return this.node.classList.contains(cls)
  }

  removeClass(cls) {
    const node = this.node;
    map(cls, (c) => node.classList.remove(c))
    return this;
  }

  toggleClass(cls, b) {
    const node = this.node;
    map(cls, (c) => node.classList.toggle(c, b))
    return this;
  }

  css(k) {
    const css = window.getComputedStyle(this.node)
    return k ? css[k] : css;
  }

  addRules(rules) {
    let i = 0, sheet = this.node.sheet;
    const rec = (sel, rule, str) => {
      str = str || ''
      for (let property in rule) {
        if (sel.match(/^@/))
          str += `${property} { ${rec(property, rule[property])} }`
        else
          str += `${property}: ${rule[property]};`
      }
      return str;
    }
    for (let selector in rules)
      try {
        sheet.insertRule(`${selector} { ${rec(selector, rules[selector])} }`, i++)
      } catch (e) { console.error(e) }
    return i;
  }

  animate(fun, n) {
    let self = this, i = 0;
    anim(function f() {
      if (fun.call(self, self.node, i++) || i < n)
        window.requestAnimationFrame(f)
    })
    return this;
  }

  apply(a) {
    if (a instanceof Function)
      return a(this)
    if (typeof(a) == 'string')
      return this.txt(a)
    return this[a[0]].apply(this, a.slice(1))
  }

  bind(name, ...args) {
    const fun = this[name]
    return fun.bind.apply(fun, [this, ...args])
  }

  map(l, f) {
    return map(f ? map(l, [].concat.bind([f])) : l, this.apply.bind(this))
  }

  dispatch(event) {
    return this.node.dispatchEvent(event), this;
  }

  fire(type, data, opts) {
    return this.dispatch(new CustomEvent(type, up({detail: data}, opts)))
  }

  on(types, fun, capture?: any) {
    const node = this.node;
    types.split(/\s+/).map((type) => {
      node.addEventListener(type, fun, capture)
    })
    return this;
  }

  off(types, fun, capture?: any) {
    const node = this.node;
    types.split(/\s+/).map((type) => {
      node.removeEventListener(type, fun, capture)
    })
    return this;
  }

  upon(types, fun, capture?: any) {
    const f = (e) => fun.call(this, get(e.detail || {}, 'value'), e)
    return this.on(types, f, capture)
  }

  once(types, fun, capture?: any) {
    let n = 0;
    return this.til(types, fun, () => n++, capture)
  }

  til(types, fun, dead, capture?: any) {
    const self = this;
    return this.on(types, function f(...args) {
      if (dead())
        self.off(types, f)
      else
        fun.apply(self, args)
    }, capture)
  }

  a(attrs?, props?) {
    return this.child('a', attrs, props)
  }

  p(attrs?, props?) {
    return this.child('p', attrs, props)
  }

  div(attrs?, props?) {
    return this.child('div', attrs, props)
  }

  span(attrs?, props?) {
    return this.child('span', attrs, props)
  }

  hl(text, level) {
    return this.child('h' + (level || 1)).txt(text)
  }

  li(text) {
    return this.child('li').txt(text)
  }

  link(href) {
    return this.a().href(href)
  }

  para(text) {
    return this.p().txt(text)
  }

  svg(attrs?, props?) {
    return svg(attrs, props).addTo(this)
  }

  g(attrs?, props?) {
    return this.div(attrs, props)
  }

  q(cls) {
    return this.unique('.' + cls, (p) => p.g({class: cls}))
  }

  icon(href, w, h, u) {
    return this.svg({class: 'icon'}).icon(href).parent().size(w, h, u)
  }

  image(href, w, h, u) {
    return this.child('img', {class: 'image'}).attrs({src: href}).size(w, h, u)
  }

  circle(cx, cy, r, u) {
    return this.div({class: 'circle'}).xywh(cx - r, cy - r, 2 * r, 2 * r, u).style(Q({borderRadius: r}, u))
  }

  ellipse(cx, cy, rx, ry, u) {
    return this.div({class: 'ellipse'}).xywh(cx - rx, cy - ry, 2 * rx, 2 * ry, u).style({borderRadius: Q.unify('borderRadius', [rx, ry], u).join(' / ')})
  }

  rect(x, y, w, h, u) {
    return this.div({class: 'rect'}).xywh(x, y, w, h, u)
  }

  text(text) {
    return this.span({class: 'text'}).txt(text)
  }

  svgX(box, u) {
    return this.svg({viewBox: box}).embox(box, u)
  }

  iconX(box, href, u) {
    const {x, y, w, h} = box || this.bbox()
    return this.icon(href, w, h, u).place(x, y, u)
  }

  imageX(box, href, u) {
    const {x, y, w, h} = box || this.bbox()
    return this.image(x, y, w, h, href, u)
  }

  circleX(box, p, big, u) {
    const o = big ? max : min;
    const {midX, midY, w, h} = box || this.bbox()
    return this.circle(midX, midY, dfn(p, 1) * o(w, h) / 2, u)
  }

  ellipseX(box, px, py, u) {
    const {midX, midY, w, h} = box || this.bbox()
    return this.ellipse(midX, midY, dfn(px, 1) * w / 2, dfn(py, 1) * h / 2, u)
  }

  rectX(box, u) {
    const {x, y, w, h} = box || this.bbox()
    return this.rect(x, y, w, h, u)
  }

  textX(box, text, ax, ay, u) {
    return this.text(text).align(box || this.bbox(), ax, ay, u).anchor(ax, ay)
  }

  flex(ps, hzn, u) {
    return (ps || []).reduce((r, p) => {
      let f, q;
      if (p == 'fit' || p == null)
        f = '0 0 auto'
      else if ((q = Q.unify('size', p, u)).substr(-1) == '%')
        f = '1 1 ' + q;
      else
        f = '0 0 ' + q;
      return r.g().style({flex: f}), r;
    }, this.style({display: 'flex', flexDirection: hzn ? 'row' : 'column'}))
  }

  row(ps, u) {
    return this.g({class: 'row'}).flex(ps, true, u)
  }

  col(ps, u) {
    return this.g({class: 'col'}).flex(ps, false, u)
  }

  bbox(fixed) {
    const box = new Box(this.node.getBoundingClientRect())
    return fixed ? box : box.shift(window.pageXOffset, window.pageYOffset)
  }

  wh(w, h, u) {
    return this.style(Q({width: w, height: h}, u))
  }

  xy(x, y, u) {
    return this.style(Q({left: x, top: y, position: 'absolute'}, u))
  }

  xywh(x, y, w, h, u) {
    return this.style(Q({left: x, top: y, width: w, height: h, position: 'absolute'}, u))
  }

  size(w, h, u) {
    return this.parent().wh.call(this, w, h, u)
  }

  place(x, y, u) {
    return this.parent().xy.call(this, x, y, u)
  }

  cover(x, y, w, h, u) {
    return this.parent().xywh.call(this, x, y, w, h, u)
  }

  align(box, ax, ay, u) {
    const {x, y} = new Box().align(box, ax, ay)
    return this.place(x, y, u)
  }

  embox(box, u) {
    const {x, y, w, h} = box;
    return this.cover(x, y, w, h, u)
  }

  anchor(i, j) {
    const a = -((i || 0) + 1) * 50;
    const b = -((j || 0) + 1) * 50;
    return this.transform({translate: [a + '%', b + '%']})
  }

  hang(ax, ay, u) {
    return this.align(box(0, 0, 100, 100), ax, ay, up({top: '%', left: '%'}, u)).anchor(ax, ay)
  }

  screen(x, y) {
    return {x, y}
  }

  shift(dx, dy) {
    const x = this.transformation(), t = x.translate = x.translate || [0, 0]
    t[0] += dx || 0;
    t[1] += dy || 0;
    return this.transform(x)
  }

  transform(desc?, u?) {
    let xform = []
    for (let k in desc)
      xform.push(k + '(' + Q.unify(k, [].concat(desc[k]), u).join(',') + ')')
    xform = xform.join(' ')
    return this.style({transform: xform})
  }

  transformation(val?, u?): Transformation {
    val = val || this.node.style.transform || '';
    let m, p = /(\w+)\(([^\)]*)\)/g, tx = {}
    while (m = p.exec(val)) {
      const k = m[1], v = m[2].split(',')
      tx[k] = Q.strip(k, v, u)
    }
    return tx;
  }

  load(json) {
    let n = this.node, t = n.type;
    json = n.name && json ? json[n.name] : json;
    if (json !== undefined) {
      if (t == 'button' || t == 'reset' || t == 'submit')
        return this;
      else if (t == 'select-one' || t == 'select-multiple')
        this.each('option', (o) => {
          if ([].some.call([].concat(json), (v) => v == o.value))
            o.selected = true;
        })
      else if (t == 'fieldset')
        this.each('input', (i) => {
          if ([].some.call([].concat(json), (v) => v == i.value))
            i.checked = true;
        })
      else if (t == 'checkbox' || t == 'radio')
        n.checked = isFinite(json) ? json : json == n.value;
      else if (n.value !== undefined)
        n.value = json || ''
      else if (n.childElementCount)
        this.fold((_, c) => {
          elem(c).load(c.name && json ? json[c.name] : json)
        })
    }
    return this;
  }

  dump(json) {
    let n = this.node, t = n.type, p;
    if (t == 'button' || t == 'reset' || t == 'submit')
      return json;
    else if (t == 'select-one')
      p = this.each('option', (o, v) => {
        return (o.selected) ? o.value : v;
      }, null)
    else if (t == 'select-multiple')
      p = this.each('option', (o, l) => {
        return (o.selected && l.push(o.value)), l;
      }, [])
    else if (t == 'fieldset' && n.querySelector('[type="radio"]'))
      p = this.each('input', (i, v) => {
        return (i.checked) ? i.value : v;
      }, null)
    else if (t == 'fieldset')
      p = this.each('input', (i, l) => {
        return (i.checked && l.push(i.value)), l;
      }, [])
    else if (t == 'checkbox' || t == 'radio')
      p = n.checked;
    else if (t == 'number' || t == 'range')
      p = dfn(n.valueAsNumber, null)
    else
      p = n.value;
    if (p !== undefined)
      return n.name ? set(json, n.name, p) : p;
    if (n.childElementCount)
      this.fold((o, c) => {
        return elem(c).dump(o)
      }, n.name ? pre(json = json || {}, n.name, {}) : json)
    return json;
  }

  form(attrs?, props?) {
    return this.child('form', attrs, props)
  }

  label(text) {
    return this.child('label').txt(text)
  }

  button(desc, props?) {
    desc = up({}, desc)
    const icon = pop(desc, 'icon')
    const label = pop(desc, 'label', '')
    const action = pop(desc, 'action', () => {})
    const elem = this.child('button', desc, props)
    if (icon)
      elem.icon.apply(elem, [].concat(icon))
    if (icon && label)
      elem.text(label);
    else if (label)
      elem.txt(label)
    return elem.on('click', action.bind(elem))
  }

  input(desc, props?) {
    desc = up({}, desc)
    const label = pop(desc, 'label')
    const elem = label ? this.label(label) : this;
    return elem.child('input', desc, props)
  }

  output(desc, props?) {
    desc = up({}, desc)
    const label = pop(desc, 'label')
    const elem = label ? this.label(label) : this;
    return elem.child('output', desc, props)
  }

  fieldset(desc) {
    desc = up({}, desc)
    const options = pop(desc, 'options', [])
    return options.reduce((s, d) => {
      d = [].concat(d)
      return s.input(up(desc, {value: d[0], label: d[1] || d[0]})), s;
    }, this.child('fieldset', {name: desc.name}))
  }

  option(value, text) {
    return this.child('option', {value: value}).txt(text || value)
  }

  options(desc) {
    if (desc instanceof Array)
      this.map(desc, 'option')
    else if (desc instanceof Object)
      for (let k in desc)
        this.child('optgroup', {label: k}).map(desc[k], 'option')
    return this;
  }

  select(desc, props?) {
    desc = up({}, desc)
    const label = pop(desc, 'label')
    const options = pop(desc, 'options')
    const elem = label ? this.label(label) : this;
    return elem.child('select', desc, props).options(options)
  }

  textarea(desc, props?) {
    desc = up({}, desc)
    const label = pop(desc, 'label')
    const elem = label ? this.label(label) : this;
    return elem.child('textarea', desc, props)
  }

  views(value, opts) {
    return () => this.fire('input', this.node.value = value, opts)
  }
}

export class SVGElem extends Elem {
  static get xmlns() { return "http://www.w3.org/2000/svg" }
  static get xlink() { return "http://www.w3.org/1999/xlink" }

  svg(attrs?, props?) {
    return this.child('svg', attrs, props)
  }

  circle(cx, cy, r) {
    return this.child('circle', {cx: cx, cy: cy, r: r})
  }

  ellipse(cx, cy, rx, ry) {
    return this.child('ellipse', {cx: cx, cy: cy, rx: rx, ry: ry})
  }

  line(x1, y1, x2, y2) {
    return this.child('line', {x1: x1, y1: y1, x2: x2, y2: y2})
  }

  path(d) {
    return this.child('path', d && {d: d})
  }

  polyline(points) {
    return this.child('polyline', {points: points})
  }

  polygon(points) {
    return this.child('polygon', {points: points})
  }

  rect(x, y, w, h) {
    return this.child('rect', {x: x, y: y, width: w, height: h})
  }

  text(text) {
    return this.child('text', {}, {textContent: text})
  }

  tspan(text) {
    return this.child('tspan', {}, {textContent: text})
  }

  g(attrs?, props?) {
    return this.child('g', attrs, props)
  }

  icon(href, w, h) {
    return this.use(href).wh(w, h)
  }

  image(href, w, h) {
    return this.child('image').href(href).wh(w, h)
  }

  use(href) {
    return this.child('use').href(href)
  }

  mask(attrs?, props?) {
    return this.child('mask', attrs, props)
  }

  clipPath(attrs?, props?) {
    return this.child('clipPath', attrs, props)
  }
  symbol(attrs?, props?) {
    return this.child('symbol', attrs, props)
  }

  border(t, r, b, l, box) {
    return this.path(P.border(box || this.bbox(), t, r, b, l))
  }

  anchor(i, j) {
    const a = i < 0 ? 'start' : (i > 0 ? 'end' : 'middle')
    const b = j < 0 ? 'hanging' : (j > 0 ? 'alphabetic' : 'central')
    return this.attrs({'text-anchor': a, 'dominant-baseline': b})
  }

  bbox() {
    return new Box(this.node.getBBox())
  }

  enc() {
    return this.node.tagName == 'svg' ? this : new SVGElem(this.node.ownerSVGElement)
  }

  fit() {
    return this.enc().attrs({viewBox: this.bbox()})
  }

  href(href) {
    return this.attrs({href: href}, this.xlink)
  }

  wh(w, h) {
    return this.attrs({width: w, height: h})
  }

  xy(x, y) {
    return this.attrs({x: x, y: y})
  }

  xywh(x, y, w, h) {
    return this.attrs({x: x, y: y, width: w, height: h})
  }

  point(x, y) {
    const p = this.enc().node.createSVGPoint()
    p.x = x;
    p.y = y;
    return p;
  }

  coords(x, y) {
    return this.point(x, y).matrixTransform(this.node.getScreenCTM().inverse())
  }

  screen(x, y) {
    return this.point(x, y).matrixTransform(this.node.getScreenCTM())
  }

  transform(desc) {
    const xform = []
    for (let k in desc)
      xform.push(`${k}(${[].concat(desc[k]).join(',')})`)
    return this.attrs({transform: xform.join(' ')})
  }

  transformation(list?): Transformation {
    const tx = {}
    list = list || this.node.transform.baseVal;
    for (let i = 0; i < list.numberOfItems; i++) {
      const t = list.getItem(i), m = t.matrix;
      if (t.type == SVGTransform.SVG_TRANSFORM_MATRIX)
        tx.matrix = [m.a, m.b, m.c, m.d, m.e, m.f]
      else if (t.type == SVGTransform.SVG_TRANSFORM_TRANSLATE)
        tx.translate = [m.e, m.f]
      else if (t.type == SVGTransform.SVG_TRANSFORM_SCALE)
        tx.scale = [m.a, m.d]
      else if (t.type == SVGTransform.SVG_TRANSFORM_ROTATE)
        tx.rotate = [t.angle, (m.f / m.c + m.e) / m.a, (m.e / m.b - m.f) / m.a]
      else if (t.type == SVGTransform.SVG_TRANSFORM_SKEWX)
        tx.skewX = t.angle;
      else if (t.type == SVGTransform.SVG_TRANSFORM_SKEWY)
        tx.skewY = t.angle;
    }
    return tx;
  }
}

export function box(x?, y?, w?, h?) { return new Box({x: x, y: y, w: w, h: h}) }

export class Box {
  constructor(d = {}, e?: boolean) {
    this.x = dfn(dfn(d.x, d.left), e ? -Inf : 0)
    this.y = dfn(dfn(d.y, d.top), e ? -Inf : 0)
    this.w = dfn(dfn(d.w, d.width), e ? Inf : 0)
    this.h = dfn(dfn(d.h, d.height), e ? Inf : 0)
  }

  get width() { return this.w }
  get height() { return this.h }
  get left() { return this.x }
  get top() { return this.y }
  get midX() { return add(this.x, this.w / 2) }
  get midY() { return add(this.y, this.h / 2) }
  get right() { return add(this.x, this.w) }
  get bottom() { return add(this.y, this.h) }

  grid(fun, acc, opts) {
    const o = up({rows: 1, cols: 1}, opts)
    const r = o.rows, c = o.cols;
    const x = this.x, y = this.y, w = this.w / c, h = this.h / r;
    const z = new Box({x: x, y: y, w: w, h: h})
    for (let i = 0, n = 0; i < r; i++)
      for (let j = 0; j < c; j++, n++)
        acc = fun.call(this, acc, z.shift(w * j, h * i), i, j, n, z)
    return acc;
  }

  join(boxs) {
    const bnds = [].concat(boxs).reduce(function (a, b) {
      return {x: min(a.x, b.x), y: min(a.y, b.y), right: max(a.right, b.right), bottom: max(a.bottom, b.bottom)}
    }, this)
    return new Box({x: bnds.x, y: bnds.y, w: bnds.right - bnds.x, h: bnds.bottom - bnds.y})
  }

  tile(fun, acc, opts) {
    return this.grid(fun, acc, this.shape(opts && opts.unit))
  }

  shape(box) {
    const u = box || this;
    return {rows: this.h / u.h, cols: this.w / u.w}
  }

  stack(fun, acc, opts) {
    return this.times(opts).grid(fun, acc, opts)
  }

  times(shape) {
    const s = up({rows: 1, cols: 1}, shape)
    return this.copy({w: s.cols * this.w, h: s.rows * this.h})
  }

  over(shape) {
    const s = up({rows: 1, cols: 1}, shape)
    return this.copy({w: this.w / s.cols, h: this.h / s.rows})
  }

  split(opts) {
    return this.grid(function (acc, box) { return acc.push(box), acc }, [], opts)
  }

  align(box, ax, ay) {
    const nx = (ax || 0) / 2, ny = (ay || 0) / 2, ox = nx + .5, oy = ny + .5;
    const x = box.midX + nx * box.w - ox * this.w;
    const y = box.midY + ny * box.h - oy * this.h;
    return this.copy({x: x, y: y})
  }

  center(cx, cy) {
    return this.copy({x: (cx || 0) - this.w / 2, y: (cy || 0) - this.h / 2})
  }

  xy(x, y) {
    return this.copy({x: x || 0, y: y || 0})
  }

  scale(a, b) {
    const w = a * this.w, h = dfn(b, a) * this.h;
    return new Box({x: this.midX - w / 2, y: this.midY - h / 2, w: w, h: h})
  }

  shift(dx, dy) {
    return this.copy({x: this.x + (dx || 0), y: this.y + (dy || 0)})
  }

  square(big) {
    const o = big ? max : min, d = o(this.w, this.h)
    return this.copy({w: d, h: d})
  }

  slice(ps, hzn) {
    const d = hzn ? this.w : this.h; ps = [].concat(ps)
    const f = 1 - ps.reduce(function (s, p) { return isFinite(p) ? s + p : s }, 0) / d;
    return this.part(ps.map(function (p) {
      const pct = typeof(p) == 'string' && p[p.length - 1] == '%';
      return pct ? f * parseFloat(p.slice(0, -1)) / 100 : p / d;
    }), hzn)
  }

  part(ps, hzn) {
    const b = this, ko = hzn ? 'x' : 'y', kd = hzn ? 'w' : 'h';
    let o = b[ko], u = {}, s = 0;
    ps = [].concat(ps, undefined)
    return ps.map(function (p) {
      u[ko] = (o += u[kd] || 0)
      u[kd] = dfn(p, 1 - s) * b[kd]
      s += p;
      return b.copy(u)
    })
  }

  pad(t, r, b, l) {
    return this.trim(-t, -r, -b, -l)
  }

  trim(t, r, b, l) {
    t = dfn(t, 0), r = dfn(r, t), b = dfn(b, t), l = dfn(l, r)
    return new Box({x: this.x + l, y: this.y + t, w: this.w - r - l, h: this.h - t - b})
  }

  copy(o_) {
    const o = o_ || {}, ow = dfn(o.w, o.width), oh = dfn(o.h, o.height)
    const { x, y, w, h } = this;
    return new Box({x: dfn(o.x, x), y: dfn(o.y, y), w: dfn(ow, w), h: dfn(oh, h)})
  }

  equals(o_) {
    const o = o_ || {}, ow = dfn(o.w, o.width), oh = dfn(o.h, o.height)
    const { x, y, w, h } = this;
    return x == dfn(o.x, 0) && y == dfn(o.y, 0) && w == dfn(ow, 0) && h == dfn(oh, 0)
  }

  toString() {
    const { x, y, w, h } = this;
    return x + ',' + y + ',' + w + ',' + h;
  }

  static solve(opts) {
    const o = up({}, opts)
    const b = o.bbox, s = o.shape, u = o.unit;
    if (b && s)
      return up(o, {shape: up({rows: 1, cols: 1}, s), unit: b.over(s)})
    if (u && s)
      return up(o, {shape: up({rows: 1, cols: 1}, s), bbox: u.times(s)})
    if (b && u)
      return up(o, {shape: b.shape(u), unit: u.copy({x: b.x, y: b.y})})
  }
}

export function rgb(r, g, b, a) { return new RGB({r, g, b, a}) }

export class RGB {
  constructor(d) { up(this, d) }
  update(obj) { return up(this, obj) }

  alpha(a) {
    return a == undefined ? this : this.update({a: a})
  }

  shift(x) {
    let w = (v) => clip(v + x, 0, 255)
    return (new RGB({r: w(this.r || 0), g: w(this.g || 0), b: w(this.b || 0)})).alpha(this.a)
  }

  toHex() {
    return `#${['r', 'g', 'b'].map(k => this[k].toString(16).padStart(2, '0')).join('')}`
  }

  toString() {
    if (this.a == undefined)
      return `rgb(${this.r || 0}, ${this.g || 0}, ${this.b || 0})`
    return `rgba(${this.r || 0}, ${this.g || 0}, ${this.b || 0}, ${this.a})`
  }

  static mix(x, opts) {
    let o = up({min: 0, max: 100, lo: {b: 100}, hi: {r: 100}}, opts)
    let m = o.min, M = o.max, lo = o.lo, hi = o.hi;
    let w = (a, b) => ((b || 0) * max(x - m, 0) + (a || 0) * max(M - x, 0)) / (M - m)
    let i = (a, b) => Math.round(w(a, b))
    if (lo.a == undefined && hi.a == undefined)
      return new RGB({r: i(lo.r, hi.r), g: i(lo.g, hi.g), b: i(lo.b, hi.b)})
    return new RGB({r: i(lo.r, hi.r), g: i(lo.g, hi.g), b: i(lo.b, hi.b), a: w(lo.a, hi.a)})
  }

  static random() {
    return new RGB({r: randInt(0, 255), g: randInt(0, 255), b: randInt(0, 255)})
  }
}