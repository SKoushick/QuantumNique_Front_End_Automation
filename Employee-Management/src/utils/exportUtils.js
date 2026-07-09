/**
 * Export utilities — PDF, Excel, CSV
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function exportToCSV(data, filename = 'export.csv') {
  if (!data?.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      const str = val == null ? '' : String(val);
      return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function exportToExcel(data, filename = 'export.xlsx', sheetName = 'Sheet1') {
  if (!data?.length) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export function exportToPDF(data, columns, title = 'Report', filename = 'report.pdf') {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 26);

  autoTable(doc, {
    startY: 32,
    head: [columns.map((c) => c.label)],
    body: data.map((row) => columns.map((c) => row[c.key] ?? '—')),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [66, 133, 244] },
  });

  doc.save(filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generatePayslipPDF(employee, monthData) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('NexusHR — Payslip', 14, 20);
  doc.setFontSize(11);
  doc.text(`Employee: ${employee.employeeName}`, 14, 32);
  doc.text(`Period: ${monthData.month}`, 14, 40);
  doc.text(`Department: ${employee.department}`, 14, 48);

  autoTable(doc, {
    startY: 56,
    head: [['Component', 'Amount']],
    body: [
      ['Basic', `$${monthData.basic?.toLocaleString()}`],
      ['HRA', `$${monthData.hra?.toLocaleString()}`],
      ['Allowances', `$${monthData.allowances?.toLocaleString()}`],
      ['Bonus', `$${monthData.bonus?.toLocaleString()}`],
      ['Gross Pay', `$${monthData.grossPay?.toLocaleString()}`],
      ['Tax', `-$${monthData.tax?.toLocaleString()}`],
      ['Insurance', `-$${monthData.insurance?.toLocaleString()}`],
      ['PF', `-$${monthData.pf?.toLocaleString()}`],
      ['Net Pay', `$${monthData.netPay?.toLocaleString()}`],
    ],
    headStyles: { fillColor: [66, 133, 244] },
  });

  doc.save(`payslip-${employee.employeeName.replace(/\s+/g, '_')}-${monthData.monthKey}.pdf`);
}
