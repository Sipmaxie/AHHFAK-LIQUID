// ==============================
// 📱 Copy menu ke tampilan mobile
// ==============================
function copyMenu() {
  const dptCategory = document.querySelector(".dpt-cat");
  const dptPlace = document.querySelector(".departments");
  if (dptCategory && dptPlace) dptPlace.innerHTML = dptCategory.innerHTML;

  const mainNav = document.querySelector(".header-nav nav");
  const navPlace = document.querySelector(".off-canvas nav");
  if (mainNav && navPlace) navPlace.innerHTML = mainNav.innerHTML;

  const topNav = document.querySelector(".header-top .wrapper");
  const topPlace = document.querySelector(".off-canvas .thetop-nav");
  if (topNav && topPlace) topPlace.innerHTML = topNav.innerHTML;
}
copyMenu();

// ==============================
// 🌐 Elemen global
// ==============================
const siteElement = document.querySelector(".site") || document.body;

// ==============================
// 📲 Toggle menu mobile
// ==============================
const menuButton = document.querySelector(".trigger");
const closeButton = document.querySelector(".t-close");

menuButton?.addEventListener("click", () => {
  siteElement.classList.toggle("showmenu");
});
closeButton?.addEventListener("click", () => {
  siteElement.classList.remove("showmenu");
});

// ==============================
// 📂 Submenu toggle on mobile
// ==============================
const submenu = document.querySelectorAll(".has-child .icon-small");
submenu.forEach(menu => menu.addEventListener("click", function (e) {
  e.preventDefault();
  submenu.forEach(item => {
    if (item !== this) item.closest(".has-child")?.classList.remove("expand");
  });
  this.closest(".has-child")?.classList.toggle("expand");
}));

// ==============================
// 🔎 Toggle pencarian
// ==============================
const searchButton = document.querySelector(".t-search");
const searchClose = document.querySelector(".search-close");

searchButton?.addEventListener("click", () => {
  siteElement.classList.toggle("showsearch");
});
searchClose?.addEventListener("click", () => {
  siteElement.classList.remove("showsearch");
});

// ==============================
// 🗂️ Toggle department menu
// ==============================
const dptButton = document.querySelector(".dpt-cat .dpt-trigger");
dptButton?.addEventListener("click", () => {
  siteElement.classList.toggle("showdpt");
});

// ==============================
// 🖼️ Galeri produk dengan slider (Swiper.js)
// ==============================
const productThumb = new Swiper(".small-image", {
  loop: true,
  spaceBetween: 3,
  slidesPerView: 3,
  freeMode: true,
  watchSlidesProgress: true,
  breakpoints: {
    481: {
      spaceBetween: 32
    }
  }
});

const productBig = new Swiper(".big-image", {
  loop: true,
  autoHeight: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
  },
  thumbs: {
    swiper: productThumb
  }
});

// ==============================
// 📊 Update stock bar visual
// ==============================
document.querySelectorAll(".products .stock").forEach(stockEl => {
  const stock = parseInt(stockEl.dataset.stock || "0", 10);
  const available = parseInt(stockEl.querySelector(".qty-available")?.textContent || "0", 10);
  const sold = parseInt(stockEl.querySelector(".qty-sold")?.textContent || "0", 10);
  const percent = stock ? (sold * 100) / stock : 0;

  const bar = stockEl.querySelector(".available");
  if (bar) bar.style.width = `${percent}%`;
});

// ==============================
// 🛒 Mini cart toggle
// ==============================
const miniCart = document.querySelector(".mini-cart");
const cartTrigger = document.querySelector(".cart-trigger");

cartTrigger?.addEventListener("click", () => {
  setTimeout(() => {
    miniCart?.classList.toggle("show");
  }, 250);
});

document.addEventListener("click", e => {
  if (!e.target.closest(".mini-cart") && !e.target.closest(".cart-trigger")) {
    miniCart?.classList.remove("show");
  }
});

// ==============================
// 🎉 Modal tampil saat load
// ==============================
window.onload = () => {
  siteElement.classList.add("showmodal");
};

document.querySelector(".modalclose")?.addEventListener("click", () => {
  siteElement.classList.remove("showmodal");
});

// ==============================
// 📤 Share Produk (Web Share API)
// ==============================
function shareProduct(event) {
  event.preventDefault();
  if (navigator.share) {
    navigator.share({
      title: document.title,
      text: "Lihat produk ini di AHHFAKJUICE!",
      url: window.location.href,
    })
      .then(() => console.log("✔ Berhasil dibagikan"))
      .catch(error => console.error("❌ Gagal:", error));
  } else {
    alert("Browser kamu tidak mendukung fitur share.");
  }
}

// ==============================
// 🔍 Pencarian Produk Lokal
// ==============================
document.getElementById("search-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const query = document.getElementById("search-input")?.value.toLowerCase();
  const products = document.querySelectorAll(".product-card");

  products.forEach(product => {
    const title = product.querySelector(".product-title")?.innerText.toLowerCase() || "";
    product.style.display = title.includes(query) ? "block" : "none";
  });
});
