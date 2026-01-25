import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { Home, Calendar, Play, Heart, Menu, X, Users, MapPin, Church, Bell, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mainNavItems = [
  { icon: Home, label: 'Início', page: 'Home' },
  { icon: Calendar, label: 'Agenda', page: 'Agenda' },
  { icon: Play, label: 'Ao Vivo', page: 'AoVivo' },
  { icon: Heart, label: 'Ofertar', page: 'Ofertas' },
];

const menuItems = [
  { icon: Home, label: 'Início', page: 'Home' },
  { icon: Calendar, label: 'Agenda', page: 'Agenda' },
  { icon: Play, label: 'Transmissões', page: 'AoVivo' },
  { icon: Heart, label: 'Ofertas', page: 'Ofertas' },
  { icon: Users, label: 'Liderança', page: 'Lideranca' },
  { icon: Church, label: 'Departamentos', page: 'Departamentos' },
  { icon: MapPin, label: 'Congregações', page: 'Congregacoes' },
  { icon: Bell, label: 'Notícias', page: 'Noticias' },
  { icon: BookOpen, label: 'Conteúdo', page: 'Conteudo' },
];

export default function Layout({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (pageName) => {
    return currentPageName === pageName;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary: #d97706;
          --primary-light: #fef3c7;
        }
      `}</style>

      <main className="pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pb-safe z-40">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {mainNavItems.map((item) => {
            const active = isActive(item.page);
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                  active 
                    ? 'text-amber-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`relative ${active ? 'scale-110' : ''} transition-transform`}>
                  <item.icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                  {active && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full"
                    />
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? 'text-amber-600' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Menu</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const active = isActive(item.page);
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? 'bg-amber-50 text-amber-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Assembleia de Deus
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
