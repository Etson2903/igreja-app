import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // USANDO SUPABASE
import { motion } from 'framer-motion';
import { BookOpen, Heart, MessageSquare, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function Conteudo() {
  const { data: content = [], isLoading } = useQuery({
    queryKey: ['devotionalContent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('created_date', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data;
    }
  });

  // Filtragem segura (case insensitive)
  const devotionals = content.filter(c => c.category?.toLowerCase() === 'devocional');
  const studies = content.filter(c => c.category?.toLowerCase() === 'estudo');

  if (isLoading) return <LoadingSpinner />;

  const ContentCard = ({ item, icon: Icon, accentColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* LINK CORRIGIDO: Usa caminho direto em vez de função auxiliar complexa */}
      <Link
        to={`/noticia-detalhe?id=${item.id}`}
        className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all active:bg-gray-50"
      >
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-xl ${accentColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">{item.title}</h3>
            {item.summary && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.summary}</p>
            )}
            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              {item.author && <span>{item.author}</span>}
              <span>•</span>
              {item.created_date && <span>{format(parseISO(item.created_date), "d MMM", { locale: ptBR })}</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Conteúdo Edificante" subtitle="Alimento para sua alma" />

        <section className="mb-8 mt-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Heart className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Devocionais</h2>
            </div>
            {devotionals.length > 0 && <span className="text-xs text-gray-400 font-medium">{devotionals.length} disponíveis</span>}
          </div>

          {devotionals.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200">
              <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 text-sm font-medium">Nenhum devocional ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devotionals.map(item => (
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
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Estudos Bíblicos</h2>
            </div>
            {studies.length > 0 && <span className="text-xs text-gray-400 font-medium">{studies.length} disponíveis</span>}
          </div>

          {studies.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 text-sm font-medium">Nenhum estudo ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studies.map(item => (
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
          className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Versículo do Dia</h3>
          </div>
          <p className="text-amber-800 italic leading-relaxed text-lg font-serif">
            "Porque para mim o viver é Cristo, e o morrer é lucro."
          </p>
          <p className="text-amber-600 text-xs mt-3 font-bold uppercase tracking-wider">
            Filipenses 1:21
          </p>
        </motion.div>
      </div>
    </div>
  );
}