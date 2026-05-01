import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, onSave, type, initialDate }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [hasInvoice, setHasInvoice] = useState(false);
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  // Sincronizza la data se cambia initialDate
  useEffect(() => {
    if (initialDate) setDate(initialDate);
  }, [initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      type,
      amount: parseFloat(amount),
      category,
      description,
      hasInvoice: type === 'expense' ? hasInvoice : false,
      date: new Date(date).toISOString()
    });
    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setHasInvoice(false);
    onClose();
  };

  const categories = type === 'income' 
    ? ['POS', 'Contanti', 'Bonifico', 'Extra']
    : ['POS', 'Contanti', 'Bonifico', 'Extra', 'Maestranze'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <X size={28} />
        </button>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">
          Nuova {type === 'income' ? 'Entrata' : 'Uscita'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Importo (€)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              required
            >
              <option value="">Seleziona...</option>
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Descrizione / Note</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              placeholder="Inserisci una breve nota..."
              required={type === 'expense' && (category === 'maestranze' || category === 'extra')}
            />
          </div>

          {type === 'expense' && (
            <label className="flex items-center gap-4 cursor-pointer group bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={hasInvoice}
                  onChange={(e) => setHasInvoice(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-14 h-7 rounded-full transition-colors ${hasInvoice ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${hasInvoice ? 'translate-x-7' : 'translate-x-0'}`} />
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-bold text-sm">Fattura Richiesta</span>
            </label>
          )}

          <button
            type="submit"
            className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
              type === 'income' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-red-600 shadow-red-600/20'
            }`}
          >
            Conferma Operazione
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
