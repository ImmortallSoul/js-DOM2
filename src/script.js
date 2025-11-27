// ================= ГАЛЕРЕЯ ТА ТЕМА =================

const gallery = document.getElementById("gallery");
const themeBtn = document.getElementById("toggleTheme");

// 1. Перевірка збереженої теми
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-theme");
  document.body.classList.remove("dark-theme");
  themeBtn.textContent = "light_mode";
} else {
  document.body.classList.add("dark-theme");
  document.body.classList.remove("light-theme");
  themeBtn.textContent = "dark_mode";
}

// 2. Логіка завантаження зображень
async function loadImages(count = 4) {
  const randomPage = Math.floor(Math.random() * 100) + 1;
  try {
    const response = await fetch(
      `https://picsum.photos/v2/list?page=${randomPage}&limit=${count}`
    );
    const data = await response.json();
    data.forEach(img => {
      const image = document.createElement("img");
      image.src = `https://picsum.photos/id/${img.id}/500/400`;
      gallery.appendChild(image);
    });
  } catch (error) {
    console.error("Помилка:", error);
  }
}

// Слухачі для кнопок галереї
document.getElementById("loadMore").addEventListener("click", () => loadImages());
document.getElementById("clear").addEventListener("click", () => gallery.innerHTML = "");
document.getElementById("deleteLast").addEventListener("click", () => {
  const imgs = gallery.querySelectorAll("img");
  if (imgs.length > 0) imgs[imgs.length - 1].remove();
});
document.getElementById("reverse").addEventListener("click", () => {
  const items = Array.from(gallery.children).reverse();
  gallery.innerHTML = "";
  items.forEach(item => gallery.appendChild(item));
});

// Слухач теми
themeBtn.addEventListener("click", () => {
  if (document.body.classList.contains("dark-theme")) {
    document.body.classList.replace("dark-theme", "light-theme");
    themeBtn.textContent = "light_mode";
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.replace("light-theme", "dark-theme");
    themeBtn.textContent = "dark_mode";
    localStorage.setItem("theme", "dark");
  }
});

// Запуск галереї
loadImages();


// ================= СИСТЕМА АКАУНТІВ =================

// Елементи DOM
const accountBtn = document.getElementById("accountBtn");
const modal = document.getElementById("authModal");
const closeModal = document.querySelector(".close-modal");
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const profileSection = document.getElementById("profileSection");

// Кнопки перемикання форм
const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");

// Стан користувача (CurrentUser)
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// Функція оновлення інтерфейсу (header icon)
function updateHeaderUI() {
  const rightSection = document.querySelector(".right");
  
  // Видаляємо стару іконку або фото, якщо вони є, крім кнопки теми
  const oldAvatar = document.getElementById("headerAvatarImg");
  const oldIcon = document.getElementById("accountBtn");
  
  if (currentUser && currentUser.photo) {
    // Якщо користувач увійшов і має фото
    if (oldIcon) oldIcon.style.display = "none";
    
    // Перевіряємо чи вже є аватарка, якщо ні - створюємо
    if (!oldAvatar) {
        const img = document.createElement("img");
        img.src = currentUser.photo;
        img.className = "header-avatar";
        img.id = "headerAvatarImg";
        img.onclick = () => openModal(); // Клік відкриває модалку
        rightSection.appendChild(img);
    } else {
        oldAvatar.src = currentUser.photo;
        oldAvatar.style.display = "block";
    }
  } else {
    // Якщо не увійшов або немає фото - показуємо стандартну іконку
    if (oldAvatar) oldAvatar.style.display = "none";
    if (oldIcon) oldIcon.style.display = "block";
  }
}

// === ЛОГІКА МОДАЛЬНОГО ВІКНА ===
function openModal() {
  modal.style.display = "block";
  if (currentUser) {
    showProfile();
  } else {
    showLogin();
  }
}

accountBtn.addEventListener("click", openModal);
closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Перемикання екранів всередині модалки
showRegisterBtn.addEventListener("click", () => {
  loginSection.style.display = "none";
  registerSection.style.display = "block";
});

showLoginBtn.addEventListener("click", showLogin);

function showLogin() {
  loginSection.style.display = "block";
  registerSection.style.display = "none";
  profileSection.style.display = "none";
}

function showProfile() {
  loginSection.style.display = "none";
  registerSection.style.display = "none";
  profileSection.style.display = "block";
  
  // Заповнюємо дані
  document.getElementById("editUsername").value = currentUser.username;
  document.getElementById("editBio").value = currentUser.bio || "";
  document.getElementById("profileImageDisplay").src = currentUser.photo || "https://via.placeholder.com/100";
}

// === РЕЄСТРАЦІЯ ===
document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  // Отримуємо всіх користувачів
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Перевірка чи існує такий логін
  if (users.find(u => u.username === username)) {
    alert("Такий користувач вже існує!");
    return;
  }

  // Створюємо нового користувача
  const newUser = {
    username: username,
    password: password,
    bio: "",
    photo: null
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  
  alert("Реєстрація успішна! Тепер увійдіть.");
  showLogin();
});

// === ВХІД ===
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const foundUser = users.find(u => u.username === username && u.password === password);

  if (foundUser) {
    currentUser = foundUser;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    updateHeaderUI();
    showProfile();
  } else {
    alert("Невірний логін або пароль");
  }
});

// === ВИХІД ===
document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateHeaderUI();
  showLogin();
});

// === РЕДАГУВАННЯ ІНФОРМАЦІЇ ===
document.getElementById("editProfileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newBio = document.getElementById("editBio").value;
  
  // Оновлюємо поточного юзера
  currentUser.bio = newBio;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Оновлюємо масив усіх юзерів
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const index = users.findIndex(u => u.username === currentUser.username);
  if (index !== -1) {
    users[index] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  alert("Інформацію збережено!");
});

// === ФОТО ПРОФІЛЮ (Base64) ===
const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");

changePhotoBtn.addEventListener("click", () => photoInput.click());

photoInput.addEventListener("change", function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const base64Image = e.target.result; // Конвертуємо картинку в текст
      
      // Оновлюємо UI
      document.getElementById("profileImageDisplay").src = base64Image;
      
      // Зберігаємо в currentUser
      currentUser.photo = base64Image;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      
      // Зберігаємо в загальній базі
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const index = users.findIndex(u => u.username === currentUser.username);
      if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem("users", JSON.stringify(users));
      }

      updateHeaderUI(); // Оновлюємо іконку в хедері
    };
    
    reader.readAsDataURL(file);
  }
});

// Ініціалізація іконки при завантаженні
updateHeaderUI();