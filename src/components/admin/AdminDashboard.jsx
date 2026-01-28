import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Users, Calendar, Newspaper, Play, MapPin, Building2, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  // Buscas seguras no Supabase
  const { data: leaders = [] } = useQuery({ queryKey: ['leaders'], queryFn: async () => (await supabase.from('leaders').select('*')).data || [] });
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: async () => (await supabase.from('events').select('*')).data || [] });
  const { data: news = [] } = useQuery({ queryKey: ['news'], queryFn: async () => (await supabase.from('news').select('*')).data || [] });
  const { data: videos = [] } = useQuery({ queryKey: ['videos'], queryFn: async () => (await supabase.from('videos').select('*')).data || [] });
  const { data: congregations = [] } = useQuery({ queryKey: ['congregations'], queryFn: async () => (await supabase.from('congregations').select('*')).data || [] });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: async () => (await supabase.from('departments').select('*')).data || [] });

  const stats = [
    { label: 'Líderes', value: leaders?.length || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Eventos', value: events?.length || 0, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Notícias', value: news?.length || 0, icon: Newspaper, color: 'bg-emerald-500' },
    { label: 'Vídeos', value: videos?.length || 0, icon: Play, color: 'bg-red-500' },
    { label: 'Congregações', value: congregations?.length || 0, icon: MapPin, color: 'bg-amber-500' },
    { label: 'Departamentos', value: departments?.length || 0, icon: Building2, color: 'bg-indigo-500' },
  ];

  // Filtros seguros
  const recentNews = Array.isArray(news) ? news.slice(0, 5) : [];
  const upcomingEvents = Array.isArray(events) 
    ? events
        .filter(e => e.date && new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)
    : [];

  // Função auxiliar para formatar data sem quebrar
  const formatDateSafe = (dateString, formatStr = "d 'de' MMMM") => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), formatStr, { locale: ptBR });
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}><stat.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p><p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Notícias */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2"><Newspaper className="w-5 h-5 text-emerald-500" /><h3 className="font-semibold text-gray-900">Últimas Notícias</h3></div>
          <div className="divide-y divide-gray-100">
            {recentNews.length === 0 ? <p className="p-4 text-sm text-gray-500 text-center">Nenhuma notícia</p> : recentNews.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900 line-clamp-1">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateSafe(item.created_at || item.created_date)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Eventos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-500" /><h3 className="font-semibold text-gray-900">Próximos Eventos</h3></div>
          <div className="divide-y divide-gray-100">
            {upcomingEvents.length === 0 ? <p className="p-4 text-sm text-gray-500 text-center">Nenhum evento</p> : upcomingEvents.map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900 line-clamp-1">{event.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatDateSafe(event.date)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
