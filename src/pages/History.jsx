import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Trash2,
  Receipt
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, startAt, endAt } from "firebase/firestore";
import { db } from "../firebase/config";
import { formatCurrency, formatDate } from '../utils/formatters';
import { deleteTransaction } from '../services/transactions';

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    if (!user) return;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("date", ">=", start.toISOString()),
      where("date", "<=", end.toISOString()),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
      
      const income = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      setTotals({ income, expense });
    });

    return () => unsubscribe();
  }, [user, startDate, endDate]);

  const handleDelete = async (id) => {
    if (window.confirm("Eliminare questa operazione?")) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Storico Operazioni</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-gray-400 text-sm font-medium">
            <Filter size={16} />
            <span>Filtra per intervallo</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase font-bold mb-1 ml-1">Dal</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase font-bold mb-1 ml-1">Al</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Period Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-emerald-500 text-xs font-bold uppercase mb-1">Tot. Entrate Periodo</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.income)}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-red-500 text-xs font-bold uppercase mb-1">Tot. Uscite Periodo</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.expense)}</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-20 text-gray-500">Nessun dato trovato per questo intervallo</div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold capitalize">{t.category}</p>
                      {t.hasInvoice && <Receipt size={14} className="text-blue-400" />}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(t.date)} • {t.description || 'Senza descrizione'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </p>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="text-gray-600 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 transition-all p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
