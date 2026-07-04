import React, { useState } from 'react';
import { MEMBERSHIP_TIERS, getTierProgress, getTierComparison } from '../utils/membership';

export default function MembershipTierDisplay({ userProfile, currentUser }) {
  const [showComparison, setShowComparison] = useState(false);
  
  if (!currentUser) {
    return null;
  }

  const userTier = currentUser.membershipTier || MEMBERSHIP_TIERS.COLLECTOR;
  const progress = getTierProgress(userTier, currentUser.totalSpending || 0);

  return (
    <div className="membership-container">
      <style>{`
        .membership-container {
          padding: 20px;
          margin: 20px 0;
          background: var(--bg-card);
          border: 2px solid var(--c-gold);
          border-radius: var(--radius-lg);
          color: var(--text-main);
        }

        .tier-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .tier-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .tier-icon {
          font-size: 48px;
          line-height: 1;
        }

        .tier-details h2 {
          margin: 0 0 5px 0;
          color: var(--c-gold);
        }

        .tier-details p {
          margin: 2px 0;
          color: var(--text-muted);
          font-size: 14px;
        }

        .tier-badge {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--c-gold), #FF8C00);
          color: white;
          border-radius: 20px;
          font-weight: bold;
          font-size: 12px;
        }

        .progress-section {
          margin: 20px 0;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .progress-bar {
          height: 8px;
          background: var(--border-color);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--c-gold), #FF8C00);
          transition: width 0.3s ease;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .benefit-item {
          padding: 15px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .benefit-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .comparison-btn {
          padding: 10px 20px;
          background: transparent;
          border: 2px solid var(--c-gold);
          color: var(--c-gold);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .comparison-btn:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        .tier-comparison {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid var(--border-color);
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        .comparison-table th,
        .comparison-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
        }

        .comparison-table th {
          background: var(--bg-main);
          font-weight: bold;
          color: var(--c-gold);
        }

        .comparison-table tr:hover {
          background: var(--bg-main);
        }

        .tier-name-col {
          font-weight: bold;
          min-width: 120px;
        }

        .upscale-cta {
          padding: 20px;
          background: rgba(245, 158, 11, 0.1);
          border: 2px solid var(--c-gold);
          border-radius: 8px;
          text-align: center;
          margin-top: 20px;
        }

        .upscale-cta strong {
          color: var(--c-gold);
          font-size: 16px;
        }

        .spending-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .stat-card {
          padding: 15px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          text-align: center;
        }

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: var(--c-gold);
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 5px;
        }
      `}</style>

      <div className="tier-header">
        <div className="tier-info">
          <div className="tier-icon">{userTier.icon}</div>
          <div className="tier-details">
            <h2>{userTier.name} Member</h2>
            <p>Enjoy exclusive benefits and rewards</p>
          </div>
        </div>
        <div className="tier-badge">ACTIVE</div>
      </div>

      {/* Spending Stats */}
      <div className="spending-stats">
        <div className="stat-card">
          <div className="stat-value">${(currentUser.totalSpending || 0).toLocaleString()}M</div>
          <div className="stat-label">Total Spent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{userTier.discount * 100}%</div>
          <div className="stat-label">Member Discount</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{currentUser.purchasedPaintings?.length || 0}</div>
          <div className="stat-label">Paintings Owned</div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {progress.nextTier && (
        <div className="progress-section">
          <div className="progress-label">
            <span>Progress to {progress.nextTier.name}</span>
            <span>${progress.remaining.toLocaleString()}M to go</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Current Tier Benefits */}
      <div className="benefits-grid">
        {userTier.benefits.slice(0, 4).map((benefit, idx) => (
          <div key={idx} className="benefit-item">
            <span className="benefit-icon">✨</span>
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      {/* Comparison Button */}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button className="comparison-btn" onClick={() => setShowComparison(!showComparison)}>
          {showComparison ? 'Hide Tier Comparison' : 'View All Tiers'}
        </button>
      </div>

      {/* Tier Comparison Table */}
      {showComparison && (
        <div className="tier-comparison">
          <h3>Membership Tiers Comparison</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Discount</th>
                <th>Monthly Allowance</th>
                <th>Key Benefit</th>
              </tr>
            </thead>
            <tbody>
              {getTierComparison().map((tier, idx) => (
                <tr key={idx} style={{ 
                  background: tier.name === userTier.name ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  fontWeight: tier.name === userTier.name ? 'bold' : 'normal'
                }}>
                  <td className="tier-name-col">{tier.icon} {tier.name}</td>
                  <td>{tier.discount}</td>
                  <td>{tier.monthlyAllowance}</td>
                  <td>{tier.benefits[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Next Tier Upsell */}
      {progress.nextTier && (
        <div className="upscale-cta">
          <strong>✨ Reach {progress.nextTier.name} Status!</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Make {progress.remaining > 0 ? `$${progress.remaining.toLocaleString()}M more` : 'one more'} in purchases to unlock premium benefits
          </p>
        </div>
      )}
    </div>
  );
}
