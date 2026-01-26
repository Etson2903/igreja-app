import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Church, Users, Calendar, Newspaper, 
  Play, MapPin, Building2, Settings, LogOut, Menu, X,
  ChevronRight, Bell, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import AdminDashboard from './AdminDashboard';
import AdminChurchInfo from './AdminChurchInfo';
import AdminLeaders from './AdminLeaders';
import AdminDepartments from './AdminDepartments';
import AdminCongregations from './AdminCongregations';
import AdminEvents from './AdminEvents';
import AdminNews from './AdminNews';
import AdminVideos from './AdminVideos';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'church', icon: Church, label: 'Dados da Igreja' },
  { id: 'leaders', icon: Users, label: 'Liderança' },
  { id: 'departments', icon: Building2, label: 'Departamentos' },
  { id: 'congregations', icon: MapPin, label: 'Congregações' },
  { id: 'events', icon: Calendar, label: 'Eventos' },
  { id: 'news', icon: Newspaper, label: 'Notícias' },
  { id: 'videos', icon: Play, label: 'Vídeos' },
];

export default function Admin() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ full_name: 'Administrador', email: 'admin@igreja.com' });

  useEffect(() => {
    // Verificação de segurança: só chama se auth existir
    if (base44 && base44.auth && typeof base44.auth.me === 'function') {
      base44.auth.me()
        .then(setUser)
        .catch(err => console.warn('Erro ao carregar usuário:', err));
    }
  }, []);

  const handleLogout = () => {
    if (base44 && base44.auth && typeof base44.auth.logout === 'function') {
      base44.auth.logout();
    }
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboard />;
      case 'church': return <AdminChurchInfo />;
      case 'leaders': return <AdminLeaders />;
      case 'departments': return <AdminDepartments />;
      case 'congregations': return <AdminCongregations />;
      case 'events': return <AdminEvents />;
      case 'news': return <AdminNews />;
      case 'videos': return <AdminVideos />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Church className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Painel Admin</h1>
                <p className="text-xs text-gray-500">Gestão Eclesiástica</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-amber-50 text-amber-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : ''}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-amber-500" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            {user && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user.full_name?.[0] || user.email?.[0] || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {menuItems.find(m => m.id === activeSection)?.label || 'Dashboard'}
          </h2>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find(m => m.id === activeSection)?.label}
              </h2>
              <p className="text-gray-500">Gerencie as informações do aplicativo</p>
            </div>
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
