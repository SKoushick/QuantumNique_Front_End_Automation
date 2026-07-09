import React, { useMemo, useState } from 'react';
import { BarChart2, Download, FileSpreadsheet, FileText, Users, DollarSign, Clock, CalendarOff, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { DEPARTMENTS } from '../../utils/constants';
import Button from '../../components/ui/Button/Button';

const REPORT_TYPES = [
  { id: 'employees',   label: 'Employees',   icon: Users,     description: 'Full employee roster with roles and status' },
  { id: 'payroll',     label: 'Payroll',     icon: DollarSign, description: 'Salary breakdown and net pay summary' },
  { id: 'attendance',  label: 'Attendance',  icon: Clock,     description: 'Daily attendance records and hours' },
  { id: 'leaves',      label: 'Leaves',      icon: CalendarOff, description: 'Leave requests and approval status' },
  { id: 'departments', label: 'Departments', icon: Building2, description: 'Department headcount and structure' },
];

const COLUMNS = {
  employees: [
    { key: 'employeeId', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ],
  payroll: [
    { key: 'employeeName', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'grossPay', label: 'Gross Pay' },
    { key: 'netPay', label: 'Net Pay' },
    { key: 'month', label: 'Month' },
  ],
  attendance: [
    { key: 'date', label: 'Date' },
    { key: 'employeeName', label: 'Employee' },
    { key: 'clockIn', label: 'Clock In' },
    { key: 'clockOut', label: 'Clock Out' },
    { key: 'hoursWorked', label: 'Hours' },
    { key: 'status', label: 'Status' },
  ],
  leaves: [
    { key: 'employeeName', label: 'Employee' },
    { key: 'type', label: 'Type' },
    { key: 'startDate', label: 'Start' },
    { key: 'endDate', label: 'End' },
    { key: 'days', label: 'Days' },
    { key: 'status', label: 'Status' },
  ],
  departments: [
    { key: 'name', label: 'Department' },
    { key: 'code', label: 'Code' },
    { key: 'head', label: 'Head' },
    { key: 'employeeCount', label: 'Employees' },
  ],
};

export default function Reports() {
  const { employees, payroll, attendance, leaves, departments } = useApp();
  const { success } = useNotification();
  const [activeReport, setActiveReport] = useState('employees');

  const deptName = (id) => DEPARTMENTS.find((d) => d.id === id)?.name || departments.find((d) => d.id === id)?.name || id;

  const reportData = useMemo(() => {
    switch (activeReport) {
      case 'employees':
        return employees.map((e) => ({
          employeeId: e.employeeId,
          name: `${e.firstName} ${e.lastName}`,
          email: e.email,
          department: deptName(e.department),
          role: e.role,
          status: e.status,
        }));
      case 'payroll':
        return payroll.map((p) => ({
          employeeName: p.employeeName,
          department: deptName(p.department),
          grossPay: formatCurrency(p.grossPay),
          netPay: formatCurrency(p.netPay),
          month: p.month,
        }));
      case 'attendance':
        return attendance.map((a) => {
          const emp = employees.find((e) => e.id === a.employeeId);
          return {
            date: formatDate(a.date),
            employeeName: emp ? `${emp.firstName} ${emp.lastName}` : a.employeeId,
            clockIn: a.clockIn,
            clockOut: a.clockOut || '—',
            hoursWorked: a.hoursWorked,
            status: a.status,
          };
        });
      case 'leaves':
        return leaves.map((l) => ({
          employeeName: l.employeeName,
          type: l.type,
          startDate: formatDate(l.startDate),
          endDate: formatDate(l.endDate),
          days: l.days,
          status: l.status,
        }));
      case 'departments':
        return departments.map((d) => {
          const head = employees.find((e) => e.id === d.headId);
          const count = employees.filter((e) => e.department === d.id).length;
          return {
            name: d.name,
            code: d.code,
            head: head ? `${head.firstName} ${head.lastName}` : '—',
            employeeCount: count,
          };
        });
      default:
        return [];
    }
  }, [activeReport, employees, payroll, attendance, leaves, departments]);

  const handleExport = (format) => {
    if (!reportData.length) return;
    const title = `NexusHR — ${REPORT_TYPES.find((r) => r.id === activeReport)?.label} Report`;
    const filename = `${activeReport}-report-${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') exportToCSV(reportData, `${filename}.csv`);
    else if (format === 'excel') exportToExcel(reportData, `${filename}.xlsx`, activeReport);
    else exportToPDF(reportData, COLUMNS[activeReport], title, `${filename}.pdf`);

    success(`Report exported as ${format.toUpperCase()}.`);
  };

  const current = REPORT_TYPES.find((r) => r.id === activeReport);

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Reports</h1>
          <p className="module-page__subtitle">Generate and export workforce analytics</p>
        </div>
        <div className="module-page__actions">
          <Button variant="secondary" leftIcon={<FileText size={14} />} onClick={() => handleExport('pdf')}>PDF</Button>
          <Button variant="secondary" leftIcon={<FileSpreadsheet size={14} />} onClick={() => handleExport('excel')}>Excel</Button>
          <Button variant="primary" leftIcon={<Download size={14} />} onClick={() => handleExport('csv')}>Export CSV</Button>
        </div>
      </div>

      <div className="module-grid animate-fadeInUp" style={{ marginBottom: 'var(--space-6)' }}>
        {REPORT_TYPES.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            type="button"
            className="module-card"
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              borderColor: activeReport === id ? 'var(--color-primary-500)' : undefined,
              boxShadow: activeReport === id ? '0 0 0 1px var(--color-primary-500)' : undefined,
            }}
            onClick={() => setActiveReport(id)}
          >
            <Icon size={20} color={activeReport === id ? 'var(--color-primary-400)' : 'var(--text-muted)'} />
            <h3 className="module-card__title" style={{ marginTop: 12 }}>{label}</h3>
            <p className="module-card__meta">{description}</p>
            <p className="module-card__meta" style={{ marginTop: 8 }}>
              {id === activeReport ? `${reportData.length} records ready` : 'Click to preview'}
            </p>
          </button>
        ))}
      </div>

      <div className="module-table-wrap animate-fadeInUp">
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={18} color="var(--color-primary-400)" />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{current?.label} Preview</h3>
          <span className="module-card__meta" style={{ marginLeft: 'auto' }}>{reportData.length} rows</span>
        </div>
        {reportData.length === 0 ? (
          <div className="module-empty">
            <BarChart2 size={40} opacity={0.3} />
            <h3>No data available</h3>
            <p>There are no records to display for this report.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="module-table">
              <thead>
                <tr>
                  {COLUMNS[activeReport].map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.slice(0, 50).map((row, i) => (
                  <tr key={i}>
                    {COLUMNS[activeReport].map((col) => (
                      <td key={col.key}>{row[col.key] ?? '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.length > 50 && (
              <p style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Showing 50 of {reportData.length} records. Export to view all.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
