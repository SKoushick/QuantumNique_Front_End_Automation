/**
 * Employee List — searchable, filterable, paginated employee directory
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, Search, Filter, Grid3X3, List, Download, Trash2,
  ChevronUp, ChevronDown, Eye, Edit, MoreVertical, X, Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  formatDate, getInitials, getAvatarColor,
  getStatusColor, getStatusBg, formatCurrency
} from '../../utils/formatters';
import { DEPARTMENTS } from '../../utils/constants';
import Button from '../../components/ui/Button/Button';
import './Employees.css';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ['all', 'active', 'on_leave', 'inactive', 'terminated'];
const SORT_FIELDS    = [
  { key: 'firstName',   label: 'Name' },
  { key: 'department',  label: 'Department' },
  { key: 'joinDate',    label: 'Join Date' },
  { key: 'salary',      label: 'Salary' },
];

export default function EmployeeList() {
  const { employees, deleteEmployee } = useApp();
  const { isHR, isAdmin }             = useAuth();
  const { success, error }            = useNotification();
  const navigate                      = useNavigate();

  const [search,     setSearch]     = useState('');
  const [dept,       setDept]       = useState('all');
  const [status,     setStatus]     = useState('all');
  const [sortKey,    setSortKey]    = useState('firstName');
  const [sortDir,    setSortDir]    = useState('asc');
  const [page,       setPage]       = useState(1);
  const [viewMode,   setViewMode]   = useState('table'); // 'table' | 'grid'
  const [selected,   setSelected]   = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(null);

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return employees
      .filter((e) => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q)  ||
          e.email.toLowerCase().includes(q)     ||
          e.employeeId.toLowerCase().includes(q)||
          e.designation?.toLowerCase().includes(q);
        const matchDept   = dept   === 'all' || e.department === dept;
        const matchStatus = status === 'all' || e.status     === status;
        return matchSearch && matchDept && matchStatus;
      })
      .sort((a, b) => {
        let av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
        if (sortKey === 'salary') { av = +av; bv = +bv; }
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ?  1 : -1;
        return 0;
      });
  }, [employees, search, dept, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const toggleSelect = (id) => {
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === paged.length ? [] : paged.map((e) => e.id));
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selected.length} employee(s)?`)) return;
    selected.forEach((id) => deleteEmployee(id));
    success(`${selected.length} employee(s) deleted.`);
    setSelected([]);
  };

  const handleDelete = (emp) => {
    if (!window.confirm(`Delete ${emp.firstName} ${emp.lastName}?`)) return;
    deleteEmployee(emp.id);
    success('Employee deleted.');
    setMenuOpen(null);
  };

  const SortIcon = ({ field }) => {
    if (sortKey !== field) return <ChevronUp size={12} opacity={0.3} />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  return (
    <div className="emp-page page-container">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="emp-page__header animate-fadeInDown">
        <div>
          <h1 className="emp-page__title">Employees</h1>
          <p className="emp-page__subtitle">{employees.length} team members across {DEPARTMENTS.length} departments</p>
        </div>
        {isHR() && (
          <div className="emp-page__actions">
            <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>Export</Button>
            <Button variant="primary"   size="sm" leftIcon={<UserPlus size={14} />} onClick={() => navigate('/employees/add')}>
              Add Employee
            </Button>
          </div>
        )}
      </div>

      {/* ── Filters bar ───────────────────────────────────────── */}
      <div className="emp-filters animate-fadeInUp">
        <div className="emp-filters__search">
          <Search size={15} className="emp-filters__search-icon" />
          <input
            type="text"
            className="emp-filters__search-input"
            placeholder="Search by name, email, ID, role…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search employees"
          />
          {search && (
            <button className="emp-filters__clear" onClick={() => setSearch('')} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="emp-filters__right">
          {/* Department filter */}
          <select
            className="emp-filter-select"
            value={dept}
            onChange={(e) => { setDept(e.target.value); setPage(1); }}
            aria-label="Filter by department"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            className="emp-filter-select"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="emp-view-toggle" role="group" aria-label="View mode">
            <button
              className={`emp-view-btn ${viewMode === 'table' ? 'emp-view-btn--active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              aria-label="Table view"
            >
              <List size={15} />
            </button>
            <button
              className={`emp-view-btn ${viewMode === 'grid' ? 'emp-view-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <Grid3X3 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bulk actions ──────────────────────────────────────── */}
      {selected.length > 0 && (
        <div className="emp-bulk-bar animate-fadeInDown" role="toolbar" aria-label="Bulk actions">
          <span className="emp-bulk-bar__count">{selected.length} selected</span>
          <button className="emp-bulk-btn emp-bulk-btn--danger" onClick={handleBulkDelete}>
            <Trash2 size={14} /> Delete Selected
          </button>
          <button className="emp-bulk-btn" onClick={() => setSelected([])}>
            <X size={14} /> Clear
          </button>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────── */}
      {paged.length === 0 ? (
        <div className="emp-empty animate-fadeInUp">
          <Users size={48} opacity={0.2} />
          <h3>No employees found</h3>
          <p>Try adjusting your search or filters</p>
          {isHR() && (
            <Button variant="primary" leftIcon={<UserPlus size={14} />} onClick={() => navigate('/employees/add')}>
              Add First Employee
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* ── Table view ─────────────────────────────────────── */
        <div className="emp-table-wrap animate-fadeInUp">
          <table className="emp-table" aria-label="Employee list">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selected.length === paged.length && paged.length > 0}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                {SORT_FIELDS.map((f) => (
                  <th key={f.key}>
                    <button className="emp-table__sort-btn" onClick={() => toggleSort(f.key)}>
                      {f.label} <SortIcon field={f.key} />
                    </button>
                  </th>
                ))}
                <th>Status</th>
                <th>Work Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((emp, i) => (
                <tr
                  key={emp.id}
                  className={`emp-table__row ${selected.includes(emp.id) ? 'emp-table__row--selected' : ''} animate-fadeInUp stagger-${Math.min(i+1,6)}`}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(emp.id)}
                      onChange={() => toggleSelect(emp.id)}
                      aria-label={`Select ${emp.firstName}`}
                    />
                  </td>
                  <td>
                    <div className="emp-table__name">
                      <div className="emp-table__avatar" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
                        {getInitials(`${emp.firstName} ${emp.lastName}`)}
                      </div>
                      <div>
                        <p className="emp-table__full-name">{emp.firstName} {emp.lastName}</p>
                        <p className="emp-table__sub">{emp.employeeId} · {emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="emp-table__designation">{emp.designation}</p>
                    <p className="emp-table__sub">{emp.departmentName}</p>
                  </td>
                  <td className="emp-table__sub">{formatDate(emp.joinDate)}</td>
                  <td className="emp-table__salary">{formatCurrency(emp.salary)}</td>
                  <td>
                    <span
                      className="emp-status-badge"
                      style={{ color: getStatusColor(emp.status), background: getStatusBg(emp.status) }}
                    >
                      {emp.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td><span className="emp-mode-badge">{emp.workMode || 'Hybrid'}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="emp-table__actions">
                      <button
                        className="emp-action-btn"
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        title="View profile"
                        aria-label={`View ${emp.firstName}'s profile`}
                      >
                        <Eye size={14} />
                      </button>
                      {isHR() && (
                        <button
                          className="emp-action-btn"
                          onClick={() => navigate(`/employees/${emp.id}/edit`)}
                          title="Edit"
                          aria-label={`Edit ${emp.firstName}`}
                        >
                          <Edit size={14} />
                        </button>
                      )}
                      {isAdmin() && (
                        <button
                          className="emp-action-btn emp-action-btn--danger"
                          onClick={() => handleDelete(emp)}
                          title="Delete"
                          aria-label={`Delete ${emp.firstName}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Grid view ────────────────────────────────────────── */
        <div className="emp-grid animate-fadeInUp">
          {paged.map((emp, i) => (
            <div
              key={emp.id}
              className={`emp-card hover-lift animate-fadeInUp stagger-${Math.min(i+1,6)}`}
              onClick={() => navigate(`/employees/${emp.id}`)}
              role="button"
              tabIndex={0}
              aria-label={`View ${emp.firstName} ${emp.lastName}'s profile`}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/employees/${emp.id}`)}
            >
              <div className="emp-card__header">
                <div className="emp-card__avatar" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
                  {getInitials(`${emp.firstName} ${emp.lastName}`)}
                </div>
                <span
                  className="emp-status-badge"
                  style={{ color: getStatusColor(emp.status), background: getStatusBg(emp.status) }}
                >
                  {emp.status.replace('_', ' ')}
                </span>
              </div>
              <div className="emp-card__body">
                <h3 className="emp-card__name">{emp.firstName} {emp.lastName}</h3>
                <p className="emp-card__role">{emp.designation}</p>
                <p className="emp-card__dept">{emp.departmentName}</p>
              </div>
              <div className="emp-card__footer">
                <span className="emp-card__id">{emp.employeeId}</span>
                <span className="emp-card__join">Joined {formatDate(emp.joinDate, 'MMM yyyy')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="emp-pagination" role="navigation" aria-label="Pagination">
          <span className="emp-pagination__info">
            Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="emp-pagination__controls">
            <button
              className="emp-page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, idx, arr) => {
                if (idx > 0 && n - arr[idx-1] > 1) acc.push('…');
                acc.push(n);
                return acc;
              }, [])
              .map((n, idx) => n === '…'
                ? <span key={`e${idx}`} className="emp-page-ellipsis">…</span>
                : <button
                    key={n}
                    className={`emp-page-btn ${n === page ? 'emp-page-btn--active' : ''}`}
                    onClick={() => setPage(n)}
                    aria-label={`Page ${n}`}
                    aria-current={n === page ? 'page' : undefined}
                  >{n}</button>
              )
            }
            <button
              className="emp-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >›</button>
          </div>
        </div>
      )}
    </div>
  );
}
