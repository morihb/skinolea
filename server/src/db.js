// Storage layer with two modes:
//
// 1. No MONGODB_URI set -> plain JSON files under server/data/. Simple,
//    zero setup, great for local development. NOT safe on hosts with an
//    ephemeral filesystem (e.g. Render's free tier wipes local files on
//    every restart/redeploy).
//
// 2. MONGODB_URI set -> every "table" (products/orders/settings/admin) is
//    stored as one document in a MongoDB collection. This is what keeps
//    your store's data alive on free hosts like Render, using a free
//    MongoDB Atlas cluster (see README for setup).

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const queues = {};

function queued(file, fn) {
  const prev = queues[file] || Promise.resolve();
  const next = prev.then(fn, fn);
  queues[file] = next.catch(() => {});
  return next;
}

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readJSON(name, fallback) {
  try {
    const raw = fs.readFileSync(filePath(name), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function writeJSONSync(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = filePath(name) + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, filePath(name));
}

let mongoCollectionPromise = null;

async function getMongoCollection() {
  if (!process.env.MONGODB_URI) return null;
  if (!mongoCollectionPromise) {
    mongoCollectionPromise = (async () => {
      const { MongoClient } = require("mongodb");
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || "skinolea");
      console.log("Connected to MongoDB — store data will persist across restarts.");
      return db.collection("store_data");
    })().catch((err) => {
      mongoCollectionPromise = null; // allow a retry on the next call
      console.error("Could not connect to MongoDB with the MONGODB_URI you set:", err.message);
      throw err;
    });
  }
  return mongoCollectionPromise;
}

async function get(name, fallback) {
  const col = await getMongoCollection();
  if (col) {
    const doc = await col.findOne({ _id: name });
    return doc ? doc.value : fallback;
  }
  return queued(name, () => readJSON(name, fallback));
}

async function set(name, data) {
  const col = await getMongoCollection();
  if (col) {
    await col.updateOne({ _id: name }, { $set: { value: data } }, { upsert: true });
    return data;
  }
  return queued(name, () => {
    writeJSONSync(name, data);
    return data;
  });
}

module.exports = { get, set, DATA_DIR };
