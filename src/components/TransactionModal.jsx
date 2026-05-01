import React, { useState } from 'react';
import { X } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, onSave, type }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [hasInvoice, setHasInvoice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      type,
      amount: parseFloat(amount),
      category,
      description,
      hasInvoice: type === 'expense' ? hasInvoice : false,
      date: new Date().toISOString()
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          Aggiungi {type === 'income' ? 'Entrata' : 'Uscita'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Importo (€)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Seleziona...</option>
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Descrizione</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Esempio: Spesa verdura"
              required={type === 'expense' && (category === 'maestranze' || category === 'extra')}
            />
          </div>

          {type === 'expense' && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={hasInvoice}
                  onChange={(e) => setHasInvoice(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${hasInvoice ? 'bg-blue-600' : 'bg-gray-700'}`} />
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${hasInvoice ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <span className="text-gray-300">Con Fattura</span>
            </label>
          )}

          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
              type === 'income' ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-red-600 shadow-red-900/20'
            }`}
          >
            Salva
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
