import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Play, Calendar, Heart, MapPin, BookOpen, 
  Users, Bell, Menu, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

// Componente de Ícone Branco (Estilo IEADJO)
const MenuIcon = ({ icon: Icon, label, to }) => (
  <Link to={to} className="flex flex-col items-center gap-2 group">
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-active:scale-95 transition-all hover:bg-white/20 shadow-lg">
      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={1.5} />
    </div>
    <span className="text-[10px] sm:text-xs font-medium text-white text-center drop-shadow-md tracking-wide">
      {label}
    </span>
  </Link>
);

export default function Home() {
  const [churchInfo, setChurchInfo] = useState(null);

  const { data: infoData } = useQuery({
    queryKey: ['churchInfo'],
    queryFn: async () => {
      const list = await base44.entities.ChurchInfo.list();
      return list[0] || {};
    }
  });

  useEffect(() => {
    if (infoData) setChurchInfo(infoData);
  }, [infoData]);

  // Se não tiver imagem carregada, usa um fundo cinza escuro neutro
  const bgImage = churchInfo?.banner_url;

  return (
    <Layout currentPageName="Home">
      {/* Container Full Screen */}
      <div className="relative min-h-screen bg-gray-900 flex flex-col">
        
        {/* Imagem de Fundo (Sua Arte 1080x1920) */}
        <div className="absolute inset-0 z-0">
          {bgImage ? (
            <img 
              src={bgImage} 
              alt="Fundo Principal" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
              <p className="text-white/30 text-sm">Carregue o Banner no Admin</p>
            </div>
          )}
          
          {/* Gradiente APENAS no rodapé para os ícones contrastarem */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Conteúdo Sobreposto */}
        <div className="relative z-10 flex-1 flex flex-col px-6 py-6">
          
          {/* Topo: Apenas o ícone de notificação discreto na direita */}
          <header className="flex justify-end">
            <Link to="/noticias">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                <Bell className="w-6 h-6" />
              </Button>
            </Link>
          </header>

          {/* Espaço Central Vazio (Para sua Logo/Lema brilharem) */}
          <div className="flex-1"></div>

          {/* Grid de Ícones Inferior */}
          <div className="pb-24">
            <div className="grid grid-cols-4 gap-4 justify-items-center">
              <MenuIcon icon={Play} label="AO VIVO" to="/aovivo" />
              <MenuIcon icon={Calendar} label="AGENDA" to="/agenda" />
              <MenuIcon icon={DollarSign} label="OFERTAS" to="/ofertas" />
              <MenuIcon icon={BookOpen} label="ESTUDOS" to="/conteudo" />
              
              <MenuIcon icon={MapPin} label="IGREJAS" to="/congregacoes" />
              <MenuIcon icon={Users} label="LÍDERES" to="/lideranca" />
              <MenuIcon icon={Heart} label="PEDIDOS" to="/conteudo" /> 
              <MenuIcon icon={Menu} label="MAIS" to="/menu" />
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}