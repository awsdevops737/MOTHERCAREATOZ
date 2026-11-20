import React, { useState } from 'react';
import { inr } from '../adminData';
import { Modal } from './ui';

export default function Products({ store, update }) {
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  const rows = store.products.filter((p) => !q || (p.name + p.category + p.sku).toLowerCase().includes(q.toLowerCase()));

  const save = () => {
    const p = { ...edit, price: Number(edit.price), stock: Number(edit.stock) };
    update((st) => ({
      ...st,
      products: st.products.some((x) => x.id === p.id) ? st.products.map((x) => (x.id === p.id ? p : x)) : [p, ...st.products],
    }));
    setEdit(null);
  };
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value });

  return (
    <div>
      <h1>Products</h1>
      <div className="toolbar">
        <input placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn" onClick={() => setEdit({ id: 'P' + Date.now(), sku: '', name: '', category: '', price: 0, stock: 0, active: true })}>+ Add product</button>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Active</th><th /></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.sku}</td><td>{p.category}</td><td>{inr(p.price)}</td>
                <td style={{ color: p.stock <= 10 ? '#dc2626' : undefined }}>{p.stock}</td>
                <td>{p.active ? 'Yes' : 'No'}</td>
                <td><button className="btn ghost sm" onClick={() => setEdit(p)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <Modal title={edit.name || 'New product'} onClose={() => setEdit(null)}>
          <div className="form">
            <label>Name<input value={edit.name} onChange={set('name')} /></label>
            <label>SKU<input value={edit.sku} onChange={set('sku')} /></label>
            <label>Category<input value={edit.category} onChange={set('category')} /></label>
            <label>Price (₹)<input type="number" value={edit.price} onChange={set('price')} /></label>
            <label>Stock<input type="number" value={edit.stock} onChange={set('stock')} /></label>
            <label className="row"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Active (visible in store)</label>
            <button className="btn" onClick={save} disabled={!edit.name}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
