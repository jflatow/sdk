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
const Q = up(function units(o, u) {
    const t = {};
    for(const k in o)t[k] = Q.unify(k, o[k], u);
    return t;
}, {
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
const P = up(function path(cmd, ...args) {
    return cmd + args;
}, {
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
            const cx1 = x2 - dx, cy1 = y1 + dy;
            return open([
                x1,
                y1
            ]) + P('h', cx1 - x1) + P('a', rx, ry, 0, 0, sd, dx, dy) + P('v', y2 - cy1);
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
class Orb {
    static from(jack) {
        if (jack instanceof Orb) return jack;
        else if (typeof jack === 'function') return new this({
            send: jack
        });
        else return new this(jack);
    }
    constructor(impl = {}){
        up(this, impl);
    }
    grab(...args) {}
    move(delta, ...args) {}
    send(...messages) {}
    free(...args) {}
}
class Transform extends Orb {
    jack;
    opts;
    constructor(jack = {}, opts = {}){
        this.jack = jack;
        this.opts = opts;
    }
    grab(...args) {
        this.jack.grab(...args);
    }
    move(delta, ...args) {
        this.jack.move(delta, ...args);
    }
    send(...messages) {
        this.jack.send(...messages);
    }
    free(...args) {
        this.jack.free(...args);
    }
}
class Component extends Transform {
    elem;
    constructor(elem, jack, opts){
        super(jack, opts);
        this.elem = elem;
    }
}
class Gestures {
    static pointerup = 'pointerup';
    static pointerdown = 'pointerdown';
    static pointermove = 'pointermove';
    static pointerexit = [
        this.pointerup,
        'pointercancel'
    ].join(' ');
    static tap(elem, jack, opts) {
        jack = Orb.from(jack);
        opts = up({
            gap: 250,
            mx: 1,
            my: 1
        }, opts);
        let open = false, Dx, Dy;
        class TapTransform extends Transform {
            grab(e) {
                Dx = Dy = 0;
                open = true;
                setTimeout(function() {
                    open = false;
                }, opts.gap);
                if (opts.stop) e.stopImmediatePropagation();
                super.grab.prototype.apply(this, arguments);
            }
            move([dx, dy]) {
                Dx += abs(dx);
                Dy += abs(dy);
                super.move.prototype.apply(this, arguments);
            }
            free(e) {
                if (open && Dx <= opts.mx && Dy <= opts.my) this.send({
                    fire: e
                });
                open = false;
                if (opts.stop) e.stopImmediatePropagation();
                super.free.prototype.apply(this, arguments);
            }
        }
        return this.swipe(elem, new TapTransform(jack, opts), {
            stop: opts.stop
        });
    }
    static swipe(elem, jack, opts) {
        jack = Orb.from(jack);
        opts = up({
            glob: true
        }, opts);
        const doc = elem.doc(), that = opts.glob ? doc : elem;
        let lx, ly, move;
        elem.on(Gestures.pointerdown, function(e) {
            let t = e.touches ? e.touches[0] : e;
            jack.grab(e);
            lx = t.pageX;
            ly = t.pageY;
            if (opts.prevent) e.preventDefault();
            that.on(Gestures.pointermove, move = function(e) {
                let t = e.touches ? e.touches[0] : e;
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
            doc.once(Gestures.pointerexit, function(e) {
                that.off(Gestures.pointermove, move);
                jack.free(e);
                if (opts.prevent) e.preventDefault();
            });
        });
        return this;
    }
}
export { Orb as Orb };
export { Transform as Transform };
export { Component as Component };
export { Gestures as Gestures };
