import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handler for production debugging
window.onerror = function(message, source, lineno, colno, error) {
  const errorMsg = `Errore Fatale: ${message}\nSorgente: ${source}\nLinea: ${lineno}:${colno}`;
  console.error(errorMsg);
  
  // Mostra un avviso visibile all'utente solo in produzione se necessario
  if (import.meta.env.PROD) {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="padding: 20px; color: red; font-family: sans-serif; text-align: center;">
          <h2>Si è verificato un errore critico</h2>
          <p>${message}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; cursor: pointer;">Ricarica App</button>
        </div>
      `;
    }
  }
  return false;
};

try {
  const container = document.getElementById('root');
  if (!container) throw new Error("Elemento 'root' non trovato nel DOM");
  
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error("Errore durante il render iniziale:", error);
  alert("Errore durante l'avvio dell'applicazione: " + error.message);
}
