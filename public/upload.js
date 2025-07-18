let editingImageUrl = null;
let allProducts = [];

// ✅ Format Harga ke Rupiah
function formatRupiah(value) {
  const num = typeof value === "number" ? value : parseInt(value);
  const final = isNaN(num) ? 0 : (num < 1000 ? num * 1000 : num);
  return final.toLocaleString("id-ID");
}

// ✅ Submit Form (Upload / Edit)
document.getElementById("productForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  if (editingImageUrl) {
    formData.append("originalImageUrl", editingImageUrl);
  }

  try {
    const endpoint = editingImageUrl ? "/edit-product" : "/upload-product";
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("RESPON GAGAL:", text);
      throw new Error("Upload gagal. Status: " + res.status);
    }

    const result = await res.json();
    alert(result.success ? (editingImageUrl ? "Produk berhasil diupdate!" : "Produk berhasil diupload!") : result.message);
    
    this.reset();
    editingImageUrl = null;
    resetPreview();
    loadProducts();

  } catch (err) {
    console.error("Upload error:", err);
    alert("Terjadi kesalahan saat menyimpan produk.");
  }
});

// ✅ Load Semua Produk dari Server
async function loadProducts() {
  try {
    const res = await fetch("/api/products", { credentials: "include" });
    if (!res.ok) throw new Error("Gagal memuat produk.");
    allProducts = await res.json();
    applyFilters();
  } catch (err) {
    console.error("Load error:", err);
    document.getElementById("productList").innerHTML = "<p>Gagal memuat produk.</p>";
  }
}

// ✅ Render Produk
function renderProductList(products) {
  const list = document.getElementById("productList");
  list.innerHTML = products.length === 0
    ? "<p>Tidak ada produk ditemukan.</p>"
    : products.map(p => `
      <div class="product-card">
        <img src="${p.imageUrl || p.images?.[0]}" loading="lazy" />
        <h3>${p.name}</h3>
        <p>Rp ${formatRupiah(p.price)}</p>
        <span class="badge">${p.category || "Tanpa Kategori"}</span>
        <small>${p.description}</small><br>
        <button onclick="editProduct('${encodeURIComponent(p.imageUrl || p.images?.[0])}')">Edit</button>
        <button onclick="deleteProduct('${encodeURIComponent(p.imageUrl || p.images?.[0])}')">Hapus</button>
      </div>
    `).join("");
}

// ✅ Prefill Form saat Edit
function editProduct(imageUrl) {
  imageUrl = decodeURIComponent(imageUrl);
  const product = allProducts.find(p => p.imageUrl === imageUrl || p.images?.[0] === imageUrl);
  if (!product) return;

  document.querySelector('input[name="name"]').value = product.name;
  document.querySelector('input[name="price"]').value = product.price;
  document.querySelector('textarea[name="description"]').value = product.description;
  document.querySelector('select[name="category"]').value = product.category;
  editingImageUrl = product.imageUrl || product.images?.[0];

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ✅ Hapus Produk
async function deleteProduct(imageUrl) {
  imageUrl = decodeURIComponent(imageUrl);
  if (!confirm("Yakin ingin menghapus produk ini?")) return;

  try {
    const res = await fetch("/delete-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ imageUrl }),
    });

    const result = await res.json();
    if (result.success) {
      alert("Produk berhasil dihapus.");
      loadProducts();
    } else {
      alert(result.message || "Gagal menghapus produk.");
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Terjadi kesalahan saat menghapus.");
  }
}

// ✅ Filter Produk
function applyFilters() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const selectedCategory = document.getElementById("filterCategory").value;

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(keyword) &&
    (selectedCategory === "" || p.category === selectedCategory)
  );

  renderProductList(filtered);
}

// ✅ Preview Gambar
document.getElementById("imageInput")?.addEventListener("change", function () {
  const files = this.files;
  const previewContainer = document.getElementById("previewImageContainer");
  const label = document.querySelector(".file-label");

  previewContainer.innerHTML = "";
  label.textContent = files.length > 0 ? `✔ ${files.length} file terpilih` : "+ Pilih file...";

  [...files].forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "preview-thumb";
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

// ✅ Reset Preview Gambar
function resetPreview() {
  document.getElementById("previewImageContainer").innerHTML = "";
  document.querySelector(".file-label").textContent = "+ Pilih file...";
}

// ✅ Dark Mode Toggle
const toggleButton = document.getElementById("toggleTheme");
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggleButton.textContent = "Mode Terang";
}
toggleButton?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  toggleButton.textContent = isDark ? "Mode Terang" : "Mode Gelap";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ✅ Logout
const logoutBtn = document.getElementById("logoutButton");
logoutBtn?.addEventListener("click", async () => {
  const res = await fetch("/logout", { method: "POST", credentials: "include" });
  const result = await res.json();
  if (result.success) {
    window.location.href = "/login.html";
  }
});

// ✅ Event Listener: Search & Filter
document.getElementById("searchInput")?.addEventListener("input", applyFilters);
document.getElementById("filterCategory")?.addEventListener("change", applyFilters);

// ✅ Load Produk saat Awal
loadProducts();