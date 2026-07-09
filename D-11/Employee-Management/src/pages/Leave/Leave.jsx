import React, { useState, useMemo } from 'react';
import { CalendarOff, Plus, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LEAVE_TYPES } from '../../utils/constants';
import { formatDate, getStatusColor, getStatusBg } from '../../utils/formatters';
import Button from '../../components/ui/Button/Button';

export default function Leave() {
  const { leaves, addLeave, updateLeave, employees } = useApp();
  const { user, isHR, isManager } = useAuth();
  const { success } = useNotification();
  const [tab, setTab] = useState('requests');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });

  const visibleLeaves = useMemo(() => {
    if (isHR()) return leaves;
    if (isManager()) return leaves.filter((l) => {
      const emp = employees.find((e) => e.id === l.employeeId);
      return l.employeeId === user.id || emp?.manager === user.id;
    });
    return leaves.filter((l) => l.employeeId === user.id);
  }, [leaves, user, isHR, isManager, employees]);

  const balance = user?.leaveBalance || { annual: 0, sick: 0, casual: 0 };

  const handleSubmit = (e) => {
    e.preventDefault();
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const days = Math.max(1, Math.ceil((end - start) / 86400000) + 1);
    addLeave({
      employeeId: user.id,
      employeeName: `${user.firstName} ${user.lastName}`,
      ...form,
      days,
    });
    success('Leave request submitted.');
    setModal(false);
    setForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
  };

  const handleApprove = (id, approve) => {
    updateLeave(id, {
      status: approve ? 'approved' : 'rejected',
      approvedBy: user.id,
      comments: approve ? 'Approved.' : 'Rejected.',
    });
    success(approve ? 'Leave approved.' : 'Leave rejected.');
  };

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Leave Management</h1>
          <p className="module-page__subtitle">Request and manage time off</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setModal(true)}>Request Leave</Button>
      </div>

      <div className="module-stats animate-fadeInUp">
        {LEAVE_TYPES.slice(0, 3).map((lt) => (
          <div key={lt.id} className="module-stat">
            <div className="module-stat__value">{balance[lt.id] ?? 0}</div>
            <div className="module-stat__label">{lt.label} remaining</div>
          </div>
        ))}
      </div>

      <div className="module-tabs">
        <button className={`module-tab ${tab === 'requests' ? 'module-tab--active' : ''}`} onClick={() => setTab('requests')}>Requests</button>
        <button className={`module-tab ${tab === 'history' ? 'module-tab--active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>

      <div className="module-table-wrap animate-fadeInUp">
        <table className="module-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Status</th>
              {(isHR() || isManager()) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visibleLeaves
              .filter((l) => tab === 'history' ? ['approved', 'rejected'].includes(l.status) : l.status === 'pending')
              .map((l) => (
                <tr key={l.id}>
                  <td>{l.employeeName}</td>
                  <td style={{ textTransform: 'capitalize' }}>{l.type.replace('_', ' ')}</td>
                  <td>{formatDate(l.startDate)} – {formatDate(l.endDate)}</td>
                  <td>{l.days}</td>
                  <td>
                    <span className="status-badge" style={{ color: getStatusColor(l.status), background: getStatusBg(l.status) }}>{l.status}</span>
                  </td>
                  {(isHR() || isManager()) && l.status === 'pending' && (
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="icon-btn" onClick={() => handleApprove(l.id, true)} aria-label="Approve"><Check size={14} color="var(--color-success-400)" /></button>
                        <button className="icon-btn icon-btn--danger" onClick={() => handleApprove(l.id, false)} aria-label="Reject"><X size={14} /></button>
                      </div>
                    </td>
                  )}
                  {(isHR() || isManager()) && l.status !== 'pending' && <td>—</td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title"><CalendarOff size={18} style={{ display: 'inline', marginRight: 8 }} />Request Leave</h2>
            <form className="module-form" onSubmit={handleSubmit}>
              <div className="module-field">
                <label>Leave type</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                  {LEAVE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="module-form-row">
                <div className="module-field">
                  <label>Start date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} required />
                </div>
                <div className="module-field">
                  <label>End date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} required />
                </div>
              </div>
              <div className="module-field">
                <label>Reason</label>
                <textarea value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} required />
              </div>
              <div className="modal__actions">
                <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
