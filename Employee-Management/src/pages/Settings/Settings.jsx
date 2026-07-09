import React, { useState, useEffect } from 'react';
import { User, Lock, Sun, Moon, Bell, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';
import Button from '../../components/ui/Button/Button';

const THEME_KEY = 'ems_theme';

export default function Settings() {
  const { user, changePassword, updateUser } = useAuth();
  const { updateEmployee, addAuditEntry } = useApp();
  const { success, error: notifyError } = useNotification();

  const [tab, setTab] = useState('profile');
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    leaveAlerts: true,
    taskReminders: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    const updates = { ...profile };
    updateUser(updates);
    updateEmployee(user.id, updates);
    addAuditEntry({
      action: 'profile.update',
      entity: 'User',
      entityId: user.id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      description: 'Updated profile information',
    });
    success('Profile updated successfully.');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      notifyError('New passwords do not match.');
      return;
    }
    try {
      await changePassword(passwords.current, passwords.next);
      addAuditEntry({
        action: 'password.change',
        entity: 'Auth',
        entityId: user.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        description: 'Password changed successfully',
        severity: 'warning',
      });
      success('Password changed successfully.');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      notifyError(err.message);
    }
  };

  const fullName = `${user?.firstName} ${user?.lastName}`;

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Settings</h1>
          <p className="module-page__subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-6)', alignItems: 'start' }} className="settings-layout">
        <nav className="module-card" style={{ padding: 'var(--space-3)' }}>
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'appearance', label: 'Appearance', icon: Sun },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`sidebar__item ${tab === id ? 'sidebar__item--active' : ''}`}
              style={{ width: '100%', marginBottom: 4 }}
              onClick={() => setTab(id)}
            >
              <span className="sidebar__item-icon"><Icon size={16} /></span>
              <span className="sidebar__item-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="module-card animate-fadeInUp">
          {tab === 'profile' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: getAvatarColor(fullName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 22 }}>
                  {getInitials(fullName)}
                </div>
                <div>
                  <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>{fullName}</h2>
                  <p className="module-card__meta">{user?.email}</p>
                  <span className="status-badge" style={{ marginTop: 8, color: 'var(--color-primary-400)', background: 'rgba(66,133,244,0.12)' }}>
                    {ROLE_LABELS[user?.role] || user?.role}
                  </span>
                </div>
              </div>
              <form className="module-form" onSubmit={handleProfileSave}>
                <div className="module-form-row">
                  <div className="module-field">
                    <label>First name</label>
                    <input value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} required />
                  </div>
                  <div className="module-field">
                    <label>Last name</label>
                    <input value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} required />
                  </div>
                </div>
                <div className="module-form-row">
                  <div className="module-field">
                    <label>Phone</label>
                    <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="module-field">
                    <label>Location</label>
                    <input value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} />
                  </div>
                </div>
                <div className="module-field">
                  <label>Employee ID</label>
                  <input value={user?.employeeId || ''} disabled />
                </div>
                <Button type="submit" variant="primary" leftIcon={<Save size={14} />}>Save Profile</Button>
              </form>
            </>
          )}

          {tab === 'security' && (
            <form className="module-form" onSubmit={handlePasswordChange}>
              <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 16 }}>Change Password</h2>
              <div className="module-field">
                <label>Current password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                    required
                  />
                  <button type="button" className="icon-btn" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setShowCurrent((v) => !v)} aria-label="Toggle visibility">
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="module-field">
                <label>New password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={passwords.next}
                    onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                    required
                    minLength={6}
                  />
                  <button type="button" className="icon-btn" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setShowNew((v) => !v)} aria-label="Toggle visibility">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="module-field">
                <label>Confirm new password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" variant="primary" leftIcon={<Lock size={14} />}>Update Password</Button>
            </form>
          )}

          {tab === 'appearance' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 16 }}>Theme</h2>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'light', label: 'Light', icon: Sun },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className="module-card"
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      borderColor: theme === id ? 'var(--color-primary-500)' : undefined,
                      textAlign: 'center',
                    }}
                    onClick={() => setTheme(id)}
                  >
                    <Icon size={24} style={{ margin: '0 auto 8px' }} />
                    <p className="module-card__title">{label}</p>
                    {theme === id && <span className="status-badge" style={{ color: 'var(--color-primary-400)', background: 'rgba(66,133,244,0.12)' }}>Active</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 16 }}>Notification Preferences</h2>
              {[
                { key: 'emailNotifs', label: 'Email notifications', desc: 'Receive updates via email' },
                { key: 'leaveAlerts', label: 'Leave alerts', desc: 'Notify when leave requests need action' },
                { key: 'taskReminders', label: 'Task reminders', desc: 'Remind about upcoming task deadlines' },
                { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Summary of activity every Monday' },
              ].map(({ key, label, desc }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{label}</p>
                    <p className="module-card__meta">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: 'var(--color-primary-500)' }}
                  />
                </label>
              ))}
              <Button variant="primary" leftIcon={<Save size={14} />} style={{ marginTop: 16 }} onClick={() => success('Notification preferences saved.')}>
                Save Preferences
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
