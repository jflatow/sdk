// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const abs = Math.abs, Rt2 = Math.sqrt(2);
const dfn = (x, d)=>isNaN(x) ? d : x;
const each = (a, f)=>a && a.map ? a.map(f) : f(a, 0);
const up = Object.assign;
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
        return util.clip(x, -359.999, 359.999);
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
        const { x , y , w , h  } = box;
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
window.SVGTransform;
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
        return root.div();
    }
    static styles() {
        return {};
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
