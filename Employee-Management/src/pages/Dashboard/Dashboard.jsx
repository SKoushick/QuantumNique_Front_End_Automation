/**
 * Dashboard — main analytics overview page
 */

import React, { useState } from 'react';
import {
  Users, UserCheck, CalendarOff, Briefcase, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, Minus, UserPlus, CalendarCheck, Star, DollarSign,
  Package, Megaphone, Activity, Clock, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { mockDashboardStats } from '../../data/mockData';
import { formatCurrency, formatDate, getAvatarColor, getInitials } from '../../utils/formatters';
import './Dashboard.css';

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, change, changeLabel, color, gradient }) {
  const isPositive = change > 0;
  const isNeutral  = change === 0;
  return (
    <div className="stat-card hover-lift">
      <div className="stat-card__header">
        <div className="stat-card__icon-wrap" style={{ background: `${color}18`, color }}>
          <Icon size={22} strokeWidth={2} />
        </div>
        <span
          className={`stat-card__change ${isPositive ? 'stat-card__change--up' : isNeutral ? 'stat-card__change--neutral' : 'stat-card__change--down'}`}
        >
          {isNeutral ? <Minus size={12} /> : isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="stat-card__body">
        <p className="stat-card__value count-up">{value}</p>
        <p className="stat-card__label">{label}</p>
      </div>
      <p className="stat-card__sub">{changeLabel}</p>
      <div className="stat-card__bar" style={{ '--bar-color': color, '--bar-pct': `${Math.min(Math.abs(change) * 5, 100)}%` }} />
    </div>
  );
}

// ── Custom chart tooltip ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="chart-tooltip__item" style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Activity icon map ──────────────────────────────────────────────────────────
const ACTIVITY_ICONS = { UserPlus, CalendarCheck, Star, DollarSign, Package, Megaphone };
const ACTIVITY_COLORS = {
  hire:     'var(--color-success-400)',
  leave:    'var(--color-cyan-400)',
  review:   'var(--color-warning-400)',
  payroll:  'var(--color-primary-400)',
  asset:    'var(--color-violet-400)',
  announce: 'var(--color-orange-400)',
};

export default function Dashboard() {
  const { user }  = useAuth();
  const stats     = mockDashboardStats;
  const [activeTab, setActiveTab] = useState('attendance');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard page-container">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="dashboard__header animate-fadeInDown">
        <div>
          <h1 className="dashboard__greeting">
            {greeting()}, {user?.firstName}! 👋
          </h1>
          <p className="dashboard__date">
            {formatDate(new Date(), 'EEEE, MMMM d, yyyy')} · Here's what's happening at NexusHR today.
          </p>
        </div>
        <div className="dashboard__quick-actions">
          <button className="dash-action-btn" onClick={() => window.location.href = '/employees/add'}>
            <UserPlus size={16} /> Add Employee
          </button>
          <button className="dash-action-btn dash-action-btn--secondary" onClick={() => window.location.href = '/leave'}>
            <CalendarOff size={16} /> View Leaves
          </button>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="dashboard__stats grid grid-cols-4 gap-4 animate-fadeInUp stagger-1">
        <StatCard
          icon={Users} label="Total Employees" value={stats.totalEmployees.toLocaleString()}
          change={+5.2} changeLabel="vs last quarter" color="var(--color-primary-500)"
        />
        <StatCard
          icon={UserCheck} label="Present Today" value={stats.activeToday}
          change={+2.1} changeLabel={`${stats.avgAttendance}% attendance rate`} color="var(--color-success-500)"
        />
        <StatCard
          icon={CalendarOff} label="On Leave" value={stats.onLeave}
          change={-0.8} changeLabel="2 pending approval" color="var(--color-warning-500)"
        />
        <StatCard
          icon={Briefcase} label="Open Positions" value={stats.openPositions}
          change={+12} changeLabel="3 offers pending" color="var(--color-violet-500)"
        />
      </div>

      {/* ── Main charts row ─────────────────────────────────────────── */}
      <div className="dashboard__charts-row animate-fadeInUp stagger-2">
        {/* Attendance trend */}
        <div className="chart-card chart-card--large">
          <div className="chart-card__header">
            <div>
              <h3 className="chart-card__title">Attendance Overview</h3>
              <p className="chart-card__sub">Last 14 days</p>
            </div>
            <div className="chart-card__tabs">
              {['attendance', 'payroll'].map((t) => (
                <button
                  key={t}
                  className={`chart-tab ${activeTab === t ? 'chart-tab--active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-card__body">
            {activeTab === 'attendance' ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.attendanceTrend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220,90%,56%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(220,90%,56%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38,95%,55%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(38,95%,55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => formatDate(v, 'MM/dd')} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="present" name="Present" stroke="hsl(220,90%,56%)" fill="url(#colorPresent)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="late"    name="Late"    stroke="hsl(38,95%,55%)"  fill="url(#colorLate)"    strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.payrollTrend} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="gross" name="Gross" fill="hsl(220,90%,56%)" radius={[4,4,0,0]} />
                  <Bar dataKey="net"   name="Net"   fill="hsl(145,65%,42%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Department headcount */}
        <div className="chart-card chart-card--medium">
          <div className="chart-card__header">
            <div>
              <h3 className="chart-card__title">Headcount by Dept</h3>
              <p className="chart-card__sub">{stats.totalEmployees} total</p>
            </div>
          </div>
          <div className="chart-card__body chart-card__body--donut">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stats.headcountByDept}
                  dataKey="count"
                  nameKey="dept"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {stats.headcountByDept.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-legend">
              {stats.headcountByDept.slice(0, 5).map((d) => (
                <div key={d.dept} className="donut-legend__item">
                  <span className="donut-legend__dot" style={{ background: d.color }} />
                  <span className="donut-legend__label">{d.dept}</span>
                  <span className="donut-legend__value">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────── */}
      <div className="dashboard__bottom-row animate-fadeInUp stagger-3">
        {/* Activity feed */}
        <div className="activity-card">
          <div className="activity-card__header">
            <div className="activity-card__title-wrap">
              <Activity size={16} className="activity-card__icon" />
              <h3 className="activity-card__title">Recent Activity</h3>
            </div>
            <button className="activity-card__more">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="activity-list">
            {stats.recentActivity.map((item, i) => {
              const Icon = ACTIVITY_ICONS[item.icon] || Activity;
              return (
                <div key={item.id} className={`activity-item animate-fadeInLeft stagger-${i+1}`}>
                  <div className="activity-item__icon-wrap" style={{ color: ACTIVITY_COLORS[item.type], background: `${ACTIVITY_COLORS[item.type]}18` }}>
                    <Icon size={14} />
                  </div>
                  <div className="activity-item__content">
                    <p className="activity-item__message">{item.message}</p>
                    <span className="activity-item__time"><Clock size={10} /> {item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top performers */}
        <div className="performers-card">
          <div className="performers-card__header">
            <h3 className="performers-card__title">Top Performers</h3>
            <span className="performers-card__period">H1 2026</span>
          </div>
          <div className="performers-list">
            {stats.topPerformers.map((p, i) => (
              <div key={p.id} className="performer-item">
                <span className="performer-item__rank">#{i+1}</span>
                <div className="performer-item__avatar" style={{ background: getAvatarColor(p.name) }}>
                  {getInitials(p.name)}
                </div>
                <div className="performer-item__info">
                  <p className="performer-item__name">{p.name}</p>
                  <p className="performer-item__dept">{p.dept}</p>
                </div>
                <div className="performer-item__score">
                  <span className="performer-item__rating">
                    <Star size={12} fill="currentColor" /> {p.score}
                  </span>
                  {p.trend === 'up'
                    ? <TrendingUp size={14} color="var(--color-success-400)" />
                    : <Minus size={14} color="var(--text-muted)" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming birthdays */}
        <div className="birthdays-card">
          <div className="birthdays-card__header">
            <h3 className="birthdays-card__title">🎂 Birthdays</h3>
            <span className="birthdays-card__sub">Upcoming</span>
          </div>
          <div className="birthdays-list">
            {stats.upcomingBirthdays.map((b) => (
              <div key={b.name} className="birthday-item">
                <div className="birthday-item__avatar" style={{ background: getAvatarColor(b.name) }}>
                  {getInitials(b.name)}
                </div>
                <div className="birthday-item__info">
                  <p className="birthday-item__name">{b.name}</p>
                  <p className="birthday-item__dept">{b.dept}</p>
                </div>
                <div className="birthday-item__date">
                  <span className="birthday-item__day">{b.date}</span>
                  <span className="birthday-item__days-left">in {b.daysLeft}d</span>
                </div>
              </div>
            ))}
          </div>
          <div className="leave-distribution">
            <h4 className="leave-dist__title">Leave Distribution</h4>
            {stats.leaveDistribution.map((l) => (
              <div key={l.type} className="leave-dist__item">
                <span className="leave-dist__type">{l.type}</span>
                <div className="leave-dist__bar-wrap">
                  <div
                    className="leave-dist__bar"
                    style={{ width: `${(l.count / 55) * 100}%` }}
                  />
                </div>
                <span className="leave-dist__count">{l.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
