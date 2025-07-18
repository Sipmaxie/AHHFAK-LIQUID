// 🌱 Load .env secara eksplisit dari direktori project
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });

// 🚨 Debug: Cek apakah ENV terbaca
if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
  console.error("❌ MIDTRANS_SERVER_KEY atau CLIENT_KEY belum diatur di file .env");
  console.log("DEBUG ENV:", {
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
    CLIENT_KEY_EXISTS: !!process.env.MIDTRANS_CLIENT_KEY,
  });
  process.exit(1);
}

// 🔧 Load Dependencies
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const midtransClient = require("midtrans-client");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 4000;
const HOST = "0.0.0.0";

// 💳 Setup Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// 🌐 Middleware
app.use(cors({
  origin: "http://31.97.111.172", // Ganti ke domain jika sudah live (misal: https://ahhfak.com)
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// 🔒 Rate Limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // max 100 request per IP
}));

// 🔐 Session Management
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Ubah ke true jika pakai HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 1 hari
  }
}));

// ✅ Pastikan folder upload
["public/uploads", "public/assets/Banners"].forEach(folder => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
});

// ✅ Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

const dbPath = "products.json";
let products = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : [];

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const categoryPath = path.join(dataDir, "categories.json");
if (!fs.existsSync(categoryPath)) {
  fs.writeFileSync(categoryPath, JSON.stringify(["Fruity", "Faith", "Creamy", "30ML Series"], null, 2));
}

// ✅ AUTH
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "ahhfakeliquidfactory" && password === "fruitymadness") {
    req.session.user = "admin";
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: "Username atau password salah" });
});

app.get("/check-auth", (req, res) => {
  res.json({ authenticated: req.session.user === "admin" });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ✅ CRUD PRODUCTS
app.post("/upload-product", upload.array("images"), (req, res) => {
  if (req.session.user !== "admin") return res.status(401).json({ success: false });
  let { name, price, description, category } = req.body;
  price = parseInt(price);
  if (price < 1000) price *= 1000;

  const images = req.files.map(file => `/uploads/${file.filename}`);
  const newProduct = {
    id: Date.now().toString(),
    name, price, description, category,
    images,
    imageUrl: images[0]
  };

  products.push(newProduct);
  fs.writeFileSync(dbPath, JSON.stringify(products, null, 2));
  res.json({ success: true, message: "Produk berhasil diupload" });
});

app.post("/delete-product", (req, res) => {
  if (req.session.user !== "admin") return res.status(401).json({ success: false });
  const { imageUrl } = req.body;
  const target = products.find(p => p.imageUrl === imageUrl || p.images?.includes(imageUrl));
  if (!target) return res.status(404).json({ success: false });

  target.images?.forEach(img => {
    const filePath = path.join(__dirname, "public", img);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  products = products.filter(p => p.id !== target.id);
  fs.writeFileSync(dbPath, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

// ✅ Setup Multer untuk upload banner
const bannerUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/assets/Banners"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
  })
});

// ✅ Upload banner
app.post("/api/upload-banner", bannerUpload.single("banner"), (req, res) => {
  if (req.session.user !== "admin") {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const bannerPath = `/assets/Banners/${file.filename}`;
  const bannersFilePath = path.join(__dirname, "data", "banners.json");

  let banners = [];
  if (fs.existsSync(bannersFilePath)) {
    try {
      banners = JSON.parse(fs.readFileSync(bannersFilePath));
    } catch (err) {
      console.error("❌ Gagal membaca banners.json:", err.message);
    }
  }

  banners.push(bannerPath);
  fs.writeFileSync(bannersFilePath, JSON.stringify(banners, null, 2));

  res.json({ success: true, path: bannerPath });
});

// ✅ Hapus banner
app.delete("/api/delete-banner", (req, res) => {
  if (req.session.user !== "admin") {
    return res.status(401).json({ success: false });
  }

  const encodedUrl = req.query.url;
  const decodedUrl = decodeURIComponent(encodedUrl);
  const filePath = path.join(__dirname, "public", decodedUrl);
  const bannersFilePath = path.join(__dirname, "data", "banners.json");

  // Hapus file fisik jika ada
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Update daftar banner
  let banners = [];
  if (fs.existsSync(bannersFilePath)) {
    try {
      banners = JSON.parse(fs.readFileSync(bannersFilePath));
      banners = banners.filter(b => b !== decodedUrl);
      fs.writeFileSync(bannersFilePath, JSON.stringify(banners, null, 2));
    } catch (err) {
      console.error("Gagal update banners.json:", err.message);
    }
  }

  res.json({ success: true });
});

// ✅ GET daftar banner (WAJIB ADA untuk loadBanners())
app.get("/api/banners", (req, res) => {
  const bannersFilePath = path.join(__dirname, "data", "banners.json");
  if (!fs.existsSync(bannersFilePath)) {
    return res.json([]);
  }

  try {
    const banners = JSON.parse(fs.readFileSync(bannersFilePath));
    res.json(banners);
  } catch (err) {
    console.error("❌ Gagal membaca banners.json:", err.message);
    res.status(500).json({ success: false, message: "Gagal membaca daftar banner" });
  }
});

// ✅ MIDTRANS TRANSACTION
app.post("/create-transaction", async (req, res) => {
  try {
    const { items, address, phone, shipping, coupon, name, email } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false });

    let subtotal = 0;
    const item_details = items.map((item, i) => {
      const quantity = parseInt(item.quantity);
      const price = parseInt(item.price);
      subtotal += quantity * price;
      return { id: `item-${i}`, name: item.name, price, quantity };
    });

    const discount = Math.round((subtotal * (parseInt(coupon) || 0)) / 100);
    const shippingFee = parseInt(shipping) || 0;

    if (discount > 0) item_details.push({ id: "DISCOUNT", name: "Diskon", price: -discount, quantity: 1 });
    if (shippingFee > 0) item_details.push({ id: "SHIPPING", name: "Ongkir", price: shippingFee, quantity: 1 });

    const grossAmount = subtotal - discount + shippingFee;
    if (grossAmount <= 0) return res.status(400).json({ success: false });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: grossAmount,
      },
      item_details,
      customer_details: {
        first_name: name || "Customer",
        email: email || "default@email.com", // WAJIB agar notifikasi jalan
        phone: phone || "-",
        shipping_address: {
          address,
          first_name: name || "Customer",
          phone,
        },
        billing_address: {
          address,
          first_name: name || "Customer",
          phone,
        },
      },
    });

    res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (err) {
    console.error("❌ Midtrans error:", err.message);
    res.status(500).json({ success: false, message: "Gagal membuat transaksi." });
  }
});


// ✅ Static JSON/API
app.get("/api/products", (req, res) => res.json(products));

app.get("/api/categories", (req, res) => {
  try {
    const data = fs.readFileSync(categoryPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Gagal membaca kategori." });
  }
});

app.post("/add-category", (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ success: false });

  const categories = fs.existsSync(categoryPath) ? JSON.parse(fs.readFileSync(categoryPath)) : [];
  if (!categories.includes(category)) {
    categories.push(category);
    fs.writeFileSync(categoryPath, JSON.stringify(categories, null, 2));
  }
  res.json({ success: true });
});

// ✅ Static Pages
app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "success.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Fallback
app.use((req, res) => {
  res.status(404).send("Halaman tidak ditemukan.");
});

// ✅ Start server
app.listen(PORT, HOST, () => {
  console.log(`Server berjalan di http://${HOST}:${PORT}`);
});
