import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Calendar, Newspaper, Play, MapPin, Building2, TrendingUp, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const { data: leaders = [] } = useQuery({ queryKey: ['leaders'], queryFn: () => base44.entities.Leader.list() });
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => base44.entities.Event.list() });
  const { data: news = [] } = useQuery({ queryKey: ['news'], queryFn: () => base44.entities.News.list() });
  const { data: videos = [] } = useQuery({ queryKey: ['videos'], queryFn: () => base44.entities.Video.list() });
  const { data: congregations = [] } = useQuery({ queryKey: ['congregations'], queryFn: () => base44.entities.Congregation.list() });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => base44.entities.Department.list() });

  const stats = [
    { label: 'Líderes', value: leaders.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Eventos', value: events.length, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Notícias', value: news.length, icon: Newspaper, color: 'bg-emerald-500' },
    { label: 'Vídeos', value: videos.length, icon: Play, color: 'bg-red-500' },
    { label: 'Congregações', value: congregations.length, icon: MapPin, color: 'bg-amber-500' },
    { label: 'Departamentos', value: departments.length, icon: Building2, color: 'bg-indigo-500' },
  ];

  const recentNews = news.slice(0, 5);
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900">Últimas Notícias</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentNews.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Nenhuma notícia cadastrada</p>
            ) : (
              recentNews.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(parseISO(item.created_date), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Próximos Eventos</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingEvents.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Nenhum evento próximo</p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{event.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(event.date), "d 'de' MMMM", { locale: ptBR })}
                    {event.start_time && ` às ${event.start_time}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
