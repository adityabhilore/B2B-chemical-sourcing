// src/context/ToastContext.jsx — global toast notification system
import { createContext, useCallback, useContext, useReducer } from 'react';

const ToastContext = createContext(null);

const MAX_TOASTS = 5;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [action.toast, ...state].slice(0, MAX_TOASTS);
    case 'REMOVE':
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

let _id = 0;

/**
 * ToastProvider — wrap your app root
 */
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++_id;
    dispatch({ type: 'ADD', toast: { id, message, type, duration } });
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const toast = {
    success: (msg, opts) => addToast({ message: msg, type: 'success', ...opts }),
    error:   (msg, opts) => addToast({ message: msg, type: 'error',   ...opts }),
    warning: (msg, opts) => addToast({ message: msg, type: 'warning', ...opts }),
    info:    (msg, opts) => addToast({ message: msg, type: 'info',    ...opts }),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
