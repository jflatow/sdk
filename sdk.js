const abs = Math.abs, log = Math.log, min = Math.min, max = Math.max, Rt2 = Math.sqrt(2), Inf = Infinity;
const add = (p, d)=>isFinite(d) ? p + d : d;
const dfn = (x, d)=>isNaN(x) ? d : x;
const fnt = (x, d)=>isFinite(x) ? x : d;
const get = (a, k, d)=>a[k] ?? d;
const set = (a, k, v)=>(a[k] = v, a);
const pre = (a, k, d)=>a[k] = get(a, k, d);
const pop = (a, k, d)=>{
    const v = get(a, k, d);
    delete a[k];
    return v;
};
const pow = (x, a)=>sgn(x) * Math.pow(abs(x), a || 2);
const sgn = (x)=>x < 0 ? -1 : 1;
const clip = (x, m, M)=>min(max(x, m), M);
const each = (a, f)=>a && a.map ? a.map(f) : f(a, 0);
const map = (a, f)=>[].concat(a || []).map(f);
const up = Object.assign;
const noop = ()=>{};
const randInt = (m, M)=>Math.round((M - m) * Math.random()) + m;
const window = globalThis;
const trig = {
    rad: function(a) {
        return Math.PI / 180 * a;
    },
    sin: function(a) {
        return Math.sin(trig.rad(a));
    },
    cos: function(a) {
        return Math.cos(trig.rad(a));
    },
    cut: function(x) {
        return clip(x, -359.999, 359.999);
    },
    polar: function(r, a) {
        return [
            r * trig.cos(a),
            r * trig.sin(a)
        ];
    }
};
function units(o, u) {
    const t = {};
    for(const k in o)t[k] = Q.unify(k, o[k], u);
    return t;
}
const Q = up(units, {
    defaults: {
        top: 'px',
        left: 'px',
        right: 'px',
        bottom: 'px',
        width: 'px',
        height: 'px',
        size: 'px',
        translate: 'px',
        rotate: 'deg',
        skewX: 'deg',
        skewY: 'deg',
        borderRadius: 'px'
    },
    unify: (k, v, u = Q.defaults)=>{
        const d = u[k] || '';
        return each(v, (x)=>isFinite(x) ? x + d : x);
    },
    strip: (k, v, u = Q.defaults)=>{
        const d = u[k], n = d && d.length;
        if (d) return each(v, (x)=>x.substr(-n) == d ? parseFloat(x) : x);
        return v;
    },
    each: (ks, o, u = Q.defaults)=>each(ks, (k)=>Q.unify(k, o[k], u)),
    map: (ks, vs, u = Q.defaults)=>each(ks, (k, i)=>Q.unify(k, vs[i], u)),
    rect: (b, u)=>`rect(${Q.each([
            'top',
            'right',
            'bottom',
            'left'
        ], b, u)})`,
    calc: (a, o)=>`calc(${[].concat(a).join(' ' + (o || '-') + ' ')})`,
    url: (a)=>`url(${a})`
});
function path(cmd, ...args) {
    return cmd + args;
}
const P = up(path, {
    M: (xy)=>P('M', xy),
    L: (xy)=>P('L', xy),
    join: (...args)=>args.reduce((d, a)=>d + P.apply(null, a), ''),
    line: (x1, y1, x2, y2, open = P.M)=>open([
            x1,
            y1
        ]) + P.L([
            x2,
            y2
        ]),
    rect: (x, y, w, h, open = P.M)=>{
        h = dfn(h, w);
        return open([
            x,
            y
        ]) + P('H', x + w) + P('V', y + h) + P('H', x) + 'Z';
    },
    border: (box, t, r, b, l, open = P.M)=>{
        t = dfn(t, 0);
        r = dfn(r, t);
        b = dfn(b, t);
        l = dfn(l, r);
        const { x, y, w, h } = box;
        const ix = x + l, iy = y + t, iw = w - l - r, ih = h - t - b;
        return P.line(x, y, x + w, y, open) + P('v', h) + P('h', -w) + P('v', -h) + P.line(ix, iy, ix, iy + ih) + P('h', iw) + P('v', -ih) + P('h', -iw);
    },
    corner: (x1, y1, x2, y2, rx, ry, vh, iv, open = P.M)=>{
        rx = dfn(rx, 0);
        ry = dfn(ry, rx);
        iv = dfn(iv, 0);
        const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
        const dx = sx * rx, dy = sy * ry;
        const sd = vh ^ iv ? +(sx * sy < 0) : +(sx * sy > 0);
        if (vh) {
            const cx = x1 + dx, cy = y2 - dy;
            return open([
                x1,
                y1
            ]) + P('v', cy - y1) + P('a', rx, ry, 0, 0, sd, dx, dy) + P('h', x2 - cx);
        } else {
            const cx = x2 - dx, cy = y1 + dy;
            return open([
                x1,
                y1
            ]) + P('h', cx - x1) + P('a', rx, ry, 0, 0, sd, dx, dy) + P('v', y2 - cy);
        }
    },
    chevron: (cx, cy, w, h, t, open = P.M)=>{
        h = dfn(h, 2 * w);
        t = dfn(t, w * Rt2 / 5);
        const g = h / 2;
        const o = t / Rt2;
        const z = t / abs(Math.sin(Math.atan2(g, w - o)));
        const x = cx - w / 2, y = cy - g + o;
        return open([
            x,
            y
        ]) + P('l', o, -o) + P('l', w - o, g) + P('l', o - w, g) + P('l', -o, -o) + P('l', w - z, o - g) + 'z';
    },
    triangle: (cx, cy, b, h, open = P.M)=>{
        h = dfn(h, b);
        const x = cx - b / 2, y = cy - h / 2;
        return open([
            x,
            y
        ]) + P('L', cx, y + h) + P('L', x + b, y) + 'Z';
    },
    arc: (cx, cy, rx, ry, len, off, open = P.M)=>{
        len = trig.cut(dfn(len, 360));
        off = off || 0;
        const ix = cx + rx * cos(off), iy = cy + ry * sin(off);
        const fx = cx + rx * cos(off + len), fy = cy + ry * sin(off + len);
        return open([
            ix,
            iy
        ]) + P('A', rx, ry, 0, abs(len) > 180 ? 1 : 0, len > 0 ? 1 : 0, fx, fy);
    },
    oval: (cx, cy, rx, ry, open = P.M)=>{
        ry = dfn(ry, rx);
        return P.arc(cx, cy, rx, ry, 360, 0, open);
    },
    arch: (cx, cy, rx, ry, t, len, off, open = P.M)=>{
        len = trig.cut(dfn(len, 360));
        off = off || 0;
        t = dfn(t, 1);
        return P.arc(cx, cy, rx, ry, len, off, open) + P.arc(cx, cy, rx + t, ry + t, -len, off + len, P.L) + 'Z';
    },
    ring: (cx, cy, rx, ry, t, open = P.M)=>{
        t = dfn(t, 1);
        return P.arc(cx, cy, rx, ry, 360, 0, open) + P.arc(cx, cy, rx + t, ry + t, -360, 360);
    },
    wedge: (cx, cy, rx, ry, len, off, open = P.M)=>{
        return open([
            cx,
            cy
        ]) + P.arc(cx, cy, rx, ry, len, off, P.L) + 'Z';
    },
    snake: (x1, y1, x2, y2, vh)=>{
        if (vh) {
            const my = (y1 + y2) / 2;
            return P('C', x1, my, x2, my, x2, y2);
        } else {
            const mx = (x1 + x2) / 2;
            return P('C', mx, y1, mx, y2, x2, y2);
        }
    }
});
const SVGTransform = window.SVGTransform;
function $(q) {
    return new Elem(document).$(q);
}
function elem(...args) {
    return new Elem(...args);
}
function svg(...args) {
    return new SVGElem('svg', ...args);
}
function wrap(node) {
    if (node) switch(node.namespaceURI){
        case SVGElem.xmlns:
            return new SVGElem(node);
        case Elem.xmlns:
        default:
            return new Elem(node);
    }
}
class Elem {
    static get xml() {
        return "http://www.w3.org/XML/1998/namespace";
    }
    static get xmlns() {
        return "http://www.w3.org/1999/xhtml";
    }
    node;
    constructor(elem, attrs, props, doc){
        this.node = elem && elem.nodeType ? elem : (doc || document).createElementNS(this.constructor.xmlns, elem);
        this.attrs(attrs);
        this.props(props);
    }
    update(obj) {
        return up(this, obj);
    }
    addTo(parent) {
        return (parent.node || parent).appendChild(this.node), this;
    }
    append(child) {
        return child.addTo(this), this;
    }
    before(other) {
        if (other) other.node.parentNode.insertBefore(this.node, other.node);
        return this;
    }
    child(elem, attrs, props) {
        return new this.constructor(elem, attrs, props).addTo(this);
    }
    clear() {
        const n = this.node;
        while(n.firstChild)n.removeChild(n.firstChild);
        return this;
    }
    duplicate(p, deep = true) {
        return wrap(this.node.cloneNode(deep)).addTo(p ?? this.parent());
    }
    order(k) {
        const n = this.node, p = n.parentNode;
        const c = [].filter.call(p.childNodes, (o)=>o !== n), C = c.length;
        const t = n.scrollTop, l = n.scrollLeft;
        p.insertBefore(n, c[clip(k < 0 ? C + k + 1 : k, 0, C)]);
        n.scrollTop = t;
        n.scrollLeft = l;
        return this;
    }
    remove(b) {
        const n = this.node, p = n.parentNode;
        if (p && dfn(b, true)) p.removeChild(n);
        return this;
    }
    $(q) {
        return wrap(typeof q == 'string' ? this.node.querySelector(q) : q);
    }
    doc() {
        return this.node.ownerDocument ? new this.constructor(this.node.ownerDocument) : this;
    }
    all(sel) {
        return this.each(sel, (n, a)=>[
                ...a,
                wrap(n)
            ], []);
    }
    each(sel, fun, acc) {
        for(let q = this.node.querySelectorAll(sel), i = 0; i < q.length; i++)acc = fun(q[i], acc, i, q);
        return acc;
    }
    fold(fun, acc) {
        for(let c = this.node.firstElementChild, i = 0; c; c = c.nextElementSibling)acc = fun(acc, c, i++);
        return acc;
    }
    nth(n) {
        const c = this.node.children, C = c.length;
        return wrap(c[n < 0 ? C + n : n]);
    }
    parent() {
        return wrap(this.node.parentNode);
    }
    root() {
        let n = this.node;
        while(n.parentNode)n = n.parentNode;
        return n;
    }
    ancestor(f, d) {
        if (this.node == this.node.ownerDocument.documentElement) return d ?? this;
        const p = this.parent();
        return f(p) ? p : p.ancestor(f);
    }
    attached(o) {
        return this.root() == (o ? o.root() : this.doc().node);
    }
    detached(o) {
        return !this.attached(o);
    }
    unique(q, fun) {
        return this.$(q) || fun(this);
    }
    hide(b) {
        return this.attrs({
            hidden: dfn(b, true) ? '' : null
        });
    }
    show(b) {
        return this.attrs({
            hidden: dfn(b, true) ? null : ''
        });
    }
    activate(b) {
        return this.instate(b, 'activated');
    }
    collapse(b) {
        return this.instate(b, 'collapsed');
    }
    validate(b) {
        let n = this.node, v;
        if (n.checkValidity) {
            if (v = !n.checkValidity()) b = false;
            this.instate(v, 'invalidated');
        }
        return this.fold((a, c)=>elem(c).validate(a) && a, dfn(b, true));
    }
    instate(b, c, d) {
        b = dfn(b, true);
        return this.toggleClass(c, b).fire(c, up({
            value: b
        }, d));
    }
    attr(name, ns) {
        return this.node.getAttributeNS(ns || null, name);
    }
    attrs(attrs, ns) {
        for(let k in attrs){
            const v = attrs[k];
            if (v == null) this.node.removeAttributeNS(ns || null, k);
            else this.node.setAttributeNS(ns || null, k, v);
        }
        return this;
    }
    props(props) {
        for(let k in props)this.node[k] = props[k];
        return this;
    }
    style(attrs) {
        for(let k in attrs)this.node.style[k] = attrs[k];
        return this;
    }
    href(href) {
        return this.attrs({
            href: href
        });
    }
    space(space) {
        return this.attrs({
            space: space
        }, this.xml);
    }
    txt(text, order) {
        if (isFinite(order)) return elem(this.doc().node.createTextNode(text)).addTo(this).order(order), this;
        return this.props({
            textContent: text
        });
    }
    uid() {
        const id = new Date - 0 + Math.random() + '';
        return this.attrs({
            id: id
        }), id;
    }
    url() {
        return Q.url('#' + (this.attr('id') || this.uid()));
    }
    addClass(cls) {
        const node = this.node;
        map(cls, (c)=>node.classList.add(c));
        return this;
    }
    hasClass(cls) {
        return this.node.classList.contains(cls);
    }
    removeClass(cls) {
        const node = this.node;
        map(cls, (c)=>node.classList.remove(c));
        return this;
    }
    toggleClass(cls, b) {
        const node = this.node;
        map(cls, (c)=>node.classList.toggle(c, b));
        return this;
    }
    css(k) {
        const css = window.getComputedStyle(this.node);
        return k ? css[k] : css;
    }
    addRules(rules) {
        let i = 0, sheet = this.node.sheet;
        const rec = (sel, rule, str)=>{
            str = str || '';
            for(let property in rule){
                if (sel.match(/^@/)) str += `${property} { ${rec(property, rule[property])} }`;
                else str += `${property}: ${rule[property]};`;
            }
            return str;
        };
        for(let selector in rules)try {
            sheet.insertRule(`${selector} { ${rec(selector, rules[selector])} }`, i++);
        } catch (e) {
            console.error(e);
        }
        return this;
    }
    animate(fun, n) {
        let self = this, i = 0;
        window.requestAnimationFrame(function f() {
            if (fun.call(self, self.node, i++) || i < n) window.requestAnimationFrame(f);
        });
        return this;
    }
    apply(a) {
        if (a instanceof Function) return a(this);
        if (typeof a == 'string') return this.txt(a);
        return this[a[0]].apply(this, a.slice(1));
    }
    bind(name, ...args) {
        const fun = this[name];
        return fun.bind.apply(fun, [
            this,
            ...args
        ]);
    }
    map(l, f) {
        return map(f ? map(l, [].concat.bind([
            f
        ])) : l, this.apply.bind(this));
    }
    dispatch(event) {
        return this.node.dispatchEvent(event), this;
    }
    fire(type, data, opts) {
        return this.dispatch(new CustomEvent(type, up({
            detail: data
        }, opts)));
    }
    on(types, fun, capture) {
        const node = this.node;
        types.split(/\s+/).map((type)=>{
            node.addEventListener(type, fun, capture);
        });
        return this;
    }
    off(types, fun, capture) {
        const node = this.node;
        types.split(/\s+/).map((type)=>{
            node.removeEventListener(type, fun, capture);
        });
        return this;
    }
    upon(types, fun, capture) {
        const f = (e)=>fun.call(this, get(e.detail || {}, 'value'), e);
        return this.on(types, f, capture);
    }
    once(types, fun, capture) {
        let n = 0;
        return this.til(types, fun, ()=>n++, capture);
    }
    til(types, fun, dead, capture) {
        const self = this;
        return this.on(types, function f(...args) {
            if (dead()) self.off(types, f);
            else fun.apply(self, args);
        }, capture);
    }
    a(attrs, props) {
        return this.child('a', attrs, props);
    }
    p(attrs, props) {
        return this.child('p', attrs, props);
    }
    div(attrs, props) {
        return this.child('div', attrs, props);
    }
    span(attrs, props) {
        return this.child('span', attrs, props);
    }
    hl(text, level) {
        return this.child('h' + (level || 1)).txt(text);
    }
    li(text) {
        return this.child('li').txt(text);
    }
    link(href) {
        return this.a().href(href);
    }
    para(text) {
        return this.p().txt(text);
    }
    svg(attrs, props) {
        return svg(attrs, props).addTo(this);
    }
    g(attrs, props) {
        return this.div(attrs, props);
    }
    q(cls) {
        return this.unique('.' + cls, (p)=>p.g({
                class: cls
            }));
    }
    icon(href, w, h, u) {
        return this.svg({
            class: 'icon'
        }).icon(href).parent().size(w, h, u);
    }
    image(href, w, h, u) {
        return this.child('img', {
            class: 'image'
        }).attrs({
            src: href
        }).size(w, h, u);
    }
    circle(cx, cy, r, u) {
        return this.div({
            class: 'circle'
        }).xywh(cx - r, cy - r, 2 * r, 2 * r, u).style(Q({
            borderRadius: r
        }, u));
    }
    ellipse(cx, cy, rx, ry, u) {
        return this.div({
            class: 'ellipse'
        }).xywh(cx - rx, cy - ry, 2 * rx, 2 * ry, u).style({
            borderRadius: Q.unify('borderRadius', [
                rx,
                ry
            ], u).join(' / ')
        });
    }
    rect(x, y, w, h, u) {
        return this.div({
            class: 'rect'
        }).xywh(x, y, w, h, u);
    }
    text(text) {
        return this.span({
            class: 'text'
        }).txt(text);
    }
    svgX(box, u) {
        return this.svg({
            viewBox: box
        }).embox(box, u);
    }
    iconX(box, href, u) {
        const { x, y, w, h } = box || this.bbox();
        return this.icon(href, w, h, u).place(x, y, u);
    }
    imageX(box, href, u) {
        const { x, y, w, h } = box || this.bbox();
        return this.image(x, y, w, h, href, u);
    }
    circleX(box, p, big, u) {
        const o = big ? max : min;
        const { midX, midY, w, h } = box || this.bbox();
        return this.circle(midX, midY, dfn(p, 1) * o(w, h) / 2, u);
    }
    ellipseX(box, px, py, u) {
        const { midX, midY, w, h } = box || this.bbox();
        return this.ellipse(midX, midY, dfn(px, 1) * w / 2, dfn(py, 1) * h / 2, u);
    }
    rectX(box, u) {
        const { x, y, w, h } = box || this.bbox();
        return this.rect(x, y, w, h, u);
    }
    textX(box, text, ax, ay, u) {
        return this.text(text).align(box || this.bbox(), ax, ay, u).anchor(ax, ay);
    }
    flex(ps, hzn, u) {
        return (ps || []).reduce((r, p)=>{
            let f, q;
            if (p == 'fit' || p == null) f = '0 0 auto';
            else if ((q = Q.unify('size', p, u)).substr(-1) == '%') f = '1 1 ' + q;
            else f = '0 0 ' + q;
            return r.g().style({
                flex: f
            }), r;
        }, this.style({
            display: 'flex',
            flexDirection: hzn ? 'row' : 'column'
        }));
    }
    row(ps, u) {
        return this.g({
            class: 'row'
        }).flex(ps, true, u);
    }
    col(ps, u) {
        return this.g({
            class: 'col'
        }).flex(ps, false, u);
    }
    bbox(fixed) {
        const box = new Box(this.node.getBoundingClientRect());
        return fixed ? box : box.shift(window.pageXOffset, window.pageYOffset);
    }
    gps() {
        return this.ancestor((a)=>[
                'absolute',
                'relative',
                'fixed'
            ].includes(a.css('position')));
    }
    pos(e, abs) {
        const box = abs ? {
            x: 0,
            y: 0
        } : this.gps().bbox();
        return {
            x: e.pageX - box.x,
            y: e.pageY - box.y
        };
    }
    wh(w, h, u) {
        return this.style(Q({
            width: w,
            height: h
        }, u));
    }
    xy(x, y, u) {
        return this.style(Q({
            left: x,
            top: y,
            position: 'absolute'
        }, u));
    }
    xywh(x, y, w, h, u) {
        return this.style(Q({
            left: x,
            top: y,
            width: w,
            height: h,
            position: 'absolute'
        }, u));
    }
    size(w, h, u) {
        return this.parent().wh.call(this, w, h, u);
    }
    place(x, y, u) {
        return this.parent().xy.call(this, x, y, u);
    }
    cover(x, y, w, h, u) {
        return this.parent().xywh.call(this, x, y, w, h, u);
    }
    align(box, ax, ay, u) {
        const { x, y } = new Box().align(box, ax, ay);
        return this.place(x, y, u);
    }
    embox(box, u) {
        const { x, y, w, h } = box;
        return this.cover(x, y, w, h, u);
    }
    anchor(i, j) {
        const a = -((i || 0) + 1) * 50;
        const b = -((j || 0) + 1) * 50;
        return this.transform({
            translate: [
                a + '%',
                b + '%'
            ]
        });
    }
    hang(ax, ay, u) {
        return this.align(box(0, 0, 100, 100), ax, ay, up({
            top: '%',
            left: '%'
        }, u)).anchor(ax, ay);
    }
    screen(x, y) {
        return {
            x,
            y
        };
    }
    shift(dx, dy) {
        const x = this.transformation(), t = x.translate = x.translate || [
            0,
            0
        ];
        t[0] += dx || 0;
        t[1] += dy || 0;
        return this.transform(x);
    }
    transform(desc, u) {
        let xform = [];
        for(let k in desc)xform.push(k + '(' + Q.unify(k, [].concat(desc[k]), u).join(',') + ')');
        xform = xform.join(' ');
        return this.style({
            transform: xform
        });
    }
    transformation(val, u) {
        val = val || this.node.style.transform || '';
        let m, p = /(\w+)\(([^\)]*)\)/g, tx = {};
        while(m = p.exec(val)){
            const k = m[1], v = m[2].split(',');
            tx[k] = Q.strip(k, v, u);
        }
        return tx;
    }
    load(json) {
        let n = this.node, t = n.type;
        json = n.name && json ? json[n.name] : json;
        if (json !== undefined) {
            if (t == 'button' || t == 'reset' || t == 'submit') return this;
            else if (t == 'select-one' || t == 'select-multiple') this.each('option', (o)=>{
                if ([].some.call([].concat(json), (v)=>v == o.value)) o.selected = true;
            });
            else if (t == 'fieldset') this.each('input', (i)=>{
                if ([].some.call([].concat(json), (v)=>v == i.value)) i.checked = true;
            });
            else if (t == 'checkbox' || t == 'radio') n.checked = isFinite(json) ? json : json == n.value;
            else if (n.value !== undefined) n.value = json || '';
            else if (n.childElementCount) this.fold((_, c)=>{
                elem(c).load(json);
            });
        }
        return this;
    }
    dump(json) {
        let n = this.node, t = n.type, p;
        if (t == 'button' || t == 'reset' || t == 'submit') return json;
        else if (t == 'select-one') p = this.each('option', (o, v)=>{
            return o.selected ? o.value : v;
        }, null);
        else if (t == 'select-multiple') p = this.each('option', (o, l)=>{
            return o.selected && l.push(o.value), l;
        }, []);
        else if (t == 'fieldset' && n.querySelector('[type="radio"]')) p = this.each('input', (i, v)=>{
            return i.checked ? i.value : v;
        }, null);
        else if (t == 'fieldset') p = this.each('input', (i, l)=>{
            return i.checked && l.push(i.value), l;
        }, []);
        else if (t == 'checkbox' || t == 'radio') p = n.checked;
        else if (t == 'number' || t == 'range') p = dfn(n.valueAsNumber, null);
        else p = n.value;
        if (p !== undefined) return n.name ? set(json || {}, n.name, p) : p;
        if (n.childElementCount) return this.fold((o, c)=>{
            return elem(c).dump(o);
        }, n.name ? pre(json || {}, n.name, {}) : json);
        return json;
    }
    form(attrs, props) {
        return this.child('form', attrs, props);
    }
    label(text) {
        return this.child('label').txt(text);
    }
    button(desc, props) {
        desc = up({}, desc);
        const icon = pop(desc, 'icon');
        const label = pop(desc, 'label', '');
        const action = pop(desc, 'action', ()=>{});
        const elem = this.child('button', desc, props);
        if (icon) elem.icon.apply(elem, [].concat(icon));
        if (icon && label) elem.text(label);
        else if (label) elem.txt(label);
        return elem.on('click', action.bind(elem));
    }
    input(desc, props) {
        desc = up({}, desc);
        const label = pop(desc, 'label');
        const elem = label ? this.label(label) : this;
        return elem.child('input', desc, props);
    }
    output(desc, props) {
        desc = up({}, desc);
        const label = pop(desc, 'label');
        const elem = label ? this.label(label) : this;
        return elem.child('output', desc, props);
    }
    fieldset(desc) {
        desc = up({}, desc);
        const options = pop(desc, 'options', []);
        return options.reduce((s, d)=>{
            d = [].concat(d);
            return s.input(up(desc, {
                value: d[0],
                label: d[1] || d[0]
            })), s;
        }, this.child('fieldset', {
            name: desc.name
        }));
    }
    option(value, text) {
        return this.child('option', {
            value: value
        }).txt(text || value);
    }
    options(desc) {
        if (desc instanceof Array) this.map(desc, 'option');
        else if (desc instanceof Object) for(let k in desc)this.child('optgroup', {
            label: k
        }).map(desc[k], 'option');
        return this;
    }
    select(desc, props) {
        desc = up({}, desc);
        const label = pop(desc, 'label');
        const options = pop(desc, 'options');
        const elem = label ? this.label(label) : this;
        return elem.child('select', desc, props).options(options);
    }
    textarea(desc, props) {
        desc = up({}, desc);
        const label = pop(desc, 'label');
        const elem = label ? this.label(label) : this;
        return elem.child('textarea', desc, props);
    }
    views(value, opts) {
        return ()=>this.fire('input', this.node.value = value, opts);
    }
}
class SVGElem extends Elem {
    static get xmlns() {
        return "http://www.w3.org/2000/svg";
    }
    static get xlink() {
        return "http://www.w3.org/1999/xlink";
    }
    svg(attrs, props) {
        return this.child('svg', attrs, props);
    }
    circle(cx, cy, r) {
        return this.child('circle', {
            cx: cx,
            cy: cy,
            r: r
        });
    }
    ellipse(cx, cy, rx, ry) {
        return this.child('ellipse', {
            cx: cx,
            cy: cy,
            rx: rx,
            ry: ry
        });
    }
    line(x1, y1, x2, y2) {
        return this.child('line', {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        });
    }
    path(d) {
        return this.child('path', d && {
            d: d
        });
    }
    polyline(points) {
        return this.child('polyline', {
            points: points
        });
    }
    polygon(points) {
        return this.child('polygon', {
            points: points
        });
    }
    rect(x, y, w, h) {
        return this.child('rect', {
            x: x,
            y: y,
            width: w,
            height: h
        });
    }
    text(text) {
        return this.child('text', {}, {
            textContent: text
        });
    }
    tspan(text) {
        return this.child('tspan', {}, {
            textContent: text
        });
    }
    g(attrs, props) {
        return this.child('g', attrs, props);
    }
    icon(href, w, h) {
        return this.use(href).wh(w, h);
    }
    image(href, w, h) {
        return this.child('image').href(href).wh(w, h);
    }
    use(href) {
        return this.child('use').href(href);
    }
    mask(attrs, props) {
        return this.child('mask', attrs, props);
    }
    clipPath(attrs, props) {
        return this.child('clipPath', attrs, props);
    }
    symbol(attrs, props) {
        return this.child('symbol', attrs, props);
    }
    border(t, r, b, l, box) {
        return this.path(P.border(box || this.bbox(), t, r, b, l));
    }
    anchor(i, j) {
        const a = i < 0 ? 'start' : i > 0 ? 'end' : 'middle';
        const b = j < 0 ? 'hanging' : j > 0 ? 'alphabetic' : 'central';
        return this.attrs({
            'text-anchor': a,
            'dominant-baseline': b
        });
    }
    bbox() {
        return new Box(this.node.getBBox());
    }
    enc() {
        return this.node.tagName == 'svg' ? this : new SVGElem(this.node.ownerSVGElement);
    }
    fit() {
        return this.enc().attrs({
            viewBox: this.bbox()
        });
    }
    href(href) {
        return this.attrs({
            href: href
        }, this.xlink);
    }
    wh(w, h) {
        return this.attrs({
            width: w,
            height: h
        });
    }
    xy(x, y) {
        return this.attrs({
            x: x,
            y: y
        });
    }
    xywh(x, y, w, h) {
        return this.attrs({
            x: x,
            y: y,
            width: w,
            height: h
        });
    }
    point(x, y) {
        const p = this.enc().node.createSVGPoint();
        p.x = x;
        p.y = y;
        return p;
    }
    coords(x, y) {
        return this.point(x, y).matrixTransform(this.node.getScreenCTM().inverse());
    }
    screen(x, y) {
        return this.point(x, y).matrixTransform(this.node.getScreenCTM());
    }
    transform(desc) {
        const xform = [];
        for(let k in desc)xform.push(`${k}(${[].concat(desc[k]).join(',')})`);
        return this.attrs({
            transform: xform.join(' ')
        });
    }
    transformation(list) {
        const tx = {};
        list = list || this.node.transform.baseVal;
        for(let i = 0; i < list.numberOfItems; i++){
            const t = list.getItem(i), m = t.matrix;
            if (t.type == SVGTransform.SVG_TRANSFORM_MATRIX) tx.matrix = [
                m.a,
                m.b,
                m.c,
                m.d,
                m.e,
                m.f
            ];
            else if (t.type == SVGTransform.SVG_TRANSFORM_TRANSLATE) tx.translate = [
                m.e,
                m.f
            ];
            else if (t.type == SVGTransform.SVG_TRANSFORM_SCALE) tx.scale = [
                m.a,
                m.d
            ];
            else if (t.type == SVGTransform.SVG_TRANSFORM_ROTATE) tx.rotate = [
                t.angle,
                (m.f / m.c + m.e) / m.a,
                (m.e / m.b - m.f) / m.a
            ];
            else if (t.type == SVGTransform.SVG_TRANSFORM_SKEWX) tx.skewX = t.angle;
            else if (t.type == SVGTransform.SVG_TRANSFORM_SKEWY) tx.skewY = t.angle;
        }
        return tx;
    }
}
function box(x, y, w, h) {
    return new Box({
        x: x,
        y: y,
        w: w,
        h: h
    });
}
class Box {
    x;
    y;
    w;
    h;
    constructor(d = {}, e){
        this.x = dfn(dfn(d.x, d.left), e ? -Inf : 0);
        this.y = dfn(dfn(d.y, d.top), e ? -Inf : 0);
        this.w = dfn(dfn(d.w, d.width), e ? Inf : 0);
        this.h = dfn(dfn(d.h, d.height), e ? Inf : 0);
    }
    static ltrb(l = 0, t = 0, r = l, b = t) {
        return new this({
            x: l,
            y: t,
            w: r - l,
            h: b - t
        });
    }
    update(obj) {
        return up(this, obj);
    }
    get width() {
        return this.w;
    }
    get height() {
        return this.h;
    }
    get left() {
        return this.x;
    }
    get top() {
        return this.y;
    }
    get midX() {
        return add(this.x, this.w / 2);
    }
    get midY() {
        return add(this.y, this.h / 2);
    }
    get right() {
        return add(this.x, this.w);
    }
    get bottom() {
        return add(this.y, this.h);
    }
    grid(fun, acc, opts) {
        const o = up({
            rows: 1,
            cols: 1
        }, opts);
        const r = o.rows, c = o.cols;
        const x = this.x, y = this.y, w = this.w / c, h = this.h / r;
        const z = new Box({
            x: x,
            y: y,
            w: w,
            h: h
        });
        for(let i = 0, n = 0; i < r; i++)for(let j = 0; j < c; j++, n++)acc = fun.call(this, acc, z.shift(w * j, h * i), i, j, n, z);
        return acc;
    }
    join(boxs) {
        const bnds = [].concat(boxs).reduce(function(a, b) {
            return {
                x: min(a.x, b.x),
                y: min(a.y, b.y),
                right: max(a.right, b.right),
                bottom: max(a.bottom, b.bottom)
            };
        }, this);
        return new this.constructor({
            x: bnds.x,
            y: bnds.y,
            w: bnds.right - bnds.x,
            h: bnds.bottom - bnds.y
        });
    }
    tile(fun, acc, opts) {
        return this.grid(fun, acc, this.shape(opts && opts.unit));
    }
    shape(box) {
        const u = box || this;
        return {
            rows: this.h / u.h,
            cols: this.w / u.w
        };
    }
    stack(fun, acc, opts) {
        return this.times(opts).grid(fun, acc, opts);
    }
    times(shape) {
        const s = up({
            rows: 1,
            cols: 1
        }, shape);
        return this.copy({
            w: s.cols * this.w,
            h: s.rows * this.h
        });
    }
    over(shape) {
        const s = up({
            rows: 1,
            cols: 1
        }, shape);
        return this.copy({
            w: this.w / s.cols,
            h: this.h / s.rows
        });
    }
    split(opts) {
        return this.grid(function(acc, box) {
            return acc.push(box), acc;
        }, [], opts);
    }
    align(box, ax, ay) {
        const nx = (ax || 0) / 2, ny = (ay || 0) / 2, ox = nx + .5, oy = ny + .5;
        const x = box.midX + nx * box.w - ox * this.w;
        const y = box.midY + ny * box.h - oy * this.h;
        return this.copy({
            x: x,
            y: y
        });
    }
    center(cx, cy) {
        return this.copy({
            x: (cx || 0) - this.w / 2,
            y: (cy || 0) - this.h / 2
        });
    }
    to(x, y) {
        return this.copy({
            w: x - this.x,
            h: y - this.y
        });
    }
    xy(x, y) {
        return this.copy({
            x: x || 0,
            y: y || 0
        });
    }
    normalize() {
        const { x, y, w, h } = this;
        return this.copy({
            x: w < 0 ? x + w : x,
            y: h < 0 ? y + h : y,
            w: abs(w),
            h: abs(h)
        });
    }
    scale(a, b) {
        const w = a * this.w, h = dfn(b, a) * this.h;
        return new this.constructor({
            x: this.midX - w / 2,
            y: this.midY - h / 2,
            w: w,
            h: h
        });
    }
    shift(dx, dy) {
        return this.copy({
            x: this.x + (dx || 0),
            y: this.y + (dy || 0)
        });
    }
    stretch(dx, dy) {
        return this.copy({
            w: this.w + (dx || 0),
            h: this.h + (dy || 0)
        });
    }
    square(big) {
        const o = big ? max : min, d = o(this.w, this.h);
        return this.copy({
            w: d,
            h: d
        });
    }
    slice(ps, hzn) {
        const d = hzn ? this.w : this.h;
        ps = [].concat(ps);
        const f = 1 - ps.reduce(function(s, p) {
            return isFinite(p) ? s + p : s;
        }, 0) / d;
        return this.part(ps.map(function(p) {
            const pct = typeof p == 'string' && p[p.length - 1] == '%';
            return pct ? f * parseFloat(p.slice(0, -1)) / 100 : p / d;
        }), hzn);
    }
    part(ps, hzn) {
        const b = this, ko = hzn ? 'x' : 'y', kd = hzn ? 'w' : 'h';
        let o = b[ko], u = {}, s = 0;
        ps = [].concat(ps, undefined);
        return ps.map(function(p) {
            u[ko] = o += u[kd] || 0;
            u[kd] = dfn(p, 1 - s) * b[kd];
            s += p;
            return b.copy(u);
        });
    }
    pad(t, r, b, l) {
        return this.trim(-t, -r, -b, -l);
    }
    trim(t, r, b, l) {
        t = dfn(t, 0), r = dfn(r, t), b = dfn(b, t), l = dfn(l, r);
        return new this.constructor({
            x: this.x + l,
            y: this.y + t,
            w: this.w - r - l,
            h: this.h - t - b
        });
    }
    copy(o_) {
        const o = o_ || {}, ow = dfn(o.w, o.width), oh = dfn(o.h, o.height);
        const { x, y, w, h } = this;
        return new this.constructor({
            x: dfn(o.x, x),
            y: dfn(o.y, y),
            w: dfn(ow, w),
            h: dfn(oh, h)
        });
    }
    equals(o_) {
        const o = o_ || {}, ow = dfn(o.w, o.width), oh = dfn(o.h, o.height);
        const { x, y, w, h } = this;
        return x == dfn(o.x, 0) && y == dfn(o.y, 0) && w == dfn(ow, 0) && h == dfn(oh, 0);
    }
    overlaps(o_) {
        const o = o_ || {}, ow = dfn(o.w, o.width), oh = dfn(o.h, o.height), ox = dfn(o.x, 0), oy = dfn(o.y, 0);
        const { x, y, w, h } = this;
        return ox <= x + w && ox + ow >= x && oy <= y + h && oy + oh >= y;
    }
    toString() {
        const { x, y, w, h } = this;
        return x + ',' + y + ',' + w + ',' + h;
    }
    static solve(opts) {
        const o = up({}, opts);
        const b = o.bbox, s = o.shape, u = o.unit;
        if (b && s) return up(o, {
            shape: up({
                rows: 1,
                cols: 1
            }, s),
            unit: b.over(s)
        });
        if (u && s) return up(o, {
            shape: up({
                rows: 1,
                cols: 1
            }, s),
            bbox: u.times(s)
        });
        if (b && u) return up(o, {
            shape: b.shape(u),
            unit: u.copy({
                x: b.x,
                y: b.y
            })
        });
    }
}
function rgb(r, g, b, a) {
    return new RGB({
        r,
        g,
        b,
        a
    });
}
class RGB {
    constructor(d){
        up(this, d);
    }
    update(obj) {
        return up(this, obj);
    }
    alpha(a) {
        return a == undefined ? this : this.update({
            a: a
        });
    }
    shift(x) {
        let w = (v)=>clip(v + x, 0, 255);
        return new RGB({
            r: w(this.r || 0),
            g: w(this.g || 0),
            b: w(this.b || 0)
        }).alpha(this.a);
    }
    toHex() {
        return `#${[
            'r',
            'g',
            'b'
        ].map((k)=>this[k].toString(16).padStart(2, '0')).join('')}`;
    }
    toString() {
        if (this.a == undefined) return `rgb(${this.r || 0}, ${this.g || 0}, ${this.b || 0})`;
        return `rgba(${this.r || 0}, ${this.g || 0}, ${this.b || 0}, ${this.a})`;
    }
    static mix(x, opts) {
        let o = up({
            min: 0,
            max: 100,
            lo: {
                b: 100
            },
            hi: {
                r: 100
            }
        }, opts);
        let m = o.min, M = o.max, lo = o.lo, hi = o.hi;
        let w = (a, b)=>((b || 0) * max(x - m, 0) + (a || 0) * max(M - x, 0)) / (M - m);
        let i = (a, b)=>Math.round(w(a, b));
        if (lo.a == undefined && hi.a == undefined) return new RGB({
            r: i(lo.r, hi.r),
            g: i(lo.g, hi.g),
            b: i(lo.b, hi.b)
        });
        return new RGB({
            r: i(lo.r, hi.r),
            g: i(lo.g, hi.g),
            b: i(lo.b, hi.b),
            a: w(lo.a, hi.a)
        });
    }
    static random() {
        return new RGB({
            r: randInt(0, 255),
            g: randInt(0, 255),
            b: randInt(0, 255)
        });
    }
}
export { abs as abs };
export { log as log };
export { min as min };
export { max as max };
export { Rt2 as Rt2 };
export { Inf as Inf };
export { add as add };
export { dfn as dfn };
export { fnt as fnt };
export { get as get };
export { set as set };
export { pre as pre };
export { pop as pop };
export { pow as pow };
export { sgn as sgn };
export { clip as clip };
export { each as each };
export { map as map };
export { up as up };
export { noop as noop };
export { randInt as randInt };
export { window as window };
export { trig as trig };
export { units as units };
export { Q as Q };
export { path as path };
export { P as P };
export { SVGTransform as SVGTransform };
export { $ as $ };
export { elem as elem };
export { svg as svg };
export { wrap as wrap };
export { Elem as Elem };
export { SVGElem as SVGElem };
export { box as box };
export { Box as Box };
export { rgb as rgb };
export { RGB as RGB };
const mod = {
    abs: abs,
    log: log,
    min: min,
    max: max,
    Rt2: Rt2,
    Inf: Inf,
    add: add,
    dfn: dfn,
    fnt: fnt,
    get: get,
    set: set,
    pre: pre,
    pop: pop,
    pow: pow,
    sgn: sgn,
    clip: clip,
    each: each,
    map: map,
    up: up,
    noop: noop,
    randInt: randInt,
    window: window,
    trig: trig,
    units: units,
    Q: Q,
    path: path,
    P: P,
    SVGTransform: SVGTransform,
    $: $,
    elem: elem,
    svg: svg,
    wrap: wrap,
    Elem: Elem,
    SVGElem: SVGElem,
    box: box,
    Box: Box,
    rgb: rgb,
    RGB: RGB
};
function throttle(fun, every, T) {
    return (...args)=>{
        clearTimeout(T);
        T = setTimeout(()=>fun(...args), every);
    };
}
async function timer(ms, val) {
    return new Promise((okay)=>setTimeout(()=>okay(val), ms));
}
class Uni {
    static int(x) {
        return parseInt(x, 10);
    }
    static mod(x, y) {
        const r = x % y;
        return r < 0 ? r + y : r;
    }
    static max(x, y) {
        return x > y ? x : y;
    }
    static min(x, y) {
        return x < y ? x : y;
    }
    static nil(x) {
        if (x instanceof Array) return [];
        if (x instanceof Object) return {};
        if (typeof x == 'string') return '';
        if (typeof x == 'number') return 0;
    }
}
function pad(s, opt) {
    return s.toString().padStart(opt?.width ?? 2, opt?.pad ?? '0');
}
class List extends Array {
    constructor(x){
        x instanceof Array ? super(...x) : super(x);
    }
    static item(list, i = 0) {
        return list && list[i < 0 ? list.length + i : i];
    }
    static append(list, item) {
        return list.push(item), list;
    }
    static prepend(list, item) {
        return list.unshift(item), list;
    }
}
const Sec = 1000, Min = 60 * Sec, Hour = 60 * Min, Day = 24 * Hour, Week = 7 * Day;
const DoW = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];
const MoY = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
class Time extends Date {
    constructor(set, rel){
        const r = rel ? new Date(rel) : new Date;
        super(set?.y ?? r.getFullYear(), set?.m ?? r.getMonth(), set?.d ?? r.getDate(), set?.h ?? r.getHours(), set?.mi ?? r.getMinutes(), set?.s ?? r.getSeconds(), set?.ms ?? r.getMilliseconds());
    }
    static get(k, rel) {
        const r = rel ? new Date(rel) : new Date;
        switch(k){
            case 'y':
                return r.getFullYear();
            case 'm':
                return r.getMonth();
            case 'd':
                return r.getDate();
            case 'h':
                return r.getHours();
            case 'mi':
                return r.getMinutes();
            case 's':
                return r.getSeconds();
            case 'ms':
                return r.getMilliseconds();
        }
    }
    static pass(dif, rel) {
        const r = rel ? new Date(rel) : new Date;
        for(const k in dif)switch(k){
            case 'y':
                r.setFullYear(r.getFullYear() + dif[k]);
                break;
            case 'm':
                r.setMonth(r.getMonth() + dif[k]);
                break;
            case 'w':
                r.setDate(r.getDate() + dif[k] * 7);
                break;
            case 'd':
                r.setDate(r.getDate() + dif[k]);
                break;
            case 'h':
                r.setHours(r.getHours() + dif[k]);
                break;
            case 'mi':
                r.setMinutes(r.getMinutes() + dif[k]);
                break;
            case 's':
                r.setSeconds(r.getSeconds() + dif[k]);
                break;
            case 'ms':
                r.setMilliseconds(r.getMilliseconds() + dif[k]);
                break;
        }
        return r;
    }
    static fold(fun, acc, opt) {
        let t = opt?.start ?? new Date;
        const stop = opt?.stop, step = opt?.step ?? {
            d: 1
        };
        const fwd = Time.pass(step, t) >= t, jump = {};
        for(let i = 1, s = t; !stop || (fwd ? t < stop : t > stop); i++){
            acc = fun(acc, t);
            for(const k in step)jump[k] = step[k] * i;
            t = Time.pass(jump, s);
        }
        return acc;
    }
    static read(stamp, opt) {
        const sep = opt?.sep ?? 'T', dsep = opt?.dsep ?? '-', tsep = opt?.tsep ?? ':';
        const utc = opt?.utc || stamp[stamp.length - 1] == 'Z';
        const dtp = stamp.split(sep);
        const datep = dtp[0] ? dtp[0].split(dsep).map(Uni.int) : [
            0,
            0,
            0
        ];
        const timep = dtp[1] ? dtp[1].substring(0, 8).split(':').map(Uni.int) : [
            0,
            0,
            0
        ];
        if (utc) return new Date(Date.UTC(datep[0], datep[1] - 1, datep[2], timep[0], timep[1], timep[2]));
        return new Date(datep[0], datep[1] - 1, datep[2], timep[0], timep[1], timep[2]);
    }
    static datestamp(t, opt) {
        const datep = opt?.utc ? [
            t.getUTCFullYear(),
            pad(t.getUTCMonth() + 1),
            pad(t.getUTCDate())
        ] : [
            t.getFullYear(),
            pad(t.getMonth() + 1),
            pad(t.getDate())
        ];
        return datep.join(opt?.dsep ?? '-');
    }
    static timestamp(t, opt) {
        const timep = opt?.utc ? [
            pad(t.getUTCHours()),
            pad(t.getUTCMinutes()),
            pad(t.getUTCSeconds())
        ] : [
            pad(t.getHours()),
            pad(t.getMinutes()),
            pad(t.getSeconds())
        ];
        return timep.join(opt?.tsep ?? ':') + (opt?.utc ? 'Z' : '');
    }
    static stamp(t, opt) {
        return Time.datestamp(t, opt) + (opt?.sep ?? 'T') + Time.timestamp(t, opt);
    }
    static fromGregorian(s) {
        return new Date((s - 62167219200) * 1000);
    }
    static toGregorian(t) {
        return ~~(t / 1000) + 62167219200;
    }
    static daysInMonth(y, m) {
        return 32 - new Date(y, m, 32).getDate();
    }
    static isLeapYear(y) {
        return !(y % 4) && (y % 100 != 0 || !(y % 400));
    }
    static weekday(t) {
        return DoW[t.getDay()];
    }
    static month(t) {
        return MoY[t.getMonth()];
    }
}
const mod1 = function() {
    return {
        throttle: throttle,
        timer: timer,
        Uni: Uni,
        pad: pad,
        List: List,
        Sec: 1000,
        Min: Min,
        Hour: Hour,
        Day: Day,
        Week: Week,
        DoW: DoW,
        MoY: MoY,
        Time: Time
    };
}();
class Stack {
    members;
    constructor(){
        this.members = [];
    }
    get active() {
        return this.members[0];
    }
    async activate(index) {
        if (index >= 0 && index < this.members.length) {
            const [active] = this.members.splice(index, 1);
            await Promise.all(this.members.map((m, i)=>m.deactivate(this, i)));
            await active.activate(this, index);
            this.members.unshift(active);
            return active;
        } else {
            throw new Error(`non-existent index: ${index}`);
        }
    }
    async activateMember(member) {
        return await this.activate(this.members.findIndex((m)=>m === member));
    }
    async addMember(member) {
        if (!this.members.includes(member)) this.members.push(member);
        if (this.active === member) await member.activate(this);
    }
    async removeMember(member) {
        const i = this.members.findIndex((m)=>m === member);
        if (this.active === member) await member.deactivate(this);
        if (i >= 0) this.members.splice(i, 1);
    }
    findMemberByClass(c) {
        return this.members.find((m)=>m instanceof c);
    }
}
class Selection {
    members;
    constructor(){
        this.members = new Set;
    }
    get selected() {
        return [
            ...this.members
        ];
    }
    select(...members) {
        this.removeSelected(...this.members);
        this.addSelected(...members);
    }
    addSelected(...members) {
        for (const member of members)if (member.select(this) ?? true) this.members.add(member);
    }
    removeSelected(...members) {
        for (const member of members)if (member.deselect(this) ?? true) this.members.delete(member);
    }
    contains(member) {
        return this.members.has(member);
    }
}
const mod2 = {
    Stack: Stack,
    Selection: Selection
};
function broadcast(desc) {
    const cast = {};
    for (const [k, os] of Object.entries(desc))cast[k] = (...args)=>os.forEach((o, i)=>o[k]?.(...args, i));
    return cast;
}
class Orb {
    grip = 0;
    halt = false;
    jack;
    mode;
    static from(jack) {
        if (jack instanceof Orb) return jack;
        else if (typeof jack === 'function') return new this({
            send: jack
        });
        else if (Array.isArray(jack)) return new this(broadcast({
            grab: jack,
            move: jack,
            send: jack,
            free: jack
        }));
        else return new this(jack);
    }
    static do(method, instance, ...args) {
        return (instance[method] ?? this.prototype[method])?.call(instance, ...args);
    }
    static middle(orb, before, after) {
        return new class Middle extends Orb {
            grab(...args) {
                before?.();
                orb.grab(...args);
                after?.();
            }
            move(...args) {
                before?.();
                orb.move(...args);
                after?.();
            }
            send(...args) {
                before?.();
                orb.send(...args);
                after?.();
            }
            free(...args) {
                before?.();
                orb.free(...args);
                after?.();
            }
        };
    }
    static proxy(fn) {
        return new class Proxy extends Orb {
            grab(...args) {
                fn()?.grab(...args);
            }
            move(...args) {
                fn()?.move(...args);
            }
            send(...args) {
                fn()?.send(...args);
            }
            free(...args) {
                fn()?.free(...args);
            }
        };
    }
    constructor(impl = {}){
        up(this, impl);
    }
    grab(...args) {
        if (!this.halt) {
            this.grip++;
            this.jack?.grab(...args);
        }
    }
    move(deltas, ...args) {
        if (!this.halt) {
            this.jack?.move(deltas, ...args);
        }
    }
    send(...args) {
        if (!this.halt) {
            this.jack?.send(...args);
        }
    }
    free(...args) {
        if (!this.halt) {
            this.grip--;
            this.jack?.free(...args);
        }
    }
    withMode(mode) {
        return Orb.middle(this, ()=>this.mode = mode);
    }
}
class Transform extends Orb {
    opts;
    constructor(jack = {}, opts = {}, impl = {}){
        super(impl);
        this.jack = Orb.from(jack);
        this.opts = this.setOpts(opts);
    }
    static sink(opts) {
        return new this(undefined, opts);
    }
    defaultOpts(opts) {
        return {};
    }
    setOpts(opts) {
        if (!this.halt) {
            this.opts = up(this.opts ?? this.defaultOpts(opts), opts);
        }
        return this.opts;
    }
}
class Component extends Transform {
    elem;
    subs;
    constructor(elem, jack, opts, impl = {
        elem
    }){
        super(jack, opts, impl);
        this.elem = elem;
        this.subs = [];
        this.init();
    }
    static combo(a, b) {
        return combo(a, b);
    }
    static quick(root, opts) {
        return new this(this.sprout(root, opts), undefined, opts);
    }
    static sprout(root, _opts) {
        return root.node.namespaceURI.endsWith('svg') ? root.g() : root.div();
    }
    init() {
        this.elem.addClass([
            'component',
            this.constructor.name
        ]);
    }
    render() {
        if (!this.halt) {
            this.subs.forEach((c)=>c.render());
        }
        return this.elem;
    }
    destroy() {
        setTimeout(this.elem.remove.bind(this.elem));
    }
    async activate() {
        this.elem.addClass('activated');
    }
    async deactivate() {
        this.elem.removeClass('activated');
    }
    select() {
        this.elem.addClass('selected');
    }
    deselect() {
        this.elem.removeClass('selected');
    }
}
function combo(a, b) {
    class c extends Component {
        callAll(method, ...args) {
            b.prototype[method]?.call(up(this, {
                halt: true
            }), ...args);
            const r = a.prototype[method]?.call(up(this, {
                halt: false
            }), ...args);
            return r;
        }
        callFold(method, p = {}, fun = up) {
            const q = fun(p, b.prototype[method]?.call(up(this, {
                halt: true
            })));
            const r = fun(q, a.prototype[method]?.call(up(this, {
                halt: false
            })));
            return r;
        }
        init() {
            return this.callAll('init');
        }
        render() {
            return this.callAll('render');
        }
        defaultOpts(opts) {
            return this.callFold('defaultOpts', opts);
        }
        setOpts(opts) {
            return this.callAll('setOpts', opts);
        }
        grab(...args) {
            this.callAll('grab', ...args);
        }
        move(...args) {
            this.callAll('move', ...args);
        }
        send(...args) {
            this.callAll('send', ...args);
        }
        free(...args) {
            this.callAll('free', ...args);
        }
    }
    return c;
}
class Events {
    static keydown = 'keydown';
    static keyup = 'keyup';
    static pointerup = 'pointerup';
    static pointerdown = 'pointerdown';
    static pointermove = 'pointermove';
    static pointerexit = [
        this.pointerup,
        'pointercancel'
    ].join(' ');
    static wheel = 'wheel';
}
export { broadcast as broadcast };
export { Orb as Orb };
export { Transform as Transform };
export { Component as Component };
export { combo as combo };
export { Events as Events };
function keypress(elem, jack_, opts_ = {}) {
    const jack = Orb.from(jack_);
    const opts = up({
        gain: 5
    }, opts_);
    return elem.on(Events.keydown, (e)=>{
        if (!e.repeat) jack.grab(e);
        else jack.move([
            opts.gain,
            e.location
        ], e);
        if (opts.prevent) e.preventDefault();
        if (!e.repeat) elem.once(Events.keyup, (e)=>{
            jack.free(e);
            if (opts.prevent) e.preventDefault();
        });
    });
}
function pinch(elem, jack_, opts_ = {}) {
    const jack = Orb.from(jack_);
    const opts = up({
        prevent: true
    }, opts_);
    elem.on(Events.wheel, (e)=>{
        if (e.ctrlKey) {
            jack.move([
                -e.deltaY,
                -e.deltaY
            ], e);
            if (opts.stop) e.stopImmediatePropagation();
            if (opts.prevent) e.preventDefault();
        }
    });
}
function press(elem, jack_, opts_ = {}) {
    const jack = Orb.from(jack_);
    const opts = up({
        gain: 1,
        every: 33
    }, opts_);
    let i;
    return elem.on(Events.pointerdown, (e)=>{
        jack.grab(e);
        i = setInterval(()=>jack.move([
                opts.gain,
                e.pressure
            ], e), opts.every);
        if (opts.prevent) e.preventDefault();
        elem.doc().once(Events.pointerexit, (e)=>{
            jack.free(e);
            clearInterval(i);
            if (opts.prevent) e.preventDefault();
        });
    });
}
function scroll(elem, jack_, opts_ = {}) {
    const jack = Orb.from(jack_);
    const opts = up({
        prevent: true
    }, opts_);
    let lx, ly;
    elem.on(Events.wheel, (e)=>{
        if (!e.ctrlKey) {
            jack.move([
                -e.deltaX,
                -e.deltaY,
                lx,
                ly
            ], e);
            lx = e.pageX;
            ly = e.pageY;
            if (opts.stop) e.stopImmediatePropagation();
            if (opts.prevent) e.preventDefault();
        }
    });
}
function swipe(elem, jack_, opts_ = {}) {
    const jack = Orb.from(jack_);
    const opts = up({
        glob: true
    }, opts_);
    const doc = elem.doc(), that = opts.glob ? doc : elem;
    let lx, ly, move;
    elem.on(Events.pointerdown, (e)=>{
        const t = e.touches ? e.touches[0] : e;
        jack.grab(e);
        lx = t.pageX;
        ly = t.pageY;
        if (opts.prevent) e.preventDefault();
        that.on(Events.pointermove, move = (e)=>{
            const t = e.touches ? e.touches[0] : e;
            jack.move([
                t.pageX - lx,
                t.pageY - ly,
                lx,
                ly
            ], e);
            lx = t.pageX;
            ly = t.pageY;
            if (opts.stop) e.stopImmediatePropagation();
            if (opts.prevent) e.preventDefault();
        });
        doc.once(Events.pointerexit, (e)=>{
            that.off(Events.pointermove, move);
            jack.free(e);
            if (opts.prevent) e.preventDefault();
        });
    });
}
function tap(elem, jack, opts_ = {}) {
    const opts = up({
        gap: 250,
        mx: 1,
        my: 1
    }, opts_);
    let open = false, Dx, Dy;
    class TapTransform extends Transform {
        grab(e, ...rest) {
            Dx = Dy = 0;
            open = true;
            setTimeout(function() {
                open = false;
            }, opts.gap);
            if (opts.stop) e.stopImmediatePropagation();
            super.grab(e, ...rest);
        }
        move(delta, ...rest) {
            const [dx, dy] = delta;
            Dx += abs(dx);
            Dy += abs(dy);
            super.move(delta, ...rest);
        }
        free(e, ...rest) {
            if (open && Dx <= opts.mx && Dy <= opts.my) this.send({
                fire: e
            });
            open = false;
            if (opts.stop) e.stopImmediatePropagation();
            super.free(e, ...rest);
        }
    }
    swipe(elem, new TapTransform(jack, opts), {
        stop: opts.stop
    });
}
function dbltap(elem, jack_, opts_ = {}) {
    const jack = Orb.from(jack_);
    const opts = up({
        gap: 250
    }, opts_);
    let taps = 0;
    elem.on(Events.pointerdown, (e)=>{
        if (taps++) jack.send({
            fire: e
        });
        setTimeout(()=>{
            taps = 0;
        }, opts.gap);
        if (opts.prevent) e.preventDefault();
    });
}
const mod3 = {
    keypress,
    pinch,
    press,
    scroll,
    swipe,
    tap,
    dbltap
};
class Balloon extends Component {
    init() {}
    move(delta, ...rest) {
        const [dx, dy] = delta;
        const cur = this.elem.transformation();
        const mul = cur.scale = cur.scale || [
            1,
            1
        ];
        const mbox = new Box(this.opts.mbox || {}, true);
        if (mbox.width && dx) cur.scale[0] = clip(parseFloat(mul[0]) + dx, mbox.left, mbox.right);
        if (mbox.height && dy) cur.scale[1] = clip(parseFloat(mul[1]) + dy, mbox.top, mbox.bottom);
        super.move(delta, cur, ...rest);
        this.elem.transform(cur);
    }
}
class Text extends Component {
    setOpts(opts) {
        this.elem.txt(opts.text ?? this.constructor.name);
        return super.setOpts(opts);
    }
}
class Button extends Component {
    level;
    init() {
        press(this.elem, this);
    }
    render() {
        const app = this.opts.app ?? {};
        const act = this.opts.act ?? this.constructor.name;
        const k = `does_${act}`;
        const f = app[k];
        if (f instanceof Function) {
            const does = f();
            this.elem.style({
                display: does ? null : 'none'
            });
        }
        return super.render();
    }
    move(deltas, e, ...rest) {
        const [dp] = deltas, threshold = this.opts.threshold ?? 18;
        const last = this.level || 0;
        this.level = last + dp;
        if (this.level >= threshold) {
            if (last < threshold) this.send({
                fire: e
            });
            if (this.opts.repeat) this.level = 0;
        }
        Button.do('style', this, this.level / threshold);
        super.move(deltas, e, ...rest);
    }
    send(msg, ...rest) {
        if (msg.fire) Button.do('press', this, msg.fire);
        super.send(msg, ...rest);
    }
    free(...rest) {
        Button.do('style', this, this.level = undefined);
        super.free(...rest);
    }
    style(spectrum) {
        if (spectrum === undefined) {
            this.elem.style({
                opacity: null
            });
        } else {
            this.elem.style({
                opacity: 1 - spectrum
            });
        }
    }
    async press(e) {
        const app = this.opts.app ?? {};
        const act = this.opts.act ?? this.constructor.name;
        const k = `do_${act}`;
        const f = app[k];
        this.elem.addClass('pressed');
        if (f instanceof Function) {
            try {
                await f(undefined, e);
            } catch (err) {
                console.error(err);
            }
        }
        this.elem.removeClass('pressed');
    }
    static bypass(btn) {
        return (_, e)=>Button.do('press', btn, e);
    }
}
class TextButton extends Component.combo(Text, Button) {
}
class Dolly extends Component {
    init() {}
    move(delta, ...rest) {
        const [dx, dy] = delta;
        const cbox = new Box(this.elem.node.viewBox.baseVal);
        const nbox = cbox.shift(-dx, -dy);
        const bbox = new Box(this.opts.bbox || {}, true);
        if (bbox.width && dx) cbox.x = clip(nbox.x, bbox.left, bbox.right);
        if (bbox.height && dy) cbox.y = clip(nbox.y, bbox.top, bbox.bottom);
        super.move(delta, cbox, ...rest);
        this.elem.attrs({
            viewBox: cbox
        });
    }
}
class BoxShape extends Box {
    constructor(point){
        super(point);
    }
    deform(deltas, mode) {
        const [dx, dy] = deltas;
        switch(mode){
            case 'move':
                return this.shift(dx, dy);
            case 'resize':
            default:
                return this.stretch(dx, dy);
        }
    }
    mold(elem) {
        elem.embox(this.normalize());
    }
}
class Frame extends Component {
    defaultOpts() {
        return {
            shapeFn: BoxShape
        };
    }
    setOpts(opts_) {
        const opts = super.setOpts(opts_);
        const shape = opts.shape ?? new opts.shapeFn();
        shape.mold(this.elem);
        return opts;
    }
    init() {
        super.init();
        if (this.opts.transient) this.elem.hide();
    }
    grab(e, ...rest) {
        super.grab(e, ...rest);
        if (!this.opts.shape || this.opts.transient) this.setOpts({
            shape: new this.opts.shapeFn(this.elem.pos(e))
        });
        if (this.opts.transient) this.elem.show();
        this.elem.order(-1);
    }
    move(deltas, ...rest) {
        const shape = this.opts.shape?.deform(deltas, this.mode);
        super.move(deltas, shape, ...rest);
        this.setOpts({
            shape
        });
    }
    free(e, ...rest) {
        super.free(e, ...rest);
        if (this.opts.transient) this.elem.hide();
    }
}
class BoxFrame extends Frame {
}
class BBoxSelector extends Transform {
    setOpts(opts_) {
        const opts = super.setOpts(opts_);
        opts.selection = opts.selection ?? new Selection;
        return opts;
    }
    grab() {
        this.opts.selection.select();
    }
    move(deltas, bbox, ...rest) {
        const region = bbox.normalize();
        const selection = this.opts.selection;
        const selectables = this.opts.selectable?.() ?? [];
        for (const item of selectables){
            if (region.overlaps(item.elem.bbox())) {
                selection.addSelected(item);
            } else {
                selection.removeSelected(item);
            }
        }
        super.move(deltas, selection, ...rest);
    }
}
class SelectionBox extends BoxFrame {
    get selection() {
        return this.selector.opts.selection;
    }
    defaultOpts() {
        return {
            ...super.defaultOpts(),
            transient: true
        };
    }
    init() {
        super.init();
        this.jack = this.selector = new BBoxSelector(this.jack, this.opts);
    }
}
class Spring extends Component {
    dx;
    dy;
    anim;
    init() {}
    move(delta, ...rest) {
        const { lock, kx, ky, lx, ly, tx, ty, ...fns } = up({
            kx: 8,
            ky: 8,
            lx: 1,
            ly: 1,
            tx: 1,
            ty: 1
        }, this.opts);
        const restore = fns.restore ?? ((dx, dy, mx, my)=>{
            if (lock && this.grip) return;
            if (mx > tx) dx /= kx * log(mx + 1) || 1;
            if (my > ty) dy /= ky * log(my + 1) || 1;
            this.dx = (this.dx || 0) - dx;
            this.dy = (this.dy || 0) - dy;
            return super.move([
                dx,
                dy
            ], ...rest);
        });
        const [dx, dy] = delta;
        this.dx = (this.dx || 0) + lx * dx;
        this.dy = (this.dy || 0) + ly * dy;
        fns.stretch?.call(this);
        if (!this.anim) {
            fns.perturb?.call(this);
            this.anim = this.elem.animate(()=>{
                const dx = this.dx || 0, dy = this.dy || 0, mx = abs(dx), my = abs(dy);
                const more = restore.call(this, dx, dy, mx, my) || dx || dy || this.grip;
                if (!more) {
                    this.anim = null;
                    fns.balance?.call(this);
                }
                return more;
            });
        }
        super.move(delta, ...rest);
    }
}
class Wagon extends Component {
    init() {}
    move(delta, ...rest) {
        const [dx, dy] = delta;
        const cur = this.elem.transformation();
        const off = cur.translate = cur.translate || [
            0,
            0
        ];
        const bbox = new Box(this.opts.bbox || {}, true);
        if (bbox.width && dx) cur.translate[0] = clip(parseFloat(off[0]) + dx, bbox.left, bbox.right);
        if (bbox.height && dy) cur.translate[1] = clip(parseFloat(off[1]) + dy, bbox.top, bbox.bottom);
        super.move(delta, cur, ...rest);
        this.elem.transform(cur);
    }
}
class Zoom extends Component {
    init() {}
    move(delta, ...rest) {
        const [dx, dy] = delta;
        const cbox = new Box(this.elem.node.viewBox.baseVal);
        const nbox = cbox.scale(1 - dx / cbox.w, 1 - dy / cbox.h);
        const mbox = new Box(this.opts.mbox || {
            x: 1,
            y: 1
        }, true);
        if (mbox.width && dx) {
            if (mbox.left <= nbox.w && nbox.w <= mbox.right) Object.assign(cbox, {
                x: nbox.x,
                w: nbox.w
            });
        }
        if (mbox.height && dy) {
            if (mbox.top <= nbox.h && nbox.h <= mbox.bottom) Object.assign(cbox, {
                y: nbox.y,
                h: nbox.h
            });
        }
        super.move(delta, cbox, ...rest);
        this.elem.attrs({
            viewBox: cbox
        });
    }
}
const mod4 = {
    Balloon,
    Button,
    TextButton,
    Text,
    Dolly,
    BoxShape,
    Frame,
    BoxFrame,
    SelectionBox,
    Spring,
    Wagon,
    Zoom
};
class Amp extends Transform {
    move(deltas, ...rest) {
        const [dx, dy] = deltas;
        const opts = this.opts;
        const ax = opts.ax ?? 1, ay = opts.ay ?? 1;
        const kx = opts.kx ?? 1, ky = opts.ky ?? 1;
        super.move([
            kx * pow(dx, ax),
            ky * pow(dy, ay)
        ], ...rest);
    }
}
class Keys extends Transform {
    grab(e, ...rest) {
        super.grab(e, ...rest);
        const input = KeyCoder.characterize(e);
        const reset = !this.operative && Keys.do('captureInput', this, input);
        if (this.operative?.grab(e, ...rest)) return Keys.do('resetKeyMap', this, input), true;
        return reset;
    }
    move(deltas, e, ...rest) {
        super.move(deltas, e, ...rest);
        this.operative?.move(deltas, e, ...rest);
    }
    send(e, ...rest) {
        super.move(e, ...rest);
        this.operative?.send(e, ...rest);
    }
    free(e, ...rest) {
        super.free(e, ...rest);
        this.operative?.free(e, ...rest);
        if (this.grip == 0 && this.operative) Keys.do('resetKeyMap', this);
    }
    setOpts(opts_) {
        const opts = super.setOpts(up({
            map: {}
        }, opts_));
        Keys.do('resetKeyMap', this);
        return opts;
    }
    async callNext(next, input) {
        try {
            if (await next.call(this, input.chars, input.event)) input.event.preventDefault?.();
        } catch (e) {
            console.error('handler failed', e);
        }
    }
    captureInput(input) {
        if (input.special) {
            const next = this.curKeyMap[input.special] || this.curKeyMap.default;
            if (next instanceof Function) {
                Keys.do('resetKeyMap', this, input);
                Keys.do('callNext', this, next, input);
                return true;
            } else if (next instanceof Orb) {
                this.operative = next;
            } else if (next) {
                Keys.do('stepKeyMap', this, next, input);
            } else {
                console.debug('special input missed key map', input, this);
                Keys.do('resetKeyMap', this, input);
                return true;
            }
        } else if (input.chars) {
            for(let i = 0; i < input.chars.length; i++){
                const __char = input.chars[i];
                const next = this.curKeyMap[__char] || this.curKeyMap.default;
                if (next instanceof Function) {
                    Keys.do('resetKeyMap', this, input);
                    Keys.do('callNext', this, next, input);
                    return true;
                } else if (next instanceof Orb) {
                    this.operative = next;
                } else if (next) {
                    Keys.do('stepKeyMap', this, next, input);
                } else {
                    console.debug('input missed key map', input, this);
                    Keys.do('resetKeyMap', this, input);
                    return true;
                }
            }
        } else if (input.chars === '') {
            console.debug('empty input', input, this);
        } else {
            console.warn('unexpected input', input, this);
        }
        return false;
    }
    resetKeyMap(input = {}) {
        this.curKeyMap = this.opts.map;
        this.operative = undefined;
    }
    stepKeyMap(next, input) {
        this.curKeyMap = next;
    }
}
class KeyCoder {
    static characterize(event) {
        const modifiers = this.modifiers(event);
        const key = this.keyChar(event);
        const special = this.specialChar(event);
        if (modifiers && (special || key)) return {
            special: modifiers + (special || key),
            event
        };
        else if (special) return {
            special,
            event
        };
        else return {
            chars: key,
            event
        };
    }
    static modifiers(event) {
        let modifiers = '';
        if (event.metaKey) modifiers += '⌘-';
        if (event.ctrlKey) modifiers += 'C-';
        if (event.altKey) modifiers += 'M-';
        return modifiers;
    }
    static keyChar(event) {
        if (event.altKey) return '';
        if (event.ctrlKey && event.code?.startsWith('Control') || event.metaKey && event.code?.startsWith('Meta') || event.shiftKey && event.code?.startsWith('Shift')) return '';
        return event.key || '';
    }
    static specialChar(event) {
        switch(event.code){
            case 'ArrowLeft':
                return 'left';
            case 'ArrowUp':
                return 'up';
            case 'ArrowRight':
                return 'right';
            case 'ArrowDown':
                return 'down';
            case 'Backspace':
                return 'DEL';
            case 'Delete':
                return 'DEL';
            case 'Enter':
                return 'RET';
            case 'Escape':
                return 'ESC';
            case 'Space':
                return 'SPC';
            case 'Tab':
                return 'TAB';
        }
        if (event.key == 'Unidentified' || event.key == 'Dead') {
            const shift = event.shiftKey;
            switch(event.code){
                case 'Minus':
                    return shift ? '_' : '-';
                case 'Equal':
                    return shift ? '+' : '=';
                case 'Semicolon':
                    return shift ? ':' : ';';
                case 'Quote':
                    return shift ? '"' : "'";
                case 'Backquote':
                    return shift ? '~' : '`';
                case 'Comma':
                    return shift ? '<' : ',';
                case 'Period':
                    return shift ? '>' : '.';
                case 'Slash':
                    return shift ? '?' : '/';
                case 'Backslash':
                    return shift ? '|' : '\\';
                case 'BracketLeft':
                    return shift ? '{' : '[';
                case 'BracketRight':
                    return shift ? '}' : ']';
            }
            if (event.code.startsWith('Digit')) {
                const code = event.code.replace(/^Digit/, '');
                return shift ? ')!@#$%^&*('[code] : code;
            }
            if (event.code.startsWith('Key')) {
                const code = event.code.replace(/^Key/, '');
                return shift ? code.toUpperCase() : code.toLowerCase();
            }
        }
    }
}
class Loop extends Transform {
    move(deltas, cur, ...rest) {
        const [dx, dy] = deltas;
        const off = cur.translate || [
            0,
            0
        ];
        const bbox = new Box(this.opts.bbox || {}, true);
        const wrap = this.opts.wrap || noop;
        let ox = fnt(off[0], bbox.left);
        let oy = fnt(off[1], bbox.top);
        let lx = ox, ly = oy, over = true;
        while(over){
            over = false;
            if (bbox.width) {
                const wx = lx < bbox.left && 1 || lx > bbox.right && -1;
                if (wx) {
                    over = true;
                    lx += wx * bbox.width;
                    if (!wrap.call(this, wx, 0, ox, oy)) ox += wx * bbox.width;
                }
            }
            if (bbox.height) {
                const wy = ly < bbox.top && 1 || ly > bbox.bottom && -1;
                if (wy) {
                    over = true;
                    ly += wy * bbox.height;
                    if (!wrap.call(this, 0, wy, ox, oy)) oy += wy * bbox.height;
                }
            }
        }
        cur.translate = [
            ox,
            oy
        ];
        super.move(deltas, cur, ...rest);
    }
}
const mod5 = {
    BBoxSelector,
    Amp,
    Keys,
    KeyCoder,
    Loop
};
export { mod as Sky };
export { mod1 as Sun };
export { mod2 as Mutex };
export { mod3 as Gestures };
export { mod4 as Components };
export { mod5 as Transforms };
