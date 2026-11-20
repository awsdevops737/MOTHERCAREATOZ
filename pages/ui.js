import React from 'react';

export const Stat = ({ label, value, sub }) => (
  <div className="card stat">
    <div className="lbl">{label}</div>
    <div className="val">{value}</div>
    {sub && <div className="sub">{sub}</div>}
  </div>
);

const TONE = {
  Delivered: 'green', Paid: 'green', Processed: 'green', Approved: 'blue',
  Cancelled: 'red', Returned: 'red', Failed: 'red', Rejected: 'red',
  Requested: 'amber', Pending: 'amber', 'COD-Pending': 'amber', 'Return requested': 'amber',
  Refunded: 'blue', Shipped: 'blue', 'Out for delivery': 'blue',
};
export const Pill = ({ children }) => <span className={'pill ' + (TONE[children] || '')}>{children}</span>;

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>{title}</h2>
          <button className="btn ghost sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Orders that count as revenue
export const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
