import React, { useState, useEffect } from 'react';
import { Award, FileDown, Printer, SlidersHorizontal, UserCheck } from 'lucide-react';
import { apiService } from '../services/api';
import jsPDF from 'jspdf';

export default function Certificates({ currentTeacher, triggerNotification }) {
  const [perfectStudents, setPerfectStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [collegeName, setCollegeName] = useState('Apex College of Engineering & Technology');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  useEffect(() => {
    loadPerfectAttendanceStudents();
  }, [currentTeacher]);

  const loadPerfectAttendanceStudents = () => {
    const students = JSON.parse(localStorage.getItem('attendance_students') || '[]');
    // Filter students with 100% attendance in the teacher's scope
    const assigned = currentTeacher.assignedClasses;
    const filtered = students.filter(s => {
      const isAssigned = assigned.some(c => 
        c.department === s.department && c.year === s.year && c.section === s.section
      );
      return isAssigned && s.previousAttendance === 100;
    });
    setPerfectStudents(filtered);
    if (filtered.length > 0) {
      setSelectedStudent(filtered[0]);
    }
  };

  const handleSelectStudentChange = (e) => {
    const id = e.target.value;
    const match = perfectStudents.find(s => s.id === id);
    setSelectedStudent(match || null);
  };

  // GENERATE PDF CERTIFICATE
  const downloadCertificatePDF = () => {
    if (!selectedStudent) return;

    // Landscape orientation A4
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const w = doc.internal.pageSize.getWidth(); // 297mm
    const h = doc.internal.pageSize.getHeight(); // 210mm

    // Draw background borders
    doc.setDrawColor(217, 119, 6); // Golden Amber
    doc.setLineWidth(1.5);
    doc.rect(10, 10, w - 20, h - 20); // Outer border
    
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.rect(13, 13, w - 26, h - 26); // Inner border

    // Draw corners
    doc.setFillColor(245, 158, 11);
    doc.triangle(10, 10, 25, 10, 10, 25, 'F');
    doc.triangle(w - 10, 10, w - 25, 10, w - 10, 25, 'F');
    doc.triangle(10, h - 10, 25, h - 10, 10, h - 25, 'F');
    doc.triangle(w - 10, h - 10, w - 25, h - 10, w - 10, h - 25, 'F');

    // Title / Institution Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(collegeName.toUpperCase(), w / 2, 35, { align: 'center' });

    doc.setFont('Times', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('Apex Collegiate Merits & Awards', w / 2, 43, { align: 'center' });

    // Certificate Logo badge
    doc.setFontSize(32);
    doc.text('🏆', w / 2 - 5, 62);

    // Award Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(217, 119, 6);
    doc.text('CERTIFICATE OF PERFECT ATTENDANCE', w / 2, 78, { align: 'center' });

    doc.setFont('Times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('THIS ACHIEVEMENT AWARD IS PROUDLY CONFERRED UPON', w / 2, 90, { align: 'center' });

    // Student Name
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text(selectedStudent.name, w / 2, 105, { align: 'center' });

    // Description text
    doc.setFont('Times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    const desc = `for maintaining a record of 100% attendance in the department of ${selectedStudent.department}, ${selectedStudent.year} (Section ${selectedStudent.section}), for academic session ${academicYear}.`;
    
    // Auto wrap description text
    const textLines = doc.splitTextToSize(desc, 220);
    doc.text(textLines, w / 2, 118, { align: 'center' });

    // Signatures / Date blocks
    const finalY = 160;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    // Date
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 35, finalY + 5);

    // Lines for signatures
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(120, finalY, 180, finalY);
    doc.line(210, finalY, 270, finalY);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Faculty Advisor Signature', 130, finalY + 5);
    doc.text('Principal Authorization Signature', 220, finalY + 5);

    doc.save(`${selectedStudent.name.toLowerCase().replace(/\s+/g, '_')}_attendance_award.pdf`);
    triggerNotification(`Award Certificate downloaded for ${selectedStudent.name}!`);
  };

  const handlePrintCertificate = () => {
    if (!selectedStudent) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Perfect Attendance Certificate Print</title>
          <style>
            body { font-family: 'Times New Roman', serif; display: flex; items-center: center; justify-content: center; height: 100vh; margin: 0; background: #fff; }
            .cert-box { border: 15px double #d97706; padding: 40px; width: 800px; height: 500px; text-align: center; position: relative; margin: auto; box-sizing: border-box; }
            .college { font-size: 28px; font-weight: bold; color: #1e293b; margin-bottom: 5px; text-transform: uppercase; font-family: sans-serif; }
            .sub { font-size: 16px; font-style: italic; color: #64748b; margin-bottom: 20px; }
            .award { font-size: 24px; font-weight: bold; color: #d97706; text-transform: uppercase; margin-bottom: 20px; font-family: sans-serif; }
            .intro { font-size: 14px; font-style: italic; color: #64748b; }
            .name { font-size: 32px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; width: fit-content; margin: 20px auto; padding-bottom: 5px; font-family: sans-serif; }
            .desc { font-size: 14px; color: #475569; font-style: italic; max-width: 600px; margin: 0 auto; line-height: 1.5; }
            .footer { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 40px; }
            .sig { width: 180px; border-top: 1px solid #94a3b8; padding-top: 8px; font-size: 11px; color: #64748b; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div style="font-size: 40px; margin-bottom: 10px;">🏆</div>
            <div class="college">${collegeName}</div>
            <div class="sub">Apex Collegiate Merits & Awards Office</div>
            <div class="award">Certificate of Perfect Attendance</div>
            <div class="intro">THIS MERIT RECOGNITION IS PROUDLY GRANTED TO</div>
            <div class="name">${selectedStudent.name}</div>
            <div class="desc">
              for completing the semester curriculum with a flawless 100% perfect attendance record in the department of ${selectedStudent.department}, ${selectedStudent.year} (Section ${selectedStudent.section}), for academic session ${academicYear}.
            </div>
            <div class="footer">
              <div class="sig" style="border: none; text-align: left; padding-left: 0;">Date: ${new Date().toLocaleDateString()}</div>
              <div class="sig">Class Faculty Advisor</div>
              <div class="sig">Principal Administrator</div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Selection Portal */}
      <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Award className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Perfect Attendance Certificate Portal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Select Student */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Perfect Roster Student</label>
            <select
              value={selectedStudent?.id || ''}
              onChange={handleSelectStudentChange}
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all cursor-pointer dark:text-slate-200"
            >
              {perfectStudents.length === 0 ? (
                <option value="">No perfect attendance students</option>
              ) : (
                perfectStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNumber})</option>
                ))
              )}
            </select>
          </div>

          {/* Academic Session */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Session</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2025-2026"
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all dark:text-slate-200"
            />
          </div>

          {/* Institution override */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Institution Header</label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="Enter College Name"
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all dark:text-slate-200"
            />
          </div>
        </div>

        {selectedStudent && (
          <div className="flex gap-4">
            <button
              onClick={downloadCertificatePDF}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 animate-glow"
            >
              <FileDown className="h-4.5 w-4.5" />
              <span>Download Certificate</span>
            </button>

            <button
              onClick={handlePrintCertificate}
              className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <Printer className="h-4.5 w-4.5" />
              <span>Print Award Sheet</span>
            </button>
          </div>
        )}
      </div>

      {/* Visual Mockup Layout Card */}
      {selectedStudent ? (
        <div className="max-w-4xl mx-auto border-8 double border-amber-600 dark:border-amber-500/40 p-12 bg-white dark:bg-slate-900 rounded-3xl shadow-lg relative text-center space-y-6">
          <div className="text-5xl">🏆</div>
          
          <div className="space-y-1">
            <h2 className="font-extrabold text-2xl text-slate-800 dark:text-white uppercase tracking-wider">{collegeName}</h2>
            <p className="text-xs text-slate-400 font-serif italic">Apex Collegiate Merits & Awards Office</p>
          </div>

          <div className="w-16 h-0.5 bg-amber-500 mx-auto"></div>

          <div className="space-y-1">
            <h3 className="text-amber-600 dark:text-amber-500 font-bold text-lg tracking-wide">CERTIFICATE OF PERFECT ATTENDANCE</h3>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Proudly presented to</p>
          </div>

          <h2 className="text-3xl font-extrabold font-serif text-slate-950 dark:text-white border-b border-slate-200 dark:border-slate-800 w-fit mx-auto px-6 pb-2">
            {selectedStudent.name}
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xl mx-auto font-serif italic">
            for maintaining a flawless <span className="font-semibold text-emerald-500">100% attendance rate</span> in the department of {selectedStudent.department}, during academic year {academicYear}.
          </p>

          <div className="flex justify-between items-end pt-12 text-[10px] text-slate-400">
            <div className="text-left">
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 w-32 pt-2 text-center">
              <span>Class Faculty Signature</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 w-32 pt-2 text-center">
              <span>Principal Office Signature</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card bg-slate-50 dark:bg-slate-800/10 rounded-3xl p-12 border border-slate-200/50 dark:border-slate-800/50 text-center max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-500">
            <Award className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200">No Eligible Students</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            There are currently no students under your purview with a flawless 100% attendance score. Complete attendance markings and verify if any student satisfies the perfection requirements.
          </p>
        </div>
      )}
    </div>
  );
}
