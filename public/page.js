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
// 📲 Toggle menu mobile
// ==============================
const menuButton = document.querySelector(".trigger"),
      closeButton = document.querySelector(".t-close"),
      site = document.querySelector(".site");

menuButton?.addEventListener("click", () => site?.classList.toggle("showmenu"));
closeButton?.addEventListener("click", () => site?.classList.remove("showmenu"));

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