const fs = require("fs");
const path = require("path");

// Load data produk dari file JSON
const products = JSON.parse(fs.readFileSync("products.json", "utf-8"));

// Folder tempat menyimpan halaman HTML
const outputDir = path.join(__dirname, "public");

// Fungsi untuk membuat slug dari nama produk
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Template halaman HTML untuk tiap produk
function generateHTML(product) {
  const imageUrl = product.imageUrl || product.images?.[0] || "assets/default.jpg";
  const name = product.name || "Tanpa Nama";
  const price = parseInt(product.price).toLocaleString("id-ID");
  const description = product.description || "-";
  const category = product.category || "-";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${name}</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f4f4f4; color: #333; }
    .container { max-width: 700px; margin: auto; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    img { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .price { font-size: 20px; color: #ff5722; margin-bottom: 10px; }
    .badge { background: #eee; padding: 6px 12px; display: inline-block; border-radius: 6px; margin-bottom: 20px; }
    p { line-height: 1.6; }
    a.back { display: inline-block; margin-top: 20px; color: #ff5722; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <img src="${imageUrl}" alt="${name}" />
    <h1>${name}</h1>
    <div class="price">Rp ${price}</div>
    <div class="badge">${category}</div>
    <p>${description}</p>
    <a class="back" href="/index.html">&larr; Kembali ke katalog</a>
  </div>
</body>
</html>`;
}

// Buat file HTML untuk tiap produk
products.forEach(product => {
  const slug = slugify(product.name || "produk");
  const fileName = `page-single-liquid-${slug}.html`;
  const html = generateHTML(product);
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, html, "utf-8");
  console.log(`✅ Dibuat: ${fileName}`);
});
