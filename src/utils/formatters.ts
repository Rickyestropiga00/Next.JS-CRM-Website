import { useTranslations } from 'next-intl';
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

type TimeAgoTranslations = ReturnType<typeof useTranslations<'TimeAgo'>>;

export const timeAgo = (
  date: string | Date | undefined,
  t: TimeAgoTranslations
): string => {
  if (!date) return t('never');

  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 10) return t('justNow');

  const intervals: {
    unit: 'year' | 'month' | 'day' | 'hour' | 'minute';
    seconds: number;
  }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return t(interval.unit, { count });
    }
  }

  return t('justNow');
};
