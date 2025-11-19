document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalPriceEl = document.getElementById("total-price");
  const clearCartBtn = document.getElementById("clear-cart");

  // Загружаем корзину из localStorage
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];

  // Функция рендера корзины
  function renderCart() {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Ваша корзина пуста.</p>";
      totalPriceEl.textContent = "0 ₽";
      return;
    }

    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.quantity;

      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";

      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p>Цена: ${item.price} ₽</p>
          <p>Количество: ${item.quantity}</p>
        </div>
        <div class="cart-item-actions">
          <button class="remove-btn" data-index="${index}">Удалить</button>
        </div>
      `;

      cartItemsContainer.appendChild(cartItem);
    });

    totalPriceEl.textContent = total + " ₽";

    // Навешиваем обработчики на кнопки удаления
    const removeButtons = document.querySelectorAll(".remove-btn");
    removeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.index;
        cart.splice(idx, 1);
        localStorage.setItem("cartItems", JSON.stringify(cart));
        renderCart();
      });
    });
  }

  // Очистить корзину
  clearCartBtn.addEventListener("click", () => {
    cart = [];
    localStorage.removeItem("cartItems");
    renderCart();
  });

  renderCart();
});

// --- Добавление товаров в корзину с каталога ---
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("add-to-cart")) {
    const card = e.target.closest(".plant-card");
    if (!card) return;

    const name = card.querySelector(".plant-name").textContent;
    const priceText = card.querySelector(".plant-price").textContent;
    const price = parseFloat(priceText.replace(/\D/g, ""));
    const image = card.querySelector(".plant-image").src;

    const product = { name, price, image, quantity: 1 };

    let cart = JSON.parse(localStorage.getItem("cartItems")) || [];

    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(product);
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));

    // Визуальный эффект кнопки
    e.target.textContent = "✅ Добавлено!";
    e.target.style.backgroundColor = "#4a8f57";
    setTimeout(() => {
      e.target.textContent = " Добавить в корзину";
      e.target.style.backgroundColor = "#5fa86a";
    }, 1500);
  }
});
