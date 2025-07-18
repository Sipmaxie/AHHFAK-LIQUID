// ========== CART BEHAVIOR ==========

// Buka/Tutup Cart
const cartIcon = document.querySelector("#cart-icon");
const cart = document.querySelector(".cart");
const closeCart = document.querySelector("#close-cart");

cartIcon?.addEventListener("click", () => cart?.classList.add("active"));
closeCart?.addEventListener("click", () => cart?.classList.remove("active"));

// Jalankan saat DOM siap
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

// Fungsi utama saat halaman siap
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

// Tambah ke keranjang dari tombol produk
function addCartClicked(e) {
  const shopProduct = e.target.closest(".product-box");
  const title = shopProduct.querySelector(".product-title").innerText;
  const price = shopProduct.querySelector(".price").getAttribute("data-price");
  const productImg = shopProduct.querySelector(".product-img").src;

  const rawPrice = parseInt(price);
  addProductToCart(title, rawPrice, productImg);
  updateTotal();
  saveCartItems();
  updateCartIcon();
}

// Tambahkan produk ke elemen cart
function addProductToCart(title, price, productImg) {
  const cartItems = document.querySelector(".cart-content");
  const cartItemsNames = cartItems.getElementsByClassName("cart-product-title");

  for (let itemName of cartItemsNames) {
    if (itemName.innerText === title) {
      alert("Produk ini sudah ada di keranjang.");
      return;
    }
  }

  const cartBox = document.createElement("div");
  cartBox.classList.add("cart-box");
  cartBox.innerHTML = `
    <img src="${productImg}" alt="" class="cart-img" />
    <div class="detail-box">
        <div class="cart-product-title">${title}</div>
        <div class="cart-price">${formatRupiah(price)}</div>
        <input type="number" value="1" class="cart-quantity" />
    </div>
    <i class="bx bx-trash-alt cart-remove"></i>
  `;
  cartItems.appendChild(cartBox);

  cartBox.querySelector(".cart-remove").addEventListener("click", removeCartItem);
  cartBox.querySelector(".cart-quantity").addEventListener("change", quantityChanged);
}

// Hapus item
function removeCartItem(e) {
  e.target.closest(".cart-box").remove();
  updateTotal();
  saveCartItems();
  updateCartIcon();
}

// Ubah jumlah
function quantityChanged(e) {
  const input = e.target;
  if (isNaN(input.value) || input.value <= 0) input.value = 1;
  updateTotal();
  saveCartItems();
  updateCartIcon();
}

// Update total harga
function updateTotal() {
  let total = 0;
  document.querySelectorAll(".cart-box").forEach(cartBox => {
    const priceText = cartBox.querySelector(".cart-price").innerText;
    const rawPrice = parseInt(priceText.replace(/\D/g, ""));
    const quantity = parseInt(cartBox.querySelector(".cart-quantity").value);
    total += rawPrice * quantity;
  });

  document.querySelector(".total-price").innerText = formatRupiah(total);
  localStorage.setItem("cartTotal", total);
}

// Simpan ke localStorage
function saveCartItems() {
  const cartItems = [];
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

// Load item dari localStorage
function loadCartItems() {
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

  for (let item of cartItems) {
    const price = parseInt(item.price.replace(/\D/g, ""));
    addProductToCart(item.title, price, item.productImg);

    const lastCartBox = document.querySelectorAll(".cart-box").pop();
    lastCartBox.querySelector(".cart-quantity").value = item.quantity;
  }

  const cartTotal = localStorage.getItem("cartTotal");
  if (cartTotal) {
    document.querySelector(".total-price").innerText = formatRupiah(cartTotal);
  }

  updateCartIcon();
}

// Update ikon keranjang
function updateCartIcon() {
  let quantity = 0;
  document.querySelectorAll(".cart-box").forEach(cartBox => {
    quantity += parseInt(cartBox.querySelector(".cart-quantity").value);
  });

  cartIcon?.setAttribute("data-quantity", quantity);
}

// Reset keranjang saat checkout
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  if (confirm("Apakah Anda yakin ingin menyelesaikan pesanan?")) {
    document.querySelector(".cart-content").innerHTML = "";
    document.querySelector(".total-price").innerText = formatRupiah(0);
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartTotal");
    updateCartIcon();
    alert("Terima kasih! Pesanan Anda berhasil dibuat.");
  }
});
