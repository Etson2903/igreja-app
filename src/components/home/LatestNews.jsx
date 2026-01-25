import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronRight, Newspaper } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function LatestNews({ news }) {
  if (!news || news.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Notícias e Avisos</h2>
        <Link 
          to={createPageUrl('Noticias')}
          className="text-amber-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {news.slice(0, 3).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              to={`${createPageUrl('NoticiaDetalhe')}?id=${item.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                    <Newspaper className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[item.category] || categoryColors.noticia}`}>
                      {categoryLabels[item.category] || 'Notícia'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                  {item.summary && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {format(parseISO(item.created_date), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
