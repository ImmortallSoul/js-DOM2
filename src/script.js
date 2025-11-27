const gallery = document.getElementById("gallery");
const themeBtn = document.getElementById("toggleTheme");

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

loadImages();
const accountBtn = document.getElementById("accountBtn");
const modal = document.getElementById("authModal");
const closeModal = document.querySelector(".close-modal");
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const profileSection = document.getElementById("profileSection");

const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function updateHeaderUI() {
  const rightSection = document.querySelector(".right");
  
  const oldAvatar = document.getElementById("headerAvatarImg");
  const oldIcon = document.getElementById("accountBtn");
  
  if (currentUser && currentUser.photo) {
    if (oldIcon) oldIcon.style.display = "none";
    
    if (!oldAvatar) {
        const img = document.createElement("img");
        img.src = currentUser.photo;
        img.className = "header-avatar";
        img.id = "headerAvatarImg";
        img.onclick = () => openModal();
        rightSection.appendChild(img);
    } else {
        oldAvatar.src = currentUser.photo;
        oldAvatar.style.display = "block";
    }
  } else {
    if (oldAvatar) oldAvatar.style.display = "none";
    if (oldIcon) oldIcon.style.display = "block";
  }
}

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
  
  document.getElementById("editUsername").value = currentUser.username;
  document.getElementById("editBio").value = currentUser.bio || "";
  document.getElementById("profileImageDisplay").src = currentUser.photo || "https://via.placeholder.com/100";
}

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.find(u => u.username === username)) {
    alert("Такий користувач вже існує!");
    return;
  }

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

document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateHeaderUI();
  showLogin();
});

document.getElementById("editProfileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newBio = document.getElementById("editBio").value;
  
  currentUser.bio = newBio;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const index = users.findIndex(u => u.username === currentUser.username);
  if (index !== -1) {
    users[index] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  alert("Інформацію збережено!");
});

const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");

changePhotoBtn.addEventListener("click", () => photoInput.click());

photoInput.addEventListener("change", function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const base64Image = e.target.result;
      
      document.getElementById("profileImageDisplay").src = base64Image;
      
      currentUser.photo = base64Image;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const index = users.findIndex(u => u.username === currentUser.username);
      if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem("users", JSON.stringify(users));
      }

      updateHeaderUI();
    };
    
    reader.readAsDataURL(file);
  }
});

updateHeaderUI();