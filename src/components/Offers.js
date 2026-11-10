import { OFFERS } from "../data";

export default function Offers({ onApply, showToast }) {
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast(`${code} copied`);
    } catch {
      showToast(`Your code is ${code}`);
    }
  };
  return (
    <section>
      <h1>Offers</h1>
      <div className="offer-list">
        {OFFERS.map((o) => (
          <div className="offer-card" key={o.code}>
            <div>
              <h3>{o.title}</h3>
              <p className="muted">{o.desc}</p>
              <p className="code">{o.code}</p>
            </div>
            <div className="col">
              <button className="btn ghost" onClick={() => copy(o.code)}>Copy code</button>
              <button className="btn primary" onClick={() => onApply(o.code)}>Apply in cart</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
