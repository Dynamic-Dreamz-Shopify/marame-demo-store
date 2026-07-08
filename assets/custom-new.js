const successfully_ATC_Timing = 4000;

document.addEventListener("DOMContentLoaded", function () {
    console.log("calling custom-new.js");
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
    console.log("product_grid_size_option");
    document.querySelectorAll(".product--grid--main .size-select__options .option").forEach(function (single_size_option) {
        single_size_option.addEventListener("click", function () {
            console.log("grid size clicked");
            if(this.classList.contains("option--out-of-stock")){
                console.log("OOS");
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
}

function product_grid_ATC() {
    document.querySelectorAll(".product--grid--main .atc_JS").forEach(function (atc_JS) {
        atc_JS.addEventListener("click", function (event) {
            console.log("atc_JS",atc_JS);
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
            console.log("tempATC",tempATC);
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
        });
    }, 500);
}

check_size_option();

function cart_add_fetch(form) {
    console.log("cart_add_fetch>>>>>>>>>>>",form);
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

            console.log("variant_price:--",variant_price);
            

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
                  console.log("clickkkk");
                //remove custom select active class
                document.querySelectorAll(`[data-pro-custom-select]`).forEach(select => {
                    select.classList.remove("active");
                });
                // this.closest("[data-pro-custom-select]")?.classList.add("selected");
                this.closest("[data-pro-custom-select]")?.classList.remove("select-alert");
                this.closest("[data-pro-custom-select-list]").querySelector("li.active")?.classList.remove("active");
                if(this.closest("[data-pro-custom-select]")) this.closest("[data-pro-custom-select]").querySelector("[data-pro-custom-select-btn] .s-text").innerHTML = this.innerHTML;
                console.log("pdp opt clicked");
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

                    // Do not refresh full Fit & Fabric content here.
                    // Model switcher will update only model line.

                
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


// ── Unisex image filter helper ──────────────────────────────────────
function getGenderedCollection() {
    var c = (localStorage.getItem("collection") || "").toLowerCase();
    if (c.includes("women") || c.includes("womens")) return "womens";
    if (c.includes("mens") || c === "men")            return "mens";
    if (c.includes("eyewear-1") || c.includes("mens")) return "mens";
    if (c.includes("eyewear") || c === "womens")            return "womens";

    
    
    return null; // not a gendered collection — show all
}

function filterUnisexImages(images, productType) {
    var gender = getGenderedCollection();
    var isUnisex = (productType || "").toLowerCase().trim() === "unisex";

    if (!isUnisex || !gender) return images;

    return images.filter(function(img) {
        var alt = (img.alt || "").toLowerCase();

        // Match "man " or "woman " at start of alt text
        var isMensImg   = /^(man|men)\b/.test(alt);
        var isWomensImg = /^wom/.test(alt); 

        // No gender tag — always show
        if (!isMensImg && !isWomensImg) return true;

        if (gender === "womens" && isMensImg)   return false;
        if (gender === "mens"   && isWomensImg) return false;
        return true;
    });
}
// ── End helper ──────────────────────────────────────────────────────

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
    // console.warn('Swiper not found — initializing manually for', swiperEl);
    initSwiperOnElement(swiperEl);
    setTimeout(() => {
      if (swiperEl.swiper) callback(swiperEl.swiper);
      else console.error('Swiper failed to initialize on', swiperEl);
    }, 100);
    return;
  }

  setTimeout(() => waitForSwiper(swiperEl, callback, retries - 1), 200);
  }

function initSwiperOnElement(slider) {

    slider.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) img')
        .forEach((img, i) => {
            if (i < 2 && img.dataset.src) img.src = img.dataset.src;
        });

    if (slider.swiper) return slider.swiper;

    const realSlideCount = slider.querySelectorAll(
        '.swiper-slide:not(.swiper-slide-duplicate)'
    ).length;

    function buildBullets(count) {
        const paginationEl = slider.querySelector('.swiper-pagination');
        if (!paginationEl || count <= 1) return;

        paginationEl.innerHTML = Array.from({ length: count })
            .map((_, i) =>
                `<span class="swiper-pagination-bullet${i === 0 ? ' swiper-pagination-bullet-active' : ''}"></span>`
            ).join('');
    }

    function syncBullets(swiper) {
        const paginationEl = slider.querySelector('.swiper-pagination');
        if (!paginationEl) return;

        const bullets = paginationEl.querySelectorAll('.swiper-pagination-bullet');
        if (!bullets.length) return;

        const realIndex = swiper.realIndex % bullets.length;

        bullets.forEach((b, i) => {
            b.classList.toggle('swiper-pagination-bullet-active', i === realIndex);
        });
    }

    buildBullets(realSlideCount);
    slider._buildBullets = buildBullets;
    slider._syncBullets = syncBullets;

    const smoothSpeed = 650;

    return new Swiper(slider, {
        loop: false,
        rewind: true,

        speed: smoothSpeed,
        cssMode: false,
        grabCursor: true,
        watchOverflow: true,

        slidesPerView: 1,
        slidesPerGroup: 1,
        centeredSlides: false,

        touchRatio: 0.85,
        threshold: 1,
        longSwipesMs: 400,
        longSwipesRatio: 0.18,
        shortSwipes: true,
        followFinger: true,
        touchStartPreventDefault: false,

        simulateTouch: true,
        allowTouchMove: true,
        touchReleaseOnEdges: false,

        resistance: true,
        resistanceRatio: 0.98,

        // Important: allow next slide immediately
        preventInteractionOnTransition: false,

        virtualTranslate: false,
        watchSlidesProgress: false,

        pagination: false,

        navigation: {
            nextEl: slider.querySelector('.swiper-button-next'),
            prevEl: slider.querySelector('.swiper-button-prev'),
        },

        observer: true,
        observeParents: true,

        on: {
            init(swiper) {
                syncBullets(swiper);
            },

            touchEnd(swiper) {
                swiper.params.speed = smoothSpeed;
            },

            navigationNext(swiper) {
                swiper.params.speed = smoothSpeed;
            },

            navigationPrev(swiper) {
                swiper.params.speed = smoothSpeed;
            },

            slideChangeTransitionStart(swiper) {
                swiper.params.speed = smoothSpeed;
            },

            slideChange(swiper) {
                syncBullets(swiper);
            },

            transitionEnd(swiper) {
                syncBullets(swiper);
            }
        },
    });
}

// ✅ Use this on page load instead of inline new Swiper()
document.querySelectorAll('.product-card__img-new-slider').forEach((slider) => {
//   initSwiperOnElement(slider);
if (!slider.swiper) {
        initSwiperOnElement(slider);
    }
});
 

  // Helper: Attach swipe only once
  function attachSwipeOnce(swiperEl, swiper) {
    // if (swiperEl.dataset.swipeAttached) return;
    // swiperEl.dataset.swipeAttached = "true";

    // let startX = 0;

    // swiperEl.addEventListener('touchstart', e => {
    //   startX = e.touches[0].clientX;
    // }, { passive: true });

    // swiperEl.addEventListener('touchend', e => {
    //   const endX = e.changedTouches[0].clientX;
    //   const diff = endX - startX;

    //   if (Math.abs(diff) < 20) return;

    //   if (diff < 0) {
    //     const nextIndex = Math.min(swiper.slides.length - 1, swiper.realIndex + 1);
    //     swiper.slideTo(nextIndex, 300);
    //   } else {
    //     const prevIndex = Math.max(0, swiper.realIndex - 1);
    //     swiper.slideTo(prevIndex, 300);
    //   }
    // });
    return;
  }


    document.addEventListener('sezerium:variant:initialize', (event) => {
    const { el, variant } = event.detail;
    const sez_variantName = variant.option1?.toLowerCase();
    const sez_variantId = parseInt(variant.id, 10);

        // assign slider
        document.querySelectorAll('#MainContent section.listing .listing__list .listing__item .product-card__img-new-slider').forEach(slider => {
            if (!slider.swiper) {
                initSwiperOnElement(slider);
            }
        });

    setTimeout(() => {
        console.log("variant:--",variant);
      const currentCard = el.closest(".sezerium-product");
      if (!currentCard) return;

      const variantId = parseInt(currentCard.getAttribute("data-sezerium-variant"), 10);
      if (sez_variantId !== variantId) return;

      const swatches = currentCard.querySelectorAll(".single_product_new");
    //   console.log("swatches:---",swatches);
    //   if (!swatches.length) return;

        if (!swatches.length) {
            const card = currentCard.querySelector(".product-card");
            const swiperEl = card?.querySelector(".product-card__img-new-slider");
            if (!swiperEl) return;

            waitForSwiper(swiperEl, (swiper) => {
                // No color variant to filter by — just ensure swiper is ready/updated
                swiper.update();
                attachSwipeOnce(swiperEl, swiper);
            });
            return;
        }

      swatches.forEach(swatch => {
        const color = swatch.getAttribute("data-color")?.toLowerCase();

        // Reset all swatches
        swatch.classList.remove("fisrt_swatch", "active");
        swatch.classList.add("hidden");

        // Activate matching swatch
        if (color === sez_variantName) {
          swatch.classList.add("fisrt_swatch", "active");
          swatch.classList.remove("hidden");
       
        const desktopPatternMap = {
            "has-metafield": [4, 8, 16],
            "has-metafield-3": [15]
            };

            const mobilePatternMap = {
            "has-metafield--m": [3, 11, 19, 27],
            "has-metafield-3--m": [8, 16, 24, 32]
            };


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
        //     console.log("selectedColor:--",selectedColor);
        //   console.log("get_pro_id:---",get_pro_id);
          const jsonEl = document.querySelector(".variant-images-json[data-product-id='" + get_pro_id + "']");
        //   console.log("jsonEl:----",jsonEl);
          if (!jsonEl) return;

          const variantImages = JSON.parse(jsonEl.textContent);
          const variantData = Object.values(variantImages).find(v => v.color === selectedColor);
        //   console.log("variantData:---",variantData);
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

            // console.log("comingSoonData:", comingSoonData);

            const hasComingSoon = comingSoonData.some(value => value);

            if (hasComingSoon) {
                listingItem.setAttribute("data-coming-soon", "true");
            } else {
                listingItem.removeAttribute("data-coming-soon");
            }

            // console.log("sizeInventory:--",sizeInventory);

            const sizeItems = currentCard.querySelectorAll(".size_option");
        // console.log("sizeItems:--",sizeItems);

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
        //   console.log("offsetWidth:--",swiperEl.offsetWidth);
          if (!swiperEl) return;
          waitForSwiper(swiperEl, (swiper) => {
            var productType = currentCard.closest(".listing__item")?.getAttribute("data-product-type") || "";
            var imagesToShow = filterUnisexImages(variantData.images, productType);
            if (!imagesToShow.length) imagesToShow = variantData.images;
            updateSwiperImagesSmooth(swiperEl, swiper, imagesToShow, get_href);

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

/* ADD THIS HERE START */
async function setSlideImage(imgEl, src) {
  const pre = new Image();
  pre.src = src;
  try { await pre.decode(); } catch (e) {}
  imgEl.src = src;
}

function updateSwiperImagesSmooth(swiperEl, swiper, images, get_href) {
    if (!swiperEl || !swiper || !images || !images.length) return;
 
    /* Mark "changing" so CSS can hide a flash (optional) */
    swiperEl.classList.add('is-changing');
 
    /* FIX 6 – preload ALL images before touching the DOM */
    const preloadPromises = images.map(img => new Promise(resolve => {
        const pre = new Image();
        if (img.srcset) pre.srcset = img.srcset;
        pre.src = img.src;
        pre.onload  = resolve;
        pre.onerror = resolve;
    }));
 
    Promise.all(preloadPromises).then(() => {
        const wrapper = swiper.wrapperEl;
 
        /* FIX 7 – pause Swiper events while we mutate the DOM */
        swiper.allowSlideNext = false;
        swiper.allowSlidePrev = false;
 
        /* Only target real (non-cloned) slides */
        const currentSlides = Array.from(
            wrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')
        );
 
        /* Update / add real slides */
        images.forEach((img, index) => {
            let slide = currentSlides[index];
 
            if (!slide) {
                slide = document.createElement('a');
                slide.className = 'product-card__img swiper-slide';
                wrapper.appendChild(slide);
            }
 
            slide.href = get_href;
            slide.setAttribute('data-alt', img.alt || '');
            slide.setAttribute('aria-label', `Read more about ${img.alt || ''}`);
 
            let imgEl = slide.querySelector('img');
            if (!imgEl) {
                imgEl = document.createElement('img');
                imgEl.sizes   = '(max-width: 767px) 100vw, 544px';
                imgEl.loading = index === 0 ? 'eager' : 'lazy';
                imgEl.decoding = 'async';
                slide.appendChild(imgEl);
            }
 
            imgEl.alt = img.alt || '';
            if (img.width)  imgEl.width  = img.width;
            if (img.height) imgEl.height = img.height;
            if (img.srcset) imgEl.srcset = img.srcset;
 
            /* Already preloaded — direct assignment, no blink */
            imgEl.src = img.src;
        });
 
        /* Remove surplus slides */
        for (let i = images.length; i < currentSlides.length; i++) {
            currentSlides[i].remove();
        }
 
        /* Rebuild bullets for new count */
        if (typeof swiperEl._buildBullets === 'function') {
            swiperEl._buildBullets(images.length);
        }
 
        /* FIX 8 – recreate loop clones WITHOUT causing a visible jump:
           disable transition, jump to slide 0, THEN recreate clones */
        swiper.params.loop = false;
        swiper.wrapperEl.style.transitionDuration = "0ms";

        swiper.updateSlides();
        swiper.updateSize();
        swiper.update();
        swiper.slideTo(0, 0, false);
 
        /* Let the browser paint, then restore transition */
        requestAnimationFrame(() => {
            swiper.wrapperEl.style.transitionDuration = '';
            swiper.update();
 
            if (swiper.navigation && typeof swiper.navigation.update === 'function') {
                swiper.navigation.update();
            }
 
            if (typeof swiperEl._syncBullets === 'function') {
                swiperEl._syncBullets(swiper);
            }
 
            /* Re-enable touch */
            swiper.allowSlideNext = true;
            swiper.allowSlidePrev = true;
 
            swiperEl.classList.remove('is-changing');
        });
    });
}

window.addEventListener('load', () => {
  // release scroll
  document.body.removeAttribute('data-lenis-prevent');
  document.documentElement.removeAttribute('data-lenis-prevent');
  document.documentElement.classList.remove('lenis-stopped');

  // close drawers/overlays
  document.querySelector('.color_drawer-main')?.classList.remove('active');
  document.querySelector('.color_drawer-main_layer')?.classList.add('hidden');
  document.querySelectorAll('.new-filters-drawer-overlay, .search-modal-overlay')
    .forEach(o => o.classList.remove('active'));
});

function attachSwipeOnce(swiperEl, swiper) {
//   if (!swiperEl || !swiper) return;
//   if (swiperEl.dataset.swipeAttached) return;

//   swiperEl.dataset.swipeAttached = "true";

//   let startX = 0;

//   swiperEl.addEventListener("touchstart", e => {
//     startX = e.touches[0].clientX;
//   }, { passive: true });

//   swiperEl.addEventListener("touchend", e => {
//     const endX = e.changedTouches[0].clientX;
//     const diff = endX - startX;

//     if (Math.abs(diff) < 20) return;

//     if (diff < 0) {
//       swiper.slideTo(Math.min(swiper.slides.length - 1, swiper.realIndex + 1), 300);
//     } else {
//       swiper.slideTo(Math.max(0, swiper.realIndex - 1), 300);
//     }
//   }, { passive: true });
return;
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

    const variantData = Object.values(variantImages).find(v => {
      return String(v.color).toLowerCase().trim() === String(selectedColor).toLowerCase().trim();
    });

     const comingSoonData = Object.values(variantImages)
    .filter(v => String(v.color).toLowerCase().trim() === String(selectedColor).toLowerCase().trim())
    .map(v => v.coming_soon); 

    console.log("comingSoonData:", comingSoonData);

    const sizeInventory = Object.values(variantImages)
      .filter(v => String(v.color).toLowerCase().trim() === String(selectedColor).toLowerCase().trim())
      .map(v => ({
        size: v.size,
        qty: Number(v.inventory_quantity) || 0,
        title: v.variant_title
      }));

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

    // updateSwiperImagesSmooth(swiperEl, swiper, variantData.images, get_href);

    var productType = el.closest(".listing__item")?.getAttribute("data-product-type") || "";
    var imagesToShow = filterUnisexImages(variantData.images, productType);
    if (!imagesToShow.length) imagesToShow = variantData.images; // fallback: show all if none match
    updateSwiperImagesSmooth(swiperEl, swiper, imagesToShow, get_href);

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

        console.log("click on atc button");
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

        e.preventDefault();

        const wrapper = btn.closest(".filters");
        if (!wrapper) return;

        // console.log('clicked this',e.target.id)
        if(e.target.id == 'secondary-clear-button'){
            return;
        }
         // close others
        wrapper.querySelectorAll(".filters_data").forEach(el => {
            window.scrollTo(0,0);
             el.classList.toggle("hidden");
             const Filter_datac = el.getAttribute("class");
             if (Filter_datac.includes('hidden')) 
             {
                document.querySelector("html").classList.remove("lenis-stopped");
                document.body.removeAttribute("data-lenis-prevent",true);
                document.documentElement.removeAttribute("data-lenis-prevent",true);
             }
             else
            {
                document.querySelector("html").classList.add("lenis-stopped");
                document.body.setAttribute("data-lenis-prevent",true);
                document.documentElement.setAttribute("data-lenis-prevent",true);
            }
           
        });
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
             document.querySelector("html").classList.remove("lenis-stopped");
             document.body.removeAttribute("data-lenis-prevent",true);
             document.documentElement.removeAttribute("data-lenis-prevent",true);
        });
    });

function quick_add() {
    //Ak custom code #speed
    if (window._quickAddBound) return;
    window._quickAddBound = true;
    //Ak custom code #speed
  document.addEventListener("click", function (e) {

    const sizeItem = e.target.closest(".size_option");
    if (!sizeItem) return;
    
     if (sizeItem.classList.contains("out-of-stock")) {
        e.preventDefault();
        return; // stop selection but allow click detection
        console.log("hhh");
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

    console.log("Looking for:", color_size);

    const jsonEl = document.querySelector(
    `.variant-images-json[data-product-id="${productId}"]`
    );
    if (!jsonEl) return;

    const variantJson = JSON.parse(jsonEl.textContent);

    const variantData = Object.values(variantJson).find(v =>
    v.variant_title?.trim() === color_size.trim()
    );
    console.log(variantData.variant_id)
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
    //Ak custom code #speed
    if (window._quickAddPdpBound) return;
    window._quickAddPdpBound = true;
    //Ak custom code #speed

  document.addEventListener("click", function (e) {

    const sizeItem = e.target.closest(".size_option");
    if (!sizeItem) return;
    
     if (sizeItem.classList.contains("out-of-stock")) {
        e.preventDefault();
        return; // stop selection but allow click detection
        console.log("hhh");
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

    console.log("Looking for pdp:", color_size);

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
            console.log('back_btn',back_btn);
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
    console.log('clicked',btn);

    const selected_filter_value = btn.dataset.value;
    const selected_filter_div = btn.dataset.filter;

    console.log('selected_filter_div',selected_filter_div)
    console.log('selected_filter_value',selected_filter_value)
    document.querySelectorAll(`.filter-panel__list__group[data-filter-cols="${selected_filter_div}"]`).forEach(wrapper => {
        const input = wrapper.querySelector(`.filter-panel__item[data-optname="${selected_filter_value}"]`);
        console.log("input:--",input);
        if (input) {
            
            input.click();
            input.classList.remove('selected');
            
        }
        });
    });

    document.addEventListener("click",function(e){
        const btn = e.target.closest(".apply_btn_cstm");
        if(!btn) return;
        document.querySelector("[data-filter-action-btn-view]").click();
       
        // clearTimeout(window.priceFilterTimer);
        // window.priceFilterTimer = setTimeout(() => {
        //     submitPriceFilter();
        // }, 400);
    });




if (document.querySelector("#sort-by-collection-product")) {
    document.querySelector("#sort-by-collection-product").addEventListener("change", function () {
        var selectedOption = this.options[this.selectedIndex],
            dataSortValue = selectedOption.getAttribute("data_sort"),
            url = new URL(window.location.href);

        url.searchParams.set("sort_by", dataSortValue);
        
        history.replaceState({}, "", url.toString());

        fetch(window.location.href)
            .then(response => {
                return response.text();
            })
            .then(responseData => {
                var parser = new DOMParser(),
                    new_sortBy_HTML = parser.parseFromString(responseData, "text/html"),
                    fetchNewHTML = new_sortBy_HTML.querySelector("#MainContent section.listing").innerHTML;

                document.querySelector("#MainContent section.listing").innerHTML = fetchNewHTML;

                const closeBtn = document.querySelector(".cloase_filter_cstm");
                  closeBtn?.click();
                
                var clear_button = document.querySelectorAll("#main-clear-button,#secondary-clear-button");

                console.log("clear_button:--",clear_button);
                clear_button.forEach(function (clear_BTN) {
                    
                    
                clear_BTN.classList.add("enabled");
                clear_BTN.classList.remove('hidden');
                setTimeout(function(){
                    console.log("attr removed");
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

                
                load_listing_script();
                load_init_scripts_script();

                product_grid_size_option();
                product_grid_ATC();
                load_more_product_JS();
                iWish.init();
                product_media_update();
                check_size_option();
                grid_metafield_product();
                grid_option_controls();
                custom_sezerium();


                // var clear_button = document.querySelectorAll("#main-clear-button,#secondary-clear-button");

                // console.log("clear_button:--",clear_button);
                // clear_button.forEach(function (clear_BTN) {
                    
                    
                // clear_BTN.classList.add("enabled");
                // clear_BTN.classList.remove('hidden');
                // setTimeout(function(){
                //     console.log("attr removed");
                //     console.log("clear_BTN:--",clear_BTN);
                //     clear_BTN.removeAttribute('disabled');
                //     console.log("clear_BTN:--",clear_BTN);
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
}

function collection_pro_filter() {
    const filterWrapper = document.querySelector(".filters__left__secondary");
    const comman_filter = document.querySelector(".filter-panels");

    if (comman_filter) {
        var filter_url = "",
            view_button = document.querySelectorAll("#main-view-button,#secondary-view-button"),
            clear_button = document.querySelectorAll("#main-clear-button,#secondary-clear-button");

    //Ak custom code #speed
    if (!window._collectionFilterBound) {
     window._collectionFilterBound = true;
    //Ak custom code #speed
     document.addEventListener("click", function (event) {
    // check if the clicked element matches your buttons
    const view_BTN = event.target.closest("#main-view-button, #secondary-view-button");
    if (!view_BTN) return; // exit if it's not a target button
        // view_button.forEach(function (view_BTN) {
            // view_BTN.addEventListener("click", function () {
                const selectedItems = view_BTN.closest(".filter-panels").querySelectorAll(".filter-panel__item.selected");
                console.log('selectedItems.length',selectedItems.length);
                // if (selectedItems.length === 0) return;
                // let url = new URL(window.location.href);

                // for (const key of url.searchParams.keys()) {
                //     console.log('key',key);
                //     if (key.startsWith("filter.v.t.shopify.")) {
                //         url.searchParams.delete(key);
                //     }
                //     if (key.startsWith("filter.v.price.")) {
                //         url.searchParams.delete(key);
                //     }
                    
                // }

                const url = new URL(window.location.href);

                [...url.searchParams.keys()].forEach(key => {
                console.log("key", key);

                if (
                    key.startsWith("filter.v.t.shopify.") ||
                    key.startsWith("filter.v.price.")
                ) {
                    url.searchParams.delete(key);
                }
                });


                if(selectedItems){
                selectedItems.forEach(function (item) {
                    const value = item.getAttribute("data-value");
                    if (value && value.includes("=")) {
                        const [param, val] = value.split("=");
                        console.log("param",param,"val",val);
                        // url.searchParams.set(param, decodeURIComponent(val));
                        url.searchParams.append(param, decodeURIComponent(val));

                        console.log("clear_button:--",clear_button);
                        clear_button.forEach(function (clear_button) {
                                clear_button?.classList.remove("hidden");
                        });
                        document.querySelector(".cloase_after_filter").classList.remove("hidden");
                        // clear_button?.classList.remove("hidden");
                        // document.querySelector(".filters_custom").classList.add("hidden");
                    }
                });
                }
                console.log("url",url.toString());
                // afterFilterApply(url);


                //Ak custom code
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
                }
                console.log("url",url.toString());
                afterFilterApply(url);
                document.querySelector(".cloase_filter_cstm")?.click();
                //End Ak custom code
            });
        //Ak custom code #speed
        }
        //Ak custom code #speed
        // });

        clear_button.forEach(function (clear_BTN) {
            clear_BTN.addEventListener("click", function () {
                const url = new URL(window.location.href);
                const initialURL = url.toString();
                url.search = "";
                if (url.toString() !== initialURL) {
                    afterFilterApply(url);
                }
                // document.querySelector(".filters_custom").classList.remove("hidden");
                clear_BTN.classList.add("hidden");
                // document.querySelector(".filters_custom")?.click();
                document.querySelector(".cloase_after_filter").classList.add("hidden");
            });
        });
        
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
                
                load_listing_script();
                load_init_scripts_script();
                product_grid_size_option();
                product_grid_ATC();
                load_more_product_JS();
                iWish.init();
                product_media_update();
                check_size_option();
                grid_metafield_product();
                grid_option_controls();
                custom_sezerium();

              
                //call function
                window.initFilterPanels?.();
                window.initPriceRangeFilter?.();

            }
        })
        .catch(error => {
            console.error("Filter fetch error:", error);
        });
}

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

function load_more_product_JS() {
    const loadMoreBtn = document.querySelector("#load_more_product_JS");
    console.log("loadMoreBtn_upp:--",loadMoreBtn);
    if (!loadMoreBtn) return;
   
    let isLoading = false;

    function loadMoreProducts() {
        const loadMoreBtn = document.querySelector("#load_more_product_JS");
        if (!loadMoreBtn) return;
        console.log("loadMoreBtn_down:--",loadMoreBtn);
       
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

        const url = new URL(data_next_page, window.location.origin);

        url.searchParams.set("page", data_current_page);

        const sortBy = getParameterByName("sort_by", location.href);
        if (sortBy) {
        url.searchParams.set("sort_by", sortBy);
        }

        const new_fetch_url = url.toString();
        console.log("Fetch URL:", new_fetch_url);
        loadMoreBtn.setAttribute("data_current_page", data_current_page);

       

        fetch(new_fetch_url)
            .then(response => response.text())
            .then(responseData => {
                const parser = new DOMParser();
                const newHTML = parser.parseFromString(responseData, "text/html");

                const fetchNewHTML = newHTML.querySelector(
                    "#MainContent section.listing .listing__list"
                )?.innerHTML;

                if (fetchNewHTML) {
                    document.querySelector(
                        "#MainContent section.listing .listing__list"
                    ).insertAdjacentHTML("beforeend", fetchNewHTML);
                }

                document.querySelectorAll(
                    "#MainContent section.listing .listing__list .listing__item.hide"
                ).forEach(item => item.classList.remove("hide"));

                /* Re-init scripts */
                load_listing_script();
                load_init_scripts_script();
                product_grid_size_option();
                product_grid_ATC();
                iWish.init();
                product_media_update();
                check_size_option();
                collection_pro_filter();
                grid_metafield_product();
                grid_option_controls();
                color_popup();
                custom_sezerium();

                if (data_current_page >= data_total_page) {
                const listingMore = loadMoreBtn.closest(".listing__more");
                if (listingMore) {
                    listingMore.style.display = "none";
                }
                window.removeEventListener("scroll", scrollHandler);

                return;
            }

                isLoading = false;
                loadMoreBtn.textContent = "View More";
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
function color_popup(){
    
  const drawer = document.querySelector(".color_drawer-main");
  const openBtns = document.querySelectorAll(".total_swatch.show_mobile");
  const closeBtn = document.querySelector(".color_close");
  const colorSwatches = document.querySelectorAll(".d-color_li");
   
  if (!drawer || !openBtns.length) return;

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
        console.log("color_name_load:--",color_name_load);
        const sub = document.querySelector(".color_drawer_sub");
        sub.textContent = color_name_load;

    //   drawer.classList.remove("hidden");
      drawer.classList.add("active");
      document.querySelector('.color_drawer-main_layer').classList.remove('hidden')
      document.body.setAttribute("data-lenis-prevent", "true");
      document.documentElement.setAttribute("data-lenis-prevent", "true");

      //Ak custom code #speed
      if (!window._colorSwatchBound) {
      window._colorSwatchBound = true;
      //Ak custom code #speed

      document.addEventListener("click", function (e) {
            const swatch = e.target.closest(".d-color_li");
            if (!swatch) return;
            e.preventDefault();

            const scope = swatch.closest(".drawer-color-list, .meta-color-select__options") || document;
            const color_name = swatch.querySelector("span").getAttribute("color_name");
            const color_vid = swatch.querySelector("span").getAttribute("data-vid");
            const sub = drawer?.querySelector(".color_drawer_sub");

            scope.querySelectorAll(".d-color_li").forEach(el => {
                el.classList.remove("active");
            });
            swatch.classList.add("active");
            sub.textContent = color_name;
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
         //Ak custom code #speed
        }
      //Ak custom code #speed
    });
  });

  // CLOSE
  closeBtn?.addEventListener("click", function (e) {
    e.preventDefault();
    console.log("in color Drawer js");
    // drawer.classList.add("hidden");
    drawer.classList.remove("active");
    document.querySelector('.color_drawer-main_layer').classList.add('hidden');
    document.querySelectorAll(".d-color_li").forEach(el => {
        el.classList.add("hidden");
    });
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

        //     console.log("category:--",category);
        //     console.log("sub_category:--",sub_category);
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

function load_accordion_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import accordion from '/cdn/shop/t/80/assets/accordion.js';
    accordion();
  `;
    document.body.appendChild(script);
}

function load_buythelookimgslider_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import buythelookimgslider from '/cdn/shop/t/80/assets/buy-the-look-img-slider.js';
    buythelookimgslider();
  `;
    document.body.appendChild(script);
}

function load_detailSliders_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import detailSliders from '/cdn/shop/t/80/assets/detail-sliders.js';
    detailSliders();
  `;
    document.body.appendChild(script);
}

function load_misc_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import misc from '/cdn/shop/t/80/assets/misc.js';
    misc();
  `;
    document.body.appendChild(script);
}

function load_listing_script() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import initListing from '/cdn/shop/t/80/assets/listing.js';
    initListing();
  `;
    document.body.appendChild(script);
}

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
    // import initScripts from '/cdn/shop/t/52/assets/init-scripts.js';
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import initScripts from '/cdn/shop/t/80/assets/init-scripts.js';
    initScripts();
  `;
    document.body.appendChild(script);
    proCardHoverState();
}


function load_image_slider() {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
    import image_slider from '/cdn/shop/t/80/assets/image-slider.js';
    image_slider();
  `;
    document.body.appendChild(script);
    proCardHoverState();
}
document.querySelectorAll(".lookbook-quick-popup .js_popup").forEach(function (single_product) {
    single_product.addEventListener("click", function (event) {
        console.log("single_product 930");
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
            wishlist_user_login();
            iWish.init();
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



document.querySelectorAll(".searchbar .searchbar__btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
        e.preventDefault();
        const input = this.closest(".searchbar").querySelector(".searchbar__input");
        input.classList.add("searchbar__input--active");
        document.documentElement.classList.add("lenis-stopped");
    });
});

// overlay js 
const overlay_filter = document.querySelector(".new-filters-drawer-overlay");
const overlay_search = document.querySelector(".search-modal-overlay");

overlay_filter?.addEventListener("click", function () {
    console.log("click on filter overlay");
    const closeBtn = document.querySelector(".cloase_filter_cstm");
    closeBtn?.click();
});

overlay_search?.addEventListener("click", function () {
    console.log("click on search overlay");
    const closeBtn = document.querySelector("form.search.searchbar__input--active .search-close");
    closeBtn?.click();
});


function wishlist_user_login() {
    // document.querySelectorAll(".iWishAddColl").forEach(function (wishlistBTN) {
    //     wishlistBTN.addEventListener("click", function (event) {
    //         event.preventDefault();
    //         if (window.iWishData.cust == "") {
    //             localStorage.setItem("login", true);
    //             this.click();
    //             window.location.href = "/account/login";
    //         } else {
    //             localStorage.setItem("login", false);
    //         }
    //     });
    // });
}

wishlist_user_login();

document.addEventListener('click', function(e) {

  /* ---------------------------
     CHECKOUT BUTTON CLICK cart
  ---------------------------- */

  // ---------------- show popup only UK customer ------------
  const checkoutBtn = e.target.closest('.cart__ctas a.checkout_btn');
  const cus_locate = document.querySelector("body").getAttribute("data-customer-locale");
  console.log(cus_locate);
  if(cus_locate == "GB")
  {
  if (checkoutBtn) {
    const popup = document.getElementById('cart-checkbox');
    if (!popup) return;

    console.log("Checkout clicked");

    e.preventDefault(); // stop default checkout
    popup.classList.add('active');
    return;
  }
}

// ---------------- show popup to all customer ------------
//   const checkoutBtn = e.target.closest('.cart__ctas a.checkout_btn');
//   if (checkoutBtn) {
//     const popup = document.getElementById('cart-checkbox');
//     if (!popup) return;

//     console.log("Checkout clicked");

//     e.preventDefault(); // stop default checkout
//     popup.classList.add('active');
//     return;
//   }



    /* ---------------------------
     CHECKOUT BUTTON CLICK pdp
  ---------------------------- */

//    document.addEventListener('click', function(e) {

//   const accelBtn = e.target.closest('.shopify-payment-button');
//   if (accelBtn) {
//     console.log('Accelerated checkout clicked (Shop Pay / Apple Pay / etc)');

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

    console.log("Proceeding to checkout");

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

  console.log("Checkout cancelled");

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
            console.log("single_product 1011");
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
                    wishlist_user_login();
                    iWish.init();
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
                                console.log("custom select btn clicked",btn);
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
    console.log("grid_metafield_product");
    document.addEventListener("click", function (event) {
        const clicked = event.target.closest(".product--grid--main .meta-color-select__options .single_product:not(.active)");
        if (!clicked) return;
        console.log("single_product 1079");
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
                    wishlist_user_login();
                    iWish.init();
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
                wishlist_user_login();
                iWish.init();
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

// if (location.href.includes("/collections/")) {
//     var collection_handle = location.href.split("/collections/")[1].split("-")[0];
//     localStorage.setItem("collection", collection_handle);
// }

if (location.href.includes("/collections/")) {
    // Store full collection slug, not just first word
    var collection_handle = location.href.split("/collections/")[1].split(/[?#]/)[0];
    localStorage.setItem("collection", collection_handle.toLowerCase());
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

    // // For grid
    // if (localStorage.getItem("collection") == mens_collection) {
    //     document.querySelectorAll(".listing__item .product-card .product-card__img-new-slider .swiper-slide").forEach(function (swiperSlide) {
    //         if (swiperSlide.getAttribute("data_alt") == womens_collection) {
    //             swiperSlide.remove();
    //         }
    //     });
    // } else if (localStorage.getItem("collection") == womens_collection) {
    //     document.querySelectorAll(".listing__item .product-card .product-card__img-new-slider .swiper-slide").forEach(function (swiperSlide) {
    //         if (swiperSlide.getAttribute("data_alt") == mens_collection) {
    //             swiperSlide.remove();
    //         }
    //     });
    // }

    // For grid — only filter unisex products on gendered collections
    var gender = getGenderedCollection();
    if (gender) {
        document.querySelectorAll(".listing__item[data-product-type='unisex'] .product-card .product-card__img-new-slider").forEach(function(swiperEl) {
            var removedAny = false;
            var slides = Array.from(swiperEl.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)"));
            var removedAny = false;

            slides.forEach(function(slide) {
                var alt = (slide.getAttribute("data_alt") || "").toLowerCase();
                var isMensImg   = /^(man|men)\b/.test(alt);
                var isWomensImg = /^wom/.test(alt);

                if (!isMensImg && !isWomensImg) return; // no gender tag — keep

                var shouldRemove = (gender === "womens" && isMensImg) || (gender === "mens" && isWomensImg);
                if (shouldRemove) {
                    slide.remove();
                    removedAny = true;
                }
            });

            if (removedAny && swiperEl.swiper) {
                swiperEl.swiper.updateSlides();
                swiperEl.swiper.updateSize();
                swiperEl.swiper.update();
                swiperEl.swiper.slideTo(0, 0, false);
                if (typeof swiperEl._buildBullets === 'function') {
                    swiperEl._buildBullets(
                        swiperEl.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length
                    );
                }
            }
        });
    }

    setTimeout(() => {
        const product_card_img_slider = document.querySelector(".listing__item .product-card .product-card__img-new-product_card_img_slider");
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
  console.log("cart!!!");
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
    //console.log("update!!!");

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
    console.log("productSizeChartState:-----");
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
        international_sizechart_openBtn.addEventListener('click', function () {
              console.log("found ele>>>>>>000000000");
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



function proCardHoverState() {
   
  function bindSlider(slider) {
    if (!slider || slider.__hoverFixed) return;
    slider.__hoverFixed = true;

    function goToSlide(index) {
      const swiper = slider.swiper;
      if (!swiper || swiper.destroyed) return;
      if (!swiper.slides || swiper.slides.length <= index) return;
      swiper.params.loop = false;
      swiper.updateSize();
      swiper.updateSlides();
      swiper.slideTo(index, 300, true);
    }

    slider.addEventListener("mouseenter", function () {
      goToSlide(1);
    });

    slider.addEventListener("mouseleave", function () {
      goToSlide(0);
    });
  }

  document.querySelectorAll(".product-card__img-new-slider").forEach(bindSlider);
  document.querySelectorAll(".buy-the-look__content__details__item__img__slider").forEach(bindSlider);
}

document.addEventListener("DOMContentLoaded", proCardHoverState);
document.addEventListener("shopify:section:load", proCardHoverState);
proCardHoverState();


document.addEventListener("DOMContentLoaded", function () {
  const announcementBar = document.querySelector(".announcement_bar_row");
  const header = document.querySelector(".header");
  const filters = document.querySelector(".filters");
  const lookbooks = document.querySelectorAll(".lookbook_popup_main");
  const lookbookCloses = document.querySelectorAll(".lookbook_popup_main .close");

  if (!announcementBar || !header) return;

//   function updateHeaderPosition() {
//     const barHeight = announcementBar.offsetHeight;
//     const headerHeight = header.offsetHeight;
//     const currentScroll = window.scrollY;

//     if (currentScroll > 0) {
//       // Scrolling down
//       announcementBar.style.transform = `translateY(-${barHeight}px)`;
//       header.style.top = "0";

//       if (filters) filters.style.top = headerHeight + "px";

//       lookbooks.forEach(lb => {
//         lb.style.top = headerHeight + "px";
//         lb.style.height = `calc(100% - ${headerHeight}px)`;
//       });

//       lookbookCloses.forEach(close => {
//         close.style.top = headerHeight + "px";
//       });

//     } else {
//       // Top of page or scrolling up
//       announcementBar.style.transform = "translateY(0)";
//       header.style.top = barHeight + "px";

//       if (filters) filters.style.top = headerHeight + barHeight + "px";

//       lookbooks.forEach(lb => {
//         lb.style.top = headerHeight + barHeight + "px";
//         lb.style.height = `calc(100% - ${headerHeight + barHeight}px)`;
//       });

//       lookbookCloses.forEach(close => {
//         close.style.top = headerHeight + barHeight + "px";
//       });
//     }
//   }

//   // Run on load
//   updateHeaderPosition();

//   // Run on scroll
//   window.addEventListener("scroll", updateHeaderPosition);

//   // Run on resize
//   window.addEventListener("resize", updateHeaderPosition);

//Ak custom code #speed
// Heights only change on resize, so read them ONCE (not on every scroll)
  let barHeight = announcementBar.offsetHeight;
  let headerHeight = header.offsetHeight;
  let lastScrolled = null;   // remember last state so we skip redundant writes
  let ticking = false;

  function applyHeaderPosition() {
    ticking = false;
    const scrolled = window.scrollY > 0;

    // Only touch the DOM when the scrolled/not-scrolled state actually changes
    if (scrolled === lastScrolled) return;
    lastScrolled = scrolled;

    if (scrolled) {
      announcementBar.style.transform = `translateY(-${barHeight}px)`;
      header.style.top = "0";
      if (filters) filters.style.top = headerHeight + "px";
      lookbooks.forEach(lb => {
        lb.style.top = headerHeight + "px";
        lb.style.height = `calc(100% - ${headerHeight}px)`;
      });
      lookbookCloses.forEach(close => { close.style.top = headerHeight + "px"; });
    } else {
      announcementBar.style.transform = "translateY(0)";
      header.style.top = barHeight + "px";
      if (filters) filters.style.top = headerHeight + barHeight + "px";
      lookbooks.forEach(lb => {
        lb.style.top = headerHeight + barHeight + "px";
        lb.style.height = `calc(100% - ${headerHeight + barHeight}px)`;
      });
      lookbookCloses.forEach(close => { close.style.top = headerHeight + barHeight + "px"; });
    }
  }

  // Run once on load
  applyHeaderPosition();

  // On scroll: only schedule one rAF per frame (no layout reads here at all)
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(applyHeaderPosition); ticking = true; }
  }, { passive: true });

  // On resize: re-measure heights, then re-apply
  window.addEventListener("resize", () => {
    barHeight = announcementBar.offsetHeight;
    headerHeight = header.offsetHeight;
    lastScrolled = null;       // force a re-apply with fresh values
    applyHeaderPosition();
  });
//Ak custom code #speed

  // custom product page select box
  let proSelectBtns = document.querySelectorAll("[data-pro-custom-select-btn]");
  proSelectBtns.forEach(btns => {
    btns.addEventListener("click",function(e){
        console.log("clickkkk");
        e.preventDefault();
        console.log("custom select btn clicked",btns);
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
        if (!proSelect || !arrow) return;
        const parent = proSelect.parentElement;
        if (!parent.classList.contains("custom-select-custom-arrow")) {
            const wrapper = document.createElement("div");
            wrapper.classList.add("custom-select-custom-arrow");
            const innerDiv = document.createElement("div");
            innerDiv.classList.add("custom-select-custom-arrow-close");
            parent.insertBefore(wrapper, proSelect);
            wrapper.appendChild(innerDiv);
            wrapper.appendChild(proSelect);
            wrapper.appendChild(arrow);
        }
        var textElement = document.querySelector('.product .detail__sidebar__sizes .pro-custom-select-button .s-text');
        if (textElement) {
            textElement.textContent = 'Select Size';
        }
    }
    handleWrap();
    window.addEventListener("resize", handleWrap);

    // SHOP THE LOOK
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

    // STYLE IT WITH
    function initBuyLookInnerImageSwipers(scope = document) {
        scope.querySelectorAll(".buy-the-look__content__details__item__img__slider").forEach(function (slider) {
            if (slider.swiper) slider.swiper.destroy(true, true);

            var slides = slider.querySelectorAll(".swiper-slide");

            new Swiper(slider, {
                slidesPerView: 1,
                loop: true,
                navigation: {
                    nextEl: slider.querySelector(".swiper-button-next"),
                    prevEl: slider.querySelector(".swiper-button-prev")
                },
                pagination: {
                    el: slider.querySelector(".swiper-pagination"),
                    clickable: true
                },
                on: {
                    slideChange: function () {
                    const bullets = this.pagination.bullets;
                    if (bullets && bullets.length) {
                        bullets.forEach(b => b.classList.remove("swiper-pagination-bullet-active"));
                        bullets[this.realIndex]?.classList.add("swiper-pagination-bullet-active");
                    }
                    }
                }
            });
        });
    }
    

    initBuyLookInnerImageSwipers();
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

// Model JS - FINAL CLEAN

(function () {
  let refreshTimer = null;

  function norm(value) {
    return (value || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
  }

  function handle(value) {
    return norm(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function getDefaultKey(color) {
    return "default-model-" + handle(color);
  }

  function getCurrentColor() {
    const switcherColor = document.querySelector("[data-model-switcher]")?.getAttribute("data-current-color");
    const activeSwatch = document.querySelector(".product-variant-swatch.active .option_name")?.textContent;
    const selectedVariant = document.querySelector("#product-variants-select option:checked")?.getAttribute("data-val");

    let selectedVariantColor = "";

    if (selectedVariant && selectedVariant.includes(" / ")) {
      selectedVariantColor = selectedVariant.split(" / ")[0];
    }

    return norm(activeSwatch || selectedVariantColor || switcherColor);
  }

  function hideModelItem(el) {
    el.hidden = true;
    el.classList.add("model-filter-hidden");
    el.classList.remove("model-item-visible", "active");
    el.style.setProperty("display", "none", "important");
  }

  function showModelItem(el) {
    el.hidden = false;
    el.classList.remove("model-filter-hidden");
    el.classList.add("model-item-visible");
    el.style.setProperty("display", "flex", "important");
  }

  function closePopup() {
    document.querySelectorAll(".model-size-popover").forEach(function (popup) {
      popup.classList.remove("is-open");
      popup.classList.add("half-close");
    });
  }

  function updateModelPopoverPosition() {
    const popover = document.querySelector(".model-size-popover");
    if (!popover) return;

    const firstVisibleImage =
      document.querySelector(".detail__sliders__main .zoom-element:not(.model-hidden)") ||
      document.querySelector(".detail__sliders__main .zoom-element");

    if (!firstVisibleImage) return;

    const imageHeight = firstVisibleImage.offsetHeight;
    const popoverHeight = popover.offsetHeight;

    if (imageHeight > 0 && popoverHeight > 0) {
      popover.style.top = imageHeight - popoverHeight + "px";
    }
  }

  function updatePopupTitle() {
    const activeBtn = document.querySelector(
      ".model-size-popover .different-model-item.active, .different-model-wrapper .different-model-item.active"
    );
    const title = document.querySelector(".model-size-popover__title");

    if (!activeBtn || !title) return;

    title.textContent =
      activeBtn.dataset.modelTitle ||
      activeBtn.dataset.modelFitText ||
      activeBtn.textContent.trim();
  }

  function getModelLineFromText(text) {
    text = (text || "").replace(/\s+/g, " ").trim();
    if (!text) return "";

    const newFormat = text.match(/Model\s+is\s+.*?\s+and\s+is\s+wearing\s+a\s+Size\s+\d+(?:\s*\([^)]*\))?/i);
    if (newFormat) return newFormat[0].trim();

    const oldFormat = text.match(/[A-Z][a-zA-Z]*\s+is\s+a\s+UK\s+Size\s+\d+/i);
    if (oldFormat) return oldFormat[0].trim();

    const genericFormat = text.match(/.*?\bwearing\s+a\s+Size\s+\d+(?:\s*\([^)]*\))?/i);
    if (genericFormat) return genericFormat[0].trim();

    return text;
  }

  function updateFitFabricModelLine(modelText) {
    const cleanModelText = getModelLineFromText(modelText);
    if (!cleanModelText) return;

    const fitFabricWrapper = document.querySelector(".fit-fabric .accordion-content");
    if (!fitFabricWrapper) return;

    const modelLineRegex =
      /(Model\s+is\s+.*?\s+and\s+is\s+wearing\s+a\s+Size\s+\d+(?:\s*\([^)]*\))?|[A-Z][a-zA-Z]*\s+is\s+a\s+UK\s+Size\s+\d+|[^.]*?\bwearing\s+a\s+Size\s+\d+(?:\s*\([^)]*\))?)/i;

    const walker = document.createTreeWalker(
      fitFabricWrapper,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const text = (node.nodeValue || "").replace(/\s+/g, " ").trim();
          return modelLineRegex.test(text)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const targetTextNode = walker.nextNode();

    if (targetTextNode) {
      targetTextNode.nodeValue = targetTextNode.nodeValue.replace(modelLineRegex, cleanModelText);
    }
  }

  function updateModelMedia(modelKey, color) {
    document.querySelectorAll(".detail__sliders [data-model]").forEach(function (item) {
      const same =
        norm(item.dataset.modelColor) === color &&
        item.dataset.model === modelKey;

      item.classList.toggle("model-hidden", !same);
      item.classList.toggle("model-active", same);

      if (same) {
        item.style.removeProperty("display");
      } else {
        item.style.setProperty("display", "none", "important");
      }
    });
  }

  function updateSlidersOnly() {
    setTimeout(function () {
      document
        .querySelectorAll(".detail__sliders__main-slider.swiper-initialized, .detail__sliders__thumb-slider.swiper-initialized")
        .forEach(function (slider) {
          if (!slider.swiper) return;
          slider.swiper.update();
        });

      updateModelPopoverPosition();
    }, 120);
  }

  function getActiveModelKey() {
    const activeBtn = document.querySelector(
      ".model-size-popover .different-model-item.active, .different-model-wrapper .different-model-item.active"
    );

    return activeBtn?.dataset.modelTrigger || null;
  }

  function applyModel(modelKey) {
    const color = getCurrentColor();
    if (!color) return;

    if (!modelKey) modelKey = getDefaultKey(color);

    document.querySelectorAll("[data-model-switcher]").forEach(function (sw) {
      sw.setAttribute("data-current-color", color);
    });

    document.querySelectorAll(".different-model-item[data-model-color]").forEach(function (btn) {
      const sameColor = norm(btn.dataset.modelColor) === color;

      if (sameColor) {
        showModelItem(btn);
      } else {
        hideModelItem(btn);
      }

      const isActive =
        sameColor &&
        btn.dataset.modelTrigger === modelKey &&
        !btn.hidden;

      btn.classList.toggle("active", isActive);
    });

    // IMPORTANT: this changes the actual model image/media
    updateModelMedia(modelKey, color);

    updatePopupTitle();

    const activeModelBtn = document.querySelector(
      ".model-size-popover .different-model-item.active, .different-model-wrapper .different-model-item.active"
    );

    if (activeModelBtn) {
      updateFitFabricModelLine(
        activeModelBtn.dataset.modelFitText ||
        activeModelBtn.dataset.modelTitle ||
        activeModelBtn.textContent
      );
    }

    closePopup();
    updateModelPopoverPosition();
    updateSlidersOnly();

    setTimeout(updateModelPopoverPosition, 100);
    setTimeout(updateModelPopoverPosition, 400);
  }

  function refreshDefaultModel() {
    clearTimeout(refreshTimer);

    refreshTimer = setTimeout(function () {
      const color = getCurrentColor();
      if (!color) return;

      const activeModelKey = getActiveModelKey();

      const sameColorActiveBtn = activeModelKey
        ? document.querySelector(
            `.different-model-item[data-model-trigger="${CSS.escape(activeModelKey)}"][data-model-color="${CSS.escape(color)}"]`
          )
        : null;

      applyModel(sameColorActiveBtn ? activeModelKey : getDefaultKey(color));
      updateModelPopoverPosition();
    }, 120);
  }

  window.marameModelSwitcherRefresh = refreshDefaultModel;

  document.addEventListener("DOMContentLoaded", function () {
    refreshDefaultModel();
    setTimeout(updateModelPopoverPosition, 500);
  });

  document.addEventListener("marame:variant-rendered", function () {
    refreshDefaultModel();
  });

  document.addEventListener("click", function (event) {
    const modelBtn = event.target.closest(".different-model-item[data-model-trigger]");

    if (modelBtn) {
      event.preventDefault();

      if (modelBtn.hidden || modelBtn.classList.contains("model-filter-hidden")) return;

      applyModel(modelBtn.dataset.modelTrigger);
      return;
    }

    const changeBtn = event.target.closest(".model-size-popover__change");

    if (changeBtn) {
      event.preventDefault();

      const popup = changeBtn.closest(".model-size-popover");

      if (popup) {
        popup.classList.toggle("is-open");
        popup.classList.remove("half-close");
      }

      setTimeout(updateModelPopoverPosition, 50);
      return;
    }

    const closeBtn = event.target.closest(".model-size-popover__close");

    if (closeBtn) {
      event.preventDefault();
      closePopup();
      setTimeout(updateModelPopoverPosition, 50);
    }
  });

  window.addEventListener("resize", function () {
    setTimeout(updateModelPopoverPosition, 100);
  });
})();

// Buy The Look Slider

function initNewBuyLookSlider() {
  document
    .querySelectorAll('.buy-the-look__content__details__item__img__new-slider')
    .forEach((slider) => {
      if (slider.swiper) return;

      slider.classList.add('swiper');

      const slides = slider.querySelectorAll('.swiper-slide');
      if (!slides.length) return;

      const smoothSpeed = 650;

      const swiper = new Swiper(slider, {
        loop: false,
        rewind: true,
        speed: smoothSpeed,

        slidesPerView: 1,
        slidesPerGroup: 1,
        watchOverflow: true,
        grabCursor: true,

        simulateTouch: true,
        allowTouchMove: true,
        touchRatio: 0.85,
        threshold: 1,
        longSwipesMs: 400,
        longSwipesRatio: 0.18,
        followFinger: true,

        navigation: {
          nextEl: slider.querySelector('.swiper-button-next'),
          prevEl: slider.querySelector('.swiper-button-prev'),
        },

        pagination: {
          el: slider.querySelector('.swiper-pagination'),
          clickable: true,
        },

        observer: true,
        observeParents: true,
      });

      slider.addEventListener('mouseenter', () => {
        if (!slider.swiper || slider.swiper.slides.length <= 1) return;
        slider.swiper.slideNext(smoothSpeed);
      });

      slider.addEventListener('mouseleave', () => {
        if (!slider.swiper || slider.swiper.slides.length <= 1) return;
        slider.swiper.slideTo(0, smoothSpeed);
      });
    });
}

document.addEventListener('DOMContentLoaded', initNewBuyLookSlider);

document.addEventListener('shopify:section:load', initNewBuyLookSlider);


const backBtn = document.getElementById("back-btn");
if(backBtn){
    backBtn.addEventListener("click", function (e) {
    console.log(document.referrer);
    console.log(window.history.length);
        const referrer = document.referrer;

        if (referrer && new URL(referrer).hostname === window.location.hostname) {
            e.preventDefault();
            history.back();
        }
    });
}