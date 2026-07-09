/**
 * Application-wide constants
 */

// ── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:    'admin',
  HR:       'hr',
  MANAGER:  'manager',
  EMPLOYEE: 'employee',
};

export const ROLE_LABELS = {
  admin:    'Administrator',
  hr:       'HR Manager',
  manager:  'Manager',
  employee: 'Employee',
};

// ── Employee Status ───────────────────────────────────────────────────────────
export const EMPLOYEE_STATUS = {
  ACTIVE:     'active',
  ON_LEAVE:   'on_leave',
  INACTIVE:   'inactive',
  TERMINATED: 'terminated',
};

// ── Leave Types ───────────────────────────────────────────────────────────────
export const LEAVE_TYPES = [
  { id: 'annual',    label: 'Annual Leave',    color: 'var(--color-primary-400)',  quota: 20 },
  { id: 'sick',      label: 'Sick Leave',      color: 'var(--color-danger-400)',   quota: 10 },
  { id: 'casual',    label: 'Casual Leave',    color: 'var(--color-cyan-400)',     quota: 5  },
  { id: 'maternity', label: 'Maternity Leave', color: 'var(--color-pink-400)',     quota: 90 },
  { id: 'paternity', label: 'Paternity Leave', color: 'var(--color-violet-400)',   quota: 7  },
  { id: 'unpaid',    label: 'Unpaid Leave',    color: 'var(--color-warning-400)',  quota: 0  },
  { id: 'comp_off',  label: 'Comp Off',        color: 'var(--color-orange-400)',   quota: 5  },
];

// ── Task Priority ─────────────────────────────────────────────────────────────
export const TASK_PRIORITY = {
  CRITICAL: 'critical',
  HIGH:     'high',
  MEDIUM:   'medium',
  LOW:      'low',
};

// ── Task Status ───────────────────────────────────────────────────────────────
export const TASK_STATUS = {
  TODO:        'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW:      'review',
  DONE:        'done',
};

// ── Departments (seed) ────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  { id: 'd1', name: 'Engineering',       code: 'ENG', color: '#4285F4' },
  { id: 'd2', name: 'Product',           code: 'PRD', color: '#8B5CF6' },
  { id: 'd3', name: 'Design',            code: 'DES', color: '#EC4899' },
  { id: 'd4', name: 'Marketing',         code: 'MKT', color: '#F59E0B' },
  { id: 'd5', name: 'Sales',             code: 'SLS', color: '#10B981' },
  { id: 'd6', name: 'Human Resources',   code: 'HR',  color: '#06B6D4' },
  { id: 'd7', name: 'Finance',           code: 'FIN', color: '#F97316' },
  { id: 'd8', name: 'Operations',        code: 'OPS', color: '#84CC16' },
  { id: 'd9', name: 'Legal',             code: 'LGL', color: '#EF4444' },
  { id: 'd10', name: 'Customer Success', code: 'CS',  color: '#A78BFA' },
];

// ── Designations ──────────────────────────────────────────────────────────────
export const DESIGNATIONS = [
  'Junior Engineer', 'Software Engineer', 'Senior Engineer', 'Staff Engineer',
  'Principal Engineer', 'Engineering Manager', 'VP of Engineering', 'CTO',
  'Product Manager', 'Senior PM', 'Director of Product', 'CPO',
  'UI/UX Designer', 'Senior Designer', 'Design Lead', 'Creative Director',
  'Marketing Analyst', 'Marketing Manager', 'Marketing Director', 'CMO',
  'Sales Representative', 'Account Executive', 'Sales Manager', 'VP Sales',
  'HR Specialist', 'HR Manager', 'HR Director', 'CHRO',
  'Financial Analyst', 'Finance Manager', 'CFO',
  'Operations Analyst', 'Operations Manager', 'COO',
  'CEO', 'Founder & CEO',
];

// ── Employment Types ──────────────────────────────────────────────────────────
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Freelance'];

// ── Skill Levels ─────────────────────────────────────────────────────────────
export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

// ── Performance Ratings ───────────────────────────────────────────────────────
export const PERFORMANCE_RATINGS = [
  { value: 5, label: 'Outstanding',   color: 'var(--color-success-400)' },
  { value: 4, label: 'Exceeds',       color: 'var(--color-cyan-400)' },
  { value: 3, label: 'Meets',         color: 'var(--color-primary-400)' },
  { value: 2, label: 'Needs Work',    color: 'var(--color-warning-400)' },
  { value: 1, label: 'Unsatisfactory',color: 'var(--color-danger-400)' },
];

// ── Document Types ────────────────────────────────────────────────────────────
export const DOC_TYPES = [
  'Passport', 'National ID', 'Driving License', 'Birth Certificate',
  'Degree Certificate', 'Experience Letter', 'Offer Letter',
  'Appointment Letter', 'Contract', 'NDA', 'Tax Form', 'Other',
];

// ── Asset Categories ──────────────────────────────────────────────────────────
export const ASSET_CATEGORIES = [
  'Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Headset',
  'Mobile Phone', 'Tablet', 'Printer', 'Chair', 'Desk', 'Other',
];

// ── Navigation items ──────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { path: '/',              label: 'Dashboard',       icon: 'LayoutDashboard', roles: ['admin','hr','manager','employee'] },
  { path: '/employees',     label: 'Employees',       icon: 'Users',           roles: ['admin','hr','manager'] },
  { path: '/departments',   label: 'Departments',     icon: 'Building2',       roles: ['admin','hr'] },
  { path: '/attendance',    label: 'Attendance',      icon: 'Clock',           roles: ['admin','hr','manager','employee'] },
  { path: '/leave',         label: 'Leave',           icon: 'CalendarOff',     roles: ['admin','hr','manager','employee'] },
  { path: '/payroll',       label: 'Payroll',         icon: 'DollarSign',      roles: ['admin','hr'] },
  { path: '/tasks',         label: 'Tasks',           icon: 'CheckSquare',     roles: ['admin','hr','manager','employee'] },
  { path: '/projects',      label: 'Projects',        icon: 'FolderKanban',    roles: ['admin','hr','manager','employee'] },
  { path: '/performance',   label: 'Performance',     icon: 'TrendingUp',      roles: ['admin','hr','manager','employee'] },
  { path: '/announcements', label: 'Announcements',   icon: 'Megaphone',       roles: ['admin','hr','manager','employee'] },
  { path: '/documents',     label: 'Documents',       icon: 'FileText',        roles: ['admin','hr','manager','employee'] },
  { path: '/assets',        label: 'Assets',          icon: 'Package',         roles: ['admin','hr'] },
  { path: '/reports',       label: 'Reports',         icon: 'BarChart2',       roles: ['admin','hr','manager'] },
  { path: '/audit',         label: 'Audit Log',       icon: 'Shield',          roles: ['admin'] },
  { path: '/settings',      label: 'Settings',        icon: 'Settings',        roles: ['admin','hr','manager','employee'] },
];

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZES = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;

// ── Date formats ──────────────────────────────────────────────────────────────
export const DATE_FORMAT    = 'MMM d, yyyy';
export const DATE_FORMAT_DB = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'MMM d, yyyy h:mm a';
