// public/cart.js

const CART_KEY = "rs_cart";
const FREE_SHIP_TARGET = 50; // $50 free shipping

// ---------- storage helpers ----------
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // let layout/dot/cart listen
  window.dispatchEvent(new Event("cartUpdated"));
  window.dispatchEvent(new Event("itemAddedToCart"));
  renderCart();
}

// ---------- drawer helpers ----------
function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (drawer) drawer.classList.add("open");
  if (overlay) overlay.classList.add("active");
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (drawer) drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("active");
}

// ---------- add / update / remove ----------
function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((p) => p.id === item.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + (item.qty || 1);
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty || 1,
      image: item.image || null,
    });
  }
  saveCart(cart);
  // auto open on add
  openCartDrawer();
}

function updateQty(id, newQty) {
  let cart = getCart();
  cart = cart
    .map((item) => {
      if (item.id === id) {
        return { ...item, qty: newQty };
      }
      return item;
    })
    .filter((item) => item.qty > 0);
  saveCart(cart);
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
}

// ---------- render cart drawer ----------
function renderCart() {
  const container = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  const freeShipText = document.getElementById("freeShipText");
  const freeShipFill = document.getElementById("freeShipFill");

  const cart = getCart();
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    if (subtotalEl) subtotalEl.textContent = "$0";
    if (freeShipText) freeShipText.textContent = "Free shipping over $50";
    if (freeShipFill) freeShipFill.style.width = "0%";
    return;
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  container.innerHTML = cart
    .map((item) => {
      const itemTotal = ((item.price || 0) * (item.qty || 1)).toFixed(2);
      return `
        <div class="cart-item" data-id="${item.id}">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" class="cart-item-img" />`
              : ""
          }
          <div class="cart-item-body">
            <div class="cart-item-top">
              <span class="cart-item-name">${item.name}</span>
              <button class="cart-remove" data-id="${item.id}">Remove</button>
            </div>
            <div class="cart-item-bottom">
              <div class="qty-control" data-id="${item.id}">
                <button class="qty-btn qty-minus" data-id="${item.id}">−</button>
                <span class="qty-display">${item.qty || 1}</span>
                <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
              </div>
              <span class="cart-item-price">$${itemTotal}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  // subtotal
  if (subtotalEl) {
    subtotalEl.textContent = "$" + subtotal.toFixed(2);
  }

  // free shipping progress
  if (freeShipText && freeShipFill) {
    if (subtotal >= FREE_SHIP_TARGET) {
      freeShipText.textContent = "You’ve earned free US shipping!";
      freeShipFill.style.width = "100%";
      freeShipFill.style.backgroundColor = "#3a5e38";
    } else {
      const remaining = FREE_SHIP_TARGET - subtotal;
      freeShipText.textContent = `Spend $${remaining.toFixed(
        2
      )} more to get free shipping`;
      const pct = Math.min(100, Math.round((subtotal / FREE_SHIP_TARGET) * 100));
      freeShipFill.style.width = pct + "%";
      freeShipFill.style.backgroundColor = "#b9a76b";
    }
  }
}

// ---------- attach handlers ----------
document.addEventListener("DOMContentLoaded", () => {
  // initial render
  renderCart();

  // open/close
  const cartIcon = document.getElementById("cart-icon");
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  const closeBtn = document.getElementById("closeCart");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeCartDrawer());
  }

  const overlay = document.getElementById("cartOverlay");
  if (overlay) {
    overlay.addEventListener("click", () => closeCartDrawer());
  }

  // delegate clicks inside cart
  const itemsWrap = document.getElementById("cartItems");
  if (itemsWrap) {
    itemsWrap.addEventListener("click", (e) => {
      const target = e.target;
      // remove
      if (target.matches(".cart-remove")) {
        const id = target.getAttribute("data-id");
        const row = target.closest(".cart-item");
        if (row) {
          row.style.opacity = "0";
          setTimeout(() => {
            removeFromCart(id);
          }, 350);
        } else {
          removeFromCart(id);
        }
      }
      // increase
      if (target.matches(".qty-plus")) {
        const id = target.getAttribute("data-id");
        const cart = getCart();
        const item = cart.find((i) => i.id === id);
        if (item) {
          updateQty(id, (item.qty || 1) + 1);
        }
      }
      // decrease
      if (target.matches(".qty-minus")) {
        const id = target.getAttribute("data-id");
        const cart = getCart();
        const item = cart.find((i) => i.id === id);
        if (item) {
          updateQty(id, (item.qty || 1) - 1);
        }
      }
    });
  }

  // buttons on page with data-add-to-cart
  document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id") || "tooth-powder";
      const name =
        btn.getAttribute("data-name") || "Rooted Smile ToothMagic Powder";
      const price = parseFloat(btn.getAttribute("data-price") || "38");
      const image = btn.getAttribute("data-image") || "/product.png";

      addToCart({
        id,
        name,
        price,
        image,
        qty: 1,
      });
    });
  });
});

// so other tabs/pages can re-render
window.addEventListener("cartUpdated", renderCart);
