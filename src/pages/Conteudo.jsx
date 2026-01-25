import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BookOpen, Heart, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function Conteudo() {
  const { data: content = [], isLoading } = useQuery({
    queryKey: ['devotionalContent'],
    queryFn: () => base44.entities.News.filter(
      { is_published: true },
      '-created_date',
      50
    )
  });

  const devotionals = content.filter(c => c.category === 'devocional');
  const studies = content.filter(c => c.category === 'estudo');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const ContentCard = ({ item, icon: Icon, accentColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        to={`${createPageUrl('NoticiaDetalhe')}?id=${item.id}`}
        className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-xl ${accentColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
            {item.summary && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {item.author && <span>{item.author}</span>}
              <span>{format(parseISO(item.created_date), "d 'de' MMM", { locale: ptBR })}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Conteúdo Edificante" subtitle="Estudos e devocionais" />

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Devocionais</h2>
          </div>

          {devotionals.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
              <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Nenhum devocional disponível</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devotionals.slice(0, 5).map(item => (
                <ContentCard
                  key={item.id}
                  item={item}
                  icon={Heart}
                  accentColor="bg-gradient-to-br from-purple-500 to-violet-500"
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900">Estudos Bíblicos</h2>
          </div>

          {studies.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Nenhum estudo disponível</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studies.slice(0, 5).map(item => (
                <ContentCard
                  key={item.id}
                  item={item}
                  icon={BookOpen}
                  accentColor="bg-gradient-to-br from-emerald-500 to-teal-500"
                />
              ))}
            </div>
          )}
        </section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl p-6 border border-amber-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Versículo do Dia</h3>
          </div>
          <p className="text-amber-800 italic leading-relaxed">
            "Porque para mim o viver é Cristo, e o morrer é lucro."
          </p>
          <p className="text-amber-600 text-sm mt-2 font-medium">
            Filipenses 1:21
          </p>
        </motion.div>
      </div>
    </div>
  );
}
