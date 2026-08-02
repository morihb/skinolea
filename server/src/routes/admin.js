const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const db = require("../db");
const { uuidv4, normalizeRow, sanitizeProductInput } = require("../utils");
const {
  signAdminToken, setAuthCookie, clearAuthCookie, requireAdmin,
  hashPassword, checkPassword,
} = require("../auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Very small in-memory throttle on login attempts, per IP, to slow down guessing.
const loginAttempts = new Map();
function tooManyAttempts(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip) || { count: 0, first: now };
  if (now - rec.first > 15 * 60_000) { rec.count = 0; rec.first = now; }
  rec.count += 1;
  loginAttempts.set(ip, rec);
  return rec.count > 20;
}

router.post("/login", async (req, res) => {
  const ip = req.ip || "unknown";
  if (tooManyAttempts(ip)) {
    return res.status(429).json({ error: "Too many attempts. Please wait a few minutes and try again." });
  }
  const { password } = req.body || {};
  const admin = await db.get("admin", null);
  if (!admin || !password) return res.status(401).json({ error: "Incorrect password." });
  const ok = await checkPassword(String(password), admin.passwordHash);
  if (!ok) return res.status(401).json({ error: "Incorrect password." });
  const token = signAdminToken();
  setAuthCookie(res, token);
  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get("/session", requireAdmin, (req, res) => res.json({ ok: true }));

router.use(requireAdmin);

// ---- Products ----
router.get("/products", async (req, res) => {
  res.json(await db.get("products", []));
});

router.post("/products", async (req, res) => {
  const p = sanitizeProductInput(req.body);
  if (!p.name_en || !p.price || !p.imageUrl) {
    return res.status(400).json({ error: "Name, price, and image URL are required." });
  }
  p.id = uuidv4();
  const products = await db.get("products", []);
  const next = [...products, p];
  await db.set("products", next);
  res.json(p);
});

router.put("/products/:id", async (req, res) => {
  const p = sanitizeProductInput(req.body);
  if (!p.name_en || !p.price || !p.imageUrl) {
    return res.status(400).json({ error: "Name, price, and image URL are required." });
  }
  const products = await db.get("products", []);
  const idx = products.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found." });
  const updated = { ...p, id: req.params.id };
  const next = [...products];
  next[idx] = updated;
  await db.set("products", next);
  res.json(updated);
});

router.delete("/products/:id", async (req, res) => {
  const products = await db.get("products", []);
  const next = products.filter((x) => x.id !== req.params.id);
  await db.set("products", next);
  res.json({ ok: true });
});

router.post("/products/import", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  let rows;
  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    rows = raw.map(normalizeRow).filter((r) => r.name_en && r.price);
  } catch (e) {
    return res.status(400).json({ error: "Couldn't read that file. Please upload a valid Excel or CSV file." });
  }
  if (rows.length === 0) return res.status(400).json({ error: "No valid product rows found." });

  const products = await db.get("products", []);
  let updated = [...products];
  rows.forEach((np) => {
    const idx = np.sku ? updated.findIndex((p) => p.sku && p.sku === np.sku) : -1;
    if (idx >= 0) updated[idx] = { ...updated[idx], ...np, id: updated[idx].id };
    else updated.push(np);
  });
  await db.set("products", updated);
  res.json({ ok: true, imported: rows.length });
});

// ---- Orders ----
router.get("/orders", async (req, res) => {
  res.json(await db.get("orders", []));
});

router.patch("/orders/:id", async (req, res) => {
  const orders = await db.get("orders", []);
  const next = orders.map((o) =>
    o.id === req.params.id ? { ...o, status: o.status === "completed" ? "pending" : "completed" } : o
  );
  await db.set("orders", next);
  res.json({ ok: true });
});

// ---- Settings ----
router.get("/settings", async (req, res) => {
  const s = await db.get("settings", {});
  const { adminPassword, ...pub } = s; // never send anything password-shaped back
  res.json(pub);
});

router.put("/settings", async (req, res) => {
  const current = await db.get("settings", {});
  const allowed = ["shopNameEn", "shopNameAr", "taglineEn", "taglineAr", "whatsappNumber", "currencySymbol"];
  const next = { ...current };
  allowed.forEach((k) => {
    if (typeof req.body[k] === "string") next[k] = req.body[k].trim();
  });
  await db.set("settings", next);
  res.json({ ok: true });
});

router.put("/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }
  const admin = await db.get("admin", null);
  const ok = admin && (await checkPassword(String(currentPassword || ""), admin.passwordHash));
  if (!ok) return res.status(401).json({ error: "Current password is incorrect." });
  const passwordHash = await hashPassword(String(newPassword));
  await db.set("admin", { passwordHash });
  res.json({ ok: true });
});

module.exports = router;
