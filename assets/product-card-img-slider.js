// import{S as n}from"./swiper-core.js";import{E as a}from"./effect-fade.js";import{N as s}from"./navigation.js";const i=[];function f(){console.log("Init Product Card Image Sliders");const t=document.querySelectorAll(".product-card__img-new-slider:not(.swiper-initialized)");t==null||t.forEach(e=>{const r=new n(e,{modules:[a,s],updateOnWindowResize:!1,loop:!0,effect:"fade",fadeEffect:{crossFade:!0},navigation:{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"}});i.push(r)});let o;window.addEventListener("resize",()=>{clearTimeout(o),o=setTimeout(()=>{i.forEach(e=>{e&&e.update()})},150)})}export{f as default,i as swiperInstances};

// import {S as n} from "./swiper-core.js";
// import {E as a} from "./effect-fade.js";
// import {N as s} from "./navigation.js";

// const i = [];
// function f() {
//     console.log("Init Product Card Image Sliders===>>themeID: 187790360911 187790360911");
//     const t = document.querySelectorAll(".product-card__img-new-slider:not(.swiper-initialized1)");
//     t == null || t.forEach(e => {

//         const paginationEl = e.querySelector(".swiper-pagination");
//         // const scrollerEl = e.querySelector(".swiper-scrollbar");
//         // console.log("scrollerEl",scrollerEl,Scrollbar);
//         const r = new n(e,{
//             modules: [a, s],
//             updateOnWindowResize: !1,
//             // loop: !0,
//             loop: false,
//             effect: "fade",
//             fadeEffect: {
//                 crossFade: !0
//             },
//             navigation: {
//                 nextEl: ".swiper-button-next",
//                 prevEl: ".swiper-button-prev"
//             },
//             pagination: {
//                 el: paginationEl,
//                 clickable: true
//             },
//             // scrollbar: {
//             //     el: scrollerEl,
//             //     draggable: true
//             // }
//         });
//         i.push(r)
//     }
//     );
//     let o;
//     window.addEventListener("resize", () => {
//         clearTimeout(o),
//         o = setTimeout( () => {
//             i.forEach(e => {
//                 e && e.update()
//             }
//             )
//         }
//         , 150)
//     }
//     )
// }
// export {f as default, i as swiperInstances};



import {S as n} from "./swiper-core.js";
import {E as a} from "./effect-fade.js";
import {N as s} from "./navigation.js";

const i = [];

// Build one Swiper for a single slider element (guarded against double-init)
function initSlider(e) {
    if (!e || e.swiper) return;                 // already has a Swiper → skip
    const paginationEl = e.querySelector(".swiper-pagination");
    const r = new n(e, {
        modules: [a, s],
        updateOnWindowResize: false,
        loop: false,
        effect: "fade",
        fadeEffect: { crossFade: true },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        pagination: {
            el: paginationEl,
            clickable: true
        }
    });
    i.push(r);
}

// Lazy init: only build a card's Swiper when it nears the viewport
let _observer = null;
function getObserver() {
    if (_observer) return _observer;
    _observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            initSlider(entry.target);
            obs.unobserve(entry.target);        // init once, then stop watching
        });
    }, { rootMargin: "300px 0px" });            // start ~300px before it scrolls in
    return _observer;
}

// Add the resize updater only ONCE, no matter how many times f() runs
let _resizeBound = false;
function bindResizeOnce() {
    if (_resizeBound) return;
    _resizeBound = true;
    let o;
    window.addEventListener("resize", () => {
        clearTimeout(o);
        o = setTimeout(() => {
            i.forEach(e => { e && e.update(); });
        }, 150);
    });
}

function f() {
    bindResizeOnce();
    const observer = getObserver();
    const sliders = document.querySelectorAll(".product-card__img-new-slider:not(.swiper-initialized)");
    sliders.forEach(e => {
        if (e.swiper) return;                   // safety: skip ones already built
        observer.observe(e);
    });
}

export {f as default, i as swiperInstances};