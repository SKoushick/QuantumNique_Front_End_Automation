import React, { useState, useMemo } from 'react';
import {
  Megaphone, Plus, Pin, Trash2, Search, Eye, Calendar,
  Check, Flame, Info, PartyPopper, Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatDate, formatRelative, getInitials, getAvatarColor } from '../../utils/formatters';
import Button from '../../components/ui/Button/Button';
import './Announcements.css';

const CATEGORY_META = {
  company: { label: 'Company', color: 'var(--color-primary-400)', icon: Info },
  hr:      { label: 'HR Notice', color: 'var(--color-violet-400)', icon: Bell },
  event:   { label: 'Event', color: 'var(--color-orange-400)', icon: PartyPopper },
  policy:  { label: 'Policy', color: 'var(--color-cyan-400)', icon: Flame },
};

const PRIORITY_META = {
  high:   { label: 'High', color: 'var(--color-danger-400)' },
  medium: { label: 'Medium', color: 'var(--color-warning-400)' },
  low:    { label: 'Low', color: 'var(--color-success-400)' },
};

export default function Announcements() {
  const { announcements, addAnnouncement, deleteAnnouncement } = useApp();
  const { user, isHR } = useAuth();
  const { success } = useNotification();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'company', priority: 'medium' });

  const visible = useMemo(() => {
    return announcements
      .filter((a) => category === 'all' || a.category === category)
      .filter((a) => !search
        || a.title.toLowerCase().includes(search.toLowerCase())
        || a.content.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });
  }, [announcements, search, category]);

  const isRead = (a) => a.readBy?.includes(user?.id);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    addAnnouncement({
      title: form.title,
      content: form.content,
      category: form.category,
      priority: form.priority,
      author: `${user?.firstName} ${user?.lastName}`,
      authorId: user?.id,
      targetRoles: ['admin', 'hr', 'manager', 'employee'],
      pinned: false,
    });
    success('Announcement published.');
    setModal(false);
    setForm({ title: '', content: '', category: 'company', priority: 'medium' });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    deleteAnnouncement(id);
    success('Announcement deleted.');
  };

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Announcements</h1>
          <p className="module-page__subtitle">{announcements.length} announcements · {announcements.filter((a) => a.pinned).length} pinned</p>
        </div>
        {isHR() && (
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setModal(true)}>
            New Announcement
          </Button>
        )}
      </div>

      <div className="module-filters">
        <div className="module-search">
          <Search size={15} className="module-search__icon" />
          <input
            className="module-search__input"
            placeholder="Search announcements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search announcements"
          />
        </div>
        <div className="emp-view-toggle" role="group" aria-label="Filter by category" style={{ width: 'auto' }}>
          {['all', ...Object.keys(CATEGORY_META)].map((c) => (
            <button
              key={c}
              className={`emp-view-btn ${category === c ? 'emp-view-btn--active' : ''}`}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c === 'all' ? 'All' : CATEGORY_META[c].label}
            </button>
          ))}
        </div>
      </div>

      <div className="ann-list animate-fadeInUp">
        {visible.length === 0 ? (
          <div className="module-empty">
            <Megaphone size={48} opacity={0.2} />
            <h3>No announcements found</h3>
            <p>Try a different category or search term.</p>
          </div>
        ) : (
          visible.map((a) => {
            const meta = CATEGORY_META[a.category] || CATEGORY_META.company;
            const Icon = meta.icon;
            const prio = PRIORITY_META[a.priority] || PRIORITY_META.medium;
            const read = isRead(a);
            return (
              <article
                key={a.id}
                className={`ann-card ${!read ? 'ann-card--unread' : ''} ${a.pinned ? 'ann-card--pinned' : ''}`}
              >
                <div className="ann-card__accent" style={{ background: meta.color }} aria-hidden="true" />
                <div className="ann-card__body">
                  <div className="ann-card__top">
                    <span className="ann-badge" style={{ color: meta.color, background: `${meta.color}1a` }}>
                      <Icon size={13} /> {meta.label}
                    </span>
                    {a.pinned && (
                      <span className="ann-badge ann-badge--pin">
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    <span className="ann-badge" style={{ color: prio.color, background: `${prio.color}1a` }}>
                      {prio.label} priority
                    </span>
                    <span className="ann-card__time">{formatRelative(a.publishedAt)}</span>
                  </div>

                  <h3 className="ann-card__title">{a.title}</h3>
                  <p className="ann-card__content">{a.content}</p>

                  <div className="ann-card__footer">
                    <div className="ann-card__author">
                      <div
                        className="ann-card__avatar"
                        style={{ background: getAvatarColor(a.author || '') }}
                      >
                        {getInitials(a.author || '?')}
                      </div>
                      <span>{a.author}</span>
                    </div>
                    <div className="ann-card__meta">
                      <span><Calendar size={12} /> {formatDate(a.publishedAt)}</span>
                      <span><Eye size={12} /> {a.readBy?.length || 0} read</span>
                    </div>
                  </div>
                </div>

                {isHR() && (
                  <button
                    className="icon-btn icon-btn--danger ann-card__delete"
                    onClick={() => handleDelete(a.id)}
                    aria-label="Delete announcement"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </article>
            );
          })
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="New announcement">
            <h2 className="modal__title">
              <Megaphone size={18} style={{ display: 'inline', marginRight: 8 }} /> New Announcement
            </h2>
            <form className="module-form" onSubmit={handleCreate}>
              <div className="module-field">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Office closed for holiday"
                  required
                />
              </div>
              <div className="module-field">
                <label>Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Write your announcement…"
                  required
                />
              </div>
              <div className="module-form-row">
                <div className="module-field">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {Object.entries(CATEGORY_META).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="module-field">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                    {Object.entries(PRIORITY_META).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal__actions">
                <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" leftIcon={<Check size={14} />}>Publish</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
