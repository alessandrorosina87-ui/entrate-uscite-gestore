import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Email o password errati.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      <div className="absolute top-8 right-8">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 shadow-xl"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
            Gestore App
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Accedi al tuo pannello di controllo</p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500 text-red-600 dark:text-red-500 p-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-2 ml-1">Email Aziendale</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="nome@ristorante.it"
              required
            />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-black text-lg py-5 px-4 rounded-2xl shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98] mt-4"
          >
            Entra nel Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
