import { useMemo, useState } from "react";
import { AGE_GROUPS, CATEGORIES } from "../data";
import ProductCard from "./ProductCard";

export default function Catalog({ products, category, setCategory, onAdd }) {
  const [search, setSearch] = useState("");
  const [age, setAge] = useState("All");
  const [sort, setSort] = useState("popular");

  const list = useMemo(() => {
    let l = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (age === "All" || p.age === age) &&
        (p.name + " " + p.brand).toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "popular") l = [...l].sort((a, b) => b.sold - a.sold);
    return l;
  }, [products, category, age, search, sort]);

  return (
    <section>
      <h1>Catalog</h1>
      <div className="filters">
        <input type="search" placeholder="Search products or brands" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={age} onChange={(e) => setAge(e.target.value)} aria-label="Age group">
          <option value="All">All ages</option>
          {AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="popular">Most popular</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>
      {list.length === 0 ? (
        <p className="notice">No products match. Try a different search or clear a filter.</p>
      ) : (
        <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} onAdd={onAdd} />)}</div>
      )}
    </section>
  );
}
