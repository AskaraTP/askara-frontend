'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
}

interface UIContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (message: string, title?: string) => Promise<void>;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  isLoading: boolean;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  // Toast state
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const toastIdRef = useRef(0);

  // Confirm state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  // Alert Modal state
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  // Global loading state
  const [loadingState, setLoadingState] = useState<{
    isLoading: boolean;
    message?: string;
  }>({ isLoading: false });

  // 1. Toast function
  const toast = useCallback((message: string, type: ToastType = 'info', duration = 2800) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  // 2. Custom Confirm function (Promise-based)
  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    const normalized: ConfirmOptions =
      typeof options === 'string'
        ? { message: options, title: 'Confirmation' }
        : { title: 'Confirmation', ...options };

    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options: normalized,
        resolve: (val: boolean) => {
          setConfirmState(null);
          resolve(val);
        },
      });
    });
  }, []);

  // 3. Custom Alert function (Promise-based)
  const alertModal = useCallback((message: string, title = 'Notice'): Promise<void> => {
    return new Promise<void>((resolve) => {
      setAlertState({
        isOpen: true,
        options: { message, title, buttonText: 'OK' },
        resolve: () => {
          setAlertState(null);
          resolve();
        },
      });
    });
  }, []);

  // 4. Loading functions
  const showLoading = useCallback((message?: string) => {
    setLoadingState({ isLoading: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState({ isLoading: false });
  }, []);

  return (
    <UIContext.Provider
      value={{
        toast,
        confirm,
        alert: alertModal,
        showLoading,
        hideLoading,
        isLoading: loadingState.isLoading,
      }}
    >
      {children}

      {/*  Custom Minimalist Toast Container (Floating Top-Center) */}
      <div
        role="alert"
        aria-live="assertive"
        className="fixed top-6 sm:top-8 inset-x-0 z-[9999] pointer-events-none flex flex-col items-center justify-start px-4 gap-2"
      >
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
            warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
            info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
          };

          return (
            <div
              key={t.id}
              className="px-4 py-2 text-xs font-medium rounded-md shadow-xl text-white bg-slate-900 border border-slate-700/60 flex items-center gap-2 pointer-events-auto transition-all duration-150"
            >
              {icons[t.type]}
              <span className="leading-snug">{t.message}</span>
            </div>
          );
        })}
      </div>

      {/* ❓ Custom Minimalist Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 sm:pt-28 p-4 bg-slate-950/60">
          <div className="w-full max-w-sm mx-auto bg-white rounded-lg border border-slate-200 shadow-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {confirmState.options.title || 'Confirmation'}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {confirmState.options.message}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => confirmState.resolve(false)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  borderColor: '#cbd5e1',
                }}
                className="px-3.5 py-1.5 rounded-md font-semibold text-xs border hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {confirmState.options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => confirmState.resolve(true)}
                style={{
                  backgroundColor: confirmState.options.isDestructive !== false ? '#dc2626' : '#ea580c',
                  color: '#ffffff',
                }}
                className="px-4 py-1.5 rounded-md font-bold text-xs text-white shadow-sm hover:opacity-90 active:opacity-100 transition-opacity cursor-pointer"
              >
                {confirmState.options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ℹ️ Custom Minimalist Alert Modal */}
      {alertState && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 sm:pt-28 p-4 bg-slate-950/60">
          <div className="w-full max-w-sm mx-auto bg-white rounded-lg border border-slate-200 shadow-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {alertState.options.title || 'Notice'}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {alertState.options.message}
              </p>
            </div>
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => alertState.resolve()}
                style={{
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                }}
                className="px-4 py-1.5 rounded-md font-bold text-xs text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                {alertState.options.buttonText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⏳ Global Loading Spinner Overlay */}
      {loadingState.isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 sm:pt-28 p-4 bg-slate-950/40">
          <div className="px-4 py-2.5 rounded-lg bg-slate-900 text-white border border-slate-700/60 shadow-2xl flex items-center gap-2.5 mx-auto">
            <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
            <span className="text-xs font-medium">
              {loadingState.message || 'Processing, please wait...'}
            </span>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
