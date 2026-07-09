import React, { useMemo, useState } from 'react';
import { Clock, LogIn, LogOut, Coffee, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatDate, formatHours, getStatusColor, getStatusBg } from '../../utils/formatters';
import Button from '../../components/ui/Button/Button';

export default function Attendance() {
  const { attendance, clockSession, clockIn, clockOut, startBreak, endBreak, employees } = useApp();
  const { user, isManager } = useAuth();
  const { success } = useNotification();
  const [tab, setTab] = useState('today');

  const mySession = clockSession?.employeeId === user?.id ? clockSession : null;
  const isClockedIn = Boolean(mySession);

  const myRecords = useMemo(() =>
    attendance.filter((a) => a.employeeId === user?.id),
  [attendance, user]);

  const allRecords = useMemo(() =>
    isManager()
      ? attendance.map((a) => ({
          ...a,
          name: employees.find((e) => e.id === a.employeeId)?.firstName || a.employeeId,
        }))
      : myRecords,
  [attendance, employees, isManager, myRecords]);

  const handleClockIn = () => {
    clockIn(user.id);
    success('Clocked in successfully!');
  };

  const handleClockOut = () => {
    clockOut(user.id);
    success('Clocked out. Have a great evening!');
  };

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Attendance</h1>
          <p className="module-page__subtitle">{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      <div className="module-card card-glass animate-fadeInUp" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {isClockedIn ? (mySession.status === 'on_break' ? 'On Break' : 'Currently Working') : 'Not Clocked In'}
          </p>
          {isClockedIn && mySession.clockIn && (
            <p className="module-card__meta">Since {new Date(mySession.clockIn).toLocaleTimeString()}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!isClockedIn ? (
            <Button variant="primary" leftIcon={<LogIn size={14} />} onClick={handleClockIn}>Clock In</Button>
          ) : (
            <>
              {mySession.status === 'working' ? (
                <Button variant="secondary" leftIcon={<Coffee size={14} />} onClick={() => { startBreak(); success('Break started'); }}>Start Break</Button>
              ) : (
                <Button variant="secondary" leftIcon={<Coffee size={14} />} onClick={() => { endBreak(); success('Break ended'); }}>End Break</Button>
              )}
              <Button variant="danger" leftIcon={<LogOut size={14} />} onClick={handleClockOut}>Clock Out</Button>
            </>
          )}
        </div>
      </div>

      <div className="module-stats animate-fadeInUp">
        <div className="module-stat">
          <div className="module-stat__value">{myRecords.filter((r) => r.status === 'present').length}</div>
          <div className="module-stat__label">Present days</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value">{myRecords.filter((r) => r.status === 'late').length}</div>
          <div className="module-stat__label">Late days</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value">{formatHours(myRecords.reduce((s, r) => s + (r.hoursWorked || 0), 0))}</div>
          <div className="module-stat__label">Total hours</div>
        </div>
      </div>

      <div className="module-tabs">
        <button className={`module-tab ${tab === 'today' ? 'module-tab--active' : ''}`} onClick={() => setTab('today')}>History</button>
        <button className={`module-tab ${tab === 'calendar' ? 'module-tab--active' : ''}`} onClick={() => setTab('calendar')}>Calendar View</button>
      </div>

      {tab === 'history' || tab === 'today' ? (
        <div className="module-table-wrap animate-fadeInUp">
          <table className="module-table">
            <thead>
              <tr>
                {isManager() && <th>Employee</th>}
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allRecords.slice(0, 20).map((r) => (
                <tr key={r.id}>
                  {isManager() && <td>{r.name || r.employeeId}</td>}
                  <td>{formatDate(r.date)}</td>
                  <td><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{r.clockIn}</td>
                  <td>{r.clockOut}</td>
                  <td>{formatHours(r.hoursWorked)}</td>
                  <td>
                    <span className="status-badge" style={{ color: getStatusColor(r.status), background: getStatusBg(r.status) }}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="module-grid animate-fadeInUp">
          {myRecords.slice(0, 14).map((r) => (
            <div key={r.id} className="module-card" style={{ textAlign: 'center' }}>
              <Calendar size={20} style={{ margin: '0 auto 8px', color: 'var(--color-primary-400)' }} />
              <p className="module-card__title">{formatDate(r.date, 'MMM d')}</p>
              <span className="status-badge" style={{ color: getStatusColor(r.status), background: getStatusBg(r.status) }}>{r.status}</span>
              <p className="module-card__meta" style={{ marginTop: 8 }}>{r.clockIn} – {r.clockOut}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
