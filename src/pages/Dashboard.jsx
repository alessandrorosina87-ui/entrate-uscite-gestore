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
  TrendingUp, 
  TrendingDown, 
  Receipt,
  Trash2,
  BarChart3
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
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('income');
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });

  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const unsubscribe = getDailyTransactions(user.uid, today, (data) => {
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
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Riepilogo Oggi
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden sm:block">{user.email}</span>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-xl border border-gray-700">
          <p className="text-gray-400 text-sm font-medium mb-1">Saldo Giornaliero</p>
          <h2 className={`text-5xl font-bold mb-8 ${totals.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(totals.balance)}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-2xl p-4 border border-emerald-500/10">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <TrendingUp size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Entrate</span>
              </div>
              <p className="text-xl font-semibold">{formatCurrency(totals.income)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-2xl p-4 border border-red-500/10">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <TrendingDown size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Uscite</span>
              </div>
              <p className="text-xl font-semibold">{formatCurrency(totals.expense)}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-gray-400 text-sm font-medium">
            <BarChart3 size={16} />
            <span>Andamento Giornaliero</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Entrate', value: totals.income },
                { name: 'Uscite', value: totals.expense }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleOpenModal('income')}
            className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20"
          >
            <Plus size={24} /> Entrata
          </button>
          <button 
            onClick={() => handleOpenModal('expense')}
            className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-red-900/20"
          >
            <Minus size={24} /> Uscita
          </button>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Ultime Operazioni</h3>
            <button 
              onClick={() => navigate('/history')}
              className="text-sm text-blue-400 flex items-center gap-1 hover:underline"
            >
              <History size={16} /> Storico completo
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800 text-gray-500">
                Nessuna operazione registrata oggi
              </div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold capitalize">{t.category}</p>
                        {t.hasInvoice && <Receipt size={14} className="text-blue-400" title="Fattura presente" />}
                      </div>
                      <p className="text-sm text-gray-500">{t.description || 'Nessuna descrizione'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </p>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
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
      />
    </div>
  );
};

export default Dashboard;
