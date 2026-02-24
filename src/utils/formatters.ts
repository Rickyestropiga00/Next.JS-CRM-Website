export const formatPrice = (price: number) => {
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatStock = (stock: number, type: string) => {
  if (type === 'Digital' || type === 'Subscription' || type === 'Service') {
    return '∞';
  }
  return stock.toString();
};

export const formatPhone = (phone: string) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Check if it starts with + (country code)
  if (cleaned.startsWith('+')) {
    const parts = cleaned.match(/\+(\d+)(\d{3})(\d{4})/);
    if (parts) {
      const country = parts[1];
      const first3 = parts[2];
      const last4 = parts[3];
      return `+${country}-${first3}-${last4}`;
    }
  }

  // Fallback: just return digits
  return cleaned;
};
