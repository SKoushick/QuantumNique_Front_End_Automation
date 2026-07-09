import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Briefcase,
  Star, GraduationCap, Shield, DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  formatDate, formatCurrency, getInitials, getAvatarColor,
  getStatusColor, getStatusBg
} from '../../utils/formatters';
import Button from '../../components/ui/Button/Button';
import './Employees.css';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees } = useApp();
  const { isHR, user } = useAuth();

  const emp = employees.find((e) => e.id === id);
  const manager = emp?.manager ? employees.find((e) => e.id === emp.manager) : null;
  const canEdit = isHR() || user?.id === id;

  if (!emp) {
    return (
      <div className="module-page page-container">
        <div className="module-empty">
          <h3>Employee not found</h3>
          <Button variant="secondary" onClick={() => navigate('/employees')}>Back to list</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <button className="auth-back-link" onClick={() => navigate('/employees')} style={{ marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to employees
          </button>
          <h1 className="module-page__title">Employee Profile</h1>
        </div>
        {canEdit && (
          <Button variant="primary" leftIcon={<Edit size={14} />} onClick={() => navigate(`/employees/${id}/edit`)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="emp-profile__header animate-fadeInUp">
        <div className="emp-profile__avatar" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
          {getInitials(`${emp.firstName} ${emp.lastName}`)}
        </div>
        <div className="emp-profile__info">
          <h2 className="emp-profile__name">{emp.firstName} {emp.lastName}</h2>
          <p className="emp-profile__role">{emp.designation} · {emp.departmentName}</p>
          <span className="emp-status-badge" style={{ color: getStatusColor(emp.status), background: getStatusBg(emp.status), marginTop: 8 }}>
            {emp.status.replace('_', ' ')}
          </span>
          <div className="emp-profile__meta">
            <span><Mail size={14} /> {emp.email}</span>
            <span><Phone size={14} /> {emp.phone}</span>
            <span><MapPin size={14} /> {emp.location}</span>
            <span><Calendar size={14} /> Joined {formatDate(emp.joinDate)}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', color: 'var(--color-warning-400)' }}>
            <Star size={16} fill="currentColor" />
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{emp.performanceScore}</span>
          </div>
          <p className="emp-table__sub">Performance score</p>
        </div>
      </div>

      <div className="emp-profile__grid animate-fadeInUp">
        <section className="emp-profile__section">
          <h3 className="emp-profile__section-title"><Briefcase size={14} /> Employment</h3>
          <p><strong>ID:</strong> {emp.employeeId}</p>
          <p><strong>Type:</strong> {emp.employmentType}</p>
          <p><strong>Work mode:</strong> {emp.workMode}</p>
          <p><strong>Manager:</strong> {manager ? `${manager.firstName} ${manager.lastName}` : '—'}</p>
          <p><strong>Role:</strong> {emp.role}</p>
        </section>

        {isHR() && (
          <section className="emp-profile__section">
            <h3 className="emp-profile__section-title"><DollarSign size={14} /> Compensation</h3>
            <p><strong>Annual salary:</strong> {formatCurrency(emp.salary)}</p>
            <p><strong>Leave balance:</strong></p>
            <ul style={{ marginLeft: 16, marginTop: 4 }}>
              {Object.entries(emp.leaveBalance || {}).map(([k, v]) => (
                <li key={k}>{k}: {v} days</li>
              ))}
            </ul>
          </section>
        )}

        <section className="emp-profile__section">
          <h3 className="emp-profile__section-title">Skills</h3>
          <div>
            {(emp.skills || []).map((s) => (
              <span key={s.name} className="emp-skill-tag">{s.name} · {s.level}</span>
            ))}
          </div>
        </section>

        <section className="emp-profile__section">
          <h3 className="emp-profile__section-title"><GraduationCap size={14} /> Education</h3>
          {(emp.education || []).map((ed, i) => (
            <p key={i}>{ed.degree} — {ed.institution} ({ed.year})</p>
          ))}
        </section>

        <section className="emp-profile__section">
          <h3 className="emp-profile__section-title"><Shield size={14} /> Emergency Contact</h3>
          {emp.emergencyContact ? (
            <>
              <p><strong>{emp.emergencyContact.name}</strong> ({emp.emergencyContact.relation})</p>
              <p>{emp.emergencyContact.phone}</p>
            </>
          ) : <p className="text-muted">Not provided</p>}
        </section>

        <section className="emp-profile__section">
          <h3 className="emp-profile__section-title">About</h3>
          <p>{emp.bio || 'No bio available.'}</p>
          {emp.linkedin && <p><Link to={emp.linkedin} target="_blank">LinkedIn</Link></p>}
        </section>
      </div>
    </div>
  );
}
