// Cart Open Close
let cartIcon = document.querySelector("#cart-icon");
let cart = document.querySelector(".cart");
let closeCart = document.querySelector("#close-cart");

cartIcon.onclick = () => cart.classList.add("active");
closeCart.onclick = () => cart.classList.remove("active");

// Jalankan saat DOM sudah siap
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

// Format Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

// Main Function
function ready() {
  document.querySelectorAll(".cart-remove").forEach(btn =>
    btn.addEventListener("click", removeCartItem)
  );

  document.querySelectorAll(".cart-quantity").forEach(input =>
    input.addEventListener("change", quantityChanged)
  );

  document.querySelectorAll(".add-cart").forEach(btn =>
    btn.addEventListener("click", addCartClicked)
  );

  loadCartItems();
}

// Remove Item
function removeCartItem(e) {
  e.target.parentElement.remove();
  updatetotal();
  saveCartItems();
  updateCartIcon();
}

// Quantity Changed
function quantityChanged(e) {
  let input = e.target;
  if (isNaN(input.value) || input.value <= 0) input.value = 1;
  updatetotal();
  saveCartItems();
  updateCartIcon();
}

// Add to Cart
function addCartClicked(e) {
  let button = e.target;
  let shopProduct = button.closest(".product-box");
  let title = shopProduct.querySelector(".product-title").innerText;
  let price = shopProduct.querySelector(".price").innerText;
  let productImg = shopProduct.querySelector(".product-img").src;

  addProductToCart(title, price, productImg);
  updatetotal();
  saveCartItems();
  updateCartIcon();
}

function addProductToCart(title, price, productImg) {
  let cartItems = document.querySelector(".cart-content");
  let cartItemsNames = cartItems.getElementsByClassName("cart-product-title");

  for (let itemName of cartItemsNames) {
    if (itemName.innerText === title) {
      alert("Produk ini sudah ada di keranjang.");
      return;
    }
  }

  let rawPrice = parseInt(price.replace(/\D/g, ""));
  let formattedPrice = formatRupiah(rawPrice);

  let cartBox = document.createElement("div");
  cartBox.classList.add("cart-box");
  cartBox.innerHTML = `
    <img src="${productImg}" alt="" class="cart-img" />
    <div class="detail-box">
        <div class="cart-product-title">${title}</div>
        <div class="cart-price">${formattedPrice}</div>
        <input type="number" value="1" class="cart-quantity" />
    </div>
    <i class="bx bx-trash-alt cart-remove"></i>
  `;

  cartItems.appendChild(cartBox);

  cartBox.querySelector(".cart-remove").addEventListener("click", removeCartItem);
  cartBox.querySelector(".cart-quantity").addEventListener("change", quantityChanged);

  saveCartItems();
  updateCartIcon();
}

// Update Total
function updatetotal() {
  let total = 0;
  document.querySelectorAll(".cart-box").forEach(cartBox => {
    let priceText = cartBox.querySelector(".cart-price").innerText;
    let quantity = parseInt(cartBox.querySelector(".cart-quantity").value);
    let rawPrice = parseInt(priceText.replace(/\D/g, ""));
    total += rawPrice * quantity;
  });

  document.querySelector(".total-price").innerText = formatRupiah(total);
  localStorage.setItem("cartTotal", total);
}

// Save & Load Cart
function saveCartItems() {
  let cartItems = [];
  document.querySelectorAll(".cart-box").forEach(cartBox => {
    cartItems.push({
      title: cartBox.querySelector(".cart-product-title").innerText,
      price: cartBox.querySelector(".cart-price").innerText,
      quantity: cartBox.querySelector(".cart-quantity").value,
      productImg: cartBox.querySelector(".cart-img").src,
    });
  });

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function loadCartItems() {
  let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

  for (let item of cartItems) {
    addProductToCart(item.title, item.price, item.productImg);

    // Ambil cart-box terakhir yang baru ditambahkan
    let cartBoxes = document.querySelectorAll(".cart-box");
    let lastCartBox = cartBoxes[cartBoxes.length - 1];

    // Set quantity sesuai data
    lastCartBox.querySelector(".cart-quantity").value = item.quantity;
  }

  let cartTotal = localStorage.getItem("cartTotal");
  if (cartTotal) {
    document.querySelector(".total-price").innerText = formatRupiah(cartTotal);
  }

  updateCartIcon();
}

// Update Cart Icon
function updateCartIcon() {
  let quantity = 0;
  document.querySelectorAll(".cart-box").forEach(cartBox => {
    quantity += parseInt(cartBox.querySelector(".cart-quantity").value);
  });

  cartIcon.setAttribute("data-quantity", quantity);
}

// =============================
// Copy Menu for Mobile
document.addEventListener("DOMContentLoaded", function () {
  var dptCategory = document.querySelector(".dpt-cat");
  var dptPlace = document.querySelector(".departments");
  if (dptCategory && dptPlace) dptPlace.innerHTML = dptCategory.innerHTML;

  var mainNav = document.querySelector(".header-nav nav");
  var navPlace = document.querySelector(".off-canvas nav");
  if (mainNav && navPlace) navPlace.innerHTML = mainNav.innerHTML;

  var topNav = document.querySelector(".header-top .wrapper");
  var topPlace = document.querySelector(".off-canvas .thetop-nav");
  if (topNav && topPlace) topPlace.innerHTML = topNav.innerHTML;
});

// =============================
// Mobile Menu Toggle
const menuButton = document.querySelector(".trigger"),
  closeButton = document.querySelector(".t-close"),
  site = document.querySelector(".site");

menuButton?.addEventListener("click", () => site.classList.toggle("showmenu"));
closeButton?.addEventListener("click", () => site.classList.remove("showmenu"));

// Sub Menu
document.querySelectorAll(".has-child .icon-small").forEach(menu =>
  menu.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll(".has-child").forEach(item =>
      item !== this.closest(".has-child") ? item.classList.remove("expand") : null
    );
    this.closest(".has-child").classList.toggle("expand");
  })
);

// Search Toggle
document.querySelector(".t-search")?.addEventListener("click", () =>
  site.classList.toggle("showsearch")
);
document.querySelector(".search-close")?.addEventListener("click", () =>
  site.classList.remove("showsearch")
);

// Department Menu
document.querySelector(".dpt-cat .dpt-trigger")?.addEventListener("click", () =>
  site.classList.toggle("showdpt")
);

// Stock Bars
document.querySelectorAll(".products .stock").forEach(stockEl => {
  const stock = stockEl.dataset.stock;
  const available = stockEl.querySelector(".qty-available")?.innerText || 0;
  const sold = stockEl.querySelector(".qty-sold")?.innerText || 0;
  const percent = (sold * 100) / stock;
  stockEl.querySelector(".available").style.width = percent + "%";
});

// Show Mini Cart
const miniCart = document.querySelector(".mini-cart");
document.querySelector(".cart-trigger")?.addEventListener("click", () => {
  setTimeout(() => {
    if (!miniCart.classList.contains("show")) miniCart.classList.add("show");
  }, 250);
});
// =============================
// ✅ Checkout: Kosongkan keranjang setelah order
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  if (confirm("Apakah Anda yakin ingin menyelesaikan pesanan?")) {
    // Hapus isi keranjang di tampilan
    document.querySelector(".cart-content").innerHTML = "";

    // Reset total dan data tersimpan
    document.querySelector(".total-price").innerText = formatRupiah(0);
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartTotal");

    // Update ikon keranjang
    updateCartIcon();

    // Tampilkan notifikasi
    alert("Terima kasih! Pesanan Anda berhasil dibuat.");
  }
});
