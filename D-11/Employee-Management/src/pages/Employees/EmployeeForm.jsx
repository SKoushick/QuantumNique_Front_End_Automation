import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { DEPARTMENTS, EMPLOYMENT_TYPES, DESIGNATIONS } from '../../utils/constants';
import Button from '../../components/ui/Button/Button';
import './Employees.css';

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '', role: 'employee',
  department: 'd1', designation: 'Software Engineer', employmentType: 'Full-time',
  status: 'active', joinDate: new Date().toISOString().split('T')[0],
  salary: 80000, location: '', workMode: 'Hybrid', bio: '',
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { employees, addEmployee, updateEmployee } = useApp();
  const { isHR } = useAuth();
  const { success, error: toastError } = useNotification();

  const existing = isEdit ? employees.find((e) => e.id === id) : null;
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (existing) {
      setForm({
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
        phone: existing.phone || '',
        role: existing.role,
        department: existing.department,
        designation: existing.designation,
        employmentType: existing.employmentType,
        status: existing.status,
        joinDate: existing.joinDate,
        salary: existing.salary,
        location: existing.location || '',
        workMode: existing.workMode || 'Hybrid',
        bio: existing.bio || '',
      });
    }
  }, [existing]);

  if (!isHR()) {
    navigate('/');
    return null;
  }

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toastError('Please fill in required fields.');
      return;
    }
    const dept = DEPARTMENTS.find((d) => d.id === form.department);
    const payload = { ...form, departmentName: dept?.name || '' };

    if (isEdit) {
      updateEmployee(id, payload);
      success('Employee updated successfully.');
      navigate(`/employees/${id}`);
    } else {
      const created = addEmployee(payload);
      success('Employee created successfully.');
      navigate(`/employees/${created.id}`);
    }
  };

  return (
    <div className="module-page page-container emp-form-page">
      <div className="module-page__header">
        <div>
          <button className="auth-back-link" onClick={() => navigate(isEdit ? `/employees/${id}` : '/employees')}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="module-page__title">{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
        </div>
      </div>

      <form className="module-form card" onSubmit={handleSubmit}>
        <div className="module-form-row">
          <div className="module-field">
            <label htmlFor="firstName">First name *</label>
            <input id="firstName" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
          </div>
          <div className="module-field">
            <label htmlFor="lastName">Last name *</label>
            <input id="lastName" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
          </div>
        </div>

        <div className="module-form-row">
          <div className="module-field">
            <label htmlFor="email">Email *</label>
            <input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div className="module-field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
        </div>

        <div className="module-form-row">
          <div className="module-field">
            <label htmlFor="department">Department</label>
            <select id="department" value={form.department} onChange={(e) => set('department', e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="module-field">
            <label htmlFor="designation">Designation</label>
            <select id="designation" value={form.designation} onChange={(e) => set('designation', e.target.value)}>
              {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="module-form-row">
          <div className="module-field">
            <label htmlFor="role">Role</label>
            <select id="role" value={form.role} onChange={(e) => set('role', e.target.value)}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="module-field">
            <label htmlFor="employmentType">Employment type</label>
            <select id="employmentType" value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}>
              {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="module-form-row">
          <div className="module-field">
            <label htmlFor="salary">Annual salary</label>
            <input id="salary" type="number" value={form.salary} onChange={(e) => set('salary', +e.target.value)} />
          </div>
          <div className="module-field">
            <label htmlFor="joinDate">Join date</label>
            <input id="joinDate" type="date" value={form.joinDate} onChange={(e) => set('joinDate', e.target.value)} />
          </div>
        </div>

        <div className="module-form-row">
          <div className="module-field">
            <label htmlFor="location">Location</label>
            <input id="location" value={form.location} onChange={(e) => set('location', e.target.value)} />
          </div>
          <div className="module-field">
            <label htmlFor="workMode">Work mode</label>
            <select id="workMode" value={form.workMode} onChange={(e) => set('workMode', e.target.value)}>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Office">Office</option>
            </select>
          </div>
        </div>

        <div className="module-field">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="submit" variant="primary">{isEdit ? 'Save Changes' : 'Create Employee'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
