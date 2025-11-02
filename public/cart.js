// Rooted Smile cart
const CART_KEY = 'rs_cart';
const FREE_SHIP_THRESHOLD = 50;

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount(cart);
}

function updateCartCount(cart) {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  if (totalQty > 0) {
    countEl.textContent = totalQty;
    countEl.style.display = 'inline-block';
  } else {
    countEl.style.display = 'none';
  }
}

function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('active');
  renderCart();
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('active');
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(p => p.id === item.id);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  renderCart();
  openCart(); // auto open like Ranavat
}

function removeFromCart(id) {
  let cart = getCart().filter(p => p.id !== id);
  saveCart(cart);
  renderCart();
}

function updateQty(id, newQty) {
  let cart = getCart();
  const item = cart.find(p => p.id === id);
  if (item) {
    item.qty = Math.max(1, newQty);
  }
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const freeShipText = document.getElementById('freeShipText');
  const freeShipFill = document.getElementById('freeShipFill');

  if (!container) return;

  container.innerHTML = '';

  let subtotal = 0;

  if (cart.length === 0) {
    container.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
  } else {
    cart.forEach(item => {
      const lineTotal = item.price * item.qty;
      subtotal += lineTotal;

      const row = document.createElement('div');
      row.className = 'cart-line';
      row.innerHTML = `
        <div class="cart-line-info">
          <p class="cart-line-name">${item.name}</p>
          <p class="cart-line-price">$${item.price.toFixed(2)}</p>
          <div class="cart-qty">
            <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
            <button class="remove-line" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  if (subtotalEl) {
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  }

  // free shipping progress
  const pct = Math.min((subtotal / FREE_SHIP_THRESHOLD) * 100, 100);
  if (freeShipFill) {
    freeShipFill.style.width = pct + '%';
  }
  if (freeShipText) {
    if (subtotal >= FREE_SHIP_THRESHOLD) {
      freeShipText.textContent = "You’ve earned free shipping! 🎉";
    } else {
      const diff = (FREE_SHIP_THRESHOLD - subtotal).toFixed(2);
      freeShipText.textContent = `Add $${diff} more to get free shipping.`;
    }
  }

  updateCartCount(cart);
}

// attach UI events once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // header cart icon
  document.getElementById('cart-icon')?.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  });

  document.getElementById('closeCart')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

  // listen for +/-/remove inside drawer
  document.getElementById('cartItems')?.addEventListener('click', (e) => {
    const btn = e.target;
    if (btn.matches('.qty-btn')) {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const cart = getCart();
      const item = cart.find(p => p.id === id);
      if (!item) return;
      if (action === 'plus') item.qty += 1;
      if (action === 'minus') item.qty = Math.max(1, item.qty - 1);
      saveCart(cart);
      renderCart();
    }
    if (btn.matches('.remove-line')) {
      const id = btn.getAttribute('data-id');
      removeFromCart(id);
    }
  });

  // find all "add to cart" buttons on page
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id') || 'tooth-powder';
      const name = btn.getAttribute('data-name') || 'Rooted Smile ToothMagic Powder';
      const price = parseFloat(btn.getAttribute('data-price') || '38');
      addToCart({
        id,
        name,
        price,
        qty: 1
      });
    });
  });

  // initial render on page load
  renderCart();
});
