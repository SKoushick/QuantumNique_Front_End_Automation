import React, { useState } from 'react';
import { UserPlus, Download, Upload, SlidersHorizontal, Table, Save, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export default function BulkImport({ currentTeacher, triggerNotification }) {
  const [selectedDept, setSelectedDept] = useState(currentTeacher?.assignedDepartments?.[0] || '');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  const [rawText, setRawText] = useState('');
  const [parsedStudents, setParsedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cascading dropdowns
  const departments = currentTeacher?.assignedDepartments || [];
  const years = currentTeacher?.assignedClasses
    ?.filter(c => c.department === selectedDept)
    ?.map(c => c.year)
    ?.filter((val, idx, self) => self.indexOf(val) === idx) || [];

  const sections = currentTeacher?.assignedClasses
    ?.filter(c => c.department === selectedDept && c.year === selectedYear)
    ?.map(c => c.section)
    ?.filter((val, idx, self) => self.indexOf(val) === idx) || [];

  // Download sample CSV template
  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Register Number,Roll Number,Parent Contact\nJane Doe,2025AD051,51,+91 9876543210\nJohn Smith,2025AD052,52,+91 9876543211";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification('Sample CSV Template downloaded!');
  };

  // Parse custom CSV file or copy-pasted text
  const parseCSV = () => {
    if (!rawText.trim()) {
      alert('Please enter or paste CSV text data first.');
      return;
    }

    const lines = rawText.split('\n');
    const parsed = [];

    // Skip header line if present
    const hasHeader = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('register');
    const startIdx = hasHeader ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',');
      if (columns.length >= 2) {
        parsed.push({
          name: columns[0]?.trim(),
          registerNumber: columns[1]?.trim(),
          rollNumber: columns[2]?.trim() || (i + 40).toString(), // auto increment roll
          parentContact: columns[3]?.trim() || '+91 9000000000',
          previousAttendance: 100 // default newly imported students to perfect score
        });
      }
    }

    setParsedStudents(parsed);
    triggerNotification(`Successfully parsed ${parsed.length} student rows!`);
  };

  // Process file upload input
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const text = readerEvent.target.result;
      setRawText(text);
      triggerNotification('CSV File loaded into editor. Click Parse to preview.');
    };
    reader.readAsText(file);
  };

  // Import parsed data to DB
  const saveImport = async () => {
    if (!selectedDept || !selectedYear || !selectedSection) {
      alert('Please select the target Department, Year, and Section.');
      return;
    }

    if (parsedStudents.length === 0) {
      alert('Roster list is empty. Parse students first.');
      return;
    }

    setLoading(true);
    try {
      await apiService.bulkImportStudents(parsedStudents, selectedDept, selectedYear, selectedSection);
      triggerNotification(`Roster successfully updated! Imported ${parsedStudents.length} students into class.`);
      
      // Reset state
      setParsedStudents([]);
      setRawText('');
    } catch (e) {
      alert('Roster import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Cascading Target Class filter */}
      <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <SlidersHorizontal className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Select Target Roster Class</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all cursor-pointer dark:text-slate-200"
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Year</label>
            <select
              value={selectedYear}
              disabled={!selectedDept}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all cursor-pointer dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Year</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Section</label>
            <select
              value={selectedSection}
              disabled={!selectedYear}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all cursor-pointer dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Section</option>
              {sections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Paste or upload input portal */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-5 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Upload CSV / Paste Data</h4>
            <button 
              onClick={downloadTemplate}
              className="flex items-center space-x-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase hover:underline"
            >
              <Download className="h-3 w-3" />
              <span>Get CSV Template</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Drag & drop file trigger */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center flex flex-col items-center hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-7 w-7 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Choose CSV File</p>
              <p className="text-[9px] text-slate-400 mt-1">UTF-8 comma delimited</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Raw Data Editor</span>
              <textarea
                rows="6"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Format: Name,Register Number,Roll Number,Parent Contact&#10;Alice,2025AD053,53,+919900000000"
                className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-850 dark:border-slate-700/50 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 font-mono dark:text-slate-200 resize-y"
              ></textarea>
            </div>

            <button
              onClick={parseCSV}
              className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs py-3 rounded-xl transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Parse & Validate Data</span>
            </button>
          </div>
        </div>

        {/* Parsed Preview Table Roster */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-5 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Table className="h-5 w-5 text-indigo-500" />
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Roster Import Preview ({parsedStudents.length} Students)</h4>
            </div>

            <div className="max-h-[350px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-[9px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Register Number</th>
                    <th className="py-2.5 px-4">Roll</th>
                    <th className="py-2.5 px-4">Parent Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedStudents.map((s, idx) => (
                    <tr key={idx} className="text-xs">
                      <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{s.name}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{s.registerNumber}</td>
                      <td className="py-2.5 px-4 text-slate-500">{s.rollNumber}</td>
                      <td className="py-2.5 px-4 text-slate-500">{s.parentContact}</td>
                    </tr>
                  ))}
                  
                  {parsedStudents.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-16 text-center text-xs text-slate-400">
                        Paste data or select a CSV template to inspect student rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {parsedStudents.length > 0 && (
            <button
              onClick={saveImport}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95 mt-4"
            >
              <Save className="h-4.5 w-4.5" />
              <span>{loading ? 'Adding Students...' : 'Apply & Save Roster Roster'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
