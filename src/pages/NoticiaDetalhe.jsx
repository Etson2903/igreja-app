import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // USANDO SUPABASE
import { motion } from 'framer-motion';
import { Calendar, User, Share2, ArrowLeft, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const newsId = searchParams.get('id');

  const { data: news, isLoading, isError } = useQuery({
    queryKey: ['news', newsId],
    queryFn: async () => {
      if (!newsId) return null;
      
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', newsId)
        .single();
        
      if (error) throw error;
      return data;
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
        if (err.name !== 'AbortError') console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (isError || !news) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Conteúdo não encontrado</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Imagem de Capa ou Header Simples */}
      {news.image_url ? (
        <div className="relative h-64 md:h-80 w-full">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Botões Flutuantes */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pt-12 md:pt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="pt-12 px-4 pb-2 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-2">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-5 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-t-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]"
        >
          {/* Tags e Data */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide ${categoryColors[news.category] || categoryColors.noticia}`}>
              {categoryLabels[news.category] || 'Notícia'}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {news.created_date && format(parseISO(news.created_date), "d 'de' MMM, yyyy", { locale: ptBR })}
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {news.title}
          </h1>

          {/* Autor */}
          {news.author && (
            <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-6">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-600">{news.author}</span>
            </div>
          )}

          {/* Conteúdo Markdown */}
          <div className="prose prose-amber prose-lg max-w-none text-gray-700">
            <ReactMarkdown>
              {news.content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </div>
  );
}