import { useState, useMemo } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, Avatar } from '../../components/ui/Components';
import { IconSearch } from '../../components/ui/Icons';
import { auditApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { DEMO_AUDIT_LOGS } from '../../data/demoData';

const ACTIONS = ['All Actions', 'Created user', 'Updated user', 'Deleted user', 'Created project', 'Updated project', 'Deleted project', 'Created task', 'Updated task', 'Deleted task', 'Logged in', 'Logged out'];

const actionBadge = {
  'Created user':        { bg: 'var(--color-success-100)',  color: 'var(--color-success-700)'  },
  'Updated user':        { bg: 'var(--color-info-100)',     color: 'var(--color-info-700)'     },
  'Deleted user':        { bg: 'var(--color-danger-100)',   color: 'var(--color-danger-700)'   },
  'Created project':     { bg: 'var(--color-info-100)',     color: 'var(--color-info-700)'     },
  'Updated project':     { bg: 'var(--color-info-100)',     color: 'var(--color-info-700)'     },
  'Deleted project':     { bg: 'var(--color-danger-100)',   color: 'var(--color-danger-700)'   },
  'Created task':        { bg: 'var(--color-violet-50)',    color: 'var(--color-violet-700)'   },
  'Updated task':        { bg: 'var(--color-warning-100)',  color: 'var(--color-warning-700)'  },
  'Deleted task':        { bg: 'var(--color-danger-100)',   color: 'var(--color-danger-700)'   },
  'Logged in':           { bg: 'var(--color-success-100)',  color: 'var(--color-success-700)'  },
  'Logged out':          { bg: 'var(--color-slate-100)',    color: 'var(--color-slate-600)'    },
};

export default function AuditLogsPage() {
  const { data: auditData, loading } = useApi(auditApi.list);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All Actions');

  const isLive = !!auditData?.logs;
  const logs = auditData?.logs || DEMO_AUDIT_LOGS;

  const filtered = useMemo(() => {
    return logs.filter(log => {
      const q = search.toLowerCase();
      const matchSearch =
        (log.user || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q) ||
        (log.resource || '').toLowerCase().includes(q) ||
        (log.ip || '').includes(q);
      const matchAction = actionFilter === 'All Actions' || (log.action || '').toLowerCase().includes(actionFilter.toLowerCase());
      return matchSearch && matchAction;
    });
  }, [logs, search, actionFilter]);

  return (
    <AppShell pageTitle="Audit Logs">
      <div style={{ maxWidth: 1200 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">Audit Logs</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live DB
              </span>
            ) : loading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Immutable record of all administrative, project, and session actions in PostgreSQL.
          </p>
        </div>

        {!isLive && !loading && <DemoBanner message="Showing demo audit records. Live database records will stream here." />}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="topbar-search" style={{ flex: 1, maxWidth: 320 }}>
            <IconSearch style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
            <input
              placeholder="Search by user, action, resource, or IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search audit logs"
            />
          </div>
          <select
            className="form-input form-select"
            style={{ width: 180, height: 34, fontSize: 13 }}
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            aria-label="Filter by action"
          >
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            {filtered.length} entries recorded
          </span>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                      No audit logs match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map(log => {
                    const badge = actionBadge[log.action] || { bg: 'var(--color-slate-100)', color: 'var(--color-slate-600)' };
                    return (
                      <tr key={log.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar name={log.user || 'Unknown'} size={24} />
                            <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-text-primary)' }}>{log.user || 'System'}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                            background: badge.bg, color: badge.color,
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {log.resource}
                          </span>
                        </td>
                        <td>
                          <span className="meta-text">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}</span>
                        </td>
                        <td>
                          <span className="meta-text" style={{ fontFamily: 'var(--font-mono)' }}>{log.ip || '127.0.0.1'}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
