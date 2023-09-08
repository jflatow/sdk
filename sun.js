// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

function throttle(fun, every, T) {
    return (...args)=>{
        clearTimeout(T);
        T = setTimeout(()=>fun(...args), every);
    };
}
async function timer(ms, val) {
    return new Promise((okay)=>setTimeout(()=>okay(val), ms));
}
function __int(x) {
    return parseInt(x, 10);
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
        const datep = dtp[0] ? dtp[0].split(dsep).map(__int) : [
            0,
            0,
            0
        ];
        const timep = dtp[1] ? dtp[1].substring(0, 8).split(':').map(__int) : [
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
        return Time.datestamp(t, opt) + (opt?.sep ?? ' ') + Time.timestamp(t, opt);
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
export { throttle as throttle };
export { timer as timer };
export { __int as int };
export { pad as pad };
export { List as List };
export { Sec as Sec, Min as Min, Hour as Hour, Day as Day, Week as Week };
export { DoW as DoW };
export { MoY as MoY };
export { Time as Time };
