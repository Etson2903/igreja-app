import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Calendar, Newspaper, Users, 
  MapPin, Video, Building2, LogOut, Menu, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/login');
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

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.id === activeTab);
    return activeItem ? activeItem.component : <AdminChurchInfo />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600" />
            Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-amber-50 text-amber-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-amber-600' : 'text-gray-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        
        {/* HEADER MOBILE */}
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20">
          <h1 className="font-bold text-gray-900">Painel Admin</h1>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="w-6 h-6" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b">
                <h2 className="font-bold text-xl flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" /> Menu
                </h2>
              </div>
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                      activeTab === item.id ? 'bg-amber-50 text-amber-700' : 'text-gray-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5" /> {item.label}
                  </button>
                ))}
                <div className="pt-4 mt-4 border-t">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50">
                    <LogOut className="w-5 h-5" /> Sair
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        {/* ÁREA DE CONTEÚDO */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-gray-500 text-sm">Gerencie o conteúdo do aplicativo</p>
            </div>
            
            {/* RENDERIZA O COMPONENTE ESPECÍFICO AQUI */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
