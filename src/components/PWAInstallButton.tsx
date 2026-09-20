import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition active:scale-95"
        title="Instalar aplicación en dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 hover:bg-teal-100 transition"
          title="Instrucciones para instalar en iOS"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Instalar Dietas al Día en iOS</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Para usar la aplicación en pantalla completa sin conexión:
              </p>
              <ol className="mt-2 space-y-2 text-xs text-slate-700 list-decimal list-inside bg-slate-50 p-3 rounded-xl border border-slate-200">
                <li>Presiona el botón <strong>Compartir</strong> en la barra inferior de Safari.</li>
                <li>Desplázate y selecciona <strong>Agregar a pantalla de inicio</strong>.</li>
                <li>Confirma tocando <strong>Agregar</strong> en la esquina superior derecha.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-teal-700 py-2 text-xs font-semibold text-white hover:bg-teal-800"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
