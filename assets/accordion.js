// import{g as s}from"./script.js";import{lenis as f}from"./scroll.js";import{inner as p,bp as h}from"./variables.js";import"./parallax.js";import"./_commonjsHelpers.js";function q(){document.querySelectorAll(".accordion__list").forEach(r=>{const i=r.classList.contains("memberships__list"),o=r.querySelectorAll(".accordion");o.forEach(t=>{const u=t.querySelector("summary"),c=t.querySelector(".accordion__body");if(!u||!c)return;const d=t.classList.contains("memberships__item--member"),m=p.w>h.medium;i&&m||d?y(t,c):b(o,t,u,c)})}),document.querySelectorAll("[data-accordion-id]").forEach(r=>{r.addEventListener("click",()=>{const i=r.getAttribute("data-accordion-id");if(!i)return;const o=document.getElementById(i);if(!o)return;const t=o.querySelector(".accordion__body");t&&(f.scrollTo(o),a(o,t))})})}function y(n,e){var r;n.open=!0,s.set(e,{height:"auto",overflow:"visible"}),(r=n.querySelector("summary"))==null||r.style.setProperty("pointer-events","none")}function b(n,e,r,i){e.dataset.init!=="true"&&(e.dataset.init="true",s.set(i,{height:0,overflow:"hidden"}),e.addEventListener("toggle",o=>{o.preventDefault(),e.open&&n.forEach(t=>{t!==e&&l(t,t.querySelector(".accordion__body"))})}),r.addEventListener("click",o=>{o.preventDefault(),e.open?l(e,i):a(e,i)}))}function a(n,e){n.open=!0,s.to(e,{height:"auto",duration:.4,ease:"ease"})}function l(n,e){s.to(e,{height:0,duration:.4,ease:"ease",onComplete(){n.open=!1}})}export{q as default};
import {g as s} from "./script.js";
import {lenis as f} from "./scroll.js";
import {inner as p, bp as h} from "./variables.js";
import "./parallax.js";
import "./_commonjsHelpers.js";
function q() {
    document.querySelectorAll(".accordion__list").forEach(r => {
        const i = r.classList.contains("memberships__list")
          , o = r.querySelectorAll(".accordion");
        o.forEach(t => {
            const u = t.querySelector("summary")
              , c = t.querySelector(".accordion__body");
            if (!u || !c)
                return;
            const d = t.classList.contains("memberships__item--member")
              , m = p.w > h.medium;
            i && m || d ? y(t, c) : b(o, t, u, c)
        }
        )
    }
    ),
    document.querySelectorAll("[data-accordion-id]").forEach(r => {
        r.addEventListener("click", () => {
            const i = r.getAttribute("data-accordion-id");
            if (!i)
                return;
            const o = document.getElementById(i);
            if (!o)
                return;
            const t = o.querySelector(".accordion__body");
            t && (f.scrollTo(o),
            a(o, t))
        }
        )
    }
    )
}
function y(n, e) {
    var r;
    n.open = !0,
    s.set(e, {
        height: "auto",
        overflow: "visible"
    }),
    (r = n.querySelector("summary")) == null || r.style.setProperty("pointer-events", "none")
}
function b(n, e, r, i) {
    e.dataset.init !== "true" && (e.dataset.init = "true",
    s.set(i, {
        height: 0,
        overflow: "hidden"
    }),
    e.addEventListener("toggle", o => {
        o.preventDefault(),
        e.open && n.forEach(t => {
            t !== e && l(t, t.querySelector(".accordion__body"))
        }
        )
    }
    ),
    r.addEventListener("click", o => {
        o.preventDefault(),
        e.open ? l(e, i) : a(e, i)
    }
    ))
}
function a(n, e) {
    n.open = !0,
    s.to(e, {
        height: "auto",
        duration: .4,
        ease: "ease"
    })
}
function l(n, e) {
    s.to(e, {
        height: 0,
        duration: .4,
        ease: "ease",
        onComplete() {
            n.open = !1
        }
    })
}
export {q as default};
