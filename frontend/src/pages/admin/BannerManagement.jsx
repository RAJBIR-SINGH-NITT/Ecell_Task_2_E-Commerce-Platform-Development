import { useEffect, useState } from "react";
import { api } from "../../api";

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", image_url: "", link_url: "", start_date: "", end_date: "" });

  function refresh() {
    api.getAllBanners().then(setBanners);
  }
  useEffect(refresh, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await api.createBanner({
      ...form,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    });
    setForm({ title: "", image_url: "", link_url: "", start_date: "", end_date: "" });
    refresh();
  }

  async function handleDelete(id) {
    await api.deleteBanner(id);
    refresh();
  }

  return (
    <div>
      <h2>Banner management</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input placeholder="Title" required value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Image URL" required value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <input placeholder="Link URL (optional)" value={form.link_url}
          onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
        <label>Visible from</label>
        <input type="date" value={form.start_date}
          onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        <label>Visible until</label>
        <input type="date" value={form.end_date}
          onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        <button className="btn-primary" type="submit">Create banner</button>
      </form>

      <div className="banner-admin-grid">
        {banners.map((b) => (
          <div key={b.id} className="banner-admin-card">
            <img src={b.image_url} alt={b.title} />
            <p>{b.title}</p>
            <button className="btn-link" onClick={() => handleDelete(b.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
