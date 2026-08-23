const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  image: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash_on_delivery', 'stripe']
  },
  stripePaymentIntentId: String,
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isShipped: {
    type: Boolean,
    default: false
  },
  shippedAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'pending'
  },
  trackingNumber: String,
  courier: String,
  estimatedDeliveryDate: Date,



  // cancellation/refund fields
  cancellationReason: String,
  returnReason: String,
  cancelledAt: Date,
  returnedAt: Date,
  isRefunded: {
    type: Boolean,
    default: false
  },
  refundedAt: Date,

  // status tracking
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// ============================================
// VALID STATUS TRANSITIONS
// ============================================
orderSchema.statics.VALID_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['return_requested'],
  return_requested: ['returned', 'delivered'], // moving back to delivered means return rejected
  returned: [],
  cancelled: []
};

// ============================================
// MIDDLEWARE TO MAINTAIN STATUS CONSISTENCY
// ============================================

orderSchema.pre('save', function (next) {
  // Only run this logic if status was modified
  if (!this.isModified('status')) {
    return next();
  }

  // Push to status history if it's a new document or status changed
  this.statusHistory.push({
    status: this.status,
    timestamp: Date.now()
  });

  // Synchronize all status-related fields based on the main status
  switch (this.status) {
    case 'pending':
    case 'accepted':
    case 'processing':
      // Order is not yet shipped or delivered
      this.isShipped = false;
      this.shippedAt = null;
      this.isDelivered = false;
      this.deliveredAt = null;
      break;

    case 'shipped':
      // Order is shipped but not delivered
      this.isShipped = true;
      if (!this.shippedAt) {
        this.shippedAt = new Date();
      }
      this.isDelivered = false;
      this.deliveredAt = null;
      break;

    case 'delivered':
      // Order is both shipped and delivered
      this.isShipped = true;
      if (!this.shippedAt) {
        this.shippedAt = new Date();
      }
      this.isDelivered = true;
      if (!this.deliveredAt) {
        this.deliveredAt = new Date();
      }
      break;

    case 'cancelled':
      // Reset all progression flags for cancelled orders
      this.isShipped = false;
      this.shippedAt = null;
      this.isDelivered = false;
      this.deliveredAt = null;

      // Mark as unpaid and refunded if it was paid
      if (this.isPaid) {
        this.isRefunded = true;
        if (!this.refundedAt) {
          this.refundedAt = new Date();
        }
      }
      this.isPaid = false;
      this.paidAt = null;

      // Set cancellation timestamp
      if (!this.cancelledAt) {
        this.cancelledAt = new Date();
      }
      break;
  }

  next();
});

/**
 * Pre-save validation hook to prevent invalid status transitions
 * This adds an extra layer of protection against inconsistent updates
 */
orderSchema.pre('save', function (next) {
  // Skip validation for new documents
  if (this.isNew) {
    return next();
  }

  // Prevent modification of cancelled orders
  if (this.status === 'cancelled' && this.isModified('isPaid') && this.isPaid) {
    return next(new Error('Cannot mark cancelled orders as paid'));
  }

  // Prevent setting isDelivered without proper status
  if (this.isModified('isDelivered') && this.isDelivered && this.status !== 'delivered') {
    this.status = 'delivered';
  }

  // Prevent setting isShipped without proper status
  if (this.isModified('isShipped') && this.isShipped && !['shipped', 'delivered'].includes(this.status)) {
    this.status = 'shipped';
  }

  next();
});

/**
 * Instance method to check if order can be modified
 */
orderSchema.methods.canBeModified = function () {
  return this.status === 'pending' && !this.isPaid && !this.isShipped;
};

/**
 * Instance method to check if order can be cancelled
 */
orderSchema.methods.canBeCancelled = function () {
  return ['pending', 'processing', 'accepted'].includes(this.status) && !this.isShipped;
};

/**
 * Instance method to get human-readable status
 */
orderSchema.methods.getStatusDisplay = function () {
  const statusMap = {
    pending: 'Pending',
    accepted: 'Accepted',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return statusMap[this.status] || 'Unknown';
};

/**
 * Static method to find inconsistent orders (for debugging/admin tools)
 */
orderSchema.statics.findInconsistent = async function () {
  const allOrders = await this.find({});
  const inconsistent = [];

  for (const order of allOrders) {
    let issues = [];

    // Check status vs isDelivered
    if (order.status === 'delivered' && !order.isDelivered) {
      issues.push('Status is delivered but isDelivered is false');
    }
    if (order.isDelivered && order.status !== 'delivered') {
      issues.push(`isDelivered is true but status is ${order.status}`);
    }

    // Check status vs isShipped
    if (['shipped', 'delivered'].includes(order.status) && !order.isShipped) {
      issues.push(`Status is ${order.status} but isShipped is false`);
    }
    if (order.isShipped && !['shipped', 'delivered'].includes(order.status)) {
      issues.push(`isShipped is true but status is ${order.status}`);
    }

    // Check cancelled orders
    if (order.status === 'cancelled' && (order.isShipped || order.isDelivered || order.isPaid)) {
      issues.push('Cancelled order has active flags');
    }

    if (issues.length > 0) {
      inconsistent.push({
        orderId: order._id,
        status: order.status,
        isShipped: order.isShipped,
        isDelivered: order.isDelivered,
        isPaid: order.isPaid,
        issues
      });
    }
  }

  return inconsistent;
};

// Indexes for optimization
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);