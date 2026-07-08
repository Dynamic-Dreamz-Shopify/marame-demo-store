// import{S as r}from"./swiper-core.js";import{E as c}from"./effect-fade.js";import{N as l}from"./navigation.js";function f(){const t=document.querySelectorAll(".detail__sliders");t==null||t.forEach(e=>{const i=e==null?void 0:e.querySelector(".detail__sliders__main-slider:not(.swiper-initialized)"),o=e==null?void 0:e.querySelector(".detail__sliders__thumb-slider:not(.swiper-initialized)");if(!i||!o)return;const n=new r(i,{modules:[c,l],loop:!0,effect:"fade",fadeEffect:{crossFade:!0},navigation:{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"}, pagination: { el: ".swiper-pagination", clickable: true }});new r(o,{modules:[l],loop:!0,slidesPerView:4,spaceBetween:3,navigation:{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"}}),document.querySelectorAll(".detail__sliders__thumb-slider .swiper-slide").forEach((a,s)=>{a.addEventListener("click",()=>{n.slideToLoop(s)})}),n.on("navigationNext",()=>{console.log("navigationNext")})})}export{f as default};

import {S as r} from "./swiper-core.js";
import {E as c} from "./effect-fade.js";
import {N as l} from "./navigation.js";
function f() {
    const t = document.querySelectorAll(".detail__sliders");
    t == null || t.forEach(e => {
        const i = e == null ? void 0 : e.querySelector(".detail__sliders__main-slider:not(.swiper-initialized)")
          , o = e == null ? void 0 : e.querySelector(".detail__sliders__thumb-slider:not(.swiper-initialized)");

          const paginationEl = e.querySelector(".swiper-pagination");


        if (!i || !o)
            return;
        const n = new r(i,{
            modules: [c, l],
            loop: !0,
            effect: "fade",
            fadeEffect: {
                crossFade: !0
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            },on: {
                beforeInit(swiper) {
                swiper.isElement = false; // <-- Force global querySelectorAll
                }
            }
        });
        new r(o,{
            modules: [l],
            loop: !0,
            slidesPerView: 4,
            spaceBetween: 3,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            }
            // pagination: {
            //     el: ".swiper-pagination",
            //     clickable: true
            // }
        }),
        document.querySelectorAll(".detail__sliders__thumb-slider .swiper-slide").forEach( (a, s) => {
            a.addEventListener("click", () => {
                n.slideToLoop(s)
            }
            )
        }
        ),
        n.on("navigationNext", () => {
            console.log("navigationNext")
        }
        )
    }
    )
}
export {f as default};
