import { c as q } from "./create-element-if-not-defined.js";
import { m, e as E, a as P, b as F, S as T } from "./swiper-core.js";
import { inner as G, bp as R } from "./variables.js";
import "./script.js";
function B(u) {
    return (
        u === void 0 && (u = ""),
        `.${u
            .trim()
            .replace(/([\.:!+\/])/g, "\\$1")
            .replace(/ /g, ".")}`
    );
}
function N(u) {
    let { swiper: e, extendParams: L, on: f, emit: h } = u;
    const d = "swiper-pagination";
    L({ pagination: { el: null, bulletElement: "span", clickable: !1, hideOnClick: !1, renderBullet: null, renderProgressbar: null, renderFraction: null, renderCustom: null, progressbarOpposite: !1, type: "bullets", dynamicBullets: !1, dynamicMainBullets: 1, formatFractionCurrent: a => a, formatFractionTotal: a => a, bulletClass: `${d}-bullet`, bulletActiveClass: `${d}-bullet-active`, modifierClass: `${d}-`, currentClass: `${d}-current`, totalClass: `${d}-total`, hiddenClass: `${d}-hidden`, progressbarFillClass: `${d}-progressbar-fill`, progressbarOppositeClass: `${d}-progressbar-opposite`, clickableClass: `${d}-clickable`, lockClass: `${d}-lock`, horizontalClass: `${d}-horizontal`, verticalClass: `${d}-vertical`, paginationDisabledClass: `${d}-disabled` } }), (e.pagination = { el: null, bullets: [] });
    let $,
        C = 0;
    function w() {
        return !e.params.pagination.el || !e.pagination.el || (Array.isArray(e.pagination.el) && e.pagination.el.length === 0);
    }
    function A(a, i) {
        const { bulletActiveClass: t } = e.params.pagination;
        a && ((a = a[`${i === "prev" ? "previous" : "next"}ElementSibling`]), a && (a.classList.add(`${t}-${i}`), (a = a[`${i === "prev" ? "previous" : "next"}ElementSibling`]), a && a.classList.add(`${t}-${i}-${i}`)));
    }
    function H(a, i, t) {
        if (((a = a % t), (i = i % t), i === a + 1)) return "next";
        if (i === a - 1) return "previous";
    }
    function D(a) {
        const i = a.target.closest(B(e.params.pagination.bulletClass));
        if (!i) return;
        a.preventDefault();
        const t = P(i) * e.params.slidesPerGroup;
        if (e.params.loop) {
            if (e.realIndex === t) return;
            const s = H(e.realIndex, t, e.slides.length);
            s === "next" ? e.slideNext() : s === "previous" ? e.slidePrev() : e.slideToLoop(t);
        } else e.slideTo(t);
    }
    function v() {
        const a = e.rtl,
            i = e.params.pagination;
        if (w()) return;
        let t = e.pagination.el;
        t = m(t);
        let s, p;
        const b = e.virtual && e.params.virtual.enabled ? e.virtual.slides.length : e.slides.length,
            z = e.params.loop ? Math.ceil(b / e.params.slidesPerGroup) : e.snapGrid.length;
        if ((e.params.loop ? ((p = e.previousRealIndex || 0), (s = e.params.slidesPerGroup > 1 ? Math.floor(e.realIndex / e.params.slidesPerGroup) : e.realIndex)) : typeof e.snapIndex < "u" ? ((s = e.snapIndex), (p = e.previousSnapIndex)) : ((p = e.previousIndex || 0), (s = e.activeIndex || 0)), i.type === "bullets" && e.pagination.bullets && e.pagination.bullets.length > 0)) {
            const l = e.pagination.bullets;
            let g, c, x;
            if (
                (i.dynamicBullets &&
                    (($ = E(l[0], e.isHorizontal() ? "width" : "height")),
                    t.forEach(n => {
                        n.style[e.isHorizontal() ? "width" : "height"] = `${$ * (i.dynamicMainBullets + 4)}px`;
                    }),
                    i.dynamicMainBullets > 1 && p !== void 0 && ((C += s - (p || 0)), C > i.dynamicMainBullets - 1 ? (C = i.dynamicMainBullets - 1) : C < 0 && (C = 0)),
                    (g = Math.max(s - C, 0)),
                    (c = g + (Math.min(l.length, i.dynamicMainBullets) - 1)),
                    (x = (c + g) / 2)),
                l.forEach(n => {
                    const r = [...["", "-next", "-next-next", "-prev", "-prev-prev", "-main"].map(o => `${i.bulletActiveClass}${o}`)].map(o => (typeof o == "string" && o.includes(" ") ? o.split(" ") : o)).flat();
                    n.classList.remove(...r);
                }),
                t.length > 1)
            )
                l.forEach(n => {
                    const r = P(n);
                    r === s ? n.classList.add(...i.bulletActiveClass.split(" ")) : e.isElement && n.setAttribute("part", "bullet"), i.dynamicBullets && (r >= g && r <= c && n.classList.add(...`${i.bulletActiveClass}-main`.split(" ")), r === g && A(n, "prev"), r === c && A(n, "next"));
                });
            else {
                const n = l[s];
                if (
                    (n && n.classList.add(...i.bulletActiveClass.split(" ")),
                    e.isElement &&
                        l.forEach((r, o) => {
                            r.setAttribute("part", o === s ? "bullet-active" : "bullet");
                        }),
                    i.dynamicBullets)
                ) {
                    const r = l[g],
                        o = l[c];
                    for (let y = g; y <= c; y += 1) l[y] && l[y].classList.add(...`${i.bulletActiveClass}-main`.split(" "));
                    A(r, "prev"), A(o, "next");
                }
            }
            if (i.dynamicBullets) {
                const n = Math.min(l.length, i.dynamicMainBullets + 4),
                    r = ($ * n - $) / 2 - x * $,
                    o = a ? "right" : "left";
                l.forEach(y => {
                    y.style[e.isHorizontal() ? o : "top"] = `${r}px`;
                });
            }
        }
        t.forEach((l, g) => {
            if (
                (i.type === "fraction" &&
                    (l.querySelectorAll(B(i.currentClass)).forEach(c => {
                        c.textContent = i.formatFractionCurrent(s + 1);
                    }),
                    l.querySelectorAll(B(i.totalClass)).forEach(c => {
                        c.textContent = i.formatFractionTotal(z);
                    })),
                i.type === "progressbar")
            ) {
                let c;
                i.progressbarOpposite ? (c = e.isHorizontal() ? "vertical" : "horizontal") : (c = e.isHorizontal() ? "horizontal" : "vertical");
                const x = (s + 1) / z;
                let n = 1,
                    r = 1;
                c === "horizontal" ? (n = x) : (r = x),
                    l.querySelectorAll(B(i.progressbarFillClass)).forEach(o => {
                        (o.style.transform = `translate3d(0,0,0) scaleX(${n}) scaleY(${r})`), (o.style.transitionDuration = `${e.params.speed}ms`);
                    });
            }
            i.type === "custom" && i.renderCustom ? ((l.innerHTML = i.renderCustom(e, s + 1, z)), g === 0 && h("paginationRender", l)) : (g === 0 && h("paginationRender", l), h("paginationUpdate", l)), e.params.watchOverflow && e.enabled && l.classList[e.isLocked ? "add" : "remove"](i.lockClass);
        });
    }
    function k() {
        const a = e.params.pagination;
        if (w()) return;
        const i = e.virtual && e.params.virtual.enabled ? e.virtual.slides.length : e.grid && e.params.grid.rows > 1 ? e.slides.length / Math.ceil(e.params.grid.rows) : e.slides.length;
        let t = e.pagination.el;
        t = m(t);
        let s = "";
        if (a.type === "bullets") {
            let p = e.params.loop ? Math.ceil(i / e.params.slidesPerGroup) : e.snapGrid.length;
            e.params.freeMode && e.params.freeMode.enabled && p > i && (p = i);
            for (let b = 0; b < p; b += 1) a.renderBullet ? (s += a.renderBullet.call(e, b, a.bulletClass)) : (s += `<${a.bulletElement} ${e.isElement ? 'part="bullet"' : ""} class="${a.bulletClass}"></${a.bulletElement}>`);
        }
        a.type === "fraction" && (a.renderFraction ? (s = a.renderFraction.call(e, a.currentClass, a.totalClass)) : (s = `<span class="${a.currentClass}"></span> / <span class="${a.totalClass}"></span>`)),
            a.type === "progressbar" && (a.renderProgressbar ? (s = a.renderProgressbar.call(e, a.progressbarFillClass)) : (s = `<span class="${a.progressbarFillClass}"></span>`)),
            (e.pagination.bullets = []),
            t.forEach(p => {
                a.type !== "custom" && (p.innerHTML = s || ""), a.type === "bullets" && e.pagination.bullets.push(...p.querySelectorAll(B(a.bulletClass)));
            }),
            a.type !== "custom" && h("paginationRender", t[0]);
    }
    function M() {
        e.params.pagination = q(e, e.originalParams.pagination, e.params.pagination, { el: "swiper-pagination" });
        const a = e.params.pagination;
        if (!a.el) return;
        let i;
        typeof a.el == "string" && e.isElement && (i = e.el.querySelector(a.el)),
            !i && typeof a.el == "string" && (i = [...document.querySelectorAll(a.el)]),
            i || (i = a.el),
            !(!i || i.length === 0) &&
                (e.params.uniqueNavElements && typeof a.el == "string" && Array.isArray(i) && i.length > 1 && ((i = [...e.el.querySelectorAll(a.el)]), i.length > 1 && (i = i.filter(t => F(t, ".swiper")[0] === e.el)[0])),
                Array.isArray(i) && i.length === 1 && (i = i[0]),
                Object.assign(e.pagination, { el: i }),
                (i = m(i)),
                i.forEach(t => {
                    a.type === "bullets" && a.clickable && t.classList.add(...(a.clickableClass || "").split(" ")), t.classList.add(a.modifierClass + a.type), t.classList.add(e.isHorizontal() ? a.horizontalClass : a.verticalClass), a.type === "bullets" && a.dynamicBullets && (t.classList.add(`${a.modifierClass}${a.type}-dynamic`), (C = 0), a.dynamicMainBullets < 1 && (a.dynamicMainBullets = 1)), a.type === "progressbar" && a.progressbarOpposite && t.classList.add(a.progressbarOppositeClass), a.clickable && t.addEventListener("click", D), e.enabled || t.classList.add(a.lockClass);
                }));
    }
    function S() {
        const a = e.params.pagination;
        if (w()) return;
        let i = e.pagination.el;
        i &&
            ((i = m(i)),
            i.forEach(t => {
                t.classList.remove(a.hiddenClass), t.classList.remove(a.modifierClass + a.type), t.classList.remove(e.isHorizontal() ? a.horizontalClass : a.verticalClass), a.clickable && (t.classList.remove(...(a.clickableClass || "").split(" ")), t.removeEventListener("click", D));
            })),
            e.pagination.bullets && e.pagination.bullets.forEach(t => t.classList.remove(...a.bulletActiveClass.split(" ")));
    }
    f("changeDirection", () => {
        if (!e.pagination || !e.pagination.el) return;
        const a = e.params.pagination;
        let { el: i } = e.pagination;
        (i = m(i)),
            i.forEach(t => {
                t.classList.remove(a.horizontalClass, a.verticalClass), t.classList.add(e.isHorizontal() ? a.horizontalClass : a.verticalClass);
            });
    }),
        f("init", () => {
            e.params.pagination.enabled === !1 ? I() : (M(), k(), v());
        }),
        f("activeIndexChange", () => {
            typeof e.snapIndex > "u" && v();
        }),
        f("snapIndexChange", () => {
            v();
        }),
        f("snapGridLengthChange", () => {
            k(), v();
        }),
        f("destroy", () => {
            S();
        }),
        f("enable disable", () => {
            let { el: a } = e.pagination;
            a && ((a = m(a)), a.forEach(i => i.classList[e.enabled ? "remove" : "add"](e.params.pagination.lockClass)));
        }),
        f("lock unlock", () => {
            v();
        }),
        f("click", (a, i) => {
            const t = i.target,
                s = m(e.pagination.el);
            if (e.params.pagination.el && e.params.pagination.hideOnClick && s && s.length > 0 && !t.classList.contains(e.params.pagination.bulletClass)) {
                if (e.navigation && ((e.navigation.nextEl && t === e.navigation.nextEl) || (e.navigation.prevEl && t === e.navigation.prevEl))) return;
                const p = s[0].classList.contains(e.params.pagination.hiddenClass);
                h(p === !0 ? "paginationShow" : "paginationHide"), s.forEach(b => b.classList.toggle(e.params.pagination.hiddenClass));
            }
        });
    const O = () => {
            e.el.classList.remove(e.params.pagination.paginationDisabledClass);
            let { el: a } = e.pagination;
            a && ((a = m(a)), a.forEach(i => i.classList.remove(e.params.pagination.paginationDisabledClass))), M(), k(), v();
        },
        I = () => {
            e.el.classList.add(e.params.pagination.paginationDisabledClass);
            let { el: a } = e.pagination;
            a && ((a = m(a)), a.forEach(i => i.classList.add(e.params.pagination.paginationDisabledClass))), S();
        };
    Object.assign(e.pagination, { enable: O, disable: I, render: k, update: v, init: M, destroy: S });
}
function _() {
    document.querySelectorAll(".detail-slider").forEach(e => {
        const L = e.querySelectorAll(".swiper-slide");
        (L.length > 1 || G.w < R.large) && j(e), L.length > 3 && e.classList.add("above-three");
    });
}
function j(u) {
    const e = new T(u, { modules: [N], pagination: { el: ".swiper-pagination", clickable: !0 }, speed: 500, slidesPerView: 1, spaceBetween: 0 });
    e.on("slideChange", () => {
        u.querySelectorAll(".swiper-pagination-bullet").forEach((f, h) => {
            f.classList.toggle("swiper-pagination-bullet-active", h === e.activeIndex);
        });
    });
}
export { _ as default };
