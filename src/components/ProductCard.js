import { formatPrice } from "../data";

export default function ProductCard({ p, onAdd, rank }) {
  const off = p.mrp > p.price ? Math.round(100 - (p.price / p.mrp) * 100) : 0;
  const out = p.stock <= 0;
  return (
    <article className="card">
      {rank && <span className="badge rank">#{rank}</span>}
      {off > 0 && <span className="badge off">{off}% off</span>}
      <div className="thumb">
        {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <span aria-hidden="true">{p.emoji || "🧸"}</span>}
      </div>
      <div className="card-body">
        <p className="muted small">{p.brand} · {p.age}</p>
        <h3>{p.name}</h3>
        <p className="rating">{p.rating ? `★ ${p.rating}` : "New"}</p>
        <p className="price">
          {formatPrice(p.price)} {p.mrp > p.price && <s className="muted">{formatPrice(p.mrp)}</s>}
        </p>
        {!out && p.stock <= 5 && <p className="low">Only {p.stock} left</p>}
        <button className="btn primary block" disabled={out} onClick={() => onAdd(p)}>
          {out ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
