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
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown
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
import { getDailyTransactions, addTransaction, deleteTransaction } from '../services/transactions';
import { formatCurrency } from '../utils/formatters';
import TransactionModal from '../components/TransactionModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('entrata');
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getDailyTransactions(user.uid, selectedDate, (data) => {
      setTransactions(data);
      
      const income = data.filter(t => t.type === 'entrata' || t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = data.filter(t => t.type === 'uscita' || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      setTotals({
        income,
        expense,
        balance: income - expense
      });
      setQueryError(null);
    }, (error) => {
      setQueryError(error.message || "Errore durante il caricamento dei dati.");
    });

    return () => unsubscribe();
  }, [user, selectedDate]);

  const handleLogout = () => signOut(auth);

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data) => {
    try {
      // Ensure type is 'entrata' or 'uscita' for the database
      const dbType = data.type === 'income' ? 'entrata' : (data.type === 'expense' ? 'uscita' : data.type);
      await addTransaction(user.uid, { ...data, type: dbType });
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
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Gestionale Entrate/Uscite
            </h1>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
              <CalendarIcon size={16} className="text-gray-500" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout} 
              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all border border-gray-200"
              title="Esci"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Error Alert */}
        {queryError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <p className="text-sm font-medium">{queryError}</p>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">Saldo del {new Date(selectedDate).toLocaleDateString('it-IT')}</p>
          <h2 className={`text-5xl font-black mb-8 tracking-tight ${totals.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(totals.balance)}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <TrendingUp size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Entrate Totali</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totals.income)}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <TrendingDown size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Uscite Totali</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totals.expense)}</p>
            </div>
          </div>
        </div>

        {/* Charts & Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-8 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <BarChart3 size={16} />
              <span>Analisi Veloce</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Entrate', value: totals.income },
                  { name: 'Uscite', value: totals.expense }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#F9FAFB', radius: 8}}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                    <Cell fill="#10B981" />
                    <Cell fill="#EF4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions Container */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => handleOpenModal('entrata')}
              className="flex-1 flex flex-col items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-3xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-emerald-600/10"
            >
              <div className="p-3 bg-white/20 rounded-xl">
                <Plus size={28} />
              </div>
              <span className="text-lg">Nuova Entrata</span>
            </button>
            <button 
              onClick={() => handleOpenModal('uscita')}
              className="flex-1 flex flex-col items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white p-6 rounded-3xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-red-600/10"
            >
              <div className="p-3 bg-white/20 rounded-xl">
                <Minus size={28} />
              </div>
              <span className="text-lg">Nuova Uscita</span>
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-bold">Operazioni Recenti</h3>
            <button 
              onClick={() => navigate('/history')}
              className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all"
            >
              <History size={18} />
              <span>Vedi Storico</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 flex flex-col items-center gap-3">
                <CalendarIcon size={40} className="opacity-20" />
                <p className="font-medium">Nessun dato per oggi</p>
              </div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between group hover:border-gray-200 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${t.type === 'entrata' || t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {t.type === 'entrata' || t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 capitalize">{t.category}</p>
                        {t.fattura && <Receipt size={14} className="text-blue-500" title="Fattura presente" />}
                      </div>
                      <p className="text-sm text-gray-500 italic truncate max-w-[200px]">{t.description || 'Senza descrizione'}</p>
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
