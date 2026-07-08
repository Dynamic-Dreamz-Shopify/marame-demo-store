// import{S as o}from"./swiper-core.js";import{E as r}from"./effect-fade.js";import{N as i}from"./navigation.js";function l(){const e=document.querySelectorAll(".buy-the-look__content__details__item__img__slider");e==null||e.forEach(t=>{new o(t,{modules:[r,i],loop:!0,effect:"fade",fadeEffect:{crossFade:!0},navigation:{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"}})})}export{l as default};

import {S as o} from "./swiper-core.js";
import {E as r} from "./effect-fade.js";
import {N as i} from "./navigation.js";
function l() {
    const e = document.querySelectorAll(".buy-the-look__content__details__item__img__slider");
    e == null || e.forEach(t => {
        new o(t,{
            modules: [r, i],
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
            }
        })
    }
    )
}
export {l as default};