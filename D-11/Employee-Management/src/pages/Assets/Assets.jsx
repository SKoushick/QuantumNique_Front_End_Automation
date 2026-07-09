import React, { useState, useMemo } from 'react';
import {
  Package, Plus, Trash2, Search, UserCheck, Undo2, Laptop,
  Monitor, Smartphone, Armchair, Headphones, Box, Wrench
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency, formatDate, getInitials, getAvatarColor } from '../../utils/formatters';
import { ASSET_CATEGORIES } from '../../utils/constants';
import Button from '../../components/ui/Button/Button';
import './Assets.css';

const CATEGORY_ICONS = {
  Laptop: Laptop,
  Desktop: Laptop,
  Monitor: Monitor,
  'Mobile Phone': Smartphone,
  Tablet: Smartphone,
  Chair: Armchair,
  Headset: Headphones,
  Printer: Box,
  Keyboard: Wrench,
  Mouse: Wrench,
  Other: Package,
};

const CONDITION_COLORS = {
  Excellent: 'var(--color-success-400)',
  Good: 'var(--color-primary-400)',
  Fair: 'var(--color-warning-400)',
  Poor: 'var(--color-danger-400)',
};

export default function Assets() {
  const { assets, employees, addAsset, updateAsset, deleteAsset } = useApp();
  const { isHR } = useAuth();
  const { success } = useNotification();
  const [search, setSearch] = useState('');
  const [assignId, setAssignId] = useState(null);
  const [assignee, setAssignee] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Laptop', serialNumber: '', value: 0, condition: 'Good' });

  const enriched = useMemo(() => assets.map((a) => ({
    ...a,
    holder: a.assignedTo ? employees.find((e) => e.id === a.assignedTo) : null,
  })).filter((a) => !search
    || a.name.toLowerCase().includes(search.toLowerCase())
    || (a.serialNumber || '').toLowerCase().includes(search.toLowerCase())),
  [assets, employees, search]);

  const stats = {
    total: assets.length,
    assigned: assets.filter((a) => a.status === 'assigned').length,
    available: assets.filter((a) => a.status === 'available').length,
    value: assets.reduce((s, a) => s + (a.value || 0), 0),
  };

  const openAssign = (asset) => {
    setAssignId(asset.id);
    setAssignee(asset.assignedTo || '');
  };

  const confirmAssign = () => {
    if (!assignee) {
      updateAsset(assignId, { assignedTo: null, assignedDate: null, status: 'available' });
      success('Asset returned to inventory.');
    } else {
      updateAsset(assignId, { assignedTo: assignee, assignedDate: new Date().toISOString().split('T')[0], status: 'assigned' });
      success('Asset assigned.');
    }
    setAssignId(null);
    setAssignee('');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name) return;
    addAsset({ ...form, value: +form.value || 0, assignedTo: null, assignedDate: null, status: 'available' });
    success('Asset added to inventory.');
    setModal(false);
    setForm({ name: '', category: 'Laptop', serialNumber: '', value: 0, condition: 'Good' });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this asset?')) return;
    deleteAsset(id);
    success('Asset deleted.');
  };

  const visible = enriched;

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Assets</h1>
          <p className="module-page__subtitle">{stats.total} assets · {formatCurrency(stats.value)} total value</p>
        </div>
        {isHR() && (
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setModal(true)}>Add Asset</Button>
        )}
      </div>

      <div className="module-stats animate-fadeInUp">
        <div className="module-stat">
          <div className="module-stat__value">{stats.total}</div>
          <div className="module-stat__label">Total assets</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value">{stats.assigned}</div>
          <div className="module-stat__label">Assigned</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value">{stats.available}</div>
          <div className="module-stat__label">Available</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value">{formatCurrency(stats.value)}</div>
          <div className="module-stat__label">Total value</div>
        </div>
      </div>

      <div className="module-filters">
        <div className="module-search">
          <Search size={15} className="module-search__icon" />
          <input
            className="module-search__input"
            placeholder="Search assets by name or serial…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search assets"
          />
        </div>
      </div>

      <div className="module-grid animate-fadeInUp">
        {visible.length === 0 ? (
          <div className="module-empty" style={{ gridColumn: '1 / -1' }}>
            <Package size={48} opacity={0.2} />
            <h3>No assets found</h3>
            <p>Add an asset to start tracking inventory.</p>
          </div>
        ) : visible.map((asset) => {
          const Icon = CATEGORY_ICONS[asset.category] || Package;
          const condColor = CONDITION_COLORS[asset.condition] || 'var(--text-muted)';
          return (
            <div key={asset.id} className="asset-card">
              <div className="asset-card__top">
                <div className="asset-card__icon"><Icon size={20} /></div>
                {isHR() && (
                  <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(asset.id)} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <h3 className="asset-card__name">{asset.name}</h3>
              <p className="module-card__meta">{asset.category} · <span className="asset-serial">{asset.serialNumber}</span></p>

              <div className="asset-card__rows">
                <div className="asset-row">
                  <span>Status</span>
                  <span className={`status-badge ${asset.status === 'assigned' ? 'asset-status--assigned' : 'asset-status--available'}`}>
                    {asset.status}
                  </span>
                </div>
                <div className="asset-row">
                  <span>Condition</span>
                  <span style={{ color: condColor, fontWeight: 500 }}>{asset.condition}</span>
                </div>
                <div className="asset-row">
                  <span>Value</span>
                  <span>{formatCurrency(asset.value)}</span>
                </div>
              </div>

              <div className="asset-card__holder">
                {asset.holder ? (
                  <div className="asset-holder">
                    <div className="asset-holder__avatar" style={{ background: getAvatarColor(`${asset.holder.firstName} ${asset.holder.lastName}`) }}>
                      {getInitials(`${asset.holder.firstName} ${asset.holder.lastName}`)}
                    </div>
                    <div>
                      <p>{asset.holder.firstName} {asset.holder.lastName}</p>
                      <span>Since {formatDate(asset.assignedDate)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="asset-available">In inventory</p>
                )}
              </div>

              {isHR() && (
                <Button variant="secondary" size="sm" fullWidth leftIcon={<UserCheck size={14} />} onClick={() => openAssign(asset)}>
                  {asset.status === 'assigned' ? 'Reassign / Return' : 'Assign'}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Add asset">
            <h2 className="modal__title"><Package size={18} style={{ display: 'inline', marginRight: 8 }} /> Add Asset</h2>
            <form className="module-form" onSubmit={handleAdd}>
              <div className="module-field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="module-form-row">
                <div className="module-field">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="module-field">
                  <label>Serial number</label>
                  <input value={form.serialNumber} onChange={(e) => setForm((p) => ({ ...p, serialNumber: e.target.value }))} />
                </div>
              </div>
              <div className="module-form-row">
                <div className="module-field">
                  <label>Value</label>
                  <input type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: +e.target.value }))} />
                </div>
                <div className="module-field">
                  <label>Condition</label>
                  <select value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}>
                    {Object.keys(CONDITION_COLORS).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal__actions">
                <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" leftIcon={<Plus size={14} />}>Add Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignId && (
        <div className="modal-overlay" onClick={() => setAssignId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Assign asset" style={{ maxWidth: 460 }}>
            <h2 className="modal__title"><UserCheck size={18} style={{ display: 'inline', marginRight: 8 }} /> Assign Asset</h2>
            <div className="module-field">
              <label>Assign to employee</label>
              <select className="module-select" style={{ width: '100%' }} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">— Return to inventory —</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName} · {e.departmentName}</option>
                ))}
              </select>
            </div>
            <div className="modal__actions">
              <Button variant="secondary" type="button" onClick={() => setAssignId(null)}>Cancel</Button>
              <Button variant="primary" type="button" leftIcon={<Undo2 size={14} />} onClick={confirmAssign}>
                {assignee ? 'Assign' : 'Return'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
