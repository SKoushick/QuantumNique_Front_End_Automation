import React, { useState, useMemo } from 'react';
import { Building2, Plus, Users, Pencil, Trash2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import Button from '../../components/ui/Button/Button';

export default function Departments() {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useApp();
  const { isHR } = useAuth();
  const { success } = useNotification();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', color: '#4285F4', headId: '' });

  const enriched = useMemo(() =>
    departments.map((d) => ({
      ...d,
      count: employees.filter((e) => e.department === d.id && e.status === 'active').length,
      head: employees.find((e) => e.id === d.headId),
    })).filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase())),
  [departments, employees, search]);

  const openAdd = () => {
    setForm({ name: '', code: '', color: '#4285F4', headId: '' });
    setModal('add');
  };

  const openEdit = (dept) => {
    setForm({ name: dept.name, code: dept.code, color: dept.color, headId: dept.headId || '' });
    setModal(dept.id);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name) return;
    if (modal === 'add') {
      addDepartment(form);
      success('Department created.');
    } else {
      updateDepartment(modal, form);
      success('Department updated.');
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this department?')) return;
    deleteDepartment(id);
    success('Department deleted.');
  };

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Departments</h1>
          <p className="module-page__subtitle">{departments.length} departments · {employees.filter((e) => e.status === 'active').length} active employees</p>
        </div>
        {isHR() && (
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={openAdd}>Add Department</Button>
        )}
      </div>

      <div className="module-filters">
        <div className="module-search">
          <Search size={15} className="module-search__icon" />
          <input className="module-search__input" placeholder="Search departments…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="module-grid animate-fadeInUp">
        {enriched.map((dept) => (
          <div key={dept.id} className="module-card hover-lift">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${dept.color}22`, color: dept.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} />
              </div>
              {isHR() && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="icon-btn" onClick={() => openEdit(dept)} aria-label="Edit"><Pencil size={14} /></button>
                  <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(dept.id)} aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            <h3 className="module-card__title" style={{ marginTop: 12 }}>{dept.name}</h3>
            <p className="module-card__meta">{dept.code}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <Users size={14} color="var(--text-muted)" />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{dept.count} employees</span>
            </div>
            {dept.head && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(`${dept.head.firstName} ${dept.head.lastName}`), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700 }}>
                  {getInitials(`${dept.head.firstName} ${dept.head.lastName}`)}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Head: {dept.head.firstName} {dept.head.lastName}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Department form">
            <h2 className="modal__title">{modal === 'add' ? 'Add Department' : 'Edit Department'}</h2>
            <form className="module-form" onSubmit={handleSave}>
              <div className="module-field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="module-field">
                <label>Code</label>
                <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
              </div>
              <div className="module-field">
                <label>Department head</label>
                <select value={form.headId} onChange={(e) => setForm((p) => ({ ...p, headId: e.target.value }))}>
                  <option value="">None</option>
                  {employees.filter((e) => ['manager', 'admin'].includes(e.role)).map((e) => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="modal__actions">
                <Button variant="secondary" type="button" onClick={() => setModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
