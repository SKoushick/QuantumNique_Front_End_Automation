import React, { useState, useMemo } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants';
import { formatDate, getStatusColor, getStatusBg } from '../../utils/formatters';
import Button from '../../components/ui/Button/Button';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_LABELS = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

export default function Tasks() {
  const { tasks, projects, addTask, updateTask, deleteTask, employees } = useApp();
  const { user, isManager } = useAuth();
  const { success } = useNotification();
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', projectId: '' });

  const visible = useMemo(() => {
    let list = isManager() ? tasks : tasks.filter((t) => t.assignees?.includes(user.id) || t.createdBy === user.id);
    if (filter !== 'all') list = list.filter((t) => t.status === filter);
    return list;
  }, [tasks, filter, user, isManager]);

  const handleAdd = (e) => {
    e.preventDefault();
    addTask({
      ...form,
      status: 'todo',
      assignees: [user.id],
      createdBy: user.id,
      tags: [],
    });
    success('Task created.');
    setModal(false);
    setForm({ title: '', description: '', priority: 'medium', dueDate: '', projectId: '' });
  };

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Tasks</h1>
          <p className="module-page__subtitle">{visible.length} tasks</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setModal(true)}>New Task</Button>
      </div>

      <div className="module-tabs">
        <button className={`module-tab ${filter === 'all' ? 'module-tab--active' : ''}`} onClick={() => setFilter('all')}>All</button>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <button key={k} className={`module-tab ${filter === k ? 'module-tab--active' : ''}`} onClick={() => setFilter(k)}>{v}</button>
        ))}
      </div>

      <div className="module-grid animate-fadeInUp">
        {visible.map((task) => {
          const project = projects.find((p) => p.id === task.projectId);
          return (
            <div key={task.id} className="module-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <CheckSquare size={18} color="var(--color-primary-400)" />
                {isManager() && (
                  <button className="icon-btn icon-btn--danger" onClick={() => { deleteTask(task.id); success('Task deleted.'); }} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <h3 className="module-card__title" style={{ marginTop: 8 }}>{task.title}</h3>
              <p className="module-card__meta">{task.description?.slice(0, 80)}…</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <span className="status-badge" style={{ color: getStatusColor(task.status), background: getStatusBg(task.status) }}>
                  {STATUS_LABELS[task.status]}
                </span>
                <span className="status-badge" style={{ color: getStatusColor(task.priority), background: getStatusBg(task.priority) }}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>
              {project && <p className="module-card__meta" style={{ marginTop: 8 }}>Project: {project.name}</p>}
              <p className="module-card__meta">Due: {formatDate(task.dueDate)}</p>
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 4, background: 'var(--bg-overlay)', borderRadius: 4 }}>
                  <div style={{ width: `${task.progress}%`, height: '100%', background: 'var(--color-primary-500)', borderRadius: 4 }} />
                </div>
                <p className="module-card__meta">{task.progress}% complete</p>
              </div>
              {isManager() && (
                <select
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value, progress: e.target.value === 'done' ? 100 : task.progress })}
                  className="module-select"
                  style={{ marginTop: 8, width: '100%' }}
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">New Task</h2>
            <form className="module-form" onSubmit={handleAdd}>
              <div className="module-field">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
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
                  <label>Due date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} required />
                </div>
              </div>
              <div className="module-field">
                <label>Project</label>
                <select value={form.projectId} onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}>
                  <option value="">None</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="modal__actions">
                <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
