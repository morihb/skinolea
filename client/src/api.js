const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, opts = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: "include",
    headers: opts.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    let message = "Request failed.";
    try {
      const data = await res.json();
      message = data.error || message;
    } catch (e) {}
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getProducts: () => request("/products"),
  getSettings: () => request("/settings"),
  postOrder: (payload) => request("/orders", { method: "POST", body: JSON.stringify(payload) }),

  admin: {
    login: (password) => request("/admin/login", { method: "POST", body: JSON.stringify({ password }) }),
    logout: () => request("/admin/logout", { method: "POST" }),
    session: () => request("/admin/session"),

    getProducts: () => request("/admin/products"),
    addProduct: (p) => request("/admin/products", { method: "POST", body: JSON.stringify(p) }),
    updateProduct: (id, p) => request(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(p) }),
    deleteProduct: (id) => request(`/admin/products/${id}`, { method: "DELETE" }),
    importProducts: (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return request("/admin/products/import", { method: "POST", body: fd });
    },

    getOrders: () => request("/admin/orders"),
    toggleOrder: (id) => request(`/admin/orders/${id}`, { method: "PATCH" }),

    getSettings: () => request("/admin/settings"),
    updateSettings: (s) => request("/admin/settings", { method: "PUT", body: JSON.stringify(s) }),
    changePassword: (currentPassword, newPassword) =>
      request("/admin/password", { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) }),
  },
};
