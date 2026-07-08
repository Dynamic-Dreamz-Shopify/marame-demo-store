let orderObj;
document.addEventListener("DOMContentLoaded", (event) => {

// commong next button click
document.querySelectorAll(`[data-return-next-common]`).forEach((commonNext) => {
    commonNext.addEventListener("click",function(e){
        e.preventDefault();
        console.log("common next clicked",this);
        this.closest(`.return-options-steps`).classList.remove("active");
        this.closest(`.return-options-steps`).nextElementSibling.classList.add("active");
        manageProgressBar();
    });
});

// commong prev button click
document.querySelectorAll(`[data-return-prev-common]`).forEach((commonPrev) => {
    commonPrev.addEventListener("click",function(e){
        e.preventDefault();
        document.querySelector('[data-return-choose-pro-next]')?.classList.add("disabled");
        console.log("common prev clicked",this);
        document.querySelector(`[data-return-choose-single-option-next]`)?.classList.add("disabled");
        document.querySelector(`.return-options-right`)?.classList.remove("hidden");
        const allItem = document.querySelectorAll(".return-order-lineitem").length;
        const alltickItem = document.querySelectorAll(".return-order-lineitem.tick").length;
        console.log("allItem:--",allItem);
        console.log("alltickItem:--",alltickItem);
        if(allItem == alltickItem)
        {
             document.querySelector(`[data-return-choose-pro-next]`)?.classList.remove("disabled");
        }
        else
        {
            document.querySelector('[data-return-choose-pro-next]')?.classList.add("disabled");
        }
        this.closest(`.return-options-steps`).classList.remove("active");
        if(this.classList.contains("skip")){
            this.closest(`.return-options-steps`).previousElementSibling.previousElementSibling.classList.add("active");
        }else{
            this.closest(`.return-options-steps`).previousElementSibling.classList.add("active");
        }
        manageProgressBar();
    });
});

// location btn click event -- data-return-from-location-btn
document.querySelectorAll(`[data-return-from-location-btn]`).forEach((locationBtn) => {
    locationBtn.addEventListener("click",function(e){
        e.preventDefault();
        document.querySelector(`[data-return-from-location-btn].active`)?.classList.remove("active");
        this.classList.add("active");
        
        if(document.querySelectorAll(".return-from-location-item.active").length > 0){
            document.querySelector(`[data-return-choose-pro-next-step]`)?.classList.remove("disabled");
            // this.closest(`.return-options-steps`).classList.remove("active");
            // this.closest(`.return-options-steps`).nextElementSibling.classList.add("active");
        }
        else{
            document.querySelector(`[data-return-choose-pro-next-step]`)?.classList.add("disabled");
        }

        console.log("location",this.dataset.returnFromLocationBtn);
        document.querySelector(`.return-method-item.active`)?.classList.remove("active");
        if(this.dataset.returnFromLocationBtn == "GREAT BRITAIN"){
            document.querySelector(`[data-return-method="dpd"]`).classList.add("active");
        }else{
            document.querySelector(`[data-return-method="post"]`).classList.add("active");
            if(this.dataset.returnFromLocationBtn == "NORTHERN IRELAND"){
                document.querySelector(`[data-location-rte="NORTHERN IRELAND"]`).classList.remove("hidden");
                document.querySelector(`[data-location-rte="INTERNATIONAL"]`).classList.add("hidden");
            }else{
                document.querySelector(`[data-location-rte="INTERNATIONAL"]`).classList.remove("hidden");
                document.querySelector(`[data-location-rte="NORTHERN IRELAND"]`).classList.add("hidden");
            }

            document.querySelectorAll('[no-northern-ireland-and-international]').forEach(function(el) {
                el.classList.add('hidden');
            });

        }

        manageProgressBar();
    });
});


// data-return-choose-pro-next -- choose products next button
document.querySelectorAll(`[data-return-choose-pro-next-step]`).forEach((nextBtn) => {
    nextBtn.addEventListener("click",function(e){
        e.preventDefault();
        console.log("next btn clicked",this);
        // selectedProductsHTML();

        this.closest(`.return-options-steps`).classList.remove("active");
        this.closest(`.return-options-steps`).nextElementSibling.classList.add("active");
        manageProgressBar();
    });
});


// input -- order number -- data-order-form-input-single
const inputs = document.querySelectorAll('[data-order-form-input-single]');
inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        document.querySelector("[data-order-form-element]").classList.remove("show-err");
        if(input.value.length === input.maxLength) {
            input.classList.remove("red-alert");
            input.classList.add("green-alert");
            const next = inputs[index + 1];
            if(next) next.focus();
        }else{
            input.classList.remove("green-alert");
        }
    });
    input.addEventListener('keydown', (e) => {
        if(e.key === "Backspace" && !input.value) {
            const prev = inputs[index - 1];
            if(prev) prev.focus();
        }
    });
});



// email -- order number -- data-order-form-email
if(document.querySelector('[data-order-form-email]')){
    document.querySelector('[data-order-form-email]').addEventListener('input',function(e){
        this.classList.remove("red-alert");
        document.querySelector("[data-order-form-element]").classList.remove("show-err");
        if(this.value.length > 0){
            this.classList.add("green-alert");
        }else{
            this.classList.remove("green-alert");
        }
    });
}


// find order submit button click event -- data-order-form-submit
document.querySelectorAll(`[data-order-form-submit]`).forEach((submitBtn) => {
    submitBtn.addEventListener("click",function(e){
        e.preventDefault();
        console.log("submitBtn click event");
        let allowTosubmit = true;
        if(document.querySelector(`[data-order-form-email]`).value == ""){
           document.querySelector(`[data-order-form-email]`).classList.add("red-alert");
           allowTosubmit = false;
        }
        let blankInputs = [...document.querySelectorAll('[data-order-form-input-single]')].filter(input => input.value.trim() === "");
        if(blankInputs.length != 0){
            allowTosubmit = false;
            blankInputs.forEach(bInput => {
                bInput.classList.add("red-alert");
            });
        }
        if(allowTosubmit){
            document.querySelector(`[data-order-form-element]`).classList.add("loader-active");
            // allow to submit -- get order details
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const combinedValues = [...document.querySelectorAll('[data-order-form-input-single]')].map(input => input.value.trim()).join('');
            const raw = JSON.stringify({
            "order_number": combinedValues,
            "email": document.querySelector(`[data-order-form-email]`).value
            });

            const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
            };

            fetch("https://returns.marame.com/api/get-orders", requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log("result",result);
                document.querySelector(`[data-order-form-element]`).classList.remove("loader-active");
                if(result.success == true){
                    orderObj = result.order;
                    // const closedAt = orderObj.closedAt;
                    console.log("cancelledAt value:",orderObj);
                   
                    
                         let allowToNext = true;
                        let show_popup = true; 
                        const closedAt = new Date(result.dpdDeliveyDate);   
                        const closedAt_new = result.dpdDeliveyDate; 
                        // console.log("closedAt:--",closedAt);
                        // console.log("closedAt_new:--",closedAt_new);
                        const shippingAddress_zip = orderObj.shippingAddress["zip"];
                        const currentDate = new Date();
                        // const diffInMs = currentDate - createdDate;
                        const diffInMs = currentDate - closedAt;
                        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                        const tags = Array.isArray(orderObj.tags) ? orderObj.tags : orderObj.tags.split(',').map(t => t.trim());
                        // console.log("closedAt:--",closedAt , "diffInDays:--",diffInDays,"shippingAddress_zip:--",shippingAddress_zip);;

                        if(shippingAddress_zip)
                        {
                            console.log(shippingAddress_zip);
                            fetch(`https://returns.marame.com/api/dpd/pickup-locations?postcode=${encodeURIComponent(shippingAddress_zip)}`)
                             .then((response) => response.json())
                                .then((data) => {
                                console.log(" Pickup locations:", data);
                                // TODO: update DOM (return-print-card) dynamically here
                                    document.querySelectorAll(".return-print-card").forEach(ele => {
                                        const print_opt = ele.getAttribute("data-print");
                                        const container = ele.querySelector(".return-option-locations"); 

                                        if (!container) return;
                                        container.innerHTML = ""; 

                                        // Helper to render a location card
                                        const renderLocation = (loc) => `
                                            <div class="return-option-location">
                                            <h4>${loc.organisation || "Unknown"}</h4>
                                            <p>
                                                ${loc.street ? loc.street + "<br>" : ""}
                                                ${loc.county ? loc.county + "<br>" : ""}
                                                ${loc.postcode ? loc.postcode + "<br>" : ""}
                                                ${loc.distance ? loc.distance.toFixed(2) + " km" : ""}
                                            </p>
                                            </div>
                                            <div class="return-option-divider"></div>
                                        `;

                                        let allLocations = [];

                                        //  For QrCode → use shop data
                                        if (print_opt === "QrCode" && data.locations.shop) {
                                            allLocations = data.locations.shop;
                                        }

                                        //  For Label → use locker data
                                        if (print_opt === "Label" && data.locations.locker) {
                                            allLocations = data.locations.locker;
                                        }

                                        // Add the HTML content
                                        if (allLocations.length > 0) {
                                            container.innerHTML = allLocations.map(renderLocation).join("");

                                            // Remove last divider for clean layout
                                            const lastDivider = container.querySelector(".return-option-divider:last-of-type");
                                            if (lastDivider) lastDivider.remove();
                                        } else {
                                            container.innerHTML = `<p>No locations found.</p>`;
                                        }
                                        });
                                })
                        }


                        if (!tags.includes("allowreturn")) 
                        {
                            if(closedAt_new === null)
                            {
                                console.log("in iff");
                            allowToNext = true;
                            }
                            else
                            {
                                console.log("in els");
                                let show_popup = false; 
                                if(diffInDays > 14){
                                    allowToNext = false;
                                }
                            }
                        }
                        else
                        {
                             allowToNext = true;
                        }
                  
                   
                        // let allowToNext = true;
                        // // const createdDate = new Date(orderObj.createdAt);
                        // const closedAt = new Date(orderObj.closedAt);   
                        // const currentDate = new Date();
                        // // const diffInMs = currentDate - createdDate;
                        // const diffInMs = currentDate - closedAt;
                        // const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                        console.log("diffInDays:--",diffInDays)
                        // if(diffInDays > 14){
                        //     allowToNext = false;
                        // }
                        if(allowToNext  && show_popup ){
                            // add class based on fullfillment status
                            if(orderObj.displayFulfillmentStatus != "FULFILLED"){
                                // allow only refund because of order not fully fullfilled
                                document.querySelector(`.return-options`).classList.add("return-only");
                            }else{
                                document.querySelector(`.return-options`).classList.remove("return-only");
                            }
                            let orderListHTML = `<div class="up-down-arrow"></div><div class="return-options-order active" data-order-id="${result.order.id.replace("gid://shopify/Order/","")}" data-order-number="${result.order.name}"><div class="return-order-lineitems-list">`;
                            result.order.lineItems.nodes.forEach(lineItem => {
                                

                                // check for processedLineItems == if have then prevent to generate html
                                if(result.processedLineItems.includes(parseInt(lineItem.id.replace("gid://shopify/LineItem/",""))) != true){
                                    // console.log("lineItem.refundableQuantity:--",lineItem.refundableQuantity);
                                    if(lineItem.fulfillmentStatus != "unfulfilled" && lineItem.refundableQuantity !== 0 && lineItem.variant != null){
                                        // console.log(lineItem.variant.selectedOptions);
                                    let color = lineItem.variant.selectedOptions.filter(item => item.name.toLowerCase() === "color").map(item => item.optionValue.name);
                                    let size = lineItem.variant.selectedOptions.filter(item => item.name.toLowerCase() === "size").map(item => item.optionValue.name);
                                    
                                    if(size.length == 0){
                                        size = lineItem.variant.selectedOptions.filter(item => item.name.toLowerCase() === "shoe size").map(item => item.optionValue.name);
                                    }
                                    // let discountAllocationTotal = lineItem.discountAllocations.map(item => parseFloat(item.allocatedAmount.amount)).reduce((sum, val) => sum + val, 0);
                                    let discountAllocationTotal = lineItem.discountAllocations.map(item => parseFloat(item.allocatedAmountSet.presentmentMoney.amount)).reduce((sum, val) => sum + val, 0);
                          
                                  
                                    // let totalToDisplay = lineItem.originalTotal - discountAllocationTotal;
                                    let totalToDisplay = lineItem.originalTotalSet.presentmentMoney.amount - discountAllocationTotal;
                                    console.log("totalToDisplay",totalToDisplay);
                                    console.log("originalTotal",lineItem.originalTotal);
                                     console.log("discountAllocationTotal",discountAllocationTotal);
                                    //  console.log("data-lineitem-inventory_item_id:--",lineItem.variant.inventoryItem.id);
                                    
                                      
                                    

                                    orderListHTML += `<div class="return-order-lineitem${result.processedLineItems.includes(parseInt(lineItem.id.replace("gid://shopify/LineItem/",""))) == true ? " hidden" : ""}" 
                                        data-id="${lineItem.id.replace("gid://shopify/LineItem/","")}" 
                                        data-lineitem-variant-id="${lineItem.variant.id.replace("gid://shopify/ProductVariant/","")}" 
                                        data-lineitem-variant-title="${lineItem.variantTitle}" 
                                        data-lineitem-image="${lineItem.image.src}" 
                                        data-lineitem-price="${totalToDisplay}" 
                                        data-lineitem-quantity="${lineItem.quantity}" 
                                        data-lineitem-product-json='${JSON.stringify(lineItem.product)}'
                                        >
                                        <div class="return-order-lineitem-image"><img src="${lineItem.image.src}"></div>
                                        <div class="return-order-lineitem-info">
                                            <div class="lineitem-info-title">${lineItem.title}</div>
                                            <div class="lineitem-info-color"><span>Colour</span><span>${color}</span></div>
                                            <div class="lineitem-info-size"><span>Size</span><span>${size}</span></div>
                                            <div class="lineitem-info-size_val">${size}</div>
                                            <div class="lineitem-info-size_color">${color}</div>
                                            <div class="lineitem-info-price"><span>Purchase Price</span><span>${formatShopifyMoney(totalToDisplay*100,document.body.getAttribute(`shop_moneyformat`)).replace(".00","").replace(",00","")}</span></div>
                                        </div>
                                        <button class="lineitem-info-button-keep" data-return-keep-button>Keep product</button>
                                        <button class="lineitem-info-button" data-return-action-button>Return</button>
                                        </div>`;
                                    }
                                    // const qty = lineItem.quantity;

                                    // Loop N times based on quantity
                                    // for (let i = 0; i < qty; i++) {

                                    //     orderListHTML += `
                                    //     <div class="return-order-lineitem${result.processedLineItems.includes(parseInt(lineItem.id.replace("gid://shopify/LineItem/",""))) ? " hidden" : ""}"
                                    //         data-id="${lineItem.id.replace("gid://shopify/LineItem/","")}-${i+1}"
                                    //         data-lineitem-variant-id="${lineItem.variant.id.replace("gid://shopify/ProductVariant/","")}"
                                    //         data-lineitem-variant-title="${lineItem.variantTitle}" 
                                    //         data-lineitem-image="${lineItem.image.src}" 
                                    //         data-lineitem-price="${totalToDisplay}" 
                                    //         data-lineitem-quantity="1"
                                    //         data-lineitem-product-json='${JSON.stringify(lineItem.product)}'
                                    //     >
                                    //         <div class="return-order-lineitem-image">
                                    //             <img src="${lineItem.image.src}">
                                    //         </div>

                                    //         <div class="return-order-lineitem-info">
                                    //             <div class="lineitem-info-title">${lineItem.title}</div>
                                    //             <div class="lineitem-info-color"><span>Colour</span><span>${color}</span></div>
                                    //             <div class="lineitem-info-size"><span>Size</span><span>${size}</span></div>
                                    //             <div class="lineitem-info-price">
                                    //                 <span>Purchase Price</span>
                                    //                 <span>${formatShopifyMoney(totalToDisplay*100, document.body.getAttribute("shop_moneyformat")).replace(".00","").replace(",00","")}</span>
                                    //             </div>
                                    //         </div>

                                    //         <button class="lineitem-info-button-keep" data-return-keep-button>Keep product</button>
                                    //         <button class="lineitem-info-button" data-return-action-button>Return</button>
                                    //     </div>`;
                                    // }
                                    

                                }
                                
                            });
                            orderListHTML += `</div></div>`;
                            document.querySelector(`[data-order-number]`).innerHTML = `Order ${result.order.name}`;
                            document.querySelector(`[data-thank-you-order-number]`).innerHTML = `${result.order.name}`;
                            document.querySelector(`[data-return-order-list]`).innerHTML = orderListHTML;
                            orderProductsActionButtons();
                            document.querySelector(`.return-options-steps.return-choose-option-order-form`).classList.remove("active");
                            document.querySelector(`.return-options-steps.return-choose-option-order-products`).classList.add("active");
                        }else{
                            // show days within popup
                            // data-days-since-order-was-created diffInDays
                            document.querySelector("[data-days-since-order-was-created]").innerHTML = diffInDays;
                            document.querySelector("[data-return-within-days-popup]").classList.remove("hidden");
                        } 
                }else{
                    document.querySelector("[data-order-form-element]").classList.add("show-err");
                }                
            });
        }
    });

    
        document.addEventListener('click', function (e) {
            const arrow = e.target.closest('.up-down-arrow');
            if (!arrow) return;
            console.log("click on arrow button");

            document.querySelector('.return-options-order-list')?.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

});



// within days popup close event
document.querySelector('[data-return-within-days-popup-close]')?.addEventListener('click', function(e){
    e.preventDefault();
    console.log('Close button clicked!');
    this.closest(`[data-return-within-days-popup]`).classList.add("hidden");
});


// data-return-action-button -- select return products
function orderProductsActionButtons(){
document.querySelectorAll('[data-return-action-button]').forEach(actionBtn => {

    actionBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const item = this.closest(".return-order-lineitem");
        if (!item) return;

        item.querySelector(".lineitem-info-button-keep")?.classList.remove("active");

        const isSelected = item.classList.toggle("selected");

        item.classList.toggle("tick", isSelected);

        if (isSelected) {
            actionBtn.textContent = "Return";
            document.querySelector("[data-selected-order-form-error]")?.classList.add("hidden");
        } else {
            actionBtn.textContent = "Return";
        }

        if (isSelected) {
            item.nextElementSibling?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        const selectedCount = document.querySelectorAll(".return-order-lineitem.selected").length;
        const allItems = document.querySelectorAll(".return-order-lineitem").length;
        const tickItems = document.querySelectorAll(".return-order-lineitem.tick").length;

        if (selectedCount > 0 && allItems === tickItems) {
            document.querySelector('[data-return-choose-pro-next]')?.classList.remove("disabled");
        } else {
            document.querySelector('[data-return-choose-pro-next]')?.classList.add("disabled");
        }

        document.querySelector('[data-return-choose-single-option-next]')?.classList.add("disabled");
    });

});



document.querySelectorAll('[data-return-keep-button]').forEach(actionBtn => {

    actionBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const item = this.closest(".return-order-lineitem");
        if (!item) return;
        item.classList.remove("selected");

        const isKeepActive = this.classList.toggle("active");
        item.classList.toggle("tick", isKeepActive);

        if (isKeepActive) {
            item.nextElementSibling?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        const allItems = document.querySelectorAll(".return-order-lineitem").length;
        const tickItems = document.querySelectorAll(".return-order-lineitem.tick").length;

        if (allItems === tickItems) {
            document.querySelector('[data-return-choose-pro-next]')?.classList.remove("disabled");
        } else {
            document.querySelector('[data-return-choose-pro-next]')?.classList.add("disabled");
        }
    });

});

}

// data-return-choose-pro-next -- choose products next button
document.querySelectorAll(`[data-return-choose-pro-next]`).forEach((nextBtn) => {
    nextBtn.addEventListener("click",function(e){
        e.preventDefault();
        console.log("next btn clicked",this);
        
        
        // if(document.body.clientWidth > 767){
        //     this.closest(`.return-options-steps`).classList.remove("active");
        // }
        
        // if(document.body.clientWidth <= 767){
            console.log("len_selected:--",document.querySelectorAll(".return-order-lineitem.selected").length);
            if(document.querySelectorAll(".return-order-lineitem.selected").length == 1)
            {
                document.querySelector("[return-choose-option-reason-next]").classList.remove("hidden");
                // document.querySelector("[data-return-choose-single-option-next]").classList.remove("hidden");
                document.querySelector("[data-next-img]").classList.add("hidden");
                document.querySelector("[data-back-img]").classList.add("hidden");
            }
            else
            {
                // document.querySelector("[data-return-choose-single-option-next]").classList.add("hidden");
                document.querySelector("[return-choose-option-reason-next]").classList.add("hidden");
                
                document.querySelector("[data-back-img]").classList.add("hidden");
                document.querySelector("[data-next-img]").classList.remove("hidden");
            }

            // if(document.querySelectorAll(".return-order-lineitem.selected").length <= 0)
            // {
            //     document.querySelector("[data-selected-order-form-error]").classList.remove("hidden");
            // }
            // else
            // {
            //     this.closest(`.return-options-steps`).classList.remove("active");
            // }

            // new code

            const allItem = document.querySelectorAll(".return-order-lineitem").length;
            const alltickItem = document.querySelectorAll(".return-order-lineitem.tick").length;
            console.log("allItem:--",allItem);
            console.log("alltickItem:--",alltickItem);
            if(allItem == alltickItem)
            {
                console.log("iff");
                if(document.querySelectorAll(".return-order-lineitem.selected").length <= 0)
                {
                    document.querySelector("[data-selected-order-form-error]").classList.remove("hidden");
                }
                else
                {
                    this.closest(`.return-options-steps`).classList.remove("active");
                }

                let location = document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn;
                console.log("location>>>>",location);
                if(location != "INTERNATIONAL"){
                    // if(document.querySelectorAll(`.return-order-lineitem.selected`).length == 1){
                    //     document.querySelector(`.return-options-steps.return-choose-option-single`).classList.add("active");
                    // }else{
                    //     document.querySelector(`.return-options-steps.return-choose-option-multiple`).classList.add("active");
                    // }
                    document.querySelector(`.return-options-steps.return-choose-option-single`).classList.add("active");
                    document.querySelector('[data-next-img]').classList.add("active");
                    document.querySelectorAll('.return-option-card[data-option="exchange"]').forEach(el => 
                    el.classList.remove('hidden')
                    );
                }else{
                    document.querySelectorAll('.return-option-card[data-option="exchange"]').forEach(element => {
                        element.classList.add("hidden");
                    });
                    document.querySelector('.return-options-steps.return-choose-option-single').classList.add("active");
                    document.querySelector(`.data-next-img`).classList.add("active");
                }
                document.querySelector(`.return-options-right`)?.classList.remove("hidden");
                selectedProductsHTML();
                manageProgressBar();
        }
            else
            {
                console.log("elss");
                document.querySelector("[data-selected-order-form-error]").classList.remove("hidden");
            }
    });
});


// choose return single option item next button click -- data-return-choose-single-option-next
document.querySelectorAll(`[data-return-choose-single-option-next]`).forEach((singleNext) => {
    singleNext.addEventListener("click",function(e){
        e.preventDefault();
        console.log("singleNext next clicked",this);

            
    const activeItem = document.querySelector(".return-option-grid-item.active");
    // 🚨 Prevent moving forward if no card selected
        const selectedCard = activeItem.querySelector(".return-option-card.active");
        if (!selectedCard) {
        console.log("No return option card selected — cannot move next");
        //   document.querySelector("[data-selected-reason-option]").classList.remove("hidden");
        return; // STOP execution here
        }
            reasonProductsHTML("single");
            this.closest(`.return-options-steps`).classList.remove("active");
            // document.querySelector(`.return-options-steps.return-choose-option-reason`)?.classList.add("active");
            document.querySelector(`.return-options-steps.return-choose-option-return-confirmation`)?.classList.add("active");
            
        manageProgressBar();
    });
});


document.querySelectorAll(`[data-next-img]`).forEach((imgNext) => {
  imgNext.addEventListener("click", function (e) {
    e.preventDefault();
    console.log("click on next button");
    document.querySelector('[data-back-img]').classList.remove("hidden");
    imgNext.closest('.navigation').querySelector('[data-return-prev-common]').classList.add("hidden");

    const gridItems = Array.from(document.querySelectorAll(".return-option-grid-item"));
    const activeItem = document.querySelector(".return-option-grid-item.active");

    if (!activeItem) return console.log("No active grid item found");
    
    const selectedCard = activeItem.querySelector(".return-option-card.active");

    //  Step 1 — Check return option card selection
    if (!selectedCard) {
    console.log("No return option card selected — cannot move next");
    document.querySelector("[data-selected-reason-option]").classList.remove("hidden");
    return; 
    }

    //  Step 2 — Card is selected → Now check reasons
    const selectedReason = activeItem.querySelector("[data-return-table-reason]");
    const hasRedAlert = [...selectedReason.querySelectorAll(".return-select-box")]
    .some(reason => reason.classList.contains("red-alert"));


    if (hasRedAlert) {
    document.querySelector("[data-selected-reason]").classList.remove("hidden");
    return;
    }


    console.log("selectedReason:--",selectedReason);

    
    const select_reason_one = activeItem.querySelector("[data-select-reason]");
        if (!select_reason_one) {
            console.warn("Select element NOT FOUND inside this card");
            return; // stop the function safely
        }
        try {
            if (typeof select_reason_one.showPicker === "function") {
                select_reason_one.showPicker();
            } else {
                select_reason_one.focus();
                select_reason_one.click();
            }
        } catch (e) {
            select_reason_one.focus();
            select_reason_one.click();
        }

    // if (!selectedReason) {
    //   console.log("No return reason selected — cannot move next");
    //   document.querySelector("[data-selected-reason]").classList.remove("hidden");
    //   return; // STOP execution here
    // }
    
    // reasonProductsHTML("single");
    manageProgressBar();

    const activeIndex = gridItems.indexOf(activeItem);
    const nextItem = gridItems[activeIndex + 1];
    console.log("nextItem:--",nextItem);

    // --- Remove active states from all ---
    document.querySelectorAll(".return-option-grid-item.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".return-options-title-item.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".return-option-image-item.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".return-option-des.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(`[data-return-table] tr.selected`).forEach(el => el.classList.remove("selected"));
    // document.querySelectorAll('.return-table-reason-tr').forEach(el => {el.classList.add('hidden')});

    if (nextItem) {
      const data_id = nextItem.dataset.id;
      nextItem.classList.add("active");
      
      document.querySelector(`.return-options-title-item[data-id="${data_id}"]`)?.classList.add("active");
      document.querySelector(`.return-option-image-item[data-id="${data_id}"]`)?.classList.add("active");
      document.querySelector(`[data-return-table] tr[data-id="${data_id}"]`)?.classList.add("selected");
      document.querySelector(`.return-option-des[data-id="${data_id}"]`)?.classList.add("active");

      console.log("activeIndex:---",activeIndex);
      console.log("nextItem:---",nextItem);
      console.log("gridItems.length:---",gridItems.length);
        const selected_this = nextItem.querySelector(".return-option-card.active");
        console.log("selected_this:--",selected_this);


            const all_cards = document.querySelector(".return-option-grid-item.active").querySelectorAll(".return-option-card");

            const hasActive = Array.from(all_cards).some(el =>el.classList.contains("active"));
            console.log("hasActive:--",hasActive);
            if (hasActive) {
                document.querySelector("[data-next-img]").classList.remove("disabled");
                document.querySelector("[return-choose-option-reason-next]").classList.remove("disabled");
            } else {
                document.querySelector("[data-next-img]").classList.add("disabled");
                document.querySelector("[return-choose-option-reason-next]").classList.add("disabled");
            }

            // console.log("hasActive:--",hasActive);
            // if (hasActive) {
            //     document.querySelector("[data-next-img]").classList.remove("disabled");
            //     document.querySelector("[return-choose-option-reason-next]").classList.remove("disabled");
            // } else {
            //     document.querySelector("[data-next-img]").classList.add("disabled");
            //     document.querySelector("[return-choose-option-reason-next]").classList.add("disabled");
            // }
            
        // const reasonTable_re = selected_this.closest(".return-option-grid-item").querySelector('[data-return-table-reason]');
        //     const reasonRow_re = reasonTable_re?.querySelector(`.return-table-reason-tr[data-id="${data_id}"]`);
        //     reasonRow_re?.classList.remove("hidden");

        //     const reasonTable_ex = selected_this.closest(".return-option-grid-item").querySelector('[data-return-table-exchange]');
        //     const reasonRow_ex = reasonTable_ex?.querySelector(`.return-table-reason-tr[data-id="${data_id}"]`);
        //     reasonRow_ex?.classList.remove("hidden");

      console.log("Moved to next item:", data_id);

      // --- If next item is last, disable button ---

      console.log("activeIndex + 1:--",activeIndex + 1);
      console.log("gridItems.length - 1:--",gridItems.length - 1);

      if (activeIndex + 1 === gridItems.length - 1) {
        this.classList.add("hidden");
    //    document.querySelector("[data-return-choose-single-option-next]").classList.remove("hidden");
    //    document.querySelector("[data-return-choose-single-option-next]").classList.remove("disabled");
       document.querySelector("[return-choose-option-reason-next]").classList.remove("hidden");
    //    document.querySelector("[return-choose-option-reason-next]").classList.remove("disabled");
      }
    } else {
      //  Already at last item
      this.classList.add("hidden");
    }
  });
});

document.querySelectorAll(`[data-back-img]`).forEach((imgBack) => {
  imgBack.addEventListener("click", function () {
    const gridItems = Array.from(document.querySelectorAll(".return-option-grid-item"));
    const activeItem = document.querySelector(".return-option-grid-item.active");

    if (!activeItem) return console.log(" No active grid item found");
    const selectedCard = activeItem.querySelector(".return-option-card.active");
    if (!selectedCard) {
      console.log("No return option card selected — cannot move next");
      document.querySelector("[data-selected-reason-option]").classList.remove("hidden");
      return; // STOP execution here
    }

    //  Step 2 — Card is selected → Now check reasons
    const selectedReason = activeItem.querySelector("[data-return-table-reason]");
    const hasRedAlert = [...selectedReason.querySelectorAll(".return-select-box")]
    .some(reason => reason.classList.contains("red-alert"));
    if (hasRedAlert) {
    document.querySelector("[data-selected-reason]").classList.remove("hidden");
    return;
    }


    const activeIndex = gridItems.indexOf(activeItem);
    const prevItem = gridItems[activeIndex - 1];
    // reasonProductsHTML("single");
    manageProgressBar();

    // --- Remove active states from all ---
    document.querySelectorAll(".return-option-grid-item.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".return-options-title-item.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".return-option-image-item.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".return-option-des.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(`[data-return-table] tr.selected`).forEach(el => el.classList.remove("selected"));
    // document.querySelectorAll('.return-table-reason-tr').forEach(el => {el.classList.add('hidden')});

    if (prevItem) {
      const data_id = prevItem.dataset.id;
      prevItem.classList.add("active");
    //   prevItem.querySelector('.return-option-card[data-option="store-credit"]').click();
    //   prevItem.querySelector('.return-option-card[data-option="store-credit"] h3').click();  
      document.querySelector(`.return-options-title-item[data-id="${data_id}"]`)?.classList.add("active");
      document.querySelector(`.return-option-image-item[data-id="${data_id}"]`)?.classList.add("active");
      document.querySelector(`.return-option-des[data-id="${data_id}"]`)?.classList.add("active");
      document.querySelector(`[data-return-table] tr[data-id="${data_id}"]`)?.classList.add("selected");
      if(selectedCard)
      {
        const reasonTable = prevItem.closest(".return-option-grid-item").querySelector('[data-return-table-reason]');
        const reasonRow = reasonTable?.querySelector(`.return-table-reason-tr[data-id="${data_id}"]`);
        reasonRow?.classList.remove("hidden");
      }
      if(selectedCard)
      {
        const reasonTable = prevItem.closest(".return-option-grid-item").querySelector('[data-return-table-exchange]');
        const reasonRow = reasonTable?.querySelector(`.return-table-reason-tr[data-id="${data_id}"]`);
        reasonRow?.classList.remove("hidden");
      }

      console.log(" Moved to previous item:", data_id);

      // --- Show Next button again ---
      document.querySelector("[data-next-img]")?.classList.remove("hidden");
    //   document.querySelector("[data-return-choose-single-option-next]")?.classList.add("hidden");
      document.querySelector("[return-choose-option-reason-next]")?.classList.add("hidden");

      // --- Hide Back button if now at first item ---
      if (activeIndex - 1 === 0) {
        this.classList.add("hidden");
        imgBack.closest('.navigation').querySelector('[data-return-prev-common]').classList.remove("hidden");
      }
    } else {
      // 🚫 Already at first item
      this.classList.add("hidden");
      imgBack.closest('.navigation').querySelector('[data-return-prev-common]').classList.remove("hidden");
      console.log("No previous item (already first)");
    }
  });
});







// // data-return-table-multiple table buttons click events
// const table = document.querySelector('[data-return-table-multiple]');
// table.addEventListener('click', function(event) {
//     console.log("table click event",event);
//     if (event.target.closest('button.btn-select')) {
//         const button = event.target.closest('button.btn-select');
//         const row = button.closest('tr');
//         console.log('Button clicked:', button.textContent.trim());
//         console.log('Row details:', row);
//         row.querySelector(".btn-select.active")?.classList.remove("active");
//         button.classList.add("active");
//         row.classList.remove("show-alert");
//     }
// });

// // choose return multiple option item next button click -- data-return-choose-multiple-option-next
// document.querySelectorAll(`[data-return-choose-multiple-option-next]`).forEach((multiNext) => {
//     multiNext.addEventListener("click",function(e){
//         e.preventDefault();
//         console.log("multiNext next clicked",this);

//         let notSelectedTR = this.closest(`.return-options-steps`).querySelectorAll(`[data-return-table-multiple] tr:not(:has(.btn-select.active))`);
//         if(notSelectedTR.length == 0){
//             reasonProductsHTML("multiple");
//             this.closest(`.return-options-steps`).classList.remove("active");
//             document.querySelector(`.return-options-steps.return-choose-option-reason`)?.classList.add("active");
//             manageProgressBar();
//         }else{
//             notSelectedTR.forEach(tr => {
//                 tr.classList.add("show-alert");
//             });
//         }
//     });
// });

// reason next button -- return-choose-option-reason-next
// let reasonNext = document.querySelector(`[return-choose-option-reason-next]`) || null;
let reasonNext = document.querySelector(`[return-choose-option-reason-next].next_btn`) || null;
if(reasonNext){
reasonNext.addEventListener("click",function(e){
    
    const gridItems = Array.from(document.querySelectorAll(".return-option-grid-item"));
    const activeItem = document.querySelector(".return-option-grid-item.active");
    console.log("activeItem:--",activeItem);
     if (!activeItem) return console.log("No active grid item found");

     const selectedCard = activeItem.querySelector(".return-option-card.active");

    //  Step 1 — Check return option card selection
    if (!selectedCard) {
    console.log("No return option card selected — cannot move next");
    document.querySelector("[data-selected-reason-option]").classList.remove("hidden");
    return; 
    }

    //  Step 2 — Card is selected → Now check reasons
    const selectedReason = activeItem.querySelector("[data-return-table-reason]");
    const hasRedAlert = [...selectedReason.querySelectorAll(".return-select-box")]
    .some(reason => reason.classList.contains("red-alert"));

    if (hasRedAlert) {
    document.querySelector("[data-selected-reason]").classList.remove("hidden");
    return;
    }

    console.log("selectedReason:--",selectedReason);

    e.preventDefault();
    console.log("reasonNext button clicked",this);
    let tblTrs = this.closest(".return-choose-option-single").querySelectorAll("[data-return-table-reason] .return-table-reason-tr");
    console.log("tblTrs",tblTrs);
    let allowForAlert = true;
        tblTrs.forEach(tr => {
       let noneCount = Array.from(tr.querySelectorAll("td.product-name select")).filter(select => select.value === "none").length;

            console.log("noneCount:--",noneCount);
            // if(noneCount != 0 && allowForAlert){
                if(noneCount != 0 ){
                tr.classList.add("red-alert");
                // tr.querySelector(".return-select-box").classList.remove("hidden");
                tr.querySelectorAll(".return-select-box").forEach(sel_mob => {
                     sel_mob.classList.remove("hidden");
                    const val = (sel_mob.value || "").toString().trim().toLowerCase();
                    console.log("val:--",val);
                    if (val === "none" || val === "") {
                        sel_mob.classList.add("red-alert");
                    }
                    else
                    {
                        sel_mob.classList.remove("red-alert");
                    }
                });
                // allowForAlert = false;
                // reasonNext.closest(".return-choose-option-reason").classList.remove("exchange-alert");

            }

            // if(!reasonNext.classList.contains('original_step')){
            //  const all_selectd_id = tr.getAttribute("data-id");
            //  const selected_return_opt = document.querySelector(".return-option-grid-item[data-id='"+ all_selectd_id +"']").querySelector(".return-option-card.active").getAttribute("data-option");
            //  console.log("selected_return_opt:-",selected_return_opt);
            //  let location = document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn;
            // console.log("location>>>>",location);
            // if(location != "INTERNATIONAL"){
            //  if(selected_return_opt == "store-credit" || selected_return_opt == "refund")
            //  {
            //     tr.querySelectorAll(".return-select-box").forEach(val_select => {
            //         const all_selectd_val = val_select.value || ""; // safe fallback

            //         if (typeof all_selectd_val === "string" &&
            //             all_selectd_val.includes("Item didn’t fit properly")) {
                        
            //             const cardEl  = document.querySelector(
            //                 ".return-option-grid-item[data-id='" + all_selectd_id + "']"
            //             ).querySelector(".return-option-card.active");

            //             cardEl.classList.add('change_to_exchange');
            //             document.querySelector('[return-choose-option-exchange-prev]').classList.add('change_to_exchange');

            //             const selected_return_opt = cardEl.getAttribute("data-option");
            //             const row = cardEl.closest(".return-option-row");

            //             row.querySelector('[data-option="exchange"] .up_div').click();
            //             row.querySelector('[data-option="exchange"]').classList.add("active");

            //             document.querySelectorAll(".return-options-steps").forEach(steps => {
            //                 steps.classList.remove("active");
            //             });

            //             // document.querySelector(".return-choose-option-exchange").classList.add("active");

            //             let noneCount = Array.from(this.closest(".return-choose-option-single").querySelectorAll("[data-return-table-reason] td.product-name select")).filter(select => select.value === "none").length;
            //             if(this.closest(".return-choose-option-single").querySelectorAll("[data-return-table-reason] tr.red-alert").length == 0 && noneCount == 0){
            //                 exchangeORreturn_ProductsHTML();
            //                 manageProgressBar();
            //             }
            //         }
            //     });
            //  }
            // }
            // }
        });
        
        // let noneCount = Array.from(this.closest(".return-choose-option-single").querySelectorAll("[data-return-table-reason] td.product-name select")).filter(select => select.value === "none").length;
        // if(this.closest(".return-choose-option-single").querySelectorAll("[data-return-table-reason] tr.red-alert").length == 0 && noneCount == 0){
        //     exchangeORreturn_ProductsHTML();
        //     manageProgressBar();
        // }
    // }
    // exchangeORreturn_ProductsHTML();
    exchangeORreturn_ProductsHTML_confirm();
    manageProgressBar();
});
}

// reason prev button -- return-choose-option-reason-prev
let reasonPrev = document.querySelector(`[return-choose-option-reason-prev]`) || null;
if(reasonPrev){
reasonPrev.addEventListener("click",function(e){
    e.preventDefault();
    console.log("reasonPrev button clicked",this);

    let allSelects = reasonPrev.closest(".return-choose-option-reason").querySelectorAll("[data-return-table-reason] select");
    allSelects.forEach(select => {
        select.value = "none";
        select.classList.add("hidden");
    });

    let allTr = reasonPrev.closest(".return-choose-option-reason").querySelectorAll("[data-return-table-reason] .return-table-reason-tr");
    allTr.forEach(tr => {
        tr.classList.add("red-alert");
    });

    reasonPrev.closest(".return-choose-option-reason").classList.remove("exchange-alert");
    reasonPrev.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-next].next_btn").innerHTML = reasonPrev.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-next].next_btn").dataset.primaryLabel;

    reasonPrev.closest(`.return-options-steps`).classList.remove("active");

    let location = document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn;
    if(location != "INTERNATIONAL"){
        // if(document.querySelectorAll(`.return-order-lineitem.selected`).length == 1){
        //     document.querySelector(`.return-options-steps.return-choose-option-single`).classList.add("active");
        // }else{
        //     document.querySelector(`.return-options-steps.return-choose-option-multiple`).classList.add("active");
        // }
        document.querySelector(`.return-options-steps.return-choose-option-single`).classList.add("active");
        document.querySelector(`.return-option-card[data-option="exchange"]`)?.classList.remove("hidden");
    }else{
        document.querySelector(`.return-option-card[data-option="exchange"]`)?.classList.add("hidden");
        document.querySelector(`.return-options-steps.return-choose-option-single`).classList.add("active");
    }
    manageProgressBar();

});
}


// exhcnage prev button -- return-choose-option-exchange-prev
let exchangePrev = document.querySelector(`[return-choose-option-exchange-prev]`) || null;
if(exchangePrev){
exchangePrev.addEventListener("click",function(e){
    e.preventDefault();
    console.log("exchangePrev button clicked",this);
    document.querySelector(`[return-choose-option-exchange-next]`).classList.add("disabled");
    exchangePrev.closest(`.return-options-steps`).classList.remove("active");
    document.querySelector(`.return-options-steps.return-choose-option-single`).classList.add("active");
    manageProgressBar();

    //Ak custom code
    if(exchangePrev.classList.contains('change_to_exchange')){

        document.querySelectorAll(".return-option-grid-item").forEach((container) => {
            const original_card = container.querySelector('.return-option-card.change_to_exchange');
            if(original_card){
               original_card.querySelector('.up_div').click();
               original_card.classList.add("active");
               original_card.classList.remove("change_to_exchange");
               document.querySelector('[return-choose-option-exchange-prev]').classList.remove('change_to_exchange');
               const el = document.querySelector('[data-return-table-exchange] tr');
                 if (el) el.remove();
            }
        });
        // const get_op = exchangePrev.getAttribute('ori_option');
        // if(get_op){
            // let selectReasonArr = document.querySelectorAll(`[data-select-reason]`);

            // selectReasonArr.forEach(select => {
            //     const selected_option = select.value;
            //     const table_id = select.closest(".return-table-reason-tr")?.dataset.id;
            //     const reason_id = document.querySelector(`.return-option-grid-item[data-id="${table_id}"]`);

            //     reason_id.querySelectorAll(".return-option-card").forEach((card) => {

            //             const is_return_opt = card.getAttribute("data-option");
            //             const selected_option = select.value;

            //         // console.log("is_return_opt:--",is_return_opt,"selected_option:--",selected_option);
            //         // if(is_return_opt == "store-credit" && selected_option == "Item didn’t fit properly" || is_return_opt == "refund" && selected_option == "Item didn’t fit properly")
            //         // {
            //                 card.closest(".return-option-row").querySelector('[data-option="'+get_op+'"] .up_div').click();
            //                 card.closest(".return-option-row").querySelector('[data-option="'+get_op+'"]').classList.add("active");
            //                 document.querySelector('[return-choose-option-exchange-prev]').classList.remove('change_to_exchange');
            //                 document.querySelector('[return-choose-option-exchange-prev]').setAttribute('ori_option','');
            //         // }

            //     });
            // });
        // }
    }
    //Ak custom code
});
}

// exhcnage next button -- return-choose-option-exchange-next
let exchangeNext = document.querySelector(`[return-choose-option-exchange-next]`) || null;
if(exchangeNext){
exchangeNext.addEventListener("click",function(e){
    e.preventDefault();
    console.log("exchangeNext button clicked",this);
    exchangeNext.closest(`.return-options-steps`).classList.remove("active");
    if(dataIdsArrayReturnONLY.length > 0){
        // document.querySelector(`.return-options-steps.return-choose-option-reason-final`).classList.add("active");
        document.querySelector(`.return-options-steps.return-choose-option-return-confirmation`).classList.add("active");
        exchangeORreturn_confirmation_ProductsHTML();
    }else{
        console.log("need to generate comfirmation of exchange compare table");
        exchangeORreturn_confirmation_ProductsHTML();
    }
    manageProgressBar();
});
}

// // reason final prev button -- return-choose-option-reason-final-prev
// let reasonFinalPrev = document.querySelector(`[return-choose-option-reason-final-prev]`) || null;
// if(reasonFinalPrev){
// reasonFinalPrev.addEventListener("click",function(e){
//     e.preventDefault();
//     console.log("reasonFinalPrev button clicked",this);
//     document.querySelector(`[return-choose-option-reason-final-next]`).classList.add("disabled");
//     reasonFinalPrev.closest(`.return-options-steps`).classList.remove("active");
//     if(dataIdsArrayExchange.length > 0){
//         document.querySelector(`.return-options-steps.return-choose-option-exchange`).classList.add("active");
//     }else{
//         document.querySelector(`.return-options-steps.return-choose-option-reason`).classList.add("active");
//     }
//     manageProgressBar();
// });
// }

// // reason final next button -- return-choose-option-reason-final-next
// let reasonFinalNext = document.querySelector(`[return-choose-option-reason-final-next]`) || null;
// if(reasonFinalNext){
// reasonFinalNext.addEventListener("click",function(e){
//     e.preventDefault();
//     console.log("reasonFinalNext button clicked",this);
//     exchangeORreturn_confirmation_ProductsHTML();
//     manageProgressBar();
// });
// }

// exchange confirmation prev button -- return-choose-option-exchange-confirmation-prev
let exchangeConfirmationPrev = document.querySelector(`[return-choose-option-exchange-confirmation-prev]`) || null;
if(exchangeConfirmationPrev){
exchangeConfirmationPrev.addEventListener("click",function(e){
    e.preventDefault();
    console.log("exchangeConfirmationPrev button clicked",this);
    exchangeConfirmationPrev.closest(`.return-options-steps`).classList.remove("active");
    if(dataIdsArrayReturnONLY.length > 0){
        document.querySelector(`.return-options-steps.return-choose-option-return-confirmation`).classList.add("active");
    // }else if(dataIdsArrayReturn.length > 0){
    //     document.querySelector(`.return-options-steps.return-choose-option-reason-final`).classList.add("active");
    }else{
        document.querySelector(`.return-options-steps.return-choose-option-exchange`).classList.add("active");
    }
    manageProgressBar();
});
}

// exchange confirmation next button -- return-choose-option-exchange-confirmation-next
let exchangeConfirmationNext = document.querySelector(`[return-choose-option-exchange-confirmation-next]`) || null;
if(exchangeConfirmationNext){
exchangeConfirmationNext.addEventListener("click",function(e){
    e.preventDefault();
    console.log("exchangeConfirmationNext button clicked",this);
    exchangeConfirmationNext.closest(`.return-options-steps`).classList.remove("active");
    document.querySelector(`.return-options-steps.return-choose-option-declaration`).classList.add("active");
    manageProgressBar();
});
}

// retun method select
const returnMethod = document.querySelector('.return-print-options');
if (returnMethod) {
  returnMethod.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll(".return-print-card").forEach(card => {
    console.log("removed");
      card.classList.remove("return-option-selected");
      
    });

    const parentCard = e.target.closest(".return-print-card");
    console.log("add");
    if (parentCard) parentCard.classList.add("return-option-selected");
    var selected_card = parentCard.getAttribute("data-print");
    console.log("selected_card:--",selected_card);

    if(selected_card == "QrCode")
    {
        document.querySelector(".print-your-own-label").classList.remove("active");
        document.querySelector(".paperless-return-process").classList.add("active");

        document.querySelector(".print-your-own-thankyou-mass").classList.remove("active");
        document.querySelector(".paperless-thankyou-mass").classList.add("active");
    }
    else
    {
        document.querySelector(".print-your-own-label").classList.add("active");
        document.querySelector(".paperless-return-process").classList.remove("active");

        document.querySelector(".print-your-own-thankyou-mass").classList.add("active");
        document.querySelector(".paperless-thankyou-mass").classList.remove("active");
    }

    if (typeof dataIdsArrayExchange !== "undefined" && dataIdsArrayExchange.length > 0) {
      console.log("Exchange data IDs found:", dataIdsArrayExchange);
    }
    manageProgressBar();
  });
}


// return confirmation prev button -- return-choose-option-return-confirmation-prev
let returnConfirmationPrev = document.querySelector(`[return-choose-option-return-confirmation-prev]`) || null;
if(returnConfirmationPrev){
returnConfirmationPrev.addEventListener("click",function(e){
    e.preventDefault();
    console.log("returnConfirmationPrev button clicked",this);
    returnConfirmationPrev.closest(`.return-options-steps`).classList.remove("active");
    
    // document.querySelector(`.return-options-steps.return-choose-option-reason-final`).classList.add("active");
    // if(dataIdsArrayExchange.length > 0){
    //     document.querySelector(`.return-options-steps.return-choose-option-exchange`).classList.add("active");
    // }else{
        document.querySelector(`.return-options-steps.return-choose-option-single`).classList.add("active");
        const activeCard = document.querySelector(".return-choose-option-single.active .return-option-card.active");
        if (activeCard) {
        const changeBtn = activeCard.querySelector(".changeReturnOpt");
            if (changeBtn) {
                changeBtn.classList.remove("hidden");
            }
        }
    // }
    manageProgressBar();
});
}

// return confirmation next button -- return-choose-option-return-confirmation-next
let returnConfirmationNext = document.querySelector(`[return-choose-option-return-confirmation-next]`) || null;
if(returnConfirmationNext){
returnConfirmationNext.addEventListener("click",function(e){
    e.preventDefault();
    console.log("returnConfirmationNext button clicked",this);
    returnConfirmationNext.closest(`.return-options-steps`).classList.remove("active");
    if(dataIdsArrayExchange.length > 0){
        document.querySelector(`.return-options-steps.return-choose-option-exchange-confirmation`).classList.add("active");
    }else{
        document.querySelector(`.return-options-steps.return-choose-option-declaration`).classList.add("active");
    }
    manageProgressBar();
});
}

// declaration prev button -- return-choose-option-declaration-prev
let declarationPrev = document.querySelector(`[return-choose-option-declaration-prev]`) || null;
if(declarationPrev){
declarationPrev.addEventListener("click",function(e){
    e.preventDefault();
    console.log("declarationPrev button clicked",this);
    declarationPrev.closest(`.return-options-steps`).classList.remove("active");
    if(dataIdsArrayExchange.length > 0){
        document.querySelector(`.return-options-steps.return-choose-option-exchange-confirmation`).classList.add("active");
    }else if(dataIdsArrayReturnONLY.length > 0){
        document.querySelector(`.return-options-steps.return-choose-option-return-confirmation`).classList.add("active");
    }else{
        document.querySelector(`.return-options-steps.return-choose-option-reason`).classList.add("active");
    }
    manageProgressBar();
});
}

// checkbox change event -- return-choose-option-declaration
let declarationCheckoboxArr = document.querySelectorAll(`.return-choose-option-declaration input[type="checkbox"]`);
declarationCheckoboxArr.forEach(input => {
    input.addEventListener("change",function(e){
        e.preventDefault();
        console.log("checkobox changed",this);
        if(document.querySelectorAll(`.return-choose-option-declaration input[type="checkbox"]`).length == document.querySelectorAll(`.return-choose-option-declaration input[type="checkbox"]:checked`).length){
            document.querySelector(`[return-choose-option-declaration-next]`).classList.remove("disabled");
        }else{
            document.querySelector(`[return-choose-option-declaration-next]`).classList.add("disabled");
        }
    });
});

// declaration next button -- return-choose-option-declaration-next
let declarationNext = document.querySelector(`[return-choose-option-declaration-next]`) || null;
if(declarationNext){
declarationNext.addEventListener("click",function(e){
    e.preventDefault();
    console.log("declarationNext button clicked",this);
    declarationNext.closest(`.return-options-steps`).classList.remove("active");
    if(document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn == "GREAT BRITAIN" || document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn == "NORTHERN IRELAND" || document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn == "INTERNATIONAL" ){
        document.querySelector(`.return-options-steps.return-choose-option-return-method`).classList.add("active");
    }else{
        document.querySelector(`.return-options-steps.return-choose-option-return-prepare-parcel`).classList.add("active");
    }
    manageProgressBar();
});
}

// return-method option prev button -- return-choose-option-return-method-prev
let returnMethodPrev = document.querySelector(`[return-choose-option-return-method-prev]`) || null;
if(returnMethodPrev){
returnMethodPrev.addEventListener("click",function(e){
    e.preventDefault();
    console.log("returnMethodPrev button clicked",this);
    returnMethodPrev.closest(`.return-options-steps`).classList.remove("active");
    document.querySelector(`.return-options-steps.return-choose-option-declaration`).classList.add("active");
    manageProgressBar();
});
}

// return-method option next button -- return-choose-option-return-method-next
let returnMethodNext = document.querySelector(`[return-choose-option-return-method-next]`) || null;
if(returnMethodNext){
returnMethodNext.addEventListener("click",function(e){
    e.preventDefault();
    console.log("returnMethodNext button clicked",this);
    returnMethodNext.closest(`.return-options-steps`).classList.remove("active");
    document.querySelector(`.return-options-steps.return-choose-option-return-prepare-parcel`).classList.add("active");
    manageProgressBar();
});
}

// prepare-parcel option prev button -- return-choose-option-submit-return-prev
let prepareParcelPrev = document.querySelector(`[return-choose-option-submit-return-prev]`) || null;
if(prepareParcelPrev){
prepareParcelPrev.addEventListener("click",function(e){
    e.preventDefault();
    console.log("prepareParcelPrev button clicked",this);
    prepareParcelPrev.closest(`.return-options-steps`).classList.remove("active");
    if(document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn == "GREAT BRITAIN"){
        document.querySelector(`.return-options-steps.return-choose-option-return-method`).classList.add("active");
    }else{
        document.querySelector(`.return-options-steps.return-choose-option-declaration`).classList.add("active");
    }
    manageProgressBar();
});
}

// prepare-parcel option next/submit button -- return-choose-option-submit-return
let submitReturnBtn = document.querySelector(`[return-choose-option-submit-return]`) || null;
if(submitReturnBtn){
submitReturnBtn.addEventListener("click",function(e){
    e.preventDefault();
    console.log("submitReturnBtn button clicked",this);
    this.classList.add("disabled");
    submitReturn();
    // submitReturnBtn.closest(`.return-options-steps`).classList.remove("active");
    // document.querySelector(`.return-options-steps.return-choose-option-return-prepare-parcel`).classList.add("active");
    manageProgressBar();
});
}


let returnConfirmationfinal = document.querySelector(`[return-choose-option-confirm-change]`) || null;
if(returnConfirmationfinal){
    returnConfirmationfinal.addEventListener("click",function(e){
    e.preventDefault();
    
    const hasAnyActive = document.querySelector(".return-option-card-change.active");
    
    document.querySelector("[data-error-change-exchange]").classList.add("hidden");
    
    if (hasAnyActive) {
        console.log("Selected at least one reason");
        document.querySelector("[data-error-change-confirm]").classList.add("hidden");
        const active_type = hasAnyActive.getAttribute("data-isopt");
        console.log("active_type:--",active_type);
        if(active_type == "exchange")
        {
            const exchangeTable = document.querySelector(".return-table.confirm-exchange");
            const exchangeSelects = exchangeTable.querySelectorAll("select[data-select-exchange]");
            const noneCount = Array.from(exchangeSelects).filter(select => select.value === "none").length;
            if (noneCount > 0) {
                document.querySelector("[data-error-change-exchange]").classList.remove("hidden");
                return;
            }
            else
            {
                document.querySelectorAll(".return-table.confirm-exchange").forEach(ele => {
                    ele.classList.add("hidden");
                });
            }
        }
    } else {
        console.log("No reason selected");
        document.querySelector("[data-error-change-confirm]").classList.remove("hidden");
        return;
    }


    const all_confirm_items = document.querySelector("[data-return-table-return-confirmationall]");
    if (!all_confirm_items) return;
    const item_id = all_confirm_items.querySelector('.return-table-reason-tr.active').getAttribute("data-id");
    let item_old_type = all_confirm_items.querySelector('.return-table-reason-tr.active').getAttribute("return_type");
    console.log("item_id:--",item_id,"item_old_type:--",item_old_type);
    if(item_old_type === "Store Credit")
    {
        item_old_type = "store-credit";
    }
    let item_new_type = all_confirm_items.querySelector('.return-table-reason-tr.active .return-option-card-change.active').getAttribute("data-isopt");
     if(item_new_type === "Store Credit")
    {
         item_new_type = "store-credit";
    }
    console.log("item_id:--",item_id,">>>>",item_old_type,">>>>",item_new_type);

    const change_reason_trigger = document.querySelector(`.return-option-grid-item[data-id="${item_id}"]`);
    console.log("change_reason_trigger:--",change_reason_trigger);
    // if (!change_reason_trigger) return;

    change_reason_trigger.querySelectorAll(".return-option-card").forEach(card => {
        // console.log("card:--",card);
        const optionEl = card.getAttribute('data-option');
        // const optionEl_new = card.getAttribute('data-option');
        console.log("old_opt:--",optionEl);

        if(optionEl == item_old_type){
            card.classList.remove("active");  
        }
        console.log('item_new_type',item_new_type);
        if(optionEl == item_new_type){
         card.classList.add("active");
        }
    });

    console.log("final change btn",this);
    document.querySelector(".credit-method-table").classList.remove("hidden");
    const wrapper = returnConfirmationfinal.closest(".return-options-steps");
    if (!wrapper) return;

    const rows = wrapper.querySelectorAll(".return-table-reason-tr");
    const rows_change_opt = wrapper.querySelectorAll(".change-opt");

    // check if any row is hidden
    const hasHidden = Array.from(rows).some(tr =>
        tr.classList.contains("hidden")
    );

    // check if any change-opt is NOT hidden
    const hasHidden_opt = Array.from(rows_change_opt).some(tr =>
        !tr.classList.contains("hidden")
    );

    // show all rows if any is hidden
    if (hasHidden) {
        rows.forEach(tr => {
            tr.classList.remove("hidden");
            tr.classList.add("active");
        });
    }
    // hide all change-opt if any is visible
    if (hasHidden_opt) {
        rows_change_opt.forEach(tr => {
            tr.classList.add("hidden");
        });
    }
    const changeBtns = wrapper.querySelectorAll(".changeReturnOpt_inconfirm");
    changeBtns.forEach(btn => {
        btn.classList.remove("hidden");
    });

    exchangeORreturn_ProductsHTML_confirm();
    manageProgressBar();
});
}



//Ak custom code 
// const exchange_popup_fit = document.querySelector('.exchange_fit_popup');
// if(exchange_popup_fit){
//    const yes_exchange_btn = exchange_popup_fit.querySelector('.exchange_popup_btns [data-exchange-yes]');
//    if(yes_exchange_btn){
//         yes_exchange_btn.addEventListener('click',function(yes_btn){
//             const active_grid_op = document.querySelector('.return-option-grid .return-option-grid-item.active');
//             if(active_grid_op){
//                 const op_exchange = active_grid_op.querySelector('.return-option-card[data-option="exchange"] h3');
//                 if(op_exchange){
//                     op_exchange.click();
//                 }
//             }
            
//             exchange_popup_fit.classList.remove('active');
//         });
//    }

//    const no_exchange_btn = exchange_popup_fit.querySelector('.exchange_popup_btns [data-exchange-no]');
//    if(no_exchange_btn){
//         no_exchange_btn.addEventListener('click',function(no_btn){
//             exchange_popup_fit.classList.remove('active');
//         });
//    }
// }
//end Ak custom code

});

function manageProgressBar(){
    let totalOptions = document.querySelectorAll(`.return-options-steps`).length;
    let perOptions = 100 / totalOptions;
    let activeIndex = 0;
    document.querySelectorAll(`.return-options-steps`).forEach((element,index) => {
        if(element.classList.contains("active")){
            // console.log("element",element,"index",index);
            activeIndex = index;
        }
    });
    if(document.querySelector(`.return-progress-thumb`)) document.querySelector(`.return-progress-thumb`).style.width = `${perOptions*activeIndex}%`;

}


// selectedProductsHTML
function selectedProductsHTML(){
    let tableTR = '';
    // let tableTR_multiple = '';

    let returnOptionTitles = '';
    let returnOptionGrid = '';
    let returnOptionDes = '';
    let retutnOptioninfo = '';
    let returnOptionImageGrid = '';
    document.querySelectorAll(`.return-order-lineitem.selected`).forEach((item,index) => {
        let pagination = "";
        if(document.querySelectorAll(`.return-order-lineitem.selected`).length > 1){
            pagination = ` for product (${index+1}/${document.querySelectorAll(`.return-order-lineitem.selected`).length})`;
        }
        tableTR += `<tr data-id="${item.dataset.id}">
            <td class="product-image">
              <img src="${item.dataset.lineitemImage}" alt="Product Image" width="100%" height="100%">
            </td>
            <td class="product-name hidden">
              <span class="product-name">${item.querySelector(`.lineitem-info-title`).innerHTML}</span>
              <span class="product-color mob-only"> <strong>Colour</strong>${item.querySelector(`.lineitem-info-color`).innerHTML}</span>
              <span class="product-size mob-only"> <strong>Size</strong>${item.querySelector(`.lineitem-info-size`).innerHTML}</span>
              <span class="product-price mob-only"> <strong>Unit price</strong>${item.querySelector(`.lineitem-info-title`).innerHTML}</span>
            </td>
            <td class="product-color desk-only hidden">${item.querySelector(`.lineitem-info-color`).innerHTML}</td>
            <td class="product-size desk-only hidden">${item.querySelector(`.lineitem-info-size`).innerHTML}</td>
            <td class="return-value"></td>
          </tr>`;

        returnOptionTitles += `<div class="return-options-title-item${index == 0 ? " active" : ""}" data-id="${item.dataset.id}">
            <div class="return-options-title">
                <h2 class="return-step-title">Choose your return option${pagination}</h2>
                <p class="rte">Choose what you’d like us to do with the return</p>
            </div>
        </div>`;

        // returnOptionImageGrid += `<div class="return-option-image-item${index == 0 ? " active" : ""}" data-id="${item.dataset.id}">
        //   <img src="${item.dataset.lineitemImage}" alt="Product Image" width="100%" height="100%">
        //   <span class="tick-icon"></span>
        // </div>`;

        // returnOptionDes += `<div class="return-option-des${index == 0 ? " active" : ""}" data-id="${item.dataset.id}">
        // <div class="return-order-lineitem-info">${item.querySelector(`.lineitem-info-title`).innerHTML}</div>
        // <div class="lineitem-info-color"><span>${item.querySelector(`.lineitem-info-color`).innerHTML}</span></div>
        // <div class="lineitem-info-size"><span>${item.querySelector(`.lineitem-info-size`).innerHTML}</span></div>
        // <div class="lineitem-info-price"><span>${item.querySelector(`.lineitem-info-price`).innerHTML}</span></div>
        // </div>`;

        retutnOptioninfo+=`
        <div class="retun_info_main">
        <div class="return-option-image-item${index == 0 ? " active" : ""}" data-id="${item.dataset.id}">
          <img src="${item.dataset.lineitemImage}" alt="Product Image" width="100%" height="100%">
          <span class="tick-icon"></span>
        </div>
        <div class="return-option-des${index == 0 ? " active" : ""}" data-id="${item.dataset.id}">
        <div class="return-order-lineitem-info">${item.querySelector(`.lineitem-info-title`).innerHTML}</div>
        <div class="lineitem-info-color"><span>${item.querySelector(`.lineitem-info-color`).innerHTML}</span></div>
        <div class="lineitem-info-size"><span>${item.querySelector(`.lineitem-info-size`).innerHTML}</span></div>
        <div class="lineitem-info-price"><span>${item.querySelector(`.lineitem-info-price`).innerHTML}</span></div>
        </div>
        </div>`;

        returnOptionGrid += `<div class="return-option-grid-item${index == 0 ? " active" : ""}" data-id="${item.dataset.id}">
            <div class="return-option-row">
                <div class="return-option-card" data-option="store-credit">
                <div class="return-option-card-inner">
                <div class="up_div"></div>
                    <h3><span class="toggle-icon">+</span>Store Credit</h3>
                    <span class="card-info">Free</span>
                    <span class="card-info_inside">Free</span>
                    <span class="changeReturnOpt hidden">change</span>

                    <ul class="hidden">
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Free.svg?v=1758632058">Free</li>
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Super_fast.svg?v=1758632059">Super Fast - credit within 24 hours</li>
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Spend_and_same_item.svg?v=1758632058">Spend on anything (12 months)</li>
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Full_value.svg?v=1758632058">Full value as credit</li>
                    </ul>
                </div>
                <button class="btn-select button">Choose Store Credit <span class="check"></span></button>
                
                </div>
                
                 

                <div class="return-option-card" data-option="exchange" data-old-size="${item.querySelector(`.lineitem-info-size_val`).innerHTML}" data-changed-size="">
                <div class="return-option-card-inner">
                <div class="up_div"></div>
                    <h3><span class="toggle-icon">+</span>Exchange</h3>
                    <span class="card-info">Free</span>
                    <span class="card-info_inside">Free</span>
                    <span class="changeReturnOpt hidden">change</span>
                    <ul class="hidden">
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Free.svg?v=1758632058">Free</li>
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Super_fast.svg?v=1758632059">Fast - Next Day After We Receive</li>
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Spend_and_same_item.svg?v=1758632058">Same item, different size</li>
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Full_value.svg?v=1758632058">Full value in new item, no change</li>
                    </ul>
                </div>
                <button class="btn-select button">Choose Exchange <span class="check"></span></button>
                
                </div>

                <div class="return-option-card" data-option="refund">
                <div class="return-option-card-inner">
                <div class="up_div"></div>
                    <h3><span class="toggle-icon">+</span>Refund</h3>
                    <span class="card-info">£5 Fee</span>
                    <span class="card-info_inside">£5 order fee</span>
                    <span class="changeReturnOpt hidden">change</span>
                    <ul class="hidden">
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Fee_deducted_and_extra_transport.svg?v=1758632058">£5 Fee Deducted</li>
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/10-15_working_days.svg?v=1758632058">10–15 Working Days (depending on card processor)</li>
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Refund_minus.svg?v=1758632058">Refund minus £5</li>
                    <li><img src="https://cdn.shopify.com/s/files/1/0934/8877/5503/files/Fee_deducted_and_extra_transport.svg?v=1758632058">Extra transport + packaging = higher impact</li>
                    </ul>
                </div>
                <button class="btn-select button">Choose Refund <span class="check"></span></button>
                </div>
            </div>
            <table class="return-table refund" data-return-table-exchange></table>
            <table class="return-table refund" data-return-table-reason></table>
        </div>`;

        // tableTR_multiple += `<tr data-id="${item.dataset.id}">
        //     <td class="product-image">
        //       <img src="${item.dataset.lineitemImage}" alt="Product Image" width="100%" height="100%">
        //     </td>
        //     <td class="product-name">${item.querySelector(`.lineitem-info-title`).innerHTML}<span class="mob-only"> ${item.querySelector(`.lineitem-info-color`).innerHTML}, ${item.querySelector(`.lineitem-info-size`).innerHTML}</span></td>
        //     <td class="product-color desk-only">${item.querySelector(`.lineitem-info-color`).innerHTML}</td>
        //     <td class="product-size desk-only">${item.querySelector(`.lineitem-info-size`).innerHTML}</td>
        //     <td class="exchange-btn"><button class="btn-select button" data-button="exchange">Exchange<span class="check"></span></button></td>
        //     <td class="store-credit-btn"><button class="btn-select button" data-button="store-credit">Store Credit<span class="check"></span></button></td>
        //     <td class="refund-btn"><button class="btn-select button" data-button="refund">Refund<span class="check"></span></button></td>
        //   </tr>`;
    });
    document.querySelector(`[data-return-table]`).innerHTML = tableTR;
    document.querySelector(`.return-options-title-grid`).innerHTML = returnOptionTitles;
    // document.querySelector(`.return-options-des`).innerHTML = returnOptionDes;
    // document.querySelector(`.return-option-image-grid`).innerHTML = returnOptionImageGrid;
    document.querySelector(`.return-option-image-grid`).innerHTML = retutnOptioninfo;
    document.querySelector(`.return-option-grid`).innerHTML = returnOptionGrid;
    //  document.querySelector(`.return-option-grid`).innerHTML = returnOptionGrid;
    

    // document.querySelector(`[data-return-table-multiple]`).innerHTML = tableTR_multiple;

    //image click
    document.querySelectorAll(`.return-option-image-grid .return-option-image-item`).forEach((img) => {
        img.addEventListener("click",function(e){
            e.preventDefault();
            console.log("img clicked",this);
            document.querySelector(".return-option-image-grid .return-option-image-item.active")?.classList.remove("active");
            this.classList.add("active");

            document.querySelector(`.return-options-title-item.active`).classList.remove("active");
            document.querySelector(`.return-options-title-item[data-id="${this.dataset.id}"]`).classList.add("active");

            document.querySelector(`.return-option-grid-item.active`).classList.remove("active");
            document.querySelector(`.return-option-grid-item[data-id="${this.dataset.id}"]`).classList.add("active");

            // document.querySelectorAll(".return-option-card-inner ul").forEach(ul => ul.classList.add("hidden"));
            // this.querySelector("ul")?.classList.remove("hidden");
        });
    });

    // return options card click event -- return-option-card

        // if (document.body.clientWidth <= 767) {
        // setTimeout(() => {
        //     const firstContainer = document.querySelector(".return-option-grid-item");
        //     if (firstContainer) {
        //         const storeCreditCard = firstContainer.querySelector('.return-option-card[data-option="store-credit"]');
        //         console.log("First storeCreditCard:", storeCreditCard);

        //         if (storeCreditCard) {
        //             storeCreditCard.dispatchEvent(new Event("click", { bubbles: true }));
        //             storeCreditCard.querySelector(".up_div").click();
        //             storeCreditCard.querySelector("h3").click();
        //         }
        //     }
        //     }, 500);
        // }



    document.querySelectorAll(".return-option-grid-item").forEach((container) => {
    // Set default active card (store-credit)
    container.querySelectorAll(`.return-option-card`).forEach((card) => {
        
        manageProgressBar();
        

        const upDiv = card.querySelector(".up_div");
        const heading = card.querySelector("h3");
        const changebtn = card.querySelector(".changeReturnOpt");
        const dataId = card.closest(".return-option-grid-item").dataset.id;

        // --- When radio (.up_div) is clicked ---
        if (heading) {
        heading.addEventListener("click", function (e) {
            e.preventDefault();
            console.log("return-option-card:-", card.getAttribute("data-option"));
            document.querySelector(".return-options-right").classList.add("hidden");
            if(document.querySelector("[data-next-img]").classList.contains('disabled'))
            {
                document.querySelector("[data-next-img]").classList.remove("disabled");
            }

            if(document.querySelector("[return-choose-option-reason-next]").classList.contains('disabled'))
            {
                document.querySelector("[return-choose-option-reason-next]").classList.remove("disabled");
            }


            reasonProductsHTML("single");

            // let tblTrs = this.closest(".return-choose-option-reason").querySelectorAll("[data-return-table-reason] .return-table-reason-tr");
            //  console.log("tblTrs",tblTrs);

            // Mark only this card active in the same container
            const activeCard = card.closest(".return-option-grid-item").querySelector(".return-option-card.active");
            if (activeCard) activeCard.classList.remove("active");
            card.classList.add("active");
            card.querySelector(".changeReturnOpt").classList.remove("hidden");
            
            // Mark related product/image as selected
            document.querySelector(`.return-option-image-item[data-id="${dataId}"]`)?.classList.add("selected");
            document.querySelector(`[data-return-table] tr[data-id="${dataId}"]`)?.classList.add("selected");
            document.querySelector(`[data-return-table] tr[data-id="${dataId}"]`)?.classList.add("selected");
            const card_reason = card.getAttribute("data-option");
            exchangeORreturn_ProductsHTML();
            if(card_reason == "exchange")
            {
                // exchangeORreturn_ProductsHTML();

                setTimeout(() => {
                    const select_reason_ex = card.closest(".return-option-grid-item.active").querySelector("[data-select-exchange]");
                    if (!select_reason_ex) {
                        console.warn("Select element NOT FOUND inside this card");
                        return; // stop the function safely
                    }
                    try {
                        if (typeof select_reason_ex.showPicker === "function") {
                            select_reason_ex.showPicker();
                        } else {
                            select_reason_ex.focus();
                            select_reason_ex.click();
                        }
                    } catch (e) {
                        select_reason_ex.focus();
                        select_reason_ex.click();
                    }
                }, 500);

                const reasonTable = card.closest(".return-option-grid-item").querySelector('[data-return-table-exchange]');
                const reasonRow = reasonTable?.querySelector(`.return-table-reason-tr[data-id="${dataId}"]`);
                reasonRow?.classList.remove("hidden");

                setTimeout(() => {
                    card.closest(".return-option-grid-item").querySelector('[data-return-table-reason]').classList.add("hidden");
                }, 100);
            }
            if(card_reason != "exchange")  
            {  
                setTimeout(() => {
                    const select_reason_one = card.closest(".return-option-grid-item.active").querySelector("[data-select-reason]");
                    if (!select_reason_one) {
                        console.warn("Select element NOT FOUND inside this card");
                        return; // stop the function safely
                    }
                    try {
                        if (typeof select_reason_one.showPicker === "function") {
                            select_reason_one.showPicker();
                        } else {
                            select_reason_one.focus();
                            select_reason_one.click();
                        }
                    } catch (e) {
                        select_reason_one.focus();
                        select_reason_one.click();
                    }
                }, 500);
            }
            // document.querySelector("[data-return-table-reason]").classList.remove("hidden");
            const reasonTable = card.closest(".return-option-grid-item").querySelector('[data-return-table-reason]');
            const reasonRow = reasonTable?.querySelector(`.return-table-reason-tr[data-id="${dataId}"]`);
            reasonRow?.classList.remove("hidden");


            // Enable Next button if all are selected
            if (
            document.querySelectorAll(".return-order-lineitem.selected").length ===
            document.querySelectorAll(".return-option-image-grid .return-option-image-item.selected").length
            ) {
            document.querySelector("[data-return-choose-single-option-next]")?.classList.remove("disabled");
            }
        });
        }
        if (changebtn) {
        changebtn.addEventListener("click", function (e) {

            console.log("click on changebtn");
            document.querySelector(".return-options-right").classList.remove("hidden");
            const activeCard = card.closest(".return-option-grid-item").querySelector(".return-option-card.active");
            if (activeCard) activeCard.classList.remove("active");
            card.classList.remove("active");
            card.querySelector(".changeReturnOpt").classList.add("hidden");

            // Mark related product/image as selected
            document.querySelector(`.return-option-image-item[data-id="${dataId}"]`)?.classList.remove("selected");
            document.querySelector(`[data-return-table] tr[data-id="${dataId}"]`)?.classList.remove("selected");
            document.querySelectorAll('.return-option-grid-item.active .return-table-reason-tr').forEach(el => {
                el.classList.add('hidden');
            });

            card.closest(".return-option-grid-item.active").querySelector("[data-return-table-reason]").classList.remove("hidden");


            // Enable Next button if all are selected
            if (
            document.querySelectorAll(".return-order-lineitem.selected").length ===
            document.querySelectorAll(".return-option-image-grid .return-option-image-item.selected").length
            ) {
            document.querySelector("[data-return-choose-single-option-next]")?.classList.remove("disabled");
            }

            const all_cards = card.closest(".return-option-grid-item").querySelectorAll(".return-option-card");
            const hasActive = Array.from(all_cards).some(el => el.classList.contains("active"));
            console.log("hasActive:--",hasActive);
            if (!hasActive) {
                document.querySelector("[data-next-img]").classList.add("disabled");
                document.querySelector("[return-choose-option-reason-next]").classList.add("disabled");
            } else {
                document.querySelector("[data-next-img]").classList.remove("disabled");
                document.querySelector("[return-choose-option-reason-next]").classList.remove("disabled");
            }
        });
        }
    });
  });
}

// reasonProductsHTML
function reasonProductsHTML(productGroup){
    let tableReason = '';
    let options1 = `<option value="none" class="hidden" disabled selected>Reason 1</option>
    <option value="Item didn’t fit properly" data-index="1">Item didn’t fit properly</option>
    <option value="Item didn’t suit me" data-index="2">Item didn’t suit me</option>
    <option value="Item was faulty" data-index="3">Item was faulty</option>
    <option value="Item was not as described" data-index="4">Item was not as described</option>
    <option value="I don’t like the item" data-index="5">I don’t like the item</option>
    <option value="I was sent the wrong item" data-index="6">I was sent the wrong item</option>`;
    let options2 = `<option value="none" class="hidden" disabled selected>Reason 2</option>
    <option class="hidden" value="Too tight" data-index="1" data-attr-index="1" data-error-index="1">Too tight</option>
    <option class="hidden" value="Too loose" data-index="1" data-attr-index="2" data-error-index="2">Too loose</option>
    <option class="hidden" value="Too long" data-index="1" data-attr-index="3" data-error-index="3">Too long</option>
    <option class="hidden" value="Too short" data-index="1" data-attr-index="4" data-error-index="3">Too short</option>
    <option class="hidden" value="Didn’t fit as expected" data-index="1" data-attr-index="5">Didn’t fit as expected</option>
    <option class="hidden" value="Colour" data-index="2" data-attr-index="6">Colour</option>
    <option class="hidden" value="Style" data-index="2" data-attr-index="7">Style</option>
    <option class="hidden" value="Shape" data-index="2" data-attr-index="8">Shape</option>
    <option class="hidden" value="Fabric / material" data-index="2" data-attr-index="9">Fabric / material</option>
    <option class="hidden" value="Comfort" data-index="2" data-attr-index="10">Comfort</option>
    <option class="hidden" value="Quality / finish" data-index="2" data-attr-index="11">Quality / finish</option>
    <option class="hidden" value="Stitching / construction faults" data-index="3" data-attr-index="12">Stitching / construction faults</option>
    <option class="hidden" value="Fabric / material damage" data-index="3" data-attr-index="13">Fabric / material damage</option>
    <option class="hidden" value="Fastenings / trims" data-index="3" data-attr-index="14">Fastenings / trims</option>
    <option class="hidden" value="Other faults" data-index="3" data-attr-index="15">Other faults</option>
    <option class="hidden" value="Colour mismatch" data-index="4" data-attr-index="16">Colour mismatch</option>
    <option class="hidden" value="Fit / size mismatch" data-index="4" data-attr-index="17">Fit / size mismatch</option>
    <option class="hidden" value="Fabric / material mismatch" data-index="4" data-attr-index="18">Fabric / material mismatch</option>
    <option class="hidden" value="Style / feature mismatch" data-index="4" data-attr-index="19">Style / feature mismatch</option>
    <option class="hidden" value="Other" data-index="4" data-attr-index="20">Other</option>
    <option class="hidden" value="Colour" data-index="5" data-attr-index="21">Colour</option>
    <option class="hidden" value="Style" data-index="5" data-attr-index="22">Style</option>
    <option class="hidden" value="Shape" data-index="5" data-attr-index="23">Shape</option>
    <option class="hidden" value="Fabric / material" data-index="5" data-attr-index="24">Fabric / material</option>
    <option class="hidden" value="Comfort" data-index="5" data-attr-index="25">Comfort</option>
    <option class="hidden" value="Quality / finish" data-index="5" data-attr-index="26">Quality / finish</option>
    <option class="hidden" value="Wrong product" data-index="6" data-attr-index="27">Wrong product</option>
    <option class="hidden" value="Wrong size" data-index="6" data-attr-index="28">Wrong size</option>
    <option class="hidden" value="Wrong colour" data-index="6" data-attr-index="29">Wrong colour</option>
    <option class="hidden" value="Wrong quantity" data-index="6" data-attr-index="30">Wrong quantity</option>`;
    let options3 = `<option value="none" class="hidden" disabled selected>Reason 3</option>
    <option class="hidden" value="Shoulders" data-attr-index="1">Shoulders</option>
    <option class="hidden" value="Chest / bust" data-attr-index="1">Chest / bust</option>
    <option class="hidden" value="Waist" data-attr-index="1">Waist</option>
    <option class="hidden" value="Hips" data-attr-index="1">Hips</option>
    <option class="hidden" value="Arms (upper arm)" data-attr-index="1">Arms (upper arm)</option>
    <option class="hidden" value="Sleeves (width)" data-attr-index="1">Sleeves (width)</option>
    <option class="hidden" value="Legs (thighs / calves)" data-attr-index="1">Legs (thighs / calves)</option>
    <option class="hidden" value="Overall" data-attr-index="1">Overall</option>
    <option class="hidden" value="Shoulders" data-attr-index="2">Shoulders</option>
    <option class="hidden" value="Chest / bust" data-attr-index="2">Chest / bust</option>
    <option class="hidden" value="Waist" data-attr-index="2">Waist</option>
    <option class="hidden" value="Hips" data-attr-index="2">Hips</option>
    <option class="hidden" value="Arms (upper arm)" data-attr-index="2">Arms (upper arm)</option>
    <option class="hidden" value="Sleeves (width)" data-attr-index="2">Sleeves (width)</option>
    <option class="hidden" value="Legs (thighs / calves)" data-attr-index="2">Legs (thighs / calves)</option>
    <option class="hidden" value="Overall" data-attr-index="2">Overall</option>
    <option class="hidden" value="Body / torso length" data-attr-index="3">Body / torso length</option>
    <option class="hidden" value="Sleeve length" data-attr-index="3">Sleeve length</option>
    <option class="hidden" value="Trouser length" data-attr-index="3">Trouser length</option>
    <option class="hidden" value="Skirt / dress length" data-attr-index="3">Skirt / dress length</option>
    <option class="hidden" value="Overall proportions" data-attr-index="3">Overall proportions</option>
    <option class="hidden" value="Body / torso length" data-attr-index="4">Body / torso length</option>
    <option class="hidden" value="Sleeve length" data-attr-index="4">Sleeve length</option>
    <option class="hidden" value="Trouser length" data-attr-index="4">Trouser length</option>
    <option class="hidden" value="Skirt / dress length" data-attr-index="4">Skirt / dress length</option>
    <option class="hidden" value="Overall proportions" data-attr-index="4">Overall proportions</option>
    <option class="hidden" value="Came up smaller than size label" data-attr-index="5" data-error-index="1">Came up smaller than size label</option>
    <option class="hidden" value="Came up larger than size label" data-attr-index="5" data-error-index="2">Came up larger than size label</option>
    <option class="hidden" value="Proportions felt off (e.g. narrow shoulders + wide waist)" data-attr-index="5">Proportions felt off (e.g. narrow shoulders + wide waist)</option>
    <option class="hidden" value="Inconsistent with Marame’s usual sizing" data-attr-index="5">Inconsistent with Marame’s usual sizing</option>
    <option class="hidden" value="Too bright" data-attr-index="6">Too bright</option>
    <option class="hidden" value="Too dark" data-attr-index="6">Too dark</option>
    <option class="hidden" value="Too dull" data-attr-index="6">Too dull</option>
    <option class="hidden" value="Too vibrant" data-attr-index="6">Too vibrant</option>
    <option class="hidden" value="Didn’t match my skin tone" data-attr-index="6">Didn’t match my skin tone</option>
    <option class="hidden" value="Looked different to online image" data-attr-index="6">Looked different to online image</option>
    <option class="hidden" value="Not versatile enough / hard to style" data-attr-index="6">Not versatile enough / hard to style</option>
    <option class="hidden" value="Didn’t like colour in person" data-attr-index="6">Didn’t like colour in person</option>
    <option class="hidden" value="Too casual" data-attr-index="7">Too casual</option>
    <option class="hidden" value="Too formal" data-attr-index="7">Too formal</option>
    <option class="hidden" value="Not suitable for the occasion I bought it for" data-attr-index="7">Not suitable for the occasion I bought it for</option>
    <option class="hidden" value="Didn’t suit me" data-attr-index="7">Didn’t suit me</option>
    <option class="hidden" value="Didn’t match my wardrobe" data-attr-index="7">Didn’t match my wardrobe</option>
    <option class="hidden" value="Overdesigned (too many details)" data-attr-index="7">Overdesigned (too many details)</option>
    <option class="hidden" value="Too plain / not interesting enough" data-attr-index="7">Too plain / not interesting enough</option>
    <option class="hidden" value="Didn’t flatter my body shape" data-attr-index="8">Didn’t flatter my body shape</option>
    <option class="hidden" value="Made me look shorter" data-attr-index="8">Made me look shorter</option>
    <option class="hidden" value="Made me look taller" data-attr-index="8">Made me look taller</option>
    <option class="hidden" value="Made me look wider" data-attr-index="8">Made me look wider</option>
    <option class="hidden" value="Proportions felt wrong" data-attr-index="8">Proportions felt wrong</option>
    <option class="hidden" value="Hung awkwardly / poor drape" data-attr-index="8">Hung awkwardly / poor drape</option>
    <option class="hidden" value="Too structured / stiff" data-attr-index="8">Too structured / stiff</option>
    <option class="hidden" value="Too loose / lacked structure" data-attr-index="8">Too loose / lacked structure</option>
    <option class="hidden" value="Looked bulky on foot" data-attr-index="8">Looked bulky on foot</option>
    <option class="hidden" value="Looked too narrow/slim on foot" data-attr-index="8">Looked too narrow/slim on foot</option>
    <option class="hidden" value="Fabric felt uncomfortable" data-attr-index="9">Fabric felt uncomfortable</option>
    <option class="hidden" value="Too heavy/thick" data-attr-index="9">Too heavy/thick</option>
    <option class="hidden" value="Too thin" data-attr-index="9">Too thin</option>
    <option class="hidden" value="Not breathable" data-attr-index="9">Not breathable</option>
    <option class="hidden" value="Lower quality than expected" data-attr-index="9">Lower quality than expected</option>
    <option class="hidden" value="Texture not as expected" data-attr-index="9">Texture not as expected</option>
    <option class="hidden" value="Creased too easily" data-attr-index="9">Creased too easily</option>
    <option class="hidden" value="Not soft enough" data-attr-index="9">Not soft enough</option>
    <option class="hidden" value="Too stiff (leather/synthetic stiffness)" data-attr-index="9">Too stiff (leather/synthetic stiffness)</option>
    <option class="hidden" value="Didn’t like the finishing / lining" data-attr-index="9">Didn’t like the finishing / lining</option>
    <option class="hidden" value="Itchy / rough against skin" data-attr-index="10">Itchy / rough against skin</option>
    <option class="hidden" value="Too restrictive / hard to move in" data-attr-index="10">Too restrictive / hard to move in</option>
    <option class="hidden" value="Didn’t feel nice when wearing (both)" data-attr-index="10">Didn’t feel nice when wearing (both)</option>
    <option class="hidden" value="Irritated skin / sensitive to fabric" data-attr-index="10">Irritated skin / sensitive to fabric</option>
    <option class="hidden" value="Rubbed or pinched" data-attr-index="10">Rubbed or pinched</option>
    <option class="hidden" value="Too heavy / clunky" data-attr-index="10">Too heavy / clunky</option>
    <option class="hidden" value="No arch support" data-attr-index="10">No arch support</option>
    <option class="hidden" value="Sole too hard / uncomfortable" data-attr-index="10">Sole too hard / uncomfortable</option>
    <option class="hidden" value="Stitching looked poor" data-attr-index="11">Stitching looked poor</option>
    <option class="hidden" value="Buttons / zips / trims felt low quality" data-attr-index="11">Buttons / zips / trims felt low quality</option>
    <option class="hidden" value="Loose threads / unfinished edges" data-attr-index="11">Loose threads / unfinished edges</option>
    <option class="hidden" value="Construction didn’t feel premium" data-attr-index="11">Construction didn’t feel premium</option>
    <option class="hidden" value="Finishing details not what I expected" data-attr-index="11">Finishing details not what I expected</option>
    <option class="hidden" value="Glue marks or poor bonding" data-attr-index="11">Glue marks or poor bonding</option>
    <option class="hidden" value="Sole looked badly finished" data-attr-index="11">Sole looked badly finished</option>
    <option class="hidden" value="Loose stitching" data-attr-index="12">Loose stitching</option>
    <option class="hidden" value="Seams coming apart" data-attr-index="12">Seams coming apart</option>
    <option class="hidden" value="Uneven stitching" data-attr-index="12">Uneven stitching</option>
    <option class="hidden" value="Unfinished edges" data-attr-index="12">Unfinished edges</option>
    <option class="hidden" value="Upper separating from sole" data-attr-index="12">Upper separating from sole</option>
    <option class="hidden" value="Tear" data-attr-index="13">Tear</option>
    <option class="hidden" value="Hole" data-attr-index="13">Hole</option>
    <option class="hidden" value="Pull / snag" data-attr-index="13">Pull / snag</option>
    <option class="hidden" value="Pilling on arrival" data-attr-index="13">Pilling on arrival</option>
    <option class="hidden" value="Leather scuffed or cracked" data-attr-index="13">Leather scuffed or cracked</option>
    <option class="hidden" value="Fabric warped / distorted" data-attr-index="13">Fabric warped / distorted</option>
    <option class="hidden" value="Broken zip" data-attr-index="14">Broken zip</option>
    <option class="hidden" value="Zip sticking" data-attr-index="14">Zip sticking</option>
    <option class="hidden" value="Button missing / broken" data-attr-index="14">Button missing / broken</option>
    <option class="hidden" value="Fastening not working (hooks, poppers, buckles)" data-attr-index="14">Fastening not working (hooks, poppers, buckles)</option>
    <option class="hidden" value="Lace eyelet broken" data-attr-index="14">Lace eyelet broken</option>
    <option class="hidden" value="Laces snapped / faulty" data-attr-index="14">Laces snapped / faulty</option>
    <option class="hidden" value="Lining damaged" data-attr-index="15">Lining damaged</option>
    <option class="hidden" value="Incorrect label / care tag" data-attr-index="15">Incorrect label / care tag</option>
    <option class="hidden" value="Stain / mark on arrival" data-attr-index="15">Stain / mark on arrival</option>
    <option class="hidden" value="Different shade than photos" data-attr-index="16">Different shade than photos</option>
    <option class="hidden" value="Different undertone than described" data-attr-index="16">Different undertone than described</option>
    <option class="hidden" value="Smaller than described" data-attr-index="17" data-error-index="1">Smaller than described</option>
    <option class="hidden" value="Larger than described" data-attr-index="17" data-error-index="2">Larger than described</option>
    <option class="hidden" value="Proportions different than description" data-attr-index="17" data-error-index="3">Proportions different than description</option>
    <option class="hidden" value="Different texture than description" data-attr-index="18">Different texture than description</option>
    <option class="hidden" value="Different weight/thickness than description" data-attr-index="18">Different weight/thickness than description</option>
    <option class="hidden" value="Missing features (e.g. pockets, strap, laces)" data-attr-index="19">Missing features (e.g. pockets, strap, laces)</option>
    <option class="hidden" value="Incorrect detailing compared to images" data-attr-index="19">Incorrect detailing compared to images</option>
    <option class="hidden" value="Print / pattern layout different than photos" data-attr-index="19">Print / pattern layout different than photos</option>
    <option class="hidden" value="Product didn’t look like online photos overall" data-attr-index="20">Product didn’t look like online photos overall</option>
    <option class="hidden" value="Too bright" data-attr-index="21">Too bright</option>
    <option class="hidden" value="Too dark" data-attr-index="21">Too dark</option>
    <option class="hidden" value="Too dull" data-attr-index="21">Too dull</option>
    <option class="hidden" value="Too vibrant" data-attr-index="21">Too vibrant</option>
    <option class="hidden" value="Didn’t match my skin tone" data-attr-index="21">Didn’t match my skin tone</option>
    <option class="hidden" value="Looked different to online image" data-attr-index="21">Looked different to online image</option>
    <option class="hidden" value="Not versatile enough / hard to style" data-attr-index="21">Not versatile enough / hard to style</option>
    <option class="hidden" value="Didn’t like colour in person" data-attr-index="21">Didn’t like colour in person</option>
    <option class="hidden" value="Too casual" data-attr-index="22">Too casual</option>
    <option class="hidden" value="Too formal" data-attr-index="22">Too formal</option>
    <option class="hidden" value="Not suitable for the occasion I bought it for" data-attr-index="22">Not suitable for the occasion I bought it for</option>
    <option class="hidden" value="Didn’t suit me" data-attr-index="22">Didn’t suit me</option>
    <option class="hidden" value="Didn’t match my wardrobe" data-attr-index="22">Didn’t match my wardrobe</option>
    <option class="hidden" value="Overdesigned (too many details)" data-attr-index="22">Overdesigned (too many details)</option>
    <option class="hidden" value="Too plain / not interesting enough" data-attr-index="22">Too plain / not interesting enough</option>
    <option class="hidden" value="Didn’t flatter my body shape" data-attr-index="23">Didn’t flatter my body shape</option>
    <option class="hidden" value="Made me look shorter" data-attr-index="23">Made me look shorter</option>
    <option class="hidden" value="Made me look taller" data-attr-index="23">Made me look taller</option>
    <option class="hidden" value="Made me look wider" data-attr-index="23">Made me look wider</option>
    <option class="hidden" value="Proportions felt wrong" data-attr-index="23">Proportions felt wrong</option>
    <option class="hidden" value="Hung awkwardly / poor drape" data-attr-index="23">Hung awkwardly / poor drape</option>
    <option class="hidden" value="Too structured / stiff" data-attr-index="23">Too structured / stiff</option>
    <option class="hidden" value="Too loose / lacked structure" data-attr-index="23">Too loose / lacked structure</option>
    <option class="hidden" value="Looked bulky on foot" data-attr-index="23">Looked bulky on foot</option>
    <option class="hidden" value="Looked too narrow/slim on foot" data-attr-index="23">Looked too narrow/slim on foot</option>
    <option class="hidden" value="Fabric felt uncomfortable" data-attr-index="24">Fabric felt uncomfortable</option>
    <option class="hidden" value="Too heavy/thick" data-attr-index="24">Too heavy/thick</option>
    <option class="hidden" value="Too thin" data-attr-index="24">Too thin</option>
    <option class="hidden" value="Not breathable" data-attr-index="24">Not breathable</option>
    <option class="hidden" value="Lower quality than expected" data-attr-index="24">Lower quality than expected</option>
    <option class="hidden" value="Texture not as expected" data-attr-index="24">Texture not as expected</option>
    <option class="hidden" value="Creased too easily" data-attr-index="24">Creased too easily</option>
    <option class="hidden" value="Not soft enough" data-attr-index="24">Not soft enough</option>
    <option class="hidden" value="Too stiff (leather/synthetic stiffness)" data-attr-index="24">Too stiff (leather/synthetic stiffness)</option>
    <option class="hidden" value="Didn’t like the finishing / lining" data-attr-index="24">Didn’t like the finishing / lining</option>
    <option class="hidden" value="Itchy / rough against skin" data-attr-index="25">Itchy / rough against skin</option>
    <option class="hidden" value="Too restrictive / hard to move in" data-attr-index="25">Too restrictive / hard to move in</option>
    <option class="hidden" value="Didn’t feel nice when wearing (both)" data-attr-index="25">Didn’t feel nice when wearing (both)</option>
    <option class="hidden" value="Irritated skin / sensitive to fabric" data-attr-index="25">Irritated skin / sensitive to fabric</option>
    <option class="hidden" value="Rubbed or pinched" data-attr-index="25">Rubbed or pinched</option>
    <option class="hidden" value="Too heavy / clunky" data-attr-index="25">Too heavy / clunky</option>
    <option class="hidden" value="No arch support" data-attr-index="25">No arch support</option>
    <option class="hidden" value="Sole too hard / uncomfortable" data-attr-index="25">Sole too hard / uncomfortable</option>
    <option class="hidden" value="Stitching looked poor" data-attr-index="26">Stitching looked poor</option>
    <option class="hidden" value="Buttons / zips / trims felt low quality" data-attr-index="26">Buttons / zips / trims felt low quality</option>
    <option class="hidden" value="Loose threads / unfinished edges" data-attr-index="26">Loose threads / unfinished edges</option>
    <option class="hidden" value="Construction didn’t feel premium" data-attr-index="26">Construction didn’t feel premium</option>
    <option class="hidden" value="Finishing details not what I expected" data-attr-index="26">Finishing details not what I expected</option>
    <option class="hidden" value="Glue marks or poor bonding" data-attr-index="26">Glue marks or poor bonding</option>
    <option class="hidden" value="Sole looked badly finished" data-attr-index="26">Sole looked badly finished</option>
    <option class="hidden" value="Entirely different item sent" data-attr-index="27">Entirely different item sent</option>
    <option class="hidden" value="Different size than ordered" data-attr-index="28">Different size than ordered</option>
    <option class="hidden" value="Multiple sizes mixed up" data-attr-index="28">Multiple sizes mixed up</option>
    <option class="hidden" value="Different colour than ordered" data-attr-index="29">Different colour than ordered</option>
    <option class="hidden" value="Received fewer items than ordered" data-attr-index="30">Received fewer items than ordered</option>
    <option class="hidden" value="Received extra item(s)" data-attr-index="30">Received extra item(s)</option>`;

    let selectHTML = `<select class="return-select-box{{hidden}} red-alert auto-open" data-select-reason>${options1}</select>
    <select class="return-select-box red-alert" data-select-reason-too>${options2}</select>
    <select class="return-select-box red-alert" data-select-reason-attrs>${options3}</select>
    <span class="thx hidden">Thank You</span>
    <div class="return-form-field">
        <label for="other-feedback" class="return-form-label">
          Is there any other feedback about the products that you would like to give us?
        </label>
        <textarea id="other-feedback" name="other_feedback" rows="5" placeholder="Type your feedback here..." class="return-form-textarea" maxlength="1000" data-reason-feedback-textarea></textarea>
    </div>`;

    // console.log("selectHTML",selectHTML);
    // let hidden = "";
    // document.querySelectorAll(`.return-order-lineitem.selected`).forEach(item => {
    //     tableReason += `<tr class="return-table-reason-tr hidden" data-id="${item.dataset.id}">
    //     <td class="product-name">${item.querySelector(`.lineitem-info-title`).innerHTML}
    //     <div class="mob-only">${selectHTML.replace('{{hidden}}',hidden)}</div>
    //     </td></tr>`;
    //     // hidden = " hidden";
    // });
    //     // document.querySelector(`[data-return-table-reason]`).innerHTML = tableReason;
    // document.querySelectorAll('[data-return-table-reason]').forEach((el) => {
    //     el.innerHTML = tableReason;
    // });

    // document.querySelectorAll('.return-option-grid-item.active [data-return-table-reason]').forEach((el) => {
    //     el.innerHTML = tableReason;
    // });

    //Ak custom code
    let hidden = "";
    const item_id = document.querySelector('.return-option-grid-item.active').getAttribute('data-id');
    document.querySelectorAll(`.return-order-lineitem.selected[data-id="${item_id}"]`).forEach(item => {
        tableReason += `<tr class="return-table-reason-tr hidden" data-id="${item.dataset.id}">
        <td class="product-name hidden">${item.querySelector(`.lineitem-info-title`).innerHTML}
        <td class="product-name">Tell us what went wrong 
        <div class="mob-only">${selectHTML.replace('{{hidden}}',hidden)}</div>
        `;
        // hidden = " hidden";
    });
        // document.querySelector(`[data-return-table-reason]`).innerHTML = tableReason;
     document.querySelectorAll('.return-option-grid-item.active [data-return-table-reason]').forEach((el) => {
        el.innerHTML = tableReason;
    });
    //End Ak custom code




    

    let dataIdsArrayExchangeCUSTOM = [];
    dataIdsArrayExchangeCUSTOM = Array.from(document.querySelectorAll(`.return-option-grid-item:has([data-option="exchange"].active)`)).map(element => element.getAttribute('data-id'));

    let selectReasonArr = document.querySelectorAll(`.product-name [data-select-reason]`);
    selectReasonArr.forEach(select => {
        select.addEventListener("change",function(e){
            e.preventDefault();
            console.log("---select change",document.querySelector('[data-select-reason]'));

            const table_id = select.closest(".return-table-reason-tr").getAttribute("data-id");
            const reason_id = document.querySelector(".return-option-grid-item[data-id='"+ table_id +"']");
            
            
                let location = document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn;
                if(location != "INTERNATIONAL"){
            
                    reason_id.querySelectorAll(".return-option-card").forEach((card) => {
                        if (card.classList.contains("active")) {
                            const is_return_opt = card.getAttribute("data-option");
                            const selected_option = select.value;

                            // const relatedSelect = select.closest(".return-table-reason-tr").querySelector("[data-select-reason]").value;
                            console.log("location:--",location);
                            console.log("is_return_opt:--",is_return_opt,"selected_option:--",selected_option);
                            
                            // if(is_return_opt == "store-credit" && selected_option == "Item didn’t fit properly" || is_return_opt == "refund" && selected_option == "Item didn’t fit properly")
                            // {
                            //     console.log("change to Exchange");
                            //     setTimeout(function(){
                            //         // document.querySelector(".without_size").classList.add("hidden");
                            //         // document.querySelector(".with_size").classList.remove("hidden");
                            //         // document.querySelector(".next_btn").classList.add("original_step");
                            //         // select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-next].next_btn").innerHTML = select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-next].next_btn").dataset.secondaryLabel;
                            //         // document.querySelector(`.navigation-error.exchange`).style.display = 'block';
                            //     },1000);
                            // }
                            // else
                            // {
                            //     // document.querySelector(".without_size").classList.remove("hidden");
                            //     // document.querySelector(".with_size").classList.add("hidden");
                            //     // document.querySelector(".next_btn").classList.remove("original_step");
                            //     // document.querySelector(`.navigation-error.exchange`).style.display = 'none';
                            // }
                        }
                    });
                }

            setTimeout(() => {
            if(select.hasAttribute('data-select-reason'))
             {
                    console.log("SECCCCCC");
                const sec_ele_open = select.closest(".return-table-reason-tr").querySelectorAll('[data-select-reason-too]');
                sec_ele_open.forEach(sec_ele => {

                console.log("next_ele_open:--",sec_ele);
                    try {
                    if (typeof sec_ele.showPicker === "function") {
                        sec_ele.showPicker();
                    } else {
                        sec_ele.focus();
                        sec_ele.click();
                    }
                } catch (e) {
                    // fallback for older iPhones
                    sec_ele.focus();
                    sec_ele.click();
                }
                    
                });
            }
            }, 500);

            console.log("select:--",select);
            
         


            console.log("index>>>>>:",select.querySelector(`option[value="${select.value}"]`).dataset.index);
            let optIndex = select.querySelector(`option[value="${select.value}"]`).dataset.index;

            select.closest(".return-table-reason-tr").classList.remove("red-alert");
            manageExchangeAlert(select,dataIdsArrayExchangeCUSTOM);
            select.closest(".return-table-reason-tr").querySelectorAll("[data-select-reason-too]").forEach(otherSelect => {
                console.log("otherSelect:--",otherSelect);
                otherSelect.classList.remove("hidden");
                otherSelect.value = "none";
                otherSelect.classList.remove("opt-selected");
                otherSelect.classList.add("red-alert");
                otherSelect.querySelectorAll(`option`).forEach(opt => {
                    if(opt.dataset.index == optIndex){
                        opt.classList.remove("hidden");
                    }else{
                        opt.classList.add("hidden");
                    }
                });
            });
            select.closest(".return-table-reason-tr").querySelectorAll("[data-select-reason-attrs]").forEach(otherSelect => {
                otherSelect.classList.remove("hidden");
                otherSelect.value = "none";
                otherSelect.classList.remove("opt-selected");
                otherSelect.classList.add("red-alert");
                otherSelect.querySelectorAll(`option`).forEach(opt => {
                    opt.classList.add("hidden");
                });
                document.querySelector("[data-selected-reason-option]").classList.add("hidden");
            });
        });
    });

    //new with size btn click
    const NextSizeBtn = document.querySelector(".with_size");
    if(NextSizeBtn)
    {
        NextSizeBtn.addEventListener("click",function(nbtn){
             const hasRedAlert = Array.from(document.querySelectorAll('.return-table-reason-tr .return-select-box:not(.desk-only)')).some(el => el.classList.contains('red-alert'));
             console.log("hasRedAlert:--",hasRedAlert);
            if(hasRedAlert)
            {
                nbtn.preventDefault();
                document.querySelector(`.navigation-error.all-fields`).style.display = 'block';
            }
             else
            {
                console.log("selectReasonArr",selectReasonArr);
                selectReasonArr.forEach(select => {
                    const selected_option = select.value;
                    const table_id = select.closest(".return-table-reason-tr")?.dataset.id;
                    const reason_id = document.querySelector(`.return-option-grid-item[data-id="${table_id}"]`);
                    console.log("card:--");

                    reason_id.querySelectorAll(".return-option-card.active").forEach((card) => {
                        console.log("card:--1",card);

                         const is_return_opt = card.getAttribute("data-option");
                         const selected_option = select.value;

                         console.log("is_return_opt",is_return_opt);
                         console.log("selected_option",selected_option);
                         console.log("card:--",card);
                        console.log("is_return_opt:--",is_return_opt,"selected_option:--",selected_option);

                        // if(is_return_opt == "store-credit" && selected_option == "Item didn’t fit properly" || is_return_opt == "refund" && selected_option == "Item didn’t fit properly")
                        // {
                        //     reason_id.querySelector('.return-option-card[data-option="exchange"] .up_div').click();
                        //     reason_id.querySelector('.return-option-card[data-option="exchange"]').classList.add("active");

                        //     card.classList.add('change_to_exchange');

                        //     //   card.closest(".return-option-row").querySelector('[data-option="exchange"] .up_div').click();
                        //     //   card.closest(".return-option-row").querySelector('[data-option="exchange"]').classList.add("active");
                        //     document.querySelector('[return-choose-option-exchange-prev]').setAttribute('ori_option',is_return_opt);
                        //     document.querySelector('[return-choose-option-exchange-prev]').classList.add('change_to_exchange');
                        // }
                    });
                });

            
                document.querySelectorAll(".return-options-steps").forEach((steps) => {
                    steps.classList.remove("active");
                });
                document.querySelector(".return-choose-option-exchange").classList.add("active");

                let noneCount = Array.from(this.closest(".return-choose-option-single").querySelectorAll("[data-return-table-reason] td.product-name select")).filter(select => select.value === "none").length;
                if(this.closest(".return-choose-option-single").querySelectorAll("[data-return-table-reason] tr.red-alert").length == 0 && noneCount == 0){
                exchangeORreturn_ProductsHTML();
                manageProgressBar();
                // selectedProductsHTML();
                }

                document.querySelector(`.return-choose-option-declaration`).classList.remove("active");
            }
        });
    }

    let selectReasonTooArr = document.querySelectorAll(`[data-select-reason-too]`);
    selectReasonTooArr.forEach(select => {
        select.addEventListener("change",function(e){
            e.preventDefault();
            let optIndex = select.querySelector(`option[value="${select.value}"]`).dataset.attrIndex;
            console.log("index>>>>>:",optIndex);

            select.closest(".return-table-reason-tr").classList.remove("red-alert");

            manageExchangeAlert(select,dataIdsArrayExchangeCUSTOM);

            setTimeout(() => {
            if(select.hasAttribute('data-select-reason-too'))
                {
                    console.log("THIRDDDDDDD");
                    const th_ele_open = select.closest(".return-table-reason-tr").querySelector('[data-select-reason-attrs]');
                    console.log("th_ele_open:--",th_ele_open);
                  
                    // Must execute directly inside user click:
                        try {
                            if (typeof th_ele_open.showPicker === "function") {
                                th_ele_open.showPicker();
                            } else {
                                th_ele_open.focus();
                                th_ele_open.click();
                            }
                        } catch (e) {
                            // fallback for older iPhones
                            th_ele_open.focus();
                            th_ele_open.click();
                        }
            }
            }, 500);



            select.closest(".return-table-reason-tr").querySelectorAll("[data-select-reason-attrs]").forEach(otherSelect => {
                otherSelect.classList.remove("hidden");
                otherSelect.value = "none";
                otherSelect.classList.remove("opt-selected");
                otherSelect.classList.add("red-alert");
                otherSelect.querySelectorAll(`option`).forEach(opt => {
                    if(opt.dataset.attrIndex == optIndex){
                        opt.classList.remove("hidden");
                    }else{
                        opt.classList.add("hidden");
                    }
                });
            });

            //AK custom code
            // const first_select = select.closest(".return-table-reason-tr").querySelector('[data-select-reason]');
            // if(first_select){
            //         const first_selected_option = first_select.value;
            //         const table_id = select.closest(".return-table-reason-tr")?.dataset.id;
            //         const reason_id = document.querySelector(`.return-option-grid-item[data-id="${table_id}"]`);
            //         console.log("card:--");

            //         reason_id.querySelectorAll(".return-option-card.active").forEach((card) => {
            //             // console.log("card:--1",card);
            //              const is_return_opt = card.getAttribute("data-option");
            //             //  const selected_option = select.value;
            //             //  console.log("is_return_opt",is_return_opt);
            //             //  console.log("first_selected_option",first_selected_option);
            //             if(is_return_opt == "store-credit" && first_selected_option == "Item didn’t fit properly" || is_return_opt == "refund" && first_selected_option == "Item didn’t fit properly")
            //             {
            //                 const exchange_fit_popup = document.querySelector('.exchange_fit_popup');
            //                 if(exchange_fit_popup){
            //                     exchange_fit_popup.classList.add('active');
            //                 }
            //             }
            //         });

            // }
            //End Ak custom code
        });
    });

    let selectReasonAttrsArr = document.querySelectorAll(`[data-select-reason-attrs]`);
    selectReasonAttrsArr.forEach(select => {
        select.addEventListener("change",function(e){
            e.preventDefault();
            select.closest(".return-table-reason-tr").classList.remove("red-alert");
            
            manageExchangeAlert(select,dataIdsArrayExchangeCUSTOM);

            if(select.closest(".return-table-reason-tr").nextElementSibling != null){
                select.closest(".return-table-reason-tr").nextElementSibling.querySelectorAll("[data-select-reason]").forEach(otherSelect => {
                    otherSelect.classList.remove("hidden");
                });
            }
        });
    });

}



let errorMsgArr = {
    "1": "We are sorry this product didn’t fit, would you like to process an exchange for a larger size instead?",
    "2": "We are sorry this product didn’t fit, would you like to process an exchange for a smaller size instead?",
    "3": "We are sorry this product didn’t fit, would you like to process an exchange for a different size instead?"
}
function manageExchangeAlert(select,dataIdsArrayExchangeCUSTOM){
    // console.log("OLD option");
    console.log("select",select);
    let allowToShow = false;
    let errIndex;

    // let trSelects = select.closest(".return-table-reason-tr").querySelectorAll("td.desk-only select");
    // if(document.body.clientWidth <= 767){
      let trSelects = select.closest(".return-table-reason-tr").querySelectorAll("td.product-name select");
    // }
    console.log("trSelects",trSelects);
    trSelects.forEach(trSelect => {
        console.log("trSelect",trSelect.value);
        select.classList.add("opt-selected");
        if(document.querySelector("[data-select-reason-attrs]").classList.contains("opt-selected"))
        {
            document.querySelector("[data-selected-reason]").classList.add("hidden");
        }
        select.classList.remove("red-alert");
        let errOpt = trSelect.querySelector(`option[value="${trSelect.value}"]`);
        console.log("trSelect",errOpt);
        if(errOpt.dataset.errorIndex != undefined){
            allowToShow = true;
            errIndex = errOpt.dataset.errorIndex
        }
        setTimeout(() => {
            if(select.hasAttribute('data-select-reason-attrs'))
            {
                console.log("in attr");
                select.nextElementSibling.classList.remove("hidden");
            }
        }, 500);
    });

    
    let location = document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn;
    if(location != "INTERNATIONAL"){
        console.log("allowToShow:--",allowToShow);
        if(allowToShow){
            console.log("dataIdsArrayExchangeCUSTOM:--",dataIdsArrayExchangeCUSTOM.includes(select.closest(".return-table-reason-tr").dataset.id));
            if(dataIdsArrayExchangeCUSTOM.includes(select.closest(".return-table-reason-tr").dataset.id) == false){
                // document.querySelector(`.navigation-error.exchange`).innerHTML = errorMsgArr[errIndex];
                // select.closest(".return-choose-option-reason").classList.add("exchange-alert");
                // select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-prev].without_size").innerHTML = select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-prev].without_size").dataset.secondaryLabel;
                // select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-next].next_btn").innerHTML = select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-next].next_btn").dataset.secondaryLabel;
            }
        }else{
            // select.closest(".return-choose-option-reason").classList.remove("exchange-alert");
            // select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-prev].without_size").innerHTML = select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-prev].without_size").dataset.primaryLabel;
            // select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-next].next_btn").innerHTML = select.closest(".return-choose-option-reason").querySelector("[return-choose-option-reason-next].next_btn").dataset.primaryLabel;
        }
    }
}


let dataIdsArrayExchange;
let dataIdsArrayReturn;
let dataIdsArrayReturnONLY;
let dataIdsArrayReturnStoreCradit;
// exchangeORreturn_ProductsHTML
function exchangeORreturn_ProductsHTML(){

    dataIdsArrayExchange = [];
    dataIdsArrayReturn = [];
    dataIdsArrayReturnStoreCradit = [];
    dataIdsArrayReturnONLY = [];

    let location = document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn;

    dataIdsArrayExchange = Array.from(document.querySelectorAll(`.return-option-grid-item:has([data-option="exchange"].active)`)).map(element => element.getAttribute('data-id'));

    dataIdsArrayReturnStoreCradit = Array.from(document.querySelectorAll(`.return-option-grid-item:has([data-option="store-credit"].active)`)).map(element => element.getAttribute('data-id'));

    dataIdsArrayReturn = Array.from(document.querySelectorAll(`.return-option-grid-item:not(:has([data-option="exchange"].active))`)).map(element => element.getAttribute('data-id'));

    dataIdsArrayReturnONLY = Array.from(document.querySelectorAll(`.return-option-grid-item:has([data-option="refund"].active)`)).map(element => element.getAttribute('data-id'));

    console.log("dataIdsArrayExchange",dataIdsArrayExchange);
    console.log("dataIdsArrayReturn",dataIdsArrayReturn);
    console.log("dataIdsArrayReturnStoreCradit",dataIdsArrayReturnStoreCradit);
    console.log("dataIdsArrayReturnONLY",dataIdsArrayReturnONLY);

    if(dataIdsArrayExchange.length > 0){
        //return-choose-option-exchange
        let tableExchange = '';
        // let device = "desktop";
        // if(document.body.clientWidth <= 767){
        //     device = "mobile";
        // }
        let device = "mobile";
        dataIdsArrayExchange.forEach(id => {
            let item = document.querySelector(`.return-order-lineitem[data-id="${id}"]`) || null;

            let sizeOptions = "";
            let itemPro = JSON.parse(item.dataset.lineitemProductJson);
            console.log("itemPro",itemPro);
            const selectedOptions = itemPro.variants.nodes[0].selectedOptions;
            let sizeIndex = selectedOptions.findIndex(o => o.name.toLowerCase() === "size" || o.name.toLowerCase() === "shoe size");
            let colorIndex = selectedOptions.findIndex(o => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour");


            // let sizeIndex = itemPro.variants.nodes[0].selectedOptions.findIndex(item => item.name.toLowerCase() === "size");
            // if(sizeIndex < 0){
            //     sizeIndex = itemPro.variants.nodes[0].selectedOptions.findIndex(item => item.name.toLowerCase() === "shoe size");
            // }
            // itemPro.variants.nodes.forEach(variant => {
            //     const currentSize = item.querySelector(".lineitem-info-size_val").innerHTML.trim();
            //     const variantSize = variant.selectedOptions[sizeIndex].optionValue.name.trim();
            //     const isSameSize = currentSize === variantSize;
            //     const hiddenClass = isSameSize ? ' class="hidden"' : '';

            //     // if(variant.id.replace("gid://shopify/ProductVariant/","") != item.dataset.lineitemVariantId){
            //         if(variant.availableForSale){
            //             sizeOptions += `<option ${hiddenClass} data-size="${variant.selectedOptions[sizeIndex].optionValue.name}" value="${variant.id.replace("gid://shopify/ProductVariant/","")}" data-title="${variant.displayName.replace(item.querySelector(".lineitem-info-title").innerHTML,"").replace("-","").trim()}">Size ${variant.selectedOptions[sizeIndex].optionValue.name}</option>`;
            //         }else{
            //             sizeOptions += `<option ${hiddenClass} data-size="${variant.selectedOptions[sizeIndex].optionValue.name}" value="${variant.id}" disabled>Size ${variant.selectedOptions[sizeIndex].optionValue.name} - Out of stock</option>`;
            //         }
            //     // }
            // });

            itemPro.variants.nodes.forEach(variant => {
            const currentSize = item.querySelector(".lineitem-info-size_val").innerHTML.trim();

            const variantSize = sizeIndex > -1? variant.selectedOptions[sizeIndex]?.optionValue?.name?.trim(): "";
            const currentColor = item.querySelector(".lineitem-info-size_color")?.innerHTML.trim();
            const variantColor = colorIndex > -1? variant.selectedOptions[colorIndex]?.optionValue?.name?.trim(): "";

            const isSameSize = currentSize === variantSize && currentColor === variantColor;
            const hiddenClass = isSameSize ? ' class="hidden"' : '';

            const optionLabel = [variantSize, variantColor].filter(Boolean).join(" / ");

            if (variant.availableForSale) {
                sizeOptions += `
                <option
                    ${hiddenClass}
                    data-size="${variantSize}"
                    data-color="${variantColor}"
                    value="${variant.id.replace("gid://shopify/ProductVariant/","")}"
                    data-title="${variant.displayName.replace(item.querySelector(".lineitem-info-title").innerHTML, "").replace("-", "").trim()}">${optionLabel}</option>`;
            } else {
                sizeOptions += `<option ${hiddenClass} data-size="${variantSize}" data-color="${variantColor}" value="${variant.id}" disabled>${optionLabel} - Out of stock</option>`;
            }
            });

            let hidden = "";
            const item_id = document.querySelector('.return-option-grid-item.active').getAttribute('data-id');
            console.log('id',id);
            console.log('item_id',item_id);
            if(id == item_id){
            tableExchange += `<tr class="return-table-reason-tr" data-id="${item.dataset.id}">
            <td class="product-name">
                <span class="product-name">What size would you like to change too</span>
                <div class="mob-only">
                <select class="return-select-box" data-select-exchange><option value="none" disabled selected>Please select a size</option>${sizeOptions}</select>
                <div class="size-change-output" data-size-output="${item.dataset.id}" data-size-val="${item.querySelector(`.lineitem-info-size_val`).innerHTML}"></div>
                </div>
            </td>
            </tr>`;
            }
        });
        document.querySelectorAll('.return-option-grid-item.active [data-return-table-exchange]').forEach((el) => {
            el.innerHTML = tableExchange;
        });

        let selectExchangeArr = document.querySelectorAll(`[data-select-exchange]`);

        

        selectExchangeArr.forEach(select => {
            select.addEventListener("change",function(e){
                if(select.closest('.return-table').classList.contains('.confirm-exchange')){
                    return;
                }
                e.preventDefault();

                // Selected option
                const option = select.options[select.selectedIndex];
                const newSize = option.text.trim();

                // Old size from data-size-output
                const outputBox = select.closest(".mob-only").querySelector(".size-change-output");
                const oldSize = outputBox.dataset.sizeVal;

                // Update text: OLD → NEW
                outputBox.innerHTML = `<span>Size ${oldSize}</span> Exchanged To <span>${newSize}</span>`;

                if(option){
                    const new_size = option.getAttribute('data-size');
                    select.closest('.return-option-grid-item').querySelector('.return-option-card[data-option="exchange"]').setAttribute('data-changed-size',new_size);
                }

                // Visual tweaks
                select.closest(".return-table-reason-tr").classList.remove("red-alert");
                select.classList.add("opt-selected");
                select.classList.add("hidden");
                select.closest(".mob-only").querySelector(".size-change-output").classList.remove("hidden");

                // Validation
                let noneLength = Array.from(document.querySelectorAll(`td.product-name [data-select-exchange]`))
                    .filter(sel => sel.value === "none").length;

                if(noneLength == 0){
                    document.querySelector(`[return-choose-option-exchange-next]`).classList.remove("disabled");
                }else{
                    document.querySelector(`[return-choose-option-exchange-next]`).classList.add("disabled");
                }
                
                if(document.querySelector('.return-choose-option-single').classList.contains('active')){
                setTimeout(() => {
                    select.closest(".return-option-grid-item.active").querySelector("[data-return-table-reason]").classList.remove("hidden");
                }, 300);

                setTimeout(() => {
                const select_reason_one = select.closest(".return-option-grid-item.active").querySelector("[data-select-reason]");
                        if (!select_reason_one) {
                            console.warn("Select element NOT FOUND inside this card");
                            return; // stop the function safely
                        }
                        try {
                            if (typeof select_reason_one.showPicker === "function") {
                                select_reason_one.showPicker();
                            } else {
                                select_reason_one.focus();
                                select_reason_one.click();
                            }
                        } catch (e) {
                            select_reason_one.focus();
                            select_reason_one.click();
                        }
                }, 600);
            }

            });
        });


    document.querySelectorAll(".size-change-output").forEach(label => {
        label.addEventListener("click", function () {

            const select = this.closest(".mob-only").querySelector("[data-select-exchange]");
            select.classList.remove("hidden");
            // Must execute directly inside user click:
            try {
                if (typeof select.showPicker === "function") {
                    select.showPicker();
                } else {
                    select.focus();
                    select.click();
                }
            } catch (e) {
                // fallback for older iPhones
                select.focus();
                select.click();
            }
            this.classList.add("hidden");
        });
    });





        // document.querySelector(`.return-choose-option-reason`).classList.remove("active");
        // document.querySelector(`.return-choose-option-exchange`).classList.add("active");
    }


    // console.log("dataIdsArrayReturn.length:--",dataIdsArrayReturn.length);
    // if(dataIdsArrayReturn.length > 0){
    //     //return-choose-option-exchange
    //     let tableReturnConfirmation = '';
    //     // let device = "desktop";
    //     // if(document.body.clientWidth <= 767){
    //     //     device = "mobile";
    //     // }

    //     let device = "mobile"; // We have setup same in desktop and mobile design
    //     let priceTotalReturnONLY = 0;
    //     dataIdsArrayReturnONLY.forEach(id => {
    //         let item = document.querySelector(`.return-order-lineitem[data-id="${id}"]`) || null;
    //         priceTotalReturnONLY += parseFloat(item.dataset.lineitemPrice);
    //         tableReturnConfirmation += `<tr class="return-table-reason-tr" data-id="${item.dataset.id}">
    //         <td class="product-image">
    //             <img src="${item.dataset.lineitemImage}" alt="Product Image" width="100%" height="100%">
    //         </td>
    //         <td class="product-name">
    //             <span class="product-name">${item.querySelector(`.lineitem-info-title`).innerHTML}</span>
    //             <div class="mob-only">
    //             <span class="product-color">${item.querySelector(`.lineitem-info-color`).innerHTML}</span>
    //             <div class="product-size-price">
    //                 <span class="product-size">${item.querySelector(`.lineitem-info-size`).innerHTML}</span>
    //                 <span class="product-price">${item.querySelector(`.lineitem-info-price`).innerHTML}</span>
    //             </div>
    //             <div class="product-return-reason">
    //                 <h4>Reason For Return</strong></h4>
    //                 <ul>
    //                 <li>${device == "desktop" ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason]`).value : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason]`).value}</li>
    //                 <li>${device == "desktop" ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason-too]`).value : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason-too]`).value}</li>
    //                 <li>${device == "desktop" ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason-attrs]`).value : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason-attrs]`).value}</li>
    //                 </ul>
    //             </div>
    //             </div>
    //         </td>
    //         </tr>`;
    //     });
    //     document.querySelector(`[data-return-table-return-confirmation]`).innerHTML = tableReturnConfirmation;
    //     console.log("priceTotalReturnONLY",priceTotalReturnONLY);
    //     document.querySelector(`[data-return-table-return-confirmation-total]`).innerHTML = formatShopifyMoney((priceTotalReturnONLY*100),document.body.getAttribute(`shop_moneyformat`)).replace(".00","").replace(",00","") + "*";
    //     document.querySelector(`[data-return-table-return-confirmation-returntotal]`).innerHTML = formatShopifyMoney((Math.abs(priceTotalReturnONLY - 5)*100),document.body.getAttribute(`shop_moneyformat`)).replace(".00","").replace(",00","") + "*";

        

    //     // document.querySelector(`.return-choose-option-single`).classList.remove("active");
    //     // document.querySelector(`.return-choose-option-return-confirmation`).classList.add("active");

    //     // console.log("dataIdsArrayExchange.length:--",dataIdsArrayExchange.length);
    //     // console.log("dataIdsArrayReturnONLY.length:--",dataIdsArrayReturnONLY.length);
    //     // if(dataIdsArrayExchange.length == 0){
    //     //       if(dataIdsArrayReturnONLY.length != 0){
    //     //         console.log("active confirmation");
    //     //         console.log("hide return-choose-option-single");
    //     //       }
    //     // }
        

    //     // if(dataIdsArrayExchange.length == 0){
    //     //     document.querySelector(`.return-choose-option-single`).classList.remove("active");
    //     //     if(dataIdsArrayReturnONLY.length == 0){
    //     //         document.querySelector(`.return-choose-option-declaration`).classList.add("active");
    //     //     }else{
    //     //         document.querySelector(`.return-choose-option-return-confirmation`).classList.add("active");
    //     //     }
    //     // }
        
    // }
}


function exchangeORreturn_ProductsHTML_new(change_data_id,type_old,type_new){


    
    const changed_id = change_data_id;
    const changed_type_new = type_new;
    const changed_type_old = type_old;
    
    console.log("final_change:---",changed_id,"--",changed_type_old,"--",changed_type_new);

    function removeIdFromArray(arr, id) {
    const index = arr.indexOf(id);
    if (index !== -1) arr.splice(index, 1);
    }

    function addIdToArray(arr, id) {
        if (!arr.includes(id)) arr.push(id);
    }

    function getArrayByType(type) {
        switch (type) {
            case "exchange":
                return dataIdsArrayExchange;

            case "refund":
                return dataIdsArrayReturnONLY;

            case "Store Credit":
                return dataIdsArrayReturnStoreCradit;

            case "exchange":
            case "refund":
            case "Store Credit":
                return dataIdsArrayReturn;

            default:
                return null;
        }
    }

    // 1️⃣ If type didn't change → do nothing
    if(!changed_type_new == "exchange")
    {
        if (changed_type_new === changed_type_old) {
            return;
        }
    }

    // 2️⃣ Get old & new arrays
    const oldArray = getArrayByType(changed_type_old);
    const newArray = getArrayByType(changed_type_new);


    if (!oldArray || !newArray) {
        console.warn("Invalid type:", changed_type_old, changed_type_new);
        return;
    }


    removeIdFromArray(oldArray, changed_id);
    addIdToArray(newArray, changed_id);

    // 4️⃣ Debug
    console.log("dataIdsArrayExchange:", dataIdsArrayExchange);
    console.log("dataIdsArrayReturn:", dataIdsArrayReturn);
    console.log("dataIdsArrayReturnONLY:", dataIdsArrayReturnONLY);
    console.log("dataIdsArrayReturnStoreCradit:", dataIdsArrayReturnStoreCradit);



        //return-choose-option-exchange
        let tableExchange = '';
     
        let device = "mobile";

        dataIdsArrayExchange.forEach(id => {
            let item = document.querySelector(`.return-order-lineitem[data-id="${id}"]`) || null;
            let sizeOptions = "";
            let itemPro = JSON.parse(item.dataset.lineitemProductJson);
            console.log("itemPro",itemPro);
            // let sizeIndex = itemPro.variants.nodes[0].selectedOptions.findIndex(item => item.name.toLowerCase() === "size");
            // if(sizeIndex < 0){
            //     sizeIndex = itemPro.variants.nodes[0].selectedOptions.findIndex(item => item.name.toLowerCase() === "shoe size");
            // }
            
            const selectedOptions = itemPro.variants.nodes[0].selectedOptions;
            let sizeIndex = selectedOptions.findIndex(o => o.name.toLowerCase() === "size" || o.name.toLowerCase() === "shoe size");
            let colorIndex = selectedOptions.findIndex(o => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour");

            itemPro.variants.nodes.forEach(variant => {

            let old_size;
            const exchangeCard = document.querySelector(
                `.return-option-grid-item[data-id="${id}"] .return-option-card[data-option="exchange"]`
            );

            if (exchangeCard.classList.contains("active")) {
                old_size = exchangeCard.getAttribute("data-changed-size");
            } else {
                old_size = exchangeCard.getAttribute("data-old-size");
            }

            const variantSize = sizeIndex > -1
                ? variant.selectedOptions[sizeIndex]?.optionValue?.name?.trim()
                : "";

            const variantColor = colorIndex > -1
                ? variant.selectedOptions[colorIndex]?.optionValue?.name?.trim()
                : "";

            const isSameSize = old_size === variantSize;
            const hiddenClass = isSameSize ? ' class="hidden"' : '';

            const optionLabel = [variantSize, variantColor]
                .filter(Boolean)
                .join(" / ");

            if (variant.availableForSale) {
                sizeOptions += `
                <option
                    ${hiddenClass}
                    value="${variant.id.replace("gid://shopify/ProductVariant/","")}"
                    data-size="${variantSize}"
                    data-color="${variantColor}"
                    data-title="${variant.displayName
                    .replace(item.querySelector(".lineitem-info-title").innerHTML, "")
                    .replace("-", "")
                    .trim()}"
                >
                    ${optionLabel}
                </option>`;
            } else {
                sizeOptions += `
                <option
                    ${hiddenClass}
                    value="${variant.id}"
                    data-size="${variantSize}"
                    data-color="${variantColor}"
                    disabled
                >
                    ${optionLabel} - Out of stock
                </option>`;
            }
            });

            

            let hidden = "";
            const item_id = changed_id
            console.log('id',id);
            console.log('item_id',item_id);
            if(id == item_id){
            tableExchange += `<tr class="return-table-reason-tr" data-id="${item.dataset.id}">
            <td class="product-name">
                <span class="product-name">${item.querySelector(`.lineitem-info-title`).innerHTML}</span>
                <div class="mob-only">
                <select class="return-select-box" data-select-exchange><option value="none" disabled selected>Please select a size</option>${sizeOptions}</select>
                <div class="size-change-output" data-size-output="${item.dataset.id}" data-size-val="${item.querySelector(`.lineitem-info-size_val`).innerHTML}"></div>
                </div>
            </td>
            </tr>`;
            }
        });
        document.querySelectorAll('.return-choose-option-return-confirmation.active .confirm-exchange[data-return-table-exchange]').forEach((el) => {
            el.innerHTML = tableExchange;
        });


        

        // exchangeORreturn_ProductsHTML_confirm();



        let selectExchangeArr = document.querySelectorAll(`.confirm-exchange [data-select-exchange]`);

        selectExchangeArr.forEach(select => {
            select.addEventListener("change",function(e){
                e.preventDefault();

                // Selected option
                const option = select.options[select.selectedIndex];
                const newSize = option.text.trim();

                console.log("newSize:--",newSize);
                const itemID = select.closest(".return-table-reason-tr").getAttribute("data-id");
                let confirm_size;
                if(itemID)
                {
                     confirm_size = document.querySelector(".return-choose-option-single .return-option-grid-item[data-id='"+ itemID +"'] [data-return-table-exchange] select option[value='"+ option.getAttribute("value") +"']");
                     console.log("confirm_size:>>>>>",confirm_size);
                     if(confirm_size)
                     {
                        // confirm_size.setAttribute("selected","selected");
                        // confirm_size.closest("select").change();
                        const selectEl = confirm_size.closest("select");
                        if (!selectEl) return;

                        // set value from option
                        selectEl.value = confirm_size.value;

                        // trigger change event
                        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
                     }
                     else
                    {
                        const outputBox = select.closest(".mob-only").querySelector(".size-change-output");
                        const old_size = outputBox.dataset.sizeVal;
                        const new_size = option.text.trim();
                        console.log(old_size,"--:--",new_size);
                        console.log("select:--",select);
                        const updated_exchange_size = select.closest(".return-summary").querySelector(".return-table-reason-tr.active .product-return-type");
                        console.log("updated_exchange_size:--",updated_exchange_size);
                        updated_exchange_size.innerHTML = `<div class="size-change-output-new"><span>Size ${old_size}</span> Exchanged To <span><b>${new_size}</b></span></div>`;


                        if(option){
                            const new_size = option.getAttribute('data-size');
                            document.querySelector(".return-choose-option-single .return-option-grid-item[data-id='"+ itemID +"'] .return-option-card[data-option='exchange']").setAttribute('data-changed-size',new_size);
                            // select.closest('.return-option-grid-item').querySelector('.return-option-card[data-option="exchange"]').setAttribute('data-changed-size',newSize);
                        }
                    }
                     
                }

                const outputBox = select.closest(".mob-only").querySelector(".size-change-output");
                const oldSize = outputBox.dataset.sizeVal;

                outputBox.innerHTML = `<span>Size ${oldSize}</span> Exchanged To <span><b>${newSize}</b></span>`;

                select.closest(".return-table-reason-tr").classList.remove("red-alert");
                select.classList.add("opt-selected");
                select.classList.add("hidden");
                select.closest(".mob-only").querySelector(".size-change-output").classList.remove("hidden");

                let noneLength = Array.from(document.querySelectorAll(`td.product-name [data-select-exchange]`))
                    .filter(sel => sel.value === "none").length;

                if(noneLength == 0){
                    document.querySelector(`[return-choose-option-exchange-next]`).classList.remove("disabled");
                }else{
                    document.querySelector(`[return-choose-option-exchange-next]`).classList.add("disabled");
                }
            });
        });


    document.querySelectorAll(".size-change-output").forEach(label => {
        label.addEventListener("click", function () {

            const select = this.closest(".mob-only").querySelector("[data-select-exchange]");
            select.classList.remove("hidden");
            try {
                if (typeof select.showPicker === "function") {
                    select.showPicker();
                } else {
                    select.focus();
                    select.click();
                }
            } catch (e) {
                select.focus();
                select.click();
            }
            this.classList.add("hidden");
        });
    });

}


function exchangeORreturn_ProductsHTML_confirm(){

    // dataIdsArrayExchange = [];
    // dataIdsArrayReturn = [];
    // dataIdsArrayReturnONLY = [];

    // let location = document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn;

    // dataIdsArrayExchange = Array.from(document.querySelectorAll(`.return-option-grid-item:has([data-option="exchange"].active)`)).map(element => element.getAttribute('data-id'));

    // dataIdsArrayReturn = Array.from(document.querySelectorAll(`.return-option-grid-item:not(:has([data-option="exchange"].active))`)).map(element => element.getAttribute('data-id'));

    // dataIdsArrayReturnONLY = Array.from(document.querySelectorAll(`.return-option-grid-item:has([data-option="refund"].active)`)).map(element => element.getAttribute('data-id'));

    console.log("dataIdsArrayExchange >>>>",dataIdsArrayExchange);
    console.log("dataIdsArrayReturn >>>>",dataIdsArrayReturn);
    console.log("dataIdsArrayReturnONLY >>>>",dataIdsArrayReturnONLY);
    console.log("dataIdsArrayReturnStoreCradit >>>>",dataIdsArrayReturnStoreCradit);

    console.log("dataIdsArrayReturn.length:--", dataIdsArrayReturn.length);
    console.log("dataIdsArrayExchange.length:--",dataIdsArrayExchange.length);
if (
    (dataIdsArrayReturn.length === 0 && dataIdsArrayExchange.length > 0) ||   // all exchange
    (dataIdsArrayReturn.length > 0 && dataIdsArrayExchange.length === 0) ||   // all return
    (dataIdsArrayReturn.length > 0 && dataIdsArrayExchange.length > 0) ||
    (dataIdsArrayReturn.length === 0 && dataIdsArrayExchange.length === 0)        // mixed
)
    {
    let tableReturnConfirmation = '';
    let device = "mobile";
    let priceTotalReturnONLY = 0;
    let priceTotalReturn = 0;

    // ⭐ Combine Exchange + ReturnOnly arrays
    // let finalConfirmationIds = [...dataIdsArrayExchange, ...dataIdsArrayReturnONLY,...dataIdsArrayReturn];
    let finalConfirmationIds = [...new Set([...dataIdsArrayExchange,...dataIdsArrayReturnONLY,...dataIdsArrayReturn,...dataIdsArrayReturnStoreCradit])];
    console.log("finalConfirmationIds", finalConfirmationIds);

    finalConfirmationIds.forEach(id => {
        let item = document.querySelector(`.return-order-lineitem[data-id="${id}"]`) || null;
        let selectedBlock = document.querySelector(`.return-option-grid-item[data-id="${id}"]`);
        const price = parseFloat(item.dataset.lineitemPrice) || 0;
       
        // Only add refund amount for Return-ONLY items
        if (dataIdsArrayReturnONLY.includes(id)) {
            console.log("item.dataset.lineitemPrice:--",item.dataset.lineitemPrice);
             priceTotalReturnONLY += price;
        }
        if (dataIdsArrayReturnStoreCradit.includes(id)) {
            console.log("item.dataset.lineitemPrice:--",item.dataset.lineitemPrice);
             priceTotalReturn += price;
        }
        
        console.log("refund:--",priceTotalReturnONLY);
        console.log("store Crdait:--",priceTotalReturn);
        

         let returnType = "";
         let ret="";
        if (selectedBlock.querySelector('[data-option="exchange"].active')) {
        const exchangeEl = selectedBlock.querySelector(".size-change-output");
            if (exchangeEl) {
                const exchange_info = exchangeEl.textContent.trim();
                console.log(exchange_info);

                returnType = exchange_info; // ← correct value
            }else{
              const get_old_size = selectedBlock.querySelector('[data-option="exchange"]').getAttribute('data-old-size');
              const get_new_size = selectedBlock.querySelector('[data-option="exchange"]').getAttribute('data-changed-size');

              returnType = `<span>Size ${get_old_size}</span> Exchanged To <span><b>Size ${get_new_size}</b></span>`;
            }
            ret ="exchange";
        }
        else if (selectedBlock.querySelector('[data-option="refund"].active')) {
            returnType = "Refunding";
            ret ="refund";
        } 
        else if (selectedBlock.querySelector('[data-option="store-credit"].active')) {
            returnType = "Store Credit";
            ret ="Store Credit";
        }

        tableReturnConfirmation += `
        <tr class="return-table-reason-tr" return_type="${ret}" data-id="${item.dataset.id}">
            <td class="product-image">
                <img src="${item.dataset.lineitemImage}" alt="Product Image" width="100%" height="100%">
            </td>
            <td class="product-name">
                <span class="product-name">${item.querySelector('.lineitem-info-title').innerHTML}</span>

                <div class="mob-only">
                    <span class="product-color">${item.querySelector('.lineitem-info-size_color').innerHTML}<span class="space">/</span>${item.querySelector(`.lineitem-info-size_val`).innerHTML}</span>
                    <span class="product-size hidden">${item.querySelector(`.lineitem-info-size_val`).innerHTML}</span>
                    <span class="product-price hidden">${item.querySelector(`.lineitem-info-price`).innerHTML}</span>

                    <div class="product-return-reason">
                        <h4 class="hidden">Reason For Return</h4>
                        <ul class="hidden">
                            <li class="hidden">${device == "desktop"
                                ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason]`).value
                                : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason]`).value
                            }</li>

                            <li class="hidden">${device == "desktop"
                                ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason-too]`).value
                                : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason-too]`).value
                            }</li>

                            <li class="hidden">${device == "desktop"
                                ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason-attrs]`).value
                                : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason-attrs]`).value
                            }</li>
                        </ul>
                        <span class="product-return-type">${returnType}</span>
                        <span class="changeReturnOpt_inconfirm" data-id="${item.dataset.id}">change</span>
                    </div>
                </div>
            </td>
            <td class="change-opt hidden">
            <div class="return-option-row" data-id="${item.dataset.id}">
            <div class="return-option-card-change" data-isOpt="Store Credit" data-id="${item.dataset.id}">
            <div class="return-option-card-inner">
            <div class="up_div"></div>
            <h3>Store Credit</h3>
            <span class="card-info">Free</span>
            <span class="card-info_inside">Free</span>
            <span class="changeReturnOpt_confirm hidden">change</span>
            </div>
            </div>

            <div class="return-option-card-change" data-isOpt="exchange" data-id="${item.dataset.id}">
            <div class="return-option-card-inner">
            <div class="up_div"></div>
            <h3>Exchange</h3>
            <span class="card-info">Free</span>
            <span class="card-info_inside">Free</span>
            <span class="changeReturnOpt_confirm hidden">change</span>
            </div>
            </div>

            <div class="return-option-card-change" data-isOpt="refund" data-id="${item.dataset.id}">
            <div class="return-option-card-inner">
            <div class="up_div"></div>
            <h3>Refund</h3>
            <span class="card-info">£5 Fee</span>
            <span class="card-info_inside">£5 order fee</span>
            <span class="changeReturnOpt_confirm hidden">change</span>
            </div>
            </div>

            </div>
            </td>
        </tr>`;
    });

    document.querySelector(`[data-return-table-return-confirmationAll]`).innerHTML = tableReturnConfirmation;

    console.log("priceTotalReturnONLY:--", priceTotalReturnONLY);

   document.querySelectorAll("[data-return-table-return-confirmationall] .return-table-reason-tr").forEach(element => {
        const return_type = element.getAttribute("return_type");
        console.log("return_type:--", return_type);
        if(return_type == "Store Credit")
        {
            document.querySelector(".credit-info.store_cradit").classList.remove("hidden");
            document.querySelector("[data-return-table-return-confirmation-total]").classList.remove("hidden");
        }
        else
        {
            document.querySelector(".credit-info.store_cradit").classList.add("hidden");
            document.querySelector("[data-return-table-return-confirmation-total]").classList.add("hidden");
        }
    });

     if(priceTotalReturnONLY > 0 )
    {
        if(document.querySelector(".credit-info.refund").classList.contains("hidden"))
        {
            document.querySelector(".credit-info.refund").classList.remove("hidden");
        }
        document.querySelector(`[data-return-table-return-confirmation-returntotal]`).innerHTML = formatShopifyMoney((Math.abs(priceTotalReturnONLY - 5) * 100), document.body.getAttribute(`shop_moneyformat`)).replace(".00", "").replace(",00", "") + "*";
    }
    else
    {
        document.querySelector(`[data-return-table-return-confirmation-returntotal]`).innerHTML = '';
        document.querySelector(".credit-info.refund").classList.add("hidden");
    }

    if(priceTotalReturn > 0 )
    {
         if(document.querySelector(".credit-info.store_cradit").classList.contains("hidden"))
        {
            document.querySelector(".credit-info.store_cradit").classList.remove("hidden");
        }
        document.querySelector(`[data-return-table-return-confirmation-total]`).innerHTML = formatShopifyMoney((priceTotalReturn * 100), document.body.getAttribute(`shop_moneyformat`)).replace(".00", "").replace(",00", "") + "*";
    }
    else
    {
        document.querySelector(`[data-return-table-return-confirmation-total]`).innerHTML = '';
        document.querySelector(".credit-info.store_cradit").classList.add("hidden");
    }
  
   
    

    document.querySelector(`.return-choose-option-single`).classList.remove("active");
    document.querySelector(`.return-choose-option-return-confirmation`).classList.add("active");
}

}


document.addEventListener("click", function (e) {
    if (e.target.classList.contains("changeReturnOpt_inconfirm")) {
        console.log("click on changeReturnOpt_inconfirm");

        const change_data_id = e.target.getAttribute("data-id");

        e.target.classList.add("hidden");
        e.target.closest(".return-table-reason-tr").querySelector(".change-opt").classList.remove("hidden");
        
        document.querySelector(".credit-method-table").classList.add("hidden");

            const row = e.target.closest(".return-table-reason-tr");
            console.log("row:--",row);
              document.querySelectorAll(".return-choose-option-return-confirmation .return-table-reason-tr").forEach(tr => {
                    if (tr !== row) {
                        tr.classList.add("hidden");
                    }
                tr.querySelectorAll(`.return-option-card-change`).forEach((card) => {
                manageProgressBar();
                console.log("in card changes");
                const heading = card.querySelector("h3");
                const changebtn = card.querySelector(".changeReturnOpt_confirm");
                const dataId = card.closest(".return-table-reason-tr").dataset.id;
                
                
                if (heading) {
                    heading.addEventListener("click", function (e) {
                        console.log("in click");
                        e.preventDefault();
                        if(!document.querySelector("[data-error-change-confirm]").classList.contains("hidden"))
                        {
                            document.querySelector("[data-error-change-confirm]").classList.add("hidden");
                        }
                        console.log("return-option-card:-", card.getAttribute("data-isopt"));
                        e.target.closest(".return-table-reason-tr").classList.add("active");
                        const activeCard = card.closest(".return-table-reason-tr.active").querySelector(".return-option-card-change.active");
                        if (activeCard) activeCard.classList.remove("active");
                        card.classList.add("active");
                        card.querySelector(".changeReturnOpt_confirm").classList.remove("hidden");
                        
                        const new_dataId = card.closest(".return-table-reason-tr").getAttribute("data-id");
                        const old_return_type = card.closest(".return-table-reason-tr").getAttribute("return_type")
                        const new_retuen_type = card.getAttribute("data-isopt"); 

                        // exchangeORreturn_ProductsHTML(); 
                         if(new_retuen_type == "exchange")
                         {
                            document.querySelector(".return-table.confirm-exchange").classList.remove("hidden");
                         }
                        exchangeORreturn_ProductsHTML_new(new_dataId,old_return_type,new_retuen_type);
                        if(new_retuen_type == "exchange")
                        {
                            card.closest(".return-summary").querySelector(".confirm-exchange").classList.remove("hidden");
                            setTimeout(() => {
                                
                                
                                // document.querySelector(".new-exchange-confirm").classList.remove("hidden");
                            //     const select_reason_ex = card.closest(".return-option-grid-item.active").querySelector("[data-select-exchange]");
                            // if (!select_reason_ex) {
                            //     console.warn("Select element NOT FOUND inside this card");
                            //     return; // stop the function safely
                            // }
                            // try {
                            //     if (typeof select_reason_ex.showPicker === "function") {
                            //         select_reason_ex.showPicker();
                            //     } else {
                            //         select_reason_ex.focus();
                            //         select_reason_ex.click();
                            //     }
                            // } catch (e) {
                            //     select_reason_ex.focus();
                            //     select_reason_ex.click();
                            // }
                            }, 500);
                        }
                    });
                }
                if(changebtn)
                {
                    changebtn.addEventListener("click", function (e) {
                    if (!changebtn) return;
                        changebtn.closest(".return-option-card-inner")?.closest(".return-option-card-change")?.classList.remove("active");
                        const new_dataId = card.closest(".return-table-reason-tr").getAttribute("data-id");
                        const old_return_type = card.closest(".return-table-reason-tr").getAttribute("return_type")
                        const new_retuen_type = card.getAttribute("data-isopt"); 

                        // console.log("new_dataId:--",new_dataId);
                        // console.log("old_return_type:--",old_return_type);
                        // console.log("new_retuen_type:--",new_retuen_type);

                        // exchangeORreturn_ProductsHTML(); 
                        document.querySelector(".return-table.confirm-exchange").classList.add("hidden");
                        document.querySelector("[data-error-change-exchange]").classList.add("hidden");
                        exchangeORreturn_ProductsHTML_new(new_dataId,old_return_type,new_retuen_type);
                    });
                }
            });
        });
    }
});


// confirm change js



// exchangeORreturn_confirmation_ProductsHTML
function exchangeORreturn_confirmation_ProductsHTML(){
    console.log("exchangeORreturn_confirmation_ProductsHTML>>>>>>>>>");
    console.log("dataIdsArrayExchange",dataIdsArrayExchange);
    console.log("dataIdsArrayReturn",dataIdsArrayReturn);
    console.log("dataIdsArrayReturnONLY",dataIdsArrayReturnONLY);
    console.log("dataIdsArrayReturnStoreCradit",dataIdsArrayReturnStoreCradit);

    if(dataIdsArrayExchange.length == 0 && dataIdsArrayReturnONLY.length == 0){
        document.querySelector(`.return-choose-option-single`).classList.remove("active");
        document.querySelector(`.return-choose-option-declaration`).classList.add("active");
    }

    // if(dataIdsArrayReturn.length != 0 && dataIdsArrayReturnONLY.length == 0){
    //     document.querySelector(`.return-choose-option-reason-final`).classList.remove("active");
    //     document.querySelector(`.return-choose-option-declaration`).classList.add("active");
    // }

    if(dataIdsArrayReturnONLY.length > 0){
        //return-choose-option-exchange
        let tableReturnConfirmation = '';
        // let device = "desktop";
        // if(document.body.clientWidth <= 767){
        //     device = "mobile";
        // }
         let device = "mobile";
        let priceTotalReturnONLY = 0;
        dataIdsArrayReturnONLY.forEach(id => {
            let item = document.querySelector(`.return-order-lineitem[data-id="${id}"]`) || null;
            priceTotalReturnONLY += parseFloat(item.dataset.lineitemPrice);
            tableReturnConfirmation += `<tr class="return-table-reason-tr" data-id="${item.dataset.id}">
            <td class="product-image">
                <img src="${item.dataset.lineitemImage}" alt="Product Image" width="100%" height="100%">
            </td>
            <td class="product-name">
                <span class="product-name">${item.querySelector(`.lineitem-info-title`).innerHTML}</span>
                <div class="mob-only">
                <span class="product-color">${item.querySelector(`.lineitem-info-color`).innerHTML}</span>
                <div class="product-size-price">
                    <span class="product-size">${item.querySelector(`.lineitem-info-size`).innerHTML}</span>
                    <span class="product-price">${item.querySelector(`.lineitem-info-price`).innerHTML}</span>
                </div>
                <div class="product-return-reason">
                    <h4>REASON FOR RETURN</strong></h4>
                    <ul>
                    <li>${device == "desktop" ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason]`).value : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason]`).value}</li>
                    <li>${device == "desktop" ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason-too]`).value : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason-too]`).value}</li>
                    <li>${device == "desktop" ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason-attrs]`).value : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason-attrs]`).value}</li>
                    </ul>
                </div>
                </div>
            </td>
            <td class="product-color desk-only">${item.querySelector(`.lineitem-info-color`).innerHTML}</td>
            <td class="product-size desk-only">${item.querySelector(`.lineitem-info-size`).innerHTML}</td>
            <td class="product-price desk-only">${item.querySelector(`.lineitem-info-price`).innerHTML}</td>
            <td class="product-return-reason desk-only">
                <h4>REASON FOR RETURN</strong></h4>
                <ul>
                <li>${device == "desktop" ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason]`).value : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason]`).value}</li>
                <li>${device == "desktop" ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason-too]`).value : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason-too]`).value}</li>
                <li>${device == "desktop" ? document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.desk-only select[data-select-reason-attrs]`).value : document.querySelector(`[data-return-table-reason] tr[data-id="${id}"] td.product-name select[data-select-reason-attrs]`).value}</li>
                </ul>
            </td>
            </tr>`;
        });
        document.querySelector(`[data-return-table-return-confirmation]`).innerHTML = tableReturnConfirmation;
        console.log("priceTotalReturnONLY---1---",priceTotalReturnONLY);

        // document.querySelector(`[data-return-table-return-confirmation-returntotal]`).innerHTML = formatShopifyMoney((Math.abs(priceTotalReturnONLY - 5)*100),document.body.getAttribute(`shop_moneyformat`)).replace(".00","").replace(",00","") + "*";
        // document.querySelector(`[data-return-table-return-confirmation-total]`).innerHTML = formatShopifyMoney((priceTotalReturn*100),document.body.getAttribute(`shop_moneyformat`)).replace(".00","").replace(",00","");
       
  if(priceTotalReturnONLY > 0 )
    {
        if(document.querySelector(".credit-info.refund").classList.contains("hidden"))
        {
            document.querySelector(".credit-info.refund").classList.remove("hidden");
        }
        document.querySelector(`[data-return-table-return-confirmation-returntotal]`).innerHTML = formatShopifyMoney((Math.abs(priceTotalReturnONLY - 5) * 100), document.body.getAttribute(`shop_moneyformat`)).replace(".00", "").replace(",00", "") + "*";
    }
    else
    {
        document.querySelector(`[data-return-table-return-confirmation-returntotal]`).innerHTML = '';
        document.querySelector(".credit-info.refund").classList.add("hidden");
    }

    if(priceTotalReturn > 0 )
    {
         if(document.querySelector(".credit-info.store_cradit").classList.contains("hidden"))
        {
            document.querySelector(".credit-info.store_cradit").classList.remove("hidden");
        }
        document.querySelector(`[data-return-table-return-confirmation-total]`).innerHTML = formatShopifyMoney((priceTotalReturn * 100), document.body.getAttribute(`shop_moneyformat`)).replace(".00", "").replace(",00", "") + "*";
    }
    else
    {
        document.querySelector(`[data-return-table-return-confirmation-total]`).innerHTML = '';
        document.querySelector(".credit-info.store_cradit").classList.add("hidden");
    }
            


        // document.querySelector(`.return-choose-option-reason-final`)?.classList.remove("active");
        // document.querySelector(`.return-choose-option-return-confirmation`).classList.add("active");
    }



    if(dataIdsArrayExchange.length > 0){

        let tableExchangeConfirmation = '';
        let hidden = "";
        dataIdsArrayExchange.forEach(id => {
            let item = document.querySelector(`.return-order-lineitem[data-id="${id}"]`) || null;
            // let newSize = document.querySelector(`[data-return-table-exchange] tr[data-id="${id}"] .return-select-box.desk-only [data-select-exchange] option[value="${document.querySelector(`[data-return-table-exchange] tr[data-id="${id}"] .return-select-box.desk-only [data-select-exchange]`).value}"]`);
            // if(document.body.clientWidth <= 767){
                // newSize = document.querySelector(`[data-return-table-exchange] tr[data-id="${id}"] td.product-name [data-select-exchange] option[value="${document.querySelector(`[data-return-table-exchange] tr[data-id="${id}"] td.product-name [data-select-exchange]`).value}"]`);
            // }
            // let newSize = document.querySelector(`[data-return-table-exchange] tr[data-id="${id}"] td.product-name [data-select-exchange] option[value="${document.querySelector(`[data-return-table-exchange] tr[data-id="${id}"] td.product-name [data-select-exchange]`).value}"]`);
            // let newSize = document.querySelector(`[data-return-table-exchange-new] tr[data-id="${id}"] td.product-name [data-select-exchange] option[value="${document.querySelector(`[data-return-table-exchange] tr[data-id="${id}"] td.product-name [data-select-exchange]`).value}"]`);
            const selectEl = document.querySelector(`[data-return-table-exchange] tr[data-id="${id}"] td.product-name [data-select-exchange]`);
            if (!selectEl) return;
            const selectedValue = selectEl.value;
            const newSizeOldTable = document.querySelector(`[data-return-table-exchange] tr[data-id="${id}"] td.product-name [data-select-exchange] option[value="${selectedValue}"]`);

            tableExchangeConfirmation += `<tr class="return-table-reason-tr" data-id="${item.dataset.id}">
            <td class="product-image">
                <img src="${item.dataset.lineitemImage}" alt="Product Image" width="100%" height="100%">
            </td>
            <td class="product-name">
              ${item.querySelector(`.lineitem-info-title`).innerHTML}
              <span class="product-color mob-only">${item.querySelector(`.lineitem-info-color`).innerHTML}</span>
            </td>
            <td class="product-color desk-only">${item.querySelector(`.lineitem-info-color`).innerHTML}</td>
            <td class="product-size">${item.querySelector(`.lineitem-info-size`).innerHTML}</td>
            <td class="product-size">${newSizeOldTable.textContent.replace("Size ","")}</td>
            </tr>`;
        });
        // static HTML for icon
        tableExchangeConfirmation += `<tr class="">
            <td class="product-image"></td>
            <td class="product-name"></td>
            <td class="product-color"></td>
            <td class="product-size">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="22" viewBox="0 0 30 22" fill="none">
                <line x1="0.823223" y1="21.8232" x2="16.0503" y2="6.59612" stroke="black" stroke-opacity="0.6" stroke-width="0.5"/>
                <line x1="15.3174" y1="6.59611" x2="29.4569" y2="20.7356" stroke="black" stroke-opacity="0.6" stroke-width="0.5"/>
                <line x1="2.999" y1="13.1221" x2="15.2978" y2="0.823236" stroke="black" stroke-opacity="0.6" stroke-width="0.5"/>
                <line x1="14.7744" y1="0.823223" x2="26.1948" y2="12.2436" stroke="black" stroke-opacity="0.6" stroke-width="0.5"/>
              </svg>
              Return
            </td>
            <td class="product-size">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="22" viewBox="0 0 30 22" fill="none">
                <line x1="0.823223" y1="21.8232" x2="16.0503" y2="6.59612" stroke="black" stroke-opacity="0.6" stroke-width="0.5"/>
                <line x1="15.3174" y1="6.59611" x2="29.4569" y2="20.7356" stroke="black" stroke-opacity="0.6" stroke-width="0.5"/>
                <line x1="2.999" y1="13.1221" x2="15.2978" y2="0.823236" stroke="black" stroke-opacity="0.6" stroke-width="0.5"/>
                <line x1="14.7744" y1="0.823223" x2="26.1948" y2="12.2436" stroke="black" stroke-opacity="0.6" stroke-width="0.5"/>
              </svg>
              Exchange
            </td>
          </tr>`;
        document.querySelector(`[data-return-table-exchange-confirmation] tbody`).innerHTML = tableExchangeConfirmation;


        if(dataIdsArrayReturnONLY.length == 0){
            document.querySelector(`.return-choose-option-exchange`).classList.remove("active");
            document.querySelector(`.return-choose-option-single`).classList.remove("active");
            document.querySelector(`.return-choose-option-exchange-confirmation`).classList.add("active");
        }
    }
}

function getDataOriginal(el, key) {
  if (!el.__dataCache) {
    el.__dataCache = {};
  }
  if (!(key in el.__dataCache)) {
    el.__dataCache[key] = el.getAttribute("data-" + key);
  }
  return el.__dataCache[key];
}



//submitReturn();
function submitReturn(){
    console.log("submitReturn>>>>>>>>");
    let lineItems = [];
    let location = document.querySelector(`[data-return-from-location-btn].active`).dataset.returnFromLocationBtn;
    let weight_sum;
    let total_price;
    let is_refund = false ;

    document.querySelectorAll(".return-order-lineitem.selected").forEach(item => {

        
        let lineItem = {};
        let itemPro = JSON.parse(item.dataset.lineitemProductJson);

        let variants = itemPro?.variants?.nodes || [];
        let matchedVariant = variants.find(v => {
            // Shopify ID looks like: gid://shopify/ProductVariant/55063548625231
            // So extract the last part
            let pureId = v.id.split("/").pop();
            return pureId === item.dataset.lineitemVariantId;
        });

        if (matchedVariant) {
            let weightValue = matchedVariant.inventoryItem?.measurement?.weight?.value || null;

            console.log("Matched Variant:", matchedVariant);
            console.log("Weight Value:", weightValue);
            if(weight_sum){
                weight_sum = weight_sum + weightValue; 
            }else{
                weight_sum = weightValue;
            }
        } else {
            console.log("No variant matched.");
        }

        // let trSelects = document.querySelectorAll(`[data-return-table-reason] tr[data-id="${item.dataset.id}"] td.desk-only select`);
        let refundItems = [];
        // if(document.body.clientWidth <= 767){
            trSelects = document.querySelectorAll(`[data-return-table-reason] tr[data-id="${item.dataset.id}"] td.product-name select`);
        // }
        trSelects.forEach((selectEle,index) => {
            lineItem[`reason_${index+1}`] = selectEle.value;
        });

        // exchange id and title
        lineItem.exchange_variant_id = null;
        
        lineItem.exchange_variant_name = null;
        if(document.querySelector(`[data-return-table-exchange] tr[data-id="${item.dataset.id}"]`)){
            // lineItem.exchange_variant_id = document.querySelector(`[data-return-table-exchange] tr[data-id="${item.dataset.id}"] td.desk-only select`).value;
            // lineItem.exchange_variant_name = document.querySelector(`[data-return-table-exchange] tr[data-id="${item.dataset.id}"] td.desk-only select option[value="${lineItem.exchange_variant_id}"]`).dataset.title;
            // if(document.body.clientWidth <= 767){
                lineItem.exchange_variant_id = document.querySelector(`[data-return-table-exchange] tr[data-id="${item.dataset.id}"] td.product-name select`).value;
                console.log("lineItem.exchange_variant_id:--",lineItem.exchange_variant_id);
                lineItem.exchange_variant_name = document.querySelector(`[data-return-table-exchange] tr[data-id="${item.dataset.id}"] td.product-name select option[value="${lineItem.exchange_variant_id}"]`).dataset.title;
                console.log("lineItem.exchange_variant_name:--",lineItem.exchange_variant_name);
            // }
        }
        // return type
        lineItem.return_type = null;
        // if(location != "INTERNATIONAL"){
        //     if(document.querySelectorAll(`.return-order-lineitem.selected`).length == 1){
        //         lineItem.return_type = document.querySelector(`.return-options-steps.return-choose-option-single .return-option-card.active`).dataset.option;
        //     }else{
        //         lineItem.return_type = document.querySelector(`[data-return-table-multiple] tr[data-id="${item.dataset.id}"] .btn-select.active`).dataset.button;
        //     }
        // }else{
        //     lineItem.return_type = document.querySelector(`.return-options-steps.return-choose-option-single .return-option-card.active`).dataset.option;
        // }

        lineItem.return_type = document.querySelector(`.return-options-steps.return-choose-option-single .return-option-grid-item[data-id="${item.dataset.id}"] .return-option-card.active`).dataset.option;

        // if(lineItem.return_type == "refund" && document.querySelector(`.return-options-steps.return-choose-option-return-confirmation input[name="credit_method"]:checked`).value != "refund"){
        //     lineItem.return_type = document.querySelector(`.return-options-steps.return-choose-option-return-confirmation input[name="credit_method"]:checked`).value;
        // }
        lineItem.return_type = lineItem.return_type.replace("-","_");
        

        lineItem.lineitem_id = item.dataset.id;
        lineItem.product_id = itemPro.id.replace("gid://shopify/Product/","");
        lineItem.product_name = item.querySelector(`.lineitem-info-title`).innerHTML;
        lineItem.variant_id = item.dataset.lineitemVariantId;
        lineItem.variant_name = item.dataset.lineitemVariantTitle;
        // lineItem.price = item.dataset.lineitemPrice;
        // lineItem.inventory_item_id = item.dataset.inventoryItemId;
        lineItem.price = getDataOriginal(item, "lineitem-price");
        lineItem.quantity = item.dataset.lineitemQuantity;
        

        console.log("lineItem",lineItem);
        console.log("lineItem.return_type",lineItem.return_type);
        if(lineItem.return_type !== "exchange")
        {

            let price = Number(item.dataset.lineitemPrice); // convert to number
            if (total_price) {
                total_price = total_price + price;
            } else {
                total_price = price;
            }
        }
        if(lineItem.return_type === 'refund')
        {
            is_refund = true ; 
            
        }
        // console.log("inventory_item_id:--",inventory_item_id);
        lineItems.push(lineItem);
    });

    const refundItems = lineItems.filter(li => li.return_type === "refund");

// Apply flat $5 deduction only once if refund items exist
if (refundItems.length > 0) {
    const totalRefundItems = refundItems.length;
    const deduction = 5; // $5 total per refund group
    const deductionPerItem = deduction / totalRefundItems;

    refundItems.forEach(li => {
        li.price = Math.max(0, li.price - deductionPerItem); // spread deduction evenly
    });

    console.log(`Amount Deducted $${deduction} across ${totalRefundItems} refund item(s).`);
}

// console.log("Final lineItems:", lineItems);

    console.log("submitReturn>>>>>>>>",lineItems);


  let uniqueTypes = [...new Set(lineItems.map(item => item.return_type))];
    let type;
    if (uniqueTypes.length === 1) {
    type = uniqueTypes[0].replace(/_/g, " ").toUpperCase();
    } else {
    type = "MULTIPLE"; // mixed types
    }
    
    let return_fee = type && type.toUpperCase() === "REFUND" ? 5 : 0;




    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const selected_card =  document.querySelector(".return-print-card.return-option-selected").getAttribute("data-print"); 

console.log('weight_sum',weight_sum);
console.log("total_price:", total_price,"is_refund:--",is_refund);
if(is_refund)
{
 total_price = total_price - 5;
}
else
{
    total_price = 0;
}
    const raw = JSON.stringify({
        "shopify_order_id": orderObj.id.replace("gid://shopify/Order/",""),
        "shopify_order_number": orderObj.number,
        "shopify_customer_id": orderObj.customer.id.replace("gid://shopify/Customer/",""),
        "customer_name": `${orderObj.customer.firstName} ${orderObj.customer.lastName}`,
        "customer_email": orderObj.customer.email,
        // "type": "RETURN",
         "type": type, 
        "line_items_count": lineItems.length,
        "status": "REQUESTED",
        "location": location,
        "customer_notes": Array.from(document.querySelectorAll(".return-options textarea")).map(el => el.value.trim()).filter(val => val !== "").join(" | "),
        "line_items": lineItems,
        "shippingAddress": orderObj.shippingAddress,
        "totalWeight": weight_sum,
        "totalPrice": total_price,
        "shipment_type": "QrCode",
        "return_fee":return_fee,
        "dpd_api": false,
        "currency": orderObj.currencyCode
    });
    console.log("raw",raw);

    const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
    };

    fetch("https://returns.marame.com/api/return-orders", requestOptions)
    .then((response) => response.json())
    .then((result) => {
        console.log(result);
        console.log(result.message);
        if(result.success == true){
            // return-choose-option-return-thank-you
            document.querySelector(`.return-choose-option-return-prepare-parcel`).classList.remove("active");
            document.querySelector(`.return-choose-option-return-thank-you`).classList.add("active");
            document.querySelector(`#downloadPdf`).setAttribute("href",`${result.data.url}`);
            // const downloadLink = document.getElementById("downloadPdf");
            // downloadLink.setAttribute("href", `${result.data.url}`);
            document.getElementById("downloadPdf")?.classList.remove("disabled");
            const selected_card =  document.querySelector(".return-print-card.return-option-selected").getAttribute("data-print");
             const downloadBtn = document.querySelector("#downloadPdf");
                if (downloadBtn) {
                    if (selected_card === "QrCode") {
                        downloadBtn.textContent = "Download QrCode";
                    }
                    else
                    {
                        downloadBtn.textContent = "Download Label";
                    }
                }


            document.getElementById("downloadPdf").addEventListener("click", async () => {
                    const imageUrl = result.data.url;
                    const fileName = imageUrl.split("/").pop();

                    try {
                        const response = await fetch(imageUrl, { mode: "no-cors" });
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);

                        const a = document.createElement("a");
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                    } catch (error) {
                        console.error("Error:", error);
                        window.open(imageUrl, "_blank");
                    }
                }); 

        }else{
            document.querySelector(`[return-choose-option-submit-return]`).classList.remove("disabled");
            const errorBox = document.querySelector('[data-submit--error]');
            if (errorBox) {
            errorBox.textContent = result.message;
            }
           
        }
    })
    .catch((error) => console.error(error));


        try {
    const print_option = JSON.stringify({
        shippingAddress: orderObj.shippingAddress["zip"]
    });

    const print_requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: print_option,
        redirect: "follow"
    };

    console.log("print_requestOptions:--", print_requestOptions);
    } catch (err) {
    console.error("⚠️ Error building print_requestOptions:", err);
    }


}



function formatShopifyMoney(amount) {
    if (typeof Shopify === 'undefined' || typeof  Shopify.formatMoney !== 'function') {
        return '£' + (amount / 100).toFixed(2);
    }
    return Shopify.formatMoney(amount, Shopify.money_format)
        .replace('.00', '')
        .replace(',00', '');
}

document.addEventListener("DOMContentLoaded", function () {
  const finishBtn = document.querySelector(".finish-btn");
  if (finishBtn) {
    const newHref = "https://returns.marame.com/return" + window.location.search;
    finishBtn.setAttribute("href", newHref);
  } else {
  }
});
