/**
 * Order Management System
 * Handles order creation, status tracking, and order history
 */

export const initialOrders = [];

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Order creation
export const createOrder = (cartItems, userInfo, shippingAddress, paymentInfo) => {
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + (price * (item.quantity || 1));
  }, 0);

  const shippingCost = subtotal > 1000 ? 0 : 50; // Free shipping over $1000M
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  const order = {
    id: orderId,
    userId: userInfo?.id || 'guest',
    userName: userInfo?.name || shippingAddress.fullName,
    userEmail: userInfo?.email || shippingAddress.email,
    items: cartItems.map(item => ({
      paintingId: item.id,
      name: item.name,
      artist: item.artist,
      sku: item.sku,
      price: item.price,
      discountPrice: item.discountPrice,
      quantity: item.quantity || 1,
      medium: item.medium,
      collection: item.collection
    })),
    shippingAddress: {
      fullName: shippingAddress.fullName,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
      phone: shippingAddress.phone
    },
    paymentMethod: paymentInfo.method, // 'card', 'bank', 'crypto'
    paymentLast4: paymentInfo.last4,
    subtotal,
    shippingCost,
    tax,
    total,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    trackingNumber: null,
    estimatedDelivery: null,
    notes: [],
    timeline: [
      {
        status: ORDER_STATUS.PENDING,
        timestamp: new Date().toISOString(),
        message: 'Order placed successfully'
      }
    ]
  };

  return order;
};

// Update order status
export const updateOrderStatus = (order, newStatus, message = '') => {
  return {
    ...order,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    timeline: [
      ...order.timeline,
      {
        status: newStatus,
        timestamp: new Date().toISOString(),
        message: message || `Order ${newStatus}`
      }
    ]
  };
};

// Add tracking number
export const addTrackingInfo = (order, trackingNumber, estimatedDays = 5) => {
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

  return {
    ...order,
    trackingNumber,
    estimatedDelivery: estimatedDate.toISOString(),
    status: ORDER_STATUS.PROCESSING
  };
};

// Add order note
export const addOrderNote = (order, note) => {
  return {
    ...order,
    notes: [
      ...order.notes,
      {
        text: note,
        timestamp: new Date().toISOString()
      }
    ]
  };
};

// Calculate order statistics
export const getOrderStats = (orders) => {
  const stats = {
    totalOrders: orders.length,
    totalRevenue: 0,
    ordersByStatus: {},
    averageOrderValue: 0,
    recentOrders: [],
    topCustomers: []
  };

  if (orders.length === 0) return stats;

  // Calculate totals and statuses
  const customerMap = new Map();
  
  orders.forEach(order => {
    stats.totalRevenue += order.total;
    stats.ordersByStatus[order.status] = (stats.ordersByStatus[order.status] || 0) + 1;

    // Track customer spending
    if (!customerMap.has(order.userId)) {
      customerMap.set(order.userId, {
        userId: order.userId,
        userName: order.userName,
        userEmail: order.userEmail,
        spent: 0,
        orderCount: 0
      });
    }
    const customer = customerMap.get(order.userId);
    customer.spent += order.total;
    customer.orderCount += 1;
  });

  stats.averageOrderValue = stats.totalRevenue / orders.length;
  stats.recentOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  stats.topCustomers = Array.from(customerMap.values()).sort((a, b) => b.spent - a.spent).slice(0, 5);

  return stats;
};

// Generate invoice
export const generateInvoice = (order) => {
  const invoiceData = {
    invoiceNumber: order.id.replace('ORD-', 'INV-'),
    orderDate: new Date(order.createdAt).toLocaleDateString(),
    items: order.items.map(item => ({
      ...item,
      itemTotal: item.discountPrice ? (item.discountPrice * item.quantity) : (item.price * item.quantity)
    })),
    subtotal: order.subtotal,
    shipping: order.shippingCost,
    tax: order.tax,
    total: order.total,
    billingInfo: order.shippingAddress,
    paymentMethod: order.paymentMethod
  };

  return invoiceData;
};
