import { g as O, S as z } from "./swiper-core.js";
import { N as H } from "./navigation.js";
import { inner as B, bp as C } from "./variables.js";
import "./script.js";
function G(y) {
    let { swiper: e, extendParams: T, on: i, emit: r, params: u } = y;
    (e.autoplay = { running: !1, paused: !1, timeLeft: 0 }), T({ autoplay: { enabled: !1, delay: 3e3, waitForTransition: !0, disableOnInteraction: !1, stopOnLastSlide: !1, reverseDirection: !1, pauseOnMouseEnter: !1 } });
    let m,
        b,
        S = u && u.autoplay ? u.autoplay.delay : 3e3,
        g = u && u.autoplay ? u.autoplay.delay : 3e3,
        n,
        f = new Date().getTime(),
        h,
        E,
        p,
        M,
        L,
        o,
        D;
    function I(t) {
        !e || e.destroyed || !e.wrapperEl || (t.target === e.wrapperEl && (e.wrapperEl.removeEventListener("transitionend", I), !(D || (t.detail && t.detail.bySwiperTouchMove)) && l()));
    }
    const P = () => {
            if (e.destroyed || !e.autoplay.running) return;
            e.autoplay.paused ? (h = !0) : h && ((g = n), (h = !1));
            const t = e.autoplay.paused ? n : f + g - new Date().getTime();
            (e.autoplay.timeLeft = t),
                r("autoplayTimeLeft", t, t / S),
                (b = requestAnimationFrame(() => {
                    P();
                }));
        },
        V = () => {
            let t;
            return e.virtual && e.params.virtual.enabled ? (t = e.slides.filter(a => a.classList.contains("swiper-slide-active"))[0]) : (t = e.slides[e.activeIndex]), t ? parseInt(t.getAttribute("data-swiper-autoplay"), 10) : void 0;
        },
        w = t => {
            if (e.destroyed || !e.autoplay.running) return;
            cancelAnimationFrame(b), P();
            let s = typeof t > "u" ? e.params.autoplay.delay : t;
            (S = e.params.autoplay.delay), (g = e.params.autoplay.delay);
            const a = V();
            !Number.isNaN(a) && a > 0 && typeof t > "u" && ((s = a), (S = a), (g = a)), (n = s);
            const v = e.params.speed,
                q = () => {
                    !e ||
                        e.destroyed ||
                        (e.params.autoplay.reverseDirection ? (!e.isBeginning || e.params.loop || e.params.rewind ? (e.slidePrev(v, !0, !0), r("autoplay")) : e.params.autoplay.stopOnLastSlide || (e.slideTo(e.slides.length - 1, v, !0, !0), r("autoplay"))) : !e.isEnd || e.params.loop || e.params.rewind ? (e.slideNext(v, !0, !0), r("autoplay")) : e.params.autoplay.stopOnLastSlide || (e.slideTo(0, v, !0, !0), r("autoplay")),
                        e.params.cssMode &&
                            ((f = new Date().getTime()),
                            requestAnimationFrame(() => {
                                w();
                            })));
                };
            return (
                s > 0
                    ? (clearTimeout(m),
                      (m = setTimeout(() => {
                          q();
                      }, s)))
                    : requestAnimationFrame(() => {
                          q();
                      }),
                s
            );
        },
        A = () => {
            (f = new Date().getTime()), (e.autoplay.running = !0), w(), r("autoplayStart");
        },
        c = () => {
            (e.autoplay.running = !1), clearTimeout(m), cancelAnimationFrame(b), r("autoplayStop");
        },
        d = (t, s) => {
            if (e.destroyed || !e.autoplay.running) return;
            clearTimeout(m), t || (o = !0);
            const a = () => {
                r("autoplayPause"), e.params.autoplay.waitForTransition ? e.wrapperEl.addEventListener("transitionend", I) : l();
            };
            if (((e.autoplay.paused = !0), s)) {
                L && (n = e.params.autoplay.delay), (L = !1), a();
                return;
            }
            (n = (n || e.params.autoplay.delay) - (new Date().getTime() - f)), !(e.isEnd && n < 0 && !e.params.loop) && (n < 0 && (n = 0), a());
        },
        l = () => {
            (e.isEnd && n < 0 && !e.params.loop) || e.destroyed || !e.autoplay.running || ((f = new Date().getTime()), o ? ((o = !1), w(n)) : w(), (e.autoplay.paused = !1), r("autoplayResume"));
        },
        N = () => {
            if (e.destroyed || !e.autoplay.running) return;
            const t = O();
            t.visibilityState === "hidden" && ((o = !0), d(!0)), t.visibilityState === "visible" && l();
        },
        x = t => {
            t.pointerType === "mouse" && ((o = !0), (D = !0), !(e.animating || e.autoplay.paused) && d(!0));
        },
        F = t => {
            t.pointerType === "mouse" && ((D = !1), e.autoplay.paused && l());
        },
        R = () => {
            e.params.autoplay.pauseOnMouseEnter && (e.el.addEventListener("pointerenter", x), e.el.addEventListener("pointerleave", F));
        },
        _ = () => {
            e.el && typeof e.el != "string" && (e.el.removeEventListener("pointerenter", x), e.el.removeEventListener("pointerleave", F));
        },
        j = () => {
            O().addEventListener("visibilitychange", N);
        },
        k = () => {
            O().removeEventListener("visibilitychange", N);
        };
    i("init", () => {
        e.params.autoplay.enabled && (R(), j(), A());
    }),
        i("destroy", () => {
            _(), k(), e.autoplay.running && c();
        }),
        i("_freeModeStaticRelease", () => {
            (p || o) && l();
        }),
        i("_freeModeNoMomentumRelease", () => {
            e.params.autoplay.disableOnInteraction ? c() : d(!0, !0);
        }),
        i("beforeTransitionStart", (t, s, a) => {
            e.destroyed || !e.autoplay.running || (a || !e.params.autoplay.disableOnInteraction ? d(!0, !0) : c());
        }),
        i("sliderFirstMove", () => {
            if (!(e.destroyed || !e.autoplay.running)) {
                if (e.params.autoplay.disableOnInteraction) {
                    c();
                    return;
                }
                (E = !0),
                    (p = !1),
                    (o = !1),
                    (M = setTimeout(() => {
                        (o = !0), (p = !0), d(!0);
                    }, 200));
            }
        }),
        i("touchEnd", () => {
            if (!(e.destroyed || !e.autoplay.running || !E)) {
                if ((clearTimeout(M), clearTimeout(m), e.params.autoplay.disableOnInteraction)) {
                    (p = !1), (E = !1);
                    return;
                }
                p && e.params.cssMode && l(), (p = !1), (E = !1);
            }
        }),
        i("slideChange", () => {
            e.destroyed || !e.autoplay.running || (L = !0);
        }),
        Object.assign(e.autoplay, { start: A, stop: c, pause: d, resume: l });
}
function W() {
    const y = document.querySelectorAll(".home-slider");
    y == null ||
        y.forEach(e => {
            const T = Number(e.dataset.sliderSpeed);
            e.querySelectorAll(".home-slider > div > .swiper-container").forEach(r => {
                new z(r, { modules: [G, H], navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }, autoplay: { delay: T, disableOnInteraction: !1, pauseOnMouseEnter: !0, reverseDirection: !0 }, loop: !0, slidesPerView: 3, spaceBetween: B.w > C.medium ? 20 : 10, direction: B.w > C.medium ? "horizontal" : "vertical", speed: 800, breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } });
            });
        });
}
export { W as default };
