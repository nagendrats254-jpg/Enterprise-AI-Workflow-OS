import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/>
      <circle cx="10" cy="10" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 13.5C18.1 12.4 19 11 19 11s-4-7-9-7c-1.1 0-2.1.2-3 .5"/>
      <path d="M6.5 5.5C3.5 7 1 11 1 11s4 7 9 7c2.1 0 4-.7 5.5-1.8"/>
      <path d="M2 2l16 16"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email address.';
    if (!form.password) errors.password = 'Password is required.';
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const dest = { admin: '/admin', manager: '/manager', employee: '/employee' }[user.role] || '/employee';
      navigate(dest, { replace: true });
    } catch (_) {
      // error handled in context
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(f => ({ ...f, [name]: '' }));
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-navy-900)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
    }}>

      {/* Background grid pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        zIndex: 0,
      }} aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>

        {/* Product mark */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48, background: 'var(--color-violet-500)',
            borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <svg width="26" height="26" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="10" cy="10" r="7"/>
              <path d="M10 6v4l2.5 2.5"/>
              <circle cx="10" cy="10" r="1.5" fill="white" stroke="none"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            ENTERPRISE.AI
          </h1>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
            Smart Workflow Management
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14,
          padding: '32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.36)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
            Enter your credentials to access the platform.
          </p>

          {/* Global error */}
          {error && (
            <div role="alert" style={{
              padding: '10px 14px', borderRadius: 6, background: 'var(--color-danger-100)',
              border: '1px solid #fca5a5', color: 'var(--color-danger-600)',
              fontSize: 13, marginBottom: 18,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label required" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                disabled={loading}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && <span id="email-error" className="form-error">{fieldErrors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label required" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  disabled={loading}
                  style={{ paddingRight: 42 }}
                  aria-describedby={fieldErrors.password ? 'pw-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {fieldErrors.password && <span id="pw-error" className="form-error">{fieldErrors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: 20, padding: '10px 14px', borderRadius: 6,
            background: 'var(--color-surface-dim)', border: '1px solid var(--color-border)',
            fontSize: 12, color: 'var(--color-text-muted)',
          }}>
            <strong style={{ color: 'var(--color-text-secondary)' }}>Demo accounts</strong>
            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span>admin@enterprise.ai / admin123</span>
              <span>manager@enterprise.ai / manager123</span>
              <span>employee@enterprise.ai / employee123</span>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          Enterprise Cognitive AI Operating System
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
