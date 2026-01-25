import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, User, Share2, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import LoadingSpinner from '@/components/shared/LoadingSpinner';

const categoryLabels = {
  aviso: 'Aviso',
  noticia: 'Notícia',
  comunicado: 'Comunicado',
  devocional: 'Devocional',
  estudo: 'Estudo'
};

const categoryColors = {
  aviso: 'bg-red-100 text-red-700',
  noticia: 'bg-blue-100 text-blue-700',
  comunicado: 'bg-amber-100 text-amber-700',
  devocional: 'bg-purple-100 text-purple-700',
  estudo: 'bg-emerald-100 text-emerald-700'
};

export default function NoticiaDetalhe() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get('id');

  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news', newsId],
    queryFn: async () => {
      const items = await base44.entities.News.filter({ id: newsId });
      return items[0] || null;
    },
    enabled: !!newsId
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary || news.title,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Notícia não encontrada</p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-24">
      <div className="max-w-lg mx-auto">
        {news.image_url && (
          <div className="relative h-56 md:h-72">
            <img
              src={news.image_url}
              alt={news.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="absolute top-4 right-4 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="px-4 py-6">
          {!news.image_url && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="rounded-xl -ml-2"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-xl"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 mb-4"
          >
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${categoryColors[news.category] || categoryColors.noticia}`}>
              {categoryLabels[news.category] || 'Notícia'}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {format(parseISO(news.created_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            {news.author && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3.5 h-3.5" />
                {news.author}
              </div>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"
          >
            {news.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-amber max-w-none"
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
                li: ({ children }) => <li className="text-gray-700">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-amber-500 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline">
                    {children}
                  </a>
                )
              }}
            >
              {news.content}
            </ReactMarkdown>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
