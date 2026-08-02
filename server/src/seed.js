const db = require("./db");
const { hashPassword } = require("./auth");

const DEFAULT_SETTINGS = {
  shopNameEn: "Skinolea",
  shopNameAr: "سكينوليا",
  taglineEn: "K-beauty essentials for your everyday routine",
  taglineAr: "أساسيات العناية الكورية لروتينك اليومي",
  whatsappNumber: "96170000000",
  currencySymbol: "$",
};

const DEFAULT_PRODUCTS = [
  { id: "p1", sku: "SK-CLN-02", name_en: "Rice Water Gel Cleanser", name_ar: "غسول جل بماء الأرز",
    category_en: "Cleansers", category_ar: "غسولات",
    description_en: "A gentle, low-pH daily gel cleanser infused with fermented rice water that cleanses thoroughly while keeping skin soft and balanced.",
    description_ar: "غسول جل يومي لطيف منخفض الحموضة يحتوي على ماء الأرز المتخمر، ينظف البشرة بعمق مع الحفاظ على نعومتها وتوازنها.",
    price: 16, salePrice: null, stock: 45,
    imageUrl: "https://placehold.co/700x700/1e2f26/f3f1e7?text=Rice+Water+Cleanser" },
  { id: "p2", sku: "SK-TON-02", name_en: "Centella Calming Toner", name_ar: "تونر السنتيلا المهدئ",
    category_en: "Toners", category_ar: "تونرات",
    description_en: "An alcohol-free toner formulated with centella asiatica (cica) extract to soothe redness and prep skin for the next steps of your routine.",
    description_ar: "تونر خالٍ من الكحول يحتوي على خلاصة نبات السنتيلا (سيكا) لتهدئة الاحمرار وتحضير البشرة للخطوات التالية.",
    price: 17, salePrice: 14, stock: 50,
    imageUrl: "https://placehold.co/700x700/3e5745/f3f1e7?text=Centella+Toner" },
  { id: "p3", sku: "SK-ESS-01", name_en: "Snail Mucin Repair Essence", name_ar: "إسنس مخاط الحلزون الترميمي",
    category_en: "Essences", category_ar: "إسنسات",
    description_en: "A lightweight essence with 92% snail secretion filtrate that helps repair the skin barrier and boost hydration.",
    description_ar: "إسنس خفيف يحتوي على 92% من راشح إفرازات الحلزون، يساعد على ترميم حاجز البشرة وزيادة الترطيب.",
    price: 24, salePrice: 20, stock: 38,
    imageUrl: "https://placehold.co/700x700/c17f3e/1e2f26?text=Snail+Mucin+Essence" },
  { id: "p4", sku: "SK-AMP-01", name_en: "Ginseng Radiance Ampoule", name_ar: "أمبولة الجينسنغ للإشراقة",
    category_en: "Serums & Ampoules", category_ar: "سيرومات وأمبولات",
    description_en: "A concentrated ampoule with red ginseng root extract to brighten dull skin and support firmness with consistent use.",
    description_ar: "أمبولة مركزة تحتوي على خلاصة جذر الجينسنغ الأحمر لتفتيح البشرة الباهتة ودعم مرونتها.",
    price: 32, salePrice: null, stock: 22,
    imageUrl: "https://placehold.co/700x700/1e2f26/f3f1e7?text=Ginseng+Ampoule" },
  { id: "p5", sku: "SK-MSK-02", name_en: "Hyaluronic Hydrogel Sheet Mask (Pack of 5)", name_ar: "قناع هيدروجيل بحمض الهيالورونيك (علبة 5 أقنعة)",
    category_en: "Sheet Masks", category_ar: "أقنعة ورقية",
    description_en: "An intensely hydrating hydrogel sheet mask soaked in hyaluronic acid — a 15-minute moisture boost before makeup or bedtime.",
    description_ar: "قناع هيدروجيل مشبع بحمض الهيالورونيك لترطيب عميق خلال 15 دقيقة فقط، مثالي قبل المكياج أو النوم.",
    price: 19, salePrice: null, stock: 60,
    imageUrl: "https://placehold.co/700x700/93a88f/1e2f26?text=Hydrogel+Sheet+Mask" },
  { id: "p6", sku: "SK-MOI-02", name_en: "Propolis Moisture Cream", name_ar: "كريم البروبوليس المرطب",
    category_en: "Moisturizers", category_ar: "مرطبات",
    description_en: "A nourishing daily cream with propolis extract and ceramides that strengthens the skin barrier and locks in long-lasting moisture.",
    description_ar: "كريم مغذٍ يومي يحتوي على خلاصة البروبوليس والسيراميد لتقوية حاجز البشرة والحفاظ على الترطيب.",
    price: 26, salePrice: null, stock: 30,
    imageUrl: "https://placehold.co/700x700/1e2f26/f3f1e7?text=Propolis+Cream" },
  { id: "p7", sku: "SK-SUN-02", name_en: "Rice Bran Tone-Up Sunscreen SPF50+ PA++++", name_ar: "واقي شمس بنخالة الأرز الموحّد للون SPF50+ PA++++",
    category_en: "Sun Care", category_ar: "واقي الشمس",
    description_en: "A lightweight tone-up sunscreen with rice bran extract, offering SPF50+ PA++++ protection and a soft brightening finish under makeup.",
    description_ar: "واقي شمس خفيف يمنح إشراقة فورية للبشرة، بحماية SPF50+ PA++++، يحتوي على خلاصة نخالة الأرز.",
    price: 22, salePrice: 18, stock: 42,
    imageUrl: "https://placehold.co/700x700/c17f3e/1e2f26?text=Tone-Up+Sunscreen" },
  { id: "p8", sku: "SK-LIP-01", name_en: "Berry Overnight Lip Mask", name_ar: "قناع الشفاه الليلي بالتوت",
    category_en: "Lip Care", category_ar: "العناية بالشفاه",
    description_en: "A nourishing overnight lip treatment with berry extracts and shea butter that softens and replenishes dry, chapped lips by morning.",
    description_ar: "قناع ليلي مغذٍ للشفاه يحتوي على خلاصة التوت وزبدة الشيا لتنعيم وترطيب الشفاه الجافة بحلول الصباح.",
    price: 14, salePrice: null, stock: 55,
    imageUrl: "https://placehold.co/700x700/3e5745/f3f1e7?text=Berry+Lip+Mask" },
];

const DEFAULT_ADMIN_PASSWORD = "skinolea2026";

async function seedIfNeeded() {
  const settings = await db.get("settings", null);
  if (!settings) await db.set("settings", DEFAULT_SETTINGS);

  const products = await db.get("products", null);
  if (!products) await db.set("products", DEFAULT_PRODUCTS);

  const orders = await db.get("orders", null);
  if (!orders) await db.set("orders", []);

  const admin = await db.get("admin", null);
  if (!admin) {
    const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
    await db.set("admin", { passwordHash });
    console.log(`\nNo admin password found — created one.`);
    console.log(`Default admin password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`Change it immediately from Admin > Settings after you log in.\n`);
  }
}

module.exports = { seedIfNeeded };
