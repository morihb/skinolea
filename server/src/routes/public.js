const express = require("express");
const db = require("../db");
const { uuidv4 } = require("../utils");
const { rateLimit } = require("../rateLimit");

const router = express.Router();

// Public product catalog
router.get("/products", async (req, res) => {
  const products = await db.get("products", []);
  res.json(products);
});

// Public, non-sensitive shop settings (never includes the password)
router.get("/settings", async (req, res) => {
  const s = await db.get("settings", {});
  res.json({
    shopNameEn: s.shopNameEn,
    shopNameAr: s.shopNameAr,
    taglineEn: s.taglineEn,
    taglineAr: s.taglineAr,
    whatsappNumber: s.whatsappNumber,
    currencySymbol: s.currencySymbol,
  });
});

// Log a checkout attempt (customer side). Rate-limited since it's public.
router.post("/orders", rateLimit({ windowMs: 60_000, max: 20 }), async (req, res) => {
  const { items, total, lang } = req.body || {};
  if (!Array.isArray(items) || items.length === 0 || typeof total !== "number") {
    return res.status(400).json({ error: "Invalid order payload." });
  }
  const safeItems = items.slice(0, 100).map((i) => ({
    name: String(i.name || "").slice(0, 200),
    qty: Math.max(1, Math.min(999, parseInt(i.qty) || 1)),
    price: Number(i.price) || 0,
  }));
  const order = {
    id: uuidv4(),
    timestamp: Date.now(),
    lang: lang === "ar" ? "ar" : "en",
    items: safeItems,
    total: Number(total) || 0,
    status: "pending",
  };
  const orders = await db.get("orders", []);
  const next = [order, ...orders].slice(0, 1000);
  await db.set("orders", next);
  res.json({ ok: true, id: order.id });
});

module.exports = router;
