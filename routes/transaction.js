const express = require("express");
const router = express.Router();
const midtransClient = require("midtrans-client");

// Inisialisasi Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false, // Ganti ke true saat production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

router.post("/create-transaction", async (req, res) => {
  try {
    const { name, email, phone, address, coupon, shipping, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Item belanja tidak valid." });
    }

    // Hitung subtotal
    let subtotal = 0;
    const item_details = items.map((item, i) => {
      const price = parseInt(item.price);
      const quantity = parseInt(item.quantity);
      const total = price * quantity;
      subtotal += total;
      return {
        id: `item-${i + 1}`,
        name: item.name,
        price,
        quantity,
      };
    });

    // Tambahkan diskon jika ada
    const discountPercent = parseInt(coupon) || 0;
    const discountAmount = Math.floor((subtotal * discountPercent) / 100);
    if (discountAmount > 0) {
      item_details.push({
        id: "discount",
        name: "Diskon Kupon",
        price: -discountAmount,
        quantity: 1,
      });
    }

    // Tambahkan ongkir jika ada
    const shippingFee = parseInt(shipping) || 0;
    if (shippingFee > 0) {
      item_details.push({
        id: "shipping",
        name: "Ongkos Kirim",
        price: shippingFee,
        quantity: 1,
      });
    }

    // Hitung total keseluruhan
    const gross_amount = item_details.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Siapkan parameter transaksi ke Midtrans
    const parameter = {
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount,
      },
      item_details,
      customer_details: {
        first_name: name || "Customer",
        email: email || "example@example.com",
        phone: phone || "08123456789",
        shipping_address: {
          first_name: name || "Customer",
          address: address || "-",
        },
        billing_address: {
          first_name: name || "Customer",
          address: address || "-",
        },
      },
    };

    // Buat transaksi Midtrans
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });

  } catch (err) {
    console.error("❌ Midtrans error:", err.message || err);
    res.status(500).json({ error: "Gagal membuat transaksi." });
  }
});

module.exports = router;
