// function B(){const h=document.getElementById("filter-trigger-button"),d=document.getElementById("filter-panels-container"),l=document.getElementById("secondary-filter-panel"),b=document.getElementById("secondary-panel-title"),k=document.querySelectorAll("#main-filter-panel .filter-panel__item"),c=document.querySelectorAll(".filter-panel__list__group"),u=document.getElementById("back-button"),v=document.getElementById("close-button"),i=document.getElementById("main-clear-button"),y=document.getElementById("main-view-button"),a=document.getElementById("secondary-clear-button"),g=document.getElementById("secondary-view-button");let r=null;const m={},f=()=>{const e=Array.from(c).some(t=>t.querySelector(".filter-panel__item.selected"));i&&(i.disabled=!e,i.classList.toggle("enabled",e)),a&&(a.disabled=!e,a.classList.toggle("enabled",e))},L=()=>{d==null||d.classList.remove("open"),l==null||l.classList.remove("open"),r=null,c==null||c.forEach(e=>{e.style.display="none"}),f()},S=()=>{const e=new URL(window.location.href),t=e.searchParams,n=[];t.forEach((s,o)=>{o.startsWith("filter.v.t.shopify.")&&n.push(o)}),n.forEach(s=>t.delete(s)),e.search=t.toString(),window.history.replaceState({},"",e),Object.keys(m).forEach(s=>delete m[s]),c==null||c.forEach(s=>{Array.from(s.children).forEach(o=>{o.classList.remove("selected")})}),f()},w=e=>{if(!b||!a)return;b.textContent=e,c==null||c.forEach(n=>{n.style.display="none"});const t=document.getElementById(`options-${e}`);if(t){if(t.style.display="block",f(),m[e]){const n=t.querySelector(`[data-value="${m[e]}"]`);n&&(n.classList.add("selected"),f())}Array.from(t.children).forEach(n=>{var E;const s=n,o=s.cloneNode(!0);(E=s.parentNode)==null||E.replaceChild(o,s),o.addEventListener("click",()=>{Array.from(t.children).forEach(p=>{p.classList.remove("selected")}),o.classList.add("selected"),m[e]=o.dataset.value||"",f()})})}};new URLSearchParams(window.location.search).forEach((e,t)=>{if(t.startsWith("filter.v.t.shopify.")){const n=t.replace("filter.v.t.shopify.","");m[n]=e,c==null||c.forEach(s=>{Array.from(s.children).forEach(o=>{const E=o,p=`filter.v.t.shopify.${n}=`,I=E.dataset.value||"";(I.startsWith(p)?I.slice(p.length):I)===e&&E.classList.add("selected")})})}}),f(),h==null||h.addEventListener("click",()=>{d==null||d.classList.add("open"),l==null||l.classList.remove("open")}),k.forEach(e=>{e.addEventListener("click",()=>{r=e.dataset.group||null,r&&(w(r),l==null||l.classList.add("open"))})}),u==null||u.addEventListener("click",()=>{if(l==null||l.classList.remove("open"),r){const e=document.getElementById(`options-${r}`);e&&(e.style.display="none")}}),v==null||v.addEventListener("click",L),y==null||y.addEventListener("click",L),g==null||g.addEventListener("click",L),a==null||a.addEventListener("click",S),i==null||i.addEventListener("click",S)}export{B as default};
function B() {
    const h = document.getElementById("filter-trigger-button")
      , d = document.getElementById("filter-panels-container")
      , l = document.getElementById("secondary-filter-panel")
      , b = document.getElementById("secondary-panel-title")
      , k = document.querySelectorAll("#main-filter-panel .filter-panel__item")
      , c = document.querySelectorAll(".filter-panel__list__group")
      , u = document.getElementById("back-button")
      , v = document.getElementById("close-button")
      , i = document.getElementById("main-clear-button")
      , y = document.getElementById("main-view-button")
      , a = document.getElementById("secondary-clear-button")
      , g = document.getElementById("secondary-view-button");
    let r = null;
    
    const m = {}
      , f = () => {
        const e = Array.from(c).some(t => t.querySelector(".filter-panel__item.selected"));
        console.log("fffffffff>>>>>",e);
        // price_range_filter();
        i && (i.disabled = !e,
        i.classList.toggle("enabled", e))
        // a && (a.disabled = !e,
        // a.classList.toggle("enabled", e)
        // )

        //Ak custom code
            const hasSortBy = window.location.search.includes('sort_by=');

            let shouldDisable;

            if (e) {
            shouldDisable = false;
            } else {
            shouldDisable = !hasSortBy;
            }

            if (a) {
            a.disabled = shouldDisable;
            a.classList.toggle('enabled', !shouldDisable);
            }
        //Ak custom code
    }
      , L = () => {
        d?.classList.remove("open"),
        l?.classList.remove("open"),
        r = null,
        c?.forEach(e => {
            e.style.display = "none"
        }
        ),
        f()

    }
      , S = () => {
        console.log("S function");
        const e = new URL(window.location.href)
          , t = e.searchParams
          , n = [];
        t.forEach( (s, o) => {
            o.startsWith("filter.v.t.shopify.") && n.push(o)
        }
        ),
        n.forEach(s => t.delete(s)),
        e.search = t.toString(),
        console.log("e>>>>>>>>",e);
        window.history.replaceState({}, "", e),
        Object.keys(m).forEach(s => delete m[s]),
        c?.forEach(s => {
            Array.from(s.children).forEach(o => {
                o.classList.remove("selected")
            }
            )
        }
        ),
        f()
    }
      ,
    // w = e => {
    //     if (!b || !a)
    //         return;
    //     b.textContent = e,
    //     c?.forEach(n => {
    //         n.style.display = "none"
    //     }
    //     );
    //     const t = document.getElementById(`options-${e}`);
    //     if (t) {
    //         if (t.style.display = "block",
    //         f(),
            
    //         m[e]) {
    //             const n = t.querySelector(`[data-value="${m[e]}"]`);
    //             n && (n.classList.add("selected"),
    //             f())
    //         }

    //         Array.from(t.children).forEach(n => {
    //             var E;
    //             const s = n
    //               , o = s.cloneNode(!0);
    //             (E = s.parentNode) == null || E.replaceChild(o, s),
    //             o.addEventListener("click", () => {
    //                 console.log("oooooooooo",o);
    //                 // Array.from(t.children).forEach(p => {
    //                 //     p.classList.remove("selected")
    //                 // }
    //                 // ),
    //                 o.classList.toggle("selected"),
    //                 m[e] = o.dataset.value || "",

    //                 f()
    //             }
    //             )
    //         }
    //         )
    //     }
    // }


    w = e => {
        if (!b || !a) return;

        b.textContent = e;

        c?.forEach(n => {
            n.style.display = "none";
        });
        

        const t = document.getElementById(`options-${e}`);
        if (!t) return;

        t.style.display = "block";
        f();

        //  INIT PRICE FILTER WHEN PANEL OPENS
        // if (e === "price") {
        //     setTimeout(() => {
        //     price_range_filter();
        //     }, 0);
        // }

        if (m[e]) {
            const n = t.querySelector(`[data-value="${m[e]}"]`);
            n && n.classList.add("selected");
        }

        Array.from(t.children).forEach(n => {
            const o = n.cloneNode(true);
            n.parentNode.replaceChild(o, n);

            o.addEventListener("click", () => {
                console.log("oooooooooo",o);

                 


            o.classList.toggle("selected");
            if (o.classList.contains("selected")) {
                 console.log("in ifff");
                 m[e] = o.dataset.value || "";
                    const filter_collection = o.getAttribute("data-filter-cols");
                    console.log("filter_collection:--",filter_collection);

                    // setTimeout(() => {
                    if (filter_collection !== "Price") {
                        const selected_val = o.getAttribute("data-optname");
                        const color_name = o.getAttribute("data-filter-cols");

                        if (!selected_val || !color_name) return;

                        const activeFilters = document.querySelector(".active-filters");
                        if (!activeFilters) return;

                        // check if already exists
                        const alreadyExists = activeFilters.querySelector(
                            `.filter-custm-remove[data-filter="${color_name}"][data-value="${selected_val}"]`
                        );

                        if (alreadyExists) return; //  stop duplicate

                        const li = document.createElement("li");
                        li.innerHTML = `
                            <span data-filter="${color_name}">${selected_val}</span>
                            <a href="javascript:void(0);"
                            class="filter-custm-remove"
                            data-value="${selected_val}"
                            data-filter="${color_name}">✕</a>
                        `;

                        activeFilters.append(li);
                    }
                //   }, 1000);

            } else {
                 delete m[e];   //  IMPORTANT FIX
                 const selected_val = o.getAttribute("data-optname");
                 const color_name = o.getAttribute("data-filter-cols");
                 console.log('yyyyy')
                 document.querySelector(`.filter-custm-remove[data-filter="${color_name}"][data-value="${selected_val}"]`)?.closest("li")?.remove();
            }

            // m[e] = o.dataset.value || "";
            f();
            });
        });
    }

    ;
    new URLSearchParams(window.location.search).forEach( (e, t) => {
        if (t.startsWith("filter.v.t.shopify.")) {
            const n = t.replace("filter.v.t.shopify.", "");
            m[n] = e,
            c?.forEach(s => {
                Array.from(s.children).forEach(o => {
                    const E = o
                      , p = `filter.v.t.shopify.${n}=`
                      , I = E.dataset.value || "";
                    (I.startsWith(p) ? I.slice(p.length) : I) === e && E.classList.add("selected")
                }
                )
            }
            )
        }
    }
    ),
    f(),
    h?.addEventListener("click", () => {
        d?.classList.add("open"),
        l?.classList.remove("open")
    }
    ),
    k.forEach(e => {
        e.addEventListener("click", () => {
            r = e.dataset.group || null,
            r && (w(r),
            l?.classList.add("open"))
        }
        )
    }
    ),
    u?.addEventListener("click", () => {
        if (l?.classList.remove("open"),
        r) {
            const e = document.getElementById(`options-${r}`);
            e && (e.style.display = "none")
        }
    }
    ),
    v?.addEventListener("click", L),
    y?.addEventListener("click", L),
    g?.addEventListener("click", L),
    a?.addEventListener("click", S),
    i?.addEventListener("click", S)
}

window.initFilterPanels = B;
export {B as default};
//# sourceMappingURL=/cdn/shop/t/22/assets/filter-panels.js.map



    function price_range_filter() {
        console.log('hihihi filter');
        const minRange = document.getElementById("Mobile-Filter-price-range-min");
        const maxRange = document.getElementById("Mobile-Filter-price-range-max");
        const minInput = document.getElementById("Mobile-Filter-Price-GTE");
        const maxInput = document.getElementById("Mobile-Filter-Price-LTE");
        const rangeGroup = document.querySelector(".price-range-slider");
        let priceFilterDebounceTimer = null;
    
        if (!minRange || !maxRange || !minInput || !maxInput || !rangeGroup) return;
    
         function submitPriceFilter() {
            const form = document.querySelector("ul .price-filter-form");
                if (form) {
                    form.submit();
                }
            }

        function updateRangeUI() {
            const minValue = parseInt(minRange.value);
            const maxValue = parseInt(maxRange.value);

            const minPercent = (minValue / parseInt(minRange.max)) * 100;
            const maxPercent = (maxValue / parseInt(maxRange.max)) * 100;

            rangeGroup.style.setProperty("--range-min", `${minPercent}%`);
            rangeGroup.style.setProperty("--range-max", `${maxPercent}%`);

            minInput.value = minValue;
            maxInput.value = maxValue;

            minInput.setAttribute('value',minValue);
            maxInput.setAttribute('value',maxValue);
            
            console.log("minValue:--",minValue);
            console.log("maxValue:--",maxValue);

            // AUTO APPLY FILTER
                // clearTimeout(window.priceFilterTimer);
                // window.priceFilterTimer = setTimeout(() => {
                //     submitPriceFilter();
                // }, 400);


                const url = new URL(window.location.href);
                [...url.searchParams.keys()].forEach(key => {
                console.log("key", key);

                if (key.startsWith("filter.v.")) {
                    url.searchParams.delete(key);
                }
                });

                const view_BTN = document.querySelector("#main-view-button, #secondary-view-button");
                if (!view_BTN) return;
                const filterPanels = view_BTN.closest(".filter-panels");
                /* Selected checkbox / swatch filters */
                const selectedItems = filterPanels.querySelectorAll(".filter-panel__item.selected");
                selectedItems.forEach(item => {
                    const value = item.getAttribute("data-value");
                    if (value && value.includes("=")) {
                        const [param, val] = value.split("=");
                        url.searchParams.append(param, decodeURIComponent(val));
                    }
                });

                const price_range_slider = document.querySelector(".price-range-slider");
                if(price_range_slider && price_range_slider.classList.contains('changed')){
                    const minInput = document.getElementById("Mobile-Filter-Price-GTE");
                    const maxInput = document.getElementById("Mobile-Filter-Price-LTE");

                    const mininputname = minInput.getAttribute('name');
                    const maxinputname = maxInput.getAttribute('name');
                    const mininputval = minInput.getAttribute('value');
                    const maxinputval = maxInput.getAttribute('value');

                     url.searchParams.append(mininputname, decodeURIComponent(mininputval));
                     url.searchParams.append(maxinputname, decodeURIComponent(maxinputval));
                     console.log("url",url.toString());
                    //  afterFilterApply(url);
                    clearTimeout(priceFilterDebounceTimer);

                    priceFilterDebounceTimer = setTimeout(() => {
                        afterFilterApply(url);
                    }, 400); //  400ms debounce
                }
                
                


                // const price_range_slider = document.querySelector(".price-range-slider");
                // if(price_range_slider.classList.contains('changed')){
                //     const minInput = document.getElementById("Mobile-Filter-Price-GTE");
                //     const maxInput = document.getElementById("Mobile-Filter-Price-LTE");

                //     const mininputname = minInput.getAttribute('name');
                //     const maxinputname = maxInput.getAttribute('name');
                //     const mininputval = minInput.getAttribute('value');
                //     const maxinputval = maxInput.getAttribute('value');

                //      url.searchParams.append(mininputname, decodeURIComponent(mininputval));
                //      url.searchParams.append(maxinputname, decodeURIComponent(maxinputval));
                // }



            //Ak custom
            const minChanged = Number(minRange.value) > Number(minRange.min);
            const maxChanged = Number(maxRange.value) < Number(maxRange.max);

            if (minChanged || maxChanged) {
            // price range is filtered
                rangeGroup.classList.add('changed');
            }else{
                rangeGroup.classList.remove('changed');
            }
            //End Ak custom
        }

    
        function updateSliders() {
            minRange.value = minInput.value;
            maxRange.value = maxInput.value;
            console.log("update Slider");
            updateRangeUI();
        }
    
        minRange.addEventListener("input", function () {
            if (parseInt(minRange.value) > parseInt(maxRange.value)) {
                minRange.value = maxRange.value;
            }
            updateRangeUI();
            minInput.dispatchEvent(new Event("change"));
        });
    
        maxRange.addEventListener("input", function () {
            if (parseInt(maxRange.value) < parseInt(minRange.value)) {
                maxRange.value = minRange.value;
            }
            updateRangeUI();
            maxInput.dispatchEvent(new Event("change"));
        });
    
        minInput.addEventListener("input", function () {
            if (parseInt(minInput.value) > parseInt(maxInput.value)) {
                minInput.value = maxInput.value;
            }
            updateSliders();
        });
    
        maxInput.addEventListener("input", function () {
            if (parseInt(maxInput.value) < parseInt(minInput.value)) {
                maxInput.value = minInput.value;
            }
            updateSliders();
        });

        minRange.addEventListener("change", updateRangeUI);
        maxRange.addEventListener("change", updateRangeUI);
    
        updateRangeUI(); // Initialize colors on load
    }
    window.initPriceRangeFilter = price_range_filter;
    price_range_filter();


    function afterFilterApply(url) {
    history.replaceState({}, "", url.toString());
    fetch(url.toString())
        .then(response => response.text())
        .then(responseData => {
            const parser = new DOMParser();
            const newHTML = parser.parseFromString(responseData, "text/html");
            const newSectionHTML = newHTML.querySelector("#MainContent section.listing")?.innerHTML;
            // const newSectionFilterHTML = newHTML.querySelector("#MainContent section.listing .filter-panels")?.innerHTML;
            const newSectionFilterHTML = newHTML.querySelector("#MainContent section.filters .filter-panels")?.innerHTML;

            if (newSectionHTML || newSectionFilterHTML) {
                if (newSectionHTML) {
                    document.querySelector("#MainContent section.listing").innerHTML = newSectionHTML;
                }
                if (newSectionFilterHTML) {
                    // document.querySelector("#MainContent section.listing .filter-panels").innerHTML = newSectionFilterHTML;
                    document.querySelector("#MainContent section.filters .filter-panels").innerHTML = newSectionFilterHTML;
                }
                //call function
                window.initFilterPanels?.();
                window.initPriceRangeFilter?.();

            }
        })
        .catch(error => {
            console.error("Filter fetch error:", error);
        });
}