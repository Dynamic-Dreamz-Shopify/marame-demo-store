import { a as w, c as k, m as c } from "./swiper-core.js";

function N(g, a, d, o) {
    return g.params.createElements && Object.keys(o).forEach(l => {
        if (!d[l] && d.auto === !0) {
            let r = w(g.el, `.${o[l]}`)[0];
            r || (r = k("div", o[l]), r.className = o[l], g.el.append(r));
            d[l] = r;
            a[l] = r;
        }
    }), d;
}

function O(g) {
    let { swiper: a, extendParams: d, on: o, emit: l } = g;

    d({
        navigation: {
            nextEl: null,
            prevEl: null,
            hideOnClick: !1,
            disabledClass: "swiper-button-disabled",
            hiddenClass: "swiper-button-hidden",
            lockClass: "swiper-button-lock",
            navigationDisabledClass: "swiper-navigation-disabled"
        },
        pagination: {
            el: null,
            clickable: false,
            bulletClass: "swiper-pagination-bullet",
            bulletActiveClass: "swiper-pagination-bullet-active",
            hiddenClass: "swiper-pagination-hidden",
            modifierClass: "swiper-pagination-",
            renderBullet: null,
            renderCustom: null
        }
    });

    a.navigation = { nextEl: null, prevEl: null };
    a.pagination = { el: null };

    // Utility function to resolve elements
    function r(n) {
        let e;
        return n && typeof n == "string" && a.isElement && (e = a.el.querySelector(n) || a.hostEl.querySelector(n), e)
            ? e
            : (n && (typeof n == "string" && (e = [...document.querySelectorAll(n)]),
                a.params.uniqueNavElements && typeof n == "string" && e && e.length > 1 && a.el.querySelectorAll(n).length === 1 ? e = a.el.querySelector(n) : e && e.length === 1 && (e = e[0])),
                n && !e ? n : e);
    }

    function u(n, e) {
        const t = a.params.navigation;
        n = c(n);
        n.forEach(i => {
            if (!i) return;
            i.classList[e ? "add" : "remove"](...t.disabledClass.split(" "));
            if (i.tagName === "BUTTON") i.disabled = e;
            if (a.params.watchOverflow && a.enabled) {
                i.classList[a.isLocked ? "add" : "remove"](t.lockClass);
            }
        });
    }

    function v() {
        const { nextEl: n, prevEl: e } = a.navigation;
        if (a.params.loop) {
            u(e, false);
            u(n, false);
            return;
        }
        u(e, a.isBeginning && !a.params.rewind);
        u(n, a.isEnd && !a.params.rewind);
    }

    function b(n) {
        n.preventDefault();
        if (a.isBeginning && !a.params.loop && !a.params.rewind) return;
        a.slidePrev();
        l("navigationPrev");
    }

    function x(n) {
        n.preventDefault();
        if (a.isEnd && !a.params.loop && !a.params.rewind) return;
        a.slideNext();
        l("navigationNext");
    }

    function E() {
        const n = a.params.navigation;
        a.params.navigation = N(a, a.originalParams.navigation, a.params.navigation, {
            nextEl: "swiper-button-next",
            prevEl: "swiper-button-prev"
        });

        if (!(n.nextEl || n.prevEl)) return;

        let e = r(n.nextEl),
            t = r(n.prevEl);

        Object.assign(a.navigation, { nextEl: e, prevEl: t });

        e = c(e);
        t = c(t);

        const i = (s, m) => {
            if (!s) return;
            s.addEventListener("click", m === "next" ? x : b);
            if (!a.enabled) s.classList.add(...n.lockClass.split(" "));
        };

        e.forEach(s => i(s, "next"));
        t.forEach(s => i(s, "prev"));
    }

    function h() {
        let { nextEl: n, prevEl: e } = a.navigation;
        n = c(n);
        e = c(e);
        const t = (i, s) => {
            i.removeEventListener("click", s === "next" ? x : b);
            i.classList.remove(...a.params.navigation.disabledClass.split(" "));
        };
        n.forEach(i => t(i, "next"));
        e.forEach(i => t(i, "prev"));
    }

    // 🟩 PAGINATION LOGIC STARTS HERE
    function initPagination() {
        const p = a.params.pagination;
        if (!p.el) return;

        // console.log("before p.el",p.el);
        let el = r(p.el);
        // console.log("before el",el);
        // if(typeof el == "object") el = el[0];
        // console.log("Pagination element resolved to:", el); 
        if (!el) return;

        a.pagination.el = el;

        if (p.clickable) {
            // console.log("el",el);
            el.classList.add(p.modifierClass + "clickable");
            el.addEventListener("click", (e) => {
                const target = e.target.closest("." + p.bulletClass);
                if (!target) return;
                const bullets = [...el.querySelectorAll("." + p.bulletClass)];
                const index = bullets.indexOf(target);
                if (index >= 0) a.slideTo(index);
            });
        }

        updatePagination();
    }

    function updatePagination() {
        const p = a.params.pagination;
        const el = a.pagination.el;
        if (!el || !p.el) return;

        // Clear previous bullets
        el.innerHTML = "";

        for (let i = 0; i < a.slides.length; i++) {
            const bullet = document.createElement("span");
            bullet.className = p.bulletClass + (i === a.activeIndex ? " " + p.bulletActiveClass : "");
            bullet.setAttribute("data-index", i);
            el.appendChild(bullet);
        }
    }

    function destroyPagination() {
        const p = a.params.pagination;
        const el = a.pagination.el;
        if (!el || !p.el) return;
        el.innerHTML = "";
        if (p.clickable) {
            el.removeEventListener("click", () => {});
        }
    }

    // 🟩 PAGINATION EVENT HOOKS
    o("init", () => {
        if (a.params.navigation.enabled === false) {
            C();
        } else {
            E();
            v();
        }
        initPagination();
    });

    o("toEdge fromEdge lock unlock", () => {
        v();
    });

    o("slideChange", () => {
        updatePagination();
    });

    o("destroy", () => {
        h();
        destroyPagination();
    });

    o("enable disable", () => {
        let { nextEl: n, prevEl: e } = a.navigation;
        n = c(n);
        e = c(e);
        if (a.enabled) {
            v();
            return;
        }
        [...n, ...e].filter(t => !!t).forEach(t => t.classList.add(a.params.navigation.lockClass));
    });

    o("click", (n, e) => {

        console.log("e.target",e.target);
        let { nextEl: t, prevEl: i } = a.navigation;
        t = c(t);
        i = c(i);
        console.log("e.target",e.target);
        
        // if(e.target){
        const s = e.target ? e.target : null;
        let m = i.includes(s) || t.includes(s);
        if (a.isElement && !m) {
            const p = e.path || (e.composedPath && e.composedPath());
            if (p) m = p.find(f => t.includes(f) || i.includes(f));
        }

        if (a.params.navigation.hideOnClick && !m) {
            if (a.pagination && a.params.pagination && a.params.pagination.clickable && (a.pagination.el === s || a.pagination.el.contains(s))) return;
            let p;
            t.length ? p = t[0].classList.contains(a.params.navigation.hiddenClass)
                : i.length && (p = i[0].classList.contains(a.params.navigation.hiddenClass));
            l(p === true ? "navigationShow" : "navigationHide");
            [...t, ...i].filter(f => !!f).forEach(f => f.classList.toggle(a.params.navigation.hiddenClass));
        }
        // }
    });

    const L = () => {
        a.el.classList.remove(...a.params.navigation.navigationDisabledClass.split(" "));
        E();
        v();
        initPagination();
    };

    const C = () => {
        a.el.classList.add(...a.params.navigation.navigationDisabledClass.split(" "));
        h();
        destroyPagination();
    };

    Object.assign(a.navigation, { enable: L, disable: C, update: v, init: E, destroy: h });
    Object.assign(a.pagination, { update: updatePagination, init: initPagination, destroy: destroyPagination });
}

export { O as N };