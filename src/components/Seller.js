import { useState } from "react";
import { CATEGORIES, AGE_GROUPS, formatPrice } from "../data";

/* ---------- CSV helpers ---------- */
function parseCSV(text) {
  const rows = [];
  let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); cur = ""; rows.push(row); row = [];
    } else cur += c;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const TEMPLATE =
  "name,category,brand,price,mrp,stock,age,emoji\n" +
  'Baby Soap Bar,Bath & Care,PureBub,89,109,100,0-6m,🧼\n' +
  'Wooden Rattle,Toys,HappyPlay,199,249,40,0-6m,🪀\n';

function downloadTemplate() {
  const url = URL.createObjectURL(new Blob([TEMPLATE], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "product-upload-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function validate(raw, index) {
  const errors = [];
  const price = Number(raw.price);
  const mrp = raw.mrp ? Number(raw.mrp) : price;
  const stock = Number(raw.stock);
  if (!raw.name?.trim()) errors.push("Name is required");
  if (!CATEGORIES.includes(raw.category)) errors.push(`Category must be one of: ${CATEGORIES.join(", ")}`);
  if (!(price > 0)) errors.push("Price must be a number above 0");
  if (!(mrp >= price)) errors.push("MRP must be a number not less than price");
  if (!Number.isInteger(stock) || stock < 0) errors.push("Stock must be a whole number, 0 or more");
  return {
    errors,
    product: {
      id: "p" + Date.now() + "_" + index,
      name: (raw.name || "").trim(),
      category: raw.category,
      brand: (raw.brand || "").trim() || "Generic",
      price,
      mrp,
      stock,
      age: AGE_GROUPS.includes(raw.age) ? raw.age : "0-6m",
      emoji: raw.emoji || "🧸",
      image: raw.image || "",
      rating: 0,
      sold: 0,
    },
  };
}

const emptyForm = { name: "", category: CATEGORIES[0], brand: "", price: "", mrp: "", stock: "", age: "0-6m", emoji: "", image: "" };

export default function Seller({ products, orders, onAdd, onUpdate, onDelete, showToast }) {
  const [tab, setTab] = useState("single");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState([]);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addSingle = (e) => {
    e.preventDefault();
    const { errors: errs, product } = validate(form, 0);
    if (errs.length) return setErrors(errs);
    onAdd([product]);
    setForm(emptyForm);
    setErrors([]);
    showToast("Product added");
  };

  const onFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    const rows = parseCSV(await file.text());
    if (rows.length < 2) return setPreview({ rows: [], headerError: "The file has no product rows." });
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const needed = ["name", "category", "price", "stock"];
    const missing = needed.filter((n) => !header.includes(n));
    if (missing.length) return setPreview({ rows: [], headerError: `Missing columns: ${missing.join(", ")}. Download the template to see the format.` });
    const parsed = rows.slice(1).map((r, i) => {
      const obj = {};
      header.forEach((h, idx) => (obj[h] = (r[idx] || "").trim()));
      return { ...validate(obj, i), line: i + 2 };
    });
    setPreview({ rows: parsed });
  };

  const confirmImport = () => {
    const good = preview.rows.filter((r) => r.errors.length === 0).map((r) => r.product);
    if (!good.length) return showToast("No valid rows to import");
    onAdd(good);
    showToast(`${good.length} products imported`);
    setPreview(null);
    setFileName("");
  };

  const low = products.filter((p) => p.stock <= 5).length;

  return (
    <section>
      <h1>Seller dashboard</h1>
      <div className="stats">
        <div className="stat"><strong>{products.length}</strong><span>Products</span></div>
        <div className="stat"><strong>{low}</strong><span>Low stock</span></div>
        <div className="stat"><strong>{orders.length}</strong><span>Orders</span></div>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "single"} className={tab === "single" ? "tab active" : "tab"} onClick={() => setTab("single")}>Add one product</button>
        <button role="tab" aria-selected={tab === "bulk"} className={tab === "bulk" ? "tab active" : "tab"} onClick={() => setTab("bulk")}>Bulk upload</button>
      </div>

      {tab === "single" ? (
        <form className="panel form-grid" onSubmit={addSingle}>
          <label>Product name<input value={form.name} onChange={set("name")} /></label>
          <label>Category
            <select value={form.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label>Brand<input value={form.brand} onChange={set("brand")} /></label>
          <label>Age group
            <select value={form.age} onChange={set("age")}>{AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}</select>
          </label>
          <label>Selling price (₹)<input type="number" min="0" value={form.price} onChange={set("price")} /></label>
          <label>MRP (₹)<input type="number" min="0" value={form.mrp} onChange={set("mrp")} /></label>
          <label>Stock quantity<input type="number" min="0" value={form.stock} onChange={set("stock")} /></label>
          <label>Emoji icon (optional)<input maxLength={4} value={form.emoji} onChange={set("emoji")} /></label>
          <label className="span2">Image URL (optional)<input value={form.image} onChange={set("image")} placeholder="https://" /></label>
          {errors.length > 0 && <ul className="error span2">{errors.map((er) => <li key={er}>{er}</li>)}</ul>}
          <button className="btn primary span2">Add product</button>
        </form>
      ) : (
        <div className="panel">
          <p>Upload a CSV file with columns: name, category, brand, price, mrp, stock, age, emoji. Each row becomes one product.</p>
          <div className="row">
            <button className="btn ghost" onClick={downloadTemplate}>Download template</button>
            <label className="btn primary file-btn">
              Choose CSV file
              <input type="file" accept=".csv,text/csv" hidden onChange={(e) => onFile(e.target.files[0])} />
            </label>
            {fileName && <span className="muted">{fileName}</span>}
          </div>

          {preview?.headerError && <p className="error">{preview.headerError}</p>}
          {preview && preview.rows.length > 0 && (
            <>
              <p>
                <strong>{preview.rows.filter((r) => r.errors.length === 0).length}</strong> ready to import,{" "}
                <strong>{preview.rows.filter((r) => r.errors.length > 0).length}</strong> with errors (skipped).
              </p>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Row</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                  <tbody>
                    {preview.rows.map((r) => (
                      <tr key={r.line} className={r.errors.length ? "bad" : ""}>
                        <td>{r.line}</td><td>{r.product.name}</td><td>{r.product.category}</td>
                        <td>{r.product.price || "-"}</td><td>{Number.isNaN(r.product.stock) ? "-" : r.product.stock}</td>
                        <td>{r.errors.length ? r.errors.join("; ") : "Ready"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn primary" onClick={confirmImport}>Import valid products</button>
            </>
          )}
        </div>
      )}

      <h2>Your products</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.emoji} {p.name}</td>
                <td>{p.category}</td>
                <td>{formatPrice(p.price)}</td>
                <td>
                  <input className="stock-input" type="number" min="0" value={p.stock}
                    onChange={(e) => onUpdate(p.id, { stock: Math.max(0, Number(e.target.value) || 0) })} />
                </td>
                <td><button className="link" onClick={() => onDelete(p.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
