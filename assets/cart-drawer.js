/* 

==> for RENDER UPDATED Cart-Drawer Html
    document.querySelector("custom-cart-drawer").fetchCartDrawerData();

==> for OPEN Cart-Drawer
    document.querySelector("custom-cart-drawer").open();

==> for CLOSE Cart-Drawer
    document.querySelector("custom-cart-drawer").open();
*/

class customCartDrawer extends HTMLElement {
  constructor() {
    super();
    this.init();    
  }

  init(){
    const dataCartOpen = document.querySelectorAll("[data-cart-drawer-open]") || null;
    // console.log("dataCartOpens",dataCartOpen);
    if (dataCartOpen) {
        dataCartOpen.forEach(btn => {
          btn.addEventListener('click', this.open.bind(this));
        });
    }

    const dataCartClose = document.querySelectorAll("[data-cart-drawer-close]") || null;
    // console.log("dataCartClose",dataCartClose);
    if (dataCartClose) {
        dataCartClose.forEach(btn => {
          btn.addEventListener('click', this.close.bind(this));
        });
    }


    const dataCartQty = this.querySelectorAll("[data-cart-drawer-qty]") || null;
    if (dataCartQty) {
        dataCartQty.forEach(btn => {
          btn.addEventListener('click', this.updateQty.bind(this));
        });
    }



    const dataCartQty_input = this.querySelectorAll(".cart-drawer-quantity__input") || null;
    if (dataCartQty_input) {
        dataCartQty_input.forEach(input => {
          input.addEventListener('change', this.updateQty.bind(this));
        });
    }

    // cloase cart drawer on continue_shopping btn
    // const continue_shopping = document.querySelectorAll(".continue-shopping");
    // if (continue_shopping.length > 0) {
    //   continue_shopping.forEach(btn => {
    //     btn.addEventListener('click', function(e) {
    //       // e.preventDefault();
    //       document.querySelector("[data-cart-drawer-close]")?.click();
    //     });
    //   });
    // }

    //for CART NOTE
    const cartNoteBtn = document.querySelectorAll("[data-cart-note-btn]") || null;
    if(cartNoteBtn){
      cartNoteBtn.forEach(btn => {
        btn.addEventListener('click', this.cartNoteBtnClick.bind(this));
      });
    }

    const sameProAlertClose = document.querySelectorAll("[same-product-alert-popup-btn]");
    if (sameProAlertClose) {
        sameProAlertClose.forEach(btn => {
          btn.addEventListener('click', function(e){
            e.preventDefault();
            localStorage.sameProductAlertAllow = false;
            document.querySelector("[same-product-alert-popup]")?.classList.remove("active");
          });
        });
    }

    //for CART NOTE TEXTAREA
    // const cartNoteInput = document.querySelector("[data-cart-note-input]") || null;
    // var _this = this;
    // if(cartNoteInput){
    // cartNoteInput.addEventListener('keyup', debounce((event) => {
    // console.log("keyup",event.target.value);
    // _this.cartNoteUpdate(event);
    // },300));
    // }

    // if(document.querySelector("#packing_info-cd")){
    //   document.querySelector("#packing_info-cd").addEventListener("change",function(e){
    //       e.preventDefault();
    //       // console.log("checkbox changeddddddd",this.checked);
    //       let note = '';
    //       if(this.checked == false){
    //           note = 'Parcel to be unscented: true';
    //       }
    //       fetch('/cart/update.js', {
    //       method: 'POST',
    //       headers: {
    //           'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify({ note })
    //       })
    //       .then(response => {
    //       return response.json();
    //       })
    //       .catch((error) => {
    //       console.error('Error:', error);
    //       });
    //   });
    // }

    


  }

  open() {
    this.classList.add("active");
    document.body.setAttribute("data-lenis-prevent", true);
    document.documentElement.setAttribute("data-lenis-prevent", true);
    
    setTimeout(() => {
      if(localStorage.sameProductAlertAllow == undefined || localStorage.sameProductAlertAllow == "true"){
        if(localStorage.sameProductAlertLength == undefined){
          localStorage.sameProductAlertLength = 0;
        }
        if(document.querySelectorAll(`.cart-item.same-product-alert`).length > 0 && document.querySelectorAll(`.cart-item.same-product-alert`).length != parseInt(localStorage.sameProductAlertLength)){
          document.querySelector(`[same-product-alert-popup]`)?.classList.add("active");
          localStorage.sameProductAlertLength = document.querySelectorAll(`.cart-item.same-product-alert`).length;
        }
      }
    }, 1500);
  }

  close() {
    this.classList.remove("active");
    document.body.removeAttribute("data-lenis-prevent");
    document.documentElement.removeAttribute("data-lenis-prevent");
  }
  


  updateQty(evt){
    console.log("updateQty",evt);
    var btn = evt.target;

    if( evt.target.closest("button")){
      btn = evt.target.closest("button");
    }
    // if(btn.nodeName != "BUTTON"){
    //   btn = evt.target.closest("button");
    // }
    

    //for prevent back to back siblings btn click event
    var allRelatedBtn = this.querySelectorAll("[data-cart-drawer-qty]");
    allRelatedBtn.forEach(dataBtn => {
          dataBtn.classList.add("disabled");
    });
    
    var key = btn.getAttribute("data-key");
    console.log("Key",key);
    var operation = btn.getAttribute("name") || null;
    var currQty = btn.getAttribute("data-qty") || null;

    // check for QTY -- Plus/Minus/Remove
    console.log("operation",operation);
    if(operation){
      if(operation == 'plus'){
        currQty = parseInt(currQty) + 1;
        this.updateCart(key,currQty);
      }else if(operation == 'minus'){
        currQty = parseInt(currQty) - 1;
        this.updateCart(key,currQty);
      }else if(operation == 'updates[]'){
        currQty = parseInt(btn.value);
        this.updateCart(key,currQty);
      }else{
        this.updateCart(key,0);
      }
    }

    setTimeout(() => {
      if(localStorage.sameProductAlertAllow == undefined || localStorage.sameProductAlertAllow == "true"){
        if(localStorage.sameProductAlertLength == undefined){
          localStorage.sameProductAlertLength = 0;
        }
        console.log("in popup code");
        if(document.querySelectorAll(`.cart-item.same-product-alert`).length > 0 && document.querySelectorAll(`.cart-item.same-product-alert`).length != parseInt(localStorage.sameProductAlertLength)){
          document.querySelector(`[same-product-alert-popup]`)?.classList.add("active");
          localStorage.sameProductAlertLength = document.querySelectorAll(`.cart-item.same-product-alert`).length;
        }
      }
    }, 1500);
    
  }

  
  //   document.querySelectorAll(".cart-drawer-quantity__input").forEach(input => {
  //   input.addEventListener("change", function() {
  //     console.log("change");
  //     const key = this.getAttribute("data-key");
  //     let newQty = parseInt(this.value) || 0;
  //     const maxQty = parseInt(this.getAttribute("max")) || 9999;
  //     const minQty = parseInt(this.getAttribute("min")) || 0;

  //     if (newQty > maxQty) newQty = maxQty;
  //     if (newQty < minQty) newQty = minQty;

  //     this.value = newQty;
  //     updateCart(key, newQty);
  //   });
  // });


  



  updateCart(key,currQty){
    console.log("currQty",currQty);
    let sectionArr = ['cart-drawer']; // section name
    const update_obj = {
                          'id': key,
                          'quantity': currQty,
                          sections:sectionArr // for get updated HTML
                       }
    console.log("obj",update_obj.quantity);
    fetch(window.routes.cart_change_url+'.js', {
        method: 'POST',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(update_obj)
      })
      .then(response => response.text()).then(response => {
        const parsedState = JSON.parse(response);
        // console.log("parsedState",parsedState);
        var cartDrawerHtml = parsedState.sections['cart-drawer'];
        var cartItemCount = parsedState.item_count;

        //render updated CART-DRAWER Html
        this.renderCartDrawer(cartDrawerHtml,cartItemCount);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally((e) => {
        // console.log("finally");
      });

  }
  

  renderCartDrawer(cartDrawerHtml,cartItemCount){
    console.log("RENDER CART");

    setTimeout(function(){
      // document.querySelectorAll(".cart-item").forEach(item => {
      // var item_qty = item.querySelector(".cart-drawer-quantity__input").getAttribute("data-qty");
      // console.log("item_qty:---",item_qty);
      // if(item_qty <= 1)
      // {
      //   item.classList.remove("same-product-alert");
      // }
      // });
    },500);

    var doc = new DOMParser().parseFromString(cartDrawerHtml, "text/html");
    console.log("doc",doc);
    this.innerHTML = doc.querySelector("[data-cart-drawer]").innerHTML;
    if(cartItemCount == 0){
      this.classList.add("is-empty");
    }

    //set cart ITEM-COUNT
    this.setCartCount(cartItemCount);
    this.init();
    console.log("document.querySelectorAll(`.cart-item.same-product-alert`).length:--",document.querySelectorAll(`.cart-item.same-product-alert`).length);
    localStorage.sameProductAlertLength = document.querySelectorAll(`.cart-item.same-product-alert`).length;
  }

  // function for use to render updated CART-DRAWER Html
  fetchCartDrawerData(){
    
    fetch(window.location.pathname).then(res => res.text()).then(res =>{
      
      var cartDrawer = document.querySelector("[data-cart-drawer]") || null;
      if(cartDrawer){
        var doc = new DOMParser().parseFromString(res, "text/html");
        var updatedHtml = doc.querySelector("[data-cart-drawer]");
        cartDrawer.innerHTML = updatedHtml.innerHTML;
        
        var count = updatedHtml.querySelector(".cart-drawer-main").getAttribute("data-count");
        if(parseInt(count) == 0){
          cartDrawer.classList.add("is-empty");
        }else{
          cartDrawer.classList.remove("is-empty");
        }

        //set cart ITEM-COUNT
        this.setCartCount(parseInt(count));
        
        this.init();
        setTimeout(() => {
            document.querySelector("custom-cart-drawer").open();
        },300);
      }
    });
  }

  setCartCount(count){
    // console.log("count",count);
    let countWrapper = document.querySelectorAll("[data-cart-item-count]") || null;
    if (countWrapper) {
        countWrapper.forEach(ele => {
          ele.innerText = count;
        });
    }
  }

  cartNoteBtnClick(evt){
    var btn = evt.target;
    console.log("btn",btn);
    var cartNoteWrap = btn.closest("[data-cart-note]") || null;

    if(cartNoteWrap){
      if(cartNoteWrap.classList.contains("active")){
        cartNoteWrap.classList.remove("active");
      }else{
        cartNoteWrap.classList.add("active");
        var textarea = cartNoteWrap.querySelector("[data-cart-note-input]");
        if(textarea) textarea.focus();
      }
    }
  }

  cartNoteUpdate(evt){
    console.log("change");
    var btn = evt.target;
    const body = JSON.stringify({ note: btn.value });
    fetch(`${window.routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
    // this.init();
  }
  
}
customElements.define('custom-cart-drawer', customCartDrawer);

document.querySelector(".header__right__bag__cart")?.addEventListener("click",function(e){
  e.preventDefault();
  document.querySelector("custom-cart-drawer").open();
});


document.addEventListener("click", function(e) {
  const btn = e.target.closest(".custom_cross_icon");
  if (!btn) return;

  const cartItem = btn.closest(".cart-item__quantity");
  if (!cartItem) return;

  cartItem.querySelector(".cart-item-remove")?.classList.add("active");
});
