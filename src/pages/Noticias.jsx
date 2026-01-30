import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // MIGRADO PARA SUPABASE
import { motion } from 'framer-motion';
import { Newspaper, Search, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

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

export default function Noticias() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Busca notícias do Supabase
  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('created_date', { ascending: false })
        .limit(100);
        
      if (error) {
        console.error('Erro ao buscar notícias:', error);
        return [];
      }
      return data;
    }
  });

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro case-insensitive para categoria
    const matchesCategory = activeCategory === 'all' || 
      item.category?.toLowerCase() === activeCategory.toLowerCase();
      
    return matchesSearch && matchesCategory;
  });

  const NewsCard = ({ item, featured = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* LINK CORRIGIDO: Usa caminho direto */}
      <Link
        to={`/noticia-detalhe?id=${item.id}`}
        className={`block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${
          featured ? 'col-span-full' : ''
        }`}
      >
        {item.image_url && (
          <div className={`${featured ? 'h-48' : 'h-32'} overflow-hidden`}>
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[item.category] || categoryColors.noticia}`}>
              {categoryLabels[item.category] || 'Notícia'}
            </span>
            <span className="text-xs text-gray-400">
              {item.created_date && format(parseISO(item.created_date), "d 'de' MMM", { locale: ptBR })}
            </span>
          </div>
          <h3 className={`font-semibold text-gray-900 ${featured ? 'text-lg' : 'text-base'} line-clamp-2 leading-snug`}>
            {item.title}
          </h3>
          {item.summary && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
          )}
          {item.author && (
            <p className="text-xs text-gray-400 mt-3">Por {item.author}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Notícias" subtitle="Fique por dentro de tudo" />

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar notícias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500 bg-white"
          />
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="w-full flex overflow-x-auto bg-white p-1 rounded-xl gap-1 border border-gray-100 shadow-sm no-scrollbar">
            <TabsTrigger value="all" className="rounded-lg flex-shrink-0 text-xs md:text-sm">Todos</TabsTrigger>
            <TabsTrigger value="aviso" className="rounded-lg flex-shrink-0 text-xs md:text-sm">Avisos</TabsTrigger>
            <TabsTrigger value="noticia" className="rounded-lg flex-shrink-0 text-xs md:text-sm">Notícias</TabsTrigger>
            <TabsTrigger value="comunicado" className="rounded-lg flex-shrink-0 text-xs md:text-sm">Comunicados</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredNews.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Nenhuma notícia encontrada"
            description={searchTerm ? 'Tente buscar por outros termos.' : 'As notícias da igreja aparecerão aqui.'}
          />
        ) : (
          <div className="space-y-4">
            {/* Destaque (primeira notícia marcada como destaque) */}
            {filteredNews.find(n => n.is_highlighted) && (
              <NewsCard item={filteredNews.find(n => n.is_highlighted)} featured />
            )}

            {/* Lista normal (exclui o destaque se já foi mostrado) */}
            {filteredNews
              .filter(n => !n.is_highlighted || filteredNews.find(x => x.is_highlighted) !== n)
              .map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}