typeof Object.assign != "function" &&
    Object.defineProperty(Object, "assign", {
        value: function (f, m) {
            if (f == null) throw new TypeError("Cannot convert undefined or null to object");
            for (var g = Object(f), t = 1; t < arguments.length; t++) {
                var i = arguments[t];
                if (i != null) for (var o in i) Object.prototype.hasOwnProperty.call(i, o) && (g[o] = i[o]);
            }
            return g;
        },
        writable: !0,
        configurable: !0,
    });
typeof Array.from != "function" &&
    (Array.from = function (l) {
        return [].slice.call(l);
    });
var E = function (l) {
        var f = document.implementation.createHTMLDocument("");
        return (f.body.innerHTML = l), Array.from(f.body.children)[0];
    },
    u = function (l, f) {
        var m = document.createEvent("HTMLEvents");
        m.initEvent(f, !0, !1), l.dispatchEvent(m);
    },
    T = function () {
        var l = function (t, i) {
                (this.el = t), (this.zoomFactor = 1), (this.lastScale = 1), (this.offset = { x: 0, y: 0 }), (this.initialOffset = { x: 0, y: 0 }), (this.options = Object.assign({}, this.defaults, i)), this.setupMarkup(), this.bindEvents(), this.update(), this.isImageLoaded(this.el) && (this.updateAspectRatio(), this.setupOffsets()), this.enable();
            },
            f = function (t, i) {
                return t + i;
            },
            m = function (t, i) {
                return t > i - 0.01 && t < i + 0.01;
            };
        l.prototype = {
            defaults: { tapZoomFactor: 2, zoomOutFactor: 1.3, animationDuration: 300, maxZoom: 4, minZoom: 0.5, draggableUnzoomed: !0, lockDragAxis: !1, setOffsetsOnce: !1, use2d: !0, zoomStartEventName: "pz_zoomstart", zoomUpdateEventName: "pz_zoomupdate", zoomEndEventName: "pz_zoomend", dragStartEventName: "pz_dragstart", dragUpdateEventName: "pz_dragupdate", dragEndEventName: "pz_dragend", doubleTapEventName: "pz_doubletap", verticalPadding: 0, horizontalPadding: 0, onZoomStart: null, onZoomEnd: null, onZoomUpdate: null, onDragStart: null, onDragEnd: null, onDragUpdate: null, onDoubleTap: null },
            handleDragStart: function (t) {
                u(this.el, this.options.dragStartEventName), typeof this.options.onDragStart == "function" && this.options.onDragStart(this, t), this.stopAnimation(), (this.lastDragPosition = !1), (this.hasInteraction = !0), this.handleDrag(t);
            },
            handleDrag: function (t) {
                var i = this.getTouches(t)[0];
                this.drag(i, this.lastDragPosition), (this.offset = this.sanitizeOffset(this.offset)), (this.lastDragPosition = i);
            },
            handleDragEnd: function () {
                u(this.el, this.options.dragEndEventName), typeof this.options.onDragEnd == "function" && this.options.onDragEnd(this, event), this.end();
            },
            handleZoomStart: function (t) {
                u(this.el, this.options.zoomStartEventName), typeof this.options.onZoomStart == "function" && this.options.onZoomStart(this, t), this.stopAnimation(), (this.lastScale = 1), (this.nthZoom = 0), (this.lastZoomCenter = !1), (this.hasInteraction = !0);
            },
            handleZoom: function (t, i) {
                var o = this.getTouchCenter(this.getTouches(t)),
                    n = i / this.lastScale;
                (this.lastScale = i), (this.nthZoom += 1), this.nthZoom > 3 && (this.scale(n, o), this.drag(o, this.lastZoomCenter)), (this.lastZoomCenter = o);
            },
            handleZoomEnd: function () {
                u(this.el, this.options.zoomEndEventName), typeof this.options.onZoomEnd == "function" && this.options.onZoomEnd(this, event), this.end();
            },
            handleDoubleTap: function (t) {
                var i = this.getTouches(t)[0],
                    o = this.zoomFactor > 1 ? 1 : this.options.tapZoomFactor,
                    n = this.zoomFactor,
                    a = function (s) {
                        this.scaleTo(n + s * (o - n), i);
                    }.bind(this);
                this.hasInteraction || ((this.isDoubleTap = !0), n > o && (i = this.getCurrentZoomCenter()), this.animate(this.options.animationDuration, a, this.swing), u(this.el, this.options.doubleTapEventName), typeof this.options.onDoubleTap == "function" && this.options.onDoubleTap(this, t));
            },
            computeInitialOffset: function () {
                this.initialOffset = { x: -Math.abs(this.el.offsetWidth * this.getInitialZoomFactor() - this.container.offsetWidth) / 2, y: -Math.abs(this.el.offsetHeight * this.getInitialZoomFactor() - this.container.offsetHeight) / 2 };
            },
            resetOffset: function () {
                (this.offset.x = this.initialOffset.x), (this.offset.y = this.initialOffset.y);
            },
            isImageLoaded: function (t) {
                return t.nodeName === "IMG" ? t.complete && t.naturalHeight !== 0 : Array.from(t.querySelectorAll("img")).every(this.isImageLoaded);
            },
            setupOffsets: function () {
                (this.options.setOffsetsOnce && this._isOffsetsSet) || ((this._isOffsetsSet = !0), this.computeInitialOffset(), this.resetOffset());
            },
            sanitizeOffset: function (t) {
                var i = this.el.offsetWidth * this.getInitialZoomFactor() * this.zoomFactor,
                    o = this.el.offsetHeight * this.getInitialZoomFactor() * this.zoomFactor,
                    n = i - this.getContainerX() + this.options.horizontalPadding,
                    a = o - this.getContainerY() + this.options.verticalPadding,
                    s = Math.max(n, 0),
                    h = Math.max(a, 0),
                    c = Math.min(n, 0) - this.options.horizontalPadding,
                    y = Math.min(a, 0) - this.options.verticalPadding;
                return { x: Math.min(Math.max(t.x, c), s), y: Math.min(Math.max(t.y, y), h) };
            },
            scaleTo: function (t, i) {
                this.scale(t / this.zoomFactor, i);
            },
            scale: function (t, i) {
                (t = this.scaleZoomFactor(t)), this.addOffset({ x: (t - 1) * (i.x + this.offset.x), y: (t - 1) * (i.y + this.offset.y) }), u(this.el, this.options.zoomUpdateEventName), typeof this.options.onZoomUpdate == "function" && this.options.onZoomUpdate(this, event);
            },
            scaleZoomFactor: function (t) {
                var i = this.zoomFactor;
                return (this.zoomFactor *= t), (this.zoomFactor = Math.min(this.options.maxZoom, Math.max(this.zoomFactor, this.options.minZoom))), this.zoomFactor / i;
            },
            canDrag: function () {
                return this.options.draggableUnzoomed || !m(this.zoomFactor, 1);
            },
            drag: function (t, i) {
                i && (this.options.lockDragAxis ? (Math.abs(t.x - i.x) > Math.abs(t.y - i.y) ? this.addOffset({ x: -(t.x - i.x), y: 0 }) : this.addOffset({ y: -(t.y - i.y), x: 0 })) : this.addOffset({ y: -(t.y - i.y), x: -(t.x - i.x) }), u(this.el, this.options.dragUpdateEventName), typeof this.options.onDragUpdate == "function" && this.options.onDragUpdate(this, event));
            },
            getTouchCenter: function (t) {
                return this.getVectorAvg(t);
            },
            getVectorAvg: function (t) {
                return {
                    x:
                        t
                            .map(function (i) {
                                return i.x;
                            })
                            .reduce(f) / t.length,
                    y:
                        t
                            .map(function (i) {
                                return i.y;
                            })
                            .reduce(f) / t.length,
                };
            },
            addOffset: function (t) {
                this.offset = { x: this.offset.x + t.x, y: this.offset.y + t.y };
            },
            sanitize: function () {
                this.zoomFactor < this.options.zoomOutFactor ? this.zoomOutAnimation() : this.isInsaneOffset(this.offset) && this.sanitizeOffsetAnimation();
            },
            isInsaneOffset: function (t) {
                var i = this.sanitizeOffset(t);
                return i.x !== t.x || i.y !== t.y;
            },
            sanitizeOffsetAnimation: function () {
                var t = this.sanitizeOffset(this.offset),
                    i = { x: this.offset.x, y: this.offset.y },
                    o = function (n) {
                        (this.offset.x = i.x + n * (t.x - i.x)), (this.offset.y = i.y + n * (t.y - i.y)), this.update();
                    }.bind(this);
                this.animate(this.options.animationDuration, o, this.swing);
            },
            zoomOutAnimation: function () {
                if (this.zoomFactor !== 1) {
                    var t = this.zoomFactor,
                        i = 1,
                        o = this.getCurrentZoomCenter(),
                        n = function (a) {
                            this.scaleTo(t + a * (i - t), o);
                        }.bind(this);
                    this.animate(this.options.animationDuration, n, this.swing);
                }
            },
            updateAspectRatio: function () {
                this.unsetContainerY(), this.setContainerY(this.container.parentElement.offsetHeight);
            },
            getInitialZoomFactor: function () {
                var t = this.container.offsetWidth / this.el.offsetWidth,
                    i = this.container.offsetHeight / this.el.offsetHeight;
                return Math.min(t, i);
            },
            getAspectRatio: function () {
                return this.el.offsetWidth / this.el.offsetHeight;
            },
            getCurrentZoomCenter: function () {
                var t = this.offset.x - this.initialOffset.x,
                    i = -1 * this.offset.x - t / (1 / this.zoomFactor - 1),
                    o = this.offset.y - this.initialOffset.y,
                    n = -1 * this.offset.y - o / (1 / this.zoomFactor - 1);
                return { x: i, y: n };
            },
            getTouches: function (t) {
                var i = this.container.getBoundingClientRect(),
                    o = document.documentElement.scrollTop || document.body.scrollTop,
                    n = document.documentElement.scrollLeft || document.body.scrollLeft,
                    a = i.top + o,
                    s = i.left + n;
                return Array.prototype.slice.call(t.touches).map(function (h) {
                    return { x: h.pageX - s, y: h.pageY - a };
                });
            },
            animate: function (t, i, o, n) {
                var a = new Date().getTime(),
                    s = function () {
                        if (this.inAnimation) {
                            var h = new Date().getTime() - a,
                                c = h / t;
                            h >= t ? (i(1), n && n(), this.update(), this.stopAnimation(), this.update()) : (o && (c = o(c)), i(c), this.update(), requestAnimationFrame(s));
                        }
                    }.bind(this);
                (this.inAnimation = !0), requestAnimationFrame(s);
            },
            stopAnimation: function () {
                this.inAnimation = !1;
            },
            swing: function (t) {
                return -Math.cos(t * Math.PI) / 2 + 0.5;
            },
            getContainerX: function () {
                return this.container.offsetWidth;
            },
            getContainerY: function () {
                return this.container.offsetHeight;
            },
            setContainerY: function (t) {
                return (this.container.style.height = t + "px");
            },
            unsetContainerY: function () {
                this.container.style.height = null;
            },
            setupMarkup: function () {
                (this.container = E('<div class="pinch-zoom-container"></div>')), this.el.parentNode.insertBefore(this.container, this.el), this.container.appendChild(this.el), (this.container.style.overflow = "hidden"), (this.container.style.position = "relative"), (this.el.style.webkitTransformOrigin = "0% 0%"), (this.el.style.mozTransformOrigin = "0% 0%"), (this.el.style.msTransformOrigin = "0% 0%"), (this.el.style.oTransformOrigin = "0% 0%"), (this.el.style.transformOrigin = "0% 0%"), (this.el.style.position = "absolute");
            },
            end: function () {
                (this.hasInteraction = !1), this.sanitize(), this.update();
            },
            bindEvents: function () {
                var t = this;
                g(this.container, this),
                    (this.resizeHandler = this.update.bind(this)),
                    window.addEventListener("resize", this.resizeHandler),
                    Array.from(this.el.querySelectorAll("img")).forEach(function (i) {
                        i.addEventListener("load", t.update.bind(t));
                    }),
                    this.el.nodeName === "IMG" && this.el.addEventListener("load", this.update.bind(this));
            },
            update: function (t) {
                t && t.type === "resize" && (this.updateAspectRatio(), this.setupOffsets()),
                    t && t.type === "load" && (this.updateAspectRatio(), this.setupOffsets()),
                    !this.updatePlanned &&
                        ((this.updatePlanned = !0),
                        window.setTimeout(
                            function () {
                                this.updatePlanned = !1;
                                var i = this.getInitialZoomFactor() * this.zoomFactor,
                                    o = -this.offset.x / i,
                                    n = -this.offset.y / i,
                                    a = "scale3d(" + i + ", " + i + ",1) translate3d(" + o + "px," + n + "px,0px)",
                                    s = "scale(" + i + ", " + i + ") translate(" + o + "px," + n + "px)",
                                    h = function () {
                                        this.clone && (this.clone.parentNode.removeChild(this.clone), delete this.clone);
                                    }.bind(this);
                                !this.options.use2d || this.hasInteraction || this.inAnimation ? ((this.is3d = !0), h(), (this.el.style.webkitTransform = a), (this.el.style.mozTransform = s), (this.el.style.msTransform = s), (this.el.style.oTransform = s), (this.el.style.transform = a)) : (this.is3d && ((this.clone = this.el.cloneNode(!0)), (this.clone.style.pointerEvents = "none"), this.container.appendChild(this.clone), window.setTimeout(h, 200)), (this.el.style.webkitTransform = s), (this.el.style.mozTransform = s), (this.el.style.msTransform = s), (this.el.style.oTransform = s), (this.el.style.transform = s), (this.is3d = !1));
                            }.bind(this),
                            0
                        ));
            },
            enable: function () {
                this.enabled = !0;
            },
            disable: function () {
                this.enabled = !1;
            },
            destroy: function () {
                window.removeEventListener("resize", this.resizeHandler), this.container && (this.container.remove(), (this.container = null));
            },
        };
        var g = function (t, i) {
            var o = null,
                n = 0,
                a = null,
                s = null,
                h = function (e, r) {
                    if (o !== e) {
                        if (o && !e)
                            switch (o) {
                                case "zoom":
                                    i.handleZoomEnd(r);
                                    break;
                                case "drag":
                                    i.handleDragEnd(r);
                                    break;
                            }
                        switch (e) {
                            case "zoom":
                                i.handleZoomStart(r);
                                break;
                            case "drag":
                                i.handleDragStart(r);
                                break;
                        }
                    }
                    o = e;
                },
                c = function (e) {
                    n === 2 ? h("zoom") : n === 1 && i.canDrag() ? h("drag", e) : h(null, e);
                },
                y = function (e) {
                    return Array.from(e).map(function (r) {
                        return { x: r.pageX, y: r.pageY };
                    });
                },
                b = function (e, r) {
                    var d, p;
                    return (d = e.x - r.x), (p = e.y - r.y), Math.sqrt(d * d + p * p);
                },
                O = function (e, r) {
                    var d = b(e[0], e[1]),
                        p = b(r[0], r[1]);
                    return p / d;
                },
                v = function (e) {
                    e.stopPropagation(), e.preventDefault();
                },
                x = function (e) {
                    var r = new Date().getTime();
                    if ((n > 1 && (a = null), r - a < 300))
                        switch ((v(e), i.handleDoubleTap(e), o)) {
                            case "zoom":
                                i.handleZoomEnd(e);
                                break;
                            case "drag":
                                i.handleDragEnd(e);
                                break;
                        }
                    else i.isDoubleTap = !1;
                    n === 1 && (a = r);
                },
                z = !0;
            t.addEventListener(
                "touchstart",
                function (e) {
                    i.enabled && ((z = !0), (n = e.touches.length), x(e));
                },
                { passive: !1 }
            ),
                t.addEventListener(
                    "touchmove",
                    function (e) {
                        if (i.enabled && !i.isDoubleTap) {
                            if (z) c(e), o && v(e), (s = y(e.touches));
                            else {
                                switch (o) {
                                    case "zoom":
                                        s.length == 2 && e.touches.length == 2 && i.handleZoom(e, O(s, y(e.touches)));
                                        break;
                                    case "drag":
                                        i.handleDrag(e);
                                        break;
                                }
                                o && (v(e), i.update());
                            }
                            z = !1;
                        }
                    },
                    { passive: !1 }
                ),
                t.addEventListener("touchend", function (e) {
                    i.enabled && ((n = e.touches.length), c(e));
                });
        };
        return l;
    },
    Z = T();
function D() {
    document.querySelectorAll(".product .zoom-element").forEach(l => {
        const f = l.querySelector("img");
        f && new Z(f);
    });
}
export { D as default };
