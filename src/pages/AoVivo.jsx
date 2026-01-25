import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Play, Radio, Calendar, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function AoVivo() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: churchInfo } = useQuery({
    queryKey: ['churchInfo'],
    queryFn: async () => {
      const list = await base44.entities.ChurchInfo.list();
      return list[0] || null;
    }
  });

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.filter({ is_active: true }, '-event_date', 50)
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
      <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-900">
        <img
          src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_video_id}/maxresdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-medium">
            <Radio className="w-3 h-3 animate-pulse" />
            AO VIVO
          </div>
        )}
        {video.duration && !isLive && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
            {video.duration}
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-amber-600 transition-colors">
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
              {format(parseISO(video.event_date), 'd MMM yyyy', { locale: ptBR })}
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Transmissões" subtitle="Cultos ao vivo e pregações" />

        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtube_video_id}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="mt-4 text-white">
                <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-gray-300 mt-2 text-sm">{selectedVideo.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {liveVideos.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-lg font-semibold text-gray-900">Ao Vivo Agora</h2>
            </div>
            {liveVideos.map(video => (
              <VideoCard key={video.id} video={video} isLive />
            ))}
          </section>
        )}

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="todos" className="rounded-lg">Todos</TabsTrigger>
            <TabsTrigger value="pregacoes" className="rounded-lg">Pregações</TabsTrigger>
            <TabsTrigger value="louvor" className="rounded-lg">Louvor</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-4">
            {allVideos.length === 0 ? (
              <EmptyState
                icon={Play}
                title="Nenhum vídeo disponível"
                description="Os vídeos das pregações e eventos aparecerão aqui."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {allVideos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pregacoes" className="mt-4">
            <div className="grid grid-cols-1 gap-6">
              {allVideos.filter(v => v.category === 'pregacao' || v.category === 'estudo').map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="louvor" className="mt-4">
            <div className="grid grid-cols-1 gap-6">
              {allVideos.filter(v => v.category === 'louvor').map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {churchInfo?.youtube_channel_url && (
          <motion.a
            href={churchInfo.youtube_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Acessar Canal do YouTube
          </motion.a>
        )}
      </div>
    </div>
  );
}
