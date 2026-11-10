import React from 'react';

// Tiny dependency-free SVG charts.

export function LineChart({ data, height = 220, format = (v) => v }) {
  const w = 720, pad = { l: 56, r: 12, t: 12, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const iw = w - pad.l - pad.r, ih = height - pad.t - pad.b;
  const x = (i) => pad.l + (data.length < 2 ? iw / 2 : (i * iw) / (data.length - 1));
  const y = (v) => pad.t + ih - (v / max) * ih;
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const area = data.length ? `${x(0)},${pad.t + ih} ${pts} ${x(data.length - 1)},${pad.t + ih}` : '';
  const step = Math.max(1, Math.ceil(data.length / 8));
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="chart" role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(max * t)} y2={y(max * t)} stroke="#e5e7eb" />
          <text x={pad.l - 6} y={y(max * t) + 4} fontSize="10" textAnchor="end" fill="#6b7280">{format(Math.round(max * t))}</text>
        </g>
      ))}
      <polygon points={area} fill="rgba(37,99,235,.12)" />
      <polyline points={pts} fill="none" stroke="#2563eb" strokeWidth="2" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r="2.5" fill="#2563eb"><title>{`${d.label}: ${format(d.value)}`}</title></circle>
          {i % step === 0 && <text x={x(i)} y={height - 8} fontSize="10" textAnchor="middle" fill="#6b7280">{d.label.slice(5)}</text>}
        </g>
      ))}
    </svg>
  );
}

export function HBars({ data, format = (v) => v, color = '#2563eb' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="hbars">
      {data.map((d) => (
        <div className="hbar" key={d.label}>
          <span className="hbar-label" title={d.label}>{d.label}</span>
          <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(d.value / max) * 100}%`, background: color }} /></div>
          <span className="hbar-val">{format(d.value)}</span>
        </div>
      ))}
      {!data.length && <div className="muted">No data</div>}
    </div>
  );
}
