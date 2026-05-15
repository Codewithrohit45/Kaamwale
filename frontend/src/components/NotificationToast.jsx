import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

function Toast({ id, message, type = 'success', onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(id), 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const icons = {
    success: <FiCheckCircle size={20} />,
    error: <FiAlertCircle size={20} />,
    info: <FiInfo size={20} />,
  };

  const colors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-indigo-600 text-white',
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl min-w-[300px] max-w-[440px] transition-all duration-300 ${colors[type]} ${
        isExiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
      }`}
      style={{ animation: isExiting ? 'none' : 'slideInRight 0.3s ease-out' }}
    >
      <span className="flex-shrink-0">{icons[type]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => { setIsExiting(true); setTimeout(() => onRemove(id), 300); }}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <FiX size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast id={toast.id} message={toast.message} type={toast.type} onRemove={removeToast} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
