import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Calendar,
  Filter,
  Trash2,
  Receipt,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { formatCurrency, formatDate } from '../utils/formatters';
import { deleteTransaction } from '../services/transactions';

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toLocaleDateString('en-CA');
  });
  const [endDate, setEndDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    console.log(`[History] Initializing listener from ${startDate} to ${endDate}`);

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
      // Removed orderBy("date") to avoid mandatory composite index errors in production
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`[History] Data received. Count: ${snapshot.size}`);
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        // Sort in memory by date (desc) and then by createdAt (desc)
        .sort((a, b) => {
          if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
          }
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });
      
      setTransactions(data);
      
      const income = data.filter(t => t.type === 'entrata' || t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = data.filter(t => t.type === 'uscita' || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      setTotals({ income, expense });
      setQueryError(null);
      setIsLoading(false);
    }, (error) => {
      console.error("[History] Listener error:", error);
      setQueryError(error.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, startDate, endDate]);


  const handleDelete = async (id) => {
    if (window.confirm("Eliminare questa operazione?")) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-200"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Storico Operazioni</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Error Alert */}
        {queryError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p className="text-sm font-medium">{queryError}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-gray-400 text-xs font-bold uppercase tracking-wider">
            <Filter size={16} />
            <span>Filtra Periodo</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-2 ml-1">DAL</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-2 ml-1">AL</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Period Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <TrendingUp size={16} />
              <p className="text-xs font-bold uppercase tracking-wider">Tot. Entrate</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totals.income)}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <TrendingDown size={16} />
              <p className="text-xs font-bold uppercase tracking-wider">Tot. Uscite</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totals.expense)}</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-bold px-2">Risultati</h3>
          {isLoading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-50 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 font-medium animate-pulse">Caricamento dati...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
              Nessun dato trovato per questo intervallo
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between group hover:border-gray-200 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'entrata' || t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 capitalize">{t.category}</p>
                      {(t.fattura || t.hasInvoice) && <Receipt size={14} className="text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {formatDate(t.date)} • <span className="italic">"{t.description || 'Senza descrizione'}"</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className={`text-lg font-bold ${t.type === 'entrata' || t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'entrata' || t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </p>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
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
