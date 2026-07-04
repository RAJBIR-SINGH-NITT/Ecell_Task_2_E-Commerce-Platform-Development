import { useEffect, useState } from "react";
import { api } from "../../api";

const BLANK = { name: "", description: "", price: "", stock: "", image_url: "", category_id: "", is_featured: false };

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);

  function refresh() {
    api.getProducts().then(setProducts);
  }

  useEffect(() => {
    refresh();
    api.getCategories().then(setCategories);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id ? Number(form.category_id) : null,
    };
    if (editingId) {
      await api.updateProduct(editingId, payload);
    } else {
      await api.createProduct(payload);
    }
    setForm(BLANK);
    setEditingId(null);
    refresh();
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description, price: p.price,
      stock: p.stock, image_url: p.image_url,
      category_id: p.category_id || "", is_featured: p.is_featured,
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await api.deleteProduct(id);
    refresh();
  }

  return (
    <div>
      <h2>Product management</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <input placeholder="Name" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Price" type="number" required value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Stock" type="number" required value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input placeholder="Image URL" value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
          <option value="">No category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="checkbox-label">
          <input type="checkbox" checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
          Featured
        </label>
        <textarea placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn-primary" type="submit">{editingId ? "Update" : "Add"} product</button>
        {editingId && (
          <button type="button" className="btn-link" onClick={() => { setEditingId(null); setForm(BLANK); }}>
            Cancel edit
          </button>
        )}
      </form>

      <table className="admin-table">
        <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name} {p.is_featured && "⭐"}</td>
              <td>₹{p.price}</td>
              <td>{p.stock}</td>
              <td>{p.category_name || "—"}</td>
              <td>
                <button className="btn-link" onClick={() => startEdit(p)}>Edit</button>
                <button className="btn-link" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
