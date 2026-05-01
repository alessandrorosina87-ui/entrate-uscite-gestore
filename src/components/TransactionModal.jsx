import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, onSave, type, initialDate }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [fattura, setFattura] = useState(false);
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

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
      fattura: type === 'uscita' || type === 'expense' ? fattura : false, // mapping 'expense' to 'uscita' internally if needed
      date: date // YYYY-MM-DD
    });
    
    setAmount('');
    setCategory('');
    setDescription('');
    setFattura(false);
    onClose();
  };

  const categories = (type === 'income' || type === 'entrata')
    ? ['POS', 'Contanti', 'Bonifico', 'Extra']
    : ['POS', 'Contanti', 'Bonifico', 'Extra', 'Maestranza'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 border border-gray-100 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Nuova {(type === 'income' || type === 'entrata') ? 'Entrata' : 'Uscita'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Importo (€)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none cursor-pointer"
              required
            >
              <option value="">Seleziona...</option>
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">Descrizione / Note</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              placeholder="Inserisci una breve nota..."
              required={ (type === 'expense' || type === 'uscita') && (category === 'maestranza' || category === 'extra' || category === 'contanti' || category === 'bonifico') }
            />
          </div>

          {(type === 'expense' || type === 'uscita') && (
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <input
                type="checkbox"
                id="fattura"
                checked={fattura}
                onChange={(e) => setFattura(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="fattura" className="text-gray-700 font-bold text-sm cursor-pointer select-none">
                Con Fattura
              </label>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] ${
              (type === 'income' || type === 'entrata') ? 'bg-emerald-600 shadow-emerald-600/10' : 'bg-red-600 shadow-red-600/10'
            }`}
          >
            Salva Operazione
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
