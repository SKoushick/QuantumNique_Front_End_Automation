/**
 * Membership & VIP Tier System
 * Manages collector tiers with benefits, rewards, and exclusive access
 */

export const MEMBERSHIP_TIERS = {
  COLLECTOR: {
    id: 'collector',
    name: 'Collector',
    level: 1,
    minSpending: 0,
    maxSpending: 50000,
    benefits: [
      'Access to gallery',
      'Standard shipping',
      'Email newsletter',
      '5% cashback on first purchase'
    ],
    discount: 0,
    freeShippingThreshold: 2000,
    monthlyAllowance: 0,
    icon: '🎨',
    color: '#B8860B'
  },

  PATRON: {
    id: 'patron',
    name: 'Patron',
    level: 2,
    minSpending: 50000,
    maxSpending: 250000,
    benefits: [
      'Priority customer service',
      'Free standard shipping on orders',
      'Exclusive Patron previews',
      '10% discount on all purchases',
      'VIP event invitations',
      'Monthly art market briefing'
    ],
    discount: 0.10,
    freeShippingThreshold: 0, // Free for all
    monthlyAllowance: 10000,
    icon: '👑',
    color: '#FFD700',
    perks: {
      skipWaitlists: true,
      priorityShipping: true,
      dedicatedAccount: true
    }
  },

  CONNOISSEUR: {
    id: 'connoisseur',
    name: 'Connoisseur',
    level: 3,
    minSpending: 250000,
    maxSpending: 1000000,
    benefits: [
      'All Patron benefits plus:',
      'Concierge art acquisition service',
      'Private viewing room access',
      '15% discount on all purchases',
      'Complimentary authentication & appraisal',
      'Exclusive collection pre-orders',
      'Quarterly curator lunch',
      'Custom commission discounts (20% off)',
      'Insurance consultation service'
    ],
    discount: 0.15,
    freeShippingThreshold: 0,
    monthlyAllowance: 50000,
    icon: '💎',
    color: '#E5B4F3',
    perks: {
      skipWaitlists: true,
      priorityShipping: true,
      dedicatedAccount: true,
      conciergeService: true,
      privateViewings: true,
      customCommissions: true
    }
  },

  COLLECTOR_ELITE: {
    id: 'elite',
    name: 'Collector Elite',
    level: 4,
    minSpending: 1000000,
    maxSpending: Infinity,
    benefits: [
      'All Connoisseur benefits plus:',
      'White-glove installation service',
      '20% discount on all purchases',
      'Annual artist dinner',
      'First access to auction items',
      'Museum-quality storage & insurance',
      'Legacy collection planning',
      'Personal art investment advisor',
      'Unlimited custom commissions',
      'Gallery naming opportunities'
    ],
    discount: 0.20,
    freeShippingThreshold: 0,
    monthlyAllowance: 250000,
    icon: '🌟',
    color: '#FF1493',
    perks: {
      skipWaitlists: true,
      priorityShipping: true,
      dedicatedAccount: true,
      conciergeService: true,
      privateViewings: true,
      customCommissions: true,
      whiteGloveService: true,
      investmentAdvisor: true,
      galleryNaming: true
    }
  }
};

/**
 * Determine membership tier based on spending
 */
export const getMembershipTier = (totalSpending) => {
  const tiers = Object.values(MEMBERSHIP_TIERS);
  for (const tier of tiers.reverse()) {
    if (totalSpending >= tier.minSpending) {
      return tier;
    }
  }
  return MEMBERSHIP_TIERS.COLLECTOR;
};

/**
 * Calculate spending progress to next tier
 */
export const getTierProgress = (currentTier, totalSpending) => {
  const tierArray = Object.values(MEMBERSHIP_TIERS).sort((a, b) => a.level - b.level);
  const currentIndex = tierArray.findIndex(t => t.id === currentTier.id);
  
  if (currentIndex === tierArray.length - 1) {
    // Already at max tier
    return { nextTier: null, progress: 100, remaining: 0 };
  }

  const nextTier = tierArray[currentIndex + 1];
  const minForNext = nextTier.minSpending;
  const minForCurrent = currentTier.minSpending;
  const progress = Math.round(((totalSpending - minForCurrent) / (minForNext - minForCurrent)) * 100);

  return {
    nextTier,
    progress: Math.min(progress, 100),
    remaining: Math.max(0, minForNext - totalSpending)
  };
};

/**
 * Calculate discount for tier
 */
export const calculateTierDiscount = (price, tier) => {
  return price * (1 - tier.discount);
};

/**
 * Apply tier benefits to purchase
 */
export const applyTierBenefits = (order, tier) => {
  const discountedPrice = order.subtotal * (1 - tier.discount);
  const discount = order.subtotal - discountedPrice;
  
  return {
    ...order,
    tierDiscount: discount,
    subtotal: discountedPrice,
    total: discountedPrice + order.shippingCost + order.tax,
    membershipTier: tier.id
  };
};

/**
 * Get rewards points based on purchase
 */
export const calculateRewardPoints = (orderTotal, tier) => {
  // Base: 1 point per dollar spent
  let points = Math.floor(orderTotal);
  
  // Bonus multiplier by tier
  const multipliers = {
    'collector': 1,
    'patron': 1.5,
    'connoisseur': 2,
    'elite': 3
  };

  points *= (multipliers[tier.id] || 1);
  return Math.floor(points);
};

/**
 * Redeem rewards points
 */
export const redeemRewardPoints = (points, tier) => {
  // 100 points = $1 credit
  const creditValue = points / 100;
  const tierBonus = tier.discount * 100; // Bonus percentage

  return {
    points,
    creditValue,
    tierBonus,
    totalCredit: creditValue * (1 + tierBonus / 100)
  };
};

/**
 * Get tier comparison chart
 */
export const getTierComparison = () => {
  return Object.values(MEMBERSHIP_TIERS).map(tier => ({
    name: tier.name,
    level: tier.level,
    discount: `${tier.discount * 100}%`,
    monthlyAllowance: tier.monthlyAllowance > 0 ? `$${tier.monthlyAllowance.toLocaleString()}M` : 'Unlimited',
    benefits: tier.benefits,
    icon: tier.icon,
    minSpending: tier.minSpending > 0 ? `$${tier.minSpending.toLocaleString()}M` : 'Entry Level'
  }));
};

/**
 * Check if user has specific perk
 */
export const hasPerk = (tier, perkName) => {
  return tier.perks && tier.perks[perkName] === true;
};
