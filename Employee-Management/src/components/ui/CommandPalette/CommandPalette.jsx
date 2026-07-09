import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Clock, CalendarOff, DollarSign,
  CheckSquare, FolderKanban, TrendingUp, Megaphone, FileText, Package,
  BarChart2, Shield, Settings, Search, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const COMMANDS = [
  { id: 'dashboard',     label: 'Go to Dashboard',     path: '/',              icon: LayoutDashboard, roles: ['admin','hr','manager','employee'] },
  { id: 'employees',     label: 'Go to Employees',     path: '/employees',     icon: Users,           roles: ['admin','hr','manager'] },
  { id: 'departments',   label: 'Go to Departments',   path: '/departments',   icon: Building2,       roles: ['admin','hr'] },
  { id: 'attendance',    label: 'Go to Attendance',    path: '/attendance',    icon: Clock,           roles: ['admin','hr','manager','employee'] },
  { id: 'leave',         label: 'Go to Leave',         path: '/leave',         icon: CalendarOff,     roles: ['admin','hr','manager','employee'] },
  { id: 'payroll',       label: 'Go to Payroll',       path: '/payroll',       icon: DollarSign,      roles: ['admin','hr'] },
  { id: 'tasks',         label: 'Go to Tasks',         path: '/tasks',         icon: CheckSquare,     roles: ['admin','hr','manager','employee'] },
  { id: 'projects',      label: 'Go to Projects',      path: '/projects',      icon: FolderKanban,    roles: ['admin','hr','manager','employee'] },
  { id: 'performance',   label: 'Go to Performance',   path: '/performance',   icon: TrendingUp,      roles: ['admin','hr','manager','employee'] },
  { id: 'announcements', label: 'Go to Announcements', path: '/announcements', icon: Megaphone,       roles: ['admin','hr','manager','employee'] },
  { id: 'documents',     label: 'Go to Documents',     path: '/documents',     icon: FileText,        roles: ['admin','hr','manager','employee'] },
  { id: 'assets',        label: 'Go to Assets',        path: '/assets',        icon: Package,         roles: ['admin','hr'] },
  { id: 'reports',       label: 'Go to Reports',       path: '/reports',       icon: BarChart2,       roles: ['admin','hr','manager'] },
  { id: 'audit',         label: 'Go to Audit Log',     path: '/audit',         icon: Shield,          roles: ['admin'] },
  { id: 'settings',      label: 'Go to Settings',      path: '/settings',      icon: Settings,        roles: ['admin','hr','manager','employee'] },
  { id: 'add-employee',  label: 'Add New Employee',    path: '/employees/add', icon: Users,           roles: ['admin','hr'] },
];

function CommandPalettePanel({ onClose }) {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const available = useMemo(
    () => COMMANDS.filter((cmd) => hasRole(...cmd.roles)),
    [hasRole]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return available;
    const q = query.toLowerCase();
    return available.filter((cmd) => cmd.label.toLowerCase().includes(q));
  }, [available, query]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        navigate(filtered[activeIndex].path);
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [filtered, activeIndex, navigate, onClose]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(0);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-label="Command palette" aria-modal="true">
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette__search">
          <Search size={18} className="command-palette__icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-palette__input"
            placeholder="Search pages and actions…"
            value={query}
            onChange={handleQueryChange}
            aria-label="Command search"
          />
        </div>
        <ul className="command-palette__list" role="listbox">
          {filtered.length === 0 ? (
            <li className="command-palette__empty">No results found</li>
          ) : filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <li key={cmd.id}>
                <button
                  type="button"
                  className={`command-palette__item ${i === activeIndex ? 'command-palette__item--active' : ''}`}
                  onClick={() => { navigate(cmd.path); onClose(); }}
                  role="option"
                  aria-selected={i === activeIndex}
                >
                  <Icon size={16} />
                  <span>{cmd.label}</span>
                  <ArrowRight size={14} className="command-palette__arrow" />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="command-palette__footer">
          <kbd>↑↓</kbd> navigate · <kbd>Enter</kbd> select · <kbd>Esc</kbd> close
        </div>
      </div>
    </div>
  );
}

export default function CommandPalette({ open, onClose }) {
  if (!open) return null;
  return <CommandPalettePanel onClose={onClose} />;
}
