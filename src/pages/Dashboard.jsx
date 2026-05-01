import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  LogOut, 
  Plus, 
  Minus, 
  History, 
  Receipt,
  Trash2,
  BarChart3,
  Moon,
  Sun,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { getDailyTransactions, addTransaction, deleteTransaction } from '../services/transactions';
import { formatCurrency } from '../utils/formatters';
import TransactionModal from '../components/TransactionModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('income');
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getDailyTransactions(user.uid, selectedDate, (data) => {
      setTransactions(data);
      
      const income = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      setTotals({
        income,
        expense,
        balance: income - expense
      });
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => signOut(auth);

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data) => {
    try {
      await addTransaction(user.uid, data);
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("Errore durante il salvataggio.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questa operazione?")) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error("Error deleting transaction:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 pb-24">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Riepilogo
            </h1>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
              <CalendarIcon size={14} className="text-gray-500" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
              title="Cambia Tema"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={handleLogout} 
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
              title="Esci"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 rounded-[2rem] p-6 sm:p-10 shadow-2xl shadow-blue-500/5 dark:shadow-none border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Saldo del {new Date(selectedDate).toLocaleDateString('it-IT')}</p>
          </div>
          <h2 className={`text-4xl sm:text-6xl font-black mb-8 tracking-tight ${totals.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totals.balance)}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-500/10">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                <TrendingUp size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">Entrate Totali</span>
              </div>
              <p className="text-2xl font-bold dark:text-white">{formatCurrency(totals.income)}</p>
            </div>
            <div className="bg-red-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-red-100 dark:border-red-500/10">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                <TrendingDown size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">Uscite Totali</span>
              </div>
              <p className="text-2xl font-bold dark:text-white">{formatCurrency(totals.expense)}</p>
            </div>
          </div>
        </div>

        {/* Charts & Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <div className="flex items-center gap-2 mb-8 text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
              <BarChart3 size={18} />
              <span>Analisi Veloce</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Entrate', value: totals.income },
                  { name: 'Uscite', value: totals.expense }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} vertical={false} />
                  <XAxis dataKey="name" stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: isDarkMode ? '#1F2937' : '#F3F4F6', radius: 12}}
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#111827' : '#FFFFFF', 
                      border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`, 
                      borderRadius: '16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={80}>
                    <Cell fill={isDarkMode ? "#10B981" : "#059669"} />
                    <Cell fill={isDarkMode ? "#EF4444" : "#DC2626"} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions Container */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => handleOpenModal('income')}
              className="flex-1 flex flex-col items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white p-6 rounded-[2rem] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-emerald-500/20"
            >
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Plus size={32} />
              </div>
              <span className="text-xl">Nuova Entrata</span>
            </button>
            <button 
              onClick={() => handleOpenModal('expense')}
              className="flex-1 flex flex-col items-center justify-center gap-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white p-6 rounded-[2rem] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-red-500/20"
            >
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Minus size={32} />
              </div>
              <span className="text-xl">Nuova Uscita</span>
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-2xl font-black">Operazioni</h3>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">Elenco del giorno selezionato</p>
            </div>
            <button 
              onClick={() => navigate('/history')}
              className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-4 py-2 rounded-full transition-all"
            >
              <History size={18} />
              <span>Vedi Storico</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 flex flex-col items-center gap-3">
                <CalendarIcon size={48} className="opacity-20" />
                <p className="font-medium">Nessuna operazione per questa data</p>
              </div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between group hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                      {t.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg capitalize">{t.category}</p>
                        {t.hasInvoice && <Receipt size={16} className="text-blue-500" title="Fattura presente" />}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{t.description || 'Nessuna descrizione'}"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <p className={`text-xl font-black ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </p>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        type={modalType}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default Dashboard;
