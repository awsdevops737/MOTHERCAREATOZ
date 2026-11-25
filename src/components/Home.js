import { useEffect } from "react";
import { CATEGORIES, CATEGORY_EMOJI, OFFERS } from "../data";
import ProductCard from "./ProductCard";

/* ---------- Google reviews settings (edit these two/three values) ---------- */

// 1) Your Google review link: Google Business Profile > "Ask for reviews" > copy link.
const GOOGLE_REVIEW_LINK = "https://g.page/r/CR6J_mQKy6BvEBM/review";

// 2) OPTIONAL reviews widget (Elfsight, Trustindex, etc.).
//    Leave both empty to show only the "Review us on Google" button.
//    WIDGET_SCRIPT = the script URL from the provider's embed code
//    WIDGET_CLASS  = the class on the provider's <div> (for Elfsight it looks like "elfsight-app-xxxxxxxx")
const WIDGET_SCRIPT = "";
const WIDGET_CLASS = "";

function GoogleReviews() {
  useEffect(() => {
    if (!WIDGET_SCRIPT) return;
    if (document.querySelector(`script[src="${WIDGET_SCRIPT}"]`)) return; // load once
    const s = document.createElement("script");
    s.src = WIDGET_SCRIPT;
    s.async = true;
    document.body.appendChild(s);
  }, []);

const hasLink = GOOGLE_REVIEW_LINK && !GOOGLE_REVIEW_LINK.startsWith("PASTE_");
  if (!hasLink && !WIDGET_SCRIPT) return null; // nothing configured yet, show nothing

  return (
    <section>
      <h2>What our customers say</h2>
      {WIDGET_SCRIPT && WIDGET_CLASS && <div className={WIDGET_CLASS} />}
      {hasLink && (
        <div className="panel center">
          <p className="muted">Bought from us? Tell other parents what you think.</p>
          <a
            className="btn ghost"
            href={GOOGLE_REVIEW_LINK}
            target="_blank"
            rel="noreferrer"
          >
            ⭐ Review us on Google
          </a>
        </div>
      )}
    </section>
  );
}

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

      <GoogleReviews />

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

