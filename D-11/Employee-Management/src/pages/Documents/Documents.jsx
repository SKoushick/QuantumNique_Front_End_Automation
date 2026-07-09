import React, { useState, useMemo, useRef } from 'react';
import {
  FileText, Upload, Download, Trash2, Search, Eye, AlertTriangle,
  Calendar, User, Tag, File as FileIcon, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatDate, formatFileSize, getFileIcon } from '../../utils/formatters';
import { DOC_TYPES } from '../../utils/constants';
import Button from '../../components/ui/Button/Button';
import './Documents.css';

const CATEGORY_COLORS = {
  hr: 'var(--color-violet-400)',
  legal: 'var(--color-danger-400)',
  finance: 'var(--color-success-400)',
  personal: 'var(--color-cyan-400)',
  employment: 'var(--color-primary-400)',
  other: 'var(--text-muted)',
};

const daysUntil = (dateStr) => {
  if (!dateStr) return Infinity;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
};

export default function Documents() {
  const { documents, addDocument, deleteDocument } = useApp();
  const { user, isHR } = useAuth();
  const { success, error: toastError } = useNotification();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [modal, setModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Other', category: 'hr' });
  const [pendingFile, setPendingFile] = useState(null);
  const fileRef = useRef(null);

  const visible = useMemo(() => documents
    .filter((d) => category === 'all' || d.category === category)
    .filter((d) => !search
      || d.name.toLowerCase().includes(search.toLowerCase())
      || (d.type || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)),
  [documents, search, category]);

  const expiringSoon = documents.filter((d) => {
    const dLeft = daysUntil(d.expiresAt);
    return dLeft >= 0 && dLeft <= 30;
  });

  const onFilePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPendingFile(f);
    setForm((p) => ({ ...p, name: f.name }));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!pendingFile) {
      toastError('Please choose a file.');
      return;
    }
    addDocument({
      name: pendingFile.name,
      type: form.type,
      category: form.category,
      size: pendingFile.size,
      uploadedBy: user?.id,
      employeeId: null,
      expiresAt: null,
    });
    success(`Uploaded ${pendingFile.name}.`);
    setModal(false);
    setForm({ name: '', type: 'Other', category: 'hr' });
    setPendingFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDownload = (doc) => {
    const blob = new Blob(
      [`NexusHR Document Export\nName: ${doc.name}\nType: ${doc.type}\nGenerated: ${new Date().toISOString()}`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
    success(`Downloading ${doc.name}.`);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this document?')) return;
    deleteDocument(id);
    success('Document deleted.');
  };

  const totalSize = documents.reduce((s, d) => s + (d.size || 0), 0);

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Documents</h1>
          <p className="module-page__subtitle">
            {documents.length} files · {formatFileSize(totalSize)} total
            {expiringSoon.length > 0 && (
              <span className="doc-expiry-pill">
                <AlertTriangle size={12} /> {expiringSoon.length} expiring soon
              </span>
            )}
          </p>
        </div>
        {isHR() && (
          <Button variant="primary" leftIcon={<Upload size={14} />} onClick={() => setModal(true)}>
            Upload Document
          </Button>
        )}
      </div>

      <div className="module-filters">
        <div className="module-search">
          <Search size={15} className="module-search__icon" />
          <input
            className="module-search__input"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search documents"
          />
        </div>
        <select
          className="module-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {Object.keys(CATEGORY_COLORS).map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="doc-grid animate-fadeInUp">
        {visible.length === 0 ? (
          <div className="module-empty" style={{ gridColumn: '1 / -1' }}>
            <FileText size={48} opacity={0.2} />
            <h3>No documents found</h3>
            <p>Upload a document to get started.</p>
          </div>
        ) : visible.map((doc) => {
          const dLeft = daysUntil(doc.expiresAt);
          const expiring = dLeft >= 0 && dLeft <= 30;
          const color = CATEGORY_COLORS[doc.category] || CATEGORY_COLORS.other;
          const uploader = documents.length ? doc.uploadedBy : null;
          return (
            <div key={doc.id} className="doc-card">
              <div className="doc-card__icon" style={{ background: `${color}1a`, color }}>
                {getFileIcon(doc.name)}
              </div>
              <div className="doc-card__body">
                <p className="doc-card__name" title={doc.name}>{doc.name}</p>
                <div className="doc-card__meta">
                  <span className="doc-category" style={{ color, background: `${color}1a` }}>{doc.type}</span>
                  <span>{formatFileSize(doc.size)}</span>
                </div>
                <div className="doc-card__sub">
                  <span><User size={11} /> {doc.uploadedBy || 'System'}</span>
                  <span><Calendar size={11} /> {formatDate(doc.uploadedAt)}</span>
                </div>
                {doc.expiresAt && (
                  <div className={`doc-card__expiry ${expiring ? 'doc-card__expiry--warn' : ''}`}>
                    {expiring ? <AlertTriangle size={11} /> : <Check size={11} />}
                    {expiring ? `Expires in ${dLeft}d` : `Expires ${formatDate(doc.expiresAt)}`}
                  </div>
                )}
              </div>
              <div className="doc-card__actions">
                <button className="icon-btn" onClick={() => setPreview(doc)} aria-label="Preview"><Eye size={14} /></button>
                <button className="icon-btn" onClick={() => handleDownload(doc)} aria-label="Download"><Download size={14} /></button>
                {isHR() && (
                  <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(doc.id)} aria-label="Delete"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Upload document">
            <h2 className="modal__title">
              <Upload size={18} style={{ display: 'inline', marginRight: 8 }} /> Upload Document
            </h2>
            <form className="module-form" onSubmit={handleUpload}>
              <div
                className="doc-dropzone"
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" hidden onChange={onFilePick} />
                <FileIcon size={28} />
                <p>{pendingFile ? pendingFile.name : 'Click to choose a file'}</p>
                <span>PDF, DOCX, XLSX, images — max 10MB</span>
              </div>
              <div className="module-form-row">
                <div className="module-field">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                    {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="module-field">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {Object.keys(CATEGORY_COLORS).map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal__actions">
                <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" leftIcon={<Upload size={14} />}>Upload</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Document preview" style={{ maxWidth: 560 }}>
            <h2 className="modal__title">
              <Eye size={18} style={{ display: 'inline', marginRight: 8 }} /> {preview.name}
            </h2>
            <div className="doc-preview">
              <div className="doc-preview__icon">{getFileIcon(preview.name)}</div>
              <div className="doc-preview__rows">
                <p><Tag size={13} /> <strong>Type:</strong> {preview.type}</p>
                <p><Tag size={13} /> <strong>Category:</strong> {preview.category}</p>
                <p><Calendar size={13} /> <strong>Uploaded:</strong> {formatDate(preview.uploadedAt)}</p>
                <p><FileText size={13} /> <strong>Size:</strong> {formatFileSize(preview.size)}</p>
                {preview.expiresAt && (
                  <p><Calendar size={13} /> <strong>Expires:</strong> {formatDate(preview.expiresAt)}</p>
                )}
              </div>
            </div>
            <div className="modal__actions">
              <Button variant="secondary" type="button" onClick={() => setPreview(null)}>Close</Button>
              <Button variant="primary" type="button" leftIcon={<Download size={14} />} onClick={() => { handleDownload(preview); setPreview(null); }}>
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
