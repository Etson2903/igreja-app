import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query'; // Importado
import { supabase } from '@/lib/supabase'; // Importado
import { 
  Calendar, Video, MapPin, BookOpen, Users, UserCheck, Newspaper, Heart, 
  Instagram, Facebook, Youtube, Loader2 
} from 'lucide-react';

export default function Home() {
  // 1. Busca as configurações do Supabase
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single(); // Pega apenas a primeira linha
      
      if (error) {
        console.error('Erro ao buscar configurações:', error);
        return null;
      }
      return data;
    },
    staleTime: 1000 * 60 * 60, // Cache de 1 hora (configurações mudam pouco)
  });

  // URL padrão caso não tenha no banco
  const defaultBanner = "https://itaxbjauwcmwcdknpjvl.supabase.co/storage/v1/object/public/files/banner.png";
  const bannerUrl = settings?.banner_url || defaultBanner;

  const menuItems = [
    { name: 'Agenda', path: '/agenda', icon: Calendar },
    { name: 'Ao Vivo', path: '/aovivo', icon: Video },
    { name: 'Ofertas', path: '/ofertas', icon: Heart },
    { name: 'Notícias', path: '/noticias', icon: Newspaper },
    { name: 'Liderança', path: '/lideranca', icon: UserCheck },
    { name: 'Departamentos', path: '/departamentos', icon: Users },
    { name: 'Congregações', path: '/congregacoes', icon: MapPin },
    { name: 'Conteúdo', path: '/conteudo', icon: BookOpen },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black font-sans">
      
      {/* 1. BANNER DE FUNDO */}
      <div className="absolute inset-0 z-0">
        {/* Efeito de carregamento suave da imagem */}
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          src={bannerUrl} 
          alt="Banner Igreja" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-md mx-auto px-5">
        
        <div className="flex-1"></div>

        {/* GRID DE NAVEGAÇÃO */}
        <div className="pb-24">
          <div className="grid grid-cols-4 gap-x-2 gap-y-5"> 
            {menuItems.map((item, index) => (
              <Link key={item.path} to={item.path}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl"
                >
                  <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-[18px] border border-white/20 shadow-lg hover:bg-white/20 transition-all">
                    <item.icon className="w-8 h-8 stroke-[1.5] text-white" />
                  </div>
                  
                  <span className="text-[11px] font-semibold text-white/90 tracking-wide text-center drop-shadow-lg leading-tight">
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* 3. RODAPÉ COM LINKS DINÂMICOS */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-8">
        {/* Só exibe o ícone se o link existir no banco ou se estiver carregando (skeleton visual) */}
        
        {isLoading ? (
           <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
        ) : (
          <>
            {settings?.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white hover:scale-110 transition-all">
                <Instagram className="w-6 h-6 stroke-[1.5]" />
              </a>
            )}
            
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white hover:scale-110 transition-all">
                <Facebook className="w-6 h-6 stroke-[1.5]" />
              </a>
            )}
            
            {settings?.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white hover:scale-110 transition-all">
                <Youtube className="w-6 h-6 stroke-[1.5]" />
              </a>
            )}
          </>
        )}
      </div>

    </div>
  );
}