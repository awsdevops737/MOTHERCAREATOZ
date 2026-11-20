import ProductCard from "./ProductCard";

export default function Best({ products, onAdd }) {
  const list = [...products].sort((a, b) => b.sold - a.sold || b.rating - a.rating).slice(0, 8);
  return (
    <section>
      <h1>Best products</h1>
      <p className="muted">Our top sellers, ranked by orders.</p>
      <div className="grid">
        {list.map((p, i) => <ProductCard key={p.id} p={p} rank={i + 1} onAdd={onAdd} />)}
      </div>
    </section>
  );
}
