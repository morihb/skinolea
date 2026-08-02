const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "insecure-dev-secret-change-me";
const COOKIE_NAME = "olives_admin_token";
const TOKEN_TTL = "12h";

function signAdminToken() {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 12 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

function requireAdmin(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not authenticated." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") throw new Error("bad role");
    next();
  } catch (e) {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}
async function checkPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = {
  signAdminToken, setAuthCookie, clearAuthCookie, requireAdmin,
  hashPassword, checkPassword, COOKIE_NAME,
};
