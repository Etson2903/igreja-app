import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  Calendar, Youtube, Users, MapPin, 
  DollarSign, BookOpen, Grid, MoreHorizontal 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { data: churchInfo } = useQuery({
    queryKey: ['churchInfo'],
    queryFn: async () => {
      const { data } = await supabase.from('church_info').select('*').single();
      return data;
    }
  });

  const defaultBanner = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2673&auto=format&fit=crop";

  // Ícones Mapeados com Rotas REAIS do App.jsx
  const menuItems = [
    { label: 'Agenda', icon: Calendar, link: '/agenda' },
    { label: 'Ao Vivo', icon: Youtube, link: '/aovivo' },
    { label: 'Ofertas', icon: DollarSign, link: '/ofertas' },
    { label: 'Liderança', icon: Users, link: '/lideranca' },
    { label: 'Congregações', icon: MapPin, link: '/congregacoes' },
    { label: 'Estudos', icon: BookOpen, link: '/conteudo' }, // Rota /conteudo
    { label: 'Departamentos', icon: Grid, link: '/departamentos' },
    { label: 'Mais', icon: MoreHorizontal, link: '/noticias' }, // Rota /noticias como "Mais"
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      
      {/* 1. BANNER DE FUNDO (100% TELA) */}
      <div className="absolute inset-0 z-0">
        <img 
          src={churchInfo?.banner_url || defaultBanner} 
          alt="Banner Igreja" 
          className="w-full h-full object-cover"
        />
        {/* Gradiente Inferior para legibilidade dos ícones */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      {/* 2. CONTEÚDO (Ícones Brancos) */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-6">
        
        {/* GRID DE ÍCONES */}
        <div className="grid grid-cols-4 gap-y-8 gap-x-4 max-w-lg mx-auto w-full">
          {menuItems.map((item, index) => (
            <Link to={item.link} key={index} className="group flex flex-col items-center gap-2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg"
              >
                <item.icon className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-[10px] font-medium text-white/90 uppercase tracking-wide text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
