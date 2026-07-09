import React, { useMemo, useState } from 'react';
import { FolderKanban, Plus, Trash2, Users, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatDate, getStatusColor, getStatusBg } from '../../utils/formatters';
import Button from '../../components/ui/Button/Button';

const STATUS_LABELS = {
  planning: 'Planning',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const PRIORITY_LABELS = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

export default function Projects() {
  const { projects, tasks, addProject, updateProject, deleteProject, employees } = useApp();
  const { user, isManager } = useAuth();
  const { success } = useNotification();
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', status: 'planning', priority: 'medium',
    startDate: '', endDate: '', lead: user?.id || '', members: [],
  });

  const visible = useMemo(() => {
    let list = isManager()
      ? projects
      : projects.filter((p) => p.members?.includes(user.id) || p.lead === user.id);
    if (filter !== 'all') list = list.filter((p) => p.status === filter);
    return list;
  }, [projects, filter, user, isManager]);

  const getEmployee = (id) => employees.find((e) => e.id === id);
  const getName = (id) => {
    const e = getEmployee(id);
    return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    addProject({
      ...form,
      members: form.members.length ? form.members : [user.id],
      color: '#4285F4',
    });
    success('Project created.');
    setModal(false);
    setForm({ name: '', description: '', status: 'planning', priority: 'medium', startDate: '', endDate: '', lead: user?.id || '', members: [] });
  };

  const toggleMember = (empId) => {
    setForm((p) => ({
      ...p,
      members: p.members.includes(empId)
        ? p.members.filter((m) => m !== empId)
        : [...p.members, empId],
    }));
  };

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Projects</h1>
          <p className="module-page__subtitle">{visible.length} active projects</p>
        </div>
        {isManager() && (
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setModal(true)}>New Project</Button>
        )}
      </div>

      <div className="module-tabs">
        <button className={`module-tab ${filter === 'all' ? 'module-tab--active' : ''}`} onClick={() => setFilter('all')}>All</button>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <button key={k} className={`module-tab ${filter === k ? 'module-tab--active' : ''}`} onClick={() => setFilter(k)}>{v}</button>
        ))}
      </div>

      <div className="module-grid animate-fadeInUp">
        {visible.length === 0 ? (
          <div className="module-empty" style={{ gridColumn: '1 / -1' }}>
            <FolderKanban size={40} opacity={0.3} />
            <h3>No projects found</h3>
            <p>Create a project to start tracking team work.</p>
          </div>
        ) : visible.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const doneTasks = projectTasks.filter((t) => t.status === 'done').length;
          const progress = projectTasks.length
            ? Math.round((doneTasks / projectTasks.length) * 100)
            : project.progress;

          return (
            <div key={project.id} className="module-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 40, borderRadius: 4, background: project.color || 'var(--color-primary-500)' }} />
                {isManager() && (
                  <button className="icon-btn icon-btn--danger" onClick={() => { deleteProject(project.id); success('Project deleted.'); }} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <h3 className="module-card__title" style={{ marginTop: 12 }}>{project.name}</h3>
              <p className="module-card__meta">{project.description?.slice(0, 100)}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <span className="status-badge" style={{ color: getStatusColor(project.status), background: getStatusBg(project.status) }}>
                  {STATUS_LABELS[project.status] || project.status}
                </span>
                <span className="status-badge" style={{ color: getStatusColor(project.priority), background: getStatusBg(project.priority) }}>
                  {PRIORITY_LABELS[project.priority]}
                </span>
              </div>
              <p className="module-card__meta" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={12} /> Lead: {getName(project.lead)}
              </p>
              <p className="module-card__meta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} /> {formatDate(project.startDate)} – {formatDate(project.endDate)}
              </p>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                  <span>Progress</span>
                  <span>{progress}% · {doneTasks}/{projectTasks.length || project.tasksTotal} tasks</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-overlay)', borderRadius: 4 }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: project.color || 'var(--color-primary-500)', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: -4, marginTop: 12 }}>
                {(project.members || []).slice(0, 5).map((mid) => (
                  <div
                    key={mid}
                    title={getName(mid)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary-500)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: 'white', marginLeft: -4,
                      border: '2px solid var(--bg-surface)',
                    }}
                  >
                    {getName(mid).split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                ))}
                {(project.members?.length || 0) > 5 && (
                  <span className="module-card__meta" style={{ marginLeft: 8, alignSelf: 'center' }}>+{project.members.length - 5}</span>
                )}
              </div>
              {isManager() && (
                <select
                  value={project.status}
                  onChange={(e) => updateProject(project.id, { status: e.target.value })}
                  className="module-select"
                  style={{ marginTop: 12, width: '100%' }}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h2 className="modal__title"><FolderKanban size={18} style={{ display: 'inline', marginRight: 8 }} />New Project</h2>
            <form className="module-form" onSubmit={handleAdd}>
              <div className="module-field">
                <label>Project name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="module-field">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="module-form-row">
                <div className="module-field">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="module-field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
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
                <label>Team members</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 120, overflowY: 'auto' }}>
                  {employees.slice(0, 12).map((emp) => (
                    <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.members.includes(emp.id)} onChange={() => toggleMember(emp.id)} />
                      {emp.firstName} {emp.lastName}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal__actions">
                <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create Project</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
