const successfully_ATC_Timing = 4000;

function marameLog(...args) {
  if (window.MARAME_DEBUG) console.log(...args);
}

document.addEventListener("DOMContentLoaded", function () {
    function updateSelectVariant() {
        var option1 = document.querySelector('[data-product-option-index="1"] [type="radio"]:checked')?.value || document.querySelector('[data-product-option-index="1"] select')?.value;
        var option2 = document.querySelector('[data-product-option-index="2"] [type="radio"]:checked')?.value || document.querySelector('[data-product-option-index="2"] select')?.value;
        var option3 = document.querySelector('[data-product-option-index="3"] [type="radio"]:checked')?.value || document.querySelector('[data-product-option-index="3"] select')?.value;

        var selectVariant = [option1, option2, option3].filter(Boolean).join(" / ");

        var selectBox = document.getElementById("product-variants-select");
        if (!selectBox) return;

        var options = selectBox.querySelectorAll("option");
        var variantFound = false;

        options.forEach(function (option) {
            if (option.getAttribute("data-val") === selectVariant) {
                variantFound = true;
                var variantId = option.value;
                selectBox.value = variantId;

                // Update product form hidden inputs
                document.querySelectorAll('.product-form input[name="id"]').forEach(input => {
                    input.value = variantId;
                });

                // Update sticky sidebar variant name
                var sidebar_sticky = document.querySelector(".detail__sidebar__sticky");
                if (sidebar_sticky) {
                    var sidebarVariant = sidebar_sticky.querySelector(".detail__sidebar__sticky__cta__content div p");
                    if (sidebarVariant) sidebarVariant.textContent = option.getAttribute("data-val");
                }

                // Update Add to Cart button
                var addToCartButton = document.querySelector('.product-form button[type="submit"]');
                var stickyAddToCartButton = document.querySelector('.detail__sidebar__sticky .product-form button[type="submit"]');

                if (option.getAttribute("data-variant-available") === "true") {
                    addToCartButton.textContent = "Add to Cart";
                    addToCartButton.disabled = false;
                    stickyAddToCartButton.textContent = "Add to Cart";
                    stickyAddToCartButton.disabled = false;
                } else {
                    addToCartButton.textContent = "Sold Out";
                    addToCartButton.disabled = true;
                    stickyAddToCartButton.textContent = "Sold Out";
                    stickyAddToCartButton.disabled = true;
                }

                // Update URL
                var newUrl = window.location.origin + window.location.pathname + "?variant=" + variantId;
                window.history.replaceState(null, "", newUrl);
            }
        });

        if (!variantFound) {
            var addToCartButton = document.querySelector('.product-form button[type="submit"]');
            var stickyAddToCartButton = document.querySelector('.detail__sidebar__sticky .product-form button[type="submit"]');

            if (addToCartButton) {
                addToCartButton.textContent = "Unavailable";
                addToCartButton.disabled = true;
                stickyAddToCartButton.textContent = "Unavailable";
                stickyAddToCartButton.disabled = true;
            }
        }
    }

    function updateSelectedOptionText(event) {
        var selectedText = event.target.closest(".purchase-cta")?.querySelector(".selected-option");
        if (selectedText) {
            selectedText.textContent = event.target.value;
        }
    }

    // Attach event listeners to variant selectors
    document.querySelectorAll("[data-product-option-index]").forEach(element => {
        element.addEventListener("change", function (event) {
            updateSelectVariant();
            updateSelectedOptionText(event);
        });
    });

    // Ensure the correct variant is selected on page load
    updateSelectVariant();

    // My details page JS
    const genderSelect = document.getElementById("gender");
    const cupSizeGroup = document.getElementById("cup-size-group");
    const form = document.getElementById("details-form");
    const successMessageDetails = document.getElementById("success-message-details");
    const shopifyStore = "marame-mcstaging.myshopify.com";
    const accessToken = "";

    // Toggle cup size field based on gender selection
    if (cupSizeGroup) {
        function toggleCupSize() {
            cupSizeGroup.style.display = genderSelect.value === "male" ? "none" : "flex";
        }
        toggleCupSize();
        genderSelect.addEventListener("change", toggleCupSize);
    }
    if (form) {
        form.addEventListener("submit", saveCustomerDetails);
    }

    async function saveCustomerDetails(event) {
        event.preventDefault();
        const form = event.target;
        const customerId = form.getAttribute("data-customer-id");
        const metafields = [
            { namespace: "custom", key: "gender", value: document.getElementById("gender")?.value || "", type: "single_line_text_field" },
            { namespace: "custom", key: "size_tops", value: document.getElementById("size_tops")?.value || "", type: "single_line_text_field" },
            { namespace: "custom", key: "size_bottoms", value: document.getElementById("size_bottoms")?.value || "", type: "single_line_text_field" },
            { namespace: "custom", key: "cup_size", value: document.getElementById("cup_size")?.value || "", type: "single_line_text_field" },
            { namespace: "custom", key: "size_shoes", value: document.getElementById("size_shoes")?.value || "", type: "single_line_text_field" },
        ];

        try {
            await Promise.all(
                metafields.map(async metafield => {
                    const response = await fetch(`https://${shopifyStore}/admin/api/2023-10/customers/${customerId}/metafields.json`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Shopify-Access-Token": accessToken,
                        },
                        body: JSON.stringify({ metafield }),
                    });
                    const result = await response.json();
                    if (result.errors) {
                        console.error("Metafield update error:", result.errors);
                    }
                })
            );

            // Show success message dynamically
            successMessageDetails.innerText = "Your details have been saved successfully!";
            successMessageDetails.style.display = "block";

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessageDetails.style.display = "none";
            }, 5000);
        } catch (error) {
            console.error("Error updating metafields:", error);
        }
    }

    function initPasswordInputToggle() {
        const passwordFields = document.querySelectorAll(".field--password");

        passwordFields?.forEach(passwordField => {
            const passwordInput = passwordField?.querySelector("input");
            const passwordToggle = passwordField?.querySelector(".password-toggle");

            if (!passwordInput || !passwordToggle) return;

            passwordToggle?.addEventListener("click", function () {
                if (passwordInput.type === "password") {
                    passwordInput.type = "text";
                    passwordToggle.classList.add("hide-password");
                } else {
                    passwordInput.type = "password";
                    passwordToggle.classList.remove("hide-password");
                }
            });
        });
    }

    initPasswordInputToggle();

    function initOrderHistoryTableArrowToggle() {
        const orderHistoryMblArrowBtns = document.querySelectorAll(".order-history tbody .mbl-arrow");

        orderHistoryMblArrowBtns?.forEach(btn => {
            btn?.addEventListener("click", function () {
                this.classList.toggle("active");

                const parentRow = this.parentElement;

                const cells = Array.from(parentRow.cells);

                const clickedIndex = cells.indexOf(this);

                for (let i = clickedIndex + 1; i < cells.length; i++) {
                    cells[i].classList.toggle("active");
                }
            });
        });
    }

    initOrderHistoryTableArrowToggle();
});

// CWI CODE N
function product_grid_size_option() {
    marameLog("product_grid_size_option");
    document.querySelectorAll(".product--grid--main .size-select__options .option").forEach(function (single_size_option) {
        single_size_option.addEventListener("click", function () {
            marameLog("grid size clicked");
            if(this.classList.contains("option--out-of-stock")){
                marameLog("OOS");
                //successfully_ATC
                this.closest(`.product--grid--main`).querySelector(`.pro-card-notify_me`)?.classList.remove("hidden");
                setTimeout(() => {
                    this.closest(`.product--grid--main`).querySelector(`.pro-card-notify_me`)?.classList.add("hidden");
                },1500);
            }else{
                var gridVariantID = parseInt(this.getAttribute("data_variant_id"));
                this.closest(".product--grid--main").querySelector("form.form input[name='id']").value = gridVariantID;
                this.closest(".product--grid--main").querySelector(".atc_JS").removeAttribute("disabled");
                if (this.closest(".product--grid--main").querySelector(".atc_JS small")) {
                    if (this.classList.contains("option--out-of-stock")) {
                        this.closest(".product--grid--main").querySelector(".atc_JS small").innerHTML = window.variantStrings.notify_btn_text;
                    } else {
                        // this.closest(".product--grid--main").querySelector(".atc_JS small").innerHTML = window.variantStrings.quick_ATC_text;
                        this.closest(".product--grid--main").querySelector(".atc_JS small").innerHTML = window.variantStrings.addToCart;
                    }
                }
                setTimeout(() => {
                    this.closest(`.product--grid--main`).querySelector(`.atc_JS`).click();
                },500);
            }
        });
    });

    document.querySelectorAll(".product--grid--main .pro-card-notify_me-btn").forEach(function (notifyMe) {
        notifyMe.addEventListener("click", function (e) {
            e.preventDefault();
            this.closest(`.product--grid--main`).querySelector(`.atc_JS`).click();
        });
    });

    document.querySelectorAll(".product--grid--main .size_option_not_available button").forEach(function (size_option_not_available_btn) {
        size_option_not_available_btn.addEventListener("click", function () {
            this.closest(".product--grid--main").querySelector(".atc_JS").click();
        });
    });

    // setTimeout(function () {
    //     document.querySelectorAll(".lookbook-product__content__details__item__sizes .size-select__options").forEach(function (single_size_options) {
    //         if (single_size_options.querySelector(".option:not(.option--out-of-stock)")) {
    //             single_size_options.querySelector(".option:not(.option--out-of-stock)").click();
    //         }
    //     });
    // }, 100);
}

function product_grid_ATC() {
    document.querySelectorAll(".product--grid--main .atc_JS").forEach(function (atc_JS) {
        atc_JS.addEventListener("click", function (event) {
            marameLog("atc_JS",atc_JS);
            event.preventDefault();

            if (this.closest(".product--grid--main").querySelector(".size-select__options.product_not_available") || this.closest(".product--grid--main").querySelector(".size-select__options .option.option--out-of-stock.active")) {
                if (this.closest(".product--grid--main").querySelector("form.form .klaviyo-bis-trigger")) {
                    this.closest(".product--grid--main").querySelector("form.form .klaviyo-bis-trigger").click();
                }
            } else {
                if (!this.hasAttribute("disabled")) {
                    if (this.closest(".product--grid--main").querySelector(".size-select__options .option.option--out-of-stock.active")) {
                        return;
                    }
                    var form = this.closest(".product--grid--main").querySelector("form.form");
                    if (!form) return;
                    cart_add_fetch(form);
                } else {
                    if (this.closest(".product--grid--main").querySelector(".size-select__options .option")) {
                        var successfullyATC = this.closest(".product--grid--main").querySelector(".successfully_ATC");
                        if (successfullyATC) {
                            successfullyATC.innerHTML = "SELECT A SIZE";
                            setTimeout(() => {
                                successfullyATC.innerHTML = "";
                            }, successfully_ATC_Timing);
                        }
                    }
                    return false;
                }
            }
        });
    });

    // temp-atc-btn
    document.querySelectorAll(".addtocart_form_submit-temp").forEach(function (tempATC) {
        tempATC.addEventListener("click", function (event) {
            marameLog("tempATC",tempATC);
            event.preventDefault();
            if (this.closest(".detail__sidebar__content").querySelector(".size-select__options .option.option--out-of-stock.active")) {
                // if(document.querySelector(".addtocart_form_submit")) document.querySelector(".addtocart_form_submit").click();
                if(document.querySelector(".detail__sidebar__content form.form .klaviyo-bis-trigger")) document.querySelector(".detail__sidebar__content form.form .klaviyo-bis-trigger").click();
            }

            document.querySelectorAll(`[data-pro-custom-select]`).forEach(cs => {
                let activeLen = cs.querySelectorAll(`.pro-custom-select-list li.active`).length;
                if(activeLen == 0){
                    cs.classList.add("select-alert");
                }
            });

        });
    });
}

function check_size_option() {
    setTimeout(() => {
        document.querySelectorAll(".product--grid--main .size-select__options").forEach(function (options_wrapper) {
            if (!options_wrapper.querySelector(".option")) {
                options_wrapper.closest(".product--grid--main").querySelector(".atc_JS").removeAttribute("disabled");
            }
            // if (options_wrapper.querySelector(".option.active")) {
            //     options_wrapper.closest(".product--grid--main").querySelector(".atc_JS").setAttribute("disabled", true);
            //     options_wrapper.closest(".product--grid--main").querySelector(".option").classList.remove("active");
            // }
        });
    }, 500);
}

check_size_option();

function cart_add_fetch(form) {
    marameLog("cart_add_fetch>>>>>>>>>>>",form);
    var formData = new FormData(form);

    fetch("/cart/add.js", {
        method: "POST",
        body: formData,
    })
        .then(response => {
            return response.json();
        })
        .then(response => {
            fetch(window.Shopify.routes.root + "cart.js", {
                method: "GET",
            })
                .then(cart => {
                    return cart.json();
                })
                .then(cartjson => {
                    var cart_item_count = cartjson.item_count;
                    const cartCountElement = document.querySelector("header.header .header__right__bag .header__right__bag__cart .cart-count");
                    if (cartCountElement) {
                        cartCountElement.innerHTML = cart_item_count;
                        if (cart_item_count >= 10 ) {
                          cartCountElement.classList.add('large-numbers');
                        } else {
                          cartCountElement.classList.remove('large-numbers');
                        }
                    }
                    cart_popup_notification();
                    atc_added_check();
                })
                .catch(error => {
                    console.error("Error:", error);
                });

            if (form.closest(".product--grid--main")) {
                var successfullyATC = form.closest(".product--grid--main").querySelector(".successfully_ATC");
            }
            if (form.closest(".detail__sidebar__content")) {
                var successfullyATC = form.closest(".detail__sidebar__content").querySelector(".successfully_ATC");
            }

            if (successfullyATC) {
                successfullyATC.innerHTML = "ITEM ADDED TO CART";
                setTimeout(() => {
                    successfullyATC.innerHTML = "";
                }, successfully_ATC_Timing);
            }
            if(form.classList.contains("product_page_atc_form")){
                if(document.querySelector(`.addtocart_form_submit-temp`)){
                    document.querySelector(`.addtocart_form_submit-temp`).classList.add("btn--dark");
                    document.querySelector(`.addtocart_form_submit-temp`).classList.remove("notify_me");
                    document.querySelector(`.addtocart_form_submit-temp`).classList.remove("btn--outline");
                    document.querySelector(`.addtocart_form_submit-temp`).innerHTML = `Added to cart`;
                    document.querySelector(`.detail__sidebar__ctas-inner`)?.classList.remove("btn_enabled");
                    setTimeout(() => {
                        document.querySelector(`.detail__sidebar__ctas-inner`)?.classList.add("btn_enabled");
                    },2000);
                }
            }
        })
        .catch(error => {
            console.error("Error:", error);
            if (form.closest(".product--grid--main")) {
                var successfullyATC = form.closest(".product--grid--main").querySelector(".successfully_ATC");
            }
            if (form.closest(".detail__sidebar__content")) {
                var successfullyATC = form.closest(".detail__sidebar__content").querySelector(".successfully_ATC");
            }
            if (successfullyATC) {
                successfullyATC.innerHTML = "ITEM NOT ADDED TO CART";
                setTimeout(() => {
                    successfullyATC.innerHTML = "";
                }, successfully_ATC_Timing);
            }
        });
}

function cart_popup_notification() {
    // console.log("cart_popup_notification>>>>>>>>");
    // if (document.querySelector("header.header .header__right__bag .header__right__bag__list")) {
    //     fetch(window.location.href)
    //         .then(response => {
    //             return response.text();
    //         })
    //         .then(responseData => {
    //             var parser = new DOMParser(),
    //                 new_sortBy_HTML = parser.parseFromString(responseData, "text/html"),
    //                 fetchNewHTML = new_sortBy_HTML.querySelector("header.header .header__right__bag .header__right__bag__list").innerHTML;

    //             document.querySelector("header.header .header__right__bag .header__right__bag__list").innerHTML = fetchNewHTML;

    //             document.querySelector("header.header .header__right__bag").classList.add("bag-active");
    //             setTimeout(() => {
    //                 document.querySelector("header.header .header__right__bag").classList.remove("bag-active");
    //             }, 2500);
    //         })
    //         .catch(error => {
    //             console.error("Fetch error:", error);
    //         });
    // }
    localStorage.sameProductAlertAllow = true;
    document.querySelector("custom-cart-drawer").fetchCartDrawerData();
    // setTimeout(() => {
    //     document.querySelector("custom-cart-drawer").open();
    // },300);
}

function product_variant_default() {
    if (document.querySelector("body.product .shopify-product-form .product_option_selection")) {
        var getProductJSON = JSON.parse(document.querySelector("body.product .shopify-product-form script").innerHTML),
            option_selector_ID = document.querySelector("body.product .shopify-product-form .product_option_selection").getAttribute("id");

        var selectCallback = function (variant, selector) {
            // console.log("variant: ",variant);
            // console.log("selector: ",selector);

            if (variant.featured_media != null) {
                if (document.querySelector(".product .detail__sliders__main-slider.swiper-initialized .swiper-slide[media_id='" + variant.featured_media.id + "']")) {
                    var swiper_index = parseInt(document.querySelector(".product .detail__sliders__main-slider .swiper-slide[media_id='" + variant.featured_media.id + "']").getAttribute("data-swiper-slide-index"));
                    document.querySelector(".product .detail__sliders__main-slider").swiper.slideTo(swiper_index);
                }
            }

            var variant_price = Shopify.formatMoney(variant.price, document.querySelector("body").getAttribute("shop_moneyformat"));

            marameLog("variant_price:--",variant_price);
            

            if (selector.variantIdField.closest(".detail__sidebar__content").querySelector(".detail__sidebar__colors__price h4")) {
                selector.variantIdField
                    .closest(".detail__sidebar__content")
                    .querySelectorAll(".detail__sidebar__colors__price h4")
                    .forEach(function (price_element) {
                        price_element.innerHTML = variant_price;
                    });
            }

            const variant_updatd_price =  document.querySelector(".vari_price");
            if(variant_updatd_price)
            {
                variant_updatd_price.innerHTML= variant_price;
            }

            // document.querySelector(".vari_price").innerHTML = variant_price;

            if (variant.available) {
                selector.variantIdField.closest(".detail__sidebar__content").querySelector(".addtocart_form_submit").innerHTML = window.variantStrings.addToCart;
                selector.variantIdField.closest(".detail__sidebar__content").querySelector(".addtocart_form_submit").classList.remove("disabled");
            } else {
                selector.variantIdField.closest(".detail__sidebar__content").querySelector(".addtocart_form_submit").innerHTML = window.variantStrings.notify_btn_text;
                selector.variantIdField.closest(".detail__sidebar__content").querySelector(".addtocart_form_submit").classList.add("disabled");
            }
        };

        new Shopify.OptionSelectors(option_selector_ID, {
            product: getProductJSON,
            onVariantSelected: selectCallback,
            enableHistoryState: true,
        });

        document.querySelectorAll("body.product .detail__sidebar__content .option, body.product .detail__sidebar__content .c-option").forEach(function (selected_option) {
            selected_option.addEventListener("click", function (event) {
                  marameLog("clickkkk");
                //remove custom select active class
                document.querySelectorAll(`[data-pro-custom-select]`).forEach(select => {
                    select.classList.remove("active");
                });
                // this.closest("[data-pro-custom-select]")?.classList.add("selected");
                this.closest("[data-pro-custom-select]")?.classList.remove("select-alert");
                this.closest("[data-pro-custom-select-list]").querySelector("li.active")?.classList.remove("active");

                if(this.closest("[data-pro-custom-select]")) this.closest("[data-pro-custom-select]").querySelector("[data-pro-custom-select-btn] .s-text").innerHTML = this.innerHTML;
                marameLog("pdp opt clicked");
                if(this.classList.contains("option--out-of-stock") || this.classList.contains("c-option--out-of-stock")){
                    if(document.querySelector(`.addtocart_form_submit-temp`)){
                        document.querySelector(`.addtocart_form_submit-temp`).classList.add("btn--dark");
                        document.querySelector(`.addtocart_form_submit-temp`).classList.add("notify_me");
                        document.querySelector(`.addtocart_form_submit-temp`).classList.remove("btn--outline");
                        // document.querySelector(`.addtocart_form_submit-temp`).innerHTML = `OUT OF STOCK <span>NOTIFY ME</span>`;
                        document.querySelector(`.addtocart_form_submit-temp`).innerHTML = `Add to bag`;
                        document.querySelector(`.detail__sidebar__ctas-inner`)?.classList.remove("btn_enabled");
                    }
                }else{
                    var selected_value = this.getAttribute("data-value"),
                        option_index = this.closest(".option_index").getAttribute("data-option"),
                        select_box = this.closest(".detail__sidebar__content").querySelector(".single-option-selector[data-option='" + option_index + "']");
                    select_box.value = selected_value;
                    select_box.dispatchEvent(new Event("change"));
                    
                    setTimeout(function () {
                     resetFitFabricTextFromVariant();
                    }, 500);
                
                    this.parentElement.querySelectorAll(".option").forEach(function (el) {
                        el.classList.remove("active");
                    });
                    this.classList.add("active");
                    if(document.querySelector(`.addtocart_form_submit-temp`)){
                        document.querySelector(`.addtocart_form_submit-temp`).classList.add("btn--dark");
                        document.querySelector(`.addtocart_form_submit-temp`).classList.remove("btn--outline");
                        document.querySelector(`.addtocart_form_submit-temp`).classList.remove("notify_me");
                        document.querySelector(`.detail__sidebar__ctas-inner`)?.classList.add("btn_enabled");
                    }
                }
            });
            
        });

        document.querySelector("body.product .detail__sidebar__content .addtocart_form_submit").addEventListener("click", function (event) {
            event.preventDefault();
            // detail pdp-hero-section details-gift-card
            if(document.querySelector(`.detail.details-gift-card`)){
                // document.querySelector(".addtocart_form_submit")?.addEventListener("click",function(e){
                    if(!document.querySelector(`.denominations-select .denominations-select__options .option.active`)){
                        event.preventDefault();
                        document.querySelector(".select-value-alert")?.classList.remove("hidden");
                        setTimeout(() => {
                            document.querySelector(".select-value-alert")?.classList.add("hidden");
                        },1500);
                    }else{
                        var form = this.closest(".detail__sidebar__content").querySelector("form.form");
                        // console.log("form",form);
                        // debugger;
                        if (!form) return;
                        cart_add_fetch(form);
                    }
                // });
            }else{
                
                if (this.classList.contains("disabled") && this.closest(".detail__sidebar__content").querySelector("form.shopify-product-form .klaviyo-bis-trigger")) {
                    this.closest(".detail__sidebar__content").querySelector("form.shopify-product-form .klaviyo-bis-trigger").click();
                } else {
                    if (this.closest(".detail__sidebar__content").querySelector(".detail__sidebar__sizes .size-select__options")) {
                        if (!this.closest(".detail__sidebar__content").querySelector(".detail__sidebar__sizes .size-select__options .option.active") && this.closest(".detail__sidebar__content").querySelectorAll(".detail__sidebar__sizes .size-select__options .option").length > 1) {
                            var successfullyATC = this.closest(".detail__sidebar__content").querySelector(".successfully_ATC");
                            if (successfullyATC) {
                                successfullyATC.innerHTML = "SELECT A SIZE";
                                setTimeout(() => {
                                    successfullyATC.innerHTML = "";
                                }, successfully_ATC_Timing);
                            }
                            return;
                        }
                    }
                }
                if (!this.classList.contains("disabled")) {
                    // this.closest(".detail__sidebar__content").querySelector("form.shopify-product-form").submit();

                    var form = this.closest(".detail__sidebar__content").querySelector("form.form");
                    if (!form) return;
                    cart_add_fetch(form);
                }
            }
        });
    }
    productSizeChartState();
}

function resetFitFabricTextFromVariant() {
    const fitFabricWrapper = document.querySelector(".fit-fabric .accordion-content");
    if (!fitFabricWrapper) return;

    fetch(window.location.href)
        .then(function(response) {
            return response.text();
        })
        .then(function(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const updatedContent = doc.querySelector(".fit-fabric .accordion-content");

            if (updatedContent) {
                fitFabricWrapper.innerHTML = updatedContent.innerHTML;
            }
        })
        .catch(function(error) {
            console.error("Fit & Fabric update error:", error);
        });
}

product_variant_default();


function custom_sezerium() {

    if (window.customSezeriumInitialized) return;
    window.customSezeriumInitialized = true;

    //Ak custom code #speed
    // --- perf cache (Change 2) ---
    let _allItemsCache = null;
    let _sezCacheTimer = null;
    let _isMobileCache = window.innerWidth <= 1023;
    window.addEventListener("resize", () => {
        _isMobileCache = window.innerWidth <= 1023;
        _allItemsCache = null;   // viewport changed → rebuild list next time
    });
    //Ak custom code #speed

  // Helper: Wait until Swiper is ready
  function waitForSwiper(swiperEl, callback, retries = 12) {
    const swiper = swiperEl?.swiper;
    if (swiper) return callback(swiper);

    if (retries <= 0) {
      console.warn("Swiper never initialized for", swiperEl);
      return;
    }

    setTimeout(() => waitForSwiper(swiperEl, callback, retries - 1), 200);
  }

  // Helper: Attach swipe only once
  function attachSwipeOnce(swiperEl, swiper) {
    if (swiperEl.dataset.swipeAttached) return;
    swiperEl.dataset.swipeAttached = "true";

    let startX = 0;

    swiperEl.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    swiperEl.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;

      if (Math.abs(diff) < 20) return;

      if (diff < 0) {
        const nextIndex = Math.min(swiper.slides.length - 1, swiper.realIndex + 1);
        swiper.slideTo(nextIndex, 300);
      } else {
        const prevIndex = Math.max(0, swiper.realIndex - 1);
        swiper.slideTo(prevIndex, 300);
      }
    });
  }

    document.addEventListener('sezerium:variant:initialize', (event) => {
    const { el, variant } = event.detail;
    const sez_variantName = variant.option1?.toLowerCase();
    const sez_variantId = parseInt(variant.id, 10);

    setTimeout(() => {
        console.log("variant:--",variant);
      const currentCard = el.closest(".sezerium-product");
      if (!currentCard) return;

      const variantId = parseInt(currentCard.getAttribute("data-sezerium-variant"), 10);
      if (sez_variantId !== variantId) return;

      const swatches = currentCard.querySelectorAll(".single_product_new");
      console.log("swatches:---",swatches);
      if (!swatches.length) return;

      swatches.forEach(swatch => {
        const color = swatch.getAttribute("data-color")?.toLowerCase();

        // Reset all swatches
        swatch.classList.remove("fisrt_swatch", "active");
        swatch.classList.add("hidden");

        // Activate matching swatch
        if (color === sez_variantName) {
          swatch.classList.add("fisrt_swatch", "active");
          swatch.classList.remove("hidden");
         

        // const patternMap = {
        //     "has-metafield": [4, 8, 16],
        //     "has-metafield-3": [15]
        //     };

        //     const listingItem = currentCard.closest(".listing__item");

        //     if (listingItem) {
        //     const allItems = document.querySelectorAll(".listing__item");
        //     const position = Array.from(allItems).indexOf(listingItem) + 1;

        //     // Correct repeating 1–22 cycle
        //     let cyclePosition = position % 21;
        //     if (cyclePosition === 0) cyclePosition = 21;

        //     // Reset classes first (important)
        //     listingItem.classList.remove("has-metafield", "has-metafield-3");

        //     // Apply pattern
        //     Object.entries(patternMap).forEach(([className, positions]) => {
        //         if (positions.includes(cyclePosition)) {
        //         listingItem.classList.add(className);
        //         }
        //     });
        //     }

        const desktopPatternMap = {
            "has-metafield": [4, 8, 16],
            "has-metafield-3": [15]
            };

            const mobilePatternMap = {
            "has-metafield--m": [3, 11, 19, 27],
            "has-metafield-3--m": [8, 16, 24, 32]
            };

            // const listingItem = currentCard.closest(".listing__item");

            // if (!listingItem) return;

            // const allItems = document.querySelectorAll(".listing__item");
            // const position = Array.from(allItems).indexOf(listingItem) + 1;

            // const isMobile = window.innerWidth <= 1023;
            // const cycleSize = isMobile ? 32 : 21;

            //Ak custom code #speed
            const listingItem = currentCard.closest(".listing__item");

            if (!listingItem) return;

            // build the item list ONCE per render burst, reuse for every variant
            if (!_allItemsCache) {
                _allItemsCache = Array.from(document.querySelectorAll(".listing__item"));
                clearTimeout(_sezCacheTimer);
                _sezCacheTimer = setTimeout(() => { _allItemsCache = null; }, 500);
            }
            const position = _allItemsCache.indexOf(listingItem) + 1;

            const isMobile = _isMobileCache;
            const cycleSize = isMobile ? 32 : 21;
            //Ak custom code #speed

            let cyclePosition = position % cycleSize;
            if (cyclePosition === 0) cyclePosition = cycleSize;

            /* 🔥 Reset ALL pattern classes first */
            listingItem.classList.remove(
            "has-metafield",
            "has-metafield-3",
            "has-metafield--m",
            "has-metafield-3--m"
            );

            const activePatternMap = isMobile ? mobilePatternMap : desktopPatternMap;

            Object.entries(activePatternMap).forEach(([className, positions]) => {
                if (positions.includes(cyclePosition)) {
                    listingItem.classList.add(className);
                }
            });

          const get_pro_id = swatch.getAttribute('data-product-id');
          const get_href = swatch.getAttribute('data-href');
          const selectedColor = swatch.getAttribute('data-color');
            console.log("selectedColor:--",selectedColor);
          console.log("get_pro_id:---",get_pro_id);
          const jsonEl = document.querySelector(".variant-images-json[data-product-id='" + get_pro_id + "']");
          console.log("jsonEl:----",jsonEl);
          if (!jsonEl) return;

          const variantImages = JSON.parse(jsonEl.textContent);
          const variantData = Object.values(variantImages).find(v => v.color === selectedColor);
          console.log("variantData:---",variantData);
          if (!variantData || !variantData.images.length) return;

          const filteredVariants = Object.values(variantImages).filter(
            v => v.color && v.color.toLowerCase().trim() === selectedColor
            );

            // get size + inventory
            const sizeInventory = filteredVariants.map(v => ({
            size: v.size,
            qty: Number(v.inventory_quantity) || 0,
            available: v.variant_available
            }));

            
 const comingSoonData = Object.values(variantImages)
    .filter(v => String(v.color).toLowerCase().trim() === String(selectedColor).toLowerCase().trim())
    .map(v => v.coming_soon); 

    console.log("comingSoonData:", comingSoonData);

    const hasComingSoon = comingSoonData.some(value => value);

    if (hasComingSoon) {
        listingItem.setAttribute("data-coming-soon", "true");
    } else {
        listingItem.removeAttribute("data-coming-soon");
    }

            console.log("sizeInventory:--",sizeInventory);

            const sizeItems = currentCard.querySelectorAll(".size_option");
        console.log("sizeItems:--",sizeItems);

               sizeItems.forEach(li => {
        const sizeOpt = li.dataset.sizeOpt;

        const matched = sizeInventory.find(
            v => String(v.size).trim() === String(sizeOpt).trim()
        );

        const qty = matched ? Number(matched.qty || 0) : 0;

        // Reset class first
        li.classList.remove("sold-out");
        li.classList.remove("out-of-stock");
        li.classList.remove("notify-button");

        // Completely rebuild content
        let newHTML = `size - ${sizeOpt}`;

        if (qty <= 0) {
            li.classList.add("sold-out");
             li.classList.add("out-of-stock");
             li.classList.add("notify-button");
            newHTML += `<span class="option--out-of-stock">
                        <a class="button notify-button">Tell me when it’s back
                          <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.25 7.83167V0.25H14.0391V7.83167C14.0391 8.38395 13.5913 8.83167 13.0391 8.83167H1.25C0.697715 8.83167 0.25 8.38395 0.25 7.83167Z" fill="#D9D9D9"/>
                            <path d="M0.25 0.25V7.83167C0.25 8.38395 0.697715 8.83167 1.25 8.83167H13.0391C13.5913 8.83167 14.0391 8.38395 14.0391 7.83167V0.25M0.25 0.25H14.0391M0.25 0.25L6.61615 4.21199C6.93964 4.41332 7.34942 4.41332 7.67291 4.21199L14.0391 0.25" stroke="#2A2A2C" stroke-width="0.5"/>
                          </svg>
                        </a>
                      </span>`;
        } else if (qty <= 3) {
            newHTML += `<div class="low-stock"> only ${qty} left <svg width="21" height="25" viewBox="0 0 21 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.856 11.96H10.28L10.032 9.464V8H11.128V9.464L10.856 11.96ZM11.152 13.696H10V12.584H11.152V13.696Z" fill="#F5ACAC"></path><path d="M9.95117 2.01758C10.1353 1.64848 10.6616 1.64848 10.8457 2.01758L18.2354 16.8311C18.4007 17.1634 18.1584 17.5537 17.7871 17.5537H3.00977C2.63848 17.5537 2.39622 17.1634 2.56152 16.8311L9.95117 2.01758Z" stroke="#F39696"></path></svg></div>`;
        }

        li.innerHTML = newHTML;
        });
         
          const card = swatch.closest(".product-card");
          const swiperEl = card?.querySelector(".product-card__img-new-slider");
          if (!swiperEl) return;

          waitForSwiper(swiperEl, (swiper) => {
            updateSwiperImagesSmooth(swiperEl, swiper, variantData.images, get_href);

            const infoLink = card.querySelector(".product-card__content__infos__deets");
            if (infoLink) infoLink.setAttribute("href", get_href);

            attachSwipeOnce(swiperEl, swiper);
        });
        }
      });
    }, 50);
  });
}

custom_sezerium();

function marameCollectionModeActive() {
    return Boolean(
        document.documentElement.getAttribute("data-template") === "collection" ||
        document.documentElement.hasAttribute("data-marame-collection") ||
        document.querySelector("[data-marame-shuffle='true']")
    );
}

function marameReinitCollectionAfterSectionSwap(options) {
    options = options || {};
    const list = document.querySelector("[data-marame-shuffle='true']");
    if (!list && !marameCollectionModeActive()) return false;

    product_grid_size_option();
    product_grid_ATC();
    load_more_product_JS();
    check_size_option();
    grid_metafield_product();
    grid_option_controls();

    if (list) {
        if (options.preserveOrder) {
            list.dataset.marameShuffleDone = "true";
            list.classList.remove("marame-collection-loading");
            list.classList.add("marame-collection-loaded");

            /* Filtered HTML already has correct tile classes from Liquid — relayout causes jumps. */
            marameFinishNativeCollection(
                [...list.querySelectorAll(":scope > li.listing__item:not(.marame-grid-editor-placeholder)")],
                { skipSliderPreload: true }
            );
        } else {
            const newItems = [
                ...list.querySelectorAll(
                    ":scope > li.listing__item:not(.marame-grid-editor-placeholder)"
                ),
            ];
            list.dataset.marameShuffleDone = "";

            if (window.MarameCollectionGrid?.reinitAfterLoadMore) {
                window.MarameCollectionGrid.reinitAfterLoadMore(newItems, () => {
                    marameFinishNativeCollection(newItems);
                });
            } else {
                marameFinishNativeCollection(newItems);
            }
        }
    } else if (marameCollectionModeActive()) {
        marameFinishNativeCollection();
    }

    window.initFilterPanels?.();
    window.initPriceRangeFilter?.();
    return true;
}

// Collection pages no longer use third-party variant shufflers.

/* Third-party variant shuffler removed (Marame grid only). */

/* ADD THIS HERE START */
function getVariantImagesForColor(variantImages, selectedColor) {
  const color = selectedColor?.toLowerCase()?.trim();
  if (!color) return null;

  const matches = Object.values(variantImages).filter(
    (v) => v.color?.toLowerCase()?.trim() === color
  );
  if (!matches.length) return null;

  const seen = new Set();
  const images = [];
  for (const entry of matches) {
    for (const img of entry.images || []) {
      const id = String(img.id);
      if (!seen.has(id)) {
        seen.add(id);
        images.push(img);
      }
    }
  }

  return images.length ? images : null;
}

function getImagesForVariantId(variantImages, variantId, fallbackColor) {
  const entry =
    variantImages[String(variantId)] ?? variantImages[variantId];
  if (entry?.images?.length) return entry.images;
  return getVariantImagesForColor(variantImages, fallbackColor);
}

function rebuildSliderSlides(swiperEl, images, get_href) {
  const wrapper = swiperEl?.querySelector(".swiper-wrapper");
  if (!wrapper || !images?.length) return;

  const slidePool = new Map();
  wrapper.querySelectorAll(".swiper-slide").forEach((slide) => {
    const id = slide.getAttribute("data_vimg");
    if (id) slidePool.set(String(id), slide);
  });

  const fragment = document.createDocumentFragment();

  images.forEach((img, index) => {
    const id = String(img.id);
    let slide = slidePool.get(id);

    if (slide) {
      slidePool.delete(id);
    } else {
      slide = document.createElement("a");
      slide.className = "product-card__img swiper-slide";
      const imgEl = document.createElement("img");
      imgEl.src = img.src;
      if (img.srcset) imgEl.srcset = img.srcset;
      imgEl.alt = img.alt || "";
      imgEl.sizes = "(max-width: 767px) 100vw, 544px";
      imgEl.loading = index === 0 ? "eager" : "lazy";
      imgEl.decoding = "async";
      if (index === 0) imgEl.setAttribute("fetchpriority", "high");
      slide.appendChild(imgEl);
    }

    slide.href = get_href;
    slide.setAttribute("data_vimg", id);
    slide.setAttribute("data-alt", img.alt || "");
    slide.setAttribute("aria-label", `Read more about ${img.alt || ""}`);
    fragment.appendChild(slide);
  });

  wrapper.replaceChildren(fragment);
}

function updateSwiperImagesSmooth(swiperEl, swiper, images, get_href) {
  if (!swiperEl || !swiper || !images?.length) return;

  rebuildSliderSlides(swiperEl, images, get_href);
  swiper.update();
  swiper.slideTo(0, 0, false);
}

function waitForSwiperPromise(swiperEl, deadline) {
  return new Promise((resolve) => {
    waitForSwiper(swiperEl, resolve, deadline);
  });
}

function attachSwipeOnce(swiperEl, swiper) {
  if (!swiperEl || !swiper) return;
  if (swiperEl.dataset.swipeAttached) return;

  swiperEl.dataset.swipeAttached = "true";

  let startX = 0;

  swiperEl.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  swiperEl.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (Math.abs(diff) < 20) return;

    if (diff < 0) {
      swiper.slideTo(Math.min(swiper.slides.length - 1, swiper.realIndex + 1), 300);
    } else {
      swiper.slideTo(Math.max(0, swiper.realIndex - 1), 300);
    }
  }, { passive: true });
}
/* ADD THIS HERE END */


function custom_change_swatch_image() {

  if (window.customSwatchImageInitialized) return;
  
  window.customSwatchImageInitialized = true;

  document.addEventListener("click", function (e) {
    const el = e.target.closest(".single_product_new.custom_new");
    if (!el) return;

    e.preventDefault();

    const window_width = window.innerWidth;

    if (window_width > 767) {
      const show_desk = el.closest(".meta-color-select")?.querySelector(".total_swatch.show_desk");

      if (show_desk && !show_desk.classList.contains("hidden")) {
        show_desk.click();
      }
    } else {
      const show_mob = el.closest(".meta-color-select")?.querySelector(".total_swatch.show_mobile");
      const mob_drawer = document.querySelector(".color_drawer-main");

      if (show_mob && mob_drawer && !mob_drawer.classList.contains("active")) {
        show_mob.click();
      }
    }

    const colorList = el.closest(".pro-card-colors_list_custom");
    if (colorList) {
      colorList.querySelectorAll(".single_product_new.custom_new").forEach(x => {
        x.classList.remove("active");
      });
    }

    el.classList.add("active");

    const get_pro_id = el.getAttribute("data-product-id");
    const get_href = el.getAttribute("data-href");
    const selectedColor = el.getAttribute("data-color");

    const jsonEl = document.querySelector(`.variant-images-json[data-product-id="${get_pro_id}"]`);
    if (!jsonEl) return;
    

   
    let variantImages;

    try {
      variantImages = JSON.parse(jsonEl.textContent);
    } catch (error) {
      console.error("Variant JSON error:", error);
      return;
    }

    
    const imagesForColor =
      getVariantImagesForColor(variantImages, selectedColor) ||
      Object.values(variantImages).find((v) => {
        return (
          String(v.color).toLowerCase().trim() ===
          String(selectedColor).toLowerCase().trim()
        );
      })?.images;

      

    const variantData = imagesForColor ? { images: imagesForColor } : null;

    const sizeInventory = Object.values(variantImages)
      .filter(v => String(v.color).toLowerCase().trim() === String(selectedColor).toLowerCase().trim())
      .map(v => ({
        size: v.size,
        qty: Number(v.inventory_quantity) || 0,
        title: v.variant_title,
      }));

      const comingSoonData = Object.values(variantImages)
    .filter(v => String(v.color).toLowerCase().trim() === String(selectedColor).toLowerCase().trim())
    .map(v => v.coming_soon); 

    console.log("comingSoonData:", comingSoonData);

    const listingItem = el.closest(".listing__item");


    const hasComingSoon = comingSoonData.some(value => value);

    if (hasComingSoon) {
        listingItem.setAttribute("data-coming-soon", "true");
    } else {
        listingItem.removeAttribute("data-coming-soon");
    }

    if (listingItem) {
      const sizeItems = listingItem.querySelectorAll(".size_option");

      sizeItems.forEach(li => {
        const sizeOpt = li.dataset.sizeOpt;

        const matched = sizeInventory.find(v => {
          return String(v.size).trim() === String(sizeOpt).trim();
        });

        const qty = matched ? Number(matched.qty || 0) : 0;

        li.classList.remove("sold-out", "out-of-stock", "notify-button");

        let newHTML = `size - ${sizeOpt}`;

        if (qty <= 0) {
          li.classList.add("sold-out", "out-of-stock", "notify-button");

          newHTML += `
            <span class="option--out-of-stock">
              <a class="button notify-button">
                Tell me when it’s back
                <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.25 7.83167V0.25H14.0391V7.83167C14.0391 8.38395 13.5913 8.83167 13.0391 8.83167H1.25C0.697715 8.83167 0.25 8.38395 0.25 7.83167Z" fill="#D9D9D9"></path>
                  <path d="M0.25 0.25V7.83167C0.25 8.38395 0.697715 8.83167 1.25 8.83167H13.0391C13.5913 8.83167 14.0391 8.38395 14.0391 7.83167V0.25M0.25 0.25H14.0391M0.25 0.25L6.61615 4.21199C6.93964 4.41332 7.34942 4.41332 7.67291 4.21199L14.0391 0.25" stroke="#2A2A2C" stroke-width="0.5"></path>
                </svg>
              </a>
            </span>
          `;
        } else if (qty <= 3) {
          newHTML += `
            <div class="low-stock">
              only ${qty} left
              <svg width="21" height="25" viewBox="0 0 21 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.856 11.96H10.28L10.032 9.464V8H11.128V9.464L10.856 11.96ZM11.152 13.696H10V12.584H11.152V13.696Z" fill="#F5ACAC"></path>
                <path d="M9.95117 2.01758C10.1353 1.64848 10.6616 1.64848 10.8457 2.01758L18.2354 16.8311C18.4007 17.1634 18.1584 17.5537 17.7871 17.5537H3.00977C2.63848 17.5537 2.39622 17.1634 2.56152 16.8311L9.95117 2.01758Z" stroke="#F39696"></path>
              </svg>
            </div>
          `;
        }

        li.innerHTML = newHTML;
      });
    }

    if (!variantData || !variantData.images || !variantData.images.length) return;

    const card = el.closest(".product-card");
    const swiperEl = card?.querySelector(".product-card__img-new-slider");
    const swiper = swiperEl?.swiper;

    if (!swiperEl || !swiper) {
      console.warn("Swiper instance missing");
      return;
    }

    updateSwiperImagesSmooth(swiperEl, swiper, variantData.images, get_href);
    attachSwipeOnce(swiperEl, swiper);

    const infoLink = card.querySelector(".product-card__content__infos__deets");
    if (infoLink) infoLink.setAttribute("href", get_href);
  });

  document.addEventListener("click", function (e) {
    const el_search = e.target.closest(".search-close");
    if (!el_search) return;

    e.preventDefault();

    const searchWrapper = el_search.closest(".searchbar__input");
    if (searchWrapper) {
      searchWrapper.classList.remove("searchbar__input--active");
    }
  });
}

custom_change_swatch_image();

        // swatch color 
    document.addEventListener("click", function (e) {
        const el = e.target.closest(".total_swatch.show_desk");
        if (!el) return;

        e.preventDefault();

        const wrapper = el.closest(".meta-color-select__options");
        if (!wrapper) return;

        wrapper.querySelectorAll(".single_product_new").forEach(function (item) {
            if(!item.classList.contains("active"))
            {
                item.classList.toggle("hidden");
                item.classList.remove("fisrt_swatch");
            }
        });
        el.classList.toggle("hidden");
    });

    document.addEventListener("click", function (e) {
        const el = e.target.closest(".close_size");
        if (!el) return;

        e.preventDefault();

        marameLog("click on atc button");
        const wrapper = el.closest(".listing__item");
        if (!wrapper) return;

        wrapper.querySelectorAll(".custom_select_size").forEach(function (item) {
            item.classList.toggle("hidden");
        });
    });

    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".atc_btn_custom");
        if (!btn) return;

        e.preventDefault();

        const wrapper = btn.closest(".listing__item");
        if (!wrapper) return;

        const sizeSelect = wrapper.querySelector(".custom_select_size");
        if (!sizeSelect) return;

        // close others
        document.querySelectorAll(".custom_select_size:not(.hidden)").forEach(el => {
            if (el !== sizeSelect) el.classList.add("hidden");
        });

        // toggle current
        sizeSelect.classList.toggle("hidden");
    });


    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".filters_custom");
        if (!btn) return;

        const wrapper = btn.closest(".filters");
        if (!wrapper) return;

        e.preventDefault();

        if (e.target.closest("#secondary-clear-button, #main-clear-button")) {
            marameClearCollectionFilters();
            return;
        }

        if (marameCollectionFiltersActive()) {
            marameClearCollectionFilters();
            return;
        }

        marameToggleFiltersPanel(wrapper);
    });

    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".cloase_filter_cstm");
        if (!btn) return;

        e.preventDefault();

        const wrapper = btn.closest(".filters");
        if (!wrapper) return;

         // close others
        wrapper.querySelectorAll(".filters_data").forEach(el => {
             el.classList.add("hidden");
             if (!document.querySelector("[data-marame-shuffle='true']")) {
               document.querySelector("html").classList.remove("lenis-stopped");
               document.body.removeAttribute("data-lenis-prevent",true);
               document.documentElement.removeAttribute("data-lenis-prevent",true);
             }
        });
    });

function quick_add() {
  document.addEventListener("click", function (e) {

    const sizeItem = e.target.closest(".size_option");
    if (!sizeItem) return;
    
     if (sizeItem.classList.contains("out-of-stock")) {
        e.preventDefault();
        return; // stop selection but allow click detection
        marameLog("hhh");
    }

    const wrapper = sizeItem.closest(".listing__item");
    if (!wrapper) return;

    // selected size variant id
    const sizeVariant = sizeItem.getAttribute("data-size-opt");
    if (!sizeVariant) {
      console.warn("Variant ID not found");
      return;
    }
    sizeItem.classList.add("active");

    // selected color (active swatch)
    const activeColor = wrapper.querySelector(".single_product_new.active");
    const colorVariant = activeColor?.getAttribute("title");
    const productId = activeColor?.getAttribute("data-product-id");

    const color_size = `${colorVariant} / ${sizeVariant}`;

    marameLog("Looking for:", color_size);

    const jsonEl = document.querySelector(
    `.variant-images-json[data-product-id="${productId}"]`
    );
    if (!jsonEl) return;

    const variantJson = JSON.parse(jsonEl.textContent);

    
    const variantData = Object.values(variantJson).find(v =>
    v.variant_title?.trim() === color_size.trim()
    );
    marameLog(variantData.variant_id)
    if (variantData?.variant_id) {
    
    const variantId = variantData.variant_id;                                                   
    const qty = 1 ;

    fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: variantId,
      quantity: qty
    })
    })
  .then(res => res.json())
  .then(response => {
    fetch(window.Shopify.routes.root + "cart.js", {
        method: "GET",
        })
            .then(cart => {
                return cart.json();
            })
            .then(cartjson => {
                var cart_item_count = cartjson.item_count;
                const cartCountElement = document.querySelector("header.header .header__right__bag .header__right__bag__cart .cart-count");
                if (cartCountElement) {
                    cartCountElement.innerHTML = cart_item_count;
                    if (cart_item_count >= 10 ) {
                    cartCountElement.classList.add('large-numbers');
                    } else {
                    cartCountElement.classList.remove('large-numbers');
                    }
                }
                cart_popup_notification();
                atc_added_check();
            })
            .catch(error => {
                console.error("Error:", error);
            });
        
          wrapper.querySelector(".close_size")?.click();
          wrapper.querySelector(".successfully_ATC_new").classList.remove("hidden");
           setTimeout(() => {
            wrapper.querySelector(".successfully_ATC_new").classList.add("hidden");
            wrapper.querySelectorAll(".size_option.active").forEach(el => {
                el.classList.remove("active");
            });
        }, 3000);
      })
     .catch(error => {
              console.error("Error:", error);
     }); 

    }
    
    });
}

function quick_add_pdp() {
  document.addEventListener("click", function (e) {

    const sizeItem = e.target.closest(".size_option");
    if (!sizeItem) return;
    
     if (sizeItem.classList.contains("out-of-stock")) {
        e.preventDefault();
        return; // stop selection but allow click detection
        marameLog("hhh");
    }

    const wrapper = sizeItem.closest(".buy-the-look__content__details__item");
    if (!wrapper) return;

    // selected size variant id
    const sizeVariant = sizeItem.getAttribute("data-size-opt");
    if (!sizeVariant) {
      console.warn("Variant ID not found");
      return;
    }
    sizeItem.classList.add("active");

    // selected color (active swatch)
    // const activeColor = wrapper.querySelector(".buy-the-look__content__details__item");
    const activeColor = wrapper;
    const colorVariant = activeColor?.getAttribute("title");
    const productId = activeColor?.getAttribute("data-product-id");

    const color_size = `${colorVariant} / ${sizeVariant}`;

    marameLog("Looking for pdp:", color_size);

    // const jsonEl = document.querySelector(
    // `.variant-images-json[data-product-id="${productId}"]`
    // );
    // if (!jsonEl) return;

    // const variantJson = JSON.parse(jsonEl.textContent);

    // const variantData = Object.values(variantJson).find(v =>
    // v.variant_title?.trim() === color_size.trim()
    // );
    // console.log(variantData.variant_id)
    // if (variantData?.variant_id) {
    
    const variantId = sizeItem.getAttribute("data-size-var");                                                   
    const qty = 1 ;

    fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: variantId,
      quantity: qty
    })
    })
  .then(res => res.json())
  .then(response => {
    fetch(window.Shopify.routes.root + "cart.js", {
        method: "GET",
        })
            .then(cart => {
                return cart.json();
            })
            .then(cartjson => {
                var cart_item_count = cartjson.item_count;
                const cartCountElement = document.querySelector("header.header .header__right__bag .header__right__bag__cart .cart-count");
                if (cartCountElement) {
                    cartCountElement.innerHTML = cart_item_count;
                    if (cart_item_count >= 10 ) {
                    cartCountElement.classList.add('large-numbers');
                    } else {
                    cartCountElement.classList.remove('large-numbers');
                    }
                }
                cart_popup_notification();
                atc_added_check();
            })
            .catch(error => {
                console.error("Error:", error);
            });
        
          wrapper.querySelector(".close_size")?.click();
          wrapper.querySelector(".successfully_ATC_new").classList.remove("hidden");
           setTimeout(() => {
            wrapper.querySelector(".successfully_ATC_new").classList.add("hidden");
            wrapper.querySelectorAll(".size_option.active").forEach(el => {
                el.classList.remove("active");
            });
        }, 3000);
      })
     .catch(error => {
              console.error("Error:", error);
     }); 

    // }
    
    });
}
quick_add_pdp();
quick_add();
window.addEventListener("load", event => {
    if (document.querySelector("#sort-by-collection-product")) {
        var urlParams = new URLSearchParams(window.location.search),
            sortBy = urlParams.get("sort_by");
        if (sortBy && document.querySelector("#sort-by-collection-product-ts-control div.item")) {
            var matchingOption = document.querySelector("#sort-by-collection-product option[data_sort='" + sortBy + "']").innerText;
            document.querySelector("#sort-by-collection-product-ts-control div.item").innerText = matchingOption;
        }
    }
});

  
    document.addEventListener("click", function (e) {

    //AK custom code
    // console.log('e.target.className',e.target.id)
    if(e.target.id == 'secondary-panel-title'){
        const parent = e.target.closest('.filter-panel__header');
        if(parent){
            const back_btn = parent.querySelector('#back-button');
            marameLog('back_btn',back_btn);
            back_btn.dispatchEvent(
                new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
            );
        }
    }
    if((e.target.tagName == 'SPAN' || e.target.tagName == 'LI') && (e.target.closest('.active-filters'))){
        if(e.target.tagName == 'SPAN'){
            const remove_li = e.target.closest('li');
            if(remove_li){
                const remove_a = remove_li.querySelector('a.filter-custm-remove');
                if(remove_a){
                    remove_a.dispatchEvent(
                        new MouseEvent("click", {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        })
                    );
                }
            }
        }
        if(e.target.tagName == 'LI'){
            const remove_a = e.target.querySelector('a.filter-custm-remove');
            if(remove_a){
                 remove_a.dispatchEvent(
                    new MouseEvent("click", {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    })
                );
            }
        }
    }
    
    //end AK custom code
        
    const btn = e.target.closest(".filter-custm-remove");
    if (!btn) return;
    btn.closest("li").classList.add("hidden");
    marameLog('clicked',btn);

    const selected_filter_value = btn.dataset.value;
    const selected_filter_div = btn.dataset.filter;

    marameLog('selected_filter_div',selected_filter_div)
    marameLog('selected_filter_value',selected_filter_value)
    document.querySelectorAll(`.filter-panel__list__group[data-filter-cols="${selected_filter_div}"]`).forEach(wrapper => {
        const input = wrapper.querySelector(`.filter-panel__item[data-optname="${selected_filter_value}"]`);
        marameLog("input:--",input);
        if (input) {
            
            input.click();
            input.classList.remove('selected');
            
        }
        });
    });

    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".apply_btn_cstm");
        if (!btn) return;
        e.preventDefault();
        const applyBtn =
            document.querySelector("#secondary-view-button") ||
            document.querySelector("[data-filter-action-btn-view]");
        if (applyBtn) {
            applyBtn.click();
            return;
        }
        marameApplyCollectionFilters();
    });




document.addEventListener("change", function (event) {
    const sortSelect = event.target.closest("#sort-by-collection-product");
    if (!sortSelect) return;

    const selectedOption = sortSelect.options[sortSelect.selectedIndex];
    const dataSortValue = selectedOption?.getAttribute("data_sort");
    if (!dataSortValue) return;

    const url = new URL(window.location.href);
    url.searchParams.set("sort_by", dataSortValue);
    history.replaceState({}, "", url.toString());

    fetch(url.toString())
            .then(response => {
                return response.text();
            })
            .then(responseData => {
                var parser = new DOMParser(),
                    new_sortBy_HTML = parser.parseFromString(responseData, "text/html"),
                    listingEl = marameGetCollectionListing(),
                    fetchNewHTML = new_sortBy_HTML.querySelector("#MainContent section.listing")?.innerHTML;

                if (!fetchNewHTML || !listingEl) return;
console.log("fetchNewHTML:--",fetchNewHTML)
                listingEl.innerHTML = fetchNewHTML;

                const closeBtn = document.querySelector(".cloase_filter_cstm");
                  closeBtn?.click();
                
                marameSyncFilterBarFromUrl(url);

                var clear_button = document.querySelectorAll("#main-clear-button,#secondary-clear-button");

                marameLog("clear_button:--",clear_button);
                clear_button.forEach(function (clear_BTN) {
                clear_BTN.classList.add("enabled");
                clear_BTN.classList.remove('hidden');
                setTimeout(function(){
                    marameLog("attr removed");
                    clear_BTN.removeAttribute('disabled');
                },1500);

                // console.log("clear_BTN:--",clear_BTN);
                
                // clear_BTN.addEventListener("click", function () {
                //     const url = new URL(window.location.href);
                //     const initialURL = url.toString();
                //     url.search = "";
                //     if (url.toString() !== initialURL) {
                //     afterFilterApply(url);
                //     }
                //     // document.querySelector(".filters_custom").classList.remove("hidden");
                //     clear_BTN.classList.add("hidden");
                //     // document.querySelector(".filters_custom")?.click();
                //     document.querySelector(".cloase_after_filter").classList.add("hidden");
                // });
                });

                if (!marameReinitCollectionAfterSectionSwap()) {
                load_listing_script();
                load_init_scripts_script();

                product_grid_size_option();
                product_grid_ATC();
                load_more_product_JS();
                product_media_update();
                check_size_option();
                grid_metafield_product();
                grid_option_controls();
                // removed: third-party variant shuffler
                }


                // var clear_button = document.querySelectorAll("#main-clear-button,#secondary-clear-button");

                // console.log("clear_button:--",clear_button);
                // clear_button.forEach(function (clear_BTN) {
                    
                    
                // clear_BTN.classList.add("enabled");
                // clear_BTN.classList.remove('hidden');
                // setTimeout(function(){
                //     marameLog("attr removed");
                //     marameLog("clear_BTN:--",clear_BTN);
                //     clear_BTN.removeAttribute('disabled');
                //     marameLog("clear_BTN:--",clear_BTN);
                // },2500);

                // // console.log("clear_BTN:--",clear_BTN);
                
                // // clear_BTN.addEventListener("click", function () {
                // //     const url = new URL(window.location.href);
                // //     const initialURL = url.toString();
                // //     url.search = "";
                // //     if (url.toString() !== initialURL) {
                // //     afterFilterApply(url);
                // //     }
                // //     // document.querySelector(".filters_custom").classList.remove("hidden");
                // //     clear_BTN.classList.add("hidden");
                // //     // document.querySelector(".filters_custom")?.click();
                // //     document.querySelector(".cloase_after_filter").classList.add("hidden");
                // // });
                // });

            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
});

function marameGetCollectionListing() {
    return document.querySelector("#MainContent section.listing");
}

function marameGetCollectionFilterPanels() {
    return document.querySelector("#MainContent section.filters .filter-panels");
}

function marameIsFilterQueryKey(key) {
    return key.startsWith("filter.v.") || key.startsWith("filter.p.");
}

function marameParsePriceDisplayValue(input) {
    if (!input) return null;
    const raw = (
        input.value != null && String(input.value).trim() !== ""
            ? input.value
            : input.getAttribute("value") || ""
    )
        .toString()
        .replace(/[^\d.]/g, "");
    const num = parseFloat(raw);
    return Number.isFinite(num) ? num : null;
}

function marameSyncPriceInputsFromSliders() {
    const minRange = document.getElementById("Mobile-Filter-price-range-min");
    const maxRange = document.getElementById("Mobile-Filter-price-range-max");
    const minInput = document.getElementById("Mobile-Filter-Price-GTE");
    const maxInput = document.getElementById("Mobile-Filter-Price-LTE");

    if (!minRange || !maxRange || !minInput || !maxInput) return;

    const minVal = String(parseInt(minRange.value, 10) || 0);
    const maxVal = String(parseInt(maxRange.value, 10) || 0);
    minInput.value = minVal;
    maxInput.value = maxVal;
    minInput.setAttribute("value", minVal);
    maxInput.setAttribute("value", maxVal);
}

window.marameSyncPriceInputsFromSliders = marameSyncPriceInputsFromSliders;

/** Shopify storefront price filters expect subunits (e.g. pence), not display pounds. */
function marameAppendPriceFilterToUrl(url) {
    const minInput = document.getElementById("Mobile-Filter-Price-GTE");
    const maxInput = document.getElementById("Mobile-Filter-Price-LTE");
    const minRange = document.getElementById("Mobile-Filter-price-range-min");
    const maxRange = document.getElementById("Mobile-Filter-price-range-max");
    const rangeGroup = document.querySelector(".price-range-slider");

    if (!minInput || !maxInput || !minRange || !maxRange) return;

    marameSyncPriceInputsFromSliders();

    let minDisplay = marameParsePriceDisplayValue(minInput);
    let maxDisplay = marameParsePriceDisplayValue(maxInput);
    if (minDisplay == null) {
        minDisplay = parseInt(minRange.value, 10);
    }
    if (maxDisplay == null) {
        maxDisplay = parseInt(maxRange.value, 10);
    }
    if (!Number.isFinite(minDisplay) || !Number.isFinite(maxDisplay)) return;

    const rangeMin =
        parseFloat(rangeGroup?.dataset.rangeMin) ||
        parseFloat(minRange.min) ||
        0;
    const rangeMax =
        parseFloat(rangeGroup?.dataset.rangeMax) ||
        parseFloat(maxRange.max) ||
        rangeMin;

    const pricePending = rangeGroup?.classList.contains("changed");
    const minActive = minDisplay > rangeMin;
    const maxActive = maxDisplay < rangeMax;

    if (!pricePending && !minActive && !maxActive) return;

    const minName =
        minInput.getAttribute("name") || "filter.v.price.gte";
    const maxName =
        maxInput.getAttribute("name") || "filter.v.price.lte";

    [...url.searchParams.keys()].forEach(function (key) {
        if (key.startsWith("filter.v.price.")) {
            url.searchParams.delete(key);
        }
    });

    if (minActive) {
        url.searchParams.set(minName, String(Math.round(minDisplay * 100)));
    }
    if (maxActive) {
        url.searchParams.set(maxName, String(Math.round(maxDisplay * 100)));
    }
}

window.marameAppendPriceFilterToUrl = marameAppendPriceFilterToUrl;

function marameSyncFilterApplyButton() {
    const panels = document.querySelector(".filter-panels");
    const applyBtn = document.querySelector("#secondary-view-button");
    const hasSelected = !!document.querySelector(".filter-panel__item.selected");
    const hasPriceChange = !!document.querySelector(".price-range-slider.changed");
    const canApply = hasSelected || hasPriceChange;

    panels?.classList.toggle("marame-filter-apply-ready", canApply);
    if (applyBtn) {
        applyBtn.removeAttribute("disabled");
        applyBtn.setAttribute("aria-disabled", canApply ? "false" : "true");
        applyBtn.classList.toggle("enabled", canApply);
    }
}

window.marameSyncFilterApplyButton = marameSyncFilterApplyButton;

function marameApplyCollectionFilters(panels) {
    panels = panels || document.querySelector(".filter-panels");
    if (!panels) return;

    const applyBtn =
        panels.querySelector("#secondary-view-button") ||
        panels.querySelector("#main-view-button");
    if (applyBtn && applyBtn.getAttribute("aria-disabled") === "true") return;

    const selectedItems = panels.querySelectorAll(".filter-panel__item.selected");
    const clearButtons = document.querySelectorAll(
        "#main-clear-button,#secondary-clear-button"
    );
    const url = new URL(window.location.href);

    [...url.searchParams.keys()].forEach(function (key) {
        if (marameIsFilterQueryKey(key)) {
            url.searchParams.delete(key);
        }
    });

    selectedItems.forEach(function (item) {
        const value = item.getAttribute("data-value");
        if (!value || !value.includes("=")) return;
        const eq = value.indexOf("=");
        const param = value.slice(0, eq);
        const val = value.slice(eq + 1);
        url.searchParams.append(param, decodeURIComponent(val));
        clearButtons.forEach(function (btn) {
            btn?.classList.remove("hidden");
        });
        marameSyncFilterBarFromUrl(url);
    });

    marameSyncPriceInputsFromSliders();
    marameAppendPriceFilterToUrl(url);
    afterFilterApply(url);
    document.querySelector(".cloase_filter_cstm")?.click();
}

window.marameApplyCollectionFilters = marameApplyCollectionFilters;

function marameBindCollectionFilterApply() {
    if (window.__marameFilterApplyClickBound) return;
    window.__marameFilterApplyClickBound = true;

    document.addEventListener("click", function (event) {
        const viewBtn = event.target.closest(
            "#main-view-button, #secondary-view-button"
        );
        if (!viewBtn) return;
        if (viewBtn.getAttribute("aria-disabled") === "true") return;

        const panels = viewBtn.closest(".filter-panels");
        if (!panels) return;

        event.preventDefault();
        marameApplyCollectionFilters(panels);
    });
}

function marameCollectionFiltersActive() {
    const url = new URL(window.location.href);
    const hasFilterParams = [...url.searchParams.keys()].some(marameIsFilterQueryKey);
    const clearBtn = document.querySelector("#secondary-clear-button");
    const clearVisible = clearBtn && !clearBtn.classList.contains("hidden");
    const xIcon = document.querySelector(".filters .cloase_after_filter");
    const xVisible =
        xIcon &&
        xIcon.style.display !== "none" &&
        window.getComputedStyle(xIcon).display !== "none";
    return hasFilterParams || clearVisible || xVisible;
}

function marameSyncFilterBarFromUrl(url) {
    url = url || new URL(window.location.href);
    const hasFilters = [...url.searchParams.keys()].some(marameIsFilterQueryKey);
    const clearBtn = document.querySelector("#secondary-clear-button");
    const xIcon = document.querySelector(".filters .cloase_after_filter");

    if (clearBtn) {
        clearBtn.classList.toggle("hidden", !hasFilters);
    }
    if (xIcon) {
        xIcon.style.display = hasFilters ? "" : "none";
    }
}

function marameResetFilterPanelUi() {
    document
        .querySelectorAll(".filter-panel__item.selected")
        .forEach(function (el) {
            el.classList.remove("selected");
        });
    document.querySelector(".active-filters")?.replaceChildren();

    const rangeGroup = document.querySelector(".price-range-slider");
    const minRange = document.getElementById("Mobile-Filter-price-range-min");
    const maxRange = document.getElementById("Mobile-Filter-price-range-max");

    if (minRange && maxRange) {
        minRange.value = minRange.min;
        maxRange.value = maxRange.max;
    }
    if (rangeGroup) {
        rangeGroup.classList.remove("changed");
    }

    window.marameSyncPriceInputsFromSliders?.();
    window.marameSyncFilterApplyButton?.();
}

window.marameResetFilterPanelUi = marameResetFilterPanelUi;

function marameClearCollectionFilters() {
    const url = new URL(window.location.href);
    const initialURL = url.toString();
    url.search = "";

    marameResetFilterPanelUi();

    document.querySelector(".filters .filters_data")?.classList.add("hidden");
    if (!document.querySelector("[data-marame-shuffle='true']")) {
        document.documentElement.classList.remove("lenis-stopped");
        document.body.removeAttribute("data-lenis-prevent");
        document.documentElement.removeAttribute("data-lenis-prevent");
    }

    marameSyncFilterBarFromUrl(url);

    if (url.toString() !== initialURL) {
        afterFilterApply(url);
        return;
    }
}

function marameToggleFiltersPanel(wrapper) {
    if (!wrapper) return;

    wrapper.querySelectorAll(".filters_data").forEach(function (el) {
        window.scrollTo(0, 0);
        el.classList.toggle("hidden");
        const filterClass = el.getAttribute("class") || "";
        const isMarameCollection = Boolean(document.querySelector("[data-marame-shuffle='true']"));
        const isHidden = filterClass.includes("hidden");

        if (isHidden) {
            if (!isMarameCollection) {
                document.documentElement.classList.remove("lenis-stopped");
                document.body.removeAttribute("data-lenis-prevent");
                document.documentElement.removeAttribute("data-lenis-prevent");
            }
        } else {
            document.documentElement.classList.add("lenis-stopped");
            if (!isMarameCollection) {
                document.body.setAttribute("data-lenis-prevent", "true");
                document.documentElement.setAttribute("data-lenis-prevent", "true");
            }
        }
    });
}

function collection_pro_filter() {
    marameBindCollectionFilterApply();

    const filterWrapper = document.querySelector(".filters__left__secondary");
    const comman_filter = document.querySelector(".filter-panels");

    if (comman_filter) {
        /* Apply: marameBindCollectionFilterApply → marameApplyCollectionFilters */
    } else {
        if (!filterWrapper) return;

        filterWrapper.addEventListener("change", function (e) {
            const target = e.target;
            if (!target.classList.contains("filter")) return;

            const filters = filterWrapper.querySelectorAll(".filter");
            const url = new URL(window.location.href);

            filters.forEach(function (dropdown) {
                const val = dropdown.value;
                if (val && val.includes("=")) {
                    const [param] = val.split("=");
                    url.searchParams.delete(param);
                }
            });

            filters.forEach(function (dropdown) {
                const val = dropdown.value;
                if (val && val.includes("=")) {
                    const [param, value] = val.split("=");
                    if (param && value) {
                        url.searchParams.set(param, decodeURIComponent(value));
                    }
                }
            });
            afterFilterApply(url);
        });
    }
}

let marameFilterApplyGeneration = 0;

function afterFilterApply(url) {
    const generation = ++marameFilterApplyGeneration;
    history.replaceState({}, "", url.toString());
    fetch(url.toString())
        .then(response => response.text())
        .then(responseData => {
            if (generation !== marameFilterApplyGeneration) {
                return;
            }
            const parser = new DOMParser();
            const newHTML = parser.parseFromString(responseData, "text/html");
            const listingEl = marameGetCollectionListing();
            const filterPanelsEl = marameGetCollectionFilterPanels();
            const newSectionHTML = newHTML.querySelector("#MainContent section.listing")?.innerHTML;
            const newSectionFilterHTML = newHTML.querySelector("#MainContent section.filters .filter-panels")?.innerHTML;

            if (newSectionHTML || newSectionFilterHTML) {
                const isMarameGrid = Boolean(
                    document.querySelector("[data-marame-shuffle='true']")
                );

                if (newSectionHTML && listingEl) {
                    listingEl.innerHTML = newSectionHTML;
                }
                if (newSectionFilterHTML && filterPanelsEl) {
                    filterPanelsEl.innerHTML = newSectionFilterHTML;
                    filterPanelsEl.removeAttribute("data-marame-filter-panels-init");
                }

                if (isMarameGrid) {
                    marameReinitCollectionAfterSectionSwap({ preserveOrder: true });
                } else if (!marameReinitCollectionAfterSectionSwap()) {
                    load_listing_script();
                    load_init_scripts_script();
                    product_grid_size_option();
                    product_grid_ATC();
                    load_more_product_JS();
                    product_media_update();
                    check_size_option();
                    grid_metafield_product();
                    grid_option_controls();
                }

                window.initFilterPanels?.();
                window.initPriceRangeFilter?.();
                marameSyncFilterBarFromUrl(url);
                marameSyncFilterApplyButton();
            }
        })
        .catch(error => {
            console.error("Filter fetch error:", error);
        });
}

window.afterFilterApply = afterFilterApply;

marameBindCollectionFilterApply();
collection_pro_filter();

// document.addEventListener("click", function (e) {
//         const btn = e.target.closest(".filters_custom_clear");
//         if (!btn) return;

//         e.preventDefault();

//         const wrapper = btn.closest(".filters");
//         if (!wrapper) return;

//         document.querySelector(".filters_custom_clear").classList.add("hidden");
//         document.querySelector(".filters_custom").classList.remove("hidden");
//         var clear_button = document.querySelectorAll("#main-clear-button,#secondary-clear-button");

//         clear_button.forEach(function (clear_BTN) {
//             clear_BTN.addEventListener("click", function () {
//                 const url = new URL(window.location.href);
//                 const initialURL = url.toString();
//                 url.search = "";
//                 if (url.toString() !== initialURL) {
//                     afterFilterApply(url);
//                 }
//             });
//         });

//          // close others
//         // wrapper.querySelectorAll(".filters_data").forEach(el => {
//         //      el.classList.toggle("hidden");
//         //      const Filter_datac = el.getAttribute("class");
//         //      if (Filter_datac.includes('hidden')) 
//         //      {
//         //         document.querySelector("html").classList.remove("lenis-stopped");
//         //         document.body.removeAttribute("data-lenis-prevent",true);
//         //         document.documentElement.removeAttribute("data-lenis-prevent",true);
//         //      }
//         //      else
//         //     {
//         //         document.querySelector("html").classList.add("lenis-stopped");
//         //         document.body.setAttribute("data-lenis-prevent",true);
//         //         document.documentElement.setAttribute("data-lenis-prevent",true);
//         //     }
//         // });
//     });


function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?]' + name + '(=([^?#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, '+'));
}

// function load_more_product_JS() {
//     const loadMoreBtn = document.querySelector("#load_more_product_JS");
//     marameLog("loadMoreBtn_upp:--",loadMoreBtn);
//     if (!loadMoreBtn) return;
   
//     let isLoading = false;

//     function loadMoreProducts() {
//         const loadMoreBtn = document.querySelector("#load_more_product_JS");
//         if (!loadMoreBtn) return;
//         marameLog("loadMoreBtn_down:--",loadMoreBtn);
       
//         if (isLoading) return;

//         let data_current_page = parseInt(loadMoreBtn.getAttribute("data_current_page"));
//         let data_total_page = parseInt(loadMoreBtn.getAttribute("data_total_page"));
//         let data_next_page = loadMoreBtn.getAttribute("data_next_page");

//         // if (data_current_page >= data_total_page) {
//         //     loadMoreBtn.closest(".listing__more")?.style.display = "none";
//         //     window.removeEventListener("scroll", scrollHandler);
//         //     return;
//         // }
//         if (data_current_page >= data_total_page) {
//             const listingMore = loadMoreBtn.closest(".listing__more");
//             if (listingMore) {
//                 listingMore.style.display = "none";
//             }
//               window.removeEventListener("scroll", scrollHandler);
//             return;
//         }


//         // isLoading = true;
//         //  loadMoreBtn.textContent = "Loading";
//         // data_current_page += 1;

//         // let new_fetch_url = data_next_page.replace(/page=[0-9]+/, "page=" + data_current_page);
//         //  marameLog("new_fetch_url_before:--",new_fetch_url);
//         // new_fetch_url = new_fetch_url.split("&")[0];

//         // console.log("new_fetch_url_After:--",new_fetch_url);

//         // let sortBy = getParameterByName("sort_by", location.href);
//         // if (sortBy != null) {
//         //     new_fetch_url = `${new_fetch_url}&sort_by=${sortBy}`;
//         // }

//         // loadMoreBtn.setAttribute("data_current_page", data_current_page);


//         isLoading = true;
//         loadMoreBtn.textContent = "Loading...";
//         data_current_page += 1;

//         // Create URL object (BEST PRACTICE)
//         const url = new URL(data_next_page, window.location.origin);

//         // Update page param
//         url.searchParams.set("page", data_current_page);

//         // Keep sort_by if exists
//         const sortBy = getParameterByName("sort_by", location.href);
//         if (sortBy) {
//         url.searchParams.set("sort_by", sortBy);
//         }

//         // Final URL
//         const new_fetch_url = url.toString();

//         marameLog("Fetch URL:", new_fetch_url);

//         loadMoreBtn.setAttribute("data_current_page", data_current_page);

       

//         fetch(new_fetch_url)
//             .then(response => response.text())
//             .then(responseData => {
//                 const parser = new DOMParser();
//                 const newHTML = parser.parseFromString(responseData, "text/html");

//                 const fetchNewHTML = newHTML.querySelector(
//                     "#MainContent section.listing .listing__list"
//                 )?.innerHTML;

//                 if (fetchNewHTML) {
//                     document.querySelector(
//                         "#MainContent section.listing .listing__list"
//                     ).insertAdjacentHTML("beforeend", fetchNewHTML);
//                 }

//                 document.querySelectorAll(
//                     "#MainContent section.listing .listing__list .listing__item.hide"
//                 ).forEach(item => item.classList.remove("hide"));

//                 /* Re-init scripts */
//                 load_listing_script();
//                 load_init_scripts_script();
//                 product_grid_size_option();
//                 custom_change_swatch_image();
//                 product_grid_ATC();
// //                 product_media_update();
//                 check_size_option();
//                 collection_pro_filter();
//                 grid_metafield_product();
//                 grid_option_controls();
//                 color_popup();

//                 if (data_current_page >= data_total_page) {
//                 const listingMore = loadMoreBtn.closest(".listing__more");
//                 if (listingMore) {
//                     listingMore.style.display = "none";
//                 }
//                 window.removeEventListener("scroll", scrollHandler);

//                 // window.initFilterPanels?.();
//                 // window.initPriceRangeFilter?.();


//                 return;
//             }

//                 isLoading = false;
//                 loadMoreBtn.textContent = "View More";
//             })
//             .catch(error => {
//                 console.error("Fetch error:", error);
//                 isLoading = false;
//             });
//     }

//     let scrollTimeout;

//     function scrollHandler() {
//         clearTimeout(scrollTimeout);
//         scrollTimeout = setTimeout(() => {
//             if (isLoading) return;

//             const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
//             const windowHeight = window.innerHeight;
//             const docHeight = document.documentElement.scrollHeight;

//             if (scrollTop + windowHeight >= docHeight - 1000) {
//                 loadMoreProducts();
//             }
//         }, 50);
//     }


//     window.addEventListener("scroll", scrollHandler);
// }


function load_more_product_JS() {
    const loadMoreBtn = document.querySelector("#load_more_product_JS");
    marameLog("loadMoreBtn_upp:--",loadMoreBtn);
    if (!loadMoreBtn) return;
    if (loadMoreBtn.dataset.marameLoadMoreBound === "true") return;
    loadMoreBtn.dataset.marameLoadMoreBound = "true";
   
    let isLoading = false;

    function loadMoreProducts() {
        const loadMoreBtn = document.querySelector("#load_more_product_JS");
        if (!loadMoreBtn) return;
        marameLog("loadMoreBtn_down:--",loadMoreBtn);
       
        if (isLoading) return;

        let data_current_page = parseInt(loadMoreBtn.getAttribute("data_current_page"));
        let data_total_page = parseInt(loadMoreBtn.getAttribute("data_total_page"));
        let data_next_page = loadMoreBtn.getAttribute("data_next_page");

        // if (data_current_page >= data_total_page) {
        //     loadMoreBtn.closest(".listing__more")?.style.display = "none";
        //     window.removeEventListener("scroll", scrollHandler);
        //     return;
        // }
        if (data_current_page >= data_total_page) {
            const listingMore = loadMoreBtn.closest(".listing__more");
            if (listingMore) {
                listingMore.style.display = "none";
            }
            //   window.removeEventListener("scroll", scrollHandler);
            return;
        }
        isLoading = true;
        loadMoreBtn.textContent = "Loading...";
        data_current_page += 1;

        const url = data_next_page && data_next_page.trim()
          ? new URL(data_next_page, window.location.origin)
          : new URL(window.location.href);

        url.searchParams.set("page", data_current_page);

        const sortBy = getParameterByName("sort_by", location.href);
        if (sortBy) {
        url.searchParams.set("sort_by", sortBy);
        }

        const new_fetch_url = url.toString();
        marameLog("Fetch URL:", new_fetch_url);
        loadMoreBtn.setAttribute("data_current_page", data_current_page);

        fetch(new_fetch_url)
            .then(response => response.text())
            .then(responseData => {
                const parser = new DOMParser();
                const newHTML = parser.parseFromString(responseData, "text/html");
                const listEl = document.querySelector(
                    "#MainContent section.listing .listing__list"
                );
                const isMarameGrid = Boolean(listEl?.dataset?.marameShuffle === "true");
                const prevCount = listEl
                  ? listEl.querySelectorAll(":scope > li.listing__item").length
                  : 0;

                const fetchNewHTML = newHTML.querySelector(
                    "#MainContent section.listing .listing__list"
                )?.innerHTML;

                if (fetchNewHTML && listEl) {
                    listEl.insertAdjacentHTML("beforeend", fetchNewHTML);
                }

                listEl?.querySelectorAll(".listing__item.hide").forEach((item) => {
                  item.classList.remove("hide");
                });

                const finishLoadMore = () => {
                  if (data_current_page >= data_total_page) {
                    const listingMore = loadMoreBtn.closest(".listing__more");
                    if (listingMore) {
                      listingMore.style.display = "none";
                    }
                  }
                  isLoading = false;
                  loadMoreBtn.innerHTML =
                    '<small>View More</small><svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="#BBB" stroke-width=".926" d="m.591.362 4.63 4.168M.591.362l4.63 4.168M.591.362l4.63 4.168m-.619 0L9.233.362M4.602 4.53 9.233.362M4.602 4.53 9.233.362M1.98 4.53l3.473 3.126M1.98 4.53l3.473 3.126M1.98 4.53l3.473 3.126m-.619 0L8.307 4.53M4.834 7.656 8.307 4.53M4.834 7.656 8.307 4.53"/></svg>';
                };

                if (isMarameGrid) {
                  const newItems = listEl
                    ? [...listEl.querySelectorAll(":scope > li.listing__item")].slice(prevCount)
                    : [];

                  const afterGrid = () => {
                    product_grid_size_option();
                    product_grid_ATC();
                    color_popup();
                    finishLoadMore();
                  };

                  if (window.MarameCollectionGrid?.reinitAfterLoadMore) {
                    window.MarameCollectionGrid.reinitAfterLoadMore(newItems, afterGrid);
                  } else {
                    marameFinishNativeCollection(newItems).then(afterGrid);
                  }
                  return;
                }

                /* Legacy / non-Marame collections */
                load_listing_script();
                load_init_scripts_script();
                product_grid_size_option();
                product_grid_ATC();
                product_media_update();
                check_size_option();
                collection_pro_filter();
                grid_metafield_product();
                grid_option_controls();
                color_popup();
                // removed: third-party variant shuffler
                finishLoadMore();
            })
            .catch(error => {
                console.error("Fetch error:", error);
                isLoading = false;
            });
    }

     loadMoreBtn.addEventListener("click", function (e) {
        e.preventDefault();
        loadMoreProducts();
    });
}


// if(!document.body.className.includes("template-lookbook")){
product_grid_size_option();
// }
product_grid_ATC();
load_more_product_JS();

document.addEventListener("marame:collection-nav", function () {
    load_more_product_JS();
    product_grid_size_option();
    product_grid_ATC();
    color_popup();
    collection_pro_filter();
    window.initFilterPanels?.();
    window.initPriceRangeFilter?.();
    if (typeof window.__marameInitProductCardSliders === "function") {
        window.__marameInitProductCardSliders(document.getElementById("MainContent"));
    }
});

function color_popup(){
    
  const drawer = document.querySelector(".color_drawer-main");
  const openBtns = document.querySelectorAll(".total_swatch.show_mobile");
  const closeBtn = document.querySelector(".color_close");
  const colorSwatches = document.querySelectorAll(".d-color_li");
  const isMarameCollection = Boolean(document.querySelector("[data-marame-shuffle='true']"));
   
  if (!drawer || !openBtns.length) return;

  if (!drawer.dataset.swatchClickBound) {
    drawer.dataset.swatchClickBound = "true";
    drawer.addEventListener("click", function (e) {
      const swatch = e.target.closest(".d-color_li");
      if (!swatch) return;
      e.preventDefault();

      const scope = swatch.closest(".drawer-color-list, .meta-color-select__options") || document;
      const color_name = swatch.querySelector("span")?.getAttribute("color_name");
      const color_vid = swatch.querySelector("span")?.getAttribute("data-vid");
      const sub = drawer?.querySelector(".color_drawer_sub");

      scope.querySelectorAll(".d-color_li").forEach(el => {
        el.classList.remove("active");
      });
      swatch.classList.add("active");
      if (sub && color_name) sub.textContent = color_name;
      const target = document.querySelector(`.listing__item.color_box_open .single_product_new[data-vhandle="${color_vid}"]`);

      if (!target) return;

      setTimeout(() => {
        target.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
          })
        );

        document.querySelectorAll(".listing__item.color_box_open .single_product_new").forEach(item => {
          item.classList.remove("fisrt_swatch");
          item.classList.remove("active");
          item.classList.add("hidden");
        });

        target.classList.add("active");
        target.classList.add("fisrt_swatch");
      }, 200);
    });
  }

  // OPEN (for each product)
  openBtns.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".listing__list .listing__item").forEach(item => {
        item.classList.remove("color_box_open");
      });
        
      btn.closest(".listing__item").classList.add("color_box_open");
      const wrapper = btn.closest(".meta-color-select__options");
      if (!wrapper) return;
      const items = wrapper.querySelectorAll(".d-color_li");
      const drawerContent = drawer.querySelector(".drawer-color-list");

        if (!drawerContent) return;

        drawerContent.innerHTML = ""; // clear old content

        items.forEach(el => {
            el.classList.remove("hidden");
            drawerContent.insertAdjacentHTML("beforeend", el.outerHTML);
        });

        const color_name_load =  btn.closest(".meta-color-select").querySelector(".d-color_li.active span").getAttribute("color_name");
        marameLog("color_name_load:--",color_name_load);
        const sub = document.querySelector(".color_drawer_sub");
        sub.textContent = color_name_load;

    //   drawer.classList.remove("hidden");
      drawer.classList.add("active");
      document.querySelector('.color_drawer-main_layer').classList.remove('hidden')
      if (isMarameCollection) {
        document.body.classList.add("marame-drawer-open");
      } else {
        document.body.setAttribute("data-lenis-prevent", "true");
        document.documentElement.setAttribute("data-lenis-prevent", "true");
      }
    });
  });

  // CLOSE
  closeBtn?.addEventListener("click", function (e) {
    e.preventDefault();
    marameLog("in color Drawer js");
    // drawer.classList.add("hidden");
    drawer.classList.remove("active");
    document.querySelector('.color_drawer-main_layer').classList.add('hidden');
    document.querySelectorAll(".d-color_li").forEach(el => {
        el.classList.add("hidden");
    });
        document.body.classList.remove("marame-drawer-open");
        document.body.removeAttribute("data-lenis-prevent");
        document.documentElement.removeAttribute("data-lenis-prevent");
   });

}
color_popup();

function careGuideCategory() {
    if (document.querySelector(".care-guide-section .care-guide")) {
        document.querySelector(".care-guide-section .care-guide select[name='category']").addEventListener("change", function () {
            var selectedOption = this.options[this.selectedIndex],
                collection_id = selectedOption.getAttribute("collection_id"),
                firstVisibleFound = false;

            let htmlSubData = "";
            document.querySelectorAll(`[data-name="sub-category"] option[collection_id="${collection_id}"]`).forEach(option => {
              htmlSubData += option.outerHTML;
            });
            // console.log("htmlSubData",htmlSubData);
            document.querySelector(".care-guide-section .care-guide select[name='sub-category']").innerHTML = htmlSubData;
          
            document.querySelectorAll(".care-guide-section .care-guide select[name='sub-category'] option").forEach(function (singleOption) {
                if (singleOption.getAttribute("collection_id") === collection_id) {
                    singleOption.style.display = "block";
                    if (!firstVisibleFound) {
                        singleOption.selected = true;
                        firstVisibleFound = true;
                    } else {
                        singleOption.selected = false;
                    }
                } else {
                    singleOption.style.display = "none";
                    singleOption.selected = false;
                }
            });
        });

        document.querySelector(".care-guide-section .care-guide select[name='gender']").addEventListener("change", function () {
            var selectedValue = this.options[this.selectedIndex].getAttribute("data_value"),
                firstVisibleFound = false;

            // console.log("noscript",document.querySelectorAll(`[data-name="category"] option[data_gender="${selectedValue}"]`));
            let htmlData = "";
            document.querySelectorAll(`[data-name="category"] option[data_gender="${selectedValue}"]`).forEach(option => {
              htmlData += option.outerHTML;
            });
            // console.log("htmlData",htmlData);
            document.querySelector(".care-guide-section .care-guide select[name='category']").innerHTML = htmlData;
          
            document.querySelectorAll(".care-guide-section .care-guide select[name='category'] option").forEach(function (singleOption) {
                if (singleOption.getAttribute("data_gender") == selectedValue) {
                    singleOption.style.display = "block";
                    singleOption.classList.remove("hidden");
                    if (!firstVisibleFound) {
                        singleOption.selected = true;
                        firstVisibleFound = true;
                    } else {
                        singleOption.selected = false;
                    }
                } else {
                    singleOption.style.display = "none";
                    singleOption.classList.add("hidden");
                    singleOption.selected = false;
                }
            });
            document.querySelector(".care-guide-section .care-guide select[name='category']").dispatchEvent(new Event("change", { bubbles: true }));
        });

        document.querySelectorAll(".care-guide-section .care-guide select").forEach(function (single_select) {
            single_select.addEventListener("change", function () {
                careGuidefatch();
            });
        });
    }

    if (document.querySelector(".care-guide-section .care-guide select[name='gender']")) {
        document.querySelector(".care-guide-section .care-guide select[name='gender']").dispatchEvent(new Event("change", { bubbles: true }));
    }
}

function careGuidefatch() {
    if (document.querySelector(".care-guide-section .care-guide")) {
        var product_type = document.querySelectorAll(".care-guide-section .care-guide select")[0].value,
            category = document.querySelectorAll(".care-guide-section .care-guide select")[1].value,
            sub_category = document.querySelectorAll(".care-guide-section .care-guide select")[2].value,
            new_fetch_care_guide_URL = `/collections/${category}/${sub_category}?view=care-guide&filter.p.product_type=${product_type}`;

        //     marameLog("category:--",category);
        //     marameLog("sub_category:--",sub_category);
        // console.log("new_fetch_care_guide_URL: ", new_fetch_care_guide_URL);

        fetch(new_fetch_care_guide_URL)
            .then(response => {
                return response.text();
            })
            .then(responseData => {
                var parser = new DOMParser(),
                    new_response_HTML = parser.parseFromString(responseData, "text/html"),
                    products_list = new_response_HTML.querySelector(".products-list").innerHTML,
                    product_details = new_response_HTML.querySelector(".product-details").innerHTML,
                    all_products_count = parseInt(new_response_HTML.querySelector(".products-list").getAttribute("all_products_count")),
                    page = 2;

                document.querySelector(".products-list").innerHTML = products_list;
                document.querySelector(".product-details").innerHTML = product_details;

                if (all_products_count > 50) {
                    new_fetch_care_guide_URL = `${new_fetch_care_guide_URL}&page=${page}`;

                    page_wise_product_get(new_fetch_care_guide_URL);

                    function page_wise_product_get(new_fetch_care_guide_URL) {
                        fetch(new_fetch_care_guide_URL)
                            .then(response => {
                                return response.text();
                            })
                            .then(responseData => {
                                var parser = new DOMParser(),
                                    new_response_HTML = parser.parseFromString(responseData, "text/html"),
                                    products_list = new_response_HTML.querySelector(".products-list ul").innerHTML,
                                    product_details = new_response_HTML.querySelector(".product-details").innerHTML;

                                document.querySelector(".products-list ul").insertAdjacentHTML("beforeend", products_list);
                                document.querySelector(".product-details").insertAdjacentHTML("beforeend", product_details);

                                load_misc_script();

                                if (new_response_HTML.querySelector(".product-details").innerHTML != "") {
                                    page = page + 1;
                                    new_fetch_care_guide_URL = new_fetch_care_guide_URL.replace(/page=[0-9]+/, "page=" + page);
                                    page_wise_product_get(new_fetch_care_guide_URL);
                                }
                            })
                            .catch(error => {
                                console.error("Fetch error:", error);
                            });
                    }
                }

                load_misc_script();
            })
            .catch(error => {
                console.error("Fetch error:", error);
                document.querySelector(".products-list").innerHTML = "";
                document.querySelector(".product-details").innerHTML = "";
            });
    }
}

careGuideCategory();
careGuidefatch();

function _currentThemeAssetsPath() {
    // Prefer script.js (Vite entry) — same prefix as init-scripts/header imports.
    const scriptTag =
        document.querySelector('script[src*="/assets/script.js"]') ||
        document.querySelector('script[src*="script.js"][type="module"]');
    const customTag =
        document.querySelector('script[src*="/assets/custom.js"]') ||
        document.querySelector('script[src*="custom.js"]');
    const tag = scriptTag || customTag;
    if (tag && tag.src) {
        const src = tag.src;
        const idx = src.indexOf("/assets/");
        if (idx !== -1) return src.slice(0, idx + "/assets/".length);
        const m = src.match(/(\/cdn\/shop\/t\/\d+\/assets\/)/);
        if (m) return m[1];
    }

    // Fallback: detect any other theme asset on the page.
    const tags = document.querySelectorAll(
        'link[href*="/cdn/shop/t/"], script[src*="/cdn/shop/t/"]'
    );
    for (let i = 0; i < tags.length; i++) {
        const url = tags[i].href || tags[i].src || "";
        const m = url.match(/(\/cdn\/shop\/t\/\d+\/assets\/)/);
        if (m) return m[1];
    }

    // Absolute fallback: preserve prior behavior.
    return "/cdn/shop/t/52/assets/";
}

function load_accordion_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import accordion from '${_currentThemeAssetsPath()}accordion.js';
    accordion();
  `;
    document.body.appendChild(script);
}

function load_buythelookimgslider_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import buythelookimgslider from '${_currentThemeAssetsPath()}buy-the-look-img-slider.js';
    buythelookimgslider();
  `;
    document.body.appendChild(script);
}

function load_detailSliders_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import detailSliders from '${_currentThemeAssetsPath()}detail-sliders.js';
    detailSliders();
  `;
    document.body.appendChild(script);
}

function load_misc_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import misc from '${_currentThemeAssetsPath()}misc.js';
    misc();
  `;
    document.body.appendChild(script);
}

function load_listing_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import initListing from '${_currentThemeAssetsPath()}listing.js';
    initListing();
  `;
    document.body.appendChild(script);
}

// document.addEventListener('DOMContentLoaded',function(){
//     // load_listing_script();
//                        product_variant_default();
//                     load_misc_script();
//                     load_listing_script();
//                     load_init_scripts_script();
//                     product_grid_size_option();
//                     product_grid_ATC();
//                     product_media_update();
//                     check_size_option();

// });

// function load_init_scripts_script() {
//     const script = document.createElement("script");
//     script.type = "module";
//     script.textContent = `
//     import initScripts from '/cdn/shop/t/18/assets/init-scripts.js';
//     initScripts();
//   `;
//     document.body.appendChild(script);
// }

// function load_init_scripts_script() {
//     const script = document.createElement("script");
//     script.type = "module";
//     script.textContent = `
//     import initScripts from '/cdn/shop/t/26/assets/init-scripts.js';
//     initScripts();
//   `;
//     document.body.appendChild(script);
//     proCardHoverState();
// }

function load_init_scripts_script() {
    if (window.hasRunInitScripts) return;
    const script = document.createElement("script");
    script.type = "module";
    // Collection pages still need layout scripts (header/menu) and listing init.
    // `init-scripts.js` already skips heavy modules (modal/intro) on collection.
    script.textContent = `
    import initScripts from '${_currentThemeAssetsPath()}init-scripts.js';
    initScripts();
  `;
    document.body.appendChild(script);
    proCardHoverState();
}

function marameInitHeaderMenu() {
    if (!document.querySelector(".header .menu-btn")) return;
    if (window.__marameHeaderInitialized) return;
    if (window.__marameHeaderMenuInit) return;
    window.__marameHeaderMenuInit = true;

    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import initHeader from '${_currentThemeAssetsPath()}header.js';
    initHeader();
  `;
    (document.body || document.documentElement).appendChild(script);
}

function marameBootHeaderMenu() {
    marameInitHeaderMenu();
}

function marameBootHeaderOnCollection() {
    const onCollection =
        document.documentElement.dataset.template === "collection" ||
        document.documentElement.hasAttribute("data-marame-collection") ||
        document.body.classList.contains("template-collection") ||
        document.querySelector("[data-marame-shuffle='true']");

    if (!onCollection) return;

    // script.js runs init-scripts on DOMContentLoaded; on draft themes that can
    // fail to bind the hamburger — ensure header.js always runs on collections.
    marameInitHeaderMenu();
}

function marameBootHeaderOnIndex() {
    if (!document.body.classList.contains("template-index")) return;
    marameInitHeaderMenu();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", marameBootHeaderOnCollection);
    document.addEventListener("DOMContentLoaded", marameBootHeaderOnIndex);
    document.addEventListener("DOMContentLoaded", marameBootHeaderMenu);
} else {
    marameBootHeaderOnCollection();
    marameBootHeaderOnIndex();
    marameBootHeaderMenu();
}


function load_image_slider() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import image_slider from '${_currentThemeAssetsPath()}image-slider.js';
    image_slider();
  `;
    document.body.appendChild(script);
}

function preload_product_card_sliders_module() {
  if (
    window.__marameInitProductCardSliders ||
    window.__marameProductCardSlidersPreloading
  ) {
    return;
  }
  window.__marameProductCardSlidersPreloading = true;

  const script = document.createElement("script");
  script.type = "module";
  script.textContent = `
    import initSliders, { initSliderElement } from '${_currentThemeAssetsPath()}product-card-img-slider.js';
    window.__marameInitProductCardSliders = initSliders;
    window.__marameInitSingleCardSlider = (el) => Promise.resolve(initSliderElement(el, true));
    window.__marameInitSliderElement = initSliderElement;
    window.dispatchEvent(new Event('marame:product-card-sliders-module-ready'));
  `;
  document.body.appendChild(script);
}

function load_product_card_sliders(scope) {
    return new Promise((resolve) => {
      const finish = (result) => {
        if (result && typeof result.then === "function") {
          result.then(() => requestAnimationFrame(resolve));
          return;
        }
        requestAnimationFrame(resolve);
      };

      const runInit = () => {
        finish(window.__marameInitProductCardSliders(scope));
      };

      if (typeof window.__marameInitProductCardSliders === "function") {
        runInit();
        return;
      }

      const onModuleReady = () => {
        window.removeEventListener(
          "marame:product-card-sliders-module-ready",
          onModuleReady
        );
        runInit();
      };
      window.addEventListener(
        "marame:product-card-sliders-module-ready",
        onModuleReady
      );
      preload_product_card_sliders_module();
    });
}

function marameEnsureCardSlider(sliderEl) {
  if (!sliderEl) {
    return Promise.resolve(null);
  }
  if (sliderEl.classList.contains("swiper-initialized") && sliderEl.swiper) {
    return Promise.resolve(sliderEl.swiper);
  }

  const runInit = () => {
    if (typeof window.__marameInitSingleCardSlider === "function") {
      return window.__marameInitSingleCardSlider(sliderEl);
    }
    if (typeof window.__marameInitProductCardSliders === "function") {
      return window.__marameInitProductCardSliders(sliderEl);
    }
    return Promise.resolve(null);
  };

  if (typeof window.__marameInitSingleCardSlider === "function") {
    return runInit();
  }

  return load_product_card_sliders(sliderEl).then(runInit);
}

function marameFinishNativeCollection(scope, options) {
  options = options || {};
  const listing = document.querySelector(".listing__list") || document;
  const sliderScope = scope || listing;

  listing.classList?.replace?.("marame-collection-loading", "marame-collection-loaded");
  listing.querySelectorAll?.(".listing__item.hide")?.forEach?.((el) => {
    el.classList.remove("hide");
  });

  requestAnimationFrame(() => {
    proCardHoverState(sliderScope);
  });

  if (!options.skipCollectionReady) {
    document.dispatchEvent(new CustomEvent("marame:collection-ready"));
  }

  if (window.Shopify?.designMode || options.skipSliderPreload) {
    return Promise.resolve();
  }

  const preloadOnly = () => preload_product_card_sliders_module();
  if ("requestIdleCallback" in window) {
    requestIdleCallback(preloadOnly, { timeout: 3000 });
  } else {
    setTimeout(preloadOnly, 2000);
  }

  return Promise.resolve();
}

window.__marameFinishNativeCollection = marameFinishNativeCollection;
document.querySelectorAll(".lookbook-quick-popup .js_popup").forEach(function (single_product) {
    single_product.addEventListener("click", function (event) {
        marameLog("single_product 930");
        event.preventDefault();

        var popup_HTML = this.closest(".lookbook-three__item").querySelector(".popup_content_data").innerHTML;
        this.closest(".lookbook-quick-popup").querySelector(".lookbook_popup_main .popup_render_data").innerHTML = popup_HTML;
        this.closest(".lookbook-quick-popup").querySelector(".lookbook_popup_main").style.display = "flex";
        document.documentElement.style.overflow = "hidden";

        setTimeout(() => {
            product_variant_default();
            load_misc_script();
            load_listing_script();
            load_init_scripts_script();
            product_grid_size_option();
            product_grid_ATC();
            check_size_option();
            default_none_option_select();
            metafield_product();
            atc_added_check();
            grid_metafield_product();
            grid_option_controls();
        }, 1000);
    });
});

document.querySelectorAll(".lookbook_popup_main .close").forEach(function (popup_close) {
    popup_close.addEventListener("click", function () {
        this.closest(".lookbook-quick-popup").querySelector(".lookbook_popup_main").style.display = "none";
        this.closest(".lookbook-quick-popup").querySelector(".lookbook_popup_main .popup_render_data").innerHTML = "";
        document.documentElement.style.removeProperty("overflow");
    });
});


document.addEventListener("click", function (e) {
    const btn = e.target.closest(".searchbar .searchbar__btn");

    if (!btn) return;

    console.log("click");

    btn.closest(".searchbar")
        ?.querySelector(".searchbar__input")
        ?.classList.add("searchbar__input--active");

    if (!document.querySelector("[data-marame-shuffle='true']")) {
        document.documentElement.classList.add("lenis-stopped");
    }
});
// overlay js 
const overlay_filter = document.querySelector(".new-filters-drawer-overlay");
const overlay_search = document.querySelector(".search-modal-overlay");

overlay_filter?.addEventListener("click", function () {
    marameLog("click on filter overlay");
    const closeBtn = document.querySelector(".cloase_filter_cstm");
    closeBtn?.click();
});

// overlay_search?.addEventListener("click", function () {
//     console.log("click on search overlay");
//     const closeBtn = document.querySelector("form.search.searchbar__input--active .search-close");
//     console.log("closeBtn:L--",closeBtn);
//     closeBtn?.click();
// });

overlay_search?.addEventListener("click", function () {
    document
        .querySelectorAll(".searchbar__input--active")
        .forEach(el => {
            el.classList.remove("searchbar__input--active");
        });

    document.documentElement.classList.remove("lenis-stopped");
});


document.addEventListener('click', function(e) {

  /* ---------------------------
     CHECKOUT BUTTON CLICK cart
  ---------------------------- */

  const checkoutBtn = e.target.closest('.cart__ctas a.checkout_btn');
  if (checkoutBtn) {
    const popup = document.getElementById('cart-checkbox');
    if (!popup) return;

    marameLog("Checkout clicked");

    e.preventDefault(); // stop default checkout
    popup.classList.add('active');
    return;
  }

    /* ---------------------------
     CHECKOUT BUTTON CLICK pdp
  ---------------------------- */

//    document.addEventListener('click', function(e) {

//   const accelBtn = e.target.closest('.shopify-payment-button');
//   if (accelBtn) {
//     marameLog('Accelerated checkout clicked (Shop Pay / Apple Pay / etc)');

//     const note = 'Parcel to be unscented: true';
//     fetch('/cart/update.js', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ note })
//     })
//     .then(res => res.json())
//     .catch(error => console.error('Error:', error));
//   }

// });
  
  /* ---------------------------
     YES BUTTON CLICK cart
  ---------------------------- */

  const yesBtn = e.target.closest('#confirmCheckoutYes');
  if (yesBtn) {
    const popup = document.getElementById('cart-checkbox');
    const checkbox = document.getElementById('packing_info-cd');

    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;

      const note = '';

    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note })
    })
    .then(res => res.json())
    .catch(error => console.error('Error:', error));

    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }

    popup?.classList.remove('active');

    marameLog("Proceeding to checkout");

    window.location.href = '/checkout';
    return;
  }

  /* ---------------------------
     NO BUTTON CLICK cart
  ---------------------------- */

const noBtn = e.target.closest('#confirmCheckoutNo');
if (noBtn) {
  const popup = document.getElementById('cart-checkbox');
  const checkbox = document.getElementById('packing_info-cd');

  if (checkbox) {
    checkbox.checked = false;

    const note = 'Parcel to be unscented: true';

    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note })
    })
    .then(res => res.json())
    .catch(error => console.error('Error:', error));

    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  popup?.classList.remove('active');

  marameLog("Checkout cancelled");

  window.location.href = '/checkout';
}

});
  



  
  
  





function default_none_option_select() {
    if (document.querySelector(".detail__sidebar__content .detail__sidebar__sizes .size-select__options .option.active")) {
        document.querySelector(".detail__sidebar__content .detail__sidebar__sizes .size-select__options .option.active").classList.remove("active");
    }
    // if (document.querySelector(".size-select__options .option.active")) {
    //     document.querySelector(".size-select__options .option.active").classList.remove("active");
    // }
    // document.querySelectorAll(".size-select__options .option.active").forEach(function (single_active_size_option) {
    //     single_active_size_option.classList.remove("active");
    // });
}

default_none_option_select();

window.addEventListener("load", event => {
    default_none_option_select();
});

if (document.querySelector(".customer-page .sign__form .message") && localStorage.getItem("login") == "true") {
    document.querySelector(".customer-page .sign__form .message").classList.remove("hidden");
}

function metafield_product() {
    document.querySelectorAll(".product #MainContent .meta_product_inner .meta-color-select__options .single_product:not(.active)").forEach(function (meta_color_product) {
        meta_color_product.addEventListener("click", function (event) {
            marameLog("single_product 1011");
            var data_handle = this.getAttribute("data_handle");

            // setTimeout(() => {
            //    window.location.reload(); 
            // },1500);
            fetch(data_handle)
                .then(response => {
                    return response.text();
                })
                .then(responseData => {
                    var parser = new DOMParser(),
                        new_response_HTML = parser.parseFromString(responseData, "text/html"),
                        MainContent_HTML = new_response_HTML.querySelector("#MainContent").innerHTML;

                    document.querySelector("#MainContent").innerHTML = MainContent_HTML;
                    // document.querySelector("#MainContent form.shopify-product-form").insertAdjacentHTML("beforeend",`<a class="product-grid-btn klaviyo-bis-trigger" href="#" style="padding: inherit; text-align: center;" data-klaviyo-handle="${document.querySelector("#MainContent form.shopify-product-form").dataset.handle}">OUT OF STOCK - NOTIFY ME</a>`);
                    document.querySelector("#MainContent form.shopify-product-form").insertAdjacentHTML("beforeend",`<div class="klaviyo-product-container" id="klaviyo-data-handle-long-sleeve-fitted-t-shirt-black" data-klaviyo-handle="long-sleeve-fitted-t-shirt-black">
                        <div class="klaviyo-button-container product-grid-btn"><a class="product-grid-btn klaviyo-bis-trigger" href="#" style="padding: inherit; text-align: center;" data-klaviyo-handle="${document.querySelector("#MainContent form.shopify-product-form").dataset.handle}">OUT OF STOCK - NOTIFY ME</a></div>
                    </div>`);

                    product_variant_default();
                    load_misc_script();
                    load_listing_script();
                    load_init_scripts_script();
                    product_grid_size_option();
                    product_grid_ATC();
                    product_media_update();
                    check_size_option();

                    setTimeout(() => {
                        default_none_option_select();
                    }, 500);

                    // history.replaceState({}, "", data_handle.toString());
                    history.pushState({}, "", data_handle.toString());
                    metafield_product();
                    product_mediaZoom();
                    atc_added_check();
                    load_buythelookimgslider_script();
                    load_accordion_script();

                    updateCanonicalLink(window.location.href);
                    let mainSlider1 = document.querySelector('.detail__sliders__main-slider');
                    let sidebarContent1 = document.querySelector('.detail__sidebar__content');
                    if (mainSlider1 && sidebarContent1) {
                    let height = mainSlider1.offsetHeight;
                    sidebarContent1.style.setProperty('--pdp-image-height', `${height}px`);
                    }
                    let proSelectBtns = document.querySelectorAll("[data-pro-custom-select-btn]");
                        proSelectBtns.forEach(btn => {
                            btn.addEventListener("click",function(e){
                                e.preventDefault();
                                marameLog("custom select btn clicked",btn);
                                btn.closest("[data-pro-custom-select]").classList.toggle("active");
                            });
                        });
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                });
        });
    });
}

function updateCanonicalLink(newUrl) {
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        canonicalLink.setAttribute("href", newUrl);
    } else {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        canonicalLink.setAttribute("href", newUrl);
        document.head.appendChild(canonicalLink);
    }
}

function grid_metafield_product() {
    marameLog("grid_metafield_product");
    document.addEventListener("click", function (event) {
        const clicked = event.target.closest(".product--grid--main .meta-color-select__options .single_product:not(.active)");
        if (!clicked) return;
        marameLog("single_product 1079");
        event.preventDefault();

        const data_handle = clicked.getAttribute("data_handle"),
            meta_color_product_parents = clicked.closest(".product--grid--main");

        fetch(data_handle)
            .then(response => response.text())
            .then(responseData => {
                const parser = new DOMParser(),
                    new_response_HTML = parser.parseFromString(responseData, "text/html"),
                    listing__item_HTML = new_response_HTML.querySelector(".product--grid--main").innerHTML;

                meta_color_product_parents.innerHTML = listing__item_HTML;
                // console.log("listing__item_HTML",listing__item_HTML);

                meta_color_product_parents.querySelector(".klaviyo-button-container.product-grid-btn").innerHTML = `<a class="product-grid-btn klaviyo-bis-trigger" href="#" style="padding: inherit; text-align: center;" data-klaviyo-handle="${meta_color_product_parents.querySelector("form .klaviyo-product-container").dataset.klaviyoHandle}">OUT OF STOCK - NOTIFY ME</a>`;

                setTimeout(() => {
                    product_variant_default();
                    load_misc_script();
                    load_listing_script();
                    load_init_scripts_script();
                    product_grid_size_option();
                    product_grid_ATC();
                    product_media_update();
                    check_size_option();
                    default_none_option_select();
                    metafield_product();
                    product_mediaZoom();
                    atc_added_check();
                    load_buythelookimgslider_script();
                    load_accordion_script();
                    grid_option_controls();
                }, 1000);
            })
            .catch(error => console.error("Fetch error:", error));
    });
}
grid_metafield_product();

function grid_option_controls() {
    // console.log("grid_option_controls>>>>>>>>");
    document.querySelectorAll(".product--grid--main .option_control").forEach(function (option_control) {
        option_control.addEventListener("click", function (event) {
            // console.log("option_control clicked");
            this.classList.toggle("active");
            if (this.closest(".product--grid--main").querySelector(".hide_add_remove")) {
                // this.closest(".product--grid--main").querySelector(".hide_add_remove").classList.toggle("hide");
                this.closest(".product--grid--main").querySelector(".hide_add_remove").classList.add("hide");
            }
            if (this.closest(".product--grid--main").querySelector(".show_add_remove")) {
                // this.closest(".product--grid--main").querySelector(".show_add_remove").classList.toggle("show");
                this.closest(".product--grid--main").querySelector(".show_add_remove").classList.add("show");
            }
        });
    });
}
grid_option_controls();

if (document.querySelector(".product #MainContent .meta_product_inner .meta-color-select__options .single_product")) {
    window.addEventListener("popstate", function () {
        fetch(location.pathname)
            .then(response => response.text())
            .then(responseData => {
                var parser = new DOMParser(),
                    newDoc = parser.parseFromString(responseData, "text/html"),
                    newContent = newDoc.querySelector("#MainContent").innerHTML;

                document.querySelector("#MainContent").innerHTML = newContent;

                product_variant_default();
                load_misc_script();
                load_listing_script();
                load_init_scripts_script();
                product_grid_size_option();
                product_grid_ATC();
                product_media_update();
                check_size_option();

                setTimeout(() => {
                    default_none_option_select();
                }, 500);

                metafield_product();
                product_mediaZoom();
                atc_added_check();
            })
            .catch(error => console.error("Popstate fetch error:", error));
    });
}

metafield_product();

if (location.href.includes("/collections/")) {
    var collection_handle = location.href.split("/collections/")[1].split("-")[0];
    localStorage.setItem("collection", collection_handle);
}

if (location.href.includes("/pages/lookbook")) {
    var lookbook_handle = location.href.split("/lookbook-")[1];
    localStorage.setItem("collection", lookbook_handle);
}

product_media_update();

function product_media_update() {
    var mens_collection = "mens",
        womens_collection = "womens";

    if (location.href.includes("category_type")) {
        var urlParams = new URLSearchParams(window.location.search),
            categoryType = urlParams.get("category_type");
        if (categoryType == mens_collection || categoryType === womens_collection) {
            localStorage.setItem("collection", categoryType);
        }
    }

    // For Product page
    if (localStorage.getItem("collection") == mens_collection) {
        document.querySelectorAll(".product .detail__sliders .swiper-slide").forEach(function (swiperSlide) {
            if (swiperSlide.getAttribute("data_alt") == womens_collection) {
                swiperSlide.remove();
            }
        });
    } else if (localStorage.getItem("collection") == womens_collection) {
        document.querySelectorAll(".product .detail__sliders .swiper-slide").forEach(function (swiperSlide) {
            if (swiperSlide.getAttribute("data_alt") == mens_collection) {
                swiperSlide.remove();
            }
        });
    }

    setTimeout(() => {
        if (document.querySelector(".product .detail__sliders__main-slider") && document.querySelector(".product .detail__sliders__thumb-slider")) {
            load_detailSliders_script();
            // if (typeof document.querySelector(".product .detail__sliders__main-slider").swiper.update === "function") {
            //     document.querySelector(".product .detail__sliders__main-slider").swiper.update();
            // }
            // if (typeof document.querySelector(".product .detail__sliders__thumb-slider").swiper.update === "function") {
            //     document.querySelector(".product .detail__sliders__thumb-slider").swiper.update();
            // }
        }
    }, 500);

    // For grid (skip Marame native grid — cards are already variant-scoped in Liquid)
    if (!document.querySelector("[data-marame-shuffle='true']")) {
      if (localStorage.getItem("collection") == mens_collection) {
          document.querySelectorAll(".listing__item .product-card .product-card__img-new-slider .swiper-slide").forEach(function (swiperSlide) {
              if (swiperSlide.getAttribute("data_alt") == womens_collection) {
                  swiperSlide.remove();
              }
          });
      } else if (localStorage.getItem("collection") == womens_collection) {
          document.querySelectorAll(".listing__item .product-card .product-card__img-new-slider .swiper-slide").forEach(function (swiperSlide) {
              if (swiperSlide.getAttribute("data_alt") == mens_collection) {
                  swiperSlide.remove();
              }
          });
      }
    }
    setTimeout(() => {
        const product_card_img_slider = document.querySelector(".listing__item .product-card .product-card__img-product_card_img_slider");
        if (product_card_img_slider && product_card_img_slider.swiper && typeof product_card_img_slider.swiper.update === "function") {
            product_card_img_slider.swiper.update();
        }
    }, 500);

    if (document.querySelector(".cart-container .your-cart .your-cart__wrapper")) {
        document.querySelector(".cart-container .your-cart .your-cart__wrapper").setAttribute("unisex-img", localStorage.getItem("collection"));
    }
}

function product_mediaZoom() {
    if (!window.matchMedia("(pointer: coarse)").matches) {
        document.querySelectorAll(".product .zoom-element").forEach(function (zoomElem) {
            const zoom = 2.5;
            const zoomImg = zoomElem.querySelector("img");

            // Mousemove zoom logic
            zoomElem.addEventListener("mousemove", function (e) {
                if (zoomElem.classList.contains("zoom-active")) {
                    const rect = zoomElem.getBoundingClientRect(),
                        x = e.clientX - rect.left,
                        y = e.clientY - rect.top,
                        xPercent = (x / rect.width) * 100,
                        yPercent = (y / rect.height) * 100;
                    zoomImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                    zoomImg.style.transform = `scale(${zoom})`;
                }
            });

            // Mouseleave resets zoom
            zoomElem.addEventListener("mouseleave", function () {
                zoomElem.classList.remove("zoom-active");
                zoomImg.style.transform = "scale(1)";
                zoomImg.style.transformOrigin = "center center";
            });

            // Toggle zoom on click
            zoomElem.addEventListener("click", function (event) {
                const isActive = zoomElem.classList.contains("zoom-active");

                // Remove active from all
                document.querySelectorAll(".product .zoom-element").forEach(function (elem) {
                    elem.classList.remove("zoom-active");
                    const img = elem.querySelector("img");
                    img.style.transform = "scale(1)";
                    img.style.transformOrigin = "center center";
                });

                // If it wasn't active, activate it
                if (!isActive) {
                    zoomElem.classList.add("zoom-active");
                    const get_rect = zoomElem.getBoundingClientRect(),
                        get_x = event.clientX - get_rect.left,
                        get_y = event.clientY - get_rect.top,
                        get_xPercent = (get_x / get_rect.width) * 100,
                        get_yPercent = (get_y / get_rect.height) * 100;
                    zoomImg.style.transformOrigin = `${get_xPercent}% ${get_yPercent}%`;
                    zoomImg.style.transform = `scale(${zoom})`;
                }
            });
        });
    }
}
product_mediaZoom();

function atc_added_check() {
    if (document.querySelector(".shopify-section.buy_the_look .product--grid--main .atc_JS")) {
        fetch(window.Shopify.routes.root + "cart.js", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                return response.json();
            })
            .then(responseJSON => {
                // console.log("responseJSON: ",responseJSON);
                responseJSON.items.forEach(function (item) {
                    if (document.querySelector(".shopify-section.buy_the_look .product--grid--main[data_product_id='" + item.product_id + "'] .atc_JS")) {
                        document.querySelector(".shopify-section.buy_the_look .product--grid--main[data_product_id='" + item.product_id + "'] .atc_JS").innerHTML = "Added to cart";
                    }
                });
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }
}

atc_added_check();

// Cart page
function cart_event_active() {
  marameLog("cart!!!");
    if (document.querySelector("#cartPage")) {
        document.querySelectorAll("#cartPage .product-row .qty_update .qty_action").forEach(function (qty_action) {
            qty_action.addEventListener("click", function () {

              if (!this.classList.contains("disabled")) {
                this.classList.add("disabled");
                var qtyContainer = this.closest(".qty_update"),
                    qtyInput = qtyContainer.querySelector("input"),
                    qtyValue = parseInt(qtyInput.value);

                if (this.classList.contains("qty_plus")) {
                    // console.log("qty update plus");
                    qtyValue += 1;
                    qtyInput.value = qtyValue;
                } else if (this.classList.contains("qty_minus")) {
                    // console.log("qty update minus");
                    if (qtyValue > 1) {
                        qtyValue -= 1;
                        qtyInput.value = qtyValue;
                    }
                }
                qtyInput.dispatchEvent(new Event("change", { bubbles: true }));
                // setTimeout(() => { qty_action.classList.remove("disabled"); },200);
              }
            });
        });

        document.querySelectorAll("#cartPage .product-row .qty_update .quantity__input").forEach(function (quantity__input) {
            quantity__input.addEventListener("change", function () {
                var item_variant_id = parseInt(this.closest(".product-row").getAttribute("item_variant_id")),
                    qtyValue = parseInt(quantity__input.value);
                cart_qty_update(quantity__input,item_variant_id, qtyValue);
            });
        });

        document.querySelectorAll("#cartPage .product-row .remove_item").forEach(function (remove_item) {
            remove_item.addEventListener("click", function () {
                var item_variant_id = parseInt(this.closest(".product-row").getAttribute("item_variant_id"));
                cart_qty_update(remove_item,item_variant_id, 0);
            });
        });
    }
}

function cart_qty_update(ele,id, qty) {
    // console.log("ele",ele);
    // console.log("ele",ele.closest(".product-row").querySelector(".loading__spinner"));
    ele.closest(".product-row").querySelector(".loading__spinner")?.classList.remove("hidden");
    let updates = { [id]: qty };
    fetch(window.Shopify.routes.root + "cart/update.js", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
    })
        .then(response => {
            return response.json();
        })
        .then(cartResponse => {
          const itemCount = cartResponse.item_count;
        // console.log("Updated Item Count:", itemCount);
          document.querySelector(".cart-count").innerHTML = itemCount;
            // console.log("call", cartResponse);
            cart_update();
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function cart_update() {
    //marameLog("update!!!");

    // Step 1: Get cart JSON (contains item_count, items, etc.)
    fetch(window.Shopify.routes.root + "cart.js")
        .then(response => response.json())
        .then(cart => {
            // ✅ Update all cart-count elements
            /* document.querySelectorAll(".cart-count").forEach(el => {
                el.textContent = cart.item_count;
            }); */
           /*  const cartCountEl = document.querySelector(".cart-count");
            if (cartCountEl) {
                cartCountEl.textContent = cart.item_count;

                // Add or remove the class based on the item count
                if (cart.item_count >= 10) {
                    cartCountEl.classList.add("large-numbers");
                } else {
                    cartCountEl.classList.remove("large-numbers");
                }
            }
 */
            // Step 2: Fetch updated cart HTML for rendering
            return fetch(window.Shopify.routes.root + "cart");
        })
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const newCartContent = doc.querySelector("#cartPage");
            if (newCartContent) {
                document.querySelector("#cartPage").innerHTML = newCartContent.innerHTML;
            }

            load_misc_script();

            // Re-bind events after DOM update
            setTimeout(() => {
                cart_event_active();
            }, 1000);
        })
        .catch(error => {
            console.error("Failed to update cart:", error);
        });
}

// cart_event_active();

window.addEventListener("load", event => {
    setTimeout(() => {
        cart_event_active();
    }, 2000);
});

var change_coockie_link = setInterval(change_link, 1000);
function change_link() {
    var old_link = document.querySelector("#shopify-pc__banner__body-policy-link");
    if (old_link) {
        old_link.setAttribute("href", "/pages/privacy-policy");
        clearInterval(change_coockie_link);
    }
}

function custom_category_filter(_this) {
    var categoryURL = _this.getAttribute("redirect-url");
    if (document.querySelector("#secondary-view-button")) {
        document.querySelector("#secondary-view-button").setAttribute("redirect-url", categoryURL);
    }
}

function redirect_to_category(_this) {
    if (_this.hasAttribute("redirect-url")) {
        location.href = _this.getAttribute("redirect-url");
    }
}


let marketingOpt = document.querySelector(`[data-input-marketing-optin]`) || null;
if(marketingOpt){
  marketingOpt.addEventListener("change",function(){
    // console.log("changed",this.checked);
    document.querySelector(`[data-input-accepts-marketing]`).value = this.checked ? "true" : "false";
  });
}

function productSizeChartState(){
    // sizechart
    const sizechart_openBtn = document.querySelector('.size-guide-popup-opener-btn');
    const sizechart_popup = document.querySelector('.sizechart-popup');
    const sizechart_closeBtn = document.querySelector('.popup-close-icon');

    if (sizechart_openBtn && sizechart_popup && sizechart_closeBtn) {
        // console.log("found ele>>>>>>");
        sizechart_openBtn.addEventListener('click', function () {
            window.scrollTo(0,0);
            sizechart_popup.classList.add('active');
            document.body.classList.add('size-guide-popup-active');
            document.body.setAttribute("data-lenis-prevent",true);
            document.documentElement.setAttribute("data-lenis-prevent",true);
        });
        sizechart_closeBtn.addEventListener('click', function () {
            sizechart_popup.classList.remove('active');
            document.body.classList.remove('size-guide-popup-active');
            document.body.removeAttribute("data-lenis-prevent");
            document.documentElement.removeAttribute("data-lenis-prevent");
        });
    }

    const mainSlider = document.querySelector('.detail__sliders__main-slider');
    const sidebarContent = document.querySelector('.detail__sidebar__content');
    if (mainSlider && sidebarContent) {
    const height = mainSlider.offsetHeight;
    sidebarContent.style.setProperty('--pdp-image-height', `${height}px`);
    }

    // international-sizechart
    const international_sizechart_openBtn = document.querySelector('.international-sizechart-opener');
    const international_sizechart_popup = document.querySelector('.international-sizechart-popup');
    const international_sizechart_closeBtn = document.querySelector('.is-popup-close-icon');
    const international_sizechart_overlay = document.querySelector('.international-popup-overlay');

    if (international_sizechart_openBtn && international_sizechart_popup && international_sizechart_closeBtn && international_sizechart_overlay) {
        // console.log("found ele>>>>>>000000000");
        international_sizechart_openBtn.addEventListener('click', function () {
            window.scrollTo(0,0);
            international_sizechart_popup.classList.add('active');
            international_sizechart_overlay.classList.add('active');
            document.body.classList.add('international-size-popup-active');
            document.body.setAttribute("data-lenis-prevent",true);
            document.documentElement.setAttribute("data-lenis-prevent",true);
        });
        international_sizechart_closeBtn.addEventListener('click', function () {
            international_sizechart_popup.classList.remove('active');
            international_sizechart_overlay.classList.remove('active');
            document.body.classList.remove('international-size-popup-active');
            document.body.removeAttribute("data-lenis-prevent");
            document.documentElement.removeAttribute("data-lenis-prevent");
        });
    }
}

// Get the element
const announcementBar = document.querySelector('.announcement_bar_row');

if (announcementBar) {
  // Get its height in pixels
  const height = announcementBar.offsetHeight + 'px';

  // Set it as a CSS variable on the body tag
  document.body.style.setProperty('--announcement-bar-height', height);
}


function maramePaintStaticPagination(slider) {
  if (!slider || slider.classList.contains("swiper-initialized")) return;
  const pagination = slider.querySelector(".swiper-pagination");
  if (!pagination) return;

  const count = slider.querySelectorAll(".swiper-wrapper .swiper-slide").length;
  if (count < 2) {
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "";
  const existing = pagination.querySelectorAll(".swiper-pagination-bullet");

  if (
    existing.length === count &&
    pagination.dataset.staticPagination === String(count)
  ) {
    existing.forEach((bullet, index) => {
      bullet.classList.toggle("swiper-pagination-bullet-active", index === 0);
    });
    return;
  }

  pagination.dataset.staticPagination = String(count);
  pagination.innerHTML = "";

  for (let i = 0; i < count; i += 1) {
    const bullet = document.createElement("span");
    bullet.className =
      "swiper-pagination-bullet" + (i === 0 ? " swiper-pagination-bullet-active" : "");
    bullet.setAttribute("aria-hidden", "true");
    pagination.appendChild(bullet);
  }
}

function marameSyncStaticPagination(slider, activeIndex) {
  if (!slider || slider.swiper) return;
  const bullets = slider.querySelectorAll(".swiper-pagination .swiper-pagination-bullet");
  if (!bullets.length) return;
  bullets.forEach((bullet, index) => {
    bullet.classList.toggle("swiper-pagination-bullet-active", index === activeIndex);
  });
}

// function marameBindMarameGridCardHover(slider) {
//   maramePaintStaticPagination(slider);

//   const card = slider.closest(".product-card");
//   if (!card) return;

//   card.addEventListener(
//     "mouseenter",
//     function () {
//       window.maramePreloadCardHoverImage?.(slider);
//       if (!slider.swiper) {
//         marameSyncStaticPagination(slider, 1);
//       }
//     },
//     { passive: true }
//   );

//   card.addEventListener(
//     "mouseleave",
//     function () {
//       if (!slider.swiper) {
//         marameSyncStaticPagination(slider, 0);
//       }
//     },
//     { passive: true }
//   );

// //   slider.querySelectorAll(".swiper-button-next, .swiper-button-prev").forEach(function (btn) {
// //     btn.addEventListener(
// //       "click",
// //       function (event) {
// //         event.preventDefault();
// //         event.stopPropagation();
// //         marameEnsureCardSlider(slider);
// //       },
// //       true
// //     );
// //   });

//         slider.querySelectorAll(".swiper-button-next, .swiper-button-prev").forEach(function (btn) {
//         btn.addEventListener(
//             "click",
//             function (event) {
//             event.preventDefault();
//             event.stopPropagation();

//             const isNext = btn.classList.contains("swiper-button-next");

//             marameEnsureCardSlider(slider).then(function () {
//                 requestAnimationFrame(function () {
//                 const swiper = slider.swiper;   // read the live instance off the element
//                 if (!swiper) return;
//                 swiper.update();                // make sure it's measured before navigating
//                 if (isNext) swiper.slideNext();
//                 else swiper.slidePrev();
//                 });
//             });
//             },
//             true
//         );
//         });

// }

function marameBindMarameGridCardHover(slider) {
  maramePaintStaticPagination(slider);

  const card = slider.closest(".product-card");
  if (!card) return;

  // Initialize Swiper on load.
  marameEnsureCardSlider(slider);

  // Hover: show 2nd slide. Hover out: back to 1st.
  card.addEventListener(
    "mouseenter",
    function () {
      window.maramePreloadCardHoverImage?.(slider);
      marameEnsureCardSlider(slider).then(function () {
        const swiper = slider.swiper;
        if (!swiper || swiper.slides.length < 2) return;
        swiper.slideTo(1);
      });
    },
    { passive: true }
  );

  card.addEventListener(
    "mouseleave",
    function () {
      const swiper = slider.swiper;
      if (!swiper) return;
      swiper.slideTo(0);
    },
    { passive: true }
  );

  // Arrows.
  slider.querySelectorAll(".swiper-button-next, .swiper-button-prev").forEach(function (btn) {
    btn.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopPropagation();
        const isNext = btn.classList.contains("swiper-button-next");
        marameEnsureCardSlider(slider).then(function () {
          requestAnimationFrame(function () {
            const swiper = slider.swiper;
            if (!swiper) return;
            if (isNext) swiper.slideNext();
            else swiper.slidePrev();
          });
        });
      },
      true
    );
  });
}

function proCardHoverState(root) {
  const scope = root && root.querySelectorAll ? root : document;
  const isMarameGrid = Boolean(document.querySelector("[data-marame-shuffle='true']"));
  scope.querySelectorAll(`.product-card__img-new-slider`).forEach(slider => {
    if (slider.dataset.hoverBound === "true") return;
    slider.dataset.hoverBound = "true";

    if (isMarameGrid) {
      marameBindMarameGridCardHover(slider);
      return;
    }

    const goToSecond = () => {
      if (!slider.swiper || slider.swiper.slides.length < 2) return;
      slider.swiper.slideTo(1);
    };

    const armSlider = () => {
      marameEnsureCardSlider(slider).then(() => {
        requestAnimationFrame(goToSecond);
      });
    };

    const card = slider.closest(".product-card");
    slider.addEventListener("mouseenter", armSlider);
    slider.addEventListener("touchstart", armSlider, { passive: true, once: true });

    slider.addEventListener("mouseleave", function () {
        if (!slider.swiper) return;
        slider.swiper.slideTo(0);
        const activeSlide = slider.querySelector('.swiper-slide-active');
        if (activeSlide && activeSlide.hasAttribute('data-color-img')) {
            slider.swiper.slideTo(0);
        }
    });
  });

  document.querySelectorAll(`.buy-the-look__content__details__item__img__slider`).forEach(slider => {
    slider.addEventListener("mouseenter",function(e){
        // console.log("mouseenterrrrrrrr");
        if(slider.querySelector(`.swiper-slide:nth-child(1).swiper-slide-active`)){
            slider.swiper.slideTo(1);
        }
    });
    slider.addEventListener("mouseleave",function(e){
        // console.log("mouseleaveeeeeeee");
        if(slider.querySelector(`.swiper-slide:nth-child(2).swiper-slide-active`)){
            slider.swiper.slideTo(0);
        }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.querySelector("[data-marame-shuffle='true']")) {
    proCardHoverState();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const announcementBar = document.querySelector(".announcement_bar_row");
  const header = document.querySelector(".header");
  const filters = document.querySelector(".filters");
  const lookbooks = document.querySelectorAll(".lookbook_popup_main");
  const lookbookCloses = document.querySelectorAll(".lookbook_popup_main .close");

  if (!announcementBar || !header) return;

  const isMarameCollection =
    document.documentElement.hasAttribute("data-marame-collection") ||
    document.querySelector("[data-marame-shuffle='true']");

  if (isMarameCollection) {
    announcementBar.style.transform = "";
    header.style.top = "";
    if (filters) filters.style.top = "";
    lookbooks.forEach((lb) => {
      lb.style.top = "";
      lb.style.height = "";
    });
    lookbookCloses.forEach((close) => {
      close.style.top = "";
    });
    return;
  }

  function updateHeaderPosition() {
    const barHeight = announcementBar.offsetHeight;
    const headerHeight = header.offsetHeight;
    const currentScroll = window.scrollY;

    if (currentScroll > 0) {
      // Scrolling down
      announcementBar.style.transform = `translateY(-${barHeight}px)`;
      header.style.top = "0";

      if (filters) filters.style.top = headerHeight + "px";

      lookbooks.forEach(lb => {
        lb.style.top = headerHeight + "px";
        lb.style.height = `calc(100% - ${headerHeight}px)`;
      });

      lookbookCloses.forEach(close => {
        close.style.top = headerHeight + "px";
      });

    } else {
      // Top of page or scrolling up
      announcementBar.style.transform = "translateY(0)";
      header.style.top = barHeight + "px";

      if (filters) filters.style.top = headerHeight + barHeight + "px";

      lookbooks.forEach(lb => {
        lb.style.top = headerHeight + barHeight + "px";
        lb.style.height = `calc(100% - ${headerHeight + barHeight}px)`;
      });

      lookbookCloses.forEach(close => {
        close.style.top = headerHeight + barHeight + "px";
      });
    }
  }

  // Run on load
  updateHeaderPosition();

  // Run on scroll
  window.addEventListener("scroll", updateHeaderPosition, { passive: true });

  // Run on resize
  window.addEventListener("resize", updateHeaderPosition);

  // custom product page select box
  let proSelectBtns = document.querySelectorAll("[data-pro-custom-select-btn]");
  proSelectBtns.forEach(btns => {
    btns.addEventListener("click",function(e){
        marameLog("clickkkk");
        e.preventDefault();
        marameLog("custom select btn clicked",btns);
            btns.closest(".pro-custom-select-button").classList.add("active");
        // btns.closest("[data-pro-custom-select]").classList.toggle("Show_drop");
       if (btns.closest(".pro-custom-select-button.custm")) 
        {
            btns.closest(".pro-custom-select-button.custm").classList.toggle("Show_drop");
        }
    });
  });

});

document.addEventListener("DOMContentLoaded", function () {

    function handleWrap() {
        const proSelect = document.querySelector(".pro-custom-select-list");
        const arrow = document.querySelector(".custom_arrow_selector");

        if (!proSelect && !arrow) return;

        const parent = (proSelect || arrow).parentElement;

        if (parent.classList.contains("custom-select-custom-arrow")) return;

        const wrapper = document.createElement("div");
        wrapper.classList.add("custom-select-custom-arrow");

        const innerDiv = document.createElement("div");
        innerDiv.classList.add("custom-select-custom-arrow-close");

        parent.insertBefore(wrapper, proSelect || arrow);

        wrapper.appendChild(innerDiv);

        if (proSelect) wrapper.appendChild(proSelect);
        if (arrow) wrapper.appendChild(arrow);
    }

    handleWrap();
    window.addEventListener("resize", handleWrap);

    // SHOP THE LOOK
    const shop_swiper = document.querySelector(".shop-the-look .buy-the-look__content___details");
    if(shop_swiper){
    var shopSwiper = new Swiper(".shop-the-look .buy-the-look__content___details", {
    slidesPerView: 2,
    spaceBetween: 10,
    grid: {
        rows: 2,
        fill: "row",
    },
    navigation: {
        nextEl: ".shop-the-look-next",
        prevEl: ".shop-the-look-prev",
    },
    breakpoints: {
        768: {
        slidesPerView: 4,
        spaceBetween: 24,
        grid: {
            rows: 1,
        },
        },
    },
    });
    }

    // STYLE IT WITH
    const style_swiper = document.querySelector(".shop-the-look .buy-the-look__content___details");
    if(style_swiper){
    var styleSwiper = new Swiper(".style-it-with .buy-the-look__content___details", {
    slidesPerView: 2,
    spaceBetween: 10,
    grid: {
        rows: 2,
        fill: "row",
    },
    navigation: {
        nextEl: ".style-it-with-next",
        prevEl: ".style-it-with-prev",
    },
    breakpoints: {
        768: {
        slidesPerView: 4,
        spaceBetween: 24,
        grid: {
            rows: 1,
        },
        },
    },
    });
    }
});

document.addEventListener('DOMContentLoaded', function () {
  function setBuyLookHeight() {
    var containers = document.querySelectorAll('.buy-the-look__content___details');
    containers.forEach(function(container) {
      container.style.height = 'auto';
      if (window.innerWidth <= 767) {
        var item = container.querySelector('.buy-the-look__content__details__item');
        if (item) {
          var itemHeight = item.offsetHeight;
          var finalHeight = (itemHeight * 2) + 44;
          container.style.height = finalHeight + 'px';
        }
      }
    });
  }
  setBuyLookHeight();

  window.addEventListener('resize', function() {
    setBuyLookHeight();
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var parents = document.querySelectorAll('.buy-the-look__content--item');
  parents.forEach(function(parent) {
    var items = parent.querySelectorAll('.buy-the-look__content__details__item');
    var count = items.length;
    if (count >= 4) {
      parent.classList.add('show-arrow');
    } else {
      parent.classList.remove('show-arrow');
    }
  });
});

// Model JS

function updateModelPopoverPosition() {
  const visibleImage = document.querySelector(".product .detail__sliders__main .zoom-element:not(.model-hidden)");
  const popover = document.querySelector(".model-size-popover");

  if (!visibleImage || !popover) return;

  const imageHeight = visibleImage.offsetHeight;
  const popoverHeight = popover.offsetHeight;
  const finalTop = imageHeight - popoverHeight;

  popover.style.top = finalTop + "px";
}

function resetModelState() {
  const sliderWrapper = document.querySelector(".detail__sliders");
  if (!sliderWrapper) return;

  document.querySelectorAll(".selected-model-fit-text").forEach(function (el) {
    el.textContent = "";
  });

  document.querySelectorAll("[data-model-trigger]").forEach(function (btn) {
    btn.classList.remove("active");
  });

  sliderWrapper.querySelectorAll("[data-model]").forEach(function (item) {
    const itemModel = item.getAttribute("data-model");

    if (itemModel) {
        item.classList.add("model-hidden");
    } else {
        item.classList.remove("model-hidden");
    }
  });

  setTimeout(updateModelPopoverPosition, 100);
}

function syncModelState(modelKey) {

  const sliderWrapper = document.querySelector(".detail__sliders");
  if (!sliderWrapper || !modelKey) return;

  document.querySelectorAll("[data-model-trigger]").forEach(function (btn) {
    btn.classList.toggle("active", btn.getAttribute("data-model-trigger") === modelKey);
  });

    const activeModelBtn = document.querySelector("[data-model-trigger].active");
        const fitText = activeModelBtn?.getAttribute("data-model-fit-text");

        const fitFabricText = document.querySelector(".fit-fabric .accordion-content p");

        if (fitFabricText && fitText) {

        let currentHtml = fitFabricText.innerHTML;

        currentHtml = currentHtml.replace(
            /[A-Za-z]+\sis\s\dft\s\d+\s?\/\s?\d+cm\sand\sis\swearing\sa\sSize\s\d+\./g,
            fitText
        );

        fitFabricText.innerHTML = currentHtml;
    }

  sliderWrapper.querySelectorAll("[data-model]").forEach(function (item) {
    const itemModel = item.getAttribute("data-model");
    item.classList.toggle("model-hidden", itemModel !== modelKey);
  });

  document.querySelectorAll("[data-model-switcher]").forEach(function (switcher) {
    const title = switcher.querySelector(".model-size-popover__title");
    const activeBtn = switcher.querySelector("[data-model-trigger].active span");

    if (title && activeBtn) {
        const activeImage = switcher.querySelector("[data-model-trigger].active img");
        if (activeImage) title.textContent = activeImage.getAttribute("alt");
    }
  });

  setTimeout(updateModelPopoverPosition, 100);
}

function getFitFabricTextEl() {
  return document.querySelector(".fit-fabric .accordion-content p");
}

function storeFitFabricOriginalText(force = false) {
  const fitFabricText = getFitFabricTextEl();
  if (!fitFabricText) return;

  if (force || !fitFabricText.dataset.originalHtml) {
    fitFabricText.dataset.originalHtml = fitFabricText.innerHTML;
  }
}

function resetFitFabricTextFromVariant() {
  fetch(window.location.href)
    .then(function (response) {
      return response.text();
    })
    .then(function (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const newFitContent = doc.querySelector(".fit-fabric .accordion-content");
      const currentFitContent = document.querySelector(".fit-fabric .accordion-content");

      if (newFitContent && currentFitContent) {
        currentFitContent.innerHTML = newFitContent.innerHTML;
      }
    })
    .catch(function (error) {
      console.error("Fit & Fabric reset error:", error);
    });
}

function initDifferentModelSwitcher() {
  storeFitFabricOriginalText(true);
  resetModelState();
  setTimeout(updateModelPopoverPosition, 300);
}

function reApplyActiveModel() {
  setTimeout(function () {
    const activeBtn = document.querySelector("[data-model-trigger].active");

    if (activeBtn) {
      syncModelState(activeBtn.getAttribute("data-model-trigger"));
    } else {
      resetModelState();
    }

    updateModelPopoverPosition();
  }, 100);
}

document.addEventListener("click", function (event) {
  const changeBtn = event.target.closest(".model-size-popover__change");

  if (changeBtn) {
    event.preventDefault();

    const popover = changeBtn.closest(".model-size-popover");

    document.querySelectorAll(".model-size-popover").forEach(function (item) {
      if (item !== popover) item.classList.remove("is-open");
    });

    popover?.classList.remove("hidden");
    popover?.classList.remove("half-close");
    popover?.classList.toggle("is-open");

    setTimeout(updateModelPopoverPosition, 100);
    return;
  }

  const closeBtn = event.target.closest(".model-size-popover__close");

  if (closeBtn) {
    event.preventDefault();

    const popover = closeBtn.closest(".model-size-popover");

    if (popover) {
      popover.classList.remove("is-open");

      if (window.innerWidth <= 767) {
        if (!popover.classList.contains("half-close")) {
          popover.classList.add("half-close");
        }
      } else {
        // popover.classList.add("hidden");
      }
    }

    setTimeout(updateModelPopoverPosition, 100);
    return;
  }

  const modelBtn = event.target.closest("[data-model-trigger]");

  if (modelBtn) {
    const modelKey = modelBtn.getAttribute("data-model-trigger");

    syncModelState(modelKey);

    document.querySelectorAll(".model-size-popover").forEach(function (popover) {
        popover.classList.remove("is-open");

        if (window.innerWidth <= 767) {
            popover.classList.add("half-close");
        }
    });

    setTimeout(function () {

        if (typeof sliderUpdate === "function") {
            sliderUpdate();
        }

        updateModelPopoverPosition();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {

            document.documentElement.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            document.body.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            });
        });

    }, 250);

    return;
  }

  document.querySelectorAll(".model-size-popover.is-open").forEach(function (pop) {
    if (!pop.contains(event.target)) {
      pop.classList.remove("is-open");
    }
  });

  setTimeout(updateModelPopoverPosition, 100);
});

window.addEventListener("load", function () {
  setTimeout(updateModelPopoverPosition, 300);
});

window.addEventListener("resize", updateModelPopoverPosition);
document.addEventListener("DOMContentLoaded", initDifferentModelSwitcher);

// Cart JS

  function setFirstPreOrderClass() {
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    if (!cartDrawer) return;

    const preOrders = cartDrawer.querySelectorAll('.product-option.pre-orders');

    preOrders.forEach((item) => {
      item.classList.remove('pre-orders-first-item');
    });

    if (preOrders.length) {
      preOrders[0].classList.add('pre-orders-first-item');
    }
  }

  document.addEventListener('DOMContentLoaded', setFirstPreOrderClass);
  document.addEventListener('cart:updated', setFirstPreOrderClass);
  document.addEventListener('cart-drawer:updated', setFirstPreOrderClass);

  const cartDrawerObserver = new MutationObserver(setFirstPreOrderClass);

  document.addEventListener('DOMContentLoaded', function () {
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    if (cartDrawer) {
      cartDrawerObserver.observe(cartDrawer, {
        childList: true,
        subtree: true
      });
    }
  });