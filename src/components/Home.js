import { CATEGORIES, CATEGORY_EMOJI, OFFERS } from "../data";
import ProductCard from "./ProductCard";

export default function Home({ products, go, onCategory, onAdd }) {
  const best = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);
  return (
    <>
      <section className="hero">
        <div>
          <h1>Everything your little one needs, in one cart.</h1>
          <p>Diapers, feeding, bath care and daily essentials. Free delivery above ₹499.</p>
          <div className="row">
            <button className="btn primary" onClick={() => go("catalog")}>Shop now</button>
            <button className="btn ghost" onClick={() => go("offers")}>See offers</button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">🍼🧸👶</div>
      </section>

      <section>
        <h2>Shop by category</h2>
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <button key={c} className="cat" onClick={() => onCategory(c)}>
              <span aria-hidden="true">{CATEGORY_EMOJI[c]}</span>
              {c}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Best products</h2>
          <button className="link" onClick={() => go("best")}>View all</button>
        </div>
        <div className="grid">
          {best.map((p, i) => <ProductCard key={p.id} p={p} rank={i + 1} onAdd={onAdd} />)}
        </div>
      </section>

      <section className="offer-strip">
        {OFFERS.map((o) => (
          <div key={o.code} className="offer-chip">
            <strong>{o.code}</strong>
            <span>{o.title}</span>
          </div>
        ))}
      </section>
    </>
  );
}
