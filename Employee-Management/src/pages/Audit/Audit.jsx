import React, { useMemo, useState } from 'react';
import { Shield, Search, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime, formatRelative } from '../../utils/formatters';

const SEVERITY_CONFIG = {
  info:     { icon: Info,          color: 'var(--color-primary-400)',  bg: 'rgba(66,133,244,0.12)' },
  warning:  { icon: AlertTriangle, color: 'var(--color-warning-400)', bg: 'rgba(245,158,11,0.12)' },
  critical: { icon: AlertCircle,   color: 'var(--color-danger-400)',  bg: 'rgba(234,67,53,0.12)' },
};

export default function Audit() {
  const { auditLog } = useApp();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');

  const filtered = useMemo(() => {
    return auditLog.filter((entry) => {
      const matchSearch = !search ||
        entry.description?.toLowerCase().includes(search.toLowerCase()) ||
        entry.userName?.toLowerCase().includes(search.toLowerCase()) ||
        entry.action?.toLowerCase().includes(search.toLowerCase());
      const matchSeverity = severity === 'all' || entry.severity === severity;
      return matchSearch && matchSeverity;
    });
  }, [auditLog, search, severity]);

  const stats = useMemo(() => ({
    total: auditLog.length,
    critical: auditLog.filter((e) => e.severity === 'critical').length,
    warning: auditLog.filter((e) => e.severity === 'warning').length,
    today: auditLog.filter((e) => {
      const d = new Date(e.timestamp);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
  }), [auditLog]);

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Audit Log</h1>
          <p className="module-page__subtitle">System activity and security events</p>
        </div>
      </div>

      <div className="module-stats animate-fadeInUp">
        <div className="module-stat">
          <div className="module-stat__value">{stats.total}</div>
          <div className="module-stat__label">Total events</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value" style={{ color: 'var(--color-danger-400)' }}>{stats.critical}</div>
          <div className="module-stat__label">Critical</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value" style={{ color: 'var(--color-warning-400)' }}>{stats.warning}</div>
          <div className="module-stat__label">Warnings</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value">{stats.today}</div>
          <div className="module-stat__label">Today</div>
        </div>
      </div>

      <div className="module-filters animate-fadeInUp">
        <div className="module-search">
          <Search size={16} className="module-search__icon" />
          <input
            className="module-search__input"
            placeholder="Search actions, users, descriptions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="module-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="all">All severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="module-table-wrap animate-fadeInUp">
        {filtered.length === 0 ? (
          <div className="module-empty">
            <Shield size={40} opacity={0.3} />
            <h3>No audit events found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <table className="module-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Action</th>
                <th>Description</th>
                <th>User</th>
                <th>Entity</th>
                <th>IP</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const cfg = SEVERITY_CONFIG[entry.severity] || SEVERITY_CONFIG.info;
                const Icon = cfg.icon;
                return (
                  <tr key={entry.id}>
                    <td>
                      <span className="status-badge" style={{ color: cfg.color, background: cfg.bg, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon size={12} /> {entry.severity}
                      </span>
                    </td>
                    <td><code style={{ fontSize: 'var(--text-xs)' }}>{entry.action}</code></td>
                    <td>{entry.description}</td>
                    <td>{entry.userName}</td>
                    <td>{entry.entity} <span style={{ color: 'var(--text-muted)' }}>#{entry.entityId?.slice(-4)}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>{entry.ipAddress}</td>
                    <td title={formatDateTime(entry.timestamp)}>{formatRelative(entry.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
