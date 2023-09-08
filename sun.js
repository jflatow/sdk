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
export { throttle as throttle };
export { timer as timer };
