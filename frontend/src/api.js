/**
 * api.js
 * ------
 * Every network call in the app goes through this one file. That way:
 *   - we attach the JWT token in exactly one place (not 20 different pages)
 *   - if the backend URL or error format ever changes, we fix it here once
 *
 * Each function returns already-parsed JSON, and throws an Error with a
 * readable message if the backend responded with an error status.
 */

const BASE_URL = "/api"; // Vite proxies this to Flask, see vite.config.js

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Flask always returns JSON, even for errors (see app.py error responses)
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // ---- auth ----
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me", { auth: true }),

  // ---- products / categories ----
  getProducts: (params = "") => request(`/products${params}`),
  getProduct: (id) => request(`/products/${id}`),
  getCategories: () => request("/categories"),
  createProduct: (payload) => request("/products", { method: "POST", body: payload, auth: true }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE", auth: true }),

  // ---- coupons ----
  listCoupons: () => request("/coupons", { auth: true }),
  createCoupon: (payload) => request("/coupons", { method: "POST", body: payload, auth: true }),
  validateCoupon: (code, subtotal) =>
    request("/coupons/validate", { method: "POST", body: { code, subtotal }, auth: true }),

  // ---- banners ----
  getBanners: () => request("/banners"),
  getAllBanners: () => request("/banners/all", { auth: true }),
  createBanner: (payload) => request("/banners", { method: "POST", body: payload, auth: true }),
  deleteBanner: (id) => request(`/banners/${id}`, { method: "DELETE", auth: true }),

  // ---- orders ----
  placeOrder: (payload) => request("/orders", { method: "POST", body: payload, auth: true }),
  myOrders: () => request("/orders/mine", { auth: true }),
  allOrders: () => request("/orders", { auth: true }),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: "PUT", body: { status }, auth: true }),

  // ---- analytics ----
  analyticsSummary: () => request("/analytics/summary", { auth: true }),
};
