
// -------------------- Конфигурация Firebase --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, serverTimestamp, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZBYJpj6NXQK3wJTzuxlc89uSvnRX2q9M",
  authDomain: "sakura-3e1b4.firebaseapp.com",
  databaseURL: "https://sakura-3e1b4-default-rtdb.firebaseio.com",
  projectId: "sakura-3e1b4",
  storageBucket: "sakura-3e1b4.appspot.com",
  messagingSenderId: "951971411963",
  appId: "1:951971411963:web:68efd3c34028b226e43d5e",
  measurementId: "G-73H20DNNWY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// -------------------- Проверка администратора --------------------
const allowedAdmins = ["Khalimovp02@gmail.com", "rustam.n1822@gmail.com"];
const userEmail = localStorage.getItem("userEmail");
const isAdmin = allowedAdmins.includes(userEmail);

// -------------------- Элементы DOM --------------------
const modal = document.getElementById("modal");
const addBtn = document.getElementById("add-new-btn");
const cancelBtn = document.getElementById("cancel-btn");
const form = document.getElementById("add-plant-form");
const catalog = document.querySelector(".catalog");

// -------------------- Скрытие кнопок для не-админов --------------------
if (!isAdmin) {
  document.querySelectorAll(".edit-btn, .delete-btn, #add-new-btn").forEach(btn => {
    btn.style.display = "none";
  });
}

// -------------------- Функция добавления растения в Firestore --------------------
async function addPlantToFirestore(name, price, desc, file) {
  try {
    const storageRef = ref(storage, `plants/${file.name}`);
    await uploadBytes(storageRef, file);
    const imgURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, "plants"), {
      name,
      price,
      description: desc,
      image: imgURL,
      createdAt: serverTimestamp()
    });

    return imgURL;
  } catch (error) {
    console.error("Ошибка при добавлении:", error);
  }
}

// -------------------- Загрузка растений из Firestore --------------------
async function loadPlants() {
  const snapshot = await getDocs(collection(db, "plants"));
  snapshot.forEach(doc => {
    const data = doc.data();
    addPlantCard(data.name, data.price, data.description, data.image);
  });
}

// -------------------- Создание карточки растения --------------------
function addPlantCard(name, price, desc, imgURL) {
  const newCard = document.createElement("div");
  newCard.className = "plant-card";
  newCard.innerHTML = `
    <img src="${imgURL}" alt="${name}" class="plant-image" />
    <div class="plant-info">
      <div class="plant-name">${name}</div>
      <div class="plant-price">${price}</div>
      <p class="description">${desc}</p>
    </div>
    <div class="actions">
      ${isAdmin ? `<button class="edit-btn">Редактировать</button>
      <button class="delete-btn">Удалить</button>` : ''}
      <button class="add-to-cart"> Добавить в корзину</button>
    </div>
  `;
  const addNewCard = document.querySelector(".add-new-card");
  catalog.insertBefore(newCard, addNewCard);
}

// -------------------- Обработчики событий через делегирование --------------------
document.addEventListener("click", async (e) => {
  const card = e.target.closest(".plant-card");
  if (!card) return;

  // Удаление
  if (isAdmin && e.target.classList.contains("delete-btn")) {
    if (confirm("Удалить это растение?")) card.remove();
  }

  // Редактирование
  if (isAdmin && e.target.classList.contains("edit-btn")) {
    const nameEl = card.querySelector(".plant-name");
    const priceEl = card.querySelector(".plant-price");
    const descEl = card.querySelector(".description");

    const newName = prompt("Введите новое название:", nameEl.textContent);
    if (newName) nameEl.textContent = newName;

    const newPrice = prompt("Введите новую цену:", priceEl.textContent);
    if (newPrice) priceEl.textContent = newPrice;

    if (descEl) {
      const newDesc = prompt("Введите новое описание:", descEl.textContent);
      if (newDesc) descEl.textContent = newDesc;
    }
  }

  // Добавление в корзину
  if (e.target.classList.contains("add-to-cart")) {
    const name = card.querySelector(".plant-name").textContent;
    const priceText = card.querySelector(".plant-price").textContent;
    const price = parseFloat(priceText.replace(/\D/g, ""));
    const image = card.querySelector(".plant-image").src;

    const product = { name, price, image, quantity: 1 };
    let cart = JSON.parse(localStorage.getItem("cartItems")) || [];

    const existing = cart.find(item => item.name === name);
    if (existing) existing.quantity += 1;
    else cart.push(product);

    localStorage.setItem("cartItems", JSON.stringify(cart));

    // Визуальный эффект кнопки
    e.target.textContent = " Добавлено!";
    e.target.style.backgroundColor = "#4a8f57";
    setTimeout(() => {
      e.target.textContent = " Добавить в корзину";
      e.target.style.backgroundColor = "#5fa86a";
    }, 1500);
  }
});

// -------------------- Работа с модальным окном добавления --------------------
if (isAdmin && addBtn && cancelBtn && form) {
  addBtn.addEventListener("click", () => (modal.style.display = "flex"));
  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    form.reset();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form["plant-name"].value.trim();
    const price = form["plant-price"].value.trim();
    const desc = form["plant-desc"].value.trim();
    const file = form["plant-img"].files[0];
    if (!file) return alert("Выберите изображение!");

    const imgURL = await addPlantToFirestore(name, price, desc, file);
    addPlantCard(name, price, desc, imgURL);

    modal.style.display = "none";
    form.reset();
  });
}

// -------------------- Инициализация --------------------
document.addEventListener("DOMContentLoaded", loadPlants);

const plants = [
  { name: "Фикус", description: "Популярное комнатное растение" },
  { name: "Сансевиерия", description: "Неприхотливое растение для офиса" },
  { name: "Монстера", description: "Эффектные листья, любит свет" },
  { name: "Папоротник", description: "Тенелюбивое, декоративное растение" }
];

const catalogContainer = document.getElementById("catalog");

function renderCatalog(filteredPlants) {
  catalogContainer.innerHTML = "";
  filteredPlants.forEach((plant) => {
    const card = document.createElement("div");
    card.classList.add("plant-card");
    card.innerHTML = `
      <h3>${plant.name}</h3>
      <p>${plant.description}</p>
      <button class="add-to-cart">Добавить в корзину</button>
    `;
    catalogContainer.appendChild(card);
  });
}


(function () {
  const LOG_PREFIX = '[catalog.js]';

  function log(...args) { console.info(LOG_PREFIX, ...args); }
  function warn(...args) { console.warn(LOG_PREFIX, ...args); }
  function err(...args) { console.error(LOG_PREFIX, ...args); }

  function normalizeText(str = "") {
    return str
      .toString()
      .normalize('NFD')                       // разделяет буквы и диакритику
      .replace(/\p{Diacritic}/gu, '')         // убирает диакритику
      .replace(/\s+/g, ' ')                   // сжать пробелы
      .trim()
      .toLowerCase();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const catalog = document.querySelector(".catalog");
    

    if (!searchInput) {
      err("Не найден элемент #searchInput. Проверь id в HTML.");
      return;
    }
    if (!catalog) {
      err("Не найден элемент .catalog. Проверь разметку.");
      return;
    }
    
    log("Найден input и catalog.");

    function getCards() {
      return Array.from(catalog.querySelectorAll(".plant-card"));
    }

    function showCard(card) {
      card.style.display = "";
      card.classList.remove("hidden-by-search");
    }
    function hideCard(card) {
      card.classList.add("hidden-by-search");
      setTimeout(() => {
        if (card.classList.contains("hidden-by-search")) card.style.display = "none";
      }, 220);
    }

    function ensureNotFoundMessage(show) {
      let nf = document.getElementById("not-found-msg");
      if (show) {
        if (!nf) {
          nf = document.createElement("div");
          nf.id = "not-found-msg";
          nf.textContent = "Ничего не найдено ";
          nf.style.textAlign = "center";
          nf.style.margin = "20px";
          nf.style.fontSize = "18px";
          catalog.appendChild(nf);
        }
      } else {
        if (nf) nf.remove();
      }
    }

    // Основная фильтрация
    function filterPlants() {
      const raw = searchInput.value || "";
      const query = normalizeText(raw);
      const cards = getCards();

      log(`Фильтрация: "${raw}" → "${query}" (карточек: ${cards.length})`);

      if (query === "") {
        // пустой запрос — показываем все
        cards.forEach(showCard);
        ensureNotFoundMessage(false);
        return;
      }

      let any = false;
      for (const card of cards) {
        const nameEl = card.querySelector(".plant-name");
        const descEl = card.querySelector(".description");
        const name = normalizeText(nameEl?.textContent || "");
        const desc = normalizeText(descEl?.textContent || "");

        if (name.includes(query) || desc.includes(query)) {
          showCard(card);
          any = true;
        } else {
          hideCard(card);
        }
      }

      ensureNotFoundMessage(!any);
    }
    
    // debounce
    let timer = null;
    const debounceMs = 150;
    function scheduleFilter() {
      clearTimeout(timer);
      timer = setTimeout(filterPlants, debounceMs);
    }

    // Подписка на ввод
    searchInput.addEventListener("input", scheduleFilter);

    // Фильтрация по Enter (если нужно)
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        filterPlants();
      }
    });

    // Если карточки могут добавляться динамически — следим и обновляем (MutationObserver)
    const mo = new MutationObserver((mutations) => {
      // Если изменился список карточек, пересчитаем — но не запускаем фильтрацию слишком часто
      let shouldRun = false;
      for (const m of mutations) {
        if (m.addedNodes?.length || m.removedNodes?.length) {
          shouldRun = true;
          break;
        }
      }
      if (shouldRun) scheduleFilter();
    });
    mo.observe(catalog, { childList: true, subtree: true });

    // Первичный запуск
    filterPlants();

    log("Инициализация поиска завершена.");
  });
  renderCatalog(plants);
})();







