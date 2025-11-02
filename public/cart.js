// ✅ Rooted Smile Cart Logic — 2025 update
document.addEventListener("DOMContentLoaded", () => {
  const cartKey = "rs_cart";
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartItemsContainer = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  const freeShipFill = document.getElementById("freeShipFill");
  const freeShipText = document.getElementById("freeShipText");
  const FREE_SHIP_THRESHOLD = 50;

  /** 🔁 Utility: Get / Save Cart */
  function getCart() {
    return JSON.parse(localStorage.getItem(cartKey) || "[]");
  }
 function saveCart(cart) {
  localStorage.setItem("rs_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
  window.dispatchEvent(new Event("itemAddedToCart")); // 👈 this line is important
  renderCart();
}
  /** ➕ Add Item to Cart */
  window.addToCart = function (item) {
    const cart = getCart();
    const existing = cart.find(p => p.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    saveCart(cart);
    openCartDrawer();
  };

  /** ➖ Update Item Quantity */
  function updateQty(id, qty) {
    let cart = getCart();
    cart = cart
      .map(item => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item))
      .filter(item => item.qty > 0);
    saveCart(cart);
  }

  /** ❌ Remove Item */
  function removeItem(id) {
    let cart = getCart().filter(item => item.id !== id);
    saveCart(cart);
  }

  /** 💰 Render Cart Drawer */
  function renderCart() {
    const cart = getCart();
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<p>Your cart is empty.</p>`;
    } else {
      cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <div class="cart-item-row">
            <div class="cart-item-info">
              <strong>${item.name}</strong>
              <p>$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
              <input type="number" value="${item.qty}" min="1" class="qty-input" data-id="${item.id}" />
              <button class="remove-btn" data-id="${item.id}">×</button>
            </div>
          </div>
        `;
        cartItemsContainer.appendChild(div);
      });
    }

    updateSubtotal();
  }

  /** 🧮 Subtotal + Free Shipping Progress */
  function updateSubtotal() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    // Free shipping progress bar
    const progress = Math.min(subtotal / FREE_SHIP_THRESHOLD, 1);
    freeShipFill.style.width = `${progress * 100}%`;

    if (subtotal >= FREE_SHIP_THRESHOLD) {
      freeShipText.textContent = "🎉 You’ve earned free shipping!";
      freeShipFill.style.background = "#b9a76b";
    } else {
      const remaining = (FREE_SHIP_THRESHOLD - subtotal).toFixed(2);
      freeShipText.textContent = `You’re $${remaining} away from free shipping`;
      freeShipFill.style.background = "#3a5e38";
    }

    // Trigger dot update immediately
    window.dispatchEvent(new Event("cartUpdated"));
  }

  /** 🪟 Drawer Controls */
  function openCartDrawer() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("active");
  }
  function closeCartDrawer() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("active");
  }

  document.getElementById("closeCart")?.addEventListener("click", closeCartDrawer);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCartDrawer);

  /** 🔢 Quantity Input & Remove Listeners */
  cartItemsContainer.addEventListener("input", e => {
    if (e.target.classList.contains("qty-input")) {
      const id = e.target.dataset.id;
      const qty = parseInt(e.target.value);
      updateQty(id, qty);
    }
  });
  cartItemsContainer.addEventListener("click", e => {
    if (e.target.classList.contains("remove-btn")) {
      const id = e.target.dataset.id;
      removeItem(id);
    }
  });

  /** 🚀 Initialize */
  renderCart();
  window.addEventListener("storage", renderCart);
  window.addEventListener("cartUpdated", renderCart);
});
