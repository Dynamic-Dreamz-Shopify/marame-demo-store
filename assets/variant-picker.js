function sliderUpdate() {
  if (window.innerWidth > 767) return;

  document.querySelectorAll(".detail__sliders").forEach(function (wrapper) {
    var mainEl = wrapper.querySelector(".detail__sliders__main-slider");
    var thumbEl = wrapper.querySelector(".detail__sliders__thumb-slider");

    if (!mainEl || !thumbEl) return;

    if (mainEl.swiper) mainEl.swiper.destroy(true, true);
    if (thumbEl.swiper) thumbEl.swiper.destroy(true, true);

    var thumbSwiper = new Swiper(thumbEl, {
      loop: false,
      slidesPerView: 4,
      spaceBetween: 3,
      watchSlidesProgress: true
    });

    new Swiper(mainEl, {
      loop: false,
      slidesPerView: 1,
      effect: "fade",
      fadeEffect: { crossFade: true },
      navigation: {
        nextEl: wrapper.querySelector(".swiper-button-next"),
        prevEl: wrapper.querySelector(".swiper-button-prev")
      },
      pagination: {
        el: wrapper.querySelector(".swiper-pagination"),
        clickable: true
      },
      thumbs: { swiper: thumbSwiper }
    });
  });
}

class VariantPicker extends HTMLElement {
  constructor() {
    super();
    this.handleSwatchChange = this.handleSwatchChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  get sectionId() {
    return this.getAttribute("data-section-id");
  }

  get section() {
    return document.querySelector(`#shopify-section-${this.sectionId}`);
  }

  get wrappersToRender() {
    return [
        ".detail__sliders.product",
        "variant-picker",
        ".shopify-product-form",
        ".default-prodcut_page",
        ".product-tabs__content",
        ".accordion_with_atc_buttons",
        ".test_buy_the_look",
        ".iWishAddColl",
        ".different-model-wrapper"
    ];
  }

  get swatches() {
    return this.querySelectorAll(".product-variant-swatch");
  }

  get selects() {
    return this.querySelectorAll("select");
  }

  get proSelect() {
    return this.querySelector("[data-pro-custom-select]");
  }

  get proSelectList() {
    return this.querySelector(".pro-custom-select-list");
  }

  connectedCallback() {
    this.bindEvents();
  }

  disconnectedCallback() {
    this.unbindEvents();
  }

  bindEvents() {
    this.swatches.forEach((swatch) => {
      swatch.removeEventListener("click", this.handleSwatchChange);
      swatch.addEventListener("click", this.handleSwatchChange);
    });

    this.selects.forEach((select) => {
      select.removeEventListener("change", this.handleSelectChange);
      select.addEventListener("change", this.handleSelectChange);
    });

    if (this.proSelect) {
      this.proSelect.onclick = () => {
        const comingSoonText = document.querySelector(".coming_soon_text");

        if (comingSoonText) {
          const popup = document.querySelector(".klaviyo_notify_popup_main.coming_soon_popup");
          if (popup) popup.style.display = "block";
          return;
        }

        this.toggleProSelect();
      };
    }

    this.proSelectList?.querySelectorAll("li").forEach((li) => {
      li.onclick = (event) => {
        const currentLi = event.currentTarget;
        const wrapper = currentLi.closest("[data-pro-custom-select]");

        if (currentLi.classList.contains("active") && wrapper.classList.contains("selected")) {
          currentLi.classList.remove("active");

          setTimeout(function () {
            wrapper?.classList.add("active");
            wrapper?.classList.remove("selected");
            document.querySelector(".custom_btns_atc")?.classList.add("hidden");
            document.querySelector(".custom_arrow_selector")?.classList.remove("hidden");
          }, 500);

          return;
        }

        currentLi.parentElement.querySelectorAll("li").forEach((el) => {
          el.classList.remove("active");
        });

        currentLi.classList.add("active");

        this.toggleProSelect();
        this.handleSelectProChange(event);
      };
    });
  }

  unbindEvents() {
    this.swatches.forEach((swatch) => {
      swatch.removeEventListener("click", this.handleSwatchChange);
    });

    this.selects.forEach((select) => {
      select.removeEventListener("change", this.handleSelectChange);
    });
  }

  toggleProSelect() {
    this.proSelect?.classList.add("active");
  }

  dispatchVariantRendered(variantId) {
    document.dispatchEvent(
      new CustomEvent("marame:variant-rendered", {
        detail: { variantId: variantId }
      })
    );
  }

  updatePageContent(url, variantId, isColorChange = false) {
    this.section?.querySelector(".product--atc")?.classList.add("loading");

    fetch(url)
      .then((res) => res.text())
      .then((html) => {
        const temp = document.createElement("div");
        temp.innerHTML = html;

        this.wrappersToRender.forEach((selector) => {
          const updated = temp.querySelector(selector);
          const current = document.querySelector(selector);

          if (updated && current) {
            current.innerHTML = updated.innerHTML;

            const tabs = document.querySelectorAll(".product-tabs__nav-item");
            tabs.forEach((i) => i.classList.remove("active"));
            if (tabs.length > 0) tabs[0].classList.add("active");

            initBuyTheLookSwipers(current);
          }
        });

        if (!isColorChange) {
          const customSelect = document.querySelector("[data-pro-custom-select]");
          const customBtns = document.querySelector(".custom_btns_atc");
          const customArrow = document.querySelector(".custom_arrow_selector");

          customSelect?.classList.add("active", "selected");
          customBtns?.classList.remove("hidden");
          customArrow?.classList.add("hidden");
        }

        setTimeout(() => {
            sliderUpdate();
            this.bindEvents();

            console.log("[VARIANT DEBUG] DOM replaced, firing marame:variant-rendered", variantId);

            document.dispatchEvent(new CustomEvent("marame:variant-rendered", {
                detail: { variantId: variantId }
            }));

            if (typeof window.marameModelSwitcherRefresh === "function") {
                console.log("[VARIANT DEBUG] calling window.marameModelSwitcherRefresh");
                window.marameModelSwitcherRefresh();
            } else {
                console.warn("[VARIANT DEBUG] window.marameModelSwitcherRefresh not found");
            }
        }, 300);
      })
      .catch((err) => console.error("Variant update error:", err));
  }

  handleSwatchChange(event) {
    const clickedSwatch = event.currentTarget;
    const variantId = clickedSwatch.dataset.variant;
    const url = `${window.location.pathname}?variant=${variantId}&section_id=${this.sectionId}`;

    document.querySelectorAll(".product-variant-swatch").forEach((swatch) => {
        swatch.classList.remove("active");
    });

    clickedSwatch.classList.add("active");

    this.updatePageContent(url, variantId, true);
    this.pushUrl(url);
  }

  handleSelectChange(event) {
    const variantId = event.currentTarget.dataset.variant || event.currentTarget.value;
    const url = `${window.location.pathname}?variant=${variantId}&section_id=${this.sectionId}`;

    this.updatePageContent(url, variantId, false);
    this.pushUrl(url);
  }

  handleSelectProChange(event) {
    const variantId = event.currentTarget.dataset.variant;
    const url = `${window.location.pathname}?variant=${variantId}&section_id=${this.sectionId}`;

    this.updatePageContent(url, variantId, false);
    this.pushUrl(url);
  }

  pushUrl(url) {
    const newUrl = new URL(url, window.location.origin);
    newUrl.searchParams.delete("section_id");
    window.history.pushState({}, "", newUrl.toString());
  }
}

if (!customElements.get("variant-picker")) {
  customElements.define("variant-picker", VariantPicker);
}

function initBuyTheLookSwipers(scope = document) {
  const sliders = scope.querySelectorAll(".buy-the-look__content__details__item__img__slider");

  sliders.forEach((slider) => {
    if (slider.swiper) {
      slider.swiper.destroy(true, true);
    }

    new Swiper(slider, {
      slidesPerView: 1,
      loop: slider.querySelectorAll(".swiper-slide").length > 1,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: slider.querySelector(".swiper-button-next"),
        prevEl: slider.querySelector(".swiper-button-prev")
      },
      pagination: {
        el: slider.querySelector(".swiper-pagination"),
        clickable: true
      }
    });
  });

  handleWrap();
}

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

document.addEventListener("click", function (e) {
  if (e.target.closest(".custom-select-custom-arrow-close")) {
    document.querySelector("[data-pro-custom-select]")?.classList.remove("active");
  }
});

document.querySelectorAll(".searchbar .searchbar__btn").forEach(function (btn) {
  if (btn.dataset.listenerAdded) return;

  btn.dataset.listenerAdded = "true";

  btn.addEventListener("click", function () {
    const input = this.closest(".searchbar").querySelector(".searchbar__input");
    input.classList.toggle("searchbar__input--active");
  });
});