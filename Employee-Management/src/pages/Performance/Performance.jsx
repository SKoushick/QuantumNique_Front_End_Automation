import React, { useMemo } from 'react';
import { TrendingUp, Star, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getInitials, getAvatarColor } from '../../utils/formatters';
import { PERFORMANCE_RATINGS } from '../../utils/constants';

export default function Performance() {
  const { reviews, employees } = useApp();
  const { user, isManager } = useAuth();

  const visible = useMemo(() => {
    if (isManager()) return reviews;
    return reviews.filter((r) => r.employeeId === user.id);
  }, [reviews, user, isManager]);

  const getEmployee = (id) => employees.find((e) => e.id === id);

  return (
    <div className="module-page page-container">
      <div className="module-page__header animate-fadeInDown">
        <div>
          <h1 className="module-page__title">Performance</h1>
          <p className="module-page__subtitle">Reviews, KPIs, and feedback</p>
        </div>
      </div>

      <div className="module-stats animate-fadeInUp">
        <div className="module-stat">
          <div className="module-stat__value">{visible.filter((r) => r.status === 'completed').length}</div>
          <div className="module-stat__label">Completed reviews</div>
        </div>
        <div className="module-stat">
          <div className="module-stat__value">
            {visible.length ? (visible.reduce((s, r) => s + r.overallRating, 0) / visible.length).toFixed(1) : '—'}
          </div>
          <div className="module-stat__label">Avg rating</div>
        </div>
      </div>

      <div className="module-grid animate-fadeInUp">
        {visible.map((review) => {
          const emp = getEmployee(review.employeeId);
          const name = emp ? `${emp.firstName} ${emp.lastName}` : review.employeeId;
          return (
            <div key={review.id} className="module-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: getAvatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                  {getInitials(name)}
                </div>
                <div>
                  <h3 className="module-card__title">{name}</h3>
                  <p className="module-card__meta">{review.period}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning-400)' }}>
                  <Star size={16} fill="currentColor" />
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{review.overallRating}</span>
                </div>
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 16 }}>{review.feedback}</p>

              <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                <TrendingUp size={12} style={{ display: 'inline' }} /> KPI Ratings
              </h4>
              {Object.entries(review.ratings || {}).map(([key, val]) => (
                <div key={key} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 2 }}>
                    <span style={{ textTransform: 'capitalize' }}>{key}</span>
                    <span>{val}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-overlay)', borderRadius: 4 }}>
                    <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: 'var(--color-primary-500)', borderRadius: 4 }} />
                  </div>
                </div>
              ))}

              {review.goals?.length > 0 && (
                <>
                  <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '16px 0 8px' }}>
                    <Target size={12} style={{ display: 'inline' }} /> Goals
                  </h4>
                  {review.goals.map((g, i) => (
                    <div key={i} style={{ fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                      {g.title} — {g.progress}%
                    </div>
                  ))}
                </>
              )}

              <p className="module-card__meta" style={{ marginTop: 12 }}>Completed {formatDate(review.completedAt)}</p>
            </div>
          );
        })}
      </div>

      {isManager() && (
        <div className="module-card animate-fadeInUp" style={{ marginTop: 24 }}>
          <h3 className="module-card__title">Rating Scale</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {PERFORMANCE_RATINGS.map((r) => (
              <span key={r.value} className="status-badge" style={{ color: r.color, background: `${r.color}22` }}>
                {r.value} — {r.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
