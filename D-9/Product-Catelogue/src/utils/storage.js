import {
  initialArtist,
  initialUsers,
  initialPaintings,
  initialReviews,
  initialCommissions
} from '../data/mockDb';

const KEYS = {
  ARTIST: 'starry_gallery_artist',
  USERS: 'starry_gallery_users',
  PAINTINGS: 'starry_gallery_paintings',
  REVIEWS: 'starry_gallery_reviews',
  COMMISSIONS: 'starry_gallery_commissions',
  CURRENT_USER: 'starry_gallery_current_user',
  WISHLIST: 'starry_gallery_wishlist',
  CART: 'starry_gallery_cart',
  COMPARE: 'starry_gallery_compare',
  THEME: 'starry_gallery_theme',
  ORDERS: 'starry_gallery_orders',
  USER_PROFILES: 'starry_gallery_user_profiles'
};

export const initStorage = () => {
  const DB_VERSION = 'v1.4';
  if (localStorage.getItem('starry_gallery_db_version') !== DB_VERSION) {
    localStorage.removeItem(KEYS.PAINTINGS);
    localStorage.removeItem(KEYS.ARTIST);
    localStorage.removeItem(KEYS.USERS);
    localStorage.setItem('starry_gallery_db_version', DB_VERSION);
  }

  if (!localStorage.getItem(KEYS.ARTIST)) {
    localStorage.setItem(KEYS.ARTIST, JSON.stringify(initialArtist));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(KEYS.PAINTINGS)) {
    localStorage.setItem(KEYS.PAINTINGS, JSON.stringify(initialPaintings));
  }
  if (!localStorage.getItem(KEYS.REVIEWS)) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(initialReviews));
  }
  if (!localStorage.getItem(KEYS.COMMISSIONS)) {
    localStorage.setItem(KEYS.COMMISSIONS, JSON.stringify(initialCommissions));
  }
  if (!localStorage.getItem(KEYS.WISHLIST)) {
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.CART)) {
    localStorage.setItem(KEYS.CART, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.COMPARE)) {
    localStorage.setItem(KEYS.COMPARE, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.THEME)) {
    localStorage.setItem(KEYS.THEME, 'dark');
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.USER_PROFILES)) {
    localStorage.setItem(KEYS.USER_PROFILES, JSON.stringify({}));
  }
};

// Generic Helpers
const getParsed = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error parsing key ${key}`, e);
    return null;
  }
};

const setJSON = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Exposed APIs
export const getArtist = () => getParsed(KEYS.ARTIST);
export const updateArtist = (artist) => setJSON(KEYS.ARTIST, artist);

export const getUsers = () => getParsed(KEYS.USERS);
export const saveUser = (user) => {
  const users = getUsers() || [];
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  setJSON(KEYS.USERS, users);
};

export const getPaintings = () => getParsed(KEYS.PAINTINGS);
export const savePainting = (painting) => {
  const paintings = getPaintings() || [];
  const idx = paintings.findIndex(p => p.id === painting.id);
  if (idx !== -1) {
    paintings[idx] = painting;
  } else {
    paintings.unshift(painting); // Add new ones at the beginning
  }
  setJSON(KEYS.PAINTINGS, paintings);
  return paintings;
};

export const deletePainting = (id) => {
  const paintings = getPaintings() || [];
  const filtered = paintings.filter(p => p.id !== id);
  setJSON(KEYS.PAINTINGS, filtered);
  return filtered;
};

export const getReviews = () => getParsed(KEYS.REVIEWS);
export const saveReview = (review) => {
  const reviews = getReviews() || [];
  reviews.unshift(review);
  setJSON(KEYS.REVIEWS, reviews);
  return reviews;
};

export const getCommissions = () => getParsed(KEYS.COMMISSIONS);
export const saveCommission = (comm) => {
  const commissions = getCommissions() || [];
  commissions.unshift(comm);
  setJSON(KEYS.COMMISSIONS, commissions);
  return commissions;
};

export const updateCommissionStatus = (id, status) => {
  const commissions = getCommissions() || [];
  const idx = commissions.findIndex(c => c.id === id);
  if (idx !== -1) {
    commissions[idx].status = status;
    setJSON(KEYS.COMMISSIONS, commissions);
  }
  return commissions;
};

export const getCurrentUser = () => getParsed(KEYS.CURRENT_USER);
export const setCurrentUser = (user) => setJSON(KEYS.CURRENT_USER, user);

export const getWishlist = () => getParsed(KEYS.WISHLIST) || [];
export const setWishlist = (list) => setJSON(KEYS.WISHLIST, list);

export const getCart = () => getParsed(KEYS.CART) || [];
export const setCart = (list) => setJSON(KEYS.CART, list);

export const getCompare = () => getParsed(KEYS.COMPARE) || [];
export const setCompare = (list) => setJSON(KEYS.COMPARE, list);

export const getTheme = () => localStorage.getItem(KEYS.THEME) || 'dark';
export const setTheme = (theme) => localStorage.setItem(KEYS.THEME, theme);

// Order Management
export const getOrders = () => getParsed(KEYS.ORDERS) || [];
export const saveOrder = (order) => {
  const orders = getOrders();
  orders.push(order);
  setJSON(KEYS.ORDERS, orders);
  return orders;
};

export const getOrdersByUser = (userId) => {
  const orders = getOrders();
  return orders.filter(o => o.userId === userId);
};

export const updateOrderStatus = (orderId, status) => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    setJSON(KEYS.ORDERS, orders);
  }
  return orders;
};

// User Profiles
export const getUserProfiles = () => getParsed(KEYS.USER_PROFILES) || {};
export const getUserProfile = (userId) => {
  const profiles = getUserProfiles();
  return profiles[userId] || null;
};

export const saveUserProfile = (userId, profile) => {
  const profiles = getUserProfiles();
  profiles[userId] = {
    ...profiles[userId],
    ...profile,
    updatedAt: new Date().toISOString()
  };
  setJSON(KEYS.USER_PROFILES, profiles);
  return profiles[userId];
};

export const updateUserStats = (userId, stats) => {
  const profiles = getUserProfiles();
  profiles[userId] = {
    ...profiles[userId],
    ...stats,
    updatedAt: new Date().toISOString()
  };
  setJSON(KEYS.USER_PROFILES, profiles);
  return profiles[userId];
};
