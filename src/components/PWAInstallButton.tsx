import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    // Detect standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      alert('Untuk menginstal aplikasi di HP Android:\n1. Buka menu browser Chrome (titik 3 di kanan atas)\n2. Pilih "Tambahkan ke Layar Utama" atau "Instal Aplikasi"');
    }
  };

  return (
    <>
      {!isOnline && (
        <div id="offline-indicator-banner" className="fixed bottom-3 right-3 z-50 flex items-center gap-2 bg-amber-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>Mode Offline — Data tersimpan lokal</span>
        </div>
      )}

      {!isInstalled && (
        <button
          id="btn-pwa-install"
          onClick={handleInstallClick}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"
          title="Instal aplikasi di HP Android / Desktop"
        >
          <Smartphone className="w-4 h-4" />
          <span>Instal App</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-blue-900">
                <Download className="w-5 h-5 text-blue-600" />
                Instal di iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              1. Buka di browser Safari.<br />
              2. Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah.<br />
              3. Gulir ke bawah dan ketuk <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
