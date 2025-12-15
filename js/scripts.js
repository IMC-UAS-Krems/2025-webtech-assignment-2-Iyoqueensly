
document.addEventListener("DOMContentLoaded", function () {

  var cartItemsList = document.getElementById("cart-items");
  var cartCountEl = document.getElementById("cart-count");
  var cartSubtotalEl = document.getElementById("cart-subtotal");
  var cartDiscountEl = document.getElementById("cart-discount");
  var cartTaxEl = document.getElementById("cart-tax");
  var cartTotalEl = document.getElementById("cart-total");
  var checkoutForm = document.getElementById("checkout-form");

  var cart = [];
  var TAX_RATE = 0.10;
  var DISCOUNT_THRESHOLD = 50;
  var DISCOUNT_RATE = 0.10;
  var STORAGE_KEY = "itoo-cart";

  function loadCart() {
    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(stored)) {
        cart = stored;
      }
    } catch (e) {
      console.warn("Could not load cart:", e);
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("Could not save cart:", e);
    }
  }

  function renderCart() {
    cartItemsList.innerHTML = "";

    var template = document.getElementById("cart-item-template");

    var subtotal = 0;
    var totalItems = 0;

    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];

      var clone = template.content.cloneNode(true);

      clone.querySelector(".cart-info").textContent =
        item.name + " — €" + item.price + " × " + item.quantity;

      clone.querySelector(".btn-minus").onclick = (function (index) {
        return function () {
          changeQuantity(index, -1);
        };
      })(i);

      clone.querySelector(".btn-plus").onclick = (function (index) {
        return function () {
          changeQuantity(index, 1);
        };
      })(i);

      clone.querySelector(".btn-remove").onclick = (function (index) {
        return function () {
          removeItem(index);
        };
      })(i);

      cartItemsList.appendChild(clone);

      subtotal += item.price * item.quantity;
      totalItems += item.quantity;
    }

    var discount = subtotal >= DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
    var taxable = subtotal - discount;
    var tax = taxable * TAX_RATE;
    var total = taxable + tax;

    cartCountEl.textContent = totalItems;
    cartSubtotalEl.textContent = subtotal.toFixed(2);
    cartDiscountEl.textContent = discount.toFixed(2);
    cartTaxEl.textContent = tax.toFixed(2);
    cartTotalEl.textContent = total.toFixed(2);

    saveCart();
  }

  function addToCart(name, price) {
    if (!name || isNaN(price)) return;

    var existing = null;

    for (var i = 0; i < cart.length; i++) {
      if (cart[i].name === name) {
        existing = cart[i];
        break;
      }
    }

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name: name, price: price, quantity: 1 });
    }

    renderCart();
    alert(name + " has been added to your cart!");
  }

  function changeQuantity(index, delta) {
    if (!cart[index]) return;
    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }

    renderCart();
  }

  function removeItem(index) {
    if (!cart[index]) return;
    cart.splice(index, 1);
    renderCart();
  }

  function clearCart() {
    cart = [];
    renderCart();
  }

  function initAddToCartButtons() {
    var cards = document.querySelectorAll(".card");

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var titleEl = card.querySelector(".card-title");
      if (!titleEl) continue;

      var btn = card.querySelector(".add-to-cart") || card.querySelector(".btn-info");
      if (!btn) continue;

      var name = btn.getAttribute("data-name");
      var price = parseFloat(btn.getAttribute("data-price"));

      if (!name || isNaN(price)) {
        var parts = titleEl.textContent.trim().split("€");
        name = parts[0].trim();
        price = parseFloat(parts[1]);
      }

      if (!name || isNaN(price)) continue;

      btn.addEventListener("click", (function (nameCopy, priceCopy) {
        return function (event) {
          event.preventDefault();
          addToCart(nameCopy, priceCopy);
        };
      })(name, price));
    }
  }

  function initCheckoutForm() {
    if (!checkoutForm) return;

    checkoutForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (cart.length === 0) {
        alert("Your cart is empty. Please add at least one item.");
        return;
      }

      if (!checkoutForm.checkValidity()) {
        event.stopPropagation();
        checkoutForm.classList.add("was-validated");
        return;
      }
      //create an alert message after the purchase
      var firstName = document.getElementById("validationDefault01").value.trim();
      var lastName = document.getElementById("validationDefault02").value.trim();
      var email = document.getElementById("validationDefaultUsername").value.trim();
      var city = document.getElementById("validationDefault03").value.trim();
      var state = document.getElementById("validationDefault04").value.trim();
      var zip = document.getElementById("validationDefault05").value.trim();
      var total = cartTotalEl.textContent;

      alert(
        "Thank you, " + firstName + " " + lastName + "!\n\n" +
        "Your order total is €" + total + ".\n" +
        "A confirmation will be sent to: " + email + "\n" +
        "Shipping to: " + zip + " " + city + ", " + state
      );

      clearCart();
      checkoutForm.reset();
      checkoutForm.classList.remove("was-validated");
    });
  }

  function injectClearCartButton() {
    var clearBtn = document.getElementById("clear-cart-btn");
    if (clearBtn) {
      clearBtn.onclick = function () {
        clearCart();
      };
    }
  }

  
  loadCart();
  initAddToCartButtons();
  initCheckoutForm();
  injectClearCartButton();
  renderCart();

});
