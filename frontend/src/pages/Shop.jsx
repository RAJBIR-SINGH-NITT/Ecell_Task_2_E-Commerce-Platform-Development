import { useEffect, useState } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  // Re-fetch whenever a filter changes. We debounce nothing here since
  // it's a small catalog -- for a bigger one you'd add a setTimeout debounce.
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (maxPrice) params.set("max_price", maxPrice);

    api.getProducts(`?${params.toString()}`)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [search, category, maxPrice]);

  return (
    <div className="section">
      <h1>Shop all products</h1>

      <div className="filter-bar">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
          <option value="">Any price</option>
          <option value="500">Under ₹500</option>
          <option value="1500">Under ₹1500</option>
          <option value="5000">Under ₹5000</option>
        </select>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products match your filters.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
