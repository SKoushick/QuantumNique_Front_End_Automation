/**
 * Advanced Search & Recommendation Engine
 * Implements intelligent painting discovery and personalized recommendations
 */

/**
 * Tokenize search query for better matching
 */
const tokenizeQuery = (query) => {
  return query
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter(token => token.length > 2);
};

/**
 * Calculate relevance score for search results
 */
const calculateRelevanceScore = (painting, tokens, field) => {
  let score = 0;
  const fieldValue = (field === 'all' ? 
    `${painting.name} ${painting.description} ${painting.artist} ${painting.medium} ${painting.style} ${painting.collection}` :
    painting[field] || ''
  ).toLowerCase();

  tokens.forEach(token => {
    // Exact match: highest score
    if (fieldValue === token) score += 100;
    // Start of field value: high score
    else if (fieldValue.startsWith(token)) score += 50;
    // Word boundary match: medium score
    else if (new RegExp(`\\b${token}`).test(fieldValue)) score += 25;
    // Substring match: low score
    else if (fieldValue.includes(token)) score += 5;
  });

  return score;
};

/**
 * Advanced search with multiple filter options
 */
export const advancedSearch = (paintings, query, filters = {}) => {
  let results = [...paintings];

  // Text search
  if (query && query.trim()) {
    const tokens = tokenizeQuery(query);
    results = results.map(painting => ({
      painting,
      score: Math.max(
        calculateRelevanceScore(painting, tokens, 'name'),
        calculateRelevanceScore(painting, tokens, 'description'),
        calculateRelevanceScore(painting, tokens, 'artist'),
        calculateRelevanceScore(painting, tokens, 'story'),
        calculateRelevanceScore(painting, tokens, 'all')
      )
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.painting);
  }

  // Price filter
  if (filters.minPrice || filters.maxPrice) {
    results = results.filter(p => {
      const price = p.discountPrice || p.price;
      const min = filters.minPrice || 0;
      const max = filters.maxPrice || Infinity;
      return price >= min && price <= max;
    });
  }

  // Medium filter
  if (filters.mediums && filters.mediums.length > 0) {
    results = results.filter(p => filters.mediums.includes(p.medium));
  }

  // Style filter
  if (filters.styles && filters.styles.length > 0) {
    results = results.filter(p => filters.styles.includes(p.style));
  }

  // Collection filter
  if (filters.collection) {
    results = results.filter(p => p.collection === filters.collection);
  }

  // Rating filter
  if (filters.minRating) {
    results = results.filter(p => p.rating >= filters.minRating);
  }

  // Availability filter
  if (filters.availability) {
    results = results.filter(p => p.availability === filters.availability);
  }

  // Sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        results.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        results.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'popularity':
        results.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
        break;
    }
  }

  return results;
};

/**
 * Get personalized recommendations based on user history
 */
export const getPersonalizedRecommendations = (paintings, userProfile) => {
  if (!userProfile) return paintings.slice(0, 6);

  const { viewedPaintings = [], purchasedPaintings = [], wishedPaintings = [], preferences = {} } = userProfile;

  // Calculate user preferences from history
  const userPreferences = {
    mediums: new Map(),
    styles: new Map(),
    priceRange: { min: Infinity, max: 0 },
    artists: new Map(),
    collections: new Map()
  };

  const allViewedIds = [...viewedPaintings, ...purchasedPaintings, ...wishedPaintings];
  
  paintings.forEach(p => {
    if (allViewedIds.includes(p.id)) {
      userPreferences.mediums.set(p.medium, (userPreferences.mediums.get(p.medium) || 0) + 1);
      userPreferences.styles.set(p.style, (userPreferences.styles.get(p.style) || 0) + 1);
      userPreferences.artists.set(p.artist, (userPreferences.artists.get(p.artist) || 0) + 1);
      userPreferences.collections.set(p.collection, (userPreferences.collections.get(p.collection) || 0) + 1);
      
      const price = p.discountPrice || p.price;
      userPreferences.priceRange.min = Math.min(userPreferences.priceRange.min, price);
      userPreferences.priceRange.max = Math.max(userPreferences.priceRange.max, price);
    }
  });

  // Score paintings based on similarity to preferences
  const recommendations = paintings
    .filter(p => !allViewedIds.includes(p.id))
    .map(painting => {
      let score = 0;

      // Medium match
      const mediumCount = userPreferences.mediums.get(painting.medium) || 0;
      score += mediumCount * 20;

      // Style match
      const styleCount = userPreferences.styles.get(painting.style) || 0;
      score += styleCount * 15;

      // Artist match
      const artistCount = userPreferences.artists.get(painting.artist) || 0;
      score += artistCount * 25;

      // Collection match
      const collectionCount = userPreferences.collections.get(painting.collection) || 0;
      score += collectionCount * 10;

      // Price range match
      const price = painting.discountPrice || painting.price;
      const avgPrice = (userPreferences.priceRange.min + userPreferences.priceRange.max) / 2;
      const priceDiff = Math.abs(price - avgPrice);
      score += Math.max(0, 50 - (priceDiff / 1000));

      // Rating bonus
      score += painting.rating * 5;

      return { painting, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(item => item.painting);

  return recommendations.length > 0 ? recommendations : paintings.slice(0, 6);
};

/**
 * Trending paintings based on views and purchases
 */
export const getTrendingPaintings = (paintings, analytics) => {
  return paintings
    .map(painting => {
      const stats = analytics.paintingStats?.[painting.id] || { views: 0, purchases: 0, wishlists: 0 };
      let trendScore = 0;
      
      trendScore += (stats.views || 0) * 1;
      trendScore += (stats.purchases || 0) * 10;
      trendScore += (stats.wishlists || 0) * 5;
      trendScore += painting.rating * 2;
      
      return { painting, trendScore };
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 8)
    .map(item => item.painting);
};

/**
 * Similar paintings based on attributes
 */
export const getSimilarPaintings = (painting, allPaintings, limit = 4) => {
  return allPaintings
    .filter(p => p.id !== painting.id)
    .map(p => {
      let similarity = 0;
      
      // Same artist: highest score
      if (p.artist === painting.artist) similarity += 40;
      
      // Same style
      if (p.style === painting.style) similarity += 25;
      
      // Same medium
      if (p.medium === painting.medium) similarity += 20;
      
      // Same collection
      if (p.collection === painting.collection) similarity += 15;
      
      // Similar price range
      const priceDiff = Math.abs((p.discountPrice || p.price) - (painting.discountPrice || painting.price));
      similarity += Math.max(0, 20 - (priceDiff / 100));
      
      // Similar rating
      const ratingDiff = Math.abs(p.rating - painting.rating);
      similarity += Math.max(0, 10 - (ratingDiff * 2));
      
      return { painting: p, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.painting);
};

/**
 * Collection recommendations
 */
export const getCollectionRecommendations = (paintings) => {
  const collections = new Map();

  paintings.forEach(painting => {
    if (!collections.has(painting.collection)) {
      collections.set(painting.collection, []);
    }
    collections.get(painting.collection).push(painting);
  });

  return Array.from(collections.entries())
    .map(([name, items]) => ({
      name,
      count: items.count,
      totalValue: items.reduce((sum, p) => sum + (p.discountPrice || p.price), 0),
      paintings: items,
      avgRating: (items.reduce((sum, p) => sum + p.rating, 0) / items.length).toFixed(2)
    }))
    .sort((a, b) => b.totalValue - a.totalValue);
};

/**
 * Discover new artists
 */
export const discoverNewArtists = (paintings, userProfile = {}) => {
  const viewedArtists = userProfile.viewedArtists || [];
  
  return paintings
    .filter(p => !viewedArtists.includes(p.artist))
    .reduce((acc, p) => {
      const existing = acc.find(a => a.artist === p.artist);
      if (existing) {
        existing.paintingCount += 1;
        existing.paintings.push(p);
        existing.avgRating = (existing.avgRating + p.rating) / 2;
      } else {
        acc.push({
          artist: p.artist,
          paintingCount: 1,
          paintings: [p],
          avgRating: p.rating,
          totalValue: p.discountPrice || p.price
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);
};
