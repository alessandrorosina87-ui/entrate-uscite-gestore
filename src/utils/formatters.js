export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return { date: '-', time: '-' };
  const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return {
    date: dateObj.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    time: dateObj.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

