import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Verifica se já foi dispensado recentemente (ex: 7 dias)
    const lastDismissed = localStorage.getItem('pwa_dismissed_at');
    if (lastDismissed) {
      const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Verifica se já está instalado (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('pwa_dismissed_at', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-amber-100 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-xl">
              <Download className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">Instalar Aplicativo</h3>
              <p className="text-xs text-gray-500">Acesse mais rápido e offline.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleDismiss}>
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-8 text-xs" onClick={handleInstallClick}>
                Instalar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
