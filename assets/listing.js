import {
    inner as d,
    bp as r
} from "./variables.js";
import {
    swiperInstances as f
} from "./product-card-img-slider.js";
import "./script.js";
import "./swiper-core.js";
import "./effect-fade.js";
import "./navigation.js";

function g() {
    const t = document.querySelector(".listing__list"),
        s = document == null ? void 0 : document.querySelectorAll(".listing-hero__view__btns button");
    s == null || s.forEach(e => {
        const n = e == null ? void 0 : e.getAttribute("data-column");
        e == null || e.addEventListener("click", () => {
            t == null || t.classList.remove("cols-1", "cols-2", "cols-3", "cols-4", "cols-5"), t == null || t.classList.add(`cols-${n}`), s == null || s.forEach(v => {
                var a;
                v.classList.remove("active"), (a = f) == null || a.forEach(u => {
                    u && u.update()
                })
            }), e.classList.add("active")
        });
        const L = d.w < r.medium ? "2" : "4";
        n === L && (e.classList.add("active"), t == null || t.classList.add(`cols-${n}`))
    });
    const o = d.w < r.medium ? 7 : 12,
        c = document.querySelectorAll(".listing__item"),
        i = document.querySelector(".listing__more"),
        _ = document.querySelector(".listing__more button");
    c.forEach((e, n) => {
        n + 1 > o && e.classList.add("hide")
    }), c.length > o ? i == null || i.classList.add("show") : i == null || i.classList.remove("show"), _ == null || _.addEventListener("click", function() {
        c.forEach((e, n) => {
            n + 1 > o && e.classList.remove("hide")
        }), i == null || i.classList.remove("show")
    });
    const l = document.querySelectorAll(".product-card");
    l == null || l.forEach(e => {
        e.classList.contains("has-init") || (y(e), h(e), e.classList.add("has-init"))
    });
    let m;
    window.addEventListener("resize", () => {
        clearTimeout(m), m = window.setTimeout(() => {
            l == null || l.forEach(e => {
                h(e)
            })
        }, 100)
    })
}

function y(t) {
    const s = t == null ? void 0 : t.querySelector(".product-card__content__add-to-cart__colors"),
        o = t == null ? void 0 : t.querySelector(".product-card__content__add-to-cart__available"),
        c = t == null ? void 0 : t.querySelector(".product-card__content__add-to-cart__out-of-stock"),
        i = t == null ? void 0 : t.querySelector(".product-card__content__infos__add"),
        _ = (t == null ? void 0 : t.getAttribute("data-available")) === "true";
    i == null || i.addEventListener("click", () => {
        i.classList.contains("active") ? (s == null || s.classList.add("hide"), _ ? o == null || o.classList.add("show") : c == null || c.classList.add("show")) : (s == null || s.classList.remove("hide"), o == null || o.classList.remove("show"), c == null || c.classList.remove("show"))
    })
}

function h(t) {
    const s = t == null ? void 0 : t.querySelector(".product-card__content__add-to-cart__available > .btn"),
        o = t == null ? void 0 : t.querySelector(".size-select > .btn");
    if (!s || !o) return;
    const c = o.getBoundingClientRect().width;
    s.style.width = `${c}px`
}
export {
    g as
    default
};