import React, { useState } from 'react';

export default function AnalyticsDashboard({ orders, paintings, currentUser }) {
  const [dateRange, setDateRange] = useState('month'); // week, month, year, all

  // Calculate analytics
  const calculateMetrics = () => {
    const metrics = {
      totalOrders: orders?.length || 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      totalCustomers: new Set(),
      ordersByStatus: {},
      topPaintings: [],
      revenueByDate: {},
      conversionRate: 0,
      repeatCustomerRate: 0
    };

    if (orders && orders.length > 0) {
      metrics.totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
      metrics.averageOrderValue = metrics.totalRevenue / orders.length;
      metrics.ordersByStatus = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});

      // Top paintings
      const paintingCounts = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          paintingCounts[item.paintingId] = (paintingCounts[item.paintingId] || 0) + 1;
        });
      });
      metrics.topPaintings = Object.entries(paintingCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => {
          const painting = paintings.find(p => p.id === id);
          return { painting, count };
        });
    }

    return metrics;
  };

  const metrics = calculateMetrics();

  return (
    <div className="analytics-dashboard">
      <style>{`
        .analytics-dashboard {
          padding: 20px;
          background: var(--bg-main);
          color: var(--text-main);
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--border-color);
        }

        .analytics-title h2 {
          margin: 0;
          font-size: 28px;
        }

        .date-range-selector {
          display: flex;
          gap: 10px;
        }

        .range-btn {
          padding: 8px 16px;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          color: var(--text-main);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .range-btn.active {
          background: var(--c-gold);
          color: white;
          border-color: var(--c-gold);
        }

        .range-btn:hover {
          border-color: var(--c-gold);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .metric-card {
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .metric-card:hover {
          border-color: var(--c-gold);
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.1);
          transform: translateY(-5px);
        }

        .metric-icon {
          font-size: 32px;
          line-height: 1;
        }

        .metric-label {
          font-size: 13px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: var(--c-gold);
        }

        .metric-change {
          font-size: 12px;
          color: #22C55E;
          font-weight: 500;
        }

        .metric-change.negative {
          color: #EF4444;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .chart-card {
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .chart-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
          color: var(--text-main);
        }

        .status-chart {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          height: 200px;
          margin-bottom: 15px;
        }

        .status-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: flex-end;
        }

        .bar-value {
          height: 100%;
          background: linear-gradient(135deg, var(--c-gold), #FF8C00);
          border-radius: 6px 6px 0 0;
          position: relative;
          transition: all 0.3s ease;
          min-height: 20px;
        }

        .bar-value:hover {
          opacity: 0.8;
          transform: scaleY(1.05);
        }

        .bar-label {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .bar-count {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-weight: bold;
          font-size: 13px;
          color: var(--c-gold);
        }

        .top-products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .top-products-table th,
        .top-products-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
        }

        .top-products-table th {
          background: var(--bg-main);
          font-weight: bold;
          color: var(--c-gold);
        }

        .top-products-table tr:hover {
          background: var(--bg-main);
        }

        .ranking {
          display: inline-block;
          width: 30px;
          height: 30px;
          background: var(--c-gold);
          color: white;
          border-radius: 50%;
          text-align: center;
          line-height: 30px;
          font-weight: bold;
          font-size: 12px;
        }

        .sales-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sale-item {
          padding: 12px;
          background: var(--bg-main);
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid var(--c-gold);
        }

        .sale-info {
          flex: 1;
        }

        .sale-customer {
          font-weight: 500;
          font-size: 13px;
        }

        .sale-date {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 3px;
        }

        .sale-amount {
          font-size: 16px;
          font-weight: bold;
          color: var(--c-gold);
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .insight-card {
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .insight-title {
          font-weight: bold;
          margin-bottom: 15px;
          color: var(--c-gold);
        }

        .insight-item {
          padding: 10px;
          background: var(--bg-main);
          border-radius: 6px;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .insight-icon {
          display: inline-block;
          margin-right: 8px;
          font-size: 14px;
        }

        .progress-bar-small {
          height: 6px;
          background: var(--border-color);
          border-radius: 3px;
          margin-top: 5px;
          overflow: hidden;
        }

        .progress-fill-small {
          height: 100%;
          background: linear-gradient(90deg, var(--c-gold), #FF8C00);
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-title">
          <h2>📊 Analytics Dashboard</h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>Comprehensive business insights and metrics</p>
        </div>
        <div className="date-range-selector">
          <button className={`range-btn ${dateRange === 'week' ? 'active' : ''}`} onClick={() => setDateRange('week')}>Week</button>
          <button className={`range-btn ${dateRange === 'month' ? 'active' : ''}`} onClick={() => setDateRange('month')}>Month</button>
          <button className={`range-btn ${dateRange === 'year' ? 'active' : ''}`} onClick={() => setDateRange('year')}>Year</button>
          <button className={`range-btn ${dateRange === 'all' ? 'active' : ''}`} onClick={() => setDateRange('all')}>All Time</button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-label">Total Orders</div>
          <div className="metric-value">{metrics.totalOrders}</div>
          <div className="metric-change">↑ 12% from last period</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">₹{metrics.totalRevenue.toLocaleString()}M</div>
          <div className="metric-change">↑ 8% from last period</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-label">Average Order Value</div>
          <div className="metric-value">₹{metrics.averageOrderValue.toLocaleString()}M</div>
          <div className="metric-change">↓ 2% from last period</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-label">Unique Customers</div>
          <div className="metric-value">{orders ? new Set(orders.map(o => o.userId)).size : 0}</div>
          <div className="metric-change">↑ 5% from last period</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Order Status Distribution */}
        <div className="chart-card">
          <div className="chart-title">Order Status Distribution</div>
          <div className="status-chart">
            {Object.entries(metrics.ordersByStatus).map(([status, count]) => (
              <div key={status} className="status-bar">
                <div className="bar-value" style={{ height: `${(count / metrics.totalOrders) * 100}%` }}>
                  <div className="bar-count">{count}</div>
                </div>
                <div className="bar-label">{status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Paintings */}
        <div className="chart-card">
          <div className="chart-title">Top Performing Paintings</div>
          <table className="top-products-table">
            <thead>
              <tr>
                <th style={{ width: '30px' }}></th>
                <th>Painting</th>
                <th style={{ textAlign: 'right' }}>Sales</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topPaintings.map((item, idx) => (
                <tr key={idx}>
                  <td><div className="ranking">{idx + 1}</div></td>
                  <td style={{ fontSize: '12px' }}>{item.painting?.name || 'Unknown'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--c-gold)' }}>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders & Insights */}
      <div className="insights-grid">
        {/* Recent Orders */}
        <div className="insight-card">
          <div className="insight-title">🎯 Recent Orders</div>
          <div className="sales-list">
            {orders && orders.slice(-5).reverse().map(order => (
              <div key={order.id} className="sale-item">
                <div className="sale-info">
                  <div className="sale-customer">{order.userName}</div>
                  <div className="sale-date">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="sale-amount">₹{order.total.toLocaleString()}M</div>
              </div>
            )) || <div style={{ color: 'var(--text-muted)' }}>No orders yet</div>}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="insight-card">
          <div className="insight-title">💡 Key Insights</div>
          <div className="insight-item">
            <span className="insight-icon">🔝</span>
            <strong>Best Performer:</strong> {metrics.topPaintings[0]?.painting?.name || 'N/A'}
          </div>
          <div className="insight-item">
            <span className="insight-icon">⏱️</span>
            <strong>Peak Day:</strong> Mondays (43% of weekly sales)
          </div>
          <div className="insight-item">
            <span className="insight-icon">💳</span>
            <strong>Preferred Payment:</strong> Credit Card (78%)
          </div>
          <div className="insight-item">
            <span className="insight-icon">📈</span>
            <strong>Growth Trend:</strong> +12% month-over-month
          </div>
          <div className="insight-item">
            <span className="insight-icon">⭐</span>
            <strong>Avg Rating:</strong> 4.8/5.0 (Excellent)
          </div>
        </div>

        {/* Inventory Insights */}
        <div className="insight-card">
          <div className="insight-title">📦 Inventory Status</div>
          <div className="insight-item">
            <strong>In Stock</strong>
            <div className="progress-bar-small">
              <div className="progress-fill-small" style={{ width: '75%' }}></div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>75% of inventory</span>
          </div>
          <div className="insight-item">
            <strong>Low Stock</strong>
            <div className="progress-bar-small">
              <div className="progress-fill-small" style={{ width: '15%' }}></div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>15% of inventory</span>
          </div>
          <div className="insight-item">
            <strong>Sold Out</strong>
            <div className="progress-bar-small">
              <div className="progress-fill-small" style={{ width: '10%' }}></div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>10% of inventory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
