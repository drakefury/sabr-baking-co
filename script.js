const products = [
  {
    id: 'sourdough',
    name: 'Classic Sourdough',
    price: 8.5,
    description: 'Slow-fermented loaf with a crisp crust and tangy, airy center.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'brioche',
    name: 'Brioche Loaf',
    price: 9.75,
    description: 'Buttery, soft, and perfect for breakfast toast or French toast.',
    image: 'https://images.squarespace-cdn.com/content/v1/69c3028010e2c44571196015/ea4c3ffa-c004-4f13-8ef7-430308f41e0c/Brioche%2BLoaf.png'
  },
  {
    id: 'multigrain',
    name: 'Seeded Multigrain',
    price: 10.25,
    description: 'A hearty loaf packed with seeds, grains, and a nutty finish.',
    image: 'https://129528774.cdn6.editmysite.com/uploads/1/2/9/5/129528774/WTPW7IO6R2LGDFNOFLI2RJYU.jpeg?optimize=medium&width=2400'
  },
  {
    id: 'cinnamon',
    name: 'Cinnamon Swirl',
    price: 11.0,
    description: 'Sweet, soft, and perfectly spiced for a cozy morning treat.',
    image: 'https://itsonly.recipes/images/recipeimages/old-fashioned-cinnamon-bread.webp'
  },
  {
    id: 'olive',
    name: 'Olive Rosemary',
    price: 10.5,
    description: 'Savory and aromatic with a rustic finish perfect with soup or pasta.',
    image: 'https://www.argeta.com/_next/image?q=75&url=https%3A%2F%2Fargeta-com.cnj.digital%2Fassets%2Frecipes%2Fmediterranean-bread---cover.jpg&w=1920'
  },
  {
    id: 'rye',
    name: 'Rustic Rye',
    price: 9.5,
    description: 'Deep flavor and a chewy texture with a classic rye character.',
    image: 'https://images.squarespace-cdn.com/content/v1/5e834c37a53fed49710e00cd/b14478e2-6b5f-42f7-a681-3dedf53e5ced/Seigle%2B.jpg?format=1000w'
  }
];

const cartKey = 'sabr-baking-cart';

const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(value);

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || '[]');
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function getProductById(productId) {
  return products.find((product) => product.id === productId) || null;
}

function addToCart(productId) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  renderCart();
}

function updateQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);

  if (!item) {
    return;
  }

  item.quantity += change;
  if (item.quantity <= 0) {
    const index = cart.findIndex((entry) => entry.id === productId);
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
}

function renderProducts() {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) {
    return;
  }

  productGrid.innerHTML = products.map((product) => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <div class="product-header">
          <h3>${product.name}</h3>
          <span>${formatCurrency(product.price)}</span>
        </div>
        <p>${product.description}</p>
        <button class="btn product-btn" data-add-to-cart="${product.id}">Add to cart</button>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('subtotal');
  const deliveryEl = document.getElementById('delivery');
  const totalEl = document.getElementById('total');
  const cartCountEl = document.getElementById('cart-count');

  const cart = getCart();
  const cartDetails = cart
    .map((entry) => {
      const product = getProductById(entry.id);
      if (!product) {
        return null;
      }
      return {
        ...product,
        quantity: entry.quantity
      };
    })
    .filter(Boolean);

  const subtotal = cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = cartDetails.length > 0 ? (subtotal >= 30 ? 0 : 6) : 0;
  const total = subtotal + delivery;
  const itemCount = cartDetails.reduce((sum, item) => sum + item.quantity, 0);

  if (cartCountEl) {
    cartCountEl.textContent = String(itemCount);
  }

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (deliveryEl) deliveryEl.textContent = formatCurrency(delivery);
  if (totalEl) totalEl.textContent = formatCurrency(total);

  if (!cartItems) {
    return;
  }

  if (!cartDetails.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty. Pick a loaf to get started.</p>';
    return;
  }

  cartItems.innerHTML = cartDetails.map((item) => `
    <div class="cart-item">
      <div>
        <h4>${item.name}</h4>
        <p>${formatCurrency(item.price)} each</p>
      </div>
      <div class="cart-item-controls">
        <button type="button" class="quantity-btn" data-quantity-change="${item.id},-1" aria-label="Decrease ${item.name}">−</button>
        <span>${item.quantity}</span>
        <button type="button" class="quantity-btn" data-quantity-change="${item.id},1" aria-label="Increase ${item.name}">+</button>
      </div>
    </div>
  `).join('');
}

function handleCheckout(event) {
  event.preventDefault();

  const cart = getCart();
  if (!cart.length) {
    const message = document.getElementById('checkout-message');
    if (message) {
      message.textContent = 'Your cart is empty. Add a loaf before checking out.';
      message.classList.add('error');
    }
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = formData.get('name')?.toString().trim() || 'Friend';
  const total = document.getElementById('total')?.textContent || '$0.00';

  saveCart([]);
  form.reset();
  renderCart();

  const message = document.getElementById('checkout-message');
  if (message) {
    message.textContent = `Thank you, ${name}! Your order totaling ${total} has been placed. We’ll get your fresh bread ready soon.`;
    message.classList.remove('error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-to-cart]');
    if (addButton) {
      addToCart(addButton.dataset.addToCart);
      return;
    }

    const quantityButton = event.target.closest('[data-quantity-change]');
    if (quantityButton) {
      const [productId, change] = quantityButton.dataset.quantityChange.split(',');
      updateQuantity(productId, Number(change));
    }
  });

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckout);
  }
});
