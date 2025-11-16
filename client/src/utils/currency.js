/**
 * Format price in Pakistani Rupees (PKR)
 * @param {number} price - The price to format
 * @param {boolean} showSymbol - Whether to show the currency symbol (default: true)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, showSymbol = true) => {
  if (price === null || price === undefined || isNaN(price)) {
    return showSymbol ? 'Rs. 0' : '0';
  }
  
  const formattedPrice = parseFloat(price).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return showSymbol ? `Rs. ${formattedPrice}` : formattedPrice;
};

/**
 * Format price with currency symbol for display
 * @param {number} price - The price to format
 * @returns {string} Formatted price with PKR symbol
 */
export const formatPricePKR = (price) => {
  return formatPrice(price, true);
};

