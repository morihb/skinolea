# Skinolea — online store

A real, self-hosted skincare storefront with:

- Bilingual storefront (English / Arabic, auto-detected + toggle, full RTL)
- Product browsing, cart, and **checkout via WhatsApp** (opens WhatsApp with the order prefilled)
- A **hidden admin dashboard** at `/admin` (not linked anywhere on the public site) with:
  - Add / edit / delete products
  - **Bulk import from Excel**
  - An orders log (every WhatsApp checkout is also recorded here)
  - Settings: shop name, tagline, WhatsApp number, currency, admin password
- A real Node.js backend with **server-side authentication** — the admin password is
  hashed (bcrypt) and never sent to the browser; every admin action is checked
  against a signed, httpOnly session cookie on the server.

This replaces the earlier Claude-artifact prototype, which could only ever run
inside Claude.ai. This version is a normal two-part app (`server` + `client`)
you can run on your own server.

## Folder structure

```
skinolea-app/
  server/     Express API + admin auth + data store (JSON files, or MongoDB if configured)
  client/     React (Vite) storefront + admin dashboard
```

## 1. First-time setup

```bash
cd server
npm install
cp .env.example .env
# open .env and set a real JWT_SECRET (see the comment in that file for how to generate one)

cd ../client
npm install
```

## 2. Run it locally

Two terminals, from the project root:

```bash
# Terminal 1 — API
cd server
npm run dev            # http://localhost:4000

# Terminal 2 — storefront (hot reload)
cd client
npm run dev            # http://localhost:5173, proxies /api to the server
```

Open http://localhost:5173 for the store, and http://localhost:5173/admin/login for
the admin dashboard.

The **first time the server starts**, it creates a default admin account and prints
the starting password to the terminal:

```
Default admin password: skinolea2026
```

Log in and change it immediately from **Admin → Settings → Change password**.

## 3. Build for a single-server deployment

For a real deployment you don't need two separate services — the API server can
also serve the built frontend:

```bash
cd client
npm run build           # outputs client/dist

cd ../server
NODE_ENV=production npm start    # serves the API and the built site on one port
```

Now everything (storefront + hidden `/admin` route + API) is served from
`http://your-server:4000` (or whatever `PORT` you set in `.env`).

## 4. Deploying for free (Render + MongoDB Atlas)

This gets you a real, live web address like `https://skinolea.onrender.com` —
no server administration, no cost. It's three parts: put the code on GitHub,
create a free database (so your products/orders survive restarts), then
create the web service on Render.

### Step 1 — Put the project on GitHub

1. Create a free account at https://github.com if you don't have one.
2. Click **New repository** (top right → the `+` icon), name it `skinolea-app`,
   keep it **Private** if you'd like, and click **Create repository**.
3. On the next page, use **"uploading an existing file"** and drag in the
   `skinolea-app` folder's contents (or, if you're comfortable with the
   command line: `git init && git add . && git commit -m "first commit"` then
   follow GitHub's `git remote add` / `git push` instructions).

### Step 2 — Create a free database (MongoDB Atlas)

This is the important part: without this, the free Render tier would reset
your store's products and orders every time it restarts. This step makes that
data permanent, for free.

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a new project, then create a cluster — choose the **M0 Free** tier
   (512 MB, free forever, no card required).
3. When asked, create a database user (pick a username and password — save
   these) and, under Network Access, click **Add IP Address → Allow access
   from anywhere** (`0.0.0.0/0`) so Render can reach it.
4. Once the cluster is ready, click **Connect → Drivers**, and copy the
   connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with the database user you created.
   Save this string — you'll paste it into Render in the next step.

### Step 3 — Create the web service on Render

1. Create a free account at https://render.com and connect your GitHub account.
2. Click **New → Web Service**, and pick the `skinolea-app` repository.
3. Fill in:
   - **Name**: `skinolea` (this becomes part of your free URL)
   - **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start Command**: `node server/src/index.js`
   - **Instance Type**: Free
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = a long random string (generate one with
     `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
     on your own computer, then paste the result in)
   - `MONGODB_URI` = the connection string you copied from Atlas
5. Click **Create Web Service**. The first deploy takes a few minutes — watch
   the **Logs** tab; you should see `Connected to MongoDB` and
   `Skinolea server running on...`.

Your store is now live at `https://skinolea.onrender.com` (or whatever name
you picked). The admin dashboard is at `https://skinolea.onrender.com/admin`.

**Log in immediately and change the default admin password** (Admin →
Settings) — the terminal/Logs tab will have printed the starting one on first
boot, the same way it does locally.

### Good to know about the free tier

- **It sleeps.** A free Render service spins down after ~15 minutes with no
  visitors, and the next visitor waits ~30–60 seconds while it wakes back up.
  This is normal and only affects the very next request after a quiet period.
- **750 free hours/month** are included — plenty for one service running
  continuously (that's about 31 days' worth), but check Render's current
  limits if you add more free services later.
- If you outgrow this later, upgrading Render's instance type (a few dollars/month)
  removes the sleep delay — no code changes needed.

### If you'd rather use your own VPS instead

That still works exactly as described below — you'd just skip the MongoDB
step (a VPS's disk is permanent, so the local JSON files are fine there) and
not set `MONGODB_URI` at all:

- **A small VPS** (e.g. Hetzner, DigitalOcean): install Node, copy this folder up,
  run `npm install` in both folders, `npm run build` in `client`, then run the
  server with a process manager like `pm2 start server/src/index.js --name skinolea`
  so it restarts on crashes/reboots. Put Nginx in front for HTTPS (e.g. via
  Certbot) and point your domain at it.

Either way: Render's free web services already serve everything over **HTTPS**
automatically. If you go the VPS route instead, you must set up HTTPS yourself
(e.g. Certbot) — logging into `/admin/login` over plain HTTP sends the
password unencrypted.

## 5. The Excel import template

Use the included `skinolea-product-template.xlsx` (from the earlier message) or
any spreadsheet with these column headers in row 1:

```
name_en, name_ar, description_en, description_ar, category_en, category_ar,
price, saleprice, imageurl, stock, sku
```

- `name_en`, `price`, and `imageurl` are required; everything else is optional.
- If a row's `sku` matches an existing product, importing again **updates** that
  product instead of creating a duplicate — so you can re-upload the same file
  after editing prices.

## 6. About the admin login and security

What's real now, compared to the earlier prototype:

- The admin password is **hashed with bcrypt** and stored only on the server —
  it's never present in any file the browser can read.
- Every admin action (`/api/admin/...`) is checked server-side against a signed
  JWT held in an **httpOnly cookie**, so it can't be read or forged from the
  browser console.
- `/admin` isn't linked from anywhere on the public site — a visitor would need
  to already know the URL.
- Login attempts and public order submissions are rate-limited per IP.

What's still on you:

- **Use a strong password** (change it from the default immediately) and don't
  share the `/admin` URL publicly.
- **Serve the site over HTTPS** in production — Render's free tier does this
  automatically; a VPS needs it set up manually (see the deployment notes above).
- Keep Node and the npm dependencies up to date (`npm audit` periodically).
- **Where your data lives**: if `MONGODB_URI` is set, everything (products,
  orders, settings) is stored in your MongoDB Atlas database — back that up
  via Atlas's own tools periodically. If `MONGODB_URI` is *not* set, data is
  stored as plain JSON files under `server/data/` instead — fine on a VPS with
  a permanent disk, but **do not run this way on Render's free tier**, since
  those files get wiped on every restart.
- For a bigger store (many admins, high traffic, need for audit logs), you'd
  eventually want a full relational database (Postgres/MySQL) — the current
  setup is intentionally simple and is a good fit for a single-owner shop.

## 7. Things you'll still want to decide

- **WhatsApp Business number** — set the real one in Admin → Settings. Format:
  country code + number, no `+` and no leading `0` (e.g. Lebanon: `961` + the
  local number without its leading `0`).
- **Shipping cost & delivery areas**, and whether to mention them in the
  WhatsApp message template.
- **Currency** — the symbol is just a label; this app doesn't do currency
  conversion.
- **Product photography** — replace the placeholder image URLs with real,
  hosted photos (your own storage, Cloudinary, etc.).
- **A privacy note for customers**, since checkout shares their WhatsApp number
  with you indirectly through the chat.
# skinolea
