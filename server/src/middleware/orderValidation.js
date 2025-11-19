const validateUpdateOrder = (req, res, next) => {
  const { orderItems } = req.body;

  if (!orderItems || !Array.isArray(orderItems)) {
    return res.status(400).json({ message: 'orderItems must be an array' });
  }

  if (orderItems.length === 0) {
    return res.status(400).json({ message: 'orderItems cannot be empty' });
  }

  for (const item of orderItems) {
    if (!item.product) {
      return res.status(400).json({ message: 'Product ID is required for each item' });
    }
    if (!item.quantity || item.quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required for each item' });
    }
  }

  next();
};

const validateCancelOrder = (req, res, next) => {
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({ message: 'Cancellation reason is required' });
  }

  if (reason.trim().length < 5) {
    return res.status(400).json({ message: 'Reason must be at least 5 characters long' });
  }

  next();
};

module.exports = {
  validateUpdateOrder,
  validateCancelOrder
};