// Reusable UI primitives

// ── Badge / Status chip ──────────────────────────────────────
export function Badge({ variant = 'neutral', children, dot = true }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

// ── Task Status Badge ────────────────────────────────────────
const statusMap = {
  'not_started':  { variant: 'neutral',  label: 'Not Started' },
  'in_progress':  { variant: 'info',     label: 'In Progress' },
  'completed':    { variant: 'success',  label: 'Completed'   },
  'delayed':      { variant: 'danger',   label: 'Delayed'     },
  'on_hold':      { variant: 'warning',  label: 'On Hold'     },
};
export function StatusBadge({ status }) {
  const s = statusMap[status] || statusMap['not_started'];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

// ── Priority Badge ───────────────────────────────────────────
const priorityMap = {
  critical: 'badge-priority-critical',
  high:     'badge-priority-high',
  medium:   'badge-priority-medium',
  low:      'badge-priority-low',
};
export function PriorityBadge({ priority }) {
  const cls = priorityMap[priority] || priorityMap.low;
  return (
    <span className={`badge ${cls}`} style={{ textTransform: 'capitalize' }}>
      {priority}
    </span>
  );
}

// ── Prediction Chip ──────────────────────────────────────────
const riskColors = {
  high:   { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  medium: { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
  low:    { bg: '#dcfce7', border: '#86efac', text: '#166534' },
};
export function RiskChip({ level, score }) {
  const c = riskColors[level] || riskColors.low;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', fontSize: 11, fontWeight: 500,
      borderRadius: 4, border: `1px solid ${c.border}`,
      background: c.bg, color: c.text,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>Risk</span>
      {level} {score !== undefined && `(${(score * 100).toFixed(0)}%)`}
    </span>
  );
}

export function DelayChip({ probability }) {
  const pct = Math.round(probability * 100);
  const c = pct > 65 ? riskColors.high : pct > 35 ? riskColors.medium : riskColors.low;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', fontSize: 11, fontWeight: 500,
      borderRadius: 4, border: `1px solid ${c.border}`,
      background: c.bg, color: c.text,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>Delay</span>
      {pct}%
    </span>
  );
}

// ── Progress Bar ─────────────────────────────────────────────
export function ProgressBar({ value = 0, max = 100, variant }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const v = variant || (pct >= 80 ? 'danger' : pct >= 60 ? 'warning' : '');
  return (
    <div className="progress-bar">
      <div className={`progress-fill ${v}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 16, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: 4 }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <Skeleton height={14} width="40%" />
      <div style={{ marginTop: 12 }}><Skeleton height={36} width="60%" /></div>
      <div style={{ marginTop: 8 }}><Skeleton height={12} width="30%" /></div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <div className="empty-title">{title}</div>
      {description && <div className="empty-desc">{description}</div>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────
import { useEffect } from 'react';
import { IconX } from './Icons';

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  const maxW = { sm: 420, md: 540, lg: 720, xl: 900 }[size] || 540;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: maxW }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <span id="modal-title" className="section-title">{title}</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close">
            <IconX style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Demo Banner ───────────────────────────────────────────────
export function DemoBanner({ message = 'This section shows demo data. Connect the backend to see live information.' }) {
  return (
    <div className="demo-banner" role="status">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="8"/>
        <path d="M10 9v5M10 6v1"/>
      </svg>
      <span><strong>Demo Data</strong> — {message}</span>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#7c3aed','#0369a1','#166534','#b45309','#9b1c1c','#1d4ed8',
];
export function Avatar({ name = '', size = 28 }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.22),
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: 700, color: '#fff',
      flexShrink: 0, userSelect: 'none',
    }}>
      {initials || '?'}
    </div>
  );
}

// ── Dropdown Menu ─────────────────────────────────────────────
import { useState, useRef } from 'react';

export function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="dropdown-menu">
          {items.map((item, i) =>
            item.divider
              ? <div key={i} className="dropdown-divider" />
              : (
                <div
                  key={i}
                  className={`dropdown-item ${item.danger ? 'danger' : ''}`}
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                >
                  {item.icon && <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
                  {item.label}
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              marginLeft: 6, padding: '1px 6px', borderRadius: 10,
              background: active === tab.id ? 'rgba(124,58,237,0.12)' : 'var(--color-border)',
              fontSize: 10, fontWeight: 600, color: active === tab.id ? 'var(--color-violet-600)' : 'var(--color-text-muted)',
            }}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Input / Select wrappers ───────────────────────────────────
export function FormGroup({ label, required, error, hint, children }) {
  return (
    <div className="form-group">
      {label && <label className={`form-label ${required ? 'required' : ''}`}>{label}</label>}
      {children}
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`form-input ${error ? 'error' : ''} ${className}`}
      {...props}
    />
  );
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`form-input form-textarea ${error ? 'error' : ''} ${className}`}
      {...props}
    />
  );
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`form-input form-select ${error ? 'error' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
