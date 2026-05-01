import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Ristorante Manager
          </h1>
          <p className="text-gray-500 font-medium">Accesso Gestionale</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="nome@ristorante.it"
              required
            />
          </div>
          <div>
            <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-4"
          >
            Entra nel Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
