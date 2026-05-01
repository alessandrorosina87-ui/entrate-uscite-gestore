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
  
  try {
    // Handle Firestore Timestamp or JS Date
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return {
      date: d.toLocaleDateString('it-IT'),
      time: d.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return { date: '-', time: '-' };
  }
};


