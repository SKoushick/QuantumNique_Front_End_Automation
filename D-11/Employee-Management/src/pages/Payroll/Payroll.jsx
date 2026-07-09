import React, { useState } from 'react';
import { DollarSign, Download, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency, getStatusColor, getStatusBg } from '../../utils/formatters';
import { generatePayslipPDF } from '../../utils/exportUtils';
import Button from '../../components/ui/Button/Button';

export default function Payroll() {
  const { payroll, employees } = useApp();
  const { success } = useNotification();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = payroll.filter((p) =>
    !search || p.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  const currentMonth = selected?.months?.[0];

  const handleDownload = () => {
    if (!selected || !currentMonth) return;
    generatePayslipPDF(selected, currentMonth);
    success('Payslip downloaded.');
  };

  const totalGross = payroll.reduce((s, p) => s + (p.months[0]?.grossPay || 0), 0);
  const totalNet = payroll.reduce((s, p) => s + (p.months[0]?.netPay || 0), 0);

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Payroll</h1>
          <p className="module-page__subtitle">Salary processing and payslips</p>
        </div>
      </div>

      <div className="module-stats animate-fadeInUp">
        <div className="module-stat">
          <div className="module-stat__value">{formatCurrency(totalGross)}</div>
          <div className="module-stat__label">Total gross (current)</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value">{formatCurrency(totalNet)}</div>
          <div className="module-stat__label">Total net (current)</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value">{payroll.length}</div>
          <div className="module-stat__label">Employees on payroll</div>
        </div>
      </div>

      <div className="module-filters">
        <div className="module-search">
          <Search size={15} className="module-search__icon" />
          <input className="module-search__input" placeholder="Search employees…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 24 }}>
        <div className="module-table-wrap animate-fadeInUp">
          <table className="module-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Annual Salary</th>
                <th>Current Net</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.employeeId} onClick={() => setSelected(p)} style={{ cursor: 'pointer', background: selected?.employeeId === p.employeeId ? 'var(--bg-hover)' : undefined }}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.employeeName}</td>
                  <td>{p.department}</td>
                  <td>{formatCurrency(p.salary)}</td>
                  <td>{formatCurrency(p.months[0]?.netPay)}</td>
                  <td>
                    <span className="status-badge" style={{ color: getStatusColor(p.months[0]?.status), background: getStatusBg(p.months[0]?.status) }}>
                      {p.months[0]?.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && currentMonth && (
          <div className="module-card animate-fadeInUp">
            <h3 className="module-card__title"><DollarSign size={16} style={{ display: 'inline' }} /> Payslip</h3>
            <p className="module-card__meta">{selected.employeeName} · {currentMonth.month}</p>
            <div style={{ marginTop: 16, fontSize: 'var(--text-sm)' }}>
              {[
                ['Basic', currentMonth.basic],
                ['HRA', currentMonth.hra],
                ['Allowances', currentMonth.allowances],
                ['Bonus', currentMonth.bonus],
                ['Gross', currentMonth.grossPay],
                ['Tax', -currentMonth.tax],
                ['Insurance', -currentMonth.insurance],
                ['PF', -currentMonth.pf],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(Math.abs(val))}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 700, color: 'var(--color-success-400)' }}>
                <span>Net Pay</span>
                <span>{formatCurrency(currentMonth.netPay)}</span>
              </div>
            </div>
            <Button variant="primary" fullWidth leftIcon={<Download size={14} />} onClick={handleDownload} style={{ marginTop: 16 }}>
              Download PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
