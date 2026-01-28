import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Video, MapPin, BookOpen, Users, UserCheck, Newspaper, Heart, 
  Instagram, Facebook, Youtube 
} from 'lucide-react';

export default function Home() {
  const bannerUrl = "https://itaxbjauwcmwcdknpjvl.supabase.co/storage/v1/object/public/files/banner.png";

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
        <img 
          src={bannerUrl} 
          alt="Banner Igreja" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-md mx-auto px-5">
        
        <div className="flex-1"></div>

        {/* GRID DE NAVEGAÇÃO (Tamanho Equilibrado) */}
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
                  {/* Ícone Ajustado: w-8 (32px) com padding p-3.5 */}
                  <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-[18px] border border-white/20 shadow-lg hover:bg-white/20 transition-all">
                    <item.icon className="w-8 h-8 stroke-[1.5] text-white" />
                  </div>
                  
                  {/* Texto */}
                  <span className="text-[11px] font-semibold text-white/90 tracking-wide text-center drop-shadow-lg leading-tight">
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* 3. RODAPÉ */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-8">
        <a href="https://instagram.com" target="_blank" className="text-white/70 hover:text-white hover:scale-110 transition-all">
          <Instagram className="w-6 h-6 stroke-[1.5]" />
        </a>
        <a href="https://facebook.com" target="_blank" className="text-white/70 hover:text-white hover:scale-110 transition-all">
          <Facebook className="w-6 h-6 stroke-[1.5]" />
        </a>
        <a href="https://youtube.com" target="_blank" className="text-white/70 hover:text-white hover:scale-110 transition-all">
          <Youtube className="w-6 h-6 stroke-[1.5]" />
        </a>
      </div>

    </div>
  );
}
