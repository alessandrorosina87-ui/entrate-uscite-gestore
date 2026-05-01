import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
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
  const { isDarkMode } = useTheme();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <header className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Storico Operazioni</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">
            <Filter size={16} />
            <span>Filtra Periodo</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-400 font-bold mb-2 ml-1">DATA INIZIO</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 px-5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-bold mb-2 ml-1">DATA FINE</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 px-5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Period Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl p-6">
            <p className="text-emerald-600 dark:text-emerald-500 text-xs font-black uppercase tracking-widest mb-1">Tot. Entrate Periodo</p>
            <p className="text-3xl font-black">{formatCurrency(totals.income)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-3xl p-6">
            <p className="text-red-600 dark:text-red-500 text-xs font-black uppercase tracking-widest mb-1">Tot. Uscite Periodo</p>
            <p className="text-3xl font-black">{formatCurrency(totals.expense)}</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-black px-2">Risultati</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500">
              Nessun dato trovato per questo intervallo
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between group hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg capitalize">{t.category}</p>
                      {t.hasInvoice && <Receipt size={16} className="text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {formatDate(t.date)} • <span className="italic">"{t.description || 'Senza descrizione'}"</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <p className={`text-xl font-black ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </p>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={20} />
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
