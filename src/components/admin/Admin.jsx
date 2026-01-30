import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Calendar, Newspaper, Users, 
  MapPin, Video, Building2, LogOut, Menu, X, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';

// Importando os Módulos Prontos
import AdminChurchInfo from './AdminChurchInfo';
import AdminEvents from './AdminEvents';
import AdminNews from './AdminNews';
import AdminLeaders from './AdminLeaders';
import AdminCongregations from './AdminCongregations';
import AdminVideos from './AdminVideos';
import AdminDepartments from './AdminDepartments';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    } else {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, component: <AdminChurchInfo /> },
    { id: 'events', label: 'Agenda', icon: Calendar, component: <AdminEvents /> },
    { id: 'news', label: 'Notícias', icon: Newspaper, component: <AdminNews /> },
    { id: 'leaders', label: 'Liderança', icon: Users, component: <AdminLeaders /> },
    { id: 'congregations', label: 'Congregações', icon: MapPin, component: <AdminCongregations /> },
    { id: 'departments', label: 'Departamentos', icon: Building2, component: <AdminDepartments /> },
    { id: 'videos', label: 'Vídeos', icon: Video, component: <AdminVideos /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeItem = menuItems.find(item => item.id === activeTab);

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 fixed h-full z-10 shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-tight">Painel AD</h1>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Administração Sede</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all group ${
                  active 
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
                  {item.label}
                </div>
                {active && <ChevronRight className="w-4 h-4 text-white/70" />}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-bold transition-colors" 
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Encerrar Sessão
          </Button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        
        {/* HEADER MOBILE & DESKTOP INFO */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 lg:p-6 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl bg-gray-50 border border-gray-100">
                    <Menu className="w-6 h-6 text-gray-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 border-none">
                  <div className="p-8 bg-white border-b border-gray-50">
                    <h2 className="font-black text-2xl text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-lg" /> Menu
                    </h2>
                  </div>
                  <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-sm font-bold rounded-2xl transition-all ${
                          activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600'
                        }`}
                      >
                        <item.icon className="w-5 h-5" /> {item.label}
                      </button>
                    ))}
                    <div className="pt-6 mt-6 border-t border-gray-50">
                      <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-sm font-bold text-red-500 rounded-2xl hover:bg-red-50">
                        <LogOut className="w-5 h-5" /> Sair do Sistema
                      </button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden lg:block">
               <h2 className="text-xl font-black text-gray-900 tracking-tight">
                 {activeItem?.label}
               </h2>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Gerenciador de Conteúdo</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-sm font-bold text-gray-900 leading-none">Administrador</span>
                <span className="text-[10px] text-green-500 font-bold uppercase mt-1 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
                </span>
             </div>
             <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-2xl border-2 border-white shadow-sm overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin&background=d97706&color=fff" alt="Avatar" />
             </div>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO COM ANIMAÇÃO */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 lg:p-10 min-h-[600px]"
              >
                {activeItem?.component}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
