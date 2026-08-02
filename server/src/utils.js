const { v4: uuidv4 } = require("uuid");

function normalizeRow(row) {
  const clean = {};
  Object.keys(row).forEach((k) => {
    clean[String(k).toLowerCase().replace(/[\s_-]/g, "")] = row[k];
  });
  const pick = (...names) => {
    for (const n of names) {
      const key = n.replace(/[\s_-]/g, "");
      if (clean[key] !== undefined && clean[key] !== "") return clean[key];
    }
    return "";
  };
  const priceVal = parseFloat(pick("price"));
  const saleVal = pick("saleprice", "sale_price", "discountprice");
  const stockVal = pick("stock", "quantity", "qty");
  return {
    id: uuidv4(),
    sku: String(pick("sku", "code") || "").trim(),
    name_en: String(pick("nameen", "name", "englishname") || "").trim(),
    name_ar: String(pick("namear", "arabicname") || "").trim(),
    category_en: String(pick("categoryen", "category") || "Uncategorized").trim(),
    category_ar: String(pick("categoryar") || "").trim(),
    description_en: String(pick("descriptionen", "description", "desc") || "").trim(),
    description_ar: String(pick("descriptionar", "descar") || "").trim(),
    price: isNaN(priceVal) ? 0 : priceVal,
    salePrice: saleVal !== "" && !isNaN(parseFloat(saleVal)) ? parseFloat(saleVal) : null,
    imageUrl: String(pick("imageurl", "image", "imagelink") || "").trim(),
    stock: stockVal !== "" && !isNaN(parseInt(stockVal)) ? parseInt(stockVal) : null,
  };
}

function sanitizeProductInput(body) {
  return {
    sku: String(body.sku || "").trim(),
    name_en: String(body.name_en || "").trim(),
    name_ar: String(body.name_ar || "").trim(),
    category_en: String(body.category_en || "").trim(),
    category_ar: String(body.category_ar || "").trim(),
    description_en: String(body.description_en || "").trim(),
    description_ar: String(body.description_ar || "").trim(),
    price: parseFloat(body.price) || 0,
    salePrice: body.salePrice === "" || body.salePrice === null || body.salePrice === undefined
      ? null : parseFloat(body.salePrice),
    imageUrl: String(body.imageUrl || "").trim(),
    stock: body.stock === "" || body.stock === null || body.stock === undefined
      ? null : parseInt(body.stock),
  };
}

module.exports = { normalizeRow, sanitizeProductInput, uuidv4 };
