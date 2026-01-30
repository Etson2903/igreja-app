import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // MIGRADO PARA SUPABASE
import { motion } from 'framer-motion';
import { Play, Radio, Calendar, User, Video as VideoIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function AoVivo() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Busca configurações do canal do YouTube
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (error && error.code !== 'PGRST116') console.error(error);
      return data || {};
    }
  });

  // Busca vídeos do Supabase
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: false })
        .limit(50);
        
      if (error) {
        console.error('Erro ao buscar vídeos:', error);
        return []; // Retorna vazio em caso de erro (ex: tabela não existe ainda)
      }
      return data;
    }
  });

  const liveVideos = videos.filter(v => v.is_live);
  const allVideos = videos.filter(v => !v.is_live);

  const VideoCard = ({ video, isLive = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => setSelectedVideo(video)}
      className="cursor-pointer group"
    >
      <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-900 shadow-md">
        <img
          src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_video_id}/maxresdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Play className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
            <Radio className="w-3 h-3 animate-pulse" />
            AO VIVO
          </div>
        )}
        {video.duration && !isLive && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-0.5 rounded text-[10px] font-medium">
            {video.duration}
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
          {video.preacher && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {video.preacher}
            </span>
          )}
          {video.event_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(parseISO(video.event_date), 'd MMM', { locale: ptBR })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Transmissões" subtitle="Cultos ao vivo e mensagens" />

        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtube_video_id}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-4 bg-gray-900 text-white">
                <h2 className="text-lg font-bold line-clamp-1">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-gray-400 mt-1 text-sm line-clamp-2">{selectedVideo.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {liveVideos.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h2 className="text-lg font-bold text-gray-900">Ao Vivo Agora</h2>
            </div>
            <div className="grid gap-4">
              {liveVideos.map(video => (
                <VideoCard key={video.id} video={video} isLive />
              ))}
            </div>
          </section>
        )}

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-white p-1 rounded-xl border border-gray-100 shadow-sm mb-6">
            <TabsTrigger value="todos" className="rounded-lg text-xs md:text-sm">Todos</TabsTrigger>
            <TabsTrigger value="pregacoes" className="rounded-lg text-xs md:text-sm">Pregações</TabsTrigger>
            <TabsTrigger value="louvor" className="rounded-lg text-xs md:text-sm">Louvor</TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            {allVideos.length === 0 ? (
              <EmptyState
                icon={VideoIcon}
                title="Nenhum vídeo"
                description="Os vídeos aparecerão aqui em breve."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
                {allVideos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pregacoes">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
              {allVideos.filter(v => v.category === 'pregacao' || v.category === 'estudo').map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="louvor">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
              {allVideos.filter(v => v.category === 'louvor').map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {settings?.youtube_url && (
          <motion.a
            href={settings.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            className="mt-10 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Play className="w-4 h-4 text-red-600 fill-current" />
            Ver canal completo no YouTube
          </motion.a>
        )}
      </div>
    </div>
  );
}