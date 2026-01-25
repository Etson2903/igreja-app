import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import QuickActions from '@/components/home/QuickActions';
import NextEvents from '@/components/home/NextEvents';
import LatestNews from '@/components/home/LatestNews';
import SocialLinks from '@/components/home/SocialLinks';

export default function Home() {
  const { data: churchInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ['churchInfo'],
    queryFn: async () => {
      const list = await base44.entities.ChurchInfo.list();
      return list[0] || null;
    }
  });

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['homeEvents'],
    queryFn: () => base44.entities.Event.filter({ is_active: true }, 'date', 5)
  });

  const { data: news, isLoading: loadingNews } = useQuery({
    queryKey: ['homeNews'],
    queryFn: () => base44.entities.News.filter({ is_published: true }, '-created_date', 5)
  });

  if (loadingInfo || loadingEvents || loadingNews) {
    return <LoadingSpinner />;
  }

  return (
    <Layout currentPageName="Home">
      {/* Banner Principal - Agora usa aspect-ratio para se adaptar */}
      <div className="relative w-full bg-gray-900 shadow-md">
        {/* aspect-video (16:9) no desktop, aspect-[4/3] no mobile para ficar mais alto */}
        <div className="relative w-full aspect-[4/3] md:aspect-[21/9] max-h-[500px]">
          {churchInfo?.banner_url ? (
            <img 
              src={churchInfo.banner_url} 
              alt="Banner da Igreja" 
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-600 to-orange-800 opacity-80" />
          )}
          
          {/* Gradiente de proteção para o texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Conteúdo do Banner */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-4"
            >
              {churchInfo?.logo_url && (
                <img 
                  src={churchInfo.logo_url} 
                  alt="Logo" 
                  className="w-16 h-16 md:w-24 md:h-24 rounded-xl bg-white p-1 shadow-lg object-contain flex-shrink-0"
                />
              )}
              <div className="flex-1 pb-1">
                <h1 className="text-xl md:text-4xl font-bold text-white leading-tight drop-shadow-md">
                  {churchInfo?.name || 'Minha Igreja'}
                </h1>
                <p className="text-gray-200 text-sm md:text-lg mt-1 drop-shadow-sm font-medium">
                  {churchInfo?.address}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Página */}
      <div className="max-w-lg mx-auto px-4 mt-6 space-y-8 pb-20">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          <QuickActions />
        </div>
        <NextEvents events={events} />
        <LatestNews news={news} />
        <SocialLinks churchInfo={churchInfo} />
      </div>
    </Layout>
  );
}
