import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Newspaper, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => base44.entities.News.filter({ is_published: true }, '-created_date', 100)
  });

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const NewsCard = ({ item, featured = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        to={`${createPageUrl('NoticiaDetalhe')}?id=${item.id}`}
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
              {format(parseISO(item.created_date), "d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          <h3 className={`font-semibold text-gray-900 ${featured ? 'text-lg' : 'text-base'} line-clamp-2`}>
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Notícias" subtitle="Comunicados e avisos" />

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar notícias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500"
          />
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="w-full flex overflow-x-auto bg-gray-100 rounded-xl p-1 gap-1">
            <TabsTrigger value="all" className="rounded-lg flex-shrink-0">Todos</TabsTrigger>
            <TabsTrigger value="aviso" className="rounded-lg flex-shrink-0">Avisos</TabsTrigger>
            <TabsTrigger value="devocional" className="rounded-lg flex-shrink-0">Devocionais</TabsTrigger>
            <TabsTrigger value="estudo" className="rounded-lg flex-shrink-0">Estudos</TabsTrigger>
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
            {filteredNews.filter(n => n.is_highlighted)[0] && (
              <NewsCard item={filteredNews.filter(n => n.is_highlighted)[0]} featured />
            )}

            {filteredNews.filter(n => !n.is_highlighted || filteredNews.filter(x => x.is_highlighted).indexOf(n) !== 0).map((item, index) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
