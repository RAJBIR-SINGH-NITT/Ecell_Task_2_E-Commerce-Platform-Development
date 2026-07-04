import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBanners(), api.getProducts("?featured=true")])
      .then(([b, p]) => {
        setBanners(b);
        setFeatured(p);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero section: the "high-conversion" landing block the brief asks for */}
      <section className="hero">
        <h1>Everyday essentials,<br />delivered with care.</h1>
        <p>Curated electronics, apparel and home goods — at prices that make sense.</p>
        <Link to="/shop" className="btn-primary-lg">Shop now</Link>
      </section>

      {/* Promo banners (bonus: Banner Management) */}
      {banners.length > 0 && (
        <section className="banner-strip">
          {banners.map((b) => (
            <div key={b.id} className="banner">
              <img src={b.image_url} alt={b.title} />
              <div className="banner-title">{b.title}</div>
            </div>
          ))}
        </section>
      )}

      {/* Trust indicators */}
      <section className="trust-strip">
        <div>🚚 Free shipping over ₹999</div>
        <div>↩️ 7-day easy returns</div>
        <div>🔒 Secure checkout</div>
        <div>⭐ 4.7/5 from 2,300+ customers</div>
      </section>

      <section className="section">
        <h2>Featured products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="testimonials">
        <h2>What customers say</h2>
        <div className="testimonial-grid">
          <blockquote>"Fast delivery and the quality matched the photos exactly." — Priya</blockquote>
          <blockquote>"Customer support helped me swap a size within minutes." — Arjun</blockquote>
          <blockquote>"My go-to for gifts now — the packaging alone is worth it." — Meera</blockquote>
        </div>
      </section>
    </div>
  );
}
